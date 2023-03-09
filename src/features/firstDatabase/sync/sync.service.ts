import { Injectable } from '@nestjs/common';
import { CityEntity } from 'src/entities/city.entity';
import { NgoEntity } from 'src/entities/ngo.entity';
import { PaymentEntity } from 'src/entities/payment.entity';
import { ReceiptEntity } from 'src/entities/receipt.entity';
import { StatusEntity } from 'src/entities/status.entity';
import {
  ContributorEntity,
  FamilyEntity,
} from 'src/entities/user.entity';
import {
  SwmypageNeeds,
} from 'src/generated-sources/openapi';
import {
  PaymentStatusEnum,
  SAYPlatformRoles,
} from 'src/types/interface';
import { ChildParams } from 'src/types/parameters/ChildParameters';
import { NeedParams } from 'src/types/parameters/NeedParameters';
import { NgoParams } from 'src/types/parameters/NgoParammeters';
import { PaymentParams } from 'src/types/parameters/PaymentParameters';
import { ReceiptParams } from 'src/types/parameters/ReceiptParameter';
import { StatusParams } from 'src/types/parameters/StausParameters';
import { ContributorParams } from 'src/types/parameters/UserParameters';
import {
  convertFlaskToSayRoles,
  daysDifference,
} from 'src/utils/helpers';
import { ChildrenService } from '../children/children.service';
import { CityService } from '../city/city.service';
import { NeedService } from '../need/need.service';
import { NgoService } from '../ngo/ngo.service';
import { PaymentService } from '../payment/payment.service';
import { ReceiptService } from '../receipt/receipt.service';
import { StatusService } from '../status/status.service';
import { UserService } from '../user/user.service';
import { AllExceptionsFilter } from 'src/filters/all-exception.filter';
import { ServerError } from 'src/filters/server-exception.filter';
import { FlaskUserService } from '../../secondDataBase/user/user.service';
import { SocialWorker } from 'src/entities/flaskEntities/user.entity';

@Injectable()
export class SyncService {
  constructor(
    private needService: NeedService,
    private ngoService: NgoService,
    private userService: UserService,
    private flaskUserService: FlaskUserService,
    private childrenService: ChildrenService,
    private receiptService: ReceiptService,
    private paymentService: PaymentService,
    private statusService: StatusService,
    private cityService: CityService,
  ) { }


  async syncUserNgo(
    accessToken: string,
    flaskUser: SocialWorker
  ) {
    try {
      const currentTime = new Date();
      ///--------------------------------------------NGO-------------------------------------
      let nestNgo = await this.ngoService.getNgo(flaskUser.ngo_id);
      let nestCallerNgoCity: CityEntity;
      let callerNgoDetails: NgoParams;
      // Do no update NGOs frequently
      if (!nestNgo) {
        const flaskNgo = await this.ngoService.getFlaskNgo(accessToken, flaskUser.ngo_id);
        const {
          socialWorkers,
          city_id,
          city,
          id: FlaskNgoId,
          ...ngoOtherParams
        } = flaskNgo;

        const { id: flaskId, ...cityOtherParams } = city;
        nestCallerNgoCity = await this.cityService.getCityById(flaskId);
        if (!nestCallerNgoCity) {
          console.log('\x1b[36m%s\x1b[0m', 'Creating a city ...');
          nestCallerNgoCity = await this.cityService.createCity({
            flaskId,
            ...cityOtherParams,
          });
          console.log('\x1b[36m%s\x1b[0m', 'Created a city ...');
        }
        callerNgoDetails = {
          ...ngoOtherParams,
          registerDate: new Date(ngoOtherParams.registerDate),
          updated: new Date(ngoOtherParams.updated),
          cityId: ngoOtherParams.cityId,
          countryId: flaskNgo.city.countryId,
          stateId: flaskNgo.city.stateId,
          flaskNgoId: FlaskNgoId,
        };
        console.log('\x1b[36m%s\x1b[0m', 'Creating an NGO ...\n');
        nestNgo = await this.ngoService.createNgo(callerNgoDetails, nestCallerNgoCity);
        console.log('\x1b[36m%s\x1b[0m', 'Created an NGO ...\n');
      } else if (nestNgo && daysDifference(currentTime, nestNgo.updatedAt) > 7) {
        await this.ngoService
          .updateNgo(nestNgo.id, callerNgoDetails, nestCallerNgoCity)
          .then();
        nestNgo = await this.ngoService.getNgo(nestNgo.flaskNgoId)
        console.log('\x1b[36m%s\x1b[0m', 'NGO updated ...\n');
      } else {
        console.log('\x1b[36m%s\x1b[0m', 'Skipped NGO ...\n');
      }
      return nestNgo
    } catch (e) {
      throw new AllExceptionsFilter(e)
    }

  }

  async syncNeed(
    accessToken: string,
    callerId: number,
    flaskNeedData: SwmypageNeeds,
    childId: number,
    ngoId: number,
    selectedRoles: string[],
  ) {
    const currentTime = new Date();
    //-------------------------------------------- Controller Caller-------------------------------------
    let callerDetails: ContributorParams;
    let nestCaller = await this.userService.getContributorByFlaskId(callerId);

    if (!nestCaller) {
      const flaskCaller = await this.flaskUserService.getFlaskSocialWorker(
        callerId,
      );
      console.log('\x1b[36m%s\x1b[0m', 'Syncing NGO and Caller ...\n' + flaskCaller.id);
      const CallerNgo = await this.syncUserNgo(accessToken, flaskCaller)
      console.log('\x1b[36m%s\x1b[0m', 'Synced NGO and Caller ...\n' + flaskCaller.id);

      const {
        id: callerFlaskId,
        ngo_id: callerFlaskNgoId,
        ...callerOtherParams
      } = flaskCaller;

      callerDetails = {
        ...callerOtherParams,
        typeId: flaskCaller.type_id,
        firstName: flaskCaller.first_name,
        lastName: flaskCaller.last_name,
        avatarUrl: flaskCaller.avatar_url,
        flaskId: callerFlaskId,
        flaskNgoId: callerFlaskNgoId,
        birthDate: flaskCaller.birth_date && new Date(flaskCaller.birth_date),
        role: convertFlaskToSayRoles(flaskCaller.type_id),
      };
      console.log('\x1b[36m%s\x1b[0m', 'Creating a Caller ...\n');
      nestCaller = await this.userService.createContributor(
        callerDetails,
        CallerNgo,
      );
      console.log('\x1b[36m%s\x1b[0m', 'Created a Caller ...\n');
    } else if (
      nestCaller &&
      daysDifference(currentTime, nestCaller.updatedAt) > 7
    ) {

      await this.userService
        .updateContributor(nestCaller.id, callerDetails)
        .then();
      nestCaller = await this.userService.getContributorByFlaskId(callerId);
      console.log('\x1b[36m%s\x1b[0m', 'Caller updated ...\n');
    } else {
      console.log('\x1b[36m%s\x1b[0m', 'Skipped Caller updating ...\n');
    }

    //-------------------------------------------- Social worker-------------------------------------
    let swDetails: ContributorParams;
    let nestSocialWorker = await this.userService.getContributorByFlaskId(
      flaskNeedData.createdById,
    );
    let swNgo: NgoEntity
    if (!nestSocialWorker) {
      const flaskSocialWorker = await this.flaskUserService.getFlaskSocialWorker(
        flaskNeedData.createdById,
      );
      swNgo = await this.syncUserNgo(accessToken, flaskSocialWorker)

      const {
        id: swFlaskId,
        ngo_id: swFlaskNgoId,
        ...swOtherParams
      } = flaskSocialWorker;

      swDetails = {
        ...swOtherParams,
        typeId: flaskSocialWorker.type_id,
        firstName: flaskSocialWorker.first_name,
        lastName: flaskSocialWorker.last_name,
        avatarUrl: flaskSocialWorker.avatar_url,
        flaskId: swFlaskId,
        flaskNgoId: swFlaskNgoId,
        birthDate:
          flaskSocialWorker.birth_date && new Date(flaskSocialWorker.birth_date),
        role: SAYPlatformRoles.SOCIAL_WORKER,
      };
      console.log('\x1b[36m%s\x1b[0m', 'Creating a Social Worker ...\n');
      nestSocialWorker = await this.userService.createContributor(
        swDetails,
        swNgo,
      );
      console.log('\x1b[36m%s\x1b[0m', 'Created a Social Worker ...\n');
    } else if (
      nestSocialWorker &&
      daysDifference(currentTime, nestSocialWorker.updatedAt) > 7
    ) {
      await this.userService
        .updateContributor(nestSocialWorker.id, swDetails)
        .then();
      nestSocialWorker = await this.userService.getContributorByFlaskId(
        flaskNeedData.createdById,
      );
      console.log('\x1b[36m%s\x1b[0m', 'Social Worker updated ...\n');
    } else {
      console.log('\x1b[36m%s\x1b[0m', 'Skipped Social Worker updating ...\n');
    }

    //--------------------------------------------Auditor-------------------------------------
    let nestAuditor: ContributorEntity;
    let auditorDetails: ContributorParams;
    try {
      if (flaskNeedData.isConfirmed) {
        nestAuditor = await this.userService.getContributorByFlaskId(
          flaskNeedData.confirmedBy,
        );
        if (!nestAuditor) {
          const flaskAuditor = await this.flaskUserService.getFlaskSocialWorker(
            21,
          );
          const auditorNgo = await this.syncUserNgo(accessToken, flaskAuditor)

          const {
            id: auditorFlaskId,
            ngo_id: auditorFlaskNgoId,
            ...auditorOtherParams
          } = flaskAuditor;

          auditorDetails = {
            ...auditorOtherParams,
            typeId: flaskAuditor.type_id,
            firstName: flaskAuditor.first_name,
            lastName: flaskAuditor.last_name,
            avatarUrl: flaskAuditor.avatar_url,
            flaskId: auditorFlaskId,
            flaskNgoId: auditorFlaskNgoId,
            birthDate: flaskAuditor.birth_date && new Date(flaskAuditor.birth_date),
            role: SAYPlatformRoles.AUDITOR,
          };
          // if (!nestAuditor && flaskNeedData.isConfirmed) {
          console.log('\x1b[36m%s\x1b[0m', 'Creating an auditor ...\n');
          nestAuditor = await this.userService.createContributor(
            auditorDetails,
            auditorNgo,
          );
          console.log('\x1b[36m%s\x1b[0m', 'Created an auditor ...\n');
        } else {
          console.log('\x1b[36m%s\x1b[0m', 'Skipped auditor updating ...\n');
        }
      } else if (
        nestAuditor &&
        daysDifference(currentTime, nestAuditor.updatedAt) > 7
      ) {
        await this.userService
          .updateContributor(nestAuditor.id, auditorDetails)
          .then();

        nestAuditor = await this.userService.getContributorByFlaskId(
          flaskNeedData.confirmedBy,
        );
        console.log('\x1b[36m%s\x1b[0m', 'Auditor updated ...\n');
      } else {
        console.log('\x1b[36m%s\x1b[0m', 'Not Confirmed, skipping auditor ...\n');
      }
    } catch (e) {
      console.log(e)
      throw new ServerError(e.statusText, e.status)
    }


    //--------------------------------------------Purchaser-------------------------------------
    let nestPurchaser: ContributorEntity;
    if (flaskNeedData.status > PaymentStatusEnum.COMPLETE_PAY) {
      let purchaserId: number;
      if (!flaskNeedData.statusUpdates[0]) {
        // we do not have a history of purchaser id before implementing our new features
        if (new Date(flaskNeedData.doneAt).getFullYear() < 2023) {
          purchaserId = 31; // Nyaz
        }
        if (new Date(flaskNeedData.doneAt).getFullYear() >= 2023) {
          purchaserId = 21; // Neda
        }
      } else {
        purchaserId = flaskNeedData.statusUpdates.find(
          (s) => s.oldStatus === PaymentStatusEnum.COMPLETE_PAY,
        )?.swId;
      }

      let purchaserDetails: ContributorParams;
      nestPurchaser = await this.userService.getContributorByFlaskId(
        purchaserId,
      );
      if (!nestPurchaser) {
        const flaskPurchaser = await this.flaskUserService.getFlaskSocialWorker(
          purchaserId,
        );
        const purchaserNgo = await this.syncUserNgo(accessToken, flaskPurchaser)

        const {
          id: purchaserFlaskId,
          ngo_id: purchaserFlaskNgoId,
          ...purchaserOtherParams
        } = flaskPurchaser;

        purchaserDetails = {
          ...purchaserOtherParams,
          typeId: flaskPurchaser.type_id,
          firstName: flaskPurchaser.first_name,
          lastName: flaskPurchaser.last_name,
          avatarUrl: flaskPurchaser.avatar_url,
          flaskId: purchaserFlaskId,
          flaskNgoId: purchaserFlaskNgoId,
          birthDate:
            flaskPurchaser.birth_date && new Date(flaskPurchaser.birth_date),
          role: SAYPlatformRoles.PURCHASER,
        };
        // Create User
        console.log('\x1b[36m%s\x1b[0m', 'Creating a purchaser ...\n');
        nestPurchaser = await this.userService.createContributor(
          purchaserDetails,
          purchaserNgo,
        );
        console.log('\x1b[36m%s\x1b[0m', 'Created a purchaser ...\n');
      } else if (
        nestPurchaser &&
        daysDifference(currentTime, nestPurchaser.updatedAt) > 7
      ) {
        await this.userService
          .updateContributor(nestPurchaser.id, purchaserDetails)
          .then();
        nestPurchaser = await this.userService.getContributorByFlaskId(
          purchaserId,
        );
        console.log('\x1b[36m%s\x1b[0m', 'Purchaser updated ...\n');
      } else {
        console.log('\x1b[36m%s\x1b[0m', 'Skipped Purchaser updating ...\n');
      }
    } else {
      console.log('\x1b[36m%s\x1b[0m', 'Not Purchased, skipping Purchaser ...\n');
    }

    //--------------------------------------------Child-------------------------------------
    let childDetails: ChildParams;
    let nestChild = await this.childrenService.getChildById(childId);
    if (!nestChild) {
      const flaskChild = await this.childrenService.getFlaskChild(
        accessToken,
        childId,
      );
      console.log(flaskChild)

      const {
        id: childFlaskId,
        idNgo: childFlaskNgoId,
        ...childOtherParams
      } = flaskChild;

      childDetails = {
        ...childOtherParams,
        flaskId: childFlaskId,
        awakeAvatarUrl: flaskChild.avatarUrl,
        birthDate: flaskChild.birthDate && new Date(flaskChild.birthDate),
        ngoId: childFlaskNgoId,
        migrateDate: flaskChild.migrateDate && new Date(flaskChild.migrateDate),
      };
      // Create Child
      console.log('\x1b[36m%s\x1b[0m', 'Creating a Child ...\n');
      nestChild = await this.childrenService.createChild(
        childDetails,
        swNgo,
        nestSocialWorker,
      );
      console.log('\x1b[36m%s\x1b[0m', 'Created a Child ...\n');
    } else if (nestChild && nestChild.updated === flaskNeedData.updated) {
      await this.childrenService
        .updateChild(childDetails, nestChild)
        .then();
      nestChild = await this.childrenService.getChildById(childId);

      console.log('\x1b[36m%s\x1b[0m', 'Child updated ...\n');
    } else {
      console.log('\x1b[36m%s\x1b[0m', 'Skipped Child updating ...\n');
    }

    //--------------------------------------------Receipt-------------------------------------
    let nestReceipt: ReceiptEntity;
    const nestReceipts = [];
    for (let r = 0; r < flaskNeedData.receipts_.length; r++) {
      nestReceipt = await this.receiptService.getReceiptById(
        flaskNeedData.receipts_[r].id,
      );
      const receiptDetails: ReceiptParams = {
        title: flaskNeedData.receipts_[r].title,
        description: flaskNeedData.receipts_[r].description,
        attachment: flaskNeedData.receipts_[r].attachment,
        isPublic: flaskNeedData.receipts_[r].isPublic,
        code: flaskNeedData.receipts_[r].code,
        flaskSwId: flaskNeedData.receipts_[r].ownerId,
        needStatus: flaskNeedData.receipts_[r].needStatus,
        flaskReceiptId: flaskNeedData.receipts_[r].id,
        deleted: flaskNeedData.receipts_[r].deleted,
        flaskNeedId: flaskNeedData.id,
      };
      // Create Receipt
      console.log('\x1b[36m%s\x1b[0m', 'Creating a Receipt ...\n' + r);
      nestReceipt = await this.receiptService.createReceipt(receiptDetails);
      nestReceipts.push(nestReceipt);
      console.log('\x1b[36m%s\x1b[0m', 'Created a Receipt ...\n');
    }

    //--------------------------------------------Payments-------------------------------------
    let PaymentDetails: PaymentParams;
    let nestPayment: PaymentEntity;
    let nestFamilyMember: FamilyEntity;
    const nestPayments = [];
    for (let p = 0; p < flaskNeedData.verifiedPayments.length; p++) {
      nestPayment = await this.paymentService.getPaymentById(
        flaskNeedData.verifiedPayments[p].id,
      );
      if (!nestPayment) {
        nestFamilyMember = await this.userService.getFamilyByFlaskId(
          flaskNeedData.verifiedPayments[p].idUser,
        );
        if (!nestFamilyMember) {
          // Create Family
          console.log('\x1b[36m%s\x1b[0m', 'Creating a Family ...\n');
          nestFamilyMember = await this.userService.createFamily({
            flaskId: flaskNeedData.verifiedPayments[p].idUser,
            role: SAYPlatformRoles.FAMILY,
          });
        } else if (
          nestFamilyMember &&
          daysDifference(currentTime, nestFamilyMember.updatedAt) > 7
        ) {
          await this.userService
            .updateFamily(nestFamilyMember.id, {
              flaskId: flaskNeedData.verifiedPayments[p].idUser,
              role: SAYPlatformRoles.FAMILY,
            })
            .then();
          nestFamilyMember = await this.userService.getFamilyByFlaskId(
            flaskNeedData.verifiedPayments[p].idUser,
          );
          console.log('\x1b[36m%s\x1b[0m', 'Family updated ...\n');
        } else {
          console.log('\x1b[36m%s\x1b[0m', 'Skipped Family updating ...\n');
        }

        const {
          id: paymentFlaskId,
          idNeed: flaskNeedId,
          idUser: flaskUserId,
          ...paymentOtherParams
        } = flaskNeedData.verifiedPayments[p];
        PaymentDetails = {
          flaskId: paymentFlaskId,
          flaskNeedId: flaskNeedId,
          flaskUserId: flaskUserId,
          ...paymentOtherParams,
        };

        console.log('\x1b[36m%s\x1b[0m', 'Creating a Payment ...\n' + p);
        nestPayment = await this.paymentService.createPayment(
          PaymentDetails,
          nestFamilyMember,
        );
        nestPayments.push(nestPayment);
        console.log('\x1b[36m%s\x1b[0m', 'Created a Payment ...\n');
      } else if (
        nestPayment &&
        daysDifference(currentTime, nestPayment.updatedAt) > 7
      ) {
        await this.paymentService
          .updatePayment(nestPayment.id, PaymentDetails, nestFamilyMember)
          .then();
        nestPayment = await this.paymentService.getPaymentById(
          flaskNeedData.verifiedPayments[p].id,
        );
      } else {
        console.log('\x1b[36m%s\x1b[0m', 'Skipped Payment updating ...\n');
      }
    }
    //--------------------------------------------Statuses-------------------------------------
    let StatusDetails: StatusParams;
    let nestStatus: StatusEntity;
    const nestStatuses = [];
    for (let s = 0; s < flaskNeedData.statusUpdates.length; s++) {
      nestStatus = await this.statusService.getStatusById(
        flaskNeedData.statusUpdates[s].id,
      );
      if (!nestStatus) {
        const {
          id: statusFlaskId,
          needId: flaskNeedId,
          ...statusOtherParams
        } = flaskNeedData.statusUpdates[s];

        StatusDetails = {
          flaskId: statusFlaskId,
          flaskNeedId: flaskNeedId,
          ...statusOtherParams,
        };

        console.log('\x1b[36m%s\x1b[0m', 'Creating a Status ...\n' + s);
        nestStatus = await this.statusService.createStatus(StatusDetails);
        nestStatuses.push(nestStatus);
        console.log('\x1b[36m%s\x1b[0m', 'Created a Status ...\n');
      } else if (nestStatus.newStatus !== flaskNeedData.status) {
        await this.statusService
          .updateStatus(nestStatus.id, StatusDetails)
          .then();
        nestStatus = await this.statusService.getStatusById(
          flaskNeedData.statusUpdates[s].id,
        );
        console.log('\x1b[36m%s\x1b[0m', 'Status updated ...\n');

      } else {
        console.log('\x1b[36m%s\x1b[0m', 'Skipped Status updating ...\n');
      }
    }

    //--------------------------------------------Need-------------------------------------
    let needDetails: NeedParams;
    let nestNeed = await this.needService.getNeedById(flaskNeedData.id);
    console.log(nestNeed)
    if (!nestNeed) {
      const {
        id: needFlaskId,
        img: needRetailerImg,
        verifiedPayments,
        statusUpdates,
        receipts_,
        ...needOtherParams
      } = flaskNeedData;

      needDetails = {
        flaskChildId: childId,
        flaskId: needFlaskId,
        needRetailerImg: needRetailerImg,
        ...needOtherParams,
      };
      console.log('\x1b[36m%s\x1b[0m', 'Creating The Need ...\n');

      nestNeed = await this.needService.createNeed(
        nestChild,
        swNgo,
        nestSocialWorker,
        nestAuditor,
        nestPurchaser,
        needDetails,
        nestStatuses,
        nestPayments,
        nestReceipts,
      );
      console.log('\x1b[36m%s\x1b[0m', 'Created The Need  ...\n');

    } else if (nestNeed && nestNeed.updated !== flaskNeedData.updated) {
      await this.needService
        .updateNeed(
          nestNeed.id,
          nestChild,
          swNgo,
          nestSocialWorker,
          nestAuditor,
          nestPurchaser,
          needDetails,
        )
        .then();
      nestNeed = await this.needService.getNeedById(nestNeed.flaskId)
      console.log('\x1b[36m%s\x1b[0m', ' The Need updated ...\n');
    } else {
      console.log('\x1b[36m%s\x1b[0m', 'Skipped  The Need updating ...\n');
    }
    if (!nestNeed) {
      throw new console.error('no need...');

    }
    return {
      nestCaller,
      swNgo: nestSocialWorker.ngo,
      nestSocialWorker,
      nestAuditor,
      nestPurchaser,
      need: nestNeed,
      child: nestChild,
    };
  }
}

