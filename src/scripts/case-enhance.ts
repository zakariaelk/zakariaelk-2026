// Case study body (versions /next/a/ and /next/b/): the Markdoc text stays as written; this only
// labels its parts so each version can give them their own place in the hierarchy.
//   p > strong (alone)  → .is-lead    the section's lead sentence, shown as its heading
//   "Result" / "Results" → .is-result  a small label above the numbers
//   p > img (alone)      → .is-media   wider than the text column
//   p > em right after a visual → .is-caption
// With data-sections (version B) each h2 and its content become a section.
// Videos play only while on screen (and not at all with reduced motion).
const body = document.querySelector<HTMLElement>('[data-story]');
if (body) {
  // Markdoc wraps the body in its own <article>
  body.querySelectorAll<HTMLParagraphElement>(':scope > p, :scope > article > p').forEach((p) => {
    const only = p.children.length === 1 && p.textContent?.trim() === p.firstElementChild?.textContent?.trim() ? p.firstElementChild : null;
    if (!only) return;
    if (only.tagName === 'STRONG') p.classList.add(/^results?$/i.test(only.textContent!.trim()) ? 'is-result' : 'is-lead');
    else if (only.tagName === 'IMG') p.classList.add('is-media');
    else if (only.tagName === 'EM') {
      const prev = p.previousElementSibling;
      if (prev?.classList.contains('is-media') || prev?.tagName === 'FIGURE') p.classList.add('is-caption');
    }
  });
  // Version B: each h2 and what follows it become a section, the name pinned on the left
  if (body.hasAttribute('data-sections')) {
    const root = body.querySelector(':scope > article') ?? body;
    let sec: HTMLElement | null = null;
    let content: HTMLElement | null = null;
    const start = (h2?: Element) => {
      sec = document.createElement('section');
      sec.className = h2 ? 'b-sec' : 'b-sec b-sec--intro';
      const label = document.createElement('div');
      label.className = 'b-sec__label';
      if (h2) label.append(h2);
      content = document.createElement('div');
      content.className = 'b-sec__body';
      sec.append(label, content);
      root.append(sec);
    };
    [...root.children].forEach((el) => {
      if (el.classList.contains('b-sec')) return;
      if (el.tagName === 'H2') start(el);
      else { if (!content) start(); content!.append(el); }
    });
  }
  body.classList.add('is-enhanced');

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const videos = [...body.querySelectorAll<HTMLVideoElement>('video')];
  videos.forEach((v) => { v.autoplay = false; v.pause(); v.preload = 'none'; });
  if (reduce) videos.forEach((v) => { v.controls = true; v.preload = 'metadata'; });
  else {
    // a video the reader paused stays paused
    const io = new IntersectionObserver((entries) => entries.forEach(({ target, isIntersecting }) => {
      const v = target as HTMLVideoElement;
      if (isIntersecting && !v.dataset.held) v.play().catch(() => {}); else v.pause();
    }), { threshold: 0.35 });
    videos.forEach((v) => {
      io.observe(v);
      v.tabIndex = 0;
      v.title = 'Click to pause or play';
      const toggle = () => { if (v.paused) { delete v.dataset.held; v.play().catch(() => {}); } else { v.dataset.held = '1'; v.pause(); } };
      v.addEventListener('click', toggle);
      v.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
    });
  }
}
