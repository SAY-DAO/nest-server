import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { ChildrenEntity } from '../../entities/children.entity';
import {
  ChildAPIApi,
  ChildModel,
  NeedModel,
} from 'src/generated-sources/openapi';
import { ChildApiParams, HeaderOptions } from 'src/types/interface';
import { ChildrenData } from 'src/types/interfaces/Children';
import { NeedSummary } from 'src/types/interfaces/Need';
import { ChildParams } from 'src/types/parameters/ChildParameters';
import { NgoEntity } from 'src/entities/ngo.entity';
import { AllUserEntity, ContributorEntity } from 'src/entities/user.entity';

@Injectable()
export class ChildrenService {
  constructor(
    @InjectRepository(ChildrenEntity)
    private childrenRepository: Repository<ChildrenEntity>,
  ) { }

  async getAllFlaskChildren(
    options: HeaderOptions,
    params: ChildApiParams,
  ): Promise<ChildrenData> {
    const childApi = new ChildAPIApi();
    const needs = childApi.apiV2ChildAllConfirmconfirmGet(
      options.accessToken,
      params.confirm,
      params.ngoId,
      params.swId,
      options.X_TAKE,
      options.X_SKIP,
      params.existenceStatus,
    );
    return needs;
  }

  async getFlaskChild(
    accessToken: string,
    childId: number,
  ): Promise<ChildModel> {
    const childApi = new ChildAPIApi();
    const child = childApi.apiV2ChildChildIdchildIdconfirmconfirmGet(
      accessToken,
      childId,
      2,
    );
    return child;
  }

  async getChildNeedsSummery(
    accessToken: any,
    childId: number,
  ): Promise<NeedSummary> {
    const childApi = new ChildAPIApi();
    const needs = childApi.apiV2ChildChildIdNeedsSummaryGet(
      accessToken,
      childId,
    );
    return needs;
  }

  createChild(childDetails: ChildParams, ngo: NgoEntity, socialWorker: ContributorEntity): Promise<ChildrenEntity> {
    const newChild = this.childrenRepository.create({
      ...childDetails,
      ngo: ngo,
      socialWorker: socialWorker
    });
    return this.childrenRepository.save({ id: newChild.id, ...newChild });
  }

  updateChild(
    childDetails: ChildParams,
    child: ChildrenEntity
  ): Promise<UpdateResult> {
    return this.childrenRepository.update(
      { id: child.id },
      { ...childDetails },
    );
  }

  getChildren(): Promise<ChildrenEntity[]> {
    return this.childrenRepository.find();
  }

  getChildById(flaskId: number): Promise<ChildrenEntity> {
    const child = this.childrenRepository.findOne({
      where: {
        flaskId: flaskId,
      },
    });
    return child;
  }
}
