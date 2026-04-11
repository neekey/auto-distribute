Submit product to launch platforms. Generates platform-specific copy and guides through submission.

The user specifies which platform or says "all": $ARGUMENTS

## Step 1: Read Context

1. Read `PRODUCT.md` — product details. If missing, ask user to run `/distribute` first.
2. Read `PLATFORMS.md` — comprehensive platform reference with reach, criteria, cost, and SEO data.
3. Read `DISTRIBUTION.md` — if exists, check launch platform section for status.
4. Read `state/submissions.json` — if exists, check what's already submitted.

## Step 2: Select Platforms

If user specified a platform, use that. Otherwise, recommend based on product type using the tiers below. Always consult `PLATFORMS.md` for the latest details on each platform.

### Tier 1: High Reach, Free
| Platform | Best For | Reach | Submission |
|----------|----------|-------|------------|
| **Product Hunt** | SaaS, dev tools, consumer apps | ~5.4M/mo, DR 91 | Manual (web) — generate all copy + assets checklist |
| **Hacker News (Show HN)** | Dev tools, technical, open source | ~10M+/mo, DR 91 | Manual (web) — generate title + first comment |
| **dev.to** | Dev tools, APIs, open source | 15M+/mo, DR 80 | Write educational content featuring product |
| **Peerlist Launchpad** | Dev tools, side projects | ~400K/mo, DR 76 | Manual (web) — Monday launches |

### Tier 2: Established, Free/Cheap
| Platform | Best For | Reach | Cost |
|----------|----------|-------|------|
| **BetaList** | Pre-launch, early stage | DR 75, 15-20% conversion | Free / $129 expedited |
| **BetaPage** | Any stage, feedback | 57-65K/mo, DR 69 | Free / $60 featured |
| **LaunchingNext** | Early-stage startups | 45K+ listed, DR 51 | Free |
| **KillerStartups** | Any early-stage startup | 125K/mo views | Free |
| **SideProjectors** | Side projects, indie | DR 69, dofollow | Free |
| **Startup Stash** | SaaS, startup tools | DR 66 | Free |

### Tier 3: Indie/Emerging
| Platform | Best For | Reach | Cost |
|----------|----------|-------|------|
| **Uneed** | Indie makers, SaaS | 22K/mo, DR 74 | Free / $29.99 skip |
| **Firsto** | Indie makers | ~32K/mo, DR 57 | Free / $19.90+ |
| **Microlaunch** | Sustained visibility (30 days) | 15-25K/mo | $49/mo |
| **Smol Launch** | First-time launchers | Growing | Free |
| **DevHunt** | Developer tools only | Growing, DR 61 | Free |
| **OpenHunts** | Makers, developers | 500+ founders | Free |
| **Lobste.rs** | Open source, dev tools | ~400K/mo | Free (invite-only) |
| **StartuPage** | Verified traction credibility | Growing | Free |

### Tier 4: AI-Specific (if applicable)
| Platform | Reach | Cost |
|----------|-------|------|
| **There's An AI For That** | 4M+/mo, DR 77 | $347 one-time |
| **Toolify.ai** | ~5.1M/mo, DR 68+ | $99 one-time |
| **Futurepedia** | 400K+/mo, DR 72 | Free / $497 verified |
| **Future Tools** | ~57K/mo, DR 69 | Free |
| **TopAI.tools** | ~2M/mo, DR 53 | Free |
| **Dang.ai** | DR 81 | Free (badge required) |

### Tier 5: Newsletter & Marketplace (if budget allows)
| Platform | Reach | Cost |
|----------|-------|------|
| **TLDR Newsletter** | 1.25M subscribers | $5K-$15K/issue |
| **Ben's Bites** | 120K+ AI subscribers | Free submit / paid sponsor |
| **AppSumo** | ~2M/mo, 1.25M followers | Free (60-70% rev share) |
| **BetaTesting** | 400K testers | $170+/mo |

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

### dev.to
- **Article title**: educational/tutorial angle, not a product announcement
- **Article body**: teach something valuable, weave your product in naturally as the solution
- **Tags**: up to 4 relevant dev.to tags
- **Tips**: include code snippets, be genuinely helpful, engage with comments

### Peerlist Launchpad
- **Project name and tagline**
- **Description**: what it does, who it's for
- **Links**: product URL, GitHub if applicable
- **Best timing**: submit before Monday for that week's launch

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

### BetaPage
- **Product name and URL**
- **Short description**
- **Category**
- **Screenshots**: list what to prepare

### LaunchingNext / KillerStartups / Startup Stash
- **Product name and URL**
- **Problem it solves**
- **Description** (2-3 paragraphs)
- **Category/tags**
- **Founders info**

### Uneed / Firsto / Smol Launch / DevHunt / OpenHunts
- **Product name and URL**
- **Tagline**
- **Description** (1-2 paragraphs)
- **Category**

### AI Platforms (TAAFT, Toolify, Futurepedia, etc.)
- **Tool name and URL**
- **Short description** (50-150 chars)
- **Long description** (1-2 paragraphs)
- **Category/use case**
- **Pricing model**
- **Key features** (bullet list)

### AppSumo
- **Product name and URL**
- **Problem statement**
- **Solution description**
- **Key features** (3-5)
- **Lifetime deal pricing suggestion**
- **Target audience overlap with SMBs/marketers/creators**

### Newsletter Pitches (TLDR, Ben's Bites)
- **One-line pitch**
- **What it does** (2-3 sentences)
- **Why it matters to their audience**
- **Link**

## Step 4: Present and Confirm

Show the generated copy for each platform. Ask user to review and edit. For each platform:

1. Present the copy
2. Ask if they want to adjust anything
3. Provide the submission URL where they need to go
4. Update `state/submissions.json` with status:
   ```json
   {
     "product_hunt": { "status": "copy_ready", "date": "2026-04-12", "copy": {...} },
     "hacker_news": { "status": "submitted", "date": "2026-04-12", "url": "..." }
   }
   ```

## Step 5: Post-Launch Guidance

After submission, remind the user:
- **Product Hunt**: share the PH link on social (run `/social` with the PH link), respond to every comment within the first 24h
- **Hacker News**: respond to every comment genuinely, don't be defensive about criticism
- **dev.to**: engage with comments, write follow-up posts
- **Indie Hackers**: engage with comments, be transparent about metrics
- **Peerlist**: engage with the community throughout the week
- **AI platforms**: monitor for reviews and questions
- **AppSumo**: treat AppSumo customers as first-class, respond to all questions
- Monitor mentions: `stride channel x search "{product name}" --max 20 --json`

## Recommended Launch Sequence

For maximum impact, stagger launches across platforms:

1. **Week 1**: BetaList (submit early for queue), directories (see `/directories`)
2. **Week 2**: Product Hunt (plan 2-3 weeks ahead for optimal day)
3. **Week 2-3**: Hacker News Show HN (different day than PH)
4. **Week 3**: dev.to article, Indie Hackers post
5. **Week 3-4**: Tier 3 platforms (Uneed, Firsto, DevHunt, etc.)
6. **Week 4+**: AI platforms (if applicable), newsletter pitches
7. **Ongoing**: AppSumo application, community engagement
