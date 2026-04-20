# Agent Readiness

How to make a product site discoverable and usable by AI agents (ChatGPT, Claude, Perplexity, etc.) — not just traditional search crawlers.

Based on [Cloudflare's agent-readiness model](https://blog.cloudflare.com/agent-readiness/). Scanner: [isitagentready.com](https://isitagentready.com) (free, has `POST /api/scan` returning JSON).

## Why this matters

Google-SEO optimizes for keyword matching and link graphs. Agent-readiness optimizes for *token efficiency and machine-readable structure*: agents consume content with a context budget, so sites that serve markdown directly, advertise their structure, and expose capabilities are cheaper and faster to use — which biases agents toward citing them.

Cloudflare's own docs saw **31% fewer tokens consumed** and **66% faster** agent responses after adopting these standards.

## Scoring

isitagentready.com scores a site 1–5:

| Level | Name | Minimum bar |
|-------|------|-------------|
| 1 | Basic Web Presence | robots.txt + sitemap |
| 2 | Crawler-Friendly | + AI bot rules, content signals |
| 3 | Agent-Readable | + markdown negotiation, Link headers |
| 4 | Agent-Usable | + API catalog, MCP server card, OAuth discovery |
| 5 | Agent-Commerce | + x402 / ACP / UCP / AP2 payment protocols |

Most SaaS landing pages only need **Level 3**. Level 4+ only applies if the product exposes an agent-callable service.

## Checks (18 total, 5 categories)

### Discoverability (3 checks — essential)

1. **robots.txt** — must exist at `/robots.txt`, valid format.
2. **sitemap.xml** — must exist, ideally linked from `robots.txt` via `Sitemap:` directive.
3. **Link headers** — HTTP `Link:` response headers surfacing canonical/alternate/llms.txt URLs. Low-effort, low-impact; skip unless already at Level 3.

### Content Accessibility (1 check — high impact)

4. **Markdown negotiation** — when an agent sends `Accept: text/markdown`, serve a markdown version of the page. Alternative: expose `/index.md` and `/path/to/page.md` URLs. This is the single biggest token saver.

   **Also relevant but not checked by the scanner:**
   - **llms.txt** — plain-text index at `/llms.txt` listing important URLs and a one-line description each. See [llmstxt.org](https://llmstxt.org) for the spec. Split into `llms.txt` (overview) and `llms-full.txt` (full content) if content is large.

### Bot Access Control (3 checks)

5. **robots.txt AI rules** — either explicit `User-agent: GPTBot` / `Claude-Web` / etc. directives, or wildcard rules that apply to all. Checked bots: gptbot, chatgpt-user, google-extended, ccbot, anthropic-ai, claude-web, bytespider, perplexitybot, cohere-ai, applebot-extended, amazonbot, meta-externalagent, facebookbot, omgilibot, diffbot.
6. **Content Signals** — [Cloudflare's content-signals syntax](https://blog.cloudflare.com/content-signals-policy/) in robots.txt stating whether content can be used for AI training (`train-ai`), inference (`ai-input`), search (`search`). Example:
   ```
   User-agent: *
   Content-signal: train-ai=no, ai-input=yes, search=yes
   ```
7. **Web Bot Auth** — `/.well-known/http-message-signatures-directory` for bots to authenticate via HTTP Message Signatures. Informational only; rarely needed.

### Discovery / Capabilities (7 checks — only if product exposes a service)

8. **API Catalog** — `/.well-known/api-catalog` listing OpenAPI/JSON endpoints.
9. **OAuth Discovery** — `/.well-known/oauth-authorization-server` (RFC 8414).
10. **OAuth Protected Resource** — `/.well-known/oauth-protected-resource` (RFC 9728).
11. **MCP Server Card** — `/.well-known/mcp/server-card.json` if the product offers an MCP server.
12. **A2A Agent Card** — `/.well-known/agent-card.json` for agent-to-agent protocol.
13. **Agent Skills** — `/.well-known/agent-skills/index.json` listing discrete skills the service offers.
14. **WebMCP** — inline MCP tool declarations in page HTML.

### Commerce (4 checks — only for products that sell via agents)

15. **x402** — HTTP 402 Payment Required protocol support.
16. **UCP** — Universal Commerce Protocol profile at `/.well-known/ucp`.
17. **ACP** — Agent Commerce Protocol discovery document.
18. **AP2** — Agent Payments v2 via A2A Agent Card.

## Priority checklist for a typical SaaS landing page

**Must-have (Level 2-3):**
- [ ] `/robots.txt` exists and addresses AI crawlers (or has a `User-agent: *` fallback)
- [ ] `/sitemap.xml` exists and is linked from robots.txt
- [ ] Content-Signals directive in robots.txt (at least `train-ai=no` or `yes`, whichever is intended)
- [ ] `/llms.txt` at site root with structured URL list
- [ ] Markdown version of each indexable page — via `Accept: text/markdown` header negotiation OR `.md` URL fallbacks

**Nice-to-have (Level 3+):**
- [ ] `Link:` HTTP headers pointing to llms.txt, alternate markdown versions
- [ ] Hidden `<meta>` tags or comments in HTML pointing to markdown equivalents

**Only if the product has an agent-callable API / MCP server:**
- [ ] `/.well-known/api-catalog`
- [ ] `/.well-known/mcp/server-card.json`
- [ ] `/.well-known/oauth-authorization-server` (if authenticated)
- [ ] `/.well-known/agent-skills/index.json`

## llms.txt structure (recommended)

```markdown
# Product Name

> One-line description of what the product is.

Longer paragraph if useful. Keep the whole file short — agents load it eagerly.

## Core

- [Homepage](https://example.com/index.md): Product overview
- [Pricing](https://example.com/pricing.md): Plans and costs
- [Docs](https://example.com/docs/index.md): Developer documentation

## Optional

- [Blog](https://example.com/blog/index.md): Articles and updates
- [Changelog](https://example.com/changelog.md): Release notes
```

Keep `llms.txt` under ~5KB. Put full content in `llms-full.txt` if needed.

## Serving markdown

Two options — pick whichever fits the stack:

**Option A: Content negotiation** (preferred)
```
GET /pricing
Accept: text/markdown

→ 200 OK
Content-Type: text/markdown; charset=utf-8

# Pricing
...
```

**Option B: `.md` URL fallback** (simpler for static sites)
```
/pricing      → HTML
/pricing.md   → Markdown
/index.md     → Markdown homepage
```

For static site generators, generate both during build. For server-rendered sites, check `Accept` header and branch.

## Multi-locale sites

If the product serves multiple languages via subdirectories (`/en/`, `/de/`), the agent-readiness setup multiplies:

- **Per-locale `llms.txt`** — `/llms.txt` for the default locale, plus `/de/llms.txt`, `/es/llms.txt`, etc. Each lists only that locale's URLs. Cross-link from the root `llms.txt` with a "Languages" section.
- **`hreflang` annotations** — beyond the HTML `<link rel="alternate" hreflang="de">` tags (which Google uses), also expose them in HTTP `Link:` headers so agents that don't parse HTML see them.
- **Markdown URLs per locale** — `/de/pricing.md` should return German content; `Accept: text/markdown` negotiation should respect locale prefixes.
- **Content signals** — robots.txt directives apply site-wide, so one `Content-Signal` block covers all locales.

If the product is split across **sibling domains per locale** (e.g. numblr.io + zahlhaus.com as separate products), each domain is audited independently — there's no cross-domain hreflang obligation, and each domain gets its own `llms.txt` / GSC property / scan.

See `/distribute` → "Locale Strategy" for choosing between the two approaches.

## How to run a scan

```bash
curl -sS -X POST https://isitagentready.com/api/scan \
  -H "Content-Type: application/json" \
  -d '{"url":"https://your-site.com"}' | jq
```

Returns JSON with `level`, `levelName`, and `checks.{category}.{checkName}.status` for each of the 18 checks. `/seo-audit` folds this into the audit scorecard automatically.
