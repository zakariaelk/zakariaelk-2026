// Paper buttons (.a-cta): each one's paper [data-ring] is cut with a rough edge that circles round, in
// stop-motion steps, while the pointer or focus is on its link; the shape itself stays put.
import { paperRing } from '../lib/papercut';

const still = window.matchMedia('(prefers-reduced-motion: reduce)');
document.querySelectorAll<HTMLElement>('[data-ring]').forEach((paper) => {
  const host = paper.closest<HTMLElement>('a, button') ?? paper;
  const seed = +(paper.dataset.ring || 11);
  let phase = 0;
  let timer = 0;
  const draw = () => { paper.style.clipPath = `path('${paperRing(paper.offsetWidth, paper.offsetHeight, seed, phase)}')`; };
  new ResizeObserver(draw).observe(paper);
  const start = () => { if (still.matches || timer) return; timer = window.setInterval(() => { phase += 1; draw(); }, 140); };
  const stop = () => { clearInterval(timer); timer = 0; };
  host.addEventListener('pointerenter', start);
  host.addEventListener('pointerleave', stop);
  host.addEventListener('focus', start);
  host.addEventListener('blur', stop);
});

// on touch screens (no hover) each button's eye opens when the button is fully on screen, and shuts again once it
// has left, so it opens each time it comes back (the .is-eye class does what hover does, styles/media-a.css)
if (window.matchMedia('(hover: none)').matches) {
  const seen = new IntersectionObserver((entries) => entries.forEach((e) => {
    e.target.closest('a')?.classList.toggle('is-eye', e.isIntersecting);
  }), { threshold: 1 });
  document.querySelectorAll('.a-cta__eye').forEach((eye) => seen.observe(eye.closest('.a-cta')!));
}
