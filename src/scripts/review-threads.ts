// Review threads, like comments in Figma (docs/claude-code-instructions-review-threads.md). Dev only: case-comments.ts
// loads this behind `import.meta.env.DEV` with ?review, so the build has none of it. Threads live in
// docs/review/inso-threads.json, read and written through the dev server (integrations/review-threads.mjs).
import '../styles/review-threads.css';

type Msg = { author: string; at: string; text: string };
type Thread = {
  id: string; page: string; section: string; rid: string; quote: string; selection?: string;
  version: 'a' | 'b' | 'both'; status: 'open' | 'resolved'; messages: Msg[]; change?: { before: string; after: string };
};

const API = '/__review/threads';
const PAGE = location.pathname;
const phone = window.matchMedia('(max-width: 767px)');
const store = { get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch {} } };

// ---------- anchors: a stable data-rid on every reviewable block, from its section and position, never its text ----------
// Kinds: label (the section label), p, h (subheading), li, fig (figure or slideshow), finding, block, stats, and table
// labels and cells (table1-label, table1-r2c3). The two wordings of an A/B pair get the same numbers, so a rid holds
// in both versions, and the count after the pair goes on from the longer one.
const SEL = '.a-case__lede, .a-story :is(h2, h3, h4, p, li, figure, .cs-block, .cs-stats, .cs-ut__label, td)';
const slug = (s: string) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section';

export function assignRids(root: Document = document) {
  const all = [...root.querySelectorAll<HTMLElement>(SEL)].filter((el) => !el.parentElement?.closest(SEL) && !el.matches('.sr-only'));
  let sec = 'intro', counters: Record<string, number> = {}, snap: Record<string, number> | null = null, endA: Record<string, number> | null = null;
  let box: Element | null = null;
  const tables = new Map<Element, number>();
  const bump = (k: string) => (counters[k] = (counters[k] ?? 0) + 1);
  for (const el of all) {
    const b = el.closest('.ab[data-version]');
    if (b !== box) {
      if (box?.getAttribute('data-version') === 'b' && endA) { for (const k in endA) counters[k] = Math.max(counters[k] ?? 0, endA[k]); endA = null; }
      if (b?.getAttribute('data-version') === 'a') snap = { ...counters };
      else if (b?.getAttribute('data-version') === 'b' && b.previousElementSibling?.matches('.ab[data-version="a"]') && snap) { endA = { ...counters }; counters = { ...snap }; }
      box = b;
    }
    let rid: string;
    if (el.matches('h2')) { sec = slug(el.textContent ?? ''); rid = `${sec}-label`; }
    else if (el.matches('td, .cs-ut__label')) {
      const t = el.closest('.cs-ut') ?? el.closest('table')!;
      let ti = tables.get(t);
      if (!ti) { ti = bump(`${sec}|table`); tables.set(t, ti); }
      rid = el.matches('td') ? `${sec}-table${ti}-r${(el.parentElement as HTMLTableRowElement).sectionRowIndex + 1}c${(el as HTMLTableCellElement).cellIndex + 1}` : `${sec}-table${ti}-label`;
    } else {
      const kind = el.matches('h3, h4') ? 'h' : el.matches('figure') ? 'fig' : el.matches('.cs-block') ? (el.matches('.cs-block--result') ? 'finding' : 'block') : el.matches('.cs-stats') ? 'stats' : el.matches('li') ? 'li' : 'p';
      rid = `${sec}-${kind}${bump(`${sec}|${kind}`)}`;
    }
    el.dataset.rid = rid;
  }
}

// ---------- data ----------
let threads: Thread[] = [];
let showResolved = store.get('rt-resolved') === '1';
const load = async () => {
  try {
    const r = await fetch(`${API}?page=${encodeURIComponent(PAGE)}`, { cache: 'no-store' });
    if (!r.ok) return;
    threads = (await r.json()).threads ?? [];
    render();
  } catch {}
};
const post = async (body: object) => {
  const r = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error ?? String(r.status));
  await load();
  return j.result;
};

// a new thread, from the dragged pin (case-comments.ts)
export const create = (el: HTMLElement, text: string, quote: string, section: string, selection?: string) => post({
  action: 'create', page: PAGE, section, quote, text,
  rid: el.closest<HTMLElement>('[data-rid]')?.dataset.rid ?? '',
  version: el.closest<HTMLElement>('.ab[data-version]')?.dataset.version ?? 'both',
  selection: selection && (el.textContent ?? '').includes(selection) ? selection : undefined,
});

// ---------- helpers ----------
const num = (t: Thread) => String(Number(t.id.replace(/\D/g, '')) || t.id);
const active = () => document.querySelector<HTMLElement>('.ab-switch [aria-pressed="true"]')?.dataset.v ?? 'a';
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const md = (s: string) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
const plain = (s: string) => s.replace(/\*\*(.+?)\*\*/g, '$1').replace(/==(.+?)==/g, '$1');
const when = (at: string) => { const d = new Date(at); return isNaN(+d) ? at : d.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); };
const ridEls = (t: Thread) => (t.rid ? [...document.querySelectorAll<HTMLElement>(`[data-rid="${CSS.escape(t.rid)}"]`)] : []);
const blockOf = (t: Thread) => ridEls(t).find((e) => !e.closest('[hidden]')) ?? null;
const anchored = (t: Thread) => ridEls(t).length > 0;
const pinned = (t: Thread) => (t.version === 'both' || t.version === active()) && (t.status === 'open' || showResolved) && !!blockOf(t);
// where Before/Now swaps the words: a figure's caption, a finding's sentence, otherwise the block itself
const textOf = (block: HTMLElement) => block.matches('figure') ? block.querySelector<HTMLElement>('[data-cap-text]') ?? block.querySelector<HTMLElement>('figcaption') ?? block
  : block.matches('.cs-block') ? block.querySelector<HTMLElement>('p:not(.cs-block__title, .cs-block__source)') ?? block : block;

// a word diff: removed words struck through, added words underlined
const diff = (a: string, b: string) => {
  const x = plain(a).split(/(\s+)/), y = plain(b).split(/(\s+)/);
  const L = Array.from({ length: x.length + 1 }, () => new Array<number>(y.length + 1).fill(0));
  for (let i = x.length - 1; i >= 0; i--) for (let j = y.length - 1; j >= 0; j--) L[i][j] = x[i] === y[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  // spaces are never marked (they collapse in HTML anyway), so neighbouring changed words merge into one mark
  const del = (s: string) => (/^\s*$/.test(s) ? s : `<del>${esc(s)}</del>`), ins = (s: string) => (/^\s*$/.test(s) ? s : `<ins>${esc(s)}</ins>`);
  let i = 0, j = 0, out = '';
  while (i < x.length && j < y.length) {
    if (x[i] === y[j]) { out += esc(x[i]); i++; j++; }
    else if (L[i + 1][j] >= L[i][j + 1]) out += del(x[i++]);
    else out += ins(y[j++]);
  }
  while (i < x.length) out += del(x[i++]);
  while (j < y.length) out += ins(y[j++]);
  return out.replace(/<\/del>(\s*)<del>/g, '$1').replace(/<\/ins>(\s*)<ins>/g, '$1').replace(/<\/del><ins>/g, '</del> <ins>');
};

// ---------- UI ----------
const ui = document.createElement('div');
ui.className = 'rt-ui';
ui.innerHTML = `
  <div class="rt-pins"></div>
  <div class="rt-card" role="dialog" aria-modal="false" aria-labelledby="rt-card-title" tabindex="-1" hidden></div>
  <aside class="rt-panel" aria-label="Review threads" tabindex="-1" hidden>
    <div class="rt-panel__head">
      <p class="rt-panel__title">Threads</p>
      <button type="button" class="rt-x" data-close-panel aria-label="Close the threads panel">×</button>
    </div>
    <div class="rt-filter" role="group" aria-label="Show">
      <button type="button" data-f="open" aria-pressed="true">Open</button><button type="button" data-f="resolved" aria-pressed="false">Resolved</button><button type="button" data-f="all" aria-pressed="false">All</button>
    </div>
    <label class="rt-check"><input type="checkbox" data-show-resolved /> Show resolved pins</label>
    <div class="rt-import" hidden><button type="button" data-import>Import local notes</button><p class="rt-import__status" role="status" aria-live="polite"></p></div>
    <div class="rt-list"></div>
  </aside>`;
document.body.append(ui);
const pinsEl = ui.querySelector<HTMLElement>('.rt-pins')!;
const card = ui.querySelector<HTMLElement>('.rt-card')!;
const panel = ui.querySelector<HTMLElement>('.rt-panel')!;
const list = ui.querySelector<HTMLElement>('.rt-list')!;
let filter = store.get('rt-filter') ?? 'open';
(panel.querySelector('[data-show-resolved]') as HTMLInputElement).checked = showResolved;

// the review bar (bottom left) gets the Threads button; "Copy all for Claude" goes, the local notes stay until cleared
const bar = document.querySelector<HTMLElement>('.cc-review');
const openBtn = document.createElement('button');
openBtn.type = 'button';
openBtn.className = 'rt-open';
bar?.querySelector('.cc-copy')?.setAttribute('hidden', '');
bar?.querySelector('[data-cc-count]')?.setAttribute('hidden', '');
const clearBtn = bar?.querySelector<HTMLButtonElement>('.cc-clear');
if (clearBtn) clearBtn.textContent = 'Clear local notes';
bar?.prepend(openBtn);
// the highlights on blocks with open threads (and the underlined words) switch off, to read the page as a visitor
let hl = store.get('rt-hl') !== 'off';
const hlBtn = document.createElement('button');
hlBtn.type = 'button';
hlBtn.className = 'rt-hl-toggle';
hlBtn.textContent = 'Highlights';
openBtn.after(hlBtn);
const setHl = () => { document.documentElement.classList.toggle('rt-no-hl', !hl); hlBtn.setAttribute('aria-pressed', String(hl)); underline(); };
hlBtn.addEventListener('click', () => { hl = !hl; store.set('rt-hl', hl ? 'on' : 'off'); setHl(); });
const localNotes = () => { try { return JSON.parse(store.get('cc-notes') ?? '[]') as { page: string; section: string; quote: string; comment: string }[]; } catch { return []; } };

// ---------- pins ----------
let openId: string | null = null, opener: HTMLElement | null = null;
const layout = () => {
  const byBlock = new Map<HTMLElement, number>();
  pinsEl.querySelectorAll<HTMLElement>('.rt-pin').forEach((pin) => {
    const t = threads.find((x) => x.id === pin.dataset.id);
    const block = t && blockOf(t);
    if (!block) { pin.hidden = true; return; }
    pin.hidden = false;
    const k = byBlock.get(block) ?? 0; byBlock.set(block, k + 1);
    const r = block.getBoundingClientRect();
    const left = phone.matches ? r.right - 30 - k * 30 : Math.min(r.right + 16, document.documentElement.clientWidth - 34) ;
    const top = phone.matches ? r.top + 4 : r.top + 2 + k * 32;
    pin.style.left = `${left + scrollX}px`;
    pin.style.top = `${top + scrollY}px`;
  });
  if (openId && !card.hidden && !phone.matches) placeCard();
};
let raf = 0;
const relayout = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(layout); };

const underline = () => {
  if (!('highlights' in CSS)) return;
  if (!hl) { (CSS as any).highlights.delete('rt-sel'); return; }
  const ranges: Range[] = [];
  threads.filter((t) => t.selection && t.status === 'open' && pinned(t)).forEach((t) => {
    const block = blockOf(t)!;
    const walk = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      const k = n.textContent!.indexOf(t.selection!);
      if (k >= 0) { const r = new Range(); r.setStart(n, k); r.setEnd(n, k + t.selection!.length); ranges.push(r); break; }
    }
  });
  (CSS as any).highlights.set('rt-sel', new (window as any).Highlight(...ranges));
};

const render = () => {
  document.querySelectorAll('.rt-hl').forEach((e) => e.classList.remove('rt-hl'));
  pinsEl.replaceChildren(...threads.filter(pinned).map((t) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `rt-pin${t.status === 'resolved' ? ' is-resolved' : ''}${t.id === openId ? ' is-active' : ''}`;
    b.dataset.id = t.id;
    b.textContent = num(t);
    b.setAttribute('aria-label', `Thread ${num(t)}, ${t.status}: ${plain(t.messages[0]?.text ?? '').slice(0, 60)}`);
    if (t.status === 'open') blockOf(t)?.classList.add('rt-hl');
    return b;
  }));
  layout();
  underline();
  const open = threads.filter((t) => t.status === 'open').length;
  openBtn.textContent = `Threads (${open})`;
  openBtn.setAttribute('aria-label', `Threads: ${open} open, ${threads.length} in all`);
  const notes = localNotes();
  ui.querySelector<HTMLElement>('.rt-import')!.hidden = !notes.length || !!store.get('rt-imported');
  if (clearBtn) clearBtn.hidden = !notes.length;
  renderList();
  if (openId) { const t = threads.find((x) => x.id === openId); if (t && !card.hidden) fillCard(t); }
};

// ---------- Before / Now: the old words back in place ----------
// The change's After is looked up in the block's visible words (a tooltip's note and screen-reader text left out) and
// only that stretch goes back to Before; if it isn't there, the whole text does. "x / y" pairs, and After paragraphs
// past the first (found in the blocks that follow, then hidden), are handled part by part. An After in brackets means
// the words were removed: Before puts them back at the end. The page's own nodes are kept aside and put back on Now.
const SKIP = '.cs-tip__note, .sr-only, .cs-cap__frame';
const flat = (s: string) => s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"');
const rangeOf = (el: HTMLElement, text: string) => {
  // a tooltip written into the change, "(ⓘ…)" or "[ⓘ…]", isn't in the words on the page
  const frags = flat(plain(text)).replace(/\s*(\(ⓘ[^)]*\)|\[ⓘ[^\]]*\])/g, '').replace(/\s+/g, ' ').split('…').map((f) => f.trim()).filter(Boolean);
  if (!frags.length) return null;
  let s = '';
  const at: [Text, number][] = []; // where each character of s sits
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.parentElement?.closest(SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) });
  for (let n = walk.nextNode() as Text | null; n; n = walk.nextNode() as Text | null) {
    for (let k = 0; k < n.data.length; k++) {
      if (/\s/.test(n.data[k])) { if (s && !s.endsWith(' ')) { s += ' '; at.push([n, k]); } }
      else { s += flat(n.data[k]); at.push([n, k]); }
    }
  }
  let from = -1, end = 0;
  for (const f of frags) { const k = s.indexOf(f, end); if (k < 0) return null; if (from < 0) from = k; end = k + f.length; }
  const r = new Range();
  r.setStart(...at[from]);
  r.setEnd(at[end - 1][0], at[end - 1][1] + 1);
  return r;
};
const html = (s: string) => { const tpl = document.createElement('template'); tpl.innerHTML = md(s); return tpl.content; };
let shown: { saved: Map<HTMLElement, Node[]>; hid: HTMLElement[] } | null = null;
const now = () => {
  if (!shown) return;
  shown.saved.forEach((nodes, el) => { el.replaceChildren(...nodes); el.classList.remove('rt-before'); });
  shown.hid.forEach((el) => { el.hidden = false; });
  shown = null;
};
// returns false when there was nothing to swap (Before is what the page already says, in this version)
const before = (t: Thread) => {
  const block = blockOf(t);
  if (!block || !t.change || shown) return true;
  const saved = new Map<HTMLElement, Node[]>(), hid: HTMLElement[] = [];
  // edit a copy, so the page's own nodes (and their listeners) come back untouched on Now
  const edit = (el: HTMLElement, fn: (copy: HTMLElement) => boolean) => {
    const copy = el.cloneNode(true) as HTMLElement;
    if (!fn(copy)) return false;
    if (!saved.has(el)) saved.set(el, [...el.childNodes]);
    el.replaceChildren(...copy.childNodes);
    el.classList.add('rt-before');
    return true;
  };
  const swap = (a: string, b: string) => (copy: HTMLElement) => { const r = rangeOf(copy, a); if (!r) return false; r.deleteContents(); r.insertNode(html(b)); return true; };
  const main = textOf(block);
  const after = t.change.after.replace(/^\((?:A|B)\)\s*/, '').trim(), old = t.change.before;
  if (/^\([^]*\)$/.test(after)) edit(main, (c) => { c.append(' ', html(old)); return true; });
  else {
    const split = (s: string) => (s.includes(' / ') ? s.split(' / ') : s.split(/\n\s*\n/));
    const A = split(after), B = split(old);
    // more After paragraphs than Before ones: the extra ones hide; "x / y" lists that don't pair up: only the first part
    const pairs: [string, string | null][] = A.length === B.length ? A.map((a, i) => [a, B[i]])
      : after.includes(' / ') ? [[A[0], B[0]]] : [[A[0], old], ...A.slice(1).map((a): [string, null] => [a, null])];
    const next = [...document.querySelectorAll<HTMLElement>('[data-rid]')].filter((e) => e !== block && !e.closest('[hidden]') && block.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_FOLLOWING).slice(0, 40);
    const spots: [HTMLElement, HTMLElement][] = [[block, main], ...next.map((e): [HTMLElement, HTMLElement] => [e, textOf(e)])];
    pairs.forEach(([a, b], i) => {
      const spot = spots.find(([, el]) => rangeOf(el, a));
      if (spot && b === null) { spot[0].hidden = true; hid.push(spot[0]); }
      else if (spot) edit(spot[1], swap(a, b!));
      else if (i === 0 && !rangeOf(main, B[0])) edit(main, (c) => { c.replaceChildren(html(old)); return true; }); // not found: the whole text
    });
  }
  if (!saved.size && !hid.length) return false;
  shown = { saved, hid };
  return true;
};

// ---------- the thread card ----------
const placeCard = () => {
  const pin = pinsEl.querySelector<HTMLElement>(`.rt-pin[data-id="${openId}"]`);
  if (phone.matches) { card.style.left = card.style.top = ''; return; }
  const w = card.offsetWidth, h = card.offsetHeight, vw = document.documentElement.clientWidth;
  const block = blockOf(threads.find((x) => x.id === openId)!);
  const r = pin && !pin.hidden ? pin.getBoundingClientRect() : (block ?? document.body).getBoundingClientRect();
  // beside the pin when there's room, otherwise under the block, so it never covers the words it's about
  if (r.right + 10 + w <= vw - 12) {
    card.style.left = `${r.right + 10 + scrollX}px`;
    card.style.top = `${Math.max(12, Math.min(Math.max(r.top - 12, 12), innerHeight - h - 12)) + scrollY}px`;
  } else {
    const b = (block ?? pin ?? document.body).getBoundingClientRect();
    card.style.left = `${Math.max(12, Math.min(r.right, vw - 12) - w) + scrollX}px`;
    card.style.top = `${b.bottom + 14 + scrollY}px`;
  }
};
const fillCard = (t: Thread) => {
  const ta = card.querySelector('textarea');
  const draft = ta?.value ?? '', focused = document.activeElement === ta, mode = shown ? 'before' : 'now';
  const tag = t.version === 'both' ? '' : `<span class="rt-tag">${t.version.toUpperCase()}</span>`;
  card.innerHTML = `
    <div class="rt-card__head">
      <p class="rt-card__title" id="rt-card-title">#${num(t)} · ${esc(t.section)} ${tag}${t.status === 'resolved' ? ' <span class="rt-tag rt-tag--done">Resolved</span>' : ''}</p>
      <button type="button" class="rt-x" data-close aria-label="Close the thread">×</button>
    </div>
    <p class="rt-card__on">On “${esc(t.quote.slice(0, 90))}${t.quote.length > 90 ? '…' : ''}”${anchored(t) ? '' : ' <span class="rt-tag">Unanchored</span>'}</p>
    ${t.change ? `<div class="rt-bn" role="group" aria-label="Wording on the page"><button type="button" data-bn="before" aria-pressed="${mode === 'before'}">Before</button><button type="button" data-bn="now" aria-pressed="${mode === 'now'}">Now</button></div>
      <p class="rt-diff">${diff(t.change.before, t.change.after)}</p>` : ''}
    <ol class="rt-msgs">${t.messages.map((m) => `<li class="rt-msg${m.author === 'Claude' ? ' rt-msg--claude' : ''}"><p class="rt-msg__meta"><strong>${esc(m.author)}</strong> · ${esc(when(m.at))}</p><div class="rt-msg__text">${md(m.text)}</div></li>`).join('')}</ol>
    <form class="rt-reply">
      <label><span class="sr-only">Reply</span><textarea rows="3" placeholder="Reply (⌘/Ctrl + Enter sends)"></textarea></label>
      <div class="rt-actions">
        <button type="button" class="rt-btn" data-status>${t.status === 'open' ? 'Resolve' : 'Reopen'}</button>
        <button type="submit" class="rt-btn rt-btn--main">Reply</button>
      </div>
      <p class="rt-status" role="status" aria-live="polite"></p>
    </form>`;
  const nta = card.querySelector('textarea')!;
  nta.value = draft;
  if (focused) nta.focus({ preventScroll: true });
  card.querySelector('[data-bn="before"]')?.toggleAttribute('disabled', !blockOf(t));
};
const openCard = (t: Thread, from: HTMLElement | null) => {
  if (openId && openId !== t.id) closeCard(false);
  openId = t.id; opener = from;
  card.hidden = false;
  fillCard(t);
  render();
  placeCard();
  card.focus({ preventScroll: true });
};
const closeCard = (refocus = true) => {
  now();
  card.hidden = true;
  const id = openId; openId = null;
  render();
  if (!refocus) return;
  const pin = pinsEl.querySelector<HTMLElement>(`.rt-pin[data-id="${id}"]`);
  (pin && !pin.hidden ? pin : opener)?.focus({ preventScroll: true });
};
card.addEventListener('click', async (e) => {
  const el = e.target as HTMLElement;
  const t = threads.find((x) => x.id === openId);
  if (!t) return;
  if (el.closest('[data-close]')) return closeCard();
  const bn = el.closest<HTMLElement>('[data-bn]')?.dataset.bn;
  if (bn) {
    const same = bn === 'before' && !before(t);
    if (bn === 'now') now();
    card.querySelector('.rt-status')!.textContent = same ? 'Nothing to swap: the page already says the Before here (this version).' : '';
    const mode = shown ? 'before' : 'now';
    card.querySelectorAll('[data-bn]').forEach((b) => b.setAttribute('aria-pressed', String((b as HTMLElement).dataset.bn === mode)));
    return;
  }
  if (el.closest('[data-status]')) {
    try { await post({ action: 'status', id: t.id, status: t.status === 'open' ? 'resolved' : 'open' }); }
    catch (err) { card.querySelector('.rt-status')!.textContent = `Couldn't save: ${(err as Error).message}`; }
  }
});
card.addEventListener('submit', async (e) => {
  e.preventDefault();
  const ta = card.querySelector('textarea')!, text = ta.value.trim();
  if (!text || !openId) return;
  const status = card.querySelector('.rt-status')!;
  status.textContent = 'Sending…';
  try { const id = openId; ta.value = ''; await post({ action: 'reply', id, text }); card.querySelector('textarea')?.focus(); }
  catch (err) { ta.value = text; status.textContent = `Couldn't save: ${(err as Error).message}`; }
});
card.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { e.stopPropagation(); closeCard(); }
  else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && (e.target as HTMLElement).matches('textarea')) { e.preventDefault(); card.querySelector<HTMLFormElement>('form')?.requestSubmit(); }
});
document.addEventListener('pointerdown', (e) => {
  const el = e.target as HTMLElement;
  if (card.hidden || card.contains(el) || el.closest('.rt-pin, .rt-panel, .ab-switch, .cc-review')) return;
  closeCard(false);
});
pinsEl.addEventListener('click', (e) => {
  const pin = (e.target as HTMLElement).closest<HTMLElement>('.rt-pin');
  const t = pin && threads.find((x) => x.id === pin.dataset.id);
  if (!t) return;
  if (openId === t.id && !card.hidden) closeCard(false); else openCard(t, pin);
});

// ---------- the panel ----------
const renderList = () => {
  const keep = (t: Thread) => filter === 'all' || t.status === filter;
  const order = [...document.querySelectorAll('.a-story h2')].map((h) => h.textContent?.trim() ?? '');
  const groups = new Map<string, Thread[]>();
  const loose: Thread[] = [];
  threads.filter(keep).forEach((t) => {
    if (!anchored(t)) return loose.push(t);
    const g = groups.get(t.section) ?? []; g.push(t); groups.set(t.section, g);
  });
  const sections = [...groups.keys()].sort((a, b) => ((order.indexOf(a) + 1) || 99) - ((order.indexOf(b) + 1) || 99));
  const item = (t: Thread) => `<li><button type="button" class="rt-item${t.status === 'resolved' ? ' is-resolved' : ''}" data-id="${t.id}">
      <span class="rt-item__num">${num(t)}</span>
      <span class="rt-item__text">${esc(plain(t.messages[0]?.text ?? '').slice(0, 110))}${(t.messages[0]?.text.length ?? 0) > 110 ? '…' : ''}
        <span class="rt-item__meta">${t.version !== 'both' ? `<span class="rt-tag">${t.version.toUpperCase()}</span> ` : ''}${t.messages.length > 1 ? `${t.messages.length - 1} ${t.messages.length === 2 ? 'reply' : 'replies'}` : 'No reply yet'}${t.change ? ' · Before/Now' : ''}</span></span>
    </button></li>`;
  const group = (name: string, ts: Thread[], extra = '') => `<section class="rt-group${extra}"><p class="rt-group__name">${esc(name)}</p><ol>${ts.map(item).join('')}</ol></section>`;
  list.innerHTML = (sections.map((s) => group(s, groups.get(s)!)).join('') + (loose.length ? group('Unanchored', loose, ' rt-group--loose') : ''))
    || `<p class="rt-empty">${filter === 'resolved' ? 'No resolved threads.' : filter === 'open' ? 'No open threads.' : 'No threads yet.'} Drag the comment pin onto the page to start one.</p>`;
  if (loose.length) list.querySelectorAll<HTMLElement>('.rt-group--loose .rt-item').forEach((b) => {
    const t = threads.find((x) => x.id === b.dataset.id)!;
    b.querySelector('.rt-item__meta')!.insertAdjacentText('beforeend', ` · was in ${t.section || 'an unknown section'}`);
  });
  panel.querySelectorAll<HTMLElement>('[data-f]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.f === filter)));
};
const openPanel = () => { panel.hidden = false; document.documentElement.classList.add('rt-panel-open'); panel.focus({ preventScroll: true }); relayout(); };
const closePanel = () => { panel.hidden = true; document.documentElement.classList.remove('rt-panel-open'); openBtn.focus({ preventScroll: true }); relayout(); };
openBtn.addEventListener('click', () => (panel.hidden ? openPanel() : closePanel()));
panel.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePanel(); });
panel.addEventListener('click', async (e) => {
  const el = e.target as HTMLElement;
  if (el.closest('[data-close-panel]')) return closePanel();
  const f = el.closest<HTMLElement>('[data-f]')?.dataset.f;
  if (f) { filter = f; store.set('rt-filter', f); return renderList(); }
  if (el.closest('[data-import]')) return importNotes();
  const id = el.closest<HTMLElement>('.rt-item')?.dataset.id;
  const t = id && threads.find((x) => x.id === id);
  if (!t) return;
  // show the version the thread is about, then its block
  if (t.version !== 'both' && t.version !== active()) document.querySelector<HTMLElement>(`.ab-switch [data-v="${t.version}"]`)?.click();
  if (t.status === 'resolved' && !showResolved) { showResolved = true; (panel.querySelector('[data-show-resolved]') as HTMLInputElement).checked = true; store.set('rt-resolved', '1'); }
  if (phone.matches) closePanel();
  render();
  const block = blockOf(t);
  block?.scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  window.setTimeout(() => openCard(t, el.closest<HTMLElement>('.rt-item')), block ? 450 : 0);
});
panel.querySelector<HTMLInputElement>('[data-show-resolved]')!.addEventListener('change', (e) => {
  showResolved = (e.target as HTMLInputElement).checked;
  store.set('rt-resolved', showResolved ? '1' : '0');
  render();
});

// ---------- importing the notes kept on this device (cc-notes) ----------
const norm = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase(); // labels show in capitals (innerText)
const matchQuote = (root: Document, quote: string) => {
  const q = norm(quote).replace(/…$/, '').slice(0, 70);
  if (!q) return null;
  const hits = [...root.querySelectorAll<HTMLElement>('[data-rid]')].filter((el) => norm(el.textContent ?? '').includes(q) || el.querySelector(`img[alt="${CSS.escape(quote)}"]`));
  return hits.sort((a, b) => (a.textContent?.length ?? 0) - (b.textContent?.length ?? 0))[0] ?? null;
};
async function importNotes() {
  const notes = localNotes();
  const status = panel.querySelector('.rt-import__status')!;
  if (!notes.length) { status.textContent = 'No local notes on this device.'; return; }
  status.textContent = `Importing ${notes.length} notes…`;
  const docs = new Map<string, Document>([[PAGE, document]]);
  for (const page of new Set(notes.map((n) => n.page))) {
    if (docs.has(page)) continue;
    try {
      const html = await (await fetch(`${page}?compare=1`)).text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      assignRids(doc);
      docs.set(page, doc);
    } catch {}
  }
  let anchoredCount = 0;
  const items = notes.map((n) => {
    const doc = docs.get(n.page);
    const el = doc ? matchQuote(doc, n.quote) : null;
    if (el) anchoredCount++;
    return { page: n.page, section: n.section, quote: n.quote, text: n.comment, rid: el?.dataset.rid ?? '', version: el?.closest<HTMLElement>('.ab[data-version]')?.dataset.version ?? 'both' };
  });
  try {
    await post({ action: 'import', items });
    store.set('rt-imported', new Date().toISOString());
    const here = items.filter((i) => i.page === PAGE).length;
    status.textContent = `Imported ${items.length} notes (${anchoredCount} anchored, ${items.length - anchoredCount} unanchored; ${here} on this page).`;
    ui.querySelector<HTMLElement>('.rt-import')!.hidden = false; // keep the message in view
    panel.querySelector<HTMLElement>('[data-import]')!.hidden = true;
  } catch (err) { status.textContent = `Couldn't import: ${(err as Error).message}`; }
}

// ---------- start ----------
assignRids();
setHl();
document.addEventListener('ab:change', () => { if (shown) closeCard(false); render(); });
addEventListener('resize', relayout);
new ResizeObserver(relayout).observe(document.body);
phone.addEventListener('change', () => { relayout(); if (!card.hidden) placeCard(); });
addEventListener('focus', load);
document.addEventListener('visibilitychange', () => { if (!document.hidden) load(); });
window.setInterval(() => { if (!document.hidden) load(); }, 10_000);
load();
