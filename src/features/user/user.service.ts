import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { AllUserEntity } from '../../entities/user.entity';
import { UserParams } from 'src/types/parameters/UserParameters';
import { NgoEntity } from 'src/entities/ngo.entity';
import { EthereumAccountEntity } from 'src/entities/ethereum.account.entity';
import { SocialWorker, User } from 'src/entities/flaskEntities/user.entity';
import { getSAYRoleString } from 'src/utils/helpers';
import {
  PanelContributors,
  SAYPlatformRoles,
} from 'src/types/interfaces/interface';
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
    private flaskSocialWorker: Repository<SocialWorker>,
    @InjectRepository(User, 'flaskPostgres')
    private flaskUser: Repository<User>,
  ) { }

  getFlaskSws(): Promise<SocialWorker[]> {
    return this.flaskSocialWorker.find();
  }

  getFlaskSwIds(): Promise<SocialWorker[]> {
    return this.flaskSocialWorker.find({
      select: {
        id: true,
      },
    });
  }

  getFlaskSocialWorker(id: number): Promise<SocialWorker> {
    return this.flaskSocialWorker.findOne({
      where: { id: id },
    });
  }

  getFlaskSocialWorkerByNgo(ngoId: number): Promise<SocialWorker[]> {
    return this.flaskSocialWorker.find({
      where: { ngo_id: ngoId },
    });
  }

  getUsers(): Promise<AllUserEntity[]> {
    return this.allUserRepository.find();
  }

  getFlaskUsers(): Promise<User[]> {
    return this.flaskUser.find();
  }

  getContributors(): Promise<AllUserEntity[]> {
    return this.allUserRepository.find({
      where: {
        isContributor: true,
      },
    });
  }

  // getMyPage(
  //   accessToken: any,
  //   X_SKIP: number,
  //   X_TAKE: number,
  //   swId: number,
  //   isUser: number,
  // ): Promise<SwMyPage> {
  //   let needs: Promise<SwMyPage>;
  //   const socialWorkerApi = new SocialWorkerAPIApi();
  //   // when 0 displays all children when 1 shows children/needs  created by them
  //   if (isUser === 0) {
  //     needs = socialWorkerApi.apiV2SocialworkersMyPageGet(
  //       accessToken,
  //       X_SKIP,
  //       X_TAKE,
  //       swId,
  //     );
  //   } else if (isUser === 1) {
  //     needs = socialWorkerApi.apiV2SocialworkersMyPageGet(
  //       accessToken,
  //       X_SKIP,
  //       X_TAKE,
  //     );
  //   }
  //   return needs;
  // }

  createUserWallet(
    address: string,
    chainId: number,
    user: AllUserEntity,
  ): Promise<EthereumAccountEntity> {
    console.log(user);
    const newWallet = this.ethereumWalletRepository.create({
      address,
      chainId,
      user,
    });
    return this.ethereumWalletRepository.save(newWallet);
  }

  async createContributor(
    userDetails: UserParams,
    ngo: NgoEntity,
  ): Promise<AllUserEntity> {

    const theUser = await this.getUserByFlaskId(userDetails.flaskUserId);
    if (!theUser) {
      console.log('\x1b[36m%s\x1b[0m', 'Creating a user ...');

      const newUser = this.allUserRepository.create({
        ...userDetails,
        flaskUserId: userDetails.flaskUserId,
        isContributor: true,
      });
      const theUser = await this.allUserRepository.save(newUser);
      if (userDetails.panelRole >= PanelContributors.NO_ROLE) {
        console.log('\x1b[33m%s\x1b[0m', 'Creating a contribution ...\n');
        const newContribution = this.contributorRepository.create({
          flaskUserId: userDetails.flaskUserId,
          flaskNgoId: ngo.flaskNgoId,
          ngo: ngo,
          panelRole: userDetails.panelRole,
          panelRoleName: getSAYRoleString(userDetails.panelRole),
          user: theUser
        });

        await this.contributorRepository.save(
          newContribution,
        );
        console.log('\x1b[33m%s\x1b[0m', 'Saved a contribution ...\n');
      }
      return theUser
    } else if (theUser && userDetails.panelRole >= PanelContributors.NO_ROLE && theUser.contributions && !theUser.contributions.find(c => c.panelRole == userDetails.panelRole)) {
      console.log('\x1b[36m%s\x1b[0m', 'Updating a user ...');
      console.log('\x1b[33m%s\x1b[0m', 'Creating a contribution ...\n');
      const newContribution = this.contributorRepository.create({
        flaskUserId: userDetails.flaskUserId,
        flaskNgoId: ngo.flaskNgoId,
        ngo: ngo,
        panelRole: userDetails.panelRole,
        panelRoleName: getSAYRoleString(userDetails.panelRole),
        user: theUser
      });
      const theContribution = await this.contributorRepository.save(
        newContribution,
      );
      console.log('\x1b[33m%s\x1b[0m', 'Saved a contribution ...\n');
      theUser.contributions = [...theUser.contributions, theContribution];
      await this.allUserRepository.save(theUser);
      return await this.getUserByFlaskId(userDetails.flaskUserId);
    }
  }

  async updateContributor(
    userId: string,
    userDetails: UserParams,
  ): Promise<UpdateResult> {
    const user = this.allUserRepository.create({
      ...userDetails,
      isContributor: true,
    });

    const theUSer = await this.allUserRepository.update(userId, {
      ...user,
    });
    const updatedUser = await this.getUserByFlaskId(userDetails.flaskUserId)



    if (userDetails.panelRole >= PanelContributors.NO_ROLE && !updatedUser.contributions.find(c => c.panelRole == userDetails.panelRole)) {
      const contribution = this.contributorRepository.create({
        flaskUserId: userDetails.flaskUserId,
        panelRole: userDetails.panelRole,
        panelRoleName: getSAYRoleString(userDetails.panelRole),
        user: user,
      });

      await this.contributorRepository.save(contribution);
    }

    return theUSer;
  }

  createFamily(userDetails: UserParams): Promise<AllUserEntity> {
    if (userDetails.panelRole == PanelContributors.NO_ROLE) {
      const newUser = this.allUserRepository.create({
        ...userDetails,
        flaskUserId: userDetails.flaskUserId,
        isContributor: false,
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
    });
  }

  async updateFamily(
    userId: string,
    userDetails: UserParams,
  ): Promise<UpdateResult> {
    if (userDetails.panelRole == PanelContributors.NO_ROLE) {
      const { panelRole, ...others } = userDetails;
      return this.allUserRepository.update(userId, {
        ...others,
        flaskUserId: userDetails.flaskUserId,
      });
    }
  }

  // async getFlaskContributor(accessToken: any, flaskSwId: number): Promise<SocialWorkerModel> {
  //   const swApi = new SocialWorkerAPIApi();
  //   return await swApi.apiV2SocialworkersIdGet(accessToken, flaskSwId);
  // }

  getContributorByFlaskId(
    flaskSwId: number,
    panelRole: PanelContributors,
  ): Promise<AllUserEntity> {
    const user = this.allUserRepository.findOne({
      where: {
        flaskUserId: flaskSwId,
        isContributor: true,
        contributions: {
          panelRole,
        },
      },
    });
    return user;
  }

  getFamilyByFlaskId(flaskFamilyId: number): Promise<AllUserEntity> {
    const familyMember = this.allUserRepository.findOne({
      where: {
        flaskUserId: flaskFamilyId,
        isContributor: false,
      },
    });
    return familyMember;
  }
  getUserById(id: string): Promise<AllUserEntity> {
    const user = this.allUserRepository.findOne({
      where: {
        id: id,
      },
      relations: {
        contributions: {
          createdNeeds: true,
        },
      },
    });
    return user;
  }

  getUserByFlaskId(flaskId: number): Promise<AllUserEntity> {
    const user = this.allUserRepository.findOne({
      where: {
        flaskUserId: flaskId,
      },
    });
    return user;
  }
}
