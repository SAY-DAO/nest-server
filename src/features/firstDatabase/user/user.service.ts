import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import {
  AllUserEntity,
  ContributorEntity,
  FamilyEntity,
} from '../../../entities/user.entity';
import { SocialWorkerAPIApi, SwMyPage } from 'src/generated-sources/openapi';
import {
  ContributorParams,
  FamilyParams,
} from 'src/types/parameters/UserParameters';
import { SocialWorkerModel } from 'src/generated-sources/openapi';
import { NgoEntity } from 'src/entities/ngo.entity';
import { id } from 'ethers';
import { SAYPlatformRoles } from 'src/types/interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(FamilyEntity)
    private familyRepository: Repository<FamilyEntity>,
    @InjectRepository(ContributorEntity)
    private contributorRepository: Repository<ContributorEntity>,
    @InjectRepository(AllUserEntity)
    private allUserRepository: Repository<AllUserEntity>,
  ) { }

  getUsers(): Promise<AllUserEntity[]> {
    return this.allUserRepository.find();
  }

  getFamilies(): Promise<FamilyEntity[]> {
    return this.familyRepository.find();
  }


  getContributors(): Promise<ContributorEntity[]> {
    return this.contributorRepository.find();
  }


  getMyPage(
    accessToken: any,
    X_SKIP: number,
    X_TAKE: number,
    swId: number,
    isUser: number,
  ): Promise<SwMyPage> {
    let needs: Promise<SwMyPage>;
    const socialWorkerApi = new SocialWorkerAPIApi();
    // when 0 displays all children when 1 shows children/needs  created by them
    if (isUser === 0) {
      needs = socialWorkerApi.apiV2SocialworkersMyPageGet(
        accessToken,
        X_SKIP,
        X_TAKE,
        swId,
      );
    } else if (isUser === 1) {
      needs = socialWorkerApi.apiV2SocialworkersMyPageGet(
        accessToken,
        X_SKIP,
        X_TAKE,
      );
    }
    return needs;
  }

  createContributor(
    userDetails: ContributorParams,
    ngo: NgoEntity | null,
  ): Promise<ContributorEntity> {
    const newUser = this.contributorRepository.create({
      ...userDetails,
      ngo: ngo,
      role: userDetails.role,
    });
    return this.contributorRepository.save(newUser);
  }

  createFamily(
    userDetails: FamilyParams,
  ): Promise<FamilyEntity> {
    if (userDetails.role === SAYPlatformRoles.FAMILY) {
      const newUser = this.familyRepository.create({
        ...userDetails,
        role: userDetails.role,
      });
      return this.familyRepository.save({ id: newUser.id, ...newUser });
    } else {

    }
  }

  async updateContributor(
    userId: string,
    userDetails: ContributorParams,
  ): Promise<UpdateResult> {
    return this.contributorRepository.update(userId, {
      ...userDetails,
    });
  }

  async updateFamily(
    userId: string,
    userDetails: FamilyParams
  ): Promise<UpdateResult> {
    return this.familyRepository.update(userId, {
      ...userDetails,
    });
  }

  // async getFlaskContributor(accessToken: any, flaskSwId: number): Promise<SocialWorkerModel> {
  //   const swApi = new SocialWorkerAPIApi();
  //   return await swApi.apiV2SocialworkersIdGet(accessToken, flaskSwId);
  // }
  
  getContributorByFlaskId(flaskSwId: number): Promise<ContributorEntity> {
    const contributor = this.contributorRepository.findOne({
      where: {
        flaskId: flaskSwId,
      },
    });
    return contributor;
  }

  getFamilyByFlaskId(flaskFamilyId: number): Promise<FamilyEntity> {
    const familyMember = this.familyRepository.findOne({
      where: {
        flaskId: flaskFamilyId,
      },
    });
    return familyMember;
  }
  getUserById(id: string): Promise<AllUserEntity> {
    const user = this.allUserRepository.findOne({
      where: {
        id: id,
      },
    });
    return user;
  }

}
