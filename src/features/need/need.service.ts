import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NeedEntity } from '../../entities/need.entity';
import { Repository, UpdateResult } from 'typeorm';
import { ChildrenService } from '../children/children.service';
import { from, map, Observable } from 'rxjs';
import {
  Pagination,
  IPaginationOptions,
  paginate,
} from 'nestjs-typeorm-paginate';
import { PaymentService } from '../payment/payment.service';
import { UserService } from '../user/user.service';
import { ChildrenEntity } from '../../entities/children.entity';
import { NeedParams } from 'src/types/parameters/NeedParameters';
import { PaymentParams } from 'src/types/parameters/PaymentParams';
import { UserParams } from 'src/types/parameters/UserParameters';
import { PaymentEntity } from 'src/entities/payment.entity';
import { UserEntity } from 'src/entities/user.entity';

@Injectable()
export class NeedService {
  constructor(
    @InjectRepository(NeedEntity)
    private needRepository: Repository<NeedEntity>,
    private childrenService: ChildrenService,
    private userService: UserService,
    private paymentService: PaymentService,
  ) { }

  async getNeeds(
    options: IPaginationOptions,
  ): Promise<Observable<Pagination<NeedEntity>>> {
    return from(
      paginate<NeedEntity>(this.needRepository, options, {
        relations: ['child', 'participants'],
        where: {
          // isDeleted: false,
          // isDone: true
        },
      }),
    ).pipe(map((needs: Pagination<NeedEntity>) => needs));
  }

  async getDoneNeeds(): Promise<NeedEntity[]> {
    const doneNeeds = await this.needRepository.find({
      where: {
        isDone: true,
      },
    });
    return doneNeeds;
  }

  async getNeedById(flaskNeedId: number): Promise<NeedEntity> {
    const need = await this.needRepository.findOne({
      where: {
        flaskNeedId: flaskNeedId,
      },
      relations: {
        signatures: true,
        payments: true,
      },
    });
    return need;
  }

  createNeed(theChild: ChildrenEntity, needDetails: NeedParams): Promise<NeedEntity> {
    const newNeed = this.needRepository.create({
      child: theChild,
      flaskChildId: needDetails.flaskChildId,
      flaskNeedId: needDetails.flaskNeedId,
      title: needDetails.title,
      affiliateLinkUrl: needDetails.affiliateLinkUrl,
      bankTrackId: needDetails.bankTrackId,
      category: needDetails.category,
      childGeneratedCode: needDetails?.childGeneratedCode,
      childSayName: needDetails.childSayName,
      childDeliveryDate:
        needDetails.childDeliveryDate &&
        new Date(needDetails.childDeliveryDate),
      confirmDate:
        needDetails.confirmDate &&
        new Date(needDetails?.confirmDate),
      confirmUser: needDetails.confirmUser,
      cost: needDetails.cost,
      created:
        needDetails.created && new Date(needDetails?.created),
      createdById: needDetails.createdById,
      deletedAt:
        needDetails.deletedAt &&
        new Date(needDetails?.deletedAt),
      description: needDetails.description, // { en: '' , fa: ''}
      descriptionTranslations: needDetails.descriptionTranslations, // { en: '' , fa: ''}
      titleTranslations: needDetails.titleTranslations,
      details: needDetails.details,
      doingDuration: needDetails.doingDuration,
      donated: needDetails.donated,
      doneAt:
        needDetails.doneAt && new Date(needDetails?.doneAt),
      expectedDeliveryDate:
        needDetails.expectedDeliveryDate &&
        new Date(needDetails?.expectedDeliveryDate),
      information: needDetails.information,
      isConfirmed: needDetails.isConfirmed,
      isDeleted: needDetails.isDeleted,
      isDone: needDetails.isDone,
      isReported: needDetails.isReported,
      isUrgent: needDetails.isUrgent,
      ngoId: needDetails.ngoId,
      ngoAddress: needDetails.ngoAddress,
      ngoName: needDetails.ngoName,
      ngoDeliveryDate:
        needDetails.ngoDeliveryDate &&
        new Date(needDetails?.ngoDeliveryDate),
      oncePurchased: needDetails.oncePurchased,
      paid: needDetails.paid,
      purchaseCost: needDetails.purchaseCost,
      purchaseDate:
        needDetails.purchaseDate &&
        new Date(needDetails?.purchaseDate),
      receiptCount: needDetails.receiptCount,
      receipts: needDetails.receipts,
      status: needDetails.status,
      statusDescription: needDetails.statusDescription,
      statusUpdatedAt:
        needDetails.statusUpdatedAt &&
        new Date(needDetails?.statusUpdatedAt),
      type: needDetails.type,
      typeName: needDetails.typeName,
      unavailableFrom:
        needDetails.unavailableFrom &&
        new Date(needDetails?.unavailableFrom),
      unconfirmedAt:
        needDetails.unconfirmedAt &&
        new Date(needDetails?.unconfirmedAt),
      unpaidCost: needDetails.unpaidCost,
      unpayable: needDetails.unpayable,
      unpayableFrom:
        needDetails.unpayableFrom &&
        new Date(needDetails?.unpayableFrom),
      updated:
        needDetails.updated && new Date(needDetails?.updated),
      imageUrl: needDetails.imageUrl,
      needRetailerImg: needDetails.needRetailerImg,
      progress: needDetails?.progress,
    });
    return this.needRepository.save(newNeed);
  }

  updateSyncNeed(
    need: NeedEntity,
    updateNeedDetails: NeedParams,
    paymentList: PaymentEntity[],
    participantList: UserEntity[]

  ): Promise<UpdateResult> {
    need.payments = paymentList
    need.participants = participantList
    this.needRepository.save(need)
    return this.needRepository.update({ id: need.id }, { ...updateNeedDetails });

  }

}