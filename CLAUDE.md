# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

xesina.com — Sina Saeidi's personal site. A static, zero-client-JS Astro site whose
home page is a single reverse-chronological **stream** of three content types, with a
fully mirrored English/Persian (RTL) edition. See `README.md` for content-authoring
frontmatter; this file covers the architecture.

## Commands

```bash
npm run dev      # astro dev — http://localhost:4321
npm run build    # static output to dist/
npm run preview  # serve the production build
```

There is no test suite, linter, or formatter configured — `npm run build` (which runs
`astro check`-style content schema validation via the collection loaders) is the only
gate. Always run it after touching content schemas, `lib/`, or routing.

## Content model

Four collections defined in `src/content.config.ts` (Zod schemas, glob loaders over
`src/content/<collection>/`):

- **entries** — long-form posts (`/writing/<id>/`), shown in the stream with a word count.
- **links** — external links with commentary (`/links/<id>/`), shown in the stream.
- **notes** — short, often title-less thoughts (`/notes/<id>/`); the **rendered body**
  is shown inline in the stream, not just a link.
- **projects** — evergreen, **not in the stream**; rendered on `/projects` only.

Every stream collection has a `lang: 'en' | 'fa'` field (default `'en'`). Posts live at
a **single, un-prefixed canonical URL regardless of language** — language is a property
of the content, not the path. Projects instead carry optional `titleFa`/`descriptionFa`
overrides.

## The stream (`src/lib/stream.ts`)

`getStreamItems(lang?)` is the spine of the site: it loads all three stream collections,
normalizes them into a flat `StreamItem[]` (notes get their body pre-rendered via
`render()`), filters drafts, optionally filters by `lang`, and sorts newest-first.
`groupByDay()` buckets the sorted list into consecutive day groups for display. Tag and
archive pages (`src/lib/taxonomy.ts`) are all built by filtering the output of this one
function — there is no database or index; everything derives from the Markdown at build
time.

## Bilingual / RTL system

This is the most cross-cutting concern. Two parallel page trees:

- English pages under `src/pages/` (e.g. `writing/index.astro`, `tags/[tag]/index.astro`).
- Persian pages mirror them under `src/pages/fa/` and pass `lang="fa"` everywhere.

Supporting pieces:

- `src/i18n.ts` — `t(lang, key)` UI-string dictionary. Add a key to **both** `en` and
  `fa` maps.
- `src/lib/format.ts` — locale-aware date/number formatters. Persian uses the **Jalali
  (Shamsi) calendar** and **Persian digits**; `fmtDay`/`fmtTime`/`fmtMonthYear` switch on
  `lang`, and `toFaDigits`/`faNum` convert numerals.
- `src/lib/taxonomy.ts` — note the **two archive builders**: `getArchive()` buckets by
  Gregorian year/month, `getArchiveFa()` buckets the same items by Jalali year/month
  (via `Intl.DateTimeFormat('en-US-u-ca-persian')`). The `/fa/[year]/[month]` routes use
  the Jalali buckets and `J_MONTH_SLUGS`; the English routes use `MONTH_SLUGS`.
- `src/lib/routes.ts` — `getRouteSet()` enumerates every real page in both languages;
  `localeHref()` then computes the **language-switch target**: it only links to an
  equivalent page if it actually exists, otherwise falls back to the section index, then
  the archive, then that edition's home. The header language toggle relies on this so it
  never links to a 404.

When adding a new section or route, update it in **four** places: the EN page, the FA
page, `getRouteSet()` in `routes.ts`, and (if it has UI labels) `i18n.ts`.

## Layout & SEO (`src/layouts/Base.astro`)

Single shell for every page: sets `<html dir>` from `lang` (`rtl` for `fa`), builds the
canonical URL, OG/Twitter tags, and JSON-LD (`BlogPosting` for articles, `WebSite`
otherwise). Analytics (GoatCounter) and Search Console verification are toggled via
`src/consts.ts` (`SITE.goatcounter`, `SITE.googleSiteVerification`). `SITE.available`
flips the `/hire` page between "available" and "not taking projects".

## Open Graph images (`src/pages/open-graph/[...route].ts`)

OG cards are generated at build time with **satori → resvg** (SVG → PNG), using the
bundled Vazirmatn fonts in `src/og/fonts/`. **Important:** satori does not shape Arabic
script, so per-post cards are generated for **English entries only**; Persian posts and
all other pages fall back to the static `/open-graph/_site.png`.

## Feeds

RSS via `@astrojs/rss`, built in `src/lib/feed.ts`: `/feed.xml` (everything),
`/writing/feed.xml`, `/links/feed.xml`, `/notes/feed.xml`, plus per-tag feeds.

## Deployment

Two paths exist. `README.md` documents **Vercel** (git push → rebuild). The repo also
ships a **Docker** build (`Dockerfile`): multi-stage `node:22-alpine` build → static
`dist/` served by `nginx:1.27-alpine` using `nginx.conf` (tuned for Astro's
directory-style output). Both produce the same static `dist/`.
