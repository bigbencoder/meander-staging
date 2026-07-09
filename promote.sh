#!/usr/bin/env bash
# Promote the STAGING site -> PRODUCTION (meander-brewing / GitHub Pages).
#
# Copies staging content into a fresh clone of the prod repo, PRESERVING prod's
# own CNAME (its custom domain) and .git, then commits + pushes. GitHub Pages
# republishes production automatically. Run this only when staging looks right.
#
# Safe by design: prod's CNAME is never overwritten, so the production domain
# can't break; flags.js is hostname-driven, so the same code shows live events
# on prod and "Coming Soon" on staging with no manual edits.
set -euo pipefail
STAGING_DIR="$(cd "$(dirname "$0")" && pwd)"
PROD_REPO="git@github.com:bigbencoder/meander-brewing.git"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT

echo "==> Cloning production repo..."
git clone --depth 1 "$PROD_REPO" "$TMP/prod" 2>&1 | tail -1

echo "==> Syncing staging -> prod (keeping prod CNAME; excluding staging-only files)..."
rsync -a --delete \
  --exclude='.git' \
  --exclude='CNAME' \
  --exclude='promote.sh' \
  --exclude='README.md' \
  "$STAGING_DIR"/ "$TMP/prod"/

cd "$TMP/prod"
if git diff --quiet && git diff --cached --quiet && [ -z "$(git status --porcelain)" ]; then
  echo "Nothing to promote — production already matches staging."
  exit 0
fi
git add -A
echo "==> Changes to promote:"; git status --short
git commit -m "promote: sync from staging $(date -u +%Y-%m-%dT%H:%MZ)"
git push origin HEAD
echo "==> Promoted. GitHub Pages will republish production shortly."
