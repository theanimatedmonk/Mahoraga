(async () => {
  const FRAME_ID = '6339:2516';
  const root = await figma.getNodeByIdAsync(FRAME_ID);
  if (!root || root.type !== 'FRAME') return { error: 'Launcher frame not found' };

  const clone = root.clone();
  clone.name = 'Launcher — Prakthis';
  clone.x = root.x + 400;
  clone.y = root.y;

  function hex(h, a = 1) {
    const x = h.replace('#', '');
    return {
      r: parseInt(x.slice(0, 2), 16) / 255,
      g: parseInt(x.slice(2, 4), 16) / 255,
      b: parseInt(x.slice(4, 6), 16) / 255,
      a,
    };
  }

  function grad(stops, vertical = true) {
    return {
      type: 'GRADIENT_LINEAR',
      gradientTransform: vertical
        ? [
            [0, 1, 0],
            [-1, 0, 1],
          ]
        : [
            [1, 0, 0],
            [0, 1, 0],
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

  function softShadow(node) {
    if (!node || !('effects' in node)) return;
    node.effects = [
      {
        type: 'DROP_SHADOW',
        color: hex('#4C1D95', 0.14),
        offset: { x: 0, y: 8 },
        radius: 24,
        spread: 0,
        visible: true,
        blendMode: 'NORMAL',
      },
    ];
  }

  function glassCard(node, tint) {
    if (!node) return;
    setFill(node, [solid('#FFFFFF', 0.72)]);
    setRadius(node, 24);
    if ('effects' in node) {
      node.effects = [
        {
          type: 'BACKGROUND_BLUR',
          radius: 16,
          visible: true,
        },
        {
          type: 'DROP_SHADOW',
          color: hex('#312E81', 0.1),
          offset: { x: 0, y: 6 },
          radius: 20,
          spread: 0,
          visible: true,
          blendMode: 'NORMAL',
        },
      ];
    }
    if (tint) setFill(node, [grad(tint)]);
  }

  function styleSmallToggle(group) {
    if (!group) return;
    const rects = group.findAll((n) => n.type === 'RECTANGLE');
    for (const r of rects) {
      const w = r.width;
      if (w >= 40) {
        setFill(r, grad([
          { p: 0, c: '#A78BFA' },
          { p: 1, c: '#7C3AED' },
        ]));
        setRadius(r, 40);
      } else {
        setFill(r, solid('#FFFFFF'));
        setRadius(r, 40);
      }
    }
  }

  function walk(n, fn) {
    fn(n);
    if ('children' in n) n.children.forEach((c) => walk(c, fn));
  }

  // Root screen background — Prakthis purple gradient
  setFill(clone, [
    grad([
      { p: 0, c: '#4F46E5' },
      { p: 0.45, c: '#7C3AED' },
      { p: 1, c: '#F8FAFC' },
    ]),
  ]);

  const top = clone.findOne((n) => n.name === 'Frame 2');
  if (top) setFill(top, []);

  const title = clone.findOne((n) => n.name === 'Find My Phone Launcher' && n.type === 'TEXT');
  if (title) {
    setFill(title, solid('#FFFFFF'));
    title.fontName = { family: 'Inter', style: 'Semi Bold' };
    title.fontSize = 20;
  }

  const menuVec = clone.findOne((n) => n.parent && n.parent.name.startsWith('menu_'));
  if (menuVec && 'fills' in menuVec) setFill(menuVec, solid('#FFFFFF'));

  const adBox = clone.findOne((n) => n.name === 'Rectangle 4142');
  if (adBox) {
    glassCard(adBox);
    setFill(adBox, [solid('#FFFFFF', 0.35)]);
    setRadius(adBox, 16);
  }
  const adText = clone.findOne((n) => n.characters === 'AD\n320 x 50 px');
  if (adText) setFill(adText, solid('#FFFFFF', 0.85));

  const featureOn = clone.findOne((n) => n.name === 'Feature on');
  if (featureOn) {
    glassCard(featureOn);
    setFill(featureOn, [
      grad([
        { p: 0, c: '#FFFFFF', a: 0.55 },
        { p: 1, c: '#EDE9FE', a: 0.75 },
      ]),
    ]);
    setRadius(featureOn, 24);
    const featText = featureOn.findOne((n) => n.type === 'TEXT');
    if (featText) {
      setFill(featText, solid('#1E1B4B'));
      if (featText.characters.includes('ON')) {
        const parts = featText.characters.split('ON');
        // keep text; bold ON via segments if mixed - skip for simplicity
      }
    }
    const bigToggle = featureOn.findOne((n) => n.name === 'toggle');
    if (bigToggle) {
      setFill(bigToggle, grad([
        { p: 0, c: '#8B5CF6' },
        { p: 1, c: '#6D28D9' },
      ]));
      setRadius(bigToggle, 60);
    }
  }

  const clapCard = clone.findOne((n) => n.name === '4');
  if (clapCard) {
    glassCard(clapCard, [
      { p: 0, c: '#FBCFE8' },
      { p: 1, c: '#FDE68A' },
    ]);
    styleSmallToggle(clapCard.findOne((n) => n.name === 'Group 1327225627'));
  }

  const whistleCard = clone.findOne((n) => n.name === '5');
  if (whistleCard) {
    glassCard(whistleCard, [
      { p: 0, c: '#DDD6FE' },
      { p: 1, c: '#BAE6FD' },
    ]);
    styleSmallToggle(whistleCard.findOne((n) => n.name === 'Group 1327225627'));
  }

  const settings = clone.findOne((n) => n.name === 'settings');
  if (settings && settings.type === 'FRAME') {
    settings.itemSpacing = 10;
    // White content sheet behind settings list
    const sheet = figma.createFrame();
    sheet.name = 'Content sheet';
    sheet.resize(360, 400);
    sheet.x = 0;
    sheet.y = 430;
    sheet.fills = [solid('#FFFFFF')];
    sheet.cornerRadius = 32;
    sheet.topLeftRadius = 32;
    sheet.topRightRadius = 32;
    sheet.bottomLeftRadius = 0;
    sheet.bottomRightRadius = 0;
    clone.insertChild(1, sheet);
  }

  const settingRows = clone.findAll(
    (n) =>
      n.type === 'FRAME' &&
      n.name.startsWith('Frame 13272259') &&
      n.parent && n.parent.name === 'settings'
  );
  for (const row of settingRows) {
    setFill(row, solid('#FFFFFF'));
    setRadius(row, 20);
    softShadow(row);
    row.effects = [
      {
        type: 'DROP_SHADOW',
        color: hex('#6366F1', 0.08),
        offset: { x: 0, y: 4 },
        radius: 16,
        spread: 0,
        visible: true,
        blendMode: 'NORMAL',
      },
    ];
    const label = row.findOne((n) => n.type === 'TEXT' && !['Bell', '10 sec'].includes(n.characters));
    if (label && ['Alert Sound', 'Alert Duration', 'Flashlight', 'Vibration', 'Sound'].includes(label.characters)) {
      setFill(label, solid('#1E1B4B'));
      label.fontName = { family: 'Inter', style: 'Medium' };
    }
    const value = row.findOne((n) => n.type === 'TEXT' && (n.characters === 'Bell' || n.characters === '10 sec'));
    if (value) setFill(value, solid('#8B5CF6'));
    const toggleGrp = row.findOne((n) => n.name === 'Group 1327225627');
    if (toggleGrp) styleSmallToggle(toggleGrp);
    const chev = row.findOne((n) => n.name.startsWith('chevron'));
    if (chev) {
      const v = chev.findOne((n) => n.type === 'VECTOR');
      if (v) setFill(v, solid('#A78BFA'));
    }
  }

  const navBg = clone.findOne((n) => n.name === 'Rectangle 40032');
  if (navBg) setFill(navBg, solid('#FFFFFF'));

  figma.currentPage.selection = [clone];
  figma.viewport.scrollAndZoomIntoView([clone]);

  return { id: clone.id, name: clone.name, x: clone.x, y: clone.y };
})();
