Analyze SEO performance using Google Search Console data and suggest content improvements.

This command closes the feedback loop: /seo-content creates pages → /seo-analyze measures performance → recommends updates or new pages.

The user provides context or a focus area: $ARGUMENTS

## Step 0: Resolve Project Path

Check if `$ARGUMENTS` contains `--project <path>`. If yes, extract the path and use it as the base directory for all per-product files (`PRODUCT.md`, `DISTRIBUTION.md`, `state/`). Remove `--project <path>` from arguments before processing.

If no `--project`, use the current working directory.

## Step 1: Read Context

1. Read `PRODUCT.md` — product details, URLs.
2. Read `state/seo-content-plan.json` — if exists, the content that was planned/created.
3. Read `state/seo-audit.json` — if exists, latest audit results.
4. Read `DISTRIBUTION.md` — if exists, target keywords and strategy.

## Step 2: Collect Search Console Data

### Option A: API (recommended — automated)

If `google-service-account.json` exists in the project root and the Search Console API is enabled in the associated GCP project, pull data directly.

**First decide which window to use — this is the single most important methodology choice.** Look in `state/` for a prior `seo-analysis-*.json` (or check the project's memory):

#### Case 1 — First audit of this site (no prior analysis)
Use a wide window for the baseline "where do we rank" snapshot:

```bash
node {auto-distribute-path}/scripts/gsc-report.mjs \
  --site {site-url-from-PRODUCT.md} \
  --days 90 --compare --project {project-path}
```

#### Case 2 — RE-AUDIT (a prior analysis exists) — DEFAULT TO A SHORT, CHANGE-ANCHORED WINDOW
The point of a re-audit is "did the change we shipped last time shift the result." A 90d/90d compare is the WRONG instrument: a 90-day average cannot see a 2-3-week-old change, and its comparison baseline is the quarter *before* — the recent signal gets averaged into noise. (This actively misled us once: a 90d view showed a page "unchanged" while it had in fact fallen out of rankings entirely weeks earlier.)

1. Find the date the last change shipped (from the prior `seo-analysis-*.json` `files_written` / action notes, or project memory).
2. Compute the post-change span in days (today − ship date) and run a **change-anchored** comparison — post-change window vs an equal-length window immediately before:

   ```bash
   # Example: change shipped 2026-06-02, today 2026-06-25 → ~23 days post-change
   node {auto-distribute-path}/scripts/gsc-report.mjs \
     --site {site-url} --days 23 --compare --project {project-path}
   ```

   If the change is older than ~4 weeks, just use `--days 28 --compare` as the standing cadence window.
3. Also pull a short slice to catch decay / launch-honeymoon fade, per affected page:

   ```bash
   node {auto-distribute-path}/scripts/gsc-report.mjs \
     --site {site-url} --days 14 --report pages --project {project-path}
   ```

4. **Confirm any movement with the query-page time series, NOT the page-average position.** Short windows are noisy for low-traffic pages, and a page-average position masks real per-query positions (a "pos 14" average can be a few long-tail terms at pos 5-7 plus the target head terms sitting at pos 40+). Short window detects movement; the per-query series confirms it's real.
5. Optionally also keep one `--days 90` pull for the absolute ranking snapshot — but never use the 90d numbers to judge whether the last change worked.

Site URL format: URL-prefix property uses trailing slash (`https://example.com/`); domain property uses `sc-domain:example.com`. **If a url-prefix request 403s with "insufficient permission," the property is likely a DOMAIN property — retry with `sc-domain:example.com`.** Output goes to `state/gsc-report.json` (each run overwrites it — re-pull the canonical window last).

If the script returns a 403 with `SERVICE_DISABLED`, ask the user to enable the **Google Search Console API** at the URL printed in the error, wait ~1 minute, then retry.

### Option B: Manual CSV Export (fallback)

If the API isn't set up:
1. Go to [Search Console Performance](https://search.google.com/search-console/performance)
2. Set date range (last 3 months recommended)
3. Export **Queries** tab and **Pages** tab
4. Save to `state/gsc-queries.csv` and `state/gsc-pages.csv`

### Option C: User Pastes Data
Ask the user to paste the top queries and pages directly if they prefer.

### Optional: Check Index Status of Underperformers

If certain pages have unexpectedly low impressions, run URL Inspection to see whether they're actually indexed:

```bash
node {auto-distribute-path}/scripts/gsc-inspect.mjs \
  --site {site-url} --from-submissions --project {project-path}
```

Pages stuck in "Discovered - currently not indexed" or "Crawled - currently not indexed" won't show impressions regardless of content quality — flag those for the user as a separate issue.

## Step 3: Analyze Performance

With the Search Console data, perform these analyses:

### 3a: Page Performance

For each page, categorize by performance:

| Category | Criteria | Action |
|----------|----------|--------|
| **Winners** | High clicks, high CTR, position 1-3 | Protect — don't change much, maybe add internal links from other pages |
| **Almost there** | Good impressions, position 4-10 | Optimize — update content, improve title/meta, add sections targeting related keywords |
| **Striking distance** | Impressions but position 11-20 | Push — these are page 2, need a content refresh or backlink push to break onto page 1 |
| **Underperformers** | Low impressions, low clicks despite content existing | Diagnose — wrong keyword? thin content? cannibalization? |
| **Missing** | Pages with no impressions at all | Check indexing — may not be indexed, or targeting wrong keywords entirely |

### 3b: Keyword Analysis

For each keyword/query:

| Category | Criteria | Action |
|----------|----------|--------|
| **Ranking keywords** | Position 1-10, good clicks | Monitor, protect |
| **Opportunity keywords** | Position 11-20, decent impressions | Create or improve content targeting these |
| **Impression-rich, low CTR** | High impressions, CTR < 2% | Title/meta description needs improvement — not compelling enough |
| **New keyword discoveries** | Keywords you rank for but didn't target | Create dedicated content to capture these properly |
| **Keyword gaps** | Keywords competitors rank for but you don't | Create new content (cross-reference with competitor research) |

### 3c: CTR Analysis

Compare CTR against position benchmarks:

| Position | Expected CTR | If Below |
|----------|-------------|----------|
| 1 | ~30% | Title/meta may be weak vs competitors |
| 2-3 | ~15-20% | Consider featured snippet optimization |
| 4-5 | ~8-12% | Normal range |
| 6-10 | ~3-8% | Focus on moving up rather than CTR |

For pages with CTR significantly below benchmarks: suggest title tag and meta description rewrites.

### 3d: Content Gap Analysis

Cross-reference:
- Keywords from `state/seo-content-plan.json` (what was planned) vs actual rankings
- Competitor keywords (from `/seo-content` research) vs what you rank for
- Social conversations (what people ask about) vs existing content

Identify gaps where no content exists for valuable keywords.

## Step 4: Generate Recommendations

Present a prioritized action plan:

```markdown
# SEO Performance Report: {product name}

**Period**: {date range}
**Total clicks**: {X} | **Total impressions**: {X} | **Avg CTR**: {X}% | **Avg position**: {X}

## Quick Wins (do this week)

### Title/Meta Rewrites
Pages with high impressions but low CTR — rewrite titles and meta descriptions:
| Page | Current Title | Suggested Title | Impressions | Current CTR |
|------|--------------|-----------------|-------------|-------------|
| /page | "..." | "..." | X | X% |

### Striking Distance Keywords
Keywords on page 2 (position 11-20) that need a push:
| Keyword | Current Position | Impressions | Page | Action |
|---------|-----------------|-------------|------|--------|
| "keyword" | 14 | X | /page | Add section about {topic}, expand content |

## Content Updates (this month)

### Pages to Refresh
Existing pages that need updates to improve rankings:
| Page | Issue | Current Position | Recommendation |
|------|-------|-----------------|----------------|
| /page | Thin content | 18 | Expand from X to Y words, add {sections} |
| /page | Outdated info | 8 | Update for 2026, add recent data |

### Pages to Consolidate
If multiple pages compete for the same keyword (cannibalization):
| Keyword | Competing Pages | Action |
|---------|----------------|--------|
| "keyword" | /page-a, /page-b | Merge into /page-a, redirect /page-b |

## New Content to Create

Based on keyword gaps and opportunity keywords:
| Content | Target Keyword | Impressions (est.) | Type | Priority |
|---------|---------------|-------------------|------|----------|
| "{title}" | "keyword" | X | Blog post | High |
| "{title}" | "keyword" | X | Landing page | Medium |

→ Run `/seo-content {keyword}` to generate any of these.

## What's Working (keep doing)

Top performing pages and keywords — don't change these:
| Page/Keyword | Clicks | Position | Notes |
|-------------|--------|----------|-------|
| /page | X | 2 | Winner — add internal links from new content |
```

## Step 5: Save and Connect

1. Save analysis to `state/seo-analysis.json`:
   ```json
   {
     "date": "2026-04-12",
     "period": "2026-01-12 to 2026-04-12",
     "summary": { "clicks": X, "impressions": X, "avg_ctr": X, "avg_position": X },
     "quick_wins": [...],
     "content_updates": [...],
     "new_content": [...],
     "winners": [...]
   }
   ```

2. Update `state/seo-content-plan.json` — mark published pages with their current performance data.

3. Suggest next steps:
   - Implement quick wins (title/meta rewrites) immediately
   - Run `/seo-content` for any new content recommendations
   - Run `/seo-audit` on updated pages to verify changes
   - Run `/search-console submit` after publishing updates
   - Schedule re-analysis in 2-4 weeks to measure impact
   - Run `/seo-analyze` again next month to track progress

## When to Run This

- **First time**: 2-4 weeks after publishing SEO content (Google needs time to index and rank). Use the wide 90d window (Step 2, Case 1).
- **Ongoing / after changes**: every 2-4 weeks to measure whether the last change worked. Use the short, change-anchored window (Step 2, Case 2) — NOT 90d/90d. Matching the analysis window to the re-audit cadence is the whole point; a mismatched window wastes both the audit and the prior work.
