// The simple reading format of the case studies (components/next/va/CaseA.astro, styles/case-simple.css): slideshows,
// the enlarge view, video play/pause buttons, the titles variants of the INSO case, headings, and the icons.
// Runs only on pages in that format (.cs-simple on <body>).
if (document.body.classList.contains('cs-simple')) {
  void Promise.all([import('./sequence'), import('./lightbox'), import('./video-controls')]); // after case-enhance has marked the images

  // INSO's titles to compare: serif paragraph titles under a small section label (default), ?titles=sans: label and
  // title on one line in bold sans, ?titles=small: the small sans titles taken off the paragraphs, shown again
  const root = document.documentElement;
  const titles = new URLSearchParams(location.search).get('titles');
  if (titles === 'sans' || titles === 'small') root.dataset.titles = titles;
  document.querySelectorAll<HTMLAnchorElement>('[data-titles-link]').forEach((a) => { if (a.dataset.titlesLink === (root.dataset.titles ?? '')) a.setAttribute('aria-current', 'true'); });

  // a section name with a bold headline under it stays a small label over that headline; a section name that says
  // something itself (the other cases' headings) is the title
  document.querySelectorAll<HTMLElement>('.a-story h2').forEach((h) => {
    const lead = h.nextElementSibling as HTMLElement | null;
    if (lead?.matches('p') && lead.children.length === 1 && lead.firstElementChild!.tagName === 'STRONG') { h.classList.add('has-lead'); lead.dataset.section = h.textContent ?? ''; }
    else h.classList.add('is-title');
  });

  // icons are flipbooks (docs/icons/build.mjs): each plays its frames (twice, a short hold between) when its block
  // reaches the middle of the screen, and again on hover, then stops; with reduced motion each shows its standing frame
  const play = (svg: SVGElement & { _t?: number }) => {
    const once = (svg.dataset.timeline ?? '').split(' ').map((s) => s.split(':').map(Number));
    const steps = [...once.slice(0, -1), [once[once.length - 1][0], 700], ...once];
    let i = 0;
    clearTimeout(svg._t);
    const next = () => { svg.dataset.frame = String(steps[i][0]); const ms = steps[i][1]; i++; if (i < steps.length) svg._t = window.setTimeout(next, ms); };
    next();
  };
  // an icon on a block that opens its section (or follows a heading) goes above the label or heading, never between them and the text
  document.querySelectorAll<HTMLElement>('.a-story .cs-block').forEach((block) => {
    let prev = block.previousElementSibling;
    if (prev?.matches('p') && prev.children.length === 1 && prev.firstElementChild!.tagName === 'STRONG') prev = prev.previousElementSibling; // the section's headline
    const icon = block.querySelector('.cs-block__icon');
    if (!prev?.matches('h2, h3') || !icon) return;
    const holder = document.createElement('div');
    holder.className = `cs-block cs-sec-icon ${[...block.classList].filter((c) => c.startsWith('cs-block--')).join(' ')}`;
    holder.innerHTML = '<div class="cs-block__head"></div>';
    holder.firstElementChild!.append(icon);
    prev.before(holder);
  });
  const icons = [...document.querySelectorAll<SVGElement>('.cs-block__icon svg')];
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) icons.forEach((svg) => { svg.dataset.frame = svg.dataset.rest; });
  else {
    const middle = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const svg = e.target.querySelector<SVGElement>('.cs-block__icon svg');
      if (svg) play(svg);
      middle.unobserve(e.target);
    }), { rootMargin: '-45% 0px -45% 0px' });
    icons.forEach((svg) => {
      const block = svg.closest<HTMLElement>('.cs-block')!;
      middle.observe(block);
      block.addEventListener('mouseenter', () => play(svg));
    });
  }
}
