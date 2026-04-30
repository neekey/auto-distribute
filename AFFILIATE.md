# Affiliate Programs

How to set up an affiliate program for a small product. Distribution lever where you pay creators a share of revenue in exchange for promotion.

Two distinct plays — pick one, they have very different economics and timing.

## Two directions

| Direction | Role | When to use | Setup cost |
|-----------|------|-------------|------------|
| **Publisher** | You promote *other* products and earn a cut | When the product has organic traffic but no payment conversion (content sites, blogs, free tools with newsletters) | Free, just join networks |
| **Merchant** | You pay *others* to promote your product | When the product has clear conversion but limited reach | Real ($30–50/mo platform fee, or DIY with Stripe coupons) |

This doc focuses primarily on **Direction 2 (merchant)**. Direction 1 is well-covered by joining existing networks (Impact, ShareASale, CJ, Awin, Amazon Associates) and dropping links into existing content.

## Decision framework: should this product run a merchant program?

Answer all three honestly before starting.

1. **Does the product convert?** If you don't have any paying customers yet, affiliates won't help. They want a working sales funnel, not a beta tester job. Wait until you have clear conversion data on cold traffic.
2. **Is the LTV worth sharing?** A $5/mo product with 3-month average lifetime = $15 LTV. Paying 30% commission = $4.50. After Stripe fees and admin overhead, you're paying for noise. One-time products at $20+, or subscriptions with $30+ LTV, work much better.
3. **Are creators in your niche reachable?** Some niches have many micro-creators (language learning, fitness, finance, productivity). Others don't (B2B internal tooling, vertical SaaS). If you can't list 30 micro-creators in 20 minutes of searching, the channel may not exist for you.

If yes to all three, proceed.

## Commission economics

### Subscription products

| Pattern | Example | Notes |
|---------|---------|-------|
| Recurring % for N months | 30% recurring for 12 months | Most common SaaS pattern |
| First-month flat % | 50% of first month | Cleanest to explain, highest one-time payout |
| Annualized lifetime % | 20% of annual revenue forever | Aligns long-term, small per-month checks |
| Flat bounty | $30 per paid signup | Simple; loses signal at low price points |

### One-time products

Simpler than subscriptions — no churn, no clawbacks beyond the refund window. Common pattern: flat % of net (after the buyer-side discount).

### Founding-cohort framing

A useful pattern for small products: tier the rate by cohort, not by performance.

> *"Founding rate is 50% for everyone joining in 2026. Future cohorts may receive different rates. Your founding rate stays in place for as long as your code is active, regardless of any future changes for new joiners."*

Why this works:
- **Urgency** — early creators get a real reason to act now
- **Flexibility** — you can lower rates for later joiners without breaking word to anyone
- **Positioning** — "founding creator" is a status; pure cash isn't

Use this whenever you're starting a program from zero. The "founding" cohort can be a year, a count (first 20), or an explicit list.

## Industry benchmarks

Use these to position your offer. Values shift over time; verify before quoting in pitches.

| Brand / category | Typical commission | Notes |
|------------------|--------------------|-------|
| Babbel | 25% | Subscription language learning, established |
| italki | ~$15 flat | Lesson marketplace, low commission per signup |
| Lingoda | ~€60 / paid trial | Live class subscriptions, premium tier only |
| Skillshare | 40% / first month | Content subscription |
| Pimsleur / Rocket Languages | 30–50% | Mid-tier language SaaS |
| Mondly | 30% | Network varies (Awin / ShareASale) |
| Most indie SaaS | 20–30% recurring | Default Rewardful / FirstPromoter starter |
| Amazon Associates | 1–10% | Volume play, never headline-grabbing |

A program offering **40%+** stands out. **50%+** is materially better than industry norms and can be a real differentiator in DM outreach.

## Defensive package

Standard clauses that protect you without scaring creators. All seven should be in the agreement.

1. **30-day notice to change terms.** Lets you adjust commission %, discount %, or payout cadence with notice. Pending commissions on completed sales are honored at the rate they were earned.
2. **30-day notice to terminate (either side).** Pending commissions on completed sales still pay out on the normal schedule.
3. **Anti-fraud clause.** No self-purchases, no incentivized signups (giveaways tied to the code), no click farms. Code revocation + forfeit of pending payouts on suspected fraud.
4. **Chargeback reversal.** Commissions on charged-back transactions are reversed. If reversal lands after payout, deducted from next cycle.
5. **12-month code dormancy.** Codes with zero sales for 12 consecutive months auto-deactivate. Reactivation by request.
6. **Founding-cohort rate lock.** The headline rate is grandfathered for the cohort that joined under it; new cohorts may receive different rates.
7. **Disclosure.** Creators in regulated jurisdictions (US, UK, EU, AU) must disclose affiliate relationships. Policy: "we're not picky about format, just that it's honest."

### Things NOT to include

- **Hard program end date.** Sends the wrong signal — creators put less effort in if they think it's temporary. Use the change-terms-with-notice clause instead.
- **Per-creator monthly payout cap.** Looks like punishment for success.
- **Cookie windows** — only relevant for link-based tracking; not needed for promo-code-only programs (the code is either applied at checkout or not).

## Net-30 payout cycle

Pay creators ~30 days after the sale, not immediately. This covers your refund window.

**Standard pattern:** sales in month X are paid on the 1st of month X+2.

| Sale month | Payout date | Buffer for refunds |
|------------|-------------|--------------------|
| Sales in April | June 1 | 30–60 days |
| Sales in May | July 1 | 30–60 days |
| Sales in June | August 1 | 30–60 days |

A sale on May 1 has ~60 days of buffer. A sale on May 31 has ~30. Either way, the sale has fully cleared before commission goes out.

Set a payout floor only if Wise/PayPal fees would eat materially into a small payout (e.g. $25 minimum). For a small starting program, no floor is fine — the operational cost of carrying small balances forward is real, but so is the goodwill of "we just pay you what you earned, full stop."

## Stripe coupon setup (no-platform start)

For the first 5–10 creators, **don't pay for Rewardful, Tolt, or FirstPromoter**. Use Stripe directly.

### Setup

1. **Stripe Dashboard → Products → Coupons → +New Coupon**
   - Discount type: percent off
   - Percent: 20% (matches your buyer-side discount)
   - Apply to specific products, OR all products (your call)
   - No expiry
   - Optional: max redemptions if you want a hard cap

2. **Stripe Dashboard → Products → Promotion Codes → +New Promotion Code**
   - Linked to the coupon above
   - Code: the creator-facing string (e.g. `ANJA`, `LERNDEUTSCH`) — case-insensitive at checkout by default
   - One promotion code per creator; one shared coupon underneath

3. **Stripe Checkout settings**
   - Enable "Allow promotion codes" on Checkout sessions
   - Or for Payment Links, toggle "Customers can use promotion codes" per link

### One coupon, N promotion codes

For each program (founding cohort, beta-tester comp, etc.) create **one shared coupon** with the discount terms (`percent_off`, `applies_to`, `redeem_by`) and create **N promotion codes** under it (one per creator). Don't make a coupon per creator.

| Aspect | One coupon + N codes | N coupons |
|---|---|---|
| Dashboard clutter | 1 coupon, N codes nested | N coupons + N codes |
| "How many program redemptions?" | one count on the coupon | sum across N coupons |
| Per-creator expiry | yes (`promotion_code.expires_at`) | yes |
| Per-creator single-use | yes (`promotion_code.max_redemptions`) | yes |
| Total program cap | yes (`coupon.max_redemptions`) | no |
| Change offer terms once | yes (edit coupon → applies to all) | edit N coupons |

**Caveat:** `promotion_code.expires_at` cannot exceed `coupon.redeem_by`. Set the coupon's `redeem_by` long-horizon (e.g. 1 year out) and use per-code `expires_at` for individual deadlines.

### Naming conventions

Two patterns for two different audiences. Don't conflate them.

**Internal-use codes** (comp / beta / employee — verbose, namespaced):

- Pattern: `<PROGRAM>-<YEAR>-<TIER>-<CREATOR>`
- Examples: `FOUNDING-2026-LIFETIME-ATIA`, `BETA-2026-MONTHLY-XYZ`, `FOUNDING-2027-LIFETIME-ABC`
- Rationale: groups cleanly in Stripe dashboard (alphabetical sort), self-documenting (no metadata lookup), future-proof for new years, tiers, programs
- Length doesn't matter — these are typed once, by someone you briefed, in a controlled flow

**Audience-facing codes** (affiliate / public discount — short, industry-style):

- Pattern: `<HANDLE><DISCOUNT_PCT>` (e.g. `ATIA20`, `BIANCA20`, `LAUNCH50`)
- Rationale: typed by audiences at checkout, often on mobile; industry convention aids recall and conversion
- Long namespaced codes hurt conversion ("use code AFFILIATE-2026-ATIA20" reads corporate)

**Where the scalability lives:** in **Stripe metadata**, not the code itself. When creating a promotion code, set program/year/cohort/discount_pct as metadata fields. That gives full dashboard filterability without burdening the public-facing code.

**Edge cases:**
- Brand-only creators (no first name surfaced): use the handle in uppercase, normalized
- Two creators share a first name: append a disambiguator or use the candidate slug from state JSON
- Re-issued codes for the same creator: append `-V2`, `-V3`

### Stripe API gotchas

- **`Stripe-Version` header may be required.** Some accounts have a default API version where `coupon` is rejected as unknown on `/v1/promotion_codes`. Send `Stripe-Version: 2025-04-30.basil` (or current basil version) explicitly when creating promotion codes via API. If unsure, send it always — it never hurts.
- **`applies_to` is omitted from the default coupon response.** When you create or retrieve a coupon, `applies_to` shows as `null` in the standard JSON output even when set. To verify, retrieve with `?expand[]=applies_to`.
- **Coupon `name` is limited to 40 characters.** Use a short admin-facing name; don't conflate with the public code.
- **`applies_to.products` takes Product IDs, not Price IDs.** If you only have a Price ID, retrieve the price first (`GET /v1/prices/<id>`) to get the product ID.
- **Coupon `applies_to` is immutable after creation.** Set it correctly at creation; if wrong, delete and recreate (coupons are deletable, unlike most Stripe objects).

### Tracking

Stripe → Coupons → click the coupon → see all sessions/payments that used it. Filter or export monthly to a Google Sheet:

| Creator | Code | Code created | Sales (count) | Net revenue | 50% commission | Payout date | Wise txn ID |
|---------|------|--------------|---------------|-------------|----------------|-------------|-------------|

Calculate commission on **net revenue** (after the buyer-side discount), not list price.

### When to graduate to a platform

Move to Rewardful/Tolt/FirstPromoter when:
- 10+ active creators (manual tracking is breaking down)
- Creators are asking for self-serve dashboards
- You want creator-facing real-time stats
- You're paying out >$1k/month (platform fee becomes a small % of payouts)

Before then, the platform is overhead.

## Tally application form setup

Tally is the recommended form tool: free tier is generous, has an API, and is fast to set up.

### Form fields (standard structure)

1. Name (short text, required)
2. Email (email, required)
3. Country (short text, required) — for payout method and tax
4. Primary channel link (URL, required)
5. Other channels (long text, optional)
6. Audience size (short text, required) — no minimum
7. How would you talk about [product]? (long text, required) — qualitative fit signal
8. Preferred promo code (short text, required) — 3–12 chars
9. Payout method (multiple choice: Wise / PayPal / Other)
10. Payout email (email, required)
11. Want a free [premium tier] account to try first? (multiple choice: yes / already tried)
12. Anything else? (long text, optional)
13. **Terms acceptance** (checkbox, required) — *"I have read and agree to the [program] terms"*

Field 11 is optional but increases approval-stage authenticity — give creators access to the full product so they can speak honestly.

### API gotchas (post 2026-02 schema validation)

The Tally API became stricter in February 2026. The docs examples (as of mid-2026) are partially out of date. Working pattern verified live:

1. **Each block has its own `groupUuid`.** Don't share groupUuids between TITLE and INPUT blocks. Order in the array is what visually links them.
2. **`groupType` matches the block's `type`** for input blocks. `INPUT_TEXT` requires `groupType: INPUT_TEXT`. Same for `INPUT_EMAIL`, `INPUT_LINK`, `TEXTAREA`.
3. **TITLE blocks use `groupType: QUESTION`** (or `groupType: TITLE` for standalone titles).
4. **Option blocks** (`MULTIPLE_CHOICE_OPTION`, `DROPDOWN_OPTION`, `CHECKBOX`) require **`isFirst`** and **`isLast`** booleans in payload, in addition to `index`.
5. **CHECKBOX label uses `text`, not `html`.** Plain string, no inline links — link from a sibling TEXT/intro block instead.
6. **Options share a single `groupUuid` among themselves**, with `groupType` matching the choice container type (e.g. `MULTIPLE_CHOICE`).
7. **Branding (logo, cover) lives in the FORM_TITLE block payload** under `logo` and `cover` keys. Both accept URLs. Logo recommended 200×200, rendered as a circle. Cover recommended ≥1500px wide.
8. **PATCH replaces the entire `blocks` array.** When updating, regenerate from your source spec; do NOT echo back fields from a `GET` response (Tally returns server-injected fields like `safeHTMLSchema` and `title` that the input validator rejects).

`scripts/build-affiliate-form.mjs` handles all of this — pass it a config and it'll do the right thing.

### After form creation

Configure in the Tally UI (no API for these as of mid-2026):

- Email notifications: send to the contact email on every submission (otherwise applications can sit unseen)
- Submission redirect: a thank-you page with a 2-line confirmation
- Captcha: on (default Cloudflare Turnstile is fine)

## Approval and signature flow

No DocuSign needed for affiliate programs at this scale (commissions per-creator under a few thousand $/year).

**Required record of agreement:**
1. Application form submitted with **terms-acceptance checkbox ticked** (Tally timestamps the submission with the checkbox state)
2. **Welcome email** sent after approval, referencing the agreement URL ("the same terms you accepted")
3. **Reply or non-objection** to the welcome email = mutual record

This is electronically binding in US, UK, EU, AU jurisdictions. More than enough for the typical scale.

Graduate to DocuSign / HelloSign only when:
- A single creator earns >$1k/month from you
- Contracting with an LLC or media company instead of an individual
- Adding exclusivity, non-compete, or content-approval clauses

## Outreach patterns

Small creators outperform big channels for niche SaaS. They're more responsive, fit better, and convert their audience harder per impression.

### Where to find them (by audience type)

| Audience | Where to look |
|----------|---------------|
| Language learners | YouTube (`learn [language]`), TikTok (`#learn[language]`), Instagram, Substack newsletters, italki teachers (many have side YouTube channels) |
| Devs | YouTube tutorials, dev.to, Twitter/X, niche blogs (CSS-Tricks-style), Discord servers |
| Productivity / lifestyle | YouTube channels, Notion templates creators, Substack |
| Niche professional (e.g. accountants, lawyers) | LinkedIn creators, niche newsletters, professional Discords / Slacks |
| Fitness / wellness | Instagram, TikTok, YouTube (smaller channels) |

Filter for **5k–50k followers** as the sweet spot. Big enough to matter, small enough to respond to a personalized DM.

### DM template structure

Don't use a generic outreach template. Personalize each. Three-part structure:

1. **Specific reference** to their content. Watched/read 2–3 of their pieces.
2. **One-sentence pitch** — what the product is, why it fits *their audience specifically*.
3. **Low-friction ask.** Free [premium tier] account to try, no commitment, *not* a promotion ask.

Don't lead with the affiliate offer. Most creators won't want to promote. The ones who try it and like it will mention it organically — that's when you say *"btw if you ever want to share, here's a code that gives your audience 20% off and pays you 50%."*

### FTC / disclosure norms

Creators in regulated jurisdictions must disclose affiliate relationships. Standard formulations:
- US (FTC): `#ad`, `#sponsored`, or "I earn a commission if you use this code"
- EU (DSA): similar transparency requirements
- UK (CMA): clear identification of paid partnerships
- AU (ACCC): same general principle

Don't enforce a specific format. Just require honesty in the agreement.

### Subject line discipline

When the channel shows a subject line (email, LinkedIn message), use plain descriptor language. Pattern: `[product-descriptor] for [audience]`. Example: `German number listening practice tool for your podcast listeners`.

**Avoid:**
- `Quick note about X` / `Quick note re: X` — casual, throat-clearing
- `Big fan of X, building [something]` — flattery, pretentious
- `Re:` when not actually replying — feels deceptive
- `Free X for Y` — risks spam filtering and reads transactional

The body does the personalization; the subject just tells them what the email is about.

### Side-project disclosure on profile-visible channels

When outreach goes via LinkedIn (or any channel where the recipient sees your full professional profile in one tap), include a brief side-project clause: "[Product] is a side project I've been building outside my day job." One sentence, confident, no apology. Indie/teacher/creator communities are warm to peer-builders, and getting ahead of the day-job/project mismatch is warmer than letting them wonder.

Skip on platform-only DMs (italki, Substack, Patreon, Instagram) where the day-job profile isn't visible.

## Response handling

When a creator replies positively to outreach (asks for the account, says yes), follow these steps. Total: 5-10 min per creator.

### Step 1 — Log the reply

Update the candidate's record in `state/affiliate-outreach.json`:
- `status` → `replied`
- Append to `outreach` array: `{date, channel, action: "received", language, content, tone}`

### Step 2 — Create their promotion code

Reuse the shared program coupon. Create a new promotion code attached to it (`max_redemptions=1`, `expires_at` = ~30 days out, code matches the internal naming convention above).

```bash
KEY=<your stripe live secret key>
SV="Stripe-Version: 2025-04-30.basil"
COUPON_ID="<shared coupon id>"
NAME_UPPER="BIANCA"           # uppercase, no spaces
CREATOR_ID="bianca-italki"    # matches state JSON id field
CODE="FOUNDING-2026-LIFETIME-${NAME_UPPER}"
EXPIRES_AT=$(date -v +30d -v 23H -v 59M -v 59S +%s)

curl -s -X POST https://api.stripe.com/v1/promotion_codes -u "$KEY:" -H "$SV" \
  -d "coupon=$COUPON_ID" \
  -d "code=$CODE" \
  -d max_redemptions=1 \
  -d expires_at=$EXPIRES_AT \
  -d "metadata[creator_id]=$CREATOR_ID" \
  -d "metadata[program]=founding-cohort-2026"
```

Capture the returned `id` (`promo_xxx`) and `expires_at` for step 3.

### Step 3 — Update state JSON

Add to the candidate record:

```json
"stripe": {
  "personal_comp_code": "FOUNDING-2026-LIFETIME-<NAME>",
  "personal_comp_promo_id": "<promo_xxx from step 2>",
  "personal_comp_expires_at": "<ISO date with timezone>",
  "personal_comp_coupon_id": "<shared coupon id>",
  "audience_affiliate_code": null
}
```

### Step 4 — Draft the comp-delivery message

Match the language the creator replied in. Keep plain text (no markdown blockquotes — `>` characters get copy-pasted literally). Wrap the body in `--- copy from below/above this line ---` markers in the draft file.

#### English template

Replace `<NAME>` (their first name), `<NAME-UPPER>` (uppercase for the code), `<TIER>`, `<CODE>`, `<EXPIRY-DATE>`, and the product-specific redemption flow.

```
--- copy from below this line ---

Hi <NAME>,

Glad to hear it! Here's the code for your <TIER> account:

<CODE>

How to redeem:
1. <product-specific signup/login step>
2. <product-specific pricing/checkout step>
3. Apply the code at checkout

The code is single-use, only for the <TIER> tier, and expires on <EXPIRY-DATE>. If anything hitches, just give me a quick heads-up.

No rush trying it out, curious what you think once you've had time to take a look.

Best regards,
<your name>

--- copy from above this line ---
```

For other languages: translate the structure but match the creator's register (formal vs informal, regional turn of phrase). Keep the redemption steps as numbered list — universally easy to follow.

### Step 5 — Send and log

After copy-pasting and sending on the same channel they replied on, append to `outreach`: `{date, channel, action: "sent", variant: "comp-code-delivery"}`. Status stays `replied` (the comp code being sent doesn't change the funnel stage; only redemption does).

### Step 6 — When they confirm they tried it

Separate trigger:
- Set `status: applied` and fill `applied_date`
- Send the full affiliate pitch (Notion agreement + Tally form links)
- When they apply via Tally and you approve, set `status: active` and create their audience-facing affiliate code (short industry-style — see naming conventions above)

### Variations

- **Different language reply:** match it. Translate the template.
- **Reply asks questions instead of yes:** answer the questions first, hold the comp code until they explicitly ask for the account.
- **"Not interested" reply:** set `status: declined`, log the reply, archive. No comp code created.
- **Different tier requested:** create a separate shared coupon for that tier (or restrict the offer to the original tier and explain).

## State tracking

Use `state/affiliate-program.json` (per-product) for the creator roster:

```json
{
  "program_name": "Founding Creator Program",
  "commission_rate": 0.50,
  "discount_rate": 0.20,
  "tally_form_id": "abc123",
  "tally_form_url": "https://tally.so/r/abc123",
  "agreement_url": "https://notion.so/...",
  "status_flow": ["researched", "drafted", "sent", "replied", "applied", "approved", "active", "declined", "no-response"],
  "follow_up_cadence_days": [0, 7, 21, 30],
  "shared_stripe_artifacts": {
    "founding_cohort_2026_lifetime_coupon_id": "coupon_xyz",
    "founding_cohort_2026_lifetime_coupon_name": "Founding creator free lifetime",
    "founding_cohort_2026_lifetime_coupon_redeem_by": "2027-04-26T23:59:59Z",
    "stripe_api_version": "2025-04-30.basil",
    "_note": "Reuse this coupon for new founding-cohort comp codes. Create a new promotion_code (max_redemptions=1, expires_at=30d) per creator, attached to this coupon."
  },
  "creators": [
    {
      "name": "Anja Müller",
      "email": "anja@example.com",
      "channel": "https://youtube.com/@anja",
      "country": "DE",
      "status": "active",
      "outreach": [
        {"date": "2026-04-22", "channel": "linkedin", "action": "sent", "variant": "message-1-long"},
        {"date": "2026-04-23", "channel": "linkedin", "action": "received", "language": "de", "content": "...", "tone": "positive"},
        {"date": "2026-04-23", "channel": "linkedin", "action": "sent", "variant": "comp-code-delivery"}
      ],
      "stripe": {
        "personal_comp_code": "FOUNDING-2026-LIFETIME-ANJA",
        "personal_comp_promo_id": "promo_xxx",
        "personal_comp_expires_at": "2026-05-23T23:59:59Z",
        "personal_comp_coupon_id": "coupon_xyz",
        "audience_affiliate_code": "ANJA20",
        "audience_affiliate_promo_id": "promo_yyy"
      },
      "applied_date": "2026-04-25",
      "approved_date": "2026-04-26",
      "code_activated_date": "2026-04-26",
      "payout_method": "wise",
      "payout_email": "anja@example.com",
      "founding_cohort": "2026"
    }
  ],
  "monthly_payouts": [
    {
      "month": "2026-04",
      "payout_date": "2026-06-01",
      "creator_payouts": [
        { "code": "ANJA20", "sales": 12, "net_revenue": 348.00, "commission": 174.00, "wise_txn": "TX12345" }
      ]
    }
  ]
}
```

The schema is one file across the whole funnel — `status` moves from `researched` (early discovery) through `sent` (outreach), `replied` (positive response), `applied` (Tally form submitted), `approved` (you said yes), to `active` (audience code live and earning). The `outreach` array is append-only and tracks every send/receive on every channel.

The `personal_comp_code` (internal namespaced) is separate from the `audience_affiliate_code` (short industry-style). Don't conflate them. See **Naming conventions** above.

This file is gitignored (under `state/`) since it contains creator PII and payout amounts.

## Notion tracking (alternative to state JSON)

For projects with heavier outreach volume, use linked Notion databases instead of `state/affiliate-program.json`. This gives you kanban pipeline views, calendar views by follow-up date, and a UI for manual review without editing JSON.

**Recommended schema (3 linked databases):**

| Database | Purpose | Key properties |
|----------|---------|---------------|
| **Creators** | Creator records | Name, Status (select), Niche (multi_select), Discovered/Last Contact/Follow Up (dates), Comp Code, Affiliate Code, Email, Audience Size |
| **Creator Channels** | One per platform per creator | Name (title), Platform (select), URL, Creator (relation → Creators) |
| **Outreach Log** | Every DM/email sent or reply received | Name (title), Date, Direction (sent/received select), Method (select), Summary (rich_text), Creator (relation → Creators) |

**Relations:** Creators ↔ Channels (1:N), Creators ↔ Outreach Log (1:N).

**Views to create:**
- Creators → Kanban grouped by Status
- Creators → Calendar by Follow Up
- Outreach Log → Calendar by Date

**Claude interaction:** Use the Notion MCP tools (`mcp__notion__notion-search`, `mcp__notion__notion-fetch`, `mcp__notion__notion-update-page`, `mcp__notion__notion-create-pages`) or the REST API directly. Query creators by status, create channel records and link them, log outreach events.

**Existing setup:** See `zahlhaus/CLAUDE.md` § "Creator Outreach Tracking" for a working reference with real database IDs and relation property names.

## When to revisit / measure success

After the first 6–8 weeks, evaluate:

| Signal | Healthy | Concerning |
|--------|---------|------------|
| Outreach response rate | 20%+ replies to DMs | <5% |
| Conversion: code → first sale | 50%+ of approved creators | <20% (something's wrong with fit or product readiness) |
| Per-creator revenue / month | At least covers the commission % math | Commission is more than incremental revenue |
| Refund rate on coupon-using sales | Within 1–2x of baseline | Substantially higher (suggests creators sold to wrong audience) |

If the program is working, scale up creator count and consider raising commission for the next cohort or moving to a platform.

If it's not working, the usual culprits are: wrong creator fit, product not converting cold traffic, commission too low to justify creator effort, or creator audience too broad for a specialized product.

## Reference

This doc is consumed by the `/affiliate` command. The script `scripts/build-affiliate-form.mjs` builds the Tally application form from a per-product config. See those for operational details.
