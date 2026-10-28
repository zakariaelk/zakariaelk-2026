// The reacting character's slideshows (components/story/Reactions.astro, lib/reactions.ts). A clock per slideshow
// runs while it's on screen and not paused and fires the slide's steps on time; everything moves in jumps, like the
// face icons' flipbooks: the eyes, the eye roll (right, up, lids drop, eyes fall back down), his hands and phone
// rising into view, his bubble building up circle by circle, each thought rising into it line by line, each line from
// behind its own mask, held 2.5 s, then gone at once before the next one rises; on the first slide he stands alone in
// the middle, then steps aside and the screen fades in; an app's install progress fills in jumps; the rest of the screen
// blurs and small print grows, as it is; his thumb taps or swipes the phone in a few poses. Pointing at it or focusing it only holds the next slide back; the
// pause button stops the clock, character included. With reduced motion: no clock, each slide a still with the
// highlight on, the character in his last pose and his last thought. After the last slide it stops.
import type { Look, ReactionStep } from '../lib/reactions';

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const LOOK: Record<Look, [number, number]> = { c: [0, 0], d: [0, 9], dd: [0, 12], l: [-11, 0], r: [11, 0], u: [0, -11], ur: [8, -8] };
const EYE_H = 48; // the eye's height in the drawing; a lid closes by a share of it

const LINE = 0.2, RISE = 0.8, HOLD = 2.5; // a line every 0.2 s; a thought about 0.8 s to rise, then held (seconds)

// one step becomes timed jumps: a roll its frames; a thought rises in, is held, then is gone (if the next thought
// comes sooner, the one shown goes first)
type Arm = 'rest' | 'up' | 'press' | 'low';
type Op = { t: number; arm?: Arm; look?: Look; lids?: number; wide?: boolean; hi?: boolean; q?: boolean; face?: boolean; hands?: boolean; bubble?: number; move?: boolean; show?: string; hide?: string; load?: number; zoom?: boolean; say?: string; id?: number; clear?: number };
const expand = (steps: ReactionStep[]): Op[] => {
  let shown = -1, until = -Infinity;
  return steps.flatMap((s, k) => {
    const ops: Op[] = [{ t: s.t, look: s.look, lids: s.lids, wide: s.wide, hi: s.hi, q: s.q, face: s.face, hands: s.hands, bubble: s.bubble, move: s.move, show: s.show, hide: s.hide, load: s.load, zoom: s.zoom }];
    if (s.tap) ops.push({ t: s.t, arm: 'up' }, { t: s.t + 0.15, arm: 'press' }, { t: s.t + 0.35, arm: 'up' }, { t: s.t + 0.5, arm: 'rest' });
    if (s.swipe) ops.push({ t: s.t, arm: 'low' }, { t: s.t + 0.12, arm: 'press' }, { t: s.t + 0.24, arm: 'up' }, { t: s.t + 0.45, arm: 'rest' });
    if (s.roll) ops.push({ t: s.t, look: 'r' }, { t: s.t + 0.18, look: 'ur' }, { t: s.t + 0.36, look: 'u' }, { t: s.t + 0.6, lids: 0.4 }, { t: s.t + 1, look: 'd', lids: 0.5 });
    if (s.say) {
      if (s.t < until) ops.push({ t: s.t, clear: shown });
      const off = s.t + RISE + HOLD;
      ops.push({ t: s.t, say: s.say, id: k }, { t: off, clear: k });
      shown = k; until = off;
    }
    return ops;
  }).sort((a, b) => a.t - b.t);
};

document.querySelectorAll<HTMLElement>('[data-rx]').forEach((fig) => {
  const data: { end: number; intro?: boolean; steps: ReactionStep[]; caption: string }[] = JSON.parse(fig.dataset.rx!);
  const timeline = data.map((d) => expand(d.steps));
  const n = data.length;
  const char = fig.querySelector<SVGElement>('.rx-char')!;
  const charBox = fig.querySelector<HTMLElement>('.cs-rx__char')!;
  const pupils = [...char.querySelectorAll<SVGGElement>('.rx-pupil')];
  const lids = [...char.querySelectorAll<SVGGElement>('.rx-lid')];
  const say = fig.querySelector<HTMLElement>('.cs-rx__say')!;
  const bubble = fig.querySelector<HTMLElement>('.cs-rx__bubble')!;
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
  const layer = (name: string) => slides[i].querySelector<HTMLElement>(`[data-layer="${name}"]`);
  // alone, he stands in the middle of the stage: how far that is from his place beside the screen
  const centre = () => fig.style.setProperty('--rx-dx', `${stage.clientWidth / 2 - charBox.offsetLeft - charBox.offsetWidth / 2}px`);
  // the app installing: its progress in eighths, then the icon is ready
  let loading: { from: number; dur: number } | null = null;
  const fill = (now: number) => {
    const el = slides[i].querySelector<HTMLElement>('.cs-rx__load');
    if (!loading || !el) return;
    const p = Math.min(1, Math.floor(((now - loading.from) / loading.dur) * 8) / 8);
    el.style.setProperty('--p', `${p * 100}%`);
    if (p >= 1) { el.hidden = true; loading = null; }
  };
  // a thought: laid out once to find its lines (balanced, and small enough to fit), then each line in its own mask, rising after the one above
  const write = (text: string, id: number) => {
    const box = document.createElement('div');
    box.className = 'cs-rx__lines';
    const words = text.split(' ').map((w) => { const s = document.createElement('span'); s.textContent = w; return s; });
    words.forEach((w, k) => box.append(w, k < words.length - 1 ? ' ' : ''));
    say.replaceChildren(box);
    // a long thought gets smaller writing until it fits the bubble
    say.style.fontSize = '';
    for (let k = 0; k < 4 && box.offsetHeight > say.clientHeight; k++) say.style.fontSize = `${parseFloat(getComputedStyle(say).fontSize) * 0.9}px`;
    const lines: string[][] = [];
    let top = -1;
    words.forEach((w) => { if (w.offsetTop !== top) { lines.push([]); top = w.offsetTop; } lines[lines.length - 1].push(w.textContent!); });
    box.replaceChildren(...lines.map((ws, k) => {
      const mask = document.createElement('span'), inner = document.createElement('span');
      mask.className = 'cs-rx__mask'; inner.className = 'cs-rx__in';
      inner.textContent = ws.join(' '); inner.style.animationDelay = `${k * LINE}s`;
      mask.append(inner); return mask;
    }));
    say.dataset.id = String(id);
  };
  const apply = (o: Op) => {
    if (o.arm) char.dataset.arm = o.arm;
    if (o.look) look(LOOK[o.look]);
    if (o.lids !== undefined) close(o.lids);
    if (o.wide !== undefined) char.classList.toggle('is-wide', o.wide);
    if (o.hi !== undefined) veil()?.classList.toggle('is-on', o.hi);
    if (o.q) char.classList.add('is-q');
    if (o.face) char.classList.remove('no-face');
    if (o.hands) { char.classList.remove('no-hands'); char.classList.add('is-rising'); }
    if (o.bubble) bubble.dataset.b = String(o.bubble);
    if (o.move) fig.classList.remove('is-alone');
    if (o.show) layer(o.show)?.classList.add('is-on');
    if (o.hide) layer(o.hide)?.classList.remove('is-on');
    if (o.load) loading = { from: o.t, dur: o.load };
    if (o.zoom !== undefined) slides[i].querySelector('.cs-rx__zoom')?.classList.toggle('is-on', o.zoom);
    if (o.clear !== undefined && say.dataset.id === String(o.clear)) say.replaceChildren();
    if (o.say !== undefined) write(o.say, o.id!);
  };
  // the start of a slide: eyes on the phone, lids open, nothing highlighted or thought yet, its layers as they start,
  // all at once (no fades); on an intro slide nothing of him shown yet either, and no screen
  const reset = (intro = false) => {
    fig.classList.add('is-resetting');
    fig.classList.toggle('is-alone', intro); centre();
    char.classList.remove('is-wide', 'is-q', 'is-rising');
    char.classList.toggle('no-face', intro); char.classList.toggle('no-hands', intro);
    bubble.dataset.b = intro ? '0' : '3';
    look(LOOK.d); close(0); char.dataset.arm = 'rest';
    slides.forEach((s) => {
      s.querySelector('.cs-rx__veil')?.classList.remove('is-on');
      s.querySelector('.cs-rx__zoom')?.classList.remove('is-on');
      s.querySelectorAll<HTMLElement>('[data-layer]').forEach((l) => l.classList.toggle('is-on', l.dataset.on !== undefined));
      const load = s.querySelector<HTMLElement>('.cs-rx__load');
      if (load) { load.hidden = false; load.style.setProperty('--p', '0%'); }
    });
    loading = null;
    say.replaceChildren();
    void fig.offsetWidth; fig.classList.remove('is-resetting');
  };

  // the slideshow
  let i = 0, t = 0, fired = 0, playing = !reduce, visible = false, held = false, last = 0;
  const show = (k: number) => {
    slides[i].hidden = true; dots[i].removeAttribute('aria-current');
    i = (k + n) % n;
    slides[i].hidden = false; dots[i].setAttribute('aria-current', 'true');
    count.textContent = `${i + 1} of ${n}`;
    caption.textContent = data[i].caption;
    reset(!!data[i].intro); t = 0; fired = 0;
    if (reduce) { timeline[i].filter((o) => o.clear === undefined).forEach(apply); fill(Infinity); char.classList.remove('is-rising'); fired = timeline[i].length; } // the last thought stays
  };
  const tick = (now: number) => {
    const dt = last ? Math.min(0.1, (now - last) / 1000) : 0; last = now;
    if (playing && visible) {
      t += dt;
      const ops = timeline[i];
      while (fired < ops.length && ops[fired].t <= t) apply(ops[fired++]);
      fill(t);
      if (t >= data[i].end && !held && i < n - 1) show(i + 1);
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
  new ResizeObserver(centre).observe(stage);
});
