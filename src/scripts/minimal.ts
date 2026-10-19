// The minimal test pages (/minimal/ and the Simple INSO case): which font setup is shown (?fonts=current,
// set on <html> by layouts/Next.astro), kept on the links between them; and the Simple case's run-in labels.
const root = document.documentElement;
const current = root.dataset.fonts === 'current';
document.querySelectorAll<HTMLAnchorElement>('[data-fonts-link]').forEach((a) => {
  if ((a.dataset.fontsLink === 'current') === current) a.setAttribute('aria-current', 'true');
});
if (current) document.querySelectorAll<HTMLAnchorElement>('a[data-keep-fonts]').forEach((a) => {
  const url = new URL(a.href);
  url.searchParams.set('fonts', 'current');
  a.href = url.pathname + url.search + url.hash;
});

// Run-in labels (Friction, What I did): on wide screens they sit in the right margin at 40%, and come to
// full strength while their paragraph is in the middle of the screen. Without this script, or with reduced
// motion, they stay at full strength.
const runins = [...document.querySelectorAll<HTMLElement>('.cs-runin')];
if (runins.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  root.classList.add('has-runin-fade');
  const io = new IntersectionObserver((entries) => entries.forEach((e) => e.target.classList.toggle('is-near', e.isIntersecting)), { rootMargin: '-40% 0px -40% 0px' });
  runins.forEach((r) => io.observe(r.parentElement!));
}
