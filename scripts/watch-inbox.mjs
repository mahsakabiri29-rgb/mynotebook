// ═══════════════════════════════════════════════════════════
//  ناظر کشویی — به‌روزرسانی خودکار سایت از پوشهٔ inbox
//
//  کاربرد: فایلی را در یکی از زیرپوشه‌های inbox بیندازید؛
//  این اسکریپت آن را به یادداشت سایت تبدیل می‌کند:
//    inbox/everyone       → بخش «برای همه»
//    inbox/professionals  → بخش «برای دندان‌پزشکان»
//    inbox/failsafe       → پروژهٔ Failsafe
//    inbox/abrz           → پروژهٔ ABRZ
//    inbox/notebook       → دفترچهٔ یادگیری
//
//  پشتیبانی:
//    .md / .txt  → متن می‌شود بدنهٔ یادداشت (خط اول اگر «# عنوان» باشد، عنوان است)
//    .docx       → متن Word استخراج می‌شود (پاراگراف اول = عنوان)
//    .pdf        → یک پیش‌نویس (draft) با عنوان فایل ساخته می‌شود؛ متن را خودتان کامل کنید
//
//  فایل اصلی شما حذف نمی‌شود؛ به inbox/_processed منتقل می‌شود.
//  اگر سرور لوکال روشن باشد، مطلب بلافاصله در سایت ظاهر می‌شود.
// ═══════════════════════════════════════════════════════════

import { watch } from 'node:fs';
import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, writeFile, rename, stat } from 'node:fs/promises';
import path from 'node:path';
import AdmZip from 'adm-zip';

const ROOT = path.resolve(import.meta.dirname, '..');
const INBOX = path.join(ROOT, 'inbox');
const DONE = path.join(INBOX, '_processed');

const MAP = {
  everyone: 'src/content/everyone',
  professionals: 'src/content/professionals',
  failsafe: 'src/content/failsafe',
  abrz: 'src/content/abrz',
  notebook: 'src/content/notebook',
};

// پوشه‌های مواد پژوهشی خود کاربر — کپی می‌شوند نه منتقل؛ فقط Word/متن، نه PDF خام
const MATERIALS = [
  { dir: 'برای دندانپزشکان/projects/ABRZ', section: 'abrz' },
  { dir: 'برای دندانپزشکان/projects/failsafe', section: 'failsafe' },
  { dir: 'برای دندانپزشکان', section: 'professionals' },
  { dir: 'برای همه', section: 'everyone' },
];

const STATE_FILE = path.join(ROOT, '.materials-state.json');
let seen = {};
try {
  seen = JSON.parse(await readFile(STATE_FILE, 'utf8'));
} catch {
  seen = {};
}

const yaml = (s) => `'${String(s).replaceAll("'", "''")}'`;

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// نام فایل انگلیسی → همان؛ نام فارسی/دیگر → شناسهٔ زمانی
function slugFor(fileName) {
  const stem = fileName
    .replace(/\.[^.]+$/, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (stem.length >= 2) return stem;
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `note-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function decodeEntities(s) {
  return s
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'");
}

const cellText = (tc) => decodeEntities(tc.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();

function docxBlocks(buf) {
  const zip = new AdmZip(buf);
  const entry = zip.getEntry('word/document.xml');
  if (!entry) return [];
  let xml = zip.readAsText(entry);
  const blocks = [];

  // جدول‌ها → جدول مارک‌داون
  xml = xml.replace(/<w:tbl[\s\S]*?<\/w:tbl>/g, (tbl) => {
    const rows = tbl
      .split(/<\/w:tr>/)
      .map((r) => (r.match(/<w:tc[\s\S]*?<\/w:tc>/g) || []).map(cellText))
      .filter((cells) => cells.some((c) => c.length > 0));
    if (rows.length > 0) {
      const md = rows
        .map((cells, i) => `| ${cells.join(' | ')} |`)
        .concat(rows.length > 1 ? [`| ${rows[0].map(() => '---').join(' | ')} |`] : []);
      // خط جداکننده باید بعد از ردیف اول بیاید
      const [head, ...rest] = rows.map((cells) => `| ${cells.join(' | ')} |`);
      const sep = `| ${rows[0].map(() => '---').join(' | ')} |`;
      blocks.push([head, sep, ...rest].join('\n'));
    }
    return '\n@@BLOCK@@\n';
  });

  // پاراگراف‌های متنی (به ترتیب اصلی، با جای‌نگهدار جدول‌ها)
  const parts = xml.split(/<\/w:p>/).map((p) => {
    if (p.includes('@@BLOCK@@')) return '@@BLOCK@@';
    return decodeEntities(p.replace(/<[^>]+>/g, '')).trim();
  });

  const out = [];
  let pendingTables = 0;
  for (const part of parts) {
    if (part === '@@BLOCK@@') {
      if (blocks[pendingTables]) out.push(blocks[pendingTables]);
      pendingTables++;
    } else if (part) {
      out.push(part);
    }
  }
  out.push(...blocks.slice(pendingTables));
  return out.filter(Boolean);
}

function docxParagraphs(buf) {
  return docxBlocks(buf);
}

// صبر می‌کند تا کپی‌شدن فایل کامل شود (اندازه پایدار بماند)
async function waitStable(filePath) {
  let last = -1;
  for (let i = 0; i < 10; i++) {
    const s = await stat(filePath);
    if (s.size === last && s.size > 0) return true;
    last = s.size;
    await new Promise((r) => setTimeout(r, 700));
  }
  return false;
}

function frontMatter({ title, kind = 'article', draft = false, sourceName }) {
  return [
    '---',
    `title: ${yaml(title)}`,
    `description: ''`,
    `pubDate: ${today()}`,
    `kind: ${kind}`,
    ...(draft ? ['draft: true'] : []),
    '---',
    '',
    `<!-- از inbox اضافه شد؛ فایل اصلی: inbox/_processed/${sourceName} -->`,
    '',
  ].join('\n');
}

async function handleFile(dir, name, section) {
  const full = path.join(dir, name);
  const s = await stat(full);
  if (!s.isFile()) return;

  const ext = path.extname(name).toLowerCase();
  if (!['.md', '.txt', '.docx', '.pdf'].includes(ext)) return;
  if (name.startsWith('~$') || name.startsWith('.')) return;

  await waitStable(full);
  const buf = await readFile(full);

  let title = name.replace(/\.[^.]+$/, '');
  let body = '';
  let draft = false;
  let kind = 'article';

  if (ext === '.md' || ext === '.txt') {
    const text = buf.toString('utf8').replace(/^\uFEFF/, '').trim();
    const lines = text.split(/\r?\n/);
    if (lines[0]?.startsWith('# ')) {
      title = lines[0].slice(2).trim();
      body = lines.slice(1).join('\n').trim();
    } else {
      body = text;
    }
    // اگر خودش فرانت‌متر دارد، دست نمی‌زنیم — مستقیم منتقل می‌شود
    if (body.startsWith('---') || text.startsWith('---')) {
      const dest = path.join(ROOT, MAP[section], `${slugFor(name)}.md`);
      await writeFile(dest, text + '\n', 'utf8');
      await mkdir(DONE, { recursive: true });
      await rename(full, path.join(DONE, name));
      console.log(`✔ (فرانت‌متر داشت) ${name} → ${path.relative(ROOT, dest)}`);
      return;
    }
  } else if (ext === '.docx') {
    const paras = docxParagraphs(buf);
    if (paras.length > 0 && paras[0].length <= 120) {
      title = paras[0];
      body = paras.slice(1).join('\n\n');
    } else {
      body = paras.join('\n\n');
    }
  } else if (ext === '.pdf') {
    draft = true;
    body = [
      '<!-- این مقاله هنوز خوانده و خلاصه نشده است. -->',
      '',
      'این مدخل به‌صورت خودکار از یک فایل PDF ساخته شده است.',
      'یادداشت مطالعه را این‌جا بنویسید و از بلوک‌های `:::evidence` و `:::interpretation` استفاده کنید.',
    ].join('\n');
  }

  if (section === 'notebook' && ext !== '.pdf') kind = 'article';

  const dest = path.join(ROOT, MAP[section], `${slugFor(name)}.md`);
  const content = frontMatter({ title, kind, draft, sourceName: name }) + body + '\n';
  await writeFile(dest, content, 'utf8');

  await mkdir(DONE, { recursive: true });
  await rename(full, path.join(DONE, name));
  console.log(`✔ ${name} → ${path.relative(ROOT, dest)}${draft ? ' (پیش‌نویس)' : ''}`);
}

let timer = null;

async function* walk(dir) {
  for (const name of await readdir(dir)) {
    const full = path.join(dir, name);
    const s = await stat(full);
    if (s.isDirectory()) yield* walk(full);
    else yield { full, s };
  }
}

async function processMaterials() {
  let changed = false;
  for (const m of MATERIALS) {
    const dir = path.join(ROOT, m.dir);
    if (!existsSync(dir)) continue;
    for await (const { full, s } of walk(dir)) {
      const rel = path.relative(ROOT, full).replaceAll('\\', '/');
      const ext = path.extname(full).toLowerCase();
      const name = path.basename(full);
      if (name.startsWith('~$') || name.startsWith('.')) continue;
      if (ext !== '.docx' && ext !== '.txt' && ext !== '.md') continue; // PDF خام را دست نمی‌زنیم

      const prev = seen[rel];
      const now = { mtime: s.mtimeMs, size: s.size };
      if (prev && prev.mtime === now.mtime && prev.size === now.size) continue; // بدون تغییر

      try {
        await waitStable(full);
        const buf = await readFile(full);
        const paras = ext === '.docx' ? docxBlocks(buf) : buf.toString('utf8').replace(/^\uFEFF/, '').split(/\r?\n/).filter((l) => l.trim());
        let title = name.replace(/\.[^.]+$/, '');
        let bodyLines = paras;
        if (paras.length > 0) {
          const first = paras[0];
          if (first.length <= 120 && !first.startsWith('|')) {
            title = first;
            bodyLines = paras.slice(1);
          }
        }
        const dest = path.join(ROOT, MAP[m.section], `${slugFor(name)}.md`);
        const content =
          [
            '---',
            `title: ${yaml(title)}`,
            `description: ''`,
            `pubDate: ${today()}`,
            `kind: article`,
            'draft: true',
            '---',
            '',
            `<!-- از پوشهٔ مواد: ${rel} — متن خام؛ قبل از انتشار، خلاصه و دسته‌بندی شود (بلوک‌های :::evidence و :::interpretation) -->`,
            '',
          ].join('\n') + bodyLines.join('\n\n') + '\n';
        await writeFile(dest, content, 'utf8');
        seen[rel] = now;
        changed = true;
        console.log(`✔ (مواد) ${name} → ${path.relative(ROOT, dest)}`);
      } catch (e) {
        console.error(`✖ (مواد) ${name}: ${e.message}`);
      }
    }
  }
  if (changed) await writeFile(STATE_FILE, JSON.stringify(seen, null, 2), 'utf8');
}

async function processAll() {
  await processMaterials();
  for (const [folder, destRel] of Object.entries(MAP)) {
    const dir = path.join(INBOX, folder);
    if (!existsSync(dir)) continue;
    for (const name of await readdir(dir)) {
      try {
        await handleFile(dir, name, folder);
      } catch (e) {
        console.error(`✖ ${name}: ${e.message}`);
      }
    }
  }
}

console.log('ناظر کشویی روشن شد — منتظر فایل‌های جدید در inbox/ ...');
await processAll();
try {
  watch(INBOX, { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(processAll, 1500);
  });
} catch (e) {
  console.error('خطا در ناظر فایل:', e.message);
  process.exit(1);
}
