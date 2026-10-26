// Slideshows (components/story/Sequence.astro), after the W3C carousel pattern: previous / next, dots, swipe, the
// arrow keys when focused; a change by the reader is announced. While on screen they step on by themselves like a
// short video; the pause button stops that, and so does any move by the reader. Never with reduced motion.
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const HOLD = 2200; // ms per screen (the last one stays a little longer before it starts over)

document.querySelectorAll<HTMLElement>('[data-seq]').forEach((fig) => {
  const slides = [...fig.querySelectorAll<HTMLElement>('.cs-seq__slide')];
  const dots = [...fig.querySelectorAll<HTMLButtonElement>('.cs-seq__dots button')];
  const btn = fig.querySelector<HTMLButtonElement>('.cs-vbtn');
  const stage = fig.querySelector<HTMLElement>('.cs-seq__stage')!;
  const status = fig.querySelector<HTMLElement>('[data-seq-status]')!;
  const n = slides.length;
  const cap = fig.querySelector<HTMLElement>('figcaption[data-captions]');
  const caps: string[] | null = cap ? JSON.parse(cap.dataset.captions!) : null;
  if (n < 2) return;
  let i = 0, timer = 0, visible = false, playing = !reduce;
  const show = (k: number, announce = false) => {
    slides[i].hidden = true; dots[i]?.removeAttribute('aria-current');
    i = (k + n) % n;
    slides[i].hidden = false; dots[i]?.setAttribute('aria-current', 'true');
    if (cap && caps?.[i]) (cap.querySelector('[data-cap-text]') ?? cap).textContent = caps[i]; // a caption per screen
    if (announce) status.textContent = `Screen ${i + 1} of ${n}`;
  };
  const tick = () => {
    clearTimeout(timer);
    if (playing && visible) timer = window.setTimeout(() => { show(i + 1); tick(); }, i === n - 1 ? HOLD * 1.6 : HOLD);
  };
  const setPlaying = (on: boolean) => {
    playing = on;
    fig.classList.toggle('is-paused', !on);
    btn?.setAttribute('aria-label', on ? 'Pause the slideshow' : 'Play the slideshow');
    tick();
  };
  const go = (k: number) => { setPlaying(false); show(k, true); }; // the reader takes over: no more stepping on
  setPlaying(playing);
  btn?.addEventListener('click', () => setPlaying(!playing));
  fig.querySelectorAll<HTMLButtonElement>('[data-step]').forEach((b) => b.addEventListener('click', () => go(i + Number(b.dataset.step))));
  dots.forEach((d, k) => d.addEventListener('click', () => go(k)));
  stage.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(i + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(i - 1); }
  });
  // swipe: a horizontal drag of 40px or more
  let x0: number | null = null, y0 = 0;
  stage.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') { x0 = e.clientX; y0 = e.clientY; } });
  stage.addEventListener('pointerup', (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0, dy = e.clientY - y0; x0 = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) go(i + (dx < 0 ? 1 : -1));
  });
  stage.addEventListener('pointercancel', () => { x0 = null; });
  // load every screen once it comes near, so none flashes in later
  new IntersectionObserver(([e], io) => { if (e.isIntersecting) { fig.querySelectorAll<HTMLImageElement>('img').forEach((s) => (s.loading = 'eager')); io.disconnect(); } }, { rootMargin: '600px 0px' }).observe(fig);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; tick(); }, { threshold: 0.4 }).observe(fig);
});
