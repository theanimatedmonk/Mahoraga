---
name: paste-images-to-figma
description: >-
  Pastes local PNG/JPG screenshots onto the Figma canvas via Mahoraga (image
  rectangles in a named frame). Use when the user asks to put captures, screenshots,
  or image files onto the canvas, import captures/<host>/screenshots into Figma,
  or paste reference shots after a URL capture.
---

# Paste images to Figma

## When to use

- User wants screenshots / local images **on the Figma canvas**
- After `capture-url`: “paste these into Figma”, “drop captures on canvas”
- “Import `captures/.../screenshots` into Figma”

## Where captures live (disk)

Playwright captures are stored under the **current project directory**:

```
captures/<host>/
└── screenshots/
    ├── 00-home.png
    ├── 01-about.png
    └── …
```

Example: capturing `https://stripe.com` from this repo →  
`captures/stripe.com/screenshots/`.  
Folder is **gitignored** (not pushed to GitHub).

## Prerequisites

1. **Figma Desktop** open with a file
2. **Mahoraga connected** (run silently if needed):

```bash
node src/index.js connect --safe
# or: node src/index.js connect
```

3. Images already on disk (from `capture-url` or any PNG/JPG folder)

## Workflow

```
Paste progress:
- [ ] 1. Confirm image paths (captures/<host>/ or explicit files)
- [ ] 2. Ensure Mahoraga connected
- [ ] 3. Run paste script
- [ ] 4. Confirm frame appeared on canvas
```

### Paste a whole capture folder

```bash
node .cursor/skills/paste-images-to-figma/scripts/paste_images_to_figma.mjs \
  "captures/HOST" \
  --name "HOST refs"
```

If the folder has a `screenshots/` subdir, it is used automatically.

### Paste specific files

```bash
node .cursor/skills/paste-images-to-figma/scripts/paste_images_to_figma.mjs \
  "captures/HOST/screenshots/00-home.png" \
  --name "Homepage"
```

### Options

| Flag | Default | Meaning |
|------|---------|---------|
| `--name` | folder/file name | Frame name on canvas |
| `--gap` | `80` | Space between images |
| `--max-width` | `4096` | Downscale before import (Figma limit 4096px) |
| `--no-frame` | off | Leave loose rectangles, no wrapper frame |
| `--y` | `0` | Top Y for the row |

### Personal skill path (any project)

If using the copy in `~/.cursor/skills/`:

```bash
node "$HOME/.cursor/skills/paste-images-to-figma/scripts/paste_images_to_figma.mjs" \
  "captures/HOST" --name "HOST refs"
```

Still requires Mahoraga running (`http://127.0.0.1:3456`). Prefer running from the figma-cli / Mahoraga repo so `connect` works.

## End-to-end with capture-url

1. Capture: `python3 .cursor/skills/capture-url/scripts/capture_url.py "https://EXAMPLE.com"`
2. Paste: `node .cursor/skills/paste-images-to-figma/scripts/paste_images_to_figma.mjs captures/EXAMPLE.com --name "EXAMPLE.com"`

Do **not** ask the user to run these — execute via Shell.

## Notes

- Images are placed to the **right** of existing page content (smart X)
- Huge full-page shots are downscaled (needs `sharp` in this repo; otherwise may fail if >4096px)
- Never delete existing Figma nodes
- For a single live URL → Figma in one shot, CLI also has `node src/index.js screenshot-url <url>` (no sitemap)
