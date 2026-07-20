(async () => {
  const SOURCE_SHEET = '7706:19392';
  const REF_SCREEN = '6622:27029';
  const TOPICS = ['Business', 'Entertainment', 'General', 'Health', 'Science', 'Sports', 'Technology'];
  const SOURCES = [
    'ABC News',
    'Al Jazeera',
    'Associated Press',
    'Axios News',
    'AFP (Agence France-Presse)',
    'BBC News',
    'Bloomberg',
  ];

  const C = {
    bg: { r: 0.961, g: 0.961, b: 0.961 },
    surface: { r: 1, g: 1, b: 1 },
    text: { r: 0.071, g: 0.075, b: 0.098 },
    muted: { r: 0.4, g: 0.4, b: 0.4 },
    accent: { r: 0.769, g: 0.153, b: 0.125 },
    chip: { r: 0.918, g: 0.918, b: 0.918 },
    handle: { r: 0.753, g: 0.753, b: 0.761 },
    tabActive: { r: 0.769, g: 0.153, b: 0.125 },
    tabIdle: { r: 0.94, g: 0.94, b: 0.94 },
    border: { r: 0.878, g: 0.878, b: 0.878 },
  };

  const fonts = [
    { family: 'Roboto', style: 'Regular' },
    { family: 'Roboto', style: 'Medium' },
    { family: 'Roboto', style: 'Bold' },
  ];
  for (const f of fonts) {
    try {
      await figma.loadFontAsync(f);
    } catch {
      await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
      await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
      await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
    }
  }

  const font = (style) => {
    try {
      return { family: 'Roboto', style };
    } catch {
      return { family: 'Inter', style: style === 'Bold' ? 'Bold' : style === 'Medium' ? 'Medium' : 'Regular' };
    }
  };

  function solid(c, a = 1) {
    const f = { type: 'SOLID', color: { r: c.r, g: c.g, b: c.b } };
    if (a < 1) f.opacity = a;
    return [f];
  }

  function text(parent, chars, size, style, color, opts = {}) {
    const t = figma.createText();
    t.fontName = font(style);
    t.characters = chars;
    t.fontSize = size;
    t.fills = solid(color);
    parent.appendChild(t);
    if (opts.fill) {
      t.layoutSizingHorizontal = 'FILL';
      if (opts.grow) t.layoutGrow = opts.grow;
    }
    return t;
  }

  const source = await figma.getNodeByIdAsync(SOURCE_SHEET);
  if (!source) return { error: 'Source filter sheet not found' };

  const screen = figma.createFrame();
  screen.name = 'filter screen — v2';
  screen.resize(360, 780);
  screen.x = source.x + source.width + 64;
  screen.y = source.y - 175;
  screen.fills = solid(C.bg);
  screen.clipsContent = true;
  figma.currentPage.appendChild(screen);

  const ref = await figma.getNodeByIdAsync(REF_SCREEN);
  if (ref) {
    const bg = ref.clone();
    bg.name = 'feed (dimmed)';
    bg.x = 0;
    bg.y = 0;
    screen.appendChild(bg);
    const scrim = figma.createRectangle();
    scrim.name = 'scrim';
    scrim.resize(360, 780);
    scrim.fills = solid({ r: 0, g: 0, b: 0 }, 0.35);
    screen.appendChild(scrim);
  }

  const sheet = figma.createFrame();
  sheet.name = 'filter bottom sheet — v2';
  sheet.resize(360, 598);
  sheet.x = 0;
  sheet.y = 182;
  sheet.fills = solid(C.surface);
  sheet.cornerRadius = 20;
  sheet.layoutMode = 'VERTICAL';
  sheet.primaryAxisSizingMode = 'FIXED';
  sheet.counterAxisSizingMode = 'FIXED';
  sheet.itemSpacing = 0;
  sheet.clipsContent = true;
  screen.appendChild(sheet);

  const handleBar = figma.createFrame();
  handleBar.name = 'bar';
  handleBar.layoutMode = 'VERTICAL';
  handleBar.counterAxisAlignItems = 'CENTER';
  handleBar.resize(360, 28);
  handleBar.fills = [];
  handleBar.paddingTop = 12;
  sheet.appendChild(handleBar);
  handleBar.layoutSizingHorizontal = 'FILL';

  const handle = figma.createRectangle();
  handle.resize(34, 4);
  handle.cornerRadius = 99;
  handle.fills = solid(C.handle);
  handleBar.appendChild(handle);

  const header = figma.createFrame();
  header.name = 'header';
  header.layoutMode = 'VERTICAL';
  header.itemSpacing = 8;
  header.paddingLeft = header.paddingRight = 16;
  header.paddingTop = 4;
  header.paddingBottom = 12;
  header.fills = [];
  header.layoutSizingHorizontal = 'FILL';
  sheet.appendChild(header);

  const titleRow = figma.createFrame();
  titleRow.layoutMode = 'HORIZONTAL';
  titleRow.primaryAxisAlignItems = 'SPACE_BETWEEN';
  titleRow.counterAxisAlignItems = 'CENTER';
  titleRow.fills = [];
  titleRow.layoutSizingHorizontal = 'FILL';
  header.appendChild(titleRow);

  const titleCol = figma.createFrame();
  titleCol.layoutMode = 'VERTICAL';
  titleCol.itemSpacing = 4;
  titleCol.fills = [];
  titleCol.layoutGrow = 1;
  titleRow.appendChild(titleCol);

  text(titleCol, 'Filter Your Feed', 18, 'Bold', C.text);
  text(titleCol, 'Choose your news topics and sources.', 13, 'Regular', C.muted, { fill: true });

  const loc = figma.createFrame();
  loc.name = 'location';
  loc.layoutMode = 'HORIZONTAL';
  loc.itemSpacing = 4;
  loc.paddingLeft = loc.paddingRight = 8;
  loc.paddingTop = loc.paddingBottom = 4;
  loc.cornerRadius = 99;
  loc.fills = solid(C.chip);
  titleRow.appendChild(loc);
  text(loc, 'Austin', 12, 'Medium', C.muted);

  const tabs = figma.createFrame();
  tabs.name = 'tabs';
  tabs.layoutMode = 'HORIZONTAL';
  tabs.itemSpacing = 8;
  tabs.paddingLeft = tabs.paddingRight = 16;
  tabs.fills = [];
  tabs.layoutSizingHorizontal = 'FILL';
  header.appendChild(tabs);

  function tab(label, active) {
    const t = figma.createFrame();
    t.layoutMode = 'HORIZONTAL';
    t.primaryAxisAlignItems = 'CENTER';
    t.counterAxisAlignItems = 'CENTER';
    t.paddingLeft = t.paddingRight = 16;
    t.paddingTop = t.paddingBottom = 10;
    t.cornerRadius = 99;
    t.fills = solid(active ? C.tabActive : C.tabIdle);
    t.layoutGrow = 1;
    tabs.appendChild(t);
    text(t, label, 14, 'Medium', active ? C.surface : C.text);
    return t;
  }

  tab('Topics', false);
  tab('Sources', true);

  const searchWrap = figma.createFrame();
  searchWrap.name = 'search';
  searchWrap.layoutMode = 'HORIZONTAL';
  searchWrap.itemSpacing = 8;
  searchWrap.paddingLeft = searchWrap.paddingRight = 16;
  searchWrap.paddingBottom = 12;
  searchWrap.fills = [];
  searchWrap.layoutSizingHorizontal = 'FILL';
  sheet.appendChild(searchWrap);

  const searchBox = figma.createFrame();
  searchBox.layoutMode = 'HORIZONTAL';
  searchBox.itemSpacing = 8;
  searchBox.paddingLeft = 14;
  searchBox.paddingRight = 14;
  searchBox.paddingTop = searchBox.paddingBottom = 12;
  searchBox.cornerRadius = 12;
  searchBox.fills = solid(C.bg);
  searchBox.strokes = solid(C.border);
  searchBox.strokeWeight = 1;
  searchBox.layoutSizingHorizontal = 'FILL';
  searchBox.layoutGrow = 1;
  searchWrap.appendChild(searchBox);
  text(searchBox, 'Search sources…', 14, 'Regular', C.muted);

  const body = figma.createFrame();
  body.name = 'list';
  body.layoutMode = 'VERTICAL';
  body.itemSpacing = 0;
  body.paddingLeft = body.paddingRight = 16;
  body.fills = [];
  body.layoutSizingHorizontal = 'FILL';
  body.layoutGrow = 1;
  body.primaryAxisSizingMode = 'FIXED';
  body.resize(360, 360);
  sheet.appendChild(body);

  const topicComp = await figma.getNodeByIdAsync('6551:28651');
  const sourceComp = await figma.getNodeByIdAsync('6551:28666');
  const sourceIdle = await figma.getNodeByIdAsync('6551:28659');

  for (let i = 0; i < SOURCES.length; i++) {
    const label = SOURCES[i];
    const selected = i < 3;
    const comp = selected ? sourceComp : sourceIdle;
    if (comp && comp.type === 'COMPONENT') {
      const row = comp.createInstance();
      row.name = 'source-filter';
      body.appendChild(row);
      row.layoutSizingHorizontal = 'FILL';
      try {
        row.setProperties({ 'Text#6282:0': label, state: selected ? 'selected' : 'idle' });
      } catch {
        try {
          row.setProperties({ state: selected ? 'selected' : 'idle' });
        } catch {}
        const txt = row.findOne((n) => n.type === 'TEXT');
        if (txt) {
          await figma.loadFontAsync(txt.fontName);
          txt.characters = label;
        }
      }
    } else {
      const row = figma.createFrame();
      row.layoutMode = 'HORIZONTAL';
      row.paddingTop = row.paddingBottom = 14;
      row.fills = [];
      row.layoutSizingHorizontal = 'FILL';
      body.appendChild(row);
      text(row, label, 15, 'Regular', C.text, { fill: true, grow: 1 });
    }
    if (i < SOURCES.length - 1) {
      const divWrap = figma.createFrame();
      divWrap.fills = [];
      divWrap.layoutMode = 'VERTICAL';
      divWrap.layoutSizingHorizontal = 'FILL';
      body.appendChild(divWrap);
      const div = figma.createRectangle();
      div.resize(328, 1);
      div.fills = solid(C.border);
      divWrap.appendChild(div);
    }
  }

  const actions = figma.createFrame();
  actions.name = 'action';
  actions.layoutMode = 'HORIZONTAL';
  actions.itemSpacing = 12;
  actions.paddingLeft = actions.paddingRight = 16;
  actions.paddingTop = actions.paddingBottom = 16;
  actions.fills = solid(C.surface);
  actions.strokes = solid(C.border);
  actions.strokeWeight = 1;
  actions.strokeAlign = 'INSIDE';
  actions.layoutSizingHorizontal = 'FILL';
  sheet.appendChild(actions);

  const clearBtn = figma.createFrame();
  clearBtn.layoutMode = 'HORIZONTAL';
  clearBtn.primaryAxisAlignItems = 'CENTER';
  clearBtn.counterAxisAlignItems = 'CENTER';
  clearBtn.paddingTop = clearBtn.paddingBottom = 12;
  clearBtn.layoutGrow = 1;
  clearBtn.fills = [];
  actions.appendChild(clearBtn);
  text(clearBtn, 'Clear all', 15, 'Medium', C.text);

  const applyBtn = figma.createFrame();
  applyBtn.layoutMode = 'HORIZONTAL';
  applyBtn.primaryAxisAlignItems = 'CENTER';
  applyBtn.counterAxisAlignItems = 'CENTER';
  applyBtn.paddingTop = applyBtn.paddingBottom = 12;
  applyBtn.cornerRadius = 12;
  applyBtn.fills = solid(C.accent);
  applyBtn.layoutGrow = 2;
  actions.appendChild(applyBtn);
  text(applyBtn, 'Apply filters', 15, 'Medium', C.surface);

  figma.currentPage.selection = [screen];
  figma.viewport.scrollAndZoomIntoView([screen]);

  return {
    ok: true,
    id: screen.id,
    name: screen.name,
    x: screen.x,
    y: screen.y,
    note: 'Sources tab active; Topics tab styled idle. Uses source-filter components where available.',
  };
})();
