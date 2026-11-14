// ایندکس جستجو — موقع build از همهٔ یادداشت‌ها ساخته می‌شود
// و در /search.json در دسترس صفحهٔ جستجو قرار می‌گیرد.
import { getCollection } from 'astro:content';
import { NOTE_KINDS } from '../config';

const colls = ['everyone', 'professionals', 'failsafe', 'abrz', 'notebook', 'alphabet'];

function label(p) {
  if (p.collection === 'notebook') return NOTE_KINDS[p.data.kind] ?? 'دفترچهٔ یادگیری';
  if (p.collection === 'failsafe') return 'Failuresafe';
  if (p.collection === 'abrz') return 'ABRZ';
  if (p.collection === 'alphabet') return 'الفبای ادهزیو';
  if (p.collection === 'everyone') return 'برای همه';
  return 'برای دندان‌پزشکان';
}

function urlOf(p) {
  if (p.collection === 'notebook') return `/notebook/${p.id}`;
  if (p.collection === 'failsafe') return `/professionals/failsafe/${p.id}`;
  if (p.collection === 'abrz') return `/professionals/abrz/${p.id}`;
  if (p.collection === 'alphabet') return `/alphabet/${p.id}`;
  return `/${p.collection}/${p.id}`;
}

// سبک‌سازی مارک‌داون برای متن قابل‌جستجو
const clean = (s) =>
  (s || '')
    .replace(/:::[a-z]+\s*$/gm, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*`|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export async function GET() {
  const all = (
    await Promise.all(colls.map((c) => getCollection(c, (p) => !p.data.draft)))
  ).flat();

  const items = all.map((p) => ({
    t: p.data.title,
    d: p.data.description || '',
    k: label(p),
    c: p.collection,
    u: urlOf(p),
    dt: p.data.pubDate.toISOString().slice(0, 10),
    b: clean(p.body).slice(0, 4000),
  }));

  return new Response(JSON.stringify(items), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
