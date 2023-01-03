import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NeedEntity } from '../../entities/need.entity';
import { Repository, UpdateResult } from 'typeorm';
import { from, map, Observable } from 'rxjs';
import {
  Pagination,
  IPaginationOptions,
  paginate,
} from 'nestjs-typeorm-paginate';
import { Configuration, NeedAPIApi, PreneedAPIApi, PreneedSummary, PublicAPIApi, PublicNeed } from "../../generated-sources/openapi";
import { ChildrenEntity } from '../../entities/children.entity';
import { NeedParams } from '../../types/parameters/NeedParameters';
import { PaymentEntity } from '../../entities/payment.entity';
import { FamilyEntity } from '../../entities/user.entity';
import { ReceiptEntity } from '../../entities/receipt.entity';
import { HeaderOptions, NeedApiParams } from 'src/types/interface';
import { NeedDto, NeedsDataDto } from 'src/types/dtos/CreateNeed.dto';

@Injectable()
export class NeedService {
  constructor(
    @InjectRepository(NeedEntity)
    private needRepository: Repository<NeedEntity>,
  ) { }

  async getRandomNeed(
  ): Promise<PublicNeed> {
    const configuration = new Configuration({
      basePath: "https://api.s.sayapp.company",
    });

    const publicApi = new PublicAPIApi(configuration, "https://api.s.sayapp.company",
      (url: "https://api.s.sayapp.company/api"): Promise<Response> => {
        console.log(url)
        return fetch(url)
      });

    const need: Promise<PublicNeed> = publicApi.apiV2PublicRandomNeedGet().then((r) => r
    ).catch((e) => e)

    return need;
  }

  async getNeeds(options: HeaderOptions, params: NeedApiParams
  ): Promise<NeedsDataDto> {
    const publicApi = new NeedAPIApi();
    console.log(options.accessToken, options.X_SKIP, options.X_TAKE, params.ngoId)

    const needs: Promise<NeedsDataDto> = publicApi.apiV2NeedsGet(options.accessToken, options.X_SKIP, options.X_TAKE, params.isConfirmed, params.isDone, params.isReported, params.status, params.type, params.ngoId).then((r) => r
    ).catch((e) => e)
    return needs;
  }




  async getLastNeed(): Promise<NeedEntity> {
    const lastNeed = await this.needRepository.findOne({
      where: {
        isDeleted: false,
        isConfirmed: true,
      },
      select: ['id', 'createdAt', 'socialWorker', 'title',],
      order: { createdAt: "DESC" },
    })
    return lastNeed;
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

  createNeed(
    theChild: ChildrenEntity,
    needDetails: NeedParams,
    receiptList?: ReceiptEntity[],
    paymentList?: PaymentEntity[],
    participantList?: FamilyEntity[],
  ): Promise<NeedEntity> {
    const newNeed = this.needRepository.create({
      child: theChild,
      flaskChildId: needDetails.flaskChildId,
      flaskNeedId: needDetails.flaskNeedId,
      flaskNgoId: needDetails.flaskNgoId,
      flaskSupervisorId: needDetails.flaskSupervisorId,
      title: needDetails.title,
      affiliateLinkUrl: needDetails.affiliateLinkUrl,
      link: needDetails.link,
      bankTrackId: needDetails.bankTrackId,
      category: needDetails.category,
      childGeneratedCode: needDetails?.childGeneratedCode,
      childSayName: needDetails.childSayName,
      childDeliveryDate:
        needDetails.childDeliveryDate &&
        new Date(needDetails.childDeliveryDate),
      confirmDate:
        needDetails.confirmDate && new Date(needDetails?.confirmDate),
      supervisor: needDetails.supervisor,
      cost: needDetails.cost,
      created: needDetails.created && new Date(needDetails?.created),
      socialWorker: needDetails.socialWorker,
      flaskSwId: needDetails.flaskSwId,
      deletedAt: needDetails.deletedAt && new Date(needDetails?.deletedAt),
      description: needDetails.description, // { en: '' , fa: ''}
      descriptionTranslations: needDetails.descriptionTranslations, // { en: '' , fa: ''}
      titleTranslations: needDetails.titleTranslations,
      details: needDetails.details,
      doingDuration: needDetails.doingDuration,
      donated: needDetails.donated,
      doneAt: needDetails.doneAt && new Date(needDetails?.doneAt),
      expectedDeliveryDate:
        needDetails.expectedDeliveryDate &&
        new Date(needDetails?.expectedDeliveryDate),
      information: needDetails.information,
      isConfirmed: needDetails.isConfirmed,
      isDeleted: needDetails.isDeleted,
      isDone: needDetails.isDone,
      isReported: needDetails.isReported,
      isUrgent: needDetails.isUrgent,
      ngo: needDetails.ngo,
      ngoAddress: needDetails.ngoAddress,
      ngoName: needDetails.ngoName,
      ngoDeliveryDate:
        needDetails.ngoDeliveryDate && new Date(needDetails?.ngoDeliveryDate),
      oncePurchased: needDetails.oncePurchased,
      paid: needDetails.paid,
      purchaseCost: needDetails.purchaseCost,
      purchaseDate:
        needDetails.purchaseDate && new Date(needDetails?.purchaseDate),
      receiptCount: needDetails.receiptCount,
      status: needDetails.status,
      statusDescription: needDetails.statusDescription,
      statusUpdatedAt:
        needDetails.statusUpdatedAt && new Date(needDetails?.statusUpdatedAt),
      type: needDetails.type,
      typeName: needDetails.typeName,
      unavailableFrom:
        needDetails.unavailableFrom && new Date(needDetails?.unavailableFrom),
      unconfirmedAt:
        needDetails.unconfirmedAt && new Date(needDetails?.unconfirmedAt),
      unpaidCost: needDetails.unpaidCost,
      unpayable: needDetails.unpayable,
      unpayableFrom:
        needDetails.unpayableFrom && new Date(needDetails?.unpayableFrom),
      updated: needDetails.updated && new Date(needDetails?.updated),
      imageUrl: needDetails.imageUrl,
      needRetailerImg: needDetails.needRetailerImg,
      progress: needDetails?.progress,
    });
    newNeed.participants = participantList;
    newNeed.payments = paymentList;
    newNeed.receipts = receiptList;
    return this.needRepository.save(newNeed);
  }

  updateSyncNeed(
    need: NeedEntity,
    updateNeedDetails: NeedParams,
    receiptList?: ReceiptEntity[],
    paymentList?: PaymentEntity[],
    participantList?: FamilyEntity[],
  ): Promise<UpdateResult> {
    need.payments = paymentList;
    need.participants = participantList;
    need.receipts = receiptList;
    this.needRepository.save(need);
    return this.needRepository.update(
      { id: need.id },
      { ...updateNeedDetails },
    );
  }

  getPreNeed(accessToken: any): Promise<PreneedSummary> {
    const preneedApi = new PreneedAPIApi()
    const preneeds = preneedApi.apiV2PreneedsGet(accessToken)
    return preneeds
  }


  async getSupervisorConfirmedNeeds(flaskSwId: number,
    options: IPaginationOptions,
  ): Promise<Observable<Pagination<NeedEntity>>> {
    return from(
      paginate<NeedEntity>(this.needRepository, options, {
        relations: {
          payments: true,
          receipts: true,
          child: true,
          provider: true,
          supervisor: true
        },
        where: {
          isDeleted: false,
          isConfirmed: true,
          flaskSupervisorId: flaskSwId
        },
      }),
    ).pipe(map((needs: Pagination<NeedEntity>) => needs));
  }

}
