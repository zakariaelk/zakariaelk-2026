// Sequences (components/story/Sequence.astro): one screen at a time, stepping on by itself while the sequence is
// on screen, like a short video; the button pauses or plays, the dots jump to a screen. With reduced motion it
// waits for the reader (dots and button only).
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const HOLD = 1900; // ms per screen (the last one stays a little longer before it starts over)

document.querySelectorAll<HTMLElement>('[data-seq]').forEach((fig) => {
  const screens = [...fig.querySelectorAll<HTMLImageElement>('.cs-seq__screen')];
  const dots = [...fig.querySelectorAll<HTMLButtonElement>('.cs-seq__dots button')];
  const btn = fig.querySelector<HTMLButtonElement>('.cs-vbtn')!;
  let i = 0, timer = 0, visible = false, playing = !reduce;
  const show = (n: number) => {
    screens[i].hidden = true; dots[i].removeAttribute('aria-current');
    i = (n + screens.length) % screens.length;
    screens[i].hidden = false; dots[i].setAttribute('aria-current', 'true');
  };
  const tick = () => {
    clearTimeout(timer);
    if (playing && visible) timer = window.setTimeout(() => { show(i + 1); tick(); }, i === screens.length - 1 ? HOLD * 1.6 : HOLD);
  };
  const setPlaying = (on: boolean) => {
    playing = on;
    fig.classList.toggle('is-paused', !on);
    btn.setAttribute('aria-label', on ? 'Pause' : 'Play');
    tick();
  };
  setPlaying(playing);
  btn.addEventListener('click', () => setPlaying(!playing));
  dots.forEach((d, n) => d.addEventListener('click', () => { show(n); tick(); }));
  // load every screen once it comes near, so none flashes in later
  new IntersectionObserver(([e], io) => { if (e.isIntersecting) { screens.forEach((s) => (s.loading = 'eager')); io.disconnect(); } }, { rootMargin: '600px 0px' }).observe(fig);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; tick(); }, { threshold: 0.4 }).observe(fig);
});
