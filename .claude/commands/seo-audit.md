Audit a product's landing page for SEO issues and suggest fixes.

The user provides a URL or says "audit": $ARGUMENTS

## Step 0: Resolve Project Path

Check if `$ARGUMENTS` contains `--project <path>`. If yes, extract the path and use it as the base directory for all per-product files (`PRODUCT.md`, `state/`). Remove `--project <path>` from arguments before processing.

If no `--project`, use the current working directory.

## Step 1: Read Context

1. Read `PRODUCT.md` — get the product URL. If no URL provided in arguments, use the website URL from PRODUCT.md.
2. If no PRODUCT.md and no URL in arguments, ask for the URL.

## Step 2: Fetch and Analyze

Fetch the landing page and check:

### Technical SEO
- [ ] **Title tag** — exists, under 60 chars, includes primary keyword
- [ ] **Meta description** — exists, under 160 chars, includes CTA
- [ ] **H1 tag** — exactly one, matches page topic
- [ ] **H2-H6 hierarchy** — logical heading structure
- [ ] **Canonical URL** — set correctly
- [ ] **Robots meta** — not accidentally blocking indexing
- [ ] **Language attribute** — `<html lang="en">` set

### Open Graph / Social
- [ ] **og:title** — set
- [ ] **og:description** — set
- [ ] **og:image** — set, 1200x630px recommended
- [ ] **og:url** — set
- [ ] **twitter:card** — set (summary_large_image preferred)
- [ ] **twitter:title** — set
- [ ] **twitter:description** — set
- [ ] **twitter:image** — set

### Content
- [ ] **Keyword usage** — primary keyword in title, H1, first paragraph, URL
- [ ] **Alt text on images** — all images have descriptive alt text
- [ ] **Internal links** — links to app, pricing, docs if applicable
- [ ] **External links** — any broken links?
- [ ] **Content length** — sufficient for the page type

### Infrastructure
- [ ] **HTTPS** — site uses HTTPS
- [ ] **Sitemap** — `/sitemap.xml` exists and is valid
- [ ] **Robots.txt** — `/robots.txt` exists, not blocking important pages
- [ ] **Favicon** — exists
- [ ] **Mobile viewport** — `<meta name="viewport">` set

### Structured Data
- [ ] **JSON-LD** — SoftwareApplication or Organization schema present
- [ ] **Breadcrumbs** — if multi-page site

## Step 2.5: Agent Readiness Scan

Run isitagentready.com's scanner to check how well the site supports AI agents (ChatGPT, Claude, Perplexity, etc.). This is distinct from Google-SEO — it covers llms.txt, markdown content negotiation, AI-bot robots rules, content signals, and `/.well-known/` endpoints.

See `AGENT-READINESS.md` at the auto-distribute root for the full reference (what each check means, priority by product type, fix patterns).

Run the scan:

```bash
curl -sS -X POST https://isitagentready.com/api/scan \
  -H "Content-Type: application/json" \
  -d '{"url":"<product URL>"}'
```

Parse the JSON response. Expected shape:
- `level` (1–5), `levelName` — overall agent-readiness score
- `checks.discoverability` — `robotsTxt`, `sitemap`, `linkHeaders`
- `checks.contentAccessibility` — `markdownNegotiation`
- `checks.botAccessControl` — `robotsTxtAiRules`, `contentSignals`, `webBotAuth`
- `checks.discovery` — `apiCatalog`, `oauthDiscovery`, `oauthProtectedResource`, `mcpServerCard`, `a2aAgentCard`, `agentSkills`, `webMcp`
- `checks.commerce` — `x402`, `ucp`, `acp`, `ap2`

Each check has `status` (`pass`/`fail`/`neutral`) and `message`.

**How to interpret results by product type:**
- **Content site / SaaS landing page** — only `discoverability`, `contentAccessibility`, and `botAccessControl` categories matter. Target Level 3 ("Agent-Readable"). Ignore `discovery` and `commerce` failures.
- **Product exposing an API or MCP server** — `discovery` category matters. Target Level 4.
- **Product selling to agents** — `commerce` category matters. Target Level 5.

If the scan fails (network error, 429 rate limit, or `siteError` in response), note it and continue with the SEO audit. Retry once after ~10s for 429s.

## Step 3: Report

Present results as a scorecard:

```markdown
# SEO Audit: {product name}

**URL**: {url}
**Date**: {date}
**SEO Score**: {X}/{total} checks passed
**Agent Readiness**: Level {1-5} ({levelName}) — {passed}/{relevant} relevant checks passed

## Critical Issues (fix immediately)
- {issue}: {current state} → {recommendation}

## Warnings (should fix)
- {issue}: {current state} → {recommendation}

## Agent Readiness (see AGENT-READINESS.md for fix patterns)
- Failing: {check name} — {message}
- ...
(Only list failures in categories relevant to this product type — see Step 2.5.)

## Passed
- {check}: ✅

## Recommendations
1. {highest priority fix with specific code/content to add}
2. {next priority}
3. ...
```

## Step 4: Save and Suggest

1. Save results to `state/seo-audit.json`. Include a top-level `agentReadiness` key with the full scan JSON (or `{ "error": "..." }` if the scan failed) so `/seo-analyze` and follow-up audits can diff against it.
2. If the product was built with auto-builder, suggest specific file edits:
   - `marketing/index.html` for meta tags, OG tags, structured data
   - `marketing/build.py` for sitemap generation, llms.txt, and `.md` fallbacks
   - `marketing/robots.txt` for crawler directives and Content-Signals
3. For agent-readiness fixes, point the user at `AGENT-READINESS.md` for the full fix patterns (llms.txt template, markdown negotiation, content signals syntax).
4. Suggest running `/search-console` to submit URLs for indexing.
