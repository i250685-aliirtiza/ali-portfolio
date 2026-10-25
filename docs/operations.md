# Oracle operations

## Before first deployment

Obtain the public host, SSH user, and an authorized local key **path** or agent (never private key text). Confirm an optional owned hostname; IP-only HTTP can be a partial launch. Start with `deploy/scripts/preflight.sh`. Inspect current user/OS/architecture, available memory/disk/CPU, Node paths, occupied 80/443/4317, Nginx vhosts, firewall and the actual watcher unit names. Record active/enabled state privately. Do not dump secrets or overwrite watcher files.

Use an existing compatible Node 24 prefix or install an app-specific official archive with a verified checksum. Do not replace the watchers’ Node installation or run global upgrades. If Nginx is absent, install only the required package after reviewing the host. Check the new hostname has no existing vhost collision. If port 4317 is occupied, choose another loopback port consistently in env, Nginx and health checks before installation.

The first-install script takes a full pushed SHA, host/IP and Node 24 installation prefix. It clones the **new** repository into an immutable release path, builds as the portfolio user, backs up Nginx privately, creates one vhost and dedicated units, tests configuration before reload and verifies local API health. It refuses existing portfolio configuration so a later invocation cannot erase TLS. It deliberately does not change cloud rules, firewall policies, global runtimes, watcher units or certificates.

Open only inbound 80/443 where needed in the existing Oracle NSG/security list and Ubuntu firewall. If OCI access is absent, ask for that exact narrow rule change. Never expose 4317. For a domain, verify DNS first and configure a trusted ACME certificate with renewal. Back up the vhost before TLS changes. Do not represent an IP-only HTTP launch as HTTPS.

## Verification

Check the public page and all CSS/JS/font requests from outside the VM. Confirm the public API freshness/timestamps, dotfile/env/db requests denied, POST rejected and no console errors. Restart only `ali-portfolio-api.service` and re-check. Verify all three new service/timer enablement states and timer schedules; do not reboot the VM. Compare existing watcher active/enabled states with the baseline. A one-shot CP worker may legitimately be inactive between timer runs; compare the timer and last result.

## Update an existing deployment

Use the exact newly pushed commit SHA. Create `/opt/ali-portfolio/releases/<sha>` as the portfolio user, clone the new repository, checkout that SHA detached, verify HEAD, and run `npm ci` plus `npm run build` with `/opt/ali-portfolio/runtime/bin` first in PATH. Keep `.env` and all state outside the release. Record the old `readlink /opt/ali-portfolio/current` privately. Create a `current.next` symlink to the new release and atomically replace `current` using `mv -Tf`. Restart only `ali-portfolio-api.service`, validate the local/public endpoints and watcher baseline. Existing Nginx/TLS and timers need no change for a normal source update. Roll back the symlink immediately if checks fail. Retain the previous working release.

## Daily operation

```sh
systemctl status ali-portfolio-api.service --no-pager
systemctl list-timers 'ali-portfolio-*' --no-pager
sudo journalctl -u ali-portfolio-github-sync.service -n 20 --no-pager
sudo journalctl -u ali-portfolio-transcript-sync.service -n 20 --no-pager
curl -fsS http://127.0.0.1:4317/api/public/status
```

GitHub refresh runs hourly; transcript every twelve hours. A worker failure leaves the last successful cache unchanged and persists retry backoff (maximum 48 hours). Worker locks prevent overlaps; stale locks recover after thirty minutes, exceeding systemd runtime limits. Preserve the private state directory and environment in owner-controlled encrypted backups. Do not publish backups.

See [transcript authentication](transcript-auth.md) for safe session renewal and field approval; [rollback](../deploy/rollback.md) for recovery. No real deployment or TLS checks may be marked complete until they have actually run.
