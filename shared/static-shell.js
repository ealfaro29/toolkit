(() => {
  'use strict';

  const html = document.documentElement;
  html.dataset.staticShell = 'true';

  let isAlreadyDead = false;
  try {
    isAlreadyDead = localStorage.getItem('vgtools_dead') === '1';
  } catch (e) {}

  if (isAlreadyDead) {
    html.dataset.isDead = 'true';
  }

  const noop = () => {};
  const blockedPromise = () => Promise.reject(new Error('Static shell: functionality disabled'));
  let gravityStarted = false;

  const pseudoRandom = (seed) => {
    const value = Math.sin(seed * 12.9898) * 43758.5453;
    return value - Math.floor(value);
  };

  const installGravityStyles = () => {
    if (document.getElementById('vgtools-gravity-style')) return;

    const style = document.createElement('style');
    style.id = 'vgtools-gravity-style';
    style.textContent = `
      html[data-static-shell="true"] {
        min-height: 100%;
        background: #030303 !important;
      }

      html[data-static-shell="true"] body {
        min-height: 100%;
        position: relative;
        isolation: isolate;
        background: #030303 !important;
        background-color: #030303 !important;
      }

      html[data-static-shell="true"] body::before {
        background:
          linear-gradient(180deg, rgba(244, 248, 255, 0.96), rgba(225, 235, 248, 0.98)),
          url("../Theme/glassui/pattern_glassui.jpg") center center / 420px 420px fixed !important;
        opacity: 1 !important;
        z-index: 1 !important;
        transform: translate3d(0, 0, 0);
        will-change: transform, opacity, filter;
      }

      html[data-static-shell="true"] .container {
        position: relative;
        z-index: 3;
      }

      html[data-static-shell="true"] .app-card,
      html[data-static-shell="true"] .app-card:hover,
      html[data-static-shell="true"] .app-card:focus,
      html[data-static-shell="true"] .app-card.keyboard-selected {
        opacity: 1 !important;
        animation: none !important;
        transition: none !important;
      }

      html[data-static-shell="true"] body:not(.vgtools-gravity-active) .app-card,
      html[data-static-shell="true"] body:not(.vgtools-gravity-active) .app-card:hover,
      html[data-static-shell="true"] body:not(.vgtools-gravity-active) .app-card:focus,
      html[data-static-shell="true"] body:not(.vgtools-gravity-active) .app-card.keyboard-selected {
        transform: none !important;
      }

      html[data-static-shell="true"] .app-card:hover::before {
        transform: none !important;
      }

      .vgtools-card-image-piece {
        position: absolute;
        inset: 0;
        z-index: 0;
        border-radius: inherit;
        background: var(--card-bg-image) center / cover no-repeat;
        opacity: 0.75;
        pointer-events: none;
        transform: translate3d(0, 0, 0) rotate(0deg);
        backface-visibility: hidden;
        will-change: transform, filter;
      }

      .app-card.vgtools-has-image-piece::before {
        opacity: 0 !important;
      }

      .app-card.vgtools-has-image-piece .card-glass-content {
        position: relative;
        z-index: 1;
      }

      .vgtools-gravity-letter {
        display: inline;
        white-space: pre;
        transform: translate3d(0, 0, 0);
      }

      .site-footer-minimal {
        display: none !important;
      }

      body.vgtools-gravity-active {
        cursor: default !important;
        overflow: hidden !important;
      }

      body.vgtools-gravity-active::before {
        animation: vgtoolsBackgroundFall 1400ms cubic-bezier(0.26, 0, 0.12, 1) forwards;
      }

      body.vgtools-gravity-active .vgtools-gravity-item {
        pointer-events: none !important;
        transform-origin: var(--origin-x) var(--origin-y);
        animation: vgtoolsGravityFall var(--duration) cubic-bezier(0.26, 0, 0.12, 1) var(--delay) forwards !important;
        transition: none !important;
        backface-visibility: hidden;
        will-change: transform, opacity, filter;
      }

      body.vgtools-gravity-active .vgtools-gravity-letter {
        display: inline-block;
        animation: vgtoolsLetterFall var(--letter-duration) cubic-bezier(0.26, 0, 0.12, 1) var(--letter-delay) forwards;
        transform-origin: 50% 80%;
        backface-visibility: hidden;
        will-change: transform, opacity, filter;
      }

      body.vgtools-gravity-active .vgtools-card-image-piece {
        opacity: 0.76;
      }

      html[data-is-dead="true"] body::before,
      html[data-is-dead="true"] .container,
      body.vgtools-dead::before,
      body.vgtools-dead .container,
      body.vgtools-dead .vgtools-gravity-item,
      body.vgtools-dead .vgtools-card-image-piece,
      body.vgtools-dead .vgtools-gravity-letter {
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
        display: none !important;
      }

      .vgtools-dead-message {
        position: fixed;
        inset: 0;
        z-index: 999999;
        display: grid;
        place-items: center;
        padding: 32px;
        pointer-events: none;
        opacity: 0;
        transform: none;
      }

      body.vgtools-gravity-active .vgtools-dead-message {
        animation: vgtoolsDeadMessageFade 3000ms ease-out 1000ms forwards;
      }

      html[data-is-dead="true"] .vgtools-dead-message,
      body.vgtools-dead .vgtools-dead-message {
        opacity: 1 !important;
        visibility: visible !important;
        display: grid !important;
        animation: none !important;
      }

      .vgtools-dead-message-inner {
        max-width: min(520px, 90vw);
        text-align: center;
        color: rgba(255, 255, 255, 0.78);
        text-shadow: 0 18px 48px rgba(0, 0, 0, 0.75);
        font-family: var(--font-family-sans, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
      }

      .vgtools-dead-message-main {
        margin: 0;
        font-size: clamp(20px, 3.1vw, 42px);
        line-height: 1.08;
        font-weight: 500;
        letter-spacing: 0;
      }

      .vgtools-dead-message-signature {
        margin-top: 18px;
        font-size: clamp(16px, 1.7vw, 24px);
        color: rgba(255, 255, 255, 0.48);
      }

      @keyframes vgtoolsDeadMessageFade {
        from {
          opacity: 0;
          filter: blur(3px);
        }
        to {
          opacity: 1;
          filter: blur(0);
        }
      }

      @keyframes vgtoolsBackgroundFall {
        0% {
          transform: translate3d(0, 0, 0);
          filter: blur(0);
          opacity: 1;
        }
        100% {
          transform: translate3d(0, 190vh, 0);
          filter: blur(1.2px);
          opacity: 1;
        }
      }

      @keyframes vgtoolsGravityFall {
        0% {
          transform: translate3d(0, 0, 0) rotate(0deg);
          opacity: 1;
          filter: blur(0);
        }
        100% {
          transform: translate3d(var(--dx), var(--fall), 0) rotate(var(--rot));
          opacity: 1;
          filter: blur(0.45px);
        }
      }

      @keyframes vgtoolsLetterFall {
        0% {
          transform: translate3d(0, 0, 0) rotate(0deg);
          opacity: 1;
          filter: blur(0);
        }
        100% {
          transform: translate3d(var(--letter-dx), var(--letter-fall), 0) rotate(var(--letter-rot));
          opacity: 1;
          filter: blur(0.25px);
        }
      }
    `;
    document.head.appendChild(style);
  };

  const ensureDeadMessage = () => {
    if (!document.body || document.querySelector('.vgtools-dead-message')) return;
    const message = document.createElement('div');
    message.className = 'vgtools-dead-message';
    message.setAttribute('aria-live', 'polite');
    message.innerHTML = `
      <div class="vgtools-dead-message-inner">
        <p class="vgtools-dead-message-main">VGTools is officially dead, sorry guys</p>
        <div class="vgtools-dead-message-signature">E</div>
      </div>
    `;
    document.body.prepend(message);
  };

  const splitTextElement = (element) => {
    if (!element || element.dataset.gravitySplit === 'true') return;
    const text = element.textContent || '';
    if (!text.trim()) return;

    element.textContent = '';
    [...text].forEach((char, index) => {
      const span = document.createElement('span');
      span.className = 'vgtools-gravity-letter';
      span.textContent = char;
      const seed = index + text.length * 17 + element.getBoundingClientRect().left;
      span.style.setProperty('--letter-dx', `${-110 + pseudoRandom(seed) * 220}px`);
      span.style.setProperty('--letter-fall', `${window.innerHeight + 760 + pseudoRandom(seed + 1) * 520}px`);
      span.style.setProperty('--letter-rot', `${-220 + pseudoRandom(seed + 2) * 440}deg`);
      span.style.setProperty('--letter-duration', `${2550 + pseudoRandom(seed + 3) * 180}ms`);
      span.style.setProperty('--letter-delay', `${pseudoRandom(seed + 4) * 28}ms`);
      element.appendChild(span);
    });
    element.dataset.gravitySplit = 'true';
  };

  const prepareGravityText = () => {
    document.querySelectorAll([
      'header.panel h1',
      'header.panel .sub',
    ].join(',')).forEach(splitTextElement);
  };

  const prepareCardImages = () => {
    document.querySelectorAll('.app-card').forEach((card, index) => {
      if (card.querySelector(':scope > .vgtools-card-image-piece')) return;
      const image = document.createElement('div');
      const rect = card.getBoundingClientRect();
      const seed = index * 131 + Math.round(rect.left + rect.top);
      const direction = pseudoRandom(seed) > 0.5 ? 1 : -1;

      image.className = 'vgtools-card-image-piece';
      image.style.setProperty('--image-dx', `${direction * (45 + pseudoRandom(seed + 1) * 170)}px`);
      image.style.setProperty('--image-fall', `${window.innerHeight - rect.top + rect.height + 220 + pseudoRandom(seed + 2) * 380}px`);
      image.style.setProperty('--image-rot', `${direction * (28 + pseudoRandom(seed + 3) * 124)}deg`);
      image.style.setProperty('--image-duration', `${1900 + pseudoRandom(seed + 4) * 950}ms`);
      image.style.setProperty('--image-delay', `${pseudoRandom(seed + 5) * 120}ms`);
      card.classList.add('vgtools-has-image-piece');
      card.prepend(image);
    });
  };

  const prepareGravityItems = () => {
    const targets = document.querySelectorAll([
      'header.panel',
      '.search-container',
      '.theme-toggle',
      '#theme-picker-btn',
      '#visitor-badge-container',
      '.app-card',
    ].join(','));

    targets.forEach((element, index) => {
      const rect = element.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2 || rect.bottom < 0 || rect.top > window.innerHeight) return;
      const seed = index * 97 + Math.round(rect.left + rect.top);
      const topBias = 1 - Math.min(1, Math.max(0, rect.top / Math.max(1, window.innerHeight)));
      const direction = pseudoRandom(seed) > 0.5 ? 1 : -1;
      const dx = direction * (18 + pseudoRandom(seed + 1) * 150);
      const fall = window.innerHeight - rect.top + rect.height + 760 + pseudoRandom(seed + 2) * 520;
      const rot = direction * (5 + pseudoRandom(seed + 3) * 24);
      const duration = 2550 + pseudoRandom(seed + 4) * 180 - topBias * 40;
      const delay = pseudoRandom(seed + 5) * 18;

      element.classList.add('vgtools-gravity-item');
      element.style.setProperty('--dx', `${dx}px`);
      element.style.setProperty('--fall', `${fall}px`);
      element.style.setProperty('--rot', `${rot}deg`);
      element.style.setProperty('--duration', `${Math.max(2400, duration)}ms`);
      element.style.setProperty('--delay', `${delay}ms`);
      element.style.setProperty('--origin-x', `${20 + pseudoRandom(seed + 6) * 60}%`);
      element.style.setProperty('--origin-y', `${20 + pseudoRandom(seed + 7) * 60}%`);
    });
  };

  const startGravity = () => {
    if (gravityStarted || !document.body || !document.querySelector('.container')) return;
    gravityStarted = true;
    try {
      localStorage.setItem('vgtools_dead', '1');
    } catch (e) {}

    installGravityStyles();
    ensureDeadMessage();
    prepareGravityText();
    prepareCardImages();
    prepareGravityItems();
    void document.body.offsetHeight;
    document.body.classList.add('vgtools-gravity-active');

    window.setTimeout(() => {
      document.body.classList.add('vgtools-dead');
      html.dataset.isDead = 'true';
    }, 4300);
  };

  const stop = (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
  };

  [
    'submit',
    'input',
    'change',
    'paste',
    'drop',
    'dragover',
    'dragenter',
    'dragstart',
    'keydown',
    'keyup',
    'pointerdown',
    'mousedown',
    'touchstart',
    'click',
  ].forEach((type) => document.addEventListener(type, stop, true));

  if (!isAlreadyDead) {
    window.addEventListener('pointerdown', startGravity, { capture: true, once: true });
  }

  const disableControls = () => {
    document.querySelectorAll([
      '#splash-screen',
      '#wiki-overlay',
      '#feedback-overlay',
      '#theme-picker-overlay',
      '#ambiguity-popup-overlay',
      '#dialog-overlay',
      '.splash-overlay',
      '.welcome-overlay',
      '.popup-overlay',
      '.modal-overlay',
      '.theme-picker-overlay',
      '.feedback-overlay',
      '.wiki-overlay',
    ].join(',')).forEach((overlay) => {
      overlay.classList.add('hidden');
      overlay.classList.remove('show', 'active', 'visible', 'open');
      overlay.setAttribute('aria-hidden', 'true');
      overlay.style.setProperty('display', 'none', 'important');
      overlay.style.setProperty('pointer-events', 'none', 'important');
    });

    document.querySelectorAll('form').forEach((form) => {
      form.setAttribute('data-static-shell-disabled', 'true');
      form.removeAttribute('action');
      form.setAttribute('aria-disabled', 'true');
    });

    document.querySelectorAll('input, textarea, select, button').forEach((control) => {
      control.setAttribute('aria-disabled', 'true');
      if (control.type === 'file') control.disabled = true;
      if (control.tagName === 'BUTTON') control.type = 'button';
    });

    document.querySelectorAll('a[href], a[download]').forEach((anchor) => {
      anchor.dataset.staticShellHref = anchor.getAttribute('href') || '';
      anchor.removeAttribute('download');
      anchor.removeAttribute('target');
      anchor.removeAttribute('href');
      anchor.setAttribute('aria-disabled', 'true');
    });

    document.querySelectorAll('#visitor-badge, #visitor-badge-container').forEach((badge) => {
      badge.removeAttribute('href');
      badge.removeAttribute('target');
      badge.textContent = badge.textContent.trim() || 'Visitors';
      badge.setAttribute('aria-disabled', 'true');
    });
  };

  const blockBrowserApis = () => {
    window.open = noop;
    window.print = noop;
    window.fetch = blockedPromise;
    window.Worker = function StaticShellWorker() {
      throw new Error('Static shell: workers disabled');
    };
    window.XMLHttpRequest = function StaticShellXHR() {
      throw new Error('Static shell: network disabled');
    };

    if (navigator.clipboard) {
      navigator.clipboard.write = blockedPromise;
      navigator.clipboard.writeText = blockedPromise;
      navigator.clipboard.read = blockedPromise;
      navigator.clipboard.readText = blockedPromise;
    }

    if (navigator.share) {
      navigator.share = blockedPromise;
    }

    if (navigator.serviceWorker && navigator.serviceWorker.getRegistrations) {
      navigator.serviceWorker.getRegistrations()
        .then((registrations) => registrations.forEach((registration) => registration.unregister()))
        .catch(noop);
    }
  };

  const boot = () => {
    ensureDeadMessage();
    disableControls();
    if (!isAlreadyDead) {
      prepareCardImages();
      prepareGravityText();
    }
  };

  blockBrowserApis();
  installGravityStyles();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
  window.addEventListener('load', boot, { once: true });
})();
