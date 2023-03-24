import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import {
  AllUserEntity,
} from '../../entities/user.entity';
import { SocialWorkerAPIApi, SwMyPage } from 'src/generated-sources/openapi';
import {
  UserParams,
} from 'src/types/parameters/UserParameters';
import { NgoEntity } from 'src/entities/ngo.entity';
import { EthereumAccountEntity } from 'src/entities/ethereum.account.entity';
import { SocialWorker } from 'src/entities/flaskEntities/user.entity';
import { getSAYRoleString } from 'src/utils/helpers';
import { SAYPlatformRoles } from 'src/types/interfaces/interface';
import { ContributorEntity } from 'src/entities/contributor.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(ContributorEntity)
    private contributorRepository: Repository<ContributorEntity>,
    @InjectRepository(AllUserEntity)
    private allUserRepository: Repository<AllUserEntity>,
    @InjectRepository(EthereumAccountEntity)
    private ethereumWalletRepository: Repository<EthereumAccountEntity>,
    @InjectRepository(SocialWorker, 'flaskPostgres')
    private socialWorkerRepository: Repository<SocialWorker>,
  ) { }

  getSws(): Promise<SocialWorker[]> {
    return this.socialWorkerRepository.find();
  }

  getFlaskSocialWorker(id: number): Promise<SocialWorker> {
    return this.socialWorkerRepository.findOne({
      where: { id: id }
    });
  }

  getUsers(): Promise<AllUserEntity[]> {
    return this.allUserRepository.find();
  }

  getContributors(): Promise<AllUserEntity[]> {
    return this.allUserRepository.find({
      where: {
        isContributor: true
      }
    });
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

  createUserWallet(
    address: string,
    chainId: number,
    user: AllUserEntity
  ): Promise<EthereumAccountEntity> {
    console.log(user)
    const newWallet = this.ethereumWalletRepository.create({
      address,
      chainId,
      user
    });
    return this.ethereumWalletRepository.save(newWallet);
  }


  async createContributor(
    userDetails: UserParams,
    ngo: NgoEntity | null,
  ): Promise<AllUserEntity> {
    const newContributor = this.contributorRepository.create({
      flaskNgoId: ngo.flaskNgoId,
      ngo: ngo,
    });
    const contributor = await this.contributorRepository.save(newContributor);

    const newUser = this.allUserRepository.create({
      ...userDetails,
      role: userDetails.role,
      roleName: getSAYRoleString(userDetails.role),
      isContributor: true,
      contributor
      
    });

    return await this.allUserRepository.save(newUser);
  }

  createFamily(
    userDetails: UserParams,
  ): Promise<AllUserEntity> {
    if (userDetails.role === SAYPlatformRoles.FAMILY) {
      const newUser = this.allUserRepository.create({
        ...userDetails,
        role: userDetails.role,
        roleName: getSAYRoleString(userDetails.role),
        isContributor: false

      });
      return this.allUserRepository.save({ id: newUser.id, ...newUser });
    } else {

    }
  }

  async updateUser(
    userId: string,
    userDetails: UserParams,
  ): Promise<UpdateResult> {
    return this.allUserRepository.update(userId, {
      ...userDetails,
      roleName: getSAYRoleString(userDetails.role)
    });
  }
  async updateContributor(
    userId: string,
    userDetails: UserParams,
  ): Promise<UpdateResult> {
    return this.contributorRepository.update(userId, {
      ...userDetails,
    });
  }

  async updateFamily(
    userId: string,
    userDetails: UserParams
  ): Promise<UpdateResult> {
    return this.allUserRepository.update(userId, {
      ...userDetails,
      roleName: getSAYRoleString(userDetails.role)
    });
  }

  // async getFlaskContributor(accessToken: any, flaskSwId: number): Promise<SocialWorkerModel> {
  //   const swApi = new SocialWorkerAPIApi();
  //   return await swApi.apiV2SocialworkersIdGet(accessToken, flaskSwId);
  // }

  getContributorByFlaskId(flaskSwId: number): Promise<AllUserEntity> {
    const user = this.allUserRepository.findOne({
      where: {
        flaskId: flaskSwId,
        isContributor: true
      },
    });
    return user;
  }

  getFamilyByFlaskId(flaskFamilyId: number): Promise<AllUserEntity> {
    const familyMember = this.allUserRepository.findOne({
      where: {
        flaskId: flaskFamilyId,
        isContributor: false
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

  getUserByFlaskId(flaskId: number): Promise<AllUserEntity> {
    const user = this.allUserRepository.findOne({
      where: {
        flaskId: flaskId,
      },
    });
    return user;
  }
}
