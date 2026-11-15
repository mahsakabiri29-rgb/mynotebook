import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// ─────────────────────────────────────────────────────────────
//  ساختار هر یادداشت/مقاله. فیلدهای هر فایل .md این شکل است:
//
//  ---
//  title: عنوان
//  description: خلاصهٔ یک‌خطی
//  pubDate: 2026-11-07
//  kind: reading-note        ← اختیاری؛ یکی از NOTE_KINDS
//  updated: 2026-11-10       ← اختیاری؛ تاریخ آخرین بازنگری
//  changelog:                ← اختیاری؛ سابقهٔ تغییرات فکری
//    - date: 2026-11-10
//      note: چه چیزی عوض شد و چرا
//  references:               ← اختیاری؛ فهرست منابع
//    - Opdam NJ, et al. J Dent Res. 2014;93:943-949.
//  paper: (نقل کامل مقالهٔ مرجع، برای یادداشت‌های مطالعه) ← اختیاری
//  tags: [Failuresafe]          ← اختیاری
//  draft: false              ← اختیاری؛ اگر true باشد منتشر نمی‌شود
//  ---
// ─────────────────────────────────────────────────────────────

const entrySchema = z.object({
  title: z.string(),
  description: z.string().default(''),
  pubDate: z.coerce.date(),
  updated: z.coerce.date().optional(),
  kind: z
    .enum(['reading-note', 'question', 'lesson', 'reflection', 'idea', 'article'])
    .default('article'),
  paper: z.string().optional(),
  references: z.array(z.string()).default([]),
  changelog: z
    .array(z.object({ date: z.coerce.date(), note: z.string() }))
    .default([]),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
});

export const collections = {
  // «برای همه» → src/content/everyone/
  everyone: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/everyone' }),
    schema: entrySchema,
  }),
  // «برای دندان‌پزشکان» → src/content/professionals/
  professionals: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/professionals' }),
    schema: entrySchema,
  }),
  // پروژهٔ Failuresafe → src/content/failsafe/
  failsafe: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/failsafe' }),
    schema: entrySchema,
  }),
  // پروژهٔ ABRZ → src/content/abrz/
  abrz: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/abrz' }),
    schema: entrySchema,
  }),
  // «دفترچهٔ یادگیری» → src/content/notebook/
  notebook: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/notebook' }),
    schema: entrySchema,
  }),
  // پروژهٔ «الفبای ادهزیو دنتیستری» → src/content/alphabet/
  alphabet: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/alphabet' }),
    schema: z.object({
      title: z.string(),
      description: z.string().default(''),
      pubDate: z.coerce.date(),
      chapter: z.number(),
      status: z.enum(['not-started', 'reading', 'completed']).default('not-started'),
      paper: z.string().default(''),
      voiceSummary: z.string().default(''),
      references: z.array(z.string()).default([]),
      changelog: z
        .array(z.object({ date: z.coerce.date(), note: z.string() }))
        .default([]),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
    }),
  }),
};
