import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NeedEntity } from '../../entities/need.entity';
import { Repository } from 'typeorm';
import {
  Configuration,
  NeedAPIApi,
  PreneedAPIApi,
  PreneedSummary,
  PublicAPIApi,
  PublicNeed,
} from '../../generated-sources/openapi';
import { HeaderOptions, NeedApiParams } from 'src/types/interface';
import { NeedsData } from 'src/types/interfaces/Need';
import { ChildrenEntity } from 'src/entities/children.entity';
import { NeedParams } from 'src/types/parameters/NeedParameters';
import { ReceiptEntity } from 'src/entities/receipt.entity';
import { PaymentEntity } from 'src/entities/payment.entity';
import { FamilyEntity, SocialWorkerEntity } from 'src/entities/user.entity';
import { NgoEntity } from 'src/entities/ngo.entity';

@Injectable()
export class NeedService {
  constructor(
    @InjectRepository(NeedEntity)
    private needRepository: Repository<NeedEntity>,
  ) { }

  async getRandomNeed(): Promise<PublicNeed> {
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

  async getNeeds(
    options: HeaderOptions,
    params: NeedApiParams,
  ): Promise<NeedsData> {
    const publicApi = new NeedAPIApi();
    const needs: Promise<NeedsData> = publicApi
      .apiV2NeedsGet(
        options.accessToken,
        options.X_SKIP,
        options.X_TAKE,
        params.isConfirmed,
        params.isDone,
        params.isReported,
        params.status,
        params.type,
        params.ngoId,
        params.isChildConfirmed,
        params.unpayable,
        params.createdBy,
        params.confirmedBy,
        params.purchasedBy,
      )
    return needs;
  }


  getPreNeed(accessToken: any): Promise<PreneedSummary> {
    const preneedApi = new PreneedAPIApi();
    const preneeds = preneedApi.apiV2PreneedsGet(accessToken);
    return preneeds;
  }


  createNeed(
    theChild: ChildrenEntity,
    theNgo: NgoEntity,
    theSw,
    theAuditor: SocialWorkerEntity,
    thePurchaser: SocialWorkerEntity,
    needDetails: NeedParams,
  ): Promise<NeedEntity> {
    const newNeed = this.needRepository.create({
      child: theChild,
      flaskChildId: needDetails.flaskChildId,
      flaskNeedId: needDetails.flaskNeedId,
      flaskNgoId: needDetails.flaskNgoId,
      title: needDetails.title,
      affiliateLinkUrl: needDetails.affiliateLinkUrl,
      link: needDetails.link,
      bankTrackId: needDetails.bankTrackId,
      category: needDetails.category,
      confirmDate:
        needDetails.confirmDate && new Date(needDetails?.confirmDate),
      // auditor: needDetails.auditor,
      cost: needDetails.cost,
      created: needDetails.created && new Date(needDetails?.created),
      socialWorker:theSw,
      deletedAt: needDetails.deletedAt && new Date(needDetails?.deletedAt),
      description: needDetails.description, // { en: '' , fa: ''}
      descriptionTranslations: needDetails.descriptionTranslations, // { en: '' , fa: ''}
      titleTranslations: needDetails.titleTranslations,
      details: needDetails.details,
      doingDuration: needDetails.doingDuration,
      doneAt: needDetails.doneAt && new Date(needDetails?.doneAt),
      expectedDeliveryDate:
        needDetails.ngoDeliveryDate &&
        new Date(needDetails?.ngoDeliveryDate),
      isConfirmed: needDetails.isConfirmed,
      isDeleted: needDetails.isDeleted,
      isDone: needDetails.isDone,
      isUrgent: needDetails.isUrgent,
      ngo: theNgo,
      ngoDeliveryDate:
        needDetails.ngoDeliveryDate && new Date(needDetails?.ngoDeliveryDate),
      paid: needDetails.paid,
      purchaseCost: needDetails.purchaseCost,
      purchaseDate:
        needDetails.purchaseDate && new Date(needDetails?.purchaseDate),
      status: needDetails.status,
      type: needDetails.type,
      unpayable: needDetails.unpayable,
      unpayableFrom:
        needDetails.unpayableFrom && new Date(needDetails?.unpayableFrom),
      updated: needDetails.updated && new Date(needDetails?.updated),
      imageUrl: needDetails.imageUrl,
      needRetailerImg: needDetails.needRetailerImg,
    });
    // newNeed.participants = needDetails.participants;
    // newNeed.payments = needDetails.verifiedPayments;
    // newNeed.receipts = needDetails.receipts;
    return this.needRepository.save(newNeed);
  }

}
