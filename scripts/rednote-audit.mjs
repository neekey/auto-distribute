#!/usr/bin/env node
// Audit Rednote opportunity for a product by running a list of search queries,
// extracting top results + engagement, and producing a summary report.
// Requires Chrome attached via CDP at localhost:9222.

import { chromium } from 'playwright-core';
import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const CDP_URL = 'http://localhost:9222';

// Numblr-relevant queries. Mix of Chinese and English, direct brand search, and adjacent topics.
const QUERIES = [
  { q: '英语数字听力', tag: 'numbers-listening' },
  { q: '英语数字听力训练', tag: 'numbers-listening-practice' },
  { q: '英文数字读法', tag: 'how-to-read-numbers' },
  { q: '雅思数字听力', tag: 'ielts-numbers' },
  { q: '英语听力练习', tag: 'english-listening-broad' },
  { q: '英语零基础数字', tag: 'beginner-numbers' },
  { q: '数字英语', tag: 'numbers-english' },
  { q: 'numblr', tag: 'brand-direct' },
  { q: 'Numblr', tag: 'brand-cap' },
];

function parseCardText(text) {
  // Format observed: "<title>\n<author>\n<date>\n<likes>" (likes is last numeric token)
  const lines = (text || '').split('\n').map((s) => s.trim()).filter(Boolean);
  if (lines.length < 2) return { title: text, author: null, date: null, likes: null };
  const title = lines[0];
  const author = lines[1] || null;
  const date = lines[2] || null;
  // Likes can be "1437" or "1.2万" (10k). Keep raw and parsed.
  const likesRaw = lines[lines.length - 1] || null;
  let likes = null;
  if (likesRaw) {
    if (/^\d+$/.test(likesRaw)) likes = parseInt(likesRaw, 10);
    else if (/^[\d.]+万$/.test(likesRaw)) likes = Math.round(parseFloat(likesRaw) * 10000);
    else if (/^[\d.]+k$/i.test(likesRaw)) likes = Math.round(parseFloat(likesRaw) * 1000);
  }
  return { title, author, date, likesRaw, likes };
}

async function searchQuery(page, query) {
  const url = `https://www.rednote.com/search_result?keyword=${encodeURIComponent(query)}&source=web_explore_feed`;
  console.log(`\n[${query}] ${url}`);
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  } catch (e) {
    console.log(`  navigation timeout: ${e.message}`);
  }
  await page.waitForTimeout(3500);

  // Scroll once to load more results
  await page.evaluate(() => window.scrollBy(0, 800));
  await page.waitForTimeout(1500);

  const result = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll('a[href*="/explore/"], a[href*="/search_result/"]'));
    const seen = new Set();
    const notes = [];
    for (const a of anchors) {
      const m = a.href.match(/\/(?:explore|search_result)\/([a-f0-9]+)/);
      if (!m) continue;
      const id = m[1];
      if (seen.has(id)) continue;
      const card = a.closest('section, article, div[class*="note"], div[class*="item"], div[class*="card"]');
      const cardText = card?.innerText?.trim() || '';
      if (!cardText) continue;
      seen.add(id);
      notes.push({ id, href: a.href, cardText });
      if (notes.length >= 20) break;
    }
    const bodyText = document.body?.innerText || '';
    return {
      notes,
      bodyPreview: bodyText.slice(0, 500),
      hasNoResults: /没有找到|no results|未找到/i.test(bodyText),
    };
  });

  const parsed = result.notes.map((n) => ({ id: n.id, href: n.href, ...parseCardText(n.cardText) }));
  const withLikes = parsed.filter((n) => typeof n.likes === 'number');
  const totalLikes = withLikes.reduce((a, b) => a + b.likes, 0);
  const medianLikes = withLikes.length ? withLikes.map(n => n.likes).sort((a,b)=>a-b)[Math.floor(withLikes.length/2)] : 0;
  const maxLikes = withLikes.length ? Math.max(...withLikes.map(n => n.likes)) : 0;

  return {
    query,
    url,
    noResults: result.hasNoResults,
    notes: parsed,
    stats: {
      count: parsed.length,
      withLikesCount: withLikes.length,
      totalLikes,
      medianLikes,
      maxLikes,
    },
  };
}

async function main() {
  const browser = await chromium.connectOverCDP(CDP_URL);
  const context = browser.contexts()[0];
  const page = await context.newPage();

  const results = [];
  for (const { q, tag } of QUERIES) {
    const r = await searchQuery(page, q);
    r.tag = tag;
    results.push(r);
    const { count, withLikesCount, totalLikes, maxLikes, medianLikes } = r.stats;
    console.log(`  -> ${count} notes, ${withLikesCount} with likes, total=${totalLikes}, median=${medianLikes}, max=${maxLikes}${r.noResults ? ' [NO RESULTS]' : ''}`);
    // Polite delay between queries
    await page.waitForTimeout(4000);
  }

  const stateDir = path.join(projectRoot, 'state');
  if (!existsSync(stateDir)) await mkdir(stateDir, { recursive: true });
  const out = path.join(stateDir, 'rednote-audit.json');
  await writeFile(out, JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2), 'utf-8');

  console.log(`\n===== AUDIT SUMMARY =====`);
  console.log(`Query                            | Notes | MaxLikes | MedLikes | TotalLikes`);
  console.log(`---------------------------------|-------|----------|----------|-----------`);
  for (const r of results) {
    const q = r.query.padEnd(32).slice(0, 32);
    const n = String(r.stats.count).padStart(5);
    const mx = String(r.stats.maxLikes).padStart(8);
    const md = String(r.stats.medianLikes).padStart(8);
    const tot = String(r.stats.totalLikes).padStart(10);
    console.log(`${q} | ${n} | ${mx} | ${md} | ${tot}${r.noResults ? ' [NO]' : ''}`);
  }
  console.log(`\nSaved: ${out}`);
  await page.close();
  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
