Post and engage on social media (X and Reddit) using Stride CLI. Supports manual drop-in modes: `/social reply <url>` drafts a reply to a thread you paste in; `/social post <subreddit>` drafts a post tailored to a specific subreddit; `/social draft-queue` walks the Notion Reddit-discovery queue and pre-drafts replies for review (designed for headless `claude -e` invocation after the daily discovery cron).

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
- **"draft-queue"** — walk the Notion Reddit-discovery queue: for each `Status = New` row, draft a reply into the page body and flip status to `Reply Drafted`. Headless-friendly (no approval prompts).
- **"monitor"** — search for mentions and relevant discussions
- **"thread"** — create a multi-post thread (X) or long-form post (Reddit)

If unclear, ask what they want to do.

### Manual drop-in modes

Three manual modes let the user bypass auto-search.

**Notion access:** the queue-aware paths below use `scripts/notion-cli.mjs` against the Notion REST API. Requires `NOTION_API_KEY` in env (see `CLAUDE.md` § "Notion access for /social and /affiliate"). Do NOT use `mcp__notion__*` tools here — some are gated to enterprise plans and will fail in headless `claude -e` runs.

**Notion DBs (hardcoded by product):**

| Product (PRODUCT.md `# Product:` line) | Notion database ID | DB URL |
|---|---|---|
| Numblr | `df2c80d3-ac7e-4c3a-9e0b-ada5c67fd48a` | https://www.notion.so/df2c80d3ac7e4c3a9e0bada5c67fd48a |
| Zahlhaus | `34a4f2ba-6e96-411c-ac34-74f0f2eea758` | https://www.notion.so/34a4f2ba6e96411cac3474f0f2eea758 |

When `--project` is given, use that product's DB. Without `--project`, infer from `PRODUCT.md`'s `# Product:` line; if neither name matches, abort with a clear error.

**Page-body invariant (across modes):** for any row whose `Status` is `Reply Drafted`, the page body MUST contain only the reply text — plain paragraphs, no headings, no markers, no meta. `/social reply <url>` posts the body verbatim. Skip-reasons and triage notes go into the `Fit Notes` property, never the body.

**Manual reply** — `/social reply <url>` (or `$ARGUMENTS` starts with `reply http...`):
1. Detect platform from URL host: `reddit.com` → Reddit; `x.com` / `twitter.com` → X.
2. Fetch the thread/tweet to read the original content. For Reddit: `stride channel reddit comments <url> --max 50 --json`. For X: WebFetch the tweet URL.
3. **Dedupe check** — read `state/social-posts.json` and abort if `engagements[].original_url` already contains this URL. Tell the user we already replied.
4. **Reddit only** — verify the thread is not archived (look at the post JSON's `archived` field). Skip if archived.
5. **Reddit only — check the Notion discovery queue for an existing draft.**
   - Pick the DB ID from the table above (use `--project` if provided, else infer from `PRODUCT.md`; if neither, query both DBs in turn).
   - Look up the row by URL:
     ```bash
     node scripts/notion-cli.mjs find-by-url --database <db-id> --url <reddit-url>
     ```
     Returns the page object or `null`. If `null`, no queue row exists; proceed with fresh drafting.
   - If a row is found, read `properties.Status.select.name`:
     - **`Reply Drafted`** — read the page body and use it as the draft:
       ```bash
       node scripts/notion-cli.mjs get-page-body --page <page-id>
       ```
       The `text` field is the entire draft. If empty, abort with an error (something's wrong with the upstream draft). Skip step 6; jump to step 7. Track the page ID for the post-flip in step 8.
     - **`New`** — no draft yet. Proceed with fresh drafting; track the page ID for the post-flip.
     - Other statuses (`Replied`, `Skip`, `Archived`, `Reviewed`) — treat like no row; proceed with fresh drafting and don't flip status afterwards.
6. Draft a reply per the engagement rules in Step 4 (lead with value, mention product naturally only if relevant, brief and authentic). Skip this step if step 5 loaded an existing draft.
7. Present the draft + original-post context. Ask user to approve.
8. On approval:
   - Post via stride: `stride channel reddit reply <url> "<reply text>"`.
   - Append to `state/social-posts.json` with `source: "manual"`, `status: "sent"`.
   - **If a Notion queue row was found** (step 5): flip its Status to `Replied`:
     ```bash
     node scripts/notion-cli.mjs update-properties --page <page-id> \
       --properties '{"Status":{"select":{"name":"Replied"}}}'
     ```
   - If user says "save for later," append with `status: "drafted"` and skip posting + skip the Notion Status flip.

**Manual post** — `/social post <subreddit>` or `/social post r/<subreddit>` (a subreddit name is the next token after "post"):
1. Strip leading `r/` if present. The remainder is the target subreddit.
2. Read the sub's recent activity: `stride channel reddit browse <subreddit> --sort hot --max 10 --json`. Skim titles + bodies to internalize tone, format, and what's getting upvotes.
3. Fetch the sub's rules where available (Reddit's about page is often gated via stride; if so, ask the user for the rules or check moderator-pinned posts in the browse output).
4. **Dedupe check** — read `state/social-posts.json`. If `posts[]` already contains a post in this subreddit within the last 30 days, warn the user before drafting again.
5. Draft a post matching the sub's culture (educational, "I built this" story, ask-for-feedback, etc.). Reference the existing rules in Step 3 § Reddit Posts.
6. Present draft with subreddit-specific notes (which rules you're matching, why you chose the framing).
7. On approval, post via `stride channel reddit post --subreddit <name> --title "..." --body "..."` and append to state with `source: "manual"`, `status: "sent"`.

**Queue draft** — `/social draft-queue` (typically run headless via `claude -e "/social draft-queue --project ~/workspaces/numblr"` after the daily discovery cron):

The Reddit-discovery flow (Windmill, see `windmill/README.md`) writes candidate threads to a per-product Notion DB with `Status = New`. This mode walks that queue and pre-drafts replies for human review later.

**Status options on the DB:** `New`, `Reviewed`, `Reply Drafted`, `Replied`, `Skip`, `Archived`. This mode reads `New` and writes either `Reply Drafted` or `Skip`.

**Schema fields written by this mode:**
- `Status` → `Reply Drafted` (or `Skip`)
- `Product Fit` (select: `strong` / `weak` / `none`) — how well the thread fits the product's mechanic
- `Fit Notes` (rich text) — 1-2 sentences: what subreddit posture applies, whether to mention the product, why. **Skip-reasons also go here** (e.g., "skipped: thread archived"; "skipped: already engaged, see state/social-posts.json").
- **Page body** — only set on `Reply Drafted` rows; contains the reply text only (see invariant above). On `Skip` rows, leave the body empty.

**Steps:**

1. **Find the queue.** Pick the product's DB ID, then query for `Status = New` rows sorted by score:
   ```bash
   node scripts/notion-cli.mjs query --database <db-id> \
     --filter '{"property":"Status","select":{"equals":"New"}}' \
     --sorts '[{"property":"Reddit Score","direction":"descending"}]' \
     --max 5
   ```
   The CLI returns an array of page objects. Cap is 5 per run to keep the session bounded; remaining rows stay `New` for the next run.
2. **For each New row** (read `id` and `properties.URL.url`, `properties.Title.title[0].plain_text`, `properties.Subreddit.select.name`, `properties.Snippet.rich_text[0].plain_text`, `properties["Why Match"].rich_text[0].plain_text`, `properties["Reddit Score"].number` from the page object):
   a. **Dedupe:** read `state/social-posts.json` and skip if `engagements[].original_url` already contains the Reddit URL. Use the skip helper below with reason `"already engaged — see state/social-posts.json"`.
   b. **Fetch thread:** `stride channel reddit comments <url> --max 30 --json`.
   c. **Archived check:** if the thread JSON's `archived` field is true, skip with reason `"thread archived"`.
   d. **Sub-rules check:** consult memory (`reference_reddit_sub_rules.md`, `project_numblr_reddit_engagement.md`, `project_zahlhaus_distribution.md`) for the subreddit's posture on product mentions. Hard-skip subs (r/TOEFL, r/ENGLISH, r/GlobalEnglishPrep, r/Deutsch, r/AskAGerman): skip with reason `"hard-skip sub for product mentions"`.
   e. **Fit assessment:** decide if a product mention is genuinely relevant. If not, draft a pure-helpful reply with no product mention (still useful — accumulates karma + organic feel).
   f. **Draft the reply** per Step 4 engagement rules + memory tone rules (no em-dashes; user-recommendation tone if mentioning the product; no link unless the sub clearly allows it).
   g. **Write the page body.** Save the draft to a temp file, then:
   ```bash
   node scripts/notion-cli.mjs replace-page-body --page <page-id> --content-file /tmp/draft.txt
   ```
   The CLI splits on blank lines into paragraph blocks. Body MUST be reply text only (per invariant above).
   h. **Set properties:**
   ```bash
   node scripts/notion-cli.mjs update-properties --page <page-id> --properties '{
     "Status": {"select": {"name": "Reply Drafted"}},
     "Product Fit": {"select": {"name": "strong"}},
     "Fit Notes": {"rich_text": [{"text": {"content": "<1-2 sentence note>"}}]}
   }'
   ```

   **Skip helper** — when skipping a row at step a/c/d, run only the properties update (no body write):
   ```bash
   node scripts/notion-cli.mjs update-properties --page <page-id> --properties '{
     "Status": {"select": {"name": "Skip"}},
     "Product Fit": {"select": {"name": "none"}},
     "Fit Notes": {"rich_text": [{"text": {"content": "skipped: <reason>"}}]}
   }'
   ```

3. **Print summary** at the end: how many drafted, how many skipped (and why), how many remaining `New` rows in the queue. This is what shows up in `claude -e` output.

**Headless safety:** This mode never posts to Reddit. It only writes drafts to Notion. Human review happens in Notion before invoking `/social reply <url>` to post.

**No approval prompts.** Designed for unattended `claude -e` execution. If a thread has no draftable response (all skip conditions trip), still flip Status away from `New` so the queue progresses.

For all manual modes: still apply all engagement rules (no spam, value first, no marketing speak, follow tone-of-voice memory rules — no em-dashes in human-facing prose; user-recommendation tone for product mentions).

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
