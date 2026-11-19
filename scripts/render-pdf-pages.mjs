// رندر صفحه‌های مشخصی از یک PDF به PNG — برای دیدن و برش شکل‌های مقاله‌ها
// استفاده: node scripts/render-pdf-pages.mjs "<مسیر pdf>" 1,2,3 [scale]
import { readFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const [pdfPath, pagesArg = '1', scaleArg = '1.6'] = process.argv.slice(2);
const pages = pagesArg.split(',').map((p) => parseInt(p.trim(), 10));
const scale = parseFloat(scaleArg);

const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
const { createCanvas } = await import('@napi-rs/canvas');

const OUT = '.fig-pages';
mkdirSync(OUT, { recursive: true });

const data = new Uint8Array(readFileSync(pdfPath));
const doc = await getDocument({
  data,
  standardFontDataUrl: new URL('./node_modules/pdfjs-dist/standard_fonts/', import.meta.url).pathname,
}).promise;

const stem = path.basename(pdfPath).replace(/[^\w-]+/g, '-').slice(0, 24);
for (const n of pages) {
  const page = await doc.getPage(n);
  const vp = page.getViewport({ scale });
  const canvas = createCanvas(Math.ceil(vp.width), Math.ceil(vp.height));
  const ctx = canvas.getContext('2d');
  await page.render({ canvasContext: ctx, viewport: vp }).promise;
  const out = path.join(OUT, `${stem}-p${String(n).padStart(2, '0')}.png`);
  const { writeFile } = await import('node:fs/promises');
  await writeFile(out, canvas.toBuffer('image/png'));
  console.log('✔', out, `${Math.ceil(vp.width)}x${Math.ceil(vp.height)}`);
}
