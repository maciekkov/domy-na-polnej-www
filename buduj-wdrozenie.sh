#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
npm ci
npm test
npm run build
npm run test:dist
printf '\nGotowy build: %s/dist\nPrzed publikacja wykonaj testy E2E z README.\n' "$PWD"
