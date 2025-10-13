import * as jalaali from 'jalaali-js';
import { SeasonComparisonItemDto } from '../features/analytic/dto/season-comparison-response.dto';

/** Raw DB row type */
export type RawRow = { month: any; day?: any; value: any };

/* Persian month names */
export const persianMonthNames = [
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

/** Return ISO start/end (UTC midnight) and start/next objects for a Jalali year [start, end) */
export function jalaliYearRangeIso(jy: number) {
  const start = jalaali.toGregorian(jy, 1, 1); // { gy, gm, gd }
  const next = jalaali.toGregorian(jy + 1, 1, 1);
  const pad2 = (n: number) => String(n).padStart(2, '0');
  const startIso = `${String(start.gy).padStart(4, '0')}-${pad2(
    start.gm,
  )}-${pad2(start.gd)}T00:00:00Z`;
  const endIso = `${String(next.gy).padStart(4, '0')}-${pad2(next.gm)}-${pad2(
    next.gd,
  )}T00:00:00Z`;
  return { startIso, endIso, startObj: start, nextObj: next };
}

/** Safely coerce DB raw value to number */
export function toNum(v: any): number {
  if (v === null || v === undefined) return 0;
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const s = v.trim().replace(/,/g, '');
    if (s === '') return 0;
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  }
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Deduce correct Gregorian year for a DB row (gMonth/gDay)
 * given the Gregorian start date (startObj) and next start (nextObj).
 */
export function deduceGregorianYearForRow(
  gMonth: number,
  gDay: number,
  startObj: { gy: number; gm: number; gd: number },
  nextObj: { gy: number; gm: number; gd: number },
) {
  const pad2 = (n: number) => String(n).padStart(2, '0');
  const startDate = new Date(
    `${String(startObj.gy)}-${pad2(startObj.gm)}-${pad2(
      startObj.gd,
    )}T00:00:00Z`,
  );
  const nextDate = new Date(
    `${String(nextObj.gy)}-${pad2(nextObj.gm)}-${pad2(nextObj.gd)}T00:00:00Z`,
  );

  // Candidate in startObj.gy
  const candidateA = new Date(
    `${String(startObj.gy)}-${pad2(gMonth)}-${pad2(gDay)}T00:00:00Z`,
  );
  if (candidateA >= startDate && candidateA < nextDate) return startObj.gy;

  // Candidate in startObj.gy + 1
  const candidateB = new Date(
    `${String(startObj.gy + 1)}-${pad2(gMonth)}-${pad2(gDay)}T00:00:00Z`,
  );
  if (candidateB >= startDate && candidateB < nextDate) return startObj.gy + 1;

  // fallback by closeness (rare)
  return Math.abs(+candidateA - +startDate) <=
    Math.abs(+candidateB - +startDate)
    ? startObj.gy
    : startObj.gy + 1;
}

/**
 * Merge DB rows (current & previous Jalali years) into Jalali month buckets.
 *
 * - currRows & prevRows: raw DB rows with 'month', optional 'day', and aggregated 'value'
 * - currJalaliYear & prevJalaliYear: Jalali years (e.g. 1403)
 *
 * Options:
 * - returnStrings: if true, current/previous are returned as strings (keeps parity with prior examples)
 * - excludeFutureMonths: if true (default), and if currJalaliYear equals the Jalali year of `asOf`,
 *   months after the as-of month are removed from the returned array.
 * - asOf: reference Date used to determine the current Jalali month (default: new Date()).
 */
export function mergeByJalaliMonth(
  currRows: RawRow[] | undefined,
  prevRows: RawRow[] | undefined,
  currJalaliYear: number,
  prevJalaliYear: number,
  options?: {
    returnStrings?: boolean;
    excludeFutureMonths?: boolean;
    asOf?: Date;
  },
): SeasonComparisonItemDto[] {
  const {
    returnStrings = true,
    excludeFutureMonths = true,
    asOf = new Date(),
  } = options || {};

  const currRange = jalaliYearRangeIso(currJalaliYear);
  const prevRange = jalaliYearRangeIso(prevJalaliYear);

  // determine current Jalali date for the asOf reference
  const asOfGy = asOf.getFullYear();
  const asOfGm = asOf.getMonth() + 1;
  const asOfGd = asOf.getDate();
  const asOfJ = jalaali.toJalaali(asOfGy, asOfGm, asOfGd); // { jy, jm, jd }

  // init buckets 1..12
  const agg = new Map<number, { current: number; prev: number }>();
  for (let m = 1; m <= 12; m++) agg.set(m, { current: 0, prev: 0 });

  // process current rows
  for (const r of currRows || []) {
    const gMonth = Math.max(1, Math.min(12, toNum(r.month) || 1));
    const gDay = Math.max(
      1,
      Math.min(31, r.day !== undefined ? toNum(r.day) : 1),
    );
    const val = toNum(r.value);

    const gy = deduceGregorianYearForRow(
      gMonth,
      gDay,
      currRange.startObj,
      currRange.nextObj,
    );
    const j = jalaali.toJalaali(gy, gMonth, gDay); // { jy, jm, jd }
    const jm = j.jm;
    const bucket = agg.get(jm)!;
    bucket.current += val;
  }

  // process previous rows
  for (const r of prevRows || []) {
    const gMonth = Math.max(1, Math.min(12, toNum(r.month) || 1));
    const gDay = Math.max(
      1,
      Math.min(31, r.day !== undefined ? toNum(r.day) : 1),
    );
    const val = toNum(r.value);

    const gy = deduceGregorianYearForRow(
      gMonth,
      gDay,
      prevRange.startObj,
      prevRange.nextObj,
    );
    const j = jalaali.toJalaali(gy, gMonth, gDay);
    const jm = j.jm;
    const bucket = agg.get(jm)!;
    bucket.prev += val;
  }

  // create array sorted by Jalali month index 1..12
  let out = Array.from(agg.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([jm, v]) => {
      const period = persianMonthNames[jm - 1];
      return {
        period,
        current: returnStrings ? String(v.current) : v.current,
        previous: returnStrings ? String(v.prev) : v.prev,
        monthIndex: jm,
        month: period,
      } as SeasonComparisonItemDto;
    });

  // If requested, remove future Jalali months for the "current" year that haven't been reached yet.
  if (excludeFutureMonths && currJalaliYear === asOfJ.jy) {
    const maxReachedMonth = asOfJ.jm;
    out = out.filter((item) => {
      // keep months <= maxReachedMonth
      if (typeof item.monthIndex !== 'number') return true;
      return item.monthIndex <= maxReachedMonth;
    });
  }

  return out;
}
