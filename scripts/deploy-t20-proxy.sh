#!/usr/bin/env bash
# Ops T20 — apply migration 005 + redeploy gemini-proxy on production Supabase.
#
# Prerequisites:
#   export SUPABASE_ACCESS_TOKEN=sbp_...   # https://supabase.com/dashboard/account/tokens
# Optional:
#   export SUPABASE_PROJECT_REF=texzlizelxavrybkdjdj
#   export SUPABASE_DB_PASSWORD=...        # only needed if Management SQL API fails
#
# Usage (from repo root):
#   bash scripts/deploy-t20-proxy.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PROJECT_REF="${SUPABASE_PROJECT_REF:-texzlizelxavrybkdjdj}"
MIGRATION="$ROOT/supabase/migrations/005_proxy_abuse.sql"
API="https://api.supabase.com/v1/projects/${PROJECT_REF}"

if [[ -z "${SUPABASE_ACCESS_TOKEN:-}" ]]; then
  echo "ERROR: define SUPABASE_ACCESS_TOKEN (Account → Access Tokens en Supabase)." >&2
  echo "  export SUPABASE_ACCESS_TOKEN=sbp_..." >&2
  exit 1
fi

if [[ ! -f "$MIGRATION" ]]; then
  echo "ERROR: no existe $MIGRATION" >&2
  exit 1
fi

echo "==> Proyecto: $PROJECT_REF"
echo "==> 1/3 Verificando acceso Management API..."
HTTP=$(curl -sS -o /tmp/sb-proj.json -w "%{http_code}" \
  -H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" \
  "${API}")
if [[ "$HTTP" != "200" ]]; then
  echo "ERROR: no se pudo leer el proyecto (HTTP $HTTP). Token o ref incorrectos." >&2
  cat /tmp/sb-proj.json >&2 || true
  exit 1
fi
echo "    OK: $(python3 -c 'import json;print(json.load(open("/tmp/sb-proj.json")).get("name","?"))' 2>/dev/null || echo linked)"

echo "==> 2/3 Aplicando migración 005 (SQL)..."
# Management API: run SQL as postgres (service)
SQL=$(python3 - <<'PY'
from pathlib import Path
import json
sql = Path("supabase/migrations/005_proxy_abuse.sql").read_text()
print(json.dumps({"query": sql}))
PY
)
HTTP=$(curl -sS -o /tmp/sb-sql.json -w "%{http_code}" \
  -X POST "${API}/database/query" \
  -H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$SQL")

if [[ "$HTTP" != "200" && "$HTTP" != "201" ]]; then
  echo "    Management SQL API HTTP $HTTP — intentando supabase db push..."
  cat /tmp/sb-sql.json 2>/dev/null || true
  if [[ -n "${SUPABASE_DB_PASSWORD:-}" ]]; then
    npx supabase link --project-ref "$PROJECT_REF" --password "$SUPABASE_DB_PASSWORD" -y
    npx supabase db push --include-all -y
  else
    echo "ERROR: SQL API falló y no hay SUPABASE_DB_PASSWORD para db push." >&2
    echo "  Alternativa: pegar supabase/migrations/005_proxy_abuse.sql en SQL Editor del Dashboard." >&2
    exit 1
  fi
else
  echo "    OK: migración 005 aplicada vía API"
fi

echo "==> 3/3 Desplegando Edge Function gemini-proxy..."
npx supabase functions deploy gemini-proxy \
  --project-ref "$PROJECT_REF" \
  --no-verify-jwt=false

echo
echo "✅ T20 ops listo: 005 + gemini-proxy en ${PROJECT_REF}"
echo "   Smoke: login en Pages → Deep Research proxy → spamear no debe pasar 10 req/10s sin 429."
