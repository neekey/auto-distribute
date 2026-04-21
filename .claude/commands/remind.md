Create a macOS Reminders entry via AppleScript/osascript for a recurring or one-off task.

The user provides context: $ARGUMENTS

Use this command for scheduling local human-review checkpoints (e.g., weekly `/social engage`, monthly SEO re-analysis). Remote triggers (via `/schedule`) run in Anthropic's cloud and cannot access local tools like `stride-cli` or local project files, so a Mac reminder is the right fit for tasks that require local action.

## Step 1: Gather details

From `$ARGUMENTS`, extract:
- **title** (short reminder name, required)
- **when** (due date/time; parse natural language like "next Monday 9am", "tomorrow", "in 3 days")
- **body** (longer instructions; what to do, rules to follow, command to run)
- **repeat** (daily/weekly/monthly/none; for weekly `/social` reviews, default to weekly)
- **project** (optional `--project <path>`; affects default body content if referenced)

If any required field is missing or ambiguous, ask the user once, then proceed.

## Step 2: Compose the body

Good reminder bodies are self-contained so the user doesn't have to reconstruct context on Monday morning. For a `/social engage` reminder, include:
- The exact command to run (e.g., `/social reddit --project ~/workspaces/numblr`)
- Target subreddits / platforms
- Rules to remember (no em-dashes, tone, ratio, per-sub restrictions)
- Anything surprising from the last session (e.g., "skip r/TOEFL, Rule 1")

For other task types, inline the equivalent operating context.

## Step 3: Resolve the due date

Use bash `date -v` arithmetic to compute an absolute timestamp, then pass it to AppleScript via a native date object (AppleScript's `date "string"` parser is locale-sensitive and fragile; prefer setting year/month/day/hours/minutes/seconds directly).

Examples:
- "next Monday 9am" → `date -v+Mon -v9H -v0M -v0S '+%Y %m %d %H %M %S'` → split and feed into AppleScript `set` statements
- "tomorrow 8am" → `date -v+1d -v8H -v0M -v0S ...`

## Step 4: Create the reminder

Use this osascript template (note: `due date` is set by constructing an AppleScript date object, not by parsing a string):

```bash
osascript <<'APPLESCRIPT'
set dueDate to current date
set year of dueDate to {YEAR}
set month of dueDate to {MONTH}
set day of dueDate to {DAY}
set hours of dueDate to {HOURS}
set minutes of dueDate to {MINUTES}
set seconds of dueDate to 0

tell application "Reminders"
    set targetList to default list
    set newReminder to make new reminder at targetList with properties {name:"{TITLE}", due date:dueDate, body:"{BODY}"}
    return "Created: " & name of newReminder & " due " & (due date of newReminder as string)
end tell
APPLESCRIPT
```

Escape double quotes inside `{TITLE}` and `{BODY}` as `\"`. Keep newlines literal inside the heredoc.

## Step 5: Handle recurrence

AppleScript cannot reliably set recurrence on Reminders (the `recurrence` property is effectively read-only or undocumented). Two workarounds:
1. **Tell the user to right-click the reminder** in the Reminders app and set Repeat manually. This is a one-time, one-click action.
2. **Create multiple one-off reminders** (e.g., 4 weekly occurrences) if the user wants hands-off recurrence without touching the UI.

Default to option 1 unless the user requests option 2.

## Step 6: Confirm and report

After osascript returns, confirm to the user:
- Reminder title and due timestamp
- Whether they need to set recurrence manually (option 1)
- The command the reminder will prompt them to run

## Notes

- First-time osascript call against Reminders triggers a macOS automation permission prompt. The user may need to approve once in System Settings → Privacy & Security → Automation.
- All Mac reminders are local to the user's Mac. They will not fire if the Mac is off or not logged in. For truly-cloud reminders, Apple syncs them across iCloud devices (iPhone, iPad) if iCloud Reminders is enabled.
- For scheduled work that does NOT require local tools, prefer `/schedule` (remote cron-triggered Claude sessions). Use `/remind` specifically when the scheduled task needs local stride-cli, local files, or human review.
