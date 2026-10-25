#!/usr/bin/env bash
set -eu
# Read-only. Do not print environment, secrets, or private logs.
id
cat /etc/os-release
uname -m
free -m
df -h / /var
uptime
command -v node >/dev/null && node --version
command -v npm >/dev/null && npm --version
ss -lnt
systemctl list-units --all --no-pager --type=service --type=timer | grep -Ei 'flex|cp-watcher|portfolio|nginx' || true
systemctl list-unit-files --no-pager | grep -Ei 'flex|cp-watcher|portfolio|nginx' || true
if command -v nginx >/dev/null; then sudo nginx -t; fi
if command -v ufw >/dev/null; then sudo ufw status; fi
