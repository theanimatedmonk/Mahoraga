(async () => {
  const FRAME_ID = '6339:2516';
  const root = await figma.getNodeByIdAsync(FRAME_ID);
  if (!root || root.type !== 'FRAME') return { error: 'Launcher frame not found' };

  const GAP = 408;
  let startX = root.x + 820;
  const existing = figma.currentPage.findAll(
    (n) => n.type === 'FRAME' && n.name.startsWith('Launcher —')
  );
  if (existing.length) {
    startX = Math.max(...existing.map((f) => f.x + f.width)) + 48;
  }

  const themes = [
    {
      name: 'Ocean Glass',
      bg: [
        { p: 0, c: '#B8D4E8' },
        { p: 0.4, c: '#A8C8DC' },
        { p: 0.7, c: '#8BB8D0' },
        { p: 1, c: '#D4E4EE' },
      ],
      bokeh: [
        { x: -30, y: 100, s: 170, c: '#5BA4C9', blur: 55 },
        { x: 230, y: 30, s: 130, c: '#7EC8E3', blur: 48 },
        { x: 60, y: 510, s: 190, c: '#4A8FB5', blur: 65 },
        { x: 250, y: 580, s: 110, c: '#9DD4E8', blur: 42 },
      ],
      glass: '#F5FAFC',
      text: '#1A2E38',
      textMuted: '#5A7A8A',
      accent: '#3D8BA8',
      accent2: '#5BA4C9',
      toggleDark: ['#2A4A58', '#3D6270'],
      nav: '#E8F2F6',
    },
    {
      name: 'Forest Glass',
      bg: [
        { p: 0, c: '#C5D9C8' },
        { p: 0.35, c: '#B8CFBA' },
        { p: 0.65, c: '#9BB8A0' },
        { p: 1, c: '#E2EBE3' },
      ],
      bokeh: [
        { x: -20, y: 110, s: 160, c: '#6B9B72', blur: 52 },
        { x: 220, y: 50, s: 140, c: '#8FB896', blur: 46 },
        { x: 90, y: 500, s: 180, c: '#5A8A62', blur: 62 },
        { x: 270, y: 620, s: 100, c: '#A8C9AE', blur: 40 },
      ],
      glass: '#F7FBF7',
      text: '#1E2E22',
      textMuted: '#5A735E',
      accent: '#4A7A54',
      accent2: '#6B9B72',
      toggleDark: ['#2E4032', '#3D5244'],
      nav: '#E8F0E9',
    },
    {
      name: 'Rose Blush',
      bg: [
        { p: 0, c: '#F0C8D0' },
        { p: 0.35, c: '#E8D0D8' },
        { p: 0.65, c: '#D4B8C4' },
        { p: 1, c: '#F5E8EC' },
      ],
      bokeh: [
        { x: -35, y: 90, s: 175, c: '#E8A0B0', blur: 58 },
        { x: 240, y: 40, s: 125, c: '#F0B8C8', blur: 45 },
        { x: 70, y: 530, s: 195, c: '#D4889C', blur: 68 },
        { x: 255, y: 590, s: 115, c: '#E8C0CC', blur: 44 },
      ],
      glass: '#FFFAFB',
      text: '#3A282E',
      textMuted: '#8A6A72',
      accent: '#C4687A',
      accent2: '#E090A0',
      toggleDark: ['#4A3038', '#5C4048'],
      nav: '#F8F0F2',
    },
    {
      name: 'Lavender Mist',
      bg: [
        { p: 0, c: '#D4C8E8' },
        { p: 0.4, c: '#C8BCE0' },
        { p: 0.7, c: '#B0A8D4' },
        { p: 1, c: '#EAE4F2' },
      ],
      bokeh: [
        { x: -25, y: 105, s: 165, c: '#9B88C8', blur: 54 },
        { x: 225, y: 35, s: 135, c: '#B8A8E0', blur: 47 },
        { x: 85, y: 515, s: 185, c: '#8878B8', blur: 64 },
        { x: 265, y: 605, s: 105, c: '#C8B8E8', blur: 41 },
      ],
      glass: '#FAF8FC',
      text: '#2A2438',
      textMuted: '#6A6280',
      accent: '#7A68A8',
      accent2: '#9B88C8',
      toggleDark: ['#3A3048', '#4A4058'],
      nav: '#F0ECF5',
    },
    {
      name: 'Midnight Glass',
      dark: true,
      bg: [
        { p: 0, c: '#1A2238' },
        { p: 0.45, c: '#252D48' },
        { p: 0.75, c: '#2A3558' },
        { p: 1, c: '#1E2840' },
      ],
      bokeh: [
        { x: -30, y: 100, s: 170, c: '#4A5898', blur: 60 },
        { x: 230, y: 45, s: 130, c: '#5868B0', blur: 50 },
        { x: 75, y: 520, s: 190, c: '#384878', blur: 70 },
        { x: 250, y: 600, s: 110, c: '#5060A0', blur: 45 },
      ],
      glass: '#FFFFFF',
      glassOpacity: 0.12,
      text: '#F0F2F8',
      textMuted: '#A8B0C8',
      accent: '#88A8F0',
      accent2: '#6B8AD8',
      toggleDark: ['#E8ECF8', '#C8D0E8'],
      toggleText: '#1A2238',
      nav: '#141C30',
    },
    {
      name: 'Citrus Glow',
      bg: [
        { p: 0, c: '#F5D8A8' },
        { p: 0.35, c: '#F0C898' },
        { p: 0.65, c: '#E8B878' },
        { p: 1, c: '#F8ECD8' },
      ],
      bokeh: [
        { x: -28, y: 95, s: 168, c: '#F0A848', blur: 56 },
        { x: 235, y: 38, s: 128, c: '#F8C868', blur: 46 },
        { x: 80, y: 525, s: 188, c: '#E89838', blur: 66 },
        { x: 258, y: 595, s: 112, c: '#F8D888', blur: 43 },
      ],
      glass: '#FFFCF5',
      text: '#3A3018',
      textMuted: '#8A7848',
      accent: '#D08828',
      accent2: '#E8A848',
      toggleDark: ['#4A3818', '#5C4820'],
      nav: '#F8F0E0',
    },
  ];

  function hex(h, a = 1) {
    const x = h.replace('#', '');
    return {
      r: parseInt(x.slice(0, 2), 16) / 255,
      g: parseInt(x.slice(2, 4), 16) / 255,
      b: parseInt(x.slice(4, 6), 16) / 255,
      a,
    };
  }

  function grad(stops, matrix) {
    return {
      type: 'GRADIENT_LINEAR',
      gradientTransform: matrix || [
        [0.2, 0.98, 0],
        [-0.98, 0.2, 0.5],
      ],
      gradientStops: stops.map((s) => ({
        position: s.p,
        color: hex(s.c, s.a ?? 1),
      })),
    };
  }

  function solid(h, a = 1) {
    return { type: 'SOLID', color: hex(h, a) };
  }

  function setFill(node, paint) {
    if (!node || !('fills' in node)) return;
    node.fills = Array.isArray(paint) ? paint : [paint];
  }

  function setRadius(node, r) {
    if (node && 'cornerRadius' in node) node.cornerRadius = r;
  }

  function applyGlass(node, theme, opts = {}) {
    if (!node) return;
    const opacity = opts.opacity ?? (theme.glassOpacity ?? 0.62);
    setFill(node, [solid(theme.glass, opacity)]);
    setRadius(node, opts.radius ?? 28);
    if ('strokes' in node) {
      node.strokes = [solid('#FFFFFF', theme.dark ? 0.2 : 0.55)];
      node.strokeWeight = 1;
      node.strokeAlign = 'INSIDE';
    }
    if ('effects' in node) {
      node.effects = [
        { type: 'BACKGROUND_BLUR', radius: opts.blur ?? 28, visible: true },
        {
          type: 'DROP_SHADOW',
          color: hex(theme.dark ? '#000000' : '#8B7355', theme.dark ? 0.35 : 0.12),
          offset: { x: 0, y: 10 },
          radius: 28,
          spread: 0,
          visible: true,
          blendMode: 'NORMAL',
        },
      ];
    }
  }

  function styleToggle(group, theme, primary) {
    if (!group) return;
    const on = primary ? theme.accent : theme.accent2;
    const off = theme.toggleDark;
    for (const r of group.findAll((n) => n.type === 'RECTANGLE')) {
      if (r.width >= 40) {
        if (theme.dark && primary) {
          setFill(r, grad([
            { p: 0, c: off[0] },
            { p: 1, c: off[1] },
          ]));
        } else {
          setFill(r, grad([
            { p: 0, c: on },
            { p: 1, c: primary ? theme.accent : theme.accent2 },
          ]));
        }
        setRadius(r, 40);
      } else {
        setFill(r, solid(theme.dark ? '#E8ECF8' : theme.glass));
        setRadius(r, 40);
      }
    }
  }

  function applyTheme(clone, theme) {
    setFill(clone, [grad(theme.bg)]);
    clone.clipsContent = true;

    for (const b of theme.bokeh) {
      const e = figma.createEllipse();
      e.resize(b.s, b.s);
      e.x = b.x;
      e.y = b.y;
      setFill(e, [solid(b.c, theme.dark ? 0.25 : 0.35)]);
      e.effects = [{ type: 'LAYER_BLUR', radius: b.blur, visible: true }];
      e.name = 'Bokeh';
      clone.insertChild(0, e);
    }

    const top = clone.findOne((n) => n.name === 'Frame 2');
    if (top) setFill(top, []);

    const title = clone.findOne((n) => n.name === 'Find My Phone Launcher' && n.type === 'TEXT');
    if (title) {
      setFill(title, solid(theme.text));
      title.fontName = { family: 'Inter', style: 'Semi Bold' };
      title.fontSize = 20;
    }

    const menuVec = clone.findOne((n) => n.parent && n.parent.name.startsWith('menu_') && n.type === 'VECTOR');
    if (menuVec) setFill(menuVec, solid(theme.text));

    const adBox = clone.findOne((n) => n.name === 'Rectangle 4142');
    if (adBox) applyGlass(adBox, theme, { opacity: theme.dark ? 0.15 : 0.45, radius: 20, blur: 20 });

    const adText = clone.findOne((n) => n.characters === 'AD\n320 x 50 px');
    if (adText) setFill(adText, solid(theme.textMuted, 0.85));

    const featureOn = clone.findOne((n) => n.name === 'Feature on');
    if (featureOn) {
      applyGlass(featureOn, theme, { opacity: theme.dark ? 0.18 : 0.58, radius: 28, blur: 32 });
      const featText = featureOn.findOne((n) => n.type === 'TEXT');
      if (featText) {
        setFill(featText, solid(theme.text));
        featText.fontName = { family: 'Inter', style: 'Medium' };
      }
      const bigToggle = featureOn.findOne((n) => n.name === 'toggle');
      if (bigToggle) {
        if (theme.dark) {
          setFill(bigToggle, grad([
            { p: 0, c: '#E8ECF8' },
            { p: 1, c: '#C8D4F0' },
          ]));
        } else {
          setFill(bigToggle, grad([
            { p: 0, c: theme.toggleDark[0] },
            { p: 1, c: theme.toggleDark[1] },
          ]));
        }
        setRadius(bigToggle, 60);
        const onLabel = bigToggle.findOne((n) => n.type === 'TEXT' && n.characters === 'ON');
        if (onLabel) setFill(onLabel, solid(theme.toggleText || '#FFFBF7'));
      }
    }

    const clapCard = clone.findOne((n) => n.name === '4');
    if (clapCard) {
      applyGlass(clapCard, theme, { opacity: theme.dark ? 0.16 : 0.55, radius: 28, blur: 24 });
      styleToggle(clapCard.findOne((n) => n.name === 'Group 1327225627'), theme, true);
    }

    const whistleCard = clone.findOne((n) => n.name === '5');
    if (whistleCard) {
      applyGlass(whistleCard, theme, { opacity: theme.dark ? 0.16 : 0.55, radius: 28, blur: 24 });
      styleToggle(whistleCard.findOne((n) => n.name === 'Group 1327225627'), theme, false);
    }

    const settings = clone.findOne((n) => n.name === 'settings');
    if (settings && settings.type === 'FRAME') settings.itemSpacing = 12;

    const labels = ['Alert Sound', 'Alert Duration', 'Flashlight', 'Vibration', 'Sound'];
    const settingRows = clone.findAll(
      (n) =>
        n.type === 'FRAME' &&
        n.name.startsWith('Frame 13272259') &&
        n.parent &&
        n.parent.name === 'settings'
    );
    for (const row of settingRows) {
      applyGlass(row, theme, { opacity: theme.dark ? 0.2 : 0.68, radius: 24, blur: 22 });
      for (const t of row.findAll((n) => n.type === 'TEXT')) {
        if (labels.includes(t.characters)) {
          setFill(t, solid(theme.text));
          t.fontName = { family: 'Inter', style: 'Medium' };
        }
        if (t.characters === 'Bell' || t.characters === '10 sec') {
          setFill(t, solid(theme.accent));
        }
      }
      const toggleGrp = row.findOne((n) => n.name === 'Group 1327225627');
      if (toggleGrp) styleToggle(toggleGrp, theme, false);
      const chev = row.findOne((n) => n.name.startsWith('chevron'));
      if (chev) {
        const v = chev.findOne((n) => n.type === 'VECTOR');
        if (v) setFill(v, solid(theme.textMuted));
      }
    }

    const time = clone.findOne((n) => n.characters === '12:30');
    if (time) setFill(time, solid(theme.text));
    const statusBg = clone.findOne((n) => n.name === 'status bar bg');
    if (statusBg) statusBg.fills = [];

    const navBg = clone.findOne((n) => n.name === 'Rectangle 40032');
    if (navBg) setFill(navBg, solid(theme.nav, 0.92));

    for (const v of clone.findAll((n) => n.type === 'VECTOR' && n.parent && n.parent.name === 'status bar contents')) {
      setFill(v, solid(theme.text));
    }
  }

  await figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });

  const created = [];
  let x = startX;

  for (const theme of themes) {
    const clone = root.clone();
    clone.name = 'Launcher — ' + theme.name;
    clone.x = x;
    clone.y = root.y;
    applyTheme(clone, theme);
    created.push({ id: clone.id, name: clone.name, x: clone.x });
    x += GAP;
  }

  const nodes = [];
  for (const c of created) {
    const n = await figma.getNodeByIdAsync(c.id);
    if (n) nodes.push(n);
  }
  if (nodes.length) {
    figma.currentPage.selection = nodes;
    figma.viewport.scrollAndZoomIntoView(nodes);
  }

  return { created };
})();
