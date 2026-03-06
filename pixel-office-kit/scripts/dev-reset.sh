#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${PORT:-3000}"
HEALTH_URL="http://127.0.0.1:${PORT}/"
LOG_FILE="${PROJECT_ROOT}/.next/dev-reset.log"
PID_FILE="${PROJECT_ROOT}/.next/dev-server.pid"

mkdir -p "${PROJECT_ROOT}/.next"

echo "[dev-reset] project: ${PROJECT_ROOT}"
echo "[dev-reset] target port: ${PORT}"

kill_project_processes() {
  local pids=()

  # Find node/next processes whose CWD is this project.
  while IFS= read -r pid; do
    [[ -z "${pid}" ]] && continue
    local cwd
    cwd="$(lsof -a -p "${pid}" -d cwd -Fn 2>/dev/null | sed -n 's/^n//p' | head -n1 || true)"
    if [[ "${cwd}" == "${PROJECT_ROOT}" ]]; then
      pids+=("${pid}")
    fi
  done < <(pgrep -f "node|next" || true)

  if [[ ${#pids[@]} -gt 0 ]]; then
    echo "[dev-reset] killing project processes: ${pids[*]}"
    kill "${pids[@]}" 2>/dev/null || true
    sleep 1
    kill -9 "${pids[@]}" 2>/dev/null || true
  else
    echo "[dev-reset] no project-scoped node/next processes found"
  fi

  # Extra safety: if anything still listens on target port from this project, kill it.
  while IFS= read -r pid; do
    [[ -z "${pid}" ]] && continue
    local cmd
    cmd="$(ps -p "${pid}" -o command= 2>/dev/null || true)"
    if [[ "${cmd}" == *"${PROJECT_ROOT}"* ]] || [[ "${cmd}" == *"next"* ]]; then
      echo "[dev-reset] force killing lingering port ${PORT} pid ${pid}"
      kill -9 "${pid}" 2>/dev/null || true
    fi
  done < <(lsof -tiTCP:"${PORT}" -sTCP:LISTEN 2>/dev/null || true)
}

start_dev_server() {
  echo "[dev-reset] clearing .next"
  rm -rf "${PROJECT_ROOT}/.next"
  mkdir -p "${PROJECT_ROOT}/.next"

  echo "[dev-reset] starting npm run dev on port ${PORT}"
  (
    cd "${PROJECT_ROOT}"
    nohup npm run dev -- --port "${PORT}" >"${LOG_FILE}" 2>&1 &
    echo $! >"${PID_FILE}"
  )

  echo "[dev-reset] started PID $(cat "${PID_FILE}")"
  echo "[dev-reset] log: ${LOG_FILE}"
}

wait_for_health() {
  echo "[dev-reset] waiting for health: ${HEALTH_URL}"
  local attempts=30
  local sleep_secs=1

  for ((i=1; i<=attempts; i++)); do
    if curl -fsS --max-time 3 "${HEALTH_URL}" >/dev/null; then
      echo "[dev-reset] health check passed"
      return 0
    fi
    sleep "${sleep_secs}"
  done

  echo "[dev-reset] health check FAILED for ${HEALTH_URL}" >&2
  echo "[dev-reset] last 60 log lines:" >&2
  tail -n 60 "${LOG_FILE}" >&2 || true
  return 1
}

kill_project_processes
start_dev_server
wait_for_health

echo "[dev-reset] done"
