// The INSO case's sections from Login to the end, folded away like the home page's "Other work" rows: a row per
// section (its name, its headline, a plus), all closed; Login opens by itself when the rows come into view, to
// show there is more below it. A link to a section (the contents, the rail, a #hash) opens it first. Without
// scripts nothing is folded. Called by scripts/case-simple.ts once the headings are marked.
export function fold(from: HTMLElement) {
  const h2s = [...document.querySelectorAll<HTMLElement>('.a-story h2')];
  const heads = h2s.slice(h2s.indexOf(from));
  // an icon that opens a section sits just above its heading (scripts/case-simple.ts): it belongs to that section
  const opener = (el: Element | null) => el?.matches('.cs-sec-icon') && el.nextElementSibling?.matches('h2') ? el : null;
  const folds = heads.map((h, k) => {
    const det = document.createElement('details');
    det.className = 'cs-fold';
    const sum = document.createElement('summary');
    sum.className = 'cs-fold__head';
    const body = document.createElement('div');
    body.className = 'cs-fold__body';
    const icon = opener(h.previousElementSibling);
    (icon ?? h).before(det);
    // the section: everything after the heading up to the next section (or its icon)
    const next = heads[k + 1];
    const stop = next ? opener(next.previousElementSibling) ?? next : null;
    const lead = h.nextElementSibling?.matches('[data-section]') ? h.nextElementSibling : null;
    let el = (lead ?? h).nextElementSibling;
    const parts: Element[] = icon ? [icon] : [];
    while (el && el !== stop) { parts.push(el); el = el.nextElementSibling; }
    body.append(...parts);
    sum.append(h);
    if (lead) { lead.classList.add('cs-fold__lead'); sum.append(lead); }
    sum.insertAdjacentHTML('beforeend', '<span class="cs-fold__plus" aria-hidden="true"></span>');
    det.append(sum, body);
    return det;
  });
  folds[0].classList.add('cs-fold--first');
  folds[folds.length - 1].classList.add('cs-fold--last');

  // a link into a folded section opens it, then goes there
  const openAt = (hash: string, jump: boolean) => {
    const target = hash.length > 1 ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
    const det = target?.closest<HTMLDetailsElement>('.cs-fold');
    if (!target || !det) return false;
    det.open = true;
    if (jump) target.scrollIntoView();
    return true;
  };
  document.addEventListener('click', (e) => {
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
    if (a) openAt(a.getAttribute('href')!, false);
  }, true);
  addEventListener('hashchange', () => openAt(location.hash, true));
  if (openAt(location.hash, true)) return;

  // Login opens by itself once the rows are well in view
  const first = folds[0];
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    io.disconnect();
    if (!first.open) first.open = true;
  }, { rootMargin: '0px 0px -35% 0px' });
  io.observe(first);
}
