Find and submit to relevant directories for SEO backlinks and discovery.

The user provides context: $ARGUMENTS

## Step 1: Read Context

1. Read `PRODUCT.md` — product details. If missing, ask user to run `/distribute` first.
2. Read `DISTRIBUTION.md` — if exists, check directories section.
3. Read `state/submissions.json` — if exists, check what's already submitted.

## Step 2: Research Directories

Based on the product category and target audience, identify relevant directories. Start with these categories:

### General SaaS/Product Directories
| Directory | URL | DA | Free? | Notes |
|-----------|-----|-----|-------|-------|
| AlternativeTo | alternativeto.net | High | Yes | List as alternative to competitors |
| SaaSHub | saashub.com | High | Yes | SaaS-focused directory |
| G2 | g2.com | High | Free tier | Enterprise/B2B focus |
| Capterra | capterra.com | High | Free tier | Business software |
| Product Hunt (evergreen) | producthunt.com | High | Yes | Beyond launch day |
| Toolify | toolify.ai | Medium | Yes | AI tools specifically |
| There's An AI For That | theresanaiforthat.com | Medium | Yes | AI tools |
| SaaSWorthy | saasworthy.com | Medium | Yes | SaaS comparison |
| GetApp | getapp.com | High | Free tier | Business software |

### Dev Tool Directories (if applicable)
| Directory | URL | Notes |
|-----------|-----|-------|
| GitHub Awesome Lists | github.com/topics/awesome | Find relevant awesome-* lists, submit PR |
| StackShare | stackshare.io | Dev tool stack sharing |
| LibHunt | libhunt.com | Library/tool discovery |
| Console.dev | console.dev | Dev tool newsletter/directory |

### Startup/Indie Directories
| Directory | URL | Notes |
|-----------|-----|-------|
| Indie Hackers | indiehackers.com/products | Product listing |
| MicroConf Connect | microconf.com | Bootstrapper community |
| Uneed | uneed.best | Curated tools |
| StartupStash | startupstash.com | Startup resources |
| BetaPage | betapage.co | Startup discovery |
| Launched | launched.io | New products |

### Niche Directories
Search for directories specific to the product's domain:
```bash
stride channel x search "best {category} tools list" --max 20 --json
stride channel reddit search "best {category} tools" --subreddit {relevant} --max 20 --json
```
Also web search for: "{category} directory", "best {category} tools 2026", "alternatives to {competitor}"

## Step 3: Prioritize

Score each directory by:
- **Domain authority** — higher DA = more valuable backlink
- **Relevance** — does the audience match?
- **Effort** — free submission vs requires review/payment
- **Traffic potential** — does the directory actually send traffic?

Present a prioritized table to the user.

## Step 4: Generate Submission Copy

For each selected directory, generate the required fields:
- **Product name**
- **URL**
- **Short description** (varies by directory: 50-300 chars)
- **Long description** (if required)
- **Category/tags**
- **Screenshots** (list which ones to prepare)
- **Competitor alternatives** (for AlternativeTo-style sites)
- **Pricing info**

Tailor the description to each directory's audience and format.

## Step 5: Submit and Track

For each directory:
1. Present the submission copy
2. Provide the submission URL
3. Guide through any specific submission steps
4. Update `state/submissions.json`:
   ```json
   {
     "directories": {
       "alternativeto": { "status": "submitted", "date": "2026-04-11", "url": "..." },
       "saashub": { "status": "pending_review", "date": "2026-04-11" }
     }
   }
   ```

## Step 6: Follow Up

Remind user to:
- Check back on directories with "pending review" status in 1-2 weeks
- Add badges/logos if the directory provides them (social proof)
- Respond to any reviews or comments on directory listings
- Run `/directories` again periodically — new directories appear, existing listings can be updated
