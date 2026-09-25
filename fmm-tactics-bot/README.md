# FMM Vibe tactics bot

A scraper for the **Football Manager 26 Mobile** forum on
[fmmvibe.com](https://fmmvibe.com/forums/forum/149-football-manager-26-mobile/).
It finds the tactic threads and ranks them. You only need Python 3.8 or later, with no extra packages.

## What it does

1. Goes through the forum's topic list, newest posts first, and keeps threads that are
   tagged **Tactics** or have a tactic-style title.
2. For each thread, it reads the opening post (to get formations, a summary and the setup
   screenshots) and the **last pages** of replies (to get feedback from people using it now).
3. It counts positive words in the replies ("won the league", "unbeaten", "works well") and
   negative ones ("doesn't work", "sacked", "relegated"). With `--update-date`, it only
   counts replies posted after the latest game update.
4. It gives each thread a score out of 100 and writes `fmm_tactics_report.md` and
   `fmm_tactics_report.json`.

| Part of the score | Weight | How it's measured |
|--------|--------|-------|
| Recent activity | 30% | Days since the last post (people still using it) |
| Freshness | 15% | Days since the thread started (built for the current version) |
| Engagement | 25% | Views and replies (log scale) |
| Feedback | 30% | Share of positive replies, weighted by how many replies have feedback |

## Usage

```bash
python3 fmm_tactics_bot.py                                   # defaults
python3 fmm_tactics_bot.py --pages 12 --days 120 --top 20 \
        --update-date 2026-07-01                             # only score feedback posted after the last update
```

| Flag | Default | Meaning |
|------|---------|---------|
| `--pages` | 10 | Pages of the topic list to crawl (25 topics per page) |
| `--days` | 120 | Skip threads with no posts in this many days |
| `--recent-pages` | 2 | How many of the last pages of each thread to read |
| `--update-date` | – | Only count feedback posted on or after this date |
| `--top` | 15 | How many tactics go in the Markdown report |
| `--delay` | 1.0 | Seconds between requests. Keep it polite |

## Limits

- Most FMM tactics are shared as **screenshots**. The bot links them in the report instead of
  trying to read them. The setup screenshots are usually the first or last few.
- Sentiment is keyword-based, so it's a rough guide. Read the latest replies before you trust a score.
- If FMM Vibe changes its forum theme, the regexes in `parse_listing` / `parse_posts`
  may need updating.
