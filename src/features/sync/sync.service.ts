import { Injectable } from '@nestjs/common';
import { CityEntity } from 'src/entities/city.entity';
import { NgoEntity } from 'src/entities/ngo.entity';
import { PaymentEntity } from 'src/entities/payment.entity';
import { ReceiptEntity } from 'src/entities/receipt.entity';
import { StatusEntity } from 'src/entities/status.entity';
import { AllUserEntity } from 'src/entities/user.entity';
import { SwmypageNeeds } from 'src/generated-sources/openapi';
import {
  NeedTypeDefinitionEnum,
  NeedTypeEnum,
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
import { ObjectNotFound } from 'src/filters/notFound-expectation.filter';
import { ProviderService } from '../provider/provider.service';
import { ProviderEntity } from 'src/entities/provider.entity';
import { Need } from 'src/entities/flaskEntities/need.entity';
import { CreateReceiptDto } from 'src/types/dtos/CreateReceipt.dto';
import { CreatePaymentDto } from 'src/types/dtos/CreatePayment.dto';
import { CreateStatusDto } from 'src/types/dtos/CreateStatus.dto';

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
    private providerService: ProviderService,
  ) {}

  async syncContributorNgo(flaskUser: SocialWorker) {
    try {
      const currentTime = new Date();
      ///--------------------------------------------NGO-------------------------------------
      let nestNgo = await this.ngoService.getNgoById(flaskUser.ngo_id);
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
        daysDifference(currentTime, nestNgo.updatedAt) > 1
      ) {
        await this.ngoService
          .updateNgo(nestNgo.id, callerNgoDetails, nestCallerNgoCity)
          .then();
        nestNgo = await this.ngoService.getNgoById(nestNgo.flaskNgoId);
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
    theNeed: Need,
    childId: number,
    callerId: number,
    receipts_: CreateReceiptDto[],
    payments: CreatePaymentDto[],
    statuses: CreateStatusDto[],
  ) {
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
        firstName: flaskCaller.firstName,
        lastName: flaskCaller.lastName,
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
      daysDifference(currentTime, nestCaller.updatedAt) > 1
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
    nestSocialWorker = await this.userService.getContributorByFlaskId(
      theNeed.created_by_id,
    );

    let swDetails: UserParams;
    if (!nestSocialWorker) {
      const flaskSocialWorker = await this.userService.getFlaskSocialWorker(
        theNeed.created_by_id,
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
        firstName: flaskSocialWorker.firstName,
        lastName: flaskSocialWorker.lastName,
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
      daysDifference(currentTime, nestSocialWorker.updatedAt) > 1
    ) {
      swNgo = nestSocialWorker.contributor.ngo;
      await this.userService
        .updateContributor(nestSocialWorker.id, swDetails)
        .then();
      nestSocialWorker = await this.userService.getContributorByFlaskId(
        theNeed.created_by_id,
      );
      console.log('\x1b[36m%s\x1b[0m', 'Social Worker updated ...\n');
    } else {
      swNgo = nestSocialWorker.contributor.ngo;
      console.log('\x1b[36m%s\x1b[0m', 'Skipped Social Worker updating ...\n');
    }
    //--------------------------------------------Auditor-------------------------------------
    let nestAuditor: AllUserEntity;

    // if (
    //   selectedRoles.find(
    //     (role) => getSAYRoleInteger(role) === SAYPlatformRoles.AUDITOR,
    //   )
    // ) {
    let auditorDetails: UserParams;
    try {
      if (theNeed.isConfirmed) {
        nestAuditor = await this.userService.getContributorByFlaskId(
          theNeed.confirmUser,
        );
        if (!nestAuditor) {
          const flaskAuditor = await this.userService.getFlaskSocialWorker(21);
          const auditorNgo = await this.syncContributorNgo(flaskAuditor);
          const {
            id: auditorFlaskId,
            ngo_id: auditorFlaskNgoId,
            ...auditorOtherParams
          } = flaskAuditor;

          auditorDetails = {
            ...auditorOtherParams,
            typeId: flaskAuditor.type_id,
            firstName: flaskAuditor.firstName,
            lastName: flaskAuditor.lastName,
            avatarUrl: flaskAuditor.avatar_url,
            flaskId: auditorFlaskId,
            birthDate:
              flaskAuditor.birth_date && new Date(flaskAuditor.birth_date),
            role: SAYPlatformRoles.AUDITOR,
          };
          // if (!nestAuditor && theNeed.isConfirmed) {
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
        daysDifference(currentTime, nestAuditor.updatedAt) > 1
      ) {
        await this.userService
          .updateContributor(nestAuditor.id, auditorDetails)
          .then();

        nestAuditor = await this.userService.getContributorByFlaskId(
          theNeed.confirmUser,
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
    // }

    //--------------------------------------------Purchaser-------------------------------------
    let nestPurchaser: AllUserEntity;
    // if (
    //   selectedRoles.find(
    //     (role) => getSAYRoleInteger(role) === SAYPlatformRoles.PURCHASER,
    //   )
    // ) {
    if (
      theNeed.type === NeedTypeEnum.PRODUCT &&
      theNeed.status > PaymentStatusEnum.COMPLETE_PAY
    ) {
      let purchaserId: number;
      if (!statuses || statuses[0]) {
        // we do not have a history of purchaser id before implementing our new features
        if (new Date(theNeed.doneAt).getFullYear() < 2023) {
          purchaserId = 31; // Nyaz
        }
        if (new Date(theNeed.doneAt).getFullYear() >= 2023) {
          purchaserId = 21; // Neda
        }
      } else {
        purchaserId = statuses.find(
          (s) => s.old_status === PaymentStatusEnum.COMPLETE_PAY,
        )?.sw_id;
      }

      let purchaserDetails: UserParams;
      nestPurchaser = await this.userService.getContributorByFlaskId(
        purchaserId,
      );
      if (!nestPurchaser) {
        const flaskPurchaser = await this.userService.getFlaskSocialWorker(
          purchaserId,
        );
        const purchaserNgo = await this.syncContributorNgo(flaskPurchaser);

        const {
          id: purchaserFlaskId,
          ngo_id: purchaserFlaskNgoId,
          ...purchaserOtherParams
        } = flaskPurchaser;

        purchaserDetails = {
          ...purchaserOtherParams,
          typeId: flaskPurchaser.type_id,
          firstName: flaskPurchaser.firstName,
          lastName: flaskPurchaser.lastName,
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
        daysDifference(currentTime, nestPurchaser.updatedAt) > 1
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
    // }
    //--------------------------------------------Child-------------------------------------
    let childDetails: ChildParams;
    let nestChild = await this.childrenService.getChildById(childId);
    if (!nestChild) {
      const flaskChild = await this.childrenService.getFlaskChild(childId);

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

      if (!nestSocialWorker || !nestSocialWorker.contributor) {
        throw new ObjectNotFound(
          'Something went wrong while trying to create a child!',
        );
      }

      const childNgo = await this.ngoService.getNgoById(
        nestSocialWorker.contributor.flaskNgoId,
      );
      nestChild = await this.childrenService.createChild(
        childDetails,
        childNgo,
        nestSocialWorker.contributor,
      );
      console.log('\x1b[36m%s\x1b[0m', 'Created a Child ...\n');
    } else if (nestChild && nestChild.updated === theNeed.updated) {
      await this.childrenService.updateChild(childDetails, nestChild).then();
      nestChild = await this.childrenService.getChildById(childId);

      console.log('\x1b[36m%s\x1b[0m', 'Child updated ...\n');
    } else {
      console.log('\x1b[36m%s\x1b[0m', 'Skipped Child updating ...\n');
    }

    //--------------------------------------------Receipt-------------------------------------
    let nestReceipt: ReceiptEntity;
    const nestReceipts = [];
    let receiptDetails: ReceiptParams;
    if (receipts_) {
      for (let r = 0; r < receipts_.length; r++) {
        nestReceipt = await this.receiptService.getReceiptById(
          receipts_[r].receipt[0].id,
        );
        receiptDetails = {
          title: receipts_[r].receipt[0].title || receipts_[r].receipt[0].code,
          description: receipts_[r].receipt[0].description,
          attachment: receipts_[r].receipt[0].attachment,
          code: receipts_[r].receipt[0].code,
          flaskSwId: receipts_[r].receipt[0].owner_id,
          needStatus: receipts_[r].receipt[0].need_status,
          flaskReceiptId: receipts_[r].receipt[0].id,
          deleted: receipts_[r].receipt[0].deleted,
          flaskNeedId: theNeed.id,
        };

        if (!nestReceipt && receipts_) {
          // Create Receipt
          console.log('\x1b[36m%s\x1b[0m', 'Creating a Receipt ...\n' + r);
          nestReceipt = await this.receiptService.createReceipt(receiptDetails);
          nestReceipts.push(nestReceipt);
          console.log('\x1b[36m%s\x1b[0m', 'Created a Receipt ...\n');
        } else if (nestReceipt) {
          console.log(receiptDetails);
          await this.receiptService
            .updateReceipt(receiptDetails, nestReceipt)
            .then();
          nestReceipt = await this.receiptService.getReceiptById(
            receiptDetails.flaskReceiptId,
          );
          console.log('\x1b[36m%s\x1b[0m', 'Receipt updated ...\n');
        }
      }
    } else {
      console.log('\x1b[36m%s\x1b[0m', 'Skipped Receipts ...\n');
    }

    //--------------------------------------------Payments-------------------------------------
    let PaymentDetails: PaymentParams;
    let nestPayment: PaymentEntity;
    let nestFamilyMember: AllUserEntity;
    const nestPayments = [];
    if (payments) {
      for (let p = 0; p < payments.length; p++) {
        nestPayment = await this.paymentService.getPaymentById(payments[p].id);
        if (!nestPayment) {
          nestFamilyMember = await this.userService.getFamilyByFlaskId(
            payments[p].id_user,
          );
          if (!nestFamilyMember) {
            // Create Family
            console.log('\x1b[36m%s\x1b[0m', 'Creating a Family ...\n');
            nestFamilyMember = await this.userService.createFamily({
              flaskId: payments[p].id_user,
              role: SAYPlatformRoles.FAMILY,
            });
          } else if (
            nestFamilyMember &&
            daysDifference(currentTime, nestFamilyMember.updatedAt) > 1
          ) {
            await this.userService
              .updateFamily(nestFamilyMember.id, {
                flaskId: payments[p].id_user,
                role: SAYPlatformRoles.FAMILY,
              })
              .then();
            nestFamilyMember = await this.userService.getFamilyByFlaskId(
              payments[p].id_user,
            );
            console.log('\x1b[36m%s\x1b[0m', 'Family updated ...\n');
          } else {
            console.log('\x1b[36m%s\x1b[0m', 'Skipped Family updating ...\n');
          }

          const {
            id: paymentFlaskId,
            verified: verified,
            id_need: flaskNeedId,
            id_user: flaskUserId,
            order_id: orderId,
            credit_amount: creditAmount,
            donation_amount: donationAmount,
            card_no: cardNumber,
            gateway_payment_id: gatewayPaymentId,
            gateway_track_id: gatewayTrackId,
            need_amount: needAmount,
            transaction_date: transactionDate,
            created: created,
            updated: updated,
          } = payments[p];

          PaymentDetails = {
            flaskId: paymentFlaskId,
            flaskNeedId: flaskNeedId,
            flaskUserId: flaskUserId,
            orderId: orderId,
            verified: verified,
            needAmount: needAmount,
            donationAmount: donationAmount,
            creditAmount: creditAmount,
            cardNumber: cardNumber,
            gatewayPaymentId: gatewayPaymentId,
            gatewayTrackId: gatewayTrackId,
            transactionDate: transactionDate,
            created: created,
            updated: updated,
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
          daysDifference(currentTime, nestPayment.updatedAt) > 1
        ) {
          await this.paymentService
            .updatePayment(nestPayment.id, PaymentDetails, nestFamilyMember)
            .then();
          nestPayment = await this.paymentService.getPaymentById(
            payments[p].id,
          );
        } else {
          console.log('\x1b[36m%s\x1b[0m', 'Skipped Payment updating ...\n');
        }
      }
    } else {
      console.log('\x1b[36m%s\x1b[0m', 'Skipped Payments ...\n');
    }

    //--------------------------------------------Statuses-------------------------------------
    let StatusDetails: StatusParams;
    let nestStatus: StatusEntity;
    const nestStatuses = [];
    if (statuses) {
      for (let s = 0; s < statuses.length; s++) {
        nestStatus = await this.statusService.getStatusById(statuses[s].id);
        if (!nestStatus) {
          const {
            id: statusFlaskId,
            need_id: flaskNeedId,
            sw_id: swId,
            new_status: newStatus,
            old_status: oldStatus,
            created: created,
            updated: updated,
          } = statuses[s];

          StatusDetails = {
            flaskId: statusFlaskId,
            flaskNeedId: flaskNeedId,
            swId: swId,
            newStatus: newStatus,
            oldStatus: oldStatus,
            created: created,
            updated: updated,
          };

          console.log('\x1b[36m%s\x1b[0m', 'Creating a Status ...\n' + s);
          nestStatus = await this.statusService.createStatus(StatusDetails);
          nestStatuses.push(nestStatus);
          console.log('\x1b[36m%s\x1b[0m', 'Created a Status ...\n');
        } else if (nestStatus.newStatus !== theNeed.status) {
          await this.statusService
            .updateStatus(nestStatus.id, StatusDetails)
            .then();
          nestStatus = await this.statusService.getStatusById(statuses[s].id);
          console.log('\x1b[36m%s\x1b[0m', 'Status updated ...\n');
        } else {
          console.log('\x1b[36m%s\x1b[0m', 'Skipped Status updating ...\n');
        }
      }
    } else {
      console.log('\x1b[36m%s\x1b[0m', 'Skipped Status Updates ...\n');
    }

    //--------------------------------------------Provider-------------------------------------
    let theNestProvider: ProviderEntity;
    const nestProviderNeedRelation =
      await this.providerService.getProviderNeedRelationById(theNeed.id);

    // Needs before panel version 2.0.0 does not have providers, we create them here! sry :(
    if (!nestProviderNeedRelation && theNeed.type === NeedTypeEnum.PRODUCT) {
      theNestProvider = await this.providerService.getProviderByName(
        'Digikala',
      );
      if (!theNestProvider) {
        console.log('\x1b[36m%s\x1b[0m', 'Creating a provider ...\n');

        theNestProvider = await this.providerService.createProvider({
          name: 'Digikala',
          description: 'N/A',
          website: 'https://digikala.com',
          type: NeedTypeEnum.PRODUCT,
          typeName: NeedTypeDefinitionEnum.PRODUCT,
          city: 135129,
          state: 3945,
          country: 103,
          logoUrl: 'N/A',
          isActive: true,
        });
        console.log('\x1b[36m%s\x1b[0m', 'Created a provider ...\n');
      }
    } else if (
      nestProviderNeedRelation &&
      theNeed.type === NeedTypeEnum.PRODUCT
    ) {
      theNestProvider = await this.providerService.getProviderById(
        nestProviderNeedRelation.nestProviderId,
      );
    } else if (theNestProvider) {
      console.log('\x1b[36m%s\x1b[0m', 'Skipped provider ...\n');
    }
    //--------------------------------------------Need-------------------------------------
    let needDetails: NeedParams;
    let nestNeed = await this.needService.getNeedByFlaskId(theNeed.id);
    if (!nestSocialWorker || !nestSocialWorker.contributor) {
      throw new ObjectNotFound(
        'Something went wrong while trying to create the Need!',
      );
    }
    if (!nestNeed) {
      needDetails = {
        createdById: theNeed.created_by_id,
        name: theNeed.name_translations.fa,
        nameTranslations: theNeed.name_translations,
        descriptionTranslations: theNeed.description_translations,
        title: theNeed.title,
        status: theNeed.status,
        category: theNeed.category,
        type: theNeed.type,
        isUrgent: theNeed.isUrgent,
        affiliateLinkUrl: theNeed.affiliateLinkUrl,
        link: theNeed.link,
        doingDuration: theNeed.doing_duration,
        needRetailerImg: theNeed.img,
        purchaseCost: theNeed.purchase_cost,
        cost: theNeed._cost,
        deliveryCode: theNeed.deliveryCode,
        doneAt: theNeed.doneAt,
        isConfirmed: theNeed.isConfirmed,
        unavailableFrom: theNeed.unavailable_from,
        created: theNeed.created,
        updated: theNeed.updated,
        purchaseDate: theNeed.purchase_date,
        ngoDeliveryDate: theNeed.ngo_delivery_date,
        expectedDeliveryDate: theNeed.expected_delivery_date,
        childDeliveryDate: theNeed.child_delivery_date,
        bankTrackId: theNeed.bank_track_id,
        confirmDate: theNeed.confirmDate,
        imageUrl: theNeed.imageUrl,
        flaskChildId: childId,
        flaskId: theNeed.id,
        details: theNeed.details,
        information: theNeed.informations,
      };
      console.log('\x1b[36m%s\x1b[0m', 'Creating The Need ...\n');
      const needNgo = await this.ngoService.getNgoById(
        nestSocialWorker.contributor.flaskNgoId,
      );

      nestNeed = await this.needService.createNeed(
        nestChild,
        needNgo,
        nestSocialWorker,
        nestAuditor,
        nestPurchaser,
        needDetails,
        nestStatuses,
        nestPayments,
        nestReceipts,
        theNestProvider,
      );
      console.log('\x1b[36m%s\x1b[0m', 'Created The Need  ...\n');
    } else if (nestNeed && nestNeed.updated !== theNeed.updated) {
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
