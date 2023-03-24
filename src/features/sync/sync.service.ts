import { Injectable } from '@nestjs/common';
import { CityEntity } from 'src/entities/city.entity';
import { NgoEntity } from 'src/entities/ngo.entity';
import { PaymentEntity } from 'src/entities/payment.entity';
import { ReceiptEntity } from 'src/entities/receipt.entity';
import { StatusEntity } from 'src/entities/status.entity';
import { AllUserEntity } from 'src/entities/user.entity';
import { SwmypageNeeds } from 'src/generated-sources/openapi';
import {
  PaymentStatusEnum,
  SAYPlatformRoles,
} from 'src/types/interfaces/interface';
import { ChildParams } from 'src/types/parameters/ChildParameters';
import { NeedParams } from 'src/types/parameters/NeedParameters';
import { NgoParams } from 'src/types/parameters/NgoParammeters';
import { PaymentParams } from 'src/types/parameters/PaymentParameters';
import { ReceiptParams } from 'src/types/parameters/ReceiptParameter';
import { StatusParams } from 'src/types/parameters/StausParameters';
import {
  convertFlaskToSayRoles,
  daysDifference,
  getSAYRoleInteger,
} from 'src/utils/helpers';
import { ChildrenService } from '../children/children.service';
import { NeedService } from '../need/need.service';
import { NgoService } from '../ngo/ngo.service';
import { PaymentService } from '../payment/payment.service';
import { ReceiptService } from '../receipt/receipt.service';
import { StatusService } from '../status/status.service';
import { UserService } from '../user/user.service';
import { AllExceptionsFilter } from 'src/filters/all-exception.filter';
import { ServerError } from 'src/filters/server-exception.filter';
import { SocialWorker } from 'src/entities/flaskEntities/user.entity';
import { LocationService } from '../location/location.service';
import { UserParams } from 'src/types/parameters/UserParameters';

@Injectable()
export class SyncService {
  constructor(
    private needService: NeedService,
    private ngoService: NgoService,
    private userService: UserService,
    private childrenService: ChildrenService,
    private receiptService: ReceiptService,
    private paymentService: PaymentService,
    private statusService: StatusService,
    private locationService: LocationService,
  ) { }

  async syncContributorNgo(flaskUser: SocialWorker) {
    try {
      const currentTime = new Date();
      ///--------------------------------------------NGO-------------------------------------
      let nestNgo = await this.ngoService.getNgo(flaskUser.ngo_id);
      let nestCallerNgoCity: CityEntity;
      let callerNgoDetails: NgoParams;
      // Do no update NGOs frequently
      if (!nestNgo) {
        const flaskNgo = await this.ngoService.getFlaskNgo(flaskUser.ngo_id);
        const { city_id, id: FlaskNgoId, ...ngoOtherParams } = flaskNgo;

        const flaskCity = await this.locationService.getFlaskCity(city_id);
        const {
          id: flaskId,
          name,
          state_id,
          state_code,
          state_name,
          country_id,
          country_code,
          country_name,
          latitude,
          longitude,
        } = flaskCity;
        nestCallerNgoCity = await this.locationService.getCityById(city_id);
        if (!nestCallerNgoCity) {
          console.log('\x1b[36m%s\x1b[0m', 'Creating a city ...');
          nestCallerNgoCity = await this.locationService.createCity({
            flaskCityId: flaskId,
            name,
            stateId: state_id,
            stateCode: state_code,
            stateName: state_name,
            countryId: country_id,
            countryCode: country_code,
            countryName: country_name,
            latitude,
            longitude,
          });
          console.log('\x1b[36m%s\x1b[0m', 'Created a city ...');
        }
        callerNgoDetails = {
          ...ngoOtherParams,
          registerDate: new Date(ngoOtherParams.registerDate),
          updated: new Date(ngoOtherParams.updated),
          cityId: flaskCity.id,
          countryId: flaskCity.country_id,
          stateId: flaskCity.state_id,
          flaskNgoId: FlaskNgoId,
        };
        console.log('\x1b[36m%s\x1b[0m', 'Creating an NGO ...\n');
        nestNgo = await this.ngoService.createNgo(
          callerNgoDetails,
          nestCallerNgoCity,
        );
        console.log('\x1b[36m%s\x1b[0m', 'Created an NGO ...\n');
      } else if (
        nestNgo &&
        daysDifference(currentTime, nestNgo.updatedAt) > 7
      ) {
        await this.ngoService
          .updateNgo(nestNgo.id, callerNgoDetails, nestCallerNgoCity)
          .then();
        nestNgo = await this.ngoService.getNgo(nestNgo.flaskNgoId);
        console.log('\x1b[36m%s\x1b[0m', 'NGO updated ...\n');
      } else {
        console.log('\x1b[36m%s\x1b[0m', 'Skipped NGO ...\n');
      }
      return nestNgo;
    } catch (e) {
      throw new AllExceptionsFilter(e);
    }
  }

  async syncNeed(
    callerId: number,
    flaskNeedData: SwmypageNeeds,
    childId: number,
    selectedRoles: string[],
  ) {
    console.log(flaskNeedData);

    const currentTime = new Date();
    //-------------------------------------------- Controller Caller-------------------------------------
    let callerDetails: UserParams;
    let nestCaller = await this.userService.getContributorByFlaskId(callerId);

    if (!nestCaller) {
      const flaskCaller = await this.userService.getFlaskSocialWorker(callerId);
      console.log(
        '\x1b[36m%s\x1b[0m',
        'Syncing NGO and Caller ...\n' + flaskCaller.id,
      );
      const CallerNgo = await this.syncContributorNgo(flaskCaller);
      console.log(
        '\x1b[36m%s\x1b[0m',
        'Synced NGO and Caller ...\n' + flaskCaller.id,
      );

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
    let nestSocialWorker: AllUserEntity;
    let swNgo: NgoEntity;
    if (
      selectedRoles.find(
        (role) => getSAYRoleInteger(role) === SAYPlatformRoles.SOCIAL_WORKER,
      )
    ) {
      let swDetails: UserParams;
      nestSocialWorker = await this.userService.getContributorByFlaskId(
        flaskNeedData.createdById,
      );
      if (!nestSocialWorker) {
        const flaskSocialWorker = await this.userService.getFlaskSocialWorker(
          flaskNeedData.createdById,
        );
        swNgo = await this.syncContributorNgo(flaskSocialWorker);

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
          birthDate:
            flaskSocialWorker.birth_date &&
            new Date(flaskSocialWorker.birth_date),
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
        console.log(
          '\x1b[36m%s\x1b[0m',
          'Skipped Social Worker updating ...\n',
        );
      }
    }
    //--------------------------------------------Auditor-------------------------------------
    let nestAuditor: AllUserEntity;
    if (
      selectedRoles.find(
        (role) => getSAYRoleInteger(role) === SAYPlatformRoles.AUDITOR,
      )
    ) {
      let auditorDetails: UserParams;
      try {
        if (flaskNeedData.isConfirmed) {
          nestAuditor = await this.userService.getContributorByFlaskId(
            flaskNeedData.confirmedBy,
          );
          if (!nestAuditor) {
            const flaskAuditor = await this.userService.getFlaskSocialWorker(
              21,
            );
            const auditorNgo = await this.syncContributorNgo(
              flaskAuditor,
            );

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
              birthDate:
                flaskAuditor.birth_date && new Date(flaskAuditor.birth_date),
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
          console.log(
            '\x1b[36m%s\x1b[0m',
            'Not Confirmed, skipping auditor ...\n',
          );
        }
      } catch (e) {
        console.log(e);
        throw new ServerError(e.statusText, e.status);
      }
    }

    //--------------------------------------------Purchaser-------------------------------------
    let nestPurchaser: AllUserEntity;
    if (
      selectedRoles.find(
        (role) => getSAYRoleInteger(role) === SAYPlatformRoles.PURCHASER,
      )
    ) {
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

        let purchaserDetails: UserParams;
        nestPurchaser = await this.userService.getContributorByFlaskId(
          purchaserId,
        );
        if (!nestPurchaser) {
          const flaskPurchaser = await this.userService.getFlaskSocialWorker(
            purchaserId,
          );
          const purchaserNgo = await this.syncContributorNgo(
            flaskPurchaser,
          );

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
        console.log(
          '\x1b[36m%s\x1b[0m',
          'Not Purchased, skipping Purchaser ...\n',
        );
      }
    }
    //--------------------------------------------Child-------------------------------------
    let childDetails: ChildParams;
    let nestChild = await this.childrenService.getChildById(childId);
    if (!nestChild) {
      const flaskChild = await this.childrenService.getFlaskChild(
        childId,
      );

      childDetails = {
        flaskId: flaskChild.id,
        sayName: flaskChild.sayname_translations.en,
        sayNameTranslations: flaskChild.sayname_translations,
        nationality: flaskChild.nationality,
        country: flaskChild.country,
        city: flaskChild.city,
        awakeAvatarUrl: flaskChild.awakeAvatarUrl,
        sleptAvatarUrl: flaskChild.sleptAvatarUrl,
        adultAvatarUrl: flaskChild.adult_avatar_url,
        bioSummaryTranslations: flaskChild.bio_summary_translations,
        bioTranslations: flaskChild.bio_translations,
        voiceUrl: flaskChild.voiceUrl,
        birthPlace: flaskChild.birthPlace,
        housingStatus: flaskChild.housingStatus,
        familyCount: flaskChild.familyCount,
        sayFamilyCount: flaskChild.sayFamilyCount,
        education: flaskChild.education,
        status: flaskChild.status,
        ngoId: flaskChild.id_ngo,
        socialWorkerId: flaskChild.id_social_worker,
        created: flaskChild.created,
        updated: flaskChild.updated,
        isDeleted: flaskChild.isDeleted,
        isConfirmed: flaskChild.isConfirmed,
        flaskConfirmUser: flaskChild.confirmUser,
        confirmDate: flaskChild.confirmDate,
        generatedCode: flaskChild.generatedCode,
        isMigrated: flaskChild.isMigrated,
        migratedId: flaskChild.migratedId,
        birthDate: flaskChild.birthDate && new Date(flaskChild.birthDate),
        migrateDate: flaskChild.migrateDate && new Date(flaskChild.migrateDate),
      };
      // Create Child
      console.log('\x1b[36m%s\x1b[0m', 'Creating a Child ...\n');
      nestChild = await this.childrenService.createChild(
        childDetails,
        swNgo,
        nestSocialWorker.contributor,
      );
      console.log('\x1b[36m%s\x1b[0m', 'Created a Child ...\n');
    } else if (nestChild && nestChild.updated === flaskNeedData.updated) {
      await this.childrenService.updateChild(childDetails, nestChild).then();
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
    let nestFamilyMember: AllUserEntity;
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
    let nestNeed = await this.needService.getNeedByFlaskId(flaskNeedData.id);
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
        nestSocialWorker.contributor,
        nestAuditor.contributor,
        nestPurchaser.contributor,
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
          nestSocialWorker.contributor,
          nestAuditor.contributor,
          nestPurchaser.contributor,
          needDetails,
        )
        .then();
      nestNeed = await this.needService.getNeedByFlaskId(nestNeed.flaskId);
      console.log('\x1b[36m%s\x1b[0m', ' The Need updated ...\n');
    } else {
      console.log('\x1b[36m%s\x1b[0m', 'Skipped  The Need updating ...\n');
    }
    if (!nestNeed) {
      throw new console.error('no need...');
    }
    return {
      nestCaller,
      nestSocialWorker,
      nestAuditor,
      nestPurchaser,
      need: nestNeed,
      child: nestChild,
    };
  }
}
