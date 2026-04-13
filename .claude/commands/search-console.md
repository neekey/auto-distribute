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
- **"submit"** — submit URLs for indexing via Google Indexing API
- **"status"** — check indexing status
- **"setup"** — guide through Search Console and Indexing API setup

If unclear, default to "setup" if first time, "submit" otherwise.

## Step 3: Setup Guide (if needed)

If the user hasn't set up Google Search Console or the Indexing API:

### Search Console Setup
1. **Go to** [Google Search Console](https://search.google.com/search-console)
2. **Add property** — use URL prefix method with the product URL
3. **Verify ownership** — recommend HTML tag method (add meta tag to `<head>`)
   ```html
   <meta name="google-site-verification" content="your-verification-code" />
   ```
4. **Submit sitemap** — go to Sitemaps section, submit `{url}/sitemap.xml`

### Indexing API Setup (for programmatic submission)
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable **"Web Search Indexing API"** (not "Search Console API")
3. Create a service account (or reuse an existing one like Firebase Admin)
4. Download the service account key JSON
5. Save it as `google-service-account.json` in the project root (make sure it's in `.gitignore`)
6. Add the service account email as **Owner** in Google Search Console:
   - Search Console → Settings → Users and permissions → Add user
   - Enter the service account email (e.g., `firebase-adminsdk-xxx@project.iam.gserviceaccount.com`)
   - Set permission to **Owner**
7. Install the auth library: `npm install google-auth-library`

## Step 4: URL Submission

### Programmatic Submission (preferred)

Check if the Indexing API is set up:
1. Look for `google-service-account.json` in the project root (search up to 5 parent directories)
2. Check if `google-auth-library` is installed (`node -e "require('google-auth-library')"`)

If both exist, run the ping script:
```bash
node {auto-distribute-path}/scripts/ping-indexing.mjs --dir {marketing-dir} --base-url {site-url}
```

The script will:
- Read `sitemap.xml` to find all page URLs (or scan for `.html` files as fallback)
- Send `URL_UPDATED` notifications to Google's Indexing API for each URL
- Rate limit to ~1 request/second (Google allows ~200/day)
- Report success/failure for each URL

For a single URL:
```bash
node {auto-distribute-path}/scripts/ping-indexing.mjs --url {full-url}
```

### Manual Submission (fallback)

If the Indexing API is not set up, guide the user through the Search Console UI:
1. List the key URLs to index (read from sitemap.xml or scan HTML files)
2. For each URL:
   - Go to [Search Console](https://search.google.com/search-console)
   - Paste the URL into the **URL Inspection** tool (search bar at top)
   - Click **"Request Indexing"**
3. Resubmit the sitemap:
   - Go to **Sitemaps** → resubmit `{url}/sitemap.xml`

Recommend the user sets up the Indexing API for future use (see Step 3).

## Step 5: Status Check

Guide user to check in Google Search Console:
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
  "last_check": "2026-04-13",
  "action": "submit_for_indexing",
  "submitted_urls": [
    {
      "url": "...",
      "status": "submitted | failed",
      "notes": "..."
    }
  ],
  "next_steps": ["..."]
}
```
