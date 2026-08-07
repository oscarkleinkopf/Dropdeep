#!/usr/bin/env bash
# T53 — deploy Edge Function discover-enrich (OG/meta AliExpress, sin Affiliate).
#
# Prerequisites:
#   export SUPABASE_ACCESS_TOKEN=sbp_...   # https://supabase.com/dashboard/account/tokens
# Optional:
#   export SUPABASE_PROJECT_REF=texzlizelxavrybkdjdj
#
# Usage (from repo root):
#   bash scripts/deploy-discover-enrich.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PROJECT_REF="${SUPABASE_PROJECT_REF:-texzlizelxavrybkdjdj}"
API="https://api.supabase.com/v1/projects/${PROJECT_REF}"
FN_DIR="$ROOT/supabase/functions/discover-enrich"

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

echo "==> 2/2 Desplegando Edge Function discover-enrich..."
npx supabase functions deploy discover-enrich \
  --project-ref "$PROJECT_REF" \
  --no-verify-jwt=false

echo
echo "✅ discover-enrich desplegado en ${PROJECT_REF}"
echo "   Smoke: login en Pages → Descubrir → pegar URL AliExpress → campos sugeridos (No verificado)."
echo "   Sin sesión / sin función: el pegado manual sigue funcionando."
