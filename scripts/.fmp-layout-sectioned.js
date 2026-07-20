(async () => {
  const SOURCE_ID = '6343:3092';
  const source = await figma.getNodeByIdAsync(SOURCE_ID);
  if (!source || source.type !== 'FRAME') return { error: 'Source not found' };

  for (const old of figma.currentPage.findAll(
    (n) => n.type === 'FRAME' && n.name === 'Launcher — Sectioned'
  )) {
    old.remove();
  }

  const launchers = figma.currentPage.findAll((n) => n.type === 'FRAME' && n.name.startsWith('Launcher —'));
  const maxY = Math.max(...launchers.map((f) => f.y + f.height));
  const startX = source.x;
  const startY = maxY + 64;

  const C = {
    bg: '#F2F0F5',
    header0: '#D4DCE8',
    header1: '#E4DCE8',
    text: '#4A4858',
    textMuted: '#8A8898',
    accent: '#9AABB8',
    accent2: '#B8A8C0',
    clapTile: '#E6ECF4',
    clapStroke: '#B8C8DC',
    whistleTile: '#F2E8E4',
    whistleStroke: '#D8C4BC',
    bellTile: '#F4F0E0',
    timerTile: '#E4ECF4',
    flashTile: '#EAE6F4',
    vibTile: '#E4EDE6',
    soundTile: '#F2EAE4',
    toggle: ['#A8B8C8', '#B8C8D8'],
    masterToggle: ['#8AA898', '#9AB8A8'],
    white: '#FFFFFF',
  };

  function hex(h, a = 1) {
    const x = h.replace('#', '');
    return {
      r: parseInt(x.slice(0, 2), 16) / 255,
      g: parseInt(x.slice(2, 4), 16) / 255,
      b: parseInt(x.slice(4, 6), 16) / 255,
      a,
    };
  }

  function solid(h, a = 1) {
    return { type: 'SOLID', color: hex(h, a) };
  }

  function grad(stops) {
    return {
      type: 'GRADIENT_LINEAR',
      gradientTransform: [
        [0, 1, 0],
        [-1, 0, 1],
      ],
      gradientStops: stops.map((s) => ({
        position: s.p,
        color: hex(s.c, s.a ?? 1),
      })),
    };
  }

  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });

  const screen = figma.createFrame();
  screen.name = 'Launcher — Sectioned';
  screen.resize(360, 820);
  screen.x = startX;
  screen.y = startY;
  screen.fills = [solid(C.bg)];
  screen.clipsContent = true;
  figma.currentPage.appendChild(screen);

  // ── Status bar (clone from source) ──
  const srcTop = source.findOne((n) => n.name === 'status bar');
  if (srcTop) {
    const bar = srcTop.clone();
    bar.x = 0;
    bar.y = 0;
    screen.appendChild(bar);
    const barBg = bar.findOne((n) => n.name === 'status bar bg');
    if (barBg) barBg.fills = [];
  }

  // ── Header gradient ──
  const header = figma.createFrame();
  header.name = 'Header';
  header.resize(360, 200);
  header.x = 0;
  header.y = 0;
  header.fills = [
    grad([
      { p: 0, c: C.header0 },
      { p: 1, c: C.header1 },
    ]),
  ];
  screen.appendChild(header);

  // Nav row
  const nav = figma.createFrame();
  nav.name = 'Nav';
  nav.resize(360, 52);
  nav.x = 0;
  nav.y = 28;
  nav.fills = [];
  header.appendChild(nav);

  const srcMenu = source.findOne((n) => n.name.startsWith('menu_'));
  if (srcMenu) {
    const menuBtn = figma.createFrame();
    menuBtn.resize(40, 40);
    menuBtn.x = 16;
    menuBtn.y = 6;
    menuBtn.cornerRadius = 20;
    menuBtn.fills = [solid(C.white, 0.55)];
    menuBtn.effects = [{ type: 'BACKGROUND_BLUR', radius: 12, visible: true }];
    nav.appendChild(menuBtn);
    const menuIcon = srcMenu.clone();
    menuIcon.x = 26;
    menuIcon.y = 12;
    nav.appendChild(menuIcon);
    const mv = menuIcon.findOne((n) => n.type === 'VECTOR');
    if (mv) mv.fills = [solid(C.text)];
  }

  const titleRow = figma.createFrame();
  titleRow.resize(200, 40);
  titleRow.x = 80;
  titleRow.y = 6;
  titleRow.fills = [];
  titleRow.layoutMode = 'HORIZONTAL';
  titleRow.itemSpacing = 8;
  titleRow.counterAxisAlignItems = 'CENTER';
  nav.appendChild(titleRow);

  const phoneIcon = figma.createFrame();
  phoneIcon.resize(28, 28);
  phoneIcon.cornerRadius = 8;
  phoneIcon.fills = [solid(C.clapTile)];
  phoneIcon.strokes = [solid(C.clapStroke, 0.4)];
  phoneIcon.strokeWeight = 1;
  titleRow.appendChild(phoneIcon);

  const title = figma.createText();
  title.characters = 'Find My Phone';
  title.fontSize = 17;
  title.fontName = { family: 'Inter', style: 'Semi Bold' };
  title.fills = [solid(C.text)];
  titleRow.appendChild(title);

  const moreBtn = figma.createFrame();
  moreBtn.resize(40, 40);
  moreBtn.x = 304;
  moreBtn.y = 6;
  moreBtn.cornerRadius = 20;
  moreBtn.fills = [solid(C.white, 0.55)];
  moreBtn.effects = [{ type: 'BACKGROUND_BLUR', radius: 12, visible: true }];
  nav.appendChild(moreBtn);
  const dots = figma.createFrame();
  dots.layoutMode = 'HORIZONTAL';
  dots.itemSpacing = 4;
  dots.x = 314;
  dots.y = 18;
  dots.fills = [];
  for (let i = 0; i < 3; i++) {
    const d = figma.createEllipse();
    d.resize(4, 4);
    d.fills = [solid(C.text)];
    dots.appendChild(d);
  }
  nav.appendChild(dots);

  // Detection card (overlapping header/body)
  const detect = figma.createFrame();
  detect.name = 'Detection card';
  detect.resize(320, 88);
  detect.x = 20;
  detect.y = 118;
  detect.cornerRadius = 24;
  detect.fills = [solid(C.white, 0.62)];
  detect.strokes = [solid(C.white, 0.8)];
  detect.strokeWeight = 1;
  detect.strokeAlign = 'INSIDE';
  detect.effects = [
    { type: 'BACKGROUND_BLUR', radius: 20, visible: true },
    {
      type: 'DROP_SHADOW',
      color: hex('#8890A0', 0.12),
      offset: { x: 0, y: 8 },
      radius: 20,
      spread: 0,
      visible: true,
      blendMode: 'NORMAL',
    },
  ];
  header.appendChild(detect);

  const statusLbl = figma.createText();
  statusLbl.characters = 'Detection Status';
  statusLbl.fontSize = 12;
  statusLbl.fontName = { family: 'Inter', style: 'Regular' };
  statusLbl.fills = [solid(C.textMuted)];
  statusLbl.x = 20;
  statusLbl.y = 18;
  detect.appendChild(statusLbl);

  const statusMain = figma.createText();
  statusMain.characters = 'Clap & Whistle is ON';
  statusMain.fontSize = 18;
  statusMain.fontName = { family: 'Inter', style: 'Bold' };
  statusMain.fills = [solid(C.text)];
  statusMain.x = 20;
  statusMain.y = 36;
  detect.appendChild(statusMain);

  const srcFeature = source.findOne((n) => n.name === 'toggle' && n.parent && n.parent.name === 'Feature on');
  if (srcFeature) {
    const tg = srcFeature.clone();
    tg.x = 185;
    tg.y = 14;
    tg.resize(120, 56);
    detect.appendChild(tg);
    const track = tg.findOne((n) => n.type === 'RECTANGLE' && n.width > 50);
    if (track) track.fills = [grad([{ p: 0, c: C.masterToggle[0] }, { p: 1, c: C.masterToggle[1] }])];
  }

  // ── Scroll body ──
  const body = figma.createFrame();
  body.name = 'Body';
  body.resize(360, 620);
  body.x = 0;
  body.y = 188;
  body.fills = [];
  body.layoutMode = 'VERTICAL';
  body.paddingLeft = body.paddingRight = 20;
  body.paddingTop = 8;
  body.itemSpacing = 20;
  body.primaryAxisSizingMode = 'FIXED';
  body.counterAxisSizingMode = 'FIXED';
  screen.appendChild(body);

  function sectionTitle(text) {
    const t = figma.createText();
    t.characters = text;
    t.fontSize = 16;
    t.fontName = { family: 'Inter', style: 'Semi Bold' };
    t.fills = [solid(C.text)];
    return t;
  }

  function iconTile(node, bg, stroke) {
    const tile = figma.createFrame();
    tile.resize(40, 40);
    tile.cornerRadius = 12;
    tile.fills = [solid(bg)];
    tile.strokes = [solid(stroke, 0.35)];
    tile.strokeWeight = 1;
    tile.layoutMode = 'HORIZONTAL';
    tile.primaryAxisAlignItems = 'CENTER';
    tile.counterAxisAlignItems = 'CENTER';
    if (node) {
      const ic = node.clone();
      ic.resize(22, 22);
      tile.appendChild(ic);
    }
    return tile;
  }

  function styleToggle(group) {
    if (!group) return group;
    for (const r of group.findAll((n) => n.type === 'RECTANGLE')) {
      if (r.width >= 40) {
        r.fills = [grad([{ p: 0, c: C.toggle[0] }, { p: 1, c: C.toggle[1] }])];
        r.cornerRadius = 40;
      } else {
        r.fills = [solid(C.white)];
        r.cornerRadius = 40;
      }
    }
    return group;
  }

  function listRow(srcFrame, iconBg, iconStroke, iconNode) {
    const row = figma.createFrame();
    row.name = 'Row';
    row.resize(320, 56);
    row.layoutMode = 'HORIZONTAL';
    row.primaryAxisSizingMode = 'FIXED';
    row.counterAxisSizingMode = 'FIXED';
    row.itemSpacing = 12;
    row.counterAxisAlignItems = 'CENTER';
    row.fills = [];

    const tile = iconTile(iconNode, iconBg, iconStroke);
    row.appendChild(tile);

    const lbl = srcFrame.findOne(
      (n) =>
        n.type === 'TEXT' &&
        !['Bell', '10 sec'].includes(n.characters)
    );
    if (lbl) {
      const t = lbl.clone();
      t.fontName = { family: 'Inter', style: 'Medium' };
      t.fills = [solid(C.text)];
      row.appendChild(t);
      t.layoutGrow = 1;
    }

    const val = srcFrame.findOne((n) => n.type === 'TEXT' && (n.characters === 'Bell' || n.characters === '10 sec'));
    if (val) {
      const v = val.clone();
      v.fills = [solid(C.textMuted)];
      row.appendChild(v);
      const chev = srcFrame.findOne((n) => n.name.startsWith('chevron'));
      if (chev) row.appendChild(chev.clone());
    } else {
      const tg = srcFrame.findOne((n) => n.name === 'Group 1327225627');
      if (tg) row.appendChild(styleToggle(tg.clone()));
    }
    return row;
  }

  function sectionCard(rows) {
    const card = figma.createFrame();
    card.resize(320, 1);
    card.layoutMode = 'VERTICAL';
    card.primaryAxisSizingMode = 'AUTO';
    card.counterAxisSizingMode = 'FIXED';
    card.paddingTop = card.paddingBottom = 8;
    card.paddingLeft = card.paddingRight = 12;
    card.itemSpacing = 0;
    card.cornerRadius = 20;
    card.fills = [solid(C.white)];
    card.effects = [
      {
        type: 'DROP_SHADOW',
        color: hex('#9098A8', 0.08),
        offset: { x: 0, y: 4 },
        radius: 16,
        spread: 0,
        visible: true,
        blendMode: 'NORMAL',
      },
    ];
    for (let i = 0; i < rows.length; i++) {
      card.appendChild(rows[i]);
      if (i < rows.length - 1) {
        const div = figma.createFrame();
        div.resize(296, 1);
        div.fills = [solid('#E8E6EC')];
        card.appendChild(div);
      }
    }
    return card;
  }

  // Section: Find My Phone
  body.appendChild(sectionTitle('Find My Phone'));

  const findRow = figma.createFrame();
  findRow.resize(320, 150);
  findRow.layoutMode = 'HORIZONTAL';
  findRow.itemSpacing = 16;
  findRow.fills = [];
  body.appendChild(findRow);

  function featureCard(srcCard, tileBg, tileStroke, label) {
    const card = figma.createFrame();
    card.resize(152, 150);
    card.cornerRadius = 24;
    card.fills = [solid(C.white)];
    card.effects = [
      {
        type: 'DROP_SHADOW',
        color: hex('#9098A8', 0.08),
        offset: { x: 0, y: 4 },
        radius: 16,
        spread: 0,
        visible: true,
        blendMode: 'NORMAL',
      },
    ];
    card.layoutMode = 'VERTICAL';
    card.paddingTop = 16;
    card.paddingLeft = card.paddingRight = 16;
    card.itemSpacing = 10;
    card.counterAxisAlignItems = 'CENTER';

    const emoji = srcCard.findOne(
      (n) => n.name.includes('clapping') || n.name.includes('whistl') || n.type === 'RECTANGLE' || n.type === 'GROUP'
    );
    const tile = iconTile(emoji, tileBg, tileStroke);
    card.appendChild(tile);

    const txt = figma.createText();
    txt.characters = label;
    txt.fontSize = 15;
    txt.fontName = { family: 'Inter', style: 'Medium' };
    txt.fills = [solid(C.text)];
    txt.textAlignHorizontal = 'CENTER';
    card.appendChild(txt);

    const tg = srcCard.findOne((n) => n.name === 'Group 1327225627');
    if (tg) card.appendChild(styleToggle(tg.clone()));

    return card;
  }

  const srcClap = source.findOne((n) => n.name === '4');
  const srcWhistle = source.findOne((n) => n.name === '5');
  if (srcClap) findRow.appendChild(featureCard(srcClap, C.clapTile, C.clapStroke, 'Find by Clap'));
  if (srcWhistle) findRow.appendChild(featureCard(srcWhistle, C.whistleTile, C.whistleStroke, 'Find by Whistle'));

  // Section: Alert Settings
  body.appendChild(sectionTitle('Alert Settings'));
  const srcSound = source.findOne((n) => n.name === 'Frame 1327225943');
  const srcDur = source.findOne((n) => n.name === 'Frame 1327225944');
  const bellIcon = srcSound && srcSound.findOne((n) => n.name.includes('bell'));
  const timerIcon = srcDur && srcDur.findOne((n) => n.name.includes('stopwatch'));
  body.appendChild(
    sectionCard([
      listRow(srcSound, C.bellTile, '#D8D0B0', bellIcon),
      listRow(srcDur, C.timerTile, C.clapStroke, timerIcon),
    ])
  );

  // Section: Response Actions
  body.appendChild(sectionTitle('Response Actions'));
  const srcFlash = source.findOne((n) => n.name === 'Frame 1327225941');
  const srcVib = source.findOne((n) => n.name === 'Frame 1327225945');
  const srcSnd = source.findOne((n) => n.name === 'Frame 1327225947');
  body.appendChild(
    sectionCard([
      listRow(srcFlash, C.flashTile, C.accent2, srcFlash && srcFlash.findOne((n) => n.name.includes('flash'))),
      listRow(srcVib, C.vibTile, '#B8C8B8', srcVib && srcVib.findOne((n) => n.name.includes('vibration'))),
      listRow(srcSnd, C.soundTile, '#D8C8B8', srcSnd && srcSnd.findOne((n) => n.name.includes('musical'))),
    ])
  );

  // Bottom nav clone
  const srcNav = source.findOne((n) => n.name === 'Group 1327225866');
  if (srcNav) {
    const navClone = srcNav.clone();
    navClone.x = 0;
    navClone.y = 774;
    screen.appendChild(navClone);
  }

  figma.currentPage.selection = [screen];
  figma.viewport.scrollAndZoomIntoView([screen]);

  return { id: screen.id, name: screen.name, x: screen.x, y: screen.y };
})();
