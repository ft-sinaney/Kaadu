/* ============================================================
   KAADU — application
   Sections: ART (procedural plates) · SEQ (scroll frame player)
             CATALOGUE · FINDER · SHEETS · QR
   ============================================================ */
(function () {
"use strict";

const $  = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ============================================================
   ART — every species gets a drawn plate instead of a photo.
   Swap this whole block for <img src="..."> when real
   photography is available; the markup hooks stay the same.
   ============================================================ */
const PAL = {
  Trees:"#2F4A1E", Palms:"#3B5726", Fruit:"#4A6B2C", Spices:"#8A6E4B",
  Flowering:"#A8823C", Medicinal:"#406130", Water:"#3E6355", Grasses:"#55702F", Ornamental:"#7A5566",
  Swallowtails:"#A8823C", Nymphs:"#8A6E4B", Milkweed:"#9C7B3E", "Whites & yellows":"#B08A4A"
};

/* --- glyph builders, all drawn inside a 0 0 100 100 box ------- */
function veins(n, spread) {
  let d = "";
  for (let i = 0; i < n; i++) {
    const y = 20 + i * (60 / n);
    d += `M50 ${y} C${50 - spread * .5} ${y + 3} ${50 - spread * .8} ${y + 9} ${50 - spread} ${y + 15}`;
    d += `M50 ${y} C${50 + spread * .5} ${y + 3} ${50 + spread * .8} ${y + 9} ${50 + spread} ${y + 15}`;
  }
  return `<path d="${d}" opacity=".45"/>`;
}
const GLYPH = {
  leaf: () => `<path d="M50 4C66 26 68 62 50 96C32 62 34 26 50 4Z"/><path d="M50 8V94" opacity=".6"/>${veins(6, 12)}`,
  broad: () => `<path d="M50 6C88 26 86 66 50 96C14 66 12 26 50 6Z"/><path d="M50 10V94" opacity=".6"/>${veins(6, 26)}`,
  fig: () => `<path d="M50 98C49 84 49 78 48 72C30 84 8 66 12 44C15 26 34 16 50 30C66 16 85 26 88 44C92 66 70 84 52 72C51 78 51 84 50 98Z"/><path d="M50 32V72" opacity=".6"/><path d="M50 40C42 44 32 46 22 44M50 40C58 44 68 46 78 44M50 54C43 58 34 62 26 62M50 54C57 58 66 62 74 62" opacity=".45"/>`,
  pinnate: () => {
    let s = `<path d="M50 96C50 70 50 34 50 6" opacity=".7"/>`;
    for (let i = 0; i < 7; i++) {
      const y = 17 + i * 11, k = 1 - i * .075;
      s += `<path d="M50 ${y}C${50 - 12 * k} ${y - 5} ${50 - 24 * k} ${y - 3} ${50 - 33 * k} ${y + 2}C${50 - 22 * k} ${y + 6} ${50 - 10 * k} ${y + 4} 50 ${y}Z"/>`;
      s += `<path d="M50 ${y}C${50 + 12 * k} ${y - 5} ${50 + 24 * k} ${y - 3} ${50 + 33 * k} ${y + 2}C${50 + 22 * k} ${y + 6} ${50 + 10 * k} ${y + 4} 50 ${y}Z"/>`;
    }
    return s;
  },
  palm: () => {
    let s = `<path d="M6 96C26 70 52 40 94 14" opacity=".8"/>`;
    for (let i = 1; i <= 18; i++) {
      const t = i / 19;
      const x = (1 - t) * (1 - t) * 6 + 2 * (1 - t) * t * 40 + t * t * 94;
      const y = (1 - t) * (1 - t) * 96 + 2 * (1 - t) * t * 50 + t * t * 14;
      const L = 30 * Math.sin(Math.PI * t) + 6;
      s += `<path d="M${x} ${y}L${x - L * .32} ${y - L * .82}" opacity=".55"/>`;
      s += `<path d="M${x} ${y}L${x + L * .82} ${y + L * .3}" opacity=".55"/>`;
    }
    return s;
  },
  flower5: () => {
    let s = "";
    for (let i = 0; i < 5; i++)
      s += `<path d="M50 52C38 34 40 12 50 4C60 12 62 34 50 52Z" transform="rotate(${i * 72} 50 52)"/>`;
    return s + `<circle cx="50" cy="52" r="5"/><path d="M50 52V88" opacity=".6"/><circle cx="50" cy="88" r="2.5" opacity=".7"/>`;
  },
  lotus: () => {
    let s = "";
    for (let i = -3; i <= 3; i++)
      s += `<path d="M50 62C42 40 44 20 50 10C56 20 58 40 50 62Z" transform="rotate(${i * 26} 50 64)"/>`;
    return s + `<path d="M14 66C28 78 72 78 86 66" opacity=".5"/><path d="M50 62V94" opacity=".55"/>`;
  },
  bamboo: () => {
    let s = "";
    [[36, 98, 20], [62, 98, 8]].forEach(([x, y0, y1]) => {
      s += `<path d="M${x - 4.5} ${y0}V${y1}M${x + 4.5} ${y0}V${y1}" opacity=".85"/>`;
      for (let y = y0 - 14; y > y1 + 8; y -= 18)
        s += `<path d="M${x - 6} ${y}h12" opacity=".65"/><path d="M${x - 5} ${y - 3}h10" opacity=".3"/>`;
    });
    s += `<path d="M66 22C76 13 88 12 96 17C87 26 73 29 66 22Z"/>`;
    s += `<path d="M40 44C29 35 17 34 9 39C18 48 32 51 40 44Z"/>`;
    s += `<path d="M66 44C75 39 86 40 92 46C83 51 71 51 66 44Z"/>`;
    return s;
  },
  pod: () => {
    let s = `<path d="M44 7C38 30 38 62 49 95" opacity=".9"/><path d="M56 7C51 30 51 62 61 95" opacity=".9"/>` +
            `<path d="M44 7C47 3 53 3 56 7" opacity=".9"/><path d="M49 95C53 98 57 98 61 95" opacity=".9"/>`;
    for (let i = 1; i < 8; i++) {
      const t = i / 8, y = 8 + t * 86, x = 44 - 6 * Math.sin(Math.PI * t) + t * 5;
      s += `<path d="M${x} ${y}h${12 + 1.5 * Math.sin(Math.PI * t)}" opacity=".35"/>`;
    }
    return s;
  },
  berry: () => {
    let s = `<path d="M50 4C48 30 46 58 40 96" opacity=".75"/>`;
    for (let i = 0; i < 12; i++) {
      const t = i / 11, y = 12 + t * 78, x = 50 - t * 10 + (i % 2 ? 6 : -6);
      s += `<circle cx="${x}" cy="${y}" r="${4.6 - t * 1.2}" opacity="${.65 - t * .18}"/>`;
    }
    return s;
  },
  fly1: () => wings(
    "M49 43C37 32 21 21 11 21C4 29 8 44 20 52C29 58 42 57 49 53Z",
    "M48 55C38 57 26 63 21 73C17 83 27 90 36 84C43 78 47 66 49 59Z",
    "M22 86C17 91 13 95 10 97"),
  fly2: () => wings(
    "M49 44C38 34 24 25 14 26C8 34 11 46 22 53C30 58 42 57 49 54Z",
    "M48 55C39 57 28 63 24 73C20 83 30 89 38 83C44 77 47 66 49 59Z", ""),
  fly3: () => wings(
    "M49 44C39 35 27 27 17 28C12 36 14 47 24 53C31 58 42 57 49 54Z",
    "M48 55C40 57 30 64 27 74C24 83 33 88 40 82C46 76 48 66 49 59Z", "")
};
function wings(fore, hind, tail) {
  const half = `<path d="${fore}"/><path d="${hind}"/>${tail ? `<path d="${tail}" opacity=".7"/>` : ""}`;
  return `<g>${half}</g><g transform="translate(100,0) scale(-1,1)">${half}</g>` +
    `<ellipse cx="50" cy="57" rx="2.5" ry="19" opacity=".85"/><circle cx="50" cy="36" r="3.2" opacity=".85"/>` +
    `<path d="M50 34C46 25 41 19 34 16M50 34C54 25 59 19 66 16" opacity=".7"/>`;
}

const GSCALE = { palm:.74, bamboo:.84, pinnate:.94, lotus:.9, flower5:.9, pod:.95, berry:.95, fly1:.92, fly2:.92, fly3:.92 };
/* variant 3 lays the glyph out as a repeating study sheet */
function tile(rec, w, h, scale, col) {
  const g = (GLYPH[rec.g] || GLYPH.leaf)();
  let out = `<g fill="${col}" fill-opacity=".05" stroke="${col}" stroke-opacity=".55" stroke-width="1.6"
    stroke-linecap="round" stroke-linejoin="round">`;
  const cols = 3, rows = 2;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const px = w * (c + .5) / cols, py = h * (r + .5) / rows;
    out += `<g transform="translate(${px} ${py}) rotate(${(r * cols + c) * 23 - 34}) scale(${scale}) translate(-50 -52)">${g}</g>`;
  }
  return out + "</g>";
}
let artUid = 0;
/** Build a plate SVG for one record. fit < 1 pulls the glyph inside the frame. */
function plate(rec, w, h, extraClass, fit, variant) {
  const id = "pg" + (artUid++);
  const col = PAL[rec.c] || "#a0a783";
  const seed = (rec.s || "").length + (rec.n || "").length;
  const rot = ((seed % 7) - 3) * 2.2;
  let scale = (h / 100) * 1.3 * (GSCALE[rec.g] || 1) * (fit || 1);
  let tx = w / 2, ty = h / 2, spin = rot;
  if (variant === 2) { scale *= 2.35; tx = w * .34; ty = h * .3; spin = rot - 14; }
  if (variant === 3) { scale *= .52; }
  const gx = 50 + ((seed % 5) - 2) * 3;
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
<defs><radialGradient id="${id}" cx="${gx}%" cy="4%" r="86%">
<stop offset="0" stop-color="#C9A96A" stop-opacity=".26"/><stop offset=".6" stop-color="#A8823C" stop-opacity=".08"/>
<stop offset="1" stop-color="var(--paper-3)" stop-opacity="0"/></radialGradient></defs>
<rect width="${w}" height="${h}" fill="var(--paper-3)"/><rect width="${w}" height="${h}" fill="url(#${id})"/>
<g class="${extraClass || ""}">${variant === 3 ? tile(rec, w, h, scale, col) : ""}<g ${variant === 3 ? 'opacity="0"' : ""} transform="translate(${tx} ${ty}) rotate(${spin}) scale(${scale}) translate(-50 -52)"
 fill="${col}" fill-opacity=".07" stroke="${col}" stroke-opacity=".72" stroke-width="1.15"
 stroke-linecap="round" stroke-linejoin="round">${(GLYPH[rec.g] || GLYPH.leaf)()}</g></g></svg>`;
}

/* ============================================================
   SEQ — scroll-scrubbed frame sequence
   ============================================================ */
const STAGES = [
  { to: .14, k: "Seed",        t: "The seed",     c: "A few grams, falling. Everything the tree will become is already written inside it." },
  { to: .28, k: "Ground",      t: "Ground",       c: "Kerala's laterite drinks the June monsoon and holds it for months. That is how a coastline this narrow carries a rainforest." },
  { to: .42, k: "Germination", t: "The shell opens", c: "Water swells the coat until it splits. The root goes down before the shoot comes up." },
  { to: .58, k: "Seedling",    t: "First leaves", c: "The seedling stops living on its reserves and starts living on light." },
  { to: .76, k: "Sapling",     t: "Reaching",     c: "In the Ghats the whole contest is for light. A sapling can wait years for a gap in the canopy." },
  { to: 1.01, k: "Canopy",     t: "Canopy",       c: "One mature tree becomes an address — bark, hollows, nectar, fruit, and everything that arrives with the flowering." }
];

const seqCanvas = $("#seq");
const ctx = seqCanvas.getContext("2d", { alpha: false });
const PAPER = "#FFFFFF";   /* frames are keyed to white for multiply blending */
const hero = $("#growth");
const trackFill = $("#trackFill");
const trackCap = $("#trackCap");
const trackTicks = $("#trackTicks");

STAGES.forEach((s, i) => {
  trackCap.insertAdjacentHTML("beforeend",
    `<div class="track__cap${i === 0 ? " on" : ""}" data-i="${i}"><b>${s.t}</b>${s.c}</div>`);
  trackTicks.insertAdjacentHTML("beforeend",
    `<span class="track__tick${i === 0 ? " on" : ""}" data-i="${i}">${s.k}</span>`);
});
const capEls = $$(".track__cap"), tickEls = $$(".track__tick");

/* growth sequence: frames/f000.jpg … f199.jpg */
const N = 200;
const FRAME_URL = i => "frames/f" + String(i).padStart(3, "0") + ".jpg";
/* the first frames are a black fade-in; open on the hand instead */
const OFF = Math.round(N * .13);  /* seed already down, not yet split */
const SPAN = N - 1 - OFF;
const imgs = new Array(N);
let ready = 0, lastDrawn = -1;

function sizeCanvas() {
  const r = seqCanvas.getBoundingClientRect();
  if (!r.width) return;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
  if (seqCanvas.width !== w || seqCanvas.height !== h) {
    seqCanvas.width = w; seqCanvas.height = h;
    lastDrawn = -1;
  }
}
function nearest(i) {
  for (let d = 0; d < N; d++) {
    if (imgs[i - d]) return imgs[i - d];
    if (imgs[i + d]) return imgs[i + d];
  }
  return null;
}
function paint(i) {
  const exact = imgs[i];
  const im = exact || nearest(i);
  if (!im) return;
  const cw = seqCanvas.width, ch = seqCanvas.height;
  ctx.fillStyle = PAPER; ctx.fillRect(0, 0, cw, ch);
  /* Desktop: the canvas box is roomy, so a plain contain fit works.
     Phones: the box is short and wide, which leaves the subject tiny
     inside all the empty sky the frames carry. Fill the box instead
     and centre on the subject (which sits around 56% down the frame)
     rather than on the frame itself. */
  /* 99.5% of the tree's mass lives in x .233-.808, y .163-.922 of
     the frame; the rest is scattered birds. Fit that box, with a
     small margin, so the tree comes right up to the edges of its
     space without ever losing a branch. */
  const cx = .517, cy = .543, rw = .615, rh = .80;
  const s = Math.min(cw / (im.width * rw), ch / (im.height * rh));
  const x = cw / 2 - im.width * cx * s;
  const y = ch / 2 - im.height * cy * s;
  ctx.drawImage(im, x, y, im.width * s, im.height * s);
  /* only lock the frame in once the real image is decoded, so a
     stand-in drawn during loading gets replaced */
  lastDrawn = exact ? i : -1;
}

/* load frames with a small concurrency window; data URIs mean this
   is decode time, not network time */
function loadFrames(done) {
  let next = 0, live = 0;
  const bump = () => {
    ready++;
    if (ready === 1) { sizeCanvas(); paint(OFF); }
    if (ready === N) done();
    else pump();
  };
  function pump() {
    while (live < 8 && next < N) {
      const i = next++; live++;
      const im = new Image();
      im.decoding = "async";
      im.onload = im.onerror = () => { imgs[i] = im.naturalWidth ? im : null; live--; bump(); };
      im.src = FRAME_URL(i);
    }
  }
  pump();
}

let target = 0, cur = 0, heroTop = 0, heroRange = 1, stageNow = -1;
/* Once the tree is grown the sequence latches: scrolling back up no
   longer rewinds it, and the hero collapses from its tall scroll
   runway to a single screen so moving around the site is quick.
   A reload starts the seed over. */
let finished = false;
function complete() {
  if (finished) return;
  finished = true;
  const top = hero.offsetTop, was = hero.offsetHeight, here = scrollY;
  const html = document.documentElement, prevBehavior = html.style.scrollBehavior;
  html.style.scrollBehavior = "auto";
  hero.style.height = "100svh";
  const delta = was - hero.offsetHeight;
  /* keep whatever the reader was looking at in place */
  scrollTo(0, here > top + was - 4 ? Math.max(0, here - delta) : top);
  requestAnimationFrame(() => { html.style.scrollBehavior = prevBehavior; });
  target = cur = 1;
  measure();
  paint(OFF + SPAN);
  trackFill.style.width = "100%";
  setStage(1);
  if (hint) hint.classList.add("hide");
}
function measure() {
  heroTop = hero.offsetTop;
  heroRange = Math.max(1, hero.offsetHeight - innerHeight);
  sizeCanvas();
  if (finished) lastDrawn = -1;
}
function readScroll() {
  if (finished) { target = 1; return; }
  target = clamp((scrollY - heroTop) / heroRange, 0, 1);
}
function setStage(p) {
  let i = 0;
  while (i < STAGES.length - 1 && p >= STAGES[i].to) i++;
  if (i === stageNow) return;
  stageNow = i;
  capEls.forEach(e => e.classList.toggle("on", +e.dataset.i === i));
  tickEls.forEach(e => e.classList.toggle("on", +e.dataset.i === i));
}
function tick() {
  if (!finished) {
    cur += REDUCED ? (target - cur) : (target - cur) * .14;
    if (Math.abs(target - cur) < .0004) cur = target;
    const i = OFF + Math.round(cur * SPAN);
    if (i !== lastDrawn) paint(i);
    trackFill.style.width = (cur * 100) + "%";
    setStage(cur);
    if (cur > .999 && target > .999) complete();
  } else if (lastDrawn !== OFF + SPAN) {
    paint(OFF + SPAN);
  }
  requestAnimationFrame(tick);
}

/* ============================================================
   CATALOGUE
   ============================================================ */
/* ============================================================
   PHOTOS — drop images into images/plants/<folder>/ or
   images/butterflies/<folder>/ as main, gallery-1 and gallery-2
   (.jpg, .jpeg, .png or .webp). A missing photo simply leaves the
   drawn plate underneath visible.
   ============================================================ */
const slug = s => s.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const PHOTO_EXTS = ["jpg", "jpeg", "png", "webp"];
const photoBase = (kind, rec, name) => `images/${kind === "f" ? "plants" : "butterflies"}/${slug(rec.n)}/${name}`;
const photo = (kind, rec, name) => {
  const base = photoBase(kind, rec, name);
  return `<img class="photo" alt="${rec.n}" loading="lazy" draggable="false" data-base="${base}" data-k="0" src="${base}.jpg"
    onload="this.classList.add('ok')" onerror="kaaduPhotoMiss(this)">`;
};
window.kaaduPhotoMiss = img => {
  const k = +img.dataset.k + 1;
  if (k < PHOTO_EXTS.length) { img.dataset.k = k; img.src = img.dataset.base + "." + PHOTO_EXTS[k]; }
  else img.remove();
};

const norm = s => (s || "").toLowerCase();
const hay = r => norm([r.n, r.r, r.s, r.f, r.c, r.m, r.a, r.b, r.nk, r.nkm].join(" "));

const floraGrid = $("#floraGrid"), floraEmpty = $("#floraEmpty"), floraMoreWrap = $("#floraMoreWrap");
const CAT_ORDER = ["Trees", "Fruit", "Medicinal", "Flowering", "Palms", "Spices", "Ornamental"];
const CATS = ["All", ...CAT_ORDER.filter(c => FLORA.some(r => r.c === c)), ...(FLORA.some(r => r.nk) ? ["Star"] : [])];
let floraCat = "All", floraQ = "", floraShown = 18;

$("#floraCount").textContent = FLORA.length;
$("#flyCount").textContent = BUTTERFLIES.length;
$("#floraChips").innerHTML = CATS.map(c =>
  `<button class="chip${c === "All" ? " on" : ""}" type="button" data-cat="${c}">${c}</button>`).join("");

const FLAGS = ["Endemic", "Vulnerable", "Protected", "Invasive", "Introduced"];
const flagWord = r => { if (!r.e) return ""; const w = r.e.split(/[\s—;,]/)[0]; return FLAGS.includes(w) ? w : ""; };
const flag = r => { const w = flagWord(r); return w ? `<span class="card__flag">${w}</span>` : ""; };
/* local name line: Malayalam script and the survey name, or the survey name alone */
const localName = (r, cls) => r.m ? `<span class="${cls}">${r.m} · ${r.r}</span>` : r.r && r.r !== r.n ? `<span class="${cls}">${r.r}</span>` : "";
function cardHTML(rec, kind, i) {
  return `<button class="card" type="button" data-kind="${kind}" data-i="${i}">
<span class="card__plate">${plate(rec, 400, 300, "card__art")}${photo(kind, rec, "main")}<span class="card__glow"></span>${flag(rec)}</span>
<span class="card__body">
<span class="card__name">${rec.n}</span>
${localName(rec, "card__mal")}
<span class="card__sci">${rec.s}</span>
<span class="card__blurb">${rec.b}</span>
<span class="card__cat">${rec.c}${rec.nk ? " · ★ " + rec.nk : ""}</span>
</span></button>`;
}
function floraFilter() {
  const q = norm(floraQ).trim();
  const list = FLORA.map((r, i) => ({ r, i }))
    .filter(o => (floraCat === "All" || (floraCat === "Star" ? o.r.nk : o.r.c === floraCat)) && (!q || hay(o.r).indexOf(q) > -1));
  if (floraCat === "Star") list.sort((a, b) => a.r.nkn - b.r.nkn);
  return list;
}
function renderFlora() {
  const list = floraFilter();
  $("#starNote").hidden = floraCat !== "Star";
  floraGrid.innerHTML = list.slice(0, floraShown).map(o => cardHTML(o.r, "f", o.i)).join("");
  floraEmpty.hidden = list.length > 0;
  floraGrid.style.display = list.length ? "" : "none";
  floraMoreWrap.style.display = list.length > floraShown ? "" : "none";
  $("#floraCount").textContent = list.length;
}
const flyGrid = $("#flyGrid"), flyEmpty = $("#flyEmpty");
function renderFly() {
  const q = norm($("#flySearch").value).trim();
  const list = BUTTERFLIES.map((r, i) => ({ r, i })).filter(o => !q || hay(o.r).indexOf(q) > -1);
  flyGrid.innerHTML = list.map(o => cardHTML(o.r, "b", o.i)).join("");
  flyEmpty.hidden = list.length > 0;
  flyGrid.style.display = list.length ? "" : "none";
  $("#flyCount").textContent = list.length;
}

$("#floraChips").addEventListener("click", e => {
  const b = e.target.closest(".chip"); if (!b) return;
  floraCat = b.dataset.cat; floraShown = 18;
  $$("#floraChips .chip").forEach(c => c.classList.toggle("on", c === b));
  renderFlora();
});
$("#floraSearch").addEventListener("input", e => { floraQ = e.target.value; floraShown = 18; renderFlora(); });
$("#flySearch").addEventListener("input", renderFly);
$("#floraMore").addEventListener("click", () => { floraShown += 18; renderFlora(); });

document.addEventListener("click", e => {
  const c = e.target.closest(".card");
  if (c) { location.hash = "#/s/" + c.dataset.kind + c.dataset.i; }
});

/* ============================================================
   SHEETS
   ============================================================ */
let restoreFocus = null;
function openVeil(el) {
  restoreFocus = document.activeElement;
  el.classList.add("on");
  document.body.style.overflow = "hidden";
  const f = el.querySelector("input, button");
  if (f) setTimeout(() => f.focus(), 60);
}
function closeAll() {
  $$(".veil.on, .finder.on").forEach(v => v.classList.remove("on"));
  document.body.style.overflow = "";
  stopScan();
  if (restoreFocus && restoreFocus.focus) restoreFocus.focus();
}
document.addEventListener("click", e => {
  if (e.target.closest("[data-close]")) return closeAll();
  const v = e.target.closest(".veil");
  if (v && !e.target.closest(".sheet")) closeAll();
});
addEventListener("keydown", e => { if (e.key === "Escape") closeAll(); });

let lastSpecies = null;
/* every route into a species — card, search, photo result — lands on
   the same page, so each plant and butterfly has exactly one view */
function openSpecies(rec) {
  lastSpecies = rec;
  const fi = FLORA.indexOf(rec), bi = BUTTERFLIES.indexOf(rec);
  if (fi > -1) location.hash = "#/s/f" + fi;
  else if (bi > -1) location.hash = "#/s/b" + bi;
}
const row = (k, v) => `<div class="dl__row"><span class="dl__k">${k}</span><span class="dl__v">${v}</span></div>`;

/* ============================================================
   FINDER — one search across both datasets
   ============================================================ */
const finder = $("#finder"), fIn = $("#finderInput"), fRes = $("#finderResults");
let hits = [], sel = 0;

function runFinder() {
  const q = norm(fIn.value).trim();
  const pick = (arr, kind) => arr.map((r, i) => ({ r, i, kind }))
    .filter(o => !q || hay(o.r).indexOf(q) > -1).slice(0, q ? 40 : 6);
  const a = pick(FLORA, "f"), b = pick(BUTTERFLIES, "b");
  hits = a.concat(b); sel = 0;
  if (!hits.length) {
    fRes.innerHTML = `<div class="empty" style="margin-top:2rem"><h4>No match for “${fIn.value}”</h4>
      <p>Search works on common names, Malayalam names, scientific names and families. Try “mulla”, “Ficus” or “tiger”.</p></div>`;
    return;
  }
  const grp = (title, list) => list.length ? `<div class="finder__group">${title}</div>` + list.map(o => `
<button class="hit" type="button" data-kind="${o.kind}" data-i="${o.i}">
  <span class="hit__ic">${plate(o.r, 44, 36)}${photo(o.kind, o.r, "main")}</span>
  <span class="hit__t"><span class="hit__n">${o.r.n}</span><span class="hit__s">${o.r.m ? o.r.m + " · " : ""}${o.r.s}</span></span>
  <span class="hit__k">${o.r.c}</span>
</button>`).join("") : "";
  fRes.innerHTML = grp(q ? "Plants & trees" : "Start anywhere", a) + grp("Butterflies", b);
  markSel();
}
function markSel() {
  const els = $$(".hit", fRes);
  els.forEach((e, i) => e.classList.toggle("sel", i === sel));
  if (els[sel]) els[sel].scrollIntoView({ block: "nearest" });
}
fIn.addEventListener("input", runFinder);
fIn.addEventListener("keydown", e => {
  if (!hits.length) return;
  if (e.key === "ArrowDown") { e.preventDefault(); sel = (sel + 1) % hits.length; markSel(); }
  if (e.key === "ArrowUp") { e.preventDefault(); sel = (sel - 1 + hits.length) % hits.length; markSel(); }
  if (e.key === "Enter") { e.preventDefault(); const h = hits[sel]; closeAll(); openSpecies(h.kind === "f" ? FLORA[h.i] : BUTTERFLIES[h.i]); }
});
fRes.addEventListener("click", e => {
  const h = e.target.closest(".hit"); if (!h) return;
  const rec = h.dataset.kind === "f" ? FLORA[+h.dataset.i] : BUTTERFLIES[+h.dataset.i];
  closeAll(); openSpecies(rec);
});

/* ============================================================
   QR SCANNER — decodes in-page with jsQR, nothing leaves the device
   ============================================================ */
const qrStage = $("#qrStage"), qrFile = $("#qrFile");
let qrStream = null, qrRAF = 0;

function qrIdle(msg) {
  stopScan();
  qrStage.innerHTML = `
<div class="idz" id="qrz">
  <svg class="idz__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.1">
    <path d="M3.5 8.5v-3a2 2 0 0 1 2-2h3M15.5 3.5h3a2 2 0 0 1 2 2v3M20.5 15.5v3a2 2 0 0 1-2 2h-3M8.5 20.5h-3a2 2 0 0 1-2-2v-3"/>
    <rect x="7.5" y="7.5" width="4" height="4"/><rect x="12.5" y="12.5" width="4" height="4"/>
  </svg>
  <div class="h3">Point the camera at a code</div>
  <p class="fine" style="margin:.5rem auto 0;max-width:34ch">${msg || "Fill the frame with the code and hold steady."}</p>
  <div class="idz__acts">
    <button class="btn btn--solid" type="button" id="qrCam">Start camera
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 12h15M13 6l6 6-6 6"/></svg></button>
    <button class="btn btn--ghost" type="button" id="qrPick">Scan an image</button>
  </div>
</div>`;
  $("#qrPick").onclick = () => qrFile.click();
  $("#qrCam").onclick = startScan;
}

function stopScan() {
  if (qrRAF) { cancelAnimationFrame(qrRAF); qrRAF = 0; }
  if (qrStream) { qrStream.getTracks().forEach(t => t.stop()); qrStream = null; }
}

async function startScan() {
  try {
    qrStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
  } catch (err) {
    qrIdle("No camera available here. Pick a photo of the code instead.");
    return;
  }
  qrStage.innerHTML = `<div class="scan"><video id="qrVid" playsinline autoplay muted></video>
      <div class="scan__ret"><i></i><i></i><i></i><i></i></div></div>
    <p class="scan__hint" id="qrHint">Looking for a code…</p>
    <div class="idz__acts" style="margin-top:1rem"><button class="btn btn--ghost" type="button" id="qrStop">Stop</button></div>`;
  const v = $("#qrVid");
  v.srcObject = qrStream;
  $("#qrStop").onclick = () => qrIdle();
  const c = document.createElement("canvas"), cx = c.getContext("2d", { willReadFrequently: true });
  const look = () => {
    if (!qrStream) return;
    if (v.readyState === v.HAVE_ENOUGH_DATA) {
      const side = Math.min(v.videoWidth, v.videoHeight, 640);
      c.width = c.height = side;
      cx.drawImage(v, (v.videoWidth - side) / 2, (v.videoHeight - side) / 2, side, side, 0, 0, side, side);
      const d = cx.getImageData(0, 0, side, side);
      const hit = jsQR(d.data, d.width, d.height, { inversionAttempts: "attemptBoth" });
      if (hit && hit.data) { stopScan(); return showCode(hit.data); }
    }
    qrRAF = requestAnimationFrame(look);
  };
  qrRAF = requestAnimationFrame(look);
}

qrFile.addEventListener("change", e => {
  const f = e.target.files[0]; e.target.value = "";
  if (!f) return;
  const fr = new FileReader();
  fr.onload = () => {
    const im = new Image();
    im.onload = () => {
      const side = Math.min(1000, Math.max(im.width, im.height));
      const c = document.createElement("canvas");
      c.width = Math.round(im.width * side / Math.max(im.width, im.height));
      c.height = Math.round(im.height * side / Math.max(im.width, im.height));
      const cx = c.getContext("2d", { willReadFrequently: true });
      cx.drawImage(im, 0, 0, c.width, c.height);
      const d = cx.getImageData(0, 0, c.width, c.height);
      const hit = jsQR(d.data, d.width, d.height, { inversionAttempts: "attemptBoth" });
      if (hit && hit.data) showCode(hit.data, fr.result);
      else qrIdle("No code found in that picture. Try a closer, sharper shot.");
    };
    im.onerror = () => qrIdle("That image could not be read.");
    im.src = fr.result;
  };
  fr.readAsDataURL(f);
});

function showCode(text, preview) {
  stopScan();
  let url = null;
  try { const u = new URL(text); if (u.protocol === "http:" || u.protocol === "https:") url = u; } catch (err) {}
  const here = url && url.origin === location.origin;
  const hash = here && /^#\/s\/[fb]\d+$/.test(url.hash) ? url.hash : null;
  qrStage.innerHTML = `
${preview ? `<div class="scan" style="max-height:34svh"><img src="${preview}" alt="The picture you scanned"></div>` : ""}
<div class="qrout"><span class="qrout__k">Code contains</span>${text.replace(/[<>&]/g, ch => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[ch])}</div>
<div class="idz__acts" style="margin-top:1.2rem;justify-content:flex-start">
  ${hash ? `<button class="btn btn--solid" type="button" id="qrGo">Open in the guide
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 12h15M13 6l6 6-6 6"/></svg></button>` :
    url ? `<a class="btn btn--solid" href="${url.href}" target="_blank" rel="noopener noreferrer">Open link
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 12h15M13 6l6 6-6 6"/></svg></a>` : ""}
  <button class="btn btn--ghost" type="button" id="qrCopy2">Copy</button>
  <button class="btn btn--ghost" type="button" id="qrAgain">Scan another</button>
</div>`;
  if (hash) $("#qrGo").onclick = () => { closeAll(); location.hash = hash; };
  $("#qrAgain").onclick = () => qrIdle();
  $("#qrCopy2").onclick = async e => {
    try { await navigator.clipboard.writeText(text); e.target.textContent = "Copied"; }
    catch (err) { e.target.textContent = "Select the text above"; }
    setTimeout(() => { e.target.textContent = "Copy"; }, 2000);
  };
}

/* ============================================================
   WIRING
   ============================================================ */
document.addEventListener("click", e => {
  const b = e.target.closest("[data-open]"); if (!b) return;
  const what = b.dataset.open;
  if (what === "find") { openVeil(finder); runFinder(); }
  if (what === "qr") { qrIdle(); openVeil($("#veilQr")); }
  if (what === "species") {
    /* the catalogue itself, not whichever entry was last opened */
    closeAll();
    if (location.hash) location.hash = "";
    document.body.classList.remove("on-species");
    requestAnimationFrame(() => {
      $("#flora").scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "start" });
    });
  }
});
addEventListener("keydown", e => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openVeil(finder); runFinder(); }
});

const mast = $("#mast"), hint = $("#scrollHint");
function onScroll() {
  readScroll();
  mast.classList.toggle("stuck", scrollY > 40);
  hint.classList.toggle("hide", scrollY > 120);
}
addEventListener("scroll", onScroll, { passive: true });
addEventListener("resize", () => { measure(); readScroll(); });

/* ---- leaf backdrop ---- */
/* The backdrop's leaves all sit on its edges, so a landscape crop
   scaled to cover a portrait screen shows nothing but empty middle.
   Phones get a portrait crop of the same picture instead. */
const bgEl = $("#heroBg");
if (bgEl) {
  const portrait = matchMedia("(max-width: 900px)");
  const setBg = () => {
    bgEl.style.backgroundImage =
      "url(images/" + (portrait.matches ? "bg-phone.jpg" : "bg-desktop.jpg") + ")";
  };
  setBg();
  portrait.addEventListener("change", setBg);
}

/* ---- organic floating leaves ---- */
const LEAF_SVG = '<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M50 5C86 25 86 65 50 95C14 65 14 25 50 5Z"/><path d="M50 10V90"/><path d="M50 28C58 33 68 41 74 51M50 28C42 33 32 41 26 51M50 52C58 57 68 65 73 74M50 52C42 57 32 65 27 74"/></svg>';
function scatterLeaves(el, n) {
  if (!el) return;
  let html = "";
  for (let i = 0; i < n; i++) {
    const size = 26 + Math.random() * 62;
    html += `<span class="leaf" style="width:${size}px;height:${size}px;
      left:${Math.random() * 100}%;top:${Math.random() * 100}%;
      opacity:${.07 + Math.random() * .1};
      animation:drift ${14 + Math.random() * 12}s ease-in-out ${-Math.random() * 14}s infinite;
      transform:rotate(${Math.random() * 360}deg)">${LEAF_SVG}</span>`;
  }
  el.innerHTML = html;
}
if (!REDUCED) { scatterLeaves($("#leaves1"), 6); scatterLeaves($("#leaves2"), 8); scatterLeaves($("#leaves3"), 6); }


/* ============================================================
   SPECIES PAGES — hash routed so it works on static hosting
   ============================================================ */
const spWrap = $("#spWrap");
const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 12h15M13 6l6 6-6 6"/></svg>';
const listOf = k => (k === "f" ? FLORA : BUTTERFLIES);
const slugOf = (k, i) => "#/s/" + k + i;

const SHOT_FILE = { 1: "main", 2: "gallery-1", 3: "gallery-2" };
function shotHTML(rec, variant, cls, label) {
  const kind = FLORA.includes(rec) ? "f" : "b";
  return `<button class="shotbox ${cls}" type="button" data-zoom="${variant}" aria-label="${label}">
    ${plate(rec, variant === 1 ? 800 : 480, variant === 1 ? 600 : 360, "", variant === 1 ? .78 : 1, variant)}
    ${photo(kind, rec, SHOT_FILE[variant])}
    <span class="shotbox__zoom"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <circle cx="11" cy="11" r="6.5"/><path d="m20 20-3.6-3.6M11 8.6v4.8M8.6 11h4.8"/></svg></span>
  </button>`;
}

let spCurrent = null;
function renderSpecies(kind, idx) {
  const arr = listOf(kind), rec = arr[idx];
  if (!rec) { location.hash = ""; return; }
  spCurrent = rec;
  lastSpecies = rec;
  const prev = arr[(idx - 1 + arr.length) % arr.length], next = arr[(idx + 1) % arr.length];
  const pi = (idx - 1 + arr.length) % arr.length, ni = (idx + 1) % arr.length;
  spWrap.innerHTML = `
<a class="sp__back" href="#${kind === "f" ? "flora" : "butterflies"}">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20 12H5M11 6l-6 6 6 6"/></svg>
  Back to ${kind === "f" ? "plants & trees" : "butterflies"}
</a>
<div class="sp__head">
  <div>
    <p class="eyebrow">${rec.c}${flagWord(rec) ? " · " + flagWord(rec) : ""}</p>
    <h1 class="sp__title" style="margin-top:.7rem">${rec.n}</h1>
    <div class="sp__names">
      ${localName(rec, "mal")}
      <span class="sci">${rec.s}</span>
    </div>
  </div>
  <p class="sp__lede">${rec.b}</p>
</div>

<div class="sp__media">
  ${shotHTML(rec, 1, "shotbox--main", "Zoom the main plate")}
  <div class="sp__gal">
    ${shotHTML(rec, 2, "shotbox--thumb", "Zoom the detail study")}
    ${shotHTML(rec, 3, "shotbox--thumb", "Zoom the repeat study")}
  </div>
</div>

<div class="sp__cols">
  <div class="sp__body"><p>${rec.d}</p></div>
  <div class="dl" style="margin-top:0;border-top:1px solid var(--hair-2)">
    ${rec.f ? row("Family", rec.f) : ""}
    ${rec.c ? row("Group", rec.c) : ""}
    ${rec.nk ? row("Birth star", `${rec.nk} · ${rec.nkm} — its nakshatra tree`) : ""}
    ${rec.w ? row("Where", rec.w) : ""}
    ${rec.t ? row("When", rec.t) : ""}
    ${rec.u ? row("Uses", rec.u) : ""}
    ${rec.a ? row("Also called", rec.a) : ""}
    ${rec.e ? row("Status", rec.e) : ""}
    ${rec.k ? row("Caution", rec.k) : ""}
  </div>
</div>

<nav class="sp__nav">
  <a href="${slugOf(kind, pi)}"><span>Previous</span>${prev.n}</a>
  <a href="${slugOf(kind, ni)}"><span>Next</span>${next.n}</a>
</nav>`;
  document.title = rec.n + " — Kaadu";
}

function route() {
  const m = /^#\/s\/([fb])(\d+)$/.exec(location.hash || "");
  if (m) {
    document.body.classList.add("on-species");
    renderSpecies(m[1], +m[2]);
    scrollTo(0, 0);
  } else {
    document.body.classList.remove("on-species");
    spCurrent = null;
    document.title = "Kaadu — a field guide to Kerala's plants and butterflies";
    measure(); readScroll();
  }
}
addEventListener("hashchange", route);

/* ---- zoom lightbox ---- */
const zoomEl = $("#zoom"), zStage = $("#zoomStage"), zInner = $("#zoomInner"), zPct = $("#zPct");
let zScale = 1, zx = 0, zy = 0, dragging = false, lastP = null, pinch = 0;
function zApply() {
  zInner.style.transform = `translate(${zx}px, ${zy}px) scale(${zScale})`;
  zPct.textContent = Math.round(zScale * 100) + "%";
}
function zSet(v) { zScale = clamp(v, 1, 6); if (zScale === 1) { zx = zy = 0; } zApply(); }
function openZoom(rec, variant, src) {
  zInner.innerHTML = src
    ? `<img src="${src}" alt="${rec.n}" draggable="false" style="width:100%;height:100%;object-fit:contain;display:block">`
    : plate(rec, 1200, 900, "", variant === 1 ? .78 : 1, variant);
  zScale = 1; zx = zy = 0; zApply();
  zoomEl.classList.add("on");
  document.body.style.overflow = "hidden";
}
function closeZoom() { zoomEl.classList.remove("on"); if (!$$(".veil.on, .finder.on").length) document.body.style.overflow = ""; }
document.addEventListener("click", e => {
  const s = e.target.closest("[data-zoom]");
  if (s && spCurrent) { const ph = s.querySelector("img.photo.ok"); openZoom(spCurrent, +s.dataset.zoom, ph && ph.currentSrc); return; }
  if (e.target.closest("[data-zclose]") || (zoomEl.classList.contains("on") && !e.target.closest(".zoom__stage") && !e.target.closest(".zoom__bar"))) closeZoom();
});
$("#zIn").onclick = () => zSet(zScale * 1.5);
$("#zOut").onclick = () => zSet(zScale / 1.5);
$("#zReset").onclick = () => zSet(1);
zStage.addEventListener("wheel", e => { e.preventDefault(); zSet(zScale * (e.deltaY < 0 ? 1.12 : 1 / 1.12)); }, { passive: false });
zStage.addEventListener("pointerdown", e => { dragging = true; lastP = e; zStage.setPointerCapture(e.pointerId); zStage.classList.add("grabbing"); });
zStage.addEventListener("pointermove", e => {
  if (!dragging || zScale === 1) return;
  zx += e.clientX - lastP.clientX; zy += e.clientY - lastP.clientY; lastP = e; zApply();
});
["pointerup", "pointercancel"].forEach(t => zStage.addEventListener(t, () => { dragging = false; zStage.classList.remove("grabbing"); }));
zStage.addEventListener("dblclick", () => zSet(zScale > 1.2 ? 1 : 2.5));
addEventListener("keydown", e => { if (e.key === "Escape" && zoomEl.classList.contains("on")) closeZoom(); });

/* light theme only */
document.documentElement.setAttribute("data-theme", "light");

/* ---- go ---- */
renderFlora();
renderFly();
route();
measure();
onScroll();
requestAnimationFrame(tick);

/* frames finish loading quietly in the background — the page is
   already visible and interactive the moment it loads, whether that's
   the homepage or a deep link (a species page, #flora, a QR scan) */
loadFrames(() => { measure(); readScroll(); });

})();

