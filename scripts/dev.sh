#!/bin/sh
# Start the Vite dev server.
#
# Why this wrapper exists: this machine has no system Node install, so a
# launcher configured to spawn `npm` fails with "No such file or directory"
# before Vite is ever reached. `/bin/sh` always exists, so the launcher spawns
# this script instead and we resolve an interpreter ourselves.
#
# Resolution order: a real `node` on PATH → $DOCTOL_NODE → common install
# locations → a portable build in the session scratchpad. Once Node is
# installed system-wide the first branch wins and the fallbacks are dead code.

set -eu
cd "$(dirname "$0")/.."

find_node() {
  if command -v node >/dev/null 2>&1; then
    command -v node
    return 0
  fi
  for candidate in \
    "${DOCTOL_NODE:-}" \
    /usr/local/bin/node \
    /opt/homebrew/bin/node \
    "$HOME/.local/bin/node" \
    /private/tmp/claude-501/*/*/scratchpad/nodejs/bin/node; do
    if [ -n "$candidate" ] && [ -x "$candidate" ]; then
      printf '%s' "$candidate"
      return 0
    fi
  done
  return 1
}

if ! NODE_BIN="$(find_node)"; then
  echo "خطأ: لم يُعثر على Node.js." >&2
  echo "ثبّت Node 20.19+ أو 22.12+ من https://nodejs.org" >&2
  echo "أو حدّد المسار يدوياً: DOCTOL_NODE=/path/to/node" >&2
  exit 127
fi

if [ ! -d node_modules/vite ]; then
  echo "خطأ: التبعيات غير مثبّتة. شغّل: npm install" >&2
  exit 1
fi

echo "▶ Vite via $NODE_BIN"
exec "$NODE_BIN" node_modules/vite/bin/vite.js "$@"
