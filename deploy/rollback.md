# Rollback

Use the exact backup directory recorded during deployment. Never restore the whole shared Nginx tree indiscriminately.

For an update, verify that the previous release resolves under `/opt/ali-portfolio/releases/` and contains the previously healthy build. Point `/opt/ali-portfolio/current.next` at that release, then atomically replace `current` with `sudo mv -Tf /opt/ali-portfolio/current.next /opt/ali-portfolio/current`. Restart only `ali-portfolio-api.service`. Verify its status API, external assets, and the watcher baseline.

For first-install rollback, disable only `ali-portfolio-api.service`, `ali-portfolio-github-sync.timer`, and `ali-portfolio-transcript-sync.timer`. Stop any running portfolio sync services. Remove only `/etc/nginx/sites-enabled/ali-portfolio.conf`, run `sudo nginx -t`, and reload Nginx. Keep private snapshots/configuration for recovery. No reboot or runtime downgrade is needed.

Restore only portfolio-specific configuration files if they were changed. Back up TLS settings before adding certificates. The first-install script refuses to overwrite an existing portfolio vhost. Routine releases use the update procedure in `docs/operations.md`.
