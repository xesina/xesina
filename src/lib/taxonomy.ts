import { getStreamItems, type StreamItem } from './stream';
import { toFaDigits } from './format';

export const MONTH_SLUGS = [
  'jan', 'feb', 'mar', 'apr', 'may', 'jun',
  'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
] as const;

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const monthSlug = (d: Date) => MONTH_SLUGS[d.getUTCMonth()];
export const monthIndexFromSlug = (slug: string) =>
  MONTH_SLUGS.indexOf(slug.toLowerCase() as (typeof MONTH_SLUGS)[number]);

/* ---------------- tags ---------------- */

export interface TagCount {
  tag: string;
  count: number;
}

export async function getTags(lang?: 'en' | 'fa'): Promise<TagCount[]> {
  let items = await getStreamItems();
  if (lang) items = items.filter((i) => i.lang === lang);
  const counts = new Map<string, number>();
  for (const it of items) {
    for (const t of it.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => a.tag.localeCompare(b.tag));
}

export async function getItemsByTag(tag: string, lang?: 'en' | 'fa'): Promise<StreamItem[]> {
  return (await getStreamItems(lang)).filter((it) => it.tags.includes(tag));
}

/* ---------------- archives ---------------- */

export interface TypeCounts {
  entry: number;
  link: number;
  note: number;
  total: number;
}

export interface MonthBucket {
  year: number;
  monthIndex: number;
  slug: string;
  /** e.g. "June 2026" */
  label: string;
  counts: TypeCounts;
}

export interface YearBucket {
  year: number;
  counts: TypeCounts;
  months: MonthBucket[];
}

const emptyCounts = (): TypeCounts => ({ entry: 0, link: 0, note: 0, total: 0 });

function tally(counts: TypeCounts, type: StreamItem['type']) {
  counts[type] += 1;
  counts.total += 1;
}

/** Years and months that actually contain content, newest first. */
export async function getArchive(lang?: 'en' | 'fa'): Promise<YearBucket[]> {
  const items = await getStreamItems(lang);
  const years = new Map<number, YearBucket>();

  for (const it of items) {
    const y = it.pubDate.getUTCFullYear();
    const m = it.pubDate.getUTCMonth();

    let yb = years.get(y);
    if (!yb) {
      yb = { year: y, counts: emptyCounts(), months: [] };
      years.set(y, yb);
    }
    tally(yb.counts, it.type);

    let mb = yb.months.find((b) => b.monthIndex === m);
    if (!mb) {
      mb = {
        year: y,
        monthIndex: m,
        slug: MONTH_SLUGS[m],
        label: `${MONTH_NAMES[m]} ${y}`,
        counts: emptyCounts(),
      };
      yb.months.push(mb);
    }
    tally(mb.counts, it.type);
  }

  const sorted = [...years.values()].sort((a, b) => b.year - a.year);
  for (const yb of sorted) yb.months.sort((a, b) => b.monthIndex - a.monthIndex);
  return sorted;
}

export async function getItemsByYear(year: number, lang?: 'en' | 'fa'): Promise<StreamItem[]> {
  return (await getStreamItems(lang)).filter((it) => it.pubDate.getUTCFullYear() === year);
}

export async function getItemsByMonth(
  year: number,
  monthIndex: number,
  lang?: 'en' | 'fa',
): Promise<StreamItem[]> {
  return (await getStreamItems(lang)).filter(
    (it) => it.pubDate.getUTCFullYear() === year && it.pubDate.getUTCMonth() === monthIndex,
  );
}

/* ---------------- Jalali (Shamsi) archive - Persian edition ---------------- */

export const J_MONTH_SLUGS = [
  'farvardin', 'ordibehesht', 'khordad', 'tir', 'mordad', 'shahrivar',
  'mehr', 'aban', 'azar', 'dey', 'bahman', 'esfand',
] as const;

const J_MONTH_NAMES = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
];

// Latin-digit Jalali parts, for bucketing by Persian year/month.
const JFMT = new Intl.DateTimeFormat('en-US-u-ca-persian', {
  year: 'numeric',
  month: 'numeric',
  timeZone: 'UTC',
});

export function jParts(d: Date): { year: number; monthIndex: number } {
  const parts = JFMT.formatToParts(d);
  const year = Number(parts.find((p) => p.type === 'year')?.value);
  const month = Number(parts.find((p) => p.type === 'month')?.value);
  return { year, monthIndex: month - 1 };
}

export const jMonthIndexFromSlug = (slug: string) =>
  J_MONTH_SLUGS.indexOf(slug.toLowerCase() as (typeof J_MONTH_SLUGS)[number]);

/** Jalali archive of Persian-language content, newest first. */
export async function getArchiveFa(): Promise<YearBucket[]> {
  const items = (await getStreamItems()).filter((i) => i.lang === 'fa');
  const years = new Map<number, YearBucket>();

  for (const it of items) {
    const { year: y, monthIndex: m } = jParts(it.pubDate);

    let yb = years.get(y);
    if (!yb) {
      yb = { year: y, counts: emptyCounts(), months: [] };
      years.set(y, yb);
    }
    tally(yb.counts, it.type);

    let mb = yb.months.find((b) => b.monthIndex === m);
    if (!mb) {
      mb = {
        year: y,
        monthIndex: m,
        slug: J_MONTH_SLUGS[m],
        label: `${J_MONTH_NAMES[m]} ${toFaDigits(y)}`,
        counts: emptyCounts(),
      };
      yb.months.push(mb);
    }
    tally(mb.counts, it.type);
  }

  const sorted = [...years.values()].sort((a, b) => b.year - a.year);
  for (const yb of sorted) yb.months.sort((a, b) => b.monthIndex - a.monthIndex);
  return sorted;
}

export async function getItemsByJYear(year: number): Promise<StreamItem[]> {
  return (await getStreamItems()).filter((i) => i.lang === 'fa' && jParts(i.pubDate).year === year);
}

export async function getItemsByJMonth(year: number, monthIndex: number): Promise<StreamItem[]> {
  return (await getStreamItems()).filter((i) => {
    if (i.lang !== 'fa') return false;
    const p = jParts(i.pubDate);
    return p.year === year && p.monthIndex === monthIndex;
  });
}
