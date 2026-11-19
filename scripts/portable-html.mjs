// ─────────────────────────────────────────────────────────────
//  نسخهٔ HTML قابل‌حمل — از dist یک کپی تک‌پوشه‌ای می‌سازد که با
//  دابل‌کلیک روی index.html بدون هیچ سروری باز می‌شود:
//    ۱) کپی dist → dist-html
//    ۲) لینک‌های داخلی صفحات ← مستقیم به <صفحه>/index.html
//    ۳) مسیرهای asset (css/js/img) ← نسبی بر حسب عمق صفحه
//    ۴) search.json داخل هر پوشهٔ صفحه کپی می‌شود تا جستجو هم کار کند
// ─────────────────────────────────────────────────────────────
import { readdirSync, statSync, readFileSync, writeFileSync, cpSync, rmSync, copyFileSync } from 'node:fs';
import path from 'node:path';

const SRC = 'dist';
const OUT = 'dist-html';

rmSync(OUT, { recursive: true, force: true });
cpSync(SRC, OUT, { recursive: true });

let htmlCount = 0;
const pageDirs = [];

const isAsset = (p) =>
  /^\/(_astro|images|favicon\.svg|search\.json)/.test(p) || /\.[a-z0-9]+$/i.test(p.replace(/\/$/, ''));

const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const f = path.join(dir, name);
    const s = statSync(f);
    if (s.isDirectory()) {
      walk(f);
      continue;
    }
    if (name.endsWith('.html')) {
      const rel = path.relative(OUT, f);
      const depth = rel.split(path.sep).length - 1;
      const prefix = '../'.repeat(depth) || './';
      pageDirs.push(path.dirname(f));

      let html = readFileSync(f, 'utf8');
      html = html.replace(/(src|href)="\/(?!\/)([^"]*)"/g, (m, attr, p) => {
        if (isAsset('/' + p)) return `${attr}="${prefix}${p}"`;
        // لینک داخلی به صفحه → مستقیم به فایل index.html آن
        const clean = p.replace(/\/+$/, '');
        return `${attr}="${prefix}${clean}/index.html"`;
      });
      writeFileSync(f, html);
      htmlCount++;
    } else if (name.endsWith('.js')) {
      let js = readFileSync(f, 'utf8');
      js = js
        .replaceAll('"/search.json"', 'new URL("search.json",document.baseURI).toString()')
        .replaceAll("'/search.json'", 'new URL("search.json",document.baseURI).toString()');
      writeFileSync(f, js);
    }
  }
};

walk(OUT);

// جستجوی آفلاین: search.json کنار هر صفحه
for (const d of pageDirs) {
  copyFileSync(path.join(OUT, 'search.json'), path.join(d, 'search.json'));
}

console.log(`✔ ${htmlCount} صفحه بازنویسی شد → ${OUT}/`);
console.log('برای باز کردن بدون سرور: dist-html/index.html را دابل‌کلیک کنید.');
