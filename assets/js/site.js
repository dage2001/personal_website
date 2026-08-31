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

  // ----- Markdown Code Blocks -----

  var codeLanguageNames = {
    bash: 'Bash',
    c: 'C',
    cpp: 'C++',
    css: 'CSS',
    cython: 'Cython',
    docker: 'Dockerfile',
    dockerfile: 'Dockerfile',
    fortran: 'Fortran',
    go: 'Go',
    html: 'HTML',
    java: 'Java',
    javascript: 'JavaScript',
    js: 'JavaScript',
    json: 'JSON',
    julia: 'Julia',
    kotlin: 'Kotlin',
    latex: 'LaTeX',
    make: 'Makefile',
    matlab: 'MATLAB',
    plaintext: 'Text',
    powershell: 'PowerShell',
    python: 'Python',
    r: 'R',
    ruby: 'Ruby',
    rust: 'Rust',
    scss: 'SCSS',
    sql: 'SQL',
    swift: 'Swift',
    typescript: 'TypeScript',
    xml: 'XML',
    yaml: 'YAML'
  };

  function copyCode(text, button) {
    var complete = function () {
      var label = button.querySelector('span');
      var icon = button.querySelector('i');
      label.textContent = 'Copied';
      icon.className = 'fa-solid fa-check';
      window.setTimeout(function () {
        label.textContent = 'Copy';
        icon.className = 'fa-regular fa-copy';
      }, 1800);
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(complete);
      return;
    }

    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
    complete();
  }

  document.querySelectorAll('.post .highlighter-rouge').forEach(function (wrapper) {
    var pre = wrapper.querySelector('pre');
    var code = pre && pre.querySelector('code');
    if (!pre || !code || wrapper.classList.contains('code-block')) return;

    var languageClass = Array.from(wrapper.classList).find(function (className) {
      return className.startsWith('language-');
    });
    var language = languageClass ? languageClass.slice(9).toLowerCase() : 'plaintext';
    var languageName = codeLanguageNames[language] || language.replace(/(^|-)([a-z])/g, function (_, separator, letter) {
      return (separator ? ' ' : '') + letter.toUpperCase();
    });

    wrapper.classList.add('code-block');

    var toolbar = document.createElement('div');
    toolbar.className = 'code-toolbar';

    var label = document.createElement('span');
    label.className = 'code-language';
    label.textContent = languageName;

    var button = document.createElement('button');
    button.className = 'code-copy';
    button.type = 'button';
    button.setAttribute('aria-label', 'Copy ' + languageName + ' code');
    button.innerHTML = '<span>Copy</span><i class="fa-regular fa-copy" aria-hidden="true"></i>';
    button.addEventListener('click', function () {
      copyCode(code.textContent, button);
    });

    toolbar.appendChild(label);
    toolbar.appendChild(button);
    wrapper.insertBefore(toolbar, wrapper.firstChild);
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

  function updateNavbarState() {
    if (!navbar) return;

    if (cover) {
      var revealPoint = Math.max(cover.offsetHeight - navbar.offsetHeight, 0);
      var passedCover = window.scrollY >= revealPoint;
      navbar.classList.toggle('after-cover', passedCover);
      navbar.removeAttribute('aria-hidden');
    }

    navbar.classList.toggle('scrolled', window.scrollY > 10);
  }

  function updateHomeSectionState() {
    if (!cover || !navbar) return;

    var sectionLinks = Array.from(navbar.querySelectorAll('.nav-link[href*="#"]'));
    var activeLink = null;
    var probe = window.scrollY + Math.min(window.innerHeight * .38, 320);

    sectionLinks.forEach(function (link) {
      var hash = new URL(link.href, window.location.href).hash;
      var section = hash && document.querySelector(hash);
      link.classList.remove('active');
      link.removeAttribute('aria-current');
      if (section && probe >= section.offsetTop) activeLink = link;
    });

    if (activeLink) {
      activeLink.classList.add('active');
      activeLink.setAttribute('aria-current', 'location');
    }
  }

  function updateCoverMotion() {
    coverFramePending = false;
    updateNavbarState();
    updateHomeSectionState();
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

  }

  if (navbar) {
    updateNavbarState();
    window.addEventListener('scroll', requestCoverUpdate, { passive: true });
  }

  // Wheel and trackpad scrolling deliberately remain native. High-resolution
  // trackpads already supply momentum at the operating-system level; applying
  // another requestAnimationFrame easing layer causes double inertia, lag, and
  // poor direction changes on macOS and Windows precision touchpads.

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
