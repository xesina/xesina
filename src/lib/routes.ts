import { getStreamItems } from './stream';
import { getTags, getArchive, getArchiveFa } from './taxonomy';

/** Every real page route (not feeds), both languages. Used to decide whether
 *  a language-switch target actually exists before linking to it. */
export async function getRouteSet(): Promise<Set<string>> {
  const s = new Set<string>();

  const staticEn = ['/', '/writing/', '/links/', '/notes/', '/tags/', '/archive/', '/about/', '/projects/', '/hire/'];
  for (const p of staticEn) {
    s.add(p);
    s.add(p === '/' ? '/fa/' : `/fa${p}`);
  }

  // post permalinks (single canonical URL per post, regardless of language)
  for (const it of await getStreamItems()) s.add(it.href);

  // tag pages
  for (const t of await getTags('en')) s.add(`/tags/${t.tag}/`);
  for (const t of await getTags('fa')) s.add(`/fa/tags/${t.tag}/`);

  // archives (Gregorian for en, Jalali for fa)
  for (const y of await getArchive('en')) {
    s.add(`/${y.year}/`);
    for (const m of y.months) s.add(`/${y.year}/${m.slug}/`);
  }
  for (const y of await getArchiveFa()) {
    s.add(`/fa/${y.year}/`);
    for (const m of y.months) s.add(`/fa/${y.year}/${m.slug}/`);
  }

  return s;
}

/**
 * Best URL for `path` in `targetLang`: the same page if it exists in that
 * language, otherwise the nearest section index, otherwise that edition's home.
 * `currentLang` is the document language (posts live at an un-prefixed URL, so
 * the path alone can't tell us their language).
 */
export function localeHref(
  path: string,
  targetLang: 'en' | 'fa',
  currentLang: 'en' | 'fa',
  routes: Set<string>,
): string {
  const home = targetLang === 'fa' ? '/fa/' : '/';
  const toTarget = (p: string) => (targetLang === 'fa' ? (p === '/' ? '/fa/' : `/fa${p}`) : p);

  // en-space path (strip the /fa prefix if present)
  const bare = path.startsWith('/fa/') ? path.slice(3) : path === '/fa' ? '/' : path;

  // post permalink: only has an equivalent in its own language
  const post = bare.match(/^\/(writing|links|notes)\/.+/);
  if (post) {
    if (targetLang === currentLang) return path;
    const idx = toTarget(`/${post[1]}/`);
    return routes.has(idx) ? idx : home;
  }

  const candidate = toTarget(bare);
  if (routes.has(candidate)) return candidate;

  // fall back to the section index, then the archive index, then home
  const sec = bare.match(/^\/(writing|links|notes|tags)\b/);
  if (sec) {
    const idx = toTarget(`/${sec[1]}/`);
    if (routes.has(idx)) return idx;
  }
  if (/^\/\d|^\/archive\b/.test(bare)) {
    const ai = toTarget('/archive/');
    if (routes.has(ai)) return ai;
  }
  return home;
}
