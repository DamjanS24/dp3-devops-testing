// Performance and accessibility budget.
//
// Performance and accessibility are required knowledge in my profile, so they
// are a budget here and not a good intention. Under the minimum, the block
// goes red.

import { readFileSync, appendFileSync } from 'node:fs';

const BUDGET = {
  performance: 0.9,
  accessibility: 1.0,
  'best-practices': 0.9,
  seo: 0.85
};

const report = process.argv[2] ?? 'lighthouse.json';

let categories;
try {
  categories = JSON.parse(readFileSync(report, 'utf8')).categories;
} catch {
  console.error(`Cannot read ${report}.`);
  process.exit(1);
}

const rows = [];
let over = false;

for (const [name, minimum] of Object.entries(BUDGET)) {
  const score = categories[name]?.score;
  if (typeof score !== 'number') {
    rows.push(['LOW', name, 'not measured', Math.round(minimum * 100)]);
    over = true;
    continue;
  }
  const ok = score >= minimum;
  if (!ok) over = true;
  rows.push([ok ? 'ok' : 'LOW', name, Math.round(score * 100), Math.round(minimum * 100)]);
}

for (const [state, name, score, minimum] of rows) {
  console.log(`${state.padEnd(4)} ${name.padEnd(15)} ${String(score).padStart(12)}   minimum ${minimum}`);
}

if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, [
    '### Performance and accessibility budget',
    '',
    '| | category | score | minimum |',
    '| --- | --- | --- | --- |',
    ...rows.map(([s, n, v, m]) => `| ${s} | ${n} | ${v} | ${m} |`),
    ''
  ].join('\n'));
}

if (over) {
  console.error('\nAt least one category is under budget.');
  process.exit(1);
}
console.log('\nEvery category is within budget.');
