# Auto-Distribute

A Claude Code command system for automating product distribution — launch platforms, directories, social media, and SEO.

## How It Works

Auto-distribute is a set of Claude Code commands (`.claude/commands/`) that orchestrate distribution tasks. It's not a web app — Claude runs everything in the terminal using CLI tools and web APIs.

**Key tools:**
- **Stride CLI** (`stride-cli`) — post/reply/search on X and Reddit via browser automation, no API keys
- **Web fetching** — audit landing pages, check SEO, research directories
- **File system** — track state in local markdown/JSON files

## Prerequisites

- `stride-cli` installed and logged in (`pip install stride-cli && stride setup && stride channel x login && stride channel reddit login`)
- Claude Code with web fetch capability

## Commands

| Command | Description |
|---------|-------------|
| `/distribute` | Main entry point — analyze product and create distribution strategy |
| `/submit` | Submit to launch platforms and directories (replaces `/launch` + `/directories`) |
| `/social` | Post and engage on X and Reddit via Stride CLI. Sub-commands: `/social reply <url>` (manual reply), `/social post <subreddit>` (manual post), `/social draft-queue` (walk the Notion Reddit-discovery queue and pre-draft replies; designed for headless `claude -e` after the daily discovery cron) |
| `/seo-audit` | Audit landing page SEO (meta tags, OG, sitemap, speed) + agent-readiness scan via isitagentready.com |
| `/seo-content` | Research keywords and generate SEO pages/blog content |
| `/seo-analyze` | Analyze Search Console data, measure content performance, recommend updates |
| `/ga-audit` | Audit GA4 behavior data — landing pages, traffic mix, AI referrers (ChatGPT / Perplexity / Claude) |
| `/search-console` | Google Search Console: submit URLs, check indexing |
| `/affiliate` | Set up an affiliate program — agreement, Tally application form, welcome email, optional Notion + Tally provisioning. See `AFFILIATE.md`. Sub-command: `/affiliate add <url> [context]` to manually add a creator (YouTube, Substack, LinkedIn, IG, TikTok, X) and draft platform-tailored outreach. |
| `/remind` | Create a local macOS Reminders entry for recurring review tasks (e.g., weekly `/social engage`). Use when remote `/schedule` can't (stride CLI is local-only). |
| `/sync-template` | Pull latest commands/docs from the auto-distribute template repo |

## Target Project

All commands support an optional `--project <path>` parameter to target a different project directory.

```bash
# Examples:
/distribute --project ~/workspaces/my-saas
/submit product hunt --project ~/workspaces/my-saas
/seo-audit --project ~/workspaces/my-saas
```

**How it works:** When `--project` is provided, all per-product files are read from and written to that directory instead of the current working directory:
- `PRODUCT.md`, `DISTRIBUTION.md` → target project
- `state/`, `assets/` → target project
- `PLATFORMS.md`, `.claude/commands/` → stay in auto-distribute (template files)

When `--project` is not provided, everything defaults to the current working directory (backwards compatible).

**Important:** When processing command arguments, extract and remove `--project <path>` before passing the rest to the command logic. For example, `/submit product hunt --project ~/workspaces/my-saas` → platform argument is "product hunt", project path is "~/workspaces/my-saas".

## Project Config

Each product being distributed has a `PRODUCT.md` at the project root (or at the target project root):

```markdown
# Product: {name}

{Description — what it does, who it's for, key features}

## URLs
- Website: {url}
- App: {url}
- GitHub: {url} (if applicable)

## Target Audience
{Who are the ideal users? What problem does this solve for them?}

## Positioning
{One-liner, tagline, key differentiators}

## Pricing
{Free / Freemium / Paid — brief pricing summary}
```

## Product Assets

Media assets are stored in `assets/` (gitignored):
- `assets/logo.png` — site logo (auto-fetched by `/distribute`)
- `assets/og-image.png` — OG image (auto-fetched by `/distribute`)
- `assets/favicon.png` — favicon (auto-fetched by `/distribute`)
- `assets/screenshot-*.png` — product screenshots (user-provided)
- `assets/demo.gif` / `assets/demo.mp4` — demo video (user-provided)

## Reference Docs

- `PROJECTS.md` — roster of products currently being distributed (paths, URLs, status)
- `PLATFORMS.md` — launch platforms and directories submitted to
- `AGENT-READINESS.md` — how to make sites discoverable/usable by AI agents (llms.txt, markdown negotiation, content signals, MCP server cards). `/seo-audit` scores against this via [isitagentready.com](https://isitagentready.com).
- `AFFILIATE.md` — affiliate program setup: decision framework, commission economics, defensive package, Stripe + Tally setup, Tally API gotchas, outreach patterns. Consumed by `/affiliate`.

## Scripts

Reusable scripts in `scripts/`:

### `scripts/ping-indexing.mjs` — Google Indexing API

Programmatically notify Google to re-crawl pages. Reads `sitemap.xml` or scans for `.html` files.

```bash
# Ping all pages in a directory
node scripts/ping-indexing.mjs --dir ~/workspaces/my-site/marketing --base-url https://www.example.com

# Ping a single URL
node scripts/ping-indexing.mjs --url https://www.example.com/new-page.html
```

**Prerequisites:**
1. Enable "Web Search Indexing API" in GCP Console
2. Place `google-service-account.json` in the project root (service accounts can be reused across GSC properties — just add the email as Owner on each)
3. Add the service account email as Owner in Google Search Console
4. `google-auth-library` must resolve from the script's location. Installed here in `auto-distribute/package.json` — run `npm install` in auto-distribute if `node_modules/` is missing.

The script auto-discovers the service account by searching upward from `--dir`. Rate limited to ~1 req/sec (~200/day per GCP project).

**Gotcha:** in `--url` mode the script walks up from `process.cwd()`, not the target project. Running from `auto-distribute/` without `--sa` (and without a service account in its tree) silently falls back to gcloud ADC and 403s. Either `cd` into the target project first, or pass `--sa <path>` explicitly. The script now prints which credential it's using at startup so this surfaces immediately.

**403 ACCESS_TOKEN_SCOPE_INSUFFICIENT** after enabling the Indexing API is usually propagation lag — retry in a few minutes before debugging further. It can also appear if the service account's email isn't an Owner on the specific GSC property format (domain vs URL-prefix) that matches the URL being submitted.

**Integrating with a project's deploy:** For projects behind a CDN (CloudFront, Cloudflare, etc.), run the ping **after** cache invalidation — otherwise Google fetches the stale cached HTML and re-indexes the old content. Typical deploy sequence for S3+CloudFront sites: `aws s3 sync` → `aws cloudfront create-invalidation` → `node ping-indexing.mjs`. The project's Makefile or deploy script can chain these together (see `~/workspaces/english-name-app/makefile` for a reference implementation).

### `scripts/ga-report.mjs` — GA4 Data API

Pulls five reports from GA4 (summary, landing pages, source/medium, AI referrers, conversions) and writes `state/ga-report.json`. Used by `/ga-audit`.

```bash
node scripts/ga-report.mjs --property 123456789 --days 28 --project ~/workspaces/my-site
```

**Prerequisites:**
1. Enable "Google Analytics Data API" in GCP Console (reuses same service account as Indexing API / GSC)
2. In GA4 Admin → Property Access Management, add the service account email as a Viewer
3. The GA4 property ID goes in the project's `PRODUCT.md` as `GA4 Property ID: 123456789`

### `scripts/gsc-report.mjs` — Search Console Search Analytics API

Pulls performance data (queries, pages, query×page, countries, devices, summary) from Google Search Console and writes `state/gsc-report.json`. Replaces manual CSV exports for `/seo-analyze`.

```bash
# All reports for the last 90 days
node scripts/gsc-report.mjs --site https://numblr.io/ --project ~/workspaces/numblr

# Compare current period to previous period of same length
node scripts/gsc-report.mjs --site https://numblr.io/ --days 28 --compare --project ~/workspaces/numblr

# Just one report
node scripts/gsc-report.mjs --site https://numblr.io/ --report query-page --limit 500
```

**Site URL format:** URL-prefix property → `https://example.com/` (trailing slash); domain property → `sc-domain:example.com`.

**Prerequisites:**
1. Enable **"Google Search Console API"** in GCP Console (separate from the Indexing API)
2. Reuses the same `google-service-account.json` already used for Indexing — no extra GSC permission setup needed if it's already an Owner
3. ~2-day reporting delay; the script automatically backs the end date off by 2 days to avoid partial-day rows

**Caveats:**
- API rows ≈ UI rows minus anonymized queries; totals may differ from CSV exports by a few %
- Default 250-row limit per report; raise with `--limit` (max 25,000 per call)

### `scripts/gsc-inspect.mjs` — Search Console URL Inspection API

Diagnoses indexing state per URL: indexed yes/no, coverage state ("Submitted and indexed", "Discovered - currently not indexed", "Crawled - currently not indexed"), last crawl time, Google's chosen canonical vs. declared canonical. Use when pinged URLs aren't appearing in search.

```bash
# Single URL
node scripts/gsc-inspect.mjs --site https://numblr.io/ --url https://numblr.io/blogs/foo

# All URLs from a sitemap (URL or local file)
node scripts/gsc-inspect.mjs --site https://numblr.io/ --sitemap https://numblr.io/sitemap --project ~/workspaces/numblr

# Re-check everything we previously submitted via /search-console
node scripts/gsc-inspect.mjs --site https://numblr.io/ --from-submissions --project ~/workspaces/numblr
```

**Prerequisites:** same GCP API enablement as `gsc-report.mjs` (one-time per project).

**Quotas:** 2,000 inspections/day per property, 600/min. Script rate-limits to ~5/sec. Use `--max N` to cap large runs.

**Output:** writes `state/gsc-index-status.json` with a `summary` bucket count and per-URL details.

### `scripts/build-affiliate-form.mjs` — Tally affiliate-application form builder

Builds and POSTs (or PATCHes) a Tally affiliate-application form from a per-product JSON config. Used by `/affiliate`.

```bash
# Create a new form
TALLY_API_KEY=tly-... node scripts/build-affiliate-form.mjs --config affiliate/tally-form-config.json

# Update an existing form (replaces the entire blocks array — regenerate from config; do NOT echo back GET-response fields)
TALLY_API_KEY=tly-... node scripts/build-affiliate-form.mjs --config affiliate/tally-form-config.json --patch <form-id>
```

Config schema and Tally API gotchas (post-2026-02 schema validation) are documented in `AFFILIATE.md` § "Tally application form setup".

**Prerequisites:**
1. Tally account; Settings → API → create API key
2. `TALLY_API_KEY` env var set when running the script

**What needs the Tally UI (no API):** email notifications, submission redirect, captcha, custom theme. Configure these manually after the form is created.

### `scripts/notion-cli.mjs` — Notion REST API helper

Thin CLI over the official `@notionhq/client` SDK for `/social draft-queue`, `/social reply <url>` (queue lookup), and `/affiliate add` (Notion tracking path). Replaces the `mcp__notion__*` tools, which gate some operations behind enterprise plans and aren't reliable for headless `claude -e` runs.

```bash
# Find New rows in a discovery DB, sorted by Reddit Score
node scripts/notion-cli.mjs query --database <db-id> \
  --filter '{"property":"Status","select":{"equals":"New"}}' \
  --sorts '[{"property":"Reddit Score","direction":"descending"}]' --max 5

# Look up a queue row by URL
node scripts/notion-cli.mjs find-by-url --database <db-id> --url <reddit-url>

# Read a draft from the page body
node scripts/notion-cli.mjs get-page-body --page <page-id>

# Replace the page body with a draft (paragraphs split on blank lines)
node scripts/notion-cli.mjs replace-page-body --page <page-id> --content-file /tmp/draft.txt

# Update properties (Notion v1 shape)
node scripts/notion-cli.mjs update-properties --page <page-id> \
  --properties '{"Status":{"select":{"name":"Reply Drafted"}}}'

# Create a page in a database
node scripts/notion-cli.mjs create-page --database <db-id> \
  --properties '{"Name":{"title":[{"text":{"content":"..."}}]}}' [--body-file <path>]
```

All subcommands write JSON to stdout, log to stderr, exit non-zero on error. Properties use the raw Notion v1 shape (same as the SDK).

**Prerequisites:**
1. Create a Notion internal integration at https://www.notion.so/profile/integrations → copy the secret (starts with `secret_` or `ntn_`).
2. In Notion, open the parent page that contains your databases → "..." menu → Connections → add the integration. Access propagates to child databases.
3. Set `NOTION_API_KEY` in your shell env (or `direnv` per-project).
4. `npm install` in auto-distribute if `node_modules/@notionhq/client` is missing.

The Reddit-discovery Notion DBs are now populated manually — the Windmill flow that used to write candidates on a daily cron was removed on 2026-08-16. `/social draft-queue` still walks whatever `Status: New` rows exist.

## State Tracking

Distribution state is tracked in `state/` (gitignored):
- `state/submissions.json` — launch platform and directory submission status
- `state/social-posts.json` — social media posts history
- `state/seo-audit.json` — latest SEO audit results
- `state/search-console.json` — URL indexing submission tracking
- `state/seo-analysis.json` — GSC performance analysis data
- `state/gsc-report.json` — raw GSC Search Analytics output (queries, pages, etc.)
- `state/gsc-index-status.json` — per-URL index status from URL Inspection API
- `state/affiliate-program.json` — affiliate program metadata, creator roster, monthly payouts

## Stride CLI Reference

```bash
# X (Twitter)
stride channel x post "tweet text"
stride channel x reply https://x.com/user/status/123 "reply text"
stride channel x search "query" --max 50 --json
stride channel x feed --max 100 --json

# Reddit
stride channel reddit post --subreddit name --title "Title" --body "Body"
stride channel reddit reply https://reddit.com/r/sub/comments/abc/title "reply"
stride channel reddit search "query" --subreddit name --sort relevance --time week --max 30 --json
stride channel reddit browse subreddit --sort hot --max 30 --json
stride channel reddit comments https://reddit.com/r/sub/comments/abc/title --max 50 --json

# Status
stride daemon status
stride channel x status
stride channel reddit status
```
