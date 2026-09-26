// Sunday Pins service worker: the game opens instantly and keeps working offline.
// The page itself is fetched network-first (so updates arrive as soon as you're online);
// libraries, fonts and icons are cache-first (they never change for a given URL).
const CACHE = "sunday-pins-v2";
const CORE = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png"];
// the game can't start without these, so fetch them at install time rather than waiting for first use
const LIBS = [
  "https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js",
  "https://cdn.tailwindcss.com",
  "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=IBM+Plex+Mono:wght@400;600&display=swap",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all([
    c.addAll(CORE),
    // opaque (no-cors) responses are fine to store; a library that fails now is picked up on first use instead
    Promise.allSettled(LIBS.map((u) => fetch(u, { mode: "no-cors" }).then((res) => c.put(u, res)))),
  ])).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // only the game's own files and its libraries are cached; anything else (e.g. the visitor counter) goes straight to the network
  const CACHEABLE = ["cdnjs.cloudflare.com", "cdn.tailwindcss.com", "fonts.googleapis.com", "fonts.gstatic.com"];
  if (url.origin !== location.origin && !CACHEABLE.includes(url.hostname)) return;
  const isPage = req.mode === "navigate" || (url.origin === location.origin && url.pathname.endsWith(".html"));
  if (isPage) {
    e.respondWith(fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put("./index.html", copy));
      return res;
    }).catch(() => caches.match("./index.html")));
    return;
  }
  // React, Tailwind, Google Fonts and our icons: serve from cache, fill it on first use
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => {
    if (res && (res.ok || res.type === "opaque")) {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(req, copy));
    }
    return res;
  })));
});
