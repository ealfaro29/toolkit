(() => {
  const STORAGE_KEY = 'vgtools-visual-theme';
  const STYLE_ID = 'vgtools-visual-theme-overrides';

  const THEMES = {
    comicbook: {
      light: 'Comicbook_light.png',
      dark: 'Comicbook_dark.png',
      fallback: 'Comicbook.png',
    },
    glassui: {
      light: 'glass_light.png',
      dark: 'glass_dark.png',
      fallback: 'glass.png',
    },
  };

  const getCurrentTheme = () => {
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    return Object.prototype.hasOwnProperty.call(THEMES, savedTheme) ? savedTheme : 'comicbook';
  };

  const getCurrentMode = () => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');

  const getAssetFile = (theme, mode) => {
    const themeAssets = THEMES[theme] || THEMES.comicbook;
    return themeAssets[mode] || themeAssets.fallback;
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
html[data-visual-theme="glassui"] {
  --accent-color: #5b7cfa !important;
  --accent-color-tint: rgba(91, 124, 250, 0.16) !important;
  --accent-yellow: #a56dff !important;
}

html[data-visual-theme="glassui"] header.panel,
html[data-visual-theme="glassui"] .splash-content,
html[data-visual-theme="glassui"] .wiki-modal-content {
  border-color: rgba(120, 136, 255, 0.35) !important;
  box-shadow: 0 10px 34px rgba(44, 68, 170, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.85) !important;
}

html[data-visual-theme="glassui"] button,
html[data-visual-theme="glassui"] .btn {
  background: linear-gradient(135deg, #6f7cff 0%, #8d66ff 100%) !important;
  border-color: rgba(80, 72, 190, 0.45) !important;
  color: #ffffff !important;
}

html[data-visual-theme="glassui"] input:focus,
html[data-visual-theme="glassui"] select:focus,
html[data-visual-theme="glassui"] textarea:focus {
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

  const applyVisualThemeState = () => {
    const theme = getCurrentTheme();
    const mode = getCurrentMode();
    const assetFile = getAssetFile(theme, mode);

    document.documentElement.dataset.visualTheme = theme;
    document.documentElement.dataset.visualThemeAsset = assetFile;

    ensureThemeStyle(theme);
    patchTree(document.documentElement, assetFile);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyVisualThemeState, { once: true });
  } else {
    applyVisualThemeState();
  }

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        applyVisualThemeState();
        continue;
      }

      if (mutation.type === 'attributes' && mutation.target && mutation.target.nodeType === 1) {
        if (mutation.attributeName === 'data-theme' && mutation.target === document.documentElement) {
          applyVisualThemeState();
          continue;
        }
        const theme = getCurrentTheme();
        const mode = getCurrentMode();
        const assetFile = getAssetFile(theme, mode);
        patchElement(mutation.target, assetFile);
      }
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src', 'srcset', 'style', 'data-theme'],
  });
})();
