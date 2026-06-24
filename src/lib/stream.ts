import { getCollection, render, type CollectionEntry } from 'astro:content';
import { wordCount } from './format';

export type StreamType = 'entry' | 'link' | 'note';

export interface StreamItem {
  type: StreamType;
  id: string;
  /** Permalink on this site. */
  href: string;
  pubDate: Date;
  title?: string;
  /** External URL (links only). */
  url?: string;
  /** Excerpt text shown in the stream (entries, links). */
  description?: string;
  /** Word count (entries only). */
  words?: number;
  /** Rendered body component (notes only - shown inline in the stream). */
  Content?: Awaited<ReturnType<typeof render>>['Content'];
  tags: string[];
  /** Content language - 'fa' renders right-to-left with a Persian font. */
  lang: 'en' | 'fa';
}

const notDraft = (e: { data: { draft?: boolean } }) => !e.data.draft;

/** All stream items, optionally restricted to one content language. */
export async function getStreamItems(lang?: 'en' | 'fa'): Promise<StreamItem[]> {
  const [entries, links, notes] = await Promise.all([
    getCollection('entries', notDraft),
    getCollection('links', notDraft),
    getCollection('notes', notDraft),
  ]);

  const items: StreamItem[] = [];

  for (const e of entries as CollectionEntry<'entries'>[]) {
    items.push({
      type: 'entry',
      id: e.id,
      href: `/writing/${e.id}/`,
      pubDate: e.data.pubDate,
      title: e.data.title,
      description: e.data.description,
      words: wordCount(e.body ?? ''),
      tags: e.data.tags,
      lang: e.data.lang,
    });
  }

  for (const l of links as CollectionEntry<'links'>[]) {
    items.push({
      type: 'link',
      id: l.id,
      href: `/links/${l.id}/`,
      pubDate: l.data.pubDate,
      title: l.data.title,
      url: l.data.url,
      description: l.data.description,
      tags: l.data.tags,
      lang: l.data.lang,
    });
  }

  for (const n of notes as CollectionEntry<'notes'>[]) {
    const { Content } = await render(n);
    items.push({
      type: 'note',
      id: n.id,
      href: `/notes/${n.id}/`,
      pubDate: n.data.pubDate,
      title: n.data.title,
      Content,
      tags: n.data.tags,
      lang: n.data.lang,
    });
  }

  const result = lang ? items.filter((i) => i.lang === lang) : items;
  return result.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
}

export interface DayGroup {
  day: string;
  items: StreamItem[];
}

/** Group a (pre-sorted) item list into consecutive day buckets. */
export function groupByDay(items: StreamItem[], fmtDay: (d: Date) => string): DayGroup[] {
  const groups: DayGroup[] = [];
  for (const it of items) {
    const day = fmtDay(it.pubDate);
    const last = groups[groups.length - 1];
    if (last && last.day === day) last.items.push(it);
    else groups.push({ day, items: [it] });
  }
  return groups;
}
