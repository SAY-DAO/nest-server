import { Injectable } from '@nestjs/common';
import {
  PaymentStatusEnum,
  SAYPlatformRoles,
  VirtualFamilyRole,
} from '../../types/interfaces/interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Need } from '../../entities/flaskEntities/need.entity';
import { And, Brackets, IsNull, Not, Repository, UpdateResult } from 'typeorm';
import { Payment } from '../../entities/flaskEntities/payment.entity';
import { Child } from '../../entities/flaskEntities/child.entity';
import { User } from '../../entities/flaskEntities/user.entity';
import { UserFamily } from '../../entities/flaskEntities/userFamily.entity';
import { Family } from '../../entities/flaskEntities/family.entity';
import { NeedEntity } from '../../entities/need.entity';
import { NeedFamily } from '../../entities/flaskEntities/needFamily';
import { AllUserEntity } from '../../entities/user.entity';

@Injectable()
export class FamilyService {
  constructor(
    @InjectRepository(NeedEntity)
    private needRepository: Repository<NeedEntity>,
    @InjectRepository(AllUserEntity)
    private allUserRepository: Repository<AllUserEntity>,
    @InjectRepository(Need, 'flaskPostgres')
    private flaskNeedRepository: Repository<Need>,
    @InjectRepository(User, 'flaskPostgres')
    private flaskUserRepository: Repository<User>,
    @InjectRepository(Family, 'flaskPostgres')
    private flaskFamilyRepository: Repository<Family>,
    @InjectRepository(UserFamily, 'flaskPostgres')
    private flaskUserFamilyRepository: Repository<UserFamily>,
  ) {}

  async searchUsers(query: string): Promise<User[]> {
    const q = `%${query}%`;

    // quick heuristics
    const isNumeric = /^\d+$/.test(query);
    const isUuid =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
        query,
      );

    const qb = this.flaskUserRepository.createQueryBuilder('user');

    qb.where(
      new Brackets((br) => {
        br.where('user.userName ILIKE :q', { q })
          .orWhere('user.emailAddress ILIKE :q', { q })
          .orWhere('user.phone_number ILIKE :q', { q })
          .orWhere('user.firstName ILIKE :q', { q });
        // prefer exact id match when query looks like an id (faster & correct)
        if (isUuid || isNumeric) {
          br.orWhere('user.id = :exactId', { exactId: query });
        } else {
          // fallback to text match (Postgres): cast id to text and ILIKE
          br.orWhere('CAST(user.id AS text) ILIKE :q', { q });
        }
      }),
    ).andWhere('user.isDeleted = :isDeleted', { isDeleted: false });
    return qb.getMany();
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

  // have at least paid for a delivered need
  async countActiveFamilyByRole(vfamilyRole: number): Promise<number> {
    const testNgoIds = [3, 14];

    // resolve real table names to avoid TypeORM alias substitution issues
    const mgr = this.flaskUserRepository.manager;
    const nfTable = mgr.getRepository(NeedFamily).metadata.tableName;
    const needTable = mgr.getRepository(Need).metadata.tableName;
    const childTable = mgr.getRepository(Child).metadata.tableName;
    const paymentTable = mgr.getRepository(Payment).metadata.tableName;

    const qb = this.flaskUserRepository
      .createQueryBuilder('user')
      // require a matching needFamily row with the requested role
      .innerJoin(
        nfTable,
        'nf',
        `"nf"."id_user" = "user"."id" AND "nf"."user_role" = :flaskFamilyRole`,
        { flaskFamilyRole: vfamilyRole },
      )
      // require the related need and check need filters in ON clause
      .innerJoin(
        needTable,
        'n',
        `"n"."id" = "nf"."id_need" AND ( "n"."isDeleted" IS NULL OR "n"."isDeleted" = FALSE ) AND ( "n"."isConfirmed" = TRUE ) AND "n"."status" >= :statusPaid`,
        { statusPaid: PaymentStatusEnum.COMPLETE_PAY },
      )
      // require the child and apply child filters
      .innerJoin(
        childTable,
        'c',
        `"c"."id" = "n"."child_id" AND ( "c"."isDeleted" IS NULL OR "c"."isDeleted" = FALSE ) AND ( "c"."id_ngo" IS NULL OR "c"."id_ngo" NOT IN (:...testNgoIds) )`,
        { testNgoIds },
      )
      // require at least one payment by the user for that need (verified)
      .innerJoin(
        paymentTable,
        'p',
        `"p"."id_user" = "user"."id" AND "p"."id_need" = "n"."id" AND "p"."verified" IS NOT NULL`,
      )
      .where(
        new Brackets((b) => {
          b.where('user.is_email_verified = TRUE').orWhere(
            'user.is_phonenumber_verified = TRUE',
          );
        }),
      )
      .andWhere('(user.isDeleted IS NULL OR user.isDeleted = FALSE)')
      .select('COUNT(DISTINCT user.id)', 'count');

    const raw = await qb.getRawOne();
    return parseInt(raw.count, 10) || 0;
  }

  async getDoneNeedsByFamilyRole(
    vfamilyRole: VirtualFamilyRole,
    userId: number,
  ): Promise<[Need[], number]> {
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
        .where('need.status >= :statusPaid', {
          statusPaid: PaymentStatusEnum.COMPLETE_PAY,
        })
        .andWhere('need.isDeleted = :needDeleted', { needDeleted: false })
        .andWhere('child.isDeleted = :childDeleted', { childDeleted: false })
        .andWhere('child.id_ngo NOT IN (:...testNgoIds)', {
          testNgoIds: [3, 14],
        })
        .andWhere('need.isConfirmed = :isNeedConfirmed', {
          isNeedConfirmed: true,
        })
        .andWhere('child.isConfirmed = :isConfirmed', { isConfirmed: true })
        .andWhere(userId > 0 && `payment.id_user = :pUserId`, {
          pUserId: userId,
        })
        .andWhere(userId > 0 && `needFamily.id_user = :nUserId`, {
          nUserId: userId,
        })
        // -----> From here: diff from what we get on panel done count
        // .andWhere('needFamily.isDeleted = :needFamilyDeleted', {
        //   needFamilyDeleted: false,
        // })
        //<------- to here
        .andWhere('needFamily.flaskFamilyRole = :flaskFamilyRole', {
          flaskFamilyRole: vfamilyRole, // we have -3 and -2 in data as well (e.g user id:208 is SAY)
        })
        .andWhere('payment.id IS NOT NULL')
        .andWhere('payment.verified IS NOT NULL')
        .andWhere('payment.id_need IS NOT NULL')
        .select([
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
          'child.isConfirmed',
          'child.id_ngo',
          'needFamily',
          'payment',
        ])
        .cache(true)
        .getManyAndCount()
    );
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
      .andWhere('payment.id_user = :pUserId', { pUserId: userId })
      .andWhere('payment.id_need IS NOT NULL')
      .andWhere('payment.id IS NOT NULL')
      .andWhere('payment.verified IS NOT NULL')
      .andWhere('payment.order_id IS NOT NULL')
      .getExists();
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
      .cache(true)
      .getMany();
  }

  async updateMonthlyCampaign(user: AllUserEntity): Promise<UpdateResult> {
    const newStatus = user.monthlyCampaign ? false : true;
    return this.allUserRepository.update(user.id, {
      monthlyCampaign: newStatus,
    });
  }

  async updateNewsLetterCampaign(user: AllUserEntity): Promise<UpdateResult> {
    const newStatus = user.newsLetterCampaign ? false : true;
    return this.allUserRepository.update(user.id, {
      newsLetterCampaign: newStatus,
    });
  }

  async updateBuilderStatus(user: AllUserEntity): Promise<UpdateResult> {
    const newValue = !user.isBuilder;
    return this.allUserRepository.update(user.id, {
      isBuilder: newValue,
    });
  }
  async getBuilderStatus(flaskUserId: number): Promise<boolean> {
    const user = await this.allUserRepository.findOne({
      where: { flaskUserId },
    });
    return user.isBuilder;
  }

  fetchBuilders(): Promise<AllUserEntity[]> {
    const users = this.allUserRepository.find({
      where: { isBuilder: true },
    });
    return users;
  }
}
