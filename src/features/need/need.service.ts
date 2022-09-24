import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NeedEntity } from '../../entities/need.entity';
import { Repository } from 'typeorm';
import { ChildrenService } from '../children/children.service';
import { from, map, Observable } from 'rxjs';
import { SyncRequestDto } from '../../types/dtos/SyncRequest.dto';
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
import { AllExceptionsFilter } from '../../filters/all-exception.filter';
import { ObjectNotFound } from '../../filters/notFound-expectation.filter';
import { NeedInterface } from '../../entities/interface/need-entry.interface';
import { ChildrenEntity } from '../../entities/children.entity';
import { ObjectForbidden } from '../../filters/forbidden-exception.filter';

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

  async getChildNeeds(childId: number): Promise<NeedEntity[]> {
    const theChild = await this.childrenService.getChildById(childId);
    return theChild.needs;
  }

  async createNeed(request: NeedInterface): Promise<NeedEntity> {
    const thisNeed = await this.needRepository.findOne({
      where: {
        needId: request.needId,
      },
    });
    if (!thisNeed) {
      const theChild = await this.childrenService.getChildById(request.childId);
      const saved = await this.needRepository.save({
        child: theChild,
        needId: request.needId,
        title: request.title,
        affiliateLinkUrl: request.affiliateLinkUrl,
        bankTrackId: request.bankTrackId,
        category: request.category,
        childGeneratedCode: request?.childGeneratedCode,
        childSayName: request.childSayName,
        childDeliveryDate:
          request.childDeliveryDate &&
          new Date(request.childDeliveryDate),
        confirmDate:
          request.confirmDate &&
          new Date(request?.confirmDate),
        confirmUser: request.confirmUser,
        cost: request.cost,
        created:
          request.created && new Date(request?.created),
        createdById: request.createdById,
        deleted_at:
          request.deleted_at &&
          new Date(request?.deleted_at),
        description: request.description, // { en: '' , fa: ''}
        descriptionTranslations: request.descriptionTranslations, // { en: '' , fa: ''}
        titleTranslations: request.titleTranslations,
        details: request.details,
        doing_duration: request.doing_duration,
        donated: request.donated,
        doneAt:
          request.doneAt && new Date(request?.doneAt),
        expectedDeliveryDate:
          request.expectedDeliveryDate &&
          new Date(request?.expectedDeliveryDate),
        information: request.information,
        isConfirmed: request.isConfirmed,
        isDeleted: request.isDeleted,
        isDone: request.isDone,
        isReported: request.isReported,
        isUrgent: request.isUrgent,
        ngoId: request.ngoId,
        ngoAddress: request.ngoAddress,
        ngoName: request.ngoName,
        ngoDeliveryDate:
          request.ngoDeliveryDate &&
          new Date(request?.ngoDeliveryDate),
        oncePurchased: request.oncePurchased,
        paid: request.paid,
        purchaseCost: request.purchaseCost,
        purchaseDate:
          request.purchaseDate &&
          new Date(request?.purchaseDate),
        receiptCount: request.receiptCount,
        receipts: request.receipts,
        status: request.status,
        statusDescription: request.statusDescription,
        statusUpdatedAt:
          request.statusUpdatedAt &&
          new Date(request?.statusUpdatedAt),
        type: request.type,
        typeName: request.typeName,
        unavailableFrom:
          request.unavailableFrom &&
          new Date(request?.unavailableFrom),
        unconfirmedAt:
          request.unconfirmedAt &&
          new Date(request?.unconfirmedAt),
        unpaidCost: request.unpaidCost,
        unpayable: request.unpayable,
        unpayableFrom:
          request.unpayableFrom &&
          new Date(request?.unpayableFrom),
        updated:
          request.updated && new Date(request?.updated),
        imageUrl: request.imageUrl,
        needRetailerImg: request.needRetailerImg,
        progress: request?.progress,
      });
      return saved;
    } else {
      return thisNeed;

    }
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

  async syncNeeds(request: SyncRequestDto): Promise<NeedEntity[]> {
    const list = [];
    let theChild: ChildrenEntity;

    for (let i = 0; i < request.needData.length; i++) {
      const participantList = [];
      const paymentList = [];

      // 1- Child

      try {
        theChild = await this.childrenService.getChildById(
          request.needData[i].childId,
        );
      } catch (e) {
        throw new AllExceptionsFilter(e);
      }
      console.log(theChild)
      if (!theChild) {
        // when child is not created yet
        throw new ObjectForbidden(
          `Child ${request.childId} should be fetched from panel!`,
        );
      }
      console.log("fddddddddddddddddddddddddddddddddddddddddddd")

      if (request.needData[i].isDone) {
        // 2- Participants - from need summery api
        for (let k = 0; k < request.needData[i]?.participants?.length; k++) {
          let user = await this.userService.getUser(
            request.needData[i].participants[k].id_user,
          );
          if (!user) {
            const requestToInterface = {
              userId: request.needData[i].participants[k].id_user,
              avatarUrl: request.needData[i].participants[k].user_avatar,
            };
            try {
              user = await this.userService.createUser(requestToInterface);
            } catch (e) {
              throw new AllExceptionsFilter(e);
            }
          }
          participantList.push(user);
        }
        // 3- payments - from done needs
        for (let k = 0; k < request.needData[i]?.payments?.length; k++) {
          let user = await this.userService.getUser(
            request.needData[i].payments[k].id_user,
          );
          if (!user) {
            const requestToInterface = {
              userId: request.needData[i].payments[k].id_user,
            };
            try {
              user = await this.userService.createUser(requestToInterface);
            } catch (e) {
              throw new AllExceptionsFilter(e);
            }
          }
          if (!user) {
            throw new ObjectNotFound(
              `User ${request.needData[i].payments[k].id_user} was not found!`,
            );
          }
          let payment = await this.paymentService.getPayment(
            request.needData[i].payments[k].id,
          );
          if (!payment) {
            const requestToInterface2 = {
              id_user: request.needData[i].payments[k].id_user,
              bank_amount: request.needData[i].payments[k].bank_amount,
              card_no: request.needData[i].payments[k].card_no,
              cart_payment_id: request.needData[i].payments[k].cart_payment_id,
              created:
                request.needData[i].payments[k] &&
                new Date(request.needData[i].payments[k].created),
              credit_amount: request.needData[i].payments[k].credit_amount,
              desc: request.needData[i].payments[k].desc,
              donation_amount: request.needData[i].payments[k].donation_amount,
              gateway_payment_id:
                request.needData[i].payments[k].gateway_payment_id,
              gateway_track_id:
                request.needData[i].payments[k].gateway_track_id,
              hashed_card_no: request.needData[i].payments[k].hashed_card_no,
              id: request.needData[i].payments[k].id,
              id_need: request.needData[i].payments[k].id_need,
              link: request.needData[i].payments[k].link,
              need_amount: request.needData[i].payments[k].need_amount,
              order_id: request.needData[i].payments[k].order_id,
              total_amount: request.needData[i].payments[k].total_amount,
              transaction_date:
                request.needData[i].payments[k] &&
                new Date(request.needData[i].payments[k].transaction_date),
              updated:
                request.needData[i].payments[k] &&
                new Date(request.needData[i].payments[k].updated),
              verified:
                request.needData[i].payments[k] &&
                new Date(request.needData[i].payments[k].verified),
            };
            try {
              payment = await this.paymentService.createPayment(
                requestToInterface2,
              );
            } catch (e) {
              throw new AllExceptionsFilter(e);
            }
          }

          paymentList.push(payment);
        }
      }

      // 4- Need
      const thisNeed = await this.needRepository.findOne({
        where: {
          needId: request.needData[i].needId,
        },
      });
      console.log('there')
      console.log(thisNeed)
      console.log('where')
      // if already created update
      if (thisNeed) {
        let updatedNeed: NeedEntity
        try {
          updatedNeed = await this.updateSyncedNeed(
            thisNeed,
            participantList,
            paymentList,
          );
        } catch (e) {
          throw new AllExceptionsFilter(e);
        }

        list.push(updatedNeed);
        continue;
      }
      // if not created save need
      let need: NeedEntity
      let newNeed: NeedInterface
      try {
        newNeed = {
          childId: request.needData[i].childId,
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
          information: request.needData[i].information,
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
          progress: request.needData[i]?.progress,
        };
        console.log('here')
        need = await this.createNeed(
          newNeed
        );

      } catch (e) {
        console.log(e)
        throw new AllExceptionsFilter(e);
      }


      try {
        need = await this.needRepository.save(newNeed);
      } catch (e) {
        // dapp api error when child is not created yet
        throw new ServerError(e);
      }

      // 5- Save
      need.payments = paymentList;
      need.participants = participantList;
      try {
        this.needRepository.save(need);
        list.push(need);
      } catch (e) {
        // dapp api error when child is not created yet
        throw new ServerError(e);
      }
    }

    return list;
  }
}
