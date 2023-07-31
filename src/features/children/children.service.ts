import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { ChildrenEntity } from '../../entities/children.entity';
import { ChildAPIApi } from 'src/generated-sources/openapi';
import { NeedSummary } from 'src/types/interfaces/Need';
import { ChildParams } from 'src/types/parameters/ChildParameters';
import { NgoEntity } from 'src/entities/ngo.entity';
import { ContributorEntity } from 'src/entities/contributor.entity';
import { Child } from 'src/entities/flaskEntities/child.entity';
import {
  VirtualFamilyRole,
  childExistence,
} from 'src/types/interfaces/interface';
import { Family } from 'src/entities/flaskEntities/family.entity';
import { UserFamily } from 'src/entities/flaskEntities/userFamily.entity';
import { User } from 'src/entities/flaskEntities/user.entity';
import { Payment } from 'src/entities/flaskEntities/payment.entity';
import { Need } from 'src/entities/flaskEntities/need.entity';

@Injectable()
export class ChildrenService {
  constructor(
    @InjectRepository(ChildrenEntity)
    private childrenRepository: Repository<ChildrenEntity>,
    @InjectRepository(Child, 'flaskPostgres')
    private flaskChildRepository: Repository<Child>,
    @InjectRepository(Family, 'flaskPostgres')
    private flaskFamilyRepository: Repository<Family>,
    @InjectRepository(User, 'flaskPostgres')
    private flaskUserRepository: Repository<User>,
  ) {}

  async countChildren(ngoIds: number[]) {
    return this.flaskChildRepository
      .createQueryBuilder('child')
      .select(['child'])
      .where('child.isConfirmed = :childConfirmed', { childConfirmed: true })
      .andWhere('child.isDeleted = :childDeleted', { childDeleted: false })
      .andWhere('child.isMigrated = :childIsMigrated', {
        childIsMigrated: false,
      })
      .andWhere('child.existence_status IN (:...existenceStatus)', {
        existenceStatus: [childExistence.AlivePresent],
      })
      .andWhere('child.id_ngo IN (:...ngoIds)', {
        ngoIds: [...ngoIds],
      })
      .getCount();
  }

  getFlaskChild(flaskChildId: number) {
    return this.flaskChildRepository.findOne({
      where: { id: flaskChildId },
    });
  }

  async getFlaskChildren() {
    return await this.flaskChildRepository
      .createQueryBuilder('child')
      .getMany();
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

  createChild(
    childDetails: ChildParams,
    ngo: NgoEntity,
    socialWorker: ContributorEntity,
  ): Promise<ChildrenEntity> {
    const newChild = this.childrenRepository.create({
      ...childDetails,
      ngo: ngo,
      socialWorker: socialWorker,
      flaskSwId: socialWorker.flaskUserId,
      flaskNgoId: ngo.flaskNgoId,
    });

    return this.childrenRepository.save({ ...newChild });
  }

  updateChild(
    childDetails: ChildParams,
    child: ChildrenEntity,
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
      relations: { ngo: true },
      where: {
        flaskId: flaskId,
      },
    });
    return child;
  }

  async getFamilyMembers(familyId: number): Promise<any> {
    return await this.flaskFamilyRepository
      .createQueryBuilder('family')
      .innerJoinAndMapMany(
        'family.members',
        UserFamily,
        'userFamily',
        'userFamily.id_family = family.id',
      )
      .where('userFamily.id_family = :familyId', { familyId: familyId })
      .andWhere('userFamily.isDeleted = :isDeleted', { isDeleted: false })
      .select(['family', 'userFamily'])
      .getManyAndCount();
  }

  async getFamilyRoles(
    userId: number,
    vFamilyRole: VirtualFamilyRole,
  ): Promise<any> {
    return await this.flaskUserRepository
      .createQueryBuilder('user')
      .leftJoinAndMapMany(
        'user.payments',
        Payment,
        'payment',
        'payment.id_user = user.id',
      )
      .leftJoinAndMapOne(
        'payment.need',
        Need,
        'need',
        'need.id = payment.id_need',
      )
      .leftJoinAndMapOne(
        'need.child',
        Child,
        'child',
        'child.id = need.child_id',
      )
      .leftJoinAndMapMany(
        'user.user_families',
        UserFamily,
        'userFamily',
        'userFamily.id_user = user.id',
      )
      .leftJoinAndMapOne(
        'userFamily.family',
        Family,
        'family',
        'family.id = userFamily.id_family',
      )
      .where('user.id = :userId', { userId: userId })
      .andWhere('need.isDeleted = :isNeedDeleted', { isNeedDeleted: false })
      .andWhere('userFamily.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('userFamily.flaskFamilyRole = :flaskFamilyRole', {
        flaskFamilyRole: vFamilyRole,
      })
      .andWhere('payment.id_user = :userId', { userId: userId })
      .andWhere('payment.id_need IS NOT NULL')
      .andWhere('payment.id IS NOT NULL')
      .andWhere('payment.verified IS NOT NULL')
      .andWhere('payment.order_id IS NOT NULL')
      .andWhere('child.id_ngo NOT IN (:...testNgoIds)', {
        testNgoIds: [3, 14],
      })
      // .select([
      //   'user.id',
      //   'payment',
      //   'need.id',
      //   'need.child_id',
      //   'user.userName',
      //   'family',
      //   'userFamily',
      // ])
      .getMany();
  }
}
