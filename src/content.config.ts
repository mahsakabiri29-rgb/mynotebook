import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// ─────────────────────────────────────────────────────────────
//  ساختار هر مقاله. فیلدهای هر فایل .md باید این شکل باشد:
//
//  ---
//  title: عنوان مقاله
//  description: خلاصهٔ یک‌خطی که در فهرست‌ها نمایش داده می‌شود
//  pubDate: 2026-11-06
//  tags: [دندان‌پزشکی، پیشگیری]   ← اختیاری
//  draft: false                  ← اختیاری؛ اگر true باشد منتشر نمی‌شود
//  ---
// ─────────────────────────────────────────────────────────────

const articleSchema = z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.coerce.date(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
});

export const collections = {
  // مقالات بخش «برای بیماران» → src/content/patients/
  patients: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/patients' }),
    schema: articleSchema,
  }),
  // مقالات بخش «برای دندان‌پزشکان» → src/content/professionals/
  professionals: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/professionals' }),
    schema: articleSchema,
  }),
};
