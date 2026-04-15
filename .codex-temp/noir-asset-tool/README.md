# Noir Asset Tool

Temporary local tool to build Noir artwork assets.

## What it does
- Searches photos with the free Pixabay API
- Lets you choose one image per mini app
- Applies a newspaper-like `photocopy + halftone` treatment
- Saves the final PNG directly to `Theme/noir/<tool>_noir.png`

## Run
From the repo root:

```powershell
node .codex-temp/noir-asset-tool/server.js
```

Then open:

```text
http://127.0.0.1:4781
```

## API key
You need a free Pixabay API key.

Options:
- Paste it into the tool UI
- Or set `PIXABAY_API_KEY` before starting the server

Official docs:
- https://pixabay.com/api/docs/

## Output
Saved files go to:

```text
Theme/noir/
```

Expected naming:
- `brickbuilder_noir.png`
- `moodboards_noir.png`
- `colors_noir.png`
- etc.
