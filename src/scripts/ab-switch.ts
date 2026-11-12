// A/B wording switch for reviewing the INSO case (docs/claude-code-instructions-version-switch.md, section 3).
// Only with ?compare=1 on a page that has A/B blocks (components/story/Ab.astro); otherwise A stays hidden (B is live).
// The choice lives in ?v=a|b and localStorage; links between the two INSO pages carry compare=1 and v.
const blocks = [...document.querySelectorAll<HTMLElement>('.ab[data-version]')];
const params = new URLSearchParams(location.search);

if (blocks.length && params.get('compare') === '1' && !(import.meta.env.DEV && document.querySelector('[data-version-review]'))) { // a Current/Updated review has its own switch (version-review.ts)
  const KEY = 'inso-ab';
  const stored = (() => { try { return localStorage.getItem(KEY); } catch { return null; } })();
  let current = params.get('v') === 'b' || params.get('v') === 'a' ? params.get('v')! : stored === 'a' ? 'a' : 'b';
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)');

  const bar = document.createElement('div');
  bar.className = 'ab-switch';
  bar.setAttribute('role', 'group');
  bar.setAttribute('aria-label', 'Wording version');
  bar.innerHTML = '<button type="button" data-v="a">A · Current</button><button type="button" data-v="b">B · More I</button>';
  document.body.append(bar);
  document.documentElement.classList.add('has-ab');
  // the comments' review bar sits bottom left too: stand above it when it shows
  const notes = document.querySelector<HTMLElement>('.cc-review');
  const lift = () => bar.classList.toggle('is-lifted', !!notes && !notes.hidden);
  if (notes) new MutationObserver(lift).observe(notes, { attributes: true, attributeFilter: ['hidden'] });
  lift();

  // the two INSO pages link to each other: keep the review on while moving between them
  const links = [...document.querySelectorAll<HTMLAnchorElement>('a[href^="/work/mitigating-risk-with-location-based-alerts/"]')];
  const base = links.map((a) => a.getAttribute('href')!);

  const apply = (v: string) => {
    blocks.forEach((b) => { b.hidden = b.dataset.version !== v; });
    bar.querySelectorAll<HTMLButtonElement>('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === v)));
    links.forEach((a, i) => {
      const [path, hash] = base[i].split('#');
      a.href = `${path.split('?')[0]}?compare=1&v=${v}${hash ? `#${hash}` : ''}`;
    });
    const url = new URL(location.href);
    url.searchParams.set('v', v);
    history.replaceState(history.state, '', url);
    try { localStorage.setItem(KEY, v); } catch {}
    document.dispatchEvent(new CustomEvent('ab:change', { detail: v })); // the review threads move their pins
  };

  // the element the reader is on: the first block-level piece of the page whose bottom is below the top bar
  const anchorOf = () => {
    const top = 80;
    const pieces = document.querySelectorAll<HTMLElement>('.a-case__intro :is(p, dl), .a-story :is(p, h2, h3, li, figure, table, .cs-seq, .cs-block)');
    for (const el of pieces) {
      if (el.closest('[hidden]')) continue;
      const r = el.getBoundingClientRect();
      if (r.height && r.bottom > top) return el;
    }
    return null;
  };

  const flip = (v: string) => {
    if (v === current) return;
    const el = anchorOf();
    const box = el?.closest<HTMLElement>('.ab');
    // inside a block that is about to hide: hold on to the block itself and match its pair's top
    const before = box ? box.getBoundingClientRect().top : el?.getBoundingClientRect().top ?? 0;
    const pair = box ? (box.dataset.version === 'a' ? box.nextElementSibling : box.previousElementSibling) as HTMLElement | null : null;
    current = v;
    apply(v);
    const after = pair?.matches('.ab') ? pair.getBoundingClientRect().top : el?.getBoundingClientRect().top ?? 0;
    window.scrollBy({ top: after - before, behavior: 'instant' });
    if (!calm.matches) blocks.filter((b) => !b.hidden).forEach((b) => {
      b.classList.remove('is-flash');
      void b.offsetWidth; // restart the fade on a second click
      b.classList.add('is-flash');
    });
  };

  bar.addEventListener('click', (e) => {
    const v = (e.target as HTMLElement).closest<HTMLButtonElement>('button')?.dataset.v;
    if (v) flip(v);
  });
  apply(current);
}
