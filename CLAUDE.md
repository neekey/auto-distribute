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
| `/distribute` | Main entry point — analyze product and suggest distribution strategy |
| `/launch` | Submit to launch platforms (Product Hunt, Hacker News, etc.) |
| `/directories` | Find and submit to relevant directories |
| `/social` | Post and engage on X and Reddit via Stride CLI |
| `/seo-audit` | Audit landing page SEO (meta tags, OG, sitemap, speed) |
| `/search-console` | Google Search Console: submit URLs, check indexing |
| `/sync-template` | Pull latest commands/docs from the auto-distribute template repo |

## Project Config

Each product being distributed has a `PRODUCT.md` at the project root:

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

## State Tracking

Distribution state is tracked in `state/` (gitignored):
- `state/submissions.json` — launch platform and directory submission status
- `state/social-posts.json` — social media posts history
- `state/seo-audit.json` — latest SEO audit results

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
