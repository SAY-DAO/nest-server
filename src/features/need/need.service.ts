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

}
