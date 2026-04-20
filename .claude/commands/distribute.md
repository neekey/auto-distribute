Analyze a product and create a distribution strategy.

The user provides product context: $ARGUMENTS

## Step 0: Resolve Project Path

Check if `$ARGUMENTS` contains `--project <path>`. If yes, extract the path and use it as the base directory for all per-product files (`PRODUCT.md`, `DISTRIBUTION.md`, `state/`, `assets/`). Remove `--project <path>` from arguments before processing. Template files (`PLATFORMS.md`) are always read from the auto-distribute directory.

If no `--project`, use the current working directory.

## Step 1: Understand the Product

If `PRODUCT.md` exists at the project root (or target project), read it. Otherwise, ask the user:

1. **Product name** and URL
2. **What it does** — one paragraph description
3. **Target audience** — who are the ideal users?
4. **Positioning** — what makes it different? One-liner tagline?
5. **Pricing** — free, freemium, paid?
6. **Current state** — just launched? Has users? Looking for initial traction?

Generate `PRODUCT.md` from their answers.

## Step 2: Research & Extract

1. **Fetch the product's landing page** — extract:
   - Product name, tagline, and headline copy
   - Feature descriptions and benefit statements
   - Pricing information
   - Meta title, meta description, OG tags
   - Any existing social proof (testimonials, user counts, logos)
   - Tech stack or integration mentions
   - Competitor positioning clues

2. **Extract and save media assets** — create `assets/` directory if it doesn't exist, then:
   - Parse the page HTML for logo (`<link rel="icon">`, `<link rel="apple-touch-icon">`, logo `<img>` in header/nav), OG image (`<meta property="og:image">`), and favicon
   - Download each to `assets/`:
     ```bash
     mkdir -p assets
     curl -L -o assets/og-image.png "{og:image URL}"
     curl -L -o assets/logo.png "{logo URL}"
     curl -L -o assets/favicon.png "{favicon URL}"
     ```
   - Report what was saved and what was missing

3. **Search X and Reddit** for the problem domain:
   ```bash
   stride channel x search "{problem keywords}" --max 30 --json
   stride channel reddit search "{problem keywords}" --max 30 --json
   ```

4. Identify:
   - Which communities are discussing this problem
   - What language/terms people use (for copy)
   - Competitors being mentioned
   - Gaps in existing solutions people complain about

## Step 2.5: Language / Locale Consideration

Before generating the plan, decide whether this product warrants a multi-locale strategy. Apply this heuristic:

- **Locale-specific value** — the product's core utility only makes sense in one language (e.g. Zahlhaus teaches listening to *German* numbers; an English/Spanish version would be a different product). → Recommend a **separate domain per locale**, each with its own keywords, distribution channels, and potentially a different name. Treat as sibling products, not translations.
- **Language-agnostic utility with translatable chrome** — the core logic is universal, only UI copy needs translating (e.g. a unit converter, a markdown formatter, Numblr's number-to-words). → Recommend **one domain with `/en/`, `/de/`, `/es/` subdirectories** and `hreflang` tags. Distribution channels can overlap; SEO keywords need per-locale research.
- **English-only makes sense** — audience is global tech / developer / B2B where English dominates, or the cost of translation exceeds the incremental audience. → Skip i18n.

Ask the user (or infer from the product):
- Who are the ideal users by region? (If they're concentrated in non-English markets, that's a signal.)
- Is the value proposition tied to a specific language's structure, grammar, or cultural context?
- Are there existing competitors serving non-English markets poorly?

Capture the decision in DISTRIBUTION.md under "Locale Strategy" (see template below). If multi-locale is recommended, also note: per-locale `llms.txt`, `hreflang` tags, separate Search Console properties, and localized OG images.

Related existing products in this toolkit for reference: **Numblr** (english-only number-to-words, could expand) and **Zahlhaus** (German listening trainer, sibling to Numblr — not a translation).

## Step 3: Generate Copy & Distribution Plan

Using the landing page content, social research, and PRODUCT.md, **auto-generate all submission copy**. Do not leave placeholders — write real, usable copy based on what was extracted. The user can refine later.

Generate `DISTRIBUTION.md` with a prioritized plan:

```markdown
# Distribution Plan: {product name}

**Generated**: {date}

## Locale Strategy

- **Approach**: {one-domain-translated | sibling-domains-per-locale | english-only}
- **Reasoning**: {why — locale-specific value vs translatable vs global tech audience}
- **Locales in scope**: {e.g. en, de, es — or "en only"}
- **Action items** (if multi-locale): hreflang tags, per-locale llms.txt, separate GSC properties, localized OG images, separate keyword research per locale.

## Priority 1: Launch Platforms & Directories (Week 1)

### Launch Platforms
| Platform | Fit | Status | Notes |
|----------|-----|--------|-------|
| Product Hunt | {high/medium/low} | pending | {why it fits or doesn't} |
| Hacker News (Show HN) | {fit} | pending | {notes} |
| Indie Hackers | {fit} | pending | |
| BetaList | {fit} | pending | |
| ... | | | |

### Directories
| Directory | Category | Status | Notes |
|-----------|----------|--------|-------|
| AlternativeTo | {category} | pending | alternative to {competitor} |
| SaaSHub | {category} | pending | |
| {niche directories} | | pending | |
| ... | | | |

## Priority 2: Social Media (Week 1-2)

### X Strategy
- **Announcement post**: {draft}
- **Engagement targets**: {subreddits, hashtags, accounts to engage with}
- **Search queries to monitor**: {list}

### Reddit Strategy
- **Target subreddits**: {list with subscriber counts and rules summary}
- **Post approach per subreddit**: {educational/showcase/ask for feedback — varies by community}

## Priority 3: SEO (Week 2+)

- Current SEO score: {from audit}
- Missing meta tags / OG tags
- Search Console status
- Target keywords: {list}
- Content opportunities: {blog post ideas targeting search terms}

## Submission Assets

Standard copy and assets reused across launch platforms, directories, and social media.
All copy below is auto-generated from the product landing page — review and refine as needed.

### Copy
- **One-liner**: {write a real tagline based on landing page, ~60 chars}
- **Short description**: {write 1-2 sentences from page headline + subheadline, ~150 chars}
- **Medium description**: {write 1 paragraph combining key value prop + differentiator, ~300 chars}
- **Long description**: {write 2-3 paragraphs covering what it does, key features, who it's for, and what makes it different}
- **Problem statement**: {write the pain point based on landing page messaging and social research}
- **Key features**: {extract 3-5 features from the landing page}
- **Competitor alternatives**: {identify competitors from landing page positioning and social research}

### Platform-Specific Copy
- **Tweet-length**: {write a compelling tweet, 280 chars, conversational tone}
- **Reddit title**: {write titles for different subreddits — educational/question format}
- **Product Hunt tagline**: {write PH-style tagline, 60 chars, benefit-focused}
- **Product Hunt description**: {write PH description, 260 chars}
- **Product Hunt maker's comment**: {write 2-3 paragraph authentic maker story}
- **HN Show HN title**: {Show HN: Product — concise technical description}
- **HN first comment**: {write technical backstory — problem, how you built it, what's different}

### Assets (`assets/` directory)

Auto-fetched from product website:
- [{saved|missing}] `assets/logo.png` — site logo
- [{saved|missing}] `assets/og-image.png` — OG image (1200x630)
- [{saved|missing}] `assets/favicon.png` — favicon

Manual (user needs to prepare):
- [ ] `assets/screenshot-1.png`: {specific screen — e.g. main dashboard}
- [ ] `assets/screenshot-2.png`: {specific screen — e.g. key feature in action}
- [ ] `assets/screenshot-3.png`: {specific screen — e.g. results/output}
- [ ] `assets/demo.gif` or `assets/demo.mp4` (optional, for Product Hunt gallery)

### Metadata
- **Category/tags**: {list of relevant categories}
- **Pricing summary**: {free / freemium / paid — brief}
- **Founders**: {names and roles}
```

## Step 4: Next Steps

Tell the user:
- Review `DISTRIBUTION.md` and adjust priorities
- Run `/submit` to start submitting to launch platforms and directories
- Run `/social` to start social media distribution
- Run `/seo-audit` to audit and fix SEO issues
