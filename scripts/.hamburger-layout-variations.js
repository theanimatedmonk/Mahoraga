(async () => {
  const SOURCE_ID = '7703:16217';
  const source = await figma.getNodeByIdAsync(SOURCE_ID);
  if (!source || source.type !== 'FRAME') return { error: 'Source frame not found' };

  const W = 360;
  const H = 780;
  const GAP = 64;
  const LABEL_H = 48;
  const startX = source.x + source.width + GAP;
  const startY = source.y;

  const WHITE = { r: 1, g: 1, b: 1 };
  const BG = { r: 0.961, g: 0.961, b: 0.961 };

  function solid(c, a = 1) {
    const fill = { type: 'SOLID', color: { r: c.r, g: c.g, b: c.b } };
    if (a < 1) fill.opacity = a;
    return [fill];
  }

  function findByName(root, name) {
    if (root.name === name) return root;
    if (!('children' in root)) return null;
    for (const c of root.children) {
      const hit = findByName(c, name);
      if (hit) return hit;
    }
    return null;
  }

  function findTextParent(root, text) {
    if (root.type === 'TEXT' && root.characters === text) return root.parent;
    if (!('children' in root)) return null;
    for (const c of root.children) {
      const hit = findTextParent(c, text);
      if (hit) return hit;
    }
    return null;
  }

  function getParts(clone) {
    const status = findByName(clone, 'status bar');
    const header = clone.children.find((c) => c.name === 'Frame 2121453196') || null;
    const menu = clone.children.find((c) => c.name === 'Frame 2121453205') || null;
    const footer = clone.children.find((c) => c.name === 'Frame 2087324050') || null;
    const bottom = clone.children.find((c) => c.name === 'Frame 2121453202') || null;
    const myFeedSection = findTextParent(clone, 'MY FEED');
    const moreSection = findTextParent(clone, 'MORE');
    const headerCenter = findByName(clone, 'Frame 2121453195');
    return { status, header, menu, footer, bottom, myFeedSection, moreSection, headerCenter };
  }

  function stackY(parts, layout) {
    const { status, header, menu, footer, bottom } = parts;
    let y = 0;
    if (status) { status.y = y; y += status.height; }
    if (header) { header.y = y; y += header.height; }
    if (layout.navAfterHeader && bottom) {
      bottom.y = y;
      bottom.x = 0;
      y += bottom.height;
    }
    if (menu) {
      menu.y = y;
      menu.x = 0;
      const menuH = layout.menuHeight ?? (H - y - (footer?.height || 0) - (layout.navAtBottom && bottom ? bottom.height : 0));
      menu.resize(W, menuH);
      y += menuH;
    }
    if (footer) {
      footer.y = layout.footerY ?? y;
      footer.x = 0;
      y += footer.height;
    }
    if (layout.navAtBottom && bottom) {
      bottom.y = H - bottom.height;
      bottom.x = 0;
    }
  }

  function styleCard(frame, pad = 16) {
    if (!frame || frame.type !== 'FRAME') return;
    frame.fills = solid(WHITE);
    frame.cornerRadius = 16;
    frame.strokes = solid({ r: 0.9, g: 0.9, b: 0.9 });
    frame.strokeWeight = 1;
    frame.paddingTop = frame.paddingBottom = pad;
    frame.paddingLeft = frame.paddingRight = pad;
    if (frame.layoutMode === 'NONE') {
      frame.layoutMode = 'VERTICAL';
      frame.primaryAxisSizingMode = 'AUTO';
      frame.counterAxisSizingMode = 'FIXED';
      frame.resize(frame.width, frame.height);
    }
  }

  async function addLabel(x, y, title) {
    await figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' });
    const label = figma.createFrame();
    label.name = `Label — ${title}`;
    label.x = x;
    label.y = y - LABEL_H - 8;
    label.resize(W, LABEL_H);
    label.fills = solid({ r: 0.12, g: 0.12, b: 0.14 });
    label.cornerRadius = 8;
    label.layoutMode = 'HORIZONTAL';
    label.primaryAxisAlignItems = 'CENTER';
    label.counterAxisAlignItems = 'CENTER';
    figma.currentPage.appendChild(label);
    const t = figma.createText();
    t.fontName = { family: 'Inter', style: 'Semi Bold' };
    t.characters = title;
    t.fontSize = 14;
    t.fills = solid(WHITE);
    label.appendChild(t);
    return label;
  }

  const variations = [
    {
      title: 'A — Card Stack',
      apply(parts) {
        const { menu, myFeedSection, moreSection } = parts;
        if (menu) {
          menu.layoutMode = 'VERTICAL';
          menu.itemSpacing = 16;
          menu.paddingTop = menu.paddingBottom = 16;
          menu.paddingLeft = menu.paddingRight = 16;
        }
        styleCard(myFeedSection, 14);
        styleCard(moreSection, 14);
        stackY(parts, { navAtBottom: true, menuHeight: 358 });
      },
    },
    {
      title: 'B — Split Columns',
      apply(parts) {
        const { menu, myFeedSection, moreSection } = parts;
        if (menu) {
          menu.layoutMode = 'HORIZONTAL';
          menu.itemSpacing = 12;
          menu.paddingTop = menu.paddingBottom = 16;
          menu.paddingLeft = menu.paddingRight = 16;
          menu.primaryAxisAlignItems = 'MIN';
          menu.counterAxisAlignItems = 'MIN';
        }
        if (myFeedSection) {
          myFeedSection.layoutMode = 'VERTICAL';
          myFeedSection.itemSpacing = 8;
          myFeedSection.resize(158, myFeedSection.height);
          styleCard(myFeedSection, 12);
        }
        if (moreSection) {
          moreSection.layoutMode = 'VERTICAL';
          moreSection.itemSpacing = 8;
          moreSection.resize(158, moreSection.height);
          styleCard(moreSection, 12);
        }
        stackY(parts, { navAtBottom: true, menuHeight: 340 });
      },
    },
    {
      title: 'C — Nav Below Header',
      apply(parts) {
        const { headerCenter, bottom } = parts;
        if (headerCenter) {
          headerCenter.layoutMode = 'HORIZONTAL';
          headerCenter.itemSpacing = 12;
          headerCenter.primaryAxisAlignItems = 'CENTER';
          headerCenter.counterAxisAlignItems = 'CENTER';
          headerCenter.paddingTop = headerCenter.paddingBottom = 8;
        }
        if (bottom) bottom.resize(W, 62);
        stackY(parts, { navAfterHeader: true, navAtBottom: false, menuHeight: 420, footerY: 633 });
      },
    },
    {
      title: 'D — Compact Unified List',
      apply(parts) {
        const { menu, myFeedSection, moreSection, footer } = parts;
        if (menu) {
          menu.fills = solid(WHITE);
          menu.cornerRadius = 20;
          menu.strokes = solid({ r: 0.9, g: 0.9, b: 0.9 });
          menu.strokeWeight = 1;
          menu.layoutMode = 'VERTICAL';
          menu.itemSpacing = 12;
          menu.paddingTop = 20;
          menu.paddingBottom = 20;
          menu.paddingLeft = 16;
          menu.paddingRight = 16;
        }
        if (myFeedSection) {
          myFeedSection.fills = [];
          myFeedSection.strokes = [];
          myFeedSection.paddingTop = myFeedSection.paddingBottom = 0;
        }
        if (moreSection) {
          moreSection.fills = [];
          moreSection.strokes = [];
          moreSection.paddingTop = moreSection.paddingBottom = 0;
        }
        if (footer) {
          footer.layoutMode = 'VERTICAL';
          footer.itemSpacing = 4;
          footer.paddingTop = 8;
          footer.paddingBottom = 8;
          for (const row of footer.children) {
            if (row.type === 'FRAME') row.resize(W - 40, 32);
          }
        }
        stackY(parts, { navAtBottom: true, menuHeight: 390, footerY: 572 });
      },
    },
  ];

  const created = [];
  for (let i = 0; i < variations.length; i++) {
    const v = variations[i];
    const clone = source.clone();
    clone.name = `Hamburger menu — ${v.title}`;
    clone.x = startX + i * (W + GAP);
    clone.y = startY;
    figma.currentPage.appendChild(clone);

    const parts = getParts(clone);
    v.apply(parts);

    const label = await addLabel(clone.x, clone.y, v.title);
    created.push({ id: clone.id, name: clone.name, x: clone.x, label: label.id });
  }

  const frames = created.map((c) => figma.getNodeByIdAsync(c.id)).length;
  const nodes = [];
  for (const c of created) nodes.push(await figma.getNodeByIdAsync(c.id));
  figma.currentPage.selection = nodes;
  figma.viewport.scrollAndZoomIntoView(nodes);

  return { ok: true, source: SOURCE_ID, created };
})();
