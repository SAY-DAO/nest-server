import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
import { getNeedsTimeLine, timeDifferenceWithComment } from 'src/utils/helpers';
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

  async getNeedsAnalytic(type: NeedTypeEnum) {
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
      .limit(10)
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

    const all = await this.flaskNeedRepository
      .createQueryBuilder('need')
      .where('need.child_id = :childId', { childId: childId })
      .andWhere('need.isDeleted = :needDeleted', { needDeleted: false })
      .getCount();

    const confirmed = await this.flaskNeedRepository
      .createQueryBuilder('need')
      .where('need.child_id = :childId', { childId: childId })
      .andWhere('need.isConfirmed = :isConfirmed', { isConfirmed: true })
      .andWhere('need.isDeleted = :needDeleted', { needDeleted: false })
      .getCount();

    const unConfirmed = await this.flaskNeedRepository
      .createQueryBuilder('need')
      .where('need.child_id = :childId', { childId: childId })
      .andWhere('need.isConfirmed = :isConfirmed', { isConfirmed: false })
      .andWhere('need.isDeleted = :needDeleted', { needDeleted: false })
      .getCount();

    const confirmedNotPaid = await this.flaskNeedRepository
      .createQueryBuilder('need')
      .where('need.child_id = :childId', { childId: childId })
      .andWhere('need.isConfirmed = :isConfirmed', { isConfirmed: true })
      .andWhere('need.status = 0')
      .andWhere('need.isDeleted = :needDeleted', { needDeleted: false })
      .getCount();

    const partialPay = await this.flaskNeedRepository
      .createQueryBuilder('need')
      .where('need.child_id = :childId', { childId: childId })
      .andWhere('need.status = 1')
      .andWhere('need.isDeleted = :needDeleted', { needDeleted: false })
      .getCount();

    const completePay = await this.flaskNeedRepository
      .createQueryBuilder('need')
      .where('need.child_id = :childId', { childId: childId })
      .andWhere('need.status = 2')
      .andWhere('need.isDeleted = :needDeleted', { needDeleted: false })
      .getCount();

    const purchased = await this.flaskNeedRepository
      .createQueryBuilder('need')
      .where('need.child_id = :childId', { childId: childId })
      .andWhere('need.type = :type', { type: 1 })
      .andWhere('need.status = 3')
      .andWhere('need.isDeleted = :needDeleted', { needDeleted: false })
      .getCount();

    const moneyToNgo = await this.flaskNeedRepository
      .createQueryBuilder('need')
      .where('need.child_id = :childId', { childId: childId })
      .andWhere('need.type = :type', { type: 0 })
      .andWhere('need.status = 3')
      .andWhere('need.isDeleted = :needDeleted', { needDeleted: false })
      .getCount();

    const deliveredNgo = await this.flaskNeedRepository
      .createQueryBuilder('need')
      .where('need.child_id = :childId', { childId: childId })
      .andWhere('need.type = :type', { type: 1 })
      .andWhere('need.status = 4')
      .andWhere('need.isDeleted = :needDeleted', { needDeleted: false })
      .getCount();

    const deliveredChild = await this.flaskNeedRepository
      .createQueryBuilder('need')
      .select(['need.id', 'need.child_id', 'need.child_delivery_date'])
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
        all,
        confirmed,
        unConfirmed,
        confirmedNotPaid,
        completePay,
        partialPay,
        purchased,
        moneyToNgo,
        deliveredNgo,
        deliveredChild,
      },
    };
  }

  async getChildFamilyAnalytic(childId: number) {
    const family = await this.flaskFamilyRepository
      .createQueryBuilder('family')
      .leftJoinAndSelect(
        UserFamily,
        'userFamily',
        'userFamily.id_family = family.id',
      )
      .where('family.Id_child = :childId', { childId: childId })
      .getOne();

    const familyMembers = await this.flaskUserFamilyRepository
      .createQueryBuilder('userFamily')
      .leftJoinAndSelect(Family, 'family', 'family.id = userFamily.id_family')
      .where('userFamily.id_family = :familyId', { familyId: family.id })
      .andWhere('userFamily.isDeleted = :isDeleted', { isDeleted: false })
      .getCount();

    // const sayFamilyCount = await this.flaskChildRepository
    //   .createQueryBuilder('child')
    //   .leftJoinAndSelect(Family, "family", "family.id_child = child.id")
    //   .where("child.id = :childId", { childId: childId })
    //   .getOne()
    //   .then((c) => c.sayFamilyCount);

    const paidNeeds = await this.flaskNeedRepository
      .createQueryBuilder('need')
      .select(['need.id'])
      .where('need.child_id = :childId', { childId: childId })
      .andWhere('need.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('need.status > 0')
      .getMany()
      .then((needs) => {
        return needs.map((n) => n.id);
      });

    const activeUsersId = [];
    await this.flaskUserFamilyRepository
      .createQueryBuilder('userFamily')
      .leftJoinAndSelect(Family, 'family', 'family.id = userFamily.id_family')
      .where('userFamily.id_family = :familyId', { familyId: family.id })
      .andWhere('userFamily.isDeleted = :isDeleted', { isDeleted: false })
      .getMany()
      .then(async (members) => {
        let payments: Payment[];
        for await (const user of members) {
          await this.flaskPaymentRepository
            .createQueryBuilder('payment')
            .where('payment.id_user = :userId', { userId: user.id_user })
            .getMany()
            .then((userPayments) => {
              userPayments.map((p) => {
                if (p.verified && paidNeeds.includes(p.id_need)) {
                  if (!activeUsersId.includes(p.id_user)) {
                    // ✅ only runs if value not in array
                    activeUsersId.push(p.id_user);
                  }
                }
              });
            });
        }
        return payments;
      });

    return {
      family: {
        familyId: family.id,
        activeUsers: activeUsersId.length,
        familyMembers,
      },
    };
  }

  async getEcosystemAnalytic() {
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
      .andWhere('child.id_ngo != 3')
      .andWhere('child.id_ngo != 14')
      .andWhere('child.isConfirmed = :isConfirmed', { isConfirmed: true })
      .getMany()
      .then(async (children) => {
        for await (const c of children) {
          const {
            child,
            childNeedsStats: {
              all,
              confirmed,
              unConfirmed,
              confirmedNotPaid,
              completePay,
              partialPay,
              purchased,
              moneyToNgo,
              deliveredNgo,
              deliveredChild,
            },
          } = await this.getChildNeedsAnalytic(c.id);

          childrenList.push({
            child,
            childNeedsStats: {
              all,
              confirmed,
              unConfirmed,
              confirmedNotPaid,
              completePay,
              partialPay,
              purchased,
              moneyToNgo,
              deliveredNgo,
              deliveredChild,
            },
          });

          listAll = [...listAll, all];
          listConfirmed = [...listConfirmed, confirmed];
          listUnConfirmed = [...listUnConfirmed, unConfirmed];
          listConfirmedNotPaid = [...listConfirmedNotPaid, confirmedNotPaid];
          listCompletePay = [...listCompletePay, completePay];
          listPartialPay = [...listPartialPay, partialPay];
          listPurchased = [...listPurchased, purchased];
          listMoneyToNgo = [...listMoneyToNgo, moneyToNgo];
          listDeliveredNgo = [...listDeliveredNgo, deliveredNgo];
          listDeliveredChild = [...listDeliveredChild, deliveredChild];
        }
      });

    const totalFamilies = await this.flaskFamilyRepository
      .createQueryBuilder('family')
      .leftJoinAndSelect(
        UserFamily,
        'userFamily',
        'userFamily.id_family = family.id',
      )
      .andWhere('family.isDeleted = :isDeleted', { isDeleted: false })
      .getCount();

    const totalFamilyMembers = await this.flaskUserFamilyRepository
      .createQueryBuilder('userFamily')
      .leftJoinAndSelect(Family, 'family', 'family.id = userFamily.id_family')
      .andWhere('userFamily.isDeleted = :isDeleted', { isDeleted: false })
      .getCount();

    return {
      meanNeedsPerChild: Math.round(
        listAll.reduce((partialSum, a) => partialSum + a, 0) / listAll.length,
      ),
      meanConfirmedPerChild: Math.round(
        listConfirmed.reduce((partialSum, a) => partialSum + a, 0) /
          listConfirmed.length,
      ),
      meanUnConfirmedPerChild: Math.round(
        listUnConfirmed.reduce((partialSum, a) => partialSum + a, 0) /
          listUnConfirmed.length,
      ),
      meanConfirmedNotPaidPerChild: Math.round(
        listConfirmedNotPaid.reduce((partialSum, a) => partialSum + a, 0) /
          listConfirmedNotPaid.length,
      ),
      meanCompletePayPerChild: Math.round(
        listCompletePay.reduce((partialSum, a) => partialSum + a, 0) /
          listCompletePay.length,
      ),
      meanPartialPayPerChild: Math.round(
        listPartialPay.reduce((partialSum, a) => partialSum + a, 0) /
          listPartialPay.length,
      ),
      meanPurchasedPerChild: Math.round(
        listPurchased.reduce((partialSum, a) => partialSum + a, 0) /
          listPurchased.length,
      ),
      meanMoneyToNgoPerChild: Math.round(
        listMoneyToNgo.reduce((partialSum, a) => partialSum + a, 0) /
          listMoneyToNgo.length,
      ),
      meanDeliveredNgoPerChild: Math.round(
        listDeliveredNgo.reduce((partialSum, a) => partialSum + a, 0) /
          listDeliveredNgo.length,
      ),
      meanDeliveredChildPerChild: Math.round(
        listDeliveredChild.reduce((partialSum, a) => partialSum + a, 0) /
          listDeliveredChild.length,
      ),
      totalFamilies,
      totalFamilyMembers,
      meanFamilyMembers: Math.round(totalFamilyMembers / totalFamilies),
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
