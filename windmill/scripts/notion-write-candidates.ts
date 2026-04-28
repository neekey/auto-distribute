// Windmill step 2: dedupe candidates against the Notion DB and write top N.
//
// Uses the typed Windmill Notion resource (notion.token) and the official
// @notionhq/client SDK. Pass `$res:u/<user>/<resource>` from the flow to wire
// the resource in.

import { Client } from "npm:@notionhq/client@2";

type Candidate = {
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

type Notion = { token: string };

export async function main(
  productName: string,
  candidates: Candidate[],
  notionDatabaseId: string,
  notion: Notion,
  topN: number = 10,
): Promise<{
  product: string;
  written: number;
  skippedDup: number;
  topPicks: Array<{ title: string; subreddit: string; score: number; url: string }>;
}> {
  const today = new Date().toISOString().slice(0, 10);
  const client = new Client({ auth: notion.token });

  const existing = await fetchExistingUrls(client, notionDatabaseId);
  console.log(`[${productName}] notion has ${existing.size} existing rows`);

  const fresh = candidates.filter((c) => !existing.has(c.fullUrl));
  const skippedDup = candidates.length - fresh.length;
  const winners = fresh.slice(0, topN);

  let written = 0;
  for (const w of winners) {
    try {
      await client.pages.create({
        parent: { database_id: notionDatabaseId },
        properties: {
          "Title": { title: [{ text: { content: w.title.slice(0, 1900) } }] },
          "URL": { url: w.fullUrl },
          "Subreddit": { select: { name: w.subreddit } },
          "Status": { select: { name: "New" } },
          "Posted": { date: { start: new Date(w.createdUtc * 1000).toISOString().slice(0, 10) } },
          "Discovered": { date: { start: today } },
          "Reddit Score": { number: w.redditScore },
          "Comments": { number: w.numComments },
          "Match Query": { rich_text: [{ text: { content: w.matchQuery.slice(0, 1900) } }] },
          "Why Match": { rich_text: [{ text: { content: w.whyMatch.slice(0, 1900) } }] },
          "Snippet": { rich_text: [{ text: { content: (w.selftext || "(link post)").slice(0, 1900) } }] },
          "Author": { rich_text: [{ text: { content: w.author.slice(0, 200) } }] },
        },
      });
      written++;
      await sleep(400);
    } catch (err) {
      console.log(`[${productName}] write failed ${w.fullUrl}: ${err}`);
    }
  }

  console.log(`[${productName}] wrote=${written} skipped_dup=${skippedDup}`);

  return {
    product: productName,
    written,
    skippedDup,
    topPicks: winners.map((w) => ({
      title: w.title,
      subreddit: w.subreddit,
      score: w.heuristicScore,
      url: w.fullUrl,
    })),
  };
}

async function fetchExistingUrls(client: Client, dbId: string): Promise<Set<string>> {
  const urls = new Set<string>();
  let cursor: string | undefined = undefined;
  for (let i = 0; i < 20; i++) {
    const res = await client.databases.query({
      database_id: dbId,
      page_size: 100,
      start_cursor: cursor,
    });
    for (const row of res.results) {
      const props = (row as { properties?: Record<string, { url?: string | null }> }).properties;
      const u = props?.URL?.url;
      if (u) urls.add(u);
    }
    if (!res.has_more || !res.next_cursor) break;
    cursor = res.next_cursor;
  }
  return urls;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
