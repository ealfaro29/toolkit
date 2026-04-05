(() => {
  const STORAGE_KEY = 'vgtools-visual-theme';
  const STYLE_ID = 'vgtools-visual-theme-overrides';
  const HEADER_STYLE_ID = 'vgtools-theme-header-image-style';
  const PATTERN_STYLE_ID = 'vgtools-theme-pattern-style';
  const RETURN_STYLE_ID = 'vgtools-theme-return-transition-style';
  const COLOR_THEME_KEY = 'creative-toolkit-theme';
  const COLOR_THEME_LABELS = {
    light: 'L',
    dark: 'D',
    system: 'A',
  };
  const COLOR_THEME_NAMES = {
    light: 'Light',
    dark: 'Dark',
    system: 'Auto',
  };

  const THEMES = {
    comicbook: { assetFile: 'Comicbook.png', usesArtwork: true, usesPattern: true, transition: 'comic', group: 'visual' },
    glassui: { assetFile: 'glass.png', usesArtwork: true, usesPattern: true, transition: 'glass', group: 'visual' },
    minimal: { assetFile: null, usesArtwork: false, usesPattern: false, transition: 'minimal', group: 'basic' },
    emoji: { assetFile: null, usesArtwork: false, usesPattern: false, transition: 'emoji', group: 'basic' },
  };
  const LOCAL_ASSET_PATTERN = /Comicbook(?:_(?:light|dark))?\.png|glass(?:_(?:light|dark))?\.png/g;
  const SHARED_THEME_ASSET_PATTERN = /((?:\.\.\/|\.\/|\/)?Theme\/)(comicbook|glassui)\/([a-z0-9_-]+)_(comicbook|glassui)\.(png|jpg)/gi;
  const TOOL_KEY_MAP = {
    palettes: 'colors',
  };
  const EMOJI_THEME_SYMBOLS = {
    brickbuilder: ['🧱', '📐', '🏗️', '🛠️'],
    moodboards: ['🖼️', '🎨', '📌', '✨'],
    blobs: ['🫧', '💧', '🌀', '🎨'],
    jigsaws: ['🧩', '✂️', '🖼️', '🧠'],
    iconfactory: ['✳️', '🔷', '🛠️', '📦'],
    qrcodes: ['🔳', '📱', '🔗', '📡'],
    colors: ['🎨', '🌈', '🧪', '🖌️'],
    notes: ['📝', '📌', '🗂️', '💡'],
    locator: ['📍', '🗺️', '🌍', '🧭'],
    signatures: ['✍️', '🖋️', '📄', '✔️'],
    svgrecolor: ['🎨', '🔁', '🧬', '🖌️'],
    any2svg: ['🪄', '📄', '🖼️', '➡️'],
    bgremover: ['🖼️', '✂️', '💇', '🫥'],
    wordclouds: ['☁️', '🔤', '📚', '💬'],
    sankey: ['📊', '↗️', '🔀', '💧'],
    mockups: ['📱', '💻', '🖥️', '✨'],
  };

  const getCurrentTheme = () => {
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    return Object.prototype.hasOwnProperty.call(THEMES, savedTheme) ? savedTheme : 'comicbook';
  };

  const getCurrentColorTheme = () => {
    const savedTheme = localStorage.getItem(COLOR_THEME_KEY);
    return Object.prototype.hasOwnProperty.call(COLOR_THEME_LABELS, savedTheme) ? savedTheme : 'system';
  };

  const getThemeMeta = (theme) => THEMES[theme] || THEMES.comicbook;

  const getAssetFile = (theme) => {
    return getThemeMeta(theme).assetFile;
  };

  const getPatternImage = (theme) => {
    const themeMeta = getThemeMeta(theme);
    return themeMeta.usesPattern ? `../Theme/${theme}/pattern_${theme}.jpg` : 'none';
  };

  const getToolThemeImage = (theme, toolKey) => {
    if (!toolKey || !getThemeMeta(theme).usesArtwork) return null;
    return `../Theme/${theme}/${toolKey}_${theme}.png`;
  };

  const getTransitionVariant = (theme) => getThemeMeta(theme).transition || 'comic';

  const getEmojiThemeSymbols = (toolKey) => {
    return EMOJI_THEME_SYMBOLS[toolKey] || ['🎉', '✨', '🌈', '🫧'];
  };

  const buildEmojiPattern = (symbols, repeatCount = 48) => {
    return Array.from({ length: repeatCount }, (_, index) => symbols[index % symbols.length]).join('  ');
  };

  const getThemeState = () => {
    const theme = getCurrentTheme();
    const assetFile = getAssetFile(theme);
    const toolKey = getToolKeyFromPath();
    const themeMeta = getThemeMeta(theme);
    const emojiSymbols = getEmojiThemeSymbols(toolKey);

    return {
      theme,
      themeMeta,
      assetFile,
      toolKey,
      patternImage: getPatternImage(theme),
      toolThemeImage: getToolThemeImage(theme, toolKey),
      toolEmojiWallpaper: buildEmojiPattern(emojiSymbols, 96),
      toolEmojiStrip: buildEmojiPattern(emojiSymbols, 28),
      toolEmojiHero: buildEmojiPattern(emojiSymbols, 34),
      toolEmojiBurst: emojiSymbols.join('  '),
    };
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

  const normalizeThemeToggle = () => {
    const button = document.getElementById('theme-toggle');
    if (!button) return;

    const colorTheme = getCurrentColorTheme();
    const label = COLOR_THEME_LABELS[colorTheme] || COLOR_THEME_LABELS.system;
    const name = COLOR_THEME_NAMES[colorTheme] || colorTheme;

    if (button.textContent !== label) {
      button.textContent = label;
    }

    button.setAttribute('data-theme-label', colorTheme);
    button.setAttribute('title', `Color theme: ${name}`);
    button.setAttribute('aria-label', `Color theme: ${name}`);
  };

  const bindThemeToggleNormalization = () => {
    if (window.__VGTOOLS_THEME_TOGGLE_BOUND__) return;
    window.__VGTOOLS_THEME_TOGGLE_BOUND__ = true;

    const attachObserver = () => {
      const button = document.getElementById('theme-toggle');
      if (!button || button.__vgtoolsThemeToggleObserved) {
        normalizeThemeToggle();
        return;
      }

      const observer = new MutationObserver(() => {
        normalizeThemeToggle();
      });
      observer.observe(button, { childList: true, subtree: true, characterData: true });
      button.__vgtoolsThemeToggleObserved = true;
      normalizeThemeToggle();
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', attachObserver, { once: true });
    } else {
      attachObserver();
    }

    document.addEventListener('click', (event) => {
      if (!event.target.closest('#theme-toggle')) return;
      requestAnimationFrame(() => {
        normalizeThemeToggle();
      });
    }, true);

    window.addEventListener('pageshow', () => {
      requestAnimationFrame(() => {
        normalizeThemeToggle();
      });
    });

    window.addEventListener('storage', (event) => {
      if (event.key && event.key !== COLOR_THEME_KEY) return;
      requestAnimationFrame(() => {
        normalizeThemeToggle();
      });
    });
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

html[data-visual-theme]:not([data-visual-theme="emoji"]) .emoji {
  display: none !important;
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

.theme-return-overlay.minimal {
  background: rgba(255, 255, 255, 0.74);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

html[data-theme="dark"] .theme-return-overlay.minimal {
  background: rgba(0, 0, 0, 0.64);
}

.theme-return-overlay.minimal.animate {
  animation: themeReturnMinimal 620ms ease-out forwards;
}

@keyframes themeReturnMinimal {
  0% { opacity: 0; }
  24% { opacity: 1; }
  100% { opacity: 0; }
}

.theme-return-overlay.emoji {
  background: linear-gradient(135deg, rgba(255, 247, 239, 0.74) 0%, rgba(255, 224, 244, 0.48) 100%);
  backdrop-filter: blur(8px) saturate(120%);
  -webkit-backdrop-filter: blur(8px) saturate(120%);
}

html[data-theme="dark"] .theme-return-overlay.emoji {
  background: linear-gradient(135deg, rgba(31, 18, 42, 0.74) 0%, rgba(19, 22, 44, 0.58) 100%);
}

.theme-return-overlay.emoji::after {
  content: var(--tool-theme-emoji-burst, "🎉  ✨  🌈");
  position: absolute;
  inset: 12%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif;
  font-size: clamp(34px, 5vw, 78px);
  line-height: 1.35;
  letter-spacing: 12px;
  opacity: 0;
  transform: scale(0.78) rotate(-5deg);
  filter: saturate(1.12);
}

.theme-return-overlay.emoji.animate {
  animation: themeReturnEmoji 780ms ease-out forwards;
}

.theme-return-overlay.emoji.animate::after {
  animation: themeReturnEmojiText 680ms ease-out forwards;
}

@keyframes themeReturnEmoji {
  0% { opacity: 0; }
  28% { opacity: 1; }
  100% { opacity: 0; }
}

@keyframes themeReturnEmojiText {
  0% { opacity: 0; transform: scale(0.72) rotate(-8deg); }
  35% { opacity: 1; transform: scale(1.02) rotate(-2deg); }
  100% { opacity: 0; transform: scale(1.08) rotate(1deg); }
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

      const currentTheme = document.documentElement.dataset.visualTheme || getCurrentTheme();
      const transitionVariant = getTransitionVariant(currentTheme);
      const overlay = document.createElement('div');
      overlay.className = `theme-return-overlay ${transitionVariant}`;
      document.body.appendChild(overlay);

      requestAnimationFrame(() => {
        overlay.classList.add('animate');
      });

      setTimeout(() => {
        window.location.href = href;
      }, transitionVariant === 'comic' ? 840 : transitionVariant === 'glass' ? 900 : transitionVariant === 'emoji' ? 780 : 620);
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

    if (theme === 'emoji') {
      styleEl.textContent = `
html[data-theme="light"][data-visual-theme="emoji"] {
  --accent-color: #ff6b4a !important;
  --accent-color-tint: rgba(255, 107, 74, 0.12) !important;
  --accent-yellow: #ffd166 !important;
}

html[data-theme="dark"][data-visual-theme="emoji"] {
  --accent-color: #ff8fb3 !important;
  --accent-color-tint: rgba(255, 143, 179, 0.14) !important;
  --accent-yellow: #7dd3fc !important;
}

html[data-theme="light"][data-visual-theme="emoji"] body {
  background:
    radial-gradient(circle at top left, rgba(255, 211, 164, 0.22) 0%, rgba(255, 211, 164, 0) 34%),
    radial-gradient(circle at bottom right, rgba(255, 190, 231, 0.2) 0%, rgba(255, 190, 231, 0) 36%),
    #fff7f1 !important;
}

html[data-theme="dark"][data-visual-theme="emoji"] body {
  background:
    radial-gradient(circle at top left, rgba(255, 190, 98, 0.08) 0%, rgba(255, 190, 98, 0) 34%),
    radial-gradient(circle at bottom right, rgba(255, 143, 188, 0.08) 0%, rgba(255, 143, 188, 0) 36%),
    #130d19 !important;
}

html[data-visual-theme="emoji"] body::before {
  content: var(--tool-theme-emoji-wallpaper, "") !important;
  background-image: none !important;
  background: none !important;
  display: block !important;
  inset: -5% !important;
  font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif !important;
  font-size: clamp(22px, 2vw, 34px) !important;
  line-height: 1.65 !important;
  letter-spacing: 12px !important;
  word-spacing: 10px !important;
  white-space: normal !important;
  text-align: center !important;
  opacity: 0.18 !important;
  transform: rotate(-8deg) scale(1.08) !important;
  overflow: hidden !important;
}

html[data-theme="dark"][data-visual-theme="emoji"] body::before {
  opacity: 0.14 !important;
  filter: saturate(1.08) !important;
}

html[data-visual-theme="emoji"] .panel,
html[data-visual-theme="emoji"] header.panel,
html[data-visual-theme="emoji"] aside.panel,
html[data-visual-theme="emoji"] main.panel,
html[data-visual-theme="emoji"] .splash-content,
html[data-visual-theme="emoji"] .wiki-modal-content,
html[data-visual-theme="emoji"] .modal-content,
html[data-visual-theme="emoji"] .dialog-content.panel {
  border-radius: 30px !important;
  backdrop-filter: blur(18px) saturate(118%) !important;
  -webkit-backdrop-filter: blur(18px) saturate(118%) !important;
  overflow: hidden !important;
}

html[data-theme="light"][data-visual-theme="emoji"] .panel,
html[data-theme="light"][data-visual-theme="emoji"] header.panel,
html[data-theme="light"][data-visual-theme="emoji"] aside.panel,
html[data-theme="light"][data-visual-theme="emoji"] main.panel,
html[data-theme="light"][data-visual-theme="emoji"] .splash-content,
html[data-theme="light"][data-visual-theme="emoji"] .wiki-modal-content,
html[data-theme="light"][data-visual-theme="emoji"] .modal-content,
html[data-theme="light"][data-visual-theme="emoji"] .dialog-content.panel {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 247, 240, 0.72) 100%) !important;
  border: 1px solid rgba(255, 165, 108, 0.26) !important;
  box-shadow: 0 12px 30px rgba(255, 165, 108, 0.14) !important;
  color: #2d1b10 !important;
}

html[data-theme="dark"][data-visual-theme="emoji"] .panel,
html[data-theme="dark"][data-visual-theme="emoji"] header.panel,
html[data-theme="dark"][data-visual-theme="emoji"] aside.panel,
html[data-theme="dark"][data-visual-theme="emoji"] main.panel,
html[data-theme="dark"][data-visual-theme="emoji"] .splash-content,
html[data-theme="dark"][data-visual-theme="emoji"] .wiki-modal-content,
html[data-theme="dark"][data-visual-theme="emoji"] .modal-content,
html[data-theme="dark"][data-visual-theme="emoji"] .dialog-content.panel {
  background: linear-gradient(135deg, rgba(34, 24, 45, 0.84) 0%, rgba(20, 18, 39, 0.78) 100%) !important;
  border: 1px solid rgba(255, 143, 188, 0.2) !important;
  box-shadow: 0 14px 34px rgba(12, 10, 24, 0.34) !important;
  color: #fff7fb !important;
}

html[data-visual-theme="emoji"] header.panel::before,
html[data-visual-theme="emoji"] .wiki-header::before {
  content: var(--tool-theme-emoji-strip, "") !important;
  background-image: none !important;
  background: none !important;
  inset: 0 !important;
  display: block !important;
  font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif !important;
  font-size: clamp(18px, 1.7vw, 28px) !important;
  line-height: 1.6 !important;
  letter-spacing: 9px !important;
  word-spacing: 8px !important;
  white-space: normal !important;
  text-align: center !important;
  opacity: 0.28 !important;
  overflow: hidden !important;
  z-index: 0 !important;
}

html[data-theme="dark"][data-visual-theme="emoji"] header.panel::before,
html[data-theme="dark"][data-visual-theme="emoji"] .wiki-header::before {
  opacity: 0.18 !important;
}

html[data-visual-theme="emoji"] header.panel > *,
html[data-visual-theme="emoji"] .wiki-header > * {
  position: relative !important;
  z-index: 1 !important;
}

html[data-theme="light"][data-visual-theme="emoji"] header.panel h1,
html[data-theme="light"][data-visual-theme="emoji"] .sub,
html[data-theme="light"][data-visual-theme="emoji"] label,
html[data-theme="light"][data-visual-theme="emoji"] p,
html[data-theme="light"][data-visual-theme="emoji"] .description,
html[data-theme="light"][data-visual-theme="emoji"] .wiki-body,
html[data-theme="light"][data-visual-theme="emoji"] .modal-body {
  color: #2d1b10 !important;
}

html[data-theme="dark"][data-visual-theme="emoji"] header.panel h1,
html[data-theme="dark"][data-visual-theme="emoji"] .sub,
html[data-theme="dark"][data-visual-theme="emoji"] label,
html[data-theme="dark"][data-visual-theme="emoji"] p,
html[data-theme="dark"][data-visual-theme="emoji"] .description,
html[data-theme="dark"][data-visual-theme="emoji"] .wiki-body,
html[data-theme="dark"][data-visual-theme="emoji"] .modal-body {
  color: #fff7fb !important;
}

html[data-visual-theme="emoji"] .splash-image {
  position: relative !important;
  overflow: hidden !important;
}

html[data-theme="light"][data-visual-theme="emoji"] .splash-image {
  background: linear-gradient(135deg, rgba(255, 250, 244, 0.92) 0%, rgba(255, 235, 250, 0.72) 100%) !important;
}

html[data-theme="dark"][data-visual-theme="emoji"] .splash-image {
  background: linear-gradient(135deg, rgba(43, 29, 56, 0.92) 0%, rgba(27, 20, 48, 0.78) 100%) !important;
}

html[data-visual-theme="emoji"] .splash-image img {
  opacity: 0 !important;
}

html[data-visual-theme="emoji"] .splash-image::before {
  content: var(--tool-theme-emoji-hero, "") !important;
  position: absolute !important;
  inset: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 32px !important;
  font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif !important;
  font-size: clamp(34px, 4vw, 58px) !important;
  line-height: 1.5 !important;
  letter-spacing: 14px !important;
  word-spacing: 12px !important;
  white-space: normal !important;
  text-align: center !important;
  transform: rotate(-6deg) scale(1.08) !important;
  filter: saturate(1.08) !important;
}

html[data-visual-theme="emoji"] .splash-image::after {
  content: "" !important;
  position: absolute !important;
  inset: 0 !important;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0) 100%) !important;
}

html[data-visual-theme="emoji"] .splash-info {
  border: none !important;
  box-shadow: none !important;
}

html[data-theme="light"][data-visual-theme="emoji"] .splash-info {
  background: rgba(255, 255, 255, 0.54) !important;
}

html[data-theme="dark"][data-visual-theme="emoji"] .splash-info {
  background: rgba(22, 18, 39, 0.46) !important;
}

html[data-visual-theme="emoji"] .feature-item span.emoji {
  display: inline-flex !important;
}

html[data-visual-theme="emoji"] .control-group,
html[data-visual-theme="emoji"] .panel-section,
html[data-visual-theme="emoji"] .group,
html[data-visual-theme="emoji"] .box,
html[data-visual-theme="emoji"] .settings-group,
html[data-visual-theme="emoji"] fieldset,
html[data-visual-theme="emoji"] .dock,
html[data-visual-theme="emoji"] .properties-panel,
html[data-visual-theme="emoji"] .zoom-controls,
html[data-visual-theme="emoji"] .level-card,
html[data-visual-theme="emoji"] .toast {
  border-radius: 24px !important;
  box-shadow: none !important;
}

html[data-theme="light"][data-visual-theme="emoji"] .control-group,
html[data-theme="light"][data-visual-theme="emoji"] .panel-section,
html[data-theme="light"][data-visual-theme="emoji"] .group,
html[data-theme="light"][data-visual-theme="emoji"] .box,
html[data-theme="light"][data-visual-theme="emoji"] .settings-group,
html[data-theme="light"][data-visual-theme="emoji"] fieldset,
html[data-theme="light"][data-visual-theme="emoji"] .dock,
html[data-theme="light"][data-visual-theme="emoji"] .properties-panel,
html[data-theme="light"][data-visual-theme="emoji"] .zoom-controls,
html[data-theme="light"][data-visual-theme="emoji"] .level-card,
html[data-theme="light"][data-visual-theme="emoji"] .toast {
  background: rgba(255, 255, 255, 0.58) !important;
  border: 1px solid rgba(255, 165, 108, 0.22) !important;
}

html[data-theme="dark"][data-visual-theme="emoji"] .control-group,
html[data-theme="dark"][data-visual-theme="emoji"] .panel-section,
html[data-theme="dark"][data-visual-theme="emoji"] .group,
html[data-theme="dark"][data-visual-theme="emoji"] .box,
html[data-theme="dark"][data-visual-theme="emoji"] .settings-group,
html[data-theme="dark"][data-visual-theme="emoji"] fieldset,
html[data-theme="dark"][data-visual-theme="emoji"] .dock,
html[data-theme="dark"][data-visual-theme="emoji"] .properties-panel,
html[data-theme="dark"][data-visual-theme="emoji"] .zoom-controls,
html[data-theme="dark"][data-visual-theme="emoji"] .level-card,
html[data-theme="dark"][data-visual-theme="emoji"] .toast {
  background: rgba(43, 29, 56, 0.54) !important;
  border: 1px solid rgba(255, 143, 188, 0.18) !important;
}

html[data-visual-theme="emoji"] button,
html[data-visual-theme="emoji"] .btn,
html[data-visual-theme="emoji"] input,
html[data-visual-theme="emoji"] select,
html[data-visual-theme="emoji"] textarea,
html[data-visual-theme="emoji"] .back-to-home,
html[data-visual-theme="emoji"] #wiki-open-btn,
html[data-visual-theme="emoji"] #theme-toggle,
html[data-visual-theme="emoji"] #splash-close-btn,
html[data-visual-theme="emoji"] #wiki-close-btn,
html[data-visual-theme="emoji"] .modal-close-btn {
  border-radius: 999px !important;
  box-shadow: none !important;
}

html[data-theme="light"][data-visual-theme="emoji"] button,
html[data-theme="light"][data-visual-theme="emoji"] .btn,
html[data-theme="light"][data-visual-theme="emoji"] input,
html[data-theme="light"][data-visual-theme="emoji"] select,
html[data-theme="light"][data-visual-theme="emoji"] textarea,
html[data-theme="light"][data-visual-theme="emoji"] .back-to-home,
html[data-theme="light"][data-visual-theme="emoji"] #wiki-open-btn,
html[data-theme="light"][data-visual-theme="emoji"] #theme-toggle,
html[data-theme="light"][data-visual-theme="emoji"] #splash-close-btn,
html[data-theme="light"][data-visual-theme="emoji"] #wiki-close-btn,
html[data-theme="light"][data-visual-theme="emoji"] .modal-close-btn {
  background: rgba(255, 255, 255, 0.84) !important;
  border: 1px solid rgba(255, 165, 108, 0.22) !important;
  color: #2d1b10 !important;
}

html[data-theme="dark"][data-visual-theme="emoji"] button,
html[data-theme="dark"][data-visual-theme="emoji"] .btn,
html[data-theme="dark"][data-visual-theme="emoji"] input,
html[data-theme="dark"][data-visual-theme="emoji"] select,
html[data-theme="dark"][data-visual-theme="emoji"] textarea,
html[data-theme="dark"][data-visual-theme="emoji"] .back-to-home,
html[data-theme="dark"][data-visual-theme="emoji"] #wiki-open-btn,
html[data-theme="dark"][data-visual-theme="emoji"] #theme-toggle,
html[data-theme="dark"][data-visual-theme="emoji"] #splash-close-btn,
html[data-theme="dark"][data-visual-theme="emoji"] #wiki-close-btn,
html[data-theme="dark"][data-visual-theme="emoji"] .modal-close-btn {
  background: rgba(43, 29, 56, 0.82) !important;
  border: 1px solid rgba(255, 143, 188, 0.18) !important;
  color: #fff7fb !important;
}

html[data-theme="light"][data-visual-theme="emoji"] .btn {
  background: linear-gradient(135deg, #ff9f68 0%, #ffd166 100%) !important;
  color: #43271b !important;
}

html[data-theme="dark"][data-visual-theme="emoji"] .btn {
  background: linear-gradient(135deg, #ff8fb3 0%, #7dd3fc 100%) !important;
  color: #25172f !important;
}

html[data-visual-theme="emoji"] .version-badge,
html[data-visual-theme="emoji"] .badge {
  border-radius: 999px !important;
}

html[data-theme="light"][data-visual-theme="emoji"] .version-badge,
html[data-theme="light"][data-visual-theme="emoji"] .badge {
  background: rgba(255, 255, 255, 0.78) !important;
  border: 1px solid rgba(255, 165, 108, 0.2) !important;
  color: #43271b !important;
}

html[data-theme="dark"][data-visual-theme="emoji"] .version-badge,
html[data-theme="dark"][data-visual-theme="emoji"] .badge {
  background: rgba(43, 29, 56, 0.78) !important;
  border: 1px solid rgba(255, 143, 188, 0.18) !important;
  color: #fff7fb !important;
}
`;
      return;
    }

    if (theme === 'minimal') {
      styleEl.textContent = `
html[data-theme="light"][data-visual-theme="minimal"] {
  --accent-color: #111111 !important;
  --accent-color-tint: rgba(17, 17, 17, 0.08) !important;
  --accent-yellow: #111111 !important;
}

html[data-theme="dark"][data-visual-theme="minimal"] {
  --accent-color: #f5f5f7 !important;
  --accent-color-tint: rgba(245, 245, 247, 0.12) !important;
  --accent-yellow: #f5f5f7 !important;
}

html[data-visual-theme="minimal"] body::before,
html[data-visual-theme="minimal"] header.panel::before,
html[data-visual-theme="minimal"] .wiki-header::before {
  content: none !important;
  background-image: none !important;
  opacity: 0 !important;
}

html[data-theme="light"][data-visual-theme="minimal"] body {
  background: #f5f5f7 !important;
}

html[data-theme="dark"][data-visual-theme="minimal"] body {
  background: #000000 !important;
}

html[data-visual-theme="minimal"] .panel,
html[data-visual-theme="minimal"] header.panel,
html[data-visual-theme="minimal"] aside.panel,
html[data-visual-theme="minimal"] main.panel,
html[data-visual-theme="minimal"] .splash-content,
html[data-visual-theme="minimal"] .wiki-modal-content,
html[data-visual-theme="minimal"] .modal-content,
html[data-visual-theme="minimal"] .dialog-content.panel {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  border-radius: 28px !important;
  box-shadow: none !important;
}

html[data-theme="light"][data-visual-theme="minimal"] .panel,
html[data-theme="light"][data-visual-theme="minimal"] header.panel,
html[data-theme="light"][data-visual-theme="minimal"] aside.panel,
html[data-theme="light"][data-visual-theme="minimal"] main.panel,
html[data-theme="light"][data-visual-theme="minimal"] .splash-content,
html[data-theme="light"][data-visual-theme="minimal"] .wiki-modal-content,
html[data-theme="light"][data-visual-theme="minimal"] .modal-content,
html[data-theme="light"][data-visual-theme="minimal"] .dialog-content.panel {
  background: #ffffff !important;
  border: 1px solid rgba(17, 17, 17, 0.08) !important;
  color: #111111 !important;
}

html[data-theme="dark"][data-visual-theme="minimal"] .panel,
html[data-theme="dark"][data-visual-theme="minimal"] header.panel,
html[data-theme="dark"][data-visual-theme="minimal"] aside.panel,
html[data-theme="dark"][data-visual-theme="minimal"] main.panel,
html[data-theme="dark"][data-visual-theme="minimal"] .splash-content,
html[data-theme="dark"][data-visual-theme="minimal"] .wiki-modal-content,
html[data-theme="dark"][data-visual-theme="minimal"] .modal-content,
html[data-theme="dark"][data-visual-theme="minimal"] .dialog-content.panel {
  background: #0b0b0f !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  color: #f5f5f7 !important;
}

html[data-visual-theme="minimal"] header.panel h1,
html[data-visual-theme="minimal"] .splash-info h2,
html[data-visual-theme="minimal"] .wiki-header h3,
html[data-visual-theme="minimal"] .modal-header h2 {
  text-shadow: none !important;
  letter-spacing: -0.03em !important;
}

html[data-theme="light"][data-visual-theme="minimal"] header.panel h1,
html[data-theme="light"][data-visual-theme="minimal"] .sub,
html[data-theme="light"][data-visual-theme="minimal"] label,
html[data-theme="light"][data-visual-theme="minimal"] p,
html[data-theme="light"][data-visual-theme="minimal"] .description,
html[data-theme="light"][data-visual-theme="minimal"] .wiki-body,
html[data-theme="light"][data-visual-theme="minimal"] .modal-body {
  color: #111111 !important;
}

html[data-theme="dark"][data-visual-theme="minimal"] header.panel h1,
html[data-theme="dark"][data-visual-theme="minimal"] .sub,
html[data-theme="dark"][data-visual-theme="minimal"] label,
html[data-theme="dark"][data-visual-theme="minimal"] p,
html[data-theme="dark"][data-visual-theme="minimal"] .description,
html[data-theme="dark"][data-visual-theme="minimal"] .wiki-body,
html[data-theme="dark"][data-visual-theme="minimal"] .modal-body {
  color: #f5f5f7 !important;
}

html[data-visual-theme="minimal"] .splash-content {
  display: block !important;
  width: min(560px, calc(100vw - 32px)) !important;
  height: auto !important;
  max-height: min(90vh, 760px) !important;
  padding: 28px !important;
}

html[data-visual-theme="minimal"] .splash-image {
  display: none !important;
}

html[data-visual-theme="minimal"] .splash-info {
  flex: 1 1 auto !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 20px !important;
  padding: 0 !important;
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
}

html[data-visual-theme="minimal"] .splash-info h2 {
  font-size: clamp(32px, 5vw, 48px) !important;
  line-height: 1.05 !important;
  margin: 0 !important;
}

html[data-theme="light"][data-visual-theme="minimal"] .splash-info .description {
  color: #6b7280 !important;
}

html[data-theme="dark"][data-visual-theme="minimal"] .splash-info .description {
  color: #a1a1aa !important;
}

html[data-visual-theme="minimal"] .features {
  gap: 0 !important;
  margin-top: 28px !important;
}

html[data-visual-theme="minimal"] .feature-item {
  padding: 12px 0 !important;
  border-top: 1px solid rgba(127, 127, 127, 0.18) !important;
}

html[data-visual-theme="minimal"] .feature-item:last-child {
  border-bottom: 1px solid rgba(127, 127, 127, 0.18) !important;
}

html[data-visual-theme="minimal"] .wiki-header {
  height: auto !important;
  min-height: 76px !important;
  background: transparent !important;
  border-bottom: 1px solid rgba(127, 127, 127, 0.18) !important;
}

html[data-visual-theme="minimal"] .control-group,
html[data-visual-theme="minimal"] .panel-section,
html[data-visual-theme="minimal"] .group,
html[data-visual-theme="minimal"] .box,
html[data-visual-theme="minimal"] .settings-group,
html[data-visual-theme="minimal"] fieldset,
html[data-visual-theme="minimal"] .dock,
html[data-visual-theme="minimal"] .properties-panel,
html[data-visual-theme="minimal"] .zoom-controls,
html[data-visual-theme="minimal"] .level-card,
html[data-visual-theme="minimal"] .toast {
  background: transparent !important;
  box-shadow: none !important;
  border-radius: 20px !important;
}

html[data-theme="light"][data-visual-theme="minimal"] .control-group,
html[data-theme="light"][data-visual-theme="minimal"] .panel-section,
html[data-theme="light"][data-visual-theme="minimal"] .group,
html[data-theme="light"][data-visual-theme="minimal"] .box,
html[data-theme="light"][data-visual-theme="minimal"] .settings-group,
html[data-theme="light"][data-visual-theme="minimal"] fieldset,
html[data-theme="light"][data-visual-theme="minimal"] .dock,
html[data-theme="light"][data-visual-theme="minimal"] .properties-panel,
html[data-theme="light"][data-visual-theme="minimal"] .zoom-controls,
html[data-theme="light"][data-visual-theme="minimal"] .level-card,
html[data-theme="light"][data-visual-theme="minimal"] .toast {
  border: 1px solid rgba(17, 17, 17, 0.08) !important;
}

html[data-theme="dark"][data-visual-theme="minimal"] .control-group,
html[data-theme="dark"][data-visual-theme="minimal"] .panel-section,
html[data-theme="dark"][data-visual-theme="minimal"] .group,
html[data-theme="dark"][data-visual-theme="minimal"] .box,
html[data-theme="dark"][data-visual-theme="minimal"] .settings-group,
html[data-theme="dark"][data-visual-theme="minimal"] fieldset,
html[data-theme="dark"][data-visual-theme="minimal"] .dock,
html[data-theme="dark"][data-visual-theme="minimal"] .properties-panel,
html[data-theme="dark"][data-visual-theme="minimal"] .zoom-controls,
html[data-theme="dark"][data-visual-theme="minimal"] .level-card,
html[data-theme="dark"][data-visual-theme="minimal"] .toast {
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
}

html[data-visual-theme="minimal"] button,
html[data-visual-theme="minimal"] .btn,
html[data-visual-theme="minimal"] input,
html[data-visual-theme="minimal"] select,
html[data-visual-theme="minimal"] textarea,
html[data-visual-theme="minimal"] .back-to-home,
html[data-visual-theme="minimal"] #wiki-open-btn,
html[data-visual-theme="minimal"] #theme-toggle,
html[data-visual-theme="minimal"] #splash-close-btn,
html[data-visual-theme="minimal"] #wiki-close-btn,
html[data-visual-theme="minimal"] .modal-close-btn {
  border-radius: 999px !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

html[data-theme="light"][data-visual-theme="minimal"] button,
html[data-theme="light"][data-visual-theme="minimal"] .btn,
html[data-theme="light"][data-visual-theme="minimal"] input,
html[data-theme="light"][data-visual-theme="minimal"] select,
html[data-theme="light"][data-visual-theme="minimal"] textarea,
html[data-theme="light"][data-visual-theme="minimal"] .back-to-home,
html[data-theme="light"][data-visual-theme="minimal"] #wiki-open-btn,
html[data-theme="light"][data-visual-theme="minimal"] #theme-toggle,
html[data-theme="light"][data-visual-theme="minimal"] #splash-close-btn,
html[data-theme="light"][data-visual-theme="minimal"] #wiki-close-btn,
html[data-theme="light"][data-visual-theme="minimal"] .modal-close-btn {
  background: #ffffff !important;
  border: 1px solid rgba(17, 17, 17, 0.08) !important;
  color: #111111 !important;
}

html[data-theme="dark"][data-visual-theme="minimal"] button,
html[data-theme="dark"][data-visual-theme="minimal"] .btn,
html[data-theme="dark"][data-visual-theme="minimal"] input,
html[data-theme="dark"][data-visual-theme="minimal"] select,
html[data-theme="dark"][data-visual-theme="minimal"] textarea,
html[data-theme="dark"][data-visual-theme="minimal"] .back-to-home,
html[data-theme="dark"][data-visual-theme="minimal"] #wiki-open-btn,
html[data-theme="dark"][data-visual-theme="minimal"] #theme-toggle,
html[data-theme="dark"][data-visual-theme="minimal"] #splash-close-btn,
html[data-theme="dark"][data-visual-theme="minimal"] #wiki-close-btn,
html[data-theme="dark"][data-visual-theme="minimal"] .modal-close-btn {
  background: #101014 !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  color: #f5f5f7 !important;
}

html[data-theme="light"][data-visual-theme="minimal"] .btn {
  background: #111111 !important;
  color: #ffffff !important;
}

html[data-theme="dark"][data-visual-theme="minimal"] .btn {
  background: #f5f5f7 !important;
  color: #111111 !important;
}

html[data-visual-theme="minimal"] .version-badge,
html[data-visual-theme="minimal"] .badge {
  border-radius: 999px !important;
  box-shadow: none !important;
}

html[data-theme="light"][data-visual-theme="minimal"] .version-badge,
html[data-theme="light"][data-visual-theme="minimal"] .badge {
  background: #ffffff !important;
  border: 1px solid rgba(17, 17, 17, 0.08) !important;
  color: #111111 !important;
}

html[data-theme="dark"][data-visual-theme="minimal"] .version-badge,
html[data-theme="dark"][data-visual-theme="minimal"] .badge {
  background: #101014 !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  color: #f5f5f7 !important;
}
`;
      return;
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

html[data-visual-theme="glassui"] header.panel::before,
html[data-visual-theme="glassui"] .wiki-header {
  background-image: var(--tool-theme-header-image) !important;
  background-size: cover !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
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

html[data-theme="light"][data-visual-theme="glassui"] .level-card,
html[data-theme="light"][data-visual-theme="glassui"] .toast,
html[data-theme="light"][data-visual-theme="glassui"] .dock,
html[data-theme="light"][data-visual-theme="glassui"] .properties-panel,
html[data-theme="light"][data-visual-theme="glassui"] .zoom-controls,
html[data-theme="light"][data-visual-theme="glassui"] .control-group,
html[data-theme="light"][data-visual-theme="glassui"] .panel-section,
html[data-theme="light"][data-visual-theme="glassui"] .group,
html[data-theme="light"][data-visual-theme="glassui"] .box,
html[data-theme="light"][data-visual-theme="glassui"] .settings-group,
html[data-theme="light"][data-visual-theme="glassui"] fieldset {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.72) 0%, rgba(240, 245, 255, 0.42) 100%) !important;
  border: 1px solid rgba(148, 166, 255, 0.38) !important;
  box-shadow: 0 8px 24px rgba(111, 136, 227, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.92) !important;
}

html[data-theme="dark"][data-visual-theme="glassui"] .level-card,
html[data-theme="dark"][data-visual-theme="glassui"] .toast,
html[data-theme="dark"][data-visual-theme="glassui"] .dock,
html[data-theme="dark"][data-visual-theme="glassui"] .properties-panel,
html[data-theme="dark"][data-visual-theme="glassui"] .zoom-controls,
html[data-theme="dark"][data-visual-theme="glassui"] .control-group,
html[data-theme="dark"][data-visual-theme="glassui"] .panel-section,
html[data-theme="dark"][data-visual-theme="glassui"] .group,
html[data-theme="dark"][data-visual-theme="glassui"] .box,
html[data-theme="dark"][data-visual-theme="glassui"] .settings-group,
html[data-theme="dark"][data-visual-theme="glassui"] fieldset {
  background: linear-gradient(145deg, rgba(34, 42, 84, 0.66) 0%, rgba(18, 26, 58, 0.42) 100%) !important;
  border: 1px solid rgba(120, 136, 255, 0.28) !important;
  box-shadow: 0 10px 26px rgba(16, 23, 54, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
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

html[data-theme="light"][data-visual-theme="glassui"] .back-to-home,
html[data-theme="light"][data-visual-theme="glassui"] #wiki-open-btn,
html[data-theme="light"][data-visual-theme="glassui"] #theme-toggle,
html[data-theme="light"][data-visual-theme="glassui"] #splash-close-btn,
html[data-theme="light"][data-visual-theme="glassui"] #wiki-close-btn,
html[data-theme="light"][data-visual-theme="glassui"] .modal-close-btn {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.76) 0%, rgba(235, 241, 255, 0.52) 100%) !important;
  border-color: rgba(148, 166, 255, 0.42) !important;
  color: #22304f !important;
  box-shadow: 0 8px 24px rgba(111, 136, 227, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.96) !important;
  backdrop-filter: blur(14px) !important;
  -webkit-backdrop-filter: blur(14px) !important;
}

html[data-theme="dark"][data-visual-theme="glassui"] .back-to-home,
html[data-theme="dark"][data-visual-theme="glassui"] #wiki-open-btn,
html[data-theme="dark"][data-visual-theme="glassui"] #theme-toggle,
html[data-theme="dark"][data-visual-theme="glassui"] #splash-close-btn,
html[data-theme="dark"][data-visual-theme="glassui"] #wiki-close-btn,
html[data-theme="dark"][data-visual-theme="glassui"] .modal-close-btn {
  background: linear-gradient(145deg, rgba(31, 39, 80, 0.74) 0%, rgba(18, 24, 58, 0.5) 100%) !important;
  border-color: rgba(120, 136, 255, 0.32) !important;
  color: #e8eeff !important;
  box-shadow: 0 10px 24px rgba(11, 18, 42, 0.24), inset 0 1px 0 rgba(255, 255, 255, 0.24) !important;
  backdrop-filter: blur(14px) !important;
  -webkit-backdrop-filter: blur(14px) !important;
}

html[data-visual-theme="glassui"] .version-badge,
html[data-visual-theme="glassui"] .badge {
  border-radius: 999px !important;
  backdrop-filter: blur(14px) !important;
  -webkit-backdrop-filter: blur(14px) !important;
}

html[data-theme="light"][data-visual-theme="glassui"] .version-badge,
html[data-theme="light"][data-visual-theme="glassui"] .badge {
  background: rgba(236, 241, 255, 0.72) !important;
  border: 1px solid rgba(148, 166, 255, 0.34) !important;
  color: #294064 !important;
}

html[data-theme="dark"][data-visual-theme="glassui"] .version-badge,
html[data-theme="dark"][data-visual-theme="glassui"] .badge {
  background: rgba(35, 44, 86, 0.66) !important;
  border: 1px solid rgba(120, 136, 255, 0.28) !important;
  color: #e7edff !important;
}

html[data-visual-theme="glassui"] .splash-image,
html[data-visual-theme="glassui"] .splash-info {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
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

  const replaceAsset = (value, state) => {
    if (typeof value !== 'string' || value.length === 0) return value;
    let next = value;
    if (state.assetFile) {
      next = next.replace(LOCAL_ASSET_PATTERN, state.assetFile);
    }
    if (state.themeMeta.usesArtwork) {
      next = next.replace(SHARED_THEME_ASSET_PATTERN, (match, prefix, currentTheme, assetBase, assetTheme, extension) => {
        return `${prefix}${state.theme}/${assetBase}_${state.theme}.${extension.toLowerCase()}`;
      });
    }
    return next;
  };

  const patchElement = (el, state) => {
    if (!el || el.nodeType !== 1) return;

    ['src', 'srcset', 'style', 'poster', 'content'].forEach((attributeName) => {
      if (!el.hasAttribute(attributeName)) return;
      const currentValue = el.getAttribute(attributeName);
      const nextValue = replaceAsset(currentValue, state);
      if (nextValue !== currentValue) {
        el.setAttribute(attributeName, nextValue);
      }
    });

    if (el.tagName === 'STYLE') {
      const css = el.textContent;
      const next = replaceAsset(css, state);
      if (next !== css) el.textContent = next;
    }
  };

  const patchTree = (root, state) => {
    patchElement(root, state);
    if (!root || !root.querySelectorAll) return;

    root.querySelectorAll('[src],[srcset],[style],[poster],[content],style').forEach((el) => patchElement(el, state));
  };

  const applyToolThemeImages = (root, state) => {
    if (!state.toolThemeImage || !root || !root.querySelectorAll) return;

    root.querySelectorAll('.splash-image img').forEach((img) => {
      img.setAttribute('src', state.toolThemeImage);
    });
  };

  let currentState = getThemeState();

  const applyVisualThemeState = () => {
    currentState = getThemeState();
    document.documentElement.dataset.visualTheme = currentState.theme;
    document.documentElement.dataset.visualThemeGroup = currentState.themeMeta.group;
    if (currentState.assetFile) {
      document.documentElement.dataset.visualThemeAsset = currentState.assetFile;
    } else {
      delete document.documentElement.dataset.visualThemeAsset;
    }
    if (currentState.toolKey && currentState.assetFile) {
      document.documentElement.dataset.visualThemeTool = currentState.toolKey;
      document.documentElement.style.setProperty('--tool-theme-local-image', `url('${currentState.assetFile}')`);
    } else {
      delete document.documentElement.dataset.visualThemeTool;
      document.documentElement.style.removeProperty('--tool-theme-local-image');
    }
    if (currentState.toolEmojiWallpaper) {
      document.documentElement.style.setProperty('--tool-theme-emoji-wallpaper', JSON.stringify(currentState.toolEmojiWallpaper));
      document.documentElement.style.setProperty('--tool-theme-emoji-strip', JSON.stringify(currentState.toolEmojiStrip));
      document.documentElement.style.setProperty('--tool-theme-emoji-hero', JSON.stringify(currentState.toolEmojiHero));
      document.documentElement.style.setProperty('--tool-theme-emoji-burst', JSON.stringify(currentState.toolEmojiBurst));
    } else {
      document.documentElement.style.removeProperty('--tool-theme-emoji-wallpaper');
      document.documentElement.style.removeProperty('--tool-theme-emoji-strip');
      document.documentElement.style.removeProperty('--tool-theme-emoji-hero');
      document.documentElement.style.removeProperty('--tool-theme-emoji-burst');
    }
    ensurePatternStyle();
    document.documentElement.style.setProperty('--tool-theme-pattern-image', currentState.patternImage === 'none'
      ? 'none'
      : `url('${currentState.patternImage}')`);
    if (currentState.toolThemeImage) {
      ensureHeaderImageStyle();
      document.documentElement.style.setProperty('--tool-theme-header-image', `url('${currentState.toolThemeImage}')`);
    } else {
      document.documentElement.style.removeProperty('--tool-theme-header-image');
    }
    ensureThemeStyle(currentState.theme);
    patchTree(document.documentElement, currentState);
    applyToolThemeImages(document, currentState);
    bindBackToHubTransition(currentState.theme);
    bindThemeToggleNormalization();
    normalizeThemeToggle();
    window.dispatchEvent(new CustomEvent('vgtools:visual-theme-applied', {
      detail: {
        theme: currentState.theme,
        assetFile: currentState.assetFile,
        toolKey: currentState.toolKey,
      },
    }));
  };

  applyVisualThemeState();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyVisualThemeState, { once: true });
  }

  window.addEventListener('pageshow', applyVisualThemeState);
  window.addEventListener('storage', (event) => {
    if (event.key && event.key !== STORAGE_KEY) return;
    applyVisualThemeState();
  });

  // Lightweight observer: patch only new/changed nodes, avoid full-tree reprocessing loops.
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        if (mutation.target && mutation.target.nodeType === 1 && mutation.target.tagName === 'STYLE') {
          patchElement(mutation.target, currentState);
        }
        mutation.addedNodes.forEach((node) => {
          if (node && node.nodeType === 1) {
            patchTree(node, currentState);
            applyToolThemeImages(node, currentState);
            return;
          }

          if (node && node.nodeType === 3 && mutation.target && mutation.target.nodeType === 1 && mutation.target.tagName === 'STYLE') {
            patchElement(mutation.target, currentState);
          }
        });
        continue;
      }

      if (mutation.type === 'attributes' && mutation.target && mutation.target.nodeType === 1) {
        patchElement(mutation.target, currentState);
        continue;
      }

      if (mutation.type === 'characterData' && mutation.target && mutation.target.parentElement && mutation.target.parentElement.tagName === 'STYLE') {
        patchElement(mutation.target.parentElement, currentState);
      }
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true,
    attributeFilter: ['src', 'srcset', 'style', 'poster', 'content'],
  });
})();
