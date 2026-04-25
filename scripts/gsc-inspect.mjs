#!/usr/bin/env node
/**
 * Inspect URLs via the Google Search Console URL Inspection API.
 *
 * Returns the actual indexing state of each URL: whether it's indexed,
 * the coverage state ("Submitted and indexed", "Crawled - currently not indexed",
 * "Discovered - currently not indexed", etc.), last crawl time, and the
 * canonical Google chose vs. the canonical the page declared.
 *
 * Use this to diagnose why pinged URLs aren't showing up in search even though
 * the Indexing API accepted the submission.
 *
 * Prerequisites:
 *   1. Enable "Google Search Console API" in GCP Console
 *   2. Place google-service-account.json in the project root
 *   3. The service account must be a User on the GSC property
 *
 * Usage:
 *   node scripts/gsc-inspect.mjs --site https://numblr.io/ --url https://numblr.io/some-page
 *   node scripts/gsc-inspect.mjs --site https://numblr.io/ --sitemap https://numblr.io/sitemap
 *   node scripts/gsc-inspect.mjs --site https://numblr.io/ --urls-file state/urls.txt
 *   node scripts/gsc-inspect.mjs --site https://numblr.io/ --from-submissions --project ~/workspaces/numblr
 *
 * Output: prints summary to stderr, writes JSON to {project}/state/gsc-index-status.json
 *
 * Quotas: 2,000 inspections/day per property, 600/minute. Script rate-limits to ~5/sec.
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
import { GoogleAuth } from 'google-auth-library';

const INSPECT_API = 'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect';
const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const RATE_LIMIT_MS = 200; // ~5/sec

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {
    site: null,
    url: null,
    sitemap: null,
    urlsFile: null,
    fromSubmissions: false,
    project: null,
    saPath: null,
    max: null,
  };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--site' && args[i + 1]) parsed.site = args[++i];
    else if (args[i] === '--url' && args[i + 1]) parsed.url = args[++i];
    else if (args[i] === '--sitemap' && args[i + 1]) parsed.sitemap = args[++i];
    else if (args[i] === '--urls-file' && args[i + 1]) parsed.urlsFile = args[++i];
    else if (args[i] === '--from-submissions') parsed.fromSubmissions = true;
    else if (args[i] === '--project' && args[i + 1]) parsed.project = args[++i];
    else if (args[i] === '--sa' && args[i + 1]) parsed.saPath = args[++i];
    else if (args[i] === '--max' && args[i + 1]) parsed.max = parseInt(args[++i], 10);
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
  return site.endsWith('/') ? site : `${site}/`;
}

async function fetchSitemapUrls(sitemapInput) {
  let xml;
  if (sitemapInput.startsWith('http://') || sitemapInput.startsWith('https://')) {
    const res = await fetch(sitemapInput);
    if (!res.ok) throw new Error(`failed to fetch sitemap: ${res.status}`);
    xml = await res.text();
  } else {
    xml = readFileSync(resolve(sitemapInput), 'utf-8');
  }
  const urls = [];
  const re = /<loc>(.*?)<\/loc>/g;
  let m;
  while ((m = re.exec(xml)) !== null) urls.push(m[1].trim());
  return urls;
}

function readUrlsFromFile(path) {
  return readFileSync(resolve(path), 'utf-8')
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith('#'));
}

function readUrlsFromSubmissions(projectDir) {
  const path = join(projectDir, 'state', 'search-console.json');
  if (!existsSync(path)) {
    throw new Error(`no submissions file at ${path}`);
  }
  const data = JSON.parse(readFileSync(path, 'utf-8'));
  const seen = new Set();
  const urls = [];
  for (const s of data.submitted_urls || []) {
    if (s.url && !seen.has(s.url)) {
      seen.add(s.url);
      urls.push(s.url);
    }
  }
  return urls;
}

async function inspectUrl(siteUrl, inspectionUrl, token) {
  const res = await fetch(INSPECT_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ inspectionUrl, siteUrl }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${text}`);
  }
  return res.json();
}

function simplify(raw) {
  const idx = raw.inspectionResult?.indexStatusResult || {};
  return {
    verdict: idx.verdict || null, // PASS | PARTIAL | FAIL | NEUTRAL
    coverageState: idx.coverageState || null, // "Submitted and indexed", "Discovered - currently not indexed", etc.
    indexingState: idx.indexingState || null,
    robotsTxtState: idx.robotsTxtState || null,
    pageFetchState: idx.pageFetchState || null,
    lastCrawlTime: idx.lastCrawlTime || null,
    crawledAs: idx.crawledAs || null,
    googleCanonical: idx.googleCanonical || null,
    userCanonical: idx.userCanonical || null,
    referringUrls: idx.referringUrls || [],
    sitemap: idx.sitemap || [],
    inspectionResultLink: raw.inspectionResult?.inspectionResultLink || null,
  };
}

function summary(results) {
  const buckets = {};
  for (const r of results) {
    if (r.error) {
      buckets['ERROR'] = (buckets['ERROR'] || 0) + 1;
      continue;
    }
    const state = r.coverageState || 'unknown';
    buckets[state] = (buckets[state] || 0) + 1;
  }
  return buckets;
}

async function main() {
  const args = parseArgs();
  if (!args.site) {
    console.error('error: --site <url-or-sc-domain> is required');
    process.exit(1);
  }
  if (!args.url && !args.sitemap && !args.urlsFile && !args.fromSubmissions) {
    console.error('error: provide one of --url, --sitemap, --urls-file, --from-submissions');
    process.exit(1);
  }

  const projectDir = args.project ? resolve(args.project) : process.cwd();
  const saPath = args.saPath || findServiceAccount(projectDir);
  if (!saPath) {
    console.error(`error: google-service-account.json not found above ${projectDir}`);
    process.exit(1);
  }
  process.stderr.write(`Auth: ${saPath}\n`);

  let urls;
  if (args.url) urls = [args.url];
  else if (args.sitemap) urls = await fetchSitemapUrls(args.sitemap);
  else if (args.urlsFile) urls = readUrlsFromFile(args.urlsFile);
  else urls = readUrlsFromSubmissions(projectDir);

  urls = [...new Set(urls)];
  if (args.max) urls = urls.slice(0, args.max);

  process.stderr.write(`Inspecting ${urls.length} URL(s)...\n\n`);

  const auth = new GoogleAuth({ keyFile: saPath, scopes: [SCOPE] });
  const client = await auth.getClient();
  const { token } = await client.getAccessToken();
  if (!token) {
    console.error('error: failed to get access token');
    process.exit(1);
  }

  const site = normalizeSite(args.site);
  const results = [];
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    try {
      const raw = await inspectUrl(site, url, token);
      const s = simplify(raw);
      results.push({ url, ...s });
      const verdict = s.verdict === 'PASS' ? '✓' : s.verdict === 'FAIL' ? '✗' : '·';
      process.stderr.write(`  ${verdict} ${url}\n      → ${s.coverageState || '(no state)'}\n`);
    } catch (err) {
      results.push({ url, error: err.message });
      process.stderr.write(`  ! ${url}\n      → ERROR: ${err.message}\n`);
    }
    if (i < urls.length - 1) await new Promise((r) => setTimeout(r, RATE_LIMIT_MS));
  }

  const output = {
    site,
    generatedAt: new Date().toISOString(),
    summary: summary(results),
    results,
  };

  const stateDir = join(projectDir, 'state');
  mkdirSync(stateDir, { recursive: true });
  const outPath = join(stateDir, 'gsc-index-status.json');
  writeFileSync(outPath, JSON.stringify(output, null, 2));

  process.stderr.write(`\nSummary:\n`);
  for (const [k, v] of Object.entries(output.summary).sort((a, b) => b[1] - a[1])) {
    process.stderr.write(`  ${v.toString().padStart(3)}  ${k}\n`);
  }
  process.stderr.write(`\nWrote ${outPath}\n`);

  console.log(JSON.stringify(output, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
