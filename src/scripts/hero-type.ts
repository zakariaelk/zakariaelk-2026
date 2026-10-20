// Home hero: two words in the headline are rewritten as if someone were typing them and having doubts.
// The page opens on "Web and mobile app designer / Sometimes a builder too". A moment later the first line's
// words are deleted with a slightly uneven backspace and the next option typed: Software, UX/UI, UX (only "/UI"
// goes), Product, Just, my face (its pupil drifting from the centre to the top right, thinking), and back to
// "Web and mobile app". After every second change there, the second line changes instead: builder, frontend
// developer, website developer, and back to builder. Only one line changes at a time; the caret moves with it.
// After a full round the opening sentence rests, then it all starts again.
// Typing rhythm: keystroke studies put the average gap between keys at ~0.24s (Dhakal et al., CHI 2018,
// 136M keystrokes); a word start takes a little longer, so the space between words gets ~0.35s here.
// Never with reduced motion: the first text stays.
const FACE = 'face';
const FIRST = ['Web and mobile app', 'Software', 'UX/UI', 'UX', 'Product', 'Just', FACE, 'Web and mobile app'];
const SECOND = ['builder', 'frontend developer', 'website developer', 'builder'];

const KEY = 140; // ms between typed keys, ±40%
const WORD = 350; // ms extra before a new word, ±30%
const BACKSPACE = 95; // ms between deletions, ±15% (only slightly uneven)
const DOUBT = 600; // ms before the first backspace, ±25%
const READ = 900; // ms an option stays before the doubt, ±15% (with the doubt: ~1.5s)
const REST = 8000; // ms the opening sentence stays before the next round

// my face, cropped to the head (public/img/svg/zakaria-face.svg, the line art of the old site's hero)
const FACE_SVG = `<svg class="a-type__face" viewBox="330 40 700 800" aria-hidden="true">
  <use href="/img/svg/zakaria-face.svg#ze-face-lines" />
  <path class="a-type__white" d="M522.478 483.319C494.39 476.241 499.411 459.815 503.77 449.158C537.913 444.388 564.232 456.142 569.796 462.841C546.521 482.882 537.836 483.11 522.478 483.319Z" />
  <g class="a-type__pupil"><ellipse cx="524.838" cy="465.684" rx="15.0319" ry="13.8758" /></g>
</svg>`;

const boxes = [...document.querySelectorAll<HTMLElement>('[data-type]')];
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const vary = (ms: number, by: number) => ms * (1 + (Math.random() * 2 - 1) * by);

// one editable spot: deletes back to what the next option shares with it, then types the rest
function typer(box: HTMLElement, first: string) {
  const text = box.querySelector<HTMLElement>('.a-type__text')!;
  let current = first;
  const render = () => { if (current === FACE) text.innerHTML = FACE_SVG; else text.textContent = current; };
  return async (next: string) => {
    boxes.forEach((b) => b.classList.toggle('is-on', b === box)); // the caret is where the typing is
    const keep = current !== FACE && next !== FACE && current.startsWith(next) ? next : ''; // UX/UI → UX: only "/UI" goes
    await wait(vary(DOUBT, 0.25));
    box.classList.add('is-typing');
    while (current !== keep) {
      current = current === FACE ? '' : current.slice(0, -1);
      render();
      await wait(vary(BACKSPACE, 0.15));
    }
    box.classList.remove('is-typing');
    await wait(vary(WORD, 0.3));
    box.classList.add('is-typing');
    if (next === FACE) { current = FACE; render(); }
    else while (current.length < next.length) {
      current = next.slice(0, current.length + 1);
      render();
      await wait(vary(KEY, 0.4) + (current.endsWith(' ') ? vary(WORD, 0.3) : 0));
    }
    box.classList.remove('is-typing');
    if (next === FACE) {
      await wait(600);
      box.classList.add('is-thinking'); // the pupil drifts to the top right
      await wait(2800);
      box.classList.remove('is-thinking');
    }
  };
}

if (boxes.length === 2 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  fetch('/img/svg/zakaria-face.svg').catch(() => {}); // cached before it is needed
  const one = typer(boxes[0], FIRST[0]);
  const two = typer(boxes[1], SECOND[0]);

  // a round: two changes on the first line, one on the second, and so on; it ends on the opening sentence
  const run = async () => {
    for (;;) {
      let s = 1;
      for (const [i, next] of FIRST.slice(1).entries()) {
        await one(next);
        await wait(vary(READ, 0.15));
        if (i % 2 === 1 && s < SECOND.length) { await two(SECOND[s++]); await wait(vary(READ, 0.15)); }
      }
      await wait(REST);
    }
  };

  // starts once the page has come in (after the intro and the entrance fade), after a short beat
  let started = false;
  const start = () => { if (!started) { started = true; window.setTimeout(run, 700); } };
  if (document.documentElement.classList.contains('is-enter')) {
    document.addEventListener('ze:enter-hero-done', start, { once: true });
    window.setTimeout(start, 7000); // in case the entrance never reports back
  } else start();
}
