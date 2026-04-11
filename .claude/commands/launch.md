Submit product to launch platforms. Generates platform-specific copy and guides through submission.

The user specifies which platform or says "all": $ARGUMENTS

## Step 1: Read Context

1. Read `PRODUCT.md` — product details. If missing, ask user to run `/distribute` first.
2. Read `DISTRIBUTION.md` — if exists, check launch platform section for status.
3. Read `state/submissions.json` — if exists, check what's already submitted.

## Step 2: Select Platforms

If user specified a platform, use that. Otherwise, present the list from DISTRIBUTION.md or suggest based on product type:

### Supported Launch Platforms

| Platform | Best For | Submission Method |
|----------|----------|-------------------|
| **Product Hunt** | SaaS, dev tools, consumer apps | Manual (web) — generate all copy + assets checklist |
| **Hacker News (Show HN)** | Dev tools, technical products, open source | Manual (web) — generate title + first comment |
| **Indie Hackers** | Bootstrapped products, SaaS | Manual (web) — generate post |
| **BetaList** | Pre-launch, early stage | Manual (web) — generate submission |
| **Launching.io** | SaaS, apps | Manual (web) — generate submission |
| **Uneed** | All products | Manual (web) — generate submission |

## Step 3: Generate Submission Copy

For each selected platform, generate tailored copy following platform conventions:

### Product Hunt
- **Tagline** (60 chars max): concise, benefit-focused
- **Description** (260 chars max): what it does + key differentiator
- **First comment (Maker's Comment)**: personal story — why you built it, what problem it solves, what's next. Authentic tone, not salesy. 2-3 paragraphs.
- **Topics/tags**: up to 3 relevant topics
- **Gallery images checklist**: what screenshots/GIFs to prepare (list specific screens)
- **Best launch day/time**: Tuesday-Thursday, 12:01 AM PST
- **Hunter strategy**: suggest finding a hunter with followers in your niche

### Hacker News (Show HN)
- **Title**: `Show HN: {Product Name} – {what it does in <80 chars}`
- **Body text**: problem statement, what you built, technical details (HN loves this), what's unique, ask for feedback. Keep it concise and technical.
- **Best timing**: weekday mornings US time (EST)
- **Rules reminder**: no asking for upvotes, be genuine, respond to every comment

### Indie Hackers
- **Post title**: compelling, question or story format works best
- **Post body**: journey story — problem you noticed, how you built it, early results/metrics if any, what you learned. IH community values transparency.
- **Group**: suggest the most relevant IH group

### BetaList
- **Startup name**
- **URL**
- **Tagline** (one sentence)
- **Description** (2-3 sentences)
- **Tags/categories**

## Step 4: Present and Confirm

Show the generated copy for each platform. Ask user to review and edit. For each platform:

1. Present the copy
2. Ask if they want to adjust anything
3. Provide the submission URL where they need to go
4. Update `state/submissions.json` with status:
   ```json
   {
     "product_hunt": { "status": "copy_ready", "date": "2026-04-11", "copy": {...} },
     "hacker_news": { "status": "submitted", "date": "2026-04-11", "url": "..." }
   }
   ```

## Step 5: Post-Launch Guidance

After submission, remind the user:
- **Product Hunt**: share the PH link on social (run `/social` with the PH link), respond to every comment within the first 24h
- **Hacker News**: respond to every comment genuinely, don't be defensive about criticism
- **Indie Hackers**: engage with comments, be transparent about metrics
- Monitor with: `stride channel x search "{product name}" --max 20 --json`
