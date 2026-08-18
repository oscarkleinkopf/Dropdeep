#!/usr/bin/env bash
# T45 — deploy Edge Function discover-proxy (AliExpress Affiliate).
#
# Prerequisites:
#   export SUPABASE_ACCESS_TOKEN=sbp_...   # https://supabase.com/dashboard/account/tokens
# Secrets must already be set in the project (never pass them as CLI args to this script):
#   ALIEXPRESS_APP_KEY, ALIEXPRESS_APP_SECRET, optional ALIEXPRESS_TRACKING_ID
# SQL: apply supabase/migrations/008_discover_usage.sql in the SQL Editor.
#
# Usage (from repo root):
#   bash scripts/deploy-discover-proxy.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PROJECT_REF="${SUPABASE_PROJECT_REF:-texzlizelxavrybkdjdj}"
API="https://api.supabase.com/v1/projects/${PROJECT_REF}"
FN_DIR="$ROOT/supabase/functions/discover-proxy"

if [[ -z "${SUPABASE_ACCESS_TOKEN:-}" ]]; then
  echo "ERROR: define SUPABASE_ACCESS_TOKEN (Account → Access Tokens en Supabase)." >&2
  echo "  export SUPABASE_ACCESS_TOKEN=sbp_..." >&2
  exit 1
fi

if [[ ! -f "$FN_DIR/index.ts" ]]; then
  echo "ERROR: no existe $FN_DIR/index.ts" >&2
  exit 1
fi

echo "==> Proyecto: $PROJECT_REF"
echo "==> 1/2 Verificando acceso Management API..."
HTTP=$(curl -sS -o /tmp/sb-proj.json -w "%{http_code}" \
  -H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" \
  "${API}")
if [[ "$HTTP" != "200" ]]; then
  echo "ERROR: no se pudo leer el proyecto (HTTP $HTTP). Token o ref incorrectos." >&2
  cat /tmp/sb-proj.json >&2 || true
  exit 1
fi
echo "    OK: $(python3 -c 'import json;print(json.load(open("/tmp/sb-proj.json")).get("name","?"))' 2>/dev/null || echo linked)"

echo "==> 2/2 Desplegando Edge Function discover-proxy..."
npx supabase functions deploy discover-proxy \
  --project-ref "$PROJECT_REF" \
  --no-verify-jwt=false

echo
echo "✅ discover-proxy desplegado en ${PROJECT_REF}"
echo "   Recuerda: App Key/Secret van en supabase secrets (no en este script)."
echo "   Smoke: login → Descubrir → Armar búsquedas → Buscar catálogo (sesión)."
echo "   Sin secretos: 501 honesto; el pegado T67 sigue igual."
