# xesina.com

Personal site for Sina Saeidi — a single reverse-chronological **stream** of writing,
links, and notes, plus a Projects page. Built with [Astro](https://astro.build), no
client-side JS to speak of, deployed on Vercel.

## Develop

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # output to dist/
npm run preview  # preview the production build
```

## Adding content

Everything is git-based: add a Markdown file, commit, push — Vercel rebuilds.

### A blog post (Entry)

`src/content/entries/my-post.md`

```md
---
title: My post
description: One-line summary shown in the stream.
pubDate: 2026-06-23T10:00:00Z
tags: [systems]        # optional, not shown yet
draft: false           # optional
---

Body in Markdown (or rename to `.mdx` for components).
```

→ appears in the home stream and at `/writing/my-post/`.

### A link (Blogmark)

`src/content/links/some-link.md`

```md
---
title: The title of the thing
url: https://example.com/article
description: Why it's worth saving (shown in the stream).
pubDate: 2026-06-23T19:00:00Z
---

A paragraph of commentary (the permalink page body).
```

### A note

`src/content/notes/quick-thought.md`

```md
---
pubDate: 2026-06-23T08:00:00Z
---

A short, title-less thought. The body is the note.
```

### A project

`src/content/projects/my-project.md`

```md
---
title: My Project
description: What it is.
tech: [Go, SQLite]
repo: https://github.com/xesina/my-project
link: https://example.com      # optional live URL
year: 2026
status: active                 # active | wip | archived
featured: true                 # sorts to top
order: 1
---
```

## Feeds

- `/feed.xml` — everything
- `/writing/feed.xml` — entries only
- `/links/feed.xml` — links only
- `/notes/feed.xml` — notes only

## Structure

```
src/
  consts.ts            site metadata + nav
  content.config.ts    collection schemas (entries, links, notes, projects)
  content/             your Markdown content
  lib/                 stream assembly, formatting, feed builder
  components/          Header, Footer, Stream
  layouts/Base.astro   <head>, SEO/OG, header + footer shell
  pages/               routes (home, writing, links, notes, projects, about, feeds)
  styles/global.css    all styling (auto light/dark)
```

Site colours, fonts, and the about copy are the obvious first things to make your own:
`src/styles/global.css`, `src/layouts/Base.astro` (font link), and `src/pages/about.astro`.

## Deploy (Coolify)

The repo ships a `Dockerfile` (multi-stage: builds the static site, serves it with
nginx) and an `nginx.conf` tuned for Astro's directory-style routes.

In Coolify:

1. New Resource → your Git source → this repo, branch `main`.
2. Build Pack: **Dockerfile** (auto-detected from the `Dockerfile`).
3. Port: **80**.
4. Set the domain to `xesina.com` and let Coolify handle TLS.

Every push to `main` triggers a rebuild. The production URL is set via `site` in
`astro.config.mjs` (currently `https://xesina.com`) — update it if the domain changes.

Prefer Coolify's static build pack instead of Docker? Use install `npm ci`, build
`npm run build`, output directory `dist`.
