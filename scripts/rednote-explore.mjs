#!/usr/bin/env node
// Experiment: attach to running Chrome via CDP, open rednote.com/explore,
// dump what's visible. Chrome must be launched with --remote-debugging-port=9222.

import { chromium } from 'playwright-core';
import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const CDP_URL = 'http://localhost:9222';
const TARGET_URL = 'https://www.rednote.com/explore';

async function main() {
  console.log(`Attaching to Chrome at ${CDP_URL}...`);
  let browser;
  try {
    browser = await chromium.connectOverCDP(CDP_URL);
  } catch (err) {
    console.error(`\nFailed to attach. Is Chrome running with --remote-debugging-port=9222?`);
    console.error(`\nTo fix: fully quit Chrome (Cmd+Q), then run:`);
    console.error(`  open -na "Google Chrome" --args --remote-debugging-port=9222`);
    console.error(`\nOriginal error: ${err.message}`);
    process.exit(1);
  }

  const contexts = browser.contexts();
  console.log(`Connected. Found ${contexts.length} context(s).`);
  const context = contexts[0];
  if (!context) {
    console.error('No browser contexts found. Open at least one Chrome window first.');
    process.exit(1);
  }

  console.log(`Opening new tab: ${TARGET_URL}`);
  const page = await context.newPage();

  // Track navigations (in case of redirect to login / region gate)
  page.on('framenavigated', (frame) => {
    if (frame === page.mainFrame()) {
      console.log(`  navigated -> ${frame.url()}`);
    }
  });

  try {
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  } catch (err) {
    console.error(`Navigation error: ${err.message}`);
  }

  // Wait for network to settle a bit
  await page.waitForTimeout(4000);

  const finalUrl = page.url();
  const title = await page.title();
  console.log(`\nFinal URL: ${finalUrl}`);
  console.log(`Title: ${title}`);

  // Save a screenshot + HTML for inspection
  const stateDir = path.join(projectRoot, 'state');
  if (!existsSync(stateDir)) await mkdir(stateDir, { recursive: true });

  const screenshotPath = path.join(stateDir, 'rednote-explore.png');
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log(`Screenshot: ${screenshotPath}`);

  const html = await page.content();
  const htmlPath = path.join(stateDir, 'rednote-explore.html');
  await writeFile(htmlPath, html, 'utf-8');
  console.log(`HTML: ${htmlPath} (${(html.length / 1024).toFixed(1)} KB)`);

  // Heuristic probe: look for common feed-item patterns
  const probe = await page.evaluate(() => {
    const results = {
      hasLoginWall: false,
      hasCaptcha: false,
      bodyText: document.body?.innerText?.slice(0, 500) || '',
      anchorCount: document.querySelectorAll('a').length,
      imgCount: document.querySelectorAll('img').length,
      noteLinks: [],
    };
    // Rednote note URLs typically look like /explore/<id> or /discovery/item/<id>
    const anchors = Array.from(document.querySelectorAll('a[href*="/explore/"], a[href*="/discovery/item/"]'));
    results.noteLinks = anchors.slice(0, 20).map((a) => ({
      href: a.href,
      text: (a.innerText || '').trim().slice(0, 100),
    }));
    const bodyLower = (document.body?.innerText || '').toLowerCase();
    if (bodyLower.includes('登录') || bodyLower.includes('log in') || bodyLower.includes('sign in')) {
      results.hasLoginWall = true;
    }
    if (bodyLower.includes('captcha') || bodyLower.includes('验证')) {
      results.hasCaptcha = true;
    }
    return results;
  });

  console.log(`\n--- Page probe ---`);
  console.log(`Anchors: ${probe.anchorCount}, Images: ${probe.imgCount}`);
  console.log(`Login wall detected: ${probe.hasLoginWall}`);
  console.log(`Captcha detected: ${probe.hasCaptcha}`);
  console.log(`Note links found: ${probe.noteLinks.length}`);
  if (probe.noteLinks.length > 0) {
    console.log(`Sample note links:`);
    probe.noteLinks.slice(0, 5).forEach((l) => console.log(`  - ${l.href}  "${l.text}"`));
  }
  console.log(`\nBody text preview:\n${probe.bodyText}\n---`);

  const reportPath = path.join(stateDir, 'rednote-explore-probe.json');
  await writeFile(reportPath, JSON.stringify({ finalUrl, title, ...probe }, null, 2), 'utf-8');
  console.log(`Probe report: ${reportPath}`);

  // Leave the tab open so user can inspect
  console.log(`\nLeaving tab open for inspection. Re-run this script to re-probe.`);
  await browser.close(); // detach but does not close Chrome
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
