#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:?usage: smoke-test.sh <base-url> [extra curl args...]}"
shift
CURL=(curl -fsS --max-time 10 "$@")
DNI="smoke-$(date +%s)-${RANDOM}"

for attempt in $(seq 1 30); do
    if "${CURL[@]}" -o /dev/null "${BASE_URL}/ready" 2>/dev/null; then
        break
    fi
    if [ "${attempt}" -eq 30 ]; then
        echo "API did not become ready at ${BASE_URL}" >&2
        exit 1
    fi
    sleep 2
done

echo "GET  /health -> $("${CURL[@]}" "${BASE_URL}/health")"
echo "GET  /ready  -> $("${CURL[@]}" "${BASE_URL}/ready")"

created=$("${CURL[@]}" -H 'Content-Type: application/json' \
    -d "{\"dni\":\"${DNI}\",\"name\":\"Smoke Test\"}" "${BASE_URL}/api/users")
echo "POST /api/users -> ${created}"
id=$(echo "${created}" | sed -E 's/.*"id":([0-9]+).*/\1/')

user=$("${CURL[@]}" "${BASE_URL}/api/users/${id}")
echo "GET  /api/users/${id} -> ${user}"
echo "${user}" | grep -q "${DNI}"

"${CURL[@]}" "${BASE_URL}/api/users" | grep -q "${DNI}"
echo "GET  /api/users -> contains ${DNI}"

status=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$@" "${BASE_URL}/api/users/999999999")
echo "GET  /api/users/999999999 -> ${status}"
[ "${status}" = "404" ]

echo "Smoke test passed"
