#!/usr/bin/env node
import { readFileSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const file = process.argv[2];
if (!file) {
  console.error('Usage: node scripts/run-eval-file.mjs <file.js>');
  process.exit(1);
}

const code = readFileSync(file, 'utf8');
const tokenPath = join(homedir(), '.mahoraga', '.mahoraga-token');
const token = existsSync(tokenPath) ? readFileSync(tokenPath, 'utf8').trim() : '';

const res = await fetch('http://127.0.0.1:3456/exec', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    ...(token ? { 'X-Mahoraga-Token': token } : {}),
  },
  body: JSON.stringify({ action: 'eval', code }),
  signal: AbortSignal.timeout(120000),
});

const text = await res.text();
let data;
try {
  data = JSON.parse(text);
} catch {
  console.error(text);
  process.exit(1);
}

if (data.error) {
  console.error('Error:', data.error);
  process.exit(1);
}

console.log(typeof data.result === 'object' ? JSON.stringify(data.result, null, 2) : data.result);
