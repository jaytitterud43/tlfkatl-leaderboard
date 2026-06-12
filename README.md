# TLFKATL — Update 5: Home screen pick insights

Adds two things under each upcoming-match card on the Home tab:
1. A stacked bar showing how all 12 split their pick (home / draw / away) for that game.
2. "Your pick: ..." — shown only if this device has identified you (via the My Picks name-tap). If not identified, nothing shows, exactly like before.

## Deploy (flat — no folders)
In your `tlfkatl-leaderboard` repo, upload these at the top level, overwriting:
- App.jsx, main.jsx, index.html, package.json, vite.config.js, netlify.toml

IMPORTANT: confirm index.html line for the script reads exactly:
  <script type="module" src="./main.jsx"></script>
(one quote each side, ./main.jsx — this was the earlier snag.)

Netlify auto-rebuilds on commit. No env-var changes.

## Notes
- Bar shows "No picks recorded" only if literally nobody picked that game (won't happen with real data).
- Long team names are truncated under the bar to fit the card.
- Everything else unchanged.
