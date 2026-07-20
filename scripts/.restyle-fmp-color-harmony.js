(async () => {
  const FRAME_ID = '6339:2516';
  const root = await figma.getNodeByIdAsync(FRAME_ID);
  if (!root || root.type !== 'FRAME') return { error: 'Launcher frame not found' };

  const GAP = 408;
  const launchers = figma.currentPage.findAll(
    (n) => n.type === 'FRAME' && (n.name.startsWith('Launcher —') || n.id === FRAME_ID)
  );
  const maxX = Math.max(...launchers.map((f) => f.x + f.width));
  const maxY = Math.max(...launchers.map((f) => f.y + f.height));
  let startX = root.x;
  let startY = maxY + 80;

  // If a harmony row already exists, replace it
  const harmonyPrefix = 'Launcher — Harmony';
  for (const old of figma.currentPage.findAll((n) => n.type === 'FRAME' && n.name.startsWith(harmonyPrefix))) {
    old.remove();
  }

  const themes = [
    {
      name: 'Harmony · Complementary',
      harmony: 'Complementary — soft mint × peach',
      bg: [
        { p: 0, c: '#D8EDE8' },
        { p: 0.4, c: '#E4F2EE' },
        { p: 0.65, c: '#F5E8E0' },
        { p: 1, c: '#F3DDD4' },
      ],
      bokeh: [
        { x: -20, y: 90, s: 160, c: '#B8D9CF', blur: 58 },
        { x: 240, y: 40, s: 140, c: '#E8C9B8', blur: 52 },
        { x: 70, y: 520, s: 175, c: '#C5DDD6', blur: 68 },
        { x: 260, y: 580, s: 120, c: '#E8D0C4', blur: 48 },
      ],
      glass: '#FFFCFA',
      text: '#4A5C56',
      textMuted: '#8A9690',
      cardA: { glass: '#E8F4F0', stroke: '#A8C9BE', toggle: ['#9BB8AD', '#B5CEC4'] },
      cardB: { glass: '#F8EBE4', stroke: '#D4B8A8', toggle: ['#C9A896', '#D9B8A8'] },
      masterToggle: ['#7A8E88', '#8A9E98'],
      value: '#B8907A',
      settingsToggle: ['#A8BEC4', '#B8CED4'],
      nav: '#F5F8F7',
    },
    {
      name: 'Harmony · Analogous',
      harmony: 'Analogous — powder blue → lilac',
      bg: [
        { p: 0, c: '#DCE8F4' },
        { p: 0.35, c: '#E4E4F4' },
        { p: 0.7, c: '#EAE4F0' },
        { p: 1, c: '#F0E4EC' },
      ],
      bokeh: [
        { x: -25, y: 100, s: 165, c: '#C8D8EC', blur: 58 },
        { x: 230, y: 35, s: 130, c: '#D4C8E4', blur: 50 },
        { x: 85, y: 510, s: 180, c: '#CCD4EC', blur: 64 },
        { x: 255, y: 600, s: 115, c: '#E0C8DC', blur: 46 },
      ],
      glass: '#FCFAFF',
      text: '#5A5668',
      textMuted: '#9490A0',
      cardA: { glass: '#E8EEF8', stroke: '#B8C8DC', toggle: ['#A8B8D0', '#B8C8DC'] },
      cardB: { glass: '#EEE8F4', stroke: '#C8B8D4', toggle: ['#B8A8C8', '#C8B8D4'] },
      masterToggle: ['#7888A0', '#8898A8'],
      value: '#A898B8',
      settingsToggle: ['#B0A8C8', '#C0B8D4'],
      nav: '#F4F2F8',
    },
    {
      name: 'Harmony · Split Complementary',
      harmony: 'Split — lavender + butter + blush',
      bg: [
        { p: 0, c: '#E4E0F0' },
        { p: 0.35, c: '#EAE6F2' },
        { p: 0.58, c: '#F2EDE0' },
        { p: 0.82, c: '#F0E4E8' },
        { p: 1, c: '#EDE4EC' },
      ],
      bokeh: [
        { x: -30, y: 95, s: 170, c: '#D0C8E4', blur: 58 },
        { x: 235, y: 45, s: 125, c: '#E8E0C4', blur: 50 },
        { x: 75, y: 525, s: 185, c: '#E8D0D8', blur: 66 },
        { x: 265, y: 590, s: 110, c: '#D8D0E8', blur: 44 },
      ],
      glass: '#FDFCFA',
      text: '#5C5868',
      textMuted: '#9490A0',
      cardA: { glass: '#EAE6F4', stroke: '#C0B8D8', toggle: ['#B0A8C8', '#C0B8D8'] },
      cardB: { glass: '#F4F0E4', stroke: '#D8D0B0', toggle: ['#C8C0A0', '#D8D0B0'] },
      masterToggle: ['#8880A0', '#9890A8'],
      value: '#C0A0A8',
      settingsToggle: ['#D0B8C0', '#E0C8D0'],
      nav: '#F6F4FA',
    },
    {
      name: 'Harmony · Triadic',
      harmony: 'Triadic — sky · rose · cream',
      bg: [
        { p: 0, c: '#DCE8F2' },
        { p: 0.3, c: '#E8E4F0' },
        { p: 0.55, c: '#F0E4EC' },
        { p: 0.8, c: '#F2EDE4' },
        { p: 1, c: '#EAE8F0' },
      ],
      bokeh: [
        { x: -22, y: 105, s: 162, c: '#C8D8EC', blur: 56 },
        { x: 228, y: 38, s: 132, c: '#E8D0DC', blur: 48 },
        { x: 88, y: 515, s: 178, c: '#E8E0C8', blur: 62 },
        { x: 252, y: 605, s: 118, c: '#D8D0E8', blur: 42 },
      ],
      glass: '#FEFCFA',
      text: '#585860',
      textMuted: '#909098',
      cardA: { glass: '#E4ECF4', stroke: '#B8C8D8', toggle: ['#A8B8C8', '#B8C8D8'] },
      cardB: { glass: '#F0E4EC', stroke: '#D8C0CC', toggle: ['#C8B0BC', '#D8C0CC'] },
      masterToggle: ['#8890A0', '#98A0A8'],
      value: '#B8A090',
      settingsToggle: ['#D0C8B0', '#E0D8C0'],
      nav: '#F6F4F0',
    },
    {
      name: 'Harmony · Tetradic',
      harmony: 'Tetradic — mist blue · sand · lilac · sage',
      bg: [
        { p: 0, c: '#DCE4F0' },
        { p: 0.25, c: '#E4E8F0' },
        { p: 0.5, c: '#F0E8E0' },
        { p: 0.75, c: '#E8E4F0' },
        { p: 1, c: '#E4EDE6' },
      ],
      bokeh: [
        { x: -28, y: 92, s: 168, c: '#C8D4E8', blur: 56 },
        { x: 232, y: 42, s: 128, c: '#E8D8C8', blur: 48 },
        { x: 82, y: 518, s: 182, c: '#D8D0E8', blur: 64 },
        { x: 258, y: 598, s: 114, c: '#C8DCC8', blur: 42 },
      ],
      glass: '#FDFCFA',
      text: '#565860',
      textMuted: '#909498',
      cardA: { glass: '#E4ECF2', stroke: '#B8C8D4', toggle: ['#A8B8C4', '#B8C8D4'] },
      cardB: { glass: '#F0E8E0', stroke: '#D4C4B4', toggle: ['#C4B4A4', '#D4C4B4'] },
      masterToggle: ['#889098', '#98A0A8'],
      value: '#A8A0B8',
      settingsToggle: ['#B8C8B0', '#C8D8C0'],
      nav: '#F2F4F0',
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

  function grad(stops) {
    return {
      type: 'GRADIENT_LINEAR',
      gradientTransform: [
        [0.15, 0.95, 0],
        [-0.85, 0.35, 0.55],
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

  function glassCard(node, fillHex, strokeHex, opacity, blur) {
    if (!node) return;
    setFill(node, [solid(fillHex, opacity)]);
    setRadius(node, 28);
    if ('strokes' in node) {
      node.strokes = [solid(strokeHex, 0.28)];
      node.strokeWeight = 1;
      node.strokeAlign = 'INSIDE';
    }
    if ('effects' in node) {
      node.effects = [
        { type: 'BACKGROUND_BLUR', radius: blur, visible: true },
        {
          type: 'DROP_SHADOW',
          color: hex(strokeHex, 0.08),
          offset: { x: 0, y: 8 },
          radius: 24,
          spread: 0,
          visible: true,
          blendMode: 'NORMAL',
        },
      ];
    }
  }

  function styleToggle(group, colors) {
    if (!group) return;
    for (const r of group.findAll((n) => n.type === 'RECTANGLE')) {
      if (r.width >= 40) {
        setFill(r, grad([
          { p: 0, c: colors[0] },
          { p: 1, c: colors[1] },
        ]));
        setRadius(r, 40);
      } else {
        setFill(r, solid('#FFFFFF', 0.95));
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
      setFill(e, [solid(b.c, 0.28)]);
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
    if (adBox) glassCard(adBox, theme.glass, theme.cardA.stroke, 0.5, 20);

    const adText = clone.findOne((n) => n.characters === 'AD\n320 x 50 px');
    if (adText) setFill(adText, solid(theme.textMuted, 0.9));

    const featureOn = clone.findOne((n) => n.name === 'Feature on');
    if (featureOn) {
      glassCard(featureOn, theme.glass, theme.cardA.stroke, 0.55, 30);
      const featText = featureOn.findOne((n) => n.type === 'TEXT');
      if (featText) {
        setFill(featText, solid(theme.text));
        featText.fontName = { family: 'Inter', style: 'Medium' };
      }
      const bigToggle = featureOn.findOne((n) => n.name === 'toggle');
      if (bigToggle) {
        setFill(bigToggle, grad([
          { p: 0, c: theme.masterToggle[0] },
          { p: 1, c: theme.masterToggle[1] },
        ]));
        setRadius(bigToggle, 60);
        const onLabel = bigToggle.findOne((n) => n.type === 'TEXT' && n.characters === 'ON');
        if (onLabel) setFill(onLabel, solid('#FFFFFF'));
      }
    }

    const clapCard = clone.findOne((n) => n.name === '4');
    if (clapCard) {
      glassCard(clapCard, theme.cardA.glass, theme.cardA.stroke, 0.82, 22);
      styleToggle(clapCard.findOne((n) => n.name === 'Group 1327225627'), theme.cardA.toggle);
    }

    const whistleCard = clone.findOne((n) => n.name === '5');
    if (whistleCard) {
      glassCard(whistleCard, theme.cardB.glass, theme.cardB.stroke, 0.82, 22);
      styleToggle(whistleCard.findOne((n) => n.name === 'Group 1327225627'), theme.cardB.toggle);
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
    const rowStrokes = [theme.cardA.stroke, theme.cardB.stroke, theme.value, theme.cardA.stroke, theme.cardB.stroke];
    settingRows.forEach((row, i) => {
      const stroke = rowStrokes[i % rowStrokes.length];
      glassCard(row, theme.glass, stroke, 0.65, 20);
      for (const t of row.findAll((n) => n.type === 'TEXT')) {
        if (labels.includes(t.characters)) {
          setFill(t, solid(theme.text));
          t.fontName = { family: 'Inter', style: 'Medium' };
        }
        if (t.characters === 'Bell' || t.characters === '10 sec') {
          setFill(t, solid(theme.value));
        }
      }
      const toggleGrp = row.findOne((n) => n.name === 'Group 1327225627');
      if (toggleGrp) styleToggle(toggleGrp, theme.settingsToggle);
      const chev = row.findOne((n) => n.name.startsWith('chevron'));
      if (chev) {
        const v = chev.findOne((n) => n.type === 'VECTOR');
        if (v) setFill(v, solid(stroke, 0.8));
      }
    });

    const time = clone.findOne((n) => n.characters === '12:30');
    if (time) setFill(time, solid(theme.text));
    const statusBg = clone.findOne((n) => n.name === 'status bar bg');
    if (statusBg) statusBg.fills = [];

    const navBg = clone.findOne((n) => n.name === 'Rectangle 40032');
    if (navBg) setFill(navBg, solid(theme.nav, 0.94));

    // Harmony label chip at top of screen
    const chip = figma.createFrame();
    chip.name = 'Harmony label';
    chip.layoutMode = 'HORIZONTAL';
    chip.primaryAxisSizingMode = 'AUTO';
    chip.counterAxisSizingMode = 'AUTO';
    chip.paddingLeft = chip.paddingRight = 12;
    chip.paddingTop = chip.paddingBottom = 6;
    chip.cornerRadius = 20;
    chip.x = 20;
    chip.y = 78;
    glassCard(chip, theme.glass, theme.cardB.stroke, 0.7, 12);
    const chipText = figma.createText();
    chipText.characters = theme.harmony;
    chipText.fontSize = 11;
    chipText.fontName = { family: 'Inter', style: 'Medium' };
    setFill(chipText, solid(theme.text));
    chip.appendChild(chipText);
    clone.appendChild(chip);
  }

  await figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });

  const created = [];
  let x = startX;
  for (const theme of themes) {
    const clone = root.clone();
    clone.name = 'Launcher — ' + theme.name;
    clone.x = x;
    clone.y = startY;
    applyTheme(clone, theme);
    created.push({ id: clone.id, name: clone.name });
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

  return { rowY: startY, created };
})();
