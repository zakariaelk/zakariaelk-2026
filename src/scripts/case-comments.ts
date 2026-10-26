// Comments anywhere on a case study (components/CaseComments.astro).
const root = document.querySelector<HTMLElement>('[data-comments]');
const card = document.querySelector<HTMLElement>('.cc-card');
if (root && card) {
  const pin = root.querySelector<HTMLButtonElement>('.cc-pin')!;
  const hint = root.querySelector<HTMLElement>('.cc-hint')!;
  const form = card.querySelector<HTMLFormElement>('form')!;
  const status = card.querySelector<HTMLElement>('.cc-status')!;
  const on = card.querySelector<HTMLElement>('[data-cc-on]')!;
  const tpl = document.querySelector<HTMLTemplateElement>('#cc-dropped')!;
  const story = document.querySelector<HTMLElement>('main')!;
  const TARGETS = '.a-story :is(p, li, h2, h3, figure, .cs-block), .a-case__lede';
  const seen = () => { try { return localStorage.getItem('cc-hint') === '1'; } catch { return false; } };
  const remember = () => { try { localStorage.setItem('cc-hint', '1'); } catch {} };

  // shown once the reader has scrolled a bit; the hint only the first time
  const reveal = () => {
    if (scrollY < 700) return;
    root.hidden = false;
    if (!seen()) hint.hidden = false; else root.classList.add('is-quiet');
    removeEventListener('scroll', reveal);
  };
  addEventListener('scroll', reveal, { passive: true });
  reveal();
  const settle = () => { hint.hidden = true; root.classList.add('is-quiet'); remember(); };
  hint.querySelector('.cc-hint__ok')!.addEventListener('click', settle);

  // the element a point is over, if it can take a comment
  const targetAt = (x: number, y: number) => {
    pin.style.visibility = 'hidden';
    const el = document.elementFromPoint(x, y)?.closest<HTMLElement>(TARGETS) ?? null;
    pin.style.visibility = '';
    return el?.closest<HTMLElement>('.cs-block') ?? el;
  };
  // the section a target is in: the last section label before it
  const sectionOf = (el: HTMLElement) => [...document.querySelectorAll('.a-story h2')].filter((h) => h.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING).pop()?.textContent?.trim() ?? 'Intro';

  let dropped: HTMLElement | null = null, target: HTMLElement | null = null;
  const place = (el: HTMLElement, x: number, y: number) => {
    const box = story.getBoundingClientRect();
    el.style.left = `${x - box.left - 16}px`;
    el.style.top = `${y - box.top - 16}px`;
  };
  const openCard = (el: HTMLElement, x: number, y: number) => {
    target = el;
    dropped?.remove();
    dropped = tpl.content.firstElementChild!.cloneNode(true) as HTMLElement;
    story.append(dropped);
    place(dropped, x, y);
    el.classList.add('cc-target');
    const text = (el.innerText ?? '').replace(/\s+/g, ' ').trim();
    const quote = text || (el.querySelector('img')?.getAttribute('alt') ?? 'a visual');
    on.textContent = `On “${quote.slice(0, 80)}${quote.length > 80 ? '…' : ''}”`;
    (form.elements.namedItem('page') as HTMLInputElement).value = location.pathname;
    (form.elements.namedItem('section') as HTMLInputElement).value = sectionOf(el);
    (form.elements.namedItem('quote') as HTMLInputElement).value = quote.slice(0, 300);
    status.textContent = '';
    form.querySelector<HTMLButtonElement>('.cc-send')!.disabled = false;
    card.hidden = false;
    // beside the pin, kept on screen
    const r = dropped.getBoundingClientRect(), w = card.offsetWidth, h = card.offsetHeight;
    card.style.left = `${Math.min(innerWidth - w - 12, Math.max(12, r.right + 10))}px`;
    card.style.top = `${Math.min(innerHeight - h - 12, Math.max(12, r.top - 20))}px`;
    form.querySelector('textarea')!.focus();
    settle();
  };
  const closeCard = (keep: boolean) => {
    card.hidden = true;
    target?.classList.remove('cc-target');
    if (!keep) { dropped?.remove(); dropped = null; }
    pin.focus({ preventScroll: true });
  };
  card.querySelector('.cc-cancel')!.addEventListener('click', () => closeCard(false));
  card.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCard(false); });

  // drag the pin onto the page; a click (no drag) or the keyboard comments on the paragraph being read
  let drag: { id: number; x: number; y: number; moved: boolean } | null = null, over: HTMLElement | null = null, justDragged = false;
  pin.addEventListener('pointerdown', (e) => { drag = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false }; pin.setPointerCapture(e.pointerId); });
  pin.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 6) return;
    drag.moved = true;
    root.classList.add('is-dragging');
    hint.hidden = true;
    pin.style.translate = `${dx}px ${dy}px`;
    const t = targetAt(e.clientX, e.clientY);
    if (t !== over) { over?.classList.remove('cc-over'); over = t; over?.classList.add('cc-over'); }
  });
  const endDrag = (e: PointerEvent) => {
    if (!drag) return;
    const moved = drag.moved;
    drag = null;
    justDragged = moved; // the click that follows a drag isn't a click
    window.setTimeout(() => { justDragged = false; }, 0);
    pin.style.translate = '';
    root.classList.remove('is-dragging');
    over?.classList.remove('cc-over');
    const t = over; over = null;
    if (moved && t) openCard(t, e.clientX, e.clientY);
  };
  pin.addEventListener('pointerup', endDrag);
  pin.addEventListener('pointercancel', () => { drag = null; pin.style.translate = ''; root.classList.remove('is-dragging'); over?.classList.remove('cc-over'); over = null; });
  pin.addEventListener('click', (e) => {
    if (justDragged || !card.hidden) return;
    // the paragraph in the middle of the screen
    const all = [...document.querySelectorAll<HTMLElement>('.a-story article > p, .a-story .cs-block, .a-story article > figure')];
    const mid = innerHeight / 2;
    const el = all.reduce<HTMLElement | null>((best, n) => { const r = n.getBoundingClientRect(); return !best || Math.abs(r.top + r.height / 2 - mid) < Math.abs(best.getBoundingClientRect().top + best.getBoundingClientRect().height / 2 - mid) ? n : best; }, null);
    if (!el) return;
    const r = el.getBoundingClientRect();
    openCard(el, r.right - 8, r.top + 12);
  });

  // send to Netlify Forms
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const send = form.querySelector<HTMLButtonElement>('.cc-send')!;
    send.disabled = true;
    status.textContent = 'Sending…';
    try {
      const res = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(new FormData(form) as unknown as Record<string, string>).toString() });
      if (!res.ok) throw new Error(String(res.status));
      status.textContent = 'Thanks, it\'s sent. I\'ll read it soon.';
      dropped?.classList.add('is-sent');
      form.reset();
      window.setTimeout(() => closeCard(true), 1600);
    } catch {
      status.textContent = 'It didn\'t go through. Please try again in a moment.';
      send.disabled = false;
    }
  });
}
