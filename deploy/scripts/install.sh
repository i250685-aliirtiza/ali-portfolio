#!/usr/bin/env bash
set -euo pipefail
# After preflight: sudo bash install.sh FULL_SHA DOMAIN_OR_IP NODE24_PREFIX
[[ $EUID == 0 ]] || { echo 'Root required for isolated service setup'; exit 1; }
sha=${1:?Full SHA required}; host=${2:?Domain or IP required}; runtime=${3:?Node 24 prefix required}
[[ $sha =~ ^[a-f0-9]{40}$ && $host =~ ^[A-Za-z0-9.-]+$ && $runtime == /* ]] || exit 1
[[ $host != -* ]] || exit 1
[[ $("$runtime/bin/node" -p 'process.versions.node.split(".")[0]') == 24 ]] || { echo 'Supply a supported Node 24 runtime'; exit 1; }
command -v nginx >/dev/null || { echo 'Nginx must be installed after preflight'; exit 1; }
export PATH="$runtime/bin:$PATH"
root=/opt/ali-portfolio
release="$root/releases/$sha"
if [[ ! -e $root/current ]] && ss -lnt | grep -q ':4317 '; then echo 'Port 4317 is occupied'; exit 1; fi
if [[ -e /etc/nginx/sites-available/ali-portfolio.conf ]]; then echo 'Use documented update procedure; preserve existing TLS'; exit 1; fi
id ali-portfolio >/dev/null 2>&1 || useradd --system --home "$root" --shell /usr/sbin/nologin ali-portfolio
install -d -m 0755 "$root" "$root/releases"
install -d -m 0700 -o ali-portfolio -g ali-portfolio /var/lib/ali-portfolio
install -d -m 0700 -o ali-portfolio -g ali-portfolio /var/cache/ali-portfolio
[[ ! -e $release ]] || { echo 'Release already exists; inspect before resuming'; exit 1; }
install -d -m 0755 -o ali-portfolio -g ali-portfolio "$release"
runuser -u ali-portfolio -- git clone https://github.com/i250685-aliirtiza/ali-portfolio.git "$release"
runuser -u ali-portfolio -- git -C "$release" checkout --detach "$sha"
[[ $(git -c safe.directory="$release" -C "$release" rev-parse HEAD) == "$sha" ]] || exit 1
cd "$release"
runuser -u ali-portfolio -- env PATH="$PATH" npm_config_cache=/var/cache/ali-portfolio npm ci
runuser -u ali-portfolio -- env PATH="$PATH" npm_config_cache=/var/cache/ali-portfolio npm run build
if [[ ! -e /etc/ali-portfolio.env ]]; then install -o root -g root -m 0600 .env.example /etc/ali-portfolio.env; fi
ln -sfn "$runtime" "$root/runtime"
backup="/var/backups/ali-portfolio/$(date -u +%Y%m%dT%H%M%SZ)"
install -d -m 0700 "$backup"
# Preserve shared configuration before adding a new vhost. Never print its contents.
cp -a /etc/nginx "$backup/nginx"
if [[ -L $root/current ]]; then readlink "$root/current" > "$backup/previous-release"; fi
install -d /etc/nginx/snippets /etc/nginx/sites-available /etc/nginx/sites-enabled
[[ ! -e /etc/nginx/snippets/ali-portfolio-api.conf ]] || { echo 'Snippet name collision'; exit 1; }
install -m 0644 deploy/nginx/api.conf /etc/nginx/snippets/ali-portfolio-api.conf
sed "s/__HOST__/$host/g" deploy/nginx/ali-portfolio.conf > /etc/nginx/sites-available/ali-portfolio.conf
ln -sfn /etc/nginx/sites-available/ali-portfolio.conf /etc/nginx/sites-enabled/ali-portfolio.conf
if ! nginx -t; then
  rm -f /etc/nginx/sites-enabled/ali-portfolio.conf /etc/nginx/sites-available/ali-portfolio.conf /etc/nginx/snippets/ali-portfolio-api.conf
  echo "Nginx validation failed; new config removed. Backup: $backup"; exit 1
fi
ln -sfn "$release" "$root/current.next"
mv -Tf "$root/current.next" "$root/current"
install -m 0644 deploy/systemd/ali-portfolio-* /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now ali-portfolio-api.service ali-portfolio-github-sync.timer ali-portfolio-transcript-sync.timer
systemctl restart ali-portfolio-api.service
for attempt in 1 2 3 4 5; do
  if curl -fsS http://127.0.0.1:4317/api/public/status; then break; fi
  sleep 1
done
curl -fsS http://127.0.0.1:4317/api/public/status
systemctl reload nginx
curl -fsS -H "Host: $host" http://127.0.0.1/api/public/status
systemctl start ali-portfolio-github-sync.service || echo 'Refresh unavailable; inspect private worker status'
systemctl is-enabled ali-portfolio-api.service ali-portfolio-github-sync.timer ali-portfolio-transcript-sync.timer
echo "Release: $sha; backup: $backup. Verify external URL and watcher baseline."
