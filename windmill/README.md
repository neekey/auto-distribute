# Windmill workflows

Automated workflows for the auto-distribute system, running on the local Windmill instance (`~/workspaces/windmill`, Docker compose).

## Reddit discovery → Notion

Daily flow that searches Reddit for product-relevant threads and writes the top candidates as new rows to a Notion database for manual review (and reply via `/social reply <url>`).

### Architecture (Windmill flow with two step scripts)

```
flow: f/distribution/reddit_discovery_flow
  ├── step a: f/distribution/reddit_search_score
  │     (Reddit public JSON API → heuristic filter → score)
  └── step b: f/distribution/notion_write_candidates
        (dedupe vs Notion DB → write top N as Status=New)
```

Sources of truth in this repo:
- `windmill/scripts/reddit-search-score.ts` — step 1
- `windmill/scripts/notion-write-candidates.ts` — step 2
- `windmill/flows/reddit-discovery-flow.json` — flow definition

These are pushed to Windmill via API. To re-sync after editing, POST to `/api/w/<ws>/scripts/create` (with the previous hash as `parent_hash`) or `/flows/update/<path>`.

### Notion DBs (already created)

| Product | Database URL | Database ID |
|---------|-------------|-------------|
| Numblr | https://www.notion.so/df2c80d3ac7e4c3a9e0bada5c67fd48a | `df2c80d3-ac7e-4c3a-9e0b-ada5c67fd48a` |
| Zahlhaus | https://www.notion.so/34a4f2ba6e96411cac3474f0f2eea758 | `34a4f2ba-6e96-411c-ac34-74f0f2eea758` |

The Notion integration ("Local Windmill") is connected at the parent project page level, which propagates access to the Reddit Discovery sub-databases.

### Schedules (already live)

| Schedule path | Cron | Timezone | Args |
|--------------|------|----------|------|
| `f/distribution/reddit_discovery_numblr` | `0 0 9 * * *` | Australia/Melbourne | Numblr config |
| `f/distribution/reddit_discovery_zahlhaus` | `0 0 9 * * *` | Australia/Melbourne | Zahlhaus config |

Both point at `f/distribution/reddit_discovery_flow` with `is_flow: true`. Args include `notion: "$res:u/ni184775761/notion"` to wire the Notion resource at runtime.

### How candidates get scored (step 1)

| Signal | Points |
|--------|--------|
| Title contains `?` | +50 |
| Question words in title/body (how, what, anyone, looking for, recommend, ...) | up to +30 |
| Product keyword hit (configurable per product) | up to +40 |
| Posted < 24h ago | +25 (or +15 < 3d, +5 < 7d) |
| < 3 comments (under-answered) | +15 (or +8 < 8 comments, −10 if > 30) |
| Reddit upvotes ≥ 5 | up to +20 (or −5 if score < 1) |

Filters applied after scoring: `archived`, age cutoff (`freshnessDays`), `excludeAuthors`, promo flags ("i built", "[promo]", etc.), and `minHeuristicScore` (default 30).

### How candidates get written (step 2)

1. Query the Notion DB once for all existing URLs (paginated, up to 2000).
2. Filter out candidates whose URL already exists (dedupe).
3. Take top `topN` by heuristic score.
4. For each, create a Notion page with `Status = New`, snippet, score, why-match, etc.

### Reviewing candidates

Open the two Notion DBs each morning. Each row has a `Status` select:

- `New` — fresh, needs review (or auto-drafting via `/social draft-queue`)
- `Reviewed` — looked at, deciding
- `Reply Drafted` — `/social draft-queue` has written a reply into the page body; review + post via `/social reply <url>`
- `Replied` — posted a reply
- `Skip` — passed on (low fit, archived, already replied elsewhere, etc.)
- `Archived` — auto-aged out (manually flip old `New` rows here)

The `/social draft-queue` command (in `auto-distribute/.claude/commands/social.md`) is designed for headless `claude -e` invocation after the discovery cron — see that file for the full flow.

The `Why Match` column explains why each thread surfaced.

### Tuning

If too noisy: raise `minHeuristicScore` in the schedule args (default 30; try 50), narrow the `queries` array, or drop a sub from `subs`.

If too sparse: lower `minHeuristicScore`, add queries, or extend `freshnessDays`.

If a sub frequently produces irrelevant results, remove it from `subs`. Memory rules already say to skip r/TOEFL, r/ENGLISH, r/GlobalEnglishPrep, r/Deutsch, r/AskAGerman for product mentions.

### Future: AI scoring step

The flow leaves room for a step `a2` between search and write that sends top-N candidates to Haiku 4.5 for semantic relevance rating + a 1-line `Why Match`. Cost ~$5/year for both products. Add when title-only ambiguity becomes a real problem (current heuristic surfaces "What do I do?" type vague titles occasionally).

### Future: posting via stride

Posting/replying to Reddit needs the user's logged-in browser session, which lives outside the Windmill Docker container. When we add automated posting (vs current manual `/social reply`), wrap stride-cli in a script that runs on the host and have Windmill trigger it via webhook or local Docker exec.
