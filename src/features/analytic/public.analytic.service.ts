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
  PaymentStatusEnum,
} from 'src/types/interfaces/interface';
import { Payment } from 'src/entities/flaskEntities/payment.entity';
import { Child } from 'src/entities/flaskEntities/child.entity';
import {
  Paginated,
  PaginateQuery,
  paginate as nestPaginate,
} from 'nestjs-paginate';
import { SeasonComparisonResponseDto } from './dto/season-comparison-response.dto';
import { productCategories, serviceCategories } from 'src/utils/catagories';
import { NeedFamily } from 'src/entities/flaskEntities/needFamily';
import { CheckPointEntity } from 'src/entities/checkpoint.entity';
import { AllUserEntity } from 'src/entities/user.entity';

// Helper: month labels
const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const MONTH_LABELS_IR = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];
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
        .where('user.is_phonenumber_verified = :is_phonenumber_verified', {
          is_phonenumber_verified: true,
        })
        .orWhere('user.is_email_verified = :is_email_verified', {
          is_email_verified: true,
        })
        .andWhere('user.isDeleted = :isDeleted', { isDeleted: false })
        .andWhere('user.firstName != :firstName', { firstName: 'SAY' })
        .getCount();

      const totalAvailableNeedsPromise = this.flaskNeedRepository
        .createQueryBuilder('need')
        .select('COUNT(need.id)', 'count')
        .where('need.isDeleted = :isDeleted', { isDeleted: false })
        .andWhere('need.confirmDate IS NOT NULL')
        .andWhere('need.status <= :status', {
          status: PaymentStatusEnum.COMPLETE_PAY,
        })
        .getCount();

      const totalPaymentsPromise = this.flaskPaymentRepository
        .createQueryBuilder('payment')
        .select('COALESCE(SUM(payment.need_amount), 0)', 'total')
        .where('payment.verified IS NOT NULL')
        .andWhere('payment.need_amount > :amount', { amount: 0 }) // only positive amounts
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

  async getTransactions(options: PaginateQuery): Promise<Paginated<Payment>> {
    try {
      const queryBuilder = this.flaskPaymentRepository
        .createQueryBuilder('p')
        .leftJoinAndMapOne('p.need', Need, 'need', 'need.id = p.id_need')
        .where('p.verified IS NOT NULL')
        .andWhere('need.isDeleted = :isNeedDeleted', { isNeedDeleted: false })
        .select([
          'p.id',
          'p.id_need',
          'p.created',
          'p.need_amount',
          'p.donation_amount',
          'p.credit_amount',
          'p.order_id',
          'p.verified',
          'need.title',
          'need._cost',
          'need.link',
          'need.child_id',
          'need.img',
          'need.imageUrl',
        ])
        .orderBy('p.created', 'DESC')
        .cache(true);
      return await nestPaginate<Payment>(options, queryBuilder, {
        sortableColumns: ['id'],
        defaultSortBy: [['created', 'DESC']],
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

  async getSeasonComparison(
    season?: string,
    includeRates = false,
    previousSeason?: string,
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
      let targetYear: number | null = null;
      if (season && String(season).trim()) {
        const asNum = Number(season);
        if (Number.isFinite(asNum) && Number.isInteger(asNum))
          targetYear = asNum;
      }

      if (!targetYear) {
        const latest = await this.flaskNeedRepository
          .createQueryBuilder('n')
          .select('EXTRACT(YEAR FROM n.doneAt)::int', 'year')
          .where('n.isConfirmed = :isConfirmed', { isConfirmed: true })
          .andWhere('n.isDeleted = :isNeedDeleted', { isNeedDeleted: false })
          .orderBy('year', 'DESC')
          .limit(1)
          .getRawOne();
        targetYear = latest?.year ?? new Date().getFullYear();
      }

      // 2) determine previous year
      let prevYear: number | null = null;
      if (previousSeason && String(previousSeason).trim()) {
        const asNum = Number(previousSeason);
        if (Number.isFinite(asNum) && Number.isInteger(asNum)) prevYear = asNum;
      }
      if (!prevYear) prevYear = targetYear - 1;

      // 3) Query counts grouped by month for target year
      // SELECT EXTRACT(MONTH FROM created)::int AS month, COUNT(*) as count
      // FROM users WHERE EXTRACT(YEAR FROM created)::int = :year GROUP BY month
      const userCurrRows = await this.flaskUserRepository
        .createQueryBuilder('u')
        .select('EXTRACT(MONTH FROM u.created)::int', 'month')
        .addSelect('COUNT(u.id)', 'count')
        .where('EXTRACT(YEAR FROM u.created)::int = :year', {
          year: targetYear,
        })
        .groupBy('month')
        .getRawMany();

      const userPrevRows = await this.flaskUserRepository
        .createQueryBuilder('u')
        .select('EXTRACT(MONTH FROM u.created)::int', 'month')
        .addSelect('COUNT(u.id)', 'count')
        .where('EXTRACT(YEAR FROM u.created)::int = :year', {
          year: prevYear,
        })
        .groupBy('month')
        .getRawMany();

      // Convert rows to month->count maps
      const userCurrMap: Record<number, number> = {};
      for (const r of userCurrRows) {
        const m = Number(r.month);
        userCurrMap[m] = Number(r.count ?? 0);
      }
      const userPrevMap: Record<number, number> = {};
      for (const r of userPrevRows) {
        const m = Number(r.month);
        userPrevMap[m] = Number(r.count ?? 0);
      }

      // Build items for all 12 months (1..12). If you prefer only months present, we can filter.
      const userItems = Array.from({ length: 12 }, (_, i) => {
        const monthIndex = i + 1; // 1-based
        const period = MONTH_LABELS_IR[i];
        const current = userCurrMap[monthIndex] ?? 0;
        const previous = userPrevMap[monthIndex] ?? 0;
        const isNew = previous === 0 && current > 0;
        const rate =
          previous === 0 ? null : ((current - previous) / previous) * 100;
        return includeRates
          ? { period, current, previous, isNew, rate }
          : { period, current, previous };
      });

      const payCurrRows = await this.flaskPaymentRepository
        .createQueryBuilder('p')
        .select('EXTRACT(MONTH FROM p.created)::int', 'month')
        .addSelect('COUNT(p.id)', 'count')
        .where('EXTRACT(YEAR FROM p.created)::int = :year', {
          year: targetYear,
        })
        .andWhere('p.verified IS NOT NULL')
        .groupBy('month')
        .getRawMany();

      const payPrevRows = await this.flaskPaymentRepository
        .createQueryBuilder('p')
        .select('EXTRACT(MONTH FROM p.created)::int', 'month')
        .addSelect('COUNT(p.id)', 'count')
        .where('EXTRACT(YEAR FROM p.created)::int = :year', {
          year: prevYear,
        })
        .andWhere('p.verified IS NOT NULL')
        .groupBy('month')
        .getRawMany();

      // Convert rows to month->count maps
      const payCurrMap: Record<number, number> = {};
      for (const r of payCurrRows) {
        const m = Number(r.month);
        payCurrMap[m] = Number(r.count ?? 0);
      }
      const payPrevMap: Record<number, number> = {};
      for (const r of payPrevRows) {
        const m = Number(r.month);
        payPrevMap[m] = Number(r.count ?? 0);
      }

      // Build items for all 12 months (1..12). If you prefer only months present, we can filter.
      const payItems = Array.from({ length: 12 }, (_, i) => {
        const monthIndex = i + 1; // 1-based
        const period = MONTH_LABELS_IR[i];
        const current = payCurrMap[monthIndex] ?? 0;
        const previous = payPrevMap[monthIndex] ?? 0;
        const isNew = previous === 0 && current > 0;
        const rate =
          previous === 0 ? null : ((current - previous) / previous) * 100;
        return includeRates
          ? { period, current, previous, isNew, rate }
          : { period, current, previous };
      });

      const needCurrRows = await this.flaskNeedRepository
        .createQueryBuilder('n')
        .where('n.isConfirmed = :isConfirmed', { isConfirmed: true })
        .andWhere('n.isDeleted = :isNeedDeleted', { isNeedDeleted: false })
        .select('EXTRACT(MONTH FROM n.doneAt)::int', 'month')
        .addSelect('COUNT(n.id)', 'count')
        .where('EXTRACT(YEAR FROM n.doneAt)::int = :year', {
          year: targetYear,
        })
        .groupBy('month')
        .getRawMany();

      const needPrevRows = await this.flaskNeedRepository
        .createQueryBuilder('n')
        .where('n.isConfirmed = :isConfirmed', { isConfirmed: true })
        .andWhere('n.isDeleted = :isNeedDeleted', { isNeedDeleted: false })
        .select('EXTRACT(MONTH FROM n.doneAt)::int', 'month')
        .addSelect('COUNT(n.id)', 'count')
        .where('EXTRACT(YEAR FROM n.doneAt)::int = :year', {
          year: prevYear,
        })
        .groupBy('month')
        .getRawMany();

      // Convert rows to month->count maps
      const needCurrMap: Record<number, number> = {};
      for (const r of needCurrRows) {
        const m = Number(r.month);
        needCurrMap[m] = Number(r.count ?? 0);
      }
      const needPrevMap: Record<number, number> = {};
      for (const r of needPrevRows) {
        const m = Number(r.month);
        needPrevMap[m] = Number(r.count ?? 0);
      }

      // Build items for all 12 months (1..12). If you prefer only months present, we can filter.
      const needItems = Array.from({ length: 12 }, (_, i) => {
        const monthIndex = i + 1; // 1-based
        const period = MONTH_LABELS_IR[i];
        const current = needCurrMap[monthIndex] ?? 0;
        const previous = needPrevMap[monthIndex] ?? 0;
        const isNew = previous === 0 && current > 0;
        const rate =
          previous === 0 ? null : ((current - previous) / previous) * 100;
        return includeRates
          ? { period, current, previous, isNew, rate }
          : { period, current, previous };
      });

      const result: SeasonComparisonResponseDto = {
        doneNeeds: { data: needItems, season: String(targetYear) },
        totalUsers: { data: userItems, season: String(targetYear) },
        pays: { data: payItems, season: String(targetYear) },
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

  // inside your analyticPublicService (TypeScript)
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
        const cached = await this.cacheManager.get<SummaryDto>(cacheKey);
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
      }
    >();

    const extractServiceName = (nt: any): string => {
      if (!nt) return '';
      // try parse if stringified
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

    const containsAny = (text: string, keywords: string[]) => {
      if (!text || !keywords || !keywords.length) return false;
      const lower = String(text).toLowerCase();
      for (const kw of keywords) {
        if (!kw) continue;
        if (lower.includes(String(kw).toLowerCase())) return true;
      }
      return false;
    };

    for (const r of raw) {
      const needType = Number(r.type ?? 0);
      let searchText = '';
      let representativeName = '';

      if (needType === 0) {
        // service: build from name_translations
        let nt = r.name_translations;
        if (typeof nt === 'string') {
          try {
            nt = JSON.parse(nt);
          } catch {
            nt = nt;
          }
        }
        if (nt && typeof nt === 'object') {
          // join all string values
          const vals = Object.values(nt).map((v) =>
            v == null ? '' : String(v),
          );
          searchText = vals.join(' ');
        } else {
          searchText = String(nt ?? '');
        }
        representativeName = extractServiceName(r.name_translations);
      } else {
        // product: title
        searchText = String(r.title ?? '');
        representativeName = String(r.title ?? '').trim();
      }

      if (!searchText || !String(searchText).trim()) continue;

      // choose assigned category
      let assigned: string | null = null;

      // productCategories and serviceCategories should be imported/available in this service file
      if (needType === 1) {
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

      if (!assigned) continue;

      if (!grouped.has(assigned)) {
        grouped.set(assigned, {
          id: assigned,
          name: assigned,
          totalCount: 0,
          doneCount: 0,
          membersSet: new Set<string>(),
        });
      }

      const g = grouped.get(assigned)!;
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
          assignedCategory: g.name,
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
        await this.cacheManager.set(cacheKey, out, 10);
      } catch (e) {
        this.logger.warn(
          'Cache write failed for reports need frequency: ' +
            (e as any).message,
        );
      }
    }
    return out;
  }

  async getLastNeedsWithAtLeastTwoPayers(
    limit = 100,
    minPayers = 2,
  ): Promise<Need[]> {
    // Build subquery: id_need that have >= minPayers distinct id_user
    const payerSubQb = this.flaskPaymentRepository
      .createQueryBuilder('p')
      .where('p.id_need IS NOT NULL')
      .andWhere('p.verified IS NOT NULL')
      // .andWhere('p.need_amount > :amount', { amount: 0 }) // only positive amounts
      // only count positive contributions (adjust fields if your schema differs)
      .andWhere('p.id_user != :payflaskUseId', { payflaskUseId: 208 })
      .andWhere(
        new Brackets((qb) => {
          qb.where('p.need_amount > 0')
            .orWhere('p.donation_amount > 0')
            .orWhere('p.credit_amount > 0');
        }),
      )
      .select('p.id_need', 'id_need')
      .groupBy('p.id_need')
      .having('COUNT(DISTINCT p.id_user) >= :minPayers', {
        minPayers,
      });

    // main query: fetch needs whose id exists in the subquery
    const qb = this.flaskNeedRepository.createQueryBuilder('need');
    qb.leftJoinAndMapMany(
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
      .where('child.id_ngo NOT IN (:...testNgoIds)', {
        testNgoIds: [3, 14],
      })
      .andWhere('need.status >= :statusNotPaid', {
        statusNotPaid: PaymentStatusEnum.COMPLETE_PAY,
      })
      .andWhere('payment.id_need IS NOT NULL')
      .andWhere('payment.verified IS NOT NULL')
      // .andWhere('payment.need_amount > :amount', { amount: 0 }) // only positive amounts
      .andWhere('payment.id_user != :pflaskUseId', { pflaskUseId: 208 })
      .andWhere('needFamily.id_user != :flaskUseId', { flaskUseId: 208 })
      .andWhere('need.isDeleted = :needDeleted', { needDeleted: false })
      .andWhere('child.id_ngo NOT IN (:...testNgoIds)', { testNgoIds: [3, 14] })
      .andWhere(`need.id IN (${payerSubQb.getQuery()})`)
      // pass the subquery params (minPayers)
      .setParameters(payerSubQb.getParameters())
      .select([
        'need.id',
        'need.img',
        'need.imageUrl',
        'need.created',
        'need.child_delivery_date',
        'need._cost',
        'need.status',
        'need.isConfirmed',
        'need.confirmDate',
        'need.isDeleted',
        'need.child_id',
        'needFamily',
        'payment',
      ])
      .orderBy('need.created', 'DESC')
      .limit(limit)
      .cache(true);

    return qb.getMany();
  }
  /**
   * Return the most recent 20 checkpoints ordered by checkpoint time (descending).
   * No filters, no pagination metadata — just an array of CheckPointEntity.
   */
  async findLatest20(): Promise<CheckPointEntity[]> {
    try {
      const qb = this.checkPointRepository
        .createQueryBuilder('cp')
        .leftJoinAndSelect('cp.user', 'user')
        // .select([
        //   'cp.id',
        //   'cp.title',
        //   'cp.description',
        //   'cp.type',
        //   'cp.checkPointDate', // adjust column name if different
        //   'cp.createdAt',
        //   'cp.confirmedAt',
        //   'cp.isConfirmed',
        //   'user.id',
        //   'user.name',
        //   'user.username',
        //   'user.email',
        // ])
        // order by checkpoint time primary, fallback to createdAt for tie-breaker
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
