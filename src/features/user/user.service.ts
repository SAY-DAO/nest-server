import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SocialWorkerEntity, FamilyEntity } from '../../entities/user.entity';
import { NeedModel, SocialWorkerAPIApi } from 'src/generated-sources/openapi';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(FamilyEntity)
    private FamilyRepository: Repository<FamilyEntity>,
    @InjectRepository(SocialWorkerEntity)
    private socialWorkerRepository: Repository<SocialWorkerEntity>
  ) { }

  getSwMyPage(accessToken: any, swId: number, pagination
  ): Promise<NeedModel[]> {
    const socialWorkerApi = new SocialWorkerAPIApi();
    const needs = socialWorkerApi.apiV2SocialworkersIdCreatedNeedsGet(accessToken, swId, pagination.X_SKIP, pagination.X_TAKE)
    return needs;
  }



}