#!/usr/bin/env node
/**
 * Emit 40 hand-drawn-style topic icons as SVG (100×100 viewBox, consistent stroke).
 * No API keys — vector output only.
 *
 *   node scripts/generate-topic-svgs.mjs
 *   npm run generate-topic-svgs
 *
 * Reads: scripts/topic-image-prompts.json (order + id + .png filename → .svg)
 * Writes: assets/topic-icons/*.svg
 */
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { iconFragment, hashId, ambientBackdrop, sparkNotches } from './topic-svg-icons.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const STROKE = 2.5;
const STROKE_COLOR = '#6B6D55';
const BG = '#ffffff';

function wrapSvg(inner, topicId) {
  const safe = topicId.replace(/[^a-z0-9-]/gi, '-');
  const hid = hashId(topicId);
  const mist = ambientBackdrop(hid, safe);
  const sparks = sparkNotches(hid + safe.length * 31);
  const body = inner
    .split('\n')
    .map((line) => (line ? `    ${line}` : ''))
    .join('\n');
  const mistIndent = mist
    .split('\n')
    .map((line) => (line ? `    ${line}` : ''))
    .join('\n');
  const sparksIndent = sparks
    .split('\n')
    .map((line) => (line ? `    ${line}` : ''))
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <rect width="100" height="100" fill="${BG}"/>
  <g fill="none" stroke="${STROKE_COLOR}" stroke-width="${STROKE}" stroke-linecap="round" stroke-linejoin="round">
${mistIndent}
${body}
${sparksIndent}
  </g>
</svg>
`;
}

function main() {
  const manifestPath = resolve(ROOT, 'scripts/topic-image-prompts.json');
  const outDir = resolve(ROOT, 'assets/topic-icons');
  const entries = JSON.parse(readFileSync(manifestPath, 'utf8'));
  if (!Array.isArray(entries) || entries.length !== 40) {
    console.error('Expected 40 entries in topic-image-prompts.json');
    process.exit(1);
  }
  mkdirSync(outDir, { recursive: true });
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    const body = iconFragment(i, e.id);
    const svg = wrapSvg(body, e.id);
    const outName = e.filename.replace(/\.png$/i, '.svg');
    writeFileSync(join(outDir, outName), svg, 'utf8');
  }
  console.log(`Wrote ${entries.length} SVGs to ${outDir}`);
}

main();
