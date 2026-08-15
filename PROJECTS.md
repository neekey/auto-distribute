# Projects

Products currently being distributed via this toolkit. Use with `--project <path>` on any command.

| Project | Path | URL | Status | Notes |
|---------|------|-----|--------|-------|
| Numblr | `~/workspaces/numblr` | numblr.io | Active | Number-to-words. Blog migration done; SEO push ongoing (re-analyze ~3wk). |
| Zahlhaus | `~/workspaces/zahlhaus` | zahlhaus.com | Active | German number-listening trainer. Blog launched Apr 2026 (8 posts, pillar targets "german numbers 1-100"); re-analyze ~3wk. Different product from Numblr. |
| english-number.com | `~/workspaces/english-name-app` | english-number.com | Active | Invest-not-sunset; 5 guides shipped (re-analyze ~6wk). |
| Clickmap | `~/workspaces/clickmap-app` | clickmap.app | Active | Click-analytics visualized on top of the live site — real-time click data overlay. |
| Strideday | `~/workspaces/stride` | strideday.com | Active | Stride CLI / social automation (powers `/social` in this repo). GSC wired 2026-08-15 (`sc-domain:strideday.com`, pass `--sa marketing/google-service-account.json`); 3/51 URLs indexed — internal linking is the blocker. GA4 pending SA grant. |

## Conventions

- Per-project state lives at `{path}/state/` and `{path}/PRODUCT.md`.
- Shared templates (commands, `PLATFORMS.md`, `AGENT-READINESS.md`) stay in this repo.
- Deep per-project memory (strategy, analytics reference, incidents) lives in auto-memory under `~/.claude/projects/-Users-neekey-workspaces-auto-distribute/memory/`. This file is the roster; memory is the history.
