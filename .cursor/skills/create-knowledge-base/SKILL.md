---
name: create-knowledge-base
description: >-
  Builds a launcher flavour knowledge base from a selected Figma SECTION: exports
  all 360×780 screen PNGs and extracts design tokens into Flavours/<app name>/.
  Use when the user selects a Figma section, asks to create a knowledge base,
  export flavour screenshots, extract design system tokens, or add a new launcher
  flavour (Breaking News, Step tracker, flashlight, etc.).
---

# Create knowledge base (launcher flavours)

## Context

Org ships **Android launcher** products with two layers:

1. **Base launcher** — default launcher (homescreen, app drawer, search).
2. **Flavours** — utility minus-one screens (right-swipe) on top of the base, e.g. Breaking News, Step tracker, flashlight.

This skill captures a **flavour** from Figma into a repo knowledge base for engineering and AI handoff.

## Output structure

Every flavour lives under `Flavours/<Flavour name>/`:

```
Flavours/
└── Breaking News app/
    ├── SKILL.md              ← LLM context (paste into other models)
    ├── README.md
    ├── Screenshots/
    │   ├── manifest.json
    │   └── <screen-name>_<node-id>.png
    └── design system/
        └── tokens/
            ├── tokens.json
            ├── light-mode.css
            ├── dark-mode.css
            └── README.md
```

## When to use

- User selected a **SECTION** in Figma and wants screenshots + tokens.
- User says: "create knowledge base", "export this flavour", "add to Flavours".
- New utility app designs are ready in Figma.

## Prerequisites

1. **Figma Desktop** open with the file.
2. **Mahoraga connected** (run silently if needed):
   ```bash
   node src/index.js connect --safe
   ```
3. User has selected exactly one **SECTION** node (not a single frame).

## Workflow

Copy this checklist:

```
- [ ] 1. Confirm Mahoraga connected
- [ ] 2. Read selection (must be SECTION)
- [ ] 3. Resolve flavour name
- [ ] 4. Run export script
- [ ] 5. Retry any failed screenshots
- [ ] 6. Confirm `SKILL.md` was written (LLM handoff file)
- [ ] 7. Summarize output for user
```

### Step 1 — Connect

```bash
node src/index.js bridge status
```

If not running: `node src/index.js connect --safe` and wait for plugin.

### Step 2 — Verify selection

```bash
node src/index.js eval '(async () => {
  const s = figma.currentPage.selection[0];
  if (!s) return { error: "nothing selected" };
  return { id: s.id, name: s.name, type: s.type };
})()'
```

- **SECTION** → proceed.
- **FRAME** → ask user to select the parent section, or use frame only if they insist (script requires SECTION).

### Step 3 — Flavour name

Priority:

1. Name user gave explicitly ("Breaking News app").
2. Cleaned section name (strip ✅, dates, "Final design v2.0").
3. Ask user if ambiguous.

Do **not** show raw terminal commands to the user during onboarding-style flows; run them silently.

### Step 4 — Export

From **figma-cli repo root**:

```bash
node scripts/export-flavour-knowledge-base.mjs --name "Breaking News app" --section <SECTION_ID>
```

Omit `--section` to use current Figma selection.

Omit `--name` to derive from section title.

### Step 5 — Retry failures

If `manifest.json` lists `error` on any screen, retry with delay (bridge timeouts):

```bash
node -e "
import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';
const root = process.cwd();
const manifestPath = process.argv[1];
const m = JSON.parse(readFileSync(manifestPath,'utf8'));
const dir = manifestPath.replace('/manifest.json','');
for (const s of m.screens.filter(x => x.error)) {
  try {
    execSync('node src/index.js export node \"'+s.id+'\" -o \"'+join(dir,s.file)+'\" -s 1 -f png', { cwd: root, stdio: 'pipe', timeout: 120000 });
    delete s.error;
  } catch (e) { s.error = String(e.message).slice(0,120); }
  await new Promise(r => setTimeout(r, 500));
}
m.exportedAt = new Date().toISOString();
writeFileSync(manifestPath, JSON.stringify(m, null, 2));
console.log('OK:', m.screens.filter(x => !x.error).length + '/' + m.screens.length);
" "Flavours/<name>/Screenshots/manifest.json"
```

### Step 6 — Report

Tell the user:

- Flavour folder path
- Screenshot count
- Token summary (`uniqueColors`, `modes` from `tokens.json`)
- **`SKILL.md`** path — for dumping into other LLMs with screenshots + tokens
- Note if dark mode was inferred vs extracted

### Refresh SKILL.md only (no re-screenshot)

```bash
node scripts/export-flavour-knowledge-base.mjs --name "Breaking News app" --skill-only
```

## Using SKILL.md with other LLMs

Each flavour folder includes `SKILL.md` with:

- Semantic colors and typography quick reference
- Screen inventory with PNG paths
- Copy-paste starter prompt for ChatGPT / Claude / Gemini
- Vibe and layout patterns

**Workflow:** Upload 3–5 PNGs from `Screenshots/` + paste `SKILL.md` + attach `tokens.json` if needed.

## Rules

- **Never delete** Figma nodes.
- Export **360×780** frames only (standard flavour phone screens).
- Do not commit `Flavours/` unless the user asks.
- Keep existing flavour folders; re-export **updates** the same folder.

## Examples

**User:** "I selected the Breaking News section — create the knowledge base."

1. Connect Mahoraga
2. Confirm SECTION `6622:22005`
3. Run: `node scripts/export-flavour-knowledge-base.mjs --name "Breaking News app" --section 6622:22005`
4. Reply: "Created `Flavours/Breaking News app/` with 39 screenshots and design tokens."

**User:** "New flavour: Step tracker" (section selected)

```bash
node scripts/export-flavour-knowledge-base.mjs --name "Step tracker"
```

## Script reference

| Script | Purpose |
|--------|---------|
| `scripts/export-flavour-knowledge-base.mjs` | Main export (use this) |
| `scripts/export-breaking-news-section.mjs` | Legacy; prefer flavour script |

## Related

- Mahoraga CLI: `node src/index.js export node <id> -o file.png`
- Project rules: `.cursor/rules/figma-cli.mdc`
