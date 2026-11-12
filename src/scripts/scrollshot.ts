// Long pages in a screen (story/Scrollshot.astro): a slow scroll down while on screen, a pause at the bottom, back to
// the top, again. The reader takes over with the mouse over the screen, a finger on it, or focus in it, and it carries
// on from where they left it a moment after. Nothing moves with reduced motion or while the full-screen view is open.
const SPEED = 40; // px a second
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll<HTMLElement>('[data-scrollshot]').forEach((box) => {
  if (reduce) return;
  let visible = false, held = false, pos = 0, last = 0, wait = 0, frame = 0, resume = 0;
  const tick = (t: number) => {
    frame = 0;
    if (!visible || held) return;
    const dt = last ? Math.min(0.25, (t - last) / 1000) : 0;
    last = t;
    if (wait <= 0 && Math.abs(box.scrollTop - pos) > 2) pos = box.scrollTop; // scrolled by someone else: carry on from there
    const end = box.scrollHeight - box.clientHeight;
    if (wait > 0) wait -= dt;
    else if (!document.documentElement.classList.contains('is-lbz-open')) {
      if (pos >= end - 1) { pos = 0; wait = 1.5; box.scrollTo({ top: 0, behavior: 'smooth' }); } // back to the top
      else { pos = Math.min(end, pos + SPEED * dt); box.scrollTop = pos; if (pos >= end - 1) wait = 2; }
    }
    frame = requestAnimationFrame(tick);
  };
  const go = () => { if (!frame && visible && !held) { last = 0; pos = box.scrollTop; frame = requestAnimationFrame(tick); } };
  const stop = () => { if (frame) cancelAnimationFrame(frame); frame = 0; };
  const take = () => { held = true; clearTimeout(resume); stop(); };
  const release = (delay: number) => { clearTimeout(resume); resume = window.setTimeout(() => { held = box.matches(':focus-within'); go(); }, delay); };
  box.addEventListener('mouseenter', take);
  box.addEventListener('mouseleave', () => release(600));
  box.addEventListener('touchstart', take, { passive: true });
  box.addEventListener('touchend', () => release(3000), { passive: true });
  box.addEventListener('focusin', take);
  box.addEventListener('focusout', () => release(600));
  document.addEventListener('visibilitychange', () => { last = 0; });
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) go(); else stop(); }, { threshold: 0.4 }).observe(box);
});
