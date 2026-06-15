#!/usr/bin/env node
/**
 * Compliance gate: fails (exit 1) if any banned term appears in shipped, user-facing copy.
 * Keep BANNED list in sync with src/data/bodyCareSafety.ts. Run: node scripts/check-banned-terms.mjs
 * Source: review-5-agents-plus-size-2026-06.md (GUARD-1).
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const BANNED = [
  'weight loss', 'weight-loss', 'lose weight', 'bmi', 'calorie',
  'ozempic', 'glp-1', 'glp1', 'semaglutide', 'wegovy',
  'obese', 'obesity', 'slim down', 'slimming',
  'problem area', 'double chin',
  'antifungal', 'anti-fungal', 'clotrimazole', 'miconazole', 'pyrithione',
];

// User-facing copy lives in screens (app/) and the copy/plan data files.
const ROOTS = ['app', 'src/data', 'src/services/glowPlan.ts', 'src/components'];
const SKIP = ['bodyCareSafety.ts', 'check-banned-terms.mjs']; // these legitimately contain the list

function walk(p, out) {
  const s = statSync(p);
  if (s.isDirectory()) { for (const f of readdirSync(p)) walk(join(p, f), out); return; }
  if (['.ts', '.tsx'].includes(extname(p)) && !SKIP.some((x) => p.endsWith(x))) out.push(p);
}

const files = [];
for (const r of ROOTS) { try { walk(r, files); } catch {} }

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const PATTERNS = BANNED.map((t) => ({ term: t, re: new RegExp(`\\b${esc(t)}\\b`, 'i') }));

let hits = 0;
for (const f of files) {
  const lines = readFileSync(f, 'utf8').split('\n');
  lines.forEach((line, i) => {
    for (const { term, re } of PATTERNS) {
      if (re.test(line)) { console.log(`  ${f}:${i + 1}  "${term}"  ->  ${line.trim().slice(0, 90)}`); hits++; }
    }
  });
}

if (hits) { console.error(`\nFAIL: ${hits} banned-term hit(s) in shipped copy.`); process.exit(1); }
console.log('OK: no banned terms in shipped copy.');
