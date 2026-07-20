#!/usr/bin/env node
/**
 * Export a Figma SECTION into Flavours/<name>/ knowledge base.
 *
 * Usage:
 *   node scripts/export-flavour-knowledge-base.mjs --name "Breaking News app" --section 6622:22005
 *   node scripts/export-flavour-knowledge-base.mjs --name "Step tracker"   # uses current Figma selection
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { homedir } from 'os';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

function parseArgs(argv) {
  const out = { name: null, section: null, skillOnly: false };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--name' && argv[i + 1]) out.name = argv[++i];
    else if (argv[i] === '--section' && argv[i + 1]) out.section = argv[++i];
    else if (argv[i] === '--skill-only') out.skillOnly = true;
  }
  return out;
}

function mahoragaEval(code, timeoutMs = 180000) {
  const tokenPath = join(homedir(), '.mahoraga', '.mahoraga-token');
  const token = existsSync(tokenPath) ? readFileSync(tokenPath, 'utf8').trim() : '';
  const res = execSync(
    `curl -s -X POST http://127.0.0.1:3456/exec -H "Content-Type: application/json" ${token ? `-H "X-Mahoraga-Token: ${token}"` : ''} -d @-`,
    {
      input: JSON.stringify({ action: 'eval', code }),
      encoding: 'utf8',
      maxBuffer: 100 * 1024 * 1024,
      timeout: timeoutMs,
    }
  );
  const data = JSON.parse(res);
  if (data.error) throw new Error(data.error);
  return data.result;
}

function cliEval(code) {
  const res = execSync(`node src/index.js eval ${JSON.stringify(code)}`, {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 100 * 1024 * 1024,
    timeout: 180000,
  });
  return JSON.parse(res);
}

function slug(name, id) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${base}_${id.replace(':', '-')}`;
}

function cssPrefix(flavorName) {
  return flavorName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 24);
}

function skillSlug(flavorName) {
  return flavorName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function buildSkillMd({ flavorName, sectionId, sectionName, manifest, tokens, prefix }) {
  const uniqueScreens = [...new Set(manifest.screens.map((s) => s.name))].sort();
  const screenList = manifest.screens
    .filter((s) => !s.error)
    .map((s) => `- \`Screenshots/${s.file}\` — ${s.name}`)
    .join('\n');

  const sem = tokens.semantic?.light || {};
  const semDark = tokens.semantic?.dark || {};
  const fontSizes = (tokens.summary?.fontSizes || [])
    .filter((n) => n >= 12 && n <= 24)
    .map((n) => Math.round(n))
    .filter((n, i, a) => a.indexOf(n) === i)
    .sort((a, b) => a - b);

  const radii = (tokens.summary?.cornerRadii || [])
    .filter((n) => n > 0 && n <= 64)
    .map((n) => Math.round(n))
    .filter((n, i, a) => a.indexOf(n) === i)
    .sort((a, b) => a - b)
    .slice(0, 12);

  const typoSample = (tokens.typography || [])
    .filter((t) => t.fontSize >= 12 && t.fontSize <= 24)
    .slice(0, 8)
    .map(
      (t) =>
        `| ${t.fontFamily} ${t.fontStyle} | ${Math.round(t.fontSize)}px | ${t.color || '—'} | ${(t.examples?.[0] || '').slice(0, 40)} |`
    )
    .join('\n');

  const exportedAt = manifest.exportedAt || new Date().toISOString();

  return `---
name: ${skillSlug(flavorName)}
description: >-
  Design context for the ${flavorName} Android launcher flavour (minus-one utility
  screen). Use with Screenshots/ and design system/tokens/ to generate UI that
  matches this flavour's look and feel.
flavour: ${flavorName}
figma_section_id: ${sectionId}
exported_at: ${exportedAt}
---

# ${flavorName} — flavour design skill

Use this file when prompting **any LLM** (ChatGPT, Claude, Gemini, etc.) to design or
implement UI for this launcher flavour. Pair it with the **screenshots** and **tokens**
in this folder so output matches the existing vibe.

## What this flavour is

- **Product type:** Android launcher **flavour** (minus-one / right-swipe utility layer on base launcher).
- **Canvas:** Mobile screens at **360×780** (see \`Screenshots/\`).
- **Figma source:** \`${sectionId}\` — ${sectionName}

## How to use with another LLM

1. **Attach or upload** 3–5 representative PNGs from \`Screenshots/\` (home, menu, filter, permissions).
2. **Paste** the semantic colors and typography sections below (or attach \`design system/tokens/tokens.json\`).
3. **Paste this entire \`SKILL.md\`** as system instructions or the first message.
4. Ask for new screens/variants: *"Design a X screen that matches this flavour."*

### Starter prompt (copy-paste)

\`\`\`
You are designing UI for the "${flavorName}" Android launcher flavour.

Rules:
- Match the attached screenshots and tokens exactly for color, type, spacing, and density.
- Use 360×780 mobile frames, light mode unless asked otherwise.
- Primary CTA uses brand accent (see semantic tokens).
- Keep the clean news/utility launcher aesthetic — cards, lists, bottom sheets, pill chips.
- Output: layout description + hex colors + font sizes, or code (Compose/XML) if requested.

Semantic colors (light):
- Background: ${sem.background || '#f5f5f5'}
- Surface: ${sem.surface || '#ffffff'}
- Text primary: ${sem.textPrimary || '#1a1a1a'}
- Text secondary: ${sem.textSecondary || '#666666'}
- Border: ${sem.border || '#e0e0e0'}
- Accent: ${sem.accent || semDark.accent || '#c42720'}

Reference files in this knowledge base:
- Screenshots/manifest.json — full screen inventory
- design system/tokens/light-mode.css — CSS variables
- design system/tokens/tokens.json — full palette + typography
\`\`\`

## Design system (quick reference)

### Semantic colors — light

| Token | Hex |
|-------|-----|
| background | ${sem.background || '—'} |
| surface | ${sem.surface || '—'} |
| surfaceAlt | ${sem.surfaceAlt || '—'} |
| textPrimary | ${sem.textPrimary || '—'} |
| textSecondary | ${sem.textSecondary || '—'} |
| border | ${sem.border || '—'} |
| accent | ${sem.accent || semDark.accent || '#c42720'} |

### Semantic colors — dark

| Token | Hex |
|-------|-----|
| background | ${semDark.background || '—'} |
| surface | ${semDark.surface || '—'} |
| textPrimary | ${semDark.textPrimary || '—'} |
| textSecondary | ${semDark.textSecondary || '—'} |
| border | ${semDark.border || '—'} |
| accent | ${semDark.accent || '—'} |

${semDark.note ? `> ${semDark.note}\n` : ''}
### Typography (sample)

| Font | Size | Color | Example |
|------|------|-------|---------|
${typoSample || '| — | — | — | — |'}

**Common sizes (px):** ${fontSizes.join(', ') || '12–24'}

**Common radii (px):** ${radii.join(', ') || '8–16'}

### CSS variables

Import \`design system/tokens/light-mode.css\` — prefix \`--${prefix}-*\`.

## Screen inventory (${manifest.screens.filter((s) => !s.error).length} PNGs)

**Unique flows:** ${uniqueScreens.join(', ')}

${screenList}

Full mapping: \`Screenshots/manifest.json\`

## Vibe & layout patterns

Infer from screenshots; generally for launcher flavours:

- **Header:** back/close, title, optional location or action chip.
- **Content:** vertical scroll, news cards or list rows, section labels in muted text.
- **Navigation:** bottom tab bar (For you, News, Following, Weather) where applicable.
- **Sheets:** filter/settings as bottom sheets with handle, primary + secondary actions.
- **Density:** comfortable padding (16px), 8–12px gaps, white cards on \`${sem.background || '#f5f5f5'}\` background.

## File map

\`\`\`
${flavorName}/
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
\`\`\`

## Re-export from Figma

\`\`\`bash
node scripts/export-flavour-knowledge-base.mjs --name "${flavorName}" --section ${sectionId}
\`\`\`
`;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function exportNodeWithRetry(nodeId, outputPath, attempts = 3) {
  for (let i = 1; i <= attempts; i++) {
    try {
      execSync(`node src/index.js export node "${nodeId}" -o "${outputPath}" -s 1 -f png`, {
        cwd: ROOT,
        stdio: 'pipe',
        timeout: 120000,
      });
      return;
    } catch (e) {
      if (i === attempts) throw e;
      await sleep(1500);
    }
  }
}

const selectionScript = `(async () => {
  const sel = figma.currentPage.selection;
  if (!sel.length) return { error: 'Nothing selected. Select a SECTION in Figma.' };
  const node = sel[0];
  if (node.type !== 'SECTION') {
    return { error: 'Selection must be a SECTION (got ' + node.type + '). Select the flavour section frame.' };
  }
  return { sectionId: node.id, sectionName: node.name };
})()`;

const listScreensScript = (sectionId) => `(async () => {
  const section = await figma.getNodeByIdAsync('${sectionId}');
  if (!section) return { error: 'Section not found: ${sectionId}' };
  const screens = [];
  function walk(n) {
    if (n.type === 'FRAME' && n.width === 360 && n.height === 780) {
      screens.push({ id: n.id, name: n.name });
      return;
    }
    if ('children' in n) for (const c of n.children) walk(c);
  }
  for (const c of section.children) walk(c);
  return { section: section.name, sectionId: '${sectionId}', screens };
})()`;

const tokensScript = (sectionId) => `(async () => {
  const section = await figma.getNodeByIdAsync('${sectionId}');
  if (!section) return { error: 'Section not found' };

  function hex(c, a = 1) {
    const parts = [c.r, c.g, c.b].map(v => Math.round(v * 255).toString(16).padStart(2, '0'));
    const h = '#' + parts.join('');
    if (a < 1) return h + Math.round(a * 255).toString(16).padStart(2, '0');
    return h;
  }
  function paintToHex(paint) {
    if (!paint || paint.type !== 'SOLID') return null;
    return hex(paint.color, paint.opacity ?? 1);
  }
  function lum(hex) {
    const m = /^#([0-9a-f]{6})/i.exec(hex);
    if (!m) return 0.5;
    const r = parseInt(m[1].slice(0, 2), 16) / 255;
    const g = parseInt(m[1].slice(2, 4), 16) / 255;
    const b = parseInt(m[1].slice(4, 6), 16) / 255;
    return 0.299 * r + 0.587 * g + 0.114 * b;
  }

  const colors = new Map();
  const textStyles = new Map();
  const fontSizes = new Set();
  const radii = new Set();
  const screenBgs = [];

  function addColor(value, ctx) {
    if (!value) return;
    const key = value.toLowerCase();
    if (!colors.has(key)) colors.set(key, { value, contexts: new Set() });
    colors.get(key).contexts.add(ctx);
  }

  function walk(n, depth = 0) {
    if (depth > 25) return;
    if (n.type === 'FRAME' && n.width === 360 && n.height === 780) {
      const bg = n.fills !== figma.mixed && n.fills[0]?.type === 'SOLID' ? paintToHex(n.fills[0]) : null;
      if (bg) screenBgs.push(bg);
    }
    if ('fills' in n && n.fills !== figma.mixed) {
      for (const f of n.fills) addColor(paintToHex(f), n.name + ' fill');
    }
    if ('strokes' in n && n.strokes !== figma.mixed) {
      for (const s of n.strokes) addColor(paintToHex(s), n.name + ' stroke');
    }
    if (n.type === 'TEXT') {
      const fill = n.fills !== figma.mixed ? paintToHex(n.fills[0]) : null;
      const style = {
        fontFamily: n.fontName?.family || 'unknown',
        fontStyle: n.fontName?.style || 'Regular',
        fontSize: n.fontSize,
        lineHeight: typeof n.lineHeight === 'object' ? n.lineHeight.value : n.lineHeight,
        letterSpacing: typeof n.letterSpacing === 'object' ? n.letterSpacing.value : n.letterSpacing,
        color: fill,
      };
      const k = JSON.stringify(style);
      if (!textStyles.has(k)) textStyles.set(k, { ...style, samples: [] });
      textStyles.get(k).samples.push(n.characters.slice(0, 60));
      if (typeof n.fontSize === 'number') fontSizes.add(n.fontSize);
    }
    if ('cornerRadius' in n && typeof n.cornerRadius === 'number' && n.cornerRadius > 0 && n.cornerRadius < 200) {
      radii.add(Math.round(n.cornerRadius));
    }
    if ('children' in n) for (const c of n.children) walk(c, depth + 1);
  }

  walk(section);

  const colorList = [...colors.entries()]
    .map(([, v]) => ({ hex: v.value, usedIn: [...v.contexts].slice(0, 8) }))
    .sort((a, b) => a.hex.localeCompare(b.hex));

  const darkScreens = screenBgs.filter((b) => lum(b) < 0.2).length;
  const lightScreens = screenBgs.filter((b) => lum(b) > 0.55).length;
  const modeNote =
    darkScreens > 0 && lightScreens > 0
      ? 'mixed light and dark screens'
      : darkScreens > lightScreens
        ? 'dark-mode screens'
        : lightScreens > 0
          ? 'light-mode screens'
          : 'unknown';

  const semantic = {
    light: {
      background: colorList.find((c) => c.hex === '#f5f5f5')?.hex || colorList.find((c) => lum(c.hex) > 0.9)?.hex || '#f5f5f5',
      surface: colorList.find((c) => c.hex === '#ffffff')?.hex || '#ffffff',
      surfaceAlt: colorList.find((c) => c.hex === '#f1f1f3')?.hex || '#f1f1f3',
      textPrimary: colorList.find((c) => c.hex === '#1a1a1a')?.hex || '#1a1a1a',
      textSecondary: colorList.find((c) => c.hex === '#666666')?.hex || '#666666',
      border: colorList.find((c) => c.hex === '#e0e0e0')?.hex || '#e0e0e0',
      accent:
        colorList.find((c) => c.hex === '#c42720')?.hex ||
        colorList.find((c) => /^#c42/i.test(c.hex))?.hex ||
        colorList.find((c) => /^#d32f2f|^#e53935|^#f44336/i.test(c.hex))?.hex,
    },
    dark: {
      note: darkScreens === 0 ? 'No dark screens in section; inferred handoff values.' : 'Extracted from dark screen backgrounds where possible.',
      background: colorList.find((c) => lum(c.hex) < 0.12)?.hex || '#121212',
      surface: colorList.find((c) => lum(c.hex) > 0.08 && lum(c.hex) < 0.18)?.hex || '#1e1e1e',
      surfaceAlt: '#2a2a2a',
      textPrimary: '#f5f5f5',
      textSecondary: '#b3b3b3',
      border: '#3a3a3a',
    },
  };

  return {
    source: { sectionId: '${sectionId}', sectionName: section.name },
    summary: {
      uniqueColors: colorList.length,
      uniqueTextStyles: textStyles.size,
      fontSizes: [...fontSizes].sort((a, b) => a - b),
      cornerRadii: [...new Set([...radii].filter((r) => r <= 64))].sort((a, b) => a - b),
      screenCount: screenBgs.length,
      modes: modeNote,
    },
    semantic,
    palette: {
      light: colorList.filter((c) => lum(c.hex) > 0.55),
      mid: colorList.filter((c) => lum(c.hex) > 0.35 && lum(c.hex) <= 0.55),
      dark: colorList.filter((c) => lum(c.hex) <= 0.35),
    },
    typography: [...textStyles.values()].map((t) => ({
      fontFamily: t.fontFamily,
      fontStyle: t.fontStyle,
      fontSize: t.fontSize,
      lineHeight: t.lineHeight,
      letterSpacing: t.letterSpacing,
      color: t.color,
      examples: [...new Set(t.samples)].slice(0, 3),
    })),
  };
})()`;

const args = parseArgs(process.argv);
let flavorName = args.name;
let sectionId = args.section;

if (args.skillOnly) {
  if (!flavorName) {
    console.error('Missing flavour name. Use: --name "Breaking News app" --skill-only');
    process.exit(1);
  }
  flavorName = flavorName
    .replace(/^[✅✓\s・]+/u, '')
    .replace(/\s*\(.*\)\s*$/u, '')
    .replace(/\s*-\s*\d{1,2}\s+\w+\s*,?\s*\d{4}\s*$/u, '')
    .trim();
  const out = join(ROOT, 'Flavours', flavorName);
  const shots = join(out, 'Screenshots');
  const tokensDir = join(out, 'design system', 'tokens');
  const manifestPath = join(shots, 'manifest.json');
  const tokensPath = join(tokensDir, 'tokens.json');
  if (!existsSync(manifestPath) || !existsSync(tokensPath)) {
    console.error(`Missing manifest or tokens in ${out}. Run full export first.`);
    process.exit(1);
  }
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const tokens = JSON.parse(readFileSync(tokensPath, 'utf8'));
  const sid = sectionId || manifest.sectionId;
  writeFileSync(
    join(out, 'SKILL.md'),
    buildSkillMd({
      flavorName,
      sectionId: sid,
      sectionName: manifest.section || flavorName,
      manifest,
      tokens,
      prefix: cssPrefix(flavorName),
    })
  );
  console.log(`Wrote ${join(out, 'SKILL.md')}`);
  process.exit(0);
}

// Ensure Mahoraga is reachable
try {
  execSync('node src/index.js bridge status', { cwd: ROOT, stdio: 'pipe' });
} catch {
  console.error('Mahoraga not running. Run: node src/index.js connect --safe');
  process.exit(1);
}

if (!sectionId) {
  console.log('Reading Figma selection...');
  let sel;
  try {
    sel = mahoragaEval(selectionScript);
  } catch {
    sel = cliEval(selectionScript);
  }
  if (sel.error) {
    console.error(sel.error);
    process.exit(1);
  }
  sectionId = sel.sectionId;
  if (!flavorName) flavorName = sel.sectionName;
}

if (!flavorName) {
  console.error('Missing flavour name. Use: --name "Breaking News app"');
  process.exit(1);
}

// Clean default name from section titles
flavorName = flavorName
  .replace(/^[✅✓\s・]+/u, '')
  .replace(/\s*\(.*\)\s*$/u, '')
  .replace(/\s*-\s*\d{1,2}\s+\w+\s*,?\s*\d{4}\s*$/u, '')
  .trim();

const OUT = join(ROOT, 'Flavours', flavorName);
const SHOTS = join(OUT, 'Screenshots');
const TOKENS_DIR = join(OUT, 'design system', 'tokens');
const prefix = cssPrefix(flavorName);

mkdirSync(SHOTS, { recursive: true });
mkdirSync(TOKENS_DIR, { recursive: true });

console.log(`Flavour: ${flavorName}`);
console.log(`Section: ${sectionId}`);
console.log(`Output:  ${OUT}\n`);

let list;
try {
  list = mahoragaEval(listScreensScript(sectionId));
} catch {
  list = cliEval(listScreensScript(sectionId));
}
if (list.error) {
  console.error(list.error);
  process.exit(1);
}

if (!list.screens.length) {
  console.error('No 360×780 screens found in section. Add mobile frames or adjust detection in script.');
  process.exit(1);
}

console.log(`Screens to export: ${list.screens.length}`);

const manifest = [];
for (let i = 0; i < list.screens.length; i++) {
  const screen = list.screens[i];
  const filename = `${slug(screen.name, screen.id)}.png`;
  const outPath = join(SHOTS, filename);
  process.stdout.write(`[${i + 1}/${list.screens.length}] ${screen.name} → ${filename} ... `);
  try {
    await exportNodeWithRetry(screen.id, outPath);
    manifest.push({ id: screen.id, name: screen.name, file: filename });
    console.log('ok');
  } catch (e) {
    console.log('failed');
    manifest.push({ id: screen.id, name: screen.name, file: filename, error: String(e.message || e).slice(0, 200) });
  }
  await sleep(400);
}

writeFileSync(
  join(SHOTS, 'manifest.json'),
  JSON.stringify(
    {
      flavour: flavorName,
      section: list.section,
      sectionId,
      exportedAt: new Date().toISOString(),
      screens: manifest,
    },
    null,
    2
  )
);

console.log('\nExtracting design tokens...');
let tokens;
try {
  tokens = mahoragaEval(tokensScript(sectionId), 300000);
} catch {
  tokens = cliEval(tokensScript(sectionId));
}
writeFileSync(join(TOKENS_DIR, 'tokens.json'), JSON.stringify(tokens, null, 2));

const toCssVars = (obj, indent = '  ') =>
  Object.entries(obj)
    .filter(([k]) => k !== 'note')
    .map(([k, v]) => `${indent}--${prefix}-${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v};`)
    .join('\n');

writeFileSync(
  join(TOKENS_DIR, 'light-mode.css'),
  `/* ${flavorName} — Light mode tokens */\n/* Section: ${list.section} */\n:root {\n${toCssVars(tokens.semantic.light)}\n}\n`
);
writeFileSync(
  join(TOKENS_DIR, 'dark-mode.css'),
  `/* ${flavorName} — Dark mode tokens */\n@media (prefers-color-scheme: dark) {\n  :root {\n${toCssVars(tokens.semantic.dark, '    ')}\n  }\n}\n`
);
writeFileSync(
  join(TOKENS_DIR, 'README.md'),
  `# Design tokens — ${flavorName}\n\nExtracted from Figma section **${list.section}** (\`${sectionId}\`).\n\n- \`tokens.json\` — palette, typography, semantic tokens\n- \`light-mode.css\` / \`dark-mode.css\` — CSS custom properties\n\n**Modes in section:** ${tokens.summary.modes}\n`
);

writeFileSync(
  join(OUT, 'README.md'),
  `# ${flavorName}\n\nLauncher **flavour** knowledge base (minus-one / utility layer on top of base launcher).\n\n## Contents\n\n- \`SKILL.md\` — **paste into other LLMs** with screenshots + tokens for on-brand design\n- \`Screenshots/\` — PNG exports of each 360×780 screen + \`manifest.json\`\n- \`design system/tokens/\` — colors, typography, semantic tokens\n\n## Figma source\n\n- Section: \`${sectionId}\`\n- Name: ${list.section}\n- Exported: ${new Date().toISOString().split('T')[0]}\n\n## Re-export\n\n\`\`\`bash\nnode scripts/export-flavour-knowledge-base.mjs --name "${flavorName}" --section ${sectionId}\n\`\`\`\n`
);

const manifestData = {
  flavour: flavorName,
  section: list.section,
  sectionId,
  exportedAt: new Date().toISOString(),
  screens: manifest,
};

writeFileSync(
  join(OUT, 'SKILL.md'),
  buildSkillMd({
    flavorName,
    sectionId,
    sectionName: list.section,
    manifest: manifestData,
    tokens,
    prefix,
  })
);

const ok = manifest.filter((m) => !m.error).length;
console.log(`\nDone! ${ok}/${list.screens.length} screenshots → ${OUT}`);
