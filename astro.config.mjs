// @ts-check
import { defineConfig } from 'astro/config';
import remarkDirective from 'remark-directive';
import remarkBlocks from './src/lib/remark-blocks.mjs';

// https://astro.build/config
export default defineConfig({
  // آدرس سایت؛ فعلاً فقط لوکال است. اگر بعداً سایت را منتشر کردید، این را به آدرس واقعی تغییر دهید.
  site: 'http://localhost:4321',
  markdown: {
    remarkPlugins: [remarkDirective, remarkBlocks],
  },
});
