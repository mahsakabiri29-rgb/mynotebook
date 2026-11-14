// ─────────────────────────────────────────────────────────────
//  پیشنهادهای زندهٔ جستجو — برای هر input با data-suggest
//  دراپ‌داون زیر نوار: ۶ پیشنهاد برتر، پیمایش با ↑↓، Enter برای رفتن، Esc برای بستن
// ─────────────────────────────────────────────────────────────

type Item = { t: string; d: string; k: string; c: string; u: string; dt: string; b: string };

let idx: Item[] | null = null;

const norm = (s: string) =>
  s.replaceAll('ي', 'ی').replaceAll('ك', 'ک').replaceAll('\u200c', ' ').toLowerCase();

async function load(): Promise<Item[]> {
  if (!idx) idx = (await (await fetch('/search.json')).json()) as Item[];
  return idx;
}

const COLORS: Record<string, string> = {
  everyone: '#17706e',
  professionals: '#1b4079',
  failsafe: '#1b4079',
  abrz: '#1b4079',
  notebook: '#6b4d7f',
  alphabet: '#0f3a4a',
};

function attach(input: HTMLInputElement) {
  const wrap = input.closest('.suggest-wrap') as HTMLElement | null;
  if (!wrap) return;

  let list: HTMLUListElement | null = null;
  let items: Item[] = [];
  let active = -1;

  const close = () => {
    list?.remove();
    list = null;
    items = [];
    active = -1;
  };

  const setActive = (i: number) => {
    active = i;
    list?.querySelectorAll('li').forEach((li, j) => li.classList.toggle('on', j === i));
  };

  const open = async () => {
    const q = input.value.trim();
    if (q.length < 2) {
      close();
      return;
    }
    let hits: Item[];
    try {
      const all = await load();
      const qn = norm(q);
      hits = all
        .map((it) => {
          const t = norm(it.t);
          const d = norm(it.d);
          const b = norm(it.b);
          let s = 0;
          if (t.includes(qn)) s += 6;
          if (d.includes(qn)) s += 2;
          if (b.includes(qn)) s += 1;
          return { it, s };
        })
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s)
        .slice(0, 6)
        .map((x) => x.it);
    } catch {
      return;
    }
    if (hits.length === 0) {
      close();
      return;
    }
    items = hits;
    if (!list) {
      list = document.createElement('ul');
      list.className = 'suggest';
      wrap.appendChild(list);
    }
    list.innerHTML = '';
    items.forEach((it, i) => {
      const li = document.createElement('li');
      const dot = document.createElement('span');
      dot.className = 'sg-dot';
      dot.style.background = COLORS[it.c] ?? '#1b4079';
      const title = document.createElement('span');
      title.className = 'sg-title';
      title.textContent = it.t;
      const meta = document.createElement('span');
      meta.className = 'sg-meta';
      meta.textContent = it.k;
      li.append(dot, title, meta);
      li.addEventListener('mousedown', (e) => {
        e.preventDefault();
        location.href = it.u;
      });
      li.addEventListener('mouseenter', () => setActive(i));
      list!.appendChild(li);
    });
    setActive(-1);
  };

  input.addEventListener('input', () => setTimeout(open, 50));
  input.addEventListener('focus', open);
  input.addEventListener('blur', () => setTimeout(close, 120));
  input.addEventListener('keydown', (e) => {
    if (!list) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const n = items.length;
      if (n === 0) return;
      setActive(e.key === 'ArrowDown' ? (active + 1) % n : active <= 0 ? n - 1 : active - 1);
    } else if (e.key === 'Enter') {
      if (items.length > 0) {
        e.preventDefault();
        location.href = items[active >= 0 ? active : 0].u;
      }
    } else if (e.key === 'Escape') {
      close();
    }
  });
}

export function initSuggest() {
  document.querySelectorAll<HTMLInputElement>('input[data-suggest]').forEach(attach);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSuggest);
  } else {
    initSuggest();
  }
}
