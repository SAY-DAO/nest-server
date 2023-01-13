import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChildrenEntity } from '../../entities/children.entity';
import { ChildAPIApi, NeedModel } from 'src/generated-sources/openapi';
import { ChildApiParams, HeaderOptions } from 'src/types/interface';
import { ChildrenData } from 'src/types/interfaces/Children';
import { NeedSummary } from 'src/types/interfaces/Need';

@Injectable()
export class ChildrenService {
  constructor(
    @InjectRepository(ChildrenEntity)
    private childrenRepository: Repository<ChildrenEntity>,
  ) { }

  async getAllChildren(options: HeaderOptions,
    params: ChildApiParams,
  ): Promise<ChildrenData> {
    const childApi = new ChildAPIApi();
    console.log(params)
    const needs = childApi.apiV2ChildAllConfirmconfirmGet(options.accessToken,
      params.confirm,
      params.ngoId,
      params.swId,
      options.X_TAKE,
      options.X_SKIP,
      params.existenceStatus)
    return needs;
  }


  async getChildNeedsSummeay(accessToken: any, childId: number
  ): Promise<NeedSummary> {
    const childApi = new ChildAPIApi();
    const needs = childApi.apiV2ChildChildIdNeedsSummaryGet(accessToken, childId)
    return needs;
  }

}
