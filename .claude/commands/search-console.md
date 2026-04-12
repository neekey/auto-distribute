Manage Google Search Console: submit URLs for indexing and check status.

The user provides context: $ARGUMENTS

## Step 0: Resolve Project Path

Check if `$ARGUMENTS` contains `--project <path>`. If yes, extract the path and use it as the base directory for all per-product files (`PRODUCT.md`, `state/`). Remove `--project <path>` from arguments before processing.

If no `--project`, use the current working directory.

## Step 1: Read Context

1. Read `PRODUCT.md` — get the product URL.
2. If no PRODUCT.md, ask for the site URL.

## Step 2: Determine Action

The user can request:
- **"submit"** — submit URLs for indexing
- **"status"** — check indexing status
- **"setup"** — guide through Search Console setup

If unclear, default to "setup" if first time, "status" otherwise.

## Step 3: Setup Guide (if needed)

If the user hasn't set up Google Search Console:

1. **Go to** [Google Search Console](https://search.google.com/search-console)
2. **Add property** — use URL prefix method with the product URL
3. **Verify ownership** — recommend HTML tag method (add meta tag to `<head>`)
   ```html
   <meta name="google-site-verification" content="your-verification-code" />
   ```
4. **Submit sitemap** — go to Sitemaps section, submit `{url}/sitemap.xml`
5. **Enable API access** (for programmatic URL submission):
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Enable "Google Search Console API"
   - Create a service account or use existing one
   - Add the service account as a user in Search Console with "Full" permissions

## Step 4: URL Submission

For submitting URLs:
1. List the key URLs to index:
   - Homepage
   - Pricing page (if exists)
   - Blog posts (if exist)
   - Any landing pages
2. Guide the user through the Search Console UI:
   - URL Inspection tool → enter URL → Request Indexing
3. If API access is set up, can use programmatic submission:
   ```bash
   # Using the Indexing API (for pages with JobPosting or BroadcastEvent markup)
   # or URL Inspection API for general pages
   curl -X POST "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect" \
     -H "Authorization: Bearer {token}" \
     -H "Content-Type: application/json" \
     -d '{"inspectionUrl": "{url}", "siteUrl": "{site}"}'
   ```

## Step 5: Status Check

Guide user to check:
- **Coverage report** — how many pages are indexed vs excluded
- **URL Inspection** — check specific URLs for indexing status
- **Performance** — search queries driving impressions/clicks
- **Sitemap status** — is the sitemap processed successfully?

Report findings and suggest actions for any issues (e.g., pages stuck in "Discovered - currently not indexed").

## Step 6: Track

Save status to `state/search-console.json`:
```json
{
  "site_url": "...",
  "last_check": "2026-04-11",
  "indexed_pages": 5,
  "submitted_urls": ["..."],
  "issues": ["..."]
}
```
