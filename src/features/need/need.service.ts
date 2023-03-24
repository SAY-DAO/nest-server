import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NeedEntity } from '../../entities/need.entity';
import { Need } from '../../entities/flaskEntities/need.entity';
import { Repository, UpdateResult } from 'typeorm';
import {
  Configuration,
  NeedAPIApi,
  PreneedAPIApi,
  PreneedSummary,
  PublicAPIApi,
  PublicNeed,
} from '../../generated-sources/openapi';
import { HeaderOptions, NeedApiParams } from 'src/types/interfaces/interface';
import { NeedsData } from 'src/types/interfaces/Need';
import { ChildrenEntity } from 'src/entities/children.entity';
import { NeedParams } from 'src/types/parameters/NeedParameters';
import { NgoEntity } from 'src/entities/ngo.entity';
import { StatusEntity } from 'src/entities/status.entity';
import { PaymentEntity } from 'src/entities/payment.entity';
import { ReceiptEntity } from 'src/entities/receipt.entity';
import { IpfsEntity } from 'src/entities/ipfs.entity';
import { ContributorEntity } from 'src/entities/contributor.entity';

@Injectable()
export class NeedService {
  constructor(
    @InjectRepository(Need, 'flaskPostgres')
    private flaskNeedRepository: Repository<Need>,
    @InjectRepository(NeedEntity)
    private needRepository: Repository<NeedEntity>,
  ) { }

  getFlaskIcon(id: number): Promise<Need> {
    return this.flaskNeedRepository.findOne(
      {
        where: {
          id: id
        }
      }
    );
  }



  getNeeds(): Promise<NeedEntity[]> {
    return this.needRepository.find(
      {
        relations: {
          child: true,
        },
      }
    );
  }

  getNeedById(needId: string): Promise<NeedEntity> {
    const user = this.needRepository.findOne({
      where: {
        id: needId,
      },
      relations: {
        verifiedPayments: true
      }
    });
    return user;
  }


  getNeedByFlaskId(flaskId: number): Promise<NeedEntity> {
    const user = this.needRepository.findOne({
      where: {
        flaskId: flaskId,
      },
      relations: {
        verifiedPayments: true
      }
    });
    return user;
  }

  updateNeedIpfs(
    needId,
    ipfs: IpfsEntity
  ): Promise<UpdateResult> {
    return this.needRepository.update(needId, {
      // ipfs: ipfs,
    });
  }

  updateNeed(
    needId: string,
    theChild: ChildrenEntity,
    theNgo: NgoEntity,
    theSw: ContributorEntity,
    theAuditor: ContributorEntity,
    thePurchaser: ContributorEntity,
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
    theSw: ContributorEntity,
    theAuditor: ContributorEntity,
    thePurchaser: ContributorEntity,
    needDetails: NeedParams,
    statusUpdates: StatusEntity[],
    verifiedPayments: PaymentEntity[],
    receipts: ReceiptEntity[],
  ): Promise<NeedEntity> {

    const newNeed = this.needRepository.create({
      child: theChild,
      socialWorker: theSw,
      auditor: theAuditor,
      purchaser: thePurchaser,
      ngo: theNgo,
      ...needDetails

    });
    newNeed.statusUpdates = statusUpdates;
    newNeed.verifiedPayments = verifiedPayments;
    newNeed.receipts = receipts;

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

  async getFlaskNeeds(
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

  getFlaskPreNeed(accessToken: any): Promise<PreneedSummary> {
    const preneedApi = new PreneedAPIApi();
    const preneeds = preneedApi.apiV2PreneedsGet(accessToken);
    return preneeds;
  }


}


