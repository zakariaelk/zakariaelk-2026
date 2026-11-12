// The review threads' anchors (scripts/review-threads.ts), on their own so version-review.ts can set them before it
// takes the Updated blocks out of the page: a rid is then the same with and without them.
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
