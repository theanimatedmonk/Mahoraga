/**
 * Serializer + Code Generator for `drop save`.
 *
 * Flow:
 *   1. buildSerializerScript()  → eval code sent to Figma, captures selected node as JSON
 *   2. generateDropCode(tree)   → converts that JSON into Plugin API creation code
 *   3. saveDrop(entry)          → writes to saved.json
 *   4. loadSavedDrops()         → reads saved.json, returns template-ready drop objects
 *
 * Supported node types:
 *   FRAME, GROUP, COMPONENT, COMPONENT_SET, INSTANCE (flattened),
 *   TEXT (including mixed-style segments), RECTANGLE, ELLIPSE, LINE,
 *   VECTOR (full path data), STAR, POLYGON, BOOLEAN_OPERATION
 *
 * Fill support:
 *   SOLID, GRADIENT_LINEAR, GRADIENT_RADIAL, GRADIENT_ANGULAR, GRADIENT_DIAMOND
 *   IMAGE fills → rendered as labeled placeholder with crosshatch pattern
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SAVED_PATH = join(__dirname, 'saved.json');

// ── Serializer script (runs inside Figma via eval) ──────────────────

export function buildSerializerScript() {
  return `(async () => {
  const sel = figma.currentPage.selection;
  if (!sel.length) return JSON.stringify({ error: "Nothing selected. Select a frame first." });

  const R = (n) => Math.round(n * 100) / 100;
  const RC = (c) => ({ r: R(c.r), g: R(c.g), b: R(c.b), a: R(c.a !== undefined ? c.a : 1) });

  function serFill(fl) {
    if (fl.type === "SOLID") {
      const out = { type: "SOLID", r: R(fl.color.r), g: R(fl.color.g), b: R(fl.color.b) };
      if (fl.opacity !== undefined && fl.opacity < 1) out.a = R(fl.opacity);
      return out;
    }
    if (fl.type.startsWith("GRADIENT_")) {
      return {
        type: fl.type,
        stops: fl.gradientStops.map(s => ({ pos: R(s.position), color: RC(s.color) })),
        transform: fl.gradientTransform
      };
    }
    if (fl.type === "IMAGE") {
      return { type: "IMAGE", scaleMode: fl.scaleMode || "FILL" };
    }
    return { type: fl.type };
  }

  function serStroke(s) {
    if (s.type === "SOLID") return { type: "SOLID", r: R(s.color.r), g: R(s.color.g), b: R(s.color.b) };
    if (s.type.startsWith("GRADIENT_")) {
      return { type: s.type, stops: s.gradientStops.map(st => ({ pos: R(st.position), color: RC(st.color) })), transform: s.gradientTransform };
    }
    return { type: s.type };
  }

  function serTextSegments(node) {
    const len = node.characters.length;
    if (len === 0) return null;
    const segs = [];
    let i = 0;
    while (i < len) {
      const fn = node.getRangeFontName(i, i + 1);
      const fs = node.getRangeFontSize(i, i + 1);
      const fc = node.getRangeFills(i, i + 1);
      let j = i + 1;
      while (j < len) {
        const fn2 = node.getRangeFontName(j, j + 1);
        const fs2 = node.getRangeFontSize(j, j + 1);
        if (fn2.family !== fn.family || fn2.style !== fn.style || fs2 !== fs) break;
        j++;
      }
      const seg = { start: i, end: j, font: { family: fn.family, style: fn.style }, fontSize: fs };
      if (fc && fc.length > 0 && fc[0].type === "SOLID") {
        seg.color = { r: R(fc[0].color.r), g: R(fc[0].color.g), b: R(fc[0].color.b) };
      }
      segs.push(seg);
      i = j;
    }
    if (segs.length <= 1) return null;
    return segs;
  }

  async function ser(node, depth) {
    if (depth > 14) return null;
    if (node.type === "SLICE") return null;
    const o = { type: node.type, name: node.name, w: Math.round(node.width), h: Math.round(node.height) };

    if (node.x !== 0) o.x = Math.round(node.x);
    if (node.y !== 0) o.y = Math.round(node.y);
    if (node.opacity !== undefined && node.opacity < 1) o.opacity = R(node.opacity);
    if (node.visible === false) o.visible = false;
    if (node.rotation && node.rotation !== 0) o.rotation = R(node.rotation);

    // Fills
    if ('fills' in node) {
      const f = node.fills;
      if (f === figma.mixed) { o.fills = "mixed"; }
      else if (f.length === 0) { o.noFills = true; }
      else { o.fills = f.map(serFill); }
    }

    // Corner radius
    if ('cornerRadius' in node) {
      if (node.cornerRadius === figma.mixed) {
        o.tl = node.topLeftRadius; o.tr = node.topRightRadius;
        o.bl = node.bottomLeftRadius; o.br = node.bottomRightRadius;
      } else if (node.cornerRadius > 0) {
        o.cr = node.cornerRadius;
      }
    }

    // Auto layout
    if ('layoutMode' in node && node.layoutMode !== "NONE") {
      o.layout = node.layoutMode;
      if (node.itemSpacing) o.gap = node.itemSpacing;
      if (node.paddingTop) o.pt = node.paddingTop;
      if (node.paddingBottom) o.pb = node.paddingBottom;
      if (node.paddingLeft) o.pl = node.paddingLeft;
      if (node.paddingRight) o.pr = node.paddingRight;
      if (node.primaryAxisAlignItems !== "MIN") o.mainAlign = node.primaryAxisAlignItems;
      if (node.counterAxisAlignItems !== "MIN") o.crossAlign = node.counterAxisAlignItems;
      if (node.layoutWrap === "WRAP") o.wrap = true;
    }

    if ('layoutSizingHorizontal' in node) {
      if (node.layoutSizingHorizontal !== "FIXED") o.hSizing = node.layoutSizingHorizontal;
      if (node.layoutSizingVertical !== "FIXED") o.vSizing = node.layoutSizingVertical;
    }
    if ('layoutGrow' in node && node.layoutGrow === 1) o.grow = 1;
    if ('clipsContent' in node && node.clipsContent) o.clip = true;

    // Effects
    if ('effects' in node && node.effects.length > 0) {
      o.effects = node.effects.filter(e => e.visible !== false).map(e => ({
        type: e.type,
        ...(e.color ? { color: RC(e.color) } : {}),
        ...(e.offset ? { offset: { x: Math.round(e.offset.x), y: Math.round(e.offset.y) } } : {}),
        ...(e.radius !== undefined ? { radius: Math.round(e.radius) } : {}),
        ...(e.spread !== undefined && e.spread !== 0 ? { spread: Math.round(e.spread) } : {}),
        blendMode: e.blendMode || "NORMAL",
      }));
    }

    // Strokes
    if ('strokes' in node && node.strokes.length > 0) {
      o.strokes = node.strokes.map(serStroke);
      o.sw = node.strokeWeight;
      if (node.strokeAlign !== "INSIDE") o.strokeAlign = node.strokeAlign;
      if ('strokeCap' in node && node.strokeCap !== "NONE") o.strokeCap = node.strokeCap;
      if ('strokeJoin' in node && node.strokeJoin !== "MITER") o.strokeJoin = node.strokeJoin;
      if ('dashPattern' in node && node.dashPattern.length > 0) o.dashPattern = node.dashPattern;
    }

    // ── Type-specific data ──

    if (node.type === "TEXT") {
      o.chars = node.characters;
      const fs = node.fontSize;
      if (fs !== figma.mixed) o.fontSize = fs; else o.fontSize = 14;
      const fn = node.fontName;
      if (fn !== figma.mixed) o.font = { family: fn.family, style: fn.style };
      else o.font = { family: "Inter", style: "Regular" };
      if (node.textAlignHorizontal !== "LEFT") o.textAlign = node.textAlignHorizontal;
      if (node.textAlignVertical !== "TOP") o.textVAlign = node.textAlignVertical;
      const ls = node.letterSpacing;
      if (ls !== figma.mixed && ls.value !== 0) o.letterSpacing = ls;
      const lh = node.lineHeight;
      if (lh !== figma.mixed && lh.unit !== "AUTO") o.lineHeight = lh;
      if (node.textAutoResize && node.textAutoResize !== "NONE") o.autoResize = node.textAutoResize;
      try {
        const segs = serTextSegments(node);
        if (segs) o.segments = segs;
      } catch(e) {}
    }

    // Export vector-like nodes as SVG for faithful reproduction
    const SVG_TYPES = ["VECTOR", "STAR", "POLYGON", "LINE", "BOOLEAN_OPERATION"];
    if (SVG_TYPES.includes(node.type)) {
      try {
        const svgBuf = await node.exportAsync({ format: "SVG" });
        const svgStr = String.fromCharCode(...svgBuf);
        if (svgStr && svgStr.length < 50000) o.svgData = svgStr;
      } catch(e) {}
    }

    if (node.type === "VECTOR" && !o.svgData) {
      try {
        if (node.vectorPaths && node.vectorPaths.length > 0) {
          o.vectorPaths = node.vectorPaths.map(vp => ({
            windingRule: vp.windingRule,
            data: vp.data
          }));
        }
      } catch(e) { o.vectorFallback = true; }
    }

    if (node.type === "STAR" && !o.svgData) {
      o.pointCount = node.pointCount;
      o.innerRadius = R(node.innerRadius);
    }

    if (node.type === "POLYGON" && !o.svgData) {
      o.pointCount = node.pointCount;
    }

    if (node.type === "BOOLEAN_OPERATION") {
      o.booleanOp = node.booleanOperation;
    }

    if (node.type === "INSTANCE") {
      try {
        const mc = node.mainComponent;
        if (mc) o.componentName = mc.name;
      } catch(e) {}
    }

    // Children (BOOLEAN_OPERATION, FRAME, GROUP, COMPONENT, COMPONENT_SET, INSTANCE, etc.)
    if ('children' in node && node.children.length > 0) {
      const kids = [];
      for (const c of node.children) {
        const k = await ser(c, depth + 1);
        if (k) kids.push(k);
      }
      o.children = kids;
    }

    return o;
  }

  return JSON.stringify(await ser(sel[0], 0));
})()`;
}


// ── Code Generator (runs in Node.js) ────────────────────────────────

function buildFillLiteral(f) {
  if (f.type === 'SOLID') {
    const o = { type: 'SOLID', color: { r: f.r, g: f.g, b: f.b } };
    if (f.a !== undefined && f.a < 1) o.opacity = f.a;
    return o;
  }
  if (f.type?.startsWith('GRADIENT_') && f.stops) {
    return {
      type: f.type,
      gradientTransform: f.transform || [[1, 0, 0], [0, 1, 0]],
      gradientStops: f.stops.map(s => ({
        position: s.pos,
        color: { r: s.color.r, g: s.color.g, b: s.color.b, a: s.color.a ?? 1 },
      })),
    };
  }
  return null;
}

function buildStrokeLiteral(s) {
  if (s.type === 'SOLID') return { type: 'SOLID', color: { r: s.r, g: s.g, b: s.b } };
  if (s.type?.startsWith('GRADIENT_') && s.stops) {
    return {
      type: s.type,
      gradientTransform: s.transform || [[1, 0, 0], [0, 1, 0]],
      gradientStops: s.stops.map(st => ({
        position: st.pos,
        color: { r: st.color.r, g: st.color.g, b: st.color.b, a: st.color.a ?? 1 },
      })),
    };
  }
  return null;
}

export function generateDropCode(tree) {
  const fonts = new Set();

  function collectFonts(node) {
    if (node.font) fonts.add(JSON.stringify(node.font));
    if (node.segments) {
      for (const seg of node.segments) {
        fonts.add(JSON.stringify(seg.font));
      }
    }
    if (node.children) node.children.forEach(collectFonts);
  }
  collectFonts(tree);

  let code = '(async () => {\n';

  for (const f of fonts) {
    code += `  await figma.loadFontAsync(${f});\n`;
  }
  if (fonts.size > 0) code += '\n';

  let counter = 0;
  const booleanGroups = [];

  function emit(node, parentVar, indent, insideBoolean) {
    const v = `n${counter++}`;
    const isBoolean = node.type === 'BOOLEAN_OPERATION';

    // SVG-based reconstruction for vector-like nodes (icons, stars, etc.)
    const SVG_TYPES = ['VECTOR', 'STAR', 'POLYGON', 'LINE', 'BOOLEAN_OPERATION'];
    if (node.svgData && SVG_TYPES.includes(node.type)) {
      const escaped = JSON.stringify(node.svgData);
      code += `${indent}const ${v}_wrap = figma.createNodeFromSvg(${escaped});\n`;
      code += `${indent}const ${v} = figma.flatten([${v}_wrap]);\n`;
      code += `${indent}${v}.name = ${JSON.stringify(node.name)};\n`;
      code += `${indent}${v}.resize(${node.w}, ${node.h});\n`;
      if (node.x) code += `${indent}${v}.x = ${node.x};\n`;
      if (node.y) code += `${indent}${v}.y = ${node.y};\n`;
      if (node.opacity !== undefined) code += `${indent}${v}.opacity = ${node.opacity};\n`;
      if (node.rotation) code += `${indent}${v}.rotation = ${node.rotation};\n`;

      if (node.noFills) {
        code += `${indent}${v}.fills = [];\n`;
      } else if (node.fills && node.fills !== 'mixed') {
        const hasImage = node.fills.some(f => f.type === 'IMAGE');
        if (!hasImage) {
          const arr = node.fills.map(buildFillLiteral).filter(Boolean);
          if (arr.length > 0) code += `${indent}try { ${v}.fills = ${JSON.stringify(arr)}; } catch(e) {}\n`;
        }
      }
      if (node.strokes?.length > 0) {
        const arr = node.strokes.map(buildStrokeLiteral).filter(Boolean);
        if (arr.length > 0) code += `${indent}try { ${v}.strokes = ${JSON.stringify(arr)}; } catch(e) {}\n`;
        if (node.sw) code += `${indent}try { ${v}.strokeWeight = ${node.sw}; } catch(e) {}\n`;
      }

      if (parentVar) code += `${indent}${parentVar}.appendChild(${v});\n`;
      if (node.hSizing) code += `${indent}try { ${v}.layoutSizingHorizontal = "${node.hSizing}"; } catch(e) {}\n`;
      if (node.vSizing) code += `${indent}try { ${v}.layoutSizingVertical = "${node.vSizing}"; } catch(e) {}\n`;
      if (node.grow) code += `${indent}try { ${v}.layoutGrow = 1; } catch(e) {}\n`;
      return v;
    }

    // ── Create the node ──
    switch (node.type) {
      case 'TEXT':
        code += `${indent}const ${v} = figma.createText();\n`;
        break;
      case 'RECTANGLE':
        code += `${indent}const ${v} = figma.createRectangle();\n`;
        break;
      case 'ELLIPSE':
        code += `${indent}const ${v} = figma.createEllipse();\n`;
        break;
      case 'LINE':
        code += `${indent}const ${v} = figma.createLine();\n`;
        break;
      case 'STAR':
        code += `${indent}const ${v} = figma.createPolygon();\n`;
        break;
      case 'POLYGON':
        code += `${indent}const ${v} = figma.createPolygon();\n`;
        break;
      case 'VECTOR':
        code += `${indent}const ${v} = figma.createVector();\n`;
        break;
      case 'BOOLEAN_OPERATION':
        code += `${indent}// Boolean group "${node.name}" — children created first, combined below\n`;
        break;
      default:
        code += `${indent}const ${v} = figma.createFrame();\n`;
    }

    if (!isBoolean) {
      code += `${indent}${v}.name = ${JSON.stringify(node.name)};\n`;
    }

    // Resize (skip for text auto-sizing and booleans)
    if (!isBoolean && node.type !== 'TEXT') {
      code += `${indent}${v}.resize(${node.w}, ${node.h});\n`;
    }

    if (!isBoolean) {
      if (node.x) code += `${indent}${v}.x = ${node.x};\n`;
      if (node.y) code += `${indent}${v}.y = ${node.y};\n`;
    }
    if (node.opacity !== undefined) {
      if (!isBoolean) code += `${indent}${v}.opacity = ${node.opacity};\n`;
    }
    if (node.visible === false && !isBoolean) code += `${indent}${v}.visible = false;\n`;
    if (node.rotation && !isBoolean) code += `${indent}${v}.rotation = ${node.rotation};\n`;

    // ── Fills ──
    if (!isBoolean) {
      if (node.noFills) {
        code += `${indent}${v}.fills = [];\n`;
      } else if (node.fills && node.fills !== 'mixed') {
        const hasImage = node.fills.some(f => f.type === 'IMAGE');
        if (hasImage) {
          emitImagePlaceholder(v, node, indent);
        } else {
          const arr = node.fills.map(buildFillLiteral).filter(Boolean);
          if (arr.length > 0) code += `${indent}${v}.fills = ${JSON.stringify(arr)};\n`;
        }
      }
    }

    // Corner radius
    if (node.cr) {
      code += `${indent}${v}.cornerRadius = ${node.cr};\n`;
    } else if (node.tl !== undefined) {
      code += `${indent}${v}.topLeftRadius = ${node.tl};\n`;
      code += `${indent}${v}.topRightRadius = ${node.tr};\n`;
      code += `${indent}${v}.bottomLeftRadius = ${node.bl};\n`;
      code += `${indent}${v}.bottomRightRadius = ${node.br};\n`;
    }

    if (node.clip && !isBoolean) code += `${indent}${v}.clipsContent = true;\n`;

    // Auto layout
    if (node.layout && !isBoolean) {
      code += `${indent}${v}.layoutMode = "${node.layout}";\n`;
      if (node.gap) code += `${indent}${v}.itemSpacing = ${node.gap};\n`;
      if (node.pt) code += `${indent}${v}.paddingTop = ${node.pt};\n`;
      if (node.pb) code += `${indent}${v}.paddingBottom = ${node.pb};\n`;
      if (node.pl) code += `${indent}${v}.paddingLeft = ${node.pl};\n`;
      if (node.pr) code += `${indent}${v}.paddingRight = ${node.pr};\n`;
      if (node.mainAlign) code += `${indent}${v}.primaryAxisAlignItems = "${node.mainAlign}";\n`;
      if (node.crossAlign) code += `${indent}${v}.counterAxisAlignItems = "${node.crossAlign}";\n`;
      if (node.wrap) code += `${indent}${v}.layoutWrap = "WRAP";\n`;
    }

    // Effects
    if (node.effects?.length > 0 && !isBoolean) {
      code += `${indent}${v}.effects = ${JSON.stringify(node.effects.map(e => ({ ...e, visible: true })))};\n`;
    }

    // Strokes
    if (node.strokes?.length > 0 && !isBoolean) {
      const arr = node.strokes.map(buildStrokeLiteral).filter(Boolean);
      if (arr.length > 0) code += `${indent}${v}.strokes = ${JSON.stringify(arr)};\n`;
      if (node.sw) code += `${indent}${v}.strokeWeight = ${node.sw};\n`;
      if (node.strokeAlign) code += `${indent}${v}.strokeAlign = "${node.strokeAlign}";\n`;
      if (node.strokeCap) code += `${indent}${v}.strokeCap = "${node.strokeCap}";\n`;
      if (node.strokeJoin) code += `${indent}${v}.strokeJoin = "${node.strokeJoin}";\n`;
      if (node.dashPattern) code += `${indent}${v}.dashPattern = ${JSON.stringify(node.dashPattern)};\n`;
    }

    // ── Type-specific properties ──

    // Vector paths
    if (node.type === 'VECTOR' && node.vectorPaths) {
      code += `${indent}${v}.vectorPaths = ${JSON.stringify(node.vectorPaths)};\n`;
    } else if (node.type === 'VECTOR' && node.vectorFallback) {
      emitVectorPlaceholder(v, node, indent);
    }

    // Star
    if (node.type === 'STAR') {
      if (node.pointCount) code += `${indent}${v}.pointCount = ${node.pointCount};\n`;
      if (node.innerRadius !== undefined) code += `${indent}${v}.innerRadius = ${node.innerRadius};\n`;
    }

    // Polygon
    if (node.type === 'POLYGON') {
      if (node.pointCount) code += `${indent}${v}.pointCount = ${node.pointCount};\n`;
    }

    // Text
    if (node.type === 'TEXT') {
      if (node.font) code += `${indent}${v}.fontName = ${JSON.stringify(node.font)};\n`;
      code += `${indent}${v}.characters = ${JSON.stringify(node.chars || '')};\n`;
      if (node.fontSize) code += `${indent}${v}.fontSize = ${node.fontSize};\n`;
      if (node.textAlign) code += `${indent}${v}.textAlignHorizontal = "${node.textAlign}";\n`;
      if (node.textVAlign) code += `${indent}${v}.textAlignVertical = "${node.textVAlign}";\n`;
      if (node.letterSpacing) code += `${indent}${v}.letterSpacing = ${JSON.stringify(node.letterSpacing)};\n`;
      if (node.lineHeight) code += `${indent}${v}.lineHeight = ${JSON.stringify(node.lineHeight)};\n`;
      if (node.autoResize) code += `${indent}${v}.textAutoResize = "${node.autoResize}";\n`;

      if (node.segments?.length > 1) {
        for (const seg of node.segments) {
          code += `${indent}${v}.setRangeFontName(${seg.start}, ${seg.end}, ${JSON.stringify(seg.font)});\n`;
          code += `${indent}${v}.setRangeFontSize(${seg.start}, ${seg.end}, ${seg.fontSize});\n`;
          if (seg.color) {
            code += `${indent}${v}.setRangeFills(${seg.start}, ${seg.end}, [{ type: "SOLID", color: { r: ${seg.color.r}, g: ${seg.color.g}, b: ${seg.color.b} } }]);\n`;
          }
        }
      }
    }

    // Append to parent FIRST (FILL sizing requires an auto-layout parent)
    if (parentVar && !insideBoolean) {
      code += `${indent}${parentVar}.appendChild(${v});\n`;
    }

    // Layout sizing AFTER appendChild
    if (node.hSizing && !isBoolean) code += `${indent}${v}.layoutSizingHorizontal = "${node.hSizing}";\n`;
    if (node.vSizing && !isBoolean) code += `${indent}${v}.layoutSizingVertical = "${node.vSizing}";\n`;
    if (node.grow && !isBoolean) code += `${indent}${v}.layoutGrow = 1;\n`;

    // ── Boolean operations ──
    if (isBoolean && node.children?.length > 0) {
      const childVars = [];
      for (const child of node.children) {
        code += '\n';
        const cv = emit(child, null, indent, true);
        childVars.push(cv);
      }
      const opMap = { UNION: 'union', SUBTRACT: 'subtract', INTERSECT: 'intersect', EXCLUDE: 'exclude' };
      const op = opMap[node.booleanOp] || 'union';
      code += `\n${indent}const ${v} = figma.${op}([${childVars.join(', ')}], figma.currentPage);\n`;
      code += `${indent}${v}.name = ${JSON.stringify(node.name)};\n`;
      if (node.x) code += `${indent}${v}.x = ${node.x};\n`;
      if (node.y) code += `${indent}${v}.y = ${node.y};\n`;

      if (node.fills && node.fills !== 'mixed' && !node.noFills) {
        const arr = node.fills.map(buildFillLiteral).filter(Boolean);
        if (arr.length > 0) code += `${indent}${v}.fills = ${JSON.stringify(arr)};\n`;
      }
      if (node.effects?.length > 0) {
        code += `${indent}${v}.effects = ${JSON.stringify(node.effects.map(e => ({ ...e, visible: true })))};\n`;
      }

      if (parentVar) code += `${indent}${parentVar}.appendChild(${v});\n`;
      return v;
    }

    // Regular children
    if (node.children && !isBoolean) {
      for (const child of node.children) {
        code += '\n';
        emit(child, v, indent, false);
      }
    }

    return v;
  }

  function emitImagePlaceholder(v, node, indent) {
    const canHaveChildren = ['FRAME', 'GROUP', 'COMPONENT', 'COMPONENT_SET', 'INSTANCE', 'BOOLEAN_OPERATION'].includes(node.type);
    code += `${indent}// IMAGE fill → placeholder (original image not serializable)\n`;
    code += `${indent}${v}.fills = [{ type: "SOLID", color: { r: 0.85, g: 0.85, b: 0.88 } }];\n`;
    if (canHaveChildren) {
      code += `${indent}${v}.clipsContent = true;\n`;
      const diagSize = Math.max(node.w, node.h) * 2;
      code += `${indent}(() => {\n`;
      code += `${indent}  const d1 = figma.createLine();\n`;
      code += `${indent}  d1.resize(${diagSize}, 0); d1.rotation = 45;\n`;
      code += `${indent}  d1.strokes = [{ type: "SOLID", color: { r: 0.78, g: 0.78, b: 0.82 } }]; d1.strokeWeight = 1;\n`;
      code += `${indent}  ${v}.appendChild(d1);\n`;
      code += `${indent}  const d2 = figma.createLine();\n`;
      code += `${indent}  d2.resize(${diagSize}, 0); d2.rotation = -45;\n`;
      code += `${indent}  d2.strokes = [{ type: "SOLID", color: { r: 0.78, g: 0.78, b: 0.82 } }]; d2.strokeWeight = 1;\n`;
      code += `${indent}  ${v}.appendChild(d2);\n`;
      code += `${indent}})();\n`;
    }
  }

  function emitVectorPlaceholder(v, node, indent) {
    code += `${indent}// Vector path data unavailable — placeholder outline\n`;
    code += `${indent}${v}.fills = [{ type: "SOLID", color: { r: 0.9, g: 0.88, b: 0.95 } }];\n`;
    code += `${indent}${v}.strokes = [{ type: "SOLID", color: { r: 0.6, g: 0.55, b: 0.7 } }];\n`;
    code += `${indent}${v}.strokeWeight = 1;\n`;
  }

  const rootVar = emit(tree, null, '  ', false);
  code += `\n  figma.currentPage.appendChild(${rootVar});\n`;
  code += `  figma.viewport.scrollAndZoomIntoView([${rootVar}]);\n`;
  code += `  return { id: ${rootVar}.id, name: ${rootVar}.name };\n`;
  code += '})()';

  return code;
}


// ── Persistence (saved.json) ────────────────────────────────────────

export function loadSavedDrops() {
  try {
    const raw = readFileSync(SAVED_PATH, 'utf8');
    const entries = JSON.parse(raw);
    return entries.map(entry => ({
      id: entry.id,
      name: entry.name,
      aliases: entry.aliases || [],
      category: entry.category || 'saved',
      description: entry.description || 'Saved component',
      type: 'template',
      create: () => generateDropCode(entry.tree),
    }));
  } catch {
    return [];
  }
}

export function saveDrop({ id, name, aliases, category, description, tree }) {
  let entries = [];
  try {
    entries = JSON.parse(readFileSync(SAVED_PATH, 'utf8'));
  } catch { /* fresh start */ }

  const existing = entries.findIndex(e => e.id === id);
  const entry = { id, name, aliases: aliases || [], category: category || 'saved', description: description || '', tree };

  if (existing >= 0) {
    entries[existing] = entry;
  } else {
    entries.push(entry);
  }

  writeFileSync(SAVED_PATH, JSON.stringify(entries, null, 2) + '\n');
  return entries.length;
}
