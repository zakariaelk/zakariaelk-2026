// The reacting character's slideshows (components/story/Reactions.astro, lib/reactions.ts). A clock per slideshow
// runs while it's on screen and not paused and fires the slide's steps on time; everything moves in jumps, like the
// face icons' flipbooks: the eyes, the eye roll (right, up, lids drop, eyes fall back down); each thought appears
// whole in his bubble, the text given one light shake. Pointing at it or focusing it only holds the next slide back; the
// pause button stops the clock, character included. With reduced motion: no clock, each slide a still with the
// highlight on, the character in his last pose and his last thought.
import type { Look, ReactionStep } from '../lib/reactions';

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const LOOK: Record<Look, [number, number]> = { c: [0, 0], d: [0, 9], dd: [0, 12], l: [-11, 0], r: [11, 0], u: [0, -11], ur: [8, -8] };
const EYE_H = 48; // the eye's height in the drawing; a lid closes by a share of it

// one step becomes timed jumps: a roll its frames, a thought its text and then the shake
type Op = { t: number; look?: Look; lids?: number; wide?: boolean; hi?: boolean; q?: boolean; say?: string; shake?: boolean };
const expand = (steps: ReactionStep[]): Op[] => steps.flatMap((s) => {
  const ops: Op[] = [{ t: s.t, look: s.look, lids: s.lids, wide: s.wide, hi: s.hi, q: s.q }];
  if (s.roll) ops.push({ t: s.t, look: 'r' }, { t: s.t + 0.18, look: 'ur' }, { t: s.t + 0.36, look: 'u' }, { t: s.t + 0.6, lids: 0.4 }, { t: s.t + 1, look: 'd', lids: 0.5 });
  if (s.say) ops.push({ t: s.t, say: s.say }, { t: s.t + 0.12, shake: true });
  return ops;
}).sort((a, b) => a.t - b.t);

document.querySelectorAll<HTMLElement>('[data-rx]').forEach((fig) => {
  const data: { end: number; steps: ReactionStep[]; caption: string }[] = JSON.parse(fig.dataset.rx!);
  const timeline = data.map((d) => expand(d.steps));
  const n = data.length;
  const char = fig.querySelector<SVGElement>('.rx-char')!;
  const pupils = [...char.querySelectorAll<SVGGElement>('.rx-pupil')];
  const lids = [...char.querySelectorAll<SVGGElement>('.rx-lid')];
  const say = fig.querySelector<HTMLElement>('.cs-rx__say')!;
  const slides = [...fig.querySelectorAll<HTMLElement>('.cs-rx__slide')];
  const dots = [...fig.querySelectorAll<HTMLButtonElement>('.cs-seq__dots button')];
  const stage = fig.querySelector<HTMLElement>('.cs-rx__stage')!;
  const pauseBtn = fig.querySelector<HTMLButtonElement>('.cs-rx__pause')!;
  const count = fig.querySelector<HTMLElement>('[data-rx-count]')!;
  const caption = fig.querySelector<HTMLElement>('[data-rx-caption]')!;

  // the character and his thoughts
  const look = ([x, y]: [number, number]) => pupils.forEach((p) => (p.style.translate = `${x}px ${y}px`));
  const close = (share: number) => lids.forEach((l) => (l.style.translate = `0 ${share * EYE_H}px`));
  const veil = () => slides[i].querySelector<HTMLElement>('.cs-rx__veil');
  const apply = (o: Op) => {
    if (o.look) look(LOOK[o.look]);
    if (o.lids !== undefined) close(o.lids);
    if (o.wide !== undefined) char.classList.toggle('is-wide', o.wide);
    if (o.hi) veil()?.classList.add('is-on');
    if (o.q) char.classList.add('is-q');
    if (o.say !== undefined) { say.classList.remove('is-shake'); say.textContent = o.say; }
    if (o.shake) { say.classList.remove('is-shake'); void say.offsetWidth; say.classList.add('is-shake'); }
  };
  // the start of a slide: eyes on the phone, lids open, nothing highlighted or thought yet
  const reset = () => {
    char.classList.remove('is-wide', 'is-q');
    look(LOOK.d); close(0);
    slides.forEach((s) => s.querySelector('.cs-rx__veil')?.classList.remove('is-on'));
    say.textContent = ''; say.classList.remove('is-shake');
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
    if (reduce) { timeline[i].forEach(apply); say.classList.remove('is-shake'); fired = timeline[i].length; }
  };
  const tick = (now: number) => {
    const dt = last ? Math.min(0.1, (now - last) / 1000) : 0; last = now;
    if (playing && visible) {
      t += dt;
      const ops = timeline[i];
      while (fired < ops.length && ops[fired].t <= t) apply(ops[fired++]);
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
