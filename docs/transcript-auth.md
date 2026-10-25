# Authorized transcript integration

Status: **AWAITING AUTHORIZED SESSION / REAL-PAGE VALIDATION**.

The existing FLEX-WATCHER parses assessment marks, not final course grades. This project must not reuse that HTML layout as proof of a transcript. No production selector profile or guessed endpoint is committed.

## One-time integration gate

1. Supply the non-secret exact transcript page URL from the owner’s normal authenticated FLEX browser. Supply a local path to a redacted HTML capture if available. Keep it outside this repository and remove name, ID, account details, fees and authentication material. Preserve semester/grade structure and completeness. No CAPTCHA or access-control bypass is supported.
2. The engineer inspects the capture, identifies positive transcript evidence, validates labels/order/final grades, and writes a profile outside Git. `profileSchema` defines the accepted fields: capture SHA-256, root, CGPA selector, semester selector, semester label, numeric source order attribute, SGPA selector, course row/code/title/final grade and optional credits selectors. Selectors must each have unique intended matches. If the real source lacks these structures, adapt the parser to the observed format and add a fully synthetic matching fixture. Do not modify source HTML or invent a source order to force a match.
3. Store the reviewed profile at `/var/lib/ali-portfolio/parser-profile.json` mode 0600, owned by `ali-portfolio`. Its evidence hash documents the inspected capture, not an automatic proof of authenticity. Configure `FLEX_PARSER_CONFIG` and `FLEX_TRANSCRIPT_URL` privately.
4. Set the current manually authorized full cookie header using `sudoedit /etc/ali-portfolio.env`. Keep root:root ownership and mode 0600. Never paste cookies into chat, Git, screenshots, a shell command, or logs. The application neither stores a password nor logs in automatically.
5. Run the new transcript worker and review the normalized private snapshot locally. Verify every semester, grade, SGPA and CGPA against the authenticated source. Confirm no course rows were omitted and no assessment score was interpreted as a final grade. Keep details unpublished during validation.
6. Obtain explicit owner approval of public fields and record the approved field names/date without copying private records into Git. Only then set `PUBLIC_ACADEMICS_ENABLED=true` and the exact `PUBLIC_ACADEMIC_FIELDS` allowlist. Restart the portfolio API to load the policy. Re-check its public response for unwanted fields.

Until this gate is complete, the public site shows only 2.43 labeled self-reported and an honest empty semester state. A failed refresh must never replace the last good snapshot.

## Session renewal

Log into FLEX normally and obtain a fresh cookie. Run `sudoedit /etc/ali-portfolio.env`, replace only the portfolio’s `FLEX_COOKIE`, then verify owner/mode without printing contents:

```sh
sudo chown root:root /etc/ali-portfolio.env
sudo chmod 600 /etc/ali-portfolio.env
sudo systemctl stop ali-portfolio-transcript-sync.timer
# Allow an active one-shot to finish; check it is inactive first.
sudo systemctl is-active ali-portfolio-transcript-sync.service
```

After confirming the worker is inactive, remove only `/var/lib/ali-portfolio/transcript-status.json` and its `.bak` to clear the retry gate (never remove `transcript.json`). Start `ali-portfolio-transcript-sync.service` and re-enable/start its timer. Check its coarse journald message and the private last-success timestamp. The default retry can otherwise defer a fresh cookie for up to 48 hours after repeated failures.

Do not touch FLEX-WATCHER’s cookie, timer, service, snapshot or configuration. If the university blocks or challenges the request, wait for manual authorized access; do not evade it.
