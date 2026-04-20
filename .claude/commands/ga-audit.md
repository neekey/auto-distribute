Audit Google Analytics (GA4) behavior and traffic-mix data, complementing `/seo-analyze` (which handles acquisition via Search Console).

GA answers: what do users *do* after they arrive, where do they come from beyond search, and are AI assistants (ChatGPT, Perplexity, Claude) sending traffic?

The user provides context or a focus area: $ARGUMENTS

## Step 0: Resolve Project Path

Check if `$ARGUMENTS` contains `--project <path>`. If yes, extract the path and use it as the base directory for all per-product files. Remove `--project <path>` from arguments before processing.

If no `--project`, use the current working directory.

## Step 1: Read Context

1. Read `PRODUCT.md` — need the GA4 Property ID. Expect a line like `GA4 Property ID: 123456789`. If missing, ask the user for it and add it to PRODUCT.md.
2. Read `state/seo-analysis.json` if it exists — GSC data to cross-reference against GA behavior.
3. Read `state/seo-audit.json` if it exists — latest audit results.

## Step 2: Collect GA4 Data

Pick the path that matches the user's setup:

### Option A: API (preferred)

Requires `google-service-account.json` in the project root (or auto-distribute root — discovered upward from `--project`) and the service account added as a Viewer on the GA4 property.

```bash
node {auto-distribute}/scripts/ga-report.mjs --property <GA4_PROPERTY_ID> --days 28 --project <project-path>
```

Writes `state/ga-report.json` with five reports:
- `summary` — totals over the window (sessions, users, engagement, conversions)
- `landing-pages` — top entry pages by sessions + engagement metrics
- `source-medium` — traffic-mix breakdown
- `ai-referrers` — sessions from ChatGPT / Perplexity / Claude / Gemini / etc. (regex-filtered)
- `conversions` — conversion events by name

If the API call fails (403 → service account not added as Viewer; 404 → wrong property ID; network → retry), fall back to Option B.

### Option B: CSV Export (fallback)

Guide the user to export from GA4 UI:
1. Go to Reports → Engagement → Landing page. Export CSV → save to `state/ga-landing-pages.csv`.
2. Reports → Acquisition → Traffic acquisition. Export CSV → save to `state/ga-source-medium.csv`.
3. (Optional) Reports → Engagement → Conversions. Export CSV → save to `state/ga-conversions.csv`.

Then read the CSVs directly and parse (headers vary by GA4 UI version — match columns by name, not position).

## Step 3: Analyze

Run these analyses over whatever data is available:

### 3a: Behavior by Landing Page

For each top landing page:

| Signal | Criteria | Action |
|--------|----------|--------|
| **High-bounce winner** | Many sessions, engagement rate < 40%, short avg duration | Title/page is acquiring clicks but the content isn't delivering — review intent-match, above-the-fold content |
| **Sticky page** | Engagement rate > 70%, avg duration > 2min | Working well — add internal links *to* it from other pages |
| **Dead weight** | Few sessions, low engagement | Candidate for consolidation or deletion |
| **Conversion magnet** | Above-average conversion rate | Understand why; replicate pattern elsewhere |

Cross-reference landing pages in GA vs winner pages in `state/seo-analysis.json` — pages that rank well in GSC but bounce in GA have a copy/content mismatch.

### 3b: Traffic Mix

Break down sessions by channel (source/medium):

| Channel | Typical health signal | Watch for |
|---------|----------------------|-----------|
| `google / organic` | Largest share for content sites | Compare GA sessions vs GSC clicks — big delta = attribution / cookie banner issue |
| `(direct) / (none)` | Repeat users + untagged traffic | Huge spike in direct often = missing UTM on campaign |
| `chatgpt.com / referral` | Emerging | **Track growth over time — this is the new organic** |
| `perplexity.ai / referral` | Emerging | Same as above |
| `claude.ai / referral` | Emerging | Same as above |
| Social (x.com, reddit.com) | Varies | Should correlate with `/social` activity |

### 3c: AI Referrer Callout

The `ai-referrers` report is the single most important new signal. Report:
- Total AI-referred sessions in the window
- Share of total (% of all sessions)
- Top AI sources
- Whether AI traffic's engagement rate beats/matches the site average — AI-assistant referrers often bring highly-qualified traffic

If AI-referred sessions are zero or trivial, that's a signal to prioritize the work in `AGENT-READINESS.md` (llms.txt, markdown negotiation, content signals) — the site isn't being cited by agents.

### 3d: Conversion Funnel

If conversion events are configured:
- Which landing pages drive the most conversions?
- Which sources have the best conversion rate?
- Are there pages with heavy traffic but zero conversions? (funnel leak)

If no conversion events are set up, flag this as a TODO — a SaaS product without GA4 conversion events is analytics-blind on the metric that matters.

## Step 4: Report

Present a `GA Audit: {product name}` report with the sections above. Highlight:
- **Top 3 wins** — pages/sources that are working
- **Top 3 leaks** — pages/sources with problems
- **AI traffic snapshot** — absolute numbers + month-over-month if prior data exists
- **Cross-signal anomalies** — e.g. "Page X gets 1000 GSC clicks but only 300 GA sessions" = attribution mismatch

Structure:

```markdown
# GA Audit: {product name}

**Period**: {last N days}
**Sessions**: {X} | **Engagement rate**: {X}% | **Conversions**: {X}

## Traffic Mix
{table or bullets by source/medium with share}

## AI Referrers
{sessions from ChatGPT / Perplexity / Claude / etc., trend if data exists}

## Landing Page Behavior
### Sticky (keep + amplify)
### High-bounce winners (fix intent match)
### Dead weight (consolidate/delete)

## Conversion Funnel
{events, top converting pages, leaks}

## Cross-Signal Anomalies
{GA vs GSC mismatches, direct-traffic spikes, etc.}

## Recommendations
1. {highest-leverage action — e.g. "Rewrite /pricing above-the-fold; 2000 sessions/mo with 20% engagement"}
2. ...
```

## Step 5: Save and Connect

1. Save the analysis to `state/ga-analysis.json` (separate from the raw `state/ga-report.json`).
2. Suggest next steps:
   - Run `/seo-audit` on high-bounce landing pages — title/meta mismatch is often the cause.
   - Run `/seo-content` for topics where AI referrers are already sending engaged traffic (the agents are already citing this content — expand it).
   - Re-run `/ga-audit` monthly to track AI-referrer growth.

## When to Run This

- **First time**: after 4+ weeks of GA4 data has accumulated
- **Ongoing**: monthly alongside `/seo-analyze`
- **After content changes**: 2-4 weeks post-change to measure behavior impact
