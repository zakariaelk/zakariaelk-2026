// The story's videos: a light overlay on hover and a small play/pause button in the bottom-left corner (inset from
// the edges), so it's clear they can be paused. Clicking the video still toggles it too (scripts/case-enhance.ts).
// With reduced motion the videos already show their own controls, so nothing is added.
const ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="cs-vbtn__pause" d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/><path class="cs-vbtn__play" d="M8 5.5v13l11-6.5z"/></svg>';

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll<HTMLVideoElement>('.a-story video').forEach((v) => {
    const box = v.closest<HTMLElement>('.cs-media') ?? v.parentElement!;
    box.classList.add('has-vbtn');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cs-vbtn';
    btn.innerHTML = ICON;
    const sync = () => { box.classList.toggle('is-paused', v.paused); btn.setAttribute('aria-label', v.paused ? 'Play video' : 'Pause video'); };
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      // a video the reader paused stays paused on scroll (the held flag case-enhance.ts reads)
      if (v.paused) { delete v.dataset.held; v.play().catch(() => {}); } else { v.dataset.held = '1'; v.pause(); }
    });
    v.addEventListener('play', sync);
    v.addEventListener('pause', sync);
    sync();
    box.append(btn);
  });
}
