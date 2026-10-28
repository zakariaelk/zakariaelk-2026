// The reacting character's slideshows (components/story/Reactions.astro, lib/reactions.ts). A clock per slideshow
// runs while it's on screen and not paused, fires the slide's steps on time (every eye step a second, the move
// itself 350 ms) and moves on when the slide ends. Pointing at it or focusing it only holds the next slide back;
// the pause button stops the clock, character included. With reduced motion: no clock, each slide a still with the
// highlight on and the character in his last pose.
import type { ReactionStep } from '../lib/reactions';

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const LOOK = { c: [0, 0], d: [0, 9], dd: [0, 12], l: [-11, 0], r: [11, 0] } as const;
const EYE_H = 48; // the eye's height in the drawing; a lid closes by a share of it

document.querySelectorAll<HTMLElement>('[data-rx]').forEach((fig) => {
  const data: { end: number; steps: ReactionStep[]; caption: string }[] = JSON.parse(fig.dataset.rx!);
  const n = data.length;
  const char = fig.querySelector<SVGElement>('.rx-char')!;
  const pupils = [...char.querySelectorAll<SVGGElement>('.rx-pupil')];
  const lids = [...char.querySelectorAll<SVGGElement>('.rx-lid')];
  const slides = [...fig.querySelectorAll<HTMLElement>('.cs-rx__slide')];
  const dots = [...fig.querySelectorAll<HTMLButtonElement>('.cs-seq__dots button')];
  const stage = fig.querySelector<HTMLElement>('.cs-rx__stage')!;
  const pauseBtn = fig.querySelector<HTMLButtonElement>('.cs-rx__pause')!;
  const count = fig.querySelector<HTMLElement>('[data-rx-count]')!;
  const caption = fig.querySelector<HTMLElement>('[data-rx-caption]')!;

  // the character
  let roll = 0;
  const look = (x: number, y: number) => pupils.forEach((p) => (p.style.translate = `${x}px ${y}px`));
  const close = (share: number) => lids.forEach((l) => (l.style.translate = `0 ${share * EYE_H}px`));
  const veil = (on: boolean) => slides[i].querySelector<HTMLElement>('.cs-rx__veil')!.classList.toggle('is-on', on);
  const rollEyes = (instant: boolean) => {
    const end = () => { char.classList.remove('is-rolling'); close(0.5); };
    const at = (a: number) => look(11 * Math.cos(a), 11 * Math.sin(a));
    const a0 = Math.PI / 4, a1 = a0 - (Math.PI * 3) / 2; // lower right, over the top, to lower left
    if (instant) { at(a1); end(); return; }
    char.classList.add('is-rolling');
    const t0 = performance.now();
    const frame = (now: number) => {
      const k = Math.min(1, (now - t0) / 900), e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
      at(a0 + (a1 - a0) * e);
      if (k < 1) roll = requestAnimationFrame(frame); else end();
    };
    if (roll) cancelAnimationFrame(roll);
    roll = requestAnimationFrame(frame);
  };
  const apply = (s: ReactionStep, instant = false) => {
    if (s.look) look(...(LOOK[s.look] as [number, number]));
    if (s.lids !== undefined) close(s.lids);
    if (s.wide !== undefined) char.classList.toggle('is-wide', s.wide);
    if (s.hi) veil(true);
    if (s.q) char.classList.add('is-q');
    if (s.roll) rollEyes(instant);
  };
  // the start of a slide: eyes on the phone, lids open, no highlight, no question mark; no transitions
  const reset = () => {
    if (roll) { cancelAnimationFrame(roll); roll = 0; }
    char.classList.add('is-instant');
    char.classList.remove('is-wide', 'is-q', 'is-rolling');
    look(...(LOOK.d as unknown as [number, number])); close(0);
    slides.forEach((s) => s.querySelector('.cs-rx__veil')!.classList.remove('is-on'));
    void char.getBoundingClientRect();
    requestAnimationFrame(() => char.classList.remove('is-instant'));
  };

  // the slideshow
  let i = 0, t = 0, fired = 0, playing = !reduce, visible = false, held = false, last = 0;
  const show = (k: number) => {
    slides[i].hidden = true; dots[i].removeAttribute('aria-current');
    i = (k + n) % n;
    slides[i].hidden = false; dots[i].setAttribute('aria-current', 'true');
    count.textContent = `${i + 1} of ${n}`;
    caption.textContent = data[i].caption;
    reset(); t = 0; fired = 0;
    if (reduce) { char.classList.add('is-instant'); data[i].steps.forEach((s) => apply(s, true)); fired = data[i].steps.length; }
  };
  const tick = (now: number) => {
    const dt = last ? Math.min(0.1, (now - last) / 1000) : 0; last = now;
    if (playing && visible) {
      t += dt;
      const steps = data[i].steps;
      while (fired < steps.length && steps[fired].t <= t) apply(steps[fired++]);
      if (t >= data[i].end && !held) show(i + 1);
    }
    requestAnimationFrame(tick);
  };
  const setPlaying = (on: boolean) => {
    playing = on;
    fig.classList.toggle('is-paused', !on);
    pauseBtn.setAttribute('aria-label', on ? 'Pause the slideshow' : 'Play the slideshow');
  };
  setPlaying(playing);
  show(0);
  if (!reduce) requestAnimationFrame(tick);

  pauseBtn.addEventListener('click', () => setPlaying(!playing));
  fig.querySelectorAll<HTMLButtonElement>('[data-step]').forEach((b) => b.addEventListener('click', () => show(i + Number(b.dataset.step))));
  dots.forEach((d, k) => d.addEventListener('click', () => show(k)));
  stage.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); show(i + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); show(i - 1); }
  });
  // pointing at it, focusing it or touching it holds the next slide back (the current one still plays)
  const hold = () => { held = fig.matches(':hover') || fig.contains(document.activeElement); };
  ['pointerenter', 'pointerleave', 'focusin', 'focusout'].forEach((ev) => fig.addEventListener(ev, () => requestAnimationFrame(hold)));
  // swipe: a horizontal drag of 40px or more
  let x0: number | null = null, y0 = 0;
  stage.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') { x0 = e.clientX; y0 = e.clientY; } });
  stage.addEventListener('pointerup', (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0, dy = e.clientY - y0; x0 = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) show(i + (dx < 0 ? 1 : -1));
  });
  stage.addEventListener('pointercancel', () => { x0 = null; });
  // load the screens once it comes near; the clock runs while it's well on screen
  new IntersectionObserver(([e], io) => { if (e.isIntersecting) { fig.querySelectorAll<HTMLImageElement>('img').forEach((s) => (s.loading = 'eager')); io.disconnect(); } }, { rootMargin: '600px 0px' }).observe(fig);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.4 }).observe(fig);
});
