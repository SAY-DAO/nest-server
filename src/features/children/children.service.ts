import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { ChildrenEntity } from '../../entities/children.entity';
import { ChildAPIApi } from '../../generated-sources/openapi';
import { NeedSummary } from '../../types/interfaces/Need';
import {
  ChildParams,
  PreRegisterChildPrepareParams,
  PreRegisterChildUpdateApprovedParams,
  PreRegisterChildUpdateParams,
  createFlaskChildParams,
} from '../../types/parameters/ChildParameters';
import { NgoEntity } from '../../entities/ngo.entity';
import { ContributorEntity } from '../../entities/contributor.entity';
import { Child } from '../../entities/flaskEntities/child.entity';
import {
  ChildConfirmation,
  ChildExistence,
  PreRegisterStatusEnum,
  SexEnum,
} from '../../types/interfaces/interface';
import { UserFamily } from '../../entities/flaskEntities/userFamily.entity';
import { Family } from '../../entities/flaskEntities/family.entity';
import { User } from '../../entities/flaskEntities/user.entity';
import { NGO } from '../../entities/flaskEntities/ngo.entity';
import {
  Paginated,
  PaginateQuery,
  paginate as nestPaginate,
} from 'nestjs-paginate';
import { ChildrenPreRegisterEntity } from '../../entities/childrenPreRegister.entity';
import { Observable, from } from 'rxjs';
import { LocationEntity } from '../../entities/location.entity';
import { AllUserEntity } from '../../entities/user.entity';

@Injectable()
export class ChildrenService {
  constructor(
    @InjectRepository(ChildrenPreRegisterEntity)
    private preRegisterChildrenRepository: Repository<ChildrenPreRegisterEntity>,
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
      .cache(true)
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

  async getChildren(): Promise<ChildrenEntity[]> {
    return this.childrenRepository.find();
  }

  async getAllFlaskChildren(): Promise<Child[]> {
    return this.flaskChildRepository.find({
      where: {
        isDeleted: false,
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
      .cache(true);

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

  // ----------------------------------------------------------------------------------------------------------------------------------
  // ----------------------------------------------------------- PRE - REGISTER -------------------------------------------------------
  // ----------------------------------------------------------------------------------------------------------------------------------

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

  preRegisterAssignChild(
    theId: string,
    childDetails: PreRegisterChildPrepareParams,
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

  preRegisterUpdate(
    theId: string,
    childDetails: PreRegisterChildUpdateParams,
  ): Promise<UpdateResult> {
    console.log(childDetails);
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
      },
    );
  }

  // When panel edit/update a confirmed child
  preRegisterUpdateApproved(
    flaskChildId: number,
    theId: string,
    childDetails: PreRegisterChildUpdateApprovedParams,
  ): Promise<UpdateResult> {
    return this.preRegisterChildrenRepository.update(
      { id: theId },
      { flaskChildId, ...childDetails },
    );
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

  async getChildrenPreRegisterAdmin(
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
        defaultSortBy: [['createdAt', 'DESC']],
        sortableColumns: ['id'],
        nullSort: 'last',
      },
    );
  }

  // no pagination
  getChildrenPreRegisterSimple(
    status: PreRegisterStatusEnum,
  ): Promise<ChildrenPreRegisterEntity[]> {
    return this.preRegisterChildrenRepository.find({
      where: {
        status: status,
      },
    });
  }

  async getPreChildrenNames(): Promise<ChildrenPreRegisterEntity[]> {
    return await this.preRegisterChildrenRepository
      .createQueryBuilder('child')
      .where('child.status != :status', {
        status: PreRegisterStatusEnum.CONFIRMED,
      })
      .select(['child.sayName'])
      .getMany();
  }

  async getPreChildrenByName(
    sayNameEn: string,
  ): Promise<ChildrenPreRegisterEntity[]> {
    return await this.preRegisterChildrenRepository
      .createQueryBuilder('child')
      // .where('child.status != :status', {
      //   status: PreRegisterStatusEnum.CONFIRMED,
      // })
      .where("child.sayName -> 'en' = :sayName", {
        sayName: sayNameEn,
      })
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

  async deletePreRegister(id: string): Promise<Observable<any>> {
    return from(this.preRegisterChildrenRepository.delete(id));
  }
}
