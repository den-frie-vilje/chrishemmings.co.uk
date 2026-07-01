#!/usr/bin/env bash
# Refresh the committed AI photo masters from a machine without a tfjs-node
# prebuild (e.g. macOS). Runs scripts/gen-photos.ts inside a linux/amd64
# container — the same arch/behaviour as CI — so `static/img/photos/_gen`
# and `src/lib/photo-manifest.json` are (re)generated with real ESRGAN
# upscales, then committed. Ordinary CI deploys reuse these via the hash
# gate and do no image work.
#
# Usage: pnpm photos:ci   (needs Docker running)
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT="$(pwd)"

docker run --rm --platform linux/amd64 -v "$ROOT":/host node:24-bookworm-slim sh -lc '
  set -e
  mkdir -p /work/scripts /work/static/img/photos /work/src/lib
  cd /work
  npm init -y >/dev/null 2>&1 && npm pkg set type=module >/dev/null 2>&1
  echo "photos:ci — installing sharp + upscaler + tfjs-node (linux/amd64)…"
  npm i --no-audit --no-fund sharp upscaler @tensorflow/tfjs-node@4.22.0 seedrandom >/tmp/i.log 2>&1 \
    || { echo "install failed:"; tail -8 /tmp/i.log; exit 1; }
  cp /host/scripts/gen-photos.ts scripts/
  cp /host/static/img/photos/*.jpg /host/static/img/photos/*.png /host/static/img/photos/*.jpeg /host/static/img/photos/*.webp static/img/photos/ 2>/dev/null || true
  node scripts/gen-photos.ts
  rm -rf /host/static/img/photos/_gen
  cp -r static/img/photos/_gen /host/static/img/photos/_gen
  cp src/lib/photo-manifest.json /host/src/lib/photo-manifest.json
'
echo "photos:ci — done. Review + commit static/img/photos/_gen and src/lib/photo-manifest.json."
