# Windmill workflows

Automated workflows for the auto-distribute system, run on a local Windmill instance (`~/workspaces/windmill`, Docker compose).

## Reddit discovery → Notion

Daily script that searches Reddit for product-relevant threads and writes the top candidates as new rows to a Notion database, ready for manual review and reply via `/social reply <url>`.

**File:** `reddit-discovery.ts`

### Notion DBs (already created)

| Product | Database URL | Database ID (use this in `notionDatabaseId`) |
|---------|-------------|---------------------------------------------|
| Numblr | https://www.notion.so/df2c80d3ac7e4c3a9e0bada5c67fd48a | `df2c80d3-ac7e-4c3a-9e0b-ada5c67fd48a` |
| Zahlhaus | https://www.notion.so/34a4f2ba6e96411cac3474f0f2eea758 | `34a4f2ba-6e96-411c-ac34-74f0f2eea758` |

### One-time setup

1. **Notion integration**
   1. Go to https://www.notion.so/my-integrations → New integration
   2. Name it (e.g. "Auto Distribute"), workspace = your personal workspace
   3. Copy the **Internal Integration Secret** (`secret_...`) — this is your `NOTION_TOKEN`
   4. Open the **Numblr.io** project page in Notion → top-right `...` → Connections → Add connection → pick the integration. Repeat for the **zahlhaus** page. (Connecting at the project page level grants access to the Reddit Discovery sub-database underneath.)

2. **Windmill — Notion token**
   1. In Windmill UI → Variables → New variable
   2. Path: `f/distribution/notion_token`
   3. Value: the `secret_...` token from step 1
   4. Mark as secret

3. **Windmill — script**
   1. Scripts → New script → TypeScript (Deno)
   2. Path: `f/distribution/reddit_discovery`
   3. Paste the contents of `reddit-discovery.ts`
   4. Save and run a test (use one of the schedule args below as the input)

4. **Windmill — schedules** (one per product)
   1. Schedules → New schedule
   2. Pick the script `f/distribution/reddit_discovery`
   3. Cron: `0 9 * * *` (daily 9am local — adjust to your timezone in the schedule editor)
   4. Args: paste the JSON for the relevant product (see below)

### Schedule args

The script takes two args: `config` (an object) and `notionToken` (a string from the Windmill variable).

In Windmill, set `notionToken` to reference the variable: `$var:f/distribution/notion_token`.

#### Numblr

```json
{
  "config": {
    "productName": "numblr",
    "subs": [
      "DuolingoEnglishTest",
      "ToeflAdvice",
      "EnglishLearning",
      "languagelearning",
      "EnglishPractice",
      "Accents",
      "IELTS"
    ],
    "queries": [
      "listening",
      "numbers",
      "phone numbers",
      "dates",
      "money listening",
      "ielts listening",
      "toefl listening",
      "listen and type",
      "catch numbers",
      "spoken numbers"
    ],
    "productKeywords": [
      "numbers",
      "listening",
      "phone",
      "dates",
      "money",
      "ielts",
      "toefl",
      "listen-and-type"
    ],
    "excludeAuthors": ["neekey2"],
    "notionDatabaseId": "df2c80d3-ac7e-4c3a-9e0b-ada5c67fd48a",
    "topN": 10,
    "freshnessDays": 7
  },
  "notionToken": "$var:f/distribution/notion_token"
}
```

#### Zahlhaus

```json
{
  "config": {
    "productName": "zahlhaus",
    "subs": [
      "German",
      "Germanlearning",
      "lernen_German"
    ],
    "queries": [
      "Zahlen",
      "numbers",
      "Hörverstehen",
      "listening",
      "Nicos Weg",
      "A1 listening",
      "two and forty",
      "42 vs 24",
      "alphabet listening",
      "spoken numbers"
    ],
    "productKeywords": [
      "zahlen",
      "numbers",
      "hörverstehen",
      "listening",
      "42",
      "24",
      "two and forty"
    ],
    "excludeAuthors": ["neekey2"],
    "notionDatabaseId": "34a4f2ba-6e96-411c-ac34-74f0f2eea758",
    "topN": 8,
    "freshnessDays": 7
  },
  "notionToken": "$var:f/distribution/notion_token"
}
```

### How it works (recap)

1. Pulls existing URLs from the Notion DB to dedupe.
2. For each (sub, query) combo: hits `https://www.reddit.com/r/{sub}/search.json?q={q}&restrict_sr=on&sort=new&t=month&limit=50` (no auth, public JSON API), sleeps 1.2s between calls to stay under Reddit's anonymous rate limit (~60/min).
3. Filters: not archived, not removed, posted within `freshnessDays`, not in Notion already, not from `excludeAuthors`, no obvious self-promo flags, relevance score ≥ 30.
4. Scores each candidate (question intensity + product-keyword fit + recency + low-comment-count + upvote signal). De-dupes per URL keeping highest-scoring match.
5. Writes top N to the Notion DB with `Status = New`.

### Reviewing candidates

Open the Notion DB each morning. Each row has a `Status` select:

- `New` — fresh, needs review
- `Reviewed` — looked at, deciding
- `Replied` — drafted/posted a reply (use `/social reply <url>` to draft)
- `Skip` — passed on (low fit, archived, already replied elsewhere, etc.)
- `Archived` — auto-aged out (you can manually flip old `New` rows here)

The `Why Match` column explains why each thread surfaced.

### Tuning

If too noisy: raise the `relevanceScore < 30` threshold in `reddit-discovery.ts`, narrow the `queries` array, or drop a sub from `subs`.

If too sparse: lower the threshold, add queries, or extend `freshnessDays` to 14.

If a sub frequently produces irrelevant results, remove it from `subs`. Memory rules already say to skip r/TOEFL, r/ENGLISH, r/GlobalEnglishPrep, r/Deutsch, r/AskAGerman for product mentions.
