import rss from '@astrojs/rss';
import { getStreamItems, type StreamType } from './stream';
import { SITE } from '../consts';

const titleFor = (it: { title?: string; type: StreamType }) =>
  it.title ?? (it.type === 'note' ? 'Note' : 'Untitled');

/**
 * Build an RSS feed, optionally filtered to a single content type.
 * `context` is the Astro APIContext passed into the endpoint's GET().
 */
export async function buildFeed(
  context: { site?: URL | undefined },
  opts: {
    type?: StreamType;
    tag?: string;
    lang?: 'en' | 'fa';
    titleSuffix?: string;
    description?: string;
  } = {},
) {
  const site = context.site ?? new URL(SITE.url);
  let items = await getStreamItems(opts.lang);
  if (opts.type) items = items.filter((i) => i.type === opts.type);
  if (opts.tag) items = items.filter((i) => i.tags.includes(opts.tag!));

  return rss({
    title: opts.titleSuffix ? `${SITE.title} · ${opts.titleSuffix}` : SITE.title,
    description: opts.description ?? SITE.description,
    site,
    items: items.map((it) => ({
      title: titleFor(it),
      // links point to their external target; everything else to its permalink.
      link: it.type === 'link' && it.url ? it.url : new URL(it.href, site).href,
      pubDate: it.pubDate,
      description: it.description ?? '',
      categories: it.tags,
    })),
    customData: `<language>en</language>`,
  });
}
