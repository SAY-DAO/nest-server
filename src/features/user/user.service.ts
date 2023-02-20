import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SocialWorkerEntity, FamilyEntity } from '../../entities/user.entity';
import { SocialWorkerAPIApi, SwMyPage } from 'src/generated-sources/openapi';
import { SocialWorkerParams } from 'src/types/parameters/UserParameters';
import { SocialWorkerModel } from 'src/generated-sources/openapi';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(FamilyEntity)
    private FamilyRepository: Repository<FamilyEntity>,
    @InjectRepository(SocialWorkerEntity)
    private socialWorkerRepository: Repository<SocialWorkerEntity>
  ) { }

  getMyPage(accessToken: any, X_SKIP: number, X_TAKE: number, swId: number, isUser: number
  ): Promise<SwMyPage> {
    let needs: Promise<SwMyPage>
    const socialWorkerApi = new SocialWorkerAPIApi();
    // when 0 displays all children when 1 shows children/needs  created by them
    if (isUser === 0) {
      needs = socialWorkerApi.apiV2SocialworkersMyPageGet(accessToken, X_SKIP, X_TAKE, swId)
    } else if (isUser === 1) {
      needs = socialWorkerApi.apiV2SocialworkersMyPageGet(accessToken, X_SKIP, X_TAKE)

    }
    return needs;
  }

  createSocialWorker(userDetails: SocialWorkerParams): Promise<SocialWorkerEntity> {
    const newUser = this.socialWorkerRepository.create({
      flaskSwId: userDetails.flaskSwId,
      avatarUrl: userDetails.avatarUrl,
      role: userDetails.role
      // isActive: userDetails.isActive,
    });
    return this.socialWorkerRepository.save(newUser);
  }

  getFlaskSw(accessToken: any, flaskSwId: number): Promise<SocialWorkerModel> {
    const ngoApi = new SocialWorkerAPIApi();
    const ngo = ngoApi.apiV2SocialworkersIdGet(accessToken, flaskSwId);
    return ngo;
  }

  getSw(flaskSwId: number): Promise<SocialWorkerEntity> {
    const ngo = this.socialWorkerRepository.findOne({
      where: {
        flaskSwId: flaskSwId,
      },
    });
    return ngo;
  }

}
