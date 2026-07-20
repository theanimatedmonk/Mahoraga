(async () => {
  const SHORT = {
    '01-young-confidence-seeker':
      'Less self-doubt, more self-belief—own your moments with confidence.',
    '02-student-stress-manager':
      'Calmer headspace for classes, deadlines, and focus under pressure.',
    '03-early-spiritual-explorer':
      'Space for something deeper, meaningful, and quietly yours.',
    '04-guided-beginner-explorer':
      'Simple daily steps so a new practice feels doable, not overwhelming.',
    '05-ambitious-career-builder':
      'Sustained focus and stamina for serious career goals.',
    '06-high-performer-optimizer':
      'Sharper clarity and drive—trim noise, keep your performance edge.',
    '07-relationship-growth-seeker':
      'Stronger trust, clearer talks, warmer emotional connection.',
    '08-breakup-recovery-individual':
      'Healing after heartbreak and steadying your sense of worth.',
    '09-uncertain-relationship-reflector':
      'Honest reflection when you’re unsure this relationship still fits.',
    '10-emotional-support-seeker':
      'Gentle reassurance when life feels heavy—less anxiety, more steadiness.',
    '11-self-compassion-builder':
      'Softer self-talk—ease perfectionism and practice real self-kindness.',
    '12-balanced-growth-seeker':
      'Less overwhelm while juggling work, family, and health.',
    '13-uncertain-habit-builder':
      'Routines that stick—flexible systems instead of all-or-nothing guilt.',
    '14-reinvention-seeker':
      'Courage for a bold life or career change and what comes next.',
    '15-midlife-clarity-seeker':
      'Clearer priorities when you’re asking “What’s next for me?”',
    '16-midlife-stability-builder':
      'Steadier ground after drama—calm, reliable foundations.',
    '17-purpose-rediscovery-individual':
      'Rekindle passion and a clearer sense of purpose and calling.',
    '18-late-life-reflective-individual':
      'Honor your story with wisdom, acceptance, and meaningful reflection.',
    '19-spiritual-peace-seeker':
      'Deeper stillness and spiritual calm beneath everyday stress.',
    '20-gratitude-presence-practitioner':
      'Gratitude and presence—savor the day without the endless hustle.',
  };

  const vars = await figma.variables.getLocalVariablesAsync();
  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  const colById = Object.fromEntries(cols.map((c) => [c.id, c]));
  let updated = 0;
  const missing = [];

  for (const v of vars) {
    if (v.resolvedType !== 'STRING') continue;
    const m = v.name.match(/^persona-card\/([^/]+)\/description$/);
    if (!m) continue;
    const slug = m[1];
    const text = SHORT[slug];
    if (!text) {
      missing.push(slug);
      continue;
    }
    const col = colById[v.variableCollectionId];
    if (!col) continue;
    for (const mode of col.modes) {
      v.setValueForMode(mode.modeId, text);
    }
    updated++;
  }

  return { updated, missingSlugs: missing };
})();
