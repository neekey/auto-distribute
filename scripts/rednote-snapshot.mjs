#!/usr/bin/env node
// Snapshot the currently-active Rednote tab in the attached Chrome.
// Finds the most recently-used tab whose URL contains "rednote.com" or "xiaohongshu"
// and dumps URL, title, note links, and a screenshot. Run this any time during
// manual exploration to capture what you're looking at.

import { chromium } from 'playwright-core';
import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const CDP_URL = 'http://localhost:9222';

async function main() {
  const browser = await chromium.connectOverCDP(CDP_URL);
  const contexts = browser.contexts();
  const allPages = contexts.flatMap((c) => c.pages());
  const rednotePages = allPages.filter((p) => /rednote\.com|xiaohongshu/i.test(p.url()));

  if (rednotePages.length === 0) {
    console.error(`No Rednote tab found. Open one in Chrome first.`);
    console.error(`Tabs currently open: ${allPages.length}`);
    allPages.forEach((p) => console.error(`  - ${p.url()}`));
    await browser.close();
    process.exit(1);
  }

  const page = rednotePages[rednotePages.length - 1];
  const url = page.url();
  const title = await page.title();
  console.log(`Snapshotting: ${url}`);
  console.log(`Title: ${title}`);

  const probe = await page.evaluate(() => {
    const noteAnchors = Array.from(document.querySelectorAll('a[href*="/explore/"], a[href*="/discovery/item/"], a[href*="/search_result/"]'));
    const seen = new Set();
    const notes = [];
    for (const a of noteAnchors) {
      const clean = a.href.split('?')[0];
      if (seen.has(clean)) continue;
      seen.add(clean);
      const card = a.closest('section, article, div[class*="note"], div[class*="item"], div[class*="card"]');
      const cardText = card?.innerText?.trim().slice(0, 300) || '';
      notes.push({ url: a.href, cleanUrl: clean, cardText });
      if (notes.length >= 30) break;
    }
    const searchInput = document.querySelector('input[type="search"], input[placeholder*="搜"], input[placeholder*="Search"]');
    return {
      pathname: location.pathname,
      search: location.search,
      notes,
      hasSearchInput: !!searchInput,
      searchInputPlaceholder: searchInput?.placeholder || null,
      bodyPreview: document.body?.innerText?.slice(0, 800) || '',
    };
  });

  const stateDir = path.join(projectRoot, 'state');
  if (!existsSync(stateDir)) await mkdir(stateDir, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const base = path.join(stateDir, `rednote-snap-${ts}`);

  await page.screenshot({ path: `${base}.png`, fullPage: false });
  const html = await page.content();
  await writeFile(`${base}.html`, html, 'utf-8');
  await writeFile(`${base}.json`, JSON.stringify({ url, title, ...probe }, null, 2), 'utf-8');

  console.log(`\nPathname: ${probe.pathname}`);
  console.log(`Search: ${probe.search || '(none)'}`);
  console.log(`Notes found: ${probe.notes.length}`);
  console.log(`Search input present: ${probe.hasSearchInput} (placeholder: ${probe.searchInputPlaceholder || 'n/a'})`);
  console.log(`\nSample notes:`);
  probe.notes.slice(0, 6).forEach((n, i) => {
    console.log(`  ${i + 1}. ${n.cleanUrl}`);
    if (n.cardText) console.log(`     ${n.cardText.replace(/\s+/g, ' ').slice(0, 140)}`);
  });
  console.log(`\nSaved: ${base}.{png,html,json}`);
  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
