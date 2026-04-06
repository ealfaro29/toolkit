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
    terminal: { assetFile: null, usesArtwork: false, usesPattern: false, transition: 'minimal', group: 'style' },
    brutalist: { assetFile: null, usesArtwork: false, usesPattern: false, transition: 'minimal', group: 'style' },
    neon: { assetFile: null, usesArtwork: false, usesPattern: false, transition: 'glass', group: 'style' },
    pastel: { assetFile: null, usesArtwork: false, usesPattern: false, transition: 'minimal', group: 'style' },
    newspaper: { assetFile: null, usesArtwork: false, usesPattern: false, transition: 'minimal', group: 'style' },
    blueprint: { assetFile: null, usesArtwork: false, usesPattern: false, transition: 'glass', group: 'style' },
    custom: { assetFile: null, usesArtwork: false, usesPattern: false, transition: 'minimal', group: 'basic' },
  };

  const CUSTOM_THEME_ACCENT_KEY = 'vgtools-custom-accent';
  const CUSTOM_THEME_BG_KEY = 'vgtools-custom-bg';
  const CUSTOM_THEME_FONT_KEY = 'vgtools-custom-font';
  const CUSTOM_BG_PRESETS = [
    { label: 'Auto', bg: null },
    { label: 'White', bg: '#ffffff' },
    { label: 'Cream', bg: '#FAF6F0' },
    { label: 'Slate', bg: 'linear-gradient(135deg,#f0f4f8 0%,#dce6f0 100%)' },
    { label: 'Indigo', bg: 'linear-gradient(135deg,#1a0533 0%,#2d1b69 100%)' },
    { label: 'Ocean', bg: 'linear-gradient(135deg,#0f2027 0%,#203a43 50%,#2c5364 100%)' },
  ];
  const CUSTOM_FONT_MAP = {
    system: 'Inter, ui-sans-serif, system-ui, -apple-system, Arial',
    serif: 'Georgia, "Times New Roman", serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Courier New", monospace',
    rounded: '"Nunito", ui-rounded, system-ui, sans-serif',
  };
  const THEME_STORAGE_KEYS = [STORAGE_KEY, CUSTOM_THEME_ACCENT_KEY, CUSTOM_THEME_BG_KEY, CUSTOM_THEME_FONT_KEY];
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

  const applyCustomThemeSettings = (theme) => {
    const root = document.documentElement;
    if (theme !== 'custom') {
      root.style.removeProperty('--accent-color');
      root.style.removeProperty('--accent-color-tint');
      root.style.removeProperty('--accent-yellow');
      root.style.removeProperty('--font-family-sans');
      root.style.removeProperty('--custom-hub-bg');
      delete root.dataset.customBg;
      return;
    }

    let accent = (localStorage.getItem(CUSTOM_THEME_ACCENT_KEY) || '#E72F2F').trim();
    if (!/^#[0-9a-fA-F]{6}$/.test(accent)) {
      accent = '#E72F2F';
    }
    const r = parseInt(accent.slice(1, 3), 16);
    const g = parseInt(accent.slice(3, 5), 16);
    const b = parseInt(accent.slice(5, 7), 16);
    root.style.setProperty('--accent-color', accent);
    root.style.setProperty('--accent-color-tint', `rgba(${r}, ${g}, ${b}, 0.12)`);
    root.style.setProperty('--accent-yellow', accent);

    const bgIndexRaw = localStorage.getItem(CUSTOM_THEME_BG_KEY) || '0';
    const bgIndex = Number.parseInt(bgIndexRaw, 10);
    const preset = CUSTOM_BG_PRESETS[Number.isFinite(bgIndex) ? bgIndex : 0] || CUSTOM_BG_PRESETS[0];
    if (preset && preset.bg) {
      root.dataset.customBg = '1';
      root.style.setProperty('--custom-hub-bg', preset.bg);
    } else {
      delete root.dataset.customBg;
      root.style.removeProperty('--custom-hub-bg');
    }

    const fontKey = (localStorage.getItem(CUSTOM_THEME_FONT_KEY) || 'system').trim();
    if (fontKey && fontKey !== 'system') {
      root.style.setProperty('--font-family-sans', CUSTOM_FONT_MAP[fontKey] || CUSTOM_FONT_MAP.system);
      if (fontKey === 'rounded' && !document.getElementById('vgtools-custom-nunito-font')) {
        const link = document.createElement('link');
        link.id = 'vgtools-custom-nunito-font';
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600&display=swap';
        document.head.appendChild(link);
      }
    } else {
      root.style.removeProperty('--font-family-sans');
    }
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

      // Solid blanket behind the decorative overlay so the mini-app doesn't
      // flash through when the overlay animation fades back to transparent.
      const blanket = document.createElement('div');
      blanket.style.cssText = 'position:fixed;inset:0;z-index:219999;background:var(--surface);pointer-events:none;';
      document.body.appendChild(blanket);

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

    if (theme === 'emoji' && !document.getElementById('vgtools-emoji-fonts')) {
      const fontLink = document.createElement('link');
      fontLink.id = 'vgtools-emoji-fonts';
      fontLink.rel = 'stylesheet';
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Patrick+Hand&family=Permanent+Marker&display=swap';
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
  background: #faf7f0 !important;
}

html[data-theme="dark"][data-visual-theme="emoji"] body {
  background: #161217 !important;
}

html[data-visual-theme="emoji"] body {
  margin: 0 !important;
  padding-top: 0 !important;
  padding-right: 25px !important;
  padding-bottom: 25px !important;
  padding-left: 25px !important;
  font-family: "Patrick Hand", "Comic Sans MS", cursive !important;
}

html[data-visual-theme="emoji"] body > .container,
html[data-visual-theme="emoji"] #app-container,
html[data-visual-theme="emoji"] .container {
  margin-top: 0 !important;
  padding-top: 90px !important;
}

html[data-visual-theme="emoji"] header.panel {
  margin-top: 0 !important;
  position: fixed !important;
  top: 0 !important;
  left: 50% !important;
  width: min(1200px, calc(100% - 50px)) !important;
  transform: translateX(-50%) !important;
  z-index: 120 !important;
}

html[data-visual-theme="emoji"] body::before {
  content: var(--tool-theme-emoji-wallpaper, "") !important;
  background-image: none !important;
  background: none !important;
  position: fixed !important;
  display: block !important;
  inset: -5% !important;
  z-index: -1 !important;
  pointer-events: none !important;
  font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif !important;
  font-size: clamp(22px, 2vw, 34px) !important;
  line-height: 1.65 !important;
  letter-spacing: 12px !important;
  word-spacing: 10px !important;
  white-space: normal !important;
  text-align: center !important;
  opacity: 0.08 !important;
  transform: rotate(-5deg) scale(1.06) !important;
  overflow: hidden !important;
}

html[data-theme="dark"][data-visual-theme="emoji"] body::before {
  opacity: 0.07 !important;
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
  position: relative !important;
  border-radius: 2px !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
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
  background: linear-gradient(180deg, rgba(255, 243, 151, 0.99) 0%, rgba(249, 220, 96, 0.98) 100%) !important;
  border: 1px solid rgba(194, 152, 31, 0.26) !important;
  box-shadow: -14px 18px 20px rgba(92, 71, 12, 0.1), 0 16px 28px rgba(194, 152, 31, 0.18) !important;
  color: #4b2a00 !important;
}

html[data-theme="dark"][data-visual-theme="emoji"] .panel,
html[data-theme="dark"][data-visual-theme="emoji"] header.panel,
html[data-theme="dark"][data-visual-theme="emoji"] aside.panel,
html[data-theme="dark"][data-visual-theme="emoji"] main.panel,
html[data-theme="dark"][data-visual-theme="emoji"] .splash-content,
html[data-theme="dark"][data-visual-theme="emoji"] .wiki-modal-content,
html[data-theme="dark"][data-visual-theme="emoji"] .modal-content,
html[data-theme="dark"][data-visual-theme="emoji"] .dialog-content.panel {
  background: linear-gradient(180deg, rgba(252, 226, 116, 0.98) 0%, rgba(240, 198, 78, 0.96) 100%) !important;
  border: 1px solid rgba(216, 164, 39, 0.34) !important;
  box-shadow: -14px 18px 20px rgba(0, 0, 0, 0.22), 0 16px 30px rgba(0, 0, 0, 0.3) !important;
  color: #4b2300 !important;
}

html[data-visual-theme="emoji"] header.panel::before,
html[data-visual-theme="emoji"] .wiki-header::before {
  content: none !important;
}

html[data-visual-theme="emoji"] .wiki-header {
  position: relative !important;
  overflow: hidden !important;
  background: rgba(255, 244, 196, 0.92) !important;
  background-image: none !important;
  color: #4b2a00 !important;
}

html[data-theme="dark"][data-visual-theme="emoji"] .wiki-header {
  background: rgba(252, 226, 116, 0.92) !important;
  color: #4b2300 !important;
}

html[data-visual-theme="emoji"] .wiki-header::after {
  content: var(--tool-theme-emoji-strip, "") !important;
  position: absolute !important;
  inset: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 0 24px !important;
  font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif !important;
  font-size: 32px !important;
  line-height: 1 !important;
  letter-spacing: 12px !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  opacity: 0.72 !important;
  z-index: 0 !important;
  pointer-events: none !important;
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
  color: #4b2a00 !important;
}

html[data-theme="dark"][data-visual-theme="emoji"] header.panel h1,
html[data-theme="dark"][data-visual-theme="emoji"] .sub,
html[data-theme="dark"][data-visual-theme="emoji"] label,
html[data-theme="dark"][data-visual-theme="emoji"] p,
html[data-theme="dark"][data-visual-theme="emoji"] .description,
html[data-theme="dark"][data-visual-theme="emoji"] .wiki-body,
html[data-theme="dark"][data-visual-theme="emoji"] .modal-body {
  color: #4b2300 !important;
}

html[data-visual-theme="emoji"] h1,
html[data-visual-theme="emoji"] h2,
html[data-visual-theme="emoji"] h3,
html[data-visual-theme="emoji"] .splash-info h2,
html[data-visual-theme="emoji"] .wiki-header h3,
html[data-visual-theme="emoji"] .control-group-title,
html[data-visual-theme="emoji"] .level-header,
html[data-visual-theme="emoji"] .section-title {
  font-family: "Permanent Marker", "Bangers", cursive !important;
  letter-spacing: 0.01em !important;
}

html[data-visual-theme="emoji"] .wiki-header h3,
html[data-visual-theme="emoji"] #wiki-close-btn {
  color: #4b2a00 !important;
  text-shadow: none !important;
}

html[data-theme="dark"][data-visual-theme="emoji"] .wiki-header h3,
html[data-theme="dark"][data-visual-theme="emoji"] #wiki-close-btn {
  color: #4b2300 !important;
}

html[data-visual-theme="emoji"] p,
html[data-visual-theme="emoji"] label,
html[data-visual-theme="emoji"] .sub,
html[data-visual-theme="emoji"] .description,
html[data-visual-theme="emoji"] .feature-item,
html[data-visual-theme="emoji"] .wiki-body,
html[data-visual-theme="emoji"] .modal-body,
html[data-visual-theme="emoji"] .version-badge,
html[data-visual-theme="emoji"] .badge {
  font-family: "Patrick Hand", "Comic Sans MS", cursive !important;
}

html[data-visual-theme="emoji"] .splash-image {
  display: none !important;
}

html[data-theme="light"][data-visual-theme="emoji"] .splash-image {
  background: transparent !important;
}

html[data-theme="dark"][data-visual-theme="emoji"] .splash-image {
  background: transparent !important;
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
  transform: rotate(-4deg) scale(1.02) !important;
  filter: saturate(1.05) !important;
  opacity: 0.84 !important;
}

html[data-visual-theme="emoji"] .splash-image::after {
  content: "" !important;
  position: absolute !important;
  inset: 0 !important;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0) 100%) !important;
}

html[data-visual-theme="emoji"] .splash-content {
  display: block !important;
  width: min(560px, calc(100vw - 32px)) !important;
  height: auto !important;
  max-height: min(90vh, 760px) !important;
  padding: 28px !important;
}

html[data-visual-theme="emoji"] .splash-info {
  border: none !important;
  box-shadow: none !important;
  border-radius: 0 !important;
  flex: 1 1 auto !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 20px !important;
  padding: 0 !important;
}

html[data-theme="light"][data-visual-theme="emoji"] .splash-info {
  background: transparent !important;
}

html[data-theme="dark"][data-visual-theme="emoji"] .splash-info {
  background: transparent !important;
}

html[data-visual-theme="emoji"] .splash-info h2,
html[data-visual-theme="emoji"] .splash-title,
html[data-visual-theme="emoji"] .splash-info .description,
html[data-visual-theme="emoji"] .splash-info p,
html[data-visual-theme="emoji"] .splash-info label,
html[data-visual-theme="emoji"] .splash-info .feature-item,
html[data-visual-theme="emoji"] .splash-info .footer,
html[data-visual-theme="emoji"] .splash-info .footer *,
html[data-visual-theme="emoji"] .splash-info .version-badge,
html[data-visual-theme="emoji"] .splash-info .badge,
html[data-visual-theme="emoji"] .splash-info .sub {
  color: #4b2a00 !important;
  text-shadow: none !important;
}

html[data-visual-theme="emoji"] .splash-info input[type="checkbox"] {
  accent-color: #8a5a00 !important;
}

html[data-visual-theme="emoji"] .splash-info .feature-item span.emoji {
  filter: drop-shadow(0 2px 3px rgba(103, 75, 10, 0.12)) !important;
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
html[data-visual-theme="emoji"] .panel-section-preview {
  position: relative !important;
  border-radius: 2px !important;
  box-shadow: none !important;
  background: transparent !important;
  background-image: none !important;
  border: none !important;
  outline: none !important;
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
html[data-theme="light"][data-visual-theme="emoji"] .panel-section-preview {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
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
html[data-theme="dark"][data-visual-theme="emoji"] .panel-section-preview {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

html[data-visual-theme="emoji"] .toast {
  border-radius: 2px !important;
  box-shadow: none !important;
}

html[data-theme="light"][data-visual-theme="emoji"] .toast {
  background: rgba(255, 250, 225, 0.9) !important;
  border: 1px solid rgba(194, 152, 31, 0.18) !important;
}

html[data-theme="dark"][data-visual-theme="emoji"] .toast {
  background: rgba(255, 243, 198, 0.92) !important;
  border: 1px solid rgba(216, 164, 39, 0.18) !important;
}

html[data-visual-theme="emoji"] .control-group > .control-group,
html[data-visual-theme="emoji"] .panel-section > .panel-section,
html[data-visual-theme="emoji"] .group > .group,
html[data-visual-theme="emoji"] .settings-group > .settings-group {
  background: transparent !important;
  border-color: transparent !important;
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
  border-radius: 6px !important;
  box-shadow: none !important;
  font-family: "Patrick Hand", "Comic Sans MS", cursive !important;
}

html[data-visual-theme="emoji"] .btn,
html[data-visual-theme="emoji"] button:not(#theme-toggle):not(#wiki-open-btn):not(#splash-close-btn):not(#wiki-close-btn):not(.modal-close-btn) {
  font-family: "Permanent Marker", "Bangers", cursive !important;
  letter-spacing: 0.01em !important;
}

html[data-visual-theme="emoji"] input::placeholder,
html[data-visual-theme="emoji"] textarea::placeholder {
  font-family: "Patrick Hand", "Comic Sans MS", cursive !important;
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
  background: rgba(255, 252, 239, 0.92) !important;
  border: 1px solid rgba(194, 152, 31, 0.2) !important;
  color: #4b2a00 !important;
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
  background: rgba(255, 247, 220, 0.96) !important;
  border: 1px solid rgba(216, 164, 39, 0.24) !important;
  color: #4b2300 !important;
}

html[data-theme="light"][data-visual-theme="emoji"] .btn {
  background: linear-gradient(135deg, #ff9a63 0%, #ffd166 100%) !important;
  color: #43271b !important;
}

html[data-theme="dark"][data-visual-theme="emoji"] .btn {
  background: linear-gradient(135deg, #ff9b73 0%, #ffd166 100%) !important;
  color: #43271b !important;
}

html[data-visual-theme="emoji"] .version-badge,
html[data-visual-theme="emoji"] .badge {
  border-radius: 999px !important;
}

html[data-theme="light"][data-visual-theme="emoji"] .version-badge,
html[data-theme="light"][data-visual-theme="emoji"] .badge {
  background: rgba(255, 252, 239, 0.88) !important;
  border: 1px solid rgba(194, 152, 31, 0.18) !important;
  color: #43271b !important;
}

html[data-theme="dark"][data-visual-theme="emoji"] .version-badge,
html[data-theme="dark"][data-visual-theme="emoji"] .badge {
  background: rgba(255, 247, 220, 0.92) !important;
  border: 1px solid rgba(216, 164, 39, 0.22) !important;
  color: #43271b !important;
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
html[data-visual-theme="minimal"] .panel-section-preview,
html[data-visual-theme="minimal"] .toast {
  background: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
  border-radius: 20px !important;
  border: none !important;
  outline: none !important;
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
html[data-theme="light"][data-visual-theme="minimal"] .panel-section-preview,
html[data-theme="light"][data-visual-theme="minimal"] .toast {
  border: none !important;
  box-shadow: none !important;
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
html[data-theme="dark"][data-visual-theme="minimal"] .panel-section-preview,
html[data-theme="dark"][data-visual-theme="minimal"] .toast {
  border: none !important;
  box-shadow: none !important;
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
html[data-theme="light"][data-visual-theme="glassui"] fieldset,
html[data-theme="light"][data-visual-theme="glassui"] .panel-section-preview {
  background: transparent !important;
  background-image: none !important;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
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
html[data-theme="dark"][data-visual-theme="glassui"] fieldset,
html[data-theme="dark"][data-visual-theme="glassui"] .panel-section-preview {
  background: transparent !important;
  background-image: none !important;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
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

html[data-visual-theme="glassui"] .splash-content {
  display: block !important;
  width: min(560px, calc(100vw - 32px)) !important;
  height: auto !important;
  max-height: min(90vh, 760px) !important;
  padding: 28px !important;
}

html[data-visual-theme="glassui"] .splash-image {
  display: none !important;
}

html[data-visual-theme="glassui"] .splash-image img {
  display: none !important;
}

html[data-visual-theme="glassui"] .splash-info {
  flex: 1 1 auto !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 20px !important;
  padding: 0 !important;
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

    if (theme === 'terminal') {
      styleEl.textContent = `
html[data-visual-theme="terminal"] {
  --accent-color: #00ff41 !important;
  --accent-color-tint: rgba(0, 255, 65, 0.12) !important;
  --accent-yellow: #00ff41 !important;
}

html[data-visual-theme="terminal"] body::before,
html[data-visual-theme="terminal"] header.panel::before,
html[data-visual-theme="terminal"] .wiki-header::before {
  content: none !important;
  background-image: none !important;
  opacity: 0 !important;
}

html[data-visual-theme="terminal"] body {
  background: #0a0e0a !important;
  color: #d1ffd9 !important;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Courier New", monospace !important;
}

html[data-visual-theme="terminal"] .panel,
html[data-visual-theme="terminal"] header.panel,
html[data-visual-theme="terminal"] aside.panel,
html[data-visual-theme="terminal"] main.panel,
html[data-visual-theme="terminal"] .splash-content,
html[data-visual-theme="terminal"] .wiki-modal-content,
html[data-visual-theme="terminal"] .modal-content,
html[data-visual-theme="terminal"] .dialog-content.panel {
  background: rgba(6, 12, 6, 0.96) !important;
  border: 1px solid rgba(0, 255, 65, 0.4) !important;
  border-radius: 4px !important;
  box-shadow: 0 0 16px rgba(0, 255, 65, 0.18) !important;
  color: #d1ffd9 !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

html[data-visual-theme="terminal"] header.panel {
  background: rgba(4, 10, 4, 0.98) !important;
  border-color: rgba(0, 255, 65, 0.6) !important;
  box-shadow: 0 0 20px rgba(0, 255, 65, 0.35) !important;
}

html[data-visual-theme="terminal"] header.panel h1,
html[data-visual-theme="terminal"] .splash-info h2,
html[data-visual-theme="terminal"] .wiki-header h3,
html[data-visual-theme="terminal"] .modal-header h2 {
  color: #00ff41 !important;
  text-shadow: 0 0 14px rgba(0, 255, 65, 0.65) !important;
  letter-spacing: 0.05em !important;
}

html[data-visual-theme="terminal"] .sub,
html[data-visual-theme="terminal"] label,
html[data-visual-theme="terminal"] p,
html[data-visual-theme="terminal"] .description,
html[data-visual-theme="terminal"] .wiki-body,
html[data-visual-theme="terminal"] .modal-body {
  color: rgba(0, 255, 65, 0.75) !important;
}

html[data-visual-theme="terminal"] .control-group,
html[data-visual-theme="terminal"] .panel-section,
html[data-visual-theme="terminal"] .group,
html[data-visual-theme="terminal"] .box,
html[data-visual-theme="terminal"] .settings-group,
html[data-visual-theme="terminal"] fieldset,
html[data-visual-theme="terminal"] .dock,
html[data-visual-theme="terminal"] .properties-panel,
html[data-visual-theme="terminal"] .zoom-controls,
html[data-visual-theme="terminal"] .level-card,
html[data-visual-theme="terminal"] .panel-section-preview,
html[data-visual-theme="terminal"] .toast {
  background: rgba(0, 255, 65, 0.04) !important;
  border: 1px solid rgba(0, 255, 65, 0.2) !important;
  border-radius: 6px !important;
  box-shadow: 0 0 14px rgba(0, 255, 65, 0.12) !important;
}

html[data-visual-theme="terminal"] button,
html[data-visual-theme="terminal"] .btn,
html[data-visual-theme="terminal"] input,
html[data-visual-theme="terminal"] select,
html[data-visual-theme="terminal"] textarea,
html[data-visual-theme="terminal"] .back-to-home,
html[data-visual-theme="terminal"] #wiki-open-btn,
html[data-visual-theme="terminal"] #theme-toggle,
html[data-visual-theme="terminal"] #splash-close-btn,
html[data-visual-theme="terminal"] #wiki-close-btn,
html[data-visual-theme="terminal"] .modal-close-btn {
  background: rgba(6, 12, 6, 0.9) !important;
  border: 1px solid rgba(0, 255, 65, 0.5) !important;
  color: #00ff41 !important;
  border-radius: 4px !important;
  box-shadow: 0 0 12px rgba(0, 255, 65, 0.2) !important;
}

html[data-visual-theme="terminal"] input::placeholder,
html[data-visual-theme="terminal"] textarea::placeholder {
  color: rgba(0, 255, 65, 0.45) !important;
}

html[data-visual-theme="terminal"] input:focus,
html[data-visual-theme="terminal"] select:focus,
html[data-visual-theme="terminal"] textarea:focus {
  border-color: #00ff41 !important;
  box-shadow: 0 0 0 2px rgba(0, 255, 65, 0.25) !important;
}

html[data-visual-theme="terminal"] .version-badge,
html[data-visual-theme="terminal"] .badge {
  background: rgba(6, 12, 6, 0.92) !important;
  border: 1px solid rgba(0, 255, 65, 0.35) !important;
  color: #00ff41 !important;
  border-radius: 999px !important;
}
`;
      return;
    }

    if (theme === 'brutalist') {
      styleEl.textContent = `
html[data-theme="light"][data-visual-theme="brutalist"] {
  --accent-color: #111111 !important;
  --accent-color-tint: rgba(17, 17, 17, 0.1) !important;
  --accent-yellow: #FFE600 !important;
}

html[data-theme="dark"][data-visual-theme="brutalist"] {
  --accent-color: #FFE600 !important;
  --accent-color-tint: rgba(255, 230, 0, 0.12) !important;
  --accent-yellow: #FFE600 !important;
}

html[data-visual-theme="brutalist"] body::before,
html[data-visual-theme="brutalist"] header.panel::before,
html[data-visual-theme="brutalist"] .wiki-header::before {
  content: none !important;
  background-image: none !important;
  opacity: 0 !important;
}

html[data-theme="light"][data-visual-theme="brutalist"] body {
  background: #f0f0f0 !important;
  color: #111111 !important;
}

html[data-theme="dark"][data-visual-theme="brutalist"] body {
  background: #1a1a1a !important;
  color: #FFE600 !important;
}

html[data-visual-theme="brutalist"] .panel,
html[data-visual-theme="brutalist"] header.panel,
html[data-visual-theme="brutalist"] aside.panel,
html[data-visual-theme="brutalist"] main.panel,
html[data-visual-theme="brutalist"] .splash-content,
html[data-visual-theme="brutalist"] .wiki-modal-content,
html[data-visual-theme="brutalist"] .modal-content,
html[data-visual-theme="brutalist"] .dialog-content.panel {
  border-radius: 0 !important;
  border: 4px solid !important;
  box-shadow: 6px 6px 0 !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

html[data-theme="light"][data-visual-theme="brutalist"] .panel,
html[data-theme="light"][data-visual-theme="brutalist"] header.panel,
html[data-theme="light"][data-visual-theme="brutalist"] aside.panel,
html[data-theme="light"][data-visual-theme="brutalist"] main.panel,
html[data-theme="light"][data-visual-theme="brutalist"] .splash-content,
html[data-theme="light"][data-visual-theme="brutalist"] .wiki-modal-content,
html[data-theme="light"][data-visual-theme="brutalist"] .modal-content,
html[data-theme="light"][data-visual-theme="brutalist"] .dialog-content.panel {
  background: #f0f0f0 !important;
  border-color: #111111 !important;
  box-shadow: 6px 6px 0 #111111 !important;
  color: #111111 !important;
}

html[data-theme="dark"][data-visual-theme="brutalist"] .panel,
html[data-theme="dark"][data-visual-theme="brutalist"] header.panel,
html[data-theme="dark"][data-visual-theme="brutalist"] aside.panel,
html[data-theme="dark"][data-visual-theme="brutalist"] main.panel,
html[data-theme="dark"][data-visual-theme="brutalist"] .splash-content,
html[data-theme="dark"][data-visual-theme="brutalist"] .wiki-modal-content,
html[data-theme="dark"][data-visual-theme="brutalist"] .modal-content,
html[data-theme="dark"][data-visual-theme="brutalist"] .dialog-content.panel {
  background: #1a1a1a !important;
  border-color: #FFE600 !important;
  box-shadow: 6px 6px 0 #FFE600 !important;
  color: #FFE600 !important;
}

html[data-visual-theme="brutalist"] header.panel h1,
html[data-visual-theme="brutalist"] .splash-info h2,
html[data-visual-theme="brutalist"] .wiki-header h3,
html[data-visual-theme="brutalist"] .modal-header h2 {
  text-transform: uppercase !important;
  letter-spacing: 0.04em !important;
}

html[data-theme="light"][data-visual-theme="brutalist"] header.panel h1,
html[data-theme="light"][data-visual-theme="brutalist"] .sub,
html[data-theme="light"][data-visual-theme="brutalist"] label,
html[data-theme="light"][data-visual-theme="brutalist"] p,
html[data-theme="light"][data-visual-theme="brutalist"] .description,
html[data-theme="light"][data-visual-theme="brutalist"] .wiki-body,
html[data-theme="light"][data-visual-theme="brutalist"] .modal-body {
  color: #111111 !important;
}

html[data-theme="dark"][data-visual-theme="brutalist"] header.panel h1,
html[data-theme="dark"][data-visual-theme="brutalist"] .sub,
html[data-theme="dark"][data-visual-theme="brutalist"] label,
html[data-theme="dark"][data-visual-theme="brutalist"] p,
html[data-theme="dark"][data-visual-theme="brutalist"] .description,
html[data-theme="dark"][data-visual-theme="brutalist"] .wiki-body,
html[data-theme="dark"][data-visual-theme="brutalist"] .modal-body {
  color: #FFE600 !important;
}

html[data-visual-theme="brutalist"] .control-group,
html[data-visual-theme="brutalist"] .panel-section,
html[data-visual-theme="brutalist"] .group,
html[data-visual-theme="brutalist"] .box,
html[data-visual-theme="brutalist"] .settings-group,
html[data-visual-theme="brutalist"] fieldset,
html[data-visual-theme="brutalist"] .dock,
html[data-visual-theme="brutalist"] .properties-panel,
html[data-visual-theme="brutalist"] .zoom-controls,
html[data-visual-theme="brutalist"] .level-card,
html[data-visual-theme="brutalist"] .panel-section-preview,
html[data-visual-theme="brutalist"] .toast {
  border-radius: 0 !important;
  border: 3px solid !important;
  box-shadow: 4px 4px 0 !important;
  background: transparent !important;
}

html[data-theme="light"][data-visual-theme="brutalist"] .control-group,
html[data-theme="light"][data-visual-theme="brutalist"] .panel-section,
html[data-theme="light"][data-visual-theme="brutalist"] .group,
html[data-theme="light"][data-visual-theme="brutalist"] .box,
html[data-theme="light"][data-visual-theme="brutalist"] .settings-group,
html[data-theme="light"][data-visual-theme="brutalist"] fieldset,
html[data-theme="light"][data-visual-theme="brutalist"] .dock,
html[data-theme="light"][data-visual-theme="brutalist"] .properties-panel,
html[data-theme="light"][data-visual-theme="brutalist"] .zoom-controls,
html[data-theme="light"][data-visual-theme="brutalist"] .level-card,
html[data-theme="light"][data-visual-theme="brutalist"] .panel-section-preview,
html[data-theme="light"][data-visual-theme="brutalist"] .toast {
  border-color: #111111 !important;
  box-shadow: 4px 4px 0 #111111 !important;
}

html[data-theme="dark"][data-visual-theme="brutalist"] .control-group,
html[data-theme="dark"][data-visual-theme="brutalist"] .panel-section,
html[data-theme="dark"][data-visual-theme="brutalist"] .group,
html[data-theme="dark"][data-visual-theme="brutalist"] .box,
html[data-theme="dark"][data-visual-theme="brutalist"] .settings-group,
html[data-theme="dark"][data-visual-theme="brutalist"] fieldset,
html[data-theme="dark"][data-visual-theme="brutalist"] .dock,
html[data-theme="dark"][data-visual-theme="brutalist"] .properties-panel,
html[data-theme="dark"][data-visual-theme="brutalist"] .zoom-controls,
html[data-theme="dark"][data-visual-theme="brutalist"] .level-card,
html[data-theme="dark"][data-visual-theme="brutalist"] .panel-section-preview,
html[data-theme="dark"][data-visual-theme="brutalist"] .toast {
  border-color: #FFE600 !important;
  box-shadow: 4px 4px 0 #FFE600 !important;
}

html[data-visual-theme="brutalist"] button,
html[data-visual-theme="brutalist"] .btn,
html[data-visual-theme="brutalist"] input,
html[data-visual-theme="brutalist"] select,
html[data-visual-theme="brutalist"] textarea,
html[data-visual-theme="brutalist"] .back-to-home,
html[data-visual-theme="brutalist"] #wiki-open-btn,
html[data-visual-theme="brutalist"] #theme-toggle,
html[data-visual-theme="brutalist"] #splash-close-btn,
html[data-visual-theme="brutalist"] #wiki-close-btn,
html[data-visual-theme="brutalist"] .modal-close-btn {
  border-radius: 0 !important;
  border: 3px solid !important;
  box-shadow: 4px 4px 0 !important;
  text-transform: uppercase !important;
}

html[data-theme="light"][data-visual-theme="brutalist"] button,
html[data-theme="light"][data-visual-theme="brutalist"] .btn,
html[data-theme="light"][data-visual-theme="brutalist"] input,
html[data-theme="light"][data-visual-theme="brutalist"] select,
html[data-theme="light"][data-visual-theme="brutalist"] textarea,
html[data-theme="light"][data-visual-theme="brutalist"] .back-to-home,
html[data-theme="light"][data-visual-theme="brutalist"] #wiki-open-btn,
html[data-theme="light"][data-visual-theme="brutalist"] #theme-toggle,
html[data-theme="light"][data-visual-theme="brutalist"] #splash-close-btn,
html[data-theme="light"][data-visual-theme="brutalist"] #wiki-close-btn,
html[data-theme="light"][data-visual-theme="brutalist"] .modal-close-btn {
  background: #ffffff !important;
  border-color: #111111 !important;
  color: #111111 !important;
  box-shadow: 4px 4px 0 #111111 !important;
}

html[data-theme="dark"][data-visual-theme="brutalist"] button,
html[data-theme="dark"][data-visual-theme="brutalist"] .btn,
html[data-theme="dark"][data-visual-theme="brutalist"] input,
html[data-theme="dark"][data-visual-theme="brutalist"] select,
html[data-theme="dark"][data-visual-theme="brutalist"] textarea,
html[data-theme="dark"][data-visual-theme="brutalist"] .back-to-home,
html[data-theme="dark"][data-visual-theme="brutalist"] #wiki-open-btn,
html[data-theme="dark"][data-visual-theme="brutalist"] #theme-toggle,
html[data-theme="dark"][data-visual-theme="brutalist"] #splash-close-btn,
html[data-theme="dark"][data-visual-theme="brutalist"] #wiki-close-btn,
html[data-theme="dark"][data-visual-theme="brutalist"] .modal-close-btn {
  background: #111111 !important;
  border-color: #FFE600 !important;
  color: #FFE600 !important;
  box-shadow: 4px 4px 0 #FFE600 !important;
}

html[data-visual-theme="brutalist"] input:focus,
html[data-visual-theme="brutalist"] select:focus,
html[data-visual-theme="brutalist"] textarea:focus {
  outline: none !important;
  box-shadow: 0 0 0 3px rgba(255, 230, 0, 0.25) !important;
}

html[data-visual-theme="brutalist"] .version-badge,
html[data-visual-theme="brutalist"] .badge {
  border-radius: 0 !important;
  border: 3px solid !important;
  box-shadow: 3px 3px 0 !important;
}

html[data-theme="light"][data-visual-theme="brutalist"] .version-badge,
html[data-theme="light"][data-visual-theme="brutalist"] .badge {
  background: #ffffff !important;
  border-color: #111111 !important;
  color: #111111 !important;
  box-shadow: 3px 3px 0 #111111 !important;
}

html[data-theme="dark"][data-visual-theme="brutalist"] .version-badge,
html[data-theme="dark"][data-visual-theme="brutalist"] .badge {
  background: #111111 !important;
  border-color: #FFE600 !important;
  color: #FFE600 !important;
  box-shadow: 3px 3px 0 #FFE600 !important;
}
`;
      return;
    }

    if (theme === 'neon') {
      styleEl.textContent = `
html[data-visual-theme="neon"] {
  --accent-color: #00f5ff !important;
  --accent-color-tint: rgba(0, 245, 255, 0.12) !important;
  --accent-yellow: #ff00d4 !important;
}

html[data-visual-theme="neon"] body::before,
html[data-visual-theme="neon"] header.panel::before,
html[data-visual-theme="neon"] .wiki-header::before {
  content: none !important;
  background-image: none !important;
  opacity: 0 !important;
}

html[data-visual-theme="neon"] body {
  background: #060010 !important;
  color: #e5e7eb !important;
}

html[data-visual-theme="neon"] .panel,
html[data-visual-theme="neon"] header.panel,
html[data-visual-theme="neon"] aside.panel,
html[data-visual-theme="neon"] main.panel,
html[data-visual-theme="neon"] .splash-content,
html[data-visual-theme="neon"] .wiki-modal-content,
html[data-visual-theme="neon"] .modal-content,
html[data-visual-theme="neon"] .dialog-content.panel {
  background: rgba(6, 0, 16, 0.88) !important;
  border: 1px solid rgba(0, 245, 255, 0.35) !important;
  border-radius: 14px !important;
  box-shadow: 0 0 24px rgba(0, 245, 255, 0.1), inset 0 0 30px rgba(0, 245, 255, 0.03) !important;
  color: #e5e7eb !important;
  backdrop-filter: blur(14px) !important;
  -webkit-backdrop-filter: blur(14px) !important;
}

html[data-visual-theme="neon"] header.panel h1,
html[data-visual-theme="neon"] .splash-info h2,
html[data-visual-theme="neon"] .wiki-header h3,
html[data-visual-theme="neon"] .modal-header h2 {
  color: #00f5ff !important;
  text-shadow: 0 0 14px rgba(0, 245, 255, 0.7) !important;
}

html[data-visual-theme="neon"] .sub,
html[data-visual-theme="neon"] label,
html[data-visual-theme="neon"] p,
html[data-visual-theme="neon"] .description,
html[data-visual-theme="neon"] .wiki-body,
html[data-visual-theme="neon"] .modal-body {
  color: rgba(255, 255, 255, 0.7) !important;
}

html[data-visual-theme="neon"] .control-group,
html[data-visual-theme="neon"] .panel-section,
html[data-visual-theme="neon"] .group,
html[data-visual-theme="neon"] .box,
html[data-visual-theme="neon"] .settings-group,
html[data-visual-theme="neon"] fieldset,
html[data-visual-theme="neon"] .dock,
html[data-visual-theme="neon"] .properties-panel,
html[data-visual-theme="neon"] .zoom-controls,
html[data-visual-theme="neon"] .level-card,
html[data-visual-theme="neon"] .panel-section-preview,
html[data-visual-theme="neon"] .toast {
  background: rgba(6, 0, 16, 0.7) !important;
  border: 1px solid rgba(0, 245, 255, 0.18) !important;
  border-radius: 12px !important;
  box-shadow: 0 0 16px rgba(0, 245, 255, 0.08) !important;
}

html[data-visual-theme="neon"] button,
html[data-visual-theme="neon"] .btn,
html[data-visual-theme="neon"] input,
html[data-visual-theme="neon"] select,
html[data-visual-theme="neon"] textarea,
html[data-visual-theme="neon"] .back-to-home,
html[data-visual-theme="neon"] #wiki-open-btn,
html[data-visual-theme="neon"] #theme-toggle,
html[data-visual-theme="neon"] #splash-close-btn,
html[data-visual-theme="neon"] #wiki-close-btn,
html[data-visual-theme="neon"] .modal-close-btn {
  background: rgba(6, 0, 16, 0.7) !important;
  border: 1px solid rgba(0, 245, 255, 0.3) !important;
  color: #00f5ff !important;
  border-radius: 8px !important;
  box-shadow: 0 0 14px rgba(0, 245, 255, 0.2) !important;
}

html[data-visual-theme="neon"] input:focus,
html[data-visual-theme="neon"] select:focus,
html[data-visual-theme="neon"] textarea:focus {
  border-color: #00f5ff !important;
  box-shadow: 0 0 0 3px rgba(0, 245, 255, 0.25) !important;
}

html[data-visual-theme="neon"] .version-badge,
html[data-visual-theme="neon"] .badge {
  background: rgba(6, 0, 16, 0.72) !important;
  border: 1px solid rgba(0, 245, 255, 0.25) !important;
  color: #00f5ff !important;
  border-radius: 999px !important;
}
`;
      return;
    }

    if (theme === 'pastel') {
      styleEl.textContent = `
html[data-visual-theme="pastel"] {
  --accent-color: #c084fc !important;
  --accent-color-tint: rgba(192, 132, 252, 0.12) !important;
  --accent-yellow: #fbbf24 !important;
}

html[data-visual-theme="pastel"] body::before,
html[data-visual-theme="pastel"] header.panel::before,
html[data-visual-theme="pastel"] .wiki-header::before {
  content: none !important;
  background-image: none !important;
  opacity: 0 !important;
}

html[data-theme="light"][data-visual-theme="pastel"] body {
  background: #fdf4ff !important;
  color: #4c1d95 !important;
}

html[data-theme="dark"][data-visual-theme="pastel"] body {
  background: #1e1224 !important;
  color: #f3e8ff !important;
}

html[data-visual-theme="pastel"] .panel,
html[data-visual-theme="pastel"] header.panel,
html[data-visual-theme="pastel"] aside.panel,
html[data-visual-theme="pastel"] main.panel,
html[data-visual-theme="pastel"] .splash-content,
html[data-visual-theme="pastel"] .wiki-modal-content,
html[data-visual-theme="pastel"] .modal-content,
html[data-visual-theme="pastel"] .dialog-content.panel {
  border-radius: 20px !important;
  box-shadow: 0 4px 20px rgba(192, 132, 252, 0.12) !important;
  backdrop-filter: blur(10px) !important;
  -webkit-backdrop-filter: blur(10px) !important;
}

html[data-theme="light"][data-visual-theme="pastel"] .panel,
html[data-theme="light"][data-visual-theme="pastel"] header.panel,
html[data-theme="light"][data-visual-theme="pastel"] aside.panel,
html[data-theme="light"][data-visual-theme="pastel"] main.panel,
html[data-theme="light"][data-visual-theme="pastel"] .splash-content,
html[data-theme="light"][data-visual-theme="pastel"] .wiki-modal-content,
html[data-theme="light"][data-visual-theme="pastel"] .modal-content,
html[data-theme="light"][data-visual-theme="pastel"] .dialog-content.panel {
  background: rgba(255, 255, 255, 0.88) !important;
  border: 1px solid rgba(192, 132, 252, 0.22) !important;
  color: #4c1d95 !important;
}

html[data-theme="dark"][data-visual-theme="pastel"] .panel,
html[data-theme="dark"][data-visual-theme="pastel"] header.panel,
html[data-theme="dark"][data-visual-theme="pastel"] aside.panel,
html[data-theme="dark"][data-visual-theme="pastel"] main.panel,
html[data-theme="dark"][data-visual-theme="pastel"] .splash-content,
html[data-theme="dark"][data-visual-theme="pastel"] .wiki-modal-content,
html[data-theme="dark"][data-visual-theme="pastel"] .modal-content,
html[data-theme="dark"][data-visual-theme="pastel"] .dialog-content.panel {
  background: rgba(30, 18, 36, 0.88) !important;
  border: 1px solid rgba(192, 132, 252, 0.18) !important;
  color: #f3e8ff !important;
}

html[data-visual-theme="pastel"] header.panel h1,
html[data-visual-theme="pastel"] .splash-info h2,
html[data-visual-theme="pastel"] .wiki-header h3,
html[data-visual-theme="pastel"] .modal-header h2 {
  color: #7c3aed !important;
}

html[data-theme="dark"][data-visual-theme="pastel"] header.panel h1,
html[data-theme="dark"][data-visual-theme="pastel"] .splash-info h2,
html[data-theme="dark"][data-visual-theme="pastel"] .wiki-header h3,
html[data-theme="dark"][data-visual-theme="pastel"] .modal-header h2 {
  color: #c084fc !important;
}

html[data-visual-theme="pastel"] .sub,
html[data-visual-theme="pastel"] label,
html[data-visual-theme="pastel"] p,
html[data-visual-theme="pastel"] .description,
html[data-visual-theme="pastel"] .wiki-body,
html[data-visual-theme="pastel"] .modal-body {
  color: #7c3aed !important;
}

html[data-theme="dark"][data-visual-theme="pastel"] .sub,
html[data-theme="dark"][data-visual-theme="pastel"] label,
html[data-theme="dark"][data-visual-theme="pastel"] p,
html[data-theme="dark"][data-visual-theme="pastel"] .description,
html[data-theme="dark"][data-visual-theme="pastel"] .wiki-body,
html[data-theme="dark"][data-visual-theme="pastel"] .modal-body {
  color: #e9d5ff !important;
}

html[data-visual-theme="pastel"] .control-group,
html[data-visual-theme="pastel"] .panel-section,
html[data-visual-theme="pastel"] .group,
html[data-visual-theme="pastel"] .box,
html[data-visual-theme="pastel"] .settings-group,
html[data-visual-theme="pastel"] fieldset,
html[data-visual-theme="pastel"] .dock,
html[data-visual-theme="pastel"] .properties-panel,
html[data-visual-theme="pastel"] .zoom-controls,
html[data-visual-theme="pastel"] .level-card,
html[data-visual-theme="pastel"] .panel-section-preview,
html[data-visual-theme="pastel"] .toast {
  border-radius: 18px !important;
  border: 1px solid rgba(192, 132, 252, 0.2) !important;
  background: rgba(255, 255, 255, 0.72) !important;
  box-shadow: 0 4px 16px rgba(192, 132, 252, 0.08) !important;
}

html[data-theme="dark"][data-visual-theme="pastel"] .control-group,
html[data-theme="dark"][data-visual-theme="pastel"] .panel-section,
html[data-theme="dark"][data-visual-theme="pastel"] .group,
html[data-theme="dark"][data-visual-theme="pastel"] .box,
html[data-theme="dark"][data-visual-theme="pastel"] .settings-group,
html[data-theme="dark"][data-visual-theme="pastel"] fieldset,
html[data-theme="dark"][data-visual-theme="pastel"] .dock,
html[data-theme="dark"][data-visual-theme="pastel"] .properties-panel,
html[data-theme="dark"][data-visual-theme="pastel"] .zoom-controls,
html[data-theme="dark"][data-visual-theme="pastel"] .level-card,
html[data-theme="dark"][data-visual-theme="pastel"] .panel-section-preview,
html[data-theme="dark"][data-visual-theme="pastel"] .toast {
  background: rgba(30, 18, 36, 0.75) !important;
  border-color: rgba(192, 132, 252, 0.18) !important;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.2) !important;
}

html[data-visual-theme="pastel"] button,
html[data-visual-theme="pastel"] .btn,
html[data-visual-theme="pastel"] input,
html[data-visual-theme="pastel"] select,
html[data-visual-theme="pastel"] textarea,
html[data-visual-theme="pastel"] .back-to-home,
html[data-visual-theme="pastel"] #wiki-open-btn,
html[data-visual-theme="pastel"] #theme-toggle,
html[data-visual-theme="pastel"] #splash-close-btn,
html[data-visual-theme="pastel"] #wiki-close-btn,
html[data-visual-theme="pastel"] .modal-close-btn {
  background: rgba(255, 255, 255, 0.88) !important;
  border: 1px solid rgba(192, 132, 252, 0.28) !important;
  color: #7c3aed !important;
  border-radius: 14px !important;
  box-shadow: 0 4px 16px rgba(192, 132, 252, 0.1) !important;
}

html[data-theme="dark"][data-visual-theme="pastel"] button,
html[data-theme="dark"][data-visual-theme="pastel"] .btn,
html[data-theme="dark"][data-visual-theme="pastel"] input,
html[data-theme="dark"][data-visual-theme="pastel"] select,
html[data-theme="dark"][data-visual-theme="pastel"] textarea,
html[data-theme="dark"][data-visual-theme="pastel"] .back-to-home,
html[data-theme="dark"][data-visual-theme="pastel"] #wiki-open-btn,
html[data-theme="dark"][data-visual-theme="pastel"] #theme-toggle,
html[data-theme="dark"][data-visual-theme="pastel"] #splash-close-btn,
html[data-theme="dark"][data-visual-theme="pastel"] #wiki-close-btn,
html[data-theme="dark"][data-visual-theme="pastel"] .modal-close-btn {
  background: rgba(30, 18, 36, 0.72) !important;
  border: 1px solid rgba(192, 132, 252, 0.2) !important;
  color: #c084fc !important;
}

html[data-visual-theme="pastel"] input:focus,
html[data-visual-theme="pastel"] select:focus,
html[data-visual-theme="pastel"] textarea:focus {
  border-color: #c084fc !important;
  box-shadow: 0 0 0 3px rgba(192, 132, 252, 0.2) !important;
}

html[data-visual-theme="pastel"] .version-badge,
html[data-visual-theme="pastel"] .badge {
  border-radius: 999px !important;
  background: rgba(255, 255, 255, 0.86) !important;
  border: 1px solid rgba(192, 132, 252, 0.24) !important;
  color: #7c3aed !important;
}

html[data-theme="dark"][data-visual-theme="pastel"] .version-badge,
html[data-theme="dark"][data-visual-theme="pastel"] .badge {
  background: rgba(30, 18, 36, 0.8) !important;
  border-color: rgba(192, 132, 252, 0.2) !important;
  color: #c084fc !important;
}
`;
      return;
    }

    if (theme === 'newspaper') {
      styleEl.textContent = `
html[data-visual-theme="newspaper"] {
  --accent-color: #1a1a1a !important;
  --accent-color-tint: rgba(26, 26, 26, 0.08) !important;
  --accent-yellow: #1a1a1a !important;
}

html[data-theme="dark"][data-visual-theme="newspaper"] {
  --accent-color: #f0e6d3 !important;
  --accent-yellow: #f0e6d3 !important;
}

html[data-visual-theme="newspaper"] body::before,
html[data-visual-theme="newspaper"] header.panel::before,
html[data-visual-theme="newspaper"] .wiki-header::before {
  content: none !important;
  background-image: none !important;
  opacity: 0 !important;
}

html[data-visual-theme="newspaper"] body {
  font-family: Georgia, "Times New Roman", serif !important;
}

html[data-theme="light"][data-visual-theme="newspaper"] body {
  background: #f5efe6 !important;
  color: #1a1a1a !important;
}

html[data-theme="dark"][data-visual-theme="newspaper"] body {
  background: #1a1610 !important;
  color: #f0e6d3 !important;
}

html[data-visual-theme="newspaper"] .panel,
html[data-visual-theme="newspaper"] header.panel,
html[data-visual-theme="newspaper"] aside.panel,
html[data-visual-theme="newspaper"] main.panel,
html[data-visual-theme="newspaper"] .splash-content,
html[data-visual-theme="newspaper"] .wiki-modal-content,
html[data-visual-theme="newspaper"] .modal-content,
html[data-visual-theme="newspaper"] .dialog-content.panel {
  border-radius: 0 !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

html[data-theme="light"][data-visual-theme="newspaper"] .panel,
html[data-theme="light"][data-visual-theme="newspaper"] header.panel,
html[data-theme="light"][data-visual-theme="newspaper"] aside.panel,
html[data-theme="light"][data-visual-theme="newspaper"] main.panel,
html[data-theme="light"][data-visual-theme="newspaper"] .splash-content,
html[data-theme="light"][data-visual-theme="newspaper"] .wiki-modal-content,
html[data-theme="light"][data-visual-theme="newspaper"] .modal-content,
html[data-theme="light"][data-visual-theme="newspaper"] .dialog-content.panel {
  background: #f5efe6 !important;
  border: 2px solid #1a1a1a !important;
  color: #1a1a1a !important;
}

html[data-theme="dark"][data-visual-theme="newspaper"] .panel,
html[data-theme="dark"][data-visual-theme="newspaper"] header.panel,
html[data-theme="dark"][data-visual-theme="newspaper"] aside.panel,
html[data-theme="dark"][data-visual-theme="newspaper"] main.panel,
html[data-theme="dark"][data-visual-theme="newspaper"] .splash-content,
html[data-theme="dark"][data-visual-theme="newspaper"] .wiki-modal-content,
html[data-theme="dark"][data-visual-theme="newspaper"] .modal-content,
html[data-theme="dark"][data-visual-theme="newspaper"] .dialog-content.panel {
  background: #201c14 !important;
  border: 2px solid #c8b99a !important;
  color: #f0e6d3 !important;
}

html[data-visual-theme="newspaper"] header.panel {
  border-top: 3px double #1a1a1a !important;
  border-bottom: 3px double #1a1a1a !important;
  border-left: none !important;
  border-right: none !important;
}

html[data-theme="dark"][data-visual-theme="newspaper"] header.panel {
  border-top-color: #c8b99a !important;
  border-bottom-color: #c8b99a !important;
}

html[data-visual-theme="newspaper"] header.panel h1,
html[data-visual-theme="newspaper"] .splash-info h2,
html[data-visual-theme="newspaper"] .wiki-header h3,
html[data-visual-theme="newspaper"] .modal-header h2 {
  font-family: Georgia, "Times New Roman", serif !important;
  font-style: italic !important;
}

html[data-visual-theme="newspaper"] .sub,
html[data-visual-theme="newspaper"] label,
html[data-visual-theme="newspaper"] p,
html[data-visual-theme="newspaper"] .description,
html[data-visual-theme="newspaper"] .wiki-body,
html[data-visual-theme="newspaper"] .modal-body {
  font-family: Georgia, "Times New Roman", serif !important;
}

html[data-visual-theme="newspaper"] .control-group,
html[data-visual-theme="newspaper"] .panel-section,
html[data-visual-theme="newspaper"] .group,
html[data-visual-theme="newspaper"] .box,
html[data-visual-theme="newspaper"] .settings-group,
html[data-visual-theme="newspaper"] fieldset,
html[data-visual-theme="newspaper"] .dock,
html[data-visual-theme="newspaper"] .properties-panel,
html[data-visual-theme="newspaper"] .zoom-controls,
html[data-visual-theme="newspaper"] .level-card,
html[data-visual-theme="newspaper"] .panel-section-preview,
html[data-visual-theme="newspaper"] .toast {
  background: transparent !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}

html[data-theme="light"][data-visual-theme="newspaper"] .control-group,
html[data-theme="light"][data-visual-theme="newspaper"] .panel-section,
html[data-theme="light"][data-visual-theme="newspaper"] .group,
html[data-theme="light"][data-visual-theme="newspaper"] .box,
html[data-theme="light"][data-visual-theme="newspaper"] .settings-group,
html[data-theme="light"][data-visual-theme="newspaper"] fieldset,
html[data-theme="light"][data-visual-theme="newspaper"] .dock,
html[data-theme="light"][data-visual-theme="newspaper"] .properties-panel,
html[data-theme="light"][data-visual-theme="newspaper"] .zoom-controls,
html[data-theme="light"][data-visual-theme="newspaper"] .level-card,
html[data-theme="light"][data-visual-theme="newspaper"] .panel-section-preview,
html[data-theme="light"][data-visual-theme="newspaper"] .toast {
  border: 1px solid #1a1a1a !important;
}

html[data-theme="dark"][data-visual-theme="newspaper"] .control-group,
html[data-theme="dark"][data-visual-theme="newspaper"] .panel-section,
html[data-theme="dark"][data-visual-theme="newspaper"] .group,
html[data-theme="dark"][data-visual-theme="newspaper"] .box,
html[data-theme="dark"][data-visual-theme="newspaper"] .settings-group,
html[data-theme="dark"][data-visual-theme="newspaper"] fieldset,
html[data-theme="dark"][data-visual-theme="newspaper"] .dock,
html[data-theme="dark"][data-visual-theme="newspaper"] .properties-panel,
html[data-theme="dark"][data-visual-theme="newspaper"] .zoom-controls,
html[data-theme="dark"][data-visual-theme="newspaper"] .level-card,
html[data-theme="dark"][data-visual-theme="newspaper"] .panel-section-preview,
html[data-theme="dark"][data-visual-theme="newspaper"] .toast {
  border: 1px solid #c8b99a !important;
}

html[data-visual-theme="newspaper"] button,
html[data-visual-theme="newspaper"] .btn,
html[data-visual-theme="newspaper"] input,
html[data-visual-theme="newspaper"] select,
html[data-visual-theme="newspaper"] textarea,
html[data-visual-theme="newspaper"] .back-to-home,
html[data-visual-theme="newspaper"] #wiki-open-btn,
html[data-visual-theme="newspaper"] #theme-toggle,
html[data-visual-theme="newspaper"] #splash-close-btn,
html[data-visual-theme="newspaper"] #wiki-close-btn,
html[data-visual-theme="newspaper"] .modal-close-btn {
  border-radius: 2px !important;
  box-shadow: none !important;
  font-family: Georgia, "Times New Roman", serif !important;
}

html[data-theme="light"][data-visual-theme="newspaper"] button,
html[data-theme="light"][data-visual-theme="newspaper"] .btn,
html[data-theme="light"][data-visual-theme="newspaper"] input,
html[data-theme="light"][data-visual-theme="newspaper"] select,
html[data-theme="light"][data-visual-theme="newspaper"] textarea,
html[data-theme="light"][data-visual-theme="newspaper"] .back-to-home,
html[data-theme="light"][data-visual-theme="newspaper"] #wiki-open-btn,
html[data-theme="light"][data-visual-theme="newspaper"] #theme-toggle,
html[data-theme="light"][data-visual-theme="newspaper"] #splash-close-btn,
html[data-theme="light"][data-visual-theme="newspaper"] #wiki-close-btn,
html[data-theme="light"][data-visual-theme="newspaper"] .modal-close-btn {
  background: #ede5d8 !important;
  border: 1px solid #1a1a1a !important;
  color: #1a1a1a !important;
}

html[data-theme="dark"][data-visual-theme="newspaper"] button,
html[data-theme="dark"][data-visual-theme="newspaper"] .btn,
html[data-theme="dark"][data-visual-theme="newspaper"] input,
html[data-theme="dark"][data-visual-theme="newspaper"] select,
html[data-theme="dark"][data-visual-theme="newspaper"] textarea,
html[data-theme="dark"][data-visual-theme="newspaper"] .back-to-home,
html[data-theme="dark"][data-visual-theme="newspaper"] #wiki-open-btn,
html[data-theme="dark"][data-visual-theme="newspaper"] #theme-toggle,
html[data-theme="dark"][data-visual-theme="newspaper"] #splash-close-btn,
html[data-theme="dark"][data-visual-theme="newspaper"] #wiki-close-btn,
html[data-theme="dark"][data-visual-theme="newspaper"] .modal-close-btn {
  background: #201c14 !important;
  border: 1px solid #c8b99a !important;
  color: #f0e6d3 !important;
}

html[data-visual-theme="newspaper"] input:focus,
html[data-visual-theme="newspaper"] select:focus,
html[data-visual-theme="newspaper"] textarea:focus {
  border-color: #1a1a1a !important;
  box-shadow: 0 0 0 2px rgba(26, 26, 26, 0.2) !important;
}

html[data-theme="dark"][data-visual-theme="newspaper"] input:focus,
html[data-theme="dark"][data-visual-theme="newspaper"] select:focus,
html[data-theme="dark"][data-visual-theme="newspaper"] textarea:focus {
  border-color: #f0e6d3 !important;
  box-shadow: 0 0 0 2px rgba(240, 230, 211, 0.2) !important;
}

html[data-visual-theme="newspaper"] .version-badge,
html[data-visual-theme="newspaper"] .badge {
  border-radius: 2px !important;
  box-shadow: none !important;
  font-family: Georgia, "Times New Roman", serif !important;
}

html[data-theme="light"][data-visual-theme="newspaper"] .version-badge,
html[data-theme="light"][data-visual-theme="newspaper"] .badge {
  background: #ede5d8 !important;
  border: 1px solid #1a1a1a !important;
  color: #1a1a1a !important;
}

html[data-theme="dark"][data-visual-theme="newspaper"] .version-badge,
html[data-theme="dark"][data-visual-theme="newspaper"] .badge {
  background: #201c14 !important;
  border: 1px solid #c8b99a !important;
  color: #f0e6d3 !important;
}
`;
      return;
    }

    if (theme === 'blueprint') {
      styleEl.textContent = `
html[data-visual-theme="blueprint"] {
  --accent-color: #4db8ff !important;
  --accent-color-tint: rgba(77, 184, 255, 0.12) !important;
  --accent-yellow: #4db8ff !important;
}

html[data-visual-theme="blueprint"] body::before,
html[data-visual-theme="blueprint"] header.panel::before,
html[data-visual-theme="blueprint"] .wiki-header::before {
  content: none !important;
  background-image: none !important;
  opacity: 0 !important;
}

html[data-visual-theme="blueprint"] body {
  background: #001f3f !important;
  background-image: linear-gradient(rgba(77, 184, 255, 0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(77, 184, 255, 0.07) 1px, transparent 1px) !important;
  background-size: 24px 24px !important;
  color: #c7e6ff !important;
}

html[data-visual-theme="blueprint"] .panel,
html[data-visual-theme="blueprint"] header.panel,
html[data-visual-theme="blueprint"] aside.panel,
html[data-visual-theme="blueprint"] main.panel,
html[data-visual-theme="blueprint"] .splash-content,
html[data-visual-theme="blueprint"] .wiki-modal-content,
html[data-visual-theme="blueprint"] .modal-content,
html[data-visual-theme="blueprint"] .dialog-content.panel {
  background: rgba(0, 31, 63, 0.9) !important;
  border: 1px solid rgba(77, 184, 255, 0.38) !important;
  border-radius: 4px !important;
  box-shadow: 0 0 0 1px rgba(77, 184, 255, 0.12), inset 0 0 20px rgba(77, 184, 255, 0.04) !important;
  color: #c7e6ff !important;
  backdrop-filter: blur(8px) !important;
  -webkit-backdrop-filter: blur(8px) !important;
}

html[data-visual-theme="blueprint"] header.panel h1,
html[data-visual-theme="blueprint"] .splash-info h2,
html[data-visual-theme="blueprint"] .wiki-header h3,
html[data-visual-theme="blueprint"] .modal-header h2 {
  color: #4db8ff !important;
  text-transform: uppercase !important;
  letter-spacing: 0.08em !important;
}

html[data-visual-theme="blueprint"] .sub,
html[data-visual-theme="blueprint"] label,
html[data-visual-theme="blueprint"] p,
html[data-visual-theme="blueprint"] .description,
html[data-visual-theme="blueprint"] .wiki-body,
html[data-visual-theme="blueprint"] .modal-body {
  color: rgba(77, 184, 255, 0.7) !important;
  text-transform: uppercase !important;
  letter-spacing: 0.04em !important;
}

html[data-visual-theme="blueprint"] .control-group,
html[data-visual-theme="blueprint"] .panel-section,
html[data-visual-theme="blueprint"] .group,
html[data-visual-theme="blueprint"] .box,
html[data-visual-theme="blueprint"] .settings-group,
html[data-visual-theme="blueprint"] fieldset,
html[data-visual-theme="blueprint"] .dock,
html[data-visual-theme="blueprint"] .properties-panel,
html[data-visual-theme="blueprint"] .zoom-controls,
html[data-visual-theme="blueprint"] .level-card,
html[data-visual-theme="blueprint"] .panel-section-preview,
html[data-visual-theme="blueprint"] .toast {
  background: rgba(0, 31, 63, 0.8) !important;
  border: 1px solid rgba(77, 184, 255, 0.3) !important;
  border-radius: 4px !important;
  box-shadow: 0 0 10px rgba(77, 184, 255, 0.08) !important;
}

html[data-visual-theme="blueprint"] button,
html[data-visual-theme="blueprint"] .btn,
html[data-visual-theme="blueprint"] input,
html[data-visual-theme="blueprint"] select,
html[data-visual-theme="blueprint"] textarea,
html[data-visual-theme="blueprint"] .back-to-home,
html[data-visual-theme="blueprint"] #wiki-open-btn,
html[data-visual-theme="blueprint"] #theme-toggle,
html[data-visual-theme="blueprint"] #splash-close-btn,
html[data-visual-theme="blueprint"] #wiki-close-btn,
html[data-visual-theme="blueprint"] .modal-close-btn {
  background: rgba(0, 31, 63, 0.8) !important;
  border: 1px solid rgba(77, 184, 255, 0.35) !important;
  color: #4db8ff !important;
  border-radius: 2px !important;
  text-transform: uppercase !important;
  letter-spacing: 0.08em !important;
}

html[data-visual-theme="blueprint"] input:focus,
html[data-visual-theme="blueprint"] select:focus,
html[data-visual-theme="blueprint"] textarea:focus {
  border-color: #4db8ff !important;
  box-shadow: 0 0 0 3px rgba(77, 184, 255, 0.25) !important;
}

html[data-visual-theme="blueprint"] .version-badge,
html[data-visual-theme="blueprint"] .badge {
  background: rgba(0, 31, 63, 0.9) !important;
  border: 1px solid rgba(77, 184, 255, 0.3) !important;
  color: #4db8ff !important;
  border-radius: 2px !important;
  text-transform: uppercase !important;
  letter-spacing: 0.08em !important;
}
`;
      return;
    }

    if (theme === 'custom') {
      styleEl.textContent = `
html[data-visual-theme="custom"] body::before,
html[data-visual-theme="custom"] header.panel::before,
html[data-visual-theme="custom"] .wiki-header::before {
  content: none !important;
  background-image: none !important;
  opacity: 0 !important;
}

html[data-visual-theme="custom"] body {
  font-family: var(--font-family-sans) !important;
}

html[data-theme="light"][data-visual-theme="custom"] body {
  background: #f5f5f7 !important;
}

html[data-theme="dark"][data-visual-theme="custom"] body {
  background: #000000 !important;
}

html[data-visual-theme="custom"][data-custom-bg] body {
  background: var(--custom-hub-bg) !important;
}

html[data-visual-theme="custom"] .panel,
html[data-visual-theme="custom"] header.panel,
html[data-visual-theme="custom"] aside.panel,
html[data-visual-theme="custom"] main.panel,
html[data-visual-theme="custom"] .splash-content,
html[data-visual-theme="custom"] .wiki-modal-content,
html[data-visual-theme="custom"] .modal-content,
html[data-visual-theme="custom"] .dialog-content.panel {
  border-radius: 20px !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

html[data-theme="light"][data-visual-theme="custom"] .panel,
html[data-theme="light"][data-visual-theme="custom"] header.panel,
html[data-theme="light"][data-visual-theme="custom"] aside.panel,
html[data-theme="light"][data-visual-theme="custom"] main.panel,
html[data-theme="light"][data-visual-theme="custom"] .splash-content,
html[data-theme="light"][data-visual-theme="custom"] .wiki-modal-content,
html[data-theme="light"][data-visual-theme="custom"] .modal-content,
html[data-theme="light"][data-visual-theme="custom"] .dialog-content.panel {
  background: #ffffff !important;
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
  color: #111111 !important;
}

html[data-theme="dark"][data-visual-theme="custom"] .panel,
html[data-theme="dark"][data-visual-theme="custom"] header.panel,
html[data-theme="dark"][data-visual-theme="custom"] aside.panel,
html[data-theme="dark"][data-visual-theme="custom"] main.panel,
html[data-theme="dark"][data-visual-theme="custom"] .splash-content,
html[data-theme="dark"][data-visual-theme="custom"] .wiki-modal-content,
html[data-theme="dark"][data-visual-theme="custom"] .modal-content,
html[data-theme="dark"][data-visual-theme="custom"] .dialog-content.panel {
  background: #0b0b0f !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  color: #f5f5f7 !important;
}

html[data-theme="light"][data-visual-theme="custom"] header.panel h1,
html[data-theme="light"][data-visual-theme="custom"] .sub,
html[data-theme="light"][data-visual-theme="custom"] label,
html[data-theme="light"][data-visual-theme="custom"] p,
html[data-theme="light"][data-visual-theme="custom"] .description,
html[data-theme="light"][data-visual-theme="custom"] .wiki-body,
html[data-theme="light"][data-visual-theme="custom"] .modal-body {
  color: #111111 !important;
}

html[data-theme="dark"][data-visual-theme="custom"] header.panel h1,
html[data-theme="dark"][data-visual-theme="custom"] .sub,
html[data-theme="dark"][data-visual-theme="custom"] label,
html[data-theme="dark"][data-visual-theme="custom"] p,
html[data-theme="dark"][data-visual-theme="custom"] .description,
html[data-theme="dark"][data-visual-theme="custom"] .wiki-body,
html[data-theme="dark"][data-visual-theme="custom"] .modal-body {
  color: #f5f5f7 !important;
}

html[data-visual-theme="custom"] .control-group,
html[data-visual-theme="custom"] .panel-section,
html[data-visual-theme="custom"] .group,
html[data-visual-theme="custom"] .box,
html[data-visual-theme="custom"] .settings-group,
html[data-visual-theme="custom"] fieldset,
html[data-visual-theme="custom"] .dock,
html[data-visual-theme="custom"] .properties-panel,
html[data-visual-theme="custom"] .zoom-controls,
html[data-visual-theme="custom"] .level-card,
html[data-visual-theme="custom"] .panel-section-preview,
html[data-visual-theme="custom"] .toast {
  background: transparent !important;
  border: none !important;
  border-radius: 20px !important;
  box-shadow: none !important;
}

html[data-visual-theme="custom"] button,
html[data-visual-theme="custom"] .btn,
html[data-visual-theme="custom"] input,
html[data-visual-theme="custom"] select,
html[data-visual-theme="custom"] textarea,
html[data-visual-theme="custom"] .back-to-home,
html[data-visual-theme="custom"] #wiki-open-btn,
html[data-visual-theme="custom"] #theme-toggle,
html[data-visual-theme="custom"] #splash-close-btn,
html[data-visual-theme="custom"] #wiki-close-btn,
html[data-visual-theme="custom"] .modal-close-btn {
  border-radius: 999px !important;
  box-shadow: none !important;
}

html[data-theme="light"][data-visual-theme="custom"] button,
html[data-theme="light"][data-visual-theme="custom"] .btn,
html[data-theme="light"][data-visual-theme="custom"] input,
html[data-theme="light"][data-visual-theme="custom"] select,
html[data-theme="light"][data-visual-theme="custom"] textarea,
html[data-theme="light"][data-visual-theme="custom"] .back-to-home,
html[data-theme="light"][data-visual-theme="custom"] #wiki-open-btn,
html[data-theme="light"][data-visual-theme="custom"] #theme-toggle,
html[data-theme="light"][data-visual-theme="custom"] #splash-close-btn,
html[data-theme="light"][data-visual-theme="custom"] #wiki-close-btn,
html[data-theme="light"][data-visual-theme="custom"] .modal-close-btn {
  background: #ffffff !important;
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
  color: #111111 !important;
}

html[data-theme="dark"][data-visual-theme="custom"] button,
html[data-theme="dark"][data-visual-theme="custom"] .btn,
html[data-theme="dark"][data-visual-theme="custom"] input,
html[data-theme="dark"][data-visual-theme="custom"] select,
html[data-theme="dark"][data-visual-theme="custom"] textarea,
html[data-theme="dark"][data-visual-theme="custom"] .back-to-home,
html[data-theme="dark"][data-visual-theme="custom"] #wiki-open-btn,
html[data-theme="dark"][data-visual-theme="custom"] #theme-toggle,
html[data-theme="dark"][data-visual-theme="custom"] #splash-close-btn,
html[data-theme="dark"][data-visual-theme="custom"] #wiki-close-btn,
html[data-theme="dark"][data-visual-theme="custom"] .modal-close-btn {
  background: #101014 !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  color: #f5f5f7 !important;
}

html[data-visual-theme="custom"] .btn {
  background: var(--accent-color) !important;
  color: #ffffff !important;
  border-color: transparent !important;
  box-shadow: 0 10px 20px var(--accent-color-tint) !important;
}

html[data-visual-theme="custom"] input:focus,
html[data-visual-theme="custom"] select:focus,
html[data-visual-theme="custom"] textarea:focus {
  border-color: var(--accent-color) !important;
  box-shadow: 0 0 0 3px var(--accent-color-tint) !important;
}

html[data-visual-theme="custom"] .version-badge,
html[data-visual-theme="custom"] .badge {
  border-radius: 999px !important;
  background: transparent !important;
  border: 1px solid var(--accent-color-tint) !important;
  color: var(--accent-color) !important;
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
    if (!root || !root.querySelectorAll) return;

    if (state.theme !== 'comicbook' || !state.toolThemeImage) {
      root.querySelectorAll('.splash-image img').forEach((img) => {
        const currentSrc = img.getAttribute('src') || '';
        if (/Comicbook(?:_(?:light|dark))?\.png|glass(?:_(?:light|dark))?\.png/i.test(currentSrc)) {
          img.removeAttribute('src');
        }
      });
      return;
    }

    root.querySelectorAll('.splash-image img').forEach((img) => {
      img.setAttribute('src', state.toolThemeImage);
    });
  };

  let currentState = getThemeState();

  const applyVisualThemeState = () => {
    currentState = getThemeState();
    document.documentElement.dataset.visualTheme = currentState.theme;
    document.documentElement.dataset.visualThemeGroup = currentState.themeMeta.group;
    applyCustomThemeSettings(currentState.theme);
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
    if (event.key && !THEME_STORAGE_KEYS.includes(event.key)) return;
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
