---
name: capture-url
description: >-
  Captures website screenshots and a sitemap from a pasted URL using Playwright
  (Python). Discovers URLs via robots.txt/sitemap.xml or a shallow same-origin
  crawl, then saves PNGs + sitemap.md/json under captures/<host>/. Use when the
  user pastes a URL and asks for screenshots, a sitemap, site capture, crawl
  pages, or website reference shots.
---

# Capture URL (Playwright screenshots + sitemap)

## When to use

- User pastes a URL and wants **screenshots** and/or a **sitemap**
- "Capture this site", "screenshot this page", "map this website", "crawl for pages"

## Prerequisites

- Python 3 with Playwright installed (`playwright` package + Chromium)
- Run from the **repo root** (or pass `--out` explicitly)

If Chromium is missing:

```bash
python3 -m playwright install chromium
```

## Output layout

Screenshots are saved on disk under the **current working directory** (usually the project root):

```
captures/<host>/                 ← e.g. captures/stripe.com/
├── manifest.json
├── sitemap.json
├── sitemap.md
└── screenshots/                 ← PNGs live here
    ├── 00-home.png
    └── 01-about.png
```

- **Not** uploaded to GitHub (`captures/` is gitignored)
- **Not** on the Figma canvas until you paste them (see skill `paste-images-to-figma`)

To put shots on the canvas after capture, use **paste-images-to-figma**.

## Workflow

Copy this checklist:

```
Capture progress:
- [ ] 1. Normalize URL (add https:// if missing)
- [ ] 2. Run capture script
- [ ] 3. Summarize sitemap + screenshot paths for the user
- [ ] 4. Optionally open/read a few PNGs to describe the UI
```

### 1. Run the capture script

**Default** (desktop 1440×900, full-page, up to 12 pages):

```bash
python3 .cursor/skills/capture-url/scripts/capture_url.py "https://EXAMPLE.com"
```

**Common variants:**

```bash
# Fewer / more pages
python3 .cursor/skills/capture-url/scripts/capture_url.py "https://EXAMPLE.com" --max-pages 5
python3 .cursor/skills/capture-url/scripts/capture_url.py "https://EXAMPLE.com" --max-pages 25

# Mobile (iPhone 14)
python3 .cursor/skills/capture-url/scripts/capture_url.py "https://EXAMPLE.com" --mobile

# Viewport-only (not full page)
python3 .cursor/skills/capture-url/scripts/capture_url.py "https://EXAMPLE.com" --no-full-page

# Custom output folder
python3 .cursor/skills/capture-url/scripts/capture_url.py "https://EXAMPLE.com" --out captures/my-label
```

Replace `EXAMPLE.com` with the URL the user pasted. Do **not** ask them to run the command — run it yourself via the Shell tool.

### 2. How discovery works

1. Read `/robots.txt` for `Sitemap:` entries
2. Try `/sitemap.xml`, `/sitemap_index.xml`
3. Recurse sitemap indexes (same origin)
4. If no sitemap found → shallow crawl of same-origin `<a href>` links from the homepage
5. Screenshot seed URL first, then additional URLs up to `--max-pages`

### 3. Report back to the user

After the script prints JSON (`ok`, `out_dir`, `url_count`, …):

1. Tell them where files landed (`captures/<host>/`)
2. Summarize URL count + discovery mode (`sitemap` vs `crawl`)
3. List a short sample of URLs from `sitemap.md`
4. If they asked to *see* the site, **Read** 1–3 screenshot PNGs and briefly describe layout/UI

Do not dump the entire sitemap into chat unless they ask — point to `sitemap.md` / `sitemap.json`.

## Defaults

| Option | Default |
|--------|---------|
| Viewport | 1440×900 @ 2× |
| Full page | yes |
| Max pages | 12 |
| Wait after load | 1500ms |
| Output | `captures/<host>/` |

## Notes

- Output under `captures/` is gitignored — do not commit screenshots unless the user asks
- Stay same-origin; do not follow external links
- For a **single** page only: `--max-pages 1`
- Disk only by default — paste onto Figma with skill **paste-images-to-figma**
- Existing CLI `screenshot-url` imports one live URL shot straight into Figma (no sitemap)
- Full-page mode **scrolls** the window + nested overflow containers, then unlocks Framer-style
  crop locks before capturing (avoids viewport-only crops)
