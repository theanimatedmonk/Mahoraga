#!/usr/bin/env node
/** @deprecated Use scripts/export-flavour-knowledge-base.mjs */
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sectionId = process.argv[2] || '6622:22005';
const r = spawnSync(
  process.execPath,
  ['scripts/export-flavour-knowledge-base.mjs', '--name', 'Breaking News app', '--section', sectionId],
  { cwd: root, stdio: 'inherit' }
);
process.exit(r.status ?? 1);
