# Authorized transcript integration

The owner supplied an authorized redacted capture and approved publishing CGPA, semester labels/SGPA, course names/codes, final grades and credits on 26 October 2026 (Asia/Karachi). The actual capture remains outside Git. Production uses the built-in parser for `https://flexstudent.nu.edu.pk/Student/Transcript`, with no captured dump query parameter.

The parser reads each semester's `h5`, labeled CGPA/SGPA spans and eight-column course table. Only code, course title, credits and final grade enter the normalized record. Semester ordering follows explicit term/year labels. `I`/`IP` grades are displayed as in progress; unfinished terms have null SGPA. A completed term's legitimate zero is retained. CGPA comes from the latest source-reported cumulative value, never an average.

An owner-provided capture may be imported privately with `node build/server/import-transcript.js /private/path/to/capture.html`. Set `DATA_DIR` explicitly. This creates `owner-capture` provenance and an import timestamp, NOT a successful live-sync timestamp. The dashboard labels it accordingly. A successful authenticated response replaces it with verified source provenance. Do not import over a newer verified snapshot.

## Configure / renew a session

1. Log into FLEX normally in your own browser; do not bypass a challenge.
2. Connect to Oracle and run `sudoedit /etc/ali-portfolio.env`.
3. Replace only `FLEX_COOKIE` with the authorized full cookie header in double quotes. Never paste it in chat, a command line, screenshots or Git.
4. Keep root ownership and mode 0600. The exact URL is configured; leave `FLEX_PARSER_CONFIG` empty for the built-in parser.
5. If retries are deferred, stop the portfolio transcript timer, ensure the one-shot service is inactive, and remove ONLY `transcript-status.json` and its `.bak` from `/var/lib/ali-portfolio/`. Never remove `transcript.json` or its backup.
6. Start `ali-portfolio-transcript-sync.service`, then start its enabled timer. Check coarse status and last-success timestamps without printing cookies or source HTML.

The worker refreshes every twelve hours with bounded backoff. Login pages, redirects, 401/403, challenges, invalid content types, malformed tables, missing fields and timeouts preserve the last good record. Credentials remain separate from data. The portfolio has no public session/update endpoints and does not log request bodies, cookie values or raw source responses.

## Testing

`npm test` runs the committed synthetic fixture suite. To additionally exercise the authorized capture locally, set `TRANSCRIPT_CAPTURE_PATH` to its external file path. Tests cover all rows, source values, incomplete grades, login/HTTP failures, malformed/truncated DOM and preservation of snapshots. Never commit the real capture or actual grade fixtures. Browser screenshots use synthetic records.

Existing FLEX-WATCHER and CP-WATCHER configuration, sessions, code, timers and data remain independent and untouched. A successful live request is required before calling the integration verified live.
