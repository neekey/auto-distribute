#!/usr/bin/env node
/**
 * Ping Google Indexing API for a site's pages.
 *
 * Reads the sitemap.xml (or scans for .html files) in the target directory
 * and sends URL_UPDATED notifications to Google's Indexing API.
 *
 * Prerequisites:
 *   1. Enable "Web Search Indexing API" in GCP Console
 *   2. Place a service account key as google-service-account.json in the
 *      project root (or set GOOGLE_APPLICATION_CREDENTIALS)
 *   3. Add the service account email as Owner in Google Search Console
 *   4. npm install google-auth-library
 *
 * Usage:
 *   node scripts/ping-indexing.mjs --dir <marketing-dir> --base-url <site-url>
 *   node scripts/ping-indexing.mjs --dir ./marketing --base-url https://www.example.com
 *   node scripts/ping-indexing.mjs --url https://www.example.com/page.html  # single URL
 *
 * Rate limit: ~200 requests/day per project.
 */

import { readdirSync, readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { GoogleAuth } from 'google-auth-library';

const INDEXING_API = 'https://indexing.googleapis.com/v3/urlNotifications:publish';

// Files to skip when scanning for HTML pages
const EXCLUDE = new Set([
  'index.html',
  'privacy.html',
  'terms.html',
  'ads.html',
  '404.html',
]);

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = { dir: null, baseUrl: null, url: null, saPath: null };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dir' && args[i + 1]) parsed.dir = args[++i];
    else if (args[i] === '--base-url' && args[i + 1]) parsed.baseUrl = args[++i];
    else if (args[i] === '--url' && args[i + 1]) parsed.url = args[++i];
    else if (args[i] === '--sa' && args[i + 1]) parsed.saPath = args[++i];
  }

  return parsed;
}

function findServiceAccount(dir) {
  // Search upward from dir for google-service-account.json
  const names = ['google-service-account.json', 'gcp-service-account.json'];
  let current = resolve(dir);
  for (let i = 0; i < 5; i++) {
    for (const name of names) {
      const path = join(current, name);
      if (existsSync(path)) return path;
    }
    const parent = resolve(current, '..');
    if (parent === current) break;
    current = parent;
  }
  return null;
}

function collectUrlsFromSitemap(dir, baseUrl) {
  const sitemapPath = join(dir, 'sitemap.xml');
  if (existsSync(sitemapPath)) {
    const content = readFileSync(sitemapPath, 'utf-8');
    const urls = [];
    const locRegex = /<loc>(.*?)<\/loc>/g;
    let match;
    while ((match = locRegex.exec(content)) !== null) {
      urls.push(match[1]);
    }
    if (urls.length > 0) {
      console.log(`Read ${urls.length} URLs from sitemap.xml`);
      return urls;
    }
  }

  // Fallback: scan for .html files
  console.log('No sitemap.xml found, scanning for .html files...');
  const htmlFiles = readdirSync(dir).filter(f => f.endsWith('.html') && !EXCLUDE.has(f));
  const urls = [
    `${baseUrl}/`,
    ...htmlFiles.map(f => `${baseUrl}/${f}`),
  ];
  return urls;
}

async function main() {
  const { dir, baseUrl, url, saPath } = parseArgs();

  // Single URL mode
  if (url) {
    const urls = [url];
    await pingUrls(urls, saPath || findServiceAccount(process.cwd()));
    return;
  }

  if (!dir || !baseUrl) {
    console.error('Usage:');
    console.error('  node ping-indexing.mjs --dir <path> --base-url <url>');
    console.error('  node ping-indexing.mjs --url <single-url>');
    console.error('');
    console.error('Options:');
    console.error('  --dir       Directory containing HTML files / sitemap.xml');
    console.error('  --base-url  Site base URL (e.g., https://www.example.com)');
    console.error('  --url       Submit a single URL');
    console.error('  --sa        Path to service account JSON (auto-detected if omitted)');
    process.exit(1);
  }

  const resolvedDir = resolve(dir);
  const sa = saPath || findServiceAccount(resolvedDir);

  if (!sa) {
    console.error('No service account found. Place google-service-account.json in your project root,');
    console.error('or pass --sa <path>.');
    process.exit(1);
  }

  const urls = collectUrlsFromSitemap(resolvedDir, baseUrl.replace(/\/$/, ''));

  // Add sitemap URL
  urls.push(`${baseUrl.replace(/\/$/, '')}/sitemap.xml`);

  // Deduplicate
  const uniqueUrls = [...new Set(urls)];
  await pingUrls(uniqueUrls, sa);
}

async function pingUrls(urls, saPath) {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && saPath) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = saPath;
  }

  console.log(`\nPinging ${urls.length} URL(s):\n`);

  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/indexing'],
  });
  const client = await auth.getClient();
  const { token } = await client.getAccessToken();

  let ok = 0, failed = 0;
  for (const url of urls) {
    try {
      const res = await fetch(INDEXING_API, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, type: 'URL_UPDATED' }),
      });
      if (res.ok) {
        ok++;
        console.log(`  ✓ ${url}`);
      } else {
        failed++;
        const text = await res.text();
        console.warn(`  ✗ ${url}: ${res.status} ${text}`);
      }
    } catch (err) {
      failed++;
      console.warn(`  ✗ ${url}: ${err.message}`);
    }
    // Rate limit: ~1 req/sec
    if (urls.indexOf(url) < urls.length - 1) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  console.log(`\nDone: ${ok} submitted, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

main().catch(err => {
  console.error('Failed:', err.message);
  process.exit(1);
});
