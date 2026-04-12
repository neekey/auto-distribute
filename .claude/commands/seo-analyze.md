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

Ask the user to export data from Google Search Console, or guide them through the UI:

### Option A: Manual Export (recommended)
Guide the user to export CSV from Search Console:
1. Go to [Search Console Performance](https://search.google.com/search-console/performance)
2. Set date range (last 3 months recommended)
3. Export **Queries** tab (impressions, clicks, CTR, position for each keyword)
4. Export **Pages** tab (impressions, clicks, CTR, position for each page)
5. Save exports to `state/gsc-queries.csv` and `state/gsc-pages.csv`

### Option B: User Pastes Data
Ask the user to paste the top queries and pages data directly if they prefer.

### Option C: API (if configured)
If Search Console API is set up (check `state/search-console.json`):
```bash
# Fetch performance data via API
curl -X POST "https://searchconsole.googleapis.com/webmasters/v3/sites/{site}/searchAnalytics/query" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "{3 months ago}",
    "endDate": "{today}",
    "dimensions": ["query", "page"],
    "rowLimit": 500
  }'
```

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

- **First time**: 2-4 weeks after publishing SEO content (Google needs time to index and rank)
- **Ongoing**: Monthly to track progress and find new opportunities
- **After major changes**: 2 weeks after content updates or site changes
