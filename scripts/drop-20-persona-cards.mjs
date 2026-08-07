/**
 * Builds one Figma eval that creates 20 persona cards in a grid, each bound to
 * the matching persona-card/{slug}/* variables.
 *
 * Naming: root frame is `Persona · 01 — Young confidence seeker` (slug-derived).
 *
 * Usage:
 *   node scripts/drop-20-persona-cards.mjs
 *   node src/index.js eval --file scripts/.generated-drop-20-persona.js
 *
 * One-time: rename existing top-level frames still called `persona card` (grid order):
 *   node scripts/drop-20-persona-cards.mjs --rename
 *   node src/index.js eval --file scripts/.generated-rename-persona-cards.js
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { generateDropCode } from '../src/drops/serializer.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SAVED = join(__dirname, '../src/drops/saved.json');
const OUT = join(__dirname, '.generated-drop-20-persona.js');
const OUT_RENAME = join(__dirname, '.generated-rename-persona-cards.js');
const PERSONA_SLUGS = join(__dirname, 'persona-card-slugs.json');

function deepClone(o) {
  return JSON.parse(JSON.stringify(o));
}

/**
 * `01-young-confidence-seeker` → `Persona · 01 — Young confidence seeker`
 * (en-dash; label words sentence case for readability in the layers panel).
 */
function personaCardFrameName(slug) {
  const m = slug.match(/^(\d{2})-(.+)$/);
  if (!m) return `Persona · ${slug}`;
  const [, num, tail] = m;
  const label = tail
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
  return `Persona · ${num} — ${label}`;
}

/** Any persona-card/<slug>/… binding is rewritten to the target slug. */
function remapBindings(bindings, targetSlug) {
  const prefix = `persona-card/${targetSlug}/`;
  return bindings.map((b) => {
    const m = b.variable.match(/^persona-card\/[^/]+\/(.+)$/);
    if (!m) return { ...b };
    return { ...b, variable: prefix + m[1] };
  });
}

/** Binding paths are rooted at the frame name; keep them in sync when renaming. */
function rebaseBindingPaths(bindings, templateRoot, newRootName) {
  return bindings.map((b) => {
    if (!b.path.startsWith(templateRoot)) return { ...b };
    const suffix = b.path === templateRoot ? '' : b.path.slice(templateRoot.length);
    return { ...b, path: newRootName + suffix };
  });
}

function emitRenameEval(slugs) {
  const names = slugs.map(personaCardFrameName);
  const inner = JSON.stringify(names);
  const cardW = 372;
  const cardH = 595;
  const gap = 48;
  const cols = 5;
  const rowCount = Math.ceil(slugs.length / cols);
  const startX = 200;
  const startY = 200;
  const maxX = startX + (cols - 1) * (cardW + gap) + cardW + 80;
  const maxY = startY + (rowCount - 1) * (cardH + gap) + cardH + 80;
  const src = `(async () => {
  const names = ${inner};
  var startX = ${startX}, startY = ${startY}, maxX = ${maxX}, maxY = ${maxY};
  var all = figma.currentPage.children.filter(function (n) {
    return n.type === 'FRAME' && /^Persona · \\d{2}/.test(n.name);
  });
  var cards = all.filter(function (n) {
    return n.x >= startX - 100 && n.x <= maxX && n.y >= startY - 100 && n.y <= maxY;
  });
  if (cards.length < names.length) {
    cards = all.slice();
  }
  cards.sort(function (a, b) {
    if (a.y !== b.y) return a.y - b.y;
    return a.x - b.x;
  });
  if (cards.length < names.length) {
    return {
      error: 'Need at least ' + names.length + ' Persona frames; found ' + cards.length + ' on page.',
      hint: 'Create cards with drop-20-persona-cards, or temporarily move extras off this page.',
    };
  }
  var skipped = Math.max(0, cards.length - names.length);
  for (var i = 0; i < names.length; i++) {
    cards[i].name = names[i];
  }
  return { renamed: names.length, skipped: skipped, names: names };
})()`;
  writeFileSync(OUT_RENAME, src, 'utf8');
  console.log('Wrote', OUT_RENAME);
}

function main() {
  const slugs = JSON.parse(readFileSync(PERSONA_SLUGS, 'utf8'));
  if (slugs.length !== 20 || !slugs.every((s) => typeof s === 'string')) {
    console.error(`Expected 20 persona slug strings in persona-card-slugs.json`);
    process.exit(1);
  }

  if (process.argv.includes('--rename')) {
    emitRenameEval(slugs);
    return;
  }

  const saved = JSON.parse(readFileSync(SAVED, 'utf8'));
  const entry = saved.find((d) => d.id === 'persona-card');
  if (!entry?.tree) {
    console.error('persona-card drop not found in saved.json');
    process.exit(1);
  }

  const bindingsBase = entry.variableBindings || [];
  const templateRoot = entry.tree.name;

  const cardW = entry.tree.w || 372;
  const cardH = entry.tree.h || 595;
  const gap = 48;
  const cols = 5;
  const startX = 200;
  const startY = 200;

  const pieces = [];
  for (let i = 0; i < slugs.length; i++) {
    const slug = slugs[i];
    const col = i % cols;
    const row = Math.floor(i / cols);
    const tree = deepClone(entry.tree);
    tree.x = startX + col * (cardW + gap);
    tree.y = startY + row * (cardH + gap);

    const rootName = personaCardFrameName(slug);
    tree.name = rootName;

    const variableBindings = rebaseBindingPaths(
      remapBindings(bindingsBase, slug),
      templateRoot,
      rootName
    );
    const piece = generateDropCode(tree, { variableBindings });
    pieces.push(`  results.push(await ${piece});`);
  }

  const header = `(async () => {
  const results = [];
`;
  const footer = `  return results;
})()`;
  const body = pieces.join('\n');
  writeFileSync(OUT, header + body + '\n' + footer, 'utf8');
  console.log('Wrote', OUT);
}

main();
