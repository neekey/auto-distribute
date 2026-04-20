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
| `/social` | Post and engage on X and Reddit via Stride CLI |
| `/seo-audit` | Audit landing page SEO (meta tags, OG, sitemap, speed) + agent-readiness scan via isitagentready.com |
| `/seo-content` | Research keywords and generate SEO pages/blog content |
| `/seo-analyze` | Analyze Search Console data, measure content performance, recommend updates |
| `/ga-audit` | Audit GA4 behavior data — landing pages, traffic mix, AI referrers (ChatGPT / Perplexity / Claude) |
| `/search-console` | Google Search Console: submit URLs, check indexing |
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

## State Tracking

Distribution state is tracked in `state/` (gitignored):
- `state/submissions.json` — launch platform and directory submission status
- `state/social-posts.json` — social media posts history
- `state/seo-audit.json` — latest SEO audit results
- `state/search-console.json` — URL indexing submission tracking
- `state/seo-analysis.json` — GSC performance analysis data

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
