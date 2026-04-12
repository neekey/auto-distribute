Post and engage on social media (X and Reddit) using Stride CLI.

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
- **"post"** or **"announce"** — create and publish a post about the product
- **"engage"** — find relevant conversations and reply helpfully
- **"monitor"** — search for mentions and relevant discussions
- **"thread"** — create a multi-post thread (X) or long-form post (Reddit)

If unclear, ask what they want to do.

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

Update `state/social-posts.json`:
```json
{
  "posts": [
    {
      "platform": "x",
      "type": "announcement",
      "content": "...",
      "date": "2026-04-11",
      "url": "..."
    }
  ],
  "engagements": [
    {
      "platform": "reddit",
      "subreddit": "SaaS",
      "original_url": "...",
      "reply": "...",
      "date": "2026-04-11"
    }
  ]
}
```

## Step 6: Suggest Follow-ups

- "Run `/social monitor` in a few days to check for replies to your posts"
- "Search for new conversations weekly: `/social engage`"
- Suggest content calendar: announce on X → engage on Reddit → share on X again with results/learnings
