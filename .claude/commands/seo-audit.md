Audit a product's landing page for SEO issues and suggest fixes.

The user provides a URL or says "audit": $ARGUMENTS

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

## Step 3: Report

Present results as a scorecard:

```markdown
# SEO Audit: {product name}

**URL**: {url}
**Date**: {date}
**Score**: {X}/{total} checks passed

## Critical Issues (fix immediately)
- {issue}: {current state} → {recommendation}

## Warnings (should fix)
- {issue}: {current state} → {recommendation}

## Passed
- {check}: ✅

## Recommendations
1. {highest priority fix with specific code/content to add}
2. {next priority}
3. ...
```

## Step 4: Save and Suggest

1. Save results to `state/seo-audit.json`
2. If the product was built with auto-builder, suggest specific file edits:
   - `marketing/index.html` for meta tags, OG tags, structured data
   - `marketing/build.py` for sitemap generation
   - `marketing/robots.txt` for crawler directives
3. Suggest running `/search-console` to submit URLs for indexing
