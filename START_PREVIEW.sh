#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"
command -v node >/dev/null 2>&1 || { echo "Wymagany Node.js >=22.12"; exit 1; }
[ -f dist/index.html ] || node scripts/build-portable.cjs
exec node preview-server.mjs
