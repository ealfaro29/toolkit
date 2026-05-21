# Handover: VGTools Pro Theme System — Continue Work
**Date:** 2026-04-14
**Branch:** `temp/theme-work`
**Last commit:** `db8f924` — feat: Noir theme

---

## Project Overview

**Location:** `c:\Users\Esteban Alfaro\OneDrive - McKinsey & Company\Desktop\apps\HTML_apps\VG Toolkit\`
**Stack:** Pure HTML/CSS/JS multi-file SPA. No framework, no bundler.
**Git remote:** `https://github.com/ealfaro29/toolkit.git`

**Structure:**
```
VG Toolkit/
├── index.html              ← Hub app (all theme picker, hub CSS, hub JS in one file)
├── shared/
│   └── visual-theme.js     ← Shared theme engine loaded by ALL mini-apps (v=11)
├── baseapp.html            ← Template for mini-apps (don't touch)
└── [16 mini-apps]/         ← brickbuilder, moodboards, blobs, jigsaws, iconfactory,
                               qrcodes, palettes, notes, locator, signatures,
                               svgrecolor, any2svg, bgremover, wordclouds, sankey, mockups
```

---

## Current Theme System State

### Active themes (6 total)
All CSS-only, no images except comicbook/glassui:

| Theme | Key | Transition variant | Notes |
|---|---|---|---|
| Comicbook | `comicbook` | `comic` | Uses pattern image + artwork |
| Glass UI | `glassui` | `glass` | Uses pattern image + artwork |
| Minimal | `minimal` | `minimal` | White/black, system sans |
| Emoji | `emoji` | `emoji` | Sticker cards, emoji wallpaper |
| Terminal | `terminal` | `terminal` | Black/green, Miniwi font, CRT fx |
| Noir | `noir` | `noir` | Cream/charcoal, serif, grain, offset shadows |

### Two-layer theme system
- `data-theme="light|dark"` — color mode (localStorage: `creative-toolkit-theme`)
- `data-visual-theme="comicbook|glassui|..."` — visual style (localStorage: `vgtools-visual-theme`)

---

## How the System Works

### Hub (index.html)
The hub is a single large file. All JS is in one Alpine-style `const App = { ... }` object inside `<script>`.

**Key JS locations (approximate lines — use grep to find exact):**
- `VISUAL_THEMES` array — list of active theme IDs
- `VISUAL_THEME_META` — per-theme metadata (group, usesArtwork, usesPattern, transition variant)
- `MINIWI_GLYPHS` — per-glyph Miniwi font data (for terminal card titles), parsed from real `miniwi.flf`
- `TERMINAL_LABELS` — 3-letter uppercase label per tool ID (rendered via Miniwi)
- `renderMiniwi(text)` — renders text using `MINIWI_GLYPHS`, returns 3-4 line string
- `applyVisualTheme()` — sets `data-visual-theme`, injects/removes `<pre class="terminal-ascii">` per card, loads JetBrains Mono for terminal
- `checkReturnAnimation()` — handles hub return transition; has branches for glassui/minimal/emoji/terminal/noir
- `playVisualThemeTransition(theme, cb)` — hub theme-switch animation; branches for comic/emoji/terminal + data attributes
- `handleCardClick()` — hub→app open animation; branches for emoji/terminal data attributes
- `syncThemePicker()` — marks active card in picker modal
- `initThemePicker()` — sets up card click → `setVisualTheme()`

**Theme picker modal:**
- `#theme-picker-overlay` with class `.tp-overlay` — fullscreen backdrop blur overlay
- `.tp-modal` — centered dialog, max-width ~540px, spring scale animation on open
- `.tp-theme-grid` — 3-column grid (3×2 for 6 themes)
- Each card: `<div class="tp-card" role="button" data-theme="THEME">` with `.tp-preview.tp-preview-THEME` + `.tp-card-info`
- Open: adds `.open` class to overlay; Close: removes it; Escape key also closes

### Mini-apps (shared/visual-theme.js)
Every mini-app has `<script src="../shared/visual-theme.js?v=11">` in `<head>`.

On load, `ensureThemeStyle(theme)` writes a `<style id="vgtools-visual-theme-overrides">` into `document.head`. The `<html>` element gets `data-visual-theme` and `data-theme` attributes.

**CSS blocks in ensureThemeStyle (in order):**
1. `theme === 'emoji'` → emoji mini-app CSS
2. `theme === 'minimal'` → minimal mini-app CSS
3. `theme === 'glassui'` → glassmorphism mini-app CSS
4. `theme === 'terminal'` → terminal mini-app CSS (black/green, scanlines, JetBrains Mono, no border-radius)
5. `theme === 'noir'` → noir mini-app CSS (cream/charcoal, Georgia serif, grain, offset shadows)
6. `theme !== 'comicbook'` → fallback: clear styles
7. Falls through to comicbook CSS injection

**THEMES const (line ~19):**
```js
const THEMES = {
  comicbook: { assetFile: 'Comicbook.png', usesArtwork: true,  usesPattern: true,  transition: 'comic',   group: 'visual' },
  glassui:   { assetFile: 'glass.png',     usesArtwork: true,  usesPattern: true,  transition: 'glass',   group: 'visual' },
  minimal:   { assetFile: null,            usesArtwork: false, usesPattern: false, transition: 'minimal', group: 'basic'  },
  emoji:     { assetFile: null,            usesArtwork: false, usesPattern: false, transition: 'emoji',   group: 'basic'  },
  terminal:  { assetFile: null,            usesArtwork: false, usesPattern: false, transition: 'minimal', group: 'basic'  },
  noir:      { assetFile: null,            usesArtwork: false, usesPattern: false, transition: 'minimal', group: 'basic'  },
};
```

---

## Transition System (all in index.html CSS + JS)

### Three transition types per theme

**1. Hub → App (handleCardClick):**
- Class: `.app-open-theme-overlay.{variant}` + `.animate`
- Duration: comic 840ms, glass 900ms, emoji 780ms, terminal 560ms, noir 560ms, default 560ms
- Terminal: CRT flicker (steps keyframes) + `data-terminal-cmd="> run ./appId"` on `::after`
- Noir: horizontal `scaleX` wipe to black left→right

**2. Theme Switch (playVisualThemeTransition):**
- Class: `.theme-transition-overlay.{variant}` + `.phase-in`
- Card reveal: `body.theme-switching-in-{variant} .container { animation: ... }`
- Terminal: black scanline overlay + green scan bar sweep + random boot text on `::after`
- Noir: `clip-path: circle()` iris open → hold → close (1200ms)

**3. Return to Hub (checkReturnAnimation):**
- Overlay class: `.page-transition-overlay.{variant}-return`
- Circle class: `.page-transition-circle.{variant}-return-circle`
- Terminal: black overlay with scanlines, `> cd ~/home` prompt, circle transparent with flicker
- Noir: black overlay, transparent circle with offset flicker, no text
- Both terminal and noir suppress the floating icon label (like minimal)

---

## Image/Asset Policy (IMPORTANT)
Only `comicbook` and `glassui` use images:
- `Theme/comicbook/pattern_comicbook.jpg` — hub body background pattern
- `Theme/glassui/pattern_glassui.jpg` — hub body background pattern
- Per-tool artwork in each mini-app's folder (only for those two themes)

**All other themes are 100% CSS — never add image files for them.**

---

## Miniwi Font (Terminal theme only)
Source: `github.com/xero/figlet-fonts` → `miniwi.flf`
Each glyph is a 4-row string array with variable width (A–Z mostly 2 chars, N=3, M/W=4).

`MINIWI_GLYPHS` in index.html JS covers A–Z + 0–9 + space.
`renderMiniwi(text)` uppercases text, looks up each char, joins rows with 1-space kerning gap, trims empty row 4 (descender) if unused.

`TERMINAL_LABELS` maps tool IDs to 3-letter uppercase labels (all using A–Z covered by the font):
`brickbuilder→BRK, moodboards→MOD, blobs→BLB, jigsaws→JIG, iconfactory→ICO, qrcodes→QRC, colors→HUE, notes→NTE, locator→GEO, signatures→SIG, svgrecolor→CLR, any2svg→SVG, bgremover→BKG, wordclouds→WRD, sankey→SKY, mockups→MCK`

CSS for `.terminal-ascii`: `font-size: 18px; line-height: 1; font-family: ui-monospace; white-space: pre;`
**Critical:** `line-height: 1` — block chars break visually at any other value.

---

## Adding a New Theme — Checklist

1. **`shared/visual-theme.js` → `THEMES` const:** Add entry with `assetFile: null, usesArtwork: false, usesPattern: false, transition: 'VARIANT', group: 'basic'`

2. **`shared/visual-theme.js` → `ensureThemeStyle()`:** Add `if (theme === 'NEWTHEME') { styleEl.textContent = \`...\`; return; }` before the `if (theme !== 'comicbook')` fallback. Target selectors: `html[data-visual-theme="NEWTHEME"]` and `html[data-theme="light/dark"][data-visual-theme="NEWTHEME"]`. Cover: body, .panel, header.panel, aside.panel, h1/h2/h3, p/label/.sub, button/.btn, input/select/textarea, .control-group/.panel-section/.group/.box, .version-badge/.badge, .back-to-home, .wiki-modal-content/.modal-content, .toast, scrollbars.

3. **`index.html` → `VISUAL_THEMES` array:** Add `'NEWTHEME'`

4. **`index.html` → `VISUAL_THEME_META`:** Add entry matching the THEMES const

5. **`index.html` Hub CSS:** Add full hub card styling block before `/* NEW Card Special Styling */`. Must cover: html vars, body bg, body::before (grain or pattern), header.panel, header text/controls, .search-input, .app-card (border, bg, radius, shadow), .app-card::before (usually `display:none`), .app-card:hover, .card-glass-content, .app-card-title, .app-card-description, .app-card-tags, .card-share-btn, .new-badge-overlay.

6. **`index.html` → Transitions CSS:** Add three blocks:
   - `.app-open-theme-overlay.VARIANT` + `.animate` + `@keyframes`
   - `.theme-transition-overlay.VARIANT` + `.phase-in` + `body.theme-switching-in-VARIANT .container`
   - `.page-transition-overlay.VARIANT-return` + `.page-transition-circle.VARIANT-return-circle`

7. **`index.html` → JS transition branches:** Update:
   - `handleCardClick()`: add `data-*` attribute if needed
   - `handleCardClick()` navigate timeout: add `transitionVariant === 'VARIANT' ? Xms :`
   - `playVisualThemeTransition()`: add `data-*` attribute if needed
   - `playVisualThemeTransition()` cleanup classList: add `'theme-switching-in-VARIANT'`
   - `playVisualThemeTransition()` cleanup timeout: add `transitionVariant === 'VARIANT' ? Xms :`
   - `checkReturnAnimation()`: add `returnVariant`, `returnCircleVariant`, `returnColor` branches; add to `iconLabel` suppression if no icon; add timeout branch

8. **`index.html` → Picker HTML:** Add `<div class="tp-card" role="button" tabindex="0" data-theme="NEWTHEME">` with preview div + card-info

9. **`index.html` → Picker CSS:** Add `.tp-preview-NEWTHEME { ... }` with hover animation

10. **Bump version:** Replace `visual-theme.js?v=N` → `v=N+1` in all 16 mini-app HTML files

---

## Planned Upcoming Themes

The user approved three themes to build next (in order of preference):

### Y2K
- Metallic silver/blue CSS gradients (`linear-gradient` with `#b8d4ff`, `#c0c0c0` inset highlights)
- Pill-shaped elements with inset `box-shadow` border bevel
- Background: repeating `radial-gradient` sphere/bubble pattern
- Fonts: system sans bold, heavy letter-spacing
- References: Winamp, ICQ, Windows XP, early web 2000–2004
- Cards: bevel border (light top-left, dark bottom-right via inset box-shadow)
- Transition idea: pixelated dissolve or Windows-style slide

### Risograph
- Palette limited to 2–3 flat colors (suggested: coral `#f4845f`, teal `#2ec4b6`, cream `#fff1e6`)
- Mis-registration effect on text via `text-shadow` offset in secondary color (1–3px)
- Grain via SVG `feTurbulence` (similar to noir but color-tinted)
- Cards: flat color fill, no shadows, slight rotation `transform: rotate(var(--card-tilt))` like a sticker
- Ink-bleed on borders: `box-shadow: 0 0 0 2px color, 2px 2px 0 4px color`
- Transition idea: color channel split (R/G/B offset layers)

### (Deprioritized) Synthwave, DOS, Stained Glass
- Not requested yet, save for later

---

## Known Constraints / Preferences
- **Never use images for non-comicbook/glassui themes** — 100% CSS only
- **No placeholder whites** — if a theme doesn't have artwork, the card background must be styled
- **Each theme must have custom transitions** for all three events (open, switch, return)
- **Miniwi labels for terminal** must use only A–Z letters covered by the font (all 26 are in MINIWI_GLYPHS)
- User wants themes that feel completely distinct — no two themes should look remotely similar
- Mini-app script version must be bumped every time `visual-theme.js` changes

---

## Version Cache Busting
Current version: **v=14**
All 16 mini-apps load: `<script src="../shared/visual-theme.js?v=14">`
When `visual-theme.js` changes: bump the `v=` query string across all mini-app `index.html` files.
