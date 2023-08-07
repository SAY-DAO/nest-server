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
import { childExistence } from 'src/types/interfaces/interface';
import { UserFamily } from 'src/entities/flaskEntities/userFamily.entity';
import { Family } from 'src/entities/flaskEntities/family.entity';

@Injectable()
export class ChildrenService {
  constructor(
    @InjectRepository(ChildrenEntity)
    private childrenRepository: Repository<ChildrenEntity>,
    @InjectRepository(Child, 'flaskPostgres')
    private flaskChildRepository: Repository<Child>,
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

  async getFlaskActiveChildren(): Promise<Child[]> {
    return await this.flaskChildRepository
      .createQueryBuilder('child')
      .where('child.isConfirmed = :isConfirmed', { isConfirmed: true })
      .andWhere('child.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('child.id_ngo NOT IN (:...ngoIds)', {
        ngoIds: [3, 14],
      })
      .getMany();
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

  async getMyChildren(userId: number): Promise<any> {
    return await this.flaskChildRepository
      .createQueryBuilder('child')
      .leftJoinAndMapOne(
        'child.family',
        Family,
        'family',
        'family.id_child = child.id',
      )
      .innerJoinAndMapMany(
        'family.members',
        UserFamily,
        'userFamily',
        'userFamily.id_family = family.id',
      )
      .where('userFamily.id_user = :userId', { userId: userId })
      // .andWhere('child.existence_status IN (:...existence_status)', {
      //   existence_status: [childExistence.AlivePresent],
      // })
      .andWhere('userFamily.isDeleted = :isDeleted', { isDeleted: false })
      .select(['child', 'family', 'userFamily'])
      .getMany();
  }
}
