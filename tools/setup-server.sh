#!/usr/bin/env bash
#
# One-time setup on the server so the shared nginx proxy container serves the
# company site at https://it-tudes.tech/. deploy.sh uploads this script, the site's
# nginx block and setup.env (a copy of tools/deploy.local.env) to $REMOTE_SETUP.
#
#     ssh <host> 'bash <REMOTE_SETUP>/setup-server.sh install'
#     ssh <host> 'bash <REMOTE_SETUP>/setup-server.sh rollback'
#
# install:
#   1. backs up the proxy's docker-compose.yml and nginx config to $BACKUPS/<stamp>/
#   2. mounts $REMOTE_BASE into the proxy at /srv/it-tudes (compose file)
#   3. replaces the proxy's "location = / { return 30x ...; }" redirect with the site block
#   4. checks the new config with `nginx -t` inside the running proxy
#   5. recreates only the proxy container (a few seconds of downtime for every app)
#   6. checks the site and the other apps; if anything fails it rolls back by itself
#
# Needs no sudo. Run `deploy.sh` first, so there is a site to serve.

set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[ -f "$HERE/setup.env" ] || { echo "missing $HERE/setup.env: run deploy.sh first" >&2; exit 1; }
# shellcheck source=/dev/null
. "$HERE/setup.env"

COMPOSE=$DOCKER_DIR/docker-compose.yml
CONF=$DOCKER_DIR/$NGINX_CONF
SITE_DIR=$REMOTE_BASE
BLOCK="$HERE/it-tudes-site.nginx.conf"

say()  { printf '
[1m==> %s[0m
' "$*"; }
fail() { printf '
[31mFAILED: %s[0m
' "$*" >&2; exit 1; }

[ "$(hostname)" = "$EXPECTED_HOST" ] || fail "this is $(hostname), not $EXPECTED_HOST"

recreate_gateway() {
  (cd "$DOCKER_DIR" && docker compose up -d --no-deps --force-recreate nginx)
  for _ in $(seq 1 20); do
    docker exec "$CONTAINER" true 2>/dev/null && break
    sleep 1
  done
}

code() { # code <scheme> <path>
  local port=443; [ "$1" = http ] && port=80
  curl -sk -o /dev/null -w '%{http_code}' --max-time 15 --resolve "it-tudes.tech:$port:127.0.0.1" "$1://it-tudes.tech$2" || echo "---"
}

check_all() {
  local ok=0 c
  printf '  %-28s %s\n' "path" "status (expected)"
  while read -r scheme path want; do
    [ -n "${path:-}" ] || continue
    c=$(code "$scheme" "$path")
    printf '  %-28s %s (%s)\n' "$scheme $path" "$c" "$want"
    [[ "$c" =~ ^($want)$ ]] || ok=1
  done <<LIST
https / 200
https /projects/ninvoices/ 200
https /es/ 200
https /it/projects/ninvoices/ 200
https /does-not-exist/ 404
${OTHER_CHECKS:-}
LIST
  curl -sk --max-time 15 --resolve it-tudes.tech:443:127.0.0.1 https://it-tudes.tech/ | grep -q 'data-site="it-tudes"' || { echo "  / is not the company site"; ok=1; }
  return $ok
}

do_rollback() {
  local from="${1:-$(ls -1d "$BACKUPS"/*/ 2>/dev/null | sort | tail -1)}"
  [ -n "$from" ] && [ -f "$from/docker-compose.yml" ] || fail "no backup found in $BACKUPS"
  say "Restoring from $from"
  cp "$from/docker-compose.yml" "$COMPOSE"
  cp "$from/$NGINX_CONF" "$CONF"
  recreate_gateway
  say "Rolled back. Status now:"
  check_all || true
}

do_install() {
  [ -f "$BLOCK" ] || fail "missing $BLOCK (run deploy.sh, it uploads it)"
  [ -f "$SITE_DIR/current/index.html" ] || fail "no site in $SITE_DIR/current yet: run deploy.sh first"
  grep -q 'it-tudes-site' "$CONF" && grep -q '/srv/it-tudes' "$COMPOSE" && { echo "Already installed."; exit 0; }

  say "Backing up"
  local stamp; stamp=$(date +%Y%m%d-%H%M%S)
  local bk="$BACKUPS/$stamp"
  mkdir -p "$bk"
  cp -p "$COMPOSE" "$CONF" "$bk/"
  echo "  $bk"

  say "Preparing the new nginx config"
  local newconf; newconf=$(mktemp)
  python3 - "$CONF" "$BLOCK" "$newconf" <<'PY'
import re, sys
conf, block, out = sys.argv[1], sys.argv[2], sys.argv[3]
text = open(conf).read()
pattern = re.compile(r'\n(?:[ \t]*#[^\n]*\n)?[ \t]*location = / \{\n[ \t]*return 30[1278] [^;\n]+;\n[ \t]*\}\n')
found = pattern.findall(text)
if len(found) != 1:
    sys.exit(f"expected one 'location = / {{ return 30x ...; }}' redirect, found {len(found)}: edit the nginx config by hand")
open(out, "w").write(pattern.sub("\n" + open(block).read(), text, count=1))
PY
  docker cp "$newconf" "$CONTAINER:/tmp/nginx.it-tudes.conf"
  docker exec "$CONTAINER" nginx -t -c /tmp/nginx.it-tudes.conf || fail "new config does not pass nginx -t; nothing changed"
  echo "  nginx -t ok"

  say "Adding the site mount to docker-compose.yml"
  local newcompose; newcompose=$(mktemp)
  sed "s#^\([[:space:]]*\)- /var/www/certbot:/var/www/certbot:ro[[:space:]]*\$#&\n\1- $SITE_DIR:/srv/it-tudes:ro#" "$COMPOSE" > "$newcompose"
  [ "$(grep -c '/srv/it-tudes' "$newcompose")" -eq 1 ] || fail "could not place the volume line; nothing changed"
  docker compose --project-directory "$DOCKER_DIR" -f "$newcompose" config -q || fail "compose file does not validate; nothing changed"

  # cp (not mv) keeps the files' inodes, which matters for single-file bind mounts
  cp "$newconf" "$CONF"
  cp "$newcompose" "$COMPOSE"
  rm -f "$newconf" "$newcompose"

  say "Recreating $CONTAINER"
  recreate_gateway

  say "Checking"
  sleep 2
  if check_all; then
    say "Done: https://it-tudes.tech/ is the company site"
    echo "Backup of the previous files: $bk"
  else
    printf '\n\033[31mA check failed, rolling back.\033[0m\n'
    do_rollback "$bk"
    exit 1
  fi
}

case "${1:-}" in
  install)  do_install ;;
  rollback) do_rollback "${2:-}" ;;
  check)    check_all ;;
  *) echo "usage: $0 install | rollback [backup-dir] | check" >&2; exit 2 ;;
esac
