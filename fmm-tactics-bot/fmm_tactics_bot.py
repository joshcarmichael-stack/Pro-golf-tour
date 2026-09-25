#!/usr/bin/env python3
"""FMM Vibe tactics bot.

Crawls the Football Manager 26 Mobile forum on https://fmmvibe.com, picks out
tactic threads, reads the opening post plus the most recent replies, and ranks
the tactics by how recent, popular and well-reviewed they are.

Only the Python standard library is used. Example:

    python3 fmm_tactics_bot.py --pages 12 --days 120 --out report.md
"""

import argparse
import html
import json
import math
import re
import sys
import time
import urllib.error
import urllib.request
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone

BASE = "https://fmmvibe.com"
FORUM = BASE + "/forums/forum/149-football-manager-26-mobile/"
USER_AGENT = "Mozilla/5.0 (compatible; fmm-tactics-bot/1.0; personal research)"

FORMATION_RE = re.compile(r"\b([2-5])[- ]?([1-5])[- ]?([1-5])(?:[- ]?([1-5]))?(?:[- ]?([1-5]))?\b")
TACTIC_TITLE_RE = re.compile(r"tactic|formation|\b[2-5]-?[1-5]-?[1-5]|press|tiki|gegen|counter|wing|v\d+\b", re.I)
NOT_TACTIC_TITLE_RE = re.compile(r"wonderkid|database|editor|wishlist|career|rebuild|help|bug|crash|save", re.I)

POSITIVE = [
    "works great", "working great", "works well", "working well", "worked well", "amazing",
    "brilliant", "unbeaten", "invincible", "won the league", "won the title", "promoted",
    "promotion", "treble", "double", "champions", "great tactic", "best tactic", "love it",
    "love this", "thank you", "thanks", "excellent", "fantastic", "incredible", "dominat",
    "clean sheet", "won everything", "top of the league", "strong", "solid", "perfect",
]
NEGATIVE = [
    "doesn't work", "does not work", "didn't work", "not working", "stopped working",
    "terrible", "awful", "sacked", "relegated", "relegation", "losing streak", "lost every",
    "too many goals", "concede a lot", "conceding a lot", "struggling", "poor results",
    "worse", "useless", "broken", "nerfed", "no longer works",
]
UPDATE_RE = re.compile(r"\b(?:update|patch|version|v)\s*(\d{1,2}\.\d{1,2}(?:\.\d{1,2})?|\d{3,4})\b", re.I)


@dataclass
class Topic:
    id: int
    title: str
    url: str
    author: str = ""
    started: str = ""
    last_post: str = ""
    replies: int = 0
    views: int = 0
    tags: list = field(default_factory=list)
    pages: int = 1
    # Filled in after reading the thread.
    formations: list = field(default_factory=list)
    summary: str = ""
    screenshots: list = field(default_factory=list)
    update_mentions: list = field(default_factory=list)
    recent_positive: int = 0
    recent_negative: int = 0
    recent_quotes: list = field(default_factory=list)
    score: float = 0.0


def fetch(url, delay):
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                body = resp.read().decode("utf-8", "replace")
            time.sleep(delay)
            return body
        except (urllib.error.URLError, TimeoutError) as exc:
            if attempt == 2:
                print(f"  ! failed {url}: {exc}", file=sys.stderr)
                return ""
            time.sleep(2 ** (attempt + 1))
    return ""


def text_of(fragment):
    fragment = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", fragment, flags=re.S)
    fragment = re.sub(r"<blockquote.*?</blockquote>", " ", fragment, flags=re.S)  # drop quoted replies
    fragment = re.sub(r"<br\s*/?>|</p>|</li>", "\n", fragment)
    fragment = re.sub(r"<[^>]+>", " ", fragment)
    fragment = html.unescape(fragment)
    fragment = re.sub(r"[ \t\xa0]+", " ", fragment)
    return re.sub(r"\n\s*\n+", "\n", fragment).strip()


def parse_count(raw):
    raw = raw.strip().lower().replace(",", "")
    mult = 1000 if raw.endswith("k") else 1_000_000 if raw.endswith("m") else 1
    try:
        return int(float(raw.rstrip("km")) * mult)
    except ValueError:
        return 0


def parse_listing(page_html):
    topics = []
    for row in re.findall(r"<li class=\"ipsDataItem [^\"]*\"\s+data-rowID='(\d+)'>(.*?)</li>\s*(?=<li class=\"ipsDataItem|</ol>)",
                          page_html, re.S):
        row_id, body = row
        link = re.search(r"<a href='(https://fmmvibe.com/forums/topic/[^'?#]+)'[^>]*title='([^']*)'", body)
        if not link:
            continue
        times = re.findall(r"<time datetime='([^']+)'", body)
        stats = re.findall(r"ipsDataItem_stats_number'>([^<]+)</span>\s*<span class='ipsDataItem_stats_type'>\s*(\w+)", body)
        stat = {kind: parse_count(num) for num, kind in stats}
        author = re.search(r"By\s*<a [^>]*>([^<]+)</a>", body)
        last_page = re.search(r"ipsPagination_last'><a [^>]*>(\d+)", body)
        pages = re.findall(r"title='Go to page (\d+)'", body)
        topics.append(Topic(
            id=int(row_id),
            title=html.unescape(link.group(2)).strip(),
            url=link.group(1),
            author=html.unescape(author.group(1)).strip() if author else "",
            started=times[0] if times else "",
            last_post=times[-1] if times else "",
            replies=stat.get("replies", stat.get("reply", 0)),
            views=stat.get("views", stat.get("view", 0)),
            tags=re.findall(r"content tagged with '([^']+)'", body),
            pages=int(last_page.group(1)) if last_page else max([int(p) for p in pages] or [1]),
        ))
    return topics


def is_tactic(topic):
    if any(t.lower() == "tactics" for t in topic.tags):
        return True
    return bool(TACTIC_TITLE_RE.search(topic.title)) and not NOT_TACTIC_TITLE_RE.search(topic.title)


def parse_posts(page_html):
    """Return [(iso_date, text)] for each post on a topic page."""
    posts = []
    for art in re.findall(r"<article[^>]*id=['\"]elComment_\d+['\"].*?</article>", page_html, re.S):
        date = re.search(r"<time datetime='([^']+)'", art)
        content = re.search(r"data-role=['\"]commentContent['\"][^>]*>(.*?)</div>\s*</div>", art, re.S)
        if content:
            posts.append((date.group(1) if date else "", text_of(content.group(1))))
    return posts


def screenshots_in(page_html):
    """Images in the opening post - most tactics are shared as screenshots."""
    art = re.search(r"<article[^>]*id=['\"]elComment_\d+['\"].*?</article>", page_html, re.S)
    content = re.search(r"data-role=['\"]commentContent['\"].*", art.group(0), re.S) if art else None
    found = []
    for src in re.findall(r"<img[^>]*?\ssrc=['\"](https?://[^'\"]+)", content.group(0) if content else ""):
        if "/images/" in src and "fmmvibe.com" in src or "emoji" in src:
            continue  # flags, club badges, emoticons
        if src not in found:
            found.append(src)
    return found


def formations_in(text):
    found = []
    for m in FORMATION_RE.finditer(text):
        parts = [p for p in m.groups() if p]
        if len(parts) >= 3 and sum(map(int, parts)) == 10:
            f = "-".join(parts)
            if f not in found:
                found.append(f)
    return found


def sentiment(text):
    low = text.lower()
    return sum(low.count(w) for w in POSITIVE), sum(low.count(w) for w in NEGATIVE)


def analyse_topic(topic, delay, recent_pages, update_date=""):
    first = fetch(topic.url, delay)
    posts = parse_posts(first)
    if not posts:
        return
    opening = posts[0][1]
    topic.formations = formations_in(topic.title + " " + opening)
    topic.summary = opening[:1500]
    topic.screenshots = screenshots_in(first)

    recent = posts[1:]
    start = max(2, topic.pages - recent_pages + 1)
    for page in range(start, topic.pages + 1):
        recent += parse_posts(fetch(f"{topic.url}?page={page}", delay))
    recent = recent[-40:]  # most recent feedback matters most after updates

    for date, text in recent:
        if update_date and date[:10] < update_date:
            continue  # feedback from before the latest game update may no longer apply
        pos, neg = sentiment(text)
        topic.recent_positive += pos
        topic.recent_negative += neg
    topic.recent_quotes = [
        {"date": d[:10], "text": t[:280]} for d, t in recent[-5:] if len(t) > 30
    ]
    mentions = set()
    for _, text in [posts[0]] + recent:
        mentions.update(UPDATE_RE.findall(text))
    topic.update_mentions = sorted(mentions)


def days_ago(iso, now):
    try:
        dt = datetime.fromisoformat(iso.replace("Z", "+00:00"))
    except ValueError:
        return 9999
    return max(0.0, (now - dt).total_seconds() / 86400)


def score(topic, now):
    """Blend recency, engagement and feedback into a 0-100-ish score."""
    recency = math.exp(-days_ago(topic.last_post, now) / 30)          # activity in the last month
    freshness = math.exp(-days_ago(topic.started, now) / 180)         # newer tactics suit the current build
    engagement = math.log10(1 + topic.views) / 6 + math.log10(1 + topic.replies) / 3
    total = topic.recent_positive + topic.recent_negative
    feedback = (topic.recent_positive + 1) / (total + 2)              # Laplace-smoothed approval rate
    confidence = min(1.0, total / 15)
    return round(100 * (0.30 * recency + 0.15 * freshness + 0.25 * engagement / 1.5
                        + 0.30 * (0.5 + (feedback - 0.5) * confidence)), 1)


def write_markdown(topics, path, now, top, update_date=""):
    lines = [
        "# FMM26 tactics ranking (scraped from FMM Vibe)",
        "",
        f"Generated {now:%Y-%m-%d %H:%M} UTC from {FORUM}",
        "",
        f"Feedback counted from: {update_date or 'all recent replies'}",
        "",
        "Score = recent activity (30%) + thread age (15%) + views/replies (25%) + feedback in the latest replies (30%).",
        "",
        "| # | Tactic | Formation(s) | Score | Replies | Views | Last post | +/- feedback |",
        "|---|--------|--------------|-------|---------|-------|-----------|--------------|",
    ]
    for i, t in enumerate(topics[:top], 1):
        lines.append(f"| {i} | [{t.title}]({t.url}) by {t.author} | {', '.join(t.formations[:3]) or '?'} | "
                     f"{t.score} | {t.replies} | {t.views:,} | {t.last_post[:10]} | "
                     f"{t.recent_positive}/{t.recent_negative} |")
    lines.append("")
    for i, t in enumerate(topics[:top], 1):
        lines += [
            f"## {i}. {t.title}",
            "",
            f"- Link: {t.url}",
            f"- Author: {t.author} · started {t.started[:10]} · last post {t.last_post[:10]}",
            f"- Formations mentioned: {', '.join(t.formations) or 'not stated'}",
            f"- Update/version mentions: {', '.join(t.update_mentions) or 'none'}",
            f"- Screenshots ({len(t.screenshots)}; setups are usually the first or last few): "
            + (" ".join(f"[{n}]({u})" for n, u in enumerate(t.screenshots, 1)
                        if n <= 6 or n > len(t.screenshots) - 6) or "none found"),
            "",
            "**Opening post (excerpt):**",
            "",
            "> " + t.summary[:900].replace("\n", "\n> "),
            "",
        ]
        if t.recent_quotes:
            lines += ["**Latest replies:**", ""]
            lines += [f"- *{q['date']}*: {q['text']}" for q in t.recent_quotes]
            lines.append("")
    with open(path, "w", encoding="utf-8") as fh:
        fh.write("\n".join(lines))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--pages", type=int, default=10, help="forum listing pages to crawl (25 topics each)")
    ap.add_argument("--days", type=int, default=120, help="ignore threads with no post in this many days")
    ap.add_argument("--recent-pages", type=int, default=2, help="latest pages of each thread to read for feedback")
    ap.add_argument("--top", type=int, default=15, help="tactics to include in the report")
    ap.add_argument("--update-date", default="",
                    help="YYYY-MM-DD of the latest game update; only feedback posted after it is scored")
    ap.add_argument("--delay", type=float, default=1.0, help="seconds between requests (be polite)")
    ap.add_argument("--out", default="fmm_tactics_report.md")
    ap.add_argument("--json", default="fmm_tactics_report.json")
    args = ap.parse_args()

    now = datetime.now(timezone.utc)
    seen = {}
    for page in range(1, args.pages + 1):
        url = f"{FORUM}?page={page}&sortby=last_post&sortdirection=desc"
        print(f"listing page {page}", file=sys.stderr)
        listing = parse_listing(fetch(url, args.delay))
        if not listing:
            break
        for t in listing:
            seen.setdefault(t.id, t)
        if all(days_ago(t.last_post, now) > args.days for t in listing):
            break  # sorted by last post, so everything further is older

    candidates = [t for t in seen.values() if is_tactic(t) and days_ago(t.last_post, now) <= args.days]
    print(f"{len(seen)} topics, {len(candidates)} recent tactic threads", file=sys.stderr)

    for t in candidates:
        print(f"reading: {t.title}", file=sys.stderr)
        analyse_topic(t, args.delay, args.recent_pages, args.update_date)
        t.score = score(t, now)

    candidates.sort(key=lambda t: t.score, reverse=True)
    write_markdown(candidates, args.out, now, args.top, args.update_date)
    with open(args.json, "w", encoding="utf-8") as fh:
        json.dump({"generated": now.isoformat(), "tactics": [asdict(t) for t in candidates]}, fh, indent=2)
    print(f"wrote {args.out} and {args.json}", file=sys.stderr)


if __name__ == "__main__":
    main()
