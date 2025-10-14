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
import { NeedFamily } from 'src/entities/flaskEntities/needFamily';
import { CheckPointEntity } from 'src/entities/checkpoint.entity';
import { AllUserEntity } from 'src/entities/user.entity';
import { jalaliYearRangeIso, mergeByJalaliMonth } from '../../utils/jalali';
import {
  containsAny,
  escapeRegExp,
  normalizeForMatch,
} from '../../utils/helpers';

@Injectable()
export class AnalyticPublicService {
  private readonly logger = new Logger(AnalyticPublicService.name);

  constructor(
    @InjectRepository(Need, 'flaskPostgres')
    private flaskNeedRepository: Repository<Need>,
    @InjectRepository(User, 'flaskPostgres')
    private flaskUserRepository: Repository<User>,
    @InjectRepository(Payment, 'flaskPostgres')
    private flaskPaymentRepository: Repository<Payment>,
    @InjectRepository(Child, 'flaskPostgres')
    private flaskChildRepository: Repository<Child>,
    @InjectRepository(CheckPointEntity)
    private checkPointRepository: Repository<CheckPointEntity>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,

    @InjectRepository(AllUserEntity)
    private allUserRepository: Repository<AllUserEntity>,
  ) {}

  async getSummary(useCache = true): Promise<SummaryDto> {
    const cacheKey = 'reports:summary';
    const ttlSeconds = Number(process.env.REPORTS_CACHE_TTL ?? 10);

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

      const totalAvailableNeedsPromise = this.flaskNeedRepository
        .createQueryBuilder('need')
        .select('COUNT(need.id)', 'count')
        .where('need.isDeleted = :isDeleted', { isDeleted: false })
        .andWhere('need.confirmDate IS NOT NULL')
        .andWhere('need.status < :status', {
          status: PaymentStatusEnum.COMPLETE_PAY,
        })
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

      const totalDoneNeedsPromise = this.flaskNeedRepository
        .createQueryBuilder('need')
        .select('COUNT(need.id)', 'count')
        .where('need.isDeleted = :isDeleted', { isDeleted: false })
        .andWhere('need.confirmDate IS NOT NULL')
        .andWhere('need.status >= :status', {
          status: PaymentStatusEnum.COMPLETE_PAY,
        })
        .getCount();

      const totalChildrenPromise = this.flaskChildRepository
        .createQueryBuilder('child')
        .where('child.existence_status = :existence_status', {
          existence_status: ChildExistence.AlivePresent,
        })
        .andWhere('child.isConfirmed = :isConfirmed', { isConfirmed: true })
        .andWhere('child.isMigrated = :childIsMigrated', {
          childIsMigrated: false,
        })
        .andWhere('child.id_ngo NOT IN (:...testNgoIds)', {
          testNgoIds: [3, 14],
        })
        .getCount();

      const [uRes, anRes, pRes, dnRes, cRes] = await Promise.all([
        totalUsersPromise,
        totalAvailableNeedsPromise,
        totalPaymentsPromise,
        totalDoneNeedsPromise,
        totalChildrenPromise,
      ]);

      const result: SummaryDto = {
        totalUsers: Number(uRes ?? 0),
        totalNeeds: Number(anRes ?? 0),
        totalPayments: Number(pRes.total ?? 0),
        totalDoneNeeds: Number(dnRes ?? 0),
        totalChildren: Number(cRes ?? 0),
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
  public async getPaymentSeasonComparison(
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
  public async getUserSeasonComparison(
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
  public async getNeedSeasonComparison(
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

  // Child season comparison
  public async getChildSeasonComparison(
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
    season?: string,
    useCache = true,
  ): Promise<SeasonComparisonResponseDto> {
    const cacheKey = 'reports:seasonComparison';
    const ttlSeconds = Number(process.env.REPORTS_CACHE_TTL ?? 10);

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
      if (season && String(season).trim()) {
        const asNum = Number(season);
        if (Number.isFinite(asNum) && Number.isInteger(asNum))
          targetJalaliYear = asNum;
      }

      // 2) determine previous year
      let prevJalaliYear: number | null = null;
      if (!prevJalaliYear) prevJalaliYear = targetJalaliYear - 1;

      // 3) Query counts grouped by month for target year

      const userItems: SeasonComparisonItemDto[] =
        await this.getUserSeasonComparison(targetJalaliYear, prevJalaliYear);

      const payItems: SeasonComparisonItemDto[] =
        await this.getPaymentSeasonComparison(targetJalaliYear, prevJalaliYear);

      const needItems: SeasonComparisonItemDto[] =
        await this.getNeedSeasonComparison(targetJalaliYear, prevJalaliYear);

      const childItems: SeasonComparisonItemDto[] =
        await this.getChildSeasonComparison(targetJalaliYear, prevJalaliYear);

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
          season: String(season ?? new Date().getFullYear()),
        },
        totalUsers: {
          data: [],
          season: String(season ?? new Date().getFullYear()),
        },
        pays: {
          data: [],
          season: String(season ?? new Date().getFullYear()),
        },
        children: {
          data: [],
          season: String(season ?? new Date().getFullYear()),
        },
      };
    }
  }

  // Helper: case-insensitive contains check
  private containsAny(text: string, keywords: string[]): boolean {
    if (!text) return false;
    const lower = text.toLowerCase();
    for (const kw of keywords) {
      if (!kw) continue;
      if (lower.indexOf(kw.toLowerCase()) !== -1) return true;
    }
    return false;
  }
  async getNeedsFrequency(
    options?: {
      limit?: number;
      since?: string;
      until?: string;
      filterByDoneAt?: boolean;
      similarityThreshold?: number;
    },
    useCache = true,
  ) {
    const cacheKey = 'reports:need-frequency';
    const ttlSeconds = Number(process.env.REPORTS_CACHE_TTL ?? 10);

    if (useCache && ttlSeconds > 0) {
      try {
        const cached = await this.cacheManager.get<any>(cacheKey);
        if (cached) return cached;
      } catch (e) {
        this.logger.warn(
          'Cache read failed for reports need-frequency: ' + (e as any).message,
        );
      }
    }

    const { limit = 20, since, until, filterByDoneAt = false } = options || {};

    const dateField = filterByDoneAt ? 'need."doneAt"' : 'need."created"';

    const qb = this.flaskNeedRepository
      .createQueryBuilder('need')
      .where('need.isConfirmed = :isConfirmed', { isConfirmed: true })
      .andWhere('need.isDeleted = :isNeedDeleted', { isNeedDeleted: false })
      .select([
        'need.id AS id',
        'need.title AS title',
        'need.name_translations AS name_translations',
        'need.type AS type',
        'need."doneAt" AS "doneAt"',
        'need."created" AS created',
      ]);

    if (since) qb.andWhere(`${dateField} >= :since`, { since });
    if (until) qb.andWhere(`${dateField} <= :until`, { until });

    const raw = await qb.getRawMany();

    const grouped = new Map<
      string,
      {
        id: string;
        name: string;
        totalCount: number;
        doneCount: number;
        membersSet: Set<string>;
        isAssigned: boolean;
        assignedCategoryKey: string | null;
      }
    >();

    const extractServiceName = (nt: any): string => {
      if (!nt) return '';
      if (typeof nt === 'string') {
        try {
          nt = JSON.parse(nt);
        } catch {
          // keep as string
        }
      }
      if (typeof nt === 'object' && nt !== null) {
        const prefer = ['en', 'fa', 'per', 'ps', 'default'];
        for (const k of prefer) {
          if (nt[k] && String(nt[k]).trim()) return String(nt[k]).trim();
        }
        for (const v of Object.values(nt)) {
          if (v && String(v).trim()) return String(v).trim();
        }
        return '';
      }
      return String(nt ?? '').trim();
    };

    const UNASSIGNED_PRODUCT = '__UNASSIGNED_PRODUCT__';
    const UNASSIGNED_SERVICE = '__UNASSIGNED_SERVICE__';

    for (const r of raw) {
      const needType = Number(r.type ?? 0);
      let searchText = '';
      let representativeName = '';

      if (needType === NeedTypeEnum.SERVICE) {
        let nt = r.name_translations;
        if (typeof nt === 'string') {
          try {
            nt = JSON.parse(nt);
          } catch {
            nt = nt;
          }
        }
        if (nt && typeof nt === 'object') {
          const vals = Object.values(nt).map((v) =>
            v == null ? '' : String(v),
          );
          searchText = vals.join(' ');
        } else {
          searchText = String(nt ?? '');
        }
        representativeName = extractServiceName(r.name_translations);
      } else {
        searchText = String(r.title ?? '');
        representativeName = String(r.title ?? '').trim();
      }

      if (!searchText || !String(searchText).trim()) continue;

      let assigned: string | null = null;

      if (needType === NeedTypeEnum.PRODUCT) {
        for (const [cat, kws] of Object.entries(productCategories)) {
          if (containsAny(searchText, kws)) {
            assigned = cat;
            break;
          }
        }
      } else {
        for (const [cat, kws] of Object.entries(serviceCategories)) {
          if (containsAny(searchText, kws)) {
            assigned = cat;
            break;
          }
        }
      }

      let groupKey: string;
      let displayName: string;
      let isAssigned = true;
      let assignedCategoryKey: string | null = assigned;

      if (!assigned) {
        isAssigned = false;
        if (needType === NeedTypeEnum.PRODUCT) {
          groupKey = UNASSIGNED_PRODUCT;
          displayName = 'Unassigned (product)';
        } else {
          groupKey = UNASSIGNED_SERVICE;
          displayName = 'Unassigned (service)';
        }
        assignedCategoryKey = null;
      } else {
        groupKey = String(assigned);
        displayName = String(assigned);
      }

      if (!grouped.has(groupKey)) {
        grouped.set(groupKey, {
          id: groupKey,
          name: displayName,
          totalCount: 0,
          doneCount: 0,
          membersSet: new Set<string>(),
          isAssigned,
          assignedCategoryKey,
        });
      }

      const g = grouped.get(groupKey)!;
      g.totalCount += 1;
      if (r.doneAt) g.doneCount += 1;

      const rep =
        (representativeName && String(representativeName).trim()) ||
        String(r.title ?? '').trim() ||
        `need-${r.id}`;
      if (rep) g.membersSet.add(String(rep));
    }

    const out = Array.from(grouped.values())
      .map((g) => {
        const membersArr = Array.from(g.membersSet).slice(0, 200);
        return {
          id: g.id,
          name: g.name,
          assignedCategory: g.isAssigned ? g.name : null,
          isAssigned: g.isAssigned,
          totalCount: g.totalCount,
          doneCount: g.doneCount,
          members: membersArr,
          membersCount: g.membersSet.size,
          membersHasMore: g.membersSet.size > membersArr.length,
        };
      })
      .sort((a, b) => b.totalCount - a.totalCount)
      .slice(0, Number(limit));

    if (useCache && ttlSeconds > 0) {
      try {
        // <--- Fix: pass ttl as number (third param) per your CacheManager typing
        await this.cacheManager.set(cacheKey, out, ttlSeconds);
      } catch (e) {
        this.logger.warn(
          'Cache write failed for reports need frequency: ' +
            (e as any).message,
        );
      }
    }

    return out;
  }

  /**
   * Return the most recent 20 checkpoints ordered by checkpoint time (descending).
   * No filters, no pagination metadata — just an array of CheckPointEntity.
   */
  async findLatest20(): Promise<CheckPointEntity[]> {
    try {
      const qb = this.checkPointRepository
        .createQueryBuilder('cp')
        .select([
          'cp.id',
          'cp.title',
          'cp.description',
          'cp.type',
          'cp.url',
          'cp.checkPointDate', // adjust column name if different
          'cp.createdAt',
          'cp.confirmedAt',
          'cp.isConfirmed',
        ])
        .where('cp.isConfirmed = :isConfirmed', { isConfirmed: true })
        .orderBy('cp.checkPointDate', 'DESC')
        .addOrderBy('cp.createdAt', 'DESC')
        .take(20); // LIMIT 20

      const items = await qb.getMany();
      return items;
    } catch (err) {
      // optional: log(err)
      throw new InternalServerErrorException('Failed to fetch checkpoints');
    }
  }
}
