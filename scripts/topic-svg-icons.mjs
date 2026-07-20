/**
 * Per-topic SVG inner content (defs + shapes). viewBox 0 0 100 100; centered icons.
 * Stroke is applied by parent; clip-path ids must be unique per file → pass `id`.
 */
const COLOR = '#6B6D55';

export function hashId(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h) + 1;
}

function mulberry32(a) {
  return () => {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function fmt(n) {
  return String(Math.round(n * 10) / 10);
}

/** Rough parallel hatching inside circular clips (adds depth vs random scribbles alone). */
function directionalHatch(seed, cx, cy, r, nLines, angleBase) {
  const rnd = mulberry32(seed);
  const angle = angleBase + rnd() * 0.12;
  const co = Math.cos(angle);
  const si = Math.sin(angle);
  let out = '';
  const n = Math.max(2, nLines);
  for (let i = 0; i < n; i++) {
    const u = -r * 1.08 + (i / (n - 1)) * r * 2.16;
    const px = cx + co * u;
    const py = cy + si * u;
    const len = r * 2.35;
    let x1 = px - si * (len / 2);
    let y1 = py + co * (len / 2);
    let x2 = px + si * (len / 2);
    let y2 = py - co * (len / 2);
    x1 += (rnd() - 0.5) * 2.8;
    y1 += (rnd() - 0.5) * 2.8;
    x2 += (rnd() - 0.5) * 2.8;
    y2 += (rnd() - 0.5) * 2.8;
    out += `<path d="M ${fmt(x1)} ${fmt(y1)} L ${fmt(x2)} ${fmt(y2)}"/>`;
  }
  return out;
}

/** Light cross-hatch grid for rectangular clips. */
function rectCrossHatch(seed, x0, y0, w, h, lines) {
  const rnd = mulberry32(seed);
  let out = '';
  const n = Math.max(3, lines);
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const y = y0 + t * h;
    const j = (rnd() - 0.5) * 2.8;
    out += `<path d="M ${fmt(x0 + j)} ${fmt(y)} L ${fmt(x0 + w + j)} ${fmt(y)}"/>`;
  }
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const x = x0 + t * w;
    const j = (rnd() - 0.5) * 2.8;
    out += `<path d="M ${fmt(x)} ${fmt(y0 + j)} L ${fmt(x)} ${fmt(y0 + h + j)}"/>`;
  }
  return out;
}

function scribbleDiskCore(seed, cx, cy, r, count) {
  const rnd = mulberry32(seed);
  let out = '';
  for (let i = 0; i < count; i++) {
    const ang = rnd() * Math.PI * 2;
    const rad = Math.sqrt(rnd()) * r * 0.92;
    let x = cx + Math.cos(ang) * rad;
    let y = cy + Math.sin(ang) * rad;
    let d = `M ${fmt(x)} ${fmt(y)}`;
    for (let j = 0; j < 6; j++) {
      x += (rnd() - 0.5) * 8.5;
      y += (rnd() - 0.5) * 8.5;
      const d0 = Math.hypot(x - cx, y - cy);
      if (d0 > r) {
        x = cx + ((x - cx) * r) / d0;
        y = cy + ((y - cy) * r) / d0;
      }
      d += ` L ${fmt(x)} ${fmt(y)}`;
    }
    out += `<path d="${d}"/>`;
  }
  return out;
}

/** Chaotic scribbles + crossed hatching for tonal richness. */
function scribbleDisk(seed, cx, cy, r, count) {
  const base = scribbleDiskCore(seed, cx, cy, r, count);
  const h1 = `<g opacity="0.36" stroke-width="1.65">${directionalHatch(seed + 601, cx, cy, r, Math.max(11, Math.floor(count * 0.38)), 0.35)}</g>`;
  const h2 = `<g opacity="0.24" stroke-width="1.42">${directionalHatch(seed + 902, cx, cy, r * 0.84, 9, 0.35 + Math.PI / 2)}</g>`;
  return base + h1 + h2;
}

function scribbleRectCore(seed, x0, y0, w, h, count) {
  const rnd = mulberry32(seed);
  let out = '';
  for (let i = 0; i < count; i++) {
    let x = x0 + rnd() * w;
    let y = y0 + rnd() * h;
    let d = `M ${fmt(x)} ${fmt(y)}`;
    for (let j = 0; j < 6; j++) {
      x = Math.max(x0, Math.min(x0 + w, x + (rnd() - 0.5) * 10));
      y = Math.max(y0, Math.min(y0 + h, y + (rnd() - 0.5) * 10));
      d += ` L ${fmt(x)} ${fmt(y)}`;
    }
    out += `<path d="${d}"/>`;
  }
  return out;
}

function scribbleRect(seed, x0, y0, w, h, count) {
  const base = scribbleRectCore(seed, x0, y0, w, h, count);
  const xh = `<g opacity="0.31" stroke-width="1.55">${rectCrossHatch(seed + 404, x0, y0, w, h, 8)}</g>`;
  return base + xh;
}

/** Soft outer ring before a crisp main circle (adds weight). */
function ringEcho(cx, cy, r) {
  return `<circle cx="${cx}" cy="${cy}" r="${fmt(r + 1.1)}" opacity="0.09" stroke-width="5" fill="none"/><circle cx="${cx}" cy="${cy}" r="${fmt(r + 0.35)}" opacity="0.14" stroke-width="2.2" fill="none"/>`;
}

function ellipseEcho(cx, cy, rx, ry) {
  return `<ellipse cx="${cx}" cy="${cy}" rx="${fmt(rx + 1)}" ry="${fmt(ry + 1)}" opacity="0.08" stroke-width="4.5" fill="none"/>`;
}

function clipDef(uid, innerSvg) {
  return `<defs><clipPath id="${uid}">${innerSvg}</clipPath></defs>`;
}

function ground(seed) {
  const rnd = mulberry32(seed);
  let dBack = 'M 14 90';
  for (let x = 14; x < 86; x += 8) {
    dBack += ` Q ${fmt(x + 4)} ${fmt(90 + (rnd() - 0.5) * 3.5)} ${x + 8} 90`;
  }
  let dMid = 'M 18 85';
  for (let x = 18; x < 82; x += 7) {
    dMid += ` Q ${fmt(x + 3.5)} ${fmt(85 + (rnd() - 0.5) * 4.5)} ${x + 7} 85`;
  }
  let dFore = 'M 20 81';
  for (let x = 20; x < 80; x += 9) {
    dFore += ` Q ${fmt(x + 4.5)} ${fmt(81 + (rnd() - 0.5) * 5)} ${x + 9} 81`;
  }
  let skid = 'M 28 76 L 32 74 M 68 74 L 72 76';
  for (let i = 0; i < 3; i++) {
    const x = 35 + i * 15 + (rnd() - 0.5) * 4;
    skid += ` M ${fmt(x)} 80 l ${fmt(2 + rnd() * 2)} -2`;
  }
  return (
    `<path d="${dBack}" opacity="0.18"/>` +
    `<path d="${dMid}" opacity="0.34"/>` +
    `<path d="${dFore}" opacity="0.72"/>` +
    `<g opacity="0.45" stroke-width="2">${skid}</g>`
  );
}

/** Full-canvas texture + corner ticks (very light). */
export function ambientBackdrop(seed, safeId) {
  const rnd = mulberry32(seed + 1301);
  const id = `mist-${safeId}`;
  let out = `<defs><clipPath id="${id}"><rect x="8" y="8" width="84" height="84" rx="7"/></clipPath></defs>`;
  out += `<g clip-path="url(#${id})" stroke-width="1.1" opacity="0.085">`;
  for (let i = 0; i < 34; i++) {
    const x0 = 8 + rnd() * 84;
    const y0 = 8 + rnd() * 84;
    let d = `M ${fmt(x0)} ${fmt(y0)}`;
    for (let k = 0; k < 6; k++) {
      d += ` l ${fmt((rnd() - 0.5) * 16)} ${fmt((rnd() - 0.5) * 16)}`;
    }
    out += `<path d="${d}"/>`;
  }
  out += '</g>';
  out += `<g stroke-width="1.25" opacity="0.08">`;
  out += `<path d="M 6 10 Q 14 14 18 10"/><path d="M 94 10 Q 86 14 82 10"/>`;
  out += `<path d="M 6 90 Q 14 86 18 90"/><path d="M 94 90 Q 86 86 82 90"/>`;
  out += '</g>';
  return out;
}

/** Small sparks + specks; kept away from center to preserve icon clarity. */
export function sparkNotches(seed) {
  const rnd = mulberry32(seed + 2503);
  let out = `<g stroke-width="1.6" opacity="0.44">`;
  for (let i = 0; i < 8; i++) {
    const x = 12 + rnd() * 76;
    const y = 12 + rnd() * 76;
    if (Math.hypot(x - 50, y - 50) < 24) continue;
    const a = rnd() * Math.PI * 2;
    const len = 2.8 + rnd() * 5;
    const x2 = x + Math.cos(a) * len;
    const y2 = y + Math.sin(a) * len;
    out += `<path d="M ${fmt(x)} ${fmt(y)} L ${fmt(x2)} ${fmt(y2)}"/>`;
  }
  out += '</g>';
  out += `<g stroke-width="1.85" opacity="0.38">`;
  for (let i = 0; i < 5; i++) {
    const x = 10 + rnd() * 80;
    const y = 10 + rnd() * 80;
    if (Math.hypot(x - 50, y - 50) < 20) continue;
    out += `<circle cx="${fmt(x)}" cy="${fmt(y)}" r="1.1"/>`;
  }
  out += '</g>';
  return out;
}

/**
 * @param {number} index 0..39
 * @param {string} topicId e.g. 01-be-confident
 * @returns {string} SVG fragment (no svg wrapper)
 */
export function iconFragment(index, topicId) {
  const uid = `c-${topicId.replace(/[^a-z0-9-]/gi, '-')}`;
  const s = hashId(topicId);

  switch (index) {
    case 0: {
      // Sun
      const cx = 50;
      const cy = 38;
      const r = 12;
      let frag =
        clipDef(`${uid}-d`, `<circle cx="${cx}" cy="${cy}" r="${r}"/>`) +
        `<g clip-path="url(#${uid}-d)">${scribbleDisk(s, cx, cy, r, 48)}</g>`;
      frag += ringEcho(cx, cy, r);
      frag += `<circle cx="${cx}" cy="${cy}" r="${r}"/>`;
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2 - Math.PI / 2;
        const x1 = cx + Math.cos(a) * (r + 1.5);
        const y1 = cy + Math.sin(a) * (r + 1.5);
        const x2 = cx + Math.cos(a) * (r + 8);
        const y2 = cy + Math.sin(a) * (r + 8);
        frag += `<path d="M ${fmt(x1)} ${fmt(y1)} L ${fmt(x2)} ${fmt(y2)}"/>`;
      }
      frag += ground(s + 3);
      return frag;
    }
    case 1: {
      // Steps (side)
      let frag = '';
      const steps = [
        [32, 62, 18, 14],
        [44, 56, 18, 20],
        [56, 50, 18, 26],
      ];
      for (let i = 0; i < steps.length; i++) {
        const [x, y, w, h] = steps[i];
        const cid = `${uid}-s${i}`;
        frag += clipDef(cid, `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2"/>`);
        frag += `<g clip-path="url(#${cid})">${scribbleRect(s + i * 7, x, y, w, h, 22)}</g>`;
        frag += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="none"/>`;
      }
      frag += `<path d="M 26 48 L 26 40 M 74 48 L 74 40" opacity="0.9"/>`;
      frag += ground(s + 1);
      return frag;
    }
    case 2: {
      const frag =
        clipDef(`${uid}-o`, `<ellipse cx="50" cy="44" rx="17" ry="24"/>`) +
        `<g clip-path="url(#${uid}-o)">${scribbleDisk(s, 50, 44, 23, 50)}</g>` +
        `${ellipseEcho(50, 44, 17, 24)}` +
        `<ellipse cx="50" cy="44" rx="17" ry="24" fill="none"/>` +
        ground(s + 2);
      return frag;
    }
    case 3: {
      const d =
        'M 50 22 L 50 58 M 38 44 L 62 44 M 42 64 Q 50 72 58 64 Q 54 58 50 54 Q 46 58 42 64';
      let frag = clipDef(`${uid}-a`, `<path d="${d}"/>`);
      frag += `<g clip-path="url(#${uid}-a)">${scribbleRect(s, 30, 22, 40, 52, 38)}</g>`;
      frag += `<path d="${d}"/>`;
      frag += `<circle cx="50" cy="24" r="4"/>`;
      frag += ground(s + 4);
      return frag;
    }
    case 4: {
      let frag =
        clipDef(`${uid}-p`, `<circle cx="50" cy="44" r="22"/>`) +
        `<g clip-path="url(#${uid}-p)">${scribbleDisk(s, 50, 44, 20, 28)}</g>`;
      frag += ringEcho(50, 44, 22);
      frag += `<circle cx="50" cy="44" r="22"/>`;
      for (const x of [42, 58]) {
        const cid = `${uid}-b${x}`;
        frag += clipDef(cid, `<rect x="${x - 3}" y="36" width="6" height="16" rx="1"/>`);
        frag += `<g clip-path="url(#${cid})">${scribbleRect(s + x, x - 3, 36, 6, 16, 14)}</g>`;
        frag += `<rect x="${x - 3}" y="36" width="6" height="16" rx="1" fill="none"/>`;
      }
      frag += ground(s + 5);
      return frag;
    }
    case 5: {
      let d = '';
      const rnd = mulberry32(s);
      let a = 0;
      let r = 3;
      let x = 50;
      let y = 48;
      d += `M ${fmt(x)} ${fmt(y)}`;
      for (let i = 0; i < 28; i++) {
        a += 0.42 + rnd() * 0.15;
        r += 0.65;
        x = 50 + Math.cos(a) * r;
        y = 48 + Math.sin(a) * r;
        d += ` L ${fmt(x)} ${fmt(y)}`;
      }
      let frag = clipDef(`${uid}-sp`, `<path d="${d}"/>`);
      frag += `<g clip-path="url(#${uid}-sp)">${scribbleRect(s, 25, 25, 50, 50, 30)}</g>`;
      frag += `<path d="${d}"/>`;
      frag += ground(s + 6);
      return frag;
    }
    case 6: {
      const pts = [
        [50, 30],
        [62, 44],
        [50, 58],
        [38, 44],
      ];
      let frag = '';
      for (let i = 0; i < 4; i++) {
        const [cx, cy] = pts[i];
        const cid = `${uid}-p${i}`;
        frag += clipDef(cid, `<circle cx="${cx}" cy="${cy}" r="11"/>`);
        frag += `<g clip-path="url(#${cid})">${scribbleDisk(s + i * 9, cx, cy, 10, 26)}</g>`;
        frag += ringEcho(cx, cy, 11);
        frag += `<circle cx="${cx}" cy="${cy}" r="11" fill="none"/>`;
      }
      frag += `<circle cx="50" cy="44" r="3" fill="none"/>`;
      frag += ground(s + 7);
      return frag;
    }
    case 7: {
      const d = 'M 50 28 Q 62 36 58 52 Q 56 60 50 62 Q 44 58 42 52 Q 40 40 50 28';
      let frag = clipDef(`${uid}-f`, `<path d="${d}"/>`);
      frag += `<g clip-path="url(#${uid}-f)">${scribbleRect(s, 38, 28, 24, 36, 35)}</g>`;
      frag += `<path d="${d}"/>`;
      frag += `<path d="M 50 36 Q 54 44 52 50" opacity="0.9"/>`;
      frag += ground(s + 8);
      return frag;
    }
    case 8: {
      const cup =
        'M 32 38 L 32 50 Q 32 60 50 62 Q 68 60 68 50 L 68 38 Z M 38 65 L 62 65 L 58 72 L 42 72 Z';
      let frag = clipDef(`${uid}-t`, `<path d="${cup}"/>`);
      frag += `<g clip-path="url(#${uid}-t)">${scribbleRect(s, 30, 36, 40, 40, 36)}</g>`;
      frag += `<path d="${cup}"/>`;
      frag += `<path d="M 30 42 Q 28 48 32 52 M 70 42 Q 72 48 68 52"/>`;
      frag += ground(s + 9);
      return frag;
    }
    case 9: {
      let frag = '';
      for (let i = 0; i < 2; i++) {
        const rot = i === 0 ? '' : ` transform="rotate(90 50 44)"`;
        const cid = `${uid}-b${i}`;
        frag += clipDef(cid, `<g${rot}><rect x="38" y="38" width="24" height="10" rx="2"/></g>`);
        frag += `<g clip-path="url(#${cid})">${scribbleRect(s + i * 11, 38, 38, 24, 10, 16)}</g>`;
        frag += `<g${rot}><rect x="38" y="38" width="24" height="10" rx="2" fill="none"/></g>`;
      }
      frag += `<rect x="46" y="41" width="8" height="8" rx="1" opacity="0.9"/>`;
      frag += ground(s + 10);
      return frag;
    }
    case 10: {
      const pole = 'M 72 28 L 72 72';
      const flag = 'M 72 30 L 44 38 L 44 52 L 72 44 Z';
      let frag = clipDef(`${uid}-fl`, `<path d="${flag}"/>`);
      frag += `<g clip-path="url(#${uid}-fl)">${scribbleRect(s, 42, 30, 32, 24, 28)}</g>`;
      frag += `<path d="${flag}"/>`;
      frag += `<path d="${pole}"/>`;
      frag += ground(s + 11);
      return frag;
    }
    case 11: {
      const d =
        'M 32 48 L 50 42 L 68 48 L 68 52 L 50 58 L 32 52 Z M 50 58 L 50 68 M 42 68 L 58 68 M 62 46 L 66 54';
      let frag = clipDef(`${uid}-g`, `<path d="${d}"/>`);
      frag += `<g clip-path="url(#${uid}-g)">${scribbleRect(s, 30, 40, 40, 32, 32)}</g>`;
      frag += `<path d="${d}"/>`;
      frag += ground(s + 12);
      return frag;
    }
    case 12: {
      let frag = `<path d="M 22 56 L 78 56"/>`;
      frag += clipDef(`${uid}-sun`, `<path d="M 22 56 A 28 28 0 0 1 78 56"/>`);
      frag += `<g clip-path="url(#${uid}-sun)">${scribbleRect(s, 22, 28, 56, 30, 40)}</g>`;
      frag += `<path d="M 22 56 A 28 28 0 0 1 78 56"/>`;
      frag += ground(s + 13);
      return frag;
    }
    case 13: {
      const d =
        'M 52 30 A 22 22 0 1 1 52 74 M 58 32 L 64 28 M 58 32 L 60 38';
      let frag = clipDef(`${uid}-r`, `<path d="${d}"/>`);
      frag += `<g clip-path="url(#${uid}-r)">${scribbleRect(s, 28, 28, 44, 48, 34)}</g>`;
      frag += `<path d="${d}"/>`;
      frag += ground(s + 14);
      return frag;
    }
    case 14: {
      let frag = clipDef(`${uid}-gr`, `<ellipse cx="50" cy="68" rx="14" ry="6"/>`);
      frag += `<g clip-path="url(#${uid}-gr)">${scribbleRect(s, 36, 62, 28, 12, 16)}</g>`;
      frag += `<ellipse cx="50" cy="68" rx="14" ry="6" fill="none"/>`;
      frag += `<path d="M 50 68 L 50 52"/>`;
      frag += `<path d="M 50 52 Q 44 46 40 50 M 50 52 Q 56 46 60 50 M 50 48 Q 48 42 50 38"/>`;
      frag += ground(s + 15);
      return frag;
    }
    case 15: {
      let frag = clipDef(`${uid}-ci`, `<circle cx="50" cy="44" r="22"/>`);
      frag += `<g clip-path="url(#${uid}-ci)">${scribbleDisk(s, 50, 44, 16, 26)}</g>`;
      frag += ringEcho(50, 44, 22);
      frag += `<circle cx="50" cy="44" r="22"/>`;
      frag += `<path d="M 50 34 L 50 54 M 40 44 L 60 44"/>`;
      frag += ground(s + 16);
      return frag;
    }
    case 16: {
      const d = 'M 50 34 C 38 34 30 46 30 52 C 30 62 50 72 50 72 C 50 72 70 62 70 52 C 70 46 62 34 50 34 Z';
      let frag = clipDef(`${uid}-h`, `<path d="${d}"/>`);
      frag += `<g clip-path="url(#${uid}-h)">${scribbleRect(s, 28, 34, 44, 40, 42)}</g>`;
      frag += `<path d="${d}"/>`;
      frag += ground(s + 17);
      return frag;
    }
    case 17: {
      const d = 'M 50 30 Q 68 32 70 50 Q 68 66 50 68 Q 34 64 32 48 Q 34 34 50 30 Z';
      let frag = clipDef(`${uid}-b`, `<path d="${d}"/>`);
      frag += `<g clip-path="url(#${uid}-b)">${scribbleDisk(s, 50, 48, 22, 44)}</g>`;
      frag += `<path d="${d}"/>`;
      frag += ground(s + 18);
      return frag;
    }
    case 18: {
      const d = 'M 50 30 Q 62 42 58 58 Q 56 68 50 70 Q 44 64 42 54 Q 40 40 50 30 Z';
      let frag = clipDef(`${uid}-dr`, `<path d="${d}"/>`);
      frag += `<g clip-path="url(#${uid}-dr)">${scribbleRect(s, 40, 32, 24, 40, 38)}</g>`;
      frag += `<path d="${d}"/>`;
      frag += ground(s + 19);
      return frag;
    }
    case 19: {
      let frag = clipDef(`${uid}-bl`, `<ellipse cx="50" cy="40" rx="14" ry="16"/>`);
      frag += `<g clip-path="url(#${uid}-bl)">${scribbleDisk(s, 50, 40, 14, 36)}</g>`;
      frag += `<ellipse cx="50" cy="40" rx="14" ry="16" fill="none"/>`;
      frag += `<path d="M 50 56 Q 46 68 48 78 M 50 56 Q 54 68 52 78"/>`;
      frag += ground(s + 20);
      return frag;
    }
    case 20: {
      let frag = '';
      for (let p of [
        [36, 52],
        [54, 48],
      ]) {
        const [px, py] = p;
        const cid = `${uid}-ft${px}`;
        frag += clipDef(cid, `<ellipse cx="${px}" cy="${py}" rx="10" ry="14"/>`);
        frag += `<g clip-path="url(#${cid})">${scribbleDisk(s + px, px, py, 9, 20)}</g>`;
        frag += `<ellipse cx="${px}" cy="${py}" rx="10" ry="14" fill="none"/>`;
        for (let t = 0; t < 5; t++) {
          frag += `<circle cx="${px - 8 + t * 3.5}" cy="${py - 14}" r="1.8"/>`;
        }
      }
      frag += ground(s + 21);
      return frag;
    }
    case 21: {
      const shaft = 'M 50 78 L 50 36';
      const vaneL = 'M 50 36 L 36 50 L 34 62 L 46 54 Z';
      const vaneR = 'M 50 36 L 64 48 L 66 60 L 54 52 Z';
      let frag = clipDef(`${uid}-fe`, `<rect x="28" y="28" width="44" height="54"/>`);
      frag += `<g clip-path="url(#${uid}-fe)">${scribbleRect(s, 28, 28, 44, 52, 34)}</g>`;
      frag += `<path d="${shaft}"/><path d="${vaneL}"/><path d="${vaneR}"/>`;
      frag += ground(s + 22);
      return frag;
    }
    case 22: {
      const d = 'M 28 72 L 50 34 L 72 72 Z';
      let frag = clipDef(`${uid}-m`, `<path d="${d}"/>`);
      frag += `<g clip-path="url(#${uid}-m)">${scribbleRect(s, 28, 34, 44, 40, 40)}</g>`;
      frag += `<path d="${d}"/><path d="M 50 38 L 50 36" opacity="0.9"/>`;
      frag += ground(s + 23);
      return frag;
    }
    case 23: {
      const arch = 'M 28 68 Q 50 28 72 68';
      let frag = clipDef(`${uid}-br`, `<path d="${arch}"/>`);
      frag += `<g clip-path="url(#${uid}-br)">${scribbleRect(s, 28, 36, 44, 36, 28)}</g>`;
      frag += `<path d="${arch}"/><path d="M 28 68 L 72 68"/>`;
      frag += ground(s + 24);
      return frag;
    }
    case 24: {
      let frag = '';
      for (let i = 0; i < 2; i++) {
        const cx = i === 0 ? 40 : 60;
        const cid = `${uid}-rg${i}`;
        frag += clipDef(cid, `<circle cx="${cx}" cy="44" r="14"/>`);
        frag += `<g clip-path="url(#${cid})">${scribbleDisk(s + i * 13, cx, 44, 12, 26)}</g>`;
        frag += `<circle cx="${cx}" cy="44" r="14" fill="none"/>`;
      }
      frag += ground(s + 25);
      return frag;
    }
    case 25: {
      let frag = '';
      for (const [i, ox] of [
        [0, 38],
        [1, 62],
      ]) {
        frag += `<path d="M ${ox} 70 L ${ox} 54 M ${ox} 54 Q ${ox - 4} 48 ${ox - 8} 50 M ${ox} 54 Q ${ox + 4} 48 ${ox + 8} 50"/>`;
        const cid = `${uid}-sp${i}`;
        frag += clipDef(cid, `<circle cx="${ox}" cy="52" r="8"/>`);
        frag += `<g clip-path="url(#${cid})">${scribbleDisk(s + ox, ox, 52, 7, 14)}</g>`;
        frag += `<circle cx="${ox}" cy="52" r="8" fill="none"/>`;
      }
      frag += clipDef(`${uid}-soil`, `<ellipse cx="50" cy="72" rx="22" ry="5"/>`);
      frag += `<g clip-path="url(#${uid}-soil)">${scribbleRect(s, 28, 67, 44, 10, 12)}</g>`;
      frag += `<ellipse cx="50" cy="72" rx="22" ry="5" fill="none"/>`;
      frag += ground(s + 26);
      return frag;
    }
    case 26: {
      const stem = 'M 40 72 Q 55 50 64 34';
      let frag = clipDef(`${uid}-ol2`, `<rect x="28" y="28" width="44" height="48"/>`);
      frag += `<g clip-path="url(#${uid}-ol2)">${scribbleRect(s, 28, 28, 44, 48, 22)}</g>`;
      frag += `<path d="${stem}"/>`;
      for (let i = 0; i < 6; i++) {
        const t = 0.2 + i * 0.12;
        const px = 40 + (64 - 40) * t;
        const py = 72 + (34 - 72) * t;
        frag += `<path d="M ${fmt(px)} ${fmt(py)} l 6 -4 l -2 8 z"/>`;
      }
      frag += ground(s + 27);
      return frag;
    }
    case 27: {
      let frag = '';
      for (let i = 0; i < 3; i++) {
        const x = 34 + i * 16;
        const cid = `${uid}-p${i}`;
        frag += clipDef(cid, `<rect x="${x - 2}" y="40" width="4" height="32" rx="1"/>`);
        frag += `<g clip-path="url(#${cid})">${scribbleRect(s + i, x - 2, 40, 4, 32, 10)}</g>`;
        frag += `<rect x="${x - 2}" y="40" width="4" height="32" rx="1" fill="none"/>`;
      }
      frag += `<path d="M 30 52 L 70 52 M 30 62 L 70 62"/>`;
      frag += ground(s + 28);
      return frag;
    }
    case 28: {
      const d = 'M 34 40 Q 50 28 66 40 L 64 58 Q 50 66 36 58 Z';
      let frag = clipDef(`${uid}-hs`, `<path d="${d}"/>`);
      frag += `<g clip-path="url(#${uid}-hs)">${scribbleRect(s, 32, 32, 36, 38, 34)}</g>`;
      frag += `<path d="${d}"/>`;
      frag += ground(s + 29);
      return frag;
    }
    case 29: {
      const body = 'M 46 42 L 54 42 L 53 66 L 47 66 Z';
      const flame = 'M 50 42 Q 54 34 52 28 Q 50 32 48 28 Q 46 34 50 42';
      let frag = clipDef(`${uid}-cd`, `<path d="${body} ${flame}"/>`);
      frag += `<g clip-path="url(#${uid}-cd)">${scribbleRect(s, 44, 28, 12, 40, 30)}</g>`;
      frag += `<path d="${body}"/><path d="${flame}"/>`;
      frag += `<ellipse cx="50" cy="68" rx="10" ry="3" fill="none"/>`;
      frag += ground(s + 30);
      return frag;
    }
    case 30: {
      let frag = clipDef(`${uid}-pl`, `<circle cx="50" cy="44" r="16"/>`);
      frag += `<g clip-path="url(#${uid}-pl)">${scribbleDisk(s, 50, 44, 15, 42)}</g>`;
      frag += ringEcho(50, 44, 16);
      frag += `<circle cx="50" cy="44" r="16" fill="none"/>`;
      frag += `<ellipse cx="50" cy="44" rx="26" ry="6" fill="none" transform="rotate(-25 50 44)"/>`;
      frag += ground(s + 31);
      return frag;
    }
    case 31: {
      let frag = '';
      const paths = [
        'M 50 28 L 58 44 L 50 58 L 42 44 Z',
        'M 50 34 L 54 44 L 50 52 L 46 44 Z',
      ];
      for (let i = 0; i < paths.length; i++) {
        const cid = `${uid}-lt${i}`;
        frag += clipDef(cid, `<path d="${paths[i]}"/>`);
        frag += `<g clip-path="url(#${cid})">${scribbleRect(s + i, 40, 28, 20, 32, 18)}</g>`;
        frag += `<path d="${paths[i]}"/>`;
      }
      frag += ground(s + 32);
      return frag;
    }
    case 32: {
      let frag = clipDef(`${uid}-mo`, /* crescent using two circles - use path */ `<path d="M 62 44 A 16 16 0 1 1 50 30 A 12 12 0 1 0 62 44"/>`);
      frag += `<g clip-path="url(#${uid}-mo)">${scribbleDisk(s, 54, 40, 14, 35)}</g>`;
      frag += `<path d="M 62 44 A 16 16 0 1 1 50 30 A 12 12 0 1 0 62 44"/>`;
      frag += ground(s + 33);
      return frag;
    }
    case 33: {
      let frag = clipDef(`${uid}-tg`, `<circle cx="50" cy="44" r="20"/>`);
      frag += `<g clip-path="url(#${uid}-tg)">${scribbleDisk(s, 50, 44, 12, 24)}</g>`;
      frag += ringEcho(50, 44, 20);
      frag += `<circle cx="50" cy="44" r="20"/><circle cx="50" cy="44" r="12"/><circle cx="50" cy="44" r="3"/>`;
      frag += ground(s + 34);
      return frag;
    }
    case 34: {
      const glass =
        'M 38 32 L 62 32 L 58 44 L 58 60 L 42 60 L 42 44 Z M 42 60 L 40 68 L 60 68 L 58 60';
      let frag = clipDef(`${uid}-hg`, `<path d="${glass}"/>`);
      frag += `<g clip-path="url(#${uid}-hg)">${scribbleRect(s, 36, 32, 28, 38, 32)}</g>`;
      frag += `<path d="${glass}"/><path d="M 42 44 L 58 44" opacity="0.8"/>`;
      frag += ground(s + 35);
      return frag;
    }
    case 35: {
      const box = 'M 32 48 L 68 48 L 68 68 L 32 68 Z';
      const lid = 'M 30 48 L 50 38 L 70 48';
      let frag = clipDef(`${uid}-gf`, `<path d="${box}"/>`);
      frag += `<g clip-path="url(#${uid}-gf)">${scribbleRect(s, 32, 48, 36, 20, 28)}</g>`;
      frag += `<path d="${box}"/><path d="${lid}"/><path d="M 50 38 L 50 68 M 32 48 L 68 48"/>`;
      frag += `<path d="M 46 36 Q 50 32 54 36" fill="none"/>`;
      frag += ground(s + 36);
      return frag;
    }
    case 36: {
      let frag = clipDef(`${uid}-cp`, `<circle cx="50" cy="44" r="20"/>`);
      frag += `<g clip-path="url(#${uid}-cp)">${scribbleDisk(s, 50, 44, 14, 22)}</g>`;
      frag += `<circle cx="50" cy="44" r="20"/>`;
      frag += `<path d="M 50 30 L 50 58 M 35 44 L 65 44 M 42 36 L 58 52 M 58 36 L 42 52"/>`;
      frag += ground(s + 37);
      return frag;
    }
    case 37: {
      const seed = 'M 42 58 Q 50 48 58 58 Q 50 68 42 58';
      let frag = clipDef(`${uid}-sd`, `<path d="${seed}"/>`);
      frag += `<g clip-path="url(#${uid}-sd)">${scribbleRect(s, 40, 48, 20, 22, 24)}</g>`;
      frag += `<path d="${seed}"/>`;
      frag += `<path d="M 50 52 L 50 38 M 48 40 L 52 40 M 48 36 L 52 36"/>`;
      frag += ground(s + 38);
      return frag;
    }
    case 38: {
      const cloud =
        'M 36 48 Q 30 48 30 54 Q 32 60 40 60 Q 42 66 52 66 Q 62 66 64 58 Q 70 58 70 52 Q 70 46 62 46 Q 58 40 48 42 Q 40 40 36 48';
      let frag = clipDef(`${uid}-cl`, `<path d="${cloud}"/>`);
      frag += `<g clip-path="url(#${uid}-cl)">${scribbleRect(s, 28, 40, 44, 30, 36)}</g>`;
      frag += `<path d="${cloud}"/>`;
      frag += `<path d="M 58 38 L 60 34 L 62 38 L 66 36 L 64 40 L 68 42"/>`;
      frag += ground(s + 39);
      return frag;
    }
    case 39: {
      const tree =
        'M 50 72 L 50 54 M 50 54 Q 32 52 28 66 Q 40 58 50 54 M 50 54 Q 68 52 72 66 Q 60 58 50 54 M 50 40 Q 38 44 34 58 Q 44 50 50 46 M 50 40 Q 62 44 66 58 Q 56 50 50 46';
      let frag = clipDef(`${uid}-tr`, `<path d="${tree}"/>`);
      frag += `<g clip-path="url(#${uid}-tr)">${scribbleRect(s, 26, 36, 48, 40, 38)}</g>`;
      frag += `<path d="${tree}"/>`;
      frag += ground(s + 40);
      return frag;
    }
    default:
      return `<text x="10" y="50" font-size="8" fill="${COLOR}">#${index}</text>`;
  }
}
