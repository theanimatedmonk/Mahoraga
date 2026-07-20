(async () => {
  const FRAME_ID = '6339:2516';
  const root = await figma.getNodeByIdAsync(FRAME_ID);
  if (!root || root.type !== 'FRAME') return { error: 'Launcher frame not found' };

  const clone = root.clone();
  clone.name = 'Launcher — Glass Wallet';
  clone.x = root.x + 820;
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

  function grad(stops) {
    return {
      type: 'GRADIENT_LINEAR',
      gradientTransform: [
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

  function glass(node, opts = {}) {
    if (!node) return;
    const opacity = opts.opacity ?? 0.62;
    setFill(node, [solid('#FFFBF7', opacity)]);
    setRadius(node, opts.radius ?? 28);
    if ('strokes' in node) {
      node.strokes = [solid('#FFFFFF', 0.55)];
      node.strokeWeight = 1;
      node.strokeAlign = 'INSIDE';
    }
    if ('effects' in node) {
      node.effects = [
        {
          type: 'BACKGROUND_BLUR',
          radius: opts.blur ?? 28,
          visible: true,
        },
        {
          type: 'DROP_SHADOW',
          color: hex('#8B7355', 0.12),
          offset: { x: 0, y: 10 },
          radius: 28,
          spread: 0,
          visible: true,
          blendMode: 'NORMAL',
        },
      ];
    }
  }

  function bokeh(parent, x, y, size, color, blur) {
    const e = figma.createEllipse();
    e.resize(size, size);
    e.x = x;
    e.y = y;
    setFill(e, [solid(color, 0.35)]);
    e.effects = [{ type: 'LAYER_BLUR', radius: blur, visible: true }];
    e.name = 'Bokeh';
    parent.insertChild(0, e);
    return e;
  }

  function styleSmallToggle(group, onColor) {
    if (!group) return;
    for (const r of group.findAll((n) => n.type === 'RECTANGLE')) {
      if (r.width >= 40) {
        setFill(r, grad([
          { p: 0, c: onColor || '#D4845F' },
          { p: 1, c: '#B8654A' },
        ]));
        setRadius(r, 40);
      } else {
        setFill(r, solid('#FFFBF7'));
        setRadius(r, 40);
      }
    }
  }

  await figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });

  // Warm gradient canvas
  setFill(clone, [
    grad([
      { p: 0, c: '#F2C9B8' },
      { p: 0.35, c: '#E8D4C8' },
      { p: 0.65, c: '#C5D4E3' },
      { p: 1, c: '#E9E2DC' },
    ]),
  ]);
  clone.clipsContent = true;

  bokeh(clone, -40, 120, 180, '#E8A87C', 60);
  bokeh(clone, 220, 40, 140, '#A8BFD4', 50);
  bokeh(clone, 80, 520, 200, '#D4A574', 70);
  bokeh(clone, 260, 600, 120, '#B8C9D9', 45);

  const top = clone.findOne((n) => n.name === 'Frame 2');
  if (top) setFill(top, []);

  const title = clone.findOne((n) => n.name === 'Find My Phone Launcher' && n.type === 'TEXT');
  if (title) {
    setFill(title, solid('#2F2A26'));
    title.fontName = { family: 'Inter', style: 'Semi Bold' };
    title.fontSize = 20;
  }

  const menuFrame = clone.findOne((n) => n.name.startsWith('menu_'));
  if (menuFrame && menuFrame.type === 'FRAME') {
    const btn = figma.createFrame();
    btn.name = 'Menu glass btn';
    btn.resize(40, 40);
    btn.x = menuFrame.x - 6;
    btn.y = menuFrame.y - 6;
    glass(btn, { opacity: 0.5, radius: 20, blur: 16 });
    btn.strokes = [solid('#FFFFFF', 0.7)];
    btn.strokeWeight = 1;
    btn.strokeAlign = 'INSIDE';
    top.insertChild(top.children.indexOf(menuFrame), btn);
    const menuVec = menuFrame.findOne((n) => n.type === 'VECTOR');
    if (menuVec) setFill(menuVec, solid('#3D3835'));
  }

  const adBox = clone.findOne((n) => n.name === 'Rectangle 4142');
  if (adBox) {
    glass(adBox, { opacity: 0.45, radius: 20, blur: 20 });
  }
  const adText = clone.findOne((n) => n.characters === 'AD\n320 x 50 px');
  if (adText) setFill(adText, solid('#5C534D', 0.75));

  const featureOn = clone.findOne((n) => n.name === 'Feature on');
  if (featureOn) {
    glass(featureOn, { opacity: 0.58, radius: 28, blur: 32 });
    const featText = featureOn.findOne((n) => n.type === 'TEXT');
    if (featText) {
      setFill(featText, solid('#2F2A26'));
      featText.fontName = { family: 'Inter', style: 'Medium' };
    }
    const bigToggle = featureOn.findOne((n) => n.name === 'toggle');
    if (bigToggle) {
      setFill(bigToggle, grad([
        { p: 0, c: '#3D3835' },
        { p: 1, c: '#5C4F47' },
      ]));
      setRadius(bigToggle, 60);
      bigToggle.effects = [
        {
          type: 'DROP_SHADOW',
          color: hex('#000000', 0.15),
          offset: { x: 0, y: 4 },
          radius: 12,
          spread: 0,
          visible: true,
          blendMode: 'NORMAL',
        },
      ];
      const onLabel = bigToggle.findOne((n) => n.type === 'TEXT' && n.characters === 'ON');
      if (onLabel) setFill(onLabel, solid('#FFFBF7'));
    }
  }

  const clapCard = clone.findOne((n) => n.name === '4');
  if (clapCard) {
    glass(clapCard, { opacity: 0.55, radius: 28, blur: 24 });
    styleSmallToggle(clapCard.findOne((n) => n.name === 'Group 1327225627'), '#D4845F');
  }

  const whistleCard = clone.findOne((n) => n.name === '5');
  if (whistleCard) {
    glass(whistleCard, { opacity: 0.55, radius: 28, blur: 24 });
    styleSmallToggle(whistleCard.findOne((n) => n.name === 'Group 1327225627'), '#7BA3C4');
  }

  const settings = clone.findOne((n) => n.name === 'settings');
  if (settings && settings.type === 'FRAME') {
    settings.itemSpacing = 12;
  }

  const settingRows = clone.findAll(
    (n) =>
      n.type === 'FRAME' &&
      n.name.startsWith('Frame 13272259') &&
      n.parent &&
      n.parent.name === 'settings'
  );
  for (const row of settingRows) {
    glass(row, { opacity: 0.68, radius: 24, blur: 22 });
    const labels = ['Alert Sound', 'Alert Duration', 'Flashlight', 'Vibration', 'Sound'];
    for (const t of row.findAll((n) => n.type === 'TEXT')) {
      if (labels.includes(t.characters)) {
        setFill(t, solid('#2F2A26'));
        t.fontName = { family: 'Inter', style: 'Medium' };
      }
      if (t.characters === 'Bell' || t.characters === '10 sec') {
        setFill(t, solid('#B8654A'));
        t.fontName = { family: 'Inter', style: 'Regular' };
      }
    }
    const toggleGrp = row.findOne((n) => n.name === 'Group 1327225627');
    if (toggleGrp) styleSmallToggle(toggleGrp, '#7BA3C4');
    const chev = row.findOne((n) => n.name.startsWith('chevron'));
    if (chev) {
      const v = chev.findOne((n) => n.type === 'VECTOR');
      if (v) setFill(v, solid('#A89888'));
    }
  }

  const time = clone.findOne((n) => n.characters === '12:30');
  if (time) setFill(time, solid('#2F2A26'));
  const statusBg = clone.findOne((n) => n.name === 'status bar bg');
  if (statusBg) statusBg.fills = [];

  const navBg = clone.findOne((n) => n.name === 'Rectangle 40032');
  if (navBg) setFill(navBg, solid('#F5F0EB', 0.9));

  figma.currentPage.selection = [clone];
  figma.viewport.scrollAndZoomIntoView([clone]);

  return { id: clone.id, name: clone.name, x: clone.x, y: clone.y };
})();
