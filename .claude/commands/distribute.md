Analyze a product and create a distribution strategy.

The user provides product context: $ARGUMENTS

## Step 1: Understand the Product

If `PRODUCT.md` exists at the project root, read it. Otherwise, ask the user:

1. **Product name** and URL
2. **What it does** — one paragraph description
3. **Target audience** — who are the ideal users?
4. **Positioning** — what makes it different? One-liner tagline?
5. **Pricing** — free, freemium, paid?
6. **Current state** — just launched? Has users? Looking for initial traction?

Generate `PRODUCT.md` from their answers.

## Step 2: Research

1. **Fetch the product's landing page** — understand the current messaging, features listed, and SEO state
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

## Step 3: Distribution Plan

Generate `DISTRIBUTION.md` with a prioritized plan:

```markdown
# Distribution Plan: {product name}

**Generated**: {date}

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

### Copy
- **One-liner**: {tagline, ~60 chars}
- **Short description**: {1-2 sentences, ~150 chars}
- **Medium description**: {1 paragraph, ~300 chars}
- **Long description**: {2-3 paragraphs, features + differentiators + audience}
- **Problem statement**: {what pain point does this solve}
- **Key features**: {bullet list of 3-5 features}
- **Competitor alternatives**: {list — for AlternativeTo-style sites}

### Platform-Specific Copy
- **Tweet-length**: {280 chars}
- **Reddit title**: {for different subreddits}
- **Product Hunt tagline**: {60 chars}
- **Product Hunt description**: {260 chars}
- **HN Show HN title**: {format: Show HN: Product — description}

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
- Run `/launch` to start submitting to launch platforms
- Run `/directories` to find and submit to directories
- Run `/social` to start social media distribution
- Run `/seo-audit` to audit and fix SEO issues
