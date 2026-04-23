#!/usr/bin/env bash
set -euo pipefail

SOURCE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET_ROOT="/Users/yb/workspace/agent-guard-gate/custos_app"

if [[ ! -d "$TARGET_ROOT" ]]; then
  echo "Target not found: $TARGET_ROOT" >&2
  exit 1
fi

# Mirror production-hardening files into the monorepo copy.
FILES=(
  ".env.example"
  ".npmrc"
  ".github/workflows/ci.yml"
  "README.md"
  "eslint.config.mjs"
  "next.config.mjs"
  "package.json"
  "package-lock.json"
  "src/app/(dashboard)/templates/page.tsx"
  "src/app/(dashboard)/templates/invoice/page.tsx"
  "src/app/(dashboard)/templates/invoice/invoice-agent-client.tsx"
  "src/app/(dashboard)/wallets/[id]/page.tsx"
  "src/app/api/agents/[id]/api-key/route.ts"
  "src/app/api/invoice/upload/route.ts"
  "src/app/api/invoice/extract/route.ts"
  "src/components/agents/ApiKeyRevealCard.tsx"
  "src/lib/api/client.ts"
  "src/lib/auth.ts"
  "src/lib/features.ts"
  "src/lib/observability.ts"
  "src/lib/server-auth.ts"
  "src/middleware.ts"
  "tailwind.config.ts"
)

for file in "${FILES[@]}"; do
  source_path="$SOURCE_ROOT/$file"
  target_path="$TARGET_ROOT/$file"

  if [[ ! -f "$source_path" ]]; then
    echo "Skipping missing source file: $file" >&2
    continue
  fi

  mkdir -p "$(dirname "$target_path")"
  cp "$source_path" "$target_path"
  echo "Synced: $file"
done

echo "Mirror sync complete."
