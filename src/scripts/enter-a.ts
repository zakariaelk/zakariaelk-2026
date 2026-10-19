// Home entrance (version A): a simple, quick fade. Runs only when the layout's head script has added
// html.is-enter (no reduced motion); after the intro when there is one.
//   the logo, then the nav, the hero text and the first featured case fade in (slightly staggered);
//   the cases further down are simply there.
const root = document.documentElement;

if (root.classList.contains('is-enter')) {
  root.classList.add('is-enter-js');
  const show = () => {
    root.classList.add('enter-in');
    window.setTimeout(() => document.dispatchEvent(new Event('ze:enter-hero-done')), 500); // e.g. the hero's marker highlight
  };
  if (root.classList.contains('is-intro')) {
    // the intro's logo lands on the header logo: show it at once, then the rest fades in
    document.addEventListener('ze:intro-done', () => {
      const logo = document.querySelector<HTMLElement>('.n-brand__logo');
      if (logo) logo.style.transition = 'none';
      show();
    }, { once: true });
  } else {
    requestAnimationFrame(show);
  }
}
