// =============================================================
// site.js — Publication helpers, cover motion, and scroll effects.
// =============================================================

(function () {
  'use strict';

  // ----- Publication Expand/Collapse -----

  document.addEventListener('click', function (e) {
    var button = e.target.closest('[data-toggle-target]');
    if (!button) return;

    var targetId = button.getAttribute('data-toggle-target');
    var target = document.getElementById(targetId);
    if (!target) return;

    target.classList.toggle('show');
  });

  // ----- Publication Search/Filter -----

  var searchInput = document.getElementById('pubSearch');
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      var query = this.value.toLowerCase().trim();
      var entries = document.querySelectorAll('[data-pub-searchable]');

      entries.forEach(function (entry) {
        if (!query) {
          entry.style.display = '';
          return;
        }
        var text = entry.textContent.toLowerCase();
        entry.style.display = text.includes(query) ? '' : 'none';
      });
    });
  }

  // ----- Copy BibTeX Button -----

  document.querySelectorAll('.pub-collapse').forEach(function (collapse) {
    // Only add copy to bibtex blocks (id starts with "bib-")
    if (!collapse.id || !collapse.id.startsWith('bib-')) return;

    var pre = collapse.querySelector('pre');
    if (!pre) return;

    var wrapper = document.createElement('div');
    wrapper.className = 'copy-wrapper';
    wrapper.style.position = 'relative';

    var btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.innerHTML = '<i class="fa-regular fa-copy"></i>';
    btn.title = 'Copy to clipboard';

    btn.addEventListener('click', function () {
      navigator.clipboard.writeText(pre.textContent.trim()).then(function () {
        btn.innerHTML = '<i class="fa-solid fa-check"></i>';
        btn.classList.add('copied');
        setTimeout(function () {
          btn.innerHTML = '<i class="fa-regular fa-copy"></i>';
          btn.classList.remove('copied');
        }, 2000);
      });
    });

    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);
    wrapper.appendChild(btn);
  });

  // ----- Publication Year Badges -----

  document.querySelectorAll('.pub-entry').forEach(function (entry) {
    var text = entry.textContent;
    // Match a 4-digit year in parentheses, common in citation format
    var match = text.match(/\((\d{4})\)/);
    if (match) {
      var badge = document.createElement('span');
      badge.className = 'year-badge';
      badge.textContent = match[1];
      entry.insertBefore(badge, entry.firstChild);
    }
  });

  // ----- Back to Top Button -----

  var topBtn = document.createElement('button');
  topBtn.className = 'back-to-top';
  topBtn.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
  topBtn.setAttribute('aria-label', 'Back to top');
  document.body.appendChild(topBtn);

  topBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', function () {
    if (window.scrollY > 400) {
      topBtn.classList.add('visible');
    } else {
      topBtn.classList.remove('visible');
    }
  }, { passive: true });

  // ----- Cover Parallax + Navbar State -----

  var navbar = document.querySelector('.navbar');
  var cover = document.getElementById('cover');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var coverFramePending = false;

  function updateCoverMotion() {
    coverFramePending = false;
    if (!cover || reducedMotion.matches) return;
    var height = Math.max(cover.offsetHeight, 1);
    var progress = Math.min(Math.max(window.scrollY / height, 0), 1);
    cover.style.setProperty('--cover-content-opacity', Math.max(1 - progress * 1.1, 0).toFixed(3));
    cover.style.setProperty('--cover-content-y', (-progress * 80).toFixed(1) + 'px');
    cover.style.setProperty('--cover-background-opacity', Math.max(1 - progress * 0.55, 0).toFixed(3));
    cover.style.setProperty('--cover-background-y', (-progress * 20).toFixed(1) + 'px');
  }

  function requestCoverUpdate() {
    if (coverFramePending) return;
    coverFramePending = true;
    window.requestAnimationFrame(updateCoverMotion);
  }

  if (cover) {
    updateCoverMotion();
    window.addEventListener('scroll', requestCoverUpdate, { passive: true });
    window.addEventListener('resize', requestCoverUpdate, { passive: true });

    if ('IntersectionObserver' in window && navbar) {
      var coverObserver = new IntersectionObserver(function (entries) {
        navbar.classList.toggle('over-cover', entries[0].isIntersecting);
      }, { threshold: 0.05 });
      coverObserver.observe(cover);
    } else if (navbar) {
      navbar.classList.add('over-cover');
    }
  }

  if (navbar) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 10) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // ----- Fade-in on Scroll -----

  var fadeElements = document.querySelectorAll('.fade-in-section');
  if (fadeElements.length > 0 && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    fadeElements.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    fadeElements.forEach(function (el) {
      el.classList.add('visible');
    });
  }

})();
