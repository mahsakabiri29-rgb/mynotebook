// ─────────────────────────────────────────────────────────────
//  نسخهٔ HTML قابل‌حمل — از dist یک کپی تک‌پوشه‌ای می‌سازد که با
//  دابل‌کلیک روی index.html بدون هیچ سروری باز می‌شود:
//    ۱) کپی dist → dist-html
//    ۲) بازنویسی آدرس‌های مطلق (src="/x") به نسبی بر حسب عمق صفحه
//    ۳) اصلاح fetch('/search.json') در جاوااسکریپت برای file://
//  پس از اجرا: dist-html را زیپ کنید یا همان‌جا باز کنید.
// ─────────────────────────────────────────────────────────────
import { readdirSync, statSync, readFileSync, writeFileSync, cpSync, rmSync } from 'node:fs';
import path from 'node:path';

const SRC = 'dist';
const OUT = 'dist-html';

rmSync(OUT, { recursive: true, force: true });
cpSync(SRC, OUT, { recursive: true });

let htmlCount = 0;

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
      let html = readFileSync(f, 'utf8');
      // آدرس‌های مطلق ریشه‌ای → نسبی
      html = html.replace(/(src|href)="\/(?!\/)/g, `$1="${prefix}`);
      writeFileSync(f, html);
      htmlCount++;
    } else if (name.endsWith('.js')) {
      let js = readFileSync(f, 'utf8');
      // مسیر مطلق fetch ایندکس جستجو → نسبی به صفحه
      js = js
        .replaceAll('"/search.json"', 'new URL("search.json",document.baseURI).toString()')
        .replaceAll("'/search.json'", 'new URL("search.json",document.baseURI).toString()');
      writeFileSync(f, js);
    }
  }
};

walk(OUT);
console.log(`✔ ${htmlCount} صفحه بازنویسی شد → ${OUT}/`);
console.log('برای باز کردن بدون سرور: dist-html/index.html را دابل‌کلیک کنید.');
