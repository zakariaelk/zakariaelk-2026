// Current/Updated review of a case (docs/claude-code-notes-chdc.md), dev server only: loaded by CaseA when the page has
// Updated blocks ({% ver %}, components/story/Ver.astro). The switch and its look come from the A/B switch
// (scripts/ab-switch.ts, docs/claude-code-instructions-version-switch.md), with a "Highlight changes" toggle.
// Without ?compare=1: Current only; the Updated blocks, labels and markers are taken out of the page.
// With it: the switch (?v=a|b and localStorage, default Current) and the highlights (remembered, on by default).
import { assignRids } from './review-rids';
import '../styles/version-review.css';

const root = document.documentElement;
const [labelA, labelB] = (document.querySelector<HTMLElement>('[data-version-review]')!.dataset.versionReview ?? 'Current|Updated').split('|');
const blocks = () => [...document.querySelectorAll<HTMLElement>('.ab[data-version]')];
const params = new URLSearchParams(location.search);
const store = { get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch {} } };
const KEY = `version-review:${location.pathname}`;
const HL = 'version-review:highlight';

// the review threads' anchors, set while both versions are in the page so they don't depend on it
assignRids();

// list items cut (Current) or added (Updated), named by their place in the block (Ver.astro)
blocks().forEach((b) => (['gone', 'chg'] as const).forEach((k) => {
  const items = b.querySelectorAll('li');
  (b.dataset[`${k}Items`] ?? '').split(',').filter(Boolean).forEach((n) => items[Number(n) - 1]?.classList.add(k === 'gone' ? 'chg-gone' : 'chg-add-li'));
}));

// the rail and the phone menu list the sections of the version shown; the section names are labels when that version
// has bold headlines under them (as case-simple.ts decides for a whole page)
const sync = () => {
  document.querySelectorAll<HTMLAnchorElement>('.a-rail [data-section], .a-toc [data-section]').forEach((a) => {
    const t = document.getElementById(a.dataset.section!);
    a.closest('li')!.style.display = !t || t.closest('[hidden]') ? 'none' : '';
  });
  const h2s = [...document.querySelectorAll<HTMLElement>('.a-story h2')].filter((h) => !h.closest('[hidden]'));
  const lead = h2s.some((h) => h.classList.contains('has-lead'));
  h2s.forEach((h) => h.classList.toggle('is-title', !lead));
  dispatchEvent(new Event('scroll')); // the rail's current section
};

if (params.get('compare') !== '1') {
  blocks().filter((b) => b.dataset.version === 'b').forEach((b) => b.remove());
  document.querySelectorAll('.chg-tag').forEach((t) => t.remove());
  sync();
} else {
  let current = params.get('v') === 'a' || params.get('v') === 'b' ? params.get('v')! : store.get(KEY) === 'b' ? 'b' : 'a';
  let hl = store.get(HL) !== '0';
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)');

  const bar = document.createElement('div');
  bar.className = 'ab-switch';
  bar.setAttribute('role', 'group');
  bar.setAttribute('aria-label', 'Version');
  bar.innerHTML = `<button type="button" data-v="a">${labelA}</button><button type="button" data-v="b">${labelB}</button><span class="ab-switch__sep" aria-hidden="true"></span><button type="button" class="ab-switch__hl">Highlight changes</button>`;
  document.body.append(bar);
  root.classList.add('has-ab');
  const hlBtn = bar.querySelector<HTMLButtonElement>('.ab-switch__hl')!;
  // the comments' review bar sits bottom left too: stand above it when it shows
  const notes = document.querySelector<HTMLElement>('.cc-review');
  const lift = () => bar.classList.toggle('is-lifted', !!notes && !notes.hidden);
  if (notes) new MutationObserver(lift).observe(notes, { attributes: true, attributeFilter: ['hidden'] });
  lift();

  const setHl = (on: boolean) => {
    hl = on;
    root.classList.toggle('ab-hl', on);
    hlBtn.setAttribute('aria-pressed', String(on));
    store.set(HL, on ? '1' : '0');
  };

  const apply = (v: string) => {
    blocks().forEach((b) => { b.hidden = b.dataset.version !== v; });
    bar.querySelectorAll<HTMLButtonElement>('[data-v]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === v)));
    const url = new URL(location.href);
    url.searchParams.set('v', v);
    history.replaceState(history.state, '', url);
    store.set(KEY, v);
    sync();
    document.dispatchEvent(new CustomEvent('ab:change', { detail: v })); // the review threads move their pins
  };

  // where the reader is: the first piece of the page whose bottom is below the top bar. Inside a block that is about to
  // hide, its pair (the other version, right next to it) takes its place; without a pair, the next shared piece holds.
  const pieces = () => [...document.querySelectorAll<HTMLElement>('.a-case__intro :is(p, dl), .a-story :is(p, h2, h3, li, figure, table, .cs-seq, .cs-ut, .cs-problem)')];
  const hold = () => {
    for (const el of pieces()) {
      if (el.closest('[hidden]') || !el.getClientRects().length) continue;
      if (el.getBoundingClientRect().bottom <= 80) continue;
      const box = el.closest<HTMLElement>('.ab');
      if (!box) return { top: el.getBoundingClientRect().top, after: () => el.getBoundingClientRect().top };
      const pair = (box.dataset.version === 'a' ? box.nextElementSibling : box.previousElementSibling) as HTMLElement | null;
      if (pair?.matches('.ab') && pair.dataset.version !== box.dataset.version) {
        // the same paragraph in the other version, when it has one; else the other version's top
        const same = [...pair.querySelectorAll<HTMLElement>(el.tagName)].find((e) => e.textContent === el.textContent);
        const top = (same ? el : box).getBoundingClientRect().top;
        return { top, after: () => (same ?? pair).getBoundingClientRect().top };
      }
      // a block with no pair: go on to what comes after it
    }
    return null;
  };

  const flip = (v: string) => {
    if (v === current) return;
    const h = hold();
    current = v;
    apply(v);
    if (h) window.scrollBy({ top: h.after() - h.top, behavior: 'instant' });
    if (hl && !calm.matches) blocks().filter((b) => !b.hidden).forEach((b) => {
      b.classList.remove('is-flash');
      void b.offsetWidth; // restart the fade on a second click
      b.classList.add('is-flash');
    });
  };

  bar.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('button');
    if (!btn) return;
    if (btn === hlBtn) setHl(!hl);
    else if (btn.dataset.v) flip(btn.dataset.v);
  });
  setHl(hl);
  apply(current);
}
