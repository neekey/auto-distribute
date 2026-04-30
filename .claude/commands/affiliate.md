Set up an affiliate program for a product (agreement, application form, welcome email, optional Notion + Tally provisioning), or manually add a creator to the roster and draft platform-tailored outreach via `/affiliate add <url> [context]`.

The user provides product context: $ARGUMENTS

Read `AFFILIATE.md` (in the auto-distribute root) for the underlying knowledge — decision framework, commission economics, defensive package, Stripe + Tally setup, Tally API gotchas, outreach patterns.

## Step 0: Resolve Project Path

Check if `$ARGUMENTS` contains `--project <path>`. If yes, extract the path and use it as the base directory for all per-product files (`PRODUCT.md`, `affiliate/`, `state/`). Remove `--project <path>` from arguments before processing.

If no `--project`, use the current working directory.

## Step 0.5: Sub-command routing

If `$ARGUMENTS` starts with `add ` followed by a URL, jump to the **Manual creator add** flow at the end of this doc. Don't run the program-setup flow below.

Otherwise (no sub-command, or "setup", or other words), continue to the program-setup flow starting at Step 1.

## Step 1: Read Context

1. Read `PRODUCT.md` at the project root. You need: product name, pricing model (subscription vs one-time), price tiers, target audience, contact email.
2. If `PRODUCT.md` is missing, ask the user for it or run `/distribute` first.
3. Check if `affiliate/` already exists in the project. If yes, the user has run this before — confirm whether they want to update or start fresh.

## Step 2: Decide Direction

Direction matters. Don't skip this step.

- **Direction 1 (publisher):** the product earns commission by recommending OTHER tools. Best for sites with organic traffic but no payment conversion. If this fits, recommend joining Impact / ShareASale / CJ / Amazon Associates and dropping links into existing content. Stop here — this command doesn't build a publisher program.
- **Direction 2 (merchant):** the product PAYS others to refer paying customers. The rest of this command implements this.

Apply the decision framework from `AFFILIATE.md` § "Decision framework: should this product run a merchant program?":
1. Does the product convert? (need real conversion data on cold traffic)
2. Is the LTV worth sharing? (one-time products $20+, subs with $30+ LTV)
3. Are creators in the niche reachable? (can you list 30 micro-creators in 20 minutes?)

If any of the three is "no", recommend deferring and explain why. Don't ship a half-baked program.

## Step 3: Settle Commission Economics

Ask the user to confirm or override defaults. Show the math first; ask once you've calculated.

Defaults to propose:
- **Buyer-side discount:** 20% off
- **Creator commission:** 50% of net (after the discount)
- **Founding-cohort framing:** rate locks for everyone joining in the current calendar year (e.g. "founding rate for 2026 joiners")
- **Payout:** Net-30 cycle (sales in month X paid on the 1st of month X+2), no minimum threshold
- **Payout methods:** Wise (preferred), PayPal, Other

Calculate the per-tier table from `PRODUCT.md` pricing. For each plan tier, show:
- List price
- Buyer pays (after discount)
- Creator earns (commission of net)
- You keep (net minus commission)

Confirm the numbers feel right *for this specific product's margins* before proceeding. If you can model the LTV and creator's expected per-conversion earnings, do so — a $2 commission on a $4.99 plan is unappealing to most creators; lifetime / annual tiers usually carry the program.

## Step 4: Generate Local Artifacts

Create `affiliate/` in the target project with three files. Use these patterns (adapt to the product's actual numbers, plan names, and contact email).

### `affiliate/agreement.md`

Sections to include:
1. **Header** — product tagline-style line about earning commission
2. **The Deal** — table summarizing commission, discount, payout cycle, methods, minimum
3. **What that looks like in dollars** — per-tier table calculated above
4. **Why This Rate** — 2 bullets explaining the elevated rate (e.g. "we're brand new, prioritizing growth over ad spend"; "founding creators take a real risk on a small product")
5. **Founding Creator Rate** — H2 section explaining cohort framing and rate lock
6. **How It Works** — 4 steps: apply → get code → share → get paid
7. **Terms** — payout schedule (with month-by-month examples); refunds and chargebacks; what's not allowed (self-purchases, incentivized signups, click farms, misleading claims); disclosure; code dormancy (12-month auto-deactivation); changes to terms (30-day notice); ending the partnership (30-day notice)
8. **FAQ** — minimum audience, multiple codes, discount stacking, country support, contract/signature, free account, approval timeline, no-sales months
9. **Contact** — partners@<domain> email + apply link placeholder (`https://tally.so/r/REPLACE-WITH-FORM-ID` if Tally form not yet created)

Use plain language, no legalese. Avoid em-dashes (per repo style).

Reference: `~/workspaces/zahlhaus/affiliate/agreement.md` is a working example.

### `affiliate/tally-form.md`

Spec doc describing the Tally form structure. After provisioning the form (Step 6), this doc should be updated with the live form URL. Sections:
1. Header — form title, description
2. Settings — recommended UI-side configs (email notifications, redirect, captcha)
3. Field-by-field spec — see `AFFILIATE.md` § "Form fields"
4. Manual review checklist for incoming applications

### `affiliate/welcome-email.md`

Template with `{{NAME}}`, `{{CODE}}`, `{{PAYOUT_METHOD}}`, `{{PAYOUT_EMAIL}}`, `{{FIRST_PAYOUT_DATE}}`, `{{NOTION_URL}}` (or agreement URL), `{{LIFETIME_LINK}}` placeholders. Body covers:
- Welcome and code-is-live confirmation
- Quick reference (where to use, earnings %, payout schedule, first payout date, agreement link)
- Free premium account activation link (if offered)
- 2–3 friendly tips on what works (e.g. "Lifetime tier is the easiest sell, demo > pitch")
- Warm sign-off and contact

Tone: founder-to-creator, warm but tight. Under ~200 words in body.

## Step 5: Create the Notion Agreement Page (optional)

If the Notion MCP is connected (check via available tools), offer to create the agreement as a Notion sub-page.

1. Ask the user for the parent page or workspace where it should live (a project page, a "Distribution" workspace, etc.).
2. Use `mcp__notion__notion-create-pages` to create a new page under that parent.
3. Page title: `{Product name} Affiliate Program`.
4. Page icon: the product's logo URL if hosted publicly (Notion accepts image URLs for icons; SVG sometimes renders inconsistently across clients — PNG is safer).
5. Page cover: optional, ≥1500px wide image.
6. Body content: paste from `affiliate/agreement.md`, but **strip the H1** (Notion creates the title from the `properties.title` field automatically; including an H1 in content duplicates it).
7. Once created, prompt the user to publish the page (Share → Publish to web) so creators can view it without a Notion account. Save the published URL.
8. Update `affiliate/agreement.md` and the Tally form's intro (later) with the published URL.

If Notion MCP is not connected, skip this step. Tell the user how to do it manually: paste `affiliate/agreement.md` into a Notion page, publish it, share the URL.

## Step 6: Create the Tally Form (optional)

If `TALLY_API_KEY` env var is set, offer to create the form via API.

1. Build a config file at `affiliate/tally-form-config.json`:

   ```json
   {
     "product": {
       "name": "<from PRODUCT.md>",
       "agreement_url": "<the Notion URL from Step 5, or the GitHub URL of agreement.md>",
       "premium_tier_label": "<top tier name, e.g. 'Lifetime' or 'Pro'>",
       "logo_url": "<https://product.com/logo.svg>",
       "cover_url": null
     },
     "form": {
       "title": "<Product Name> Affiliate Application",
       "include_trial_offer": true
     }
   }
   ```

2. Run `node <auto-distribute>/scripts/build-affiliate-form.mjs --config affiliate/tally-form-config.json` (the auto-distribute path is the directory this command lives in, NOT the target project).

3. The script prints the resulting form URL on success. Replace the `https://tally.so/r/REPLACE-WITH-FORM-ID` placeholder in `affiliate/agreement.md` with the real URL.

4. If a Notion page was created in Step 5, also update the Notion page's "Apply" link via `mcp__notion__notion-update-page` with `update_content` and a content_updates entry.

5. Update `affiliate/tally-form.md` with the live form URL.

6. Tell the user the form is **PUBLISHED** (immediately accepting submissions). Action items they need to do in the Tally UI manually (no API support):
   - Enable email notifications (so submissions don't sit unseen)
   - Configure the submission redirect / thank-you page
   - Confirm captcha is on

If `TALLY_API_KEY` is not set, skip this step. Tell the user how to set it: Tally → Settings → API → create key, then `export TALLY_API_KEY=tly-...`.

## Step 7: Save State

Choose tracking method based on project maturity:

- **Starting out (1–10 creators):** Create `state/affiliate-program.json` (gitignored under `state/`) with the program metadata. See `AFFILIATE.md` § "State tracking" for the schema. This is a single JSON file with a `creators[]` array and append-only `outreach` log per creator.
- **Scaling up (10+ creators):** Set up linked Notion databases instead. See `AFFILIATE.md` § "Notion tracking" for the schema. The Notion databases (Creators, Creator Channels, Outreach Log) give you kanban/calendar views and a UI for manual review. Use the Notion MCP tools to create and link records. Reference `zahlhaus/CLAUDE.md` § "Creator Outreach Tracking" for a working example with real database IDs.

Initial state:
```json
{
  "program_name": "<Product> Founding Creator Program",
  "commission_rate": 0.50,
  "discount_rate": 0.20,
  "tally_form_id": "<from Step 6, or null>",
  "tally_form_url": "<from Step 6, or null>",
  "agreement_url": "<from Step 5, or null>",
  "founding_cohort": "2026",
  "creators": [],
  "monthly_payouts": []
}
```

## Step 8: Wrap Up

Tell the user:
- Where the artifacts live (`affiliate/` in the target project)
- The Notion URL (if created) and Tally form URL (if created)
- Manual setup remaining:
  - Set up the contact email alias (e.g. `partners@<domain>`)
  - In Stripe Dashboard: create the buyer-side coupon (the percent-off discount), then create per-creator promotion codes linked to it
  - Configure Tally form notifications and redirect
- Suggest next steps:
  - Build a starter list of 20–30 micro-creators to outreach
  - Draft the first batch of personalized DMs (don't lead with the affiliate offer — lead with a free trial)
  - Set up a Google Sheet for monthly payout tracking
- Optionally offer to schedule a recurring `/remind` (or local macOS reminder) for monthly payout processing on the 1st of each month

## Manual creator add (sub-command)

Triggered by `/affiliate add <url> [optional context note]`. The URL points to a creator's channel/profile (YouTube, Substack, LinkedIn, Instagram, TikTok, X, podcast, blog). Goal: append them to the roster as a `researched` prospect, draft a platform-tailored outreach message, save the draft for user review.

### Step A1: Parse the input

1. The first non-`--project` token after `add` is the URL. Anything after the URL is free-form context (e.g., "saw their German numbers video" or "founder mentioned us on X").
2. Detect platform from the URL host:
   - `youtube.com` / `youtu.be` → `youtube`
   - `substack.com` (or custom domain `*.substack.com`) → `substack`
   - `linkedin.com/in/` or `linkedin.com/company/` → `linkedin`
   - `instagram.com` → `instagram`
   - `tiktok.com` → `tiktok`
   - `x.com` / `twitter.com` → `x`
   - anything else → `other` (treat as a blog/podcast/personal site)
3. Extract a handle/slug from the URL path (e.g., `youtube.com/@anja` → `anja`; `linkedin.com/in/jane-doe` → `jane-doe`). Use this as the creator `id` if no name yet.

### Step A2: Read state

1. Read `state/affiliate-program.json`. If it doesn't exist, the program isn't set up yet — tell the user to run `/affiliate` first to create the program.
2. **Dedupe** — if the `creators[]` array already contains a record with the same `channel` URL (case-insensitive, ignoring trailing slash), abort and tell the user. Show them the existing record's `status` so they can decide what to do (e.g., follow up vs. skip).

### Step A3: Gather creator info

Try a lightweight WebFetch on the URL to extract: display name, bio/description line, recent piece-of-content title (a video, article, post). Don't push hard — many platforms gate this. If the fetch is thin or blocked:
- Pull what you can from the URL itself (handle, platform).
- Ask the user for the creator's display name and one specific piece of content to reference (the user often already has a reason they dropped this link).

Do **not** fabricate audience size, niche, or content references. If you can't ground a claim, leave the field null and reference only what the user gave you in the context note.

### Step A4: Append the creator record

Determine where to write:

- **If Notion databases exist** (check the project's `CLAUDE.md` for Notion DB IDs, or check if the user mentions Notion): create records in all 3 databases — a Creator page, one Channel page per link found, and an Outreach page for the draft event. Link them via relations. Use the Notion MCP tools (`mcp__notion__notion-create-pages`, `mcp__notion__notion-update-page`).
- **Otherwise (JSON tracking):** Add a new entry to `creators[]` in `state/affiliate-program.json`:

```json
{
  "id": "<handle-or-slug>",
  "name": "<display name, or null if unknown>",
  "email": null,
  "channel": "<the URL>",
  "platform": "<youtube|substack|linkedin|instagram|tiktok|x|other>",
  "country": null,
  "niche": "<short, from bio if available, else null>",
  "context_note": "<the free-form note from the user, verbatim>",
  "added_at": "<today's date YYYY-MM-DD>",
  "source": "manual",
  "status": "researched",
  "outreach": [
    {
      "date": "<today>",
      "channel": "<see channel-mapping below>",
      "action": "drafted",
      "variant": "manual-initial",
      "draft_path": "affiliate/outreach-drafts/<id>-<platform>.md"
    }
  ]
}
```

**Channel mapping (which medium the outreach will go through):**
| Platform | Outreach channel | Tone notes |
|----------|-----------------|------------|
| YouTube | email (from About) or YouTube DM if no email | Reference a specific video. Long-form creators expect substance. |
| Substack | email (every Substack has the author's contact) | Newsletter peers; reference a recent post by title. |
| LinkedIn | LinkedIn DM | Disclose side-project per AFFILIATE.md § "Side-project disclosure on profile-visible channels". |
| Instagram | IG DM | Short, casual, mobile-first. No long paragraphs. |
| TikTok | TikTok DM | Even shorter than IG. Two short sentences max. |
| X / Twitter | X DM | Casual, concise. |
| Other (blog/podcast) | email | Use the contact / about page email. |

### Step A5: Draft the outreach message

Create `affiliate/outreach-drafts/<id>-<platform>.md` with:

1. **Header metadata** (frontmatter or visible block): creator id, platform, channel, draft date, link to the agreement / Tally form.
2. **Subject line** (only for email-style channels — YouTube/Substack/blog/X-cold-email). Follow `AFFILIATE.md` § "Subject line discipline" (plain descriptor, no "Quick note"-style throat-clearing).
3. **Body**, wrapped in `--- copy from below this line ---` / `--- copy from above this line ---` markers (per the `feedback_drafts_no_blockquotes` memory rule and AFFILIATE.md guidance). Plain text only, no `>` blockquotes.

Body follows the three-part structure from `AFFILIATE.md` § "DM template structure":
1. **Specific reference** — what you saw from them (use the user's context note + any verified content title from Step A3). Don't generalize ("love your channel"); cite the actual piece.
2. **One-sentence pitch** — what the product is, why it fits *their audience*. Pull from `PRODUCT.md`.
3. **Low-friction ask** — free [premium tier] account to try, no commitment, *not* a promotion ask. Lead with the trial, never with the affiliate code.

**Tone rules to enforce** (cross-reference user memory):
- No em-dashes (this is human-facing prose; obvious AI tell).
- For LinkedIn / direct email: include the side-project clause ("[Product] is a side project I've been building outside my day job").
- For Substack / IG / TikTok / platform DMs: skip the side-project clause.
- Match language to creator's content language if obvious (German creator → German draft; otherwise English).

### Step A6: Present and confirm

Show the user:
- The new creator record being added (so they can correct fields).
- The draft path.
- The full draft body inline so they can copy or ask for revisions.

Ask the user to either:
- Approve as-is (you save the record + draft file).
- Request changes (revise inline, then save).
- Skip saving (don't write anything to state).

Do **not** auto-send. The user manually copy-pastes from the draft file into the actual platform — no API for IG/TikTok/LinkedIn DMs from this command.

### Step A7: After saving

Tell the user:
- File saved to `affiliate/outreach-drafts/<id>-<platform>.md`.
- State updated: creator added with `status: researched`, outreach entry logged with `action: drafted`.
- Reminder: when they actually send the message, run `/affiliate add <url>` again with no extra context — no, that's wrong. Better: they can either edit the JSON manually to flip the latest outreach entry's `action` from `drafted` to `sent` and add the send date, or they can ask in chat ("mark <name> as sent on X") and you'll do it.
- Suggest: if they get a positive reply, follow `affiliate/response-playbook.md` (or `AFFILIATE.md` § "Response handling") to issue a comp code.

## Notes

- This command is idempotent up to Step 4 (regenerating local files is fine). Steps 5 and 6 create external resources — re-running will produce duplicates if you don't handle the existing case. Always check whether the Notion page / Tally form already exist (look at `state/affiliate-program.json`).
- For an existing program where you only want to update the agreement copy, edit `affiliate/agreement.md` directly, then use the Notion update-page tool to push changes upstream.
- For form changes after the form is live, use `node scripts/build-affiliate-form.mjs --config <path> --patch <form-id>` to update the existing form in place. The PATCH replaces the entire `blocks` array, so always regenerate from your config — never echo back fields from the API's GET response.
- The `add` sub-command is dedupe-aware and append-only against `creators[]`. It never modifies existing creator records; if the user wants to update one, they edit the JSON directly or ask in chat.
