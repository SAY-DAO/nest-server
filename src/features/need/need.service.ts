import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NeedEntity } from '../../entities/need.entity';
import { Need } from '../../entities/flaskEntities/need.entity';
import { Brackets, Repository, UpdateResult } from 'typeorm';
import {
  Configuration,
  PublicAPIApi,
  PublicNeed,
} from '../../generated-sources/openapi';
import {
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
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';

@Injectable()
export class NeedService {
  constructor(
    @InjectRepository(Child, 'flaskPostgres')
    private flaskChildRepository: Repository<Child>,
    @InjectRepository(Need, 'flaskPostgres')
    private flaskNeedRepository: Repository<Need>,
    @InjectRepository(NeedEntity)
    private needRepository: Repository<NeedEntity>,
  ) { }

  getFlaskNeed(flaskNeedId: number): Promise<Need> {
    return this.flaskNeedRepository.findOne({
      where: {
        id: flaskNeedId,
      },
    });
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
      },
    });
    return user;
  }

  getNeedByFlaskId(flaskId: number): Promise<NeedEntity> {
    const user = this.needRepository.findOne({
      where: {
        flaskId: flaskId,
      },
      relations: {
        verifiedPayments: true,
      },
    });
    return user;
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
      (needDetails.status >= ProductStatusEnum.PURCHASED_PRODUCT &&
        !thePurchaser) ||
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
        console.log(url);
        return fetch(url);
      },
    );

    const need: Promise<PublicNeed> = publicApi
      .apiV2PublicRandomNeedGet()
      .then((r) => r)
      .catch((e) => e);

    return need;
  }

  async getContributorFlaskNeeds(
    options: IPaginationOptions,
    socialWorker: number,
    auditor: number,
    purchaser: number,
    ngoId: number,
  ): Promise<Pagination<Need>> {
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
        'need.status_updates',
        NeedStatusUpdate,
        'need_status_updates',
        'need_status_updates.need_id = need.id',
      )
      // .leftJoinAndMapOne(
      //   'need.payments',
      //   Payment,
      //   'payment',
      //   'payment.id_need = need.id',
      // )

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

      .where('need.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('child.id_ngo != 3')
      .andWhere('child.id_ngo != 14')
      .andWhere('need.created_by_id = :created_by_id', {
        created_by_id: socialWorker,
      })
      .orWhere('need.confirmUser = :confirmUser', { confirmUser: auditor })
      .orWhere('ngo.id = :ngoId', { ngoId: ngoId })
      .orWhere(
        new Brackets((qb) => {
          qb.where('need_status_updates.old_status = 2')
            .andWhere('need_status_updates.new_status = 3')
            .andWhere('need_status_updates.sw_id = :purchaser', {
              purchaser: purchaser,
            });
        }),
      )
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
        'need_status_updates',
        'need_receipt',
        'receipt',
      ])
      .orderBy('need.created', 'DESC');
    return paginate<Need>(queryBuilder, options);
  }

  async getAdminFlaskNeeds(
    options: IPaginationOptions,
  ): Promise<Pagination<Need>> {
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

      .where('need.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('child.id_ngo != 3')
      .andWhere('child.id_ngo != 14')

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
        'need_status_updates',
        // 'payment',
        'need_receipt',
        'receipt',
      ])
      .orderBy('need.created', 'DESC');

    return paginate<Need>(queryBuilder, options);
  }

  async getUnpaidNeeds(
    options: IPaginationOptions,
    socialWorker: number,
    auditor: number,
    purchaser: number,
    ngoId: number,
  ): Promise<Pagination<Need>> {
    const queryBuilder = this.flaskNeedRepository
      .createQueryBuilder('need')
      .leftJoinAndMapOne(
        'need.child',
        Child,
        'child',
        'child.id = need.child_id',
      )
      .leftJoinAndMapOne('child.ngo', NGO, 'ngo', 'ngo.id = child.id_ngo')

      .where('child.isConfirmed = :childConfirmed', { childConfirmed: true })
      .andWhere('child.id_ngo NOT IN (:...ids)', { ids: [3, 14] })
      .andWhere('need.isDeleted = :needDeleted', { needDeleted: false })

      .andWhere('need.created_by_id = :created_by_id', {
        created_by_id: socialWorker,
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
      .orderBy('need.created', 'DESC');
    return paginate<Need>(queryBuilder, options);
  }

  async getPaidNeeds(
    options: IPaginationOptions,
    socialWorker: number,
    auditor: number,
    purchaser: number,
    ngoId: number,
  ): Promise<Pagination<Need>> {
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
      .andWhere('need.status = :statusComplete', {
        statusComplete: PaymentStatusEnum.COMPLETE_PAY,
      })
      .orWhere('need.status = :statusPartial', {
        statusPartial: PaymentStatusEnum.PARTIAL_PAY,
      })
      .andWhere('payment.verified IS NOT NULL')
      .andWhere('payment.order_id IS NOT NULL')
      .andWhere('need.created_by_id = :created_by_id', {
        created_by_id: socialWorker,
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
        'payment'
      ])
      .orderBy('need.created', 'DESC');
    return paginate<Need>(queryBuilder, options);
  }

  async getPurchasedNeeds(
    options: IPaginationOptions,
    socialWorker: number,
    auditor: number,
    purchaser: number,
    ngoId: number,
  ): Promise<Pagination<Need>> {
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
     
      .where(
        new Brackets((qb) => {
          qb.where('need.type = :typeProduct', { typeProduct: NeedTypeEnum.PRODUCT })
            .andWhere('need.status = :productStatus', {
              productStatus: ProductStatusEnum.PURCHASED_PRODUCT,
            })
            .orWhere('need.type = :typeService', { typeService: NeedTypeEnum.SERVICE })
            .andWhere('need.status = :serviceStatus', {
              serviceStatus: ServiceStatusEnum.MONEY_TO_NGO,
            });
        }),
      )
      .andWhere('need.created_by_id = :created_by_id', {
        created_by_id: socialWorker,
      })
      // .where(
      //   new Brackets((qb) => {
      //     qb.where('need_status_updates.old_status = 2')
      //       .andWhere('need_status_updates.new_status = 3')
      //       .orWhere(
      //         'need_status_updates.sw_id = :purchaser',
      //         { purchaser: purchaser },
      //       );
      //   }),
      // )
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
        'need_status_updates',

      ])
      .orderBy('need.created', 'DESC');
    return paginate<Need>(queryBuilder, options);
  }

  async getDeliveredNeeds(
    options: IPaginationOptions,
    socialWorker: number,
    auditor: number,
    purchaser: number,
    ngoId: number,
  ): Promise<Pagination<Need>> {
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

      .where(
        new Brackets((qb) => {
          qb.where('need.type = :typeProduct', { typeProduct: NeedTypeEnum.PRODUCT })
            .andWhere('need.status = :productStatus', {
              productStatus: ProductStatusEnum.DELIVERED,
            })
            .orWhere('need.type = :typeService', { typeService: NeedTypeEnum.SERVICE })
            .andWhere('need.status = :serviceStatus', {
              serviceStatus: ServiceStatusEnum.DELIVERED,
            });
        }),
      )
      .andWhere('need.created_by_id = :created_by_id', {
        created_by_id: socialWorker,
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
        'need_status_updates',

      ])
      .orderBy('need.created', 'DESC');
    return paginate<Need>(queryBuilder, options);
  }
}
