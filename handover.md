Handover: VGTools Pro Theme System — Continue Work
Project Overview
Location: c:\Users\Esteban Alfaro\OneDrive - McKinsey & Company\Desktop\apps\HTML_apps\VG Toolkit\
Stack: Pure HTML/CSS/JS multi-file SPA, no framework. Git branch: temp/theme-work.

What Was Done (Completed)
Hub→mini-app transition flash fixed — solid blanket div added before the decorative overlay in handleCardClick() in index.html
Mini-app→hub transition flash fixed — blanket pattern in bindBackToHubTransition() in shared/visual-theme.js
Hub return flash fixed — visibility:hidden via data-hub-returning attribute set before paint in index.html
Theme picker redesigned — replaced <select> with visual card grid popover (Windows 11-style) in index.html
7 new themes added to hub CSS in index.html: terminal, brutalist, neon, pastel, newspaper, blueprint, custom
The Problem (What Needs Fixing)
Mini-apps don't apply the new themes. When any new theme is active, mini-apps display comicbook theme instead.

Root Cause (confirmed)
In shared/visual-theme.js, lines 19–24, the THEMES const only has 4 entries:


const THEMES = {
  comicbook: { assetFile: 'Comicbook.png', usesArtwork: true,  usesPattern: true,  transition: 'comic',   group: 'visual' },
  glassui:   { assetFile: 'glass.png',     usesArtwork: true,  usesPattern: true,  transition: 'glass',   group: 'visual' },
  minimal:   { assetFile: null,            usesArtwork: false, usesPattern: false, transition: 'minimal', group: 'basic'  },
  emoji:     { assetFile: null,            usesArtwork: false, usesPattern: false, transition: 'emoji',   group: 'basic'  },
};
getCurrentTheme() at line 51 falls back to 'comicbook' for any unknown theme:


return Object.prototype.hasOwnProperty.call(THEMES, savedTheme) ? savedTheme : 'comicbook';
ensureThemeStyle() at line 1424 returns empty CSS for unknown themes:


if (theme !== 'comicbook') {
  styleEl.textContent = '';
  return;
}
What Must Be Done
Step 1 — Add new themes to THEMES const (line 19 in visual-theme.js)

const THEMES = {
  comicbook:  { assetFile: 'Comicbook.png', usesArtwork: true,  usesPattern: true,  transition: 'comic',   group: 'visual' },
  glassui:    { assetFile: 'glass.png',     usesArtwork: true,  usesPattern: true,  transition: 'glass',   group: 'visual' },
  minimal:    { assetFile: null,            usesArtwork: false, usesPattern: false, transition: 'minimal', group: 'basic'  },
  emoji:      { assetFile: null,            usesArtwork: false, usesPattern: false, transition: 'emoji',   group: 'basic'  },
  terminal:   { assetFile: null,            usesArtwork: false, usesPattern: false, transition: 'minimal', group: 'style'  },
  brutalist:  { assetFile: null,            usesArtwork: false, usesPattern: false, transition: 'minimal', group: 'style'  },
  neon:       { assetFile: null,            usesArtwork: false, usesPattern: false, transition: 'glass',   group: 'style'  },
  pastel:     { assetFile: null,            usesArtwork: false, usesPattern: false, transition: 'minimal', group: 'style'  },
  newspaper:  { assetFile: null,            usesArtwork: false, usesPattern: false, transition: 'minimal', group: 'style'  },
  blueprint:  { assetFile: null,            usesArtwork: false, usesPattern: false, transition: 'glass',   group: 'style'  },
  custom:     { assetFile: null,            usesArtwork: false, usesPattern: false, transition: 'minimal', group: 'basic'  },
};
Step 2 — Add CSS blocks in ensureThemeStyle() (after line 1421, before the if (theme !== 'comicbook') fallback)
The CSS pattern is the same as the existing emoji/minimal/glassui blocks. Each block targets html[data-visual-theme="THEME"] and html[data-theme="light/dark"][data-visual-theme="THEME"] selectors. Key elements to style: body, .panel, header.panel, aside.panel, main.panel, .splash-content, .wiki-modal-content, .modal-content, button, .btn, input, select, textarea, .back-to-home, #wiki-open-btn, #theme-toggle, #splash-close-btn, #wiki-close-btn, .modal-close-btn, .version-badge, .badge, .control-group, .panel-section, .group, .box, .settings-group, fieldset, .dock, .properties-panel, .zoom-controls, .level-card, .panel-section-preview, .toast.

Theme aesthetics (use index.html CSS at lines 3082–3349 as reference for colors/style — that CSS targets hub-specific classes, you need to translate it to mini-app classes above)
Theme	Background	Accent	Style notes
terminal	#0a0e0a	#00ff41 green	Monospace font, glow effects, 0 0 16px glow borders
brutalist	light: #f0f0f0 / dark: #1a1a1a	light: #111 / dark: #FFE600	4px solid borders, 0 border-radius, 6px 6px 0 box shadows
neon	#060010	#00f5ff cyan, secondary #ff00d4 magenta	Glassmorphism on dark, glow text-shadows, blur(14px) backdrop
pastel	light: #fdf4ff / dark: #1e1224	#c084fc purple	Rounded 20px, soft shadows, rgba(192,132,252,...) borders
newspaper	light: #f5efe6 / dark: #1a1610	light: #1a1a1a / dark: #f0e6d3	Georgia serif font, double border style, 0 border-radius
blueprint	#001f3f with grid bg	#4db8ff blue	Grid background-image, uppercase text, letter-spacing: 0.08em
custom	light: #f5f5f7 / dark: #000000	user-defined via CSS var	Same as minimal styling but respects --accent-color var
File Structure Reference

VG Toolkit/
├── index.html              ← Hub + theme picker + new theme CSS (lines 3082–3349)
├── shared/
│   └── visual-theme.js     ← THE FILE TO EDIT. THEMES const line 19, ensureThemeStyle() line 405
├── baseapp.html            ← Template (no changes needed)
├── bgremover/index.html    ← Example mini-app
├── sankey/index.html       ← Example mini-app
└── ... (15+ mini-apps, all load visual-theme.js via <script type="module">)
How the CSS injection works
Each mini-app has <script type="module" src="../shared/visual-theme.js"> in its <head>. On load, ensureThemeStyle(theme) writes a <style id="vgtools-visual-theme-overrides"> element into document.head with all the theme CSS. The <html> element gets data-visual-theme="THEME" and data-theme="light|dark" attributes, so CSS selectors like html[data-theme="dark"][data-visual-theme="terminal"] work.

Pattern to Follow
The easiest path: copy the minimal block (lines 908–1195 in visual-theme.js) as a template, change the theme name in all selectors, then apply the aesthetic from the corresponding hub CSS in index.html. The minimal block is the most complete and covers all element classes.