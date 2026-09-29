#!/usr/bin/env bash
#
# Upload the built site (dist/) to the server and make it live. Use deploy.ps1,
# which builds first, or run from WSL after `npm run build`:
#
#     wsl bash -c '/mnt/c/projects/sites/it-tudes.tech/tools/deploy.sh [--dry-run]'
#
# Server specifics come from tools/deploy.local.env (git-ignored; start from
# deploy.local.env.example).
#
# Each deploy lands in $REMOTE_BASE/releases/<timestamp> and goes live by swapping
# the "current" symlink, so visitors never see a half-uploaded site and a rollback
# is instant. No sudo, and the proxy container is never restarted.

set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT="$(dirname "$HERE")"
LOCAL_SITE="$PROJECT/dist"
ENV_FILE="$HERE/deploy.local.env"
SITE_URL=https://it-tudes.tech
KEEP_RELEASES=5

say()  { printf '\n\033[1m==> %s\033[0m\n' "$*"; }
fail() { printf '\n\033[31mFAILED: %s\033[0m\n' "$*" >&2; exit 1; }

[ -f "$ENV_FILE" ] || fail "missing $ENV_FILE: copy deploy.local.env.example and fill it in"
# shellcheck source=/dev/null
. "$ENV_FILE"
for v in SSH_HOST EXPECTED_HOST REMOTE_BASE REMOTE_SETUP CONTAINER; do
  [ -n "${!v:-}" ] || fail "$v is not set in deploy.local.env"
done

DRY_RUN=0
for a in "$@"; do
  case "$a" in
    --dry-run) DRY_RUN=1 ;;
    *) echo "unknown option: $a" >&2; exit 2 ;;
  esac
done

say "Preflight"
[ -f "$LOCAL_SITE/index.html" ] || fail "no dist/index.html: run 'npm run build' first"
[ -f "$LOCAL_SITE/404.html" ] || fail "no dist/404.html: incomplete build"
echo "  $(find "$LOCAL_SITE" -name '*.html' | wc -l) pages, $(find "$LOCAL_SITE" -type f | wc -l) files"

REMOTE_HOSTNAME=$(ssh -o ConnectTimeout=15 -o BatchMode=yes "$SSH_HOST" hostname 2>/dev/null) || fail "cannot reach $SSH_HOST"
[ "$REMOTE_HOSTNAME" = "$EXPECTED_HOST" ] || fail "$SSH_HOST is $REMOTE_HOSTNAME, expected $EXPECTED_HOST"
echo "  $SSH_HOST = $REMOTE_HOSTNAME"

ssh "$SSH_HOST" "mkdir -p '$REMOTE_SETUP' '$REMOTE_BASE/releases'"
rsync -a "$HERE/setup-server.sh" "$PROJECT/deploy/it-tudes-site.nginx.conf" "$SSH_HOST:$REMOTE_SETUP/"
rsync -a "$ENV_FILE" "$SSH_HOST:$REMOTE_SETUP/setup.env"
echo "  setup bundle synced to $REMOTE_SETUP"

RELEASE=$(date +%Y%m%d-%H%M%S)
say "Uploading release $RELEASE"
RSYNC_OPTS=(-az --delete --human-readable --stats)
[ "$DRY_RUN" -eq 1 ] && RSYNC_OPTS+=(--dry-run --itemize-changes)
LINK_DEST=()
ssh "$SSH_HOST" "[ -e '$REMOTE_BASE/current' ]" && LINK_DEST=(--link-dest="$REMOTE_BASE/current/")
rsync "${RSYNC_OPTS[@]}" "${LINK_DEST[@]}" "$LOCAL_SITE/" "$SSH_HOST:$REMOTE_BASE/releases/$RELEASE/" \
  | grep -E 'Number of regular files transferred|Total transferred|^[<>ch.]' | sed 's/^/  /' || true

if [ "$DRY_RUN" -eq 1 ]; then
  ssh "$SSH_HOST" "rm -rf '$REMOTE_BASE/releases/$RELEASE'"
  say "Dry run: nothing changed"
  exit 0
fi

say "Switching 'current' to $RELEASE"
ssh "$SSH_HOST" bash -s <<REMOTE
set -euo pipefail
cd '$REMOTE_BASE'
[ -f "releases/$RELEASE/index.html" ] || { echo "upload looks incomplete"; exit 1; }
echo "  previous: \$(basename "\$(readlink current 2>/dev/null || echo none)")"
# Relative link: the container sees this tree at /srv/it-tudes, not at $REMOTE_BASE.
ln -sfn 'releases/$RELEASE' current.tmp
mv -T current.tmp current
echo "  current:  $RELEASE"
cd releases
ls -1dt */ | tail -n +$((KEEP_RELEASES + 1)) | xargs -r rm -rf
echo "  releases kept: \$(ls -1d */ | wc -l)"
REMOTE

if ! ssh "$SSH_HOST" "docker inspect $CONTAINER --format '{{range .Mounts}}{{.Destination}} {{end}}'" | grep -q /srv/it-tudes; then
  cat <<MSG

  Uploaded, but the proxy does not serve the site yet. That is a one-time step,
  and it recreates the shared nginx container (a few seconds of downtime for
  every app behind it), so run it yourself when the timing suits:

      wsl bash -c 'ssh $SSH_HOST "bash $REMOTE_SETUP/setup-server.sh install"'

MSG
  exit 0
fi

say "Verifying $SITE_URL"
for path in / /es/ /it/ /projects/ninvoices/ /it/projects/ninvoices/ /robots.txt /sitemap-index.xml /favicon.svg; do
  printf '  %-34s %s\n' "$path" "$(curl -sS -o /dev/null -w '%{http_code}' --max-time 15 "$SITE_URL$path" || echo ---)"
done
curl -sS --max-time 15 "$SITE_URL/" | grep -q 'data-site="it-tudes"' && echo "  homepage is the new site" || fail "homepage does not look like the new site"

if [ -n "${OTHER_CHECKS:-}" ]; then
  say "Other apps behind the proxy"
  while read -r path want; do
    [ -n "$path" ] || continue
    printf '  %-34s %s (expect %s)\n' "$path" "$(curl -sS -o /dev/null -w '%{http_code}' --max-time 15 "$SITE_URL$path" || echo ---)" "$want"
  done <<< "$OTHER_CHECKS"
fi

say "Deployed $RELEASE"
echo "Rollback: wsl bash -c 'ssh $SSH_HOST \"cd $REMOTE_BASE && ln -sfn \\\$(ls -1dt releases/*/ | sed -n 2p | sed s#/\\\$##) current.tmp && mv -T current.tmp current\"'"
