/**
 * Drop Registry — maps friendly names to Figma components or code templates.
 *
 * Two types of drops:
 *   "library"  — pulls a published component from a Figma team library by key
 *   "template" — creates the component from JSX/eval code (self-contained)
 *   "saved"    — user-saved components (stored in saved.json, auto-loaded)
 *
 * To add a new drop:
 *   1. Add an entry to the BUILT_IN array below, OR
 *   2. Select a frame in Figma and run: drop save <name>
 */

import { loadSavedDrops } from './serializer.js';

const BUILT_IN = [
  // ── Android ──
  {
    id: 'android-bottom-sheet',
    name: 'Android Bottom Sheet',
    aliases: ['bottom-sheet', 'bottom sheet', 'bottomsheet'],
    category: 'android',
    description: 'Material Design 3 bottom sheet with drag handle and content area',
    type: 'template',
    create: () => `
(async () => {
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });

  const sheet = figma.createFrame();
  sheet.name = "Bottom Sheet";
  sheet.resize(390, 420);
  sheet.fills = [{ type: "SOLID", color: { r: 0.98, g: 0.98, b: 0.98 } }];
  sheet.cornerRadius = 28;
  sheet.layoutMode = "VERTICAL";
  sheet.primaryAxisAlignItems = "MIN";
  sheet.counterAxisAlignItems = "CENTER";
  sheet.paddingTop = 12;

  // Drag handle
  const handle = figma.createFrame();
  handle.name = "Drag Handle";
  handle.resize(32, 4);
  handle.cornerRadius = 2;
  handle.fills = [{ type: "SOLID", color: { r: 0.78, g: 0.78, b: 0.78 } }];
  sheet.appendChild(handle);

  // Content area
  const content = figma.createFrame();
  content.name = "Content";
  content.fills = [];
  content.layoutMode = "VERTICAL";
  content.itemSpacing = 0;
  content.paddingTop = 20;
  sheet.appendChild(content);
  content.layoutSizingHorizontal = "FILL";
  content.layoutSizingVertical = "FILL";

  // Title
  const titleRow = figma.createFrame();
  titleRow.name = "Title Row";
  titleRow.fills = [];
  titleRow.layoutMode = "HORIZONTAL";
  titleRow.paddingLeft = 24; titleRow.paddingRight = 24;
  titleRow.paddingBottom = 16;
  content.appendChild(titleRow);
  titleRow.layoutSizingHorizontal = "FILL";
  const title = figma.createText();
  title.fontName = { family: "Inter", style: "Bold" };
  title.characters = "Bottom Sheet Title";
  title.fontSize = 20;
  title.fills = [{ type: "SOLID", color: { r: 0.1, g: 0.1, b: 0.1 } }];
  titleRow.appendChild(title);

  // List items
  const items = ["Share", "Get link", "Edit name", "Delete collection"];
  const icons = ["↗", "🔗", "✏️", "🗑️"];
  for (let i = 0; i < items.length; i++) {
    const row = figma.createFrame();
    row.name = items[i];
    row.fills = [];
    row.layoutMode = "HORIZONTAL";
    row.counterAxisAlignItems = "CENTER";
    row.itemSpacing = 16;
    row.paddingLeft = 24; row.paddingRight = 24;
    row.paddingTop = 14; row.paddingBottom = 14;
    content.appendChild(row);
    row.layoutSizingHorizontal = "FILL";

    const icon = figma.createFrame();
    icon.name = "Icon";
    icon.resize(40, 40);
    icon.cornerRadius = 20;
    icon.fills = [{ type: "SOLID", color: { r: 0.93, g: 0.93, b: 0.96 } }];
    icon.layoutMode = "HORIZONTAL";
    icon.primaryAxisAlignItems = "CENTER";
    icon.counterAxisAlignItems = "CENTER";
    row.appendChild(icon);

    const label = figma.createText();
    label.fontName = { family: "Inter", style: "Medium" };
    label.characters = items[i];
    label.fontSize = 16;
    label.fills = [{ type: "SOLID", color: { r: 0.1, g: 0.1, b: 0.1 } }];
    row.appendChild(label);
  }

  figma.currentPage.appendChild(sheet);
  figma.viewport.scrollAndZoomIntoView([sheet]);
  return { id: sheet.id, name: sheet.name };
})()`
  },


  {
    id: 'android-fab',
    name: 'Android FAB',
    aliases: ['fab', 'floating action button'],
    category: 'android',
    description: 'Material Design 3 floating action button',
    type: 'template',
    create: () => `
(async () => {
  const fab = figma.createFrame();
  fab.name = "FAB";
  fab.resize(56, 56);
  fab.cornerRadius = 16;
  fab.fills = [{ type: "SOLID", color: { r: 0.4, g: 0.3, b: 0.85 } }];
  fab.layoutMode = "HORIZONTAL";
  fab.primaryAxisAlignItems = "CENTER";
  fab.counterAxisAlignItems = "CENTER";
  fab.effects = [{ type: "DROP_SHADOW", color: { r: 0, g: 0, b: 0, a: 0.2 }, offset: { x: 0, y: 4 }, radius: 8, visible: true }];

  const plus = figma.createFrame();
  plus.name = "Plus";
  plus.resize(24, 24);
  plus.fills = [];
  fab.appendChild(plus);

  const h = figma.createRectangle();
  h.name = "H";
  h.resize(24, 2);
  h.y = 11;
  h.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
  plus.appendChild(h);

  const v = figma.createRectangle();
  v.name = "V";
  v.resize(2, 24);
  v.x = 11;
  v.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
  plus.appendChild(v);

  figma.currentPage.appendChild(fab);
  figma.viewport.scrollAndZoomIntoView([fab]);
  return { id: fab.id, name: fab.name };
})()`
  },

  {
    id: 'android-top-app-bar',
    name: 'Android Top App Bar',
    aliases: ['top app bar', 'app bar', 'toolbar'],
    category: 'android',
    description: 'Material Design 3 top app bar with title and actions',
    type: 'template',
    create: () => `
(async () => {
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });

  const bar = figma.createFrame();
  bar.name = "Top App Bar";
  bar.resize(390, 64);
  bar.fills = [{ type: "SOLID", color: { r: 0.98, g: 0.98, b: 0.98 } }];
  bar.layoutMode = "HORIZONTAL";
  bar.counterAxisAlignItems = "CENTER";
  bar.itemSpacing = 4;
  bar.paddingLeft = 4; bar.paddingRight = 8;

  const navIcon = figma.createFrame();
  navIcon.name = "Nav Icon";
  navIcon.resize(48, 48);
  navIcon.fills = [];
  navIcon.cornerRadius = 24;
  navIcon.layoutMode = "HORIZONTAL";
  navIcon.primaryAxisAlignItems = "CENTER";
  navIcon.counterAxisAlignItems = "CENTER";
  bar.appendChild(navIcon);

  const hamburger = figma.createText();
  hamburger.fontName = { family: "Inter", style: "Regular" };
  hamburger.characters = "☰";
  hamburger.fontSize = 20;
  hamburger.fills = [{ type: "SOLID", color: { r: 0.1, g: 0.1, b: 0.1 } }];
  navIcon.appendChild(hamburger);

  const title = figma.createText();
  title.fontName = { family: "Inter", style: "Medium" };
  title.characters = "Title";
  title.fontSize = 22;
  title.fills = [{ type: "SOLID", color: { r: 0.1, g: 0.1, b: 0.1 } }];
  title.layoutGrow = 1;
  bar.appendChild(title);

  const action = figma.createFrame();
  action.name = "Action";
  action.resize(48, 48);
  action.fills = [];
  action.cornerRadius = 24;
  action.layoutMode = "HORIZONTAL";
  action.primaryAxisAlignItems = "CENTER";
  action.counterAxisAlignItems = "CENTER";
  bar.appendChild(action);

  const dots = figma.createText();
  dots.fontName = { family: "Inter", style: "Regular" };
  dots.characters = "⋮";
  dots.fontSize = 20;
  dots.fills = [{ type: "SOLID", color: { r: 0.1, g: 0.1, b: 0.1 } }];
  action.appendChild(dots);

  figma.currentPage.appendChild(bar);
  figma.viewport.scrollAndZoomIntoView([bar]);
  return { id: bar.id, name: bar.name };
})()`
  },

];

export const DROPS = [...BUILT_IN, ...loadSavedDrops()];

export function listDrops(category) {
  const filtered = category
    ? DROPS.filter(d => d.category === category)
    : DROPS;
  return filtered.map(d => ({
    id: d.id,
    name: d.name,
    category: d.category,
    description: d.description,
    type: d.type,
  }));
}

export function findDrop(query) {
  const q = query.toLowerCase().trim();
  const qHyphen = q.replace(/\s+/g, '-');
  const qSpace = q.replace(/-/g, ' ');

  return DROPS.find(d =>
    d.id === q || d.id === qHyphen ||
    d.name.toLowerCase() === q || d.name.toLowerCase() === qSpace ||
    d.aliases?.some(a => a.toLowerCase() === q || a.toLowerCase() === qSpace || a.toLowerCase() === qHyphen)
  ) || DROPS.find(d =>
    d.id.includes(q) || d.id.includes(qHyphen) ||
    d.name.toLowerCase().includes(qSpace) ||
    d.aliases?.some(a => a.includes(q) || a.includes(qSpace) || a.includes(qHyphen))
  );
}

export function getDropCategories() {
  return [...new Set(DROPS.map(d => d.category))];
}
