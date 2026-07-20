(async () => {
  const PHRASES = [
    'Be confident',
    'Boost self-worth',
    'Silence self-doubt',
    'Control stress and anxiety',
    'Stop overthinking',
    'Breathe relax',
    'Focus on mental health',
    'Find motivation',
    'Achieve career success',
    'Handling failure',
    'Setting goals',
    'Succeed at school',
    'Morning routine',
    'Establish new habits',
    'Improve your mindset',
    'Think positive',
    'Love yourself',
    'Accept yourself',
    'Self-care',
    'Heal your inner child',
    'Start healing journey',
    'Let go',
    'Overcome hard times',
    'Elevate your relationships',
    'Strengthen relationships',
    'Grow as a couple',
    'Practice forgiveness',
    'Setting boundaries',
    'Attract love',
    'Practice faith',
    'Connect with the Universe',
    'Spiritual growth',
    'Reclaim inner peace',
    'Be mindful',
    'Enjoy the moment',
    'Practice gratitude',
    'Discover your purpose',
    'Start a new beginning',
    'Follow your dreams',
    'Aging gracefully',
  ];

  const sel = figma.currentPage.selection;
  if (sel.length === 0) {
    return { error: 'Select your section (frame/group) first, then run again.' };
  }
  if (sel.length > 1) {
    return { error: 'Select a single node (the section). Found ' + sel.length + ' items.' };
  }

  const template = sel[0];
  if (!('clone' in template) || typeof template.clone !== 'function') {
    return { error: 'Selected node cannot be cloned: ' + template.type };
  }

  function findFirstText(node) {
    if (node.type === 'TEXT') return node;
    if ('children' in node) {
      for (const c of node.children) {
        const t = findFirstText(c);
        if (t) return t;
      }
    }
    return null;
  }

  const probeText = findFirstText(template);
  if (!probeText) {
    return { error: 'No TEXT layer found inside the selection. Add text or pick a different node.' };
  }

  async function loadFontsForText(node) {
    const len = node.characters.length;
    if (len === 0) {
      await figma.loadFontAsync(node.fontName);
      return;
    }
    const seen = new Set();
    let i = 0;
    while (i < len) {
      const fn = node.getRangeFontName(i, i + 1);
      const key = fn.family + '\0' + fn.style;
      if (!seen.has(key)) {
        seen.add(key);
        await figma.loadFontAsync(fn);
      }
      let j = i + 1;
      while (j < len) {
        const fn2 = node.getRangeFontName(j, j + 1);
        if (fn2.family !== fn.family || fn2.style !== fn.style) break;
        j++;
      }
      i = j;
    }
  }

  const gapX = 32;
  const gapY = 32;
  const cols = 4;
  const w = template.width + gapX;
  const h = template.height + gapY;
  const baseX = template.x;
  const baseY = template.y;

  const out = [];

  await loadFontsForText(probeText);
  probeText.characters = PHRASES[0];
  template.x = baseX + 0 * w;
  template.y = baseY + 0 * h;
  out.push({ id: template.id, name: template.name, phrase: PHRASES[0] });

  for (let i = 1; i < PHRASES.length; i++) {
    const phrase = PHRASES[i];
    const clone = template.clone();
    const col = i % cols;
    const row = Math.floor(i / cols);
    clone.x = baseX + col * w;
    clone.y = baseY + row * h;

    const textNode = findFirstText(clone);
    if (textNode) {
      await loadFontsForText(textNode);
      textNode.characters = phrase;
    }
    out.push({ id: clone.id, name: clone.name, phrase: phrase });
  }

  figma.currentPage.selection = [template];
  const zoom = await figma.getNodeByIdAsync(template.id);
  if (zoom) figma.viewport.scrollAndZoomIntoView([zoom]);

  return {
    total: out.length,
    cards: out,
    note:
      'First card is your original frame; ' +
      (out.length - 1) +
      ' clones added in a 4-column grid. Your list had ' +
      PHRASES.length +
      ' phrases (not 20).',
  };
})();

