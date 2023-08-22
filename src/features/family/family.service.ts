import { Injectable, Req } from '@nestjs/common';
import {
  PaymentStatusEnum,
  SAYPlatformRoles,
  VirtualFamilyRole,
} from 'src/types/interfaces/interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Need } from 'src/entities/flaskEntities/need.entity';
import { Repository } from 'typeorm';
import { Payment } from 'src/entities/flaskEntities/payment.entity';
import { Child } from 'src/entities/flaskEntities/child.entity';
import { User } from 'src/entities/flaskEntities/user.entity';
import { UserFamily } from 'src/entities/flaskEntities/userFamily.entity';
import { Family } from 'src/entities/flaskEntities/family.entity';
import { NeedEntity } from 'src/entities/need.entity';
import { NeedFamily } from 'src/entities/flaskEntities/needFamily';

@Injectable()
export class FamilyService {
  constructor(
    @InjectRepository(NeedEntity)
    private needRepository: Repository<NeedEntity>,
    @InjectRepository(Need, 'flaskPostgres')
    private flaskNeedRepository: Repository<Need>,
    @InjectRepository(User, 'flaskPostgres')
    private flaskUserRepository: Repository<User>,
    @InjectRepository(Family, 'flaskPostgres')
    private flaskFamilyRepository: Repository<Family>,
    @InjectRepository(UserFamily, 'flaskPostgres')
    private flaskUserFamilyRepository: Repository<UserFamily>,
  ) {}

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

  async getFamilyRolesCount(vfamilyRole: VirtualFamilyRole): Promise<any> {
    return this.flaskUserRepository
      .createQueryBuilder('user')
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
      .andWhere('userFamily.isDeleted = :userFamilyDeleted', {
        userFamilyDeleted: false,
      })
      .andWhere('userFamily.flaskFamilyRole = :flaskFamilyRole', {
        flaskFamilyRole: vfamilyRole, // we have -1 and -2 in data as well (e.g user id:208 is SAY)
      })
      .cache(10000)
      .getCount();
  }

  async isChildCaredOnce(userId: number, childId: number): Promise<boolean> {
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
      .where('user.id = :userId', { userId: userId })
      .andWhere('child.id = :childId', { childId: childId })
      .andWhere('need.isDeleted = :isNeedDeleted', { isNeedDeleted: false })
      .andWhere('payment.id_user = :userId', { userId: userId })
      .andWhere('payment.id_need IS NOT NULL')
      .andWhere('payment.id IS NOT NULL')
      .andWhere('payment.verified IS NOT NULL')
      .andWhere('payment.order_id IS NOT NULL')
      .getExists();
  }

  async getFamilyRoleCompletePay(
    vfamilyRole: VirtualFamilyRole,
    userId: number,
  ): Promise<any> {
    return (
      this.flaskNeedRepository
        .createQueryBuilder('need')
        .leftJoinAndMapMany(
          'need.participants',
          NeedFamily,
          'needFamily',
          'needFamily.id_need = need.id',
        )
        .leftJoinAndMapOne(
          'need.child',
          Child,
          'child',
          'child.id = need.child_id',
        )
        .leftJoinAndMapMany(
          'need.payments',
          Payment,
          'payment',
          'payment.id_need = need.id',
        )
        .andWhere('need.status >= :statusNotPaid', {
          statusNotPaid: PaymentStatusEnum.COMPLETE_PAY,
        })
        .andWhere('need.isDeleted = :needDeleted', { needDeleted: false })
        .andWhere(userId > 0 && `payment.id_user = :userId`, { userId: userId })
        .andWhere(userId > 0 && `needFamily.id_user = :userId`, {
          userId: userId,
        })
        // -----> From here: diff from what we get on panel delivered column
        .andWhere('needFamily.isDeleted = :needFamilyDeleted', {
          needFamilyDeleted: false,
        })
        .andWhere('needFamily.flaskFamilyRole = :flaskFamilyRole', {
          flaskFamilyRole: vfamilyRole, // we have -1 and -2 in data as well (e.g user id:208 is SAY)
        })
        //<------- to here
        .andWhere('payment.id IS NOT NULL')
        .andWhere('payment.verified IS NOT NULL')
        // .andWhere('payment.order_id IS NOT NULL')
        .andWhere('payment.id_need IS NOT NULL')
        .andWhere('child.id_ngo NOT IN (:...testNgoIds)', {
          testNgoIds: [3, 14],
        })
        .select([
          // 'need',
          'need.id',
          'need.created',
          'need.child_delivery_date',
          'need._cost',
          'need.status',
          'need.isConfirmed',
          'need.confirmDate',
          'need.isDeleted',
          'need.status',
          'need.child_id',
          'needFamily',
          'payment',
        ])
        .cache(10000)
        .getManyAndCount()
    );
  }

  async getFamilyReadyToSignNeeds(
    familyMemberId: number,
  ): Promise<NeedEntity[]> {
    const needs = this.needRepository.find({
      relations: {
        signatures: true,
        verifiedPayments: true,
        child: true,
      },
      where: {
        verifiedPayments: {
          flaskUserId: familyMemberId,
        },
        signatures: {
          role: SAYPlatformRoles.SOCIAL_WORKER, // must be signed by social worker
        },
      },
      select: {
        name: true,
        id: true,
        flaskId: true,
        midjourneyImage: true,
        nameTranslations: {
          fa: true,
          en: true,
        },
        child: {
          awakeAvatarUrl: true,
          sleptAvatarUrl: true,
          adultAvatarUrl: true,
          sayNameTranslations: {
            en: true,
            fa: true,
          },
        },
      },
    });
    return needs;
  }

  async getFamilyReadyToSignOneNeed(needId: string): Promise<NeedEntity> {
    const need = await this.needRepository.findOne({
      relations: {
        verifiedPayments: true,
        signatures: true,
      },
      where: {
        signatures: {
          role: SAYPlatformRoles.SOCIAL_WORKER, // must be signed by social worker
          need: {
            id: needId,
          },
        },
      },
    });
    const { verifiedPayments, ...others } = need;
    const modifiedNeed = {
      verifiedPayments: verifiedPayments.filter((p) => p.verified !== null),
      ...others,
    };
    return modifiedNeed;
  }

  async getAllFamilyReadyToSignNeeds(): Promise<NeedEntity[]> {
    const needs = this.needRepository.find({
      relations: {
        signatures: true,
      },
      where: {
        signatures: {
          role: SAYPlatformRoles.SOCIAL_WORKER, // must be signed by social worker
        },
      },
    });
    return needs;
  }

  async getChildFamilyMembers(childFlaskId: number): Promise<UserFamily[]> {
    return this.flaskUserFamilyRepository
      .createQueryBuilder('userFamily')
      .leftJoinAndMapOne(
        'userFamily.members',
        Family,
        'family',
        'family.id = userFamily.id_family',
      )
      .andWhere(`family.id_child = :childFlaskId`, {
        childFlaskId: childFlaskId,
      })
      .cache(10000)
      .getMany();
  }
}
