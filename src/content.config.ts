import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    category: z.enum(['Solar', 'Wind', 'Storage', 'Hydrogen', 'Manufacturing', 'Policy & Markets']),
    excerpt: z.string(),
    hero: z.string(),
    heroAlt: z.string(),
    featured: z.boolean().default(false),
    sources: z
      .array(z.object({ label: z.string(), url: z.string().url() }))
      .default([]),
  }),
});

export const collections = { articles };
