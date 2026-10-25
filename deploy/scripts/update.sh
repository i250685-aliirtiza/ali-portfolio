#!/usr/bin/env bash
set -euo pipefail
# sudo bash update.sh FULL_PUSHED_SHA
[[ $EUID == 0 ]] || exit 1
sha=${1:?Full commit SHA required}
[[ $sha =~ ^[a-f0-9]{40}$ ]] || exit 1
root=/opt/ali-portfolio
old=$(readlink -f "$root/current")
[[ $old == "$root/releases/"* ]] || exit 1
release="$root/releases/$sha"
[[ ! -e $release ]] || { echo 'Release exists; inspect before resuming'; exit 1; }
export PATH="$root/runtime/bin:$PATH"
install -d -m 0700 -o ali-portfolio -g ali-portfolio /var/cache/ali-portfolio
install -d -m 0755 -o ali-portfolio -g ali-portfolio "$release"
runuser -u ali-portfolio -- git clone https://github.com/i250685-aliirtiza/ali-portfolio.git "$release"
runuser -u ali-portfolio -- git -C "$release" checkout --detach "$sha"
[[ $(git -c safe.directory="$release" -C "$release" rev-parse HEAD) == "$sha" ]] || exit 1
cd "$release"
runuser -u ali-portfolio -- env PATH="$PATH" NODE_OPTIONS=--max-old-space-size=192 npm_config_cache=/var/cache/ali-portfolio npm ci
runuser -u ali-portfolio -- env PATH="$PATH" NODE_OPTIONS=--max-old-space-size=192 npm_config_cache=/var/cache/ali-portfolio npm run build
stamp=$(date -u +%Y%m%dT%H%M%SZ)
install -d -m 0700 "/var/backups/ali-portfolio/$stamp"
printf '%s\n' "$old" > "/var/backups/ali-portfolio/$stamp/previous-release"
ln -sfn "$release" "$root/current.next"
mv -Tf "$root/current.next" "$root/current"
systemctl restart ali-portfolio-api.service
healthy=false
for attempt in 1 2 3 4 5 6 7 8 9 10; do
  if curl -fsS http://127.0.0.1:4317/api/public/status; then healthy=true; break; fi
  sleep 1
done
if [[ $healthy != true ]]; then
  ln -sfn "$old" "$root/current.next"
  mv -Tf "$root/current.next" "$root/current"
  systemctl restart ali-portfolio-api.service
  echo 'New API health failed; previous release restored'; exit 1
fi
echo "Updated release $sha. Existing Nginx, env, state, timers and watcher units untouched."
