# Builds the app-store edition at /app/ from the website game.
# Run after every game change:  python3 tools/build_app.py   (optional: source page and output folder, for test builds)
#   - every real player, legend, event, course and tour/cup name becomes its store name (tools/store_names.py)
#   - the app keeps its own saves (separate from the website) and hides the website-only bits
#   - players can rename anything or import a names file; their renames are applied before the game starts
import json, os, re
import store_names as N

import sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else os.path.join(ROOT, 'index.html')
OUT = os.path.abspath(sys.argv[2]) if len(sys.argv) > 2 else os.path.join(ROOT, 'app')

def pairs():
    p = {}
    for d in (N.PLAYERS, N.LEGENDS, N.EVENTS, N.COURSES, N.TERMS):
        p.update({k: v for k, v in d.items() if k != v})
    # tour words that only appear as part of longer labels
    p.update({'PGA Tour': 'SPA Tour', 'PGA TOUR': 'SPA TOUR', 'FEDEX CUP': 'TOUR CUP', 'FEDEX': 'TOUR CUP',
              'RYDER CUP': 'TRANSATLANTIC CUP', 'PRESIDENTS CUP': 'CONTINENTS CUP', 'Ryder': 'Transatlantic',
              'Ryder Cups': 'Transatlantic Cups', 'Presidents Cups': 'Continents Cups', 'FedEx Cups': 'Tour Cups'})
    for k, v in list(p.items()):
        if k.upper() != k:
            p.setdefault(k.upper(), v.upper())
    return p

def rename(text, p):
    keys = sorted(p, key=len, reverse=True)
    rx = re.compile(r'(?<![A-Za-z0-9_$])(' + '|'.join(re.escape(k) for k in keys) + r')(?![A-Za-z0-9_$])')
    return rx.sub(lambda m: p[m.group(1)], text)

def sub1(s, old, new):
    assert s.count(old) == 1, (old[:60], s.count(old))
    return s.replace(old, new)

def main():
    p = pairs()
    html = open(SRC, encoding='utf-8').read()
    html = rename(html, p)
    # the challenge stories also use surnames and nicknames on their own: rename those inside the challenge list only
    a = html.find('const CHALLENGES = [')
    if a >= 0:
        b = html.index('\n];', a)
        html = html[:a] + rename(html[a:b], dict(N.CHALLENGE_TEXT)) + html[b:]
    # nicknames and references the full-name list can't catch
    for a, b in [("Tiger '00", "Tyger '00"), ("Hogan '53", "Hogarth '53"), ("Hogan's Alley", "The Alley")]:
        html = html.replace(a, b)
    # page settings for the app
    html = sub1(html, '<link rel="manifest" href="manifest.webmanifest">', '<link rel="manifest" href="manifest.webmanifest">\n<meta name="robots" content="noindex">')
    html = sub1(html, '<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">', '<link rel="apple-touch-icon" href="../icons/apple-touch-icon.png">')
    html = html.replace('href="icons/', 'href="../icons/')
    html = sub1(html, 'navigator.serviceWorker.register("sw.js")', 'navigator.serviceWorker.register("../sw.js")')
    html = sub1(html, 'const SAVE_KEY = "golf-career-sim-v4";', 'const SAVE_KEY = "sunday-pins-app-v1";')
    html = sub1(html, 'const TIP_KEY = "sunday-pins-tips-seen";', 'const TIP_KEY = "sunday-pins-app-tips-seen";')
    # the game runs through a small loader that first applies the player's own renames
    start = html.index('<script>', html.index('courses-geo.js'))
    end = html.index('</script>', start)
    game = html[start + len('<script>'):end]
    terms = sorted(set(v for k, v in N.TERMS.items() if k != v and v.upper() != v))
    loader = '''<script>
window.SP_EDITION = "app";
window.SP_TERMS = %s;
(function () {
    var src = document.getElementById("sp-game").textContent, ov = {};
    try { ov = JSON.parse(localStorage.getItem("sunday-pins-app-names") || "{}") || {}; } catch (e) { ov = {}; }
    var pairs = Object.keys(ov).filter(function (k) { return ov[k] && ov[k] !== k; }).map(function (k) { return [k, ov[k]]; });
    window.SP_NAME_BASE = {};
    pairs.forEach(function (q) { window.SP_NAME_BASE[q[1]] = q[0]; });
    if (pairs.length) {
        var map = {}, keys = [];
        pairs.forEach(function (q) { map[q[0]] = q[1]; map[q[0].toUpperCase()] = q[1].toUpperCase(); });
        keys = Object.keys(map).sort(function (a, b) { return b.length - a.length; });
        var esc = function (s) { return s.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&"); };
        var rx = new RegExp("(?<![A-Za-z0-9_$])(" + keys.map(esc).join("|") + ")(?![A-Za-z0-9_$])", "g");
        src = src.replace(rx, function (m) { return map[m]; });
    }
    var s = document.createElement("script");
    s.textContent = src;
    document.body.appendChild(s);
})();
</script>''' % json.dumps(terms)
    html = html[:start] + '<script type="text/plain" id="sp-game">' + game + '</script>\n' + loader + html[end + len('</script>'):]
    os.makedirs(OUT, exist_ok=True)
    open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8').write(html)
    geo = open(os.path.join(os.path.dirname(SRC), 'courses-geo.js'), encoding='utf-8').read()
    open(os.path.join(OUT, 'courses-geo.js'), 'w', encoding='utf-8').write(rename(geo, p))
    man = json.load(open(os.path.join(ROOT, 'manifest.webmanifest'), encoding='utf-8'))
    man.update({'id': '/app/', 'start_url': '/app/', 'scope': '/app/'})
    man['icons'] = [{**i, 'src': '../' + i['src']} for i in man['icons']]
    json.dump(man, open(os.path.join(OUT, 'manifest.webmanifest'), 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    # anything real still in the app?
    leftovers = [w for w in ['Scheffler', 'McIlroy', 'Tiger Woods', 'Nicklaus', 'Masters"', 'PGA', 'Ryder', 'FedEx', 'Presidents Cup', 'Augusta', 'TPC'] if w in html]
    print('app built:', len(html) // 1024, 'KB | names replaced:', len(p), '| leftovers:', leftovers)

if __name__ == '__main__':
    main()
