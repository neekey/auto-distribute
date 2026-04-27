Post and engage on social media (X and Reddit) using Stride CLI. Supports manual drop-in modes: `/social reply <url>` drafts a reply to a thread you paste in; `/social post <subreddit>` drafts a post tailored to a specific subreddit.

The user provides context: $ARGUMENTS

## Step 0: Resolve Project Path

Check if `$ARGUMENTS` contains `--project <path>`. If yes, extract the path and use it as the base directory for all per-product files (`PRODUCT.md`, `DISTRIBUTION.md`, `state/`). Remove `--project <path>` from arguments before processing.

If no `--project`, use the current working directory.

## Step 1: Read Context

1. Read `PRODUCT.md` — product details. If missing, ask user to run `/distribute` first.
2. Read `DISTRIBUTION.md` — if exists, check social media strategy section.
3. Read `state/social-posts.json` — if exists, check post history to avoid repeating.

## Step 2: Determine Action

The user can request:
- **"post"** or **"announce"** — create and publish a post about the product (auto-decide where, or pass a subreddit name)
- **"engage"** — find relevant conversations and reply helpfully (auto-search)
- **"reply <url>"** — manual reply mode: user drops a thread URL, you draft a reply for it
- **"monitor"** — search for mentions and relevant discussions
- **"thread"** — create a multi-post thread (X) or long-form post (Reddit)

If unclear, ask what they want to do.

### Manual drop-in modes

Two manual modes let the user bypass auto-search by dropping a URL or subreddit name directly:

**Manual reply** — `/social reply <url>` (or `$ARGUMENTS` starts with `reply http...`):
1. Detect platform from URL host: `reddit.com` → Reddit; `x.com` / `twitter.com` → X.
2. Fetch the thread/tweet to read the original content. For Reddit: `stride channel reddit comments <url> --max 50 --json`. For X: WebFetch the tweet URL.
3. **Dedupe check** — read `state/social-posts.json` and abort if `engagements[].original_url` already contains this URL. Tell the user we already replied.
4. **Reddit only** — verify the thread is not archived (look at the post JSON's `archived` field). Skip if archived.
5. Draft a reply per the engagement rules in Step 4 (lead with value, mention product naturally only if relevant, brief and authentic).
6. Present the draft + original-post context. Ask user to approve.
7. On approval, post via stride and append to state with `source: "manual"`, `status: "sent"`. If user says "save for later," append with `status: "drafted"` and skip posting.

**Manual post** — `/social post <subreddit>` or `/social post r/<subreddit>` (a subreddit name is the next token after "post"):
1. Strip leading `r/` if present. The remainder is the target subreddit.
2. Read the sub's recent activity: `stride channel reddit browse <subreddit> --sort hot --max 10 --json`. Skim titles + bodies to internalize tone, format, and what's getting upvotes.
3. Fetch the sub's rules where available (Reddit's about page is often gated via stride; if so, ask the user for the rules or check moderator-pinned posts in the browse output).
4. **Dedupe check** — read `state/social-posts.json`. If `posts[]` already contains a post in this subreddit within the last 30 days, warn the user before drafting again.
5. Draft a post matching the sub's culture (educational, "I built this" story, ask-for-feedback, etc.). Reference the existing rules in Step 3 § Reddit Posts.
6. Present draft with subreddit-specific notes (which rules you're matching, why you chose the framing).
7. On approval, post via `stride channel reddit post --subreddit <name> --title "..." --body "..."` and append to state with `source: "manual"`, `status: "sent"`.

For both manual modes: still apply all engagement rules (no spam, value first, no marketing speak, follow tone-of-voice memory rules — no em-dashes in human-facing prose; user-recommendation tone for product mentions).

## Step 3: Post Creation

### For X Posts:
- Generate tweet copy (280 chars max)
- Suggest relevant hashtags (2-3 max, don't overdo it)
- If announcing, suggest a thread format:
  - Tweet 1: hook/headline
  - Tweet 2-4: key features/benefits
  - Tweet 5: CTA with link
- Present draft, ask user to review
- Post via: `stride channel x post "tweet text"`
- For threads: post first tweet, then reply to it

### For Reddit Posts:
- Identify target subreddit(s) from DISTRIBUTION.md or ask user
- **Read the subreddit rules first**: `stride channel reddit browse {subreddit} --sort hot --max 5 --json` to understand the tone and format
- Generate post matching subreddit culture:
  - Some subreddits want educational content
  - Some want "I built this" stories
  - Some want "ask for feedback" framing
  - NEVER do an obvious product pitch — provide value first
- Present draft with subreddit-specific notes
- Post via: `stride channel reddit post --subreddit {name} --title "Title" --body "Body"`

## Step 4: Engagement

### Find Conversations:
```bash
# Search for people discussing the problem your product solves
stride channel x search "{problem keywords}" --max 30 --json
stride channel x search "{competitor name} alternative" --max 20 --json
stride channel reddit search "{problem keywords}" --subreddit {relevant} --max 30 --json
```

### Filter Results:
- Prioritize recent posts (last 7 days)
- Prioritize posts with questions or complaints
- Skip posts that already have good answers
- Skip posts from competitors' accounts

### Generate Replies:
For each promising conversation:
1. **Lead with value** — answer their question or acknowledge their frustration
2. **Mention your product naturally** — only if genuinely relevant, and only after providing value
3. **Keep it brief and authentic** — no marketing speak
4. Present each reply draft with the original post context
5. Ask user to approve before posting
6. Post via: `stride channel x reply {url} "reply text"` or `stride channel reddit reply {url} "reply text"`

**Rules for engagement:**
- NEVER spam — quality over quantity
- NEVER post the same reply twice
- ALWAYS provide genuine value even without mentioning the product
- Maximum 3-5 engagement replies per session to avoid looking spammy
- Wait for user approval on every reply before posting

## Step 5: Track

Update `state/social-posts.json`. Always include `source` (`auto` or `manual`) and `status` (`drafted` or `sent`):

```json
{
  "posts": [
    {
      "platform": "x",
      "type": "announcement",
      "subreddit": null,
      "title": null,
      "content": "...",
      "date": "2026-04-11",
      "url": "...",
      "source": "auto",
      "status": "sent"
    },
    {
      "platform": "reddit",
      "type": "post",
      "subreddit": "SideProject",
      "title": "...",
      "content": "...",
      "date": "2026-04-27",
      "url": "...",
      "source": "manual",
      "status": "sent"
    }
  ],
  "engagements": [
    {
      "platform": "reddit",
      "subreddit": "SaaS",
      "original_url": "...",
      "reply": "...",
      "date": "2026-04-11",
      "source": "manual",
      "status": "sent"
    }
  ]
}
```

For drafts saved before posting (user said "save for later"), set `status: "drafted"` and leave the posted `url` field null. When the user later confirms send, flip `status` to `sent` and fill in the URL.

## Step 6: Suggest Follow-ups

- "Run `/social monitor` in a few days to check for replies to your posts"
- "Search for new conversations weekly: `/social engage`"
- Suggest content calendar: announce on X → engage on Reddit → share on X again with results/learnings
