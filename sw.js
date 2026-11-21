// Service worker della guida.
// Pagina, codice e dati: subito dalla copia salvata, la versione nuova si scarica in background.
// Se la copia manca si usa la rete, con un limite di 3 secondi.
const CACHE = "giappone27-202611211518";
const CORE = [
  "./",
  "./index.html",
  "./style.css?v=202611211518",
  "./app.js?v=202611211518",
  "./data.json?v=202611211518",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-180.png",
  "./icon-maskable-512.png",
  "./fonts/ShipporiMinchoB1-ExtraBold.woff2",
  "./fonts/ZenKakuGothicNew-Bold.woff2",
  "./fonts/ZenKakuGothicNew-Medium.woff2",
  "./fonts/ZenKakuGothicNew-Regular.woff2"
];
const OPT = {ignoreSearch: true};
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE.map(u => new Request(u, {cache: "reload"})))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
const timeout = (p, ms) => Promise.race([p, new Promise((_, no) => setTimeout(() => no(new Error("timeout")), ms))]);
function refresh(req){
  return fetch(req, {cache: "no-cache"}).then(res => { if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; });
}
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // meteo e Google Maps: niente cache qui
  const key = req.mode === "navigate" ? "./index.html" : req;
  e.respondWith(caches.match(key, OPT).then(hit => {
    if (hit) { e.waitUntil(refresh(req).catch(() => {})); return hit; }
    return timeout(refresh(req), 3000).catch(() => caches.match("./index.html", OPT).then(x => x || new Response("Offline", {status: 503})));
  }));
});
