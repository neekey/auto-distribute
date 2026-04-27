// Windmill step 1: search Reddit + heuristic filter + score.
//
// Hits Reddit's public JSON API (no auth) for each (sub, query) combo, applies
// rule-based filters (archived, age, dedupe within run, exclude authors, promo
// flags), scores each candidate by question-shape, product-keyword fit,
// recency, comment count, and upvotes, returns surviving candidates as JSON
// for the next flow step.
//
// Pure Reddit + filtering logic. No Notion access, no LLM.

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

export type Candidate = {
  fullUrl: string;
  title: string;
  selftext: string;
  subreddit: string;
  redditScore: number;
  numComments: number;
  createdUtc: number;
  author: string;
  archived: boolean;
  matchedSub: string;
  matchQuery: string;
  heuristicScore: number;
  whyMatch: string;
};

const REDDIT_UA = "windmill:auto-distribute-reddit-discovery:v1 (by /u/neekey2)";

const DEFAULT_QUESTION_WORDS = [
  "how", "what", "why", "anyone", "anybody", "looking for", "recommend",
  "recommendation", "help", "advice", "stuck", "struggling", "tips",
  "best way", "how do", "how to", "any tips", "any tool", "any app",
];

const PROMO_FLAGS = ["i built", "i made", "[promo]", "self-promo", "i created"];

export async function main(
  productName: string,
  subs: string[],
  queries: string[],
  productKeywords: string[] = [],
  excludeAuthors: string[] = [],
  freshnessDays: number = 7,
  minHeuristicScore: number = 30,
): Promise<{ product: string; scanned: number; candidates: Candidate[] }> {
  const cutoffUtc = Date.now() / 1000 - freshnessDays * 86400;

  console.log(`[${productName}] searching ${subs.length} subs × ${queries.length} queries`);

  const all: Candidate[] = [];
  for (const sub of subs) {
    for (const query of queries) {
      try {
        const posts = await searchReddit(sub, query);
        for (const p of posts) {
          all.push(buildCandidate(p, sub, query, productKeywords));
        }
        await sleep(1200);
      } catch (err) {
        console.log(`[${productName}] search failed sub=${sub} q="${query}": ${err}`);
      }
    }
  }

  const filtered = all.filter((c) => {
    if (c.archived) return false;
    if (c.createdUtc < cutoffUtc) return false;
    if (excludeAuthors.includes(c.author)) return false;
    if (PROMO_FLAGS.some((f) => c.title.toLowerCase().includes(f))) return false;
    if (c.heuristicScore < minHeuristicScore) return false;
    return true;
  });

  const uniq = new Map<string, Candidate>();
  for (const c of filtered) {
    const prev = uniq.get(c.fullUrl);
    if (!prev || c.heuristicScore > prev.heuristicScore) uniq.set(c.fullUrl, c);
  }
  const candidates = [...uniq.values()].sort((a, b) => b.heuristicScore - a.heuristicScore);

  console.log(`[${productName}] scanned=${all.length} kept=${candidates.length}`);

  return { product: productName, scanned: all.length, candidates };
}

async function searchReddit(sub: string, query: string): Promise<RedditPost[]> {
  const url = `https://www.reddit.com/r/${encodeURIComponent(sub)}/search.json?q=${encodeURIComponent(query)}&restrict_sr=on&sort=new&t=month&limit=50`;
  const res = await fetch(url, { headers: { "User-Agent": REDDIT_UA } });
  if (!res.ok) throw new Error(`reddit ${res.status}`);
  const json = await res.json() as { data?: { children?: Array<{ data: RedditPost }> } };
  return (json.data?.children ?? []).map((c) => c.data).filter((p) => !p.removed_by_category);
}

function buildCandidate(
  p: RedditPost,
  matchedSub: string,
  matchQuery: string,
  productKeywords: string[],
): Candidate {
  const title = p.title.toLowerCase();
  const body = (p.selftext ?? "").toLowerCase();
  const titleAndBody = `${title} ${body}`;
  const reasons: string[] = [];
  let score = 0;

  if (title.includes("?")) { score += 50; reasons.push("title is a question"); }
  const qHits = DEFAULT_QUESTION_WORDS.filter((w) => titleAndBody.includes(w));
  if (qHits.length > 0) { score += Math.min(30, qHits.length * 10); reasons.push(`q-words: ${qHits.slice(0, 3).join(",")}`); }
  const pkHits = productKeywords.filter((k) => titleAndBody.includes(k.toLowerCase()));
  if (pkHits.length > 0) { score += Math.min(40, pkHits.length * 15); reasons.push(`fit: ${pkHits.slice(0, 3).join(",")}`); }

  const ageHours = (Date.now() / 1000 - p.created_utc) / 3600;
  if (ageHours < 24) { score += 25; reasons.push("<24h"); }
  else if (ageHours < 72) { score += 15; reasons.push("<3d"); }
  else if (ageHours < 168) { score += 5; reasons.push("<7d"); }

  if (p.num_comments < 3) { score += 15; reasons.push("under-answered"); }
  else if (p.num_comments < 8) { score += 8; reasons.push("low comments"); }
  else if (p.num_comments > 30) { score -= 10; reasons.push("crowded"); }

  if (p.score >= 5) score += Math.min(20, p.score);
  else if (p.score < 1) score -= 5;

  return {
    fullUrl: `https://www.reddit.com${p.permalink}`,
    title: p.title,
    selftext: p.selftext ?? "",
    subreddit: p.subreddit,
    redditScore: p.score,
    numComments: p.num_comments,
    createdUtc: p.created_utc,
    author: p.author,
    archived: p.archived,
    matchedSub,
    matchQuery,
    heuristicScore: score,
    whyMatch: reasons.join("; ") || "no signals",
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
