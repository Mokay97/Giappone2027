// Service worker: la guida funziona anche senza connessione.
// Pagina, codice e dati: prima la rete (versione sempre aggiornata), poi la copia salvata.
// Font e icone: prima la copia salvata.
const CACHE = "giappone27-202611191131";
const CORE = [
  "./",
  "./index.html",
  "./style.css?v=202611191131",
  "./app.js?v=202611191131",
  "./data.json?v=202611191131",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-180.png",
  "./fonts/ShipporiMinchoB1-ExtraBold.woff2",
  "./fonts/ZenKakuGothicNew-Bold.woff2",
  "./fonts/ZenKakuGothicNew-Medium.woff2",
  "./fonts/ZenKakuGothicNew-Regular.woff2"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // meteo e Google Maps: nessuna cache qui
  const fresh = req.mode === "navigate" || /\.(html|js|css|json)$/.test(url.pathname) || url.pathname.endsWith("/");
  if (fresh) {
    e.respondWith(fetch(req, {cache: "no-cache"}).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res; })
      .catch(() => caches.match(req).then(hit => hit || caches.match("./index.html"))));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res; })));
});
