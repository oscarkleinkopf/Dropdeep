#!/usr/bin/env bash
# T54 + T55 — apply migrations 006 (report_feedback) + 007 (analytics_events).
#
# Prerequisites:
#   export SUPABASE_ACCESS_TOKEN=sbp_...
# Optional:
#   export SUPABASE_PROJECT_REF=texzlizelxavrybkdjdj
#   export SUPABASE_DB_PASSWORD=...   # fallback if Management SQL API fails
#
# Usage:
#   bash scripts/deploy-t54-t55-migrations.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PROJECT_REF="${SUPABASE_PROJECT_REF:-texzlizelxavrybkdjdj}"
API="https://api.supabase.com/v1/projects/${PROJECT_REF}"

if [[ -z "${SUPABASE_ACCESS_TOKEN:-}" ]]; then
  echo "ERROR: define SUPABASE_ACCESS_TOKEN" >&2
  exit 1
fi

apply_sql() {
  local file="$1"
  local label="$2"
  echo "==> Aplicando $label ($file)..."
  if [[ ! -f "$file" ]]; then
    echo "ERROR: no existe $file" >&2
    exit 1
  fi
  local body
  body=$(python3 - <<PY
from pathlib import Path
import json
print(json.dumps({"query": Path("$file").read_text()}))
PY
)
  local http
  http=$(curl -sS -o /tmp/sb-sql-t54.json -w "%{http_code}" \
    -X POST "${API}/database/query" \
    -H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "$body")
  if [[ "$http" != "200" && "$http" != "201" ]]; then
    echo "    Management SQL API HTTP $http"
    cat /tmp/sb-sql-t54.json 2>/dev/null || true
    if [[ -n "${SUPABASE_DB_PASSWORD:-}" ]]; then
      npx supabase link --project-ref "$PROJECT_REF" --password "$SUPABASE_DB_PASSWORD" -y
      npx supabase db push --include-all -y
      return 0
    fi
    echo "ERROR: pega $file en SQL Editor del Dashboard." >&2
    exit 1
  fi
  echo "    OK"
}

echo "==> Proyecto: $PROJECT_REF"
HTTP=$(curl -sS -o /tmp/sb-proj.json -w "%{http_code}" \
  -H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" \
  "${API}")
if [[ "$HTTP" != "200" ]]; then
  echo "ERROR: acceso proyecto HTTP $HTTP" >&2
  exit 1
fi

apply_sql "$ROOT/supabase/migrations/006_report_feedback.sql" "006 report_feedback"
apply_sql "$ROOT/supabase/migrations/007_analytics_events.sql" "007 analytics_events"

echo
echo "✅ Migraciones T54/T55 aplicadas en ${PROJECT_REF}"
echo "   Consultas founder: docs/sql/founder-observability.sql"
