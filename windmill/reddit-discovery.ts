// Windmill script: daily Reddit thread discovery → Notion DB
//
// Hits Reddit's public JSON API for each (subreddit, query) combo, filters for
// fresh + question-shaped + non-archived threads, dedupes against existing rows
// in the Notion database, scores by relevance, and writes the top N as new rows
// with status=New for manual review.
//
// Runtime: Windmill Deno runtime (uses npm: imports + Web Fetch).
// Auth: pass NOTION_TOKEN via Windmill variable; no Reddit auth needed.
// Rate limit: anonymous Reddit allows ~60 req/min. We sleep 1.2s between calls.
//
// Setup in Windmill (one-time):
//   1. Variables → New variable → name `NOTION_TOKEN`, value = Notion integration secret
//      (https://www.notion.so/my-integrations → New integration → copy "Internal Integration Secret")
//   2. The integration must be added to each Notion page that owns a target DB:
//      open the project page → ... menu → Connections → Add connection → pick the integration.
//      Do this for the Numblr.io page and the zahlhaus page.
//   3. Scripts → New script → TypeScript (Deno) → paste this file's contents.
//      Name it `f/distribution/reddit_discovery` (or wherever fits).
//   4. Schedules → New schedule → pick this script → cron `0 9 * * *` (daily 9am local).
//      Pass the per-product config in the args (see scheduleArgs at the bottom of this file).

type Config = {
  productName: string;
  subs: string[];
  queries: string[];
  notionDatabaseId: string;
  topN?: number;
  questionWords?: string[];
  excludeAuthors?: string[];
  productKeywords?: string[];
  freshnessDays?: number;
};

type RedditPost = {
  title: string;
  selftext: string;
  permalink: string;
  url: string;
  subreddit: string;
  score: number;
  num_comments: number;
  created_utc: number;
  author: string;
  archived: boolean;
  removed_by_category: string | null;
  is_self: boolean;
  link_flair_text: string | null;
};

type Candidate = RedditPost & {
  fullUrl: string;
  matchQuery: string;
  matchedSub: string;
  relevanceScore: number;
  whyMatch: string;
};

const NOTION_VERSION = "2022-06-28";
const REDDIT_UA = "windmill:auto-distribute-reddit-discovery:v1 (by /u/neekey2)";

const DEFAULT_QUESTION_WORDS = [
  "how", "what", "why", "anyone", "anybody", "looking for", "recommend",
  "recommendation", "help", "advice", "stuck", "struggling", "tips",
  "best way", "how do", "how to", "any tips", "any tool", "any app",
];

const PROMO_FLAGS = ["i built", "i made", "[promo]", "self-promo", "i created"];

export async function main(
  config: Config,
  notionToken: string,
): Promise<{
  product: string;
  date: string;
  scanned: number;
  filtered: number;
  unique: number;
  written: number;
  topPicks: Array<{ title: string; subreddit: string; score: number; url: string }>;
}> {
  const today = new Date().toISOString().slice(0, 10);
  const freshnessDays = config.freshnessDays ?? 7;
  const topN = config.topN ?? 10;
  const questionWords = config.questionWords ?? DEFAULT_QUESTION_WORDS;

  log(`[${config.productName}] starting discovery for ${today}`);

  const existingUrls = await fetchExistingUrls(notionToken, config.notionDatabaseId);
  log(`[${config.productName}] ${existingUrls.size} existing URLs in Notion DB`);

  const allCandidates: Candidate[] = [];
  for (const sub of config.subs) {
    for (const query of config.queries) {
      try {
        const posts = await searchReddit(sub, query);
        for (const p of posts) {
          allCandidates.push(buildCandidate(p, sub, query, questionWords, config.productKeywords ?? []));
        }
        await sleep(1200);
      } catch (err) {
        log(`[${config.productName}] search failed sub=${sub} q="${query}": ${err}`);
      }
    }
  }

  log(`[${config.productName}] scanned ${allCandidates.length} raw candidates`);

  const cutoffUtc = Date.now() / 1000 - freshnessDays * 86400;
  const filtered = allCandidates.filter((c) => {
    if (c.archived) return false;
    if (c.removed_by_category) return false;
    if (c.created_utc < cutoffUtc) return false;
    if (existingUrls.has(c.fullUrl)) return false;
    if (config.excludeAuthors?.includes(c.author)) return false;
    if (PROMO_FLAGS.some((f) => c.title.toLowerCase().includes(f))) return false;
    if (c.relevanceScore < 30) return false;
    return true;
  });

  log(`[${config.productName}] ${filtered.length} after filters`);

  const uniqueByUrl = new Map<string, Candidate>();
  for (const c of filtered) {
    const prev = uniqueByUrl.get(c.fullUrl);
    if (!prev || c.relevanceScore > prev.relevanceScore) {
      uniqueByUrl.set(c.fullUrl, c);
    }
  }
  const unique = [...uniqueByUrl.values()].sort((a, b) => b.relevanceScore - a.relevanceScore);
  log(`[${config.productName}] ${unique.length} unique candidates`);

  const winners = unique.slice(0, topN);
  let written = 0;
  for (const w of winners) {
    try {
      await createNotionRow(notionToken, config.notionDatabaseId, w, today);
      written++;
      await sleep(400);
    } catch (err) {
      log(`[${config.productName}] notion write failed for ${w.fullUrl}: ${err}`);
    }
  }

  log(`[${config.productName}] wrote ${written} rows to Notion`);

  return {
    product: config.productName,
    date: today,
    scanned: allCandidates.length,
    filtered: filtered.length,
    unique: unique.length,
    written,
    topPicks: winners.map((w) => ({
      title: w.title,
      subreddit: w.subreddit,
      score: w.relevanceScore,
      url: w.fullUrl,
    })),
  };
}

async function searchReddit(sub: string, query: string): Promise<RedditPost[]> {
  const url = `https://www.reddit.com/r/${encodeURIComponent(sub)}/search.json?q=${encodeURIComponent(query)}&restrict_sr=on&sort=new&t=month&limit=50`;
  const res = await fetch(url, { headers: { "User-Agent": REDDIT_UA } });
  if (!res.ok) throw new Error(`reddit ${res.status} for ${url}`);
  const json = await res.json() as { data?: { children?: Array<{ data: RedditPost }> } };
  return (json.data?.children ?? []).map((c) => c.data);
}

function buildCandidate(
  p: RedditPost,
  matchedSub: string,
  matchQuery: string,
  questionWords: string[],
  productKeywords: string[],
): Candidate {
  const title = p.title.toLowerCase();
  const body = (p.selftext ?? "").toLowerCase();
  const titleAndBody = `${title} ${body}`;
  const reasons: string[] = [];
  let score = 0;

  if (title.includes("?")) { score += 50; reasons.push("title is a question"); }
  const qHits = questionWords.filter((w) => titleAndBody.includes(w));
  if (qHits.length > 0) { score += Math.min(30, qHits.length * 10); reasons.push(`question words: ${qHits.slice(0, 3).join(",")}`); }
  const pkHits = productKeywords.filter((k) => titleAndBody.includes(k.toLowerCase()));
  if (pkHits.length > 0) { score += Math.min(40, pkHits.length * 15); reasons.push(`product fit: ${pkHits.slice(0, 3).join(",")}`); }

  const ageHours = (Date.now() / 1000 - p.created_utc) / 3600;
  if (ageHours < 24) { score += 25; reasons.push("posted <24h ago"); }
  else if (ageHours < 72) { score += 15; reasons.push("posted <3d ago"); }
  else if (ageHours < 168) { score += 5; reasons.push("posted <7d ago"); }

  if (p.num_comments < 3) { score += 15; reasons.push("under-answered (<3 comments)"); }
  else if (p.num_comments < 8) { score += 8; reasons.push("low comments"); }
  else if (p.num_comments > 30) { score -= 10; reasons.push("crowded thread"); }

  if (p.score >= 5) score += Math.min(20, p.score);
  else if (p.score < 1) score -= 5;

  return {
    ...p,
    fullUrl: `https://www.reddit.com${p.permalink}`,
    matchQuery,
    matchedSub,
    relevanceScore: score,
    whyMatch: reasons.join("; ") || "no signals",
  };
}

async function fetchExistingUrls(token: string, dbId: string): Promise<Set<string>> {
  const urls = new Set<string>();
  let cursor: string | undefined = undefined;
  for (let i = 0; i < 20; i++) {
    const body: Record<string, unknown> = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;
    const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
      method: "POST",
      headers: notionHeaders(token),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`notion query ${res.status}: ${await res.text()}`);
    const json = await res.json() as { results: Array<{ properties: Record<string, { url?: string | null }> }>; next_cursor: string | null; has_more: boolean };
    for (const row of json.results) {
      const url = row.properties?.URL?.url;
      if (url) urls.add(url);
    }
    if (!json.has_more || !json.next_cursor) break;
    cursor = json.next_cursor;
  }
  return urls;
}

async function createNotionRow(token: string, dbId: string, c: Candidate, today: string) {
  const subOption = c.subreddit; // must match a Subreddit select option in the DB
  const body = {
    parent: { database_id: dbId },
    properties: {
      "Title": { title: [{ text: { content: c.title.slice(0, 1900) } }] },
      "URL": { url: c.fullUrl },
      "Subreddit": { select: { name: subOption } },
      "Status": { select: { name: "New" } },
      "Posted": { date: { start: new Date(c.created_utc * 1000).toISOString().slice(0, 10) } },
      "Discovered": { date: { start: today } },
      "Reddit Score": { number: c.score },
      "Comments": { number: c.num_comments },
      "Match Query": { rich_text: [{ text: { content: c.matchQuery.slice(0, 1900) } }] },
      "Why Match": { rich_text: [{ text: { content: c.whyMatch.slice(0, 1900) } }] },
      "Snippet": { rich_text: [{ text: { content: (c.selftext || "(link post)").slice(0, 1900) } }] },
      "Author": { rich_text: [{ text: { content: c.author.slice(0, 200) } }] },
    },
  };
  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: notionHeaders(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`notion create ${res.status}: ${await res.text()}`);
}

function notionHeaders(token: string): Record<string, string> {
  return {
    "Authorization": `Bearer ${token}`,
    "Notion-Version": NOTION_VERSION,
    "Content-Type": "application/json",
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function log(s: string) {
  console.log(s);
}
