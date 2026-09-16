#!/usr/bin/env sh
set -eu
npm run build
node preview-server.mjs
