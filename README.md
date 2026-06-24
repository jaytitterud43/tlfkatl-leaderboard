# TLFKATL — Update 7: Three frontend features

## What's new
1. **Tap the pick bar (Home)** — tapping any game's distribution bar expands the full list of who picked what (by team / draw / team).
2. **My Picks scorecard** — a section showing your hits and misses: a CORRECT / WRONG / ACCURACY summary, then a per-game ✅/❌ list. Only counts games already played.
3. **% correct on Leaderboard** — each person now shows their accuracy % (correct game picks ÷ games played so far, rounded up).

All three read existing data (`/picks`, `/scores`, `/live`) — no backend changes.

## Deploy (flat — no folders)
In your `tlfkatl-leaderboard` repo, upload these at the top level, overwriting:
- App.jsx, main.jsx, index.html, package.json, vite.config.js, netlify.toml

Confirm index.html's script line is exactly:  <script type="module" src="./main.jsx"></script>
Netlify auto-rebuilds. No env-var changes.

## Notes
- % correct and the scorecard only appear once games are completed; before that they show a friendly placeholder.
- % correct counts game-outcome picks only (not upset/group bonuses), as agreed — an intuitive "match calls right."
- The expandable bar shows all picks (picks aren't hidden per-game after lock — expected for a friend pool).
