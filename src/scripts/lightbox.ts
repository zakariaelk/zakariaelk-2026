// Enlarge, on every image of the story (not videos, not the chart; a sequence enlarges the screen it shows): a small
// round magnifier-plus in the bottom-right corner. It, or the image, opens the image full screen (the 2x file, up to
// 95% of the window, on a dark backdrop); there the button is a magnifier-minus, and a click anywhere, it, or Esc
// closes. Focus goes into the view and back to the button; the page doesn't scroll while it's open; pinch zoom
// stays possible on touch screens. No animation.
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
  document.documentElement.classList.add('is-lbz-open');
  dlg.showModal();
  close.focus();
};
dlg.addEventListener('click', () => dlg.close()); // anywhere, the image and the button included
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
document.querySelectorAll<HTMLElement>('.a-story .cs-media').forEach((box) => { const img = box.querySelector('img'); if (img) add(box, () => img); });
document.querySelectorAll<HTMLElement>('.a-story .cs-seq__stage').forEach((stage) => add(stage, () => stage.querySelector<HTMLImageElement>('.cs-seq__screen:not([hidden])')));
