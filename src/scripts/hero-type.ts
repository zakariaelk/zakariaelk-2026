// Home hero: the words before "designer" are rewritten as if someone were typing them and having doubts.
// The page opens on "Web and mobile apps"; a moment later it is deleted with a slightly uneven backspace,
// then each option is typed in turn: Software, UX/UI, UX (only "/UI" goes), Product, Just, my face (its
// pupil drifting from the centre to the top right, thinking), and back to "Web and mobile apps". Then again.
// Typing rhythm: keystroke studies put the average gap between keys at ~0.24s (Dhakal et al., CHI 2018,
// 136M keystrokes); a word start takes a little longer, so the space between words gets ~0.35s here.
// Never with reduced motion: the first text stays.
const box = document.querySelector<HTMLElement>('[data-type]');
const FACE = 'face';
const OPTIONS = ['Web and mobile apps', 'Software', 'UX/UI', 'UX', 'Product', 'Just', FACE, 'Web and mobile apps'];

const KEY = 140; // ms between typed keys, ±40%
const WORD = 350; // ms extra before a new word, ±30%
const BACKSPACE = 95; // ms between deletions, ±15% (only slightly uneven)
const DOUBT = 750; // ms before the first backspace, ±25%
const READ = 1900; // ms an option stays before the doubt, ±15%
const REST = 8000; // ms "Web and mobile apps" stays before the next round

if (box && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const text = box.querySelector<HTMLElement>('.a-type__text')!;
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const vary = (ms: number, by: number) => ms * (1 + (Math.random() * 2 - 1) * by);
  let current = OPTIONS[0];

  // my face, cropped to the head (public/img/svg/zakaria-face.svg, the line art of the old site's hero)
  fetch('/img/svg/zakaria-face.svg').catch(() => {}); // cached before it is needed
  const face = `<svg class="a-type__face" viewBox="330 40 700 800" aria-hidden="true">
    <use href="/img/svg/zakaria-face.svg#ze-face-lines" />
    <path class="a-type__white" d="M522.478 483.319C494.39 476.241 499.411 459.815 503.77 449.158C537.913 444.388 564.232 456.142 569.796 462.841C546.521 482.882 537.836 483.11 522.478 483.319Z" />
    <g class="a-type__pupil"><ellipse cx="524.838" cy="465.684" rx="15.0319" ry="13.8758" /></g>
  </svg>`;
  const render = () => { if (current === FACE) text.innerHTML = face; else text.textContent = current; };

  const erase = async (keep: string) => {
    await wait(vary(DOUBT, 0.25));
    box.classList.add('is-typing');
    while (current !== keep) {
      current = current === FACE ? '' : current.slice(0, -1);
      render();
      await wait(vary(BACKSPACE, 0.15));
    }
    box.classList.remove('is-typing');
  };
  const type = async (target: string) => {
    await wait(vary(WORD, 0.3));
    box.classList.add('is-typing');
    if (target === FACE) { current = FACE; render(); }
    else while (current.length < target.length) {
      current = target.slice(0, current.length + 1);
      render();
      await wait(vary(KEY, 0.4) + (current.endsWith(' ') ? vary(WORD, 0.3) : 0));
    }
    box.classList.remove('is-typing');
  };

  const run = async () => {
    box.classList.add('is-on'); // the caret shows from now on
    for (;;) {
      for (const next of OPTIONS.slice(1)) {
        const keep = current !== FACE && next !== FACE && current.startsWith(next) ? next : ''; // UX/UI → UX: only "/UI" goes
        await erase(keep);
        await type(next);
        if (next === FACE) {
          await wait(600);
          box.classList.add('is-thinking'); // the pupil drifts to the top right
          await wait(2800);
          box.classList.remove('is-thinking');
        } else await wait(next === OPTIONS[0] ? REST : vary(READ, 0.15));
      }
    }
  };

  // starts once the page has come in (after the intro and the entrance fade), plus a moment to read it
  let started = false;
  const start = () => { if (!started) { started = true; window.setTimeout(run, 2200); } };
  if (document.documentElement.classList.contains('is-enter')) {
    document.addEventListener('ze:enter-hero-done', start, { once: true });
    window.setTimeout(start, 7000); // in case the entrance never reports back
  } else start();
}
