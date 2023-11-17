import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { ChildrenEntity } from '../../entities/children.entity';
import { ChildAPIApi } from 'src/generated-sources/openapi';
import { NeedSummary } from 'src/types/interfaces/Need';
import {
  ChildParams,
  PreRegisterChildParams,
  createFlaskChildParams,
} from 'src/types/parameters/ChildParameters';
import { NgoEntity } from 'src/entities/ngo.entity';
import { ContributorEntity } from 'src/entities/contributor.entity';
import { Child } from 'src/entities/flaskEntities/child.entity';
import {
  ChildConfirmation,
  ChildExistence,
  PreRegisterStatusEnum,
  SexEnum,
} from 'src/types/interfaces/interface';
import { UserFamily } from 'src/entities/flaskEntities/userFamily.entity';
import { Family } from 'src/entities/flaskEntities/family.entity';
import { User } from 'src/entities/flaskEntities/user.entity';
import { NGO } from 'src/entities/flaskEntities/ngo.entity';
import {
  Paginated,
  PaginateQuery,
  paginate as nestPaginate,
} from 'nestjs-paginate';
import { ChildrenPreRegisterEntity } from 'src/entities/childrenPreRegister.entity';
import { Observable, from } from 'rxjs';
import { LocationEntity } from 'src/entities/location.entity';
import { AllUserEntity } from 'src/entities/user.entity';

@Injectable()
export class ChildrenService {
  constructor(
    @InjectRepository(ChildrenPreRegisterEntity)
    private preRegisterChildrenRepository: Repository<ChildrenPreRegisterEntity>,
    @InjectRepository(ChildrenEntity)
    private childrenRepository: Repository<ChildrenEntity>,
    @InjectRepository(Child, 'flaskPostgres')
    private flaskChildRepository: Repository<Child>,
  ) { }

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
        existenceStatus: [ChildExistence.AlivePresent],
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

  async getFlaskChildrenSimple(): Promise<Child[]> {
    return this.flaskChildRepository
      .createQueryBuilder('child')
      .leftJoinAndMapOne('child.ngo', NGO, 'ngo', 'ngo.id = child.id_ngo')
      .where('child.isMigrated = :childIsMigrated', {
        childIsMigrated: false,
      })
      .andWhere('child.id_ngo NOT IN (:...testNgoIds)', {
        testNgoIds: [3, 14],
      })
      .cache(60000)
      .getMany();
  }

  async addChildToFlask(
    accessToken: any,
    childDetails: createFlaskChildParams,
  ): Promise<any> {
    const childApi = new ChildAPIApi();
    const child = childApi.apiV2ChildAddPost(
      accessToken,
      childDetails.awakeAvatarUrl,
      childDetails.sleptAvatarUrl,
      childDetails.voiceUrl,
      childDetails.saynameTranslations,
      childDetails.bioTranslations,
      childDetails.bioSummaryTranslations,
      childDetails.phoneNumber,
      childDetails.country,
      childDetails.city,
      childDetails.gender,
      childDetails.ngoId,
      childDetails.swId,
      childDetails.firstNameTranslations,
      childDetails.lastNameTranslations,
      childDetails.nationalityId,
      childDetails.birthPlace,
      childDetails.birthDate,
      childDetails.address,
      childDetails.housingStatus,
      childDetails.familyCount,
      childDetails.education,
      0,
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

  createPreRegisterChild(
    awakeUrl: string,
    sleptUrl: string,
    sayName: { fa: string; en: string },
    sex: SexEnum,
  ): Promise<ChildrenPreRegisterEntity> {
    const newChild = this.preRegisterChildrenRepository.create({
      awakeUrl,
      sleptUrl,
      sayName: { fa: sayName.fa, en: sayName.en },
      sex,
    });
    return this.preRegisterChildrenRepository.save(newChild);
  }

  approvePreregister(
    preRegister: ChildrenPreRegisterEntity,
    firstNameEn: string,
    lastNameEn: string,
    bioEn: string,
    flaskChildId: number,
    voiceUrl: string,
  ): Promise<UpdateResult> {
    return this.preRegisterChildrenRepository.update(
      { id: preRegister.id },
      {
        status: PreRegisterStatusEnum.CONFIRMED,
        flaskChildId,
        firstName: { fa: preRegister.firstName.fa, en: firstNameEn },
        lastName: { fa: preRegister.lastName.fa, en: lastNameEn },
        bio: { fa: preRegister.bio.fa, en: bioEn },
        voiceUrl,
      },
    );
  }

  updatePreRegisterChild(
    theId: string,
    childDetails: PreRegisterChildParams,
    location: LocationEntity,
    ngo: NgoEntity,
    sw: ContributorEntity,
  ): Promise<UpdateResult> {
    return this.preRegisterChildrenRepository.update(
      { id: theId },
      {
        ...childDetails,
        firstName: {
          fa: childDetails.firstName.fa,
          en: childDetails.firstName.en,
        },
        lastName: { fa: childDetails.lastName.fa, en: '' },
        bio: { fa: childDetails.bio.fa, en: '' },
        location,
        ngo,
        socialWorker: sw,
      },
    );
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

  getChildrenPreRegisterByFlaskId(
    flaskChildId: number,
  ): Promise<ChildrenPreRegisterEntity> {
    return this.preRegisterChildrenRepository.findOne({
      where: {
        flaskChildId,
      },
    });
  }

  async getChildrenPreRegisters(
    options: PaginateQuery,
    status: PreRegisterStatusEnum,
    ngoIds: number[],
    swIds: number[],
  ): Promise<Paginated<ChildrenPreRegisterEntity>> {

    const queryBuilder = this.preRegisterChildrenRepository
      .createQueryBuilder('preRegister')
      .leftJoinAndMapOne(
        'preRegister.location',
        LocationEntity,
        'location',
        'location.flaskCityId = preRegister.city',
      )
      .leftJoinAndMapOne(
        'preRegister.socialWorker',
        AllUserEntity,
        'socialWorker',
        'socialWorker.flaskUserId = preRegister.flaskSwId',
      )
      .leftJoinAndMapOne(
        'preRegister.ngo',
        NgoEntity,
        'ngo',
        'ngo.flaskNgoId = preRegister.flaskNgoId',
      )
      .where('preRegister.status = :status', {
        status,
      })
      .andWhere('ngo.flaskNgoId IN (:...ngoIds)', {
        ngoIds: [...ngoIds],
      })
      .andWhere('preRegister.flaskSwId IN (:...swIds)', {
        swIds: swIds,
      })
      .andWhere('socialWorker.isContributor = :isContributor', {
        isContributor: true,
      });

    return await nestPaginate<ChildrenPreRegisterEntity>(
      options,
      queryBuilder,
      {
        defaultSortBy: [['createdAt', 'DESC']],
        sortableColumns: ['id'],
        nullSort: 'last',
      },
    );
  }

  async getChildrenPreRegisterNotRegistered(
    options: PaginateQuery,
    status: PreRegisterStatusEnum,
  ): Promise<Paginated<ChildrenPreRegisterEntity>> {
    const queryBuilder = this.preRegisterChildrenRepository
      .createQueryBuilder('preRegister')
      .leftJoinAndMapOne(
        'preRegister.location',
        LocationEntity,
        'location',
        'location.flaskCityId = preRegister.city',
      )
      .where('preRegister.status = :status', {
        status,
      });
    return await nestPaginate<ChildrenPreRegisterEntity>(
      options,
      queryBuilder,
      {
        sortableColumns: ['id'],
        nullSort: 'last',
      },
    );
  }

  //no pagination
  getChildrenPreRegisterSimple(
    status: PreRegisterStatusEnum,
  ): Promise<ChildrenPreRegisterEntity[]> {
    return this.preRegisterChildrenRepository.find({
      where: {
        status: status,
      },
    });
  }

  async getFlaskChildren(
    options: PaginateQuery,
    body: {
      isMigrated: boolean;
      statuses: ChildExistence[];
      isConfirmed: ChildConfirmation;
    },
    socialWorkerIds: number[],
  ): Promise<Paginated<Child>> {
    const queryBuilder = this.flaskChildRepository
      .createQueryBuilder('child')
      .leftJoinAndMapOne('child.ngo', NGO, 'ngo', 'ngo.id = child.id_ngo')
      .where('child.isMigrated = :childIsMigrated', {
        childIsMigrated: body.isMigrated,
      })
      .andWhere('ngo.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('child.isConfirmed IN (:...childConfirmed)', {
        childConfirmed:
          body.isConfirmed === ChildConfirmation.CONFIRMED
            ? [true]
            : ChildConfirmation.NOT_CONFIRMED
              ? [false]
              : ChildConfirmation.BOTH && [true, false],
      })
      .andWhere('child.id_social_worker IN (:...socialWorkerIds)', {
        socialWorkerIds: [...socialWorkerIds],
      })
      .andWhere('child.existence_status IN (:...existenceStatuses)', {
        existenceStatuses:
          body.statuses[0] >= 0
            ? [...body.statuses]
            : [
              ChildExistence.DEAD,
              ChildExistence.AlivePresent,
              ChildExistence.AliveGone,
              ChildExistence.TempGone,
            ],
      })

      .andWhere('child.id_ngo NOT IN (:...testNgoIds)', {
        testNgoIds: [3, 14],
      })
      .cache(60000);

    return await nestPaginate<Child>(options, queryBuilder, {
      sortableColumns: ['id'],
      defaultSortBy: [['isConfirmed', 'ASC']],
      nullSort: 'last',
    });
  }

  async getFlaskActiveChildren(): Promise<Child[]> {
    return await this.flaskChildRepository
      .createQueryBuilder('child')
      .where('child.isConfirmed = :childConfirmed', { childConfirmed: true })
      .andWhere('child.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('child.existence_status = :existence_status', {
        existence_status: ChildExistence.AlivePresent,
      })
      .andWhere('child.isMigrated = :childIsMigrated', {
        childIsMigrated: false,
      })
      .andWhere('child.id_ngo NOT IN (:...testNgoIds)', {
        testNgoIds: [3, 14],
      })
      .getMany();
  }

  async getFlaskChildrenNames(): Promise<Child[]> {
    return await this.flaskChildRepository
      .createQueryBuilder('child')
      .select(['child.sayname_translations'])
      .getMany();
  }


  async getPreChildrenNames(): Promise<ChildrenPreRegisterEntity[]> {
    return await this.preRegisterChildrenRepository
      .createQueryBuilder('child')
      .select(['child.sayName'])
      .getMany();
  }

  getChildPreRegisterById(id: string): Promise<ChildrenPreRegisterEntity> {
    const child = this.preRegisterChildrenRepository.findOne({
      where: {
        id: id,
      },
    });
    return child;
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

  async getMyChildren(userId: number): Promise<Child[]> {
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
      //   existence_status: [ChildExistence.AlivePresent],
      // })
      .andWhere('userFamily.isDeleted = :isDeleted', { isDeleted: false })
      .select(['child', 'family', 'userFamily'])
      .getMany();
  }

  async gtTheNetwork(): Promise<any> {
    return this.flaskChildRepository
      .createQueryBuilder('child')
      .leftJoinAndMapOne(
        'child.family',
        Family,
        'family',
        'family.id_child = child.id',
      )
      .leftJoinAndMapMany(
        'family.currentMembers',
        UserFamily,
        'userFamily',
        'userFamily.id_family = family.id',
      )
      .innerJoinAndMapOne(
        'userFamily.user',
        User,
        'user',
        'user.id = userFamily.id_user',
      )

      .where('child.isConfirmed = :isConfirmed', { isConfirmed: true })
      .andWhere('child.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('child.isMigrated = :childIsMigrated', {
        childIsMigrated: false,
      })
      .andWhere('child.existence_status = :existence_status', {
        existence_status: ChildExistence.AlivePresent,
      })
      .andWhere('child.id_ngo NOT IN (:...testNgoIds)', {
        testNgoIds: [3, 14],
      })
      .select([
        'child.id',
        'child.awakeAvatarUrl',
        'family.id',
        'userFamily.id',
        'user.id',
        'user.avatarUrl',
      ])
      .cache(10000)
      .getMany();
  }
  async deletePreRegister(id: string): Promise<Observable<any>> {
    return from(this.preRegisterChildrenRepository.delete(id));
  }
}
