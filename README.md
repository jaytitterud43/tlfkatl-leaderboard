# TLFKATL — Update 3: Leaderboard + Live Scores

This is the screen your friends open to watch standings and live scores. It reads the `/scores` and `/live` endpoints your backend already serves, auto-refreshing every 60 seconds.

## The key decision: where this page lives

You now have two frontend "things": the **signup app** (already deployed) and this **leaderboard**. For launch speed, the simplest approach:

**Recommended — deploy the leaderboard as its own Netlify site.**
- Signup link: your existing Netlify site (friends already used it)
- Leaderboard link: a new Netlify site (the one everyone checks daily from now on)
- This keeps it dead simple: two separate links, no routing code. Since signups are basically done, the leaderboard is the link you'll actually share going forward.

(Later, when there's time, these can be merged into one app with navigation. For June 11, two links is the fastest path and totally fine.)

## Steps (~15 min)

### Option A — New Netlify site (recommended, fastest)
1. Make a new GitHub repo: `tlfkatl-leaderboard`
2. From this download's `frontend/` folder, upload these into the repo, **but rename `Leaderboard.jsx` to `App.jsx`** (replace the signup App.jsx — this repo is just the leaderboard):
   - `src/App.jsx`  ← this is the renamed Leaderboard.jsx
   - `src/main.jsx`
   - `index.html`
   - `package.json`
   - `vite.config.js`
   - `netlify.toml`
3. In Netlify: Add new site → import `tlfkatl-leaderboard`
4. Add environment variable: `VITE_API_URL` = your Render backend URL (same one as before, no trailing slash)
5. Deploy. Share this new link with your friends as the "check standings" link.

### Verify
- Open the new link on your phone
- **Leaderboard tab:** all 12 friends listed at 0 pts (correct pre-tournament), each showing their dark horse 🐴, flop 💀, and Golden Boot 👟
- **Live Scores tab:** all 72 games grouped by day, showing kickoff times (scores appear once games start)
- On June 11, scores and points start moving on their own.

## What it does
- **Leaderboard tab:** stack-ranked standings, gold/silver/bronze ranks, 🔥 on the current leader, each person's side-bet picks shown as flag icons
- **Live Scores tab:** games by day, live indicator (red ● LIVE) during matches, scores update within ~a minute of real life

## Honest notes
- The 🔥 currently marks the current points leader (a simple proxy). True "daily mover" (biggest gainer that day) needs the backend to track day-over-day deltas — a later upgrade.
- This shows Phase 1 (group stage). The bracket view comes in the next build before June 28.
- Auto-refreshes every 60s while open; matches the backend's 90s poll, so it's never more than ~2.5 min behind live.

## Still ahead
- My Picks / Everyone's Picks pages
- Bracket entry + Phase 2 scoring (before June 28)
- Extras resolution (Golden Boot, dark horse, the three side bets)
- Home page podium, personalized texts
