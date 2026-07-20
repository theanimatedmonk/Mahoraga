/**
 * Builds scripts/.generated-rename-topics-dm.js — run in Figma with 40 nodes selected.
 * Names: {id}-dm e.g. 01-be-confident-dm … 40-aging-gracefully-dm (order from topic-image-prompts.json).
 * Sort: top-to-bottom, then left-to-right (rows ~12px tolerance).
 *
 *   node scripts/build-rename-topics-dm-eval.mjs
 *   node src/index.js eval --file scripts/.generated-rename-topics-dm.js
 */
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MANIFEST = join(__dirname, 'topic-image-prompts.json');
const OUT = join(__dirname, '.generated-rename-topics-dm.js');

const entries = JSON.parse(readFileSync(MANIFEST, 'utf8'));
const names = entries.map((e) => `${e.id}-dm`);

if (names.length !== 40) {
  console.error('Expected 40 topics');
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
