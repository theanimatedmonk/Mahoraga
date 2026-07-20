---
name: breaking-news-app
description: >-
  Design context for the Breaking News app Android launcher flavour (minus-one utility
  screen). Use with Screenshots/ and design system/tokens/ to generate UI that
  matches this flavour's look and feel.
flavour: Breaking News app
figma_section_id: 6622:22005
exported_at: 2026-07-20T12:04:07.110Z
---

# Breaking News app — flavour design skill

Use this file when prompting **any LLM** (ChatGPT, Claude, Gemini, etc.) to design or
implement UI for this launcher flavour. Pair it with the **screenshots** and **tokens**
in this folder so output matches the existing vibe.

## What this flavour is

- **Product type:** Android launcher **flavour** (minus-one / right-swipe utility layer on base launcher).
- **Canvas:** Mobile screens at **360×780** (see `Screenshots/`).
- **Figma source:** `6622:22005` — ✅  ・ Final design v2.0 (June 16, 2026)

## How to use with another LLM

1. **Attach or upload** 3–5 representative PNGs from `Screenshots/` (home, menu, filter, permissions).
2. **Paste** the semantic colors and typography sections below (or attach `design system/tokens/tokens.json`).
3. **Paste this entire `SKILL.md`** as system instructions or the first message.
4. Ask for new screens/variants: *"Design a X screen that matches this flavour."*

### Starter prompt (copy-paste)

```
You are designing UI for the "Breaking News app" Android launcher flavour.

Rules:
- Match the attached screenshots and tokens exactly for color, type, spacing, and density.
- Use 360×780 mobile frames, light mode unless asked otherwise.
- Primary CTA uses brand accent (see semantic tokens).
- Keep the clean news/utility launcher aesthetic — cards, lists, bottom sheets, pill chips.
- Output: layout description + hex colors + font sizes, or code (Compose/XML) if requested.

Semantic colors (light):
- Background: #f5f5f5
- Surface: #ffffff
- Text primary: #1a1a1a
- Text secondary: #666666
- Border: #e0e0e0
- Accent: #ef5350

Reference files in this knowledge base:
- Screenshots/manifest.json — full screen inventory
- design system/tokens/light-mode.css — CSS variables
- design system/tokens/tokens.json — full palette + typography
```

## Design system (quick reference)

### Semantic colors — light

| Token | Hex |
|-------|-----|
| background | #f5f5f5 |
| surface | #ffffff |
| surfaceAlt | #f1f1f3 |
| textPrimary | #1a1a1a |
| textSecondary | #666666 |
| border | #e0e0e0 |
| accent | #ef5350 |

### Semantic colors — dark

| Token | Hex |
|-------|-----|
| background | #121212 |
| surface | #1e1e1e |
| textPrimary | #f5f5f5 |
| textSecondary | #b3b3b3 |
| border | #3a3a3a |
| accent | #ef5350 |

> No dark-mode screens found in this section. Values below are inferred dark-theme counterparts for handoff.

### Typography (sample)

| Font | Size | Color | Example |
|------|------|-------|---------|
| Roboto SemiBold | 14px | #00000099 | 12:30 |
| Inter Semi Bold | 24px | #0a0a0a | Local News |
| Inter Semi Bold | 16px | #0a0a0a | Top Stories Near |
| Inter Medium | 14px | #666666 | Austin, Travis County |
| Inter Bold | 14px | #ffffff | CNN News |
| Inter Medium | 12px | #e9e9e9 | 2 mins ago |
| Inter Medium | 18px | #ffffff | Breaking: Global Climate
Summit Reaches  |
| Inter Bold | 14px | #1a1a1a | CNN News |

**Common sizes (px):** 12, 13, 14, 15, 16, 18, 20, 21, 24

**Common radii (px):** 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 15

### CSS variables

Import `design system/tokens/light-mode.css` — prefix `--breaking-news-app-*`.

## Screen inventory (39 PNGs)

**Unique flows:** Following, Hamburger menu, Top Stories section, app info, city, city selection, location permission

- `Screenshots/top-stories-section_7570-12310.png` — Top Stories section
- `Screenshots/top-stories-section_7570-13257.png` — Top Stories section
- `Screenshots/city-selection_6622-22401.png` — city selection
- `Screenshots/location-permission_6984-2119.png` — location permission
- `Screenshots/location-permission_6984-5102.png` — location permission
- `Screenshots/location-permission_6984-6104.png` — location permission
- `Screenshots/location-permission_6984-6536.png` — location permission
- `Screenshots/location-permission_6984-5575.png` — location permission
- `Screenshots/location-permission_7523-1597.png` — location permission
- `Screenshots/location-permission_6984-3029.png` — location permission
- `Screenshots/city-selection_6984-3922.png` — city selection
- `Screenshots/top-stories-section_6622-23233.png` — Top Stories section
- `Screenshots/city_6663-29317.png` — city
- `Screenshots/city_6667-30385.png` — city
- `Screenshots/city_6716-33309.png` — city
- `Screenshots/city_6667-31944.png` — city
- `Screenshots/city_6667-32225.png` — city
- `Screenshots/city_6667-31029.png` — city
- `Screenshots/city-selection_6622-23498.png` — city selection
- `Screenshots/hamburger-menu_6622-23942.png` — Hamburger menu
- `Screenshots/top-stories-section_6622-24283.png` — Top Stories section
- `Screenshots/top-stories-section_6622-24534.png` — Top Stories section
- `Screenshots/top-stories-section_6663-29582.png` — Top Stories section
- `Screenshots/top-stories-section_6716-33963.png` — Top Stories section
- `Screenshots/top-stories-section_6622-25646.png` — Top Stories section
- `Screenshots/top-stories-section_6622-26558.png` — Top Stories section
- `Screenshots/top-stories-section_6622-27029.png` — Top Stories section
- `Screenshots/top-stories-section_6622-27309.png` — Top Stories section
- `Screenshots/following_6622-27632.png` — Following
- `Screenshots/following_7138-1145.png` — Following
- `Screenshots/following_6622-27672.png` — Following
- `Screenshots/following_7523-2931.png` — Following
- `Screenshots/following_6900-2604.png` — Following
- `Screenshots/city-selection_6787-35379.png` — city selection
- `Screenshots/top-stories-section_6900-678.png` — Top Stories section
- `Screenshots/top-stories-section_6900-1940.png` — Top Stories section
- `Screenshots/top-stories-section_6989-7534.png` — Top Stories section
- `Screenshots/top-stories-section_7523-2041.png` — Top Stories section
- `Screenshots/app-info_7525-1104.png` — app info

Full mapping: `Screenshots/manifest.json`

## Vibe & layout patterns

Infer from screenshots; generally for launcher flavours:

- **Header:** back/close, title, optional location or action chip.
- **Content:** vertical scroll, news cards or list rows, section labels in muted text.
- **Navigation:** bottom tab bar (For you, News, Following, Weather) where applicable.
- **Sheets:** filter/settings as bottom sheets with handle, primary + secondary actions.
- **Density:** comfortable padding (16px), 8–12px gaps, white cards on `#f5f5f5` background.

## File map

```
Breaking News app/
├── SKILL.md                    ← this file (LLM context)
├── README.md
├── Screenshots/
│   ├── manifest.json
│   └── *.png
└── design system/
    └── tokens/
        ├── tokens.json
        ├── light-mode.css
        ├── dark-mode.css
        └── README.md
```

## Re-export from Figma

```bash
node scripts/export-flavour-knowledge-base.mjs --name "Breaking News app" --section 6622:22005
```
