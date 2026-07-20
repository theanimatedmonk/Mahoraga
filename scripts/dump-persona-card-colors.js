/**
 * Audit: persona-card/* COLOR variables — light vs dark per mode.
 *   node src/index.js eval --file scripts/dump-persona-card-colors.js
 */
(async () => {
  const vars = await figma.variables.getLocalVariablesAsync();
  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  const colById = Object.fromEntries(cols.map((c) => [c.id, c]));

  function hex(val) {
    if (!val || typeof val !== 'object' || !('r' in val)) return null;
    const r = Math.round(val.r * 255);
    const g = Math.round(val.g * 255);
    const b = Math.round(val.b * 255);
    return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
  }

  const mine = vars.filter(
    (v) => v.name.startsWith('persona-card/') && v.resolvedType === 'COLOR',
  );
  const byPersona = {};
  for (const v of mine) {
    const m = v.name.match(/^persona-card\/([^/]+)\/(.+)$/);
    if (!m) continue;
    const [, slug, key] = m;
    if (!byPersona[slug]) byPersona[slug] = {};
    const col = colById[v.variableCollectionId];
    const row = { id: v.id };
    if (col) {
      for (const mode of col.modes) {
        row[mode.name] = hex(v.valuesByMode[mode.modeId]);
      }
    }
    byPersona[slug][key] = row;
  }
  return byPersona;
})();
