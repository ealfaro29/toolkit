(() => {
  const STORAGE_KEY = 'vgtools-visual-theme';
  const STYLE_ID = 'vgtools-visual-theme-overrides';
  const HEADER_STYLE_ID = 'vgtools-theme-header-image-style';
  const PATTERN_STYLE_ID = 'vgtools-theme-pattern-style';
  const RETURN_STYLE_ID = 'vgtools-theme-return-transition-style';

  const THEMES = {
    comicbook: 'Comicbook.png',
    glassui: 'glass.png',
  };
  const TOOL_KEY_MAP = {
    palettes: 'colors',
  };

  const getCurrentTheme = () => {
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    return Object.prototype.hasOwnProperty.call(THEMES, savedTheme) ? savedTheme : 'comicbook';
  };

  const getAssetFile = (theme) => {
    return THEMES[theme] || THEMES.comicbook;
  };

  const getToolKeyFromPath = () => {
    const segments = window.location.pathname.split('/').filter(Boolean);
    if (segments.length === 0) return null;

    const toolSegment = segments[segments.length - 1] === 'index.html'
      ? segments[segments.length - 2]
      : segments[segments.length - 1];

    if (!toolSegment) return null;
    return TOOL_KEY_MAP[toolSegment] || toolSegment;
  };

  const ensureHeaderImageStyle = () => {
    let headerStyle = document.getElementById(HEADER_STYLE_ID);
    if (headerStyle) return;

    headerStyle = document.createElement('style');
    headerStyle.id = HEADER_STYLE_ID;
    headerStyle.textContent = `
html[data-visual-theme] header.panel::before {
  background-image: var(--tool-theme-header-image) !important;
  background-size: cover !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
}
`;
    document.head.appendChild(headerStyle);
  };

  const ensurePatternStyle = () => {
    let patternStyle = document.getElementById(PATTERN_STYLE_ID);
    if (patternStyle) return;

    patternStyle = document.createElement('style');
    patternStyle.id = PATTERN_STYLE_ID;
    patternStyle.textContent = `
html[data-visual-theme] body::before {
  background-image: var(--tool-theme-pattern-image) !important;
}
`;
    document.head.appendChild(patternStyle);
  };

  const ensureReturnTransitionStyle = () => {
    let returnStyle = document.getElementById(RETURN_STYLE_ID);
    if (returnStyle) return;

    returnStyle = document.createElement('style');
    returnStyle.id = RETURN_STYLE_ID;
    returnStyle.textContent = `
.theme-return-overlay {
  position: fixed;
  inset: 0;
  z-index: 220000;
  pointer-events: none;
  opacity: 0;
}

.theme-return-overlay.comic {
  background:
    radial-gradient(circle at 50% 50%, rgba(247, 207, 39, 0.82) 0%, rgba(231, 47, 47, 0.60) 36%, rgba(0, 0, 0, 0) 72%),
    repeating-radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0.18) 0 2px, transparent 2px 10px);
  mix-blend-mode: multiply;
}

.theme-return-overlay.comic::after {
  content: 'HOME!';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) rotate(-8deg) scale(0.72);
  font-family: "Bangers", "Impact", sans-serif;
  font-size: clamp(56px, 9vw, 128px);
  color: #f7cf27;
  -webkit-text-stroke: 3px #111111;
  text-shadow: 6px 6px 0 rgba(17, 17, 17, 0.42);
  opacity: 0;
}

.theme-return-overlay.comic.animate {
  animation: themeReturnComic 860ms cubic-bezier(0.18, 0.9, 0.25, 1) forwards;
}

.theme-return-overlay.comic.animate::after {
  animation: themeReturnComicText 760ms ease-out forwards;
}

@keyframes themeReturnComic {
  0% { opacity: 0; transform: scale(0.86); }
  30% { opacity: 1; }
  100% { opacity: 0; transform: scale(1.2); }
}

@keyframes themeReturnComicText {
  0% { opacity: 0; transform: translate(-50%, -50%) rotate(-8deg) scale(0.64); }
  30% { opacity: 1; transform: translate(-50%, -50%) rotate(-3deg) scale(1.06); }
  100% { opacity: 0; transform: translate(-50%, -50%) rotate(-1deg) scale(1.12); }
}

.theme-return-overlay.glass {
  background: linear-gradient(120deg,
    rgba(190, 205, 255, 0.00) 10%,
    rgba(188, 166, 255, 0.30) 34%,
    rgba(255, 255, 255, 0.46) 50%,
    rgba(164, 182, 255, 0.30) 64%,
    rgba(190, 205, 255, 0.00) 90%);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transform: translateX(-30%) skewX(-6deg);
}

.theme-return-overlay.glass.animate {
  animation: themeReturnGlass 920ms cubic-bezier(0.22, 0.75, 0.28, 1) forwards;
}

@keyframes themeReturnGlass {
  0% { opacity: 0; transform: translateX(-30%) skewX(-6deg); }
  30% { opacity: 0.78; }
  100% { opacity: 0; transform: translateX(34%) skewX(-6deg); }
}
`;
    document.head.appendChild(returnStyle);
  };

  const bindBackToHubTransition = (theme) => {
    if (window.__VGTOOLS_BACK_TRANSITION_BOUND__) return;
    window.__VGTOOLS_BACK_TRANSITION_BOUND__ = true;
    ensureReturnTransitionStyle();

    document.addEventListener('click', (e) => {
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const link = e.target.closest('a.back-to-home, a[href="../index.html"], a[href="../"]');
      if (!link) return;
      if (link.target === '_blank' || link.hasAttribute('download')) return;

      const href = link.getAttribute('href') || '../index.html';
      e.preventDefault();

      const currentTheme = document.documentElement.dataset.visualTheme || theme || 'comicbook';
      const overlay = document.createElement('div');
      overlay.className = `theme-return-overlay ${currentTheme === 'comicbook' ? 'comic' : 'glass'}`;
      document.body.appendChild(overlay);

      requestAnimationFrame(() => {
        overlay.classList.add('animate');
      });

      setTimeout(() => {
        window.location.href = href;
      }, currentTheme === 'comicbook' ? 840 : 900);
    }, true);
  };

  const ensureThemeStyle = (theme) => {
    if (theme === 'comicbook' && !document.getElementById('vgtools-comicbook-font')) {
      const fontLink = document.createElement('link');
      fontLink.id = 'vgtools-comicbook-font';
      fontLink.rel = 'stylesheet';
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Bangers&display=swap';
      document.head.appendChild(fontLink);
    }

    let styleEl = document.getElementById(STYLE_ID);
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = STYLE_ID;
      document.head.appendChild(styleEl);
    }

    if (theme === 'glassui') {
      styleEl.textContent = `
html[data-theme="light"][data-visual-theme="glassui"] {
  --accent-color: #7c95ff !important;
  --accent-color-tint: rgba(124, 149, 255, 0.15) !important;
  --accent-yellow: #b48cff !important;
}

html[data-theme="dark"][data-visual-theme="glassui"] {
  --accent-color: #5b7cfa !important;
  --accent-color-tint: rgba(91, 124, 250, 0.16) !important;
  --accent-yellow: #a56dff !important;
}

html[data-theme="light"][data-visual-theme="glassui"] header.panel,
html[data-theme="light"][data-visual-theme="glassui"] .splash-content,
html[data-theme="light"][data-visual-theme="glassui"] .wiki-modal-content {
  border-color: rgba(148, 166, 255, 0.4) !important;
  box-shadow: 0 10px 30px rgba(106, 129, 236, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.92) !important;
}

html[data-theme="light"][data-visual-theme="glassui"] .panel,
html[data-theme="light"][data-visual-theme="glassui"] header.panel,
html[data-theme="light"][data-visual-theme="glassui"] aside.panel,
html[data-theme="light"][data-visual-theme="glassui"] main.panel,
html[data-theme="light"][data-visual-theme="glassui"] .splash-content,
html[data-theme="light"][data-visual-theme="glassui"] .wiki-modal-content,
html[data-theme="light"][data-visual-theme="glassui"] .modal-content,
html[data-theme="light"][data-visual-theme="glassui"] .dialog-content.panel {
  color: #1f2937 !important;
}

html[data-theme="light"][data-visual-theme="glassui"] h1,
html[data-theme="light"][data-visual-theme="glassui"] h2,
html[data-theme="light"][data-visual-theme="glassui"] h3,
html[data-theme="light"][data-visual-theme="glassui"] p,
html[data-theme="light"][data-visual-theme="glassui"] label,
html[data-theme="light"][data-visual-theme="glassui"] .sub,
html[data-theme="light"][data-visual-theme="glassui"] .description,
html[data-theme="light"][data-visual-theme="glassui"] .wiki-body {
  color: #1f2937 !important;
}

html[data-theme="dark"][data-visual-theme="glassui"] header.panel,
html[data-theme="dark"][data-visual-theme="glassui"] .splash-content,
html[data-theme="dark"][data-visual-theme="glassui"] .wiki-modal-content {
  border-color: rgba(120, 136, 255, 0.35) !important;
  box-shadow: 0 10px 34px rgba(44, 68, 170, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.85) !important;
}

html[data-theme="light"][data-visual-theme="glassui"] button,
html[data-theme="light"][data-visual-theme="glassui"] .btn {
  background: linear-gradient(135deg, #8ea3ff 0%, #b28dff 100%) !important;
  border-color: rgba(124, 112, 222, 0.35) !important;
  color: #ffffff !important;
}

html[data-theme="dark"][data-visual-theme="glassui"] button,
html[data-theme="dark"][data-visual-theme="glassui"] .btn {
  background: linear-gradient(135deg, #6f7cff 0%, #8d66ff 100%) !important;
  border-color: rgba(80, 72, 190, 0.45) !important;
  color: #ffffff !important;
}

html[data-theme="light"][data-visual-theme="glassui"] input:focus,
html[data-theme="light"][data-visual-theme="glassui"] select:focus,
html[data-theme="light"][data-visual-theme="glassui"] textarea:focus {
  border-color: #8ea3ff !important;
  box-shadow: 0 0 0 3px rgba(142, 163, 255, 0.2) !important;
}

html[data-theme="light"][data-visual-theme="glassui"] input,
html[data-theme="light"][data-visual-theme="glassui"] select,
html[data-theme="light"][data-visual-theme="glassui"] textarea {
  color: #1f2937 !important;
  background: rgba(255, 255, 255, 0.85) !important;
  border-color: rgba(124, 149, 255, 0.35) !important;
}

html[data-theme="light"][data-visual-theme="glassui"] input::placeholder,
html[data-theme="light"][data-visual-theme="glassui"] textarea::placeholder {
  color: #6b7280 !important;
}

html[data-theme="dark"][data-visual-theme="glassui"] input:focus,
html[data-theme="dark"][data-visual-theme="glassui"] select:focus,
html[data-theme="dark"][data-visual-theme="glassui"] textarea:focus {
  border-color: #6f7cff !important;
  box-shadow: 0 0 0 3px rgba(111, 124, 255, 0.22) !important;
}
`;
      return;
    }

    if (theme !== 'comicbook') {
      styleEl.textContent = '';
      return;
    }

    styleEl.textContent = `
html[data-visual-theme="comicbook"] .splash-content,
html[data-visual-theme="comicbook"] .wiki-modal-content,
html[data-visual-theme="comicbook"] .modal-content,
html[data-visual-theme="comicbook"] .dialog-content.panel {
  background: #fff3d7 !important;
  border: 4px solid #111111 !important;
  border-radius: 0 !important;
  box-shadow: 8px 8px 0 #111111 !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

html[data-visual-theme="comicbook"] .panel,
html[data-visual-theme="comicbook"] header.panel,
html[data-visual-theme="comicbook"] aside.panel,
html[data-visual-theme="comicbook"] main.panel {
  background: #fffdf3 !important;
  border: 4px solid #111111 !important;
  border-radius: 0 !important;
  box-shadow: 8px 8px 0 #111111 !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

html[data-visual-theme="comicbook"] header.panel {
  background: #f7cf27 !important;
  border: 4px solid #111111 !important;
  box-shadow: 6px 6px 0 #111111 !important;
}

html[data-visual-theme="comicbook"] header.panel::before,
html[data-visual-theme="comicbook"] aside.panel::before,
html[data-visual-theme="comicbook"] main.panel::before {
  content: none !important;
  opacity: 0 !important;
  background: none !important;
}

html[data-visual-theme="comicbook"] header.panel h1,
html[data-visual-theme="comicbook"] header.panel .sub,
html[data-visual-theme="comicbook"] header.panel .version-badge,
html[data-visual-theme="comicbook"] header.panel .badge {
  color: #111111 !important;
  text-shadow: none !important;
}

html[data-visual-theme="comicbook"] header.panel h1 {
  font-family: "Bangers", "Impact", "Arial Black", sans-serif !important;
  letter-spacing: 0.8px !important;
}

html[data-visual-theme="comicbook"] .panel-section,
html[data-visual-theme="comicbook"] .control-group,
html[data-visual-theme="comicbook"] .level-card,
html[data-visual-theme="comicbook"] .card,
html[data-visual-theme="comicbook"] .section-content,
html[data-visual-theme="comicbook"] .control-section,
html[data-visual-theme="comicbook"] .panel-section-preview,
html[data-visual-theme="comicbook"] .group,
html[data-visual-theme="comicbook"] .box,
html[data-visual-theme="comicbook"] .settings-group,
html[data-visual-theme="comicbook"] fieldset {
  background: transparent !important;
  border: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}

html[data-visual-theme="comicbook"] button,
html[data-visual-theme="comicbook"] .btn,
html[data-visual-theme="comicbook"] input,
html[data-visual-theme="comicbook"] select,
html[data-visual-theme="comicbook"] textarea {
  border-radius: 2px !important;
  border: 1px solid #1f2937 !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

html[data-visual-theme="comicbook"] button,
html[data-visual-theme="comicbook"] .btn {
  background: #f7cf27 !important;
  color: #111111 !important;
  box-shadow: 3px 3px 0 #111111 !important;
}

html[data-visual-theme="comicbook"] button:hover,
html[data-visual-theme="comicbook"] .btn:hover {
  transform: translate(-1px, -1px) !important;
}

html[data-visual-theme="comicbook"] input,
html[data-visual-theme="comicbook"] select,
html[data-visual-theme="comicbook"] textarea {
  background: #ffffff !important;
  color: #111111 !important;
  box-shadow: none !important;
  outline: none !important;
}

html[data-visual-theme="comicbook"] input[type="range"] {
  border: none !important;
  background: transparent !important;
  accent-color: #e72f2f !important;
}

html[data-visual-theme="comicbook"] .control-row,
html[data-visual-theme="comicbook"] .setting-row,
html[data-visual-theme="comicbook"] .row {
  border: none !important;
  box-shadow: none !important;
}

html[data-visual-theme="comicbook"] .panel hr,
html[data-visual-theme="comicbook"] .panel .divider,
html[data-visual-theme="comicbook"] .panel .separator {
  border-color: rgba(17, 17, 17, 0.15) !important;
  box-shadow: none !important;
}

html[data-visual-theme="comicbook"] input:focus,
html[data-visual-theme="comicbook"] select:focus,
html[data-visual-theme="comicbook"] textarea:focus {
  border-color: #e72f2f !important;
  box-shadow: 0 0 0 1px rgba(231, 47, 47, 0.2) !important;
}

html[data-visual-theme="comicbook"] .splash-image,
html[data-visual-theme="comicbook"] .splash-info {
  background: #fffdf3 !important;
  border: 3px solid #111111 !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

html[data-visual-theme="comicbook"] .splash-image img,
html[data-visual-theme="comicbook"] .wiki-modal-content img {
  border-radius: 0 !important;
  border: 3px solid #111111 !important;
  box-shadow: 6px 6px 0 #111111 !important;
  opacity: 1 !important;
}

html[data-visual-theme="comicbook"] .splash-info h2,
html[data-visual-theme="comicbook"] .wiki-modal-content h2,
html[data-visual-theme="comicbook"] .wiki-modal-content h3,
html[data-visual-theme="comicbook"] .modal-header h2 {
  font-family: "Bangers", "Impact", "Arial Black", sans-serif !important;
  letter-spacing: 0.8px !important;
  text-transform: uppercase !important;
  color: #111111 !important;
  text-shadow: none !important;
}

html[data-visual-theme="comicbook"] .splash-info .description,
html[data-visual-theme="comicbook"] .wiki-modal-content p,
html[data-visual-theme="comicbook"] .modal-body,
html[data-visual-theme="comicbook"] .wiki-body {
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, sans-serif !important;
  color: #1f2937 !important;
}

html[data-visual-theme="comicbook"] #splash-close-btn,
html[data-visual-theme="comicbook"] #wiki-close-btn,
html[data-visual-theme="comicbook"] .modal-close-btn {
  border-radius: 0 !important;
  border: 3px solid #111111 !important;
  background: #f7cf27 !important;
  color: #111111 !important;
  box-shadow: 3px 3px 0 #111111 !important;
}

html[data-theme="dark"][data-visual-theme="comicbook"] .splash-content,
html[data-theme="dark"][data-visual-theme="comicbook"] .wiki-modal-content,
html[data-theme="dark"][data-visual-theme="comicbook"] .modal-content,
html[data-theme="dark"][data-visual-theme="comicbook"] .dialog-content.panel,
html[data-theme="dark"][data-visual-theme="comicbook"] .panel,
html[data-theme="dark"][data-visual-theme="comicbook"] aside.panel,
html[data-theme="dark"][data-visual-theme="comicbook"] main.panel {
  background: #2f2f2f !important;
  border-color: #f7cf27 !important;
  color: #f7cf27 !important;
}

html[data-theme="dark"][data-visual-theme="comicbook"] header.panel {
  background: #262626 !important;
  border-color: #f7cf27 !important;
}

html[data-theme="dark"][data-visual-theme="comicbook"] header.panel h1,
html[data-theme="dark"][data-visual-theme="comicbook"] header.panel .sub,
html[data-theme="dark"][data-visual-theme="comicbook"] header.panel .version-badge,
html[data-theme="dark"][data-visual-theme="comicbook"] header.panel .badge {
  color: #f7cf27 !important;
}

html[data-theme="dark"][data-visual-theme="comicbook"] .splash-image,
html[data-theme="dark"][data-visual-theme="comicbook"] .splash-info {
  background: #3a3a3a !important;
  border-color: #f7cf27 !important;
}

html[data-theme="dark"][data-visual-theme="comicbook"] .splash-info h2,
html[data-theme="dark"][data-visual-theme="comicbook"] .wiki-modal-content h2,
html[data-theme="dark"][data-visual-theme="comicbook"] .wiki-modal-content h3,
html[data-theme="dark"][data-visual-theme="comicbook"] .modal-header h2 {
  color: #f7cf27 !important;
}

html[data-theme="dark"][data-visual-theme="comicbook"] .splash-info .description,
html[data-theme="dark"][data-visual-theme="comicbook"] .wiki-modal-content p,
html[data-theme="dark"][data-visual-theme="comicbook"] .modal-body,
html[data-theme="dark"][data-visual-theme="comicbook"] .wiki-body,
html[data-theme="dark"][data-visual-theme="comicbook"] label,
html[data-theme="dark"][data-visual-theme="comicbook"] .label {
  color: #f6e7a3 !important;
}

html[data-theme="dark"][data-visual-theme="comicbook"] input,
html[data-theme="dark"][data-visual-theme="comicbook"] select,
html[data-theme="dark"][data-visual-theme="comicbook"] textarea {
  background: #3a3a3a !important;
  color: #f7cf27 !important;
  border-color: #f7cf27 !important;
}
`;
  };

  const replaceAsset = (value, nextAssetFile) => {
    if (typeof value !== 'string' || value.length === 0) return value;
    return value.replace(/Comicbook(?:_(?:light|dark))?\.png|glass(?:_(?:light|dark))?\.png/g, nextAssetFile);
  };

  const patchElement = (el, nextAssetFile) => {
    if (!el || el.nodeType !== 1) return;

    if (el.hasAttribute('src')) {
      const src = el.getAttribute('src');
      const next = replaceAsset(src, nextAssetFile);
      if (next !== src) el.setAttribute('src', next);
    }

    if (el.hasAttribute('srcset')) {
      const srcset = el.getAttribute('srcset');
      const next = replaceAsset(srcset, nextAssetFile);
      if (next !== srcset) el.setAttribute('srcset', next);
    }

    if (el.hasAttribute('style')) {
      const style = el.getAttribute('style');
      const next = replaceAsset(style, nextAssetFile);
      if (next !== style) el.setAttribute('style', next);
    }

    if (el.tagName === 'STYLE') {
      const css = el.textContent;
      const next = replaceAsset(css, nextAssetFile);
      if (next !== css) el.textContent = next;
    }
  };

  const patchTree = (root, nextAssetFile) => {
    patchElement(root, nextAssetFile);
    if (!root || !root.querySelectorAll) return;

    root.querySelectorAll('[src],[srcset],[style],style').forEach((el) => patchElement(el, nextAssetFile));
  };

  const applyToolThemeImages = (root, theme, toolKey) => {
    if (!toolKey || !root || !root.querySelectorAll) return;
    const themedToolImage = `../Theme/${theme}/${toolKey}_${theme}.png`;

    root.querySelectorAll('.splash-image img').forEach((img) => {
      img.setAttribute('src', themedToolImage);
    });
  };

  const theme = getCurrentTheme();
  const assetFile = getAssetFile(theme);

  const applyVisualThemeState = () => {
    document.documentElement.dataset.visualTheme = theme;
    document.documentElement.dataset.visualThemeAsset = assetFile;
    const toolKey = getToolKeyFromPath();
    ensurePatternStyle();
    document.documentElement.style.setProperty('--tool-theme-pattern-image', `url('../Theme/${theme}/pattern_${theme}.jpg')`);
    if (toolKey) {
      ensureHeaderImageStyle();
      document.documentElement.style.setProperty('--tool-theme-header-image', `url('../Theme/${theme}/${toolKey}_${theme}.png')`);
    }
    ensureThemeStyle(theme);
    patchTree(document.documentElement, assetFile);
    applyToolThemeImages(document, theme, toolKey);
    bindBackToHubTransition(theme);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyVisualThemeState, { once: true });
  } else {
    applyVisualThemeState();
  }

  // Lightweight observer: patch only new/changed nodes, avoid full-tree reprocessing loops.
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node && node.nodeType === 1) {
            patchTree(node, assetFile);
            applyToolThemeImages(node, theme, getToolKeyFromPath());
          }
        });
        continue;
      }

      if (mutation.type === 'attributes' && mutation.target && mutation.target.nodeType === 1) {
        patchElement(mutation.target, assetFile);
      }
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src', 'srcset', 'style'],
  });
})();
