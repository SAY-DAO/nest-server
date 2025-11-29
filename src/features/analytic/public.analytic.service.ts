/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Need } from '../../entities/flaskEntities/need.entity';
import { Brackets, Repository } from 'typeorm';
import { SummaryDto } from './dto/summary.dto';
import { User } from 'src/entities/flaskEntities/user.entity';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  ChildExistence,
  NeedTypeEnum,
  PaymentStatusEnum,
  VirtualFamilyRole,
} from 'src/types/interfaces/interface';
import { Payment } from 'src/entities/flaskEntities/payment.entity';
import { Child } from 'src/entities/flaskEntities/child.entity';
import {
  Paginated,
  PaginateQuery,
  paginate as nestPaginate,
} from 'nestjs-paginate';
import {
  SeasonComparisonItemDto,
  SeasonComparisonResponseDto,
} from './dto/season-comparison-response.dto';
import { productCategories, serviceCategories } from 'src/utils/catagories';
import { AllUserEntity } from 'src/entities/user.entity';
import { jalaliYearRangeIso, mergeByJalaliMonth } from '../../utils/jalali';
import { containsAny } from '../../utils/helpers';
import config from '../../config';
import { Family } from 'src/entities/flaskEntities/family.entity';
import { UserFamily } from 'src/entities/flaskEntities/userFamily.entity';
import { NGO } from 'src/entities/flaskEntities/ngo.entity';
import { NeedFamily } from 'src/entities/flaskEntities/needFamily';

@Injectable()
export class AnalyticPublicService {
  private readonly logger = new Logger(AnalyticPublicService.name);

  constructor(
    @InjectRepository(Need, 'flaskPostgres')
    private flaskNeedRepository: Repository<Need>,
    @InjectRepository(NGO, 'flaskPostgres')
    private flaskNgoRepository: Repository<NGO>,
    @InjectRepository(User, 'flaskPostgres')
    private flaskUserRepository: Repository<User>,
    @InjectRepository(Payment, 'flaskPostgres')
    private flaskPaymentRepository: Repository<Payment>,
    @InjectRepository(Child, 'flaskPostgres')
    private flaskChildRepository: Repository<Child>,
    @InjectRepository(Family, 'flaskPostgres')
    private flaskFamilyRepository: Repository<Family>,
    @InjectRepository(UserFamily, 'flaskPostgres')
    private flaskUserFamilyRepository: Repository<UserFamily>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,

    @InjectRepository(AllUserEntity)
    private allUserRepository: Repository<AllUserEntity>,
  ) {}

  async getDeliveredNeedsAnalytic(type: NeedTypeEnum, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
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
      .andWhere('need.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('need.type = :type', { type })
      .andWhere('need.child_delivery_date IS NOT NULL')
      .orderBy('need.child_delivery_date', 'DESC')
      .take(limit)
      .skip(skip)
      .getManyAndCount();
  }

  async getSummary(useCache = true): Promise<SummaryDto> {
    const cacheKey = 'reports:summary';
    const ttlSeconds = Number(process.env.REPORTS_CACHE_TTL ?? 10000);

    if (useCache && ttlSeconds > 0) {
      try {
        const cached = await this.cacheManager.get<SummaryDto>(cacheKey);
        if (cached) return cached;
      } catch (e) {
        this.logger.warn(
          'Cache read failed for reports summary: ' + (e as any).message,
        );
      }
    }
    try {
      const children = await this.getChildrenAnalytic();
      const ngos = await this.flaskNgoRepository
        .createQueryBuilder('ngo')
        .where('ngo.id NOT IN (:...testNgoIds)', {
          testNgoIds: [3, 14],
        })
        .andWhere('ngo.isDeleted = :isDeleted', { isDeleted: false })
        .andWhere('ngo.isActive = :isActive', { isActive: true })
        .cache(true)
        .getMany();

      const activeUsersCount = config().dataCache.fetchFamilyCount();

      const totalFamilyMembersCount = this.flaskUserFamilyRepository
        .createQueryBuilder('userFamily')
        .leftJoinAndSelect(Family, 'family', 'family.id = userFamily.id_family')
        .where('family.isDeleted = :isFamilyDeleted', {
          isFamilyDeleted: false,
        })
        .andWhere('userFamily.isDeleted = :isDeleted', { isDeleted: false })
        .getCount();

      const totalUsersPromise = this.flaskUserRepository
        .createQueryBuilder('user')
        .where(
          new Brackets((qb) => {
            qb.where('user.is_email_verified = TRUE').orWhere(
              'user.is_phonenumber_verified = TRUE',
            );
          }),
        )
        .andWhere('user.isDeleted = :isDeleted', { isDeleted: false })
        .andWhere('user.firstName != :firstName', { firstName: 'SAY' })
        .getCount();

      const totalPaymentsPromise = this.flaskPaymentRepository
        .createQueryBuilder('payment')
        .leftJoinAndMapOne(
          'payment.need',
          Need,
          'need',
          'need.id = payment.id_need',
        )
        .select('COALESCE(SUM(payment.need_amount), 0)', 'total')
        .where('payment.verified IS NOT NULL')
        // .andWhere('payment.desc != :desc', { desc: 'Refund payment' }) // This does not work since refund is negative we can check for amount > 0
        .andWhere('payment.need_amount > :amount', { amount: 0 }) // Refund are not included/deducted from total
        .andWhere('need.isDeleted = :isDeleted', { isDeleted: false })
        .getRawOne();

      const totalAvailableNeedsPromise = this.flaskNeedRepository
        .createQueryBuilder('need')
        .select('COUNT(need.id)', 'count')
        .where('need.isDeleted = :isDeleted', { isDeleted: false })
        .andWhere('need.confirmDate IS NOT NULL')
        .andWhere('need.status < :status', {
          status: PaymentStatusEnum.COMPLETE_PAY,
        })
        .getCount();

      const totalDoneNeedsPromise = this.flaskNeedRepository
        .createQueryBuilder('need')
        .select('COUNT(need.id)', 'count')
        .where('need.isDeleted = :isDeleted', { isDeleted: false })
        .andWhere('need.status >= :status', {
          status: PaymentStatusEnum.COMPLETE_PAY,
        })
        .getCount();

      const [uRes, anRes, pRes, dnRes, fmRes] = await Promise.all([
        totalUsersPromise,
        totalAvailableNeedsPromise,
        totalPaymentsPromise,
        totalDoneNeedsPromise,
        totalFamilyMembersCount,
      ]);

      const result: SummaryDto = {
        children,
        ngos,
        activeUsersCount,
        totalUsers: Number(uRes ?? 0),
        totalNotDoneNeeds: Number(anRes ?? 0),
        totalPayments: Number(pRes.total ?? 0),
        totalDoneNeeds: Number(dnRes ?? 0),
        totalFamilyMembers: Number(fmRes ?? 0),
      };

      if (useCache && ttlSeconds > 0) {
        try {
          await this.cacheManager.set(cacheKey, result, 10);
        } catch (e) {
          this.logger.warn(
            'Cache write failed for reports summary: ' + (e as any).message,
          );
        }
      }

      return result;
    } catch (err) {
      this.logger.error('Failed to fetch summary via QueryBuilder', err as any);
      throw new InternalServerErrorException('Failed to fetch reports summary');
    }
  }

  async getTransactions(options: PaginateQuery): Promise<Paginated<Need>> {
    try {
      const queryBuilder = this.flaskNeedRepository
        .createQueryBuilder('need')
        .leftJoinAndMapMany('need.p', Payment, 'p', ' p.id_need = need.id')
        .where('p.verified IS NOT NULL')
        .andWhere('need.isDeleted = :isNeedDeleted', { isNeedDeleted: false })
        .select([
          'need.id',
          'need.type',
          'need.title',
          'need.name_translations',
          'need._cost',
          'need.purchase_cost',
          'need.link',
          'need.status',
          'need.child_id',
          'need.deliveryCode',
          'need.img',
          'need.imageUrl',
          'need.purchase_date',
          'need.doneAt',
          'need.ngo_delivery_date',
          'need.child_delivery_date',
          'need.expected_delivery_date',
          'need.confirmDate',
          'need.created',
          'need.updated',
          'need.deleted_at',
          'need.bank_track_id',
          'p.id',
          'p.id_need',
          'p.id_user',
          'p.created',
          'p.need_amount',
          'p.donation_amount',
          'p.credit_amount',
          'p.order_id',
          'p.verified',
          'p.gateway_track_id',
        ])
        .orderBy('need.child_delivery_date', 'DESC')
        .cache(true);
      return await nestPaginate<Need>(options, queryBuilder, {
        sortableColumns: ['id'],
        defaultSortBy: [['updated', 'DESC']],
        nullSort: 'last',
      });
    } catch (err) {
      this.logger.error(
        'Failed to fetch transactions via QueryBuilder',
        err as any,
      );
      throw new InternalServerErrorException('Failed to fetch transactions');
    }
  }

  // Payment season comparison
  public async getPaymentComparison(
    targetJalaliYear: number,
    prevJalaliYear: number,
  ): Promise<SeasonComparisonItemDto[]> {
    const currRange = jalaliYearRangeIso(targetJalaliYear);
    const prevRange = jalaliYearRangeIso(prevJalaliYear);

    const payCurrRows = await this.flaskPaymentRepository
      .createQueryBuilder('p')
      .leftJoinAndMapOne('p.n', Need, 'n', 'n.id = p.id_need')
      .select('EXTRACT(MONTH FROM p.created)::int', 'month')
      .addSelect('EXTRACT(DAY FROM p.created)::int', 'day')
      .addSelect('SUM(COALESCE(p.need_amount,0))', 'value')
      .where('p.created >= :start AND p.created < :end', {
        start: currRange.startIso,
        end: currRange.endIso,
      })
      .andWhere('p.verified IS NOT NULL')
      .andWhere('n.isDeleted = :isNeedDeleted', { isNeedDeleted: false })
      .andWhere('p.need_amount > :amount', { amount: 0 })
      .groupBy('month, day')
      .getRawMany();

    const payPrevRows = await this.flaskPaymentRepository
      .createQueryBuilder('p')
      .leftJoinAndMapOne('p.n', Need, 'n', 'n.id = p.id_need')
      .select('EXTRACT(MONTH FROM p.created)::int', 'month')
      .addSelect('EXTRACT(DAY FROM p.created)::int', 'day') // include day for accurate mapping
      .addSelect('SUM(COALESCE(p.need_amount,0))', 'value')
      .where('p.created >= :start AND p.created < :end', {
        start: prevRange.startIso,
        end: prevRange.endIso,
      })
      .andWhere('p.verified IS NOT NULL')
      .andWhere('n.isDeleted = :isNeedDeleted', { isNeedDeleted: false })
      .andWhere('p.need_amount > :amount', { amount: 0 })
      .groupBy('month, day')
      .getRawMany();

    return mergeByJalaliMonth(
      payCurrRows,
      payPrevRows,
      targetJalaliYear,
      prevJalaliYear,
    );
  }

  // User season comparison
  public async getUserComparison(
    targetJalaliYear: number,
    prevJalaliYear: number,
  ): Promise<SeasonComparisonItemDto[]> {
    const currRange = jalaliYearRangeIso(targetJalaliYear);
    const prevRange = jalaliYearRangeIso(prevJalaliYear);

    const userCurrRows = await this.flaskUserRepository
      .createQueryBuilder('u')
      .select('EXTRACT(MONTH FROM u.created)::int', 'month')
      .addSelect('EXTRACT(DAY FROM u.created)::int', 'day')
      .addSelect('COUNT(u.id)', 'value')
      .where(
        new Brackets((qb) => {
          qb.where('u.is_email_verified = TRUE').orWhere(
            'u.is_phonenumber_verified = TRUE',
          );
        }),
      )
      .andWhere('u.created >= :start AND u.created < :end', {
        start: currRange.startIso,
        end: currRange.endIso,
      })
      .andWhere('u.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('u.firstName != :firstName', { firstName: 'SAY' })
      .groupBy('month, day')
      .getRawMany();

    const userPrevRows = await this.flaskUserRepository
      .createQueryBuilder('u')
      .select('EXTRACT(MONTH FROM u.created)::int', 'month')
      .addSelect('EXTRACT(DAY FROM u.created)::int', 'day')
      .addSelect('COUNT(u.id)', 'value')
      .where(
        new Brackets((qb) => {
          qb.where('u.is_email_verified = TRUE').orWhere(
            'u.is_phonenumber_verified = TRUE',
          );
        }),
      )
      .andWhere('u.created >= :start AND u.created < :end', {
        start: prevRange.startIso,
        end: prevRange.endIso,
      })
      .andWhere('u.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('u.firstName != :firstName', { firstName: 'SAY' })
      .groupBy('month, day')
      .getRawMany();

    return mergeByJalaliMonth(
      userCurrRows,
      userPrevRows,
      targetJalaliYear,
      prevJalaliYear,
    );
  }

  // Need season comparison
  public async getNeedComparison(
    targetJalaliYear: number,
    prevJalaliYear: number,
  ): Promise<SeasonComparisonItemDto[]> {
    const currRange = jalaliYearRangeIso(targetJalaliYear);
    const prevRange = jalaliYearRangeIso(prevJalaliYear);

    // current Jalali year (include day for accurate mapping)
    const needCurrRows = await this.flaskNeedRepository
      .createQueryBuilder('n')
      .where('n.isConfirmed = :isConfirmed', { isConfirmed: true })
      .andWhere('n.isDeleted = :isNeedDeleted', { isNeedDeleted: false })
      .andWhere('n.doneAt >= :start AND n.doneAt < :end', {
        start: currRange.startIso,
        end: currRange.endIso,
      })
      .select('EXTRACT(MONTH FROM n.doneAt)::int', 'month')
      .addSelect('EXTRACT(DAY FROM n.doneAt)::int', 'day')
      .addSelect('COUNT(n.id)', 'value') // alias value for mergeByJalaliMonth
      .groupBy('month, day')
      .getRawMany();

    // previous Jalali year (include day for accuracy)
    const needPrevRows = await this.flaskNeedRepository
      .createQueryBuilder('n')
      .where('n.isConfirmed = :isConfirmed', { isConfirmed: true })
      .andWhere('n.isDeleted = :isNeedDeleted', { isNeedDeleted: false })
      .andWhere('n.doneAt >= :start AND n.doneAt < :end', {
        start: prevRange.startIso,
        end: prevRange.endIso,
      })
      .select('EXTRACT(MONTH FROM n.doneAt)::int', 'month')
      .addSelect('EXTRACT(DAY FROM n.doneAt)::int', 'day')
      .addSelect('COUNT(n.id)', 'value')
      .groupBy('month, day')
      .getRawMany();

    // merge and return
    return mergeByJalaliMonth(
      needCurrRows,
      needPrevRows,
      targetJalaliYear,
      prevJalaliYear,
    );
  }

  public async getChildComparison(
    targetJalaliYear: number,
    prevJalaliYear: number,
  ): Promise<SeasonComparisonItemDto[]> {
    const currRange = jalaliYearRangeIso(targetJalaliYear);
    const prevRange = jalaliYearRangeIso(prevJalaliYear);

    // current Jalali year (include day for accurate mapping)
    const childCurrRows = await this.flaskChildRepository
      .createQueryBuilder('c')
      .where('c.isConfirmed = :isConfirmed', { isConfirmed: true })
      // .andWhere('c.existence_status = :existence_status', {
      //   existence_status: ChildExistence.AlivePresent,
      // })
      .andWhere('c.isMigrated = :childIsMigrated', {
        childIsMigrated: false,
      })
      .andWhere('c.id_ngo NOT IN (:...testNgoIds)', {
        testNgoIds: [3, 14],
      })
      .andWhere('c.confirmDate >= :start AND c.confirmDate < :end', {
        start: currRange.startIso,
        end: currRange.endIso,
      })
      .select('EXTRACT(MONTH FROM c.confirmDate)::int', 'month')
      .addSelect('EXTRACT(DAY FROM c.confirmDate)::int', 'day')
      .addSelect('COUNT(c.id)', 'value') // alias value for mergeByJalaliMonth
      .groupBy('month, day')
      .getRawMany();

    // previous Jalali year (include day for accuracy)
    const childPrevRows = await this.flaskChildRepository
      .createQueryBuilder('c')
      .where('c.isConfirmed = :isConfirmed', { isConfirmed: true })
      .andWhere('c.existence_status = :existence_status', {
        existence_status: ChildExistence.AlivePresent,
      })
      .andWhere('c.isMigrated = :childIsMigrated', {
        childIsMigrated: false,
      })
      .andWhere('c.id_ngo NOT IN (:...testNgoIds)', {
        testNgoIds: [3, 14],
      })
      .andWhere('c.confirmDate >= :start AND c.confirmDate < :end', {
        start: prevRange.startIso,
        end: prevRange.endIso,
      })
      .select('EXTRACT(MONTH FROM c.confirmDate)::int', 'month')
      .addSelect('EXTRACT(DAY FROM c.confirmDate)::int', 'day')
      .addSelect('COUNT(c.id)', 'value') // alias value for mergeByJalaliMonth
      .groupBy('month, day')
      .getRawMany();

    // merge and return
    return mergeByJalaliMonth(
      childCurrRows,
      childPrevRows,
      targetJalaliYear,
      prevJalaliYear,
    );
  }

  async getSeasonComparison(
    targetYear?: string,
    useCache = true,
  ): Promise<SeasonComparisonResponseDto> {
    const cacheKey = 'reports:seasonComparison';
    const ttlSeconds = Number(process.env.REPORTS_CACHE_TTL ?? 10000);

    if (useCache && ttlSeconds > 0) {
      try {
        const cached = await this.cacheManager.get<SeasonComparisonResponseDto>(
          cacheKey,
        );
        if (cached) return cached;
      } catch (e) {
        this.logger.warn(
          'Cache read failed for reports summary: ' + (e as any).message,
        );
      }
    }
    try {
      // 1) determine target year (season)
      let targetJalaliYear: number | null = null;
      if (targetYear && String(targetYear).trim()) {
        const asNum = Number(targetYear);
        if (Number.isFinite(asNum) && Number.isInteger(asNum))
          targetJalaliYear = asNum;
      }

      // 2) determine previous year
      let prevJalaliYear: number | null = null;
      if (!prevJalaliYear) prevJalaliYear = targetJalaliYear - 1;

      // 3) Query counts grouped by month for target year

      const userItems: SeasonComparisonItemDto[] = await this.getUserComparison(
        targetJalaliYear,
        prevJalaliYear,
      );

      const payItems: SeasonComparisonItemDto[] =
        await this.getPaymentComparison(targetJalaliYear, prevJalaliYear);

      const needItems: SeasonComparisonItemDto[] = await this.getNeedComparison(
        targetJalaliYear,
        prevJalaliYear,
      );

      const childItems: SeasonComparisonItemDto[] =
        await this.getChildComparison(targetJalaliYear, prevJalaliYear);

      const result: SeasonComparisonResponseDto = {
        doneNeeds: { data: needItems, season: String(targetJalaliYear) },
        totalUsers: { data: userItems, season: String(targetJalaliYear) },
        pays: { data: payItems, season: String(targetJalaliYear) },
        children: { data: childItems, season: String(targetJalaliYear) },
      };

      if (useCache && ttlSeconds > 0) {
        try {
          await this.cacheManager.set(cacheKey, result, 10);
        } catch (e) {
          this.logger.warn(
            'Cache write failed for reports season comparison: ' +
              (e as any).message,
          );
        }
      }

      return result;
    } catch (e) {
      this.logger.error(
        'Error building season comparison from users.createdAt',
        e as any,
      );
      return {
        doneNeeds: {
          data: [],
          season: String(targetYear ?? new Date().getFullYear()),
        },
        totalUsers: {
          data: [],
          season: String(targetYear ?? new Date().getFullYear()),
        },
        pays: {
          data: [],
          season: String(targetYear ?? new Date().getFullYear()),
        },
        children: {
          data: [],
          season: String(targetYear ?? new Date().getFullYear()),
        },
      };
    }
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
        existence_status: ChildExistence.DEAD,
      })
      .andWhere('child.isConfirmed = :isConfirmed', { isConfirmed: true })
      .andWhere('ngo.isDeleted = :isDeleted', { isDeleted: false })
      // .andWhere('ngo.isActive = :isActive', { isActive: true })
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
        existence_status: ChildExistence.AlivePresent,
      })
      .andWhere('child.isConfirmed = :isConfirmed', { isConfirmed: true })
      .andWhere('ngo.isDeleted = :isDeleted', { isDeleted: false })
      // .andWhere('ngo.isActive = :isActive', { isActive: true })
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
        existence_status: ChildExistence.AliveGone,
      })
      .andWhere('child.isConfirmed = :isConfirmed', { isConfirmed: true })
      .andWhere('ngo.isDeleted = :isDeleted', { isDeleted: false })
      // .andWhere('ngo.isActive = :isActive', { isActive: true })
      .andWhere('child.isMigrated = :childIsMigrated', {
        childIsMigrated: false,
      })
      .andWhere('child.id_ngo NOT IN (:...testNgoIds)', {
        testNgoIds: [3, 14],
      })
      .select(['child.id', 'ngo'])
      .getCount();

    const tempGone = await this.flaskChildRepository
      .createQueryBuilder('child')
      .leftJoinAndMapOne('child.ngo', NGO, 'ngo', 'ngo.id = child.id_ngo')
      .where('child.existence_status = :existence_status', {
        existence_status: ChildExistence.TempGone,
      })
      .andWhere('child.isConfirmed = :isConfirmed', { isConfirmed: true })
      .andWhere('ngo.isDeleted = :isDeleted', { isDeleted: false })
      // .andWhere('ngo.isActive = :isActive', { isActive: true })
      .andWhere('child.isMigrated = :childIsMigrated', {
        childIsMigrated: false,
      })
      .andWhere('child.id_ngo NOT IN (:...testNgoIds)', {
        testNgoIds: [3, 14],
      })
      .select(['child.id', 'ngo'])
      .getCount();

    const confirmed = await this.flaskChildRepository
      .createQueryBuilder('child')
      .leftJoinAndMapOne('child.ngo', NGO, 'ngo', 'ngo.id = child.id_ngo')
      .andWhere('child.isConfirmed = :isConfirmed', { isConfirmed: true })
      .andWhere('ngo.isDeleted = :isDeleted', { isDeleted: false })
      // .andWhere('ngo.isActive = :isActive', { isActive: true })
      .andWhere('child.isMigrated = :childIsMigrated', {
        childIsMigrated: false,
      })
      .andWhere('child.id_ngo NOT IN (:...testNgoIds)', {
        testNgoIds: [3, 14],
      })
      .select(['child.id', 'ngo'])
      .getCount();

    return {
      noNeeds: config().dataCache.fetchChildrenNoNeeds(),
      allChildren: allChildren[1],
      dead,
      alivePresent,
      aliveGone,
      tempGone,
      confirmed,
    };
  }

  async getTheNetwork(): Promise<any> {
    return (
      this.flaskChildRepository
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
        .andWhere('userFamily.isDeleted = :isDeleted', { isDeleted: false })
        .andWhere('child.isMigrated = :childIsMigrated', {
          childIsMigrated: false,
        })
        // .andWhere('child.existence_status = :existence_status', {
        //   existence_status: ChildExistence.AlivePresent,
        // })
        .andWhere('child.id_ngo NOT IN (:...testNgoIds)', {
          testNgoIds: [3, 14],
        })
        .select([
          'child.id',
          'child.awakeAvatarUrl',
          'family.id',
          'userFamily.id',
          'userFamily.flaskFamilyRole',
          'user.id',
          'user.avatarUrl',
        ])
        .cache(true)
        .getMany()
    );
  }
}
