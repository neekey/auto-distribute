Submit product to launch platforms and directories. Uses standard copy from DISTRIBUTION.md and assets from assets/.

The user specifies which platform(s), a category (e.g. "ai", "dev", "all"), or says "next": $ARGUMENTS

## Step 0: Resolve Project Path

Check if `$ARGUMENTS` contains `--project <path>`. If yes, extract the path and use it as the base directory for all per-product files (`PRODUCT.md`, `DISTRIBUTION.md`, `state/`, `assets/`). Remove `--project <path>` from arguments before processing. Template files (`PLATFORMS.md`) are always read from the auto-distribute directory.

If no `--project`, use the current working directory.

## Step 1: Read Context

1. Read `PRODUCT.md` — product details. If missing, ask user to run `/distribute` first.
2. Read `PLATFORMS.md` — comprehensive platform reference with reach, criteria, cost, and SEO data.
3. Read `DISTRIBUTION.md` — submission assets (copy, metadata) and platform fit assessment. If missing or has no Submission Assets section, ask user to run `/distribute` first.
4. Read `state/submissions.json` — if exists, check what's already submitted. Skip platforms already marked as submitted.

## Step 2: Select Platforms

If user specified a platform or category, use that. If user said "next", pick the next unsubmitted platforms from the recommended sequence. Otherwise, recommend based on product type.

Select platforms from `PLATFORMS.md` (read in Step 1). Use the product type, audience, and category from `PRODUCT.md` to filter relevant platforms. Cross-reference with `state/submissions.json` to skip already-submitted ones.

**Important — filter by audience type:**
- Check if the product is **B2B** or **B2C** from `PRODUCT.md` target audience.
- **B2B-only platforms** (skip for B2C products): G2, Capterra, GetApp, Software Advice, Clutch, TrustRadius, Crozdesk, GoodFirms. These explicitly reject B2C/consumer products.
- **Paid-only platforms** (skip unless user opts in): SourceForge business directory (free tier is open-source project hosting only), Microlaunch, TAAFT ($347), Toolify ($99).

When presenting platforms to the user, distinguish between:
- **Launch platforms** (timing matters — plan ahead): Product Hunt, Hacker News, Peerlist, Uneed, etc.
- **Directories** (submit anytime — ongoing SEO/discovery): AlternativeTo, SaaSHub, Wellfound, etc.

Also search for niche platforms not yet in `PLATFORMS.md`:
```bash
stride channel x search "best {category} tools list" --max 20 --json
stride channel reddit search "best {category} tools" --subreddit {relevant} --max 20 --json
```
Web search for: "{category} directory", "best {category} tools 2026", "alternatives to {competitor}"

## Step 3: Prioritize

Score selected platforms by:
- **Domain Rating** — higher DR = more valuable backlink
- **Link type** — dofollow > nofollow (but nofollow from DR 90+ still valuable)
- **Relevance** — does the audience match?
- **Traffic** — does the platform actually send traffic?
- **Effort** — free submission vs requires review/payment
- **Timing** — launch platforms need scheduling; directories can be done anytime

Present a prioritized list grouped into (after filtering out ineligible platforms per audience type):
1. **Must-do (free, high DR, dofollow)**: Wellfound, F6S, StartupFA.me, Fazier (+ SourceForge/G2/Capterra/StackShare if B2B/open-source)
2. **High value (free, DR 70+)**: SaaSHub, AlternativeTo, BetaList, Alternative.me, etc.
3. **Launch platforms** (schedule these): Product Hunt, Hacker News, Peerlist, Uneed, etc.
4. **Category-specific** (AI, dev, niche): based on product type
5. **Nice-to-have**: remaining platforms sorted by DR

## Step 4: Map Submission Assets

Read the **Submission Assets** section from `DISTRIBUTION.md`. This has the standard copy and metadata reused across all platforms.

Map the standard fields to what each platform's form requires:

| Field needed | Source from Submission Assets |
|---|---|
| Product name | `PRODUCT.md` name |
| URL | `PRODUCT.md` URL |
| Short description (50-150 chars) | One-liner or Short description |
| Medium description (150-300 chars) | Medium description |
| Long description | Long description |
| Category/tags | Metadata → Category/tags |
| Screenshots/logo | `assets/` directory (logo.png, screenshot-*.png, og-image.png) |
| Competitors/alternatives | Copy → Competitor alternatives |
| Pricing | Metadata → Pricing summary |
| Key features | Copy → Key features |
| Founders | Metadata → Founders |

For **launch platforms** that need unique copy (PH maker's comment, HN first comment, dev.to article), use the Platform-Specific Copy section from Submission Assets.

Only flag where a platform needs something **not covered** by the standard assets (e.g., StackShare's "tech stack", StartuPage's revenue verification, Dang.ai's badge requirement).

## Step 5: Submit and Track

For each platform:
1. Show the mapped copy for this platform
2. Provide the submission URL
3. For launch platforms: recommend optimal timing and any prep needed
4. Guide through any platform-specific steps
5. Update `state/submissions.json`:
   ```json
   {
     "product_hunt": { "status": "copy_ready", "date": "2026-04-12", "type": "launch" },
     "g2": { "status": "submitted", "date": "2026-04-12", "url": "...", "type": "directory", "dr": 91, "link_type": "dofollow" },
     "sourceforge": { "status": "submitted", "date": "2026-04-12", "type": "directory" },
     "hacker_news": { "status": "submitted", "date": "2026-04-12", "url": "...", "type": "launch" }
   }
   ```

## Step 6: Post-Submission Guidance

**For launch platforms:**
- **Product Hunt**: share the PH link on social (run `/social`), respond to every comment within 24h
- **Hacker News**: respond to every comment genuinely, don't be defensive
- **dev.to**: engage with comments, write follow-ups
- **Indie Hackers**: be transparent about metrics
- Monitor mentions: `stride channel x search "{product name}" --max 20 --json`

**For directories:**
- Check back on "pending review" platforms in 1-2 weeks
- Add badges/logos if the directory provides them (social proof)
- Respond to reviews and comments
- Collect reviews on G2/Capterra/Trustpilot — first 10 compound
- Run `/submit next` periodically to continue submitting

## Recommended Submission Sequence

For maximum impact, stagger across weeks:

1. **Week 1**: Directories (Wellfound, F6S, StartupFA.me, Fazier, Crunchbase, AlternativeTo, SaaSHub; + G2/Capterra/SourceForge if B2B) + BetaList (queue early)
2. **Week 2**: Product Hunt launch (plan 2-3 weeks ahead) + more directories
3. **Week 2-3**: Hacker News Show HN (different day than PH)
4. **Week 3**: dev.to article, Indie Hackers, Peerlist Launchpad
5. **Week 3-4**: Tier 3 launch platforms (Uneed, Firsto, DevHunt, etc.) + remaining directories
6. **Week 4+**: AI platforms (if applicable), newsletter pitches, niche directories
7. **Ongoing**: AppSumo application, community engagement, review collection

## Backlink Strategy Notes

- Target 20-40% nofollow for a natural backlink profile
- Even nofollow from DR 90+ (Crunchbase, Trustpilot, PH, HN) carry indirect SEO value
- Expected result: DR 0 → DR 25-35 within 2-3 months with 40-60+ quality submissions
- Prioritize dofollow from DR 80+ first (Wellfound, F6S, StartupFA.me; + SourceForge/G2/Capterra/StackShare if B2B/open-source)
- GitHub links (DR 97) are nofollow but provide massive discovery value
