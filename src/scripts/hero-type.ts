// Home hero: two words in the headline are rewritten as if someone were typing them and having doubts.
// The page opens on "Web and mobile app designer / Sometimes a builder too". A moment later the first line's
// words are deleted with a slightly uneven backspace and the next option typed: Software, UX/UI, UX (only "/UI"
// goes), Product, Just, then YoupieMan's face pops in between "Just" and "designer" and looks around, confused (left,
// right, back, lids half closed, twice), and back to "Web and mobile app". After every second change there, the second line changes instead: builder, frontend
// developer, website developer (front-end dev and website dev on phones), and back to builder. Only one line changes at a time; the caret moves with it.
// After a full round the opening sentence rests, then it all starts again.
// Typing rhythm: keystroke studies put the average gap between keys at ~0.24s (Dhakal et al., CHI 2018,
// 136M keystrokes); a word start takes a little longer, so the space between words gets ~0.35s here.
// Never with reduced motion: the first text stays.
import character from '../components/story/character/character.svg?raw';

const FACE = 'Just\u00a0'; // "Just" with YoupieMan after it
const FIRST = ['Web and mobile app', 'Software', 'UX/UI', 'UX', 'Product', 'Just', FACE, 'Web and mobile app'];
const SECOND = ['builder', 'frontend developer', 'website developer', 'builder'];
// phones: "dev" instead of "developer", so the sentence stays on one line while it changes
const PHONE = matchMedia('(max-width: 700px)');
const short = (word: string) => (PHONE.matches ? ({ 'frontend developer': 'front-end dev', 'website developer': 'website dev' } as Record<string, string>)[word] ?? word : word);

const KEY = 140; // ms between typed keys, ±40%
const WORD = 350; // ms extra before a new word, ±30%
const BACKSPACE = 95; // ms between deletions, ±15% (only slightly uneven)
const DOUBT = 600; // ms before the first backspace, ±25%
const READ = 900; // ms an option stays before the doubt, ±15% (with the doubt: ~1.5s)
const REST = 8000; // ms the opening sentence stays before the next round

// YoupieMan (the INSO case's character, components/story/character), his face only
const FACE_SVG = character.replace('viewBox="40 6 186 330"', 'viewBox="54 68 134 120"').replace('class="rx-char"', 'class="rx-char a-type__face"');
const LOOK = { c: '0px 0px', l: '-11px 0px', r: '11px 0px' };

const boxes = [...document.querySelectorAll<HTMLElement>('[data-type]')];
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const vary = (ms: number, by: number) => ms * (1 + (Math.random() * 2 - 1) * by);

// one editable spot: deletes back to what the next option shares with it, then types the rest
function typer(box: HTMLElement, first: string) {
  const text = box.querySelector<HTMLElement>('.a-type__text')!;
  let current = first;
  const render = () => { if (current === FACE) text.innerHTML = `Just ${FACE_SVG}`; else text.textContent = current; };
  // his confused look: the eyes go left, right, back, then the lids half close; twice
  const confused = async () => {
    const pupils = [...text.querySelectorAll<SVGGElement>('.rx-pupil')], lids = [...text.querySelectorAll<SVGGElement>('.rx-lid')];
    const look = (k: keyof typeof LOOK) => pupils.forEach((p) => (p.style.translate = LOOK[k]));
    const close = (share: number) => lids.forEach((l) => (l.style.translate = `0 ${share * 48}px`));
    for (let round = 0; round < 2; round++) {
      await wait(500); look('l'); await wait(700); look('r'); await wait(700); look('c');
      await wait(500); close(0.5); await wait(1100); close(0);
    }
  };
  return async (next: string) => {
    boxes.forEach((b) => b.classList.toggle('is-on', b === box)); // the caret is where the typing is
    const keep = next === FACE && current === 'Just' ? 'Just' : current !== FACE && current.startsWith(next) ? next : ''; // UX/UI → UX: only "/UI" goes; Just stays for YoupieMan
    await wait(vary(DOUBT, 0.25));
    box.classList.add('is-typing');
    while (current !== keep) {
      current = current === FACE ? 'Just' : current.slice(0, -1); // YoupieMan goes in one keystroke
      render();
      await wait(vary(BACKSPACE, 0.15));
    }
    box.classList.remove('is-typing');
    await wait(vary(WORD, 0.3));
    box.classList.add('is-typing');
    if (next === FACE) { await wait(300); current = FACE; render(); }
    else while (current.length < next.length) {
      current = next.slice(0, current.length + 1);
      render();
      await wait(vary(KEY, 0.4) + (current.endsWith(' ') ? vary(WORD, 0.3) : 0));
    }
    box.classList.remove('is-typing');
    if (next === FACE) await confused();
  };
}

if (boxes.length === 2 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const one = typer(boxes[0], FIRST[0]);
  const two = typer(boxes[1], SECOND[0]);

  // a round: two changes on the first line, one on the second, and so on; it ends on the opening sentence
  const run = async () => {
    for (;;) {
      let s = 1;
      for (const [i, next] of FIRST.slice(1).entries()) {
        await one(next);
        await wait(vary(READ, 0.15));
        if (i % 2 === 1 && s < SECOND.length) { await two(short(SECOND[s++])); await wait(vary(READ, 0.15)); }
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
