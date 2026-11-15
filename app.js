/* Giappone 2027 – logica della guida. I dati sono in data.json */
(async () => {
const __D = await fetch('data.json').then(r => r.json());
/* ====== DATI: modificabili ====== */
const DAYS = __D.days;
const PLACES = __D.places;
const BUDGET = __D.budget;
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
const HOTELS = [
  {n:"Toshi Hotel", full:"Toshi Center Hotel", city:"Tokyo", addr:"2-4-1 Hirakawachō, Chiyoda", dates:"7 → 13 marzo", nights:"6 notti", cost:1324, cin:"15:00", cout:"11:00",
   desc:"Hotel moderno in un edificio alto nel quartiere di Nagatachō, il cuore politico di Tokyo. Le camere sono dal 15° piano in su, con vista sullo skyline. Ci sono due ristoranti e la colazione a buffet (circa 1.980 yen a persona).",
   pos:"A 3 minuti a piedi dalla stazione Nagatachō (linee Hanzōmon, Namboku e Yūrakuchō) e a 4 da Kōjimachi. Il Palazzo Imperiale è a circa 12 minuti a piedi.",
   tip:"Da Haneda c’è l’Airport Limousine Bus fino a Tokyo Garden Terrace Kioichō, proprio di fronte all’hotel: comodo il primo giorno, con le valigie.",
   url:"https://www.booking.com/hotel/jp/toshi-center.it.html"},
  {n:"INA House Nijojo", full:"INA House Nijojo", city:"Kyoto", addr:"Inabachō 456, Kamigyō", dates:"13 → 16 marzo", nights:"3 notti", cost:492, cin:"15:00", cout:"10:00",
   desc:"Aparthotel con camere familiari, angolo cottura (microonde, frigo, piastra) e lavatrice in camera: utile a metà viaggio per fare il bucato. Non ci sono colazione né ristorante.",
   pos:"Zona residenziale tranquilla a nord-ovest del Castello Nijō, a circa 11 minuti a piedi. Il Kitano Tenmangū è a circa 19 minuti: comodo per la giornata del Kinkaku-ji.",
   tip:"Le valigie spedite da Tokyo arrivano qui il 12: chiedete conferma che le tengano fino al check-in del 13.",
   url:"https://www.booking.com/Share-vwwL5J"},
  {n:"Hotel Morning Box", full:"Hotel Morning Box Osaka Shinsaibashi", city:"Osaka", addr:"1-10-3 Higashi-Shinsaibashi, Chūō", dates:"16 → 17 marzo", nights:"1 notte", cost:128, cin:"15:00", cout:"11:00",
   desc:"Capsule hotel solo per adulti, con spa e sauna, collegato al centro commerciale sotterraneo di Nagahori.",
   pos:"Vicino alla stazione Nagahoribashi, a 400 metri dalla galleria commerciale di Shinsaibashi e a circa 15 minuti a piedi da Dotonbori.",
   tip:"Nei capsule hotel i piani sono spesso separati tra uomini e donne: verificate nella prenotazione se avete capsule o camere. Chiedete anche se tengono gli zaini prima del check-in.",
   url:"https://www.booking.com/Share-QoFsbZT", mapPoint:"Morning Box"},
  {n:"Mikasa Ryokan", full:"Mikasa Ryokan", city:"Nara", addr:"728-10 Kawakami-chō", dates:"17 → 18 marzo", nights:"1 notte, cena e colazione", cost:873.92, cin:"15:00", cout:"10:30",
   desc:"Ryokan tradizionale con camere in tatami e futon, bagni termali interni e all’aperto e alcune camere con onsen privato. Dalla sala da pranzo si vede tutta Nara.",
   pos:"Sulle pendici del monte Wakakusa, accanto alla foresta primordiale di Kasuga, a circa 1,6 km dal Tōdai-ji. Fuori dal centro: si arriva con la navetta.",
   tip:"Navetta gratuita dalla stazione Kintetsu-Nara (circa 10 minuti). Da JR Nara la navetta va prenotata via email. La sera l’hotel organizza un giro gratuito al panorama del monte Wakakusa.",
   url:"https://www.booking.com/hotel/jp/mikasa.html", mapPoint:"Mikasa Ryokan"},
  {n:"Hotel Vintage", full:"Hotel Vintage", city:"Tokyo", addr:"2-10-7 Irifune, Chūō", dates:"18 → 20 marzo", nights:"2 notti", cost:599, cin:"15:00", cout:"10:00",
   desc:"Hotel di tre stelle con junior suite, alcune con balcone. Piccolo e tranquillo, in una zona residenziale del centro.",
   pos:"Tra Hatchōbori (circa 430 metri) e Tsukiji: il mercato esterno di Tsukiji, per una colazione a base di pesce, è a una breve passeggiata. La Stazione di Tokyo è a circa 1,5 km.",
   tip:"Le valigie spedite da Kyoto il 15 arrivano qui prima di voi: chiedete per iscritto che le custodiscano fino al 18.",
   url:"https://www.booking.com/Share-Dr0MgK7"}
];
function renderHotels(){
  const sel = state.hcity || store.get("hcity","Tutte");
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
const PHRASES = [
  ["Sumimasen","Mi scusi / permesso"],["Arigatō gozaimasu","Grazie"],
  ["Rokunin desu","Siamo in sei"],["Eigo no menyū wa arimasu ka?","Avete un menu in inglese?"],
  ["Kore o kudasai","Questo, per favore"],["Okaikei onegaishimasu","Il conto, per favore"],
  ["… wa doko desu ka?","Dov’è …?"],["Daijōbu desu","Va bene / no, grazie"]
];

/* ====== storage ====== */
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
const today = new Date(); today.setHours(0,0,0,0);
const start = parse(DAYS[0].date);
const diff = Math.round((start - today)/864e5);
let todayIdx = DAYS.findIndex(d => parse(d.date).getTime() === today.getTime());
let FLIGHT_PCT = 0;
const DEPARTURE = new Date("2027-03-06T12:30:00+01:00"); // volo da Milano
/* conto alla rovescia progressivo: mesi e giorni, poi giorni ore minuti, poi ore e minuti */
function countdownHTML(){
  const now = new Date();
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
(function flight(){
  const from = parse(COUNTDOWN_FROM);
  let pct, label;
  if (diff > 0) {
    pct = Math.min(1, Math.max(0, (today - from) / (start - from)));
    label = countdownHTML();
    setInterval(() => { const h = countdownHTML(); if (h) $("#flLabel").innerHTML = h; }, 20000);
  } else if (todayIdx >= 0) {
    pct = 1; label = `<strong>Siamo in Giappone!</strong> Giorno ${todayIdx+1} di ${DAYS.length}, ${esc(DAYS[todayIdx].city)}`;
  } else { pct = 1; label = `<strong>Okaeri!</strong> Bentornati a casa`; }
  $("#flLabel").innerHTML = label;
  FLIGHT_PCT = pct;
})();
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
const IC_WALK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13" cy="4" r="2"/><path d="M10 21l2-6 3 3v4M8 12l2-4 4 1 2 4 3 1M10 8l-2 5"/></svg>`;
const IC_TRAIN = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="13" rx="3"/><path d="M5 10h14M9 20l-2 2M15 20l2 2M8.5 13.5h.01M15.5 13.5h.01"/></svg>`;
function gmapsURL(nv){
  const p = new URLSearchParams({api:"1", origin:nv.o, destination:nv.g, travelmode:nv.m});
  if (nv.v && nv.v.length && nv.m !== "transit") p.set("waypoints", nv.v.join("|"));
  return "https://www.google.com/maps/dir/?" + p.toString();
}
function navBtn(nv){
  const walk = nv.m === "walking";
  return `<a class="navbtn${walk?"":" tr"}" href="${gmapsURL(nv)}" target="_blank" rel="noopener">${walk?IC_WALK:IC_TRAIN}<span>${walk ? (nv.v && nv.v.length ? "Percorso a piedi (il nostro)" : "Percorso a piedi") : "Indicazioni con i mezzi"}</span></a>`;
}
function planHTML(plan){
  const hide = store.get("hideOpt", false);
  let last = null;
  const navs = plan.map(s => { if (!s.nav) return null; const o = s.nav.o || last; last = s.nav.g; return (o && o !== s.nav.g) ? {...s.nav, o} : null; });
  const items = plan.map((s,i) => [s, navs[i]]).filter(([s]) => !(hide && s.p==="Opzionale")).map(([s, nv]) => {
    const [c,l] = PTYPE[s.k] || ["walk", s.k];
    const pr = s.p==="Imperdibile" ? `<span class="pr imp">Imperdibile</span>` : s.p==="Opzionale" ? `<span class="pr opt">Opzionale</span>` : "";
    return `<li class="pl ${c}${s.p==="Opzionale"?" isopt":""}"><time>${esc(s.t)}</time><div class="pc">
      <p class="pn">${esc(s.n)}</p><div class="pm"><span>${l}</span>${s.d && s.d!=="—" ? `<span>${esc(s.d)}</span>` : ""}${pr}</div>
      ${s.x ? `<p class="px">${esc(s.x)}</p>` : ""}${nv ? navBtn(nv) : ""}</div></li>`;
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
  if (p1) window.scrollBy(0, p1.getBoundingClientRect().top - before);
  const maps = document.querySelectorAll("#day .daymap"), m = maps[maps.length-1];
  if (m) { const r = m.getBoundingClientRect(); if (r.top < 8) window.scrollBy(0, r.top - 8); }
}
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
    <div class="day-head">
      <div class="kanji${[...c.k].length>2?" k3":""}" aria-hidden="true">${[...c.k].map(ch=>`<span>${ch}</span>`).join("")}</div>
      <h2 aria-live="polite">${esc(d.title)}</h2><p>${GG[dt.getDay()]} ${dt.getDate()} marzo · giorno ${i+1} di ${DAYS.length}</p>
      <div class="dayinfo" id="dayinfo"></div>
    </div>
    ${d.plan ? planHTML(d.plan) : `<ul class="slots">${slots.map(s=>`<li><h3>${s[0]}</h3><p>${esc(s[1])}</p></li>`).join("")}</ul>`}
    ${ROUTES.some(r=>r.day===i+1) ? ROUTES.filter(r=>r.day===i+1 && (r.city!=="Japan" || r.card)).sort((a,b)=>((b.city==="Japan")-(a.city==="Japan")) || ((a.city===d.city)-(b.city===d.city))).map(r=>r.city).filter((c,k,a)=>a.indexOf(c)===k).map(c=>`<div class="daymap" data-city="${c}">${c==="Japan" ? mapSVG(c,{day:i+1, mode:"day", animate:true}) : mapZoomSVG(c, i+1, true)}</div>`).join("") : ""}
    ${d.n ? `<p class="note${d.alert?" alert":d.decide?" decide":""}">${esc(d.n)}</p>` : ""}
    ${d.hotel ? `<div class="sleep"><span>Stanotte: <a class="hlink" href="#hotel" data-h="${esc(d.hotel)}"><b>${esc(d.hotel)}</b></a></span><a class="btn" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(HOTEL_Q[d.hotel]||d.hotel+" "+d.city)}" target="_blank" rel="noopener">Mappa</a></div>` : ""}
    <div class="pager">
      <button class="btn" id="prev" ${i===0?"disabled":""}>‹ Prima</button>
      ${CITIES[d.city] && d.city!=="Milano" ? `<button class="btn solid" id="seeCity">Mappa e luoghi di ${esc(d.city)}</button>` : ""}
      <button class="btn" id="next" ${i===DAYS.length-1?"disabled":""}>Dopo ›</button>
    </div>`;
  fixZoom(el);
  $("#dayLive").textContent = `Giorno ${i+1}, ${d.title}, ${dt.getDate()} marzo`;
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

/* ====== luoghi ====== */
let done = new Set(store.get("done", []));
const state = { city: store.get("city","Tutte"), imp: "all", q: "", zone: null, focusDay: null };
const cityList = ["Tutte","Tokyo","Kyoto","Osaka","Nara","Altre"];
function renderChips(){
  $("#chips").innerHTML = cityList.map(n => {
    const c = CITIES[n] ? CITIES[n].c : (n==="Altre" ? "var(--other)" : "");
    return `<button class="chip" ${c?`style="--c:${c};--cf:${fillOf(c)}"`:""} data-city="${n}" aria-pressed="${state.city===n}">${n}</button>`;
  }).join("");
}
$("#chips").addEventListener("click", e => { const b=e.target.closest(".chip"); if(!b) return; state.city=b.dataset.city; state.zone=null; state.focusDay=null; store.set("city",state.city); renderChips(); renderMap(); renderPlaces(); });
$("#seg").addEventListener("click", e => { const b=e.target.closest("button"); if(!b) return; state.imp=b.dataset.imp; $("#seg").querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed", x===b)); renderPlaces(); });
$("#q").addEventListener("input", e => { state.q = e.target.value.trim().toLowerCase(); renderPlaces(); });
$("#hideDone").checked = store.get("hide", false);
$("#hideDone").addEventListener("change", e => { store.set("hide", e.target.checked); renderPlaces(); });

function renderPlaces(){
  const hide = $("#hideDone").checked;
  let list = PLACES.filter(p => {
    if (state.city==="Altre" ? !p.other : (state.city!=="Tutte" && p.city!==state.city)) return false;
    if (state.zone && !zoneById(state.zone).pl.includes(p.name)) return false;
    if (state.imp!=="all" && !state.imp.includes(String(p.imp))) return false;
    if (state.q && !(p.name+" "+(p.desc||"")+" "+p.city).toLowerCase().includes(state.q)) return false;
    if (hide && done.has(p.id)) return false;
    return true;
  }).sort((a,b) => b.imp - a.imp);
  const scope = PLACES.filter(p => state.city==="Altre" ? p.other : (state.city==="Tutte" || p.city===state.city));
  const seen = scope.filter(p => done.has(p.id)).length;
  $("#pstat").textContent = `${list.length} luoghi mostrati · visti ${seen} su ${scope.length}`;
  $("#plist").innerHTML = list.length ? list.map(p => {
    const c = cityOf(p.city).c;
    const price = p.price === null || p.price === undefined ? "" : (p.price===0 ? "Gratis" : `~${p.price} €`);
    return `<li class="place${done.has(p.id)?" done":""}${p.imp<=1?" scart":""}" style="--c:${c}">
      <button class="tick" data-id="${p.id}" aria-label="Segna ${esc(p.name)} come visto" aria-pressed="${done.has(p.id)}"><span class="tc"><svg viewBox="0 0 24 24" fill="none" stroke="var(--surface)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg></span></button>
      <div>
        <p class="pname">${esc(p.name)}</p>
        <div class="meta"><span class="cityname">${esc(p.city)}</span>
          ${p.imp>=5 ? `<span class="pr imp">Imperdibile</span>` : p.imp>=2 ? `<span class="pr opt">Opzionale</span>` : `<span class="pr off">Scartato</span>`}
          ${price?`<span>${price}</span>`:""}${p.added?`<span class="newtag">suggerito</span>`:""}</div>
      </div>
      <details><summary>Dettagli</summary><p>${esc(p.desc)}</p>
        <a class="btn" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name+" "+p.city+" Japan")}" target="_blank" rel="noopener">Apri in Maps</a></details>
    </li>`;
  }).join("") : `<li class="empty">Nessun luogo con questi filtri. Prova “Tutti” o svuota la ricerca.</li>`;
}
$("#plist").addEventListener("click", e => {
  const b = e.target.closest(".tick"); if(!b) return;
  const id = b.dataset.id; done.has(id) ? done.delete(id) : done.add(id);
  store.set("done", [...done]); renderPlaces(); renderMap();
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
function mapSVG(city, {day=null, sel=null, mode="all", animate=false, hotel=null} = {}){
  const m = MAPS[city], col = (CITIES[city]||{}).c || "var(--alert)", B = m.bend ?? 0.18;
  const routes = hotel ? [] : ROUTES.filter(r => r.city===city);
  const focus = routes.filter(r => r.day===day);
  const onRoute = new Set(routes.flatMap(r => r.opt ? [] : r.s));
  const onOpt = new Set(routes.flatMap(r => r.opt ? r.s : []));
  const onFocus = new Set(focus.flatMap(r => r.s));
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
  return `<svg viewBox="0 0 ${m.w} ${m.h}" style="--c:${col};--cf:${fillOf(col)}" role="group" aria-label="Mappa stilizzata di ${city==="Japan"?"Giappone":esc(city)}${day?", percorso del giorno "+day:""}"><rect class="${m.sea?"water":"land"}" width="${m.w}" height="${m.h}"/>${m.base}${back}${front}${lms}${hots}${edges}${stops}${badges}${scale}${north}</svg>`;
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
  $("#map").innerHTML = mapSVG(key, {day: fd, sel: state.zone, mode: "all", animate: state._anim});
  state._anim = false;
  const dp = $("#daypick"); dp.style.setProperty("--c", col); dp.style.setProperty("--cf", fillOf(col));
  dp.innerHTML = `<button data-d="" aria-pressed="${!fd}">Tutti</button>` + cityDays(key).map(n =>
    `<button data-d="${n}" aria-pressed="${fd===n}">${String(n).padStart(2,"0")} · ${dayLabel(n)}</button>`).join("");
  $("#maplegend").style.setProperty("--c", col);
  $("#maplegend").innerHTML = key==="Japan" ? `<span><i></i>percorso</span><span><i class="o"></i>da decidere</span><span><i class="x"></i>fuori programma</span><span>tocca una città per aprirne la mappa</span>` : `<span><i></i>percorso</span><span><i class="o"></i>da decidere</span><span><i class="x"></i>non previsto</span>`;
  const zi = $("#zinfo");
  if (state.zone) {
    const z = zoneById(state.zone);
    const inZone = PLACES.filter(p => z.pl.includes(p.name)), seen = inZone.filter(p => done.has(p.id)).length;
    const dd = z.d.map(n=>`<button class="btn" data-day="${n}">Giorno ${n}, ${dayLabel(n)}</button>`).join("")
             + z.opt.map(n=>`<button class="btn" data-day="${n}">Giorno ${n} (da decidere)</button>`).join("");
    zi.innerHTML = `<h3>${esc(z.n)}</h3><p>${z.d.length||z.opt.length ? "" : "Non è nel programma. "}${inZone.length} luoghi, visti ${seen}</p>
      <div class="zbtns">${dd}<button class="btn" id="zall">${key==="Japan"?"Mostra tutto":"Tutta "+esc(state.city)}</button></div>`;
  } else if (fd) {
    const d = DAYS[fd-1];
    zi.innerHTML = `<p>Giorno ${fd}, ${dayLabel(fd)}: ${esc(d.title)}. Tocca una fermata per vedere i luoghi.</p><div class="zbtns"><button class="btn" data-day="${fd}">Apri il giorno ${fd}</button></div>`;
  } else {
    zi.innerHTML = `<p>Scegli un giorno per evidenziarne il percorso, oppure tocca una fermata per vedere i luoghi che contiene.</p>`;
  }
}
function pickZone(id){
  state.zone = state.zone===id ? null : id;
  renderMap(); renderPlaces();
}
function goCity(c){ state.city = c; state.zone = null; state.focusDay = null; store.set("city", c); renderChips(); renderMap(); renderPlaces(); window.scrollTo(0,0); }
$("#map").addEventListener("click", e => { const g = e.target.closest(".st"); if (!g) return; g.dataset.go ? goCity(g.dataset.go) : pickZone(g.dataset.z); });
$("#map").addEventListener("keydown", e => { const g = e.target.closest(".st"); if (g && (e.key==="Enter"||e.key===" ")) { e.preventDefault(); g.dataset.go ? goCity(g.dataset.go) : pickZone(g.dataset.z); } });
$("#daypick").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; state.focusDay = b.dataset.d ? +b.dataset.d : null; state.zone = null; state._anim = true; renderMap(); renderPlaces(); });
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
$("#reset").onclick = () => { if (confirm("Azzerare tutti i luoghi segnati come visti?")) { done = new Set(); store.set("done", []); renderPlaces(); } };
$("#theme").onclick = () => {
  const r = document.documentElement, darkNow = r.dataset.theme ? r.dataset.theme==="dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  r.dataset.theme = darkNow ? "light" : "dark"; store.set("theme", r.dataset.theme);
};
const th = store.get("theme", null); if (th) document.documentElement.dataset.theme = th;

/* ====== router ====== */
const VIEWS = ["giorni","luoghi","hotel","soldi","info"];
function route(){
  const v = VIEWS.includes(location.hash.slice(1)) ? location.hash.slice(1) : "giorni";
  VIEWS.forEach(x => $("#v-"+x).hidden = x!==v);
  document.querySelectorAll("nav.tabs a").forEach(a => a.dataset.v===v ? a.setAttribute("aria-current","page") : a.removeAttribute("aria-current"));
  if (v==="luoghi"){ renderChips(); renderMap(); renderPlaces(); }
  if (v==="soldi") renderMoney();
  if (v==="hotel") { if (state.hotelJump) { const hh = HOTELS.find(h=>h.n===state.hotelJump); if (hh) state.hcity = hh.city; } renderHotels(); if (state.hotelJump) { const k = HOTELS.findIndex(h=>h.n===state.hotelJump); state.hotelJump = null; if (k>=0) { setTimeout(()=>document.getElementById("h"+k).scrollIntoView({block:"start"}), 0); return; } } }
  if (v==="giorni") showDay(cur);
  window.scrollTo(0,0);
}

/* ====== ora locale e di Milano, meteo del giorno ====== */
const TZ = {Tokyo:"Asia/Tokyo", Kyoto:"Asia/Tokyo", Osaka:"Asia/Tokyo", Nara:"Asia/Tokyo", Milano:"Europe/Rome"};
const WX_PLACES = {Tokyo:[35.68,139.77], Kyoto:[35.01,135.77], Osaka:[34.69,135.50], Nara:[34.68,135.83], Milano:[45.46,9.19]};
const clock = tz => new Intl.DateTimeFormat("it-IT", {timeZone: tz, hour: "2-digit", minute: "2-digit"}).format(new Date());
const WMO = c => c===0 ? ["☀️","sereno"] : c<=2 ? ["🌤️","poco nuvoloso"] : c===3 ? ["☁️","nuvoloso"] : c<=48 ? ["🌫️","nebbia"]
  : c<=57 ? ["🌦️","pioggerella"] : c<=67 ? ["🌧️","pioggia"] : c<=77 ? ["🌨️","neve"] : c<=82 ? ["🌧️","rovesci"] : c<=86 ? ["🌨️","neve"] : ["⛈️","temporale"];
function renderDayInfo(){
  const box = document.getElementById("dayinfo"); if (!box) return;
  const d = DAYS[cur], tz = TZ[d.city] || "Asia/Tokyo";
  const parts = [];
  parts.push(tz === "Europe/Rome" ? `<span>🕐 Milano <b>${clock("Europe/Rome")}</b> · Tokyo <b>${clock("Asia/Tokyo")}</b></span>`
                                  : `<span>🕐 ${esc(d.city)} <b>${clock(tz)}</b> · Milano <b>${clock("Europe/Rome")}</b></span>`);
  const wx = store.get("wx", null), w = wx && wx.data && wx.data[d.city];
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
    if (Object.keys(data).length) { store.set("wx", {at: new Date().toISOString(), data}); renderDayInfo(); }
  } catch(e) { /* niente rete o richiesta bloccata: si usa l'ultima lettura salvata, se c'è */ }
}
setInterval(renderDayInfo, 30000);
addEventListener("online", fetchWeather);
fetchWeather();

/* ====== swipe tra i giorni sulla scheda ====== */
/* con lo swipe si torna in cima alla pagina; con i pulsanti Prima/Dopo si resta in fondo (pageDay) */
function swipeTo(i){ showDay(i); window.scrollTo(0, 0); }
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

/* ====== prima di partire: verifiche e prenotazioni ====== */
const TODO = [
  ["Da verificare con gli hotel", [
    ["ina1","INA House Nijojo: la reception è aperta alle 6:45 del 15/3?","Serve per spedire le valigie a Tokyo; in alternativa si spedisce da un konbini"],
    ["ina2","INA House Nijojo: custodisce le valigie arrivate il 12/3 fino al check-in del 13?",""],
    ["vin1","Hotel Vintage: custodisce le valigie in arrivo il 16–17/3 fino al check-in del 18?","Meglio farselo confermare per iscritto"],
    ["mb1","Morning Box: tiene gli zaini dalle 8 del 16/3, prima del check-in?","Altrimenti armadietti a Universal City"],
    ["mb2","Morning Box: avete prenotato capsule o camere?","Nei capsule hotel i piani sono spesso separati tra uomini e donne"],
    ["mk1","Mikasa Ryokan: orari della navetta da Kintetsu-Nara (17/3 sera e 18/3 mattina)","E il giro serale gratuito sul monte Wakakusa"]
  ]],
  ["Da prenotare", [
    ["dis","Biglietti DisneySea per il 10/3","A data fissa; poi Premier Access per Fantasy Springs dall'app"],
    ["usj","Universal Studios e Express Pass per il 16/3","L'Express Pass include l'ingresso a Super Nintendo World"],
    ["sky","Skytree, fascia delle 17:00 dell'8/3","Per il tramonto"],
    ["tlb","teamLab Borderless, 18/3 verso le 15:30",""],
    ["cena","Cena al banco a Ebisu, 9/3 sera, per sei","Tabelog o TableCheck, 1–2 mesi prima"],
    ["bus","Bus Shinjuku → Kawaguchiko e ritorno, 12/3",""],
    ["shk","Shinkansen: 13/3 posti lato E, 18/3 posti lato A","Per vedere il Fuji in entrambi i viaggi"]
  ]],
  ["Sul telefono", [
    ["sui","Suica o PASMO nel wallet",""],
    ["esim","eSIM attivata",""],
    ["gm","Google Maps installato e accesso fatto","Per i pulsanti delle indicazioni"]
  ]]
];
function renderTodo(){
  const done = new Set(store.get("todo", []));
  const all = TODO.flatMap(g => g[1]);
  $("#todostat").textContent = `${all.filter(t => done.has(t[0])).length} su ${all.length} fatti. Le spunte restano salvate su questo telefono.`;
  $("#todo").innerHTML = TODO.map(([title, items]) => `<div class="todo"><h3>${title}</h3>${items.map(([id, txt, note]) =>
    `<label class="${done.has(id)?"ok":""}"><input type="checkbox" data-t="${id}"${done.has(id)?" checked":""}><span>${esc(txt)}${note?`<small>${esc(note)}</small>`:""}</span></label>`).join("")}</div>`).join("");
}
document.getElementById("todo").addEventListener("change", e => {
  const id = e.target.dataset.t; if (!id) return;
  const done = new Set(store.get("todo", [])); e.target.checked ? done.add(id) : done.delete(id);
  store.set("todo", [...done]); renderTodo();
});
renderTodo();
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
function playIntro(){
  const cols = DAYS.map(d => cityOf(d.city).c), n = DAYS.length, x0 = 44, x1 = 316, ly = 470;
  const xs = DAYS.map((_,k) => x0 + k*(x1-x0)/(n-1));
  const segs = xs.slice(1).map((x,k) => `<path d="M${xs[k]} ${ly} L${x} ${ly}" stroke="${cols[k+1]}" stroke-width="6" stroke-linecap="round"/>`).join("");
  const stops = xs.map((x,k) => `<circle class="i-st" cx="${x}" cy="${ly}" r="6.5" fill="var(--bg)" stroke="${cols[k]}" stroke-width="3.5" style="animation-delay:${(0.78+k*0.04).toFixed(2)}s"/>`).join("");
  const ov = document.createElement("div");
  ov.id = "intro"; ov.setAttribute("aria-hidden","true");
  ov.innerHTML = `<svg viewBox="0 0 360 640" preserveAspectRatio="xMidYMid meet">
    <circle class="i-sun" cx="180" cy="270" r="84" fill="var(--alert)"/>
    <text class="i-k" x="146" y="294" text-anchor="middle" style="animation-delay:.32s">日</text>
    <text class="i-k" x="214" y="294" text-anchor="middle" style="animation-delay:.5s">本</text>
    <text class="i-title" x="180" y="404" text-anchor="middle">Giappone ’27</text>
    <text class="i-sub" x="180" y="428" text-anchor="middle">6 – 21 marzo · Tokyo, Kyoto, Osaka, Nara</text>
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
  if (!REDUCED) playIntro();
  else flightTo(true);
  let hiddenAt = 0;
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { hiddenAt = Date.now(); return; }
    if (hiddenAt && Date.now() - hiddenAt > 10000 && !document.getElementById("intro")) flightTo(true);
  });
})();
})();
