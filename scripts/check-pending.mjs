// بررسی فایل‌های پردازش‌نشده از آخرین اجرای خودکار
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, extname, basename } from 'node:path';

let state = {};
try {
  state = JSON.parse(readFileSync('.auto-processed.json', 'utf8'));
} catch {}

const walk = (d) => {
  for (const n of readdirSync(d)) {
    if (n.startsWith('.') || n === '_processed' || n === 'node_modules' || n === 'dist') continue;
    const f = join(d, n);
    const s = statSync(f);
    if (s.isDirectory()) walk(f);
    else {
      const rel = f.replaceAll('\\', '/');
      if (!['.pdf', '.docx', '.txt', '.md'].includes(extname(n).toLowerCase())) continue;
      if (n.startsWith('~$') || n.startsWith('.')) continue;
      const prev = state[rel];
      if (!prev || prev.mtime !== s.mtimeMs || prev.size !== s.size) {
        console.log('pending:', rel);
      }
    }
  }
};

for (const d of ['inbox', 'برای دندانپزشکان', 'برای همه']) {
  if (existsSync(d)) walk(d);
}
console.log('--- end ---');
