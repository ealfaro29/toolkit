# Guia Para Agregar Temas En VG Toolkit

## Objetivo
Este documento explica todo lo que hay que tocar para agregar un tema visual nuevo sin dejar huecos en el hub, las mini-apps, las transiciones ni las superficies auxiliares.

Estado actual del sistema:
- Hub principal: `index.html`
- Engine compartido de mini-apps: `shared/visual-theme.js`
- Mini-apps: 16 carpetas con `index.html`
- Pagina auxiliar con visual theme: `ad.html`
- Version actual del script compartido: `v=12`

## Regla principal
Un tema nuevo no esta terminado hasta que cubre estas 5 capas:
1. Metadatos del tema
2. Estilo del hub
3. Estilo de mini-apps
4. Las 3 transiciones
5. Cache-busting y validacion

## Arquitectura rapida
Hay 2 sistemas de tema corriendo al mismo tiempo:
- `data-theme="light|dark"` controla el modo de color
- `data-visual-theme="comicbook|glassui|..."` controla el estilo visual

Persistencia:
- Color theme: `creative-toolkit-theme`
- Visual theme: `vgtools-visual-theme`

## Archivos que normalmente hay que tocar
- `index.html`
- `shared/visual-theme.js`
- `ad.html`
- `Theme/<nuevo-tema>/...` solo si el tema usa imagenes
- Los 16 `index.html` de mini-apps para subir `visual-theme.js?v=N`

## Lo que no hay que tocar
- `baseapp.html` no es el lugar para implementar el tema
- `404.html` hoy no participa del sistema visual de temas

## Politica de assets
Solo usa imagenes si el tema de verdad depende de artwork o pattern.

Temas visuales con assets:
- `comicbook`
- `glassui`

Temas basicos sin assets:
- `minimal`
- `emoji`
- `terminal`
- `noir`

Si el tema no necesita assets:
- `assetFile: null`
- `usesArtwork: false`
- `usesPattern: false`
- No agregar archivos a `Theme/`

Si el tema si necesita assets:
- Crear `Theme/<tema>/pattern_<tema>.jpg`
- Crear una imagen por tool: `<tool>_<tema>.png`
- Recordar que `ad.html` usa `iconfactory_<tema>.png`

## Paso 1: Registrar el tema en el hub
En `index.html` actualizar:
- `VISUAL_THEMES`
- `VISUAL_THEME_META`
- `VISUAL_THEME_LABELS`
- `THEME_COLORS` si el modal o UI lo usan

El objeto meta debe definir:
- `group`
- `usesArtwork`
- `usesPattern`
- `transition`

Ejemplo:
```js
miTema: { group: 'basic', usesArtwork: false, usesPattern: false, transition: 'mitransicion' }
```

## Paso 2: Registrar el tema en mini-apps
En `shared/visual-theme.js` actualizar `THEMES`.

Ejemplo:
```js
miTema: { assetFile: null, usesArtwork: false, usesPattern: false, transition: 'mitransicion', group: 'basic' }
```

Importante:
- `transition` no puede apuntar por error a otra variante
- El valor debe existir tanto en hub como en shared

## Paso 3: Implementar el CSS del hub
En `index.html` agregar el bloque completo del tema para el hub.

Cobertura minima obligatoria:
- `html[data-visual-theme="MI_TEMA"]`
- `body`
- `body::before` y si aplica `body::after`
- `header.panel`
- `header.panel h1`
- `.sub`
- `.search-input`
- `#theme-toggle`
- `#theme-picker-btn`
- `.app-card`
- `.app-card:hover`
- `.app-card.keyboard-selected`
- `.card-glass-content`
- `.app-card-title`
- `.app-card-description`
- `.app-card-tags`
- `.card-share-btn`
- `.new-badge-overlay`
- `.welcome-overlay` si el tema necesita atmósfera de fondo

Regla practica:
- Si el tema es assetless, la tarjeta del hub nunca puede quedar blanca por default
- El estado hover debe sentirse propio del tema, no heredado del tema anterior

## Paso 4: Implementar el CSS del theme picker
En `index.html` actualizar:
- HTML de la card dentro de `#theme-picker-overlay`
- CSS de `.tp-preview-<tema>`
- Overrides del modal si el tema altera mucho la estética del picker

Cada tema necesita:
- Una card en `.tp-theme-grid`
- Nombre
- Tagline
- Preview propia
- Boton de favorito con `data-theme`

## Paso 5: Implementar el CSS compartido de mini-apps
En `shared/visual-theme.js`, dentro de `ensureThemeStyle(theme)`, agregar un bloque:

```js
if (theme === 'miTema') {
  styleEl.textContent = `...`;
  return;
}
```

Ese bloque debe ir antes del fallback:
- `if (theme !== 'comicbook') { ... }`

Cobertura minima obligatoria para mini-apps:
- Variables del tema
- `body`
- `body::before`
- `header.panel::before`
- `.wiki-header::before`
- `.panel`
- `header.panel`
- `aside.panel`
- `main.panel`
- `.splash-content`
- `.splash-info`
- `.splash-image`
- `.wiki-modal-content`
- `.modal-content`
- `.dialog-content.panel`
- `h1`, `h2`, `h3`
- `p`, `label`, `.sub`, `.description`
- `button`, `.btn`
- `input`, `select`, `textarea`
- `.back-to-home`
- `#wiki-open-btn`
- `#theme-toggle`
- `#splash-close-btn`
- `#wiki-close-btn`
- `.modal-close-btn`
- `.control-group`
- `.panel-section`
- `.group`
- `.box`
- `.settings-group`
- `fieldset`
- `.dock`
- `.properties-panel`
- `.zoom-controls`
- `.level-card`
- `.panel-section-preview`
- `.toast`
- `.version-badge`
- `.badge`
- `::-webkit-scrollbar`

Cobertura recomendada porque suele romperse si no se toca:
- `.empty-state`
- `.upload-zone`
- `.drop-zone`
- `.preview-viewer-container`
- `.canvas-hint`
- `.popup-overlay`
- `.popup-content`
- `.feature-item`
- `kbd`
- `.tab`, `.tab-btn`, `.panel-tab`, `.mode-btn`, `.tool-btn`, `.active`

## Paso 6: Si el tema usa comportamiento especial por tool
Solo aplica si el tema necesita datos por mini-app, como hace `emoji` o `terminal`.

Ejemplos existentes:
- `EMOJI_THEME_SYMBOLS`
- `TERMINAL_LABELS`
- `MINIWI_GLYPHS`
- helpers como `renderMiniwi()`

Si el tema necesita eso:
- Crear mapa por tool
- Crear helper para construir contenido
- Inyectar el contenido en `applyVisualTheme()` del hub y/o en `applyVisualThemeState()` del shared

## Paso 7: Implementar las 3 transiciones
Todo tema nuevo debe tener 3 transiciones propias.

### A. Hub -> App
En `index.html` tocar:
- CSS de `.app-open-theme-overlay.<variant>`
- `@keyframes`
- `handleCardClick()`
- Timeout de navegacion
- `data-*` attributes si la transicion usa texto o decoracion dinamica

### B. Theme switch dentro del hub
En `index.html` tocar:
- CSS de `.theme-transition-overlay.<variant>`
- `body.theme-switching-in-<variant> .container`
- `playVisualThemeTransition(theme, onSwitch)`
- Limpieza de clases
- Timeout de cleanup

### C. Return to hub desde mini-apps
Hay 2 piezas:
- En `index.html`: `checkReturnAnimation()`
- En `shared/visual-theme.js`: `ensureReturnTransitionStyle()` y `bindBackToHubTransition()`

No olvidar:
- Clase visual de overlay
- Variante de circulo o wipe si existe
- Duracion correcta
- Si el tema no debe mostrar label flotante al volver, agregarlo a la logica de supresion

## Paso 8: Si el tema usa imagenes
Ademas de los metadatos:
- `getAppImagePaths(theme)` debe poder resolver `Theme/<tema>/<tool>_<tema>.png`
- `getPatternForTheme(theme)` debe devolver `Theme/<tema>/pattern_<tema>.jpg`
- El tema debe estar marcado con `usesArtwork: true` y/o `usesPattern: true`

## Paso 9: Actualizar `ad.html`
`ad.html` tambien lee `vgtools-visual-theme`, asi que si quieres que el tema exista de verdad en todas las superficies visibles, actualizar:
- El mapa `themeMeta` dentro de `applyVisualTheme()`
- CSS de `html[data-visual-theme="<tema>"]`
- Wallpaper o preview si aplica

Si no se toca, el tema puede verse bien en hub y mini-apps pero mal en la tarjeta/anuncio.

## Paso 10: Cache-busting obligatorio
Cada vez que cambie `shared/visual-theme.js`:
- Subir `?v=N` a `?v=N+1` en las 16 mini-apps

Hoy el valor correcto es:
- `../shared/visual-theme.js?v=12`

Mini-apps que hay que tocar:
- `any2svg/index.html`
- `bgremover/index.html`
- `blobs/index.html`
- `brickbuilder/index.html`
- `iconfactory/index.html`
- `jigsaws/index.html`
- `locator/index.html`
- `mockups/index.html`
- `moodboards/index.html`
- `notes/index.html`
- `palettes/index.html`
- `qrcodes/index.html`
- `sankey/index.html`
- `signatures/index.html`
- `svgrecolor/index.html`
- `wordclouds/index.html`

## Paso 11: Validacion manual obligatoria
Antes de dar un tema por terminado, probar:
- Hub en light
- Hub en dark
- Theme picker abierto
- Cambio entre el tema nuevo y otro tema
- Abrir una mini-app desde el hub
- Volver al hub desde la mini-app
- Splash screen de al menos 2 apps
- Wiki/modal de al menos 2 apps
- Una app simple y una compleja
- Un tool con estados vacios y otro con preview/canvas

Apps recomendadas para smoke test:
- `notes`
- `iconfactory`
- `palettes`
- `mockups`

## Definicion de terminado
Un tema esta listo cuando:
- Existe en `VISUAL_THEMES`
- Existe en `VISUAL_THEME_META`
- Existe en `shared/visual-theme.js`
- Tiene estilo completo en hub
- Tiene estilo completo en mini-apps
- Tiene las 3 transiciones
- Tiene card en el theme picker
- Tiene preview en el picker
- No deja superficies blancas accidentales
- No se ve como otro tema reciclado
- El versionado `v=N` fue subido
- `ad.html` fue evaluado y actualizado si aplica

## Errores comunes
- Olvidar el bloque de mini-apps y solo estilizar el hub
- Reusar `transition: 'minimal'` por accidente
- Agregar el tema al picker pero no a `VISUAL_THEMES`
- No cubrir `splash`, `wiki`, `toast` o `popup`
- No subir `?v=N`
- Usar imagenes en un tema que deberia ser 100% CSS
- Dejar hover, focus o active heredados del tema anterior
- No testear dark mode

## Comandos utiles
Buscar metadatos:
```powershell
rg -n "VISUAL_THEMES|VISUAL_THEME_META|VISUAL_THEME_LABELS|THEME_COLORS" index.html
```

Buscar transiciones:
```powershell
rg -n "handleCardClick|playVisualThemeTransition|checkReturnAnimation" index.html
rg -n "ensureReturnTransitionStyle|bindBackToHubTransition" shared/visual-theme.js
```

Buscar picker:
```powershell
rg -n "theme-picker-overlay|tp-card|tp-preview-" index.html
```

Buscar version del script compartido:
```powershell
rg -n "visual-theme.js\\?v=" any2svg bgremover blobs brickbuilder iconfactory jigsaws locator mockups moodboards notes palettes qrcodes sankey signatures svgrecolor wordclouds
```

## Recomendacion de trabajo
Orden sugerido:
1. Registrar tema en metadatos
2. Hacer hub
3. Hacer picker
4. Hacer mini-apps
5. Hacer transiciones
6. Actualizar `ad.html`
7. Subir version `v=N`
8. Hacer smoke test

## Nota final
Si se agrega un tema nuevo, conviene tambien actualizar:
- `handover.md`
- Cualquier documento de roadmap de temas
- La descripcion de temas activos si cambio la cantidad total
