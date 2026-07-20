/**
 * Builds scripts/.generated-rename-persona-profile-picture.js — run in Figma with 20 nodes selected.
 * Names: {persona-slug}-profile-picture e.g. 01-young-confidence-seeker-profile-picture …
 * Order from scripts/persona-card-slugs.json. Sort: top-to-bottom, then left-to-right (rows ~12px tolerance).
 *
 *   node scripts/build-rename-persona-profile-picture-eval.mjs
 *   node src/index.js eval --file scripts/.generated-rename-persona-profile-picture.js
 */
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MANIFEST = join(__dirname, 'persona-card-slugs.json');
const OUT = join(__dirname, '.generated-rename-persona-profile-picture.js');

const slugs = JSON.parse(readFileSync(MANIFEST, 'utf8'));
const names = slugs.map((s) => `${s}-profile-picture`);

if (names.length !== 20) {
  console.error('Expected 20 persona slugs');
  process.exit(1);
}

const src = `(async () => {
  const names = ${JSON.stringify(names)};
  const nodes = figma.currentPage.selection.slice();
  if (nodes.length !== names.length) {
    return {
      error: 'Select exactly ' + names.length + ' nodes (frames). You have ' + nodes.length + '.',
    };
  }
  nodes.sort(function (a, b) {
    if (Math.abs(a.y - b.y) > 12) return a.y - b.y;
    return a.x - b.x;
  });
  for (var i = 0; i < names.length; i++) {
    nodes[i].name = names[i];
  }
  return { renamed: names.length, names: names };
})()`;

writeFileSync(OUT, src, 'utf8');
console.log('Wrote', OUT);
