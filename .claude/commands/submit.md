Submit product to launch platforms and directories. Uses standard copy from DISTRIBUTION.md and assets from assets/.

The user specifies which platform(s), a category (e.g. "ai", "dev", "all"), or says "next": $ARGUMENTS

## Step 1: Read Context

1. Read `PRODUCT.md` — product details. If missing, ask user to run `/distribute` first.
2. Read `PLATFORMS.md` — comprehensive platform reference with reach, criteria, cost, and SEO data.
3. Read `DISTRIBUTION.md` — submission assets (copy, metadata) and platform fit assessment. If missing or has no Submission Assets section, ask user to run `/distribute` first.
4. Read `state/submissions.json` — if exists, check what's already submitted. Skip platforms already marked as submitted.

## Step 2: Select Platforms

If user specified a platform or category, use that. If user said "next", pick the next unsubmitted platforms from the recommended sequence. Otherwise, recommend based on product type.

Always consult `PLATFORMS.md` for the latest details on each platform.

### Platform Categories

**Launch platforms** (have a "launch day" — timing matters, plan ahead):

| Platform | Best For | Reach | Cost | Type |
|----------|----------|-------|------|------|
| **Product Hunt** | SaaS, dev tools, consumer apps | ~5.4M/mo, DR 91 | Free | Launch day |
| **Hacker News (Show HN)** | Dev tools, technical, open source | ~10M+/mo, DR 91 | Free | Launch day |
| **dev.to** | Dev tools, APIs, open source | 15M+/mo, DR 80 | Free | Content |
| **Peerlist Launchpad** | Dev tools, side projects | ~400K/mo, DR 76 | Free | Weekly launch |
| **Uneed** | Indie makers, SaaS | 22K/mo, DR 74 | Free / $29.99 | Daily launch |
| **Firsto** | Indie makers | ~32K/mo, DR 57 | Free / $19.90+ | Daily launch |
| **Microlaunch** | Sustained visibility (30 days) | 15-25K/mo | $49/mo | Monthly cycle |
| **Smol Launch** | First-time launchers | Growing | Free | Weekly launch |
| **DevHunt** | Developer tools only | Growing, DR 61 | Free | Daily launch |
| **OpenHunts** | Makers, developers | 500+ founders | Free | Launch day |

**Directories** (submit and wait — ongoing SEO/discovery value):

#### Major Review Platforms (DR 88+)
| Platform | DR | Link | Cost | Best For |
|----------|---:|------|------|----------|
| **G2** | 91 | Dofollow | Free/Paid | B2B SaaS |
| **Capterra** | 91 | Dofollow | Free/Paid | Mid-market B2B |
| **GetApp** | 88 | Dofollow | Free | SaaS, business software |
| **Software Advice** | 88 | Dofollow | Free | Enterprise |
| **SourceForge** | 92 | Dofollow | Free | Open source, dev tools |
| **Trustpilot** | 93 | Nofollow | Free/Paid | Any (branded search) |
| **Crunchbase** | 91 | Nofollow | Free/Paid | Investor visibility |

Note: G2 acquired Capterra/GetApp/Software Advice in Feb 2026. Submit to all while separate.

#### High-Authority Directories (DR 70-87)
| Platform | DR | Link | Cost | Best For |
|----------|---:|------|------|----------|
| **Wellfound** | 85 | Dofollow | Free | Startups |
| **F6S** | 83 | Dofollow | Free | Funding, accelerators |
| **StartupFA.me** | 83 | Dofollow | Free | Startups |
| **AppSumo** | 82 | — | Rev share | SaaS lifetime deals |
| **Dang.ai** | 81 | Dofollow | Free* | AI tools |
| **Fazier** | 81 | Dofollow | Free | Startups |
| **Clutch.co** | 80+ | Dofollow | Free/Paid | B2B services |
| **StackShare** | 80 | Dofollow | Free | Dev tools |
| **Indie Hackers** | 80 | Nofollow | Free | Bootstrapped |
| **AlternativeTo** | 79 | Nofollow | Free | Any software |
| **SaaSHub** | 77 | Dofollow | Free | SaaS |
| **Peerlist** | 76 | Nofollow | Free | Dev portfolios |
| **BetaList** | 75 | Dofollow | Free/$129 | Pre-launch |
| **Alternative.me** | 74 | Dofollow | Free | Software alternatives |
| **SoftwareWorld** | 73 | Dofollow | Free | B2B software |
| **MagicBox** | 72 | Dofollow | Free | Tools |
| **PeerPush** | 72 | Dofollow | Free | Community |
| **TinyLaunch** | 71 | Dofollow | Free | Small products |
| **TrustRadius** | 70+ | Mixed | Free/Paid | Enterprise B2B |
| **SideProjectors** | 70 | Dofollow | Free | Side projects |

#### AI-Specific (if product uses AI)
| Platform | DR | Traffic | Link | Cost |
|----------|---:|--------:|------|------|
| **TAAFT** | 77 | ~4M/mo | Dofollow | $347 |
| **Toolify.ai** | 68+ | ~5.1M/mo | Dofollow (6+) | $99 |
| **Toolpilot** | 77 | ~2K/mo | Dofollow | Free |
| **Futurepedia** | 72 | 400K+/mo | Dofollow | Free/$497 |
| **Future Tools** | 69 | ~57K/mo | Dofollow | Free |
| **aitools.fyi** | 68 | ~11K/mo | Nofollow | Free |
| **TopAI.tools** | 53 | ~2M/mo | Dofollow | Free |
| **ListMyAI** | — | Growing | Dofollow | Free |
| **AI Tools Directory** | ~45 | — | — | Free |

#### Developer Tools (if product is dev-focused)
| Platform | DR | Link | Cost | Notes |
|----------|---:|------|------|-------|
| **GitHub Awesome Lists** | 97 | Nofollow | Free (PR) | Find relevant awesome-* lists |
| **free-for-dev** | 97 | Nofollow | Free (PR) | Must have free tier lasting 1+ year |
| **StackShare** | 80 | Dofollow | Free | Tech stack sharing |
| **DevHunt** | 61 | Dofollow | Free | Dev tools only |
| **Console.dev** | ~50 | Newsletter | Free | 30K+ subs, editorial |
| **LibHunt** | ~55 | Mixed | Free | Libraries by language |
| **OpenAlternative** | 50 | Dofollow | Free (PR) | Open source alternatives |
| **freeStuffDev** | — | — | Free | Free dev services |
| **WebCurate** | — | — | Free | 430+ curated dev tools |
| **Dev Resources** | — | — | Free (PR) | 800+ resources |
| **DevSuite** | — | — | Free | Feature comparisons |

#### General Software & SaaS
| Platform | DR | Link | Cost |
|----------|---:|------|------|
| **Startup Stash** | 66 | Nofollow | Free |
| **Open Launch** | 67 | Dofollow | Free |
| **Slant** | ~65 | Mixed | Free |
| **Pitchwall** | 60 | Nofollow | Free |
| **Serchen** | ~50 | — | Free |
| **SaaSWorthy** | 42 | — | Free |
| **LaunchingNext** | 51 | Dofollow | Free |
| **KillerStartups** | ~55 | Mixed | Free |

#### B2B Services (if applicable)
| Platform | DR | Link | Cost |
|----------|---:|------|------|
| **Clutch.co** | 80+ | Dofollow | Free/Paid |
| **GoodFirms** | 55 | Dofollow | Free/Paid |
| **Crozdesk** | ~50 | — | Free/Paid |

#### Niche (select based on vertical)
| Platform | Focus | Cost |
|----------|-------|------|
| **NoCodeList** | No-code tools | Free |
| **NoCode Finder** | No-code tools | Free |
| **Remote Tools** | Remote work tools | Free |
| **Aura++** | Startup launches | Free |
| **TrustMRR** | SaaS metrics | Free |

#### Newsletter & Marketplace (if budget allows)
| Platform | Reach | Cost |
|----------|-------|------|
| **TLDR Newsletter** | 1.25M subscribers | $5K-$15K/issue |
| **Ben's Bites** | 120K+ AI subscribers | Free submit / paid sponsor |
| **AppSumo** | ~2M/mo, 1.25M followers | Free (60-70% rev share) |
| **BetaTesting** | 400K testers | $170+/mo |

### Discover More Niche Platforms
Search for platforms specific to the product's domain:
```bash
stride channel x search "best {category} tools list" --max 20 --json
stride channel reddit search "best {category} tools" --subreddit {relevant} --max 20 --json
```
Also web search for: "{category} directory", "best {category} tools 2026", "alternatives to {competitor}"

## Step 3: Prioritize

Score selected platforms by:
- **Domain Rating** — higher DR = more valuable backlink
- **Link type** — dofollow > nofollow (but nofollow from DR 90+ still valuable)
- **Relevance** — does the audience match?
- **Traffic** — does the platform actually send traffic?
- **Effort** — free submission vs requires review/payment
- **Timing** — launch platforms need scheduling; directories can be done anytime

Present a prioritized list grouped into:
1. **Must-do (free, high DR, dofollow)**: SourceForge, G2, Capterra, Wellfound, F6S, StackShare
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

1. **Week 1**: Directories (G2, Capterra, SourceForge, Wellfound, F6S, Crunchbase, AlternativeTo, SaaSHub) + BetaList (queue early)
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
- Prioritize dofollow from DR 80+ first (SourceForge, G2, Capterra, Wellfound, F6S, StackShare)
- GitHub links (DR 97) are nofollow but provide massive discovery value
