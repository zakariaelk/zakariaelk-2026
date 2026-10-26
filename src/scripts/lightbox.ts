// Enlarge, on every image of the story (not videos, not the chart; a sequence enlarges the screen it shows): a small
// round magnifier-plus in the bottom-right corner. It, or the image, opens the image full screen (the 2x file, up to
// 95% of the window, on a dark backdrop); there the button is a magnifier-minus, and a click anywhere, it, or Esc
// closes. Focus goes into the view and back to the button; the page doesn't scroll while it's open. On touch screens
// the image itself zooms: pinch, or double-tap a spot (again to fit); one finger moves a zoomed image around; a tap
// outside the image (or the button) closes. No animation.
const PLUS = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.3 15.3 20 20M7.5 10.5h6M10.5 7.5v6"/></svg>';
const MINUS = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.3 15.3 20 20M7.5 10.5h6"/></svg>';

const dlg = document.createElement('dialog');
dlg.className = 'lbz';
dlg.setAttribute('aria-label', 'Enlarged image');
dlg.innerHTML = `<div class="lbz__stage"><div class="lbz__frame"><img class="lbz__img" alt=""><button type="button" class="cs-zoom" aria-label="Close enlarged image">${MINUS}</button></div></div>`;
document.body.append(dlg);
const big = dlg.querySelector<HTMLImageElement>('.lbz__img')!;
const close = dlg.querySelector<HTMLButtonElement>('.cs-zoom')!;
let opener: HTMLElement | null = null;

// the largest version of an image: data-full, else the widest candidate in its srcset
const largest = (el: HTMLImageElement) => el.dataset.full || el.srcset.split(',').map((c) => c.trim().split(/\s+/)).sort((a, b) => parseInt(b[1] ?? '0') - parseInt(a[1] ?? '0'))[0]?.[0] || el.currentSrc || el.src;
const open = (img: HTMLImageElement, from: HTMLElement) => {
  opener = from;
  big.src = largest(img);
  big.alt = img.alt;
  reset();
  document.documentElement.classList.add('is-lbz-open');
  dlg.showModal();
  close.focus();
};
// mouse: a click anywhere closes (the image and the button included); touch: a tap outside the image closes
dlg.addEventListener('click', (e) => {
  if (touched && e.target === big) return;
  dlg.close();
});

// ---------- touch zoom: pinch, double-tap, one-finger pan, on the image itself ----------
const frame = dlg.querySelector<HTMLElement>('.lbz__frame')!;
let scale = 1, x = 0, y = 0, touched = false;
const apply = () => { big.style.transform = scale === 1 ? '' : `translate(${x}px, ${y}px) scale(${scale})`; };
const clamp = () => {
  const r = frame.getBoundingClientRect(), w = r.width, h = r.height; // the image's fitted size (its frame doesn't move)
  const mx = Math.max(0, (w * scale - innerWidth) / 2 + 24), my = Math.max(0, (h * scale - innerHeight) / 2 + 24);
  x = Math.min(mx, Math.max(-mx, x)); y = Math.min(my, Math.max(-my, y));
};
function reset() { scale = 1; x = 0; y = 0; apply(); }
// zoom to s keeping the screen point (cx, cy) where it is
const zoomAt = (s: number, cx: number, cy: number) => {
  s = Math.min(5, Math.max(1, s));
  const r = frame.getBoundingClientRect(), ox = r.left + r.width / 2, oy = r.top + r.height / 2; // the fitted image's centre
  x = cx - ox - ((cx - ox - x) * s) / scale; y = cy - oy - ((cy - oy - y) * s) / scale;
  scale = s;
  if (scale === 1) { x = 0; y = 0; }
  clamp(); apply();
};
const pts = new Map<number, { x: number; y: number }>();
let start: { d: number; s: number; mx: number; my: number; x: number; y: number } | null = null, lastTap = 0, moved = false;
big.style.touchAction = 'none';
big.addEventListener('pointerdown', (e) => {
  if (e.pointerType === 'mouse') return;
  touched = true; moved = false;
  big.setPointerCapture(e.pointerId);
  pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
  const p = [...pts.values()];
  start = p.length === 2
    ? { d: Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y), s: scale, mx: (p[0].x + p[1].x) / 2, my: (p[0].y + p[1].y) / 2, x, y }
    : { d: 0, s: scale, mx: e.clientX, my: e.clientY, x, y };
});
big.addEventListener('pointermove', (e) => {
  if (!pts.has(e.pointerId) || !start) return;
  pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
  const p = [...pts.values()];
  if (p.length === 2 && start.d) {
    moved = true;
    const d = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y), mx = (p[0].x + p[1].x) / 2, my = (p[0].y + p[1].y) / 2;
    scale = start.s; x = start.x + (mx - start.mx); y = start.y + (my - start.my);
    zoomAt(start.s * (d / start.d), mx, my);
  } else if (p.length === 1 && scale > 1) { // one finger moves the zoomed image
    const dx = e.clientX - start.mx, dy = e.clientY - start.my;
    if (Math.abs(dx) + Math.abs(dy) > 6) moved = true;
    x = start.x + dx; y = start.y + dy; clamp(); apply();
  }
});
const lift = (e: PointerEvent) => {
  if (!pts.has(e.pointerId)) return;
  pts.delete(e.pointerId);
  const p = [...pts.values()];
  if (p.length === 1) start = { d: 0, s: scale, mx: p[0].x, my: p[0].y, x, y }; // one finger left after a pinch: go on moving
  if (p.length === 0) {
    start = null;
    if (!moved && e.type === 'pointerup') { // a tap: a second one within 300ms zooms in on it, or back to fit
      const now = Date.now();
      if (now - lastTap < 300) { lastTap = 0; if (scale > 1) reset(); else zoomAt(2.5, e.clientX, e.clientY); }
      else lastTap = now;
    }
  }
};
big.addEventListener('pointerup', lift);
big.addEventListener('pointercancel', lift);
dlg.addEventListener('close', () => {
  document.documentElement.classList.remove('is-lbz-open');
  opener?.focus();
});

const add = (box: HTMLElement, current: () => HTMLImageElement | null) => {
  box.classList.add('has-zoom');
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'cs-zoom';
  btn.setAttribute('aria-label', 'Enlarge image');
  btn.innerHTML = PLUS;
  btn.addEventListener('click', (e) => { e.stopPropagation(); const img = current(); if (img) open(img, btn); });
  box.append(btn);
  box.addEventListener('click', (e) => { const img = current(); if (img && e.target === img) open(img, btn); });
};
document.querySelectorAll<HTMLElement>('.a-story :is(.cs-media, .is-media):not(.carousel-stage *)').forEach((box) => { const img = box.querySelector('img'); if (img) add(box, () => img); }); // figures, and the other cases' markdown images
document.querySelectorAll<HTMLElement>('.a-story .cs-seq__stage').forEach((stage) => add(stage, () => stage.querySelector<HTMLImageElement>('.cs-seq__slide:not([hidden]) img')));
