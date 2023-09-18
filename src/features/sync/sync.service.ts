import { Injectable } from '@nestjs/common';
import { CityEntity } from 'src/entities/city.entity';
import { NgoEntity } from 'src/entities/ngo.entity';
import { PaymentEntity } from 'src/entities/payment.entity';
import { ReceiptEntity } from 'src/entities/receipt.entity';
import { StatusEntity } from 'src/entities/status.entity';
import { AllUserEntity } from 'src/entities/user.entity';
import {
  NeedTypeDefinitionEnum,
  NeedTypeEnum,
  PanelContributors,
  PaymentStatusEnum,
} from 'src/types/interfaces/interface';
import { NgoParams } from 'src/types/parameters/NgoParammeters';
import { PaymentParams } from 'src/types/parameters/PaymentParameters';
import { ReceiptParams } from 'src/types/parameters/ReceiptParameter';
import { StatusParams } from 'src/types/parameters/StausParameters';
import { convertFlaskToSayPanelRoles } from 'src/utils/helpers';
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
    console.log('\x1b[36m%s\x1b[0m', 'Syncing NGO and contributor ...');
    try {
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
            flaskCountryId: country_id,
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
          flaskCityId: flaskCity.id,
          flaskCountryId: flaskCity.country_id,
          flaskStateId: flaskCity.state_id,
          flaskNgoId: FlaskNgoId,
        };

        console.log('\x1b[36m%s\x1b[0m', 'Creating an NGO ...\n');
        nestNgo = await this.ngoService.createNgo(
          callerNgoDetails,
          nestCallerNgoCity,
        );

        console.log('\x1b[36m%s\x1b[0m', 'Created an NGO ...\n');
      } else if (nestNgo) {
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
    flaskNeed: Need,
    childId: number,
    callerId: number,
    receipts_: CreateReceiptDto[],
    payments: CreatePaymentDto[],
    statuses: CreateStatusDto[],
  ) {
    //-------------------------------------------- Controller Caller-------------------------------------
    const flaskCaller = await this.userService.getFlaskSocialWorker(callerId);
    let nestCaller = await this.userService.getContributorByFlaskId(
      callerId,
      convertFlaskToSayPanelRoles(flaskCaller.type_id),
    );

    const {
      id: callerFlaskId,
      ngo_id: callerFlaskNgoId,
      ...callerOtherParams
    } = flaskCaller;

    const callerDetails = {
      ...callerOtherParams,
      typeId: flaskCaller.type_id,
      firstName: flaskCaller.firstName,
      lastName: flaskCaller.lastName,
      avatarUrl: flaskCaller.avatar_url,
      flaskUserId: callerFlaskId,
      birthDate: flaskCaller.birth_date && new Date(flaskCaller.birth_date),
      panelRole: convertFlaskToSayPanelRoles(flaskCaller.type_id),
      userName: flaskCaller.userName,
    };
    if (!nestCaller) {
      console.log(
        '\x1b[36m%s\x1b[0m',
        'Syncing NGO and Caller ...\n',
        flaskCaller.id,
      );
      const CallerNgo = await this.syncContributorNgo(flaskCaller);
      console.log(
        '\x1b[36m%s\x1b[0m',
        'Synced NGO and Caller ...\n',
        flaskCaller.id,
      );
      console.log('\x1b[36m%s\x1b[0m', 'Creating a Caller ...\n');
      nestCaller = await this.userService.createContributor(
        callerDetails,
        CallerNgo,
      );
      console.log('\x1b[36m%s\x1b[0m', 'Created a Caller ...\n');
    } else if (nestCaller) {
      await this.userService
        .updateContributor(nestCaller.id, callerDetails)
        .then();
      nestCaller = await this.userService.getContributorByFlaskId(
        callerId,
        convertFlaskToSayPanelRoles(flaskCaller.type_id),
      );
      console.log('\x1b[36m%s\x1b[0m', 'Caller updated ...\n');
    } else {
      console.log('\x1b[36m%s\x1b[0m', 'Skipped Caller updating ...\n');
    }

    //-------------------------------------------- Social worker-------------------------------------
    let nestSocialWorker: AllUserEntity;
    let swNgo: NgoEntity;
    nestSocialWorker = await this.userService.getContributorByFlaskId(
      flaskNeed.created_by_id,
      PanelContributors.SOCIAL_WORKER,
    );

    const flaskSocialWorker = await this.userService.getFlaskSocialWorker(
      flaskNeed.created_by_id,
    );
    const {
      id: swFlaskId,
      ngo_id: swFlaskNgoId,
      ...swOtherParams
    } = flaskSocialWorker;

    const swDetails = {
      ...swOtherParams,
      typeId: flaskSocialWorker.type_id,
      firstName: flaskSocialWorker.firstName,
      lastName: flaskSocialWorker.lastName,
      avatarUrl: flaskSocialWorker.avatar_url,
      flaskUserId: swFlaskId,
      birthDate:
        flaskSocialWorker.birth_date && new Date(flaskSocialWorker.birth_date),
      panelRole: PanelContributors.SOCIAL_WORKER,
      userName: flaskSocialWorker.userName,
    };
    if (!nestSocialWorker) {
      swNgo = await this.syncContributorNgo(flaskSocialWorker);
      console.log('\x1b[36m%s\x1b[0m', 'Creating a Social Worker ...\n');
      nestSocialWorker = await this.userService.createContributor(
        swDetails,
        swNgo,
      );
      console.log('\x1b[36m%s\x1b[0m', 'Created a Social Worker ...\n');
    } else if (nestSocialWorker) {
      swNgo = nestSocialWorker.contributions.find(
        (c) => c.flaskUserId == nestSocialWorker.flaskUserId,
      ).ngo;
      await this.userService
        .updateContributor(nestSocialWorker.id, swDetails)
        .then();
      nestSocialWorker = await this.userService.getContributorByFlaskId(
        flaskNeed.created_by_id,
        PanelContributors.SOCIAL_WORKER,
      );
      console.log('\x1b[36m%s\x1b[0m', 'Social Worker updated ...\n');
    } else {
      swNgo = nestSocialWorker.contributions.find(
        (c) => c.flaskUserId == nestSocialWorker.flaskUserId,
      ).ngo;
      console.log('\x1b[36m%s\x1b[0m', 'Skipped Social Worker updating ...\n');
    }
    //--------------------------------------------Auditor-------------------------------------
    let nestAuditor: AllUserEntity;
    let auditorDetails: UserParams;
    try {
      if (flaskNeed.isConfirmed) {
        nestAuditor = await this.userService.getContributorByFlaskId(
          flaskNeed.confirmUser,
          PanelContributors.AUDITOR,
        );

        const flaskAuditor = await this.userService.getFlaskSocialWorker(
          flaskNeed.confirmUser,
        );
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
          flaskUserId: auditorFlaskId,
          birthDate:
            flaskAuditor.birth_date && new Date(flaskAuditor.birth_date),
          panelRole: PanelContributors.AUDITOR,
          userName: flaskAuditor.userName,
        };
        if (!nestAuditor) {
          const auditorNgo = await this.syncContributorNgo(flaskAuditor);
          console.log('\x1b[36m%s\x1b[0m', 'Creating an auditor ...\n');
          nestAuditor = await this.userService.createContributor(
            auditorDetails,
            auditorNgo,
          );
          console.log('\x1b[36m%s\x1b[0m', 'Created an auditor ...\n');
        } else {
          console.log('\x1b[36m%s\x1b[0m', 'Skipped auditor updating ...\n');
        }
      } else if (nestAuditor) {
        await this.userService
          .updateContributor(nestAuditor.id, auditorDetails)
          .then();

        nestAuditor = await this.userService.getContributorByFlaskId(
          flaskNeed.confirmUser,
          PanelContributors.AUDITOR,
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

    //--------------------------------------------Purchaser-------------------------------------
    let nestPurchaser: AllUserEntity;
    if (
      flaskNeed.type === NeedTypeEnum.PRODUCT &&
      flaskNeed.status > PaymentStatusEnum.COMPLETE_PAY
    ) {
      let purchaserId: number;
      if (!statuses) {
        // we do not have a history of purchaser id before implementing our new features
        if (new Date(flaskNeed.doneAt).getFullYear() < 2023) {
          purchaserId = 31; // Nyaz
        }
        if (
          new Date(flaskNeed.doneAt).getFullYear() === 2023 &&
          new Date(flaskNeed.doneAt).getMonth() <= 3
        ) {
          purchaserId = 21; // Neda
        }
      } else {
        purchaserId = statuses.find(
          (s) => s.old_status === PaymentStatusEnum.COMPLETE_PAY,
        )?.sw_id;
      }
      nestPurchaser = await this.userService.getContributorByFlaskId(
        purchaserId,
        PanelContributors.PURCHASER,
      );

      const flaskPurchaser = await this.userService.getFlaskSocialWorker(
        purchaserId,
      );
      const {
        id: purchaserFlaskId,
        ngo_id: purchaserFlaskNgoId,
        ...purchaserOtherParams
      } = flaskPurchaser;

      const purchaserDetails = {
        ...purchaserOtherParams,
        typeId: flaskPurchaser.type_id,
        firstName: flaskPurchaser.firstName,
        lastName: flaskPurchaser.lastName,
        avatarUrl: flaskPurchaser.avatar_url,
        flaskUserId: purchaserFlaskId,
        birthDate:
          flaskPurchaser.birth_date && new Date(flaskPurchaser.birth_date),
        panelRole: PanelContributors.PURCHASER,
        userName: flaskPurchaser.userName,
      };
      if (!nestPurchaser) {
        const purchaserNgo = await this.syncContributorNgo(flaskPurchaser);
        // Create User
        console.log('\x1b[36m%s\x1b[0m', 'Creating a purchaser ...\n');
        nestPurchaser = await this.userService.createContributor(
          purchaserDetails,
          purchaserNgo,
        );
        console.log('\x1b[36m%s\x1b[0m', 'Created a purchaser ...\n');
      } else if (nestPurchaser) {
        await this.userService
          .updateContributor(nestPurchaser.id, purchaserDetails)
          .then();

        nestPurchaser = await this.userService.getContributorByFlaskId(
          purchaserId,
          PanelContributors.PURCHASER,
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
    //--------------------------------------------Child-------------------------------------
    let nestChild = await this.childrenService.getChildById(childId);
    const flaskChild = await this.childrenService.getFlaskChild(childId);

    const childDetails = {
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
      created: flaskChild.created,
      updated: flaskChild.updated,
      isDeleted: flaskChild.isDeleted,
      isConfirmed: flaskChild.isConfirmed,
      flaskConfirmUser: flaskChild.confirmUser,
      confirmDate: flaskChild.confirmDate,
      existenceStatus: flaskChild.existence_status,
      generatedCode: flaskChild.generatedCode,
      isMigrated: flaskChild.isMigrated,
      migratedId: flaskChild.migratedId,
      birthDate: flaskChild.birthDate && new Date(flaskChild.birthDate),
      migrateDate: flaskChild.migrateDate && new Date(flaskChild.migrateDate),
    };

    if (!nestChild) {
      // Create Child
      console.log('\x1b[36m%s\x1b[0m', 'Creating a Child ...\n');

      if (!nestSocialWorker || !nestSocialWorker.contributions) {
        throw new ObjectNotFound(
          'Something went wrong while trying to create a child!',
        );
      }
      const childNgo = await this.ngoService.getNgoById(
        nestSocialWorker.contributions.find(
          (c) => c.flaskUserId == nestSocialWorker.flaskUserId,
        ).flaskNgoId,
      );
      nestChild = await this.childrenService.createChild(
        childDetails,
        childNgo,
        nestSocialWorker.contributions.find(
          (c) => c.flaskUserId == nestSocialWorker.flaskUserId,
        ),
      );
      console.log('\x1b[36m%s\x1b[0m', 'Created a Child ...\n');
    } else if (nestChild && nestChild.updated === flaskNeed.updated) {
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
          flaskNeedId: flaskNeed.id,
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
    let paymentDetails: PaymentParams;
    let nestPayment: PaymentEntity;
    let nestFamilyMember: AllUserEntity;
    const nestPayments = [];
    if (payments) {
      for (let p = 0; p < payments.length; p++) {
        nestPayment = await this.paymentService.getPaymentById(payments[p].id);

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

        paymentDetails = {
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
        nestFamilyMember = await this.userService.getFamilyByFlaskId(
          payments[p].id_user,
        );
        if (!nestFamilyMember) {
          // Create Family
          console.log('\x1b[36m%s\x1b[0m', 'Creating a Family ...\n');
          nestFamilyMember = await this.userService.createFamily(
            payments[p].id_user,
          );
        } else if (nestFamilyMember) {
          await this.userService
            .updateFamily(nestFamilyMember.id, payments[p].id_user)
            .then();
          nestFamilyMember = await this.userService.getFamilyByFlaskId(
            payments[p].id_user,
          );
          console.log('\x1b[36m%s\x1b[0m', 'Family updated ...\n');
        } else {
          console.log('\x1b[36m%s\x1b[0m', 'Skipped Family updating ...\n');
        }
        if (!nestPayment) {
          console.log('\x1b[36m%s\x1b[0m', 'Creating a Payment ...\n' + p);
          nestPayment = await this.paymentService.createPayment(
            paymentDetails,
            nestFamilyMember,
          );
          nestPayments.push(nestPayment);
          console.log('\x1b[36m%s\x1b[0m', 'Created a Payment ...\n');
        } else if (nestPayment) {
          await this.paymentService
            .updatePayment(nestPayment.id, paymentDetails, nestFamilyMember)
            .then();
          nestPayment = await this.paymentService.getPaymentById(
            payments[p].id,
          );
          console.log(nestFamilyMember);
          console.log('\x1b[36m%s\x1b[0m', 'Payment updated ...\n');
        } else {
          console.log('\x1b[36m%s\x1b[0m', 'Skipped Payment updating ...\n');
        }
      }
    } else {
      console.log('\x1b[36m%s\x1b[0m', 'Skipped Payments ...\n');
    }

    //--------------------------------------------Statuses-------------------------------------
    let statusDetails: StatusParams;
    let nestStatus: StatusEntity;
    const nestStatuses = [];
    if (statuses) {
      for (let s = 0; s < statuses.length; s++) {
        nestStatus = await this.statusService.getStatusById(statuses[s].id);
        const {
          id: statusFlaskId,
          need_id: flaskNeedId,
          sw_id: swId,
          new_status: newStatus,
          old_status: oldStatus,
        } = statuses[s];

        statusDetails = {
          flaskId: statusFlaskId,
          flaskNeedId: flaskNeedId,
          swId: swId,
          newStatus: newStatus,
          oldStatus: oldStatus,
        };
        if (!nestStatus) {
          console.log('\x1b[36m%s\x1b[0m', 'Creating a Status ...\n' + s);
          nestStatus = await this.statusService.createStatus(statusDetails);
          nestStatuses.push(nestStatus);
          console.log('\x1b[36m%s\x1b[0m', 'Created a Status ...\n');
        } else if (nestStatus.newStatus !== flaskNeed.status) {
          await this.statusService
            .updateStatus(nestStatus.id, statusDetails)
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
      await this.providerService.getProviderNeedRelationById(flaskNeed.id);

    // Needs before panel version 2.0.0 does not have providers, we create them here! sry :(
    if (!nestProviderNeedRelation && flaskNeed.type === NeedTypeEnum.PRODUCT) {
      theNestProvider = await this.providerService.getProviderByName(
        'Digikala',
      );
      if (!theNestProvider) {
        console.log('\x1b[36m%s\x1b[0m', 'Creating a provider ...\n');

        theNestProvider = await this.providerService.createProvider({
          name: 'Digikala',
          description: 'N/A',
          address: 'N/A',
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
      flaskNeed.type === NeedTypeEnum.PRODUCT
    ) {
      theNestProvider = await this.providerService.getProviderById(
        nestProviderNeedRelation.nestProviderId,
      );
    } else if (theNestProvider) {
      console.log('\x1b[36m%s\x1b[0m', 'Skipped provider ...\n');
    }
    //--------------------------------------------Need-------------------------------------
    let nestNeed = await this.needService.getNeedByFlaskId(flaskNeed.id);
    if (!nestSocialWorker || !nestSocialWorker.contributions) {
      throw new ObjectNotFound(
        'Something went wrong while trying to create the Need!',
      );
    }
    const needDetails = {
      name: flaskNeed.name_translations.fa,
      nameTranslations: flaskNeed.name_translations,
      descriptionTranslations: flaskNeed.description_translations,
      title: flaskNeed.title,
      status: flaskNeed.status,
      category: flaskNeed.category,
      type: flaskNeed.type,
      isUrgent: flaskNeed.isUrgent,
      affiliateLinkUrl: flaskNeed.affiliateLinkUrl,
      link: flaskNeed.link,
      doingDuration: flaskNeed.doing_duration,
      needRetailerImg: flaskNeed.img,
      purchaseCost: flaskNeed.purchase_cost,
      cost: flaskNeed._cost,
      deliveryCode: flaskNeed.deliveryCode,
      doneAt: flaskNeed.doneAt,
      isConfirmed: flaskNeed.isConfirmed,
      unavailableFrom: flaskNeed.unavailable_from,
      created: flaskNeed.created,
      updated: flaskNeed.updated,
      purchaseDate: flaskNeed.purchase_date,
      ngoDeliveryDate: flaskNeed.ngo_delivery_date,
      expectedDeliveryDate: flaskNeed.expected_delivery_date,
      childDeliveryDate: flaskNeed.child_delivery_date,
      bankTrackId: flaskNeed.bank_track_id,
      confirmDate: flaskNeed.confirmDate,
      imageUrl: flaskNeed.imageUrl,
      flaskChildId: childId,
      flaskId: flaskNeed.id,
      details: flaskNeed.details,
      information: flaskNeed.informations,
    };
    console.log('----------------------------------');
    console.log(nestNeed);
    console.log(flaskNeed.id);

    if (!nestNeed) {
      console.log('\x1b[36m%s\x1b[0m', 'Creating The Need ...\n');
      const needNgo = await this.ngoService.getNgoById(
        nestSocialWorker.contributions.find(
          (c) => c.flaskUserId === nestSocialWorker.flaskUserId,
        ).flaskNgoId,
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
    } else if (nestNeed && nestNeed.updated !== flaskNeed.updated) {
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
