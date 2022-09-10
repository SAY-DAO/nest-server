import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NeedEntity } from '../../entities/need.entity';
import { Repository, UpdateResult } from 'typeorm';
import { UserService } from '../user/user.service';
import { ChildrenService } from '../children/children.service';
import { from, map, Observable, switchMap } from 'rxjs';
import { SyncRequest } from '../../types/requests/SyncRequest';
import { NeedRequest } from 'src/types/requests/NeedRequest';
import { NeedInterface } from 'src/entities/interface/need-entry.interface';
import { Pagination, IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { UserEntity } from 'src/entities/user.entity';


@Injectable()
export class NeedService {
  constructor(
    @InjectRepository(NeedEntity)
    private needRepository: Repository<NeedEntity>,
    private userService: UserService,
    private childrenService: ChildrenService,
  ) { }

  getNeeds(options: IPaginationOptions): Observable<Pagination<NeedEntity>> {
    return from(paginate<NeedEntity>(this.needRepository, options, {
      relations: ['child']
    })).pipe(map((needs: Pagination<NeedEntity>) => needs))
  }



  async GetNeedById(needId: number): Promise<NeedEntity> {
    const need = await this.needRepository.findOne({
      where: {
        needId: needId,
      },
      relations: {
        participants: true,
        signatures: true,
      },
    });
    return need;
  }

  async getChildNeeds(childId: number): Promise<NeedEntity[]> {
    const theChild = await this.childrenService.GetChildById(childId);
    return theChild.needs;
  }

  async updateSyncedNeed(
    id: string,
    request: NeedInterface,
    participants: UserEntity[]
  ): Promise<NeedEntity> {
    if (request.participants && request.participants.length) {
      for (let k = 0; k < request.participants?.length; k++) {
        let user = await this.userService.getUser(
          request.participants[k].userId,
        );
        if (!user) {
          user = await this.userService.createUser(request.participants[k]);
        }
        // check if participants already saved
        const array1 = request.participants;
        const array2 = request.participants;
        const isSame =
          array1.length == array2.length &&
          array1.every(function (element, index) {
            return element === array2[index];
          });
        // add users which are not saved
        if (!isSame && array1[0]) {
          const userId = request.participants[k].userId; //Element to be searched
          for (let i = 0; i < request.participants.length; i++) {
            if (userId === request.participants[i].userId) {
              console.log('Element Found');
              request.participants = [...request.participants, user];
              this.needRepository.update(id, request);
            }
          }
        }
      }
    } else if (request.payments && request.payments.length) {
      for (let k = 0; k < request.payments?.length; k++) {
        let user = await this.userService.getUser(
          request.payments[k].user.userId,
        );
        if (!user) {
          user = await this.userService.createUser(request.payments[k].user);
        }
        // check if payments already saved
        const array1 = request.payments;
        const array2 = request.payments;
        const isSame =
          array1.length == array2.length &&
          array1.every(function (element, index) {
            return element === array2[index];
          });
        // add users which are not saved
        if (!isSame && array1[0]) {
          const userId = request.participants[k].userId; //Element to be searched
          for (let i = 0; i < request.participants.length; i++) {
            if (userId === request.participants[i].userId) {
              console.log('Element Found');
              request.participants = [...request.participants, user];
              this.needRepository.update(id, request);
            }
          }
        }
      }
      // from(this.needRepository.update(id, request)).pipe(
      //   switchMap(() => this.GetNeedById(request.needId))
      // )
    }
    console.log(request)
    const updated = from(this.needRepository.update(id, request))
    const need = await this.GetNeedById(request.needId)
    need.participants = participants
    console.log(need)
    console.log(participants)
    return need;
  }

  async syncNeeds(request: SyncRequest): Promise<NeedEntity[]> {
    const list = [];


    for (let i = 0; i < request.needData.length; i++) {
      const participantList = [];
      const paymentList = [];
      const theChild = await this.childrenService.GetChildById(
        request.needData[i].childId,
      );

      const thisNeed = await this.needRepository.findOne({
        where: {
          needId: request.needData[i].needId,
        },
        relations: {
          participants: true,
          signatures: true,
        },
      });

      for (let k = 0; k < request.needData[i]?.participants?.length; k++) {
        const requestToInterface = {
          userId: request.needData[i].participants[k].id_user,
          avatarUrl: request.needData[i].participants[k].user_avatar,
        }
        let user = await this.userService.getUser(
          request.needData[i].participants[k].id_user,
        );
        if (!user) {
          user = await this.userService.createUser(
            requestToInterface,
          );
        }
        participantList.push(user);
      }

      for (let k = 0; k < request.needData[i]?.payments?.length; k++) {
        // let payment = await this.paymentService.getPayment(
        //   request.needData[i].payments[k],
        // );
        // if (!payment) {
        //   payment = await this.paymentService.createPayment(
        //     request.needData[i].payments[k],
        //   );
        // }
        // paymentList.push(payment);
      }


      // if already created only update
      if (thisNeed) {
        const updateData = {
          title: request.needData[i]?.title,
          affiliateLinkUrl: request.needData[i]?.affiliateLinkUrl,
          bankTrackId: request.needData[i]?.bankTrackId,
          category: request.needData[i]?.category,
          childGeneratedCode: request.needData[i]?.childGeneratedCode,
          childSayName: request.needData[i]?.childSayName,
          childDeliveryDate: request.needData[i]?.childDeliveryDate,
          confirmDate: request.needData[i]?.confirmDate,
          confirmUser: request.needData[i]?.confirmUser,
          cost: request.needData[i]?.cost,
          created: request.needData[i]?.created,
          createdById: request.needData[i]?.createdById,
          deleted_at: request.needData[i]?.deleted_at,
          description: request.needData[i]?.description,
          descriptionTranslations: request.needData[i].descriptionTranslations && { en: request.needData[i].descriptionTranslations.en, fa: request.needData[i].descriptionTranslations.fa },
          details: request.needData[i]?.details,
          doing_duration: request.needData[i]?.doing_duration,
          donated: request.needData[i]?.donated,
          doneAt: request.needData[i]?.doneAt,
          expectedDeliveryDate: request.needData[i]?.expectedDeliveryDate,
          imageUrl: request.needData[i]?.imageUrl,
          needRetailerImg: request.needData[i]?.needRetailerImg,
          informations: request.needData[i]?.informations,
          isConfirmed: request.needData[i]?.isConfirmed,
          isDeleted: request.needData[i]?.isDeleted,
          isDone: request.needData[i]?.isDone,
          isReported: request.needData[i]?.isReported,
          isUrgent: request.needData[i]?.isUrgent,
          link: request.needData[i]?.link,
          titleTranslations: request.needData[i].titleTranslations && { en: request.needData[i].titleTranslations.en, fa: request.needData[i].titleTranslations.fa },
          ngoAddress: request.needData[i]?.ngoAddress,
          ngoId: request.needData[i]?.ngoId,
          ngoName: request.needData[i]?.ngoName,
          ngoDeliveryDate: request.needData[i]?.ngoDeliveryDate,
          oncePurchased: request.needData[i]?.oncePurchased,
          paid: request.needData[i]?.paid,
          progress: request.needData[i]?.progress,
          purchaseCost: request.needData[i]?.purchaseCost,
          purchaseDate: request.needData[i]?.purchaseDate,
          receiptCount: request.needData[i]?.receiptCount,
          receipts: request.needData[i]?.receipts,
          status: request.needData[i]?.status,
          statusDescription: request.needData[i]?.statusDescription,
          statusUpdatedAt: request.needData[i]?.statusUpdatedAt,
          type: request.needData[i]?.type,
          typeName: request.needData[i]?.typeName,
          unavailableFrom: request.needData[i]?.unavailableFrom,
          unconfirmedAt: request.needData[i]?.unconfirmedAt,
          unpaidCost: request.needData[i]?.unpaidCost,
          unpayable: request.needData[i]?.unpayable,
          unpayableFrom: request.needData[i]?.unpayableFrom,
          updated: request.needData[i]?.updated,
          // payments: paymentList,
        }
        const requestToInterface = {
          ...updateData,
          child: thisNeed.child,
          // participants: participantList
        }

        const updatedNeed = this.updateSyncedNeed(
          thisNeed.id,
          requestToInterface,
          participantList
        );
        list.push(updatedNeed);
        continue;
      }

      const need = await this.needRepository.save({
        needId: request.needData[i].needId,
        title: request.needData[i].title,
        affiliateLinkUrl: request.needData[i].affiliateLinkUrl,
        bankTrackId: request.needData[i].bankTrackId,
        category: request.needData[i].category,
        childGeneratedCode: request.needData[i]?.childGeneratedCode,
        childSayName: request.needData[i].childSayName,
        childDeliveryDate:
          request.needData[i].childDeliveryDate &&
          new Date(request.needData[i].childDeliveryDate),
        child: theChild,
        confirmDate:
          request.needData[i].confirmDate &&
          new Date(request.needData[i]?.confirmDate),
        confirmUser: request.needData[i].confirmUser,
        cost: request.needData[i].cost,
        created:
          request.needData[i].created && new Date(request.needData[i]?.created),
        createdById: request.needData[i].createdById,
        deleted_at:
          request.needData[i].deleted_at &&
          new Date(request.needData[i]?.deleted_at),
        description: request.needData[i].description, // { en: '' , fa: ''}
        descriptionTranslations: request.needData[i].descriptionTranslations, // { en: '' , fa: ''}
        titleTranslations: request.needData[i].titleTranslations,
        details: request.needData[i].details,
        doing_duration: request.needData[i].doing_duration,
        donated: request.needData[i].donated,
        doneAt:
          request.needData[i].doneAt && new Date(request.needData[i]?.doneAt),
        expectedDeliveryDate:
          request.needData[i].expectedDeliveryDate &&
          new Date(request.needData[i]?.expectedDeliveryDate),
        informations: request.needData[i].informations,
        isConfirmed: request.needData[i].isConfirmed,
        isDeleted: request.needData[i].isDeleted,
        isDone: request.needData[i].isDone,
        isReported: request.needData[i].isReported,
        isUrgent: request.needData[i].isUrgent,
        ngoId: request.needData[i].ngoId,
        ngoAddress: request.needData[i].ngoAddress,
        ngoName: request.needData[i].ngoName,
        ngoDeliveryDate:
          request.needData[i].ngoDeliveryDate &&
          new Date(request.needData[i]?.ngoDeliveryDate),
        oncePurchased: request.needData[i].oncePurchased,
        paid: request.needData[i].paid,
        purchaseCost: request.needData[i].purchaseCost,
        purchaseDate:
          request.needData[i].purchaseDate &&
          new Date(request.needData[i]?.purchaseDate),
        receiptCount: request.needData[i].receiptCount,
        receipts: request.needData[i].receipts,
        status: request.needData[i].status,
        statusDescription: request.needData[i].statusDescription,
        statusUpdatedAt:
          request.needData[i].statusUpdatedAt &&
          new Date(request.needData[i]?.statusUpdatedAt),
        type: request.needData[i].type,
        typeName: request.needData[i].typeName,
        unavailableFrom:
          request.needData[i].unavailableFrom &&
          new Date(request.needData[i]?.unavailableFrom),
        unconfirmedAt:
          request.needData[i].unconfirmedAt &&
          new Date(request.needData[i]?.unconfirmedAt),
        unpaidCost: request.needData[i].unpaidCost,
        unpayable: request.needData[i].unpayable,
        unpayableFrom:
          request.needData[i].unpayableFrom &&
          new Date(request.needData[i]?.unpayableFrom),
        updated:
          request.needData[i].updated && new Date(request.needData[i]?.updated),
        imageUrl: request.needData[i].imageUrl,
        needRetailerImg: request.needData[i].needRetailerImg,
      });

      list.push(need);

      // need.payments = [request.needData[i].payments.bank_amount];tm
    }



    return list;
  }
}
