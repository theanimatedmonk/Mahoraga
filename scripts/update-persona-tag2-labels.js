(async () => {
  // node src/index.js eval --file scripts/update-persona-tag2-labels.js
  const COLLECTION_NAME = 'Affirmations';

  const SLUGS = [
    '01-young-confidence-seeker',
    '02-student-stress-manager',
    '03-early-spiritual-explorer',
    '04-guided-beginner-explorer',
    '05-ambitious-career-builder',
    '06-high-performer-optimizer',
    '07-relationship-growth-seeker',
    '08-breakup-recovery-individual',
    '09-uncertain-relationship-reflector',
    '10-emotional-support-seeker',
    '11-self-compassion-builder',
    '12-balanced-growth-seeker',
    '13-uncertain-habit-builder',
    '14-reinvention-seeker',
    '15-midlife-clarity-seeker',
    '16-midlife-stability-builder',
    '17-purpose-rediscovery-individual',
    '18-late-life-reflective-individual',
    '19-spiritual-peace-seeker',
    '20-gratitude-presence-practitioner',
  ];

  const LABELS = [
    'Overcoming fears',
    'Time management',
    'Spiritual growth',
    'Mental clarity',
    'Productivity',
    'Productivity',
    'Personal relationships',
    'Self-compassion',
    'Mental clarity',
    'Self-compassion',
    'Self-compassion',
    'Well-being',
    'Mental clarity',
    'Overcoming fears',
    'Mental clarity',
    'Well-being',
    'Spiritual growth',
    'Mental clarity',
    'Spiritual growth',
    'Well-being',
  ];

  if (SLUGS.length !== LABELS.length) {
    return { error: 'SLUGS and LABELS length mismatch' };
  }

  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  const affirm = cols.find((c) => c.name === COLLECTION_NAME);
  if (!affirm) return { error: 'Collection Affirmations not found' };

  const lightMode = affirm.modes.find((m) => m.name.toLowerCase() === 'light');
  const darkMode = affirm.modes.find((m) => m.name.toLowerCase() === 'dark');
  if (!lightMode || !darkMode) return { error: 'Need light and dark modes' };

  const vars = await figma.variables.getLocalVariablesAsync();
  let updated = 0;
  const detail = [];

  for (let i = 0; i < SLUGS.length; i++) {
    const slug = SLUGS[i];
    const label = LABELS[i];
    const varName = 'persona-card/' + slug + '/tag2';
    const v = vars.find((x) => x.name === varName && x.resolvedType === 'STRING');
    if (!v) {
      detail.push({ slug, status: 'missing', varName });
      continue;
    }
    v.setValueForMode(lightMode.modeId, label);
    v.setValueForMode(darkMode.modeId, label);
    updated += 1;
    detail.push({ slug, status: 'ok', value: label });
  }

  return { ok: true, updated, detail };
})();
