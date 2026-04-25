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
  "creators": [
    {
      "name": "Anja Müller",
      "email": "anja@example.com",
      "channel": "https://youtube.com/@anja",
      "country": "DE",
      "stripe_promotion_code": "ANJA",
      "stripe_coupon_id": "coupon_xyz",
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
        { "code": "ANJA", "sales": 12, "net_revenue": 348.00, "commission": 174.00, "wise_txn": "TX12345" }
      ]
    }
  ]
}
```

This file is gitignored (under `state/`) since it contains creator PII and payout amounts.

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
