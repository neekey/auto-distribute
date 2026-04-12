Research keywords and generate SEO-optimized pages and blog content to drive organic traffic.

The user provides context or a specific content type: $ARGUMENTS

## Step 0: Resolve Project Path

Check if `$ARGUMENTS` contains `--project <path>`. If yes, extract the path and use it as the base directory for all per-product files (`PRODUCT.md`, `DISTRIBUTION.md`, `state/`). Remove `--project <path>` from arguments before processing.

If no `--project`, use the current working directory.

## Step 1: Read Context

1. Read `PRODUCT.md` — product details, target audience, positioning.
2. Read `DISTRIBUTION.md` — if exists, check SEO section for target keywords and content opportunities.
3. Read `state/seo-audit.json` — if exists, check for keyword gaps and recommendations.
4. If none of these exist, ask the user to run `/distribute` first, or provide the product URL and target audience.

## Step 2: Keyword Research

Fetch the product's landing page and research the keyword landscape:

1. **Extract seed keywords** from the landing page (headlines, features, meta tags, CTAs)
2. **Research competitor keywords** — fetch competitor landing pages (from Submission Assets → Competitor alternatives) and extract their keywords, page titles, headings
3. **Search social for problem language**:
   ```bash
   stride channel x search "{problem domain}" --max 30 --json
   stride channel reddit search "{problem keywords}" --subreddit {relevant} --max 30 --json
   ```
4. **Identify keyword clusters** by intent:
   - **Problem-aware**: "how to {solve problem}", "why is {problem} so hard"
   - **Solution-aware**: "best {category} tools", "top {category} software 2026"
   - **Comparison**: "{product} vs {competitor}", "{competitor} alternative"
   - **Use-case specific**: "{product category} for {audience}", "{category} for {industry}"
   - **Long-tail**: specific questions people ask in forums/Reddit about this domain

## Step 3: Content Plan

Generate a prioritized content plan based on the keyword research. Present it to the user:

```markdown
# SEO Content Plan: {product name}

**Generated**: {date}

## Priority 1: High-Intent Pages (create on your site)

### Comparison Pages
| Page | Target Keyword | Search Intent | Priority |
|------|---------------|---------------|----------|
| /compare/{competitor} | "{product} vs {competitor}" | Bottom-funnel | High |
| /alternative-to/{competitor} | "{competitor} alternative" | Bottom-funnel | High |

### Use Case Landing Pages
| Page | Target Keyword | Audience | Priority |
|------|---------------|----------|----------|
| /use-cases/{use-case} | "{category} for {audience}" | {segment} | High |
| /for/{audience} | "{category} for {industry}" | {segment} | Medium |

### Integration Pages (if applicable)
| Page | Target Keyword | Priority |
|------|---------------|----------|
| /integrations/{tool} | "{product} {tool} integration" | Medium |

## Priority 2: Blog Content (educational, top-of-funnel)

### How-To / Tutorial Posts
| Title | Target Keyword | Search Intent |
|-------|---------------|---------------|
| "How to {solve problem} in 2026" | "{solve problem}" | Problem-aware |
| "Complete Guide to {topic}" | "{topic} guide" | Educational |

### Listicle / Roundup Posts
| Title | Target Keyword | Notes |
|-------|---------------|-------|
| "Best {category} Tools in 2026" | "best {category} tools" | Include your product naturally |
| "Top {N} Ways to {solve problem}" | "{solve problem}" | Feature product as one solution |

### Problem-Aware Posts
| Title | Target Keyword | Notes |
|-------|---------------|-------|
| "Why {problem} Happens and How to Fix It" | "{problem}" | Diagnose → solve → product CTA |

## Priority 3: Programmatic / Template Pages (scale SEO)

If applicable, suggest template-based pages that can be generated at scale:
- /{category}/{item} — e.g., per-feature, per-integration, per-use-case pages
- /glossary/{term} — domain-specific terms
- /templates/{template-name} — if product has templates
```

## Step 4: Generate Content

For each piece of content the user selects, generate the full page/post:

### For Site Pages (comparison, use-case, integration)

Generate complete HTML-ready content:
- **Title tag** (under 60 chars, includes target keyword)
- **Meta description** (under 160 chars, includes CTA)
- **H1** (matches target keyword naturally)
- **Page body** — structured with H2/H3 headings, written for the target audience:
  - Comparison pages: fair side-by-side comparison, feature table, "who should choose what" conclusion, clear CTA
  - Use case pages: problem context for this audience, how the product solves it, specific features that matter, social proof, CTA
  - Integration pages: what the integration does, how to set it up, benefits, CTA
- **Internal links** — link to pricing, sign-up, related pages
- **Schema markup** — appropriate JSON-LD (FAQ, HowTo, SoftwareApplication)

### For Blog Posts

Generate the full post:
- **Title** (click-worthy, includes keyword, under 60 chars)
- **Meta description** (under 160 chars)
- **Body** — structured with clear headings, 800-1500 words:
  - How-to posts: step-by-step format, actionable, code snippets if relevant
  - Listicles: numbered format, brief evaluation of each item, product included naturally (not first)
  - Problem-aware: empathize with problem → explain why it happens → present solutions → product as one option
- **CTA** — natural call-to-action at end, not salesy
- **Internal links** — to product pages, related posts
- **Image suggestions** — what screenshots or diagrams would help

### Writing Guidelines
- Write for humans first, search engines second
- Use the exact language and terms found in social research (how real users talk about this problem)
- Don't keyword-stuff — use target keyword in title, H1, first paragraph, and 2-3 times naturally in body
- Include related keywords and synonyms throughout
- For comparison pages: be genuinely fair — credibility builds trust and Google rewards it
- For blog posts: provide real value — don't just promote the product

## Step 5: Save and Track

1. Save the content plan to `state/seo-content-plan.json`:
   ```json
   {
     "keywords": ["keyword1", "keyword2"],
     "pages": [
       { "type": "comparison", "path": "/compare/competitor", "keyword": "...", "status": "draft_ready" },
       { "type": "blog", "title": "How to...", "keyword": "...", "status": "draft_ready" }
     ]
   }
   ```
2. Present the generated content to the user for review
3. Suggest next steps:
   - Add pages to the product site
   - Run `/seo-audit` after publishing to verify meta tags
   - Run `/search-console` to submit new URLs for indexing
   - Run `/social` to promote key posts
   - Revisit in 2-4 weeks to check rankings and create more content
