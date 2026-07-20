(async () => {
  const SOURCE_ID = '6343:3092';
  const source = await figma.getNodeByIdAsync(SOURCE_ID);
  if (!source || source.type !== 'FRAME') return { error: 'Source frame not found' };

  const GAP = 408;
  const PAD = 20;
  const CARD_W = 320;

  // Remove previous layout explorations
  for (const old of figma.currentPage.findAll(
    (n) => n.type === 'FRAME' && n.name.startsWith('Launcher — Layout ·')
  )) {
    old.remove();
  }

  const launchers = figma.currentPage.findAll((n) => n.type === 'FRAME' && n.name.startsWith('Launcher —'));
  const maxY = Math.max(...launchers.map((f) => f.y + f.height));
  let startX = source.x;
  let startY = maxY + 64;

  function parts(frame) {
    const top = frame.findOne((n) => n.name === 'Frame 2');
    const feature = frame.findOne((n) => n.name === 'Feature on');
    const clap = frame.findOne((n) => n.name === '4');
    const whistle = frame.findOne((n) => n.name === '5');
    const group = frame.findOne((n) => n.name === 'Group 1327225643');
    const settings = frame.findOne((n) => n.name === 'settings');
    return { top, feature, clap, whistle, group, settings };
  }

  function show(nodes) {
    for (const n of nodes) if (n) n.visible = true;
  }

  function hide(nodes) {
    for (const n of nodes) if (n) n.visible = false;
  }

  function moveSettings(settings, y) {
    if (!settings) return;
    settings.y = y;
  }

  function rowifyCard(card, toggleRight = 260) {
    if (!card) return;
    card.resize(CARD_W, 72);
    const emoji = card.findOne(
      (n) =>
        n.name.includes('clapping') ||
        n.name.includes('whistl') ||
        n.type === 'RECTANGLE' ||
        (n.type === 'GROUP' && n.name.includes('598'))
    );
    const texts = card.findAll((n) => n.type === 'TEXT');
    const mainText = texts.find((t) => t.characters.includes('Find Phone')) || texts[0];
    const toggle = card.findOne((n) => n.name === 'Group 1327225627');
    if (emoji && 'x' in emoji) {
      emoji.x = 14;
      emoji.y = 20;
    }
    if (mainText) {
      mainText.x = 56;
      mainText.y = 16;
      mainText.textAutoResize = 'HEIGHT';
      mainText.resize(180, mainText.height);
    }
    if (toggle) {
      toggle.x = toggleRight;
      toggle.y = 21;
    }
  }

  function rowifyMaster(feature) {
    if (!feature) return;
    feature.resize(CARD_W, 72);
    const text = feature.findOne((n) => n.type === 'TEXT');
    const toggle = feature.findOne((n) => n.name === 'toggle');
    if (text) {
      text.x = 16;
      text.y = 14;
      text.resize(170, text.height);
    }
    if (toggle) {
      toggle.x = 185;
      toggle.y = 10;
      toggle.resize(120, 52);
    }
  }

  function placeCard(card, x, y, w, h) {
    if (!card) return;
    card.x = x;
    card.y = y;
    if (w && h) card.resize(w, h);
  }

  function addLayoutLabel(frame, label) {
    const old = frame.findOne((n) => n.name === 'Layout label');
    if (old) old.remove();
    const chip = figma.createFrame();
    chip.name = 'Layout label';
    chip.layoutMode = 'HORIZONTAL';
    chip.primaryAxisSizingMode = 'AUTO';
    chip.counterAxisSizingMode = 'AUTO';
    chip.paddingLeft = chip.paddingRight = 12;
    chip.paddingTop = chip.paddingBottom = 6;
    chip.cornerRadius = 16;
    chip.x = PAD;
    chip.y = 118;
    chip.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 0.55 } }];
    chip.strokes = [{ type: 'SOLID', color: { r: 0.75, g: 0.72, b: 0.78, a: 0.35 } }];
    chip.strokeWeight = 1;
    chip.strokeAlign = 'INSIDE';
    chip.effects = [{ type: 'BACKGROUND_BLUR', radius: 12, visible: true }];
    const t = figma.createText();
    t.characters = label;
    t.fontSize = 11;
    t.fontName = { family: 'Inter', style: 'Medium' };
    t.fills = [{ type: 'SOLID', color: { r: 0.35, g: 0.34, b: 0.4 } }];
    chip.appendChild(t);
    frame.appendChild(chip);
  }

  const layouts = [
    {
      name: 'Layout · Stack',
      label: 'Stack — 3 full-width rows',
      apply(frame) {
        const { feature, clap, whistle, group, settings } = parts(frame);
        if (group) group.visible = false;
        show([feature, clap, whistle]);
        rowifyMaster(feature);
        rowifyCard(clap);
        rowifyCard(whistle);
        let y = 160;
        placeCard(feature, PAD, y);
        y += 80;
        placeCard(clap, PAD, y);
        y += 80;
        placeCard(whistle, PAD, y);
        moveSettings(settings, y + 88);
      },
    },
    {
      name: 'Layout · Features First',
      label: 'Features first — toggles on top',
      apply(frame) {
        const { feature, clap, whistle, group, settings } = parts(frame);
        if (group) group.visible = false;
        show([feature, clap, whistle]);
        // restore squarish cards
        placeCard(clap, PAD, 160, 152, 154);
        placeCard(whistle, PAD + 168, 160, 152, 154);
        placeCard(feature, PAD, 326, CARD_W, 90);
        feature.resize(CARD_W, 90);
        const text = feature.findOne((n) => n.type === 'TEXT');
        const toggle = feature.findOne((n) => n.name === 'toggle');
        if (text) {
          text.x = 20;
          text.y = 23;
        }
        if (toggle) {
          toggle.x = 185;
          toggle.y = 15;
        }
        moveSettings(settings, 432);
      },
    },
    {
      name: 'Layout · Unified Card',
      label: 'Unified — one glass container',
      apply(frame) {
        const { feature, clap, whistle, group, settings } = parts(frame);
        hide([feature, clap, whistle, group]);

        let unified = frame.findOne((n) => n.name === 'Unified detection');
        if (!unified) {
          unified = figma.createFrame();
          unified.name = 'Unified detection';
          frame.findOne((n) => n.name === 'Frame 2').appendChild(unified);
        }
        unified.visible = true;
        unified.x = PAD;
        unified.y = 160;
        unified.resize(CARD_W, 248);
        unified.cornerRadius = 28;
        unified.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 0.55 } }];
        unified.strokes = [{ type: 'SOLID', color: { r: 0.72, g: 0.78, b: 0.86, a: 0.35 } }];
        unified.strokeWeight = 1;
        unified.strokeAlign = 'INSIDE';
        unified.effects = [
          { type: 'BACKGROUND_BLUR', radius: 24, visible: true },
          {
            type: 'DROP_SHADOW',
            color: { r: 0.55, g: 0.6, b: 0.7, a: 0.1 },
            offset: { x: 0, y: 8 },
            radius: 20,
            spread: 0,
            visible: true,
            blendMode: 'NORMAL',
          },
        ];
        unified.layoutMode = 'VERTICAL';
        unified.primaryAxisSizingMode = 'FIXED';
        unified.counterAxisSizingMode = 'FIXED';
        unified.paddingLeft = unified.paddingRight = 16;
        unified.paddingTop = unified.paddingBottom = 16;
        unified.itemSpacing = 0;

        // Clear old row clones inside unified
        for (const c of [...unified.children]) if (c.name.startsWith('Row ·')) c.remove();

        function makeRow(fromCard, isMaster) {
          const row = figma.createFrame();
          row.name = 'Row · ' + (isMaster ? 'master' : fromCard.name);
          row.layoutMode = 'HORIZONTAL';
          row.primaryAxisSizingMode = 'FIXED';
          row.counterAxisSizingMode = 'FIXED';
          row.resize(CARD_W - 32, isMaster ? 72 : 64);
          row.fills = [];
          row.itemSpacing = 12;
          row.counterAxisAlignItems = 'CENTER';

          const srcText = fromCard.findOne(
            (n) => n.type === 'TEXT' && (isMaster || n.characters.includes('Find'))
          );
          const srcToggle = fromCard.findOne((n) => n.name === 'toggle' || n.name === 'Group 1327225627');

          if (srcText) {
            const t = srcText.clone();
            t.textAutoResize = 'HEIGHT';
            t.resize(isMaster ? 160 : 150, t.height);
            row.appendChild(t);
            t.layoutGrow = 1;
          }
          if (srcToggle) {
            const tg = srcToggle.clone();
            row.appendChild(tg);
          }
          unified.appendChild(row);
          return row;
        }

        makeRow(feature, true);
        const div1 = figma.createFrame();
        div1.name = 'Row · divider';
        div1.resize(CARD_W - 32, 1);
        div1.fills = [{ type: 'SOLID', color: { r: 0.8, g: 0.82, b: 0.86, a: 0.6 } }];
        unified.appendChild(div1);
        makeRow(clap, false);
        const div2 = figma.createFrame();
        div2.name = 'Row · divider';
        div2.resize(CARD_W - 32, 1);
        div2.fills = [{ type: 'SOLID', color: { r: 0.8, g: 0.82, b: 0.86, a: 0.6 } }];
        unified.appendChild(div2);
        makeRow(whistle, false);

        moveSettings(settings, 424);
      },
    },
    {
      name: 'Layout · Split Column',
      label: 'Split — master left, features right',
      apply(frame) {
        const { feature, clap, whistle, group, settings } = parts(frame);
        if (group) group.visible = false;
        show([feature, clap, whistle]);

        placeCard(feature, PAD, 160, 148, 200);
        feature.resize(148, 200);
        const fText = feature.findOne((n) => n.type === 'TEXT');
        const fToggle = feature.findOne((n) => n.name === 'toggle');
        if (fText) {
          fText.x = 12;
          fText.y = 16;
          fText.resize(124, 80);
        }
        if (fToggle) {
          fToggle.x = 14;
          fToggle.y = 128;
          fToggle.resize(120, 52);
        }

        placeCard(clap, PAD + 160, 160, 160, 96);
        placeCard(whistle, PAD + 160, 264, 160, 96);
        rowifyCard(clap, 100);
        rowifyCard(whistle, 100);
        clap.resize(160, 96);
        whistle.resize(160, 96);

        moveSettings(settings, 376);
      },
    },
    {
      name: 'Layout · Wide Tiles',
      label: 'Wide tiles — clap / whistle rows, master footer',
      apply(frame) {
        const { feature, clap, whistle, group, settings } = parts(frame);
        if (group) group.visible = false;
        show([feature, clap, whistle]);

        rowifyCard(clap);
        rowifyCard(whistle);
        rowifyMaster(feature);

        placeCard(clap, PAD, 160);
        placeCard(whistle, PAD, 248);
        placeCard(feature, PAD, 336);

        moveSettings(settings, 424);
      },
    },
  ];

  await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });

  const created = [];
  let x = startX;
  for (const layout of layouts) {
    const clone = source.clone();
    clone.name = 'Launcher — ' + layout.name;
    clone.x = x;
    clone.y = startY;
    // Remove harmony chip from clone
    const harmonyChip = clone.findOne((n) => n.name === 'Harmony label');
    if (harmonyChip) harmonyChip.remove();
    layout.apply(clone);
    addLayoutLabel(clone, layout.label);
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

  return { startY, created };
})();
