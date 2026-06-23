import type { APIContext } from 'astro';
import { buildFeed } from '../lib/feed';

export const GET = (context: APIContext) => buildFeed(context);
