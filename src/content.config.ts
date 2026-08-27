import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

const pages = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
  }),
});

const termine = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/termine' }),
  schema: z.object({
    datum: z.coerce.date(),
    uhrzeit: z.string().default('18:00'),
  }),
});

const notices = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/notices' }),
  schema: z.object({
    title: z.string(),
    page: z.enum(['home', 'ueber-uns', 'direktvermarktung', 'hofladen']),
    from: z.coerce.date().optional(),
    until: z.coerce.date().optional(),
  }),
});

export const collections = { pages, termine, notices };
