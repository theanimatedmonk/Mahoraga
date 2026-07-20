(async () => {
  const sel = figma.currentPage.selection;
  if (!sel.length) return { error: 'Nothing selected' };
  const rows = [];
  const inspect = async (n, pathParts) => {
    const currentPath = [...pathParts, n.name];
    const pathStr = currentPath.join(' > ');
    const bv = n.boundVariables;
    if (bv && typeof bv === 'object') {
      for (const key of Object.keys(bv)) {
        const val = bv[key];
        if (val == null) continue;
        if (Array.isArray(val)) {
          for (let i = 0; i < val.length; i++) {
            const alias = val[i];
            if (alias && typeof alias === 'object' && alias.id) {
              const v = await figma.variables.getVariableByIdAsync(alias.id);
              if (v) {
                rows.push({
                  path: pathStr,
                  property: key + '[' + i + ']',
                  variable: v.name,
                  varType: v.resolvedType,
                });
              }
            }
          }
        } else if (typeof val === 'object' && val.id) {
          const v = await figma.variables.getVariableByIdAsync(val.id);
          if (v) {
            rows.push({
              path: pathStr,
              property: key,
              variable: v.name,
              varType: v.resolvedType,
            });
          }
        }
      }
    }
    if ('children' in n) {
      for (const child of n.children) await inspect(child, currentPath);
    }
  };
  await inspect(sel[0], []);
  return { selectionRoot: sel[0].name, bindingCount: rows.length, bindings: rows };
})();
