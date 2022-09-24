import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NeedEntity } from '../../entities/need.entity';
import { Repository } from 'typeorm';
import { ChildrenService } from '../children/children.service';
import { from, map, Observable } from 'rxjs';
import {
  Pagination,
  IPaginationOptions,
  paginate,
} from 'nestjs-typeorm-paginate';
import { PaymentService } from '../payment/payment.service';
import { UserService } from '../user/user.service';
import { UserEntity } from '../../entities/user.entity';
import { PaymentEntity } from '../../entities/payment.entity';
import { ServerError } from '../../filters/server-exception.filter';
import { ChildrenEntity } from '../../entities/children.entity';
import { NeedParameters } from '../../types/parameters/NeedParameters';

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
          isDeleted: false,
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

  async getNeedById(needId: number): Promise<NeedEntity> {
    const need = await this.needRepository.findOne({
      where: {
        needId: needId,
      },
      relations: {
        signatures: true,
        payments: true,
      },
    });
    return need;
  }

  createNeed(theChild: ChildrenEntity, needDetails: NeedParameters): Promise<NeedEntity> {
    const newNeed = this.needRepository.create({
      child: theChild,
      needId: needDetails.needId,
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
      doing_duration: needDetails.doing_duration,
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


  async updateSyncedNeed(
    theNeed: NeedEntity,
    // request: NeedInterface,
    participants: UserEntity[],
    payments: PaymentEntity[],
  ): Promise<NeedEntity> {
    // if (paymentList) {
    //   for (let k = 0; k < paymentList.length; k++) {
    //     let user = await this.paymentService.getUser(
    //       participants[k].userId,
    //     );
    //     if (!user) {
    //       user = await this.userService.createUser(participants[k]);
    //     }
    //     // check if participants already saved
    //     const array1 = participants;
    //     const array2 = theNeed.participants || [];
    //     const isSame =
    //       array1.length == array2.length &&
    //       array1.every(function (element, index) {
    //         return element === array2[index];
    //       });
    //     // add users which are not saved
    //     if (!isSame && array1[0]) {
    //       const userId = participants[k].userId; //Element to be searched
    //       for (let i = 0; i < participants.length; i++) {
    //         if (userId === participants[i].userId) {
    //           theNeed.participants = [...participants, user];
    //           from(this.needRepository.update(theNeed.id, request));
    //         }
    //       }
    //     }
    //   }
    //   const need = await this.getNeedById(request.needId);
    //   need.participants = participants;
    //   this.needRepository.save(need)
    //   return need;
    // }
    // if (participants) {
    //   for (let k = 0; k < participants.length; k++) {
    //     // check if participants already saved
    //     let user = await this.userService.getUser(
    //       participants[k].userId,
    //     );
    //     if (!user) {
    //       user = await this.userService.createUser(participants[k]);
    //     }
    //     theNeed.participants = [...participants, user];
    //     from(this.needRepository.update(theNeed.id, request));
    //   }
    // }
    if (payments) {
      theNeed.payments = payments;
    }
    if (participants) {
      theNeed.participants = participants;
    }
    try {
      this.needRepository.save(theNeed);
      return theNeed;
    } catch (e) {
      // dapp api error when child is not created yet
      throw new ServerError(e);
    }
  }

}