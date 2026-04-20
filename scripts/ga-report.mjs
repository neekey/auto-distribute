#!/usr/bin/env node
/**
 * Pull GA4 reports via the Data API.
 *
 * Prerequisites:
 *   1. Enable "Google Analytics Data API" in GCP Console
 *   2. Place google-service-account.json in the project root (reusable — same
 *      account used for Indexing API / GSC works if granted Viewer on the GA4 property)
 *   3. In GA4 Admin → Property Access Management, add the service account email
 *      as a Viewer on the target property
 *
 * Usage:
 *   node scripts/ga-report.mjs --property 123456789 [--days 28] [--project <path>]
 *   node scripts/ga-report.mjs --property 123456789 --report landing-pages
 *
 * Output: prints JSON to stdout AND writes to {project}/state/ga-report.json
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { GoogleAuth } from 'google-auth-library';

const DATA_API = 'https://analyticsdata.googleapis.com/v1beta/properties';
const SCOPE = 'https://www.googleapis.com/auth/analytics.readonly';

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = { property: null, days: 28, report: 'all', project: null, saPath: null };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--property' && args[i + 1]) parsed.property = args[++i];
    else if (args[i] === '--days' && args[i + 1]) parsed.days = parseInt(args[++i], 10);
    else if (args[i] === '--report' && args[i + 1]) parsed.report = args[++i];
    else if (args[i] === '--project' && args[i + 1]) parsed.project = args[++i];
    else if (args[i] === '--sa' && args[i + 1]) parsed.saPath = args[++i];
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

function dateRange(days) {
  const end = new Date();
  const start = new Date();
  start.setUTCDate(end.getUTCDate() - days);
  const iso = (d) => d.toISOString().slice(0, 10);
  return { startDate: iso(start), endDate: iso(end) };
}

const REPORTS = {
  'landing-pages': {
    dimensions: ['landingPage', 'pageTitle'],
    metrics: [
      'sessions',
      'engagedSessions',
      'engagementRate',
      'averageSessionDuration',
      'bounceRate',
      'conversions',
    ],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 50,
  },
  'source-medium': {
    dimensions: ['sessionSource', 'sessionMedium'],
    metrics: ['sessions', 'engagedSessions', 'engagementRate', 'conversions'],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 50,
  },
  'ai-referrers': {
    dimensions: ['sessionSource'],
    metrics: ['sessions', 'engagedSessions', 'engagementRate'],
    // Match any source whose host looks like an AI assistant referrer
    dimensionFilter: {
      filter: {
        fieldName: 'sessionSource',
        stringFilter: {
          matchType: 'PARTIAL_REGEXP',
          value: 'chatgpt|openai|perplexity|claude|anthropic|gemini|bard|copilot|you\\.com|phind|bing\\.ai|duckduckgo\\.ai',
          caseSensitive: false,
        },
      },
    },
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 50,
  },
  'conversions': {
    dimensions: ['eventName'],
    metrics: ['eventCount', 'conversions', 'totalUsers'],
    dimensionFilter: {
      filter: {
        fieldName: 'isConversionEvent',
        stringFilter: { matchType: 'EXACT', value: 'true' },
      },
    },
    orderBys: [{ metric: { metricName: 'conversions' }, desc: true }],
    limit: 50,
  },
  'summary': {
    dimensions: [],
    metrics: [
      'sessions',
      'totalUsers',
      'newUsers',
      'engagedSessions',
      'engagementRate',
      'averageSessionDuration',
      'bounceRate',
      'screenPageViews',
      'conversions',
    ],
    limit: 1,
  },
};

async function runReport(property, token, reportName, spec, range) {
  const body = {
    dateRanges: [range],
    dimensions: spec.dimensions.map((name) => ({ name })),
    metrics: spec.metrics.map((name) => ({ name })),
    limit: spec.limit,
  };
  if (spec.orderBys) body.orderBys = spec.orderBys;
  if (spec.dimensionFilter) body.dimensionFilter = spec.dimensionFilter;

  const url = `${DATA_API}/${property}:runReport`;
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
    throw new Error(`${reportName} failed (${res.status}): ${text}`);
  }
  const json = await res.json();
  return normalize(json, spec);
}

function normalize(raw, spec) {
  const rows = (raw.rows || []).map((row) => {
    const obj = {};
    (row.dimensionValues || []).forEach((v, i) => {
      obj[spec.dimensions[i]] = v.value;
    });
    (row.metricValues || []).forEach((v, i) => {
      const name = spec.metrics[i];
      const num = Number(v.value);
      obj[name] = Number.isFinite(num) ? num : v.value;
    });
    return obj;
  });
  return {
    rowCount: raw.rowCount || 0,
    rows,
  };
}

async function main() {
  const args = parseArgs();
  if (!args.property) {
    console.error('error: --property <ga4-property-id> is required');
    process.exit(1);
  }

  const projectDir = args.project ? resolve(args.project) : process.cwd();
  const saPath = args.saPath || findServiceAccount(projectDir);
  if (!saPath) {
    console.error(`error: google-service-account.json not found above ${projectDir}`);
    process.exit(1);
  }

  const auth = new GoogleAuth({ keyFile: saPath, scopes: [SCOPE] });
  const client = await auth.getClient();
  const { token } = await client.getAccessToken();
  if (!token) {
    console.error('error: failed to get access token from service account');
    process.exit(1);
  }

  const range = dateRange(args.days);
  const reports = args.report === 'all' ? Object.keys(REPORTS) : [args.report];

  const output = {
    property: args.property,
    generatedAt: new Date().toISOString(),
    dateRange: range,
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
      output.reports[name] = await runReport(args.property, token, name, spec, range);
      process.stderr.write(`${output.reports[name].rows.length} rows\n`);
    } catch (err) {
      output.reports[name] = { error: err.message };
      process.stderr.write(`ERROR: ${err.message}\n`);
    }
  }

  const stateDir = join(projectDir, 'state');
  mkdirSync(stateDir, { recursive: true });
  const outPath = join(stateDir, 'ga-report.json');
  writeFileSync(outPath, JSON.stringify(output, null, 2));
  process.stderr.write(`Wrote ${outPath}\n`);

  console.log(JSON.stringify(output, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
