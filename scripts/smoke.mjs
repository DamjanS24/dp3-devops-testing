// Smoke check against a live site.
//
// The full browser suite already ran against staging in block 5. This asks the
// narrower question that only production can answer: did the files actually
// arrive, and does the browser get them when it asks.
//
// That is deliberately not a repeat of the tests. The failure this is here for
// is a release whose assets went missing somewhere between the build and the
// host. Every check before the deploy looks at the files on the runner, so none
// of them can see it. This one can, because it asks the real server.
//
//   node scripts/smoke.mjs <site url>

const site = process.argv[2];

if (!site) {
  console.error('Usage: node scripts/smoke.mjs <site url>');
  process.exit(1);
}

const base = site.endsWith('/') ? site : `${site}/`;
const results = [];
let failed = false;

function record(ok, what, detail) {
  if (!ok) failed = true;
  results.push({ ok, what, detail });
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}${detail ? ` — ${detail}` : ''}`);
}

// 1. The page itself.
let html = '';
try {
  const response = await fetch(base, { cache: 'no-store' });
  html = await response.text();
  record(response.ok, 'the page responds', `http ${response.status}`);
  record(
    (response.headers.get('content-type') ?? '').includes('html'),
    'the page is served as html',
    response.headers.get('content-type') ?? 'no content-type'
  );
} catch (error) {
  record(false, 'the page responds', error.message);
}

// 2. The app shell is really in the html and not an error page from the host.
record(
  html.includes('data-testid="quote-tekst"'),
  'the html contains the app shell'
);

// 3. Every asset the page asks for. This is the check that matters: a page can
//    come back with http 200 and still be broken because the files it points at
//    were never uploaded.
const referenced = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
  .map((match) => match[1])
  .filter((value) => !value.startsWith('data:') && !value.startsWith('#'))
  .filter((value) => /\.(js|css|mjs|svg|png|webp|woff2?)$/i.test(value));

const assets = [...new Set(referenced)];
record(
  assets.some((value) => /\.(js|mjs)$/i.test(value)),
  'the page references at least one script',
  `${assets.length} asset(s) found`
);

for (const asset of assets) {
  const url = new URL(asset, base).toString();
  try {
    const response = await fetch(url, { cache: 'no-store' });
    const body = await response.arrayBuffer();
    record(
      response.ok && body.byteLength > 0,
      `asset loads, ${asset}`,
      `http ${response.status}, ${body.byteLength} bytes`
    );
  } catch (error) {
    record(false, `asset loads, ${asset}`, error.message);
  }
}

if (process.env.GITHUB_STEP_SUMMARY) {
  const { appendFileSync } = await import('node:fs');
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, [
    '### Production smoke check',
    '',
    `Site: ${base}`,
    '',
    '| | check | detail |',
    '| --- | --- | --- |',
    ...results.map((r) => `| ${r.ok ? 'ok' : 'FAIL'} | ${r.what} | ${r.detail ?? ''} |`),
    ''
  ].join('\n'));
}

if (failed) {
  console.error('\nThe live site is not healthy. Rolling back.');
  process.exit(1);
}
console.log(`\nAll ${results.length} checks passed against ${base}`);
