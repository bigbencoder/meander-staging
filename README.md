# Meander Brewing — Staging Site

Public **staging** deploy of the Meander Brewing site, separate from production so
changes can be previewed on a real domain before going live.

- **Production:** `meander-brewing` repo -> GitHub Pages (`meander.benannaink.com`,
  and the brewery's real GoDaddy domains later).
- **Staging (this repo):** GitHub Pages, bound to a GoDaddy staging domain.
- **Deploy:** push to this repo -> GitHub Pages republishes staging.
- **Promote to production:** run `./promote.sh` (clones prod, syncs this content in,
  preserving prod's CNAME, commits + pushes). Or fast-forward equivalent by hand.

## Feature flags (`flags.js`)

Flags are **hostname-driven** so the SAME code is correct on both environments and
`promote.sh` stays a clean copy (no per-env file to diverge or clobber).

- `PROD_HOSTS` = allowlist of real production domains. Anything else (this staging
  domain, `*.github.io`, localhost) is treated as **staging**.
- `window.MEANDER_ENV` = `'prod'` | `'staging'`; `window.MEANDER_FLAGS` = the flags.

Current flags:
| Flag | Effect |
|------|--------|
| `eventsComingSoon` | Events page shows a "Coming Soon" placeholder everywhere **except** production. |

To add a flag: add it to `flags.js`, then gate behavior on `window.MEANDER_FLAGS.<name>`.
When the brewery's real production domain goes live, add it to `PROD_HOSTS`.
