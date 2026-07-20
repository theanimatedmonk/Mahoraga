// Mahoraga pitch deck — run via: node src/index.js eval "$(cat scripts/.mahoraga-pitch-deck.js)"
(async () => {
  const fonts = [
    { family: 'Inter', style: 'Regular' },
    { family: 'Inter', style: 'Medium' },
    { family: 'Inter', style: 'Semi Bold' },
    { family: 'Inter', style: 'Bold' },
  ];
  for (const f of fonts) await figma.loadFontAsync(f);

  const SW = 1920;
  const SH = 1080;
  const GAP = 64;
  const START_X = 12000;
  const START_Y = -6200;

  const colors = {
    bg: { r: 0.035, g: 0.035, b: 0.043 },
    card: { r: 0.09, g: 0.09, b: 0.11 },
    border: { r: 0.18, g: 0.18, b: 0.2 },
    accent: { r: 0.39, g: 0.4, b: 0.95 },
    accentSoft: { r: 0.39, g: 0.4, b: 0.95, a: 0.15 },
    cyan: { r: 0.13, g: 0.83, b: 0.93 },
    text: { r: 0.98, g: 0.98, b: 0.98 },
    muted: { r: 0.63, g: 0.64, b: 0.67 },
    red: { r: 0.97, g: 0.44, b: 0.44 },
    green: { r: 0.2, g: 0.83, b: 0.6 },
  };

  function solid(c, a = 1) {
    const fill = { type: 'SOLID', color: { r: c.r, g: c.g, b: c.b } };
    if (a < 1) fill.opacity = a;
    return [fill];
  }

  function addText(parent, chars, size, style, color, opts = {}) {
    const t = figma.createText();
    t.fontName = { family: 'Inter', style };
    t.characters = chars;
    t.fontSize = size;
    t.fills = solid(color);
    if (opts.lineHeight) t.lineHeight = { unit: 'PIXELS', value: opts.lineHeight };
    if (opts.align) t.textAlignHorizontal = opts.align;
    parent.appendChild(t);
    t.layoutSizingHorizontal = opts.width === 'fill' ? 'FILL' : 'HUG';
    if (opts.width === 'fill') t.layoutGrow = opts.grow || 0;
    return t;
  }

  function createSlide(index, title, tag, bodyLines, sidePanel) {
    const frame = figma.createFrame();
    frame.name = `Mahoraga Pitch — Slide ${index}`;
    frame.resize(SW, SH);
    frame.x = START_X + index * (SW + GAP);
    frame.y = START_Y;
    frame.fills = solid(colors.bg);
    frame.clipsContent = true;
    figma.currentPage.appendChild(frame);

    const accentBar = figma.createRectangle();
    accentBar.resize(SW, 6);
    accentBar.fills = solid(colors.accent);
    frame.appendChild(accentBar);

    const content = figma.createFrame();
    content.name = 'Content';
    content.fills = [];
    content.layoutMode = 'VERTICAL';
    content.itemSpacing = 28;
    content.paddingLeft = content.paddingRight = 80;
    content.paddingTop = 72;
    content.paddingBottom = 64;
    content.resize(SW, SH);
    content.layoutSizingHorizontal = 'FIXED';
    content.layoutSizingVertical = 'FIXED';
    frame.appendChild(content);
    content.layoutAlign = 'STRETCH';

    const header = figma.createFrame();
    header.fills = [];
    header.layoutMode = 'VERTICAL';
    header.itemSpacing = 12;
    header.layoutSizingHorizontal = 'FILL';
    content.appendChild(header);

    const tagFrame = figma.createFrame();
    tagFrame.name = 'Tag';
    tagFrame.fills = solid(colors.accent, 0.12);
    tagFrame.cornerRadius = 999;
    tagFrame.layoutMode = 'HORIZONTAL';
    tagFrame.paddingLeft = tagFrame.paddingRight = 16;
    tagFrame.paddingTop = tagFrame.paddingBottom = 8;
    tagFrame.primaryAxisSizingMode = 'AUTO';
    tagFrame.counterAxisSizingMode = 'AUTO';
    header.appendChild(tagFrame);
    addText(tagFrame, tag, 13, 'Semi Bold', colors.cyan);

    addText(header, title, 52, 'Bold', colors.text, { lineHeight: 58 });

    const row = figma.createFrame();
    row.fills = [];
    row.layoutMode = 'HORIZONTAL';
    row.itemSpacing = 48;
    row.layoutSizingHorizontal = 'FILL';
    row.layoutGrow = 1;
    row.primaryAxisSizingMode = 'FIXED';
    row.counterAxisSizingMode = 'AUTO';
    content.appendChild(row);

    const left = figma.createFrame();
    left.name = 'Body';
    left.fills = [];
    left.layoutMode = 'VERTICAL';
    left.itemSpacing = 18;
    left.layoutSizingHorizontal = 'FILL';
    left.layoutGrow = 1;
    row.appendChild(left);

    for (const line of bodyLines) {
      if (line.type === 'spacer') {
        const sp = figma.createFrame();
        sp.resize(1, line.h || 8);
        sp.fills = [];
        left.appendChild(sp);
        continue;
      }
      if (line.type === 'heading') {
        addText(left, line.text, 22, 'Semi Bold', colors.text, { width: 'fill', lineHeight: 30 });
        continue;
      }
      if (line.type === 'bullet') {
        const rowB = figma.createFrame();
        rowB.fills = [];
        rowB.layoutMode = 'HORIZONTAL';
        rowB.itemSpacing = 14;
        rowB.layoutSizingHorizontal = 'FILL';
        left.appendChild(rowB);
        const dot = figma.createEllipse();
        dot.resize(8, 8);
        dot.fills = solid(line.color || colors.accent);
        rowB.appendChild(dot);
        dot.layoutAlign = 'CENTER';
        const wrap = figma.createFrame();
        wrap.fills = [];
        wrap.layoutMode = 'VERTICAL';
        wrap.layoutSizingHorizontal = 'FILL';
        rowB.appendChild(wrap);
        addText(wrap, line.text, 18, 'Regular', colors.muted, { width: 'fill', lineHeight: 28 });
        continue;
      }
      if (line.type === 'code') {
        const codeBox = figma.createFrame();
        codeBox.name = 'Code';
        codeBox.fills = solid(colors.card);
        codeBox.strokes = solid(colors.border);
        codeBox.strokeWeight = 1;
        codeBox.cornerRadius = 12;
        codeBox.layoutMode = 'VERTICAL';
        codeBox.paddingLeft = codeBox.paddingRight = 20;
        codeBox.paddingTop = codeBox.paddingBottom = 16;
        codeBox.layoutSizingHorizontal = 'FILL';
        left.appendChild(codeBox);
        addText(codeBox, line.text, 15, 'Medium', colors.green, { lineHeight: 24 });
        continue;
      }
      addText(left, line.text, 18, 'Regular', colors.muted, { width: 'fill', lineHeight: 28 });
    }

    if (sidePanel) {
      const right = figma.createFrame();
      right.name = 'Panel';
      right.fills = solid(colors.card);
      right.strokes = solid(colors.border);
      right.strokeWeight = 1;
      right.cornerRadius = 20;
      right.layoutMode = 'VERTICAL';
      right.itemSpacing = 16;
      right.paddingLeft = right.paddingRight = 28;
      right.paddingTop = right.paddingBottom = 28;
      right.resize(420, 1);
      right.primaryAxisSizingMode = 'FIXED';
      right.counterAxisSizingMode = 'AUTO';
      right.minWidth = 420;
      row.appendChild(right);
      addText(right, sidePanel.title, 16, 'Semi Bold', colors.text, { lineHeight: 22 });
      for (const item of sidePanel.items) {
        const chip = figma.createFrame();
        chip.fills = solid(colors.bg);
        chip.cornerRadius = 10;
        chip.layoutMode = 'HORIZONTAL';
        chip.paddingLeft = chip.paddingRight = 14;
        chip.paddingTop = chip.paddingBottom = 12;
        chip.layoutSizingHorizontal = 'FILL';
        right.appendChild(chip);
        addText(chip, item, 14, 'Medium', colors.muted, { width: 'fill', lineHeight: 20 });
      }
    }

    const footer = figma.createFrame();
    footer.fills = [];
    footer.layoutMode = 'HORIZONTAL';
    footer.layoutSizingHorizontal = 'FILL';
    footer.primaryAxisAlignItems = 'SPACE_BETWEEN';
    content.appendChild(footer);
    addText(footer, 'MAHORAGA', 13, 'Bold', colors.accent);
    addText(footer, `${index} / 4`, 13, 'Medium', colors.muted);

    return frame;
  }

  const slides = [];

  slides.push(
    createSlide(
      1,
      'What is Mahoraga?',
      'THE ADAPTIVE BRIDGE',
      [
        {
          type: 'heading',
          text: 'A creature that adapts to survive',
        },
        {
          text: 'In mythology, Mahoraga is a shikigami that cannot be defeated by repetition — it adapts to every attack and learns the environment until it overcomes.',
        },
        { type: 'spacer', h: 4 },
        {
          type: 'heading',
          text: 'Our bridge works the same way',
        },
        {
          type: 'bullet',
          text: 'Adapts to your setup: Yolo (CDP), Safe Mode (plugin), or Mahoraga bridge — whatever your machine allows.',
        },
        {
          type: 'bullet',
          text: 'A local FigCLI that talks to Figma Desktop directly — no API key, no cloud middleman for design ops.',
        },
        {
          type: 'bullet',
          text: 'Named for adaptation: one tool, many environments, zero rigidity.',
        },
      ],
      {
        title: 'Core idea',
        items: ['Local-first', 'Environment-aware', 'Figma Desktop native', 'AI-friendly CLI'],
      }
    )
  );

  slides.push(
    createSlide(
      2,
      'CLI, not MCP',
      'WHY CDN / NPM',
      [
        { type: 'heading', text: 'The MCP problem' },
        {
          type: 'bullet',
          color: colors.red,
          text: 'Tool schemas ride inside every prompt → massive token consumption before you ship anything.',
        },
        {
          type: 'bullet',
          color: colors.red,
          text: 'Eats the context window: less room for your code, specs, and design intent.',
        },
        {
          type: 'bullet',
          color: colors.red,
          text: 'Round-trip overhead: IDE → MCP server → Figma → back. Slow and opaque.',
        },
        { type: 'spacer', h: 8 },
        { type: 'heading', text: 'Why a local CLI (npm / CDN) is safer & smarter' },
        {
          type: 'bullet',
          color: colors.green,
          text: 'Commands run in your terminal — you see and approve each step. Safety net on your device.',
        },
        {
          type: 'bullet',
          color: colors.green,
          text: 'Context stays in your repo & prompts — not bloated with 50 tool definitions in chat.',
        },
        {
          type: 'bullet',
          color: colors.green,
          text: 'Works with local LLMs: no cloud dependency for the bridge itself.',
        },
        {
          type: 'bullet',
          color: colors.green,
          text: 'npx @deanimatedmonk/mahoraga — drop into any project, same commands everywhere.',
        },
      ],
      {
        title: 'MCP vs Mahoraga',
        items: ['MCP: context in prompt', 'CLI: context in files', 'MCP: remote roundtrip', 'CLI: local shell'],
      }
    )
  );

  slides.push(
    createSlide(
      3,
      'Capabilities',
      'AUTOMATE THE BORING STUFF',
      [
        {
          text: 'Mahoraga handles the repetitive Figma work so your team focuses on product — not manual cleanup.',
        },
        { type: 'spacer', h: 4 },
        {
          type: 'bullet',
          text: 'Batch rename components, bind design tokens, visualize variables, drop UI blocks.',
        },
        {
          type: 'bullet',
          text: 'Run scripts & eval: update headlines, swap variants, export selections for codegen.',
        },
        {
          type: 'bullet',
          text: 'Connect once, then drive Figma from Cursor, Claude Code, or any agent that runs shell commands.',
        },
        { type: 'spacer', h: 8 },
        { type: 'heading', text: 'Bring designs to life in any repo' },
        {
          type: 'code',
          text: 'npm i -D @deanimatedmonk/mahoraga\nnpx mahoraga connect --safe\nnpx mahoraga export selection -o figma-selection.json',
        },
        {
          text: 'Your agent reads JSON on disk — no MCP roundtrip. Design → code in one loop.',
        },
      ],
      {
        title: 'Example commands',
        items: [
          'tokens preset shadcn',
          'drop in bottom-sheet',
          'render + to-component',
          'verify screenshot',
        ],
      }
    )
  );

  slides.push(
    createSlide(
      4,
      'See it live',
      'DEMO',
      [
        {
          text: 'Live walkthrough: from Figma selection to running code — powered by Mahoraga, not MCP.',
        },
        { type: 'spacer', h: 12 },
        { type: 'heading', text: 'Demo flow' },
        {
          type: 'bullet',
          text: '1. npx mahoraga connect — bridge to Figma Desktop',
        },
        {
          type: 'bullet',
          text: '2. Select frames → export selection JSON for the agent',
        },
        {
          type: 'bullet',
          text: '3. Agent runs mahoraga commands to update copy, sources, tokens',
        },
        {
          type: 'bullet',
          text: '4. verify screenshot → ship with confidence',
        },
        { type: 'spacer', h: 16 },
        {
          type: 'code',
          text: '[ Live demo slot — screen share here ]',
        },
      ],
      {
        title: 'You will see',
        items: [
          'Real-time Figma updates',
          'Zero MCP token tax',
          'Works in your repo today',
          'Questions?',
        ],
      }
    )
  );

  figma.currentPage.selection = slides;
  figma.viewport.scrollAndZoomIntoView(slides);

  return {
    ok: true,
    slides: slides.map((s) => ({ id: s.id, name: s.name, x: s.x, y: s.y })),
  };
})();
