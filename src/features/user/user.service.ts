import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { AllUserEntity } from '../../entities/user.entity';
import { UserParams } from 'src/types/parameters/UserParameters';
import { NgoEntity } from 'src/entities/ngo.entity';
import { SocialWorker, User } from 'src/entities/flaskEntities/user.entity';
import { getSAYRoleString } from 'src/utils/helpers';
import { PanelContributors } from 'src/types/interfaces/interface';
import { ContributorEntity } from 'src/entities/contributor.entity';
import { from } from 'rxjs';
import { EthereumAccountEntity } from 'src/entities/ethereum.account.entity';

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
    private flaskSocialWorkerRepository: Repository<SocialWorker>,
    @InjectRepository(User, 'flaskPostgres')
    private flaskUserRepository: Repository<User>,
  ) {}

  getFlaskSws(): Promise<SocialWorker[]> {
    return this.flaskSocialWorkerRepository.find();
  }

  getFlaskSwIds(): Promise<SocialWorker[]> {
    return this.flaskSocialWorkerRepository.find({
      select: {
        id: true,
      },
    });
  }

  getFlaskSocialWorker(id: number): Promise<SocialWorker> {
    return this.flaskSocialWorkerRepository.findOne({
      where: { id: id },
    });
  }

  getFlaskUser(id: number): Promise<SocialWorker> {
    return this.flaskUserRepository.findOne({
      where: { id: id },
    });
  }

  getFlaskSocialWorkerByNgo(ngoId: number): Promise<SocialWorker[]> {
    return this.flaskSocialWorkerRepository.find({
      where: { ngo_id: ngoId },
    });
  }

  getUsers(): Promise<AllUserEntity[]> {
    return this.allUserRepository.find();
  }

  getFlaskUsers(): Promise<User[]> {
    return this.flaskUserRepository.find();
  }

  getContributors(): Promise<AllUserEntity[]> {
    return this.allUserRepository.find({
      where: {
        isContributor: true,
      },
    });
  }

  createUserWallet(
    address: string,
    chainId: number,
    user: AllUserEntity,
  ): Promise<EthereumAccountEntity> {
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

      const theUser = await this.allUserRepository.save({
        ...userDetails,
        flaskUserId: userDetails.flaskUserId,
        isContributor: true,
      });

      if (userDetails.panelRole >= PanelContributors.NO_ROLE) {
        console.log('\x1b[33m%s\x1b[0m', 'Creating a contribution ...\n');
        const newContribution = this.contributorRepository.create({
          flaskUserId: userDetails.flaskUserId,
          flaskNgoId: ngo.flaskNgoId,
          ngo: ngo,
          panelRole: userDetails.panelRole,
          panelRoleName: getSAYRoleString(userDetails.panelRole),
          user: theUser,
        });

        await this.contributorRepository.save(newContribution);
        console.log('\x1b[33m%s\x1b[0m', 'Saved a contribution ...\n');
      }
      return await this.getUserByFlaskId(userDetails.flaskUserId);
    } else if (
      theUser &&
      userDetails.panelRole >= PanelContributors.NO_ROLE &&
      theUser.contributions &&
      !theUser.contributions.find((c) => c.panelRole == userDetails.panelRole)
    ) {
      console.log('\x1b[36m%s\x1b[0m', 'Updating a user ...');
      console.log('\x1b[33m%s\x1b[0m', 'Creating a contribution ...\n');
      const newContribution = this.contributorRepository.create({
        flaskUserId: userDetails.flaskUserId,
        flaskNgoId: ngo.flaskNgoId,
        ngo: ngo,
        panelRole: userDetails.panelRole,
        panelRoleName: getSAYRoleString(userDetails.panelRole),
        user: theUser,
      });
      const theContribution = await this.contributorRepository.save(
        newContribution,
      );
      console.log('\x1b[33m%s\x1b[0m', 'Saved a contribution ...\n');
      theUser.contributions = [...theUser.contributions, theContribution];
      await this.allUserRepository.save(theUser);
      return await this.getUserByFlaskId(userDetails.flaskUserId);
    } else if (
      theUser.contributions &&
      theUser.contributions.find((c) => c.panelRole == userDetails.panelRole)
    ) {
      const theUserDetails = this.allUserRepository.create({
        typeId: userDetails.typeId,
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
        avatarUrl: userDetails.avatarUrl,
        flaskUserId: userDetails.flaskUserId,
        birthDate: userDetails.birthDate,
        userName: userDetails.userName,
      });

      await this.updateContributor(theUser.id, theUserDetails);
      return await this.getUserByFlaskId(userDetails.flaskUserId);
    }
  }

  async updateContributor(
    userId: string,
    userDetails: UserParams,
  ): Promise<UpdateResult> {
    if (userDetails.panelRole >= PanelContributors.NO_ROLE) {
      const theUSer = await this.allUserRepository.update(userId, {
        typeId: userDetails.typeId,
        birthDate: userDetails.birthDate,
        flaskUserId: userDetails.flaskUserId,
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
        avatarUrl: userDetails.avatarUrl,
        userName: userDetails.userName,
      });
      const updatedUser = await this.getUserByFlaskId(userDetails.flaskUserId);

      if (
        !updatedUser.contributions.find(
          (c) => c.panelRole == userDetails.panelRole,
        )
      ) {
        const contribution = this.contributorRepository.create({
          flaskUserId: userDetails.flaskUserId,
          panelRole: userDetails.panelRole,
          panelRoleName: getSAYRoleString(userDetails.panelRole),
          user: updatedUser,
        });

        await this.contributorRepository.save(contribution);
      }

      return theUSer;
    }
  }

  async createFamily(flaskUserId: number): Promise<AllUserEntity> {
    const flaskUser = await this.flaskUserRepository
      .createQueryBuilder('user')
      .where('user.id = :userId', { userId: flaskUserId })
      .getOne();

    const userDetails: UserParams = {
      birthDate: flaskUser.birthDate,
      flaskUserId: flaskUser.flaskUserId,
      isActive: flaskUser.isActive,
      wallet: flaskUser.wallet,
      firstName: flaskUser.firstName,
      lastName: flaskUser.lastName,
      avatarUrl: flaskUser.avatarUrl,
      userName: flaskUser.userName,
    };
    const newUser = this.allUserRepository.create({
      ...userDetails,
      flaskUserId: flaskUserId,
      isContributor: false,
    });
    return this.allUserRepository.save({ id: newUser.id, ...newUser });
  }

  async updateFamily(
    userId: string,
    flaskUserId: number,
  ): Promise<UpdateResult> {
    const flaskUser = await this.flaskUserRepository
      .createQueryBuilder('user')
      .where('user.id = :userId', { userId: flaskUserId })
      .getOne();

    const userDetails: UserParams = {
      birthDate: flaskUser.birthDate,
      flaskUserId: flaskUser.flaskUserId,
      isActive: flaskUser.isActive,
      wallet: flaskUser.wallet,
      firstName: flaskUser.firstName,
      lastName: flaskUser.lastName,
      avatarUrl: flaskUser.avatarUrl,
      userName: flaskUser.userName,
    };
    return this.allUserRepository.update(userId, {
      ...userDetails,
      flaskUserId: userDetails.flaskUserId,
      isContributor: false,
    });
  }

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

  getUserByFlaskId(flaskId: number): Promise<AllUserEntity> {
    const user = this.allUserRepository.findOne({
      where: {
        flaskUserId: flaskId,
      },
    });
    return user;
  }

  async deleteOneContributor(userId: string, contIds: string[]) {
    for await (const id of contIds) {
      from(this.contributorRepository.delete(id));
    }
    return from(this.allUserRepository.delete(userId));
  }
}
