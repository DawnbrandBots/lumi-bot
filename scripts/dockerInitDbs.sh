#!/bin/sh
set -eu

if [ -z "${LUMI_STATE_DB_DIR:-}" ] || [ -z "${LUMI_STATIC_DB_DIR:-}" ]; then
    echo "LUMI_STATE_DB_DIR and LUMI_STATIC_DB_DIR environment variables are required" >&2
    exit 1
fi

mkdir -p "$LUMI_STATE_DB_DIR" "$LUMI_STATIC_DB_DIR"
chown -R node:node "$LUMI_STATE_DB_DIR" "$LUMI_STATIC_DB_DIR"

runuser -u node -- sh -c 'yarn db:recreate && yarn db:migrate'
