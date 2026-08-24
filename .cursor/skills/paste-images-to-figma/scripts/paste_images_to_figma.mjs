#!/usr/bin/env node
/**
 * Paste local PNG/JPG/WebP images onto the Figma canvas via Mahoraga.
 *
 * Usage:
 *   node paste_images_to_figma.mjs captures/example.com/screenshots
 *   node paste_images_to_figma.mjs img1.png img2.png --name "Stripe refs"
 *   node paste_images_to_figma.mjs captures/example.com --gap 80 --max-width 1440
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { basename, extname, join, resolve } from 'path';
import { homedir } from 'os';

const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);

function parseArgs(argv) {
  const paths = [];
  const opts = {
    name: null,
    gap: 80,
    maxWidth: 4096,
    y: 0,
    frame: true,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--name') opts.name = argv[++i];
    else if (a === '--gap') opts.gap = Number(argv[++i]);
    else if (a === '--max-width') opts.maxWidth = Number(argv[++i]);
    else if (a === '--y') opts.y = Number(argv[++i]);
    else if (a === '--no-frame') opts.frame = false;
    else if (a.startsWith('-')) {
      console.error(`Unknown option: ${a}`);
      process.exit(1);
    } else paths.push(a);
  }
  return { paths, opts };
}

function collectImages(inputs) {
  const files = [];
  for (const raw of inputs) {
    const p = resolve(raw);
    if (!existsSync(p)) {
      console.error(`Not found: ${p}`);
      process.exit(1);
    }
    const st = statSync(p);
    if (st.isDirectory()) {
      // Prefer screenshots/ subfolder if present
      const shots = join(p, 'screenshots');
      const dir = existsSync(shots) && statSync(shots).isDirectory() ? shots : p;
      const names = readdirSync(dir)
        .filter((n) => IMAGE_EXT.has(extname(n).toLowerCase()))
        .sort();
      for (const n of names) files.push(join(dir, n));
    } else if (IMAGE_EXT.has(extname(p).toLowerCase())) {
      files.push(p);
    }
  }
  return files;
}

async function mahoragaEval(code, timeoutMs = 120000) {
  const tokenPath = join(homedir(), '.mahoraga', '.mahoraga-token');
  const token = existsSync(tokenPath) ? readFileSync(tokenPath, 'utf8').trim() : '';
  let res;
  try {
    res = await fetch('http://127.0.0.1:3456/exec', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'X-Mahoraga-Token': token } : {}),
      },
      body: JSON.stringify({ action: 'eval', code }),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (e) {
    throw new Error(
      `Mahoraga bridge not reachable (${e.message}). Run: node src/index.js connect`
    );
  }
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Bad Mahoraga response: ${text.slice(0, 200)}`);
  }
  if (data.error) throw new Error(data.error);
  return data.result;
}

function buildImportCode({ images, frameName, gap, startY, useFrame }) {
  // images: [{ name, dataUrl }]
  return `
(async () => {
  const items = ${JSON.stringify(images)};
  const gap = ${gap};
  const startY = ${startY};
  const useFrame = ${useFrame ? 'true' : 'false'};
  const frameName = ${JSON.stringify(frameName)};

  let startX = 0;
  for (const n of figma.currentPage.children) {
    startX = Math.max(startX, n.x + (n.width || 0));
  }
  startX += 100;

  const created = [];
  let x = startX;
  let maxH = 0;

  for (const item of items) {
    try {
      const image = await figma.createImageAsync(item.dataUrl);
      const size = await image.getSizeAsync();
      const rect = figma.createRectangle();
      rect.name = item.name;
      rect.resize(size.width, size.height);
      rect.x = x;
      rect.y = startY;
      rect.fills = [{ type: 'IMAGE', scaleMode: 'FILL', imageHash: image.hash }];
      created.push(rect);
      x += size.width + gap;
      maxH = Math.max(maxH, size.height);
    } catch (e) {
      created.push({ error: item.name + ': ' + e.message });
    }
  }

  if (useFrame && created.length && created.every(n => n && n.type)) {
    const frame = figma.createFrame();
    frame.name = frameName;
    frame.fills = [];
    frame.resize(Math.max(1, x - startX - gap), Math.max(1, maxH));
    frame.x = startX;
    frame.y = startY;
    for (const n of created) {
      const lx = n.x - startX;
      const ly = n.y - startY;
      frame.appendChild(n);
      n.x = lx;
      n.y = ly;
    }
    figma.currentPage.selection = [frame];
    figma.viewport.scrollAndZoomIntoView([frame]);
    return {
      ok: true,
      frameId: frame.id,
      count: created.length,
      x: startX,
      y: startY,
    };
  }

  const nodes = created.filter(n => n && n.type);
  if (nodes.length) {
    figma.currentPage.selection = nodes;
    figma.viewport.scrollAndZoomIntoView(nodes);
  }
  return {
    ok: true,
    count: nodes.length,
    errors: created.filter(c => c && c.error).map(c => c.error),
    x: startX,
    y: startY,
  };
})()
`;
}

async function maybeDownscale(buf, maxWidth) {
  if (!maxWidth || maxWidth <= 0) return { buffer: buf, mime: 'image/png' };
  try {
    const sharp = (await import('sharp')).default;
    const img = sharp(buf);
    const meta = await img.metadata();
    const w = meta.width || 0;
    const h = meta.height || 0;
    // Figma createImage max is 4096 on each side
    const limit = Math.min(maxWidth, 4096);
    if (w <= limit && h <= 4096) {
      return { buffer: buf, mime: meta.format === 'jpeg' ? 'image/jpeg' : 'image/png' };
    }
    const resized = await img
      .resize({
        width: w > limit ? limit : undefined,
        height: h > 4096 ? 4096 : undefined,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .png()
      .toBuffer();
    return { buffer: resized, mime: 'image/png' };
  } catch {
    return { buffer: buf, mime: 'image/png' };
  }
}

async function main() {
  const { paths, opts } = parseArgs(process.argv.slice(2));
  if (!paths.length) {
    console.error(
      'Usage: node paste_images_to_figma.mjs <dir-or-png...> [--name "Label"] [--gap 80] [--max-width 1440] [--no-frame]'
    );
    process.exit(1);
  }

  const files = collectImages(paths);
  if (!files.length) {
    console.error('No images found.');
    process.exit(1);
  }

  const frameName =
    opts.name ||
    (paths.length === 1 ? basename(resolve(paths[0])).replace(/\.[^.]+$/, '') : 'Imported screenshots');

  // Import in batches of 1–3 to keep payload size manageable
  const batchSize = 1;
  const allResults = [];
  let cursorY = opts.y;

  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    const images = [];
    for (const file of batch) {
      const raw = readFileSync(file);
      const { buffer, mime } = await maybeDownscale(raw, opts.maxWidth);
      const b64 = buffer.toString('base64');
      // Skip absurd payloads (>12MB base64 ~9MB file)
      if (b64.length > 12_000_000) {
        console.error(`Skipping (too large): ${file}`);
        continue;
      }
      images.push({
        name: basename(file),
        dataUrl: `data:${mime};base64,${b64}`,
      });
    }
    if (!images.length) continue;

    const code = buildImportCode({
      images,
      frameName: files.length === 1 ? frameName : `${frameName} / ${images[0].name}`,
      gap: opts.gap,
      startY: cursorY,
      useFrame: opts.frame && files.length === 1,
    });

    process.stderr.write(`Importing ${i + 1}/${files.length}: ${images[0].name}...\n`);
    const result = await mahoragaEval(code);
    allResults.push(result);

    // Stack subsequent images below if importing many without a single outer frame
    if (files.length > 1 && result && typeof result === 'object') {
      // Approximate next Y — re-query would be better; use gap stacking via eval next time
      cursorY = opts.y; // keep same Y, horizontal row handled inside each call via smartX
    }
  }

  // If multiple files, wrap all matching names in one frame with a follow-up eval
  if (opts.frame && files.length > 1) {
    const names = files.map((f) => basename(f));
    const wrapCode = `
(async () => {
  const names = ${JSON.stringify(names)};
  const frameName = ${JSON.stringify(frameName)};
  const nodes = figma.currentPage.children.filter(n => names.includes(n.name));
  if (!nodes.length) return { ok: false, error: 'No imported nodes found to wrap' };
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const n of nodes) {
    minX = Math.min(minX, n.x);
    minY = Math.min(minY, n.y);
    maxX = Math.max(maxX, n.x + n.width);
    maxY = Math.max(maxY, n.y + n.height);
  }
  const frame = figma.createFrame();
  frame.name = frameName;
  frame.fills = [];
  frame.resize(Math.max(1, maxX - minX), Math.max(1, maxY - minY));
  frame.x = minX;
  frame.y = minY;
  // append right-to-left so z-order stays; then fix positions
  const sorted = [...nodes].sort((a, b) => a.x - b.x);
  for (const n of sorted) {
    const lx = n.x - minX;
    const ly = n.y - minY;
    frame.appendChild(n);
    n.x = lx;
    n.y = ly;
  }
  figma.currentPage.selection = [frame];
  figma.viewport.scrollAndZoomIntoView([frame]);
  return { ok: true, frameId: frame.id, count: sorted.length };
})()
`;
    const wrapped = await mahoragaEval(wrapCode);
    allResults.push({ wrapped });
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        count: files.length,
        frameName,
        results: allResults,
      },
      null,
      2
    )
  );
}

main().catch((e) => {
  console.error(JSON.stringify({ ok: false, error: e.message }));
  process.exit(1);
});
