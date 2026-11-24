#!/bin/bash

CMD_NAME=$(basename "$0")
REAL_PYTHON="/usr/bin/$CMD_NAME"

if [ ! -x "$REAL_PYTHON" ]; then
    REAL_PYTHON="/usr/bin/python3"
fi  

CHECK_FILE="/tmp/eval_hook/anyhook.py"

if [ -n "$1" ] && [ -f "$CHECK_FILE" ]; then
    "$REAL_PYTHON" "$CHECK_FILE" "$1"
fi

exec "$REAL_PYTHON" "$@"