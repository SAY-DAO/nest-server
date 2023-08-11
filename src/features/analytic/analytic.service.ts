import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { mean, round } from 'mathjs';
import { Child } from 'src/entities/flaskEntities/child.entity';
import { Family } from 'src/entities/flaskEntities/family.entity';
import { Need } from 'src/entities/flaskEntities/need.entity';
import { NGO } from 'src/entities/flaskEntities/ngo.entity';
import { Payment } from 'src/entities/flaskEntities/payment.entity';
import { SocialWorker, User } from 'src/entities/flaskEntities/user.entity';
import { UserFamily } from 'src/entities/flaskEntities/userFamily.entity';
import {
  NeedTypeEnum,
  SAYPlatformRoles,
  childExistence,
} from 'src/types/interfaces/interface';
import {
  daysDifference,
  getNeedsTimeLine,
  removeDuplicates,
  timeDifferenceWithComment,
} from 'src/utils/helpers';
import { Repository } from 'typeorm';

@Injectable()
export class AnalyticService {
  constructor(
    @InjectRepository(NGO, 'flaskPostgres')
    private flaskNgoRepository: Repository<NGO>,
    @InjectRepository(Payment, 'flaskPostgres')
    private flaskPaymentRepository: Repository<Payment>,
    @InjectRepository(Family, 'flaskPostgres')
    private flaskFamilyRepository: Repository<Family>,
    @InjectRepository(UserFamily, 'flaskPostgres')
    private flaskUserFamilyRepository: Repository<UserFamily>,
    @InjectRepository(SocialWorker, 'flaskPostgres')
    private flaskSocialWorkerRepository: Repository<SocialWorker>,
    @InjectRepository(User, 'flaskPostgres')
    private flaskUserRepository: Repository<User>,
    @InjectRepository(Child, 'flaskPostgres')
    private flaskChildRepository: Repository<Child>,
    @InjectRepository(Need, 'flaskPostgres')
    private flaskNeedRepository: Repository<Need>,
  ) {}

  async getDeliveredNeedsAnalytic(type: NeedTypeEnum) {
    return await this.flaskNeedRepository
      .createQueryBuilder('need')
      .select([
        'need.id',
        'need.name_translations',
        'need.type',
        'need.created',
        'need.confirmDate',
        'need.doneAt',
        'need.purchase_date',
        'need.ngo_delivery_date',
        'need.child_delivery_date',
      ])
      .where('need.isConfirmed = :isConfirmed', { isConfirmed: true })
      .andWhere('need.type = :type', { type })
      // .where("need.purchase_date > :startDate", { startDate: new Date(2021, 2, 3) })
      // .andWhere("need.child_delivery_date < :endDate", { endDate: new Date(2023, 1, 3) })
      .andWhere('need.child_delivery_date IS NOT NULL')
      // .orderBy("need.created", "ASC")
      // .limit(10)
      .getManyAndCount();
  }

  async getUsersAnalytic() {
    const families = await this.flaskFamilyRepository
      .createQueryBuilder('family')
      .getCount();

    const users = await this.flaskUserRepository
      .createQueryBuilder('user')
      .andWhere('user.isDeleted = :isDeleted', { isDeleted: false })
      .getCount();
    return { users, families };
  }

  async getNgoAnalytic() {
    return await this.flaskNgoRepository
      .createQueryBuilder('ngo')
      .innerJoinAndMapMany(
        'ngo.children',
        Child,
        'child',
        'child.id_ngo = ngo.id',
      )
      .where('ngo.isActive = :isActive', { isActive: true })
      .select([
        'ngo.id',
        'ngo.name',
        'child.id',
        'child.id_ngo',
        'child.sayname_translations',
      ])
      .getMany();
  }

  async getChildrenAnalytic() {
    const allChildren = await this.flaskChildRepository
      .createQueryBuilder('child')
      .select([
        'child.id',
        'child.id_ngo',
        'child.sayname_translations',
        'child.isConfirmed',
      ])
      .andWhere('child.id_ngo NOT IN (:...testNgoIds)', {
        testNgoIds: [3, 14],
      })
      .andWhere('child.isMigrated = :childIsMigrated', {
        childIsMigrated: false,
      })
      .getManyAndCount();

    const dead = await this.flaskChildRepository
      .createQueryBuilder('child')
      .leftJoinAndMapOne('child.ngo', NGO, 'ngo', 'ngo.id = child.id_ngo')
      .where('child.existence_status = :existence_status', {
        existence_status: childExistence.DEAD,
      })
      .andWhere('child.isConfirmed = :isConfirmed', { isConfirmed: true })
      .andWhere('ngo.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('ngo.isActive = :isActive', { isActive: true })
      .andWhere('child.isMigrated = :childIsMigrated', {
        childIsMigrated: false,
      })
      .andWhere('child.id_ngo NOT IN (:...testNgoIds)', {
        testNgoIds: [3, 14],
      })
      .select(['child.id', 'ngo'])
      .getCount();

    const alivePresent = await this.flaskChildRepository
      .createQueryBuilder('child')
      .leftJoinAndMapOne('child.ngo', NGO, 'ngo', 'ngo.id = child.id_ngo')
      .where('child.existence_status = :existence_status', {
        existence_status: childExistence.AlivePresent,
      })
      .andWhere('child.isConfirmed = :isConfirmed', { isConfirmed: true })
      .andWhere('ngo.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('ngo.isActive = :isActive', { isActive: true })
      .andWhere('child.isMigrated = :childIsMigrated', {
        childIsMigrated: false,
      })
      .andWhere('child.id_ngo NOT IN (:...testNgoIds)', {
        testNgoIds: [3, 14],
      })
      .select(['child.id', 'ngo'])
      .getCount();

    const aliveGone = await this.flaskChildRepository
      .createQueryBuilder('child')
      .leftJoinAndMapOne('child.ngo', NGO, 'ngo', 'ngo.id = child.id_ngo')
      .where('child.existence_status = :existence_status', {
        existence_status: childExistence.AliveGone,
      })
      .andWhere('child.isConfirmed = :isConfirmed', { isConfirmed: true })
      .andWhere('ngo.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('ngo.isActive = :isActive', { isActive: true })
      .andWhere('child.isMigrated = :childIsMigrated', {
        childIsMigrated: false,
      })
      .andWhere('child.id_ngo NOT IN (:...testNgoIds)', {
        testNgoIds: [3, 14],
      })
      .select(['child.id', 'ngo'])
      .getCount();

    const tempGone = await this.flaskChildRepository.count({
      where: {
        isConfirmed: true,
        existence_status: 3,
        isMigrated: false,
      },
    });
    const confirmed = await this.flaskChildRepository.count({
      where: {
        isConfirmed: true,
        isMigrated: false,
      },
    });

    return {
      allChildren: allChildren[1],
      dead,
      alivePresent,
      aliveGone,
      tempGone,
      confirmed,
    };
  }

  async getChildNeedsAnalytic(childId: number) {
    const child = await this.flaskChildRepository
      .createQueryBuilder('child')
      .select([
        'child.id',
        'child.id_ngo',
        'child.sayname_translations',
        'child.isConfirmed',
      ])
      .where('child.id = :childId', { childId: childId })
      .getOne();

    const allCount = await this.flaskNeedRepository
      .createQueryBuilder('need')
      .select(['need.id', 'need.child_id', 'isDeleted'])
      .where('need.child_id = :childId', { childId: childId })
      .andWhere('need.isDeleted = :needDeleted', { needDeleted: false })
      .getCount();

    const confirmedCount = await this.flaskNeedRepository
      .createQueryBuilder('need')
      .select(['need.id', 'need.child_id', 'isConfirmed', 'isDeleted'])
      .where('need.child_id = :childId', { childId: childId })
      .andWhere('need.isConfirmed = :isConfirmed', { isConfirmed: true })
      .andWhere('need.isDeleted = :needDeleted', { needDeleted: false })
      .getCount();

    const unConfirmedCount = await this.flaskNeedRepository
      .createQueryBuilder('need')
      .select(['need.id', 'need.child_id', 'isConfirmed', 'isDeleted'])
      .where('need.child_id = :childId', { childId: childId })
      .andWhere('need.isConfirmed = :isConfirmed', { isConfirmed: false })
      .andWhere('need.isDeleted = :needDeleted', { needDeleted: false })
      .getCount();

    const confirmedNotPaidCount = await this.flaskNeedRepository
      .createQueryBuilder('need')
      .select([
        'need.id',
        'need.child_id',
        'need.status',
        'isConfirmed',
        'isDeleted',
      ])
      .where('need.child_id = :childId', { childId: childId })
      .andWhere('need.isConfirmed = :isConfirmed', { isConfirmed: true })
      .andWhere('need.status = 0')
      .andWhere('need.isDeleted = :needDeleted', { needDeleted: false })
      .getCount();

    const completePayCount = await this.flaskNeedRepository
      .createQueryBuilder('need')
      .select(['need.id', 'need.child_id', 'need.status', 'isDeleted'])
      .where('need.child_id = :childId', { childId: childId })
      .andWhere('need.status = 1')
      .andWhere('need.isDeleted = :needDeleted', { needDeleted: false })
      .getCount();

    const partialPayCount = await this.flaskNeedRepository
      .createQueryBuilder('need')
      .select(['need.id', 'need.child_id', 'need.status', 'isDeleted'])
      .where('need.child_id = :childId', { childId: childId })
      .andWhere('need.status = 2')
      .andWhere('need.isDeleted = :needDeleted', { needDeleted: false })
      .getCount();

    const purchasedCount = await this.flaskNeedRepository
      .createQueryBuilder('need')
      .select([
        'need.id',
        'need.child_id',
        'need.status',
        'need.type',
        'isDeleted',
      ])
      .where('need.child_id = :childId', { childId: childId })
      .andWhere('need.type = :type', { type: 1 })
      .andWhere('need.status = 3')
      .andWhere('need.isDeleted = :needDeleted', { needDeleted: false })
      .getCount();

    const moneyToNgoCount = await this.flaskNeedRepository
      .createQueryBuilder('need')
      .select([
        'need.id',
        'need.child_id',
        'need.status',
        'need.type',
        'isDeleted',
      ])
      .where('need.child_id = :childId', { childId: childId })
      .andWhere('need.type = :type', { type: 0 })
      .andWhere('need.status = 3')
      .andWhere('need.isDeleted = :needDeleted', { needDeleted: false })
      .getCount();

    const deliveredNgoCount = await this.flaskNeedRepository
      .createQueryBuilder('need')
      .select([
        'need.id',
        'need.child_id',
        'need.status',
        'need.type',
        'isDeleted',
      ])
      .where('need.child_id = :childId', { childId: childId })
      .andWhere('need.type = :type', { type: 1 })
      .andWhere('need.status = 4')
      .andWhere('need.isDeleted = :needDeleted', { needDeleted: false })
      .getCount();

    const deliveredChildCount = await this.flaskNeedRepository
      .createQueryBuilder('need')
      .select([
        'need.id',
        'need.child_id',
        'need.child_delivery_date',
        'isDeleted',
      ])
      .where('need.child_id = :childId', { childId: childId })
      .andWhere('need.child_delivery_date IS NOT NULL')
      .andWhere('need.isDeleted = :needDeleted', { needDeleted: false })
      .getCount();

    // const childWithNeeds = await this.flaskUserRepository
    //   .createQueryBuilder("user")
    //   .select([
    //     "payment.id",
    //     "payment.need_id",
    //     "payment.child_id",
    //   ])
    //   .where("payment.child_id = :childId", { childId: childId })
    //   .getCount();

    return {
      child,
      childNeedsStats: {
        allCount,
        confirmedCount,
        unConfirmedCount,
        confirmedNotPaidCount,
        completePayCount,
        partialPayCount,
        purchasedCount,
        moneyToNgoCount,
        deliveredNgoCount,
        deliveredChildCount,
      },
    };
  }

  async getChildFamilyAnalytic() {
    const childrenList = [];
    const children = await this.flaskChildRepository
      .createQueryBuilder('child')
      .leftJoinAndMapOne('child.ngo', NGO, 'ngo', 'ngo.id = child.id_ngo')
      .where('child.existence_status = :existence_status', {
        existence_status: childExistence.AlivePresent,
      })
      .andWhere('child.isConfirmed = :isConfirmed', { isConfirmed: true })
      .andWhere('ngo.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('ngo.isActive = :isActive', { isActive: true })
      .andWhere('child.isMigrated = :childIsMigrated', {
        childIsMigrated: false,
      })
      .andWhere('child.id_ngo NOT IN (:...testNgoIds)', {
        testNgoIds: [3, 14],
      })
      .getMany();

    for await (const child of children) {
      const paidNeeds = await this.flaskNeedRepository
        .createQueryBuilder('need')
        .select(['need.id'])
        .where('need.child_id = :childId', { childId: child.id })
        .andWhere('need.isDeleted = :isDeleted', { isDeleted: false })
        .andWhere('need.status > 0')
        .getMany()
        .then((needs) => {
          return needs.map((n) => n.id);
        });

      // const d = new Date();
      // d.setMonth(d.getMonth() - 3); // three months ago

      let familyId: number;
      let familyCount = 0;
      const activeUsersId = [];
      const activeUsersIdInOneMonths = [];
      const activeUsersIdInThreeMonths = [];
      await this.flaskUserFamilyRepository
        .createQueryBuilder('userFamily')
        .leftJoinAndSelect(Family, 'family', 'family.id = userFamily.id_family')
        .where('family.Id_child = :childId', { childId: child.id })
        .andWhere('userFamily.isDeleted = :isDeleted', { isDeleted: false })
        .getMany()
        .then(async (members) => {
          familyCount = members.length;
          familyId = members[0].id_family;
          for await (const user of members) {
            await this.flaskPaymentRepository
              .createQueryBuilder('payment')
              .where('payment.id_user = :userId', { userId: user.id_user })
              .andWhere('payment.id IS NOT NULL')
              .andWhere('payment.verified IS NOT NULL')
              .andWhere('payment.order_id IS NOT NULL')
              .andWhere('payment.id_need IS NOT NULL')
              // .andWhere('payment.created > :startDate', {
              //   startDate: d.toLocaleDateString(),
              // })
              // .andWhere('payment.created < :endDate', { endDate: new Date() })
              .getMany()
              .then((userPayments) => {
                userPayments.map((p) => {
                  if (p.verified && paidNeeds.includes(p.id_need)) {
                    activeUsersId.push({ id: p.id_user });
                    if (daysDifference(p.created, new Date()) <= 30) {
                      activeUsersIdInOneMonths.push({ id: p.id_user });
                    }
                    if (daysDifference(p.created, new Date()) <= 90) {
                      activeUsersIdInThreeMonths.push({ id: p.id_user });
                    }
                  }
                });
              });
          }
        });

      childrenList.push({
        child: child.id,
        childSayName: child.sayname_translations.en,
        family: {
          familyId: familyId,
          activeUsers: removeDuplicates(activeUsersId).length,
          activeUsersInOneMonths: removeDuplicates(activeUsersIdInOneMonths).length,
          activeUsersInThreeMonths: removeDuplicates(activeUsersIdInThreeMonths).length,
          familyCount: familyCount,
        },
      });
    }
    return childrenList;
  }

  async getChildrenEcosystemAnalytic() {
    let listAll = [];
    let listConfirmed = [];
    let listUnConfirmed = [];
    let listConfirmedNotPaid = [];
    let listCompletePay = [];
    let listPartialPay = [];
    let listPurchased = [];
    let listMoneyToNgo = [];
    let listDeliveredNgo = [];
    let listDeliveredChild = [];
    const childrenList = [];
    await this.flaskChildRepository
      .createQueryBuilder('child')
      .select(['child.id'])
      .andWhere('child.existence_status = :existence_status', {
        existence_status: childExistence.AlivePresent,
      })
      .andWhere('child.isMigrated = :childIsMigrated', {
        childIsMigrated: false,
      })
      .andWhere('child.id_ngo NOT IN (:...testNgoIds)', {
        testNgoIds: [3, 14],
      })
      .andWhere('child.isConfirmed = :isConfirmed', { isConfirmed: true })
      .getMany()
      .then(async (children) => {
        for await (const c of children) {
          // 1- count child needs in every status
          const {
            child,
            childNeedsStats: {
              allCount,
              confirmedCount,
              unConfirmedCount,
              confirmedNotPaidCount,
              completePayCount,
              partialPayCount,
              purchasedCount,
              moneyToNgoCount,
              deliveredNgoCount,
              deliveredChildCount,
            },
          } = await this.getChildNeedsAnalytic(c.id);

          childrenList.push({
            child,
            childNeedsStats: {
              allCount,
              confirmedCount,
              unConfirmedCount,
              confirmedNotPaidCount,
              completePayCount,
              partialPayCount,
              purchasedCount,
              moneyToNgoCount,
              deliveredNgoCount,
              deliveredChildCount,
            },
          });

          // 2- add all children stats to one array
          listAll = [...listAll, allCount];
          listConfirmed = [...listConfirmed, confirmedCount];
          listUnConfirmed = [...listUnConfirmed, unConfirmedCount];
          listConfirmedNotPaid = [
            ...listConfirmedNotPaid,
            confirmedNotPaidCount,
          ];
          listCompletePay = [...listCompletePay, completePayCount];
          listPartialPay = [...listPartialPay, partialPayCount];
          listPurchased = [...listPurchased, purchasedCount];
          listMoneyToNgo = [...listMoneyToNgo, moneyToNgoCount];
          listDeliveredNgo = [...listDeliveredNgo, deliveredNgoCount];
          listDeliveredChild = [...listDeliveredChild, deliveredChildCount];
        }
      });

    const totalFamiliesCount = await this.flaskFamilyRepository
      .createQueryBuilder('family')
      .leftJoinAndSelect(
        UserFamily,
        'userFamily',
        'userFamily.id_family = family.id',
      )
      .andWhere('family.isDeleted = :isDeleted', { isDeleted: false })
      .getCount();

    const totalFamilyMembersCount = await this.flaskUserFamilyRepository
      .createQueryBuilder('userFamily')
      .leftJoinAndSelect(Family, 'family', 'family.id = userFamily.id_family')
      .andWhere('userFamily.isDeleted = :isDeleted', { isDeleted: false })
      .getCount();

    return {
      meanNeedsPerChild: round(mean(listAll)),
      meanConfirmedPerChild: round(mean(listConfirmed)),
      meanUnConfirmedPerChild: round(mean(listUnConfirmed)),
      meanConfirmedNotPaidPerChild: round(mean(listConfirmedNotPaid)),
      meanCompletePayPerChild: round(mean(listCompletePay)),
      meanPartialPayPerChild: round(mean(listPartialPay)),
      meanPurchasedPerChild: round(mean(listPurchased)),
      meanMoneyToNgoPerChild: round(mean(listMoneyToNgo)),
      meanDeliveredNgoPerChild: round(mean(listDeliveredNgo)),
      meanDeliveredChildPerChild: round(mean(listDeliveredChild)),
      totalFamiliesCount,
      totalFamilyMembersCount,
      meanFamilyMembers: Math.round(
        totalFamilyMembersCount / totalFamiliesCount,
      ),
      childrenList,
    };
  }

  async getUserContribution(
    swIds: number[],
    role: SAYPlatformRoles,
    flaskUserId: number,
  ) {
    const today = new Date();
    const monthsAgo = today.setMonth(today.getMonth() - 4);

    const needs = await this.flaskNeedRepository
      .createQueryBuilder('need')
      .leftJoinAndMapOne(
        'need.child',
        Child,
        'child',
        'child.id = need.child_id',
      )
      .leftJoinAndMapOne('child.ngo', NGO, 'ngo', 'ngo.id = child.id_ngo')
      .where('child.id_ngo = :ngoIds', { ngoIds: 22 })
      .where('child.isConfirmed = :childConfirmed', { childConfirmed: true })
      .where('child.id_ngo NOT IN (:...ngoIds)', { ngoIds: [3, 14] })
      .where('need.created > :startDate', { startDate: new Date(monthsAgo) })
      .andWhere('need.isDeleted = :needDeleted', { needDeleted: false })
      .andWhere('need.created_by_id IN (:...swIds)', {
        swIds:
          role === SAYPlatformRoles.SOCIAL_WORKER ? [flaskUserId] : [...swIds],
      })
      .select([
        // 'child.id_ngo',
        // 'ngo.id',
        // 'need.id',
        // 'need.child_id',
        // 'need.created_by_id',
        // 'need.bank_track_id',
        // 'need.doing_duration',
        'need.created',
        // 'need.updated',
        'need.confirmDate',
        // 'need.confirmUser',
        // 'need.doneAt',
        // 'need.ngo_delivery_date',
        // 'need.child_delivery_date',
        // 'need.purchase_date',
        // 'need.expected_delivery_date',
        // 'need.unavailable_from',
        // 'need.deleted_at'
      ])
      .orderBy('need.created', 'DESC')
      .getManyAndCount();

    const time7 = new Date().getTime();
    const { summary, inMonth } = getNeedsTimeLine(needs[0]);
    const time8 = new Date().getTime();
    timeDifferenceWithComment(time7, time8, 'TimeLine User Analytic In');

    return { summary, inMonth, count: needs[1], swIds };
  }
}
