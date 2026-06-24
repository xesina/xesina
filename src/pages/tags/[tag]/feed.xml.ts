import type { APIContext } from 'astro';
import { buildFeed } from '../../../lib/feed';
import { getTags } from '../../../lib/taxonomy';

export async function getStaticPaths() {
  const tags = await getTags('en');
  return tags.map((t) => ({ params: { tag: t.tag } }));
}

export const GET = (context: APIContext) =>
  buildFeed(context, {
    tag: context.params.tag,
    lang: 'en',
    titleSuffix: `#${context.params.tag}`,
    description: `Items tagged ${context.params.tag}.`,
  });
