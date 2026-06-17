#!/usr/bin/env bash
# Start platform-frontend (port 3000)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PORT="${PORT:-3000}"

if [[ ! -f .env.local ]]; then
  if [[ -f .env.example ]]; then
    cp .env.example .env.local
    echo "Created .env.local from .env.example"
    echo "Set AUTH_SECRET: openssl rand -base64 32"
  else
    echo "Missing .env.local — copy .env.example and set AUTH_SECRET."
    exit 1
  fi
fi

if [[ ! -d node_modules ]]; then
  echo "Installing npm dependencies..."
  npm install
fi

echo "Starting platform-frontend on http://localhost:${PORT}"
exec npx next dev --port "$PORT"
