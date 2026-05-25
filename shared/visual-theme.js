(() => {
  const STORAGE_KEY = 'vgtools-visual-theme';
  const STYLE_ID = 'vgtools-visual-theme-overrides';
  const HEADER_STYLE_ID = 'vgtools-theme-header-image-style';
  const PATTERN_STYLE_ID = 'vgtools-theme-pattern-style';
  const RETURN_STYLE_ID = 'vgtools-theme-return-transition-style';
  const COLOR_THEME_KEY = 'creative-toolkit-theme';
  const COLOR_THEME_LABELS = {
    light: '☀',
    dark: '☾',
    system: '⚙',
  };
  const COLOR_THEME_NAMES = {
    light: 'Light',
    dark: 'Dark',
    system: 'Auto',
  };

  const THEMES = {
    comicbook: { assetFile: 'Comicbook.png', usesArtwork: true, usesPattern: true, transition: 'comic', group: 'visual' },
    glassui: { assetFile: 'glass.png', usesArtwork: true, usesPattern: true, transition: 'glass', group: 'visual' },
    minimal:  { assetFile: null, usesArtwork: false, usesPattern: false, transition: 'minimal',  group: 'basic' },
    emoji:    { assetFile: null, usesArtwork: false, usesPattern: false, transition: 'emoji',    group: 'basic' },
    terminal: { assetFile: null, usesArtwork: false, usesPattern: false, transition: 'terminal', group: 'basic' },
    noir:     { assetFile: null, usesArtwork: true,  usesPattern: false, transition: 'noir',     group: 'basic' },
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
    isocubes: ['🧊', '◻️', '📦', '📐'],
    bubblescale: ['🫧', '⚪', '📊', '🔵'],
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

.theme-return-overlay.terminal {
  background: #020502;
  overflow: hidden;
}

.theme-return-overlay.terminal::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(0, 255, 65, 0.08), rgba(0, 255, 65, 0.02)),
    repeating-linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.07) 0 1px,
      transparent 1px 4px
    );
  opacity: 0.28;
}

.theme-return-overlay.terminal::after {
  content: '> cd ~/home';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) scale(0.92);
  color: #00ff41;
  font-family: "JetBrains Mono", ui-monospace, monospace;
  font-size: clamp(18px, 2.8vw, 36px);
  letter-spacing: 0.08em;
  text-shadow: 0 0 10px rgba(0, 255, 65, 0.28);
  opacity: 0;
}

.theme-return-overlay.terminal.animate {
  animation: themeReturnTerminal 560ms steps(8, end) forwards;
}

.theme-return-overlay.terminal.animate::after {
  animation: themeReturnTerminalText 520ms ease-out forwards;
}

@keyframes themeReturnTerminal {
  0% { opacity: 0; transform: scaleY(1.08); filter: brightness(1.25); }
  18% { opacity: 1; }
  100% { opacity: 0; transform: scaleY(0.98); filter: brightness(0.95); }
}

@keyframes themeReturnTerminalText {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.84); }
  30% { opacity: 1; transform: translate(-50%, -50%) scale(1.02); }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(1.06); }
}

.theme-return-overlay.noir {
  background:
    radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0) 36%),
    #080808;
  overflow: hidden;
}

.theme-return-overlay.noir::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23g)' opacity='1'/%3E%3C/svg%3E");
  opacity: 0.12;
  mix-blend-mode: screen;
}

.theme-return-overlay.noir::after {
  content: '';
  position: absolute;
  inset: 18%;
  border: 1px solid rgba(255, 245, 230, 0.34);
  transform: translate(8px, 8px);
  opacity: 0;
}

.theme-return-overlay.noir.animate {
  animation: themeReturnNoir 560ms cubic-bezier(0.2, 0.84, 0.3, 1) forwards;
}

.theme-return-overlay.noir.animate::after {
  animation: themeReturnNoirFrame 520ms ease-out forwards;
}

@keyframes themeReturnNoir {
  0% { opacity: 0; transform: scaleX(0.8); }
  22% { opacity: 1; }
  100% { opacity: 0; transform: scaleX(1.06); }
}

@keyframes themeReturnNoirFrame {
  0% { opacity: 0; transform: translate(10px, 10px); }
  30% { opacity: 0.7; transform: translate(4px, 4px); }
  100% { opacity: 0; transform: translate(0, 0); }
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
      }, transitionVariant === 'comic' ? 840
        : transitionVariant === 'glass' ? 900
          : transitionVariant === 'emoji' ? 780
            : transitionVariant === 'terminal' ? 560
              : transitionVariant === 'noir' ? 560
                : 620);
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

    if (theme === 'terminal' && !document.getElementById('vgtools-terminal-font')) {
      const fontLink = document.createElement('link');
      fontLink.id = 'vgtools-terminal-font';
      fontLink.rel = 'stylesheet';
      fontLink.href = 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap';
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
  --accent-color-tint: rgba(0,255,65,0.10) !important;
}
html[data-visual-theme="terminal"] body {
  background: #060a06 !important;
  color: #00ff41 !important;
  font-family: "JetBrains Mono", ui-monospace, "Courier New", monospace !important;
}
html[data-visual-theme="terminal"] body::before {
  content: "" !important;
  position: fixed !important;
  inset: 0 !important;
  z-index: 99999 !important;
  pointer-events: none !important;
  background: repeating-linear-gradient(
    to bottom,
    rgba(0,0,0,0.07) 0px, rgba(0,0,0,0.07) 1px,
    transparent 1px, transparent 3px
  ) !important;
  opacity: 1 !important;
  mix-blend-mode: normal !important;
}
html[data-visual-theme="terminal"] header.panel::before,
html[data-visual-theme="terminal"] .wiki-header::before {
  content: none !important;
  background-image: none !important;
  opacity: 0 !important;
}
html[data-visual-theme="terminal"] .panel,
html[data-visual-theme="terminal"] header.panel,
html[data-visual-theme="terminal"] aside.panel,
html[data-visual-theme="terminal"] main.panel,
html[data-visual-theme="terminal"] .splash-content,
html[data-visual-theme="terminal"] .wiki-modal-content,
html[data-visual-theme="terminal"] .modal-content,
html[data-visual-theme="terminal"] .dialog-content.panel {
  background: #0a0e0a !important;
  border: 1px solid rgba(0,255,65,0.4) !important;
  border-radius: 0 !important;
  box-shadow: 0 0 12px rgba(0,255,65,0.12) !important;
  color: #00ff41 !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  font-family: "JetBrains Mono", ui-monospace, monospace !important;
}
html[data-visual-theme="terminal"] h1,
html[data-visual-theme="terminal"] h2,
html[data-visual-theme="terminal"] h3,
html[data-visual-theme="terminal"] header.panel h1 {
  font-family: "JetBrains Mono", ui-monospace, monospace !important;
  color: #00ff41 !important;
  text-shadow: 0 0 8px rgba(0,255,65,0.55) !important;
}
html[data-visual-theme="terminal"] p,
html[data-visual-theme="terminal"] label,
html[data-visual-theme="terminal"] .sub,
html[data-visual-theme="terminal"] .description,
html[data-visual-theme="terminal"] header.panel .sub {
  font-family: "JetBrains Mono", ui-monospace, monospace !important;
  color: rgba(0,255,65,0.75) !important;
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
  background: transparent !important;
  border: 1px solid rgba(0,255,65,0.18) !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}
html[data-visual-theme="terminal"] input,
html[data-visual-theme="terminal"] select,
html[data-visual-theme="terminal"] textarea {
  background: #060a06 !important;
  color: #00ff41 !important;
  border: 1px solid rgba(0,255,65,0.35) !important;
  border-radius: 0 !important;
  font-family: "JetBrains Mono", ui-monospace, monospace !important;
  box-shadow: none !important;
  caret-color: #00ff41 !important;
}
html[data-visual-theme="terminal"] input::placeholder,
html[data-visual-theme="terminal"] textarea::placeholder {
  color: rgba(0,255,65,0.3) !important;
}
html[data-visual-theme="terminal"] input:focus,
html[data-visual-theme="terminal"] select:focus,
html[data-visual-theme="terminal"] textarea:focus {
  border-color: #00ff41 !important;
  box-shadow: 0 0 0 2px rgba(0,255,65,0.15), 0 0 8px rgba(0,255,65,0.2) !important;
  outline: none !important;
}
html[data-visual-theme="terminal"] input[type="range"] {
  background: transparent !important;
  accent-color: #00ff41 !important;
  border: none !important;
}
html[data-visual-theme="terminal"] button,
html[data-visual-theme="terminal"] .btn,
html[data-visual-theme="terminal"] .back-to-home,
html[data-visual-theme="terminal"] #wiki-open-btn,
html[data-visual-theme="terminal"] #theme-toggle,
html[data-visual-theme="terminal"] #splash-close-btn,
html[data-visual-theme="terminal"] #wiki-close-btn,
html[data-visual-theme="terminal"] .modal-close-btn {
  background: #0a0e0a !important;
  color: #00ff41 !important;
  border: 1px solid rgba(0,255,65,0.45) !important;
  border-radius: 0 !important;
  font-family: "JetBrains Mono", ui-monospace, monospace !important;
  box-shadow: 0 0 6px rgba(0,255,65,0.12) !important;
  backdrop-filter: none !important;
  text-shadow: 0 0 5px rgba(0,255,65,0.35) !important;
}
html[data-visual-theme="terminal"] button:hover,
html[data-visual-theme="terminal"] .btn:hover,
html[data-visual-theme="terminal"] .back-to-home:hover {
  background: rgba(0,255,65,0.08) !important;
  border-color: #00ff41 !important;
  box-shadow: 0 0 12px rgba(0,255,65,0.3) !important;
}
html[data-visual-theme="terminal"] .btn {
  background: rgba(0,255,65,0.1) !important;
  border-color: #00ff41 !important;
}
html[data-visual-theme="terminal"] .version-badge,
html[data-visual-theme="terminal"] .badge {
  background: #0a0e0a !important;
  border: 1px solid rgba(0,255,65,0.3) !important;
  color: #00ff41 !important;
  border-radius: 0 !important;
  font-family: "JetBrains Mono", ui-monospace, monospace !important;
}
html[data-visual-theme="terminal"] .splash-image { display: none !important; }
html[data-visual-theme="terminal"] .splash-info {
  padding: 0 !important;
  border: none !important;
  background: transparent !important;
}
html[data-visual-theme="terminal"] .wiki-header {
  background: #0a0e0a !important;
  background-image: none !important;
  border-bottom: 1px solid rgba(0,255,65,0.25) !important;
  color: #00ff41 !important;
}
html[data-visual-theme="terminal"] ::-webkit-scrollbar { background: #060a06; width: 6px; }
html[data-visual-theme="terminal"] ::-webkit-scrollbar-thumb { background: rgba(0,255,65,0.3); border-radius: 0; }
html[data-visual-theme="terminal"] ::-webkit-scrollbar-thumb:hover { background: rgba(0,255,65,0.55); }

/* ---- TERMINAL LIGHT MODE ---- */
html[data-theme="light"][data-visual-theme="terminal"] {
  --accent-color: #0a5c1a !important;
  --accent-color-tint: rgba(10,92,26,0.08) !important;
}
html[data-theme="light"][data-visual-theme="terminal"] body {
  background: #f2f8f2 !important;
  color: #0a5c1a !important;
}
html[data-theme="light"][data-visual-theme="terminal"] body::before {
  background: repeating-linear-gradient(
    to bottom,
    rgba(10,92,26,0.03) 0px, rgba(10,92,26,0.03) 1px,
    transparent 1px, transparent 3px
  ) !important;
}
html[data-theme="light"][data-visual-theme="terminal"] .panel,
html[data-theme="light"][data-visual-theme="terminal"] header.panel,
html[data-theme="light"][data-visual-theme="terminal"] aside.panel,
html[data-theme="light"][data-visual-theme="terminal"] main.panel,
html[data-theme="light"][data-visual-theme="terminal"] .splash-content,
html[data-theme="light"][data-visual-theme="terminal"] .wiki-modal-content,
html[data-theme="light"][data-visual-theme="terminal"] .modal-content,
html[data-theme="light"][data-visual-theme="terminal"] .dialog-content.panel {
  background: #ffffff !important;
  border-color: rgba(10,92,26,0.22) !important;
  box-shadow: 0 0 10px rgba(10,92,26,0.06) !important;
  color: #0a5c1a !important;
}
html[data-theme="light"][data-visual-theme="terminal"] h1,
html[data-theme="light"][data-visual-theme="terminal"] h2,
html[data-theme="light"][data-visual-theme="terminal"] h3,
html[data-theme="light"][data-visual-theme="terminal"] header.panel h1 {
  color: #0a5c1a !important;
  text-shadow: none !important;
}
html[data-theme="light"][data-visual-theme="terminal"] p,
html[data-theme="light"][data-visual-theme="terminal"] label,
html[data-theme="light"][data-visual-theme="terminal"] .sub,
html[data-theme="light"][data-visual-theme="terminal"] .description,
html[data-theme="light"][data-visual-theme="terminal"] header.panel .sub {
  color: rgba(10,92,26,0.7) !important;
}
html[data-theme="light"][data-visual-theme="terminal"] .control-group,
html[data-theme="light"][data-visual-theme="terminal"] .panel-section,
html[data-theme="light"][data-visual-theme="terminal"] .group,
html[data-theme="light"][data-visual-theme="terminal"] .box,
html[data-theme="light"][data-visual-theme="terminal"] .settings-group,
html[data-theme="light"][data-visual-theme="terminal"] fieldset,
html[data-theme="light"][data-visual-theme="terminal"] .dock,
html[data-theme="light"][data-visual-theme="terminal"] .properties-panel,
html[data-theme="light"][data-visual-theme="terminal"] .zoom-controls,
html[data-theme="light"][data-visual-theme="terminal"] .level-card,
html[data-theme="light"][data-visual-theme="terminal"] .panel-section-preview,
html[data-theme="light"][data-visual-theme="terminal"] .toast {
  border-color: rgba(10,92,26,0.14) !important;
}
html[data-theme="light"][data-visual-theme="terminal"] input,
html[data-theme="light"][data-visual-theme="terminal"] select,
html[data-theme="light"][data-visual-theme="terminal"] textarea {
  background: #ffffff !important;
  color: #0a5c1a !important;
  border-color: rgba(10,92,26,0.28) !important;
  caret-color: #0a5c1a !important;
}
html[data-theme="light"][data-visual-theme="terminal"] input::placeholder,
html[data-theme="light"][data-visual-theme="terminal"] textarea::placeholder {
  color: rgba(10,92,26,0.35) !important;
}
html[data-theme="light"][data-visual-theme="terminal"] input:focus,
html[data-theme="light"][data-visual-theme="terminal"] select:focus,
html[data-theme="light"][data-visual-theme="terminal"] textarea:focus {
  border-color: #0a5c1a !important;
  box-shadow: 0 0 0 2px rgba(10,92,26,0.12) !important;
}
html[data-theme="light"][data-visual-theme="terminal"] input[type="range"] {
  accent-color: #0a5c1a !important;
}
html[data-theme="light"][data-visual-theme="terminal"] button,
html[data-theme="light"][data-visual-theme="terminal"] .btn,
html[data-theme="light"][data-visual-theme="terminal"] .back-to-home,
html[data-theme="light"][data-visual-theme="terminal"] #wiki-open-btn,
html[data-theme="light"][data-visual-theme="terminal"] #theme-toggle,
html[data-theme="light"][data-visual-theme="terminal"] #splash-close-btn,
html[data-theme="light"][data-visual-theme="terminal"] #wiki-close-btn,
html[data-theme="light"][data-visual-theme="terminal"] .modal-close-btn {
  background: #f2f8f2 !important;
  color: #0a5c1a !important;
  border-color: rgba(10,92,26,0.3) !important;
  box-shadow: none !important;
  text-shadow: none !important;
}
html[data-theme="light"][data-visual-theme="terminal"] button:hover,
html[data-theme="light"][data-visual-theme="terminal"] .btn:hover,
html[data-theme="light"][data-visual-theme="terminal"] .back-to-home:hover {
  background: rgba(10,92,26,0.07) !important;
  border-color: #0a5c1a !important;
  box-shadow: none !important;
}
html[data-theme="light"][data-visual-theme="terminal"] .btn {
  background: rgba(10,92,26,0.07) !important;
  border-color: rgba(10,92,26,0.4) !important;
}
html[data-theme="light"][data-visual-theme="terminal"] .version-badge,
html[data-theme="light"][data-visual-theme="terminal"] .badge {
  background: #f2f8f2 !important;
  border-color: rgba(10,92,26,0.22) !important;
  color: #0a5c1a !important;
}
html[data-theme="light"][data-visual-theme="terminal"] .wiki-header {
  background: #ffffff !important;
  border-bottom-color: rgba(10,92,26,0.18) !important;
  color: #0a5c1a !important;
}
html[data-theme="light"][data-visual-theme="terminal"] ::-webkit-scrollbar { background: #e8f4e8; }
html[data-theme="light"][data-visual-theme="terminal"] ::-webkit-scrollbar-thumb { background: rgba(10,92,26,0.25); }
html[data-theme="light"][data-visual-theme="terminal"] ::-webkit-scrollbar-thumb:hover { background: rgba(10,92,26,0.45); }
`;
      return;
    }

    if (theme === 'noir') {
      styleEl.textContent = `
html[data-visual-theme="noir"] {
  --font-family-sans: Georgia, "Times New Roman", serif !important;
  --font-family-mono: "Courier New", Consolas, monospace !important;
}

html[data-theme="light"][data-visual-theme="noir"] {
  --accent-color: #191715 !important;
  --accent-color-tint: rgba(25, 23, 21, 0.12) !important;
  --accent-yellow: #191715 !important;
  --color-accent-text: #f4ede3 !important;
  --ink: #191715 !important;
  --muted: rgba(25, 23, 21, 0.66) !important;
  --surface: #f4ede3 !important;
  --surface-alt: #ece3d7 !important;
  --border-color: #191715 !important;
  --radius-sm: 0px !important;
  --radius-md: 0px !important;
  --radius-lg: 0px !important;
  --radius-xl: 0px !important;
  --shadow-raised-2: 4px 4px 0 rgba(25, 23, 21, 0.16) !important;
  --shadow-floating-3: 8px 8px 0 rgba(25, 23, 21, 0.22) !important;
  --panel-shadow: 6px 6px 0 rgba(25, 23, 21, 0.22) !important;
}

html[data-theme="dark"][data-visual-theme="noir"] {
  --accent-color: #efe6da !important;
  --accent-color-tint: rgba(239, 230, 218, 0.14) !important;
  --accent-yellow: #efe6da !important;
  --color-accent-text: #0b0a09 !important;
  --ink: #efe6da !important;
  --muted: rgba(239, 230, 218, 0.72) !important;
  --surface: #0b0a09 !important;
  --surface-alt: #161311 !important;
  --border-color: #efe6da !important;
  --radius-sm: 0px !important;
  --radius-md: 0px !important;
  --radius-lg: 0px !important;
  --radius-xl: 0px !important;
  --shadow-raised-2: 4px 4px 0 rgba(0, 0, 0, 0.3) !important;
  --shadow-floating-3: 8px 8px 0 rgba(0, 0, 0, 0.42) !important;
  --panel-shadow: 6px 6px 0 rgba(0, 0, 0, 0.4) !important;
}

html[data-visual-theme="noir"] body {
  font-family: var(--font-family-sans) !important;
  background: var(--surface-alt) !important;
  color: var(--ink) !important;
  letter-spacing: 0.01em !important;
}

html[data-visual-theme="noir"] body::before {
  content: '' !important;
  position: fixed !important;
  inset: 0 !important;
  pointer-events: none !important;
  z-index: 9999 !important;
  background:
    radial-gradient(circle at 18% 18%, rgba(0, 0, 0, 0.06) 0%, rgba(0, 0, 0, 0) 38%),
    radial-gradient(circle at 82% 8%, rgba(0, 0, 0, 0.04) 0%, rgba(0, 0, 0, 0) 34%),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23g)' opacity='1'/%3E%3C/svg%3E") !important;
  opacity: 0.08 !important;
  mix-blend-mode: multiply !important;
}

html[data-theme="dark"][data-visual-theme="noir"] body::before {
  opacity: 0.1 !important;
  mix-blend-mode: screen !important;
}

html[data-visual-theme="noir"] header.panel,
html[data-visual-theme="noir"] .wiki-header {
  position: relative !important;
  overflow: hidden !important;
  isolation: isolate !important;
}

html[data-visual-theme="noir"] header.panel::before {
  content: '' !important;
  position: absolute !important;
  inset: 0 !important;
  background-image: var(--tool-theme-header-image) !important;
  background-size: cover !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
  opacity: 0.22 !important;
  filter: grayscale(1) contrast(1.24) sepia(0.28) saturate(0.38) brightness(0.9) !important;
  mix-blend-mode: multiply !important;
  transform: scale(1.03) !important;
  z-index: 0 !important;
}

html[data-theme="dark"][data-visual-theme="noir"] header.panel::before {
  opacity: 0.16 !important;
  mix-blend-mode: screen !important;
}

html[data-visual-theme="noir"] header.panel::after {
  content: '' !important;
  position: absolute !important;
  inset: 0 !important;
  background:
    linear-gradient(90deg, rgba(244, 237, 227, 0.94) 0%, rgba(244, 237, 227, 0.9) 48%, rgba(244, 237, 227, 0.76) 100%),
    linear-gradient(180deg, rgba(25, 23, 21, 0.04) 0%, rgba(25, 23, 21, 0) 42%, rgba(25, 23, 21, 0.1) 100%) !important;
  z-index: 0 !important;
}

html[data-theme="dark"][data-visual-theme="noir"] header.panel::after {
  background:
    linear-gradient(90deg, rgba(11, 10, 9, 0.92) 0%, rgba(11, 10, 9, 0.88) 48%, rgba(11, 10, 9, 0.72) 100%),
    linear-gradient(180deg, rgba(239, 230, 218, 0.03) 0%, rgba(239, 230, 218, 0) 42%, rgba(239, 230, 218, 0.07) 100%) !important;
}

html[data-visual-theme="noir"] .wiki-header::before,
html[data-visual-theme="noir"] .wiki-header::after {
  content: none !important;
  background: none !important;
  background-image: none !important;
  opacity: 0 !important;
}

html[data-visual-theme="noir"] header.panel > * {
  position: relative !important;
  z-index: 1 !important;
}

html[data-visual-theme="noir"] .splash-overlay,
html[data-visual-theme="noir"] .popup-overlay {
  background: rgba(8, 8, 8, 0.66) !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

html[data-visual-theme="noir"] .panel,
html[data-visual-theme="noir"] header.panel,
html[data-visual-theme="noir"] aside.panel,
html[data-visual-theme="noir"] .splash-content,
html[data-visual-theme="noir"] .wiki-modal-content,
html[data-visual-theme="noir"] .modal-content,
html[data-visual-theme="noir"] .dialog-content.panel,
html[data-visual-theme="noir"] .popup-content {
  background: var(--surface) !important;
  background-image: none !important;
  color: var(--ink) !important;
  border: 2px solid var(--border-color) !important;
  border-radius: 0 !important;
  box-shadow: 6px 6px 0 var(--border-color) !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

html[data-visual-theme="noir"] main.panel {
  background-color: var(--surface) !important;
  color: var(--ink) !important;
  border: 2px solid var(--border-color) !important;
  border-radius: 0 !important;
  box-shadow: 6px 6px 0 var(--border-color) !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

html[data-visual-theme="noir"] header.panel {
  background: var(--surface) !important;
  color: var(--ink) !important;
  border-bottom-width: 3px !important;
}

html[data-visual-theme="noir"] .wiki-header {
  background: var(--ink) !important;
  color: var(--surface) !important;
}

html[data-visual-theme="noir"] .wiki-header {
  min-height: 82px !important;
  height: auto !important;
  border-bottom: 2px solid var(--border-color) !important;
}

html[data-visual-theme="noir"] h1,
html[data-visual-theme="noir"] h2,
html[data-visual-theme="noir"] h3,
html[data-visual-theme="noir"] .splash-info h2,
html[data-visual-theme="noir"] .splash-title,
html[data-visual-theme="noir"] .wiki-header h3,
html[data-visual-theme="noir"] .modal-header h2,
html[data-visual-theme="noir"] .control-group-title,
html[data-visual-theme="noir"] .level-header,
html[data-visual-theme="noir"] .section-title,
html[data-visual-theme="noir"] .panel-header {
  font-family: var(--font-family-sans) !important;
  font-weight: 700 !important;
  letter-spacing: 0.08em !important;
  text-transform: uppercase !important;
  text-shadow: none !important;
  color: var(--ink) !important;
}

html[data-visual-theme="noir"] header.panel h1 {
  color: var(--ink) !important;
}

html[data-visual-theme="noir"] header.panel .sub {
  color: var(--muted) !important;
}

html[data-visual-theme="noir"] .wiki-header h3 {
  color: var(--surface) !important;
}

html[data-visual-theme="noir"] p,
html[data-visual-theme="noir"] li,
html[data-visual-theme="noir"] .sub,
html[data-visual-theme="noir"] .description,
html[data-visual-theme="noir"] .feature-item,
html[data-visual-theme="noir"] .wiki-body,
html[data-visual-theme="noir"] .modal-body,
html[data-visual-theme="noir"] .note,
html[data-visual-theme="noir"] .empty-state,
html[data-visual-theme="noir"] .placeholder,
html[data-visual-theme="noir"] small {
  font-family: var(--font-family-sans) !important;
  color: var(--muted) !important;
}

html[data-visual-theme="noir"] label,
html[data-visual-theme="noir"] legend,
html[data-visual-theme="noir"] .form-group label,
html[data-visual-theme="noir"] #wiki-content h4,
html[data-visual-theme="noir"] .panel-header,
html[data-visual-theme="noir"] .control-group-title,
html[data-visual-theme="noir"] .section-title {
  color: var(--ink) !important;
}

html[data-visual-theme="noir"] a {
  color: var(--ink) !important;
  text-decoration-color: currentColor !important;
}

html[data-visual-theme="noir"] .splash-content {
  display: grid !important;
  grid-template-columns: minmax(0, 1.06fr) minmax(300px, 0.94fr) !important;
  align-items: stretch !important;
  width: min(980px, calc(100vw - 40px)) !important;
  height: auto !important;
  max-height: min(92vh, 820px) !important;
  padding: 22px !important;
  gap: 22px !important;
  overflow: auto !important;
}

html[data-visual-theme="noir"] .splash-image {
  display: block !important;
  min-height: 420px !important;
  background: var(--surface-alt) !important;
  border: 2px solid var(--border-color) !important;
  box-shadow: 4px 4px 0 var(--border-color) !important;
  position: relative !important;
  overflow: hidden !important;
}

html[data-visual-theme="noir"] .splash-image::after {
  content: 'VGTOOLS PRESS' !important;
  position: absolute !important;
  left: 16px !important;
  bottom: 16px !important;
  z-index: 2 !important;
  padding: 5px 10px 4px !important;
  font-family: var(--font-family-mono) !important;
  font-size: 10px !important;
  letter-spacing: 0.16em !important;
  text-transform: uppercase !important;
  background: rgba(244, 237, 227, 0.9) !important;
  color: #191715 !important;
  border: 1px solid #191715 !important;
}

html[data-theme="dark"][data-visual-theme="noir"] .splash-image::after {
  background: rgba(11, 10, 9, 0.9) !important;
  color: #efe6da !important;
  border-color: #efe6da !important;
}

html[data-visual-theme="noir"] .splash-image img {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  opacity: 1 !important;
  filter: grayscale(1) contrast(1.2) sepia(0.26) saturate(0.4) brightness(0.94) !important;
}

html[data-visual-theme="noir"] .splash-info {
  flex: 1 1 auto !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 20px !important;
  padding: 0 !important;
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
}

html[data-visual-theme="noir"] .splash-info h2,
html[data-visual-theme="noir"] .splash-title {
  font-size: clamp(30px, 5vw, 48px) !important;
  line-height: 1.05 !important;
  margin: 0 !important;
}

html[data-visual-theme="noir"] .features {
  gap: 0 !important;
  margin-top: 18px !important;
}

html[data-visual-theme="noir"] .feature-item {
  padding: 12px 0 !important;
  border-top: 1px solid rgba(127, 127, 127, 0.28) !important;
  background: none !important;
}

html[data-visual-theme="noir"] .feature-item:last-child {
  border-bottom: 1px solid rgba(127, 127, 127, 0.28) !important;
}

html[data-visual-theme="noir"] .footer {
  border-top: 1px solid rgba(127, 127, 127, 0.28) !important;
  padding-top: 14px !important;
}

html[data-visual-theme="noir"] .control-group,
html[data-visual-theme="noir"] .panel-section,
html[data-visual-theme="noir"] .group,
html[data-visual-theme="noir"] .box,
html[data-visual-theme="noir"] .settings-group,
html[data-visual-theme="noir"] fieldset,
html[data-visual-theme="noir"] .dock,
html[data-visual-theme="noir"] .properties-panel,
html[data-visual-theme="noir"] .zoom-controls,
html[data-visual-theme="noir"] .level-card,
html[data-visual-theme="noir"] .panel-section-preview,
html[data-visual-theme="noir"] .section-content,
html[data-visual-theme="noir"] .control-section {
  background: transparent !important;
  background-image: none !important;
  color: var(--ink) !important;
  border: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}

html[data-visual-theme="noir"] .card,
html[data-visual-theme="noir"] .empty-state,
html[data-visual-theme="noir"] .upload-zone,
html[data-visual-theme="noir"] .drop-zone,
html[data-visual-theme="noir"] .preview-viewer-container,
html[data-visual-theme="noir"] .toast,
html[data-visual-theme="noir"] .toast-notification,
html[data-visual-theme="noir"] .popup-content {
  background: var(--surface-alt) !important;
  background-image: none !important;
  color: var(--ink) !important;
  border: 2px solid var(--border-color) !important;
  border-radius: 0 !important;
  box-shadow: 4px 4px 0 var(--border-color) !important;
}

html[data-visual-theme="noir"] .panel hr,
html[data-visual-theme="noir"] .panel .divider,
html[data-visual-theme="noir"] .panel .separator,
html[data-visual-theme="noir"] .control-group + .control-group,
html[data-visual-theme="noir"] .note {
  border-color: rgba(127, 127, 127, 0.34) !important;
}

html[data-visual-theme="noir"] .canvas-hint {
  background: var(--ink) !important;
  color: var(--surface) !important;
  border: 2px solid var(--border-color) !important;
  border-radius: 0 !important;
  box-shadow: 4px 4px 0 var(--border-color) !important;
}

html[data-visual-theme="noir"] button,
html[data-visual-theme="noir"] .btn,
html[data-visual-theme="noir"] .back-to-home,
html[data-visual-theme="noir"] #wiki-open-btn,
html[data-visual-theme="noir"] #theme-toggle,
html[data-visual-theme="noir"] #splash-close-btn,
html[data-visual-theme="noir"] #wiki-close-btn,
html[data-visual-theme="noir"] .modal-close-btn,
html[data-visual-theme="noir"] .canvas-floating-btn,
html[data-visual-theme="noir"] .orientation-btn,
html[data-visual-theme="noir"] .bg-type-btn,
html[data-visual-theme="noir"] .device-btn {
  font-family: var(--font-family-sans) !important;
  letter-spacing: 0.05em !important;
  background: var(--surface) !important;
  color: var(--ink) !important;
  border: 2px solid var(--border-color) !important;
  border-radius: 0 !important;
  box-shadow: 3px 3px 0 var(--border-color) !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  transition: transform 0.12s ease, box-shadow 0.12s ease, background-color 0.12s ease !important;
}

html[data-visual-theme="noir"] button:hover,
html[data-visual-theme="noir"] .btn:hover,
html[data-visual-theme="noir"] .back-to-home:hover,
html[data-visual-theme="noir"] #wiki-open-btn:hover,
html[data-visual-theme="noir"] #theme-toggle:hover,
html[data-visual-theme="noir"] #splash-close-btn:hover,
html[data-visual-theme="noir"] #wiki-close-btn:hover,
html[data-visual-theme="noir"] .modal-close-btn:hover,
html[data-visual-theme="noir"] .canvas-floating-btn:hover,
html[data-visual-theme="noir"] .orientation-btn:hover,
html[data-visual-theme="noir"] .bg-type-btn:hover,
html[data-visual-theme="noir"] .device-btn:hover,
html[data-visual-theme="noir"] .upload-zone:hover {
  transform: translate(-1px, -1px) !important;
  background: var(--surface-alt) !important;
  box-shadow: 4px 4px 0 var(--border-color) !important;
}

html[data-visual-theme="noir"] button:active,
html[data-visual-theme="noir"] .btn:active,
html[data-visual-theme="noir"] .back-to-home:active,
html[data-visual-theme="noir"] .canvas-floating-btn:active {
  transform: translate(2px, 2px) !important;
  box-shadow: 1px 1px 0 var(--border-color) !important;
}

html[data-visual-theme="noir"] button:disabled,
html[data-visual-theme="noir"] .btn:disabled {
  opacity: 0.55 !important;
  transform: none !important;
  box-shadow: 2px 2px 0 rgba(127, 127, 127, 0.35) !important;
}

html[data-visual-theme="noir"] .btn-primary,
html[data-visual-theme="noir"] button.btn-primary,
html[data-visual-theme="noir"] .device-btn.active,
html[data-visual-theme="noir"] .orientation-btn.active,
html[data-visual-theme="noir"] .bg-type-btn.active,
html[data-visual-theme="noir"] .tab.active,
html[data-visual-theme="noir"] .tab-btn.active,
html[data-visual-theme="noir"] .panel-tab.active,
html[data-visual-theme="noir"] .mode-btn.active,
html[data-visual-theme="noir"] .tool-btn.active,
html[data-visual-theme="noir"] button.active,
html[data-visual-theme="noir"] .btn.active,
html[data-visual-theme="noir"] [aria-pressed="true"] {
  background: var(--accent-color) !important;
  color: var(--color-accent-text) !important;
  border-color: var(--border-color) !important;
  box-shadow: 4px 4px 0 var(--border-color) !important;
}

html[data-visual-theme="noir"] .device-btn.active small {
  color: inherit !important;
  opacity: 0.78 !important;
}

html[data-visual-theme="noir"] .color-btn,
html[data-visual-theme="noir"] .palette-swatch,
html[data-visual-theme="noir"] .gradient-card {
  border-radius: 0 !important;
}

html[data-visual-theme="noir"] .color-btn.active {
  border-color: var(--accent-color) !important;
  box-shadow: 4px 4px 0 var(--border-color) !important;
}

html[data-visual-theme="noir"] input,
html[data-visual-theme="noir"] select,
html[data-visual-theme="noir"] textarea,
html[data-visual-theme="noir"] .form-control,
html[data-visual-theme="noir"] .num-input {
  font-family: var(--font-family-sans) !important;
  background: var(--surface) !important;
  color: var(--ink) !important;
  border: 2px solid var(--border-color) !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}

html[data-visual-theme="noir"] input:focus,
html[data-visual-theme="noir"] select:focus,
html[data-visual-theme="noir"] textarea:focus,
html[data-visual-theme="noir"] .form-control:focus,
html[data-visual-theme="noir"] .num-input:focus {
  outline: none !important;
  box-shadow: 4px 4px 0 var(--border-color) !important;
}

html[data-visual-theme="noir"] input::placeholder,
html[data-visual-theme="noir"] textarea::placeholder {
  color: var(--muted) !important;
  opacity: 1 !important;
}

html[data-visual-theme="noir"] input[type="checkbox"],
html[data-visual-theme="noir"] input[type="radio"],
html[data-visual-theme="noir"] input[type="range"] {
  accent-color: var(--accent-color) !important;
}

html[data-visual-theme="noir"] .upload-zone svg,
html[data-visual-theme="noir"] .device-btn small,
html[data-visual-theme="noir"] .canvas-floating-btn svg,
html[data-visual-theme="noir"] .back-to-home svg {
  color: currentColor !important;
}

html[data-visual-theme="noir"] .version-badge,
html[data-visual-theme="noir"] .badge {
  font-family: var(--font-family-sans) !important;
  letter-spacing: 0.08em !important;
  background: var(--ink) !important;
  color: var(--surface) !important;
  border: 1px solid var(--border-color) !important;
  border-radius: 0 !important;
  box-shadow: 2px 2px 0 var(--border-color) !important;
}

html[data-visual-theme="noir"] kbd {
  background: var(--surface-alt) !important;
  color: var(--ink) !important;
  border: 1px solid var(--border-color) !important;
  border-radius: 0 !important;
  box-shadow: 2px 2px 0 var(--border-color) !important;
  font-family: var(--font-family-mono) !important;
}

html[data-visual-theme="noir"] .wiki-modal-content img,
html[data-visual-theme="noir"] .modal-content img {
  border-radius: 0 !important;
  border: 2px solid var(--border-color) !important;
  box-shadow: 4px 4px 0 var(--border-color) !important;
  filter: grayscale(1) contrast(1.05) !important;
}

html[data-visual-theme="noir"] [style*="rgba(79, 70, 229"],
html[data-visual-theme="noir"] [style*="rgba(0, 80, 255"],
html[data-visual-theme="noir"] [style*="rgba(231, 47, 47"],
html[data-visual-theme="noir"] [style*="rgba(255,255,255,0.2"],
html[data-visual-theme="noir"] [style*="rgba(255, 255, 255, 0.2"] {
  background: var(--surface-alt) !important;
  color: var(--ink) !important;
  border: 2px solid var(--border-color) !important;
  border-radius: 0 !important;
  box-shadow: 4px 4px 0 var(--border-color) !important;
}

html[data-visual-theme="noir"] ::-webkit-scrollbar {
  background: var(--surface) !important;
  width: 8px !important;
  height: 8px !important;
}

html[data-visual-theme="noir"] ::-webkit-scrollbar-thumb {
  background: var(--ink) !important;
  border-radius: 0 !important;
}

html[data-visual-theme="noir"] ::-webkit-scrollbar-thumb:hover {
  background: var(--border-color) !important;
}

@media (max-width: 860px) {
  html[data-visual-theme="noir"] .splash-content {
    grid-template-columns: 1fr !important;
  }

  html[data-visual-theme="noir"] .splash-image {
    min-height: 280px !important;
  }
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
  box-shadow: 6px 6px 0 #111111 !important;
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
  box-shadow: 6px 6px 0 #111111 !important;
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

    if (!state.toolThemeImage) {
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
