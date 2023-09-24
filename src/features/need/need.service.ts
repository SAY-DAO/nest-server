import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NeedEntity } from '../../entities/need.entity';
import { Need } from '../../entities/flaskEntities/need.entity';
import { Brackets, IsNull, Not, Repository, UpdateResult } from 'typeorm';
import {
  Configuration,
  NeedAPIApi,
  PreneedAPIApi,
  PreneedSummary,
  PublicAPIApi,
  PublicNeed,
} from '../../generated-sources/openapi';
import {
  childExistence,
  NeedTypeEnum,
  PaymentStatusEnum,
  ProductStatusEnum,
  ServiceStatusEnum,
} from 'src/types/interfaces/interface';
import { ChildrenEntity } from 'src/entities/children.entity';
import { NeedParams } from 'src/types/parameters/NeedParameters';
import { NgoEntity } from 'src/entities/ngo.entity';
import { StatusEntity } from 'src/entities/status.entity';
import { PaymentEntity } from 'src/entities/payment.entity';
import { ReceiptEntity } from 'src/entities/receipt.entity';
import { IpfsEntity } from 'src/entities/ipfs.entity';
import { ProviderEntity } from 'src/entities/provider.entity';
import { Child } from 'src/entities/flaskEntities/child.entity';
import { AllUserEntity } from 'src/entities/user.entity';
import { NeedStatusUpdate } from 'src/entities/flaskEntities/NeedStatusUpdate.entity';
import { Payment } from 'src/entities/flaskEntities/payment.entity';
import { NeedReceipt } from 'src/entities/flaskEntities/needReceipt.entity';
import { Receipt } from 'src/entities/flaskEntities/receipt.entity';
import { NGO } from 'src/entities/flaskEntities/ngo.entity';
import {
  Paginated,
  PaginateQuery,
  paginate as nestPaginate,
} from 'nestjs-paginate';
import { from } from 'rxjs';

@Injectable()
export class NeedService {
  constructor(
    @InjectRepository(Need, 'flaskPostgres')
    private flaskNeedRepository: Repository<Need>,
    @InjectRepository(NeedEntity)
    private needRepository: Repository<NeedEntity>,
  ) {}

  async getFlaskNeed(flaskNeedId: number): Promise<Need> {
    return this.flaskNeedRepository.findOne({
      where: {
        id: flaskNeedId,
      },
    });
  }

  async getFlaskAuditorNeeds(flaskUserId: number): Promise<Need[]> {
    return this.flaskNeedRepository.find({
      where: {
        confirmUser: flaskUserId,
      },
      select: {
        id: true,
        title: true,
      },
    });
  }
  async getNestAuditorNeeds(flaskUserId: number): Promise<NeedEntity[]> {
    return this.needRepository.find({
      where: {
        auditor: {
          flaskUserId,
        },
      },
      select: {
        id: true,
        title: true,
      },
      relations: {
        child: false,
      },
    });
  }
  async getNestPurchaserNeeds(flaskUserId: number): Promise<NeedEntity[]> {
    return this.needRepository.find({
      where: {
        purchaser: {
          flaskUserId,
        },
      },
      select: {
        id: true,
        title: true,
      },
      relations: {
        child: false,
      },
    });
  }
  getFlaskNeedsByDeliveryCode(code: string): Promise<Need[]> {
    return this.flaskNeedRepository.find({
      where: {
        deliveryCode: code,
      },
    });
  }

  getFlaskPreNeed(accessToken: any): Promise<PreneedSummary> {
    const preneedApi = new PreneedAPIApi();
    const preneeds = preneedApi.apiV2PreneedsGet(accessToken);
    return preneeds;
  }

  async getNeedIpfs(id: number): Promise<IpfsEntity> {
    const need = await this.needRepository.findOne({
      where: {
        flaskId: id,
      },
    });
    if (!need) {
      return;
    }

    return need.ipfs;
  }

  getNeeds(): Promise<NeedEntity[]> {
    return this.needRepository.find({
      relations: {
        child: true,
        verifiedPayments: true,
      },
    });
  }

  getNeedById(needId: string): Promise<NeedEntity> {
    const user = this.needRepository.findOne({
      where: {
        id: needId,
      },
      relations: {
        verifiedPayments: true,
        signatures: true,
      },
    });
    return user;
  }

  updateNeedContributors(
    needId: string,
    theAuditor: AllUserEntity,
    thePurchaser: AllUserEntity,
  ) {
    return this.needRepository.update(needId, {
      auditor: theAuditor,
      purchaser: thePurchaser,
    });
  }

  getNeedByFlaskId(flaskId: number): Promise<NeedEntity> {
    const need = this.needRepository.findOne({
      where: {
        flaskId: flaskId,
        // verifiedPayments: { verified: Not(IsNull()) },
      },
      relations: {
        verifiedPayments: true,
        signatures: true,
      },
    });
    return need;
  }

  updateNeed(
    needId: string,
    theChild: ChildrenEntity,
    theNgo: NgoEntity,
    theSw: AllUserEntity,
    theAuditor: AllUserEntity,
    thePurchaser: AllUserEntity,
    needDetails: NeedParams,
  ): Promise<UpdateResult> {
    return this.needRepository.update(needId, {
      child: theChild,
      socialWorker: theSw,
      auditor: theAuditor,
      purchaser: thePurchaser,
      ngo: theNgo,
      ...needDetails,
    });
  }

  async updateIsResolved(needId: string, isResolved: boolean) {
    return this.needRepository.update(needId, {
      isResolved: isResolved,
    });
  }

  updateNeedMidjourney(
    needId: string,
    selectedImage: string,
  ): Promise<UpdateResult> {
    return this.needRepository.update(needId, {
      midjourneyImage: selectedImage,
    });
  }

  createNeed(
    theChild: ChildrenEntity,
    theNgo: NgoEntity,
    theSw: AllUserEntity,
    theAuditor: AllUserEntity,
    thePurchaser: AllUserEntity,
    needDetails: NeedParams,
    statusUpdates: StatusEntity[],
    verifiedPayments: PaymentEntity[],
    receipts: ReceiptEntity[],
    provider: ProviderEntity,
  ): Promise<NeedEntity> {
    if (
      !theSw ||
      (needDetails.status >= ProductStatusEnum.PARTIAL_PAY && !theAuditor) ||
      (needDetails.isConfirmed && !theAuditor) ||
      (needDetails.type === NeedTypeEnum.PRODUCT &&
        needDetails.status >= ProductStatusEnum.PURCHASED_PRODUCT &&
        !thePurchaser) ||
      (needDetails.status >= ProductStatusEnum.PARTIAL_PAY &&
        (!verifiedPayments || !verifiedPayments[0])) ||
      !theNgo
    ) {
      throw new ForbiddenException(
        'Can not Create need without contributors or NGO',
      );
    }
    const newNeed = this.needRepository.create({
      child: theChild,
      socialWorker: theSw,
      auditor: theAuditor,
      purchaser: thePurchaser,
      ngo: theNgo,
      flaskNgoId: theNgo.flaskNgoId,
      ...needDetails,
    });
    newNeed.statusUpdates = statusUpdates;
    newNeed.verifiedPayments = verifiedPayments;
    newNeed.receipts = receipts;
    newNeed.provider = provider;

    return this.needRepository.save(newNeed);
  }

  async getFlaskRandomNeed(): Promise<PublicNeed> {
    const configuration = new Configuration({
      basePath: 'https://api.s.sayapp.company',
    });

    const publicApi = new PublicAPIApi(
      configuration,
      'https://api.s.sayapp.company',
      (url: 'https://api.s.sayapp.company/api'): Promise<Response> => {
        return fetch(url);
      },
    );

    const need: Promise<PublicNeed> = publicApi
      .apiV2PublicRandomNeedGet()
      .then((r) => r)
      .catch((e) => e);

    return need;
  }

  async getNotConfirmedNeeds(
    socialWorker: number,
    swIds: number[],
    ngoIds: number[],
  ): Promise<any> {
    const queryBuilder = this.flaskNeedRepository
      .createQueryBuilder('need')
      .leftJoinAndMapOne(
        'need.child',
        Child,
        'child',
        'child.id = need.child_id',
      )
      .leftJoinAndMapOne('child.ngo', NGO, 'ngo', 'ngo.id = child.id_ngo')
      .where('child.id_ngo IN (:...ngoIds)', { ngoIds: ngoIds })
      .andWhere('child.id_ngo NOT IN (:...testNgoIds)', { testNgoIds: [3, 14] })
      .andWhere('child.existence_status IN (:...existenceStatus)', {
        existenceStatus: [childExistence.AlivePresent],
      })
      .andWhere('need.isConfirmed = :needConfirmed', { needConfirmed: false })
      .andWhere('need.isDeleted = :needDeleted', { needDeleted: false })
      .andWhere('need.created_by_id IN (:...swIds)', {
        swIds: socialWorker ? [socialWorker] : [...swIds],
      })
      .andWhere('need.status = :statusNotPaid', {
        statusNotPaid: PaymentStatusEnum.NOT_PAID,
      })
      .select([
        'child',
        'ngo.id',
        'ngo.name',
        'ngo.logoUrl',
        'need.id',
        'need.child_id',
        'need.created_by_id',
        'need.name_translations',
        'need.title',
        'need.imageUrl',
        'need.category',
        'need.type',
        'need.isUrgent',
        'need.link',
        'need.affiliateLinkUrl',
        'need.bank_track_id',
        'need.doing_duration',
        'need.status',
        'need.img',
        'need.purchase_cost',
        'need._cost',
        'need.isConfirmed',
        'need.created',
        'need.updated',
        'need.confirmDate',
        'need.confirmUser',
        'need.doneAt',
        'need.ngo_delivery_date',
        'need.child_delivery_date',
        'need.purchase_date',
        'need.expected_delivery_date',
        'need.unavailable_from',
      ])
      .cache(60000)
      .orderBy('need.created', 'ASC');
    const accurateCount = await queryBuilder.getCount();

    return accurateCount;
  }
  async getNotPaidNeeds(
    options: PaginateQuery,
    socialWorker: number,
    auditor: number,
    purchaser: number,
    ngoSupervisor: number,
    swIds: number[],
    ngoIds: number[],
  ): Promise<Paginated<Need>> {
    const queryBuilder = this.flaskNeedRepository
      .createQueryBuilder('need')
      .leftJoinAndMapOne(
        'need.child',
        Child,
        'child',
        'child.id = need.child_id',
      )
      .leftJoinAndMapOne('child.ngo', NGO, 'ngo', 'ngo.id = child.id_ngo')
      .where('child.id_ngo IN (:...ngoIds)', { ngoIds: ngoIds })
      .andWhere('child.id_ngo NOT IN (:...testNgoIds)', { testNgoIds: [3, 14] })
      .andWhere('child.existence_status IN (:...existenceStatus)', {
        existenceStatus: [childExistence.AlivePresent],
      })
      .andWhere('need.isDeleted = :needDeleted', { needDeleted: false })
      .andWhere('need.created_by_id IN (:...swIds)', {
        swIds: socialWorker ? [socialWorker] : [...swIds],
      })
      .andWhere('need.status = :statusNotPaid', {
        statusNotPaid: PaymentStatusEnum.NOT_PAID,
      })
      .select([
        'child',
        'ngo.id',
        'ngo.name',
        'ngo.logoUrl',
        'need.id',
        'need.child_id',
        'need.created_by_id',
        'need.name_translations',
        'need.title',
        'need.imageUrl',
        'need.category',
        'need.type',
        'need.isUrgent',
        'need.link',
        'need.affiliateLinkUrl',
        'need.bank_track_id',
        'need.doing_duration',
        'need.status',
        'need.img',
        'need.purchase_cost',
        'need._cost',
        'need.isConfirmed',
        'need.created',
        'need.updated',
        'need.confirmDate',
        'need.confirmUser',
        'need.doneAt',
        'need.ngo_delivery_date',
        'need.child_delivery_date',
        'need.purchase_date',
        'need.expected_delivery_date',
        'need.details',
        'need.informations',
        'need.unavailable_from',
      ])
      .cache(60000);

    return await nestPaginate<Need>(options, queryBuilder, {
      sortableColumns: ['id'],
      defaultSortBy: [['isConfirmed', 'ASC']],
      nullSort: 'last',
    });
  }

  async getPaidNeeds(
    options: PaginateQuery,
    socialWorker: number,
    auditor: number,
    purchaser: number,
    ngoId: number,
    swIds: number[],
    ngoIds: number[],
  ): Promise<Paginated<Need>> {
    const queryBuilder = this.flaskNeedRepository
      .createQueryBuilder('need')
      .leftJoinAndMapOne(
        'need.child',
        Child,
        'child',
        'child.id = need.child_id',
      )
      .leftJoinAndMapOne('child.ngo', NGO, 'ngo', 'ngo.id = child.id_ngo')
      .leftJoinAndMapMany(
        'need.payments',
        Payment,
        'payment',
        'payment.id_need = need.id',
      )
      .andWhere('child.id_ngo IN (:...ngoIds)', { ngoIds: ngoIds })
      .andWhere('need.isDeleted = :needDeleted', { needDeleted: false })
      .andWhere('need.status IN (:...statuses)', {
        statuses: [
          PaymentStatusEnum.COMPLETE_PAY,
          PaymentStatusEnum.PARTIAL_PAY,
        ],
      })
      .andWhere('payment.id IS NOT NULL')
      .andWhere('payment.verified IS NOT NULL')
      .andWhere('payment.order_id IS NOT NULL')
      .andWhere('need.created_by_id IN (:...swIds)', {
        swIds: socialWorker ? [socialWorker] : [...swIds],
      })
      .select([
        'child',
        'ngo.id',
        'ngo.name',
        'ngo.logoUrl',
        'need.id',
        'need.child_id',
        'need.created_by_id',
        'need.name_translations',
        'need.title',
        'need.imageUrl',
        'need.category',
        'need.type',
        'need.isUrgent',
        'need.link',
        'need.affiliateLinkUrl',
        'need.bank_track_id',
        'need.doing_duration',
        'need.status',
        'need.img',
        'need.purchase_cost',
        'need._cost',
        'need.isConfirmed',
        'need.created',
        'need.updated',
        'need.confirmDate',
        'need.confirmUser',
        'need.doneAt',
        'need.ngo_delivery_date',
        'need.child_delivery_date',
        'need.purchase_date',
        'need.expected_delivery_date',
        'need.details',
        'need.informations',
        'need.unavailable_from',
        'payment',
      ])
      .cache(60000);

    return await nestPaginate<Need>(options, queryBuilder, {
      sortableColumns: ['id'],
      defaultSortBy: [['doneAt', 'DESC']],
      nullSort: 'last',
    });
  }

  async getPurchasedNeeds(
    options: PaginateQuery,
    socialWorker: number,
    auditor: number,
    purchaser: number,
    ngoId: number,
    swIds: number[],
    ngoIds: number[],
  ): Promise<Paginated<Need>> {
    const queryBuilder = this.flaskNeedRepository
      .createQueryBuilder('need')
      .leftJoinAndMapOne(
        'need.child',
        Child,
        'child',
        'child.id = need.child_id',
      )
      .leftJoinAndMapOne('child.ngo', NGO, 'ngo', 'ngo.id = child.id_ngo')
      .leftJoinAndMapMany(
        'need.payments',
        Payment,
        'payment',
        'payment.id_need = need.id',
      )
      .leftJoinAndMapMany(
        'need.status_updates',
        NeedStatusUpdate,
        'need_status_updates',
        'need_status_updates.need_id = need.id',
      )
      .andWhere('child.id_ngo IN (:...ngoIds)', { ngoIds: ngoIds })
      .andWhere('need.isDeleted = :needDeleted', { needDeleted: false })
      .where(
        new Brackets((qb) => {
          qb.where('need.type = :typeProduct', {
            typeProduct: NeedTypeEnum.PRODUCT,
          })
            .andWhere('need.status = :productStatus', {
              productStatus: ProductStatusEnum.PURCHASED_PRODUCT,
            })
            .orWhere('need.type = :typeService', {
              typeService: NeedTypeEnum.SERVICE,
            })
            .andWhere('need.status = :serviceStatus', {
              serviceStatus: ServiceStatusEnum.MONEY_TO_NGO,
            });
        }),
      )
      .andWhere('need.created_by_id IN (:...swIds)', {
        swIds: socialWorker ? [socialWorker] : [...swIds],
      })
      .select([
        'child',
        'ngo.id',
        'ngo.name',
        'ngo.logoUrl',
        'need.id',
        'need.child_id',
        'need.created_by_id',
        'need.name_translations',
        'need.title',
        'need.imageUrl',
        'need.category',
        'need.type',
        'need.isUrgent',
        'need.link',
        'need.affiliateLinkUrl',
        'need.bank_track_id',
        'need.doing_duration',
        'need.status',
        'need.img',
        'need.purchase_cost',
        'need._cost',
        'need.isConfirmed',
        'need.created',
        'need.updated',
        'need.confirmDate',
        'need.confirmUser',
        'need.doneAt',
        'need.ngo_delivery_date',
        'need.child_delivery_date',
        'need.purchase_date',
        'need.expected_delivery_date',
        'need.details',
        'need.informations',
        'need.unavailable_from',
        'need_status_updates',
        'payment',
      ])
      .cache(60000);
    return await nestPaginate<Need>(options, queryBuilder, {
      sortableColumns: ['id'],
      defaultSortBy: [['updated', 'DESC']],
      nullSort: 'last',
    });
  }

  async getDeliveredNeeds(
    options: PaginateQuery,
    socialWorker: number,
    auditor: number,
    purchaser: number,
    ngoId: number,
    swIds: number[],
    ngoIds: number[],
    needWithSignatures: number[],
  ): Promise<Paginated<Need>> {
    const queryBuilder = this.flaskNeedRepository
      .createQueryBuilder('need')
      .leftJoinAndMapOne(
        'need.child',
        Child,
        'child',
        'child.id = need.child_id',
      )
      .leftJoinAndMapOne('child.ngo', NGO, 'ngo', 'ngo.id = child.id_ngo')
      .leftJoinAndMapMany(
        'need.payments',
        Payment,
        'payment',
        'payment.id_need = need.id',
      )
      .leftJoinAndMapMany(
        'need.status_updates',
        NeedStatusUpdate,
        'need_status_updates',
        'need_status_updates.need_id = need.id',
      )

      .leftJoinAndMapMany(
        'need.receipts_',
        NeedReceipt,
        'need_receipt',
        'need_receipt.need_id = need.id',
      )

      .leftJoinAndMapMany(
        'need_receipt.receipt',
        Receipt,
        'receipt',
        'receipt.id = need_receipt.receipt_id',
      )
      .where('need.id NOT IN (:...needWithSignatures)', {
        needWithSignatures: needWithSignatures[0]
          ? [...needWithSignatures]
          : [0],
      })
      .andWhere('child.id_ngo IN (:...ngoIds)', { ngoIds: ngoIds })

      .andWhere('need.isDeleted = :needDeleted', { needDeleted: false })
      .andWhere(
        new Brackets((qb) => {
          qb.where('need.type = :typeProduct', {
            typeProduct: NeedTypeEnum.PRODUCT,
          })
            .andWhere('need.status = :productStatus', {
              productStatus: ProductStatusEnum.DELIVERED,
            })
            .orWhere('need.type = :typeService', {
              typeService: NeedTypeEnum.SERVICE,
            })
            .andWhere('need.status = :serviceStatus', {
              serviceStatus: ServiceStatusEnum.DELIVERED,
            });
        }),
      )
      .andWhere('need.created_by_id IN (:...swIds)', {
        swIds: socialWorker ? [socialWorker] : [...swIds],
      })
      .select([
        'child',
        'ngo.id',
        'ngo.name',
        'ngo.logoUrl',
        'need.id',
        'need.child_id',
        'need.created_by_id',
        'need.name_translations',
        'need.title',
        'need.imageUrl',
        'need.category',
        'need.type',
        'need.isUrgent',
        'need.link',
        'need.affiliateLinkUrl',
        'need.bank_track_id',
        'need.doing_duration',
        'need.status',
        'need.img',
        'need.purchase_cost',
        'need._cost',
        'need.isConfirmed',
        'need.created',
        'need.updated',
        'need.confirmDate',
        'need.confirmUser',
        'need.doneAt',
        'need.ngo_delivery_date',
        'need.child_delivery_date',
        'need.purchase_date',
        'need.expected_delivery_date',
        'need.unavailable_from',
        'need.details',
        'need.informations',
        'need_status_updates',
        'receipt',
        'need_receipt',
        'payment',
      ])
      .cache(60000);
    return await nestPaginate<Need>(options, queryBuilder, {
      sortableColumns: ['id'],
      defaultSortBy: [['updated', 'DESC']],
      nullSort: 'last',
    });
  }

  async getDuplicateNeeds(childId: number, needId: number) {
    const need = await this.getFlaskNeed(needId);
    const queryBuilder = this.flaskNeedRepository
      .createQueryBuilder('need')
      // .where("need.unavailable_from > :startDate", { startDate: new Date(2021, 2, 3) })
      // .andWhere("need.unavailable_from < :endDate", { endDate: new Date(2023, 1, 3) })
      .andWhere('need.child_id = :childId', { childId: childId })
      .andWhere('need.isDeleted = :needDeleted', { needDeleted: false })
      .andWhere('need.id != :needId', { needId: need.id })
      // .andWhere('need.title = :title', { title: need.title })

      .andWhere("need.name_translations -> 'en' = :nameTranslations", {
        nameTranslations: need.name_translations.en,
      })

      .andWhere('need.status < :statusPaid', {
        statusPaid: PaymentStatusEnum.COMPLETE_PAY,
      })
      .select([
        'need.id',
        'need.title',
        'need.imageUrl',
        'need.child_id',
        'need.name_translations',
        'need.title',
        'need.type',
        'need.link',
        'need.status',
        'need.isConfirmed',
        'need.doing_duration',
        'need.status',
        'need.created',
        'need.updated',
        'need.confirmDate',
        'need.doneAt',
        'need.ngo_delivery_date',
        'need.child_delivery_date',
        'need.purchase_date',
        'need.expected_delivery_date',
        'need.unavailable_from',
      ])
      .cache(60000)
      .orderBy('need.created', 'ASC');
    return await queryBuilder.getMany();
  }

  async getDeleteCandidates(): Promise<[Need[], number]> {
    const date = new Date();
    date.setMonth(date.getMonth() - 3); // three months ago
    return this.flaskNeedRepository
      .createQueryBuilder('need')
      .leftJoinAndMapOne(
        'need.child',
        Child,
        'child',
        'child.id = need.child_id',
      )
      .where('need.isConfirmed = :isConfirmed', { isConfirmed: true })
      .andWhere('need.isDeleted = :needDeleted', { needDeleted: false })
      .andWhere('child.id_ngo NOT IN (:...testNgoIds)', { testNgoIds: [3, 14] })
      .andWhere('need.confirmDate > :startDate', {
        startDate: new Date(2019, 1, 1),
      })
      .andWhere('need.confirmDate < :endDate', { endDate: date })
      .andWhere('need.status = :statusNotPaid', {
        statusNotPaid: PaymentStatusEnum.NOT_PAID,
      })
      .select([
        'need.id',
        'need.status',
        'need.isConfirmed',
        'need.deleted_at',
        'need.created',
        'need.updated',
        'need.confirmDate',
      ])
      .cache(60000)
      .limit(500)
      .orderBy('need.created', 'ASC')
      .getManyAndCount();
  }

  async deleteOneNeed(id: string) {
    return from(this.needRepository.delete(id));
  }

  async deleteFlaskOneNeed(flaskNeedId: number, accessToken: string) {
    const needApi = new NeedAPIApi();
    const deleted = needApi.apiV2NeedDeleteNeedIdneedIdPatch(
      accessToken,
      flaskNeedId,
    );
    return deleted;
  }

  async getMidjourneyNeeds(): Promise<Need[]> {
    return await this.flaskNeedRepository
      .createQueryBuilder('need')
      .andWhere('need.isDeleted = :needDeleted', { needDeleted: false })
      .andWhere('need.status >= :statusPaid', {
        statusPaid: PaymentStatusEnum.COMPLETE_PAY,
      })
      .select([
        'need.id',
        'need.imageUrl',
        'need.name_translations',
        'need.title',
        'need.img',
        'need.link',
        'need.status',
        'need.created',
        'need.updated',
        'need.confirmDate',
        'need.doneAt',
      ])
      .cache(60000)
      .orderBy('need.created', 'DESC')
      .getMany();
  }

  async getConfirmsInRange(
    confirmDate: Date,
    needCategory: number,
    needType: number,
    month: number,
  ): Promise<[Need[], number]> {
    const d = new Date(confirmDate);
    d.setMonth(d.getMonth() - month); // 1 months ago

    const d2 = new Date(confirmDate);
    d2.setMonth(d2.getMonth() + month); // 1 months after

    return await this.flaskNeedRepository
      .createQueryBuilder('need')
      .where('need.category = :needCategory', { needCategory })
      .andWhere('need.type = :needType', { needType })
      .andWhere('need.confirmDate > :startDate', {
        startDate: new Date(d),
      })
      .andWhere('need.confirmDate <= :endDate', {
        endDate: new Date(d2),
      })
      .andWhere('need.isConfirmed = :isConfirmed', { isConfirmed: true })
      .andWhere('need.isDeleted = :isDeleted', { isDeleted: false })
      .getManyAndCount();
  }

  async getPurchasedNeedsCount(socialWorker: number): Promise<Need[]> {
    return this.flaskNeedRepository
      .createQueryBuilder('need')
      .leftJoinAndMapOne(
        'need.child',
        Child,
        'child',
        'child.id = need.child_id',
      )
      .leftJoinAndMapOne('child.ngo', NGO, 'ngo', 'ngo.id = child.id_ngo')
      .leftJoinAndMapMany(
        'need.payments',
        Payment,
        'payment',
        'payment.id_need = need.id',
      )
      .leftJoinAndMapMany(
        'need.status_updates',
        NeedStatusUpdate,
        'need_status_updates',
        'need_status_updates.need_id = need.id',
      )
      .andWhere('need.isDeleted = :needDeleted', { needDeleted: false })
      .andWhere('need.created_by_id IN (:...swIds)', {
        swIds: [socialWorker],
      })
      .where(
        new Brackets((qb) => {
          qb.where('need.type = :typeProduct', {
            typeProduct: NeedTypeEnum.PRODUCT,
          })
            .andWhere('need.status = :productStatus', {
              productStatus: ProductStatusEnum.PURCHASED_PRODUCT,
            })
            .orWhere('need.type = :typeService', {
              typeService: NeedTypeEnum.SERVICE,
            })
            .andWhere('need.status = :serviceStatus', {
              serviceStatus: ServiceStatusEnum.MONEY_TO_NGO,
            });
        }),
      )
      .select(['need.id'])
      .getMany();
  }
}
