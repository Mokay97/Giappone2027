/* Giappone 2027 – logica della guida. Tutti i dati sono in data.json */
(async () => {
let __D;
try {
  const r = await fetch('data.json?v=202611211518');
  if (!r.ok) throw new Error(r.status);
  __D = await r.json();
} catch (err) {
  const m = document.createElement('div'); m.id = 'booterr';
  m.innerHTML = '<div><b>日本</b><h2>Non riesco a caricare la guida</h2><p>Controlla la connessione e riprova. Se l’hai già aperta almeno una volta con internet, chiudi e riapri l’app.</p><button onclick="location.reload()">Riprova</button></div>';
  document.body.appendChild(m); return;
}
/* ====== DATI: modificabili ====== */
const DAYS = __D.days;
const PLACES = __D.places;
const BUDGET = __D.budget;
const DEADLINES = __D.deadlines;
const PACK = __D.pack;
const PEOPLE = 6;
const DEFAULT_RATE = 180;
const CITIES = {
  Tokyo:{k:"東京",c:"var(--tokyo)",code:"T"}, Kyoto:{k:"京都",c:"var(--kyoto)",code:"K"},
  Osaka:{k:"大阪",c:"var(--osaka)",code:"O"}, Nara:{k:"奈良",c:"var(--nara)",code:"N"},
  Milano:{k:"ミラノ",c:"var(--milano)",code:"M"}
};
const STAYS = [
  ["Toshi Hotel","Tokyo","Hirakawachō (Chiyoda), 7–13 marzo","6 notti"],
  ["INA House Nijojo","Kyoto","vicino al Castello Nijō, 13–16 marzo","3 notti"],
  ["Hotel Morning Box","Osaka","Higashi-Shinsaibashi, 16–17 marzo","1 notte"],
  ["Mikasa Ryokan","Nara","17–18 marzo","1 notte, cena inclusa"],
  ["Hotel Vintage","Tokyo","2-10-7 Irifune (Chūō), 18–20 marzo","2 notti"]
];
const HOTEL_Q = {"Mikasa Ryokan":"Mikasa Ryokan 728-10 Kawakamicho Nara","Hotel Vintage":"Hotel Vintage 2-10-7 Irifune Chuo Tokyo","Toshi Hotel":"Toshi Center Hotel Hirakawacho Tokyo","Hotel Morning Box":"Hotel Morning Box Osaka Shinsaibashi","INA House Nijojo":"INA House Nijojo Kyoto"};
const HOTELS = __D.hotels;
function renderHotels(){
  const sel = state.hcity || store.get("hcity","Tutte");
  setBackdrop(CITIES[sel] ? sel : "sceneHotel");
  $("#hchips").innerHTML = ["Tutte","Tokyo","Kyoto","Osaka","Nara"].map(n => {
    const c = CITIES[n] ? CITIES[n].c : "", cnt = n==="Tutte" ? HOTELS.length : HOTELS.filter(h=>h.city===n).length;
    return `<button class="chip" ${c?`style="--c:${c};--cf:${fillOf(c)}"`:""} data-hc="${n}" aria-pressed="${sel===n}">${n} <span class="cnt">${cnt}</span></button>`;
  }).join("");
  $("#hintro").textContent = sel==="Tutte" ? "Gli alloggi divisi per città, in ordine di viaggio. Le foto sono su Booking, nel pulsante di ogni scheda." : "Le foto sono su Booking, nel pulsante di ogni scheda.";
  const order = ["Tokyo","Kyoto","Osaka","Nara"].filter(c => sel==="Tutte" || c===sel);
  $("#hlist").innerHTML = order.map(city => (sel==="Tutte" ? `<h2 class="hgroup" style="--c:${CITIES[city].c}">${city} <span>${CITIES[city].k}</span></h2>` : "")
    + HOTELS.map((h,k)=>[h,k]).filter(([h])=>h.city===city).map(([h,k]) => hcard(h,k)).join("")).join("");
}
function hcard(h,k){
  {
    const c = cityOf(h.city).c, maps = HOTEL_Q[h.n] || h.full+" "+h.city;
    return `<article class="hcard" id="h${k}" style="--c:${c}"><div class="hbody">
      <h2>${esc(h.n)}</h2>
      <div class="hmeta"><span><b>${esc(h.city)}</b></span><span>${esc(h.dates)}, ${esc(h.nights)}</span></div>
      <p>${esc(h.desc)}</p>
      <h3>Dove si trova</h3>
      <p style="margin-top:0">${esc(h.addr)}. ${esc(h.pos)}</p>
      <div class="hmap">${mapSVG(h.city,{hotel: h.mapPoint || h.n})}</div>
      <div class="hfacts"><div>Check-in<b>${h.cin}</b></div><div>Check-out<b>${h.cout}</b></div><div>A testa<b>${eur(h.cost/PEOPLE)}</b></div></div>
      ${h.tip?`<div class="htip">${esc(h.tip)}</div>`:""}
      <div class="hbtns"><a class="btn solid" href="${h.url}" target="_blank" rel="noopener">Foto e prenotazione</a><a class="btn" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(maps)}" target="_blank" rel="noopener">Apri in Maps</a></div>
    </div></article>`;
  }
}
document.getElementById("hchips").addEventListener("click", e => { const b = e.target.closest(".chip"); if (!b) return; state.hcity = b.dataset.hc; store.set("hcity", state.hcity); renderHotels(); });
const CARDS = __D.cards;
const PHRASES = __D.phrases;

/* ====== storage ====== */
const SC = () => document.getElementById("scroller");
const DESK = () => matchMedia("(min-width:1024px)").matches;
const store = {
  get(k,d){try{const v=localStorage.getItem("jp27-"+k);return v===null?d:JSON.parse(v)}catch(e){return d}},
  set(k,v){try{localStorage.setItem("jp27-"+k,JSON.stringify(v))}catch(e){}}
};
const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const cityOf = n => CITIES[n] || {k:"",c:"var(--other)",code:"·"};
const fillOf = c => (c||"").replace(/^var\((--[a-z]+)\)$/, "var($1-f)");
const parse = s => { const [y,m,d]=s.split("-").map(Number); return new Date(y,m-1,d); };
const GG = ["domenica","lunedì","martedì","mercoledì","giovedì","venerdì","sabato"];
const eur = n => n.toLocaleString("it-IT",{style:"currency",currency:"EUR",useGrouping:"always"});

/* ====== countdown con aereo ====== */
const COUNTDOWN_FROM = "2026-09-01"; // da quando parte la barra (modificabile)
/* ora di Tokyo; per provare: ?oggi=2027-03-08T10:00 (ora di Tokyo) */
const FAKE = (() => { const q = new URLSearchParams(location.search).get("oggi"); const d = q ? new Date(q.length <= 10 ? q + "T09:00+09:00" : q + "+09:00") : null; return d && !isNaN(d) ? d : null; })();
const NOW = () => FAKE ? new Date(FAKE) : new Date();
function nowJ(){ const p = new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Tokyo",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(NOW());
  const g = k => p.find(x => x.type===k).value; return {date:`${g("year")}-${g("month")}-${g("day")}`, min:+g("hour")*60 + +g("minute")}; }
const TRIP = () => { const d = nowJ().date; return d >= "2027-03-06" && d <= "2027-03-21"; };
function PHASE(){
  if (TRIP()) return "trip";
  const p = new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Rome",year:"numeric",month:"2-digit",day:"2-digit"}).format(NOW());
  if (p >= "2027-03-22") return "back";
  if (p >= "2027-02-27") return "last";
  const md = p.slice(5);
  if (md >= "12-01" && md <= "12-26") return "xmas";
  if (md >= "12-27" || md <= "01-06") return "ny";
  return "pre";
}
const today = new Date(NOW()); today.setHours(0,0,0,0);
const start = parse(DAYS[0].date);
const diff = Math.round((start - today)/864e5);
let todayIdx = TRIP() ? DAYS.findIndex(d => d.date === nowJ().date) : -1;
let FLIGHT_PCT = 0;
const DEPARTURE = new Date("2027-03-06T12:30:00+01:00"); // volo da Milano
/* conto alla rovescia progressivo: mesi e giorni, poi giorni ore minuti, poi ore e minuti */
function countdownHTML(){
  const now = NOW();
  if (now >= DEPARTURE) return `<strong>Si parte!</strong> Buon volo ✈️`;
  const u = (n, s, p) => `<span class="cdu"><b>${n}</b><i>${n===1?s:p}</i></span>`;
  let months = 0, cur = new Date(now);
  while (true) { const t = new Date(cur); t.setMonth(t.getMonth()+1); if (t <= DEPARTURE) { cur = t; months++; } else break; }
  let ms = DEPARTURE - cur;
  const days = Math.floor(ms/864e5); ms -= days*864e5;
  const hours = Math.floor(ms/36e5); ms -= hours*36e5;
  const mins = Math.floor(ms/6e4);
  let parts;
  if (months >= 1) parts = [u(months,"mese","mesi"), u(days,"giorno","giorni")];
  else if (DEPARTURE - now >= 864e5) parts = [u(days,"giorno","giorni"), u(hours,"ora","ore"), u(mins,"minuto","minuti")];
  else parts = [u(hours,"ora","ore"), u(mins,"minuto","minuti")];
  return `<span class="cd">${parts.join("")}</span> alla partenza`;
}
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
/* barra: conto alla rovescia, volo con scalo a Pechino, treno del viaggio, rientro */
const LEGS = {
  out: [["2027-03-06T12:30:00+01:00","2027-03-07T05:35:00+08:00"],["2027-03-07T08:40:00+08:00","2027-03-07T12:50:00+09:00"]],
  ret: [["2027-03-20T18:00:00+09:00","2027-03-20T21:10:00+08:00"],["2027-03-21T02:15:00+08:00","2027-03-21T06:30:00+01:00"]]
};
const T = s => new Date(s).getTime();
const PLANE = `<path fill="currentColor" d="M21.5 11.2 14 9.6 9.6 2.5H7.4l2.2 7.3-4.9.6-1.9-2.6H1.3l1.2 4.2-1.2 4.2h1.5l1.9-2.6 4.9.6-2.2 7.3h2.2l4.4-7.1 7.5-1.6c.6-.1.6-1.1 0-1.2z"/>`;
const TRAIN = `<path fill="currentColor" d="M1 15.5c0-2.5 2-4.5 4.5-4.5H17c2.6 0 5 1.2 6.5 3.3.4.6 0 1.2-.7 1.2H1zM6 12.6h3v1.6H6zM11 12.6h3v1.6h-3zM1 16.6h22.5v1.2H1z"/>`;
const left = (ms) => { const h = Math.floor(ms/36e5), m = Math.round((ms % 36e5)/6e4); return `${h ? h + " h " : ""}${String(m).padStart(h ? 2 : 1, "0")} min`; };
function flightCompute(){
  const now = NOW().getTime(), from = parse(COUNTDOWN_FROM).getTime();
  const [o1, o2] = LEGS.out.map(l => l.map(T)), [r1, r2] = LEGS.ret.map(l => l.map(T)), STOP = 0.8;
  const ends = (a, b) => [`<b>${a[0]}</b> ${a[1]}`, `<b>${b[0]}</b> ${b[1]}`];
  if (now < o1[0]) return {mode:"plane", pct: Math.min(1, Math.max(0, (now - from)/(o1[0] - from))), label: countdownHTML(), ends: ends(["Milano","MXP"],["Tokyo","HND"])};
  if (now < o2[1]) { const E = ends(["Milano","MXP"],["Tokyo","HND"]);
    if (now < o1[1]) return {mode:"plane", stop:STOP, pct: STOP*(now - o1[0])/(o1[1] - o1[0]), label:`<strong>In volo verso Pechino</strong> · atterraggio tra ${left(o1[1] - now)}`, ends:E};
    if (now < o2[0]) return {mode:"plane", stop:STOP, pct: STOP, label:`<strong>Scalo a Pechino</strong> · ripartenza tra ${left(o2[0] - now)}`, ends:E};
    return {mode:"plane", stop:STOP, pct: STOP + (1-STOP)*(now - o2[0])/(o2[1] - o2[0]), label:`<strong>In volo verso Tokyo</strong> · atterraggio tra ${left(o2[1] - now)}`, ends:E}; }
  if (now < r1[0]) { const nj = nowJ(), k = Math.max(0, DAYS.findIndex(d => d.date === nj.date)), d0 = parse("2027-03-06");
    const dayN = Math.round((parse(nj.date) - d0)/864e5), pct = Math.min(1, (dayN + nj.min/1440)/DAYS.length), nx = DAYS[k+1];
    return {mode:"train", pct, label:`<strong>Giorno ${k+1} di ${DAYS.length}</strong> · ${esc(DAYS[k].city)}${nx && nx.city !== "Milano" ? ` · domani ${esc(nx.title)}` : ""}`, ends: ["<span><b>6</b> marzo</span>","<span><b>21</b> marzo</span>"].map(x => x.replace(/<\/?span>/g,""))}; }
  if (now < r2[1]) { const E = ends(["Tokyo","HND"],["Milano","MXP"]), S2 = 1 - STOP;
    if (now < r1[1]) return {mode:"plane", stop:S2, pct: S2*(now - r1[0])/(r1[1] - r1[0]), label:`<strong>In volo verso Pechino</strong> · atterraggio tra ${left(r1[1] - now)}`, ends:E};
    if (now < r2[0]) return {mode:"plane", stop:S2, pct: S2, label:`<strong>Scalo a Pechino</strong> · ripartenza tra ${left(r2[0] - now)}`, ends:E};
    return {mode:"plane", stop:S2, pct: S2 + (1-S2)*(now - r2[0])/(r2[1] - r2[0]), label:`<strong>In volo verso Milano</strong> · atterraggio tra ${left(r2[1] - now)}`, ends:E}; }
  return {mode:"plane", pct:1, label:`<strong>Okaeri!</strong> Bentornati a casa`, ends: ends(["Tokyo","HND"],["Milano","MXP"])};
}
function renderFlightBar(){
  const s = flightCompute(), fl = $("#flight");
  $("#flEnds").innerHTML = s.ends.map(x => `<span>${x}</span>`).join("");
  fl.classList.toggle("train", s.mode === "train");
  $("#flPlane").innerHTML = s.mode === "train" ? TRAIN : PLANE;
  if (s.mode === "train") $("#trLine").innerHTML = DAYS.map(d => `<i style="--c:${fillOf(cityOf(d.city).c)}"></i>`).join("");
  const st = $("#flStop"); st.hidden = s.stop == null; if (s.stop != null) st.style.left = (s.stop*100) + "%";
  $("#flLabel").innerHTML = s.label; FLIGHT_PCT = Math.max(0, Math.min(1, s.pct));
}
renderFlightBar();
setInterval(() => { renderFlightBar(); flightTo(false); }, 30000);
/* muove l'aereo lungo la barra: animate=false lo mette subito al suo posto */
function flightTo(animate){
  const f = $("#flFill"), p = $("#flPlane"), fl = $("#flight"), v = (FLIGHT_PCT*100)+"%";
  fl.classList.remove("animate");
  if (!animate || REDUCED) { f.style.width = v; p.style.left = v; return; }
  f.style.width = "0%"; p.style.left = "0%"; void f.offsetWidth;
  fl.classList.add("animate");
  requestAnimationFrame(() => { f.style.width = v; p.style.left = v; });
}

/* ====== giorni ====== */
const PTYPE = {"Trasferimento":["move","Spostamento"],"Visita":["visit","Visita"],"Di passaggio":["walk","Di passaggio"],"Panorama":["view","Panorama"],"Pasto":["food","Pasto"],"Hotel":["hotel","Hotel"]};
const IC_PIN = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>`;
const IC_CAM = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>`;
const IC_WALK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13" cy="4" r="2"/><path d="M10 21l2-6 3 3v4M8 12l2-4 4 1 2 4 3 1M10 8l-2 5"/></svg>`;
const IC_TRAIN = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="13" rx="3"/><path d="M5 10h14M9 20l-2 2M15 20l2 2M8.5 13.5h.01M15.5 13.5h.01"/></svg>`;
function gmapsURL(nv){
  const p = new URLSearchParams({api:"1", origin:nv.o, destination:nv.g, travelmode:nv.m});
  if (nv.v && nv.v.length && nv.m !== "transit") p.set("waypoints", nv.v.join("|"));
  return "https://www.google.com/maps/dir/?" + p.toString();
}
function photoQ(s, city){
  if (!["Visita","Panorama","Di passaggio"].includes(s.k)) return null;
  if (/Shinkansen|Linea|Tram|Navetta|Opzione|Karaoke|Pausa|Shopping|Vie di|Via principale|via dei venditori/i.test(s.n)) return null;
  const g = s.nav && s.nav.g;
  return (g && !/Station|Hotel|Ryokan|Busta/i.test(g)) ? g : s.n.replace(/\(.*?\)/g,"").trim() + ", " + (city || "") + ", Japan";
}
function phBtn(q){ return `<a class="navbtn ph" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}" target="_blank" rel="noopener">${IC_CAM}<span>Foto</span></a>`; }
function navBtn(nv){
  const walk = nv.m === "walking";
  return `<a class="navbtn${walk?"":" tr"}" href="${gmapsURL(nv)}" target="_blank" rel="noopener">${walk?IC_WALK:IC_TRAIN}<span>${walk ? (nv.v && nv.v.length ? "Percorso a piedi (il nostro)" : "Percorso a piedi") : "Indicazioni con i mezzi"}</span></a>`;
}
function planHTML(plan, city){
  const hide = store.get("hideOpt", false);
  let last = null;
  const navs = plan.map(s => { if (!s.nav) return null; const o = s.nav.o || last; last = s.nav.g; return (o && o !== s.nav.g) ? {...s.nav, o} : null; });
  const items = plan.map((s,i) => [s, navs[i]]).filter(([s]) => !(hide && s.p==="Opzionale")).map(([s, nv]) => {
    const [c,l] = PTYPE[s.k] || ["walk", s.k];
    const pr = s.p==="Imperdibile" ? `<span class="pr imp">Imperdibile</span>` : s.p==="Opzionale" ? `<span class="pr opt">Opzionale</span>` : "";
    return `<li class="pl ${c}${s.p==="Opzionale"?" isopt":""}" data-m="${tmin(s.t)}"><time>${esc(s.t)}</time><div class="pc">
      <p class="pn">${esc(s.n)}</p><div class="pm"><span>${l}</span>${s.d && s.d!=="—" ? `<span>${esc(s.d)}</span>` : ""}${pr}</div>
      ${s.x ? `<p class="px">${esc(s.x)}</p>` : ""}${(nv || photoQ(s, city) || stampable(s)) ? `<div class="plbtns">${nv ? navBtn(nv) : ""}${photoQ(s, city) ? phBtn(photoQ(s, city)) : ""}${stampable(s) ? stBtn(s) : ""}</div>` : ""}</div></li>`;
  }).join("");
  return `<div class="plantools"><span>Tappa per tappa</span><label class="toggle"><input type="checkbox" id="hideOpt"${hide?" checked":""}> Nascondi opzionali</label></div><ol class="plan">${items}</ol>`;
}
let cur = todayIdx >= 0 ? todayIdx : 0;
const track = $("#track");
track.innerHTML = DAYS.map((d,i) => {
  const c = cityOf(d.city), dt = parse(d.date);
  return `<button class="stop${i===todayIdx?" today":""}" style="--c:${c.c};--cf:${fillOf(c.c)}" data-i="${i}" aria-label="Giorno ${i+1}, ${dt.getDate()} marzo, ${esc(d.city)}">
    <span class="badge"><i>${c.code}</i><em>${String(i+1).padStart(2,"0")}</em></span><small>${dt.getDate()}/3</small></button>`;
}).join("");
$("#legend").innerHTML = ["Tokyo","Kyoto","Osaka","Nara"].map(n=>`<span style="--c:${CITIES[n].c}">${n}</span>`).join("");
track.addEventListener("click", e => { const b=e.target.closest(".stop"); if(b) showDay(+b.dataset.i); });

/* Prima/Dopo: i pulsanti restano sotto il dito e la mappa del giorno resta in vista, così si vede la sua animazione */
function pageDay(i){
  const p0 = document.querySelector("#day .pager"), before = p0 ? p0.getBoundingClientRect().top : null;
  showDay(i);
  if (before === null) return;
  const p1 = document.querySelector("#day .pager");
  if (p1) SC().scrollBy(0, p1.getBoundingClientRect().top - before);
  const maps = document.querySelectorAll("#day .daymap"), m = maps[maps.length-1];
  if (m) { const r = m.getBoundingClientRect(); if (r.top < 8) SC().scrollBy(0, r.top - 8); }
}
const state0 = {swayed:false};
function showDay(i){
  cur = i;
  const d = DAYS[i], c = cityOf(d.city), dt = parse(d.date);
  track.querySelectorAll(".stop").forEach((b,j)=>b.setAttribute("aria-current", j===i));
  const btn = track.children[i];
  const route = $("#route");
  route.scrollTo({left: btn.offsetLeft - route.clientWidth/2 + 27, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto":"smooth"});
  const slots = [["Mattina",d.m],["Pomeriggio",d.p],["Sera",d.s]].filter(s=>s[1]);
  const el = $("#day");
  el.style.setProperty("--c", c.c); el.style.setProperty("--cf", fillOf(c.c));
  el.innerHTML = `
    <div class="noren${state0.swayed ? " sway" : ""}" aria-hidden="true"><i></i><i></i><i></i><b>${c.k}</b></div>
    <div class="day-head">
      <h2 aria-live="polite">${esc(d.title)}</h2><p>${GG[dt.getDay()]} ${dt.getDate()} marzo · giorno ${i+1} di ${DAYS.length}</p>
      <div class="dayinfo" id="dayinfo"></div>
      <a class="nowline" id="nowline" href="#" hidden></a>
    </div>
    ${d.plan ? planHTML(d.plan, d.city) : `<ul class="slots">${slots.map(s=>`<li><h3>${s[0]}</h3><p>${esc(s[1])}</p></li>`).join("")}</ul>`}
    ${ROUTES.some(r=>r.day===i+1) ? ROUTES.filter(r=>r.day===i+1 && (r.city!=="Japan" || r.card)).sort((a,b)=>((b.city==="Japan")-(a.city==="Japan")) || ((a.city===d.city)-(b.city===d.city))).map(r=>r.city).filter((c,k,a)=>a.indexOf(c)===k).map(c=>`<div class="daymap" data-city="${c}">${c==="Japan" ? mapSVG(c,{day:i+1, mode:"day", animate:true}) : mapZoomSVG(c, i+1, true)}</div>`).join("").replace(/^/,'<div class="daymaps">').replace(/$/,'</div>') : ""}
    ${d.n ? `<p class="note${d.alert?" alert":d.decide?" decide":""}">${esc(d.n)}</p>` : ""}
    ${d.hotel ? `<div class="sleep"><span>Stanotte: <a class="hlink" href="#hotel" data-h="${esc(d.hotel)}"><b>${esc(d.hotel)}</b></a></span><a class="btn" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(HOTEL_Q[d.hotel]||d.hotel+" "+d.city)}" target="_blank" rel="noopener">Mappa</a></div>` : ""}
    <div class="pager">
      <button class="btn" id="prev" ${i===0?"disabled":""}>‹ Prima</button>
      ${CITIES[d.city] && d.city!=="Milano" ? `<button class="btn solid" id="seeCity">Mappa e luoghi di ${esc(d.city)}</button>` : ""}
      <button class="btn" id="next" ${i===DAYS.length-1?"disabled":""}>Dopo ›</button>
    </div>`;
  fixZoom(el);
  $("#dayLive").textContent = `Giorno ${i+1}, ${d.title}, ${dt.getDate()} marzo`;
  state0.swayed = true; markNow();
  const nl = el.querySelector("#nowline"); if (nl) nl.onclick = ev => { ev.preventDefault(); const n = el.querySelector(".pl.next"); if (n) n.scrollIntoView({block:"center", behavior:"smooth"}); };
  if (!$("#v-giorni").hidden) setBackdrop(dayBackdrop(d));
  renderDayInfo();
  el.querySelectorAll(".daymap").forEach(dm => dm.addEventListener("click", e => {
    const g = e.target.closest(".st"); if (!g) return;
    if (g.dataset.go) { state.city = g.dataset.go; store.set("city", state.city); state.zone = null; state.focusDay = null; location.hash = "luoghi"; return; }
    state.city = dm.dataset.city === "Japan" ? "Tutte" : dm.dataset.city; store.set("city", state.city); state.zone = g.dataset.z; state.focusDay = i+1; location.hash = "luoghi";
  }));
  el.querySelectorAll("a.hlink").forEach(a => a.addEventListener("click", () => { state.hotelJump = a.dataset.h; }));
  const ho = el.querySelector("#hideOpt"); if (ho) ho.onchange = () => { store.set("hideOpt", ho.checked); showDay(cur); };
  $("#prev").onclick = () => pageDay(cur-1);
  $("#next").onclick = () => pageDay(cur+1);
  const sc = $("#seeCity"); if (sc) sc.onclick = () => { state.city = d.city; store.set("city", d.city); state.zone = null; state.focusDay = i+1; state._anim = true; location.hash = "luoghi"; };
}

/* ====== luoghi: programmati per giorno, opzionali, selezione in mappa ====== */
let done = new Set();
const state = { city: store.get("city","Tutte"), ps: "all", q: "", zone: null, focusDay: null };
let off = new Set(store.get("mapoff", []));
const cityList = ["Tutte","Tokyo","Kyoto","Osaka","Nara","Altre"];
function renderChips(){
  $("#chips").innerHTML = cityList.map(n => {
    const c = CITIES[n] ? CITIES[n].c : (n==="Altre" ? "var(--other)" : "");
    return `<button class="chip" ${c?`style="--c:${c};--cf:${fillOf(c)}"`:""} data-city="${n}" aria-pressed="${state.city===n}">${n}</button>`;
  }).join("");
}
$("#chips").addEventListener("click", e => { const b=e.target.closest(".chip"); if(!b) return; state.city=b.dataset.city; state.zone=null; state.focusDay=null; store.set("city",state.city); renderChips(); renderMap(); renderPlaces(); setBackdrop(CITIES[state.city] ? state.city : "plain"); });
$("#seg").addEventListener("click", e => { const b=e.target.closest("button"); if(!b) return; state.ps=b.dataset.ps; $("#seg").querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed", x===b)); renderPlaces(); });
$("#q").addEventListener("input", e => { state.q = e.target.value.trim().toLowerCase(); renderPlaces(); });
$("#selAll").addEventListener("click", () => { off = new Set(); store.set("mapoff", []); renderMap(); renderPlaces(); });
const inScope = p => state.city==="Altre" ? p.other : (state.city==="Tutte" || p.city===state.city);
const tmin = s => { const [h,m] = s.split(":"); return +h*60 + +m; };
function renderPlaces(){
  const list = PLACES.filter(p => {
    if (!inScope(p)) return false;
    if (state.zone && !zoneById(state.zone).pl.includes(p.name)) return false;
    if (state.focusDay && p.day !== state.focusDay) return false;
    if (state.ps === "prog" && !p.day) return false;
    if (state.ps === "opt" && p.day) return false;
    if (state.q && !(p.name+" "+(p.desc||"")+" "+p.city).toLowerCase().includes(state.q)) return false;
    return true;
  }).sort((a,b) => (a.day||99) - (b.day||99) || tmin(a.o||"23:59") - tmin(b.o||"23:59"));
  const shown = list.filter(p => !off.has(p.id)).length;
  $("#pstat").textContent = `${list.length} luoghi · ${shown} visibili in mappa`;
  let html = "", lastDay = -1;
  list.forEach(p => {
    const dk = p.day || 0;
    if (dk !== lastDay) { lastDay = dk;
      if (dk) { const d = DAYS[dk-1], c = cityOf(d.city).c;
        html += `<li class="dayhdr" style="--c:${c};--cf:${fillOf(c)}"><span class="dnb">${String(dk).padStart(2,"0")}</span><b>${dayLabel(dk)} · ${esc(d.title)}</b><button data-goday="${dk}">Apri il giorno ›</button></li>`; }
      else html += `<li class="dayhdr" style="--c:var(--line)"><b>Opzionali · senza un giorno fisso</b></li>`;
    }
    const c = cityOf(p.city).c, sel = !off.has(p.id);
    const price = p.price === null || p.price === undefined ? "" : (p.price===0 ? "Gratis" : `~${p.price} €`);
    html += `<li class="place${sel?" done":" off"}" style="--c:${c}">
      <button class="tick" data-id="${p.id}" aria-label="${sel?"Nascondi":"Mostra"} ${esc(p.name)} sulla mappa" aria-pressed="${sel}"><span class="tc"><svg viewBox="0 0 24 24" fill="none" stroke="var(--surface)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg></span></button>
      <div>
        <p class="pname">${esc(p.name)}</p>
        <div class="meta">${p.t ? `<span class="ptime">${esc(p.t)}</span>` : ""}<span class="cityname">${esc(p.city)}</span>
          ${p.imp>=5 ? `<span class="pr imp">Imperdibile</span>` : ""}${price?`<span>${price}</span>`:""}</div>
      </div>
      <div class="pbtns"><a class="navbtn" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name+" "+p.city+" Japan")}" target="_blank" rel="noopener">${IC_PIN}<span>Apri in Maps</span></a></div>
      <details><summary>Descrizione</summary><p>${esc(p.desc)}</p></details>
    </li>`;
  });
  $("#plist").innerHTML = html || `<li class="empty">Nessun luogo con questi filtri.</li>`;
}
$("#plist").addEventListener("click", e => {
  const g = e.target.closest("[data-goday]"); if (g) { cur = +g.dataset.goday - 1; location.hash = "giorni"; return; }
  const b = e.target.closest(".tick"); if(!b) return;
  const id = b.dataset.id; off.has(id) ? off.delete(id) : off.add(id);
  store.set("mapoff", [...off]); renderPlaces(); renderMap();
});

/* ====== mappe stilizzate ======
   zone: n=nome, x/y=posizione, lp=etichetta (r/l/t/b), pl=luoghi (nomi come nell'Excel), d=giorni del programma, opt=giorni da decidere */
/* ---- elementi di base delle mappe ---- */
const RL = d => `<path class="rail" d="${d}"/><path class="tie" d="${d}"/>`;
const LOOP = d => `<path class="rail loop" d="${d}"/><path class="tie" d="${d}"/>`;
const SUB = d => `<path class="sub" d="${d}"/>`;
const RD = (d,s) => `<path class="road${s?" s":""}" d="${d}"/>`;
const STN = (x,y,n,p="r") => { const o={r:[7,3.5,"start"],l:[-7,3.5,"end"],t:[0,-7,"middle"],b:[0,13,"middle"]}[p];
  return `<g class="stn"><rect x="${x-3.5}" y="${y-3.5}" width="7" height="7" rx="1.5"/>${n?`<text x="${x+o[0]}" y="${y+o[1]}" text-anchor="${o[2]}">${n}</text>`:""}</g>`; };
const DIST = (x,y,n) => `<text class="dist" x="${x}" y="${y}" text-anchor="middle">${n}</text>`;
const WL = (x,y,n,a="middle") => `<text class="wlbl" x="${x}" y="${y}" text-anchor="${a}">${n}</text>`;

const MAPS = {
  Tokyo:{w:360,h:392, km:22.8,
    base:`
      <path class="park" d="M80 160 C92 158 104 166 104 178 C104 192 96 200 86 198 C76 196 72 184 74 172 Z"/>
      <path class="park" d="M106 146 L122 146 L122 158 L106 158 Z"/>
      <path class="park" d="M184 136 C196 128 216 130 222 142 C226 154 220 166 206 168 C192 170 182 162 182 150 Z"/>
      <path class="water" d="M184 136 C196 128 216 130 222 142 C226 154 220 166 206 168 C192 170 182 162 182 150 Z" style="fill:none;stroke:var(--water);stroke-width:3"/>
      <path class="park" d="M232 66 C240 60 252 62 254 72 C256 82 248 88 240 86 C232 84 228 74 232 66 Z"/>
      <path class="park" d="M176 206 L194 206 L194 226 L176 226 Z"/>
      <path class="water" d="M168 392 L176 334 L186 300 L194 262 L204 240 L222 226 L246 212 L262 222 L280 232 L300 236 L322 238 L360 234 L360 392 Z"/>
      <path class="land2" d="M238 270 C250 262 270 266 272 280 C274 294 258 302 244 298 C234 294 230 280 238 270 Z"/>
      <path class="land2" d="M262 224 L292 232 L296 252 L268 250 Z"/>
      <path class="river" d="M300 0 C298 30 296 60 298 80 C300 100 290 118 284 130 C276 150 262 180 254 200 L248 214"/>
      ${RD("M0 128 L94 140 L154 150 L200 170 L232 178 L290 176 L360 172",1)}
      ${RD("M96 221 L150 214 L186 220 L222 226",1)}
      ${RD("M60 0 L115 39 L160 80 L205 150",1)}
      ${LOOP("M94 140 C96 112 98 96 100 84 C104 62 108 48 115 39 C130 34 146 34 152 35 C162 33 168 31 173 30 C180 27 185 24 189 23 C200 20 210 18 218 18 C224 22 228 28 230 33 C234 37 236 40 239 43 C246 56 250 68 252 79 C250 92 246 106 243 118 C242 126 240 130 239 135 C236 146 234 154 231 163 C228 170 225 174 222 178 C218 186 215 194 212 200 C211 210 210 220 210 228 C204 236 198 244 191 251 C184 266 178 282 172 296 C166 304 158 312 150 317 C147 312 144 307 142 302 C136 296 130 290 125 282 C120 272 116 260 113 249 C108 240 102 230 96 221 C97 210 98 200 98 190 C98 180 97 168 97 157 C96 151 95 146 94 140 Z")}
      ${RL("M0 98 L22 100 C40 110 66 126 94 140 C120 146 140 148 154 150 C170 142 188 130 204 122 C214 118 220 116 226 114 C232 120 236 128 239 135")}
      ${RL("M226 114 C250 118 270 122 290 124 C310 124 330 122 360 120")}
      ${RL("M231 163 C246 186 262 204 280 216 C300 226 324 232 360 234")}
      ${RL("M172 296 C182 318 196 340 208 360")}
      ${RL("M94 140 C76 160 54 186 27 212 C16 222 8 230 0 236")}
      ${RL("M96 221 C74 218 50 214 27 212")}
      ${STN(115,39,"")}${STN(252,79,"")}${STN(231,163,"")}${STN(172,296,"Shinagawa","l")}${STN(210,228,"")}${STN(97,157,"")}${STN(98,190,"")}
      ${DIST(178,108,"Bunkyō")}${DIST(150,188,"Chiyoda")}${DIST(150,262,"Minato")}${DIST(320,58,"Sumida")}${DIST(318,190,"Kōtō")}${DIST(46,266,"Setagaya")}${DIST(268,44,"Taitō")}
      ${WL(300,330,"Baia di Tokyo")}${WL(255,286,"Odaiba")}${WL(136,330,"linea Yamanote","end")}`,
    lm:[{n:"Stazione di Tokyo",x:231,y:163,lp:"r"}],
    det:[{n:"Kaminarimon",x:290.7,y:87,lp:"l"},{n:"Kuramae",x:278.7,y:105,lp:"l"},{n:"Sumida River Walk",x:301,y:84,lp:"r"},
         {n:"Omotesandō",x:118,y:202,lp:"r"},{n:"Takeshita-dōri",x:101,y:187,lp:"r"},{n:"Cat Street",x:107,y:204,lp:"r"},{n:"Miyashita Park",x:94,y:211,lp:"l"},{n:"Ebisu",x:113,y:249,lp:"r"},
         {n:"Tochō",x:76,y:141,lp:"b"},{n:"Kabukichō",x:97,y:127,lp:"r"},
         {n:"Palazzo della Dieta",x:185,y:176,lp:"b"},{n:"Nijūbashi",x:195,y:165,lp:"l"},{n:"Jimbōchō",x:212,y:125,lp:"l"},{n:"Kanda Myōjin",x:232,y:108,lp:"t"},
         {n:"teamLab Borderless",x:175,y:213,lp:"t"},{n:"Tsukiji",x:237,y:202,lp:"r"},{n:"Yūrakuchō",x:223,y:178,lp:"l"}],
    hotels:[{n:"Toshi Hotel",x:174,y:166,lp:"l"},{n:"Hotel Vintage",x:254,y:186,lp:"r"}],
    edges:[{n:"Monte Fuji",x:14,y:318,px:28,py:282,a:"M28 282 L10 304 M10 304 L11 293 M10 304 L21 302"},
           {n:"Kamakura (opz.)",x:108,y:384,px:100,py:352,a:"M100 352 L100 374 M100 374 L94 366 M100 374 L106 366"},
           {n:"Haneda",x:222,y:384,px:214,py:352,a:"M214 352 L214 374 M214 374 L208 366 M214 374 L220 366"}],
    zones:[
      {n:"Shinjuku",x:94,y:140,lp:"l",pl:["Omoide Yokocho Memory Lane"],d:[2]},
      {n:"Harajuku",x:90,y:180,lp:"l",pl:["Santuario Meiji","Harajuku e Takeshita-dōri","Yoyogi - kōen","Design Festa e Space Banksia"],d:[4]},
      {n:"Shibuya",x:96,y:221,lp:"t",pl:["Shibuya Crossing e Shibuya Center-gai","Shibuya PARCO: Pokémon Center e Nintendo TOKYO","Shibuya Sky","Nonbei Yokochō","Tomba di Hachikō","Womb, locale notturno industrial","Farmers Market @ UNU","Karaoke giapponese"],d:[4],opt:[14]},
      {n:"Ikebukuro",x:115,y:39,lp:"l",pl:["Animate Ikebukuro","Acquario Sunshine City"],d:[]},
      {n:"Ueno e Yanaka",x:238,y:58,lp:"t",pl:["Yanaka Ginza"],d:[15]},
      {n:"Asakusa",x:292,y:78,lp:"t",pl:["Senso-ji","Chopsticks Studio Asakusa","Kuramae"],d:[3]},
      {n:"Skytree",x:322,y:92,lp:"b",pl:["Skytree","Tokyo Sky Tree dal parco di Oshinari","Sumida Aquarium"],d:[3]},
      {n:"Akihabara",x:242,y:116,lp:"l",pl:["Akihabara Radio Kaikan","Santuario Kanda Myōjin","Jimbōchō"],d:[6]},
      {n:"Palazzo Imperiale",x:204,y:150,lp:"t",pl:["Palazzo Imperiale","Il Giardino Orientale"],d:[6]},
      {n:"Tokyo Tower",x:186,y:216,lp:"b",pl:["Tokyo Tower","teamLab Borderless"],d:[13]},
      {n:"Hama-rikyū",x:224,y:214,lp:"r",pl:["Giardino Hama - Rikyū"],d:[]},
      {n:"Nakano",x:22,y:100,lp:"t",pl:["Nakano Broadway"],d:[],opt:[14]},
      {n:"Shimokitazawa",x:27,y:212,lp:"bs",pl:["Shimo - Kitazawa"],d:[],opt:[14]},
      {n:"DisneySea",x:344,y:238,lp:"l",pl:["Disneyland Sea","Tokyo Sea Life Park"],d:[5]}
    ]},
  Kyoto:{w:360,h:376, km:39.5,
    base:`
      <path class="hill" d="M300 0 C318 40 312 90 322 140 C330 190 318 240 332 290 C338 320 334 350 342 376 L360 376 L360 0 Z"/>
      <path class="hill" d="M0 0 L120 0 C100 10 70 14 50 30 C30 46 16 70 0 90 Z"/>
      <path class="hill" d="M286 320 C300 312 320 318 330 334 L336 376 L280 376 C276 356 278 334 286 320 Z"/>
      <path class="park" d="M212 57 L234 57 L234 123 L212 123 Z"/>
      <path class="park" d="M164 126 L184 126 L184 142 L164 142 Z"/>
      <path class="water" d="M164 126 L184 126 L184 142 L164 142 Z" style="fill:none;stroke:var(--water);stroke-width:2.5"/>
      <path class="park" d="M276 172 C284 168 292 172 292 180 C292 188 284 192 278 188 Z"/>
      <path class="river" d="M216 -10 C228 20 246 48 259 66 C262 100 260 130 259 158 C259 170 259 176 259 179 C254 196 248 206 245 214 C246 232 248 244 248 254 C244 290 238 330 234 380"/>
      <path class="river s" d="M306 -10 C290 20 272 46 259 66"/>
      <path class="river" d="M0 104 C10 112 18 124 24 140 C28 160 26 190 30 220 C34 260 40 300 50 376"/>
      ${RD("M100 179 L281 179",0)}${RD("M100 158 L300 158",1)}${RD("M100 214 L300 214",1)}${RD("M80 66 L300 66",1)}${RD("M100 149 L259 149",1)}${RD("M100 284 L320 284",1)}
      ${RD("M214 10 L214 259",0)}${RD("M248 30 L248 230",1)}${RD("M184 20 L184 270",1)}${RD("M151 20 L151 270",1)}
      ${RL("M0 259 L360 259")}
      ${RL("M212 259 C190 236 160 206 120 184 C80 166 44 150 18 132")}
      ${RL("M212 259 C224 280 240 304 256 334 C262 350 266 366 270 376")}
      ${RL("M266 0 L266 376")}
      ${SUB("M214 20 L214 259")}${SUB("M140 150 L330 150")}
      ${WL(268,98,"fiume Kamo","start")}${WL(40,330,"Katsura","start")}${WL(223,94,"Gosho")}${WL(104,175,"Shijō-dōri","start")}${WL(218,32,"Karasuma","start")}${WL(350,72,"Higashiyama","end")}
      ${STN(266,179,"")}${STN(214,179,"")}
      ${DIST(140,230,"Shimogyō")}${DIST(96,88,"Kamigyō")}`,
    lm:[{n:"Stazione di Kyoto",x:212,y:259,lp:"b"}],
    hotels:[{n:"INA House Nijojo",x:150,y:112,lp:"r"}],
    det:[{n:"Mercato Nishiki",x:233,y:175,lp:"t"},{n:"Ponte di Shijō",x:259,y:181,lp:"l"},{n:"Kennin-ji",x:265,y:201,lp:"l"},{n:"Yasaka-jinja",x:283,y:180,lp:"r"},{n:"Shirakawa",x:267,y:169,lp:"t"},
         {n:"Tenryū-ji",x:30,y:120,lp:"r"},{n:"Togetsukyō",x:18,y:142,lp:"r"},{n:"Kitano Tenmangū",x:126,y:60,lp:"r"},{n:"Ryōan-ji",x:66,y:46,lp:"b"},
         {n:"Sannenzaka",x:292,y:212,lp:"l"},{n:"Kōdai-ji",x:291,y:194,lp:"l"},{n:"Sentiero del Filosofo",x:342,y:110,lp:"l"},{n:"Nanzen-ji",x:336,y:147,lp:"l"},{n:"Pontochō",x:255,y:160,lp:"l"}],
    edges:[{n:"Osaka",x:10,y:252,px:24,py:259,a:"M30 259 L6 259 M6 259 L14 253 M6 259 L14 265"}],
    zones:[
      {n:"Kinkaku-ji e Kitano",x:114,y:40,lp:"r",pl:["Kinkaku-ji","Kitano Tenmangu","Ryōan-ji"],d:[9]},
      {n:"Arashiyama",x:18,y:126,lp:"bs",pl:["Arashiyama"],d:[9]},
      {n:"Castello Nijō",x:166,y:134,lp:"b",pl:["Castello Nijo"],d:[8]},
      {n:"Nishiki e Pontochō",x:246,y:176,lp:"l",pl:["Mercato Nishiki","Pontocho"],d:[8,10]},
      {n:"Gion",x:276,y:182,lp:"b",pl:["Gion e Hanamikoji","Kennin-ji"],d:[8]},
      {n:"Kiyomizu-dera",x:306,y:220,lp:"b",pl:["Kiyomizu-dera","Kōdai-ji"],d:[10]},
      {n:"Ginkaku-ji",x:350,y:79,lp:"l",pl:["Ginkaku-ji","Sentiero del Filosofo","Nanzen-ji"],d:[10]},
      {n:"Fushimi Inari",x:262,y:340,lp:"l",pl:["Fushimi Inari"],d:[10]}
    ]},
  Osaka:{w:360,h:290, km:30.3, northLeft:true,
    base:`
      <path class="water" d="M0 0 L0 290 L150 290 C136 270 118 252 96 240 C76 230 58 222 44 212 C34 200 28 186 30 170 C32 150 26 130 22 110 C18 92 10 76 0 64 Z"/>
      <path class="river" d="M340 -6 C300 6 250 14 200 18 C150 22 100 36 60 54 C36 64 16 70 0 74"/>
      <path class="river s" d="M322 28 C306 50 290 72 276 94 C250 98 220 98 196 100 C170 104 146 110 120 122 C90 136 60 146 30 152"/>
      <path class="river s" d="M196 100 C198 140 200 190 196 240 C194 260 188 276 180 290"/>
      <path class="river s" d="M196 172 L272 170"/>
      <path class="park" d="M292 96 L326 96 L326 130 L292 130 Z"/>
      <path class="park" d="M256 238 L282 238 L282 262 L256 262 Z"/>
      ${RD("M238 50 L238 250",0)}${RD("M120 150 L340 150",1)}${RD("M150 210 L330 210",1)}
      ${LOOP("M224 59 C214 64 204 70 197 77 C188 84 180 88 172 94 C160 104 150 114 142 125 C136 140 130 156 127 172 C142 176 160 180 177 182 C198 200 218 222 238 236 C250 240 262 244 272 247 C290 230 306 206 318 185 C322 168 325 152 327 135 C328 116 329 96 329 77 C318 66 306 56 296 50 C286 50 276 50 269 50 C254 52 238 56 224 59 Z")}
      ${RL("M142 125 C118 140 90 158 70 170 C62 176 54 180 48 184")}
      ${RL("M224 59 C240 40 258 24 276 10 C284 4 290 0 296 -4")}
      ${RL("M235 182 C260 186 290 190 320 194 C334 196 346 196 360 196")}
      ${SUB("M224 59 L238 91 L238 151 L235 182 L272 247")}
      ${STN(142,125,"Nishikujō","l")}${STN(272,247,"Tennōji","b")}${STN(329,77,"Kyōbashi","l")}${STN(235,182,"")}${STN(238,151,"")}
      ${DIST(132,46,"Kita")}${DIST(176,240,"Minami")}${WL(30,250,"Baia di Osaka","start")}${WL(309,88,"Castello di Osaka")}`,
    lm:[{n:"Stazione di Osaka",x:224,y:59,lp:"t"}],
    hotels:[{n:"Morning Box",x:258,y:154,lp:"r"}],
    det:[{n:"Shinsaibashi-suji",x:238,y:154,lp:"b"},{n:"Mercato Kuromon",x:253,y:186,lp:"r"}],
    edges:[{n:"da Kyoto",x:318,y:24,an:"end",px:300,py:-2,a:"M322 30 L344 10 M344 10 L333 11 M344 10 L343 21"},
           {n:"verso Nara",x:350,y:186,an:"end",px:352,py:196,a:"M336 196 L356 196 M356 196 L348 190 M356 196 L348 202"}],
    zones:[
      {n:"Universal Studios",x:48,y:184,lp:"bs",pl:["Universal Studios Japan"],d:[11]},
      {n:"Namba e Dotonbori",x:240,y:178,lp:"l",pl:["Dotonbori","Nipponbashi","Round1 Stadium Sennichimae","Amerikamura","Mercato Kuromon"],d:[11]},
      {n:"Shitennō-ji",x:284,y:224,lp:"l",pl:["Shitennō-ji"],d:[]}
    ]},
  Nara:{w:360,h:250, km:90,
    base:`
      <path class="park" d="M150 26 C200 14 280 18 320 34 C344 46 352 100 346 140 C340 176 310 188 270 186 C230 184 190 180 168 168 C150 158 146 120 146 90 C146 60 140 34 150 26 Z"/>
      <path class="hill" d="M290 20 C310 12 336 18 346 40 C352 58 340 70 320 70 C300 70 286 58 286 42 Z"/>
      <path class="hill" d="M318 110 C334 104 352 110 360 120 L360 230 C346 222 330 200 322 176 C316 156 312 128 318 110 Z"/>
      <path class="water" d="M150 138 C156 134 166 136 166 144 C166 150 158 152 152 150 C146 148 146 142 150 138 Z"/>
      ${RD("M60 106 L280 108",0)}${RD("M60 139 L160 140",1)}${RD("M164 140 C200 140 260 138 300 136",1)}${RD("M228 60 L226 108",1)}
      ${RD("M120 160 L190 160 M120 176 L190 176 M120 192 L190 192 M136 150 L136 210 M156 150 L156 210 M176 150 L176 210",1)}
      ${RL("M60 0 L60 250")}
      ${SUB("M0 104 L133 106")}
      ${STN(60,139,"JR Nara","l")}
      ${WL(318,46,"Wakakusa")}${WL(156,162,"Sarusawa","end")}${WL(158,224,"Naramachi")}${WL(170,124,"Kōfuku-ji","end")}${WL(250,174,"Parco di Nara")}${WL(352,200,"foresta di Kasuga","end")}`,
    lm:[{n:"Stazione Kintetsu-Nara",x:133,y:106,lp:"t"}],
    det:[{n:"Nandaimon",x:228,y:92,lp:"l"},{n:"Nigatsu-dō",x:266,y:55,lp:"t"},{n:"Naramachi",x:151,y:182,lp:"r"}],
    hotels:[],
    edges:[{n:"Osaka · Kyoto",x:8,y:94,px:6,py:104,a:"M32 104 L6 104 M6 104 L14 98 M6 104 L14 110"},{n:"Mikasa Ryokan",x:326,y:100,an:"end",px:352,py:84,a:"M330 96 L352 84 M352 84 L341 84 M352 84 L348 94"}],
    zones:[
      {n:"Tōdai-ji",x:228,y:60,lp:"r",pl:["Tempio Tōdai-ji","Nigatsu-dō"],d:[12]},
      {n:"Parco dei cervi",x:196,y:114,lp:"b",pl:["Parco dei cervi di Nara","Naramachi"],d:[12]},
      {n:"Kasuga Taisha",x:300,y:136,lp:"b",pl:["Santuario Kasuga"],d:[12]}
    ]}
};

MAPS.Japan = {w:360,h:318, sea:true, bend:0.03, northAt:[344,296], scaleKm:100, km:0.5405,
  base:`
    <path class="land2" d="M-9.7 267.0 L5.8 271.2 L9.7 289.2 L-9.7 306.0 L-9.7 267.0 Z"/><path class="land2" d="M19.5 246.0 L25.3 247.2 L20.4 258.0 L15.6 268.8 L8.8 270.0 L12.2 258.0 Z"/><path class="land2" d="M182.4 52.8 L189.7 52.2 L197.0 45.0 L194.6 22.2 L184.9 30.0 L180.0 42.0 Z"/><path class="land2" d="M236.4 235.2 L240.3 235.2 L241.3 240.0 L237.4 241.2 Z"/>
    <path class="land2 coast" d="M-9.7 235.2 L9.7 235.8 L23.8 243.0 L34.1 241.2 L45.2 242.4 L42.3 254.4 L33.1 264.0 L31.6 288.0 L41.4 301.2 L61.8 316.2 L73.0 298.8 L82.7 277.8 L102.2 264.0 L115.8 253.8 L108.0 250.8 L98.3 238.8 L103.1 223.8 L114.3 219.0 L117.7 231.0 L119.2 241.2 L124.1 238.8 L122.6 246.0 L136.2 244.8 L157.1 242.4 L181.0 246.0 L185.8 232.8 L193.6 222.0 L200.4 214.8 L211.6 217.2 L206.8 231.0 L211.6 246.0 L218.0 241.2 L223.8 223.8 L226.2 207.0 L239.4 204.0 L245.7 203.4 L249.1 213.6 L254.0 207.0 L250.5 195.0 L256.9 186.0 L270.0 184.8 L260.3 199.2 L258.8 210.0 L261.7 228.0 L272.4 216.0 L287.0 204.0 L294.3 184.8 L309.4 178.2 L299.2 162.0 L296.8 141.0 L301.6 120.0 L315.3 102.0 L317.7 78.0 L313.8 54.0 L316.2 36.0 L318.7 27.0 L323.5 19.2 L333.3 22.2 L340.6 25.8 L343.0 15.0 L340.6 6.0 L345.4 -12.0 L262.7 -12.0 L248.1 3.0 L240.8 28.8 L231.1 40.8 L221.4 46.8 L209.2 57.0 L197.0 79.8 L182.4 91.8 L163.5 99.6 L145.9 111.0 L131.4 116.4 L120.7 110.4 L121.6 99.0 L131.4 90.0 L137.7 70.2 L121.6 72.0 L109.5 84.0 L110.9 108.0 L102.2 126.0 L94.9 138.0 L77.8 150.0 L75.4 180.0 L70.5 183.0 L60.8 192.0 L48.6 190.8 L42.8 193.2 L34.1 187.8 L29.2 177.0 L14.6 183.0 L-9.7 186.0 Z"/>
    <ellipse class="land2" cx="337" cy="26" rx="3" ry="2"/>
    <path class="hill" d="M141.1 108.0 L158.1 117.0 L165.4 150.0 L163.0 174.0 L153.2 177.0 L143.5 150.0 Z"/><path class="hill" d="M170.3 165.0 L182.4 177.0 L184.9 198.0 L176.1 204.0 L167.8 186.0 Z"/><path class="hill" d="M104.6 147.0 L114.3 150.0 L116.8 165.0 L107.0 165.0 Z"/>
    <path class="water" d="M80.3 190.8 L86.1 196.8 L83.7 205.2 L76.9 214.8 L69.1 222.6 L67.1 220.2 L70.5 213.0 L74.4 202.2 L73.0 195.0 Z"/>
    ${RL("M256.2 181.1 L226.2 206.4 L189.2 223.8 L157.1 240 L115.8 211.8 L87.1 203.4 L61.7 221.3 L48.6 240.6")}
    ${RL("M256.2 181.1 L261.7 128.4 L286.5 78 L310.4 26.4")}
    ${RL("M256.2 181.1 L218.9 142.8 L179.5 123 L104.6 127.2")}
    ${RL("M218.9 142.8 L221.4 46.8")}
    ${STN(310.4,26.4,"")}${STN(104.6,127.2,"Kanazawa","l")}${STN(221.4,46.8,"Niigata","r")}${STN(179.5,123,"Nagano","r")}
    <path class="fuji" d="M196 205 L205.8 192 L215.6 205 Z"/><path class="fujicap" d="M202.3 196.6 L205.8 192 L209.3 196.6 Z"/>
    ${WL(100,40,"Mar del Giappone")}${WL(230,292,"Oceano Pacifico")}${WL(150,168,"Alpi giapponesi")}
    ${DIST(278,64,"Tōhoku")}${DIST(282,150,"Kantō")}${DIST(62,282,"Kansai")}${DIST(150,212,"Chūbu")}`,
  lm:[{n:"Monte Fuji",x:205.8,y:200,lp:"b",tri:true}],
  hotels:[],
  wp:{"~Odawara":[226.2,206.4],"~Shizuoka":[189.2,223.8],"~Hamamatsu":[157.1,240],"~Maibara":[87.1,203.4]},
  edges:[{n:"da Milano",x:6,y:62,px:0,py:72,a:"M2 52 L22 72 M22 72 L11 70 M22 72 L20 61"}],
  zones:[
    {n:"Tokyo",go:"Tokyo",x:256.2,y:181.1,lp:"r",pl:[],d:[]},
    {n:"Kyoto",go:"Kyoto",x:61.7,y:221.3,lp:"t",pl:[],d:[]},
    {n:"Osaka",go:"Osaka",x:48.6,y:240.6,lp:"b",pl:[],d:[]},
    {n:"Nara",go:"Nara",x:64.7,y:241.2,lp:"r",pl:[],d:[]},
    {n:"Kamakura",x:245.7,y:202.8,lp:"b",pl:["Kamakura"],d:[],opt:[14]},
    {n:"Nagoya",x:115.8,y:211.8,lp:"r",pl:["Ghibli Park","Castello di Nagoya"],d:[]},
    {n:"Shirakawa-gō",x:117.2,y:146.4,lp:"r",pl:["Villaggio di Shirakawa"],d:[]},
    {n:"Isola dei gatti",x:336.7,y:24.6,lp:"l",pl:["Isola dei gatti"],d:[]}
  ]};
/* percorsi: giorno -> tappe in ordine (nomi di zone, stazioni o frecce); opt = da decidere */
const ROUTES = [
  {day:2, city:"Tokyo", s:["Haneda","Toshi Hotel","Shinjuku"], zs:["Haneda","»Toshi Hotel","»Shinjuku","Tochō","Shinjuku","Kabukichō"]},
  {day:3, city:"Tokyo", s:["Toshi Hotel","Asakusa","Skytree"], zs:["Toshi Hotel","»Kaminarimon","Asakusa","Kuramae","Sumida River Walk","Skytree"]},
  {day:4, city:"Tokyo", s:["Toshi Hotel","Harajuku","Shibuya"], zs:["Toshi Hotel","»Omotesandō","Harajuku","Takeshita-dōri","Cat Street","Miyashita Park","Shibuya","»Ebisu"]},
  {day:5, city:"Tokyo", s:["Toshi Hotel","DisneySea"], zs:["Toshi Hotel","»Stazione di Tokyo","»DisneySea"]},
  {day:6, city:"Tokyo", s:["Toshi Hotel","Palazzo Imperiale","Akihabara"], zs:["Toshi Hotel","Palazzo della Dieta","Nijūbashi","Palazzo Imperiale","Jimbōchō","Kanda Myōjin","Akihabara"]},
  {day:7, city:"Tokyo", s:["Toshi Hotel","Shinjuku","Monte Fuji"], zs:["Toshi Hotel","»Shinjuku","»Monte Fuji"]},
  {day:13,city:"Tokyo", s:["Stazione di Tokyo","Hotel Vintage","Tokyo Tower"], zs:["Stazione di Tokyo","Hotel Vintage","»teamLab Borderless","Tokyo Tower"]},
  {day:14,city:"Tokyo", s:["Hotel Vintage","Nakano","Shimokitazawa"], zs:["Hotel Vintage","»Nakano","»Shimokitazawa"], opt:true},
  {day:14,city:"Tokyo", s:["Hotel Vintage","Yūrakuchō"]},
  {day:14,city:"Tokyo", s:["Hotel Vintage","Kamakura (opz.)"], zs:["Hotel Vintage","»Kamakura (opz.)"], opt:true},
  {day:15,city:"Tokyo", s:["Hotel Vintage","Ueno e Yanaka","Haneda"], zs:["Hotel Vintage","Tsukiji","»Ueno e Yanaka","»Haneda"]},
  {day:8, city:"Kyoto", s:["Stazione di Kyoto","INA House Nijojo","Castello Nijō","Nishiki e Pontochō","Gion"], zs:["Stazione di Kyoto","»INA House Nijojo","Castello Nijō","»Mercato Nishiki","Ponte di Shijō","Kennin-ji","Yasaka-jinja","Shirakawa","Gion"]},
  {day:9, city:"Kyoto", s:["INA House Nijojo","Arashiyama","Kinkaku-ji e Kitano","Stazione di Kyoto"], zs:["INA House Nijojo","»Arashiyama","Tenryū-ji","Togetsukyō","»Kitano Tenmangū","Kinkaku-ji e Kitano","Ryōan-ji","»Stazione di Kyoto"]},
  {day:10,city:"Kyoto", s:["INA House Nijojo","Fushimi Inari","Kiyomizu-dera","Ginkaku-ji","Nishiki e Pontochō"], zs:["INA House Nijojo","»Fushimi Inari","»Kiyomizu-dera","Sannenzaka","Kōdai-ji","»Ginkaku-ji","Sentiero del Filosofo","Nanzen-ji","»Pontochō"]},
  {day:11,city:"Osaka", s:["da Kyoto","Stazione di Osaka","Morning Box","Universal Studios","Namba e Dotonbori"], zs:["da Kyoto","»Stazione di Osaka","»Morning Box","»Universal Studios","»Namba e Dotonbori","Shinsaibashi-suji","Morning Box"]},
  {day:12,city:"Osaka", s:["Morning Box","Mercato Kuromon","verso Nara"], zs:["Morning Box","Mercato Kuromon","Morning Box","»verso Nara"]},
  {day:13,city:"Nara",  s:["Mikasa Ryokan","Stazione Kintetsu-Nara","Osaka · Kyoto"], zs:["Mikasa Ryokan","»Stazione Kintetsu-Nara","»Osaka · Kyoto"]},
  {day:1, city:"Japan", s:["da Milano","Tokyo"], fly:true, card:true},
  {day:7, city:"Japan", s:["Tokyo","Monte Fuji"], card:true},
  {day:8, city:"Japan", s:["Tokyo","~Odawara","~Shizuoka","~Hamamatsu","Nagoya","~Maibara","Kyoto"], card:true},
  {day:11,city:"Japan", s:["Kyoto","Osaka"]},
  {day:12,city:"Japan", s:["Osaka","Nara"]},
  {day:13,city:"Japan", s:["Nara","Kyoto","~Maibara","Nagoya","~Hamamatsu","~Shizuoka","~Odawara","Tokyo"], card:true},
  {day:14,city:"Japan", s:["Tokyo","Kamakura"], opt:true},
  {day:16,city:"Japan", s:["Tokyo","da Milano"], fly:true, card:true},
  {day:12,city:"Nara",  s:["Osaka · Kyoto","Stazione Kintetsu-Nara","Parco dei cervi","Tōdai-ji","Kasuga Taisha","Mikasa Ryokan"], zs:["Osaka · Kyoto","»Stazione Kintetsu-Nara","Parco dei cervi","Nandaimon","Tōdai-ji","Nigatsu-dō","Kasuga Taisha","Naramachi","Stazione Kintetsu-Nara","»Mikasa Ryokan"]}
];
Object.entries(MAPS).forEach(([c,m]) => {
  m.pts = {};
  m.zones.forEach((z,i) => { z.id = c+i; z.city = c; z.opt = z.opt || []; m.pts[z.n] = {x:z.x,y:z.y,z}; });
  m.lm.forEach(l => m.pts[l.n] = {x:l.x,y:l.y,lm:l});
  (m.hotels||[]).forEach(h => m.pts[h.n] = {x:h.x,y:h.y,hotel:h});
  (m.det||[]).forEach(q => m.pts[q.n] = {x:q.x,y:q.y,det:q});
  Object.entries(m.wp||{}).forEach(([k,v]) => m.pts[k] = {x:v[0],y:v[1],wp:true});
  m.edges.forEach(g => m.pts[g.n] = {x:g.px,y:g.py,edge:g});
});
MAPS.Japan.zones.forEach(z => { if (z.go) { z.d = DAYS.map((d,i)=>d.city===z.go?i+1:0).filter(Boolean); z.col = CITIES[z.go].c; } });
const zoneById = id => { for (const m of Object.values(MAPS)) { const z = m.zones.find(z => z.id===id); if (z) return z; } return null; };
const dayLabel = n => { const dt = parse(DAYS[n-1].date); return `${GG[dt.getDay()].slice(0,3)} ${dt.getDate()}/3`; };
const cityDays = c => [...new Set(ROUTES.filter(r=>r.city===c).map(r=>r.day))].sort((a,b)=>a-b);

function curve(pts, bend=0.18){
  if (pts.length < 2) return "";
  let d = `M${pts[0].x} ${pts[0].y}`;
  for (let k=1; k<pts.length; k++){
    const a = pts[k-1], b = pts[k], dx = b.x-a.x, dy = b.y-a.y, sgn = k%2 ? 1 : -1;
    const cx = (a.x+b.x)/2 - dy*bend*sgn, cy = (a.y+b.y)/2 + dx*bend*sgn;
    d += ` Q${cx.toFixed(1)} ${cy.toFixed(1)} ${b.x} ${b.y}`;
  }
  return d;
}
/* disegna la mappa: mode "day" (un giorno in evidenza) o "all" (tutti i percorsi, giorno opzionale in evidenza) */
function mapSVG(city, {day=null, sel=null, mode="all", animate=false, hotel=null, hide=null, nofocus=false, clean=false} = {}){
  const m = MAPS[city], col = (CITIES[city]||{}).c || "var(--alert)", B = m.bend ?? 0.18;
  const routes = hotel ? [] : ROUTES.filter(r => r.city===city);
  const dayR = routes.filter(r => r.day===day), focus = nofocus ? [] : dayR;
  const onRoute = new Set(routes.flatMap(r => r.opt ? [] : r.s));
  const onOpt = new Set(routes.flatMap(r => r.opt ? r.s : []));
  const onFocus = new Set(dayR.flatMap(r => r.s));
  const P = r => r.s.map(n => m.pts[n]).filter(Boolean);
  const back = routes.filter(r => !focus.includes(r)).map(r =>
    `<path class="rt ${day?"faint":"all"}${r.opt?" opt":""}${r.fly?" fly":""}" d="${curve(P(r),B)}"/>`).join("");
  const front = focus.map(r => { const d = curve(P(r),B), plain = r.opt || r.fly; return d ?
    `<path class="rt case" d="${d}"/><path class="rt focus${r.opt?" opt":""}${r.fly?" fly":""}${animate&&!plain?" draw":""}"${plain?"":` pathLength="1"`} d="${d}"/>` : ""; }).join("");
  const lbl = (n,lp) => {
    const o = {r:[13,4,"start"], l:[-13,4,"end"], t:[0,-14,"middle"], b:[0,24,"middle"], bs:[-8,24,"start"]}[lp||"r"];
    return `<text class="n" x="${o[0]}" y="${o[1]}" text-anchor="${o[2]}">${esc(n)}</text>`;
  };
  const stops = m.zones.map(z => {
    if (hide && hide.has(z.n)) return "";
    const route = onRoute.has(z.n), opt = !route && onOpt.has(z.n), hot = onFocus.has(z.n);
    const all = z.pl.length && z.pl.every(n => { const p = PLACES.find(p=>p.name===n); return p && done.has(p.id); });
    const cls = ["st", z.go?"city":"", (route||z.go||hotel)?"route":opt?"opt":"off", hot?"hot":"", sel===z.id?"sel":"", ((day && !hot && !z.go) || hotel)?"dim":""].join(" ");
    const days = [...z.d, ...z.opt];
    return `<g class="${cls}" transform="translate(${z.x} ${z.y})"${z.col?` style="--c:${z.col}"`:""} data-z="${z.id}"${z.go?` data-go="${z.go}"`:""} tabindex="0" role="button" aria-label="${esc(z.n)}${days.length?", giorno "+days.join(" e "):", non in programma"}">
      <circle class="ring" r="13"/><circle class="m" r="${hot?8:6.5}"/>${all?`<circle class="chk" cx="8" cy="-8" r="5"/>`:""}${lbl(z.n,z.lp)}</g>`;
  }).join("");
  const lpos = (x,y,lp,dx) => ({r:`x="${x+dx}" y="${y+4}"`, l:`x="${x-dx}" y="${y+4}" text-anchor="end"`, t:`x="${x}" y="${y-dx}" text-anchor="middle"`, b:`x="${x}" y="${y+dx+10}" text-anchor="middle"`})[lp||"b"];
  const lms = m.lm.map(l => l.tri ? `<g class="lm tri${onFocus.has(l.n)?" on":""}"><text ${lpos(l.x,l.y,l.lp,6)}>${esc(l.n)}</text></g>` : `<g class="lm"><rect x="${l.x-6}" y="${l.y-6}" width="12" height="12" rx="3"/><text ${lpos(l.x,l.y,l.lp,11)}>${esc(l.n)}</text></g>`).join("");
  const hots = (m.hotels||[]).map(h => `<g class="ht${onFocus.has(h.n)||hotel===h.n?" hot":""}${hotel && hotel!==h.n?" dim":""}">${hotel===h.n?`<circle class="hring" cx="${h.x}" cy="${h.y}" r="17"/>`:""}<rect x="${h.x-8}" y="${h.y-8}" width="16" height="16" rx="4"/><text class="hh" x="${h.x}" y="${h.y+4}">H</text><text class="hn" ${lpos(h.x,h.y,h.lp,13)}>${esc(h.n)}</text></g>`).join("");
  const scale = m.km ? (() => { const kmL = m.scaleKm || (m.km >= 60 ? 0.5 : 1), L = m.km*kmL, y = m.h-10;
    return `<g class="scale"><path d="M10 ${y} L${10+L} ${y} M10 ${y-4} L10 ${y} M${10+L} ${y-4} L${10+L} ${y}"/><text x="${10+L+5}" y="${y+3.5}">${kmL>=1?kmL+" km":"500 m"}</text></g>`; })() : "";
  const north = `<g class="north" transform="translate(${m.northAt?m.northAt.join(" "):(m.northLeft?16:m.w-16)+" 16"})"><path d="M0 -10 L5 4 L0 1 L-5 4 Z"/><text y="16" text-anchor="middle">N</text></g>`;
  const edges = m.edges.map(g => `<g class="edge${onFocus.has(g.n)||hotel===g.n?" on":""}"><path d="${g.a}"/><text x="${g.x}" y="${g.y}" text-anchor="${g.an||"start"}">${esc(g.n)}</text></g>`).join("");
  const badges = focus.filter(r=>!r.opt).slice(0,1).map(r => { const p = r.s.map(n => m.pts[n]).find(q => q && !q.edge); if (!p) return "";
    const bx = Math.min(Math.max(p.x-24, 2), m.w-26), by = Math.max(p.y-30, 2);
    return `<g class="dnum"><rect x="${bx}" y="${by}" width="24" height="18" rx="5"/><text x="${bx+12}" y="${by+13}">${String(r.day).padStart(2,"0")}</text></g>`; }).join("");
  return `<svg${clean?` class="clean"`:""} viewBox="0 0 ${m.w} ${m.h}" style="--c:${col};--cf:${fillOf(col)}" role="group" aria-label="Mappa stilizzata di ${city==="Japan"?"Giappone":esc(city)}${day?", percorso del giorno "+day:""}"><rect class="${m.sea?"water":"land"}" width="${m.w}" height="${m.h}"/>${m.base}${back}${front}${lms}${hots}${edges}${stops}${badges}${scale}${north}</svg>`;
}

/* mappa "zoom" del giorno: inquadra solo il percorso, con tappe di dettaglio */
function mapZoomSVG(city, day, animate){
  const m = MAPS[city], col = CITIES[city].c, AR = 1.25;
  const routes = ROUTES.filter(r => r.city===city), focus = routes.filter(r => r.day===day);
  const seqs = focus.map(r => ({r, s:(r.zs || r.s).map(n => ({ride: n.startsWith("»"), n: n.replace(/^»/,"")})).filter(o => m.pts[o.n])}));
  /* si inquadrano le tappe raggiunte a piedi; i tratti in treno possono uscire dal riquadro */
  const pts = seqs.flatMap(q => {
    const walkAny = q.s.some((o,i) => i>0 && !o.ride);
    return q.s.filter((o,i) => { const p = m.pts[o.n]; return !walkAny || (i>0 && !o.ride) || (i<q.s.length-1 && !q.s[i+1].ride) || p.z || p.det; }).map(o => m.pts[o.n]).filter(p => !p.edge);
  });
  if (pts.length < 2) return mapSVG(city, {day, mode:"day", animate});
  const xs = pts.map(p=>p.x), ys = pts.map(p=>p.y);
  let x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  let w = Math.max(x1-x0, 46), h = Math.max(y1-y0, 36);
  w += 2*Math.max(22, w*.16); h += 2*Math.max(20, h*.2);
  if (w/h > AR) h = w/AR; else w = h*AR;
  if (w < 72) { w = 72; h = w/AR; }
  if (w > m.w) { w = m.w; h = w/AR; }
  let vx = (x0+x1)/2 - w/2, vy = (y0+y1)/2 - h/2;
  vx = Math.min(Math.max(vx, 0), m.w - w); vy = Math.min(Math.max(vy, 0), Math.max(0, m.h - h));
  const k = m.w / w, S = `scale(${(1/k).toFixed(4)})`;
  const names = new Set(seqs.flatMap(q => q.s.map(o => o.n)));
  const back = routes.filter(r => !focus.includes(r)).map(r => `<path class="rt faint${r.opt?" opt":""}" d="${curve(r.s.map(n=>m.pts[n]).filter(Boolean), .18)}"/>`).join("");
  let seg = 0;
  const front = seqs.map(({r, s}) => s.slice(1).map((o, i) => {
    const a = m.pts[s[i].n], b = m.pts[o.n], d = curve([a, b], .14), delay = (seg++ * 0.22).toFixed(2);
    if (o.ride) return `<path class="rt focus ride${r.opt?" opt":""}" d="${d}" style="animation-delay:${delay}s"/>`;
    return `<g class="zseg" style="animation-delay:${delay}s"><path class="rt case" d="${d}"/><path class="rt focus${r.opt?" opt":""}" d="${d}"/></g>`;
  }).join("")).join("");
  const flip = (x, lp, n="", alt="t") => { const lw = (n.length*6.6 + 14)/k;
    return ((lp==="r" && x + lw > vx + w) || (lp==="l" && x - lw < vx)) ? alt : lp; };
  const lab = (n, lp, dx=13) => { const o = {r:[dx,4,"start"], l:[-dx,4,"end"], t:[0,-dx-1,"middle"], b:[0,dx+11,"middle"], bs:[-8,dx+11,"start"]}[lp||"r"];
    return `<text class="n" x="${o[0]}" y="${o[1]}" text-anchor="${o[2]}">${esc(n)}</text>`; };
  const fpts = seqs.flatMap(q => q.s.map(o => m.pts[o.n]));
  const near = z => fpts.some(p => Math.hypot(p.x - z.x, p.y - z.y) < 34/k);
  const inView = p => p.x >= vx-10 && p.x <= vx+w+10 && p.y >= vy-10 && p.y <= vy+h+10;
  const zones = m.zones.filter(inView).map(z => { const hot = names.has(z.n);
    return `<g class="st ${hot?"route hot":"off dim"}" transform="translate(${z.x} ${z.y}) ${S}" data-z="${z.id}" tabindex="0" role="button" aria-label="${esc(z.n)}"><circle class="ring" r="13"/><circle class="m" r="${hot?8:6}"/>${(hot || !near(z)) ? lab(z.n, flip(z.x, z.lp, z.n)) : ""}</g>`; }).join("");
  const dets = (m.det||[]).filter(inView).filter(q => names.has(q.n)).map(q =>
    `<g class="dt hot" transform="translate(${q.x} ${q.y}) ${S}"><circle r="5"/>${lab(q.n, flip(q.x, q.lp, q.n), 10)}</g>`).join("");
  const hots = (m.hotels||[]).filter(inView).map(hh => `<g class="ht${names.has(hh.n)?" hot":" dim"}" transform="translate(${hh.x} ${hh.y}) ${S}"><rect x="-8" y="-8" width="16" height="16" rx="4"/><text class="hh" x="0" y="4">H</text>${lab(hh.n, flip(hh.x, hh.lp, hh.n, "b")).replace('class="n"','class="hn"')}</g>`).join("");
  const lms = m.lm.filter(inView).map(l => `<g class="lm" transform="translate(${l.x} ${l.y}) ${S}"><rect x="-6" y="-6" width="12" height="12" rx="3"/>${lab(l.n, flip(l.x, l.lp||"b", l.n), 11).replace('class="n" ','')}</g>`).join("");
  const edges = m.edges.map(g => `<g class="edge${names.has(g.n)?" on":""}"><path d="${g.a}"/><text x="${g.x}" y="${g.y}" text-anchor="${g.an||"start"}">${esc(g.n)}</text></g>`).join("");
  const first = seqs.filter(q=>!q.r.opt).map(q => q.s.map(o=>m.pts[o.n]).find(p => !p.edge && inView(p)))[0];
  const badge = first ? `<g class="dnum" transform="translate(${first.x} ${first.y}) ${S}"><rect x="-26" y="-30" width="24" height="18" rx="5"/><text x="-14" y="-17">${String(day).padStart(2,"0")}</text></g>` : "";
  const opts = [0.1,0.2,0.25,0.5,1,2]; let kmL = 0.1; opts.forEach(c => { if (m.km*c*k <= 85) kmL = c; });
  const L = m.km*kmL, bx = vx + 10/k, by = vy + h - 10/k;
  const scale = `<g class="scale"><path d="M${bx} ${by} L${bx+L} ${by} M${bx} ${by-4/k} L${bx} ${by} M${bx+L} ${by-4/k} L${bx+L} ${by}"/><g transform="translate(${bx+L+5/k} ${by+3.5/k}) ${S}"><text>${kmL>=1?kmL+" km":Math.round(kmL*1000)+" m"}</text></g></g>`;
  const north = `<g class="north" transform="translate(${vx+w-16/k} ${vy+16/k}) ${S}"><path d="M0 -10 L5 4 L0 1 L-5 4 Z"/><text y="16" text-anchor="middle">N</text></g>`;
  return `<svg class="zoomed" data-k="${k.toFixed(4)}" viewBox="${vx.toFixed(1)} ${vy.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}" style="--c:${col};--cf:${fillOf(col)};--k:${k.toFixed(3)}" role="group" aria-label="Mappa del percorso del giorno ${day}">
    <rect class="land" x="-50" y="-50" width="${m.w+100}" height="${m.h+100}"/>${m.base}${back}${front}${lms}${hots}${edges}${zones}${dets}${badge}${scale}${north}</svg>`;
}
/* dopo l'inserimento: testi e stazioni della base tornano a dimensione normale */
function fixZoom(root){
  root.querySelectorAll("svg.zoomed").forEach(svg => {
    const k = +svg.dataset.k;
    svg.querySelectorAll("text").forEach(tx => {
      if (tx.closest('g[transform*="scale"]')) return;
      const cs = getComputedStyle(tx);
      tx.style.fontSize = (parseFloat(cs.fontSize)/k) + "px";
      const sw = parseFloat(cs.strokeWidth); if (sw) tx.style.strokeWidth = (sw/k) + "px";
    });
    svg.querySelectorAll(".stn rect").forEach(r => {
      const x = +r.getAttribute("x") + 3.5, y = +r.getAttribute("y") + 3.5;
      r.setAttribute("transform", `translate(${x} ${y}) scale(${1/k}) translate(${-x} ${-y})`);
    });
  });
}

const mapKey = () => (state.city==="Tutte" || state.city==="Altre") ? "Japan" : state.city;
function renderMap(){
  const key = mapKey(), m = MAPS[key], card = $("#mapcard");
  if (!m) { card.hidden = true; return; }
  card.hidden = false;
  const col = (CITIES[key]||{}).c || "var(--alert)";
  const fd = state.focusDay;
  const hide = new Set(), live = n => PLACES.find(p => p.name === n);
  m.zones.forEach(z => { const ps = z.pl.map(live).filter(Boolean); if (ps.length && ps.every(p => off.has(p.id))) hide.add(z.n); });
  const dayOff = fd ? PLACES.some(p => p.day === fd && off.has(p.id)) : false;
  $("#map").innerHTML = mapSVG(key, {day: fd, sel: state.zone, mode: "all", animate: state._anim, hide, nofocus: dayOff, clean: true});
  state._anim = false;
  const dp = $("#daypick"); dp.style.setProperty("--c", col); dp.style.setProperty("--cf", fillOf(col));
  dp.innerHTML = `<button data-d="" aria-pressed="${!fd}">Tutti</button>` + cityDays(key).map(n =>
    `<button data-d="${n}" aria-pressed="${fd===n}">${String(n).padStart(2,"0")} · ${dayLabel(n)}</button>`).join("");
  $("#maplegend").style.setProperty("--c", col);
  $("#maplegend").innerHTML = key==="Japan" ? `<span><i></i>percorso</span><span><i class="o"></i>da decidere</span><span><i class="x"></i>fuori programma</span><span>tocca una città per aprirne la mappa</span>` : `<span><i></i>percorso</span><span><i class="o"></i>da decidere</span><span><i class="x"></i>non previsto</span>`;
  const zi = $("#zinfo");
  if (state.zone) {
    const z = zoneById(state.zone);
    const inZone = PLACES.filter(p => z.pl.includes(p.name));
    const dd = z.d.map(n=>`<button class="btn" data-day="${n}">Giorno ${n}, ${dayLabel(n)}</button>`).join("")
             + z.opt.map(n=>`<button class="btn" data-day="${n}">Giorno ${n} (da decidere)</button>`).join("");
    zi.innerHTML = `<h3>${esc(z.n)}</h3><p>${z.d.length||z.opt.length ? "" : "Non è nel programma. "}${inZone.length} luoghi</p>
      <div class="zbtns">${dd}<button class="btn" id="zall">${key==="Japan"?"Mostra tutto":"Tutta "+esc(state.city)}</button></div>`;
  } else if (fd) {
    const d = DAYS[fd-1];
    zi.innerHTML = `<p>Giorno ${fd}, ${dayLabel(fd)}: ${esc(d.title)}.${dayOff ? " Il percorso è nascosto perché alcuni luoghi della giornata non sono selezionati." : ""}</p><div class="zbtns"><button class="btn" data-day="${fd}">Apri il giorno ${fd}</button></div>`;
  } else {
    zi.innerHTML = `<p>Scegli un giorno per vederne il percorso e i luoghi, oppure tocca una fermata.</p>`;
  }
}
function pickZone(id){
  state.zone = state.zone===id ? null : id;
  renderMap(); renderPlaces();
}
function goCity(c){ state.city = c; state.zone = null; state.focusDay = null; store.set("city", c); renderChips(); renderMap(); renderPlaces(); setBackdrop(c); SC().scrollTo(0,0); }
$("#map").addEventListener("click", e => { const g = e.target.closest(".st"); if (!g) return; g.dataset.go ? goCity(g.dataset.go) : pickZone(g.dataset.z); });
$("#map").addEventListener("keydown", e => { const g = e.target.closest(".st"); if (g && (e.key==="Enter"||e.key===" ")) { e.preventDefault(); g.dataset.go ? goCity(g.dataset.go) : pickZone(g.dataset.z); } });
$("#daypick").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; state.focusDay = b.dataset.d ? +b.dataset.d : null; state.zone = null; state._anim = true;
  const keep = SC().scrollTop; renderMap(); renderPlaces(); SC().scrollTop = keep; if (DESK()) $("#plist").scrollTop = 0; });
$("#zinfo").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  if (b.id==="zall") { state.zone=null; state.focusDay=null; renderMap(); renderPlaces(); return; }
  if (b.dataset.day) { cur = +b.dataset.day - 1; location.hash = "giorni"; }
});

/* ====== soldi ====== */
function renderMoney(){
  const tot = BUDGET.reduce((s,b)=>s+b.t,0), paid = BUDGET.filter(b=>b.s==="Saldato").reduce((s,b)=>s+b.t,0);
  $("#perHead").textContent = eur(tot/PEOPLE);
  $("#left").textContent = eur((tot-paid)/PEOPLE);
  $("#paidbar").style.width = (paid/tot*100).toFixed(1)+"%";
  $("#perHead").insertAdjacentHTML("afterend", document.querySelector(".big small.sub") ? "" : `<small class="sub">di cui già saldati ${eur(paid/PEOPLE)}</small>`);
  const sorted = [...BUDGET].sort((a,b)=>(a.s==="Saldato")-(b.s==="Saldato"));
  $("#btable").innerHTML = sorted.map(b=>{ const isPaid = b.s==="Saldato";
    return `<tr class="${isPaid?"paid":""}"><td>${esc(b.v)}<br><span class="pill ${b.s.split(" ")[0]}">${b.s}</span></td><td class="num">${eur(b.t)}</td><td class="num">${eur(b.t/PEOPLE)}</td><td class="num due">${isPaid?"saldato":eur(b.t/PEOPLE)}</td></tr>`; }).join("")
    + `<tr><th>Totale</th><th class="num">${eur(tot)}</th><th class="num">${eur(tot/PEOPLE)}</th><th class="num due">${eur((tot-paid)/PEOPLE)}</th></tr>`;
}
let rate = store.get("rate", DEFAULT_RATE);
const num = s => parseFloat(String(s).replace(/\./g,"").replace(",", ".")) || 0;
const fmtN = (n,d) => n.toLocaleString("it-IT",{maximumFractionDigits:d,useGrouping:"always"});
$("#rate").value = rate;
function fromYen(){ $("#eur").value = fmtN(num($("#yen").value)/rate, 2); }
function fromEur(){ $("#yen").value = fmtN(num($("#eur").value)*rate, 0); }
$("#yen").addEventListener("input", fromYen);
$("#eur").addEventListener("input", fromEur);
$("#rate").addEventListener("input", e => { const r = num(e.target.value); if (r>0){ rate=r; store.set("rate", r); fromYen(); } });
$("#quick").innerHTML = [500,1000,3000,5000,10000].map(v=>`<button data-y="${v}">¥${fmtN(v,0)}</button>`).join("");
$("#quick").addEventListener("click", e => { const b=e.target.closest("button"); if(!b) return; $("#yen").value = fmtN(+b.dataset.y,0); fromYen(); });
fromYen();

/* ====== info ====== */
$("#phr").innerHTML = PHRASES.map(p=>`<div>${esc(p[0])}</div><div>${esc(p[1])}</div>`).join("");

$("#theme").onclick = () => {
  const r = document.documentElement, darkNow = r.dataset.theme ? r.dataset.theme==="dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  r.dataset.theme = darkNow ? "light" : "dark"; store.set("theme", r.dataset.theme);
};
const th = store.get("theme", null); if (th) document.documentElement.dataset.theme = th;

/* ====== sfondo: panorama della città e motivi tradizionali ====== */
const SKY = (() => {
  const G = "M0 176 H720";
  const pagoda = (cx, base, n, w0, step, tier) => { let d = "", prev = base;
    for (let k = 0; k < n; k++) { const y = base - 14 - tier*k, w = w0 - step*k, b = Math.max(6, w*0.42);
      d += `M${cx-b} ${prev} V${y} M${cx+b} ${prev} V${y} M${cx-w} ${y} Q${cx-w*0.55} ${y-2} ${cx} ${y-9} Q${cx+w*0.55} ${y-2} ${cx+w} ${y} `; prev = y-7; }
    const top = base - 14 - tier*(n-1) - 9; d += `M${cx} ${top} V${top-40} `;
    for (let r = 0; r < 5; r++) d += `M${cx-6+r} ${top-6-6*r} H${cx+6-r} `;
    return d; };
  const castle = (cx) => { let d = `M${cx-60} 176 L${cx-48} 140 H${cx+48} L${cx+60} 176 `; const roofs = [138,118,100,84,70], ws = [56,48,40,32,24];
    roofs.forEach((y,k) => { const w = ws[k]; d += `M${cx-w} ${y} Q${cx-w+8} ${y-4} ${cx-w+12} ${y-6} H${cx+w-12} Q${cx+w-8} ${y-4} ${cx+w} ${y} `;
      const yl = k ? roofs[k-1]-6 : 140; d += `M${cx-w+14} ${yl} V${y-6} M${cx+w-14} ${yl} V${y-6} `; });
    return d + `M${cx-24} 64 Q${cx} 46 ${cx+24} 64 M${cx-22} 60 l-4 -6 M${cx+22} 60 l4 -6`; };
  const lantern = (x) => `M${x-12} 176 H${x+12} M${x-8} 176 V170 H${x+8} V176 M${x-4} 170 V140 M${x+4} 170 V140 M${x-10} 140 H${x+10} V122 H${x-10} Z M${x-4} 136 H${x+4} V126 H${x-4} Z M${x-16} 122 Q${x} 108 ${x+16} 122 M${x} 112 V104 M${x-3} 104 H${x+3}`;
  const spires = () => { let d = ""; const gy = x => x < 360 ? 110 - (x-260)*0.4 : 70 + (x-360)*0.4;
    [262,300,334,386,420,458].forEach(x => { const b = gy(x); d += `M${x-3} ${b} V${b-26} L${x} ${b-38} L${x+3} ${b-26} V${b} `; }); return d; };
  return {
    Tokyo: `${G} M40 176 V120 H62 V176 M70 176 V96 H96 V176 M110 176 V70 H124 V58 H132 V70 H150 V58 H158 V70 H172 V176 M110 100 H172 M186 176 V100 C186 70 214 70 214 100 V176 M192 150 C196 122 204 122 208 150 M222 176 V110 H246 V176 M252 176 V140 H272 V176
      M392 176 L412 96 L415 70 L418 52 M448 176 L428 96 L425 70 L422 52 M418 52 L420 40 L422 52 M420 40 V22 M406 108 H434 M411 92 H429 V100 H411 Z M415 66 H425 V72 H415 Z M398 150 H442 M400 150 L420 128 L440 150 M404 128 H436 M406 128 L420 112 L434 128
      M563 176 C568 130 572 90 575 66 M597 176 C592 130 588 90 585 66 M569 66 H591 V56 H569 Z M575 56 L576 40 M585 56 L584 40 M572 40 H588 V33 H572 Z M578 33 L579 14 M582 33 L581 14 M580 14 V2 M566 150 L594 120 M594 150 L566 120
      M620 176 V156 L634 146 L648 156 V176 M656 176 V150 H690 V176 M696 176 V160 H720`,
    Kyoto: `${G} M0 120 C80 96 150 104 220 112 C300 120 360 86 450 92 C540 98 600 80 720 96 M156 176 V96 M204 176 V96 M138 92 C160 84 200 84 222 92 M142 98 H218 M150 116 H210 M180 98 V116
      M282 176 V150 H378 V176 M270 150 Q300 148 330 122 Q360 148 390 150 ${pagoda(540,176,5,46,4,22)} M600 176 V158 L620 150 L640 158 V176 M650 176 V160 L668 152 L686 160 V176 M690 176 V164 H720`,
    Osaka: `${G} M0 166 H120 M20 166 Q70 136 120 166 M222 176 L230 120 M258 176 L250 120 M230 120 V60 H250 V120 M226 64 H254 V52 H226 Z M234 52 V40 H246 V52 M240 40 V14 M226 150 Q240 136 254 150
      M290 176 V128 H318 V176 M326 176 V110 H350 V176 ${castle(500)} M600 176 V150 H640 V176 M650 176 V136 H676 V176 M684 176 V156 H720`,
    Nara: `${G} M0 118 C120 100 240 116 360 104 C480 92 600 108 720 96 M120 140 C120 128 168 128 176 136 C182 142 178 150 170 150 L126 150 C120 150 118 146 120 140 Z M168 134 L180 108 M176 104 L190 104 L186 112 L180 112 M180 104 L176 98 M182 102 L184 88 L178 80 M184 88 L190 82 M186 100 L194 90 L192 82 M194 90 L200 86 M128 150 V176 M136 150 V176 M164 150 V176 M172 150 V176 M120 138 L114 134
      ${lantern(320)} M390 176 V146 H570 V176 M420 176 V146 M450 176 V146 M480 176 V156 M510 176 V146 M540 176 V146 M376 146 Q400 140 410 124 H550 Q560 140 584 146 M410 124 Q440 112 450 100 H510 Q520 112 550 124 M450 100 Q446 90 452 88 M510 100 Q514 90 508 88 M466 146 Q480 136 494 146 ${lantern(640)}`,
    Fuji: `${G} M150 176 C260 120 320 60 350 40 H390 C420 60 480 120 600 176 M330 56 L344 66 L356 58 L368 70 L380 60 L392 68 L404 58 ${pagoda(110,176,5,30,3,16)} M520 74 Q540 62 560 72 Q580 64 604 74 <circle cx="620" cy="46" r="16"/>`,
    Milano: `${G} M260 176 V110 L360 70 L460 110 V176 M330 176 V140 Q360 124 390 140 V176 M286 176 V150 Q298 142 310 150 V176 M410 176 V150 Q422 142 434 150 V176 M360 70 V16 M356 16 L360 6 L364 16 ${spires()} M0 176 V140 H120 V176 M130 176 V150 H200 V176 M600 176 V136 H720`
  };
})();
/* su desktop il panorama si allarga: la città resta intera al centro, ai lati colline, case e alberi */
const SKYW = () => { const el = document.getElementById("sky"); if (!el || !DESK()) return null; const w = el.clientWidth, h = el.clientHeight; return w && h ? Math.max(720, 180*w/h) : null; };
function skyFiller(k, x0, x1){
  let seed = [...k].reduce((a,c) => a + c.charCodeAt(0), 7); const rnd = () => (seed = (seed*9301 + 49297) % 233280)/233280;
  const town = ["Kyoto","Nara","Fuji"].includes(k); let d = `M${x0} 176 H${x1} `;
  const span = (a, b) => { let x = a;
    d += `M${a} ${150 + rnd()*10} C${a + (b-a)*.3} ${120 + rnd()*20} ${a + (b-a)*.6} ${140 + rnd()*15} ${b} ${132 + rnd()*20} `;
    while (x < b - 20) { const w = 18 + rnd()*30, h = town ? 12 + rnd()*16 : 20 + rnd()*55, r = rnd();
      if (town && r < .45) d += `M${x} 176 V${176-h} L${x + w/2} ${176-h-10} L${x + w} ${176-h} V176 `;
      else if (r < .65) { const c = x + w/2; d += `M${c} 176 V${170 - h*.3} M${c} ${158 - h*.3} m-7 0 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0 `; }
      else d += `M${x} 176 V${176-h} H${x + w} V176 `;
      x += w + 6 + rnd()*24; } };
  span(x0 + 10, -6); span(726, x1 - 10); return d;
}
const skySVG = k => { const s = SKY[k]; if (!s) return ""; const [p, extra=""] = s.split(/(?=<circle)/), W = SKYW();
  if (!W) return `<svg viewBox="0 0 720 180" preserveAspectRatio="xMidYMax slice"><path d="${p.replace(/\s+/g," ").trim()}"/>${extra}</svg>`;
  const x0 = (720 - W)/2;
  return `<svg viewBox="${x0.toFixed(1)} 0 ${W.toFixed(1)} 180" preserveAspectRatio="xMidYMax meet"><path d="${p.replace(/\s+/g," ").trim()} ${skyFiller(k, x0, x0 + W)}"/>${extra}</svg>`; };
const PAT = (() => {
  const svg = (w, h, d) => ({w, h, url: `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><path d="${d}" fill="none" stroke="#808080" stroke-width="1"/></svg>`)}")`});
  // seigaiha (onde)
  let s = ""; [[20,20],[0,10],[40,10]].forEach(([cx,cy]) => [18,13,8,3].forEach(r => { s += `M${cx-r} ${cy} A${r} ${r} 0 0 1 ${cx+r} ${cy} `; }));
  // asanoha (foglia di canapa) su griglia triangolare
  const S = 28, H = S*Math.sqrt(3)/2; let a = "";
  for (let j = -1; j < 3; j++) for (let i = -1; i < 3; i++) { const off = (j%2+2)%2 ? S/2 : 0, x = i*S + off, y = j*H;
    const tris = [[[x,y],[x+S,y],[x+S/2,y+H]], [[x+S/2,y+H],[x+S*1.5,y+H],[x+S,y]]];
    tris.forEach(T => { const gx = (T[0][0]+T[1][0]+T[2][0])/3, gy = (T[0][1]+T[1][1]+T[2][1])/3;
      a += `M${T[0][0]} ${T[0][1]} L${T[1][0]} ${T[1][1]} L${T[2][0]} ${T[2][1]} Z `; T.forEach(v => { a += `M${v[0]} ${v[1]} L${gx.toFixed(2)} ${gy.toFixed(2)} `; }); }); }
  // kikkō (esagoni)
  const R = 11, HX = Math.sqrt(3)*R; let k = "";
  for (let i = -1; i < 4; i++) for (let j = -1; j < 3; j++) { const cx = i*1.5*R, cy = j*HX + ((i%2+2)%2 ? HX/2 : 0);
    k += "M" + [0,1,2,3,4,5,0].map(n => { const t = Math.PI/3*n; return `${(cx+R*Math.cos(t)).toFixed(2)} ${(cy+R*Math.sin(t)).toFixed(2)}`; }).join(" L") + " "; }
  // shippō (cerchi intrecciati)
  const c = (x,y,r) => `M${x-r} ${y} A${r} ${r} 0 1 0 ${x+r} ${y} A${r} ${r} 0 1 0 ${x-r} ${y} `;
  const sh = c(0,0,12)+c(24,0,12)+c(0,24,12)+c(24,24,12)+c(12,12,12);
  const yk = (cx, cy, r) => { let d = ""; for (let k = 0; k <= 6; k++) { const a = Math.PI/3*k - Math.PI/2, x = (cx + r*Math.cos(a)).toFixed(2), y = (cy + r*Math.sin(a)).toFixed(2); d += k ? `A${(r*0.55).toFixed(2)} ${(r*0.55).toFixed(2)} 0 0 0 ${x} ${y} ` : `M${x} ${y} `; } return d; };
  const yuki = yk(11,11,8) + yk(33,33,8);
  return { yukiwa: svg(44,44,yuki), Tokyo: svg(40,20,s), Fuji: svg(40,20,s), Kyoto: svg(S, 2*H, a), Osaka: svg(3*R, HX, k), Nara: svg(24,24,sh), Milano: svg(24,24,sh),
           neutral: svg(22,22,"M0 0.5 H22 M0.5 0 V22") };
})();
const SCENES = {
  sceneFuji: () => `<svg viewBox="0 0 600 360" preserveAspectRatio="xMaxYMax meet"><path d="M30 330 C170 250 240 132 282 92 H322 C362 132 432 250 572 330 M268 106 L284 118 L298 108 L312 122 L326 110 L338 118 M0 330 H600 M60 344 H160 M220 344 H380 M440 344 H560 M110 356 H210 M300 356 H470
    M96 330 V292 M124 330 V292 M80 292 Q96 288 110 278 Q124 288 140 292 M100 278 V252 M120 278 V252 M86 252 Q100 248 110 240 Q120 248 134 252 M104 240 V220 M116 240 V220 M92 220 Q104 216 110 208 Q116 216 128 220 M110 208 V176 M105 198 H115 M106 190 H114 M107 182 H113
    M400 120 Q430 104 460 116 Q486 106 510 120 M150 150 Q176 138 200 148 Q220 140 238 150"/><circle cx="470" cy="70" r="24"/></svg>`,
  sceneWave: () => `<svg viewBox="0 0 600 360" preserveAspectRatio="xMaxYMax meet"><path d="M0 330 C40 300 70 250 110 214 C150 178 210 160 256 172 C300 184 318 222 296 246 C280 262 256 256 252 238 C248 222 266 210 282 216
    M110 214 C130 230 160 238 190 232 M150 190 C170 204 196 208 220 200 M232 174 C244 160 262 156 276 162 M276 162 C270 152 274 142 284 140 M262 158 C254 148 256 138 266 134 M246 160 C236 152 236 142 244 136
    M0 352 C80 330 160 340 240 326 C320 312 380 330 460 318 C520 310 560 316 600 310 M300 340 C360 326 420 338 480 330 M420 300 C470 288 520 294 600 286
    M430 270 L478 210 H498 L548 270 M470 222 L480 230 L488 224 L496 232 L506 224"/><circle cx="520" cy="96" r="20"/></svg>`,
  sceneHotel: () => { const J = MAPS.Japan, ds = [...J.base.matchAll(/class="land2[^"]*" d="([^"]+)"/g)].map(m => m[1]);
    const cs = J.zones.filter(z => z.go).map(z => `<circle class="dot" cx="${z.x}" cy="${z.y}" r="4"/><text x="${z.x + (z.go==="Osaka"?-6:8)}" y="${z.y + (z.go==="Kyoto"?-8:z.go==="Osaka"?18:6)}" text-anchor="${z.go==="Osaka"?"end":"start"}">${CITIES[z.go].k}</text>`).join("");
    return `<svg viewBox="-20 -20 400 360" preserveAspectRatio="xMaxYMax meet">${ds.map(d => `<path d="${d}"/>`).join("")}${cs}</svg>`; }
};
let SC_K = null, scFlip = 0;
function setScene(k){
  if (k === SC_K) return; SC_K = k; scFlip ^= 1;
  const L = document.querySelectorAll("#scene > div");
  L[scFlip].innerHTML = k ? SCENES[k]() : ""; L[scFlip].classList.toggle("on", !!k); L[scFlip^1].classList.remove("on");
}
let BG = null, bgFlip = 0;
addEventListener("resize", () => { clearTimeout(window._rsz); window._rsz = setTimeout(() => { const k = BG; BG = null; if (k) setBackdrop(k === "plain" ? (SC_K || "plain") : k); updateSky(); }, 250); });
function setNobori(key){
  const v = (location.hash.slice(1) || "giorni"), sec = {preparativi:"準備", viaggio:"旅", info:"情報", luoghi:"名所", hotel:"宿", scadenze:"準備", valigia:"準備", soldi:"準備"}[v];
  const L = document.querySelector(".nb.l"), R = document.querySelector(".nb.r"); if (!L) return;
  const txt = CITIES[key] ? CITIES[key].k : (sec || "日程"), col = CITIES[key] ? fillOf(CITIES[key].c) : "var(--shu)";
  if (L.querySelector("b").textContent !== txt) { [L,R].forEach(n => { n.classList.remove("sway"); void n.offsetWidth; n.classList.add("sway"); }); }
  L.querySelector("b").textContent = txt; L.style.setProperty("--nbc", col); R.style.setProperty("--nbc", "var(--ai)");
}
function setBackdrop(key){
  setNobori(key);
  if (SCENES[key]) { setScene(key); key = "plain"; } else setScene(null);
  if (!PAT[key] && key !== "neutral" && key !== "plain") key = "neutral";
  if (CITIES[key] && PHASE() === "xmas") key = "yukiwa";
  if (key === BG) return; BG = key; bgFlip ^= 1;
  const L = document.querySelectorAll("#bgpat i"), S = document.querySelectorAll("#sky > div:not(#skytint):not(#skyfx)");
  const p = PAT[key], li = L[bgFlip], si = S[bgFlip];
  if (p) { li.style.backgroundImage = p.url; li.style.backgroundSize = `${p.w}px ${p.h}px`; } else li.style.backgroundImage = "none";
  si.innerHTML = skySVG(key);
  li.classList.toggle("on", !!p); L[bgFlip^1].classList.remove("on");
  si.classList.toggle("on", !!SKY[key]); S[bgFlip^1].classList.remove("on");
}
const dayBackdrop = d => d.date === "2027-03-12" ? "Fuji" : d.city;

/* ====== petali di susino all'apertura ====== */
function petals(){
  if (REDUCED) return;
  const box = document.createElement("div"); box.id = "petals"; box.setAttribute("aria-hidden","true");
  const cols = ["#F4B3C2","#F7C9D3","#EC9AB0","#FBE0E6"];
  let html = "";
  for (let n = 0; n < 16; n++) {
    const sz = 9 + Math.random()*8, x = Math.random()*100, dur = 6 + Math.random()*4, del = Math.random()*2.6, sway = 1.6 + Math.random()*1.4;
    html += `<span class="pf" style="left:${x.toFixed(1)}vw;animation-duration:${dur.toFixed(1)}s;animation-delay:${del.toFixed(1)}s"><span class="ps" style="animation-duration:${sway.toFixed(1)}s">
      <svg width="${sz.toFixed(0)}" height="${sz.toFixed(0)}" viewBox="-7 -7 14 14"><path d="M0 -6 C4 -6 6.5 -2 4.5 2 C3.2 4.3 1.2 5.6 0 6.5 C-1.2 5.6 -3.2 4.3 -4.5 2 C-6.5 -2 -4 -6 0 -6 Z" fill="${cols[n%4]}"/><path d="M0 -3.5 V1.5" stroke="#fff" stroke-opacity=".6" stroke-width=".7"/></svg></span></span>`;
  }
  box.innerHTML = html; document.body.appendChild(box);
  setTimeout(() => box.remove(), 13500);
}


/* ====== modalità in viaggio: prossima tappa ====== */
function markNow(){
  const el = document.getElementById("day"); if (!el) return;
  const items = [...el.querySelectorAll(".pl")], nl = el.querySelector("#nowline");
  items.forEach(x => x.classList.remove("next","past"));
  const d = DAYS[cur], nj = nowJ();
  if (!TRIP() || !d || d.date !== nj.date || !items.length) { if (nl) nl.hidden = true; return; }
  const nxt = items.find(x => +x.dataset.m > nj.min);
  const nm = nxt ? +nxt.dataset.m : Infinity;
  items.forEach(x => { const m = +x.dataset.m; if (m === nm) x.classList.add("next"); else if (m < nm && nxt) x.classList.add("past"); });
  if (nl) { if (nxt) { const left = nm - nj.min, h = Math.floor(left/60), mm = left % 60;
      nl.innerHTML = `Prossima: <b>${esc(nxt.querySelector(".pn").textContent)}</b> · tra ${h ? h + " h " : ""}${mm} min`; nl.hidden = false; }
    else nl.hidden = true; }
}
setInterval(() => { if (!$("#v-giorni").hidden) markNow(); }, 60000);

/* ====== timbri ====== */
const dec = s => decodeURIComponent(escape(atob(s)));
const STJP = [[/Omoide/,"思い出横丁","lantern"],[/Kaminarimon/,"雷門","lantern"],[/Senso-ji/,"浅草寺","temple"],[/Skytree/,"スカイツリー","skytree"],[/Meiji/,"明治神宮","torii"],
 [/Takeshita/,"竹下通り","bag"],[/PARCO/,"渋谷","star"],[/Crossing/,"渋谷","cross"],[/Center-gai/,"センター街","cross"],[/banco/,"恵比寿","bowl"],[/DisneySea/,"ディズニーシー","volcano"],
 [/Kanda/,"神田明神","torii"],[/Akihabara/,"秋葉原","star"],[/Chureito/,"忠霊塔","pagoda"],[/Oishi/,"富士山","fuji"],[/teamLab/,"チームラボ","star"],[/Karaoke/,"カラオケ","mic"],
 [/Shinkansen/,"新幹線","train"],[/Shirakawa/,"白川","bridge"],[/Hanamikoji/,"花見小路","lantern"],[/bambù/,"竹林","bamboo"],[/Tenry/,"天龍寺","temple"],[/Togetsuky/,"渡月橋","bridge"],
 [/Kinkaku/,"金閣寺","temple"],[/Fushimi/,"伏見稲荷","torii"],[/Kiyomizu/,"清水寺","temple"],[/Sannenzaka/,"三年坂","lantern"],[/Universal/,"大阪","globe"],[/Dotonbori/,"道頓堀","bridge"],
 [/cervi/,"奈良公園","deer"],[/Tōdai-ji/,"東大寺","temple"],[/Kasuga/,"春日大社","lantern"],[/kaiseki/,"懐石","bowl"]];
const VIC = {"Omoide": "Primi al bancone: il fumo degli yakitori era tutto per voi.", "Kaminarimon": "La grande lanterna senza folla: un privilegio da mattinieri.", "Senso-ji": "Siete arrivati quando il tempio era ancora vostro.", "Skytree": "Il sole è sceso proprio mentre guardavate: tempismo perfetto.", "Meiji": "Il bosco silenzioso vi ha accolto all'ora giusta.", "Takeshita": "Siete passati prima della marea di gente: leggende di Harajuku.", "PARCO": "Pikachu vi stava aspettando, e voi siete arrivati in orario.", "Crossing": "Il semaforo diventa verde e il mondo si muove con voi.", "Center-gai": "Le insegne si sono accese giusto per il vostro passaggio.", "banco": "Lo chef ha alzato lo sguardo: puntuali come un vero samurai.", "DisneySea": "Ai cancelli all'apertura: la giornata è cominciata alla grande.", "Kanda": "Gli dei dell'elettronica benedicono chi arriva puntuale.", "Akihabara": "Le sale giochi non hanno avuto scampo.", "Chureito": "Puntuali come lo Shinkansen: il Fuji vi ha aspettato.", "Oishi": "Il Fuji riflesso nel lago, proprio all'ora prevista.", "teamLab": "Siete entrati nel sogno esattamente quando dovevate.", "Karaoke": "Microfono in mano all'ora giusta: addio al Giappone come si deve.", "Shinkansen": "Lato giusto, ora giusta: il Fuji dal finestrino è vostro.", "Shirakawa": "I salici e il canale nella luce perfetta.", "Hanamikoji": "Il tramonto di Gion, al minuto.", "bambù": "La foresta di bambù vuota: pochi possono dirlo.", "Tenry": "Il giardino appena aperto, solo per voi.", "Togetsuky": "Il ponte e le montagne, senza nessuno davanti.", "Kinkaku": "Il Padiglione d'Oro brillava proprio per voi.", "Fushimi": "Mille torii e nessuno davanti: missione compiuta.", "Kiyomizu": "La terrazza sospesa all'ora prevista: Kyoto ai vostri piedi.", "Sannenzaka": "Le vecchie scalinate di Kyoto al momento perfetto.", "Universal": "Primi a Super Nintendo World: livello completato.", "Dotonbori": "Il canale illuminato vi ha accolto all'ora esatta.", "cervi": "I cervi si sono inchinati: rispetto guadagnato.", "Tōdai-ji": "Il Grande Buddha vi ha visto arrivare puntuali.", "Kasuga": "Migliaia di lanterne, e voi arrivati al momento giusto.", "kaiseki": "La cena del ryokan servita all'ora perfetta: kanpai!"};
const vicFor = s => { const k = Object.keys(VIC).find(k => s.n.includes(k)); return k ? VIC[k] : "Puntuali come un treno giapponese."; };
const SECRET = [["m", "5ZCN5Lq6", "TWFlc3RybyBjb2xsZXppb25pc3Rh", "VHV0dGkgaSB0aW1icmkgZGVsIHZpYWdnaW86IHVuIHZlcm8gY29sbGV6aW9uaXN0YSBnaWFwcG9uZXNlLg==", "book"], ["l", "5Lyd6Kqs", "TGVnZ2VuZGEgdml2ZW50ZQ==", "VHJlIHRpbWJyaSBsZWdnZW5kYXJpOiBsYSBwdW50dWFsaXTDoCBnaWFwcG9uZXNlIHNjb3JyZSBpbiB2b2ku", "crown"], ["o", "44GK5biw44KK", "T2thZXJp", "QmVudG9ybmF0aSBhIGNhc2E6IGlsIHZpYWdnaW8gw6ggZmluaXRvLCBpIHJpY29yZGkgbm8u", "house"], ["h", "6Iqx54Gr", "SGFuYWJp", "QXZldGUgdHJvdmF0byBpIGZ1b2NoaSBkJ2FydGlmaWNpbyBuYXNjb3N0aS4=", "fire"]].map(x => ({id:x[0], jp:dec(x[1]), name:dec(x[2]), txt:dec(x[3]), ic:x[4]}));
const STI = {
  temple:"M4 30 Q24 22 44 30 M8 30 V44 M40 30 V44 M14 22 Q24 16 34 22 M12 26 H36 M24 8 V16 M20 12 H28 M4 44 H44",
  torii:"M6 12 Q24 7 42 12 M9 17 H39 M14 12 V44 M34 12 V44 M24 17 V23 M10 23 H38",
  pagoda:"M24 4 V12 M14 16 Q24 11 34 16 M17 16 V20 M31 16 V20 M12 24 Q24 18 36 24 M16 24 V30 M32 24 V30 M10 34 Q24 27 38 34 M15 34 V44 M33 34 V44 M8 44 H40",
  skytree:"M24 2 V10 M20 44 L22 22 M28 44 L26 22 M19 22 H29 V16 H19 Z M21 16 L22 10 H26 L27 16 M14 44 H34",
  lantern:"M18 8 H30 M16 12 Q24 8 32 12 V34 Q24 38 16 34 Z M16 18 H32 M16 28 H32 M24 38 V44 M20 44 H28",
  bridge:"M2 30 Q24 12 46 30 M2 30 H46 M8 30 V40 M40 30 V40 M14 24 V30 M24 21 V30 M34 24 V30 M2 40 Q12 36 24 40 Q36 44 46 40",
  bamboo:"M14 4 V44 M24 2 V44 M34 6 V44 M14 14 H18 M14 28 H18 M24 10 H28 M24 24 H28 M24 38 H28 M34 18 H38 M34 32 H38 M18 14 Q24 10 26 4 M28 24 Q36 20 40 14",
  deer:"M12 30 Q12 24 22 24 H32 Q36 24 36 30 Q36 34 32 34 H16 Q12 34 12 30 Z M32 24 L36 14 M34 12 H40 L38 16 M36 12 L34 6 L30 4 M34 6 L38 2 M16 34 V44 M20 34 V44 M28 34 V44 M32 34 V44",
  fuji:"M2 40 L18 14 H30 L46 40 Z M14 20 L18 24 L22 20 L26 24 L30 20 L34 22",
  star:"M24 4 L29 18 H44 L32 27 L36 42 L24 33 L12 42 L16 27 L4 18 H19 Z",
  cross:"M4 14 H44 M4 34 H44 M10 14 V34 M18 14 V34 M26 14 V34 M34 14 V34 M42 14 V34",
  bowl:"M6 22 H42 Q40 38 24 38 Q8 38 6 22 Z M18 38 V42 H30 V38 M16 6 L22 20 M26 4 L28 20",
  volcano:"M4 42 L18 18 H30 L44 42 Z M20 18 Q24 10 28 18 M22 10 Q20 4 26 2",
  globe:"M24 4 A20 20 0 1 0 24.1 4 M4 24 H44 M24 4 Q12 24 24 44 M24 4 Q36 24 24 44 M8 14 H40 M8 34 H40",
  mic:"M18 6 H30 V24 Q24 30 18 24 Z M14 20 Q14 32 24 32 Q34 32 34 20 M24 32 V42 M16 42 H32",
  bag:"M10 16 H38 L36 44 H12 Z M18 16 Q18 6 24 6 Q30 6 30 16",
  train:"M4 30 Q8 16 24 14 H40 Q44 14 44 22 V30 Z M4 30 H44 M30 18 H40 V24 H30 Z M10 36 H42",
  book:"M6 8 H22 Q24 8 24 12 V42 Q24 38 20 38 H6 Z M42 8 H26 Q24 8 24 12 V42 Q24 38 28 38 H42 Z M10 16 H20 M10 22 H20 M28 16 H38 M28 22 H38",
  crown:"M6 36 L4 12 L16 24 L24 8 L32 24 L44 12 L42 36 Z M6 42 H42",
  house:"M4 24 L24 6 L44 24 M10 20 V42 H38 V20 M20 42 V30 H28 V42",
  fire:"M24 4 V14 M24 34 V44 M4 24 H14 M34 24 H44 M10 10 L17 17 M31 31 L38 38 M38 10 L31 17 M17 31 L10 38 M24 20 A4 4 0 1 0 24.1 20"
};
const stKey = (s, date) => `${date}|${s.n}`;
const stInfo = s => { const m = STJP.find(x => x[0].test(s.n)); return m ? {jp:m[1], ic:m[2]} : {jp:"日本", ic:"torii"}; };
function stampSVG(s, date, rot=-6, leg=false, ov=null){
  const inf = ov || stInfo(s), jp = inf.jp, ic = inf.ic, d = date ? parse(date) : null, shape = ((ov ? ov.jp : s.n).length % 3);
  const col = leg || ov ? "var(--gold)" : "var(--shu)";
  const frame = shape === 0 ? `<circle cx="60" cy="60" r="54"/><circle cx="60" cy="60" r="48"/>` : shape === 1 ? `<rect x="8" y="8" width="104" height="104" rx="18"/><rect x="14" y="14" width="92" height="92" rx="13"/>` : `<path d="M60 6 L110 34 V86 L60 114 L10 86 V34 Z"/><path d="M60 13 L104 38 V82 L60 107 L16 82 V38 Z"/>`;
  const dots = leg || ov ? [...Array(12)].map((_,k) => { const a = k*Math.PI/6; return `<circle cx="${(60+57*Math.cos(a)).toFixed(1)}" cy="${(60+57*Math.sin(a)).toFixed(1)}" r="1.6" fill="var(--gold)" stroke="none"/>`; }).join("") : "";
  return `<svg viewBox="-4 -4 128 128" class="${leg || ov ? "leg" : ""}" style="--r:${rot}deg;transform:rotate(${rot}deg)"><g fill="none" stroke="${col}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round">${frame}${dots}<g transform="translate(36 24)"><path d="${STI[ic]}"/></g></g>
    <text x="60" y="88" text-anchor="middle" fill="${col}" style="font-family:var(--kanji);font-weight:800;font-size:${jp.length>5?11:14}px">${jp}</text>
    <text x="60" y="101" text-anchor="middle" fill="${col}" style="font-size:8.5px;font-weight:700;letter-spacing:.08em">${ov ? "秘密" : leg ? "LEGGENDARIO" : d.getDate() + ".3.2027"}</text></svg>`;
}
function stampFx(svg, title, text){
  const fx = document.createElement("div"); fx.id = "stampfx"; fx.innerHTML = svg + (title ? `<div class="sfxt"><b>${esc(title)}</b>${text ? `<span>${esc(text)}</span>` : ""}</div>` : "");
  document.body.appendChild(fx); if (navigator.vibrate) navigator.vibrate(title ? [18, 60, 18] : 18);
  setTimeout(() => fx.remove(), REDUCED ? 1400 : (title ? 3200 : 1900));
}
function unlockSecret(id){
  const sec = store.get("sec", {}); if (sec[id]) return; const S = SECRET.find(x => x.id === id); if (!S) return;
  sec[id] = {at: NOW().toISOString()}; store.set("sec", sec);
  setTimeout(() => stampFx(stampSVG({n:S.jp}, null, -4, true, S), "Timbro segreto: " + S.name, S.txt), 1200);
}
function checkSecrets(){
  const all = store.get("stamps", {}), vals = Object.values(all), list = [];
  DAYS.forEach(d => (d.plan || []).forEach(s => { if (s.p === "Imperdibile" && s.k !== "Trasferimento") list.push(stKey(s, d.date)); }));
  if (list.length && list.every(k => all[k])) unlockSecret("m");
  if (vals.filter(v => v.leg).length >= 3) unlockSecret("l");
  if (PHASE() === "back") unlockSecret("o");

}
const stampable = s => TRIP() && s.p === "Imperdibile" && s.k !== "Trasferimento";
function stBtn(s){ const d = DAYS[cur], k = stKey(s, d.date), got = store.get("stamps", {})[k];
  if (d.date > nowJ().date) return "";
  return `<button class="navbtn stb${got?" got":""}" data-st="${esc(k)}">${got ? (got.leg ? "★ Leggendario" : "✓ Timbrato") : "印 Timbro"}</button>`; }
document.getElementById("day").addEventListener("click", e => {
  const b = e.target.closest(".stb"); if (!b) return;
  const all = store.get("stamps", {}), k = b.dataset.st; if (all[k]) return;
  const name = k.split("|")[1], s = DAYS[cur].plan.find(x => x.n === name);
  const leg = Math.abs(nowJ().min - tmin(s.t)) <= 10;
  const rot = Math.round(Math.random()*14 - 7); all[k] = {at: NOW().toISOString(), r: rot, leg}; store.set("stamps", all);
  stampFx(stampSVG(s, DAYS[cur].date, rot, leg), leg ? "Timbro leggendario!" : "", leg ? vicFor(s) : "");
  b.classList.add("got"); b.textContent = leg ? "★ Leggendario" : "✓ Timbrato";
  checkSecrets();
});
function renderStamps(){
  const all = store.get("stamps", {}), sec = store.get("sec", {}), list = [];
  DAYS.forEach(d => (d.plan || []).forEach(s => { if (s.p === "Imperdibile" && s.k !== "Trasferimento") list.push([d, s]); }));
  const got = list.filter(([d,s]) => all[stKey(s, d.date)]).length, legs = Object.values(all).filter(v => v.leg).length;
  $("#ststat").textContent = (TRIP() ? `${got} su ${list.length} timbri raccolti · ${legs} leggendari. Si timbrano dalle tappe imperdibili del giorno; entro 10 minuti dall'orario il timbro diventa d'oro.` : `${got} su ${list.length} timbri. Si raccolgono durante il viaggio dalle tappe imperdibili; arrivando puntuali, entro 10 minuti dall'orario, il timbro diventa leggendario.`);
  const fmt = iso => new Date(iso).toLocaleString("it-IT",{timeZone:"Asia/Tokyo",day:"numeric",month:"numeric",hour:"2-digit",minute:"2-digit"});
  $("#stamps").innerHTML = list.map(([d,s]) => { const g = all[stKey(s, d.date)];
    return `<figure class="${g ? (g.leg ? "lg" : "") : "no"}">${stampSVG(s, d.date, g ? g.r : 0, g && g.leg)}<figcaption>${esc(s.n)}${g ? `<br>${fmt(g.at)}` : ""}</figcaption></figure>`; }).join("")
    + `<p class="secttl">Segreti</p>` + SECRET.map(S => sec[S.id] ? `<figure class="lg">${stampSVG({n:S.jp}, null, -4, true, S)}<figcaption>${esc(S.name)}<br>${fmt(sec[S.id].at)}</figcaption></figure>`
      : `<figure class="no"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" fill="none" stroke="var(--muted)" stroke-width="2.4" stroke-dasharray="5 6"/><text x="60" y="72" text-anchor="middle" fill="var(--muted)" style="font-size:34px;font-weight:700">???</text></svg><figcaption>Timbro segreto</figcaption></figure>`).join("");

}

/* ====== cielo con l'ora di Tokyo ====== */
(function skyFx(){
  let win = ""; for (let k = 0; k < 46; k++) { const x = 20 + Math.random()*680, y = 120 + Math.random()*52; win += `<rect class="win" x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="2.4" height="3"/>`; }
  let lt = ""; const cols = ["#FFD27A","#FF8A7A","#9AD0FF","#B6F0A8","#FFFFFF"];
  for (let k = 0; k < 40; k++) { const x = 20 + Math.random()*680, y = 30 + Math.random()*140; lt += `<circle class="lt" cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="1.8" style="fill:${cols[k%5]};stroke:none;animation-delay:${(Math.random()*2.4).toFixed(1)}s"/>`; }
  const kado = x => `<g transform="translate(${x} 128)" fill="none" stroke="#5E8A3A" stroke-width="1.6"><path d="M6 48 V10 L10 4 V48 M14 48 V14 L18 8 V48 M22 48 V6 L26 0 V48"/><path d="M0 48 H32 V36 H0 Z" stroke="#B8861F"/><path d="M2 30 Q8 22 16 28 Q24 22 30 30" stroke="#3E6B2E"/></g>`;
  window.SKYFX = {win, lt, kado};
})();
function updateSky(){
  const sky = document.getElementById("sky"); if (!sky) return;
  const m = nowJ().min, ph = m < 300 ? "night" : m < 420 ? "dawn" : m < 990 ? "day" : m < 1110 ? "sunset" : "night";
  sky.classList.remove("dawn","day","sunset","night"); sky.classList.add(ph);
  const P = PHASE(), fx = document.getElementById("skyfx");
  const W = SKYW() || 720, x0 = (720 - W)/2;
  fx.innerHTML = `<svg viewBox="${x0.toFixed(1)} 0 ${W.toFixed(1)} 180" preserveAspectRatio="xMidYMax ${W > 720 ? "meet" : "slice"}">${SKYFX.win}${P==="xmas" ? SKYFX.lt : ""}${P==="ny" ? SKYFX.kado(x0 + 30) + SKYFX.kado(x0 + W - 60) : ""}</svg>`;
}
setInterval(updateSky, 300000);

/* ====== periodi: icona del browser e curiosità ====== */
function setFavicon(){
  const P = PHASE(), f = {
    pre:`<circle cx="32" cy="32" r="22" fill="#B8361F"/>`,
    last:`<path d="M60 30 L36 26 L22 6 H16 L22 26 L10 28 L6 20 H2 L5 32 L2 44 H6 L10 36 L22 38 L16 58 H22 L36 38 L60 34 Z" fill="#1F3B5C"/>`,
    trip:`<circle cx="30" cy="34" r="22" fill="#B8361F"/><circle cx="50" cy="14" r="7" fill="#F4B3C2"/><circle cx="56" cy="24" r="5" fill="#F7C9D3"/>`,
    back:`<path d="M8 32 L32 10 L56 32 V56 H8 Z" fill="#1F3B5C"/><circle cx="32" cy="38" r="8" fill="#B8361F"/>`,
    xmas:`<g stroke="#2E6A9E" stroke-width="5" stroke-linecap="round"><path d="M32 6 V58 M9 19 L55 45 M9 45 L55 19"/></g>`,
    ny:`<circle cx="32" cy="34" r="16" fill="#B8361F"/><path d="M2 60 L24 30 H40 L62 60 Z" fill="#262421"/>`
  }[P];
  let link = document.querySelector('link[rel="icon"]'); if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
  link.type = "image/svg+xml"; link.href = "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${f}</svg>`);
  if (P === "ny" && !document.getElementById("nytip")) { const li = document.createElement("li"); li.id = "nytip";
    li.textContent = "Curiosità di stagione: il Capodanno (Oshōgatsu) è la festa più importante del Giappone. Si va al tempio per il primo pellegrinaggio dell’anno (hatsumōde) e si guarda la prima alba (hatsuhinode); il Natale invece è soprattutto una serata romantica per le coppie.";
    document.getElementById("tips").appendChild(li); }
}

/* ====== neve per Natale ====== */
function snow(){
  if (REDUCED) return;
  const box = document.createElement("div"); box.id = "petals"; box.setAttribute("aria-hidden","true");
  let html = "";
  for (let n = 0; n < 26; n++) { const sz = 5 + Math.random()*7, x = Math.random()*100, dur = 7 + Math.random()*5, del = Math.random()*3, sway = 2 + Math.random()*2;
    html += `<span class="pf" style="left:${x.toFixed(1)}vw;animation-duration:${dur.toFixed(1)}s;animation-delay:${del.toFixed(1)}s"><span class="ps" style="animation-duration:${sway.toFixed(1)}s"><svg width="${sz.toFixed(0)}" height="${sz.toFixed(0)}" viewBox="-6 -6 12 12"><circle r="5" fill="var(--snow,#C9D6E3)"/></svg></span></span>`; }
  box.innerHTML = html; document.body.appendChild(box); setTimeout(() => box.remove(), 16000);
}

/* ====== presentazione per la TV (computer) ====== */
let PRES = null;
const QRSVG = `<svg data-w="31mm" data-h="31mm" version="1.1" viewBox="0 0 31 31" xmlns="http://www.w3.org/2000/svg"><path d="M1,1H2V2H1zM2,1H3V2H2zM3,1H4V2H3zM4,1H5V2H4zM5,1H6V2H5zM6,1H7V2H6zM7,1H8V2H7zM12,1H13V2H12zM13,1H14V2H13zM15,1H16V2H15zM18,1H19V2H18zM19,1H20V2H19zM20,1H21V2H20zM23,1H24V2H23zM24,1H25V2H24zM25,1H26V2H25zM26,1H27V2H26zM27,1H28V2H27zM28,1H29V2H28zM29,1H30V2H29zM1,2H2V3H1zM7,2H8V3H7zM10,2H11V3H10zM14,2H15V3H14zM16,2H17V3H16zM18,2H19V3H18zM23,2H24V3H23zM29,2H30V3H29zM1,3H2V4H1zM3,3H4V4H3zM4,3H5V4H4zM5,3H6V4H5zM7,3H8V4H7zM9,3H10V4H9zM11,3H12V4H11zM12,3H13V4H12zM16,3H17V4H16zM19,3H20V4H19zM20,3H21V4H20zM23,3H24V4H23zM25,3H26V4H25zM26,3H27V4H26zM27,3H28V4H27zM29,3H30V4H29zM1,4H2V5H1zM3,4H4V5H3zM4,4H5V5H4zM5,4H6V5H5zM7,4H8V5H7zM9,4H10V5H9zM10,4H11V5H10zM11,4H12V5H11zM12,4H13V5H12zM13,4H14V5H13zM14,4H15V5H14zM16,4H17V5H16zM17,4H18V5H17zM18,4H19V5H18zM23,4H24V5H23zM25,4H26V5H25zM26,4H27V5H26zM27,4H28V5H27zM29,4H30V5H29zM1,5H2V6H1zM3,5H4V6H3zM4,5H5V6H4zM5,5H6V6H5zM7,5H8V6H7zM9,5H10V6H9zM12,5H13V6H12zM13,5H14V6H13zM15,5H16V6H15zM18,5H19V6H18zM19,5H20V6H19zM20,5H21V6H20zM21,5H22V6H21zM23,5H24V6H23zM25,5H26V6H25zM26,5H27V6H26zM27,5H28V6H27zM29,5H30V6H29zM1,6H2V7H1zM7,6H8V7H7zM9,6H10V7H9zM10,6H11V7H10zM14,6H15V7H14zM15,6H16V7H15zM16,6H17V7H16zM19,6H20V7H19zM21,6H22V7H21zM23,6H24V7H23zM29,6H30V7H29zM1,7H2V8H1zM2,7H3V8H2zM3,7H4V8H3zM4,7H5V8H4zM5,7H6V8H5zM6,7H7V8H6zM7,7H8V8H7zM9,7H10V8H9zM11,7H12V8H11zM13,7H14V8H13zM15,7H16V8H15zM17,7H18V8H17zM19,7H20V8H19zM21,7H22V8H21zM23,7H24V8H23zM24,7H25V8H24zM25,7H26V8H25zM26,7H27V8H26zM27,7H28V8H27zM28,7H29V8H28zM29,7H30V8H29zM9,8H10V9H9zM11,8H12V9H11zM12,8H13V9H12zM13,8H14V9H13zM15,8H16V9H15zM21,8H22V9H21zM1,9H2V10H1zM3,9H4V10H3zM4,9H5V10H4zM5,9H6V10H5zM6,9H7V10H6zM7,9H8V10H7zM11,9H12V10H11zM14,9H15V10H14zM16,9H17V10H16zM17,9H18V10H17zM18,9H19V10H18zM21,9H22V10H21zM23,9H24V10H23zM24,9H25V10H24zM25,9H26V10H25zM26,9H27V10H26zM27,9H28V10H27zM1,10H2V11H1zM4,10H5V11H4zM6,10H7V11H6zM8,10H9V11H8zM12,10H13V11H12zM13,10H14V11H13zM14,10H15V11H14zM18,10H19V11H18zM19,10H20V11H19zM20,10H21V11H20zM21,10H22V11H21zM23,10H24V11H23zM24,10H25V11H24zM25,10H26V11H25zM29,10H30V11H29zM3,11H4V12H3zM4,11H5V12H4zM5,11H6V12H5zM6,11H7V12H6zM7,11H8V12H7zM11,11H12V12H11zM14,11H15V12H14zM15,11H16V12H15zM16,11H17V12H16zM17,11H18V12H17zM18,11H19V12H18zM22,11H23V12H22zM23,11H24V12H23zM24,11H25V12H24zM25,11H26V12H25zM2,12H3V13H2zM4,12H5V13H4zM6,12H7V13H6zM8,12H9V13H8zM11,12H12V13H11zM15,12H16V13H15zM16,12H17V13H16zM17,12H18V13H17zM25,12H26V13H25zM26,12H27V13H26zM28,12H29V13H28zM2,13H3V14H2zM3,13H4V14H3zM4,13H5V14H4zM7,13H8V14H7zM8,13H9V14H8zM9,13H10V14H9zM10,13H11V14H10zM11,13H12V14H11zM12,13H13V14H12zM16,13H17V14H16zM18,13H19V14H18zM19,13H20V14H19zM20,13H21V14H20zM22,13H23V14H22zM26,13H27V14H26zM27,13H28V14H27zM1,14H2V15H1zM2,14H3V15H2zM3,14H4V15H3zM6,14H7V15H6zM8,14H9V15H8zM12,14H13V15H12zM14,14H15V15H14zM17,14H18V15H17zM18,14H19V15H18zM19,14H20V15H19zM20,14H21V15H20zM21,14H22V15H21zM23,14H24V15H23zM24,14H25V15H24zM25,14H26V15H25zM29,14H30V15H29zM1,15H2V16H1zM3,15H4V16H3zM6,15H7V16H6zM7,15H8V16H7zM8,15H9V16H8zM9,15H10V16H9zM10,15H11V16H10zM12,15H13V16H12zM14,15H15V16H14zM15,15H16V16H15zM16,15H17V16H16zM18,15H19V16H18zM22,15H23V16H22zM23,15H24V16H23zM24,15H25V16H24zM26,15H27V16H26zM27,15H28V16H27zM2,16H3V17H2zM4,16H5V17H4zM6,16H7V17H6zM8,16H9V17H8zM9,16H10V17H9zM11,16H12V17H11zM13,16H14V17H13zM14,16H15V17H14zM17,16H18V17H17zM21,16H22V17H21zM28,16H29V17H28zM3,17H4V18H3zM5,17H6V18H5zM7,17H8V18H7zM8,17H9V18H8zM11,17H12V18H11zM15,17H16V18H15zM21,17H22V18H21zM22,17H23V18H22zM26,17H27V18H26zM27,17H28V18H27zM1,18H2V19H1zM2,18H3V19H2zM5,18H6V19H5zM11,18H12V19H11zM13,18H14V19H13zM17,18H18V19H17zM19,18H20V19H19zM20,18H21V19H20zM21,18H22V19H21zM23,18H24V19H23zM24,18H25V19H24zM25,18H26V19H25zM27,18H28V19H27zM29,18H30V19H29zM1,19H2V20H1zM3,19H4V20H3zM7,19H8V20H7zM9,19H10V20H9zM11,19H12V20H11zM12,19H13V20H12zM13,19H14V20H13zM16,19H17V20H16zM17,19H18V20H17zM18,19H19V20H18zM21,19H22V20H21zM24,19H25V20H24zM27,19H28V20H27zM1,20H2V21H1zM6,20H7V21H6zM8,20H9V21H8zM10,20H11V21H10zM11,20H12V21H11zM13,20H14V21H13zM15,20H16V21H15zM17,20H18V21H17zM23,20H24V21H23zM24,20H25V21H24zM28,20H29V21H28zM1,21H2V22H1zM5,21H6V22H5zM7,21H8V22H7zM8,21H9V22H8zM10,21H11V22H10zM11,21H12V22H11zM13,21H14V22H13zM18,21H19V22H18zM20,21H21V22H20zM21,21H22V22H21zM22,21H23V22H22zM23,21H24V22H23zM24,21H25V22H24zM25,21H26V22H25zM27,21H28V22H27zM28,21H29V22H28zM29,21H30V22H29zM9,22H10V23H9zM10,22H11V23H10zM12,22H13V23H12zM14,22H15V23H14zM15,22H16V23H15zM17,22H18V23H17zM18,22H19V23H18zM19,22H20V23H19zM21,22H22V23H21zM25,22H26V23H25zM26,22H27V23H26zM27,22H28V23H27zM28,22H29V23H28zM29,22H30V23H29zM1,23H2V24H1zM2,23H3V24H2zM3,23H4V24H3zM4,23H5V24H4zM5,23H6V24H5zM6,23H7V24H6zM7,23H8V24H7zM12,23H13V24H12zM14,23H15V24H14zM15,23H16V24H15zM16,23H17V24H16zM19,23H20V24H19zM20,23H21V24H20zM21,23H22V24H21zM23,23H24V24H23zM25,23H26V24H25zM26,23H27V24H26zM27,23H28V24H27zM1,24H2V25H1zM7,24H8V25H7zM9,24H10V25H9zM11,24H12V25H11zM12,24H13V25H12zM13,24H14V25H13zM14,24H15V25H14zM16,24H17V25H16zM20,24H21V25H20zM21,24H22V25H21zM25,24H26V25H25zM29,24H30V25H29zM1,25H2V26H1zM3,25H4V26H3zM4,25H5V26H4zM5,25H6V26H5zM7,25H8V26H7zM9,25H10V26H9zM11,25H12V26H11zM15,25H16V26H15zM16,25H17V26H16zM17,25H18V26H17zM18,25H19V26H18zM21,25H22V26H21zM22,25H23V26H22zM23,25H24V26H23zM24,25H25V26H24zM25,25H26V26H25zM27,25H28V26H27zM1,26H2V27H1zM3,26H4V27H3zM4,26H5V27H4zM5,26H6V27H5zM7,26H8V27H7zM9,26H10V27H9zM10,26H11V27H10zM11,26H12V27H11zM12,26H13V27H12zM17,26H18V27H17zM19,26H20V27H19zM20,26H21V27H20zM21,26H22V27H21zM22,26H23V27H22zM26,26H27V27H26zM27,26H28V27H27zM28,26H29V27H28zM29,26H30V27H29zM1,27H2V28H1zM3,27H4V28H3zM4,27H5V28H4zM5,27H6V28H5zM7,27H8V28H7zM9,27H10V28H9zM10,27H11V28H10zM12,27H13V28H12zM16,27H17V28H16zM19,27H20V28H19zM20,27H21V28H20zM22,27H23V28H22zM23,27H24V28H23zM24,27H25V28H24zM25,27H26V28H25zM26,27H27V28H26zM27,27H28V28H27zM28,27H29V28H28zM1,28H2V29H1zM7,28H8V29H7zM10,28H11V29H10zM11,28H12V29H11zM13,28H14V29H13zM14,28H15V29H14zM15,28H16V29H15zM16,28H17V29H16zM21,28H22V29H21zM23,28H24V29H23zM24,28H25V29H24zM25,28H26V29H25zM26,28H27V29H26zM28,28H29V29H28zM1,29H2V30H1zM2,29H3V30H2zM3,29H4V30H3zM4,29H5V30H4zM5,29H6V30H5zM6,29H7V30H6zM7,29H8V30H7zM9,29H10V30H9zM10,29H11V30H10zM12,29H13V30H12zM13,29H14V30H13zM14,29H15V30H14zM16,29H17V30H16zM17,29H18V30H17zM18,29H19V30H18zM20,29H21V30H20zM22,29H23V30H22zM23,29H24V30H23zM24,29H25V30H24zM27,29H28V30H27z" id="qr-path" fill="#000000" fill-opacity="1" fill-rule="nonzero" stroke="none"/></svg>`;
function presDeck(){
  const S = [{k:"cover", ch:"Apertura"}, {k:"nums", ch:"Apertura"}, {k:"map", ch:"Apertura"}];
  let lastCh = null;
  DAYS.forEach((d,i) => {
    const ch = d.city === "Milano" ? (i === 0 ? "Partenza" : "Ritorno") : d.city + (i >= 12 && d.city === "Tokyo" ? " · il ritorno" : "");
    if (d.city !== "Milano" && ch !== lastCh) S.push({k:"city", city:d.city, ch, days:DAYS.map((x,j)=>j).filter(j => DAYS[j].city === d.city && (i >= 12 ? j >= 12 : j < 12))});
    lastCh = ch; S.push({k:"day", i, ch});
  });
  S.push({k:"hotels", ch:"Chiusura"}, {k:"budget", ch:"Chiusura"}, {k:"end", ch:"Chiusura"});
  return S;
}
const presLogo = () => `<div class="logo2"><svg viewBox="0 0 560 420"><defs><linearGradient id="sunG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D8402A"/><stop offset=".65" stop-color="#E9673F"/><stop offset="1" stop-color="#F3A15F"/></linearGradient></defs>
  <circle cx="280" cy="200" r="150" fill="url(#sunG)"/>
  <g fill="#2A1A14"><path d="M176 132 Q280 112 384 132 L380 146 Q280 128 180 146 Z"/><rect x="196" y="158" width="168" height="12" rx="3"/><rect x="214" y="134" width="16" height="216"/><rect x="330" y="134" width="16" height="216"/><rect x="273" y="146" width="14" height="24"/></g>
  <path d="M110 300 H450" stroke="#2A1A14" stroke-width="4" stroke-linecap="round"/>
  <g stroke="#E9673F" stroke-width="5" stroke-linecap="round" opacity=".55"><path d="M210 320 H350"/><path d="M230 338 H330"/><path d="M252 354 H308"/></g>
  <g class="br-l"><path d="M0 20 Q90 40 150 96 Q182 126 196 170" fill="none" stroke="#6B4A36" stroke-width="7" stroke-linecap="round"/><path d="M90 50 Q110 30 140 30 M150 96 Q178 84 200 92" fill="none" stroke="#6B4A36" stroke-width="4" stroke-linecap="round"/>
    ${[[60,34],[100,56],[134,30],[150,100],[176,132],[198,92],[118,78],[190,168]].map(([x,y],k) => `<g transform="translate(${x} ${y})">${[0,72,144,216,288].map(a => `<ellipse cx="0" cy="-8" rx="6" ry="9" fill="${k%2?"#F7C9D3":"#F4B3C2"}" transform="rotate(${a})"/>`).join("")}<circle r="3" fill="#E3C15A"/></g>`).join("")}</g>
  <g class="br-r"><path d="M560 400 Q470 380 420 330 Q392 302 380 262" fill="none" stroke="#6B4A36" stroke-width="7" stroke-linecap="round"/><path d="M470 372 Q450 392 420 394" fill="none" stroke="#6B4A36" stroke-width="4" stroke-linecap="round"/>
    ${[[500,384],[454,366],[424,394],[420,326],[396,296],[382,262],[446,344]].map(([x,y],k) => `<g transform="translate(${x} ${y})">${[0,72,144,216,288].map(a => `<ellipse cx="0" cy="-8" rx="6" ry="9" fill="${k%2?"#F4B3C2":"#F7C9D3"}" transform="rotate(${a})"/>`).join("")}<circle r="3" fill="#E3C15A"/></g>`).join("")}</g>
  ${[[180,110,0],[420,300,3],[150,160,6]].map(([x,y,d]) => `<ellipse class="pt" cx="${x}" cy="${y}" rx="6" ry="9" fill="#F4B3C2" style="animation-delay:${d}s"/>`).join("")}
</svg></div>`;
const presTwo = (c, title, date, left, map) => `<div class="sl two"><div class="sh">${c ? `<div class="nmini"><i></i><i></i><i></i><b>${c.k}</b></div>` : ""}<div><h2>${title}</h2>${date ? `<p class="pd">${date}</p>` : ""}</div></div>
  <div class="sc">${left}</div><div class="sm">${map}</div></div>`;
function presFitText(st){
  const sc = st.querySelector(".sc"); if (!sc) return;
  let fs = 1; sc.style.setProperty("--fs", fs);
  while (sc.scrollHeight > sc.clientHeight + 2 && fs > 0.7) { fs -= 0.05; sc.style.setProperty("--fs", fs.toFixed(2)); }
  if (sc.scrollHeight > sc.clientHeight + 2) sc.querySelectorAll("li.op").forEach(x => x.remove());
  if (sc.scrollHeight > sc.clientHeight + 2) { const d = sc.querySelector(".desc"); if (d) d.remove(); }
  while (sc.scrollHeight > sc.clientHeight + 2 && sc.querySelectorAll("li").length > 3) sc.querySelector("li:last-of-type").remove();
}
function presSlide(){
  const el = document.getElementById("pres"), st = el.querySelector(".stage"), D = PRES.deck, sl = D[PRES.i];
  let html = "", city = null;
  const cnt = s => s.k !== "Trasferimento" && s.k !== "Pasto" && s.k !== "Hotel";
  if (sl.k === "cover") {
    const days = Math.max(0, Math.round((parse(DAYS[0].date) - today)/864e5));
    html = `<div class="sl one">${presLogo()}<div><h2 style="font-size:110px;margin-top:10px">Giappone ’27</h2><p class="pd" style="font-size:38px">6 – 21 marzo 2027 · in sei${days > 0 ? ` · mancano ${days} giorni` : ""}</p></div></div>`;
  } else if (sl.k === "nums") {
    const tappe = DAYS.reduce((a,d) => a + (d.plan ? d.plan.filter(cnt).length : 0), 0);
    const treni = DAYS.reduce((a,d) => a + (d.plan ? d.plan.filter(s => s.k === "Trasferimento").length : 0), 0);
    const nst = DAYS.reduce((a,d) => a + (d.plan ? d.plan.filter(s => s.p === "Imperdibile" && s.k !== "Trasferimento").length : 0), 0);
    const tot = BUDGET.reduce((s,b) => s + b.t, 0);
    html = `<div class="sl one"><div style="width:100%"><h2>Il viaggio in numeri</h2><div class="nums"><div><b>16</b><span>giorni</span></div><div><b>4</b><span>città</span></div><div><b>${tappe}</b><span>tappe</span></div>
      <div><b>${treni}</b><span>spostamenti</span></div><div><b>${nst}</b><span>timbri da raccogliere</span></div><div><b>${Math.round(tot/PEOPLE).toLocaleString("it-IT")} €</b><span>a testa</span></div></div></div></div>`;
  } else if (sl.k === "map") {
    html = presTwo(null, "Il percorso", "Milano → Pechino → Tokyo, poi in Shinkansen fino a Kyoto, Osaka e Nara, e ritorno a Tokyo",
      `<ul><li><b>6–7/3</b>Volo con scalo a Pechino</li><li><b>7/3</b>Tokyo</li><li><b>13/3</b>Kyoto</li><li><b>16/3</b>Osaka</li><li><b>17/3</b>Nara</li><li><b>18/3</b>Di nuovo Tokyo</li><li><b>20–21/3</b>Rientro via Pechino</li></ul>`,
      mapSVG("Japan", {mode:"all"}));
  } else if (sl.k === "city") {
    city = sl.city; const c = cityOf(city), ds = sl.days, nights = ds.filter(j => DAYS[j].hotel).length;
    const hot = [...new Set(ds.map(j => DAYS[j].hotel).filter(Boolean))];
    const imp = PLACES.filter(p => p.city === city && p.imp >= 5 && ds.includes((p.day||0)-1)).slice(0,6);
    html = `<div class="ckj">${c.k}</div>` + presTwo(c, esc(sl.ch), `${ds.length} ${ds.length === 1 ? "giorno" : "giorni"} · ${nights} ${nights === 1 ? "notte" : "notti"} · ${esc(hot.join(", "))}`,
      `<h3>Da non perdere</h3><ul>${imp.map(p => `<li><b>${String(p.day).padStart(2,"0")}</b>${esc(p.name)}</li>`).join("")}</ul>`, mapSVG(city, {mode:"all", clean:true}));
  } else if (sl.k === "day") {
    const i = sl.i, d = DAYS[i], c = cityOf(d.city), dt = parse(d.date); city = d.city;
    const rs = ROUTES.filter(r => r.day === i+1), mc = (rs.find(r => r.city !== "Japan" && r.city === d.city) || rs.find(r => r.city !== "Japan") || rs[0] || {}).city;
    const map = mc ? (mc === "Japan" ? mapSVG("Japan", {day:i+1, mode:"day", animate:true}) : mapZoomSVG(mc, i+1, true)) : "";
    let list, desc = "", meta = "";
    if (d.plan) {
      const st = d.plan.filter(s => s.k !== "Trasferimento" && s.k !== "Pasto" && !(s.k === "Hotel" && /Check-out|deposito/i.test(s.n)));
      list = st.slice(0, 12).map(s => `<li class="${s.p==="Opzionale"?"op":""}"><b>${esc(s.t)}</b>${esc(s.n)}${s.p==="Imperdibile" ? `<span class="im">Imperdibile</span>` : ""}</li>`).join("");
      const tr = d.plan.filter(s => s.k === "Trasferimento" && s.x).slice(0, 2).map(s => esc(s.x.split(/[.;]/)[0])).join(" · ");
      const top = d.plan.filter(s => s.p === "Imperdibile" && s.x && s.k !== "Trasferimento").slice(0, 2);
      desc = top.map(s => `<p><b>${esc(s.n)}</b> — ${esc(s.x.length > 150 ? s.x.slice(0, 147).replace(/\s\S*$/, "") + "…" : s.x)}</p>`).join("");
      meta = `${tr ? `<span>🚆 <b>${tr}</b></span>` : ""}${d.hotel ? `<span>🛏 <b>${esc(d.hotel)}</b></span>` : ""}`;
    } else list = [["Mattina",d.m],["Pomeriggio",d.p],["Sera",d.s]].filter(s=>s[1]).map(s => `<li><b>${s[0].slice(0,3)}</b>${esc(s[1])}</li>`).join("");
    html = presTwo(c, esc(d.title), `${GG[dt.getDay()]} ${dt.getDate()} marzo · giorno ${i+1} di ${DAYS.length}`,
      `<ul>${list}</ul>${meta ? `<div class="meta">${meta}</div>` : ""}${desc ? `<div class="desc">${desc}</div>` : ""}`, map);
  } else if (sl.k === "hotels") {
    html = `<div class="sl one"><div style="width:100%"><h2 style="margin-bottom:46px">Dove dormiamo</h2><div class="hgrid">${HOTELS.map(h => `<div class="hc" style="--c:${fillOf(cityOf(h.city).c)}"><b>${esc(h.n)}</b><span>${esc(h.city)} · ${esc(h.dates)} · ${esc(h.nights)}</span><span>${esc(h.addr)}</span></div>`).join("")}</div></div></div>`;
  } else if (sl.k === "budget") {
    const tot = BUDGET.reduce((s,b)=>s+b.t,0), paid = BUDGET.filter(b=>b.s==="Saldato").reduce((s,b)=>s+b.t,0), mx = Math.max(...BUDGET.map(b=>b.t));
    html = `<div class="sl"><div><h2>Il budget</h2><div class="nums" style="grid-template-columns:1fr;gap:30px;text-align:left"><div style="text-align:left"><b>${eur(tot/PEOPLE)}</b><span>costo totale a testa</span></div>
      <div style="text-align:left"><b style="color:var(--ok)">${eur(paid/PEOPLE)}</b><span>già pagati</span></div><div style="text-align:left"><b>${eur((tot-paid)/PEOPLE)}</b><span>ancora da pagare</span></div></div></div>
      <div class="bars">${[...BUDGET].sort((a,b)=>b.t-a.t).map(b => `<div class="br"><span>${esc(b.v)}</span><i><em class="${b.s==="Saldato"?"pd2":""}" style="width:${(b.t/mx*100).toFixed(1)}%"></em></i><s>${eur(b.t/PEOPLE)}</s></div>`).join("")}</div></div>`;
  } else if (sl.k === "end") {
    const ok = new Set(store.get("todo", [])), nx = DEADLINES.filter(x => !ok.has(x[1]) && parse(x[0]) >= today).slice(0, 6);
    html = `<div class="sl"><div><h2>Prossimi passi</h2><p class="pd">Chi se ne occupa?</p><ul>${nx.map(x => { const d = parse(x[0]); return `<li><b>${d.getDate()}/${d.getMonth()+1}</b>${esc(x[2])}</li>`; }).join("")}</ul></div>
      <div style="text-align:center"><div class="qr" style="margin:0 auto">${QRSVG}</div><p class="pd" style="margin-top:26px">Inquadrate e installate l'app</p><h3>mokay97.github.io/Giappone2027</h3></div></div>`;
  }
  const c = city ? cityOf(city) : null;
  st.style.setProperty("--c", c ? c.c : "var(--shu)"); st.style.setProperty("--cf", c ? fillOf(c.c) : "var(--shu)");
  let prevCh = null;
  const dots = D.map((x,j) => { const chg = x.ch !== prevCh && j > 0; prevCh = x.ch; return `<i class="${j <= PRES.i ? "on" : ""}${chg ? " ch" : ""}"></i>`; }).join("");
  st.innerHTML = html + `<div class="dots">${dots}</div><span class="chap">${esc(sl.ch)}</span><span class="ctr">${PRES.i+1} / ${D.length}</span>`;
  fixZoom(st); presFitText(st);
  if (sl.k === "map") st.querySelectorAll(".rt.all").forEach((p,k) => { if (p.classList.contains("fly")) return; p.setAttribute("pathLength","1"); p.style.strokeDasharray = 1; p.style.strokeDashoffset = 1; p.style.transition = `stroke-dashoffset 1.1s ease ${0.4 + k*0.45}s`; requestAnimationFrame(() => requestAnimationFrame(() => p.style.strokeDashoffset = 0)); });
}
function presFit(){ const el = document.getElementById("pres"); if (!el) return; const st = el.querySelector(".stage"); const k = Math.min(innerWidth/1920, innerHeight/1080); st.style.transform = `translate(-50%,-50%) scale(${k})`; }
function presIndex(){
  const st = document.querySelector("#pres .stage"); if (st.querySelector(".idx")) { st.querySelector(".idx").remove(); return; }
  const chs = []; PRES.deck.forEach((x,j) => { if (!chs.find(c => c.ch === x.ch)) chs.push({ch:x.ch, j}); });
  const box = document.createElement("div"); box.className = "idx"; box.innerHTML = `<h3>Indice</h3>` + chs.map(c => `<button data-j="${c.j}">${esc(c.ch)}</button>`).join("");
  box.addEventListener("click", e => { e.stopPropagation(); const b = e.target.closest("button"); if (b) { PRES.i = +b.dataset.j; presSlide(); } }); st.appendChild(box);
}
function presOpen(){
  PRES = {i:0, deck: presDeck(), theme: document.documentElement.dataset.theme || null};
  const el = document.createElement("div"); el.id = "pres"; el.innerHTML = `<div class="stage"></div>`; document.body.appendChild(el);
  presFit(); presSlide(); el.addEventListener("click", () => presGo(1)); if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
}
function presClose(){ if (!PRES) return; const th = PRES.theme; PRES = null; const el = document.getElementById("pres"); if (el) el.remove();
  if (th) document.documentElement.dataset.theme = th; else delete document.documentElement.dataset.theme;
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); }
function presGo(dir){ if (!PRES) return; const n = PRES.i + dir; if (n < 0) return; if (n >= PRES.deck.length) { presClose(); return; } PRES.i = n; presSlide(); }
addEventListener("resize", presFit);
addEventListener("keydown", e => { if (!PRES) return;
  if (["ArrowRight"," ","PageDown","Enter"].includes(e.key)) { e.preventDefault(); e.stopImmediatePropagation(); presGo(1); }
  else if (["ArrowLeft","PageUp"].includes(e.key)) { e.preventDefault(); e.stopImmediatePropagation(); presGo(-1); }
  else if (e.key === "t" || e.key === "T") { const r = document.documentElement, dark = r.dataset.theme ? r.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches; r.dataset.theme = dark ? "light" : "dark"; }
  else if (e.key === "g" || e.key === "G") { e.preventDefault(); presIndex(); }
  else if (e.key === "Escape") { e.preventDefault(); presClose(); } }, true);
document.addEventListener("fullscreenchange", () => { if (!document.fullscreenElement && PRES) presClose(); });
document.getElementById("presentBtn").addEventListener("click", presOpen);

function showSub(k){
  PSUB = k; ["scadenze","valigia","budget"].forEach(x => $("#sub-"+x).hidden = x !== k);
  $("#prepseg").querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", b.dataset.sub === k));
  if (k === "scadenze") renderDeadlines(); if (k === "valigia") renderPack(); if (k === "budget") renderMoney();
}
document.getElementById("prepseg").addEventListener("click", e => { const b = e.target.closest("button"); if (b) showSub(b.dataset.sub); });

/* ====== cartelli da mostrare ====== */
function renderCards(){ $("#cards").innerHTML = CARDS.map((c,i) => `<button data-c="${i}"><b>${c[0]}</b><small>${esc(c[2])}</small></button>`).join(""); }
function openCard(i){ const c = CARDS[i], el = document.createElement("div"); el.id = "bigcard"; el.setAttribute("role","dialog");
  el.innerHTML = `<b lang="ja">${c[0]}</b><i>${esc(c[1])}</i><span>${esc(c[2])}</span><small>Tocca per chiudere</small>`; document.body.appendChild(el);
  history.pushState({card:1}, ""); el.addEventListener("click", () => history.back()); }
function closeCard(){ const el = document.getElementById("bigcard"); if (el) el.remove(); }
addEventListener("popstate", closeCard);
document.getElementById("cards").addEventListener("click", e => { const b = e.target.closest("button"); if (b) openCard(+b.dataset.c); });
addEventListener("keydown", e => { if (e.key === "Escape" && document.getElementById("bigcard")) history.back(); });
renderCards();

/* ====== fuochi d'artificio ====== */
let hTaps = [];
function hanabi(big){
  const old = document.getElementById("hanabi"); if (old) old.remove();
  const box = document.createElement("div"); box.id = "hanabi"; document.body.appendChild(box);
  if (REDUCED) { box.classList.add("glow"); if (big) box.innerHTML = `<span class="hk" style="animation:none;opacity:1">花火</span>`; setTimeout(() => box.remove(), big ? 2400 : 1200); return; }
  const cv = document.createElement("canvas"), dpr = Math.min(2, devicePixelRatio || 1); box.appendChild(cv);
  const W = box.clientWidth, H = box.clientHeight; cv.width = W*dpr; cv.height = H*dpr; cv.style.width = W+"px"; cv.style.height = H+"px";
  const g = cv.getContext("2d"); g.scale(dpr, dpr);
  const cols = ["#E8553E","#F2A65A","#FFD27A","#9AD0FF","#B79BE0","#A9C46A","#FFFFFF","#F4B3C2"], P = [];
  const burst = (x, y, n, col, sp) => { for (let k = 0; k < n; k++) { const a = Math.PI*2*k/n + Math.random()*.2, v = sp*(.6 + Math.random()*.6); P.push({x, y, vx:Math.cos(a)*v, vy:Math.sin(a)*v, life:1, col}); } };
  const shots = big ? 16 : 5;
  for (let s = 0; s < shots; s++) setTimeout(() => burst(W*(.15 + Math.random()*.7), H*(.2 + Math.random()*.4), big ? 70 : 54, cols[s % cols.length], big ? 4.2 : 3.4), s*(big ? 260 : 380));
  if (big) setTimeout(() => { burst(W/2, H*.38, 140, "#E3C15A", 5.6); const k = document.createElement("span"); k.className = "hk"; k.textContent = "花火"; box.appendChild(k); }, shots*260 + 200);
  const end = Date.now() + (big ? 7000 : 4200);
  (function tick(){ g.clearRect(0,0,W,H); g.globalCompositeOperation = "lighter";
    for (let i = P.length - 1; i >= 0; i--) { const p = P[i]; p.x += p.vx; p.y += p.vy; p.vy += .045; p.vx *= .985; p.vy *= .985; p.life -= .012;
      if (p.life <= 0) { P.splice(i,1); continue; } g.globalAlpha = Math.max(0, p.life); g.fillStyle = p.col; g.beginPath(); g.arc(p.x, p.y, 2.2, 0, 7); g.fill(); }
    if (Date.now() < end) requestAnimationFrame(tick); else box.remove(); })();
}
document.querySelectorAll(".logo").forEach(el => el.addEventListener("click", () => {
  const now = Date.now(); hTaps = hTaps.filter(x => now - x < 2000); hTaps.push(now);
  if (hTaps.length >= 5) { hTaps = []; hanabi(true); setTimeout(() => unlockSecret("h"), 4200); } else if (hTaps.length === 1) hanabi(false);
}));

/* ====== router ====== */
const VIEWS = ["giorni","luoghi","hotel","preparativi","viaggio","info"];
const OLDV = {scadenze:["preparativi","scadenze"], valigia:["preparativi","valigia"], soldi:["preparativi","budget"]};
let PSUB = "scadenze";
function route(){
  let hv = location.hash.slice(1); if (OLDV[hv]) { PSUB = OLDV[hv][1]; hv = OLDV[hv][0]; }
  const v = VIEWS.includes(hv) ? hv : "giorni";
  VIEWS.forEach(x => $("#v-"+x).hidden = x!==v);
  document.querySelectorAll("nav.tabs a").forEach(a => a.dataset.v===v ? a.setAttribute("aria-current","page") : a.removeAttribute("aria-current"));
  if (v==="luoghi"){ renderChips(); renderMap(); renderPlaces(); setBackdrop(CITIES[state.city] ? state.city : "plain"); if (DESK()) { requestAnimationFrame(() => SC().scrollTo(0, $("#v-luoghi").offsetTop - 64)); return; } }
  if (v==="preparativi") { showSub(PSUB); setBackdrop("sceneFuji"); }
  if (v==="viaggio") { renderStamps(); setBackdrop("sceneWave"); }
  if (v==="info") setBackdrop("sceneWave");
  if (v==="info") { store.set("seenVer", APPVER); $("#newdot").hidden = true; }
  if (v==="luoghi") setBackdrop(CITIES[state.city] ? state.city : "plain");
  if (v==="hotel") { if (state.hotelJump) { const hh = HOTELS.find(h=>h.n===state.hotelJump); if (hh) state.hcity = hh.city; } renderHotels(); if (state.hotelJump) { const k = HOTELS.findIndex(h=>h.n===state.hotelJump); state.hotelJump = null; if (k>=0) { setTimeout(()=>document.getElementById("h"+k).scrollIntoView({block:"start"}), 0); return; } } }
  if (v==="giorni") showDay(cur);
  SC().scrollTo(0,0);
}

/* ====== ora locale e di Milano, meteo del giorno ====== */
const TZ = {Tokyo:"Asia/Tokyo", Kyoto:"Asia/Tokyo", Osaka:"Asia/Tokyo", Nara:"Asia/Tokyo", Milano:"Europe/Rome"};
const WX_PLACES = {Tokyo:[35.68,139.77], Kyoto:[35.01,135.77], Osaka:[34.69,135.50], Nara:[34.68,135.83], Milano:[45.46,9.19], Kawaguchiko:[35.51,138.76]};
const wxPlace = d => d.date === "2027-03-12" ? "Kawaguchiko" : d.city;
const wxFor = d => { const wx = store.get("wx", null), w = wx && wx.data && wx.data[wxPlace(d)]; if (!w) return null; const k = w.time.indexOf(d.date); return k < 0 ? null : {code:w.code[k], tmax:w.tmax[k], tmin:w.tmin[k], pp:w.pp[k], at:wx.at}; };
const clock = tz => new Intl.DateTimeFormat("it-IT", {timeZone: tz, hour: "2-digit", minute: "2-digit"}).format(NOW());
const WMO = c => c===0 ? ["☀️","sereno"] : c<=2 ? ["🌤️","poco nuvoloso"] : c===3 ? ["☁️","nuvoloso"] : c<=48 ? ["🌫️","nebbia"]
  : c<=57 ? ["🌦️","pioggerella"] : c<=67 ? ["🌧️","pioggia"] : c<=77 ? ["🌨️","neve"] : c<=82 ? ["🌧️","rovesci"] : c<=86 ? ["🌨️","neve"] : ["⛈️","temporale"];
function renderDayInfo(){
  const box = document.getElementById("dayinfo"); if (!box) return;
  const d = DAYS[cur], tz = TZ[d.city] || "Asia/Tokyo";
  const parts = [];
  parts.push(tz === "Europe/Rome" ? `<span>🕐 Milano <b>${clock("Europe/Rome")}</b> · Tokyo <b>${clock("Asia/Tokyo")}</b></span>`
                                  : `<span>🕐 ${esc(d.city)} <b>${clock(tz)}</b> · Milano <b>${clock("Europe/Rome")}</b></span>`);
  const wx = store.get("wx", null), w = wx && wx.data && wx.data[wxPlace(d)];
  if (w) { const k = w.time.indexOf(d.date);
    if (k >= 0) { const [ic, txt] = WMO(w.code[k]);
      const at = new Date(wx.at), atTxt = `${at.getDate()}/${at.getMonth()+1} ${String(at.getHours()).padStart(2,"0")}:${String(at.getMinutes()).padStart(2,"0")}`;
      parts.push(`<span class="wx">${ic} <b>${Math.round(w.tmax[k])}° / ${Math.round(w.tmin[k])}°</b> ${txt}${w.pp[k]!=null?` · ☔ ${w.pp[k]}%`:""} <small>(agg. ${atTxt})</small></span>`); } }
  box.innerHTML = parts.join("");
}
async function fetchWeather(){
  const old = store.get("wx", null);
  if (old && Date.now() - new Date(old.at).getTime() < 3*3600e3) return;
  if (!navigator.onLine) return;
  try {
    const names = Object.keys(WX_PLACES);
    const url = "https://api.open-meteo.com/v1/forecast?latitude=" + names.map(n=>WX_PLACES[n][0]).join(",") + "&longitude=" + names.map(n=>WX_PLACES[n][1]).join(",")
      + "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=16";
    const res = await fetch(url); if (!res.ok) return;
    let js = await res.json(); if (!Array.isArray(js)) js = [js];
    const data = {};
    names.forEach((n,i) => { const dd = js[i] && js[i].daily; if (dd) data[n] = {time: dd.time, code: dd.weather_code, tmax: dd.temperature_2m_max, tmin: dd.temperature_2m_min, pp: dd.precipitation_probability_max}; });
    if (Object.keys(data).length) { store.set("wx", {at: new Date().toISOString(), data}); renderDayInfo(); renderStripWx(); }
  } catch(e) { /* niente rete o richiesta bloccata: si usa l'ultima lettura salvata, se c'è */ }
}
setInterval(renderDayInfo, 30000);
function renderStripWx(){
  document.querySelectorAll("#track .stop").forEach((b, i) => { const d = DAYS[i], w = d && wxFor(d); let s = b.querySelector(".wxi");
    if (!w) { if (s) s.remove(); return; } if (!s) { s = document.createElement("span"); s.className = "wxi"; b.appendChild(s); }
    s.textContent = WMO(w.code)[0]; s.title = `${WMO(w.code)[1]}, ${Math.round(w.tmax)}° / ${Math.round(w.tmin)}°`; });
}
renderStripWx();
addEventListener("online", fetchWeather);
fetchWeather();

/* ====== swipe tra i giorni sulla scheda ====== */
/* con lo swipe si torna in cima alla pagina; con i pulsanti Prima/Dopo si resta in fondo (pageDay) */
function swipeTo(i){ showDay(i); SC().scrollTo(0, 0); }
(function swipe(){
  const day = document.getElementById("day");
  if (!day || day.dataset.swipe) return; day.dataset.swipe = "1";
  const hScroll = el => { for (let n = el; n && n !== day; n = n.parentElement) { const s = getComputedStyle(n); if ((s.overflowX === "auto" || s.overflowX === "scroll") && n.scrollWidth > n.clientWidth) return true; } return false; };
  let st = null;
  day.addEventListener("pointerdown", e => {
    if (e.pointerType === "mouse") return;
    if (e.clientX < 20 || e.clientX > innerWidth - 20) return;
    if (e.target.closest(".daymap, .route") || hScroll(e.target)) return;
    st = {x: e.clientX, y: e.clientY, id: e.pointerId};
  });
  day.addEventListener("pointercancel", () => { st = null; });
  day.addEventListener("pointerup", e => {
    if (!st || e.pointerId !== st.id) return;
    const dx = e.clientX - st.x, dy = e.clientY - st.y; st = null;
    if (Math.abs(dx) < 50 || Math.abs(dx) < 1.5*Math.abs(dy)) return;
    const next = dx < 0 ? cur + 1 : cur - 1;
    if (next < 0 || next >= DAYS.length) return;
    if (REDUCED) { swipeTo(next); return; }
    const out = dx < 0 ? "sw-out-l" : "sw-out-r", inn = dx < 0 ? "sw-in-l" : "sw-in-r";
    day.classList.remove("sw-in-l","sw-in-r"); day.classList.add(out);
    setTimeout(() => { day.classList.remove(out); swipeTo(next); void day.offsetWidth; day.classList.add(inn); setTimeout(() => day.classList.remove(inn), 260); }, 140);
  });
})();

/* ====== versioni e novità ====== */
const APPVER = "2.7.0";
const CHANGES = __D.changes;
function renderNews(){
  const [last, ...old] = CHANGES;
  $("#verTag").textContent = "v" + APPVER; $("#verFoot").textContent = APPVER;
  const ul = c => `<ul>${c.items.map(i => `<li>${esc(i)}</li>`).join("")}</ul>`;
  $("#news").innerHTML = `<div class="rel"><h3>${esc(last.v)} · ${esc(last.t)}</h3><p>${last.d ? esc(last.d) : ""}</p>${ul(last)}</div>
    <details><summary>Versioni precedenti</summary>${old.map(c => `<div class="old"><b>${esc(c.v)} · ${esc(c.t)}</b>${c.d ? `<small>${esc(c.d)}</small>` : ""}${ul(c)}</div>`).join("")}</details>`;
  $("#newdot").hidden = store.get("seenVer", "") === APPVER;
}
renderNews();
/* ====== scadenze pre-viaggio e valigia ====== */
const MESI = ["gennaio","febbraio","marzo","aprile","maggio","giugno","luglio","agosto","settembre","ottobre","novembre","dicembre"];
const ymd = s => s.replace(/-/g,"");
const nextDay = s => { const d = parse(s); d.setDate(d.getDate()+1); return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`; };
function gcalURL(x){ const p = new URLSearchParams({action:"TEMPLATE", text:"Giappone ’27: " + x[2], dates:`${ymd(x[0])}/${nextDay(x[0])}`, details:x[3] + "\n\nDalla guida Giappone ’27"}); return "https://calendar.google.com/calendar/render?" + p.toString(); }
function icsFile(x){
  const esc2 = s => s.replace(/[\\,;]/g, m => "\\" + m).replace(/\n/g,"\\n");
  const body = ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Giappone27//IT","BEGIN:VEVENT",`UID:${x[1]}@giappone27`,`DTSTAMP:${ymd(new Date().toISOString().slice(0,10))}T000000Z`,
    `DTSTART;VALUE=DATE:${ymd(x[0])}`,`DTEND;VALUE=DATE:${nextDay(x[0])}`,`SUMMARY:${esc2("Giappone ’27: " + x[2])}`,`DESCRIPTION:${esc2(x[3])}`,"BEGIN:VALARM","TRIGGER:-PT9H","ACTION:DISPLAY","DESCRIPTION:Promemoria","END:VALARM","END:VEVENT","END:VCALENDAR"].join("\r\n");
  return "data:text/calendar;charset=utf-8," + encodeURIComponent(body);
}
function renderDeadlines(){
  const ok = new Set(store.get("todo", [])), now = new Date(); now.setHours(0,0,0,0);
  let html = "", lastM = "";
  DEADLINES.forEach(x => {
    const d = parse(x[0]), m = MESI[d.getMonth()] + " " + d.getFullYear(), days = Math.round((d - now)/864e5), done = ok.has(x[1]);
    if (m !== lastM) { lastM = m; html += `<h2 class="dmonth">${m[0].toUpperCase() + m.slice(1)}</h2>`; }
    const when = done ? "fatto" : days > 1 ? `tra ${days} giorni` : days === 1 ? "domani" : days === 0 ? "oggi" : `scaduta da ${-days} ${days===-1?"giorno":"giorni"}`;
    html += `<div class="dl${done?" ok":""}${!done && days < 0 ? " late" : ""}"><input type="checkbox" data-t="${x[1]}"${done?" checked":""} aria-label="Fatto: ${esc(x[2])}">
      <div><p class="dt"><b>${GG[d.getDay()].slice(0,3)} ${d.getDate()} ${MESI[d.getMonth()]}</b> · ${when}</p><p class="tt">${esc(x[2])}</p><p class="nt">${esc(x[3])}</p></div>
      <div class="cal"><a class="btn" href="${gcalURL(x)}" target="_blank" rel="noopener">Google Calendar</a><a class="btn" href="${icsFile(x)}" download="giappone27-${x[1]}.ics">File .ics</a></div></div>`;
  });
  $("#dlist").innerHTML = html;
  const n = DEADLINES.filter(x => ok.has(x[1])).length;
  $("#dlstat").textContent = `${n} su ${DEADLINES.length} fatte. Le spunte restano salvate su questo telefono.`;
  const soon = DEADLINES.some(x => !ok.has(x[1]) && (parse(x[0]) - now)/864e5 <= 7);
  $("#dldot").hidden = !soon;
}
document.getElementById("dlist").addEventListener("change", e => {
  const id = e.target.dataset.t; if (!id) return;
  const ok = new Set(store.get("todo", [])); e.target.checked ? ok.add(id) : ok.delete(id);
  store.set("todo", [...ok]); renderDeadlines();
});
function renderPack(){
  const ok = new Set(store.get("pack", []));
  const all = PACK.flatMap(g => g[1]);
  $("#pkstat").textContent = `${all.filter(x => ok.has(x[0])).length} su ${all.length} pronte. Ognuno spunta la sua valigia: restano salvate su questo telefono.`;
  const al = [], fmtD = d => `${parse(d.date).getDate()}/3`;
  DAYS.forEach(d => { if (d.city === "Milano") return; const w = wxFor(d); if (!w) return; const where = wxPlace(d);
    if (w.pp != null && w.pp >= 60) al.push(["☔", `Pioggia prevista a ${where} il ${fmtD(d)} (${w.pp}%): ombrello`]);
    if (w.tmin <= 3) al.push(["🧣", `Freddo a ${where} il ${fmtD(d)} (minima ${Math.round(w.tmin)}°): strati pesanti e guanti`]);
    if (w.tmax >= 18) al.push(["👕", `Caldo a ${where} il ${fmtD(d)} (massima ${Math.round(w.tmax)}°): qualcosa di leggero`]); });
  const wxBox = al.length ? `<div class="pkwx"><b>Dalle previsioni del meteo</b>${al.map(a => `<p>${a[0]} ${esc(a[1])}</p>`).join("")}</div>` : "";
  $("#pklist").innerHTML = wxBox + PACK.map(([title, items]) => `<div class="pk"><h3>${esc(title)}</h3>${items.map(([id, txt, q, note]) =>
    `<label class="${ok.has(id)?"ok":""}"><input type="checkbox" data-p="${id}"${ok.has(id)?" checked":""}><span class="tx">${esc(txt)}${note?`<small>${esc(note)}</small>`:""}</span><span class="q">${esc(q)}</span></label>`).join("")}</div>`).join("");
}
document.getElementById("pklist").addEventListener("change", e => {
  const id = e.target.dataset.p; if (!id) return;
  const ok = new Set(store.get("pack", [])); e.target.checked ? ok.add(id) : ok.delete(id);
  store.set("pack", [...ok]); renderPack();
});
renderDeadlines(); renderPack();
/* tastiera: frecce ← → per cambiare giorno nella vista Giorni */
addEventListener("keydown", e => {
  if (PRES || $("#v-giorni").hidden || e.altKey || e.ctrlKey || e.metaKey) return;
  if (e.target.closest && e.target.closest("input, textarea, select")) return;
  if (e.key === "ArrowRight" && cur < DAYS.length-1) { e.preventDefault(); showDay(cur+1); }
  if (e.key === "ArrowLeft" && cur > 0) { e.preventDefault(); showDay(cur-1); }
});
/* rotellina del mouse: scorrimento orizzontale delle file (date, città, giorni) */
function wheelScroll(el){
  el.addEventListener("wheel", e => {
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX) || el.scrollWidth <= el.clientWidth) return;
    const max = el.scrollWidth - el.clientWidth;
    if ((e.deltaY < 0 && el.scrollLeft <= 0) || (e.deltaY > 0 && el.scrollLeft >= max - 1)) return;
    e.preventDefault();
    el.scrollLeft += e.deltaY * (e.deltaMode === 1 ? 32 : 1);
  }, {passive:false});
}
["#route","#chips","#hchips","#daypick"].forEach(s => { const el = $(s); if (el) wheelScroll(el); });
addEventListener("hashchange", route);
route();

/* ====== animazione di apertura ======
   - ogni apertura dell'app: sole, kanji, linea della metro, aereo che atterra nella barra
   - ritorno dall'app in background: solo l'aereo che scorre lungo la barra */
function introPhase(){
  const P = PHASE(), sun = `<circle class="i-sun" cx="180" cy="270" r="84" fill="var(--alert)"/>`;
  const kan = `<text class="i-k" x="146" y="294" text-anchor="middle" style="animation-delay:.32s">日</text><text class="i-k" x="214" y="294" text-anchor="middle" style="animation-delay:.5s">本</text>`;
  const days = Math.max(0, Math.round((parse(DAYS[0].date) - today)/864e5));
  const stamps = Object.keys(store.get("stamps", {})).length;
  if (P === "last") return {sun, kan, title:"Ci siamo quasi!", sub:`${days === 1 ? "Domani" : "Mancano " + days + " giorni"} · Milano → Tokyo`};
  if (P === "trip") { const k = DAYS.findIndex(d => d.date === nowJ().date), d = DAYS[k];
    return {sun: sun + `<g class="i-sun" fill="none" stroke="#7A4A2E" stroke-width="3" stroke-linecap="round"><path d="M250 190 Q228 214 210 214 M232 205 Q240 222 236 236"/></g><g class="i-sun"><circle cx="252" cy="188" r="9" fill="#F4B3C2"/><circle cx="214" cy="212" r="8" fill="#F7C9D3"/><circle cx="238" cy="238" r="7" fill="#F4B3C2"/></g>`,
      kan, title:`Giorno ${k+1} · ${esc(d.title)}`, sub:`${GG[parse(d.date).getDay()]} ${parse(d.date).getDate()} marzo · ${esc(d.city)}`}; }
  if (P === "back") return {sun, kan, title:"Okaeri!", sub:`Bentornati · ${stamps} ${stamps === 1 ? "timbro raccolto" : "timbri raccolti"}`};
  if (P === "xmas") return {sun:`<circle class="i-sun" cx="180" cy="270" r="84" fill="var(--soft)" stroke="var(--line)" stroke-width="2"/><circle class="i-sun" cx="214" cy="248" r="62" fill="var(--bg)" opacity=".55"/>`,
    kan:`<text class="i-k" x="180" y="372" text-anchor="middle" style="animation-delay:.32s;fill:var(--shu);font-size:30px">メリークリスマス</text>`, title:"Buon Natale!", sub:`e ${days} giorni al Giappone`};
  if (P === "ny") return {sun:`<circle class="i-sun" cx="180" cy="262" r="70" fill="var(--alert)"/><path class="i-sun" d="M40 340 L150 236 H210 L320 340 Z" fill="var(--ink)"/><path class="i-sun" d="M150 236 L166 252 L180 240 L194 254 L210 236" fill="none" stroke="var(--bg)" stroke-width="5" stroke-linejoin="round"/>`,
    kan:`<text class="i-k" x="180" y="372" text-anchor="middle" style="animation-delay:.32s;fill:var(--shu);font-size:24px">あけましておめでとう</text>`, title:"Buon anno!", sub:`e ${days} giorni al Giappone`};
  return {sun, kan, title:"Giappone ’27", sub:"6 – 21 marzo · Tokyo, Kyoto, Osaka, Nara"};
}
function playIntro(){
  const IP = introPhase();
  const cols = DAYS.map(d => cityOf(d.city).c), n = DAYS.length, x0 = 44, x1 = 316, ly = 470;
  const xs = DAYS.map((_,k) => x0 + k*(x1-x0)/(n-1));
  const segs = xs.slice(1).map((x,k) => `<path d="M${xs[k]} ${ly} L${x} ${ly}" stroke="${cols[k+1]}" stroke-width="6" stroke-linecap="round"/>`).join("");
  const stops = xs.map((x,k) => `<circle class="i-st" cx="${x}" cy="${ly}" r="6.5" fill="var(--bg)" stroke="${cols[k]}" stroke-width="3.5" style="animation-delay:${(0.78+k*0.04).toFixed(2)}s"/>`).join("");
  const ov = document.createElement("div");
  ov.id = "intro"; ov.setAttribute("aria-hidden","true");
  ov.innerHTML = `<svg viewBox="0 0 360 640" preserveAspectRatio="xMidYMid meet">
    ${IP.sun}
    ${IP.kan}
    <text class="i-title" x="180" y="404" text-anchor="middle">${IP.title}</text>
    <text class="i-sub" x="180" y="428" text-anchor="middle">${IP.sub}</text>
    <g class="i-line">${segs}</g>${stops}
    <circle id="iEnd" cx="${x1}" cy="${ly}" r="0"/><circle id="iStart" cx="${x0}" cy="${ly}" r="0"/>
  </svg>`;
  const plane = document.createElement("div");
  plane.id = "introPlane";
  plane.innerHTML = $("#flPlane").outerHTML.replace('id="flPlane"','').replace('class="fl-plane"','style="width:100%;height:100%"');
  document.body.append(ov, plane);
  const hp = $("#flPlane"), fill = $("#flFill");
  hp.style.visibility = "hidden"; fill.style.width = "0%"; hp.style.left = (FLIGHT_PCT*100)+"%";
  const timers = [];
  const pt = id => { const r = ov.querySelector(id).getBoundingClientRect(); return {x: r.left + r.width/2, y: r.top + r.height/2}; };
  const at = (x,y) => `translate(${x-15}px, ${y-15}px)`;
  let anim;
  const finish = () => {
    timers.forEach(clearTimeout); if (anim) anim.cancel();
    ov.remove(); plane.remove();
    fill.style.transition = ""; hp.style.visibility = ""; flightTo(false);
  };
  ov.addEventListener("click", finish);
  timers.push(setTimeout(() => {
    const s = pt("#iStart"), e = pt("#iEnd");
    anim = plane.animate([{transform: at(s.x,s.y), opacity: 0}, {transform: at(s.x+12,s.y), opacity: 1, offset: .12}, {transform: at(e.x,e.y), opacity: 1}],
      {duration: 680, easing: "cubic-bezier(.45,0,.25,1)", fill: "forwards"});
  }, 1120));
  timers.push(setTimeout(() => {
    const e = pt("#iEnd"), tr = $(".fl-track").getBoundingClientRect();
    const tx = tr.left + FLIGHT_PCT*tr.width, ty = tr.top + 14;
    ov.classList.add("out");
    anim = plane.animate([{transform: at(e.x,e.y)}, {transform: at(tx,ty)}], {duration: 480, easing: "cubic-bezier(.2,.7,.2,1)", fill: "forwards"});
    fill.style.transition = "width .48s cubic-bezier(.2,.7,.2,1)";
    requestAnimationFrame(() => { fill.style.width = (FLIGHT_PCT*100)+"%"; });
  }, 1860));
  timers.push(setTimeout(finish, 2400));
}
(function startup(){
  setFavicon(); updateSky(); setTimeout(checkSecrets, 3000);
  const P0 = PHASE();
  if (!REDUCED) { playIntro(); if (P0 === "xmas") snow(); else if (P0 !== "ny") petals(); }
  else flightTo(true);
  let hiddenAt = 0;
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { hiddenAt = Date.now(); return; }
    if (hiddenAt && Date.now() - hiddenAt > 10000 && !document.getElementById("intro")) flightTo(true);
  });
})();

/* aggiornamento pronto: il nuovo service worker ha preso il controllo */
if ("serviceWorker" in navigator) {
  let hadCtrl = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!hadCtrl) { hadCtrl = true; return; }
    if (document.getElementById("updbar")) return;
    const b = document.createElement("button"); b.id = "updbar"; b.textContent = "Aggiornamento pronto · tocca per ricaricare"; b.onclick = () => location.reload(); document.body.appendChild(b);
  });
}
})();
