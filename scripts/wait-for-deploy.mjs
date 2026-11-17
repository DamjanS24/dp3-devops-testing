// Waiting for a deploy to actually land.
//
// A deploy step that reports success is not the same thing as a site that
// serves the new version. GitHub Pages publishes through a CDN, so there is a
// gap between "the deploy finished" and "a visitor gets the new files".
//
// Every build writes the commit it came from into version.txt. This polls the
// live site until that file hands back the commit we just shipped, so the
// checks that follow are running against the new release and not against the
// cached old one.
//
//   node scripts/wait-for-deploy.mjs <site url> <expected commit sha>

const [site, expected] = process.argv.slice(2);

if (!site || !expected) {
  console.error('Usage: node scripts/wait-for-deploy.mjs <site url> <expected sha>');
  process.exit(1);
}

const ATTEMPTS = 30;
const DELAY_MS = 6000;
const base = site.endsWith('/') ? site : `${site}/`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
  // The query string defeats any cache between here and the origin.
  const url = `${base}version.txt?cachebust=${Date.now()}`;
  let served = null;
  let status = 0;

  try {
    const response = await fetch(url, { cache: 'no-store', redirect: 'follow' });
    status = response.status;
    if (response.ok) served = (await response.text()).trim();
  } catch (error) {
    status = `error, ${error.message}`;
  }

  if (served === expected) {
    console.log(`The site is serving ${expected} after ${attempt} attempt(s).`);
    process.exit(0);
  }

  console.log(
    `attempt ${attempt} of ${ATTEMPTS}, http ${status}` +
    (served ? `, serving ${served}` : '') +
    `, waiting for ${expected}`
  );
  if (attempt < ATTEMPTS) await sleep(DELAY_MS);
}

console.error(`\nThe site never served ${expected} within ${(ATTEMPTS * DELAY_MS) / 1000} seconds.`);
process.exit(1);
