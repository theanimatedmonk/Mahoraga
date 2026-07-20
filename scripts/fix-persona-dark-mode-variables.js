/**
 * Run inside Figma via: node src/index.js eval --file scripts/fix-persona-dark-mode-variables.js
 *
 * Finds persona-card/* color variables in collection "Affirmations" where dark mode
 * is still placeholder (#fff / near-white) and sets dark values derived from light mode
 * (muted dark surfaces + readable tag text), similar to 03-early-spiritual-explorer.
 *
 * Skips any persona where dark bg is already a real dark color (L* < 85%).
 */
(async () => {
  const COLLECTION_NAME = 'Affirmations';

  function hexToRgb255(hex) {
    const h = String(hex).replace('#', '');
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    };
  }

  function rgb255ToFigma(rgb) {
    return {
      r: rgb.r / 255,
      g: rgb.g / 255,
      b: rgb.b / 255,
    };
  }

  function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h;
    let s;
    const l = (max + min) / 2;
    if (max === min) {
      h = 0;
      s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        default:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }
    return { h: h * 360, s, l };
  }

  function hslToRgb255(h, s, l) {
    h /= 360;
    let r;
    let g;
    let b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    return {
      r: Math.round(Math.min(255, Math.max(0, r * 255))),
      g: Math.round(Math.min(255, Math.max(0, g * 255))),
      b: Math.round(Math.min(255, Math.max(0, b * 255))),
    };
  }

  function hexFromFigmaColor(val) {
    if (!val || typeof val !== 'object' || !('r' in val)) return null;
    const r = Math.round(val.r * 255);
    const g = Math.round(val.g * 255);
    const b = Math.round(val.b * 255);
    return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
  }

  function isPlaceholderLightOnDark(hex) {
    if (!hex) return true;
    const n = hex.replace('#', '');
    const r = parseInt(n.slice(0, 2), 16);
    const g = parseInt(n.slice(2, 4), 16);
    const b = parseInt(n.slice(4, 6), 16);
    return r > 245 && g > 245 && b > 245;
  }

  function relativeLuminance255(rgb) {
    const lin = (c) => {
      const x = c / 255;
      return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
    };
    const R = lin(rgb.r);
    const G = lin(rgb.g);
    const B = lin(rgb.b);
    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
  }

  /** Derive dark-mode hex map from light hex map (keys: bg, shadow-color, profile-color, profile-border, tag-bg, tag). */
  function deriveDarkFromLight(light) {
    const bg = hexToRgb255(light.bg);
    const hslBg = rgbToHsl(bg.r, bg.g, bg.b);

    const darkBg = hslToRgb255(
      hslBg.h,
      Math.min(hslBg.s * 0.45 + 0.05, 0.3),
      0.13,
    );

    const darkShadow = hslToRgb255(hslBg.h, 0.04, 0.11);

    const pb = hexToRgb255(light['profile-border']);
    const hslPb = rgbToHsl(pb.r, pb.g, pb.b);
    const darkPBorder = hslToRgb255(
      hslPb.h,
      Math.min(hslPb.s * 0.9, 0.42),
      Math.max(hslPb.l * 0.52, 0.15),
    );

    const pf = hexToRgb255(light['profile-color']);
    const hslPf = rgbToHsl(pf.r, pf.g, pf.b);
    let darkPColor;
    if (hslPf.l > 0.8) {
      darkPColor = { r: pf.r, g: pf.g, b: pf.b };
    } else {
      darkPColor = hslToRgb255(hslPf.h, hslPf.s * 0.75, Math.min(hslPf.l + 0.32, 0.88));
    }

    const tb = hexToRgb255(light['tag-bg']);
    const hslTb = rgbToHsl(tb.r, tb.g, tb.b);
    const darkTagBg = hslToRgb255(
      hslTb.h,
      Math.min(hslTb.s * 0.55, 0.24),
      0.2,
    );

    const tg = hexToRgb255(light.tag);
    const hslTg = rgbToHsl(tg.r, tg.g, tg.b);
    let darkTag;
    if (hslTg.l < 0.45) {
      darkTag = hslToRgb255(hslTg.h, Math.min(hslTg.s * 0.25, 0.12), 0.9);
    } else {
      darkTag = hslToRgb255(hslTg.h, Math.min(hslTg.s * 0.35, 0.15), 0.88);
    }

    return {
      bg: darkBg,
      'shadow-color': darkShadow,
      'profile-color': darkPColor,
      'profile-border': darkPBorder,
      'tag-bg': darkTagBg,
      tag: darkTag,
    };
  }

  const vars = await figma.variables.getLocalVariablesAsync();
  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  const affirm = cols.find((c) => c.name === COLLECTION_NAME);
  if (!affirm) {
    return { error: `Collection "${COLLECTION_NAME}" not found` };
  }

  const lightMode = affirm.modes.find((m) => m.name.toLowerCase() === 'light');
  const darkMode = affirm.modes.find((m) => m.name.toLowerCase() === 'dark');
  if (!lightMode || !darkMode) {
    return { error: 'Need modes named light and dark on Affirmations' };
  }

  const colorVars = vars.filter(
    (v) =>
      v.name.startsWith('persona-card/') &&
      v.resolvedType === 'COLOR' &&
      v.variableCollectionId === affirm.id,
  );

  const keys = ['bg', 'tag-bg', 'tag', 'shadow-color', 'profile-border', 'profile-color'];

  const byPersona = {};
  for (const v of colorVars) {
    const m = v.name.match(/^persona-card\/([^/]+)\/(.+)$/);
    if (!m) continue;
    const [, slug, key] = m;
    if (!keys.includes(key)) continue;
    if (!byPersona[slug]) byPersona[slug] = { vars: {} };
    byPersona[slug].vars[key] = v;
  }

  let personasTouched = 0;
  let modesWritten = 0;
  const detail = [];

  for (const [slug, pack] of Object.entries(byPersona)) {
    const missing = keys.filter((k) => !pack.vars[k]);
    if (missing.length) continue;

    const light = {};
    for (const k of keys) {
      light[k] = hexFromFigmaColor(pack.vars[k].valuesByMode[lightMode.modeId]);
    }
    if (Object.values(light).some((x) => !x)) continue;

    const currentDarkBg = hexFromFigmaColor(pack.vars.bg.valuesByMode[darkMode.modeId]);
    const lum = relativeLuminance255(hexToRgb255(currentDarkBg || '#000000'));
    const alreadyGood = !isPlaceholderLightOnDark(currentDarkBg) && lum < 0.2;
    if (alreadyGood) {
      detail.push({ slug, action: 'skip', reason: 'dark bg already non-placeholder' });
      continue;
    }

    const derived255 = deriveDarkFromLight(light);
    for (const k of keys) {
      const fig = rgb255ToFigma(derived255[k]);
      pack.vars[k].setValueForMode(darkMode.modeId, fig);
      modesWritten += 1;
    }
    personasTouched += 1;
    detail.push({ slug, action: 'updated' });
  }

  return {
    ok: true,
    collection: COLLECTION_NAME,
    personasUpdated: personasTouched,
    variableModesWritten: modesWritten,
    detail,
  };
})();
