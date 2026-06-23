import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Long-form blog posts.
const entries = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/entries' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    lang: z.enum(['en', 'fa']).default('en'),
    draft: z.boolean().default(false),
  }),
});

// External links worth saving, with a paragraph of commentary (the body).
const links = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/links' }),
  schema: z.object({
    title: z.string(),
    url: z.string().url(),
    description: z.string().optional(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    lang: z.enum(['en', 'fa']).default('en'),
    draft: z.boolean().default(false),
  }),
});

// Short, often title-less thoughts. The body is the note.
const notes = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/notes' }),
  schema: z.object({
    title: z.string().optional(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    lang: z.enum(['en', 'fa']).default('en'),
    draft: z.boolean().default(false),
  }),
});

// Evergreen projects, shown on /projects (not in the stream).
const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // Optional Persian overrides (fall back to title/description on /fa/projects).
    titleFa: z.string().optional(),
    descriptionFa: z.string().optional(),
    tech: z.array(z.string()).default([]),
    repo: z.string().url().optional(),
    link: z.string().url().optional(),
    year: z.number().optional(),
    status: z.enum(['active', 'archived', 'wip']).optional(),
    featured: z.boolean().default(false),
    order: z.number().default(0),
  }),
});

export const collections = { entries, links, notes, projects };
