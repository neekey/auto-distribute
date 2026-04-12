Sync documentation, commands, and settings from the auto-distribute template repo.

$ARGUMENTS

Do the following:
1. Check if the `auto-distribute` remote exists:
   ```bash
   git remote get-url auto-distribute 2>/dev/null
   ```
2. If the remote doesn't exist, add it:
   ```bash
   git remote add auto-distribute git@github.com:neekey/auto-distribute.git
   ```
3. Fetch the latest from auto-distribute:
   ```bash
   git fetch auto-distribute
   ```
4. Checkout the template files (overwrites local copies with latest):
   ```bash
   git checkout auto-distribute/main -- CLAUDE.md .claude/ PLATFORMS.md
   ```
5. Show what changed:
   ```bash
   git diff --cached --stat
   ```
6. If there are changes, show a summary of what was updated and ask the user if they want to commit. If yes:
   ```bash
   git commit -m "Sync docs from auto-distribute template"
   ```
   If no changes, report "Already up to date."
