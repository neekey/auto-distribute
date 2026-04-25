#!/usr/bin/env node
/**
 * Pull Google Search Console performance data via the Search Analytics API.
 *
 * Prerequisites:
 *   1. Enable "Google Search Console API" in GCP Console
 *      (also called "Search Console API"; distinct from the Indexing API)
 *   2. Place google-service-account.json in the project root (reusable —
 *      the same account used for Indexing API works if it's an Owner on the GSC property)
 *   3. The service account's email must be added as a User on the GSC property
 *      (Owner is fine — it's already required for the Indexing API)
 *
 * Usage:
 *   node scripts/gsc-report.mjs --site https://numblr.io/ [--days 90] [--compare]
 *   node scripts/gsc-report.mjs --site sc-domain:numblr.io --report queries
 *   node scripts/gsc-report.mjs --site https://numblr.io/ --project ~/workspaces/numblr
 *
 * Output: prints JSON to stdout AND writes to {project}/state/gsc-report.json
 *
 * Notes:
 *   - Site URL format: URL-prefix properties end in '/', domain properties are 'sc-domain:example.com'
 *   - GSC API returns slightly fewer rows than the UI (anonymized queries excluded)
 *   - Data has ~2-day delay; querying yesterday usually returns partial data
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { GoogleAuth } from 'google-auth-library';

const SEARCH_ANALYTICS_API = 'https://www.googleapis.com/webmasters/v3/sites';
const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {
    site: null,
    days: 90,
    report: 'all',
    project: null,
    saPath: null,
    compare: false,
    limit: 250,
  };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--site' && args[i + 1]) parsed.site = args[++i];
    else if (args[i] === '--days' && args[i + 1]) parsed.days = parseInt(args[++i], 10);
    else if (args[i] === '--report' && args[i + 1]) parsed.report = args[++i];
    else if (args[i] === '--project' && args[i + 1]) parsed.project = args[++i];
    else if (args[i] === '--sa' && args[i + 1]) parsed.saPath = args[++i];
    else if (args[i] === '--limit' && args[i + 1]) parsed.limit = parseInt(args[++i], 10);
    else if (args[i] === '--compare') parsed.compare = true;
  }
  return parsed;
}

function findServiceAccount(startDir) {
  const names = ['google-service-account.json', 'gcp-service-account.json'];
  let current = resolve(startDir);
  for (let i = 0; i < 6; i++) {
    for (const name of names) {
      const p = join(current, name);
      if (existsSync(p)) return p;
    }
    const parent = resolve(current, '..');
    if (parent === current) break;
    current = parent;
  }
  return null;
}

function normalizeSite(site) {
  if (site.startsWith('sc-domain:')) return site;
  // URL-prefix properties must end in /
  return site.endsWith('/') ? site : `${site}/`;
}

function dateRange(days, offsetDays = 0) {
  // GSC has ~2-day reporting delay. Default end = today - 2 to avoid partial-day rows.
  const lag = 2;
  const end = new Date();
  end.setUTCDate(end.getUTCDate() - lag - offsetDays);
  const start = new Date(end);
  start.setUTCDate(end.getUTCDate() - days + 1);
  const iso = (d) => d.toISOString().slice(0, 10);
  return { startDate: iso(start), endDate: iso(end) };
}

const REPORTS = {
  summary: { dimensions: [], rowLimit: 1 },
  queries: { dimensions: ['query'] },
  pages: { dimensions: ['page'] },
  'query-page': { dimensions: ['query', 'page'] },
  countries: { dimensions: ['country'] },
  devices: { dimensions: ['device'] },
};

async function runReport(site, token, spec, range, limit) {
  const url = `${SEARCH_ANALYTICS_API}/${encodeURIComponent(site)}/searchAnalytics/query`;
  const body = {
    startDate: range.startDate,
    endDate: range.endDate,
    dimensions: spec.dimensions,
    rowLimit: spec.rowLimit || limit,
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${text}`);
  }
  const json = await res.json();
  return normalize(json, spec);
}

function normalize(raw, spec) {
  const rows = (raw.rows || []).map((row) => {
    const obj = {};
    (row.keys || []).forEach((v, i) => {
      obj[spec.dimensions[i]] = v;
    });
    obj.clicks = row.clicks || 0;
    obj.impressions = row.impressions || 0;
    obj.ctr = row.ctr || 0;
    obj.position = row.position || 0;
    return obj;
  });
  return { rowCount: rows.length, rows };
}

function diff(current, previous) {
  // Diff summary metrics (single-row reports)
  if (!current.rows[0] || !previous.rows[0]) return null;
  const c = current.rows[0];
  const p = previous.rows[0];
  return {
    clicks: { current: c.clicks, previous: p.clicks, delta: c.clicks - p.clicks },
    impressions: {
      current: c.impressions,
      previous: p.impressions,
      delta: c.impressions - p.impressions,
    },
    ctr: { current: c.ctr, previous: p.ctr, delta: c.ctr - p.ctr },
    position: { current: c.position, previous: p.position, delta: c.position - p.position },
  };
}

async function main() {
  const args = parseArgs();
  if (!args.site) {
    console.error('error: --site <url-or-sc-domain> is required');
    console.error('  URL-prefix property: --site https://example.com/');
    console.error('  Domain property:     --site sc-domain:example.com');
    process.exit(1);
  }

  const projectDir = args.project ? resolve(args.project) : process.cwd();
  const saPath = args.saPath || findServiceAccount(projectDir);
  if (!saPath) {
    console.error(`error: google-service-account.json not found above ${projectDir}`);
    console.error('Pass --sa <path> or run from inside the project directory.');
    process.exit(1);
  }
  process.stderr.write(`Auth: ${saPath}\n`);

  const auth = new GoogleAuth({ keyFile: saPath, scopes: [SCOPE] });
  const client = await auth.getClient();
  const { token } = await client.getAccessToken();
  if (!token) {
    console.error('error: failed to get access token');
    process.exit(1);
  }

  const site = normalizeSite(args.site);
  const range = dateRange(args.days);
  const previous = args.compare ? dateRange(args.days, args.days) : null;

  const reports = args.report === 'all' ? Object.keys(REPORTS) : [args.report];

  const output = {
    site,
    generatedAt: new Date().toISOString(),
    dateRange: range,
    previousRange: previous,
    reports: {},
  };

  for (const name of reports) {
    const spec = REPORTS[name];
    if (!spec) {
      console.error(`error: unknown report "${name}". Valid: ${Object.keys(REPORTS).join(', ')}`);
      process.exit(1);
    }
    process.stderr.write(`Running ${name}... `);
    try {
      const current = await runReport(site, token, spec, range, args.limit);
      const entry = { ...current };
      if (args.compare) {
        const prev = await runReport(site, token, spec, previous, args.limit);
        entry.previous = prev;
        if (name === 'summary') entry.diff = diff(current, prev);
      }
      output.reports[name] = entry;
      process.stderr.write(`${current.rows.length} rows\n`);
    } catch (err) {
      output.reports[name] = { error: err.message };
      process.stderr.write(`ERROR: ${err.message}\n`);
    }
  }

  const stateDir = join(projectDir, 'state');
  mkdirSync(stateDir, { recursive: true });
  const outPath = join(stateDir, 'gsc-report.json');
  writeFileSync(outPath, JSON.stringify(output, null, 2));
  process.stderr.write(`Wrote ${outPath}\n`);

  console.log(JSON.stringify(output, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
