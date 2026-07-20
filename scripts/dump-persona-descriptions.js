(async () => {
  const vars = await figma.variables.getLocalVariablesAsync();
  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  const colById = Object.fromEntries(cols.map((c) => [c.id, c]));

  const descVars = vars.filter(
    (v) =>
      v.resolvedType === 'STRING' &&
      /^persona-card\/[^/]+\/description$/.test(v.name),
  );
  descVars.sort((a, b) => a.name.localeCompare(b.name));

  const rows = [];
  for (const v of descVars) {
    const col = colById[v.variableCollectionId];
    const modes = col ? col.modes : [{ modeId: Object.keys(v.valuesByMode)[0], name: 'default' }];
    const byMode = {};
    for (const m of modes) {
      const val = v.valuesByMode[m.modeId];
      byMode[m.name] = typeof val === 'string' ? val : String(val);
    }
    rows.push({ name: v.name, id: v.id, byMode });
  }
  return rows;
})();
