import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NeedEntity } from '../../entities/need.entity';
import { Repository } from 'typeorm';
import { ChildrenService } from '../children/children.service';
import { from, map, Observable } from 'rxjs';
import { SyncRequest } from '../../types/requests/SyncRequest';
import { NeedInterface } from '../../entities/interface/need-entry.interface';
import {
  Pagination,
  IPaginationOptions,
  paginate,
} from 'nestjs-typeorm-paginate';
import { PaymentService } from '../payment/payment.service';
import { UserService } from '../user/user.service';
import { UserEntity } from '../../entities/user.entity';
import { ObjectNotFound } from '../../filters/notFound-expectation.filter';

@Injectable()
export class NeedService {
  constructor(
    @InjectRepository(NeedEntity)
    private needRepository: Repository<NeedEntity>,
    private childrenService: ChildrenService,
    private userService: UserService,
    private paymentService: PaymentService,
  ) { }

  getNeeds(options: IPaginationOptions): Observable<Pagination<NeedEntity>> {
    return from(
      paginate<NeedEntity>(this.needRepository, options, {
        relations: ['child', 'participants'],
      }),
    ).pipe(map((needs: Pagination<NeedEntity>) => needs));
  }

  async GetNeedById(needId: number): Promise<NeedEntity> {
    const need = await this.needRepository.findOne({
      where: {
        needId: needId,
      },
      relations: {
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
    theNeed: NeedEntity,
    request: NeedInterface,
    participants: UserEntity[],
  ): Promise<NeedEntity> {
    if (participants) {
      for (let k = 0; k < participants.length; k++) {
        let user = await this.userService.getUser(
          participants[k].userId,
        );
        if (!user) {
          user = await this.userService.createUser(participants[k]);
        }
        // check if participants already saved
        const array1 = participants;
        const array2 = theNeed.participants || [];
        const isSame =
          array1.length == array2.length &&
          array1.every(function (element, index) {
            return element === array2[index];
          });
        // add users which are not saved
        if (!isSame && array1[0]) {
          const userId = participants[k].userId; //Element to be searched
          for (let i = 0; i < participants.length; i++) {
            if (userId === participants[i].userId) {
              console.log('Element Found');
              console.log(user.userId)
              console.log(user.avatarUrl)
              console.log(theNeed.participants)
              console.log('thisNeed')
              theNeed.participants = [...participants, user];
              from(this.needRepository.update(theNeed.id, request));
            }
          }
        }
      }
    }

    const need = await this.GetNeedById(request.needId);
    need.participants = participants;
    this.needRepository.save(need)
    return need;
  }

  async syncNeeds(request: SyncRequest): Promise<NeedEntity[]> {
    const list = [];
    for (let i = 0; i < request.needData.length; i++) {
      let newNeed = {}
      const participantList = [];

      // 1- Child
      let theChild = await this.childrenService.GetChildById(
        request.needData[i].childId || request.childId,
      );

      if (!theChild) {
        const requestToInterface = {
          childId: request.childId || request.childData[i].childId, // dapp || panel
          sleptAvatarUrl: request.childData && request.childData[i].sleptAvatarUrl,
          awakeAvatarUrl: request.childData && request.childData[i].awakeAvatarUrl,
          bio: request.childData && request.childData[i].bio,
          bioSummary: request.childData && request.childData[i].bioSummary,
          bioSummaryTranslations: request.childData && request.childData[i].bioSummaryTranslations,
          bioTranslations: request.childData && request.childData[i].bioTranslations,
          birthDate: request.childData && new Date(request.childData[i].birthDate),
          birthPlace: request.childData && request.childData[i].birthPlace,
          city: request.childData && request.childData[i].city,
          confirmDate: request.childData && new Date(request.childData[i].confirmDate),
          confirmUser: request.childData && request.childData[i].confirmUser,
          country: request.childData && request.childData[i].country,
          created: request.childData && new Date(request.childData[i].created),
          doneNeedsCount: request.childData && request.childData[i].doneNeedsCount,
          education: request.childData && request.childData[i].education,
          existence_status: request.childData && request.childData[i].existence_status,
          familyCount: request.childData && request.childData[i].familyCount,
          generatedCode: request.childData && request.childData[i].generatedCode,
          housingStatus: request.childData && request.childData[i].housingStatus,
          ngoId: request.childData && request.childData[i].ngoId,
          idSocialWorker: request.childData && request.childData[i].idSocialWorker,
          isConfirmed: request.childData && request.childData[i].isConfirmed,
          isDeleted: request.childData && request.childData[i].isDeleted,
          isMigrated: request.childData && request.childData[i].isMigrated,
          isGone: request.childData && request.childData[i].isGone,
          migrateDate: request.childData && new Date(request.childData[i].migrateDate),
          migratedId: request.childData && request.childData[i].migratedId,
          nationality: request.childData && request.childData[i].nationality,
          sayFamilyCount: request.childData && request.childData[i].sayFamilyCount,
          sayName: request.childData && request.childData[i].sayName,
          sayname_translations: request.childData && request.childData[i].sayname_translations,
          status: request.childData && request.childData[i].status,
          updated: request.childData && new Date(request.childData[i].updated),
          voiceUrl: request.childData && request.childData[i].voiceUrl
        };
        theChild = await this.childrenService.createChild(requestToInterface);
      }

      // 2- Participants - from need summery api
      for (let k = 0; k < request.needData[i]?.participants?.length; k++) {
        const requestToInterface = {
          userId: request.needData[i].participants[k].id_user,
          avatarUrl: request.needData[i].participants[k].user_avatar,
        };
        let user = await this.userService.getUser(
          request.needData[i].participants[k].id_user,
        );

        if (!user) {
          user = await this.userService.createUser(requestToInterface);
        }
        participantList.push(user);
      }

      // 3- Need
      const thisNeed = await this.needRepository.findOne({
        where: {
          needId: request.needData[i].needId,
        },
      });

      newNeed = {
        child: theChild,
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
      }
      
      // if already created update
      if (thisNeed) {
        const requestToInterface = {
          ...newNeed,
          child: thisNeed.child,
        };

        const updatedNeed = this.updateSyncedNeed(
          thisNeed,
          requestToInterface,
          participantList,
        );
        list.push(updatedNeed);
        continue;
      }


      console.log(participantList)



      const need = await this.needRepository.save(newNeed);
      need.participants = participantList;
      this.needRepository.save(need)
      list.push(need);
    }

    return list;
  }
}
