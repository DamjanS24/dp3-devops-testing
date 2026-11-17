// Coverage gate.
//
// Block 3 runs the unit tests and writes the coverage report. This script is
// block 4, the gate that judges it. The two are deliberately separate: a
// threshold that is enforced inside the test run shows up as a test failure,
// which hides what actually went wrong. Here a red block 4 means one thing
// only, the code is not covered well enough.
//
// Runs locally too:  npm run coverage && npm run coverage:gate

import { readFileSync, appendFileSync } from 'node:fs';

const THRESHOLDS = { lines: 90, functions: 90, branches: 85, statements: 90 };
const REPORT = 'coverage/coverage-summary.json';

let report;
try {
  report = JSON.parse(readFileSync(REPORT, 'utf8'));
} catch {
  console.error(`Cannot read ${REPORT}. Run the unit tests with coverage first.`);
  process.exit(1);
}

const total = report.total;
if (!total) {
  console.error(`${REPORT} has no "total" section, so there is nothing to judge.`);
  process.exit(1);
}

const rows = [];
let closed = false;

for (const [metric, minimum] of Object.entries(THRESHOLDS)) {
  const measured = total[metric]?.pct;
  if (typeof measured !== 'number') {
    rows.push(['LOW', metric, 'not measured', `${minimum}%`]);
    closed = true;
    continue;
  }
  const ok = measured >= minimum;
  if (!ok) closed = true;
  rows.push([ok ? 'ok' : 'LOW', metric, `${measured.toFixed(2)}%`, `${minimum}%`]);
}

for (const [state, metric, measured, minimum] of rows) {
  console.log(`${state.padEnd(4)} ${metric.padEnd(11)} ${measured.padStart(12)}   minimum ${minimum}`);
}

if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, [
    '### Coverage gate',
    '',
    '| | metric | measured | minimum |',
    '| --- | --- | --- | --- |',
    ...rows.map(([s, m, v, min]) => `| ${s} | ${m} | ${v} | ${min} |`),
    '',
    'Measured on `src/quote.ts` only. The render layer is covered by the browser',
    'tests in block 3, which is not something unit coverage can measure.',
    '',
    'Coverage is a signal, not a goal. It says every line ran once, not that the',
    'behaviour is right.',
    ''
  ].join('\n'));
}

if (closed) {
  console.error('\nCoverage is below the agreed minimum. The gate is closed.');
  process.exit(1);
}
console.log('\nCoverage meets the agreed minimum.');
