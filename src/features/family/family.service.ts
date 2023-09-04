import { Injectable } from '@nestjs/common';
import {
  PaymentStatusEnum,
  SAYPlatformRoles,
  VirtualFamilyRole,
} from 'src/types/interfaces/interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Need } from 'src/entities/flaskEntities/need.entity';
import { And, ArrayContains, IsNull, Not, Repository } from 'typeorm';
import { Payment } from 'src/entities/flaskEntities/payment.entity';
import { Child } from 'src/entities/flaskEntities/child.entity';
import { User } from 'src/entities/flaskEntities/user.entity';
import { UserFamily } from 'src/entities/flaskEntities/userFamily.entity';
import { Family } from 'src/entities/flaskEntities/family.entity';
import { NeedEntity } from 'src/entities/need.entity';
import { NeedFamily } from 'src/entities/flaskEntities/needFamily';
import { PaymentEntity } from 'src/entities/payment.entity';

@Injectable()
export class FamilyService {
  constructor(
    @InjectRepository(NeedEntity)
    private needRepository: Repository<NeedEntity>,
    @InjectRepository(PaymentEntity)
    private paymentRepository: Repository<PaymentEntity>,
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

  // async getFamilyPaidNeeds(familyMemberId: number): Promise<PaymentEntity[]> {
  //   const payments = await this.paymentRepository.find({
  //     relations: {
  //       need: {
  //         signatures: true,
  //       },
  //     },
  //     where: {
  //       verified: Not(IsNull()),
  //       flaskUserId: familyMemberId,
  //       needAmount: MoreThan(0),
  //     },
  //   });
  //   return payments;
  // }

  async getAllFamilyReadyToSignNeeds(): Promise<NeedEntity[]> {
    const needs = this.needRepository.find({
      relations: {
        signatures: true,
        verifiedPayments: true,
        ngo: true,
      },
      where: {
        signatures: {
          role: SAYPlatformRoles.SOCIAL_WORKER, // must be signed by social worker
        },
      },
      order: {
        signatures: {
          createdAt: 'DESC',
        },
      },
    });
    return needs;
  }

  async getFamilyReadyToSignNeeds(flaskUserId: number): Promise<NeedEntity[]> {
    return this.needRepository.find({
      relations: {
        signatures: true,
        verifiedPayments: true,
        ngo: true,
      },
      where: {
        signatures: {
          role: SAYPlatformRoles.SOCIAL_WORKER, // must be signed by social worker
        },
        verifiedPayments: {
          flaskUserId: flaskUserId,
          verified: Not(IsNull()),
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getFamilyReadyToSignOneNeed(needId: string): Promise<NeedEntity> {
    const need = await this.needRepository.findOne({
      relations: {
        verifiedPayments: true,
        signatures: true,
        comments: {
          user: true,
        },
      },
      where: {
        verifiedPayments: {
          verified: And(Not(IsNull())),
        },
        id: needId,
      },
    });

    return need;
  }

  async countFamilySignedNeeds(flaskUserId: number): Promise<number> {
    return this.needRepository.count({
      relations: {
        signatures: true,
        verifiedPayments: true,
        ngo: true,
      },
      where: {
        signatures: {
          role: SAYPlatformRoles.FAMILY, // must be signed by social worker
          flaskUserId,
        },
        verifiedPayments: {
          flaskUserId,
          verified: Not(IsNull()),
        },
      },
    });
  }

  async getChildFamilyMembers(
    childFlaskId: number,
    paidMembers: number[],
  ): Promise<UserFamily[]> {
    return this.flaskUserFamilyRepository
      .createQueryBuilder('userFamily')
      .leftJoinAndMapOne(
        'userFamily.family',
        Family,
        'family',
        'family.id = userFamily.id_family',
      )
      .andWhere(`family.id_child = :childFlaskId`, {
        childFlaskId: childFlaskId,
      })
      .andWhere('userFamily.id_user IN (:...paidMembers)', {
        paidMembers: paidMembers,
      })
      .cache(10000)
      .getMany();
  }
}
