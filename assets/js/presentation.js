(function () {
  'use strict';

  document.querySelectorAll('[data-presentation]').forEach(function (deck) {
    var slides = Array.from(deck.querySelectorAll('[data-presentation-slide]'));
    if (!slides.length) return;

    var previous = deck.querySelector('[data-presentation-prev]');
    var next = deck.querySelector('[data-presentation-next]');
    var currentLabel = deck.querySelector('[data-presentation-current]');
    var progress = deck.querySelector('[data-presentation-progress]');
    var fullscreen = deck.querySelector('[data-presentation-fullscreen]');
    var match = window.location.hash.match(/^#slide-(\d+)$/);
    var current = match ? Math.min(Math.max(Number(match[1]) - 1, 0), slides.length - 1) : 0;

    function show(index, updateHash) {
      current = Math.min(Math.max(index, 0), slides.length - 1);
      slides.forEach(function (slide, slideIndex) {
        slide.hidden = slideIndex !== current;
      });
      previous.disabled = current === 0;
      next.disabled = current === slides.length - 1;
      currentLabel.textContent = String(current + 1);
      progress.style.width = ((current + 1) / slides.length * 100).toFixed(3) + '%';
      if (updateHash) {
        history.replaceState(null, '', '#slide-' + (current + 1));
      }
    }

    previous.addEventListener('click', function () { show(current - 1, true); });
    next.addEventListener('click', function () { show(current + 1, true); });

    fullscreen.addEventListener('click', function () {
      if (document.fullscreenElement === deck) {
        document.exitFullscreen();
      } else {
        deck.requestFullscreen();
      }
    });

    document.addEventListener('fullscreenchange', function () {
      var active = document.fullscreenElement === deck;
      fullscreen.textContent = active ? 'Exit fullscreen' : 'Fullscreen';
      fullscreen.setAttribute('aria-label', active ? 'Exit fullscreen' : 'Enter fullscreen');
    });

    document.addEventListener('keydown', function (event) {
      if (event.target.matches('input, textarea, select, [contenteditable="true"]')) return;
      if (event.key === 'ArrowRight' || event.key === 'PageDown') show(current + 1, true);
      if (event.key === 'ArrowLeft' || event.key === 'PageUp') show(current - 1, true);
      if (event.key === 'Home') show(0, true);
      if (event.key === 'End') show(slides.length - 1, true);
    });

    show(current, false);
  });
})();
