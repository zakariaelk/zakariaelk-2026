// Full-screen view for a case study's images and sequence screens: click (or Enter) opens it; a large close
// button, Esc or a click outside the image closes it. Zoom with the + / − buttons (or + / − / 0 keys), or click the
// image to zoom in on that spot and click again to fit; drag to move around a zoomed image. No trackpad needed.
const STEPS = [1, 1.6, 2.5, 3.5];

const dlg = document.createElement('dialog');
dlg.className = 'lb';
dlg.setAttribute('aria-label', 'Image, full screen');
dlg.innerHTML = `<div class="lb__stage"><img class="lb__img" alt="" draggable="false"></div>
  <div class="lb__bar"><button type="button" data-zoom="-1" aria-label="Zoom out">−</button><button type="button" data-zoom="0" aria-label="Fit to screen">Fit</button><button type="button" data-zoom="1" aria-label="Zoom in">+</button></div>
  <button type="button" class="lb__close" aria-label="Close full screen view"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg></button>`;
document.body.append(dlg);
const stage = dlg.querySelector<HTMLElement>('.lb__stage')!;
const img = dlg.querySelector<HTMLImageElement>('.lb__img')!;

let scale = 1, x = 0, y = 0;
const apply = () => {
  img.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
  dlg.classList.toggle('is-zoomed', scale > 1);
};
// zoom to s, keeping the point (px, py) — measured from the centre of the stage — where it is
const zoomTo = (s: number, px = 0, py = 0) => {
  if (s <= 1) { scale = 1; x = 0; y = 0; return apply(); }
  x = px - ((px - x) * s) / scale;
  y = py - ((py - y) * s) / scale;
  scale = s;
  apply();
};
const step = (dir: number) => {
  const next = dir > 0 ? STEPS.find((s) => s > scale + 0.01) : [...STEPS].reverse().find((s) => s < scale - 0.01);
  zoomTo(dir === 0 ? 1 : next ?? scale);
};
const fromCentre = (e: MouseEvent) => { const r = stage.getBoundingClientRect(); return [e.clientX - r.left - r.width / 2, e.clientY - r.top - r.height / 2]; };

// the largest version of an image: data-full, else the widest candidate in its srcset
const largest = (el: HTMLImageElement) => el.dataset.full || el.srcset.split(',').map((c) => c.trim().split(/\s+/)).sort((a, b) => parseInt(b[1] ?? '0') - parseInt(a[1] ?? '0'))[0]?.[0] || el.currentSrc || el.src;
const open = (el: HTMLImageElement) => {
  img.src = largest(el);
  img.alt = el.alt;
  zoomTo(1);
  dlg.showModal();
};

dlg.querySelector('.lb__close')!.addEventListener('click', () => dlg.close());
dlg.querySelectorAll<HTMLButtonElement>('[data-zoom]').forEach((b) => b.addEventListener('click', () => step(Number(b.dataset.zoom))));
stage.addEventListener('click', (e) => { if (e.target === stage) dlg.close(); }); // outside the image
dlg.addEventListener('keydown', (e) => {
  if (e.key === '+' || e.key === '=') step(1);
  else if (e.key === '-') step(-1);
  else if (e.key === '0') step(0);
});

// click to zoom on a spot (or back to fit); drag to move a zoomed image
let drag: { id: number; sx: number; sy: number; ox: number; oy: number; moved: boolean } | null = null;
img.addEventListener('pointerdown', (e) => {
  drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: x, oy: y, moved: false };
  img.setPointerCapture(e.pointerId);
});
img.addEventListener('pointermove', (e) => {
  if (!drag || scale === 1) return;
  const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
  if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
  x = drag.ox + dx; y = drag.oy + dy; apply();
});
img.addEventListener('pointerup', (e) => {
  const moved = drag?.moved;
  drag = null;
  if (moved) return;
  if (scale > 1) zoomTo(1);
  else { const [px, py] = fromCentre(e); zoomTo(STEPS[2], px, py); }
});

// what opens it: the images in the story and the screens of sequences
document.querySelectorAll<HTMLImageElement>('.a-story :is(.cs-media, .cs-seq__stage) img, .a-story .is-media img').forEach((el) => {
  el.tabIndex = 0;
  el.setAttribute('aria-haspopup', 'dialog');
  el.title = 'View full screen';
  el.addEventListener('click', () => open(el));
  el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(el); } });
});
