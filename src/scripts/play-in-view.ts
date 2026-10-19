// Framed videos (.v-video) play only while on screen, and never with reduced motion (they then
// show their poster with controls).
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const videos = [...document.querySelectorAll<HTMLVideoElement>('.v-video')];
if (reduce) videos.forEach((v) => { v.controls = true; v.preload = 'metadata'; });
else {
  const io = new IntersectionObserver((entries) => entries.forEach(({ target, isIntersecting }) => {
    const v = target as HTMLVideoElement;
    if (isIntersecting) v.play().catch(() => {}); else v.pause();
  }), { threshold: 0.3 });
  videos.forEach((v) => io.observe(v));
}
