#!/usr/bin/env node
/**
 * Generate topic images (40 scribble icons) via OpenAI Images API or Google Gemini.
 *
 * OpenAI (set key in shell only, never commit):
 *   export OPENAI_API_KEY="sk-..."
 *   npm run generate-topic-images
 *   node scripts/generate-topic-images.mjs --provider openai
 *
 * Gemini (Nano Banana = gemini-2.5-flash-image):
 *   export GEMINI_API_KEY="..."   # AI Studio key; GOOGLE_API_KEY also accepted
 *   npm run generate-topic-images:gemini
 *
 * Options:
 *   --provider openai|gemini   (env: IMAGE_PROVIDER). Default openai unless model id is gemini-*.
 *   --manifest <path>   JSON array of { id, filename, prompt, colors? } (colors optional)
 *   --out <dir>         Output directory (default: ./assets/topic-images)
 *   --model <id>        OpenAI: dall-e-3 | gpt-image-1. Gemini: gemini-2.5-flash-image | gemini-3.1-flash-image-preview | aliases below.
 *   --size <wxh>        OpenAI Images size only (default: auto from --target)
 *   --target <wxh>      Final PNG (default: 372x205). Resized with sharp after download.
 *   --quality <q>       OpenAI dall-e-3: standard | hd
 *   --gemini-aspect <r> Gemini imageConfig aspect ratio (default: auto from --target, e.g. 16:9)
 *   --gemini-image-size   Gemini: 512 | 1K | 2K | 4K (default: 1K)
 *   --delay <ms>        Pause between API calls (default: 1200)
 *   --force             Overwrite existing PNGs
 *   --dry-run           Print plan only
 *
 * Gemini model aliases (marketing names → API id):
 *   nano-banana          → gemini-2.5-flash-image
 *   nano-banana-2        → gemini-3.1-flash-image-preview
 *   nano-banana-pro      → gemini-3-pro-image-preview
 */

import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const GEMINI_MODEL_ALIASES = {
  'nano-banana': 'gemini-2.5-flash-image',
  'nano_banana': 'gemini-2.5-flash-image',
  'gemini-nano-banana': 'gemini-2.5-flash-image',
  'nano-banana-2': 'gemini-3.1-flash-image-preview',
  'nano_banana_2': 'gemini-3.1-flash-image-preview',
  'nano-banana-pro': 'gemini-3-pro-image-preview',
  'nano_banana_pro': 'gemini-3-pro-image-preview',
};

function resolveModelId(raw) {
  if (!raw) return raw;
  const key = String(raw).trim().toLowerCase();
  return GEMINI_MODEL_ALIASES[key] || raw;
}

function parseArgs() {
  const a = process.argv.slice(2);
  const out = { dryRun: false, force: false };
  for (let i = 0; i < a.length; i++) {
    if (a[i] === '--dry-run') out.dryRun = true;
    else if (a[i] === '--force') out.force = true;
    else if (a[i] === '--manifest' && a[i + 1]) {
      out.manifest = a[++i];
    } else if (a[i] === '--out' && a[i + 1]) {
      out.out = a[++i];
    } else if (a[i] === '--provider' && a[i + 1]) {
      out.provider = a[++i].toLowerCase();
    } else if (a[i] === '--model' && a[i + 1]) {
      out.model = a[++i];
    } else if (a[i] === '--size' && a[i + 1]) {
      out.size = a[++i];
    } else if (a[i] === '--target' && a[i + 1]) {
      out.target = a[++i];
    } else if (a[i] === '--quality' && a[i + 1]) {
      out.quality = a[++i];
    } else if (a[i] === '--gemini-aspect' && a[i + 1]) {
      out.geminiAspect = a[++i];
    } else if (a[i] === '--gemini-image-size' && a[i + 1]) {
      out.geminiImageSize = a[++i];
    } else if (a[i] === '--delay' && a[i + 1]) {
      out.delayMs = parseInt(a[++i], 10);
    }
  }
  return out;
}

function parseWxH(s) {
  const m = String(s).trim().match(/^(\d+)\s*x\s*(\d+)$/i);
  if (!m) return null;
  return { w: parseInt(m[1], 10), h: parseInt(m[2], 10) };
}

/** Pick OpenAI Images size closest to target aspect (dall-e-3 fixed sizes). */
function defaultOpenAiSizeForAspect(aspect) {
  const sizes = [
    { id: '1024x1024', ar: 1 },
    { id: '1792x1024', ar: 1792 / 1024 },
    { id: '1024x1792', ar: 1024 / 1792 },
  ];
  let best = sizes[0];
  let bestDiff = Math.abs(aspect - best.ar);
  for (const s of sizes) {
    const d = Math.abs(aspect - s.ar);
    if (d < bestDiff) {
      best = s;
      bestDiff = d;
    }
  }
  return best.id;
}

/**
 * Gemini allows discrete aspect ratios; pick closest to pixel aspect.
 * See: https://ai.google.dev/gemini-api/docs/image-generation
 */
function defaultGeminiAspectRatioForAspect(aspect) {
  const ratios = [
    ['1:1', 1],
    ['2:3', 2 / 3],
    ['3:2', 3 / 2],
    ['3:4', 3 / 4],
    ['4:3', 4 / 3],
    ['4:5', 4 / 5],
    ['5:4', 5 / 4],
    ['9:16', 9 / 16],
    ['16:9', 16 / 9],
    ['21:9', 21 / 9],
  ];
  let best = ratios[0];
  let bestDiff = Math.abs(aspect - best[1]);
  for (const [name, ar] of ratios) {
    const d = Math.abs(aspect - ar);
    if (d < bestDiff) {
      best = [name, ar];
      bestDiff = d;
    }
  }
  return best[0];
}

/** Build the final prompt: color lock first (image models follow leading constraints), then art direction. */
function appendColorsToPrompt(basePrompt, colors) {
  if (!colors || typeof colors !== 'object') return basePrompt;

  const bg = colors.bg;
  const shadow = colors.shadowColor;
  const profile = colors.profileColor;
  const ring = colors.profileBorder;
  const nameHue = colors.name;
  const descHue = colors.description;
  const tagBg = colors.tagBg;
  const tagInk = colors.tag;
  const t1 = colors.tag1;
  const t2 = colors.tag2;
  const t3 = colors.tag3;

  const allHex = [bg, shadow, profile, ring, nameHue, descHue, tagBg, tagInk, t1, t2, t3].filter(Boolean);
  const uniqueHex = [...new Set(allHex)];

  const lines = [
    'PALETTE — COLOR LOCK (required):',
    'Use ONLY the hex colors below. Flat fills or very soft blends between these values only—no extra hues. The scene must feel calm, empty, and app-header sized (a small hero strip, not a poster).',
    '',
    `All palette hex codes: ${uniqueHex.join(', ')}`,
    '',
    `- Background / largest fields: ${bg ?? '—'}`,
    `- Depth / shadow tone (subtle): ${shadow ?? '—'}`,
    `- Main accent mass (water, sun, path—whatever the brief names): ${profile ?? '—'}`,
    `- Second edge / highlight: ${ring ?? '—'}`,
    `- Dark typography hue (never draw text): ${nameHue ?? '—'}`,
    `- Muted tone (never draw text): ${descHue ?? '—'}`,
    `- Tag-like accents (never draw pills or labels): ${tagBg ?? '—'}, ${tagInk ?? '—'}, ${t1 ?? '—'}, ${t2 ?? '—'}, ${t3 ?? '—'}`,
    '',
    'STYLE — ULTRA-MINIMAL (required): Flat vector / editorial app illustration. At most THREE or FOUR large simple shapes total (circles, rounded rectangles, soft blobs, horizon bands). No texture, no noise, no photorealism, no 3D, no icons, no mandalas, no birds/animals, no faces, no lettering. No color-palette strip, swatch row, legend squares, frames, or UI mockups—only the abstract scene.',
    '---',
    '',
    basePrompt.trim(),
  ];

  return lines.join('\n');
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function extractGeminiImageB64(parts) {
  if (!parts?.length) return null;
  for (const part of parts) {
    const inline = part.inlineData || part.inline_data;
    if (inline?.data) return inline.data;
  }
  return null;
}

async function createImageOpenAI({
  apiKey,
  model,
  prompt,
  size,
  quality,
}) {
  const body = {
    model,
    prompt,
    n: 1,
    size,
    response_format: 'b64_json',
  };
  if (model === 'dall-e-3') {
    body.quality = quality || 'standard';
  }
  if (model.startsWith('gpt-image')) {
    delete body.quality;
  }

  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  if (!res.ok) {
    let detail = text;
    try {
      const j = JSON.parse(text);
      detail = j.error?.message || text;
    } catch {
      /* ignore */
    }
    throw new Error(`OpenAI ${res.status}: ${detail}`);
  }
  const data = JSON.parse(text);
  const item = data.data?.[0];
  if (!item?.b64_json) {
    throw new Error('No b64_json in response (check model + response_format support)');
  }
  return Buffer.from(item.b64_json, 'base64');
}

async function createImageGemini({
  apiKey,
  model,
  prompt,
  aspectRatio,
  imageSize,
}) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const contents = [
    {
      role: 'user',
      parts: [{ text: prompt }],
    },
  ];

  const withImageConfig = {
    contents,
    generationConfig: {
      responseModalities: ['TEXT', 'IMAGE'],
      imageConfig: {
        aspectRatio,
        imageSize,
      },
    },
  };

  const minimalConfig = {
    contents,
    generationConfig: {
      responseModalities: ['TEXT', 'IMAGE'],
    },
  };

  async function post(body) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'x-goog-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    return { res, text };
  }

  let { res, text } = await post(withImageConfig);
  if (!res.ok && res.status === 400) {
    const retry = await post(minimalConfig);
    res = retry.res;
    text = retry.text;
  }

  if (!res.ok) {
    let detail = text;
    try {
      const j = JSON.parse(text);
      detail = j.error?.message || j.error?.status || text;
    } catch {
      /* ignore */
    }
    throw new Error(`Gemini ${res.status}: ${detail}`);
  }
  const data = JSON.parse(text);
  const parts = data.candidates?.[0]?.content?.parts;
  const b64 = extractGeminiImageB64(parts);
  if (!b64) {
    const block = data.promptFeedback?.blockReason;
    throw new Error(
      block
        ? `Gemini blocked: ${block}`
        : 'No image in response (try --model nano-banana-2 or another Gemini image model)',
    );
  }
  return Buffer.from(b64, 'base64');
}

async function maybeResizeToTarget(buf, tw, th) {
  if (!tw || !th) return buf;
  const sharpMod = await import('sharp').catch(() => null);
  if (!sharpMod?.default) {
    throw new Error(
      'Resize requested but sharp is not installed. Run: npm install (devDependencies include sharp)',
    );
  }
  return sharpMod.default(buf)
    .resize(tw, th, { fit: 'cover', position: 'centre' })
    .png()
    .toBuffer();
}

async function main() {
  const args = parseArgs();
  const manifestPath = resolve(ROOT, args.manifest || 'scripts/topic-image-prompts.json');
  const outDir = resolve(ROOT, args.out || 'assets/topic-images');
  const delayMs = Number.isFinite(args.delayMs) ? args.delayMs : 1200;

  const targetStr = args.target || process.env.OPENAI_IMAGE_TARGET || process.env.IMAGE_TARGET || '372x205';
  const target = parseWxH(targetStr);
  if (!target) {
    console.error(`Invalid --target / OPENAI_IMAGE_TARGET / IMAGE_TARGET: ${targetStr} (use e.g. 372x205)`);
    process.exit(1);
  }

  const aspect = target.w / target.h;

  const envProvider = (process.env.IMAGE_PROVIDER || '').toLowerCase();
  const cliProvider = args.provider?.toLowerCase();

  /** For default model only: CLI beats env; `null` means “no preference” → OpenAI defaults. */
  const modelPreference = cliProvider || envProvider || null;

  const rawModel =
    args.model
    || (modelPreference === 'gemini' || modelPreference === 'google'
      ? process.env.GEMINI_IMAGE_MODEL || 'nano-banana'
      : process.env.OPENAI_IMAGE_MODEL || 'dall-e-3');

  const model = resolveModelId(rawModel);

  let provider =
    cliProvider
    || envProvider
    || (model.startsWith('gemini') ? 'gemini' : 'openai');

  if (provider === 'openai' && model.startsWith('gemini')) {
    console.error(
      'OpenAI provider cannot use a Gemini model id. Use --provider gemini, or --model dall-e-3 (default) for OpenAI.',
    );
    process.exit(1);
  }

  if (provider !== 'openai' && provider !== 'gemini' && provider !== 'google') {
    console.error(`Invalid --provider / IMAGE_PROVIDER: ${provider} (use openai or gemini)`);
    process.exit(1);
  }
  if (provider === 'google') provider = 'gemini';

  const quality = args.quality || process.env.OPENAI_IMAGE_QUALITY || 'standard';
  const defaultOpenAi = defaultOpenAiSizeForAspect(aspect);
  const size = args.size || process.env.OPENAI_IMAGE_SIZE || defaultOpenAi;

  const geminiAspect =
    args.geminiAspect
    || process.env.GEMINI_IMAGE_ASPECT
    || defaultGeminiAspectRatioForAspect(aspect);
  const geminiImageSize =
    args.geminiImageSize || process.env.GEMINI_IMAGE_SIZE_TIER || '1K';

  const openaiKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!args.dryRun) {
    if (provider === 'openai' && !openaiKey) {
      console.error('Missing OPENAI_API_KEY (OpenAI provider).');
      process.exit(1);
    }
    if (provider === 'gemini' && !geminiKey) {
      console.error('Missing GEMINI_API_KEY or GOOGLE_API_KEY (Gemini provider).');
      process.exit(1);
    }
  }

  let entries;
  try {
    entries = JSON.parse(readFileSync(manifestPath, 'utf8'));
  } catch (e) {
    console.error(`Failed to read manifest: ${manifestPath}`, e.message);
    process.exit(1);
  }
  if (!Array.isArray(entries)) {
    console.error('Manifest must be a JSON array');
    process.exit(1);
  }

  mkdirSync(outDir, { recursive: true });

  console.log(`Manifest:  ${manifestPath}`);
  console.log(`Output:    ${outDir}`);
  console.log(`Provider:  ${provider}`);
  console.log(`Model:     ${model}`);
  if (provider === 'openai') {
    console.log(`API size:  ${size}  →  target PNG: ${target.w}x${target.h}`);
  } else {
    console.log(`Gemini:    aspect ${geminiAspect}, tier ${geminiImageSize}  →  target PNG: ${target.w}x${target.h}`);
  }

  if (args.dryRun) {
    console.log('\nDry run — would generate:\n');
    for (const e of entries) {
      const p = appendColorsToPrompt(e.prompt || '', e.colors);
      console.log(`  ${e.filename}  (${e.id})\n    ${p.slice(0, 160)}…\n`);
    }
    return;
  }

  let ok = 0;
  let skip = 0;
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    if (!e.filename || !e.prompt) {
      console.warn(`Skip invalid entry at index ${i}`);
      continue;
    }
    const dest = join(outDir, e.filename);
    if (existsSync(dest) && !args.force) {
      console.log(`[skip] ${e.filename} (exists, use --force)`);
      skip++;
      continue;
    }
    process.stdout.write(`[${i + 1}/${entries.length}] ${e.filename} … `);
    try {
      const fullPrompt = appendColorsToPrompt(e.prompt, e.colors);
      let buf;
      if (provider === 'gemini') {
        buf = await createImageGemini({
          apiKey: geminiKey,
          model,
          prompt: fullPrompt,
          aspectRatio: geminiAspect,
          imageSize: geminiImageSize,
        });
      } else {
        buf = await createImageOpenAI({
          apiKey: openaiKey,
          model,
          prompt: fullPrompt,
          size,
          quality,
        });
      }
      buf = await maybeResizeToTarget(buf, target.w, target.h);
      writeFileSync(dest, buf);
      console.log('ok');
      ok++;
    } catch (err) {
      console.log('FAILED');
      console.error(`  ${err.message}`);
    }
    if (i < entries.length - 1 && delayMs > 0) await sleep(delayMs);
  }
  console.log(`\nDone. ${ok} written, ${skip} skipped, ${entries.length - ok - skip} failed.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
