/* â”€â”€ HERO LAYERS â€” Drag to reposition (clamped within hero) â”€â”€ */
(function () {
  'use strict';

  const PADDING = 16; /* min distance from hero edge (px) */

  function init() {
    const hero   = document.getElementById('hero');
    const layers = document.querySelectorAll('.hero-visual-layer');
    if (!layers.length || !hero) return;

    layers.forEach(function (el) {
      let dragging   = false;
      let startMouseX = 0, startMouseY = 0;
      let startDragX  = 0, startDragY  = 0;
      let minDX = -Infinity, maxDX = Infinity;
      let minDY = -Infinity, maxDY = Infinity;

      function getVar(name) {
        return parseFloat(el.style.getPropertyValue(name)) || 0;
      }

      function onStart(clientX, clientY) {
        dragging    = true;
        startMouseX = clientX;
        startMouseY = clientY;
        startDragX  = getVar('--drag-x');
        startDragY  = getVar('--drag-y');

        /* Snapshot bounding rects at drag start */
        const heroRect = hero.getBoundingClientRect();
        const elRect   = el.getBoundingClientRect();

        /* Visual center of element relative to hero, without the drag offset */
        const cx = (elRect.left + elRect.width  / 2) - heroRect.left - startDragX;
        const cy = (elRect.top  + elRect.height / 2) - heroRect.top  - startDragY;

        const hw = elRect.width  / 2 + PADDING;
        const hh = elRect.height / 2 + PADDING;

        /* Allowed drag range so visual center keeps element inside hero */
        minDX = hw - cx;
        maxDX = heroRect.width  - hw - cx;
        minDY = hh - cy;
        maxDY = heroRect.height - hh - cy;

        el.classList.add('is-dragging');
        document.body.style.cursor = 'grabbing';
        el.style.zIndex = '100';
      }

      function onMove(clientX, clientY) {
        if (!dragging) return;
        const rawX = startDragX + clientX - startMouseX;
        const rawY = startDragY + clientY - startMouseY;
        el.style.setProperty('--drag-x', Math.max(minDX, Math.min(maxDX, rawX)) + 'px');
        el.style.setProperty('--drag-y', Math.max(minDY, Math.min(maxDY, rawY)) + 'px');
      }

      function onEnd() {
        if (!dragging) return;
        dragging = false;
        el.classList.remove('is-dragging');
        document.body.style.cursor = '';
        el.style.zIndex = '';
      }

      /* Mouse */
      el.addEventListener('mousedown', function (e) {
        e.preventDefault();
        onStart(e.clientX, e.clientY);
      });
      document.addEventListener('mousemove', function (e) { onMove(e.clientX, e.clientY); });
      document.addEventListener('mouseup', onEnd);

      /* Touch */
      el.addEventListener('touchstart', function (e) {
        if (e.touches.length !== 1) return;
        e.preventDefault();
        onStart(e.touches[0].clientX, e.touches[0].clientY);
      }, { passive: false });
      document.addEventListener('touchmove', function (e) {
        if (!dragging) return;
        onMove(e.touches[0].clientX, e.touches[0].clientY);
      }, { passive: false });
      document.addEventListener('touchend', onEnd);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
