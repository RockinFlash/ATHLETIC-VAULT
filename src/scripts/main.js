// ============================================================
// LULUSHARK · Lógica de la tienda
// ============================================================
import { CONFIG, PRODUCTS, silhouette, svgURI } from "../data/products.js";

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const money = (n) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);

const ACCESSORY = ["Bolsa", "Botella", "Gorra"];
const isAccessory = (c) => ACCESSORY.includes(c);

// Asignar id estable a cada producto (se usa en openProduct)
PRODUCTS.forEach((p, i) => (p.id = i));

// Estado de filtros
const state = { tab: "Todos", q: "" };

// ---------- FILTRADO ----------
function applyFilters() {
  const cards = $$("#pgrid .pcard");
  let visible = 0;
  cards.forEach((card) => {
    const gender = card.dataset.gender;
    const acc = card.dataset.accessory === "1";
    const offer = card.dataset.offer === "1";
    const name = card.dataset.name;

    let ok = true;
    if (state.tab === "Mujer") ok = gender === "Mujer" && !acc;
    else if (state.tab === "Hombre") ok = gender === "Hombre" && !acc;
    else if (state.tab === "Accesorios") ok = acc;
    else if (state.tab === "Ofertas") ok = offer;
    // "Todos" => ok

    if (ok && state.q) ok = name.includes(state.q);

    card.style.display = ok ? "" : "none";
    if (ok) visible++;
  });
  $("#emptyState").classList.toggle("hidden", visible > 0);
}

function setTab(tab) {
  state.tab = tab;
  $$("#tabs .tab").forEach((t) => t.classList.toggle("active", t.dataset.tab === tab));
  applyFilters();
}

$$("#tabs .tab").forEach((t) => (t.onclick = () => setTab(t.dataset.tab)));

// Tiles y banners filtran y hacen scroll al grid
$$("[data-filter]").forEach((el) => {
  const go = () => {
    const f = el.dataset.filter;
    setTab(f);
    $("#destacados").scrollIntoView({ behavior: "smooth" });
  };
  el.onclick = go;
  el.onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } };
});

// Navegación del header (Mujer/Hombre/Accesorios/Ofertas)
$$(".nav a[data-nav]").forEach((a) => {
  a.onclick = (e) => { e.preventDefault(); setTab(a.dataset.nav); $("#destacados").scrollIntoView({ behavior: "smooth" }); };
});
$$(".nav a:not([data-nav])").forEach((a) => {
  a.onclick = (e) => {
    e.preventDefault();
    if (a.classList.contains("oferta")) setTab("Ofertas");
    else setTab("Todos");
    $("#destacados").scrollIntoView({ behavior: "smooth" });
  };
});

// Buscador (toggle en header)
let searchOpen = false;
$("#searchToggle").onclick = () => {
  searchOpen = !searchOpen;
  if (searchOpen) {
    const bar = document.createElement("div");
    bar.id = "searchBar";
    bar.style.cssText = "background:#fff;border-bottom:1px solid var(--line);padding:14px 0";
    bar.innerHTML = `<div class="wrap"><div style="display:flex;align-items:center;gap:10px;border:1px solid var(--line);border-radius:10px;padding:0 14px;height:46px">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      <input id="searchInput" type="search" placeholder="Buscar prenda…" style="border:none;outline:none;flex:1;font-size:15px;background:none"/>
      <button id="searchClose" style="font-size:20px;color:#999">×</button>
    </div></div>`;
    document.querySelector(".header").after(bar);
    const input = $("#searchInput");
    input.oninput = () => { state.q = input.value.trim().toLowerCase(); applyFilters(); };
    $("#searchClose").onclick = () => { bar.remove(); searchOpen = false; state.q = ""; applyFilters(); };
    input.focus();
  } else {
    $("#searchBar")?.remove();
    state.q = "";
    applyFilters();
  }
};

// ---------- FAVORITOS ----------
function toggleWish(btn) {
  btn.classList.toggle("on");
  toast(btn.classList.contains("on") ? "Agregado a favoritos ❤️" : "Quitado de favoritos");
}

// ---------- MODAL ----------
let current = null, selSize = null, selColor = null, qty = 1;

function openProduct(id) {
  const p = PRODUCTS.find((x) => x.id === id);
  if (!p) return;
  current = p; selSize = null; selColor = p.colors[0].name; qty = 1;
  const imgBox = $("#modalImg");
  imgBox.querySelectorAll("img").forEach((n) => n.remove());
  const img = document.createElement("img");
  img.src = svgURI(silhouette(p.category, p.colors[0].hex));
  img.alt = p.name;
  imgBox.appendChild(img);
  renderModal();
  $("#overlay").classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeProduct() {
  $("#overlay").classList.remove("open");
  document.body.style.overflow = "";
}
function renderModal() {
  const p = current;
  $("#modalInfo").innerHTML = `
    <div>
      <div class="brand-line"><span>${p.brand}</span><span class="gender-pill">${p.gender}</span></div>
      <div class="pname" style="margin-top:6px">${p.name}</div>
    </div>
    <p class="desc">${p.desc || ""}</p>
    <div>
      <span class="field-label">Color</span>
      <div class="swatches">
        ${p.colors.map((c) => `<button class="swatch ${c.name === selColor ? "sel" : ""}" title="${c.name}" style="background:${c.hex}" onclick="pickColor('${c.name}')"></button>`).join("")}
      </div>
      <div style="font-size:13px;color:var(--muted);margin-top:6px;font-weight:600" id="colorName">${selColor}</div>
    </div>
    <div>
      <span class="field-label">Talla</span>
      <div class="size-btns">
        ${p.sizes.map((s) => `<button class="size-btn ${s === selSize ? "sel" : ""}" onclick="pickSize('${s}')">${s}</button>`).join("")}
      </div>
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between">
      <span class="field-label" style="margin:0">Cantidad</span>
      <div class="qty"><button onclick="chQty(-1)">−</button><span id="qtyVal">${qty}</span><button onclick="chQty(1)">+</button></div>
    </div>
    <div class="total-row"><span class="field-label" style="margin:0">Total</span><span class="amt" id="totalAmt">${money(p.price * qty)}</span></div>
    <div class="actions">
      <button class="btn wa" id="waBtn" onclick="apart('whatsapp')" ${selSize ? "" : "disabled"}>📲 Apartar por WhatsApp</button>
      <button class="btn ig" onclick="apart('instagram')">💬 Escribir por Instagram</button>
      <button class="btn copy" onclick="copyMsg()">📋 Copiar mensaje de reserva</button>
    </div>
    <div class="fineprint">Al apartar te contactamos para confirmar pago y entrega.</div>
  `;
}
function pickSize(s) { selSize = s; renderModal(); }
function pickColor(c) { selColor = c; renderModal(); }
function chQty(d) { qty = Math.max(1, Math.min(9, qty + d)); renderModal(); }

$("#modalClose").onclick = closeProduct;
$("#overlay").addEventListener("click", (e) => { if (e.target.id === "overlay") closeProduct(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeProduct(); closeDrawer(); } });

// ---------- APARTAR / RESERVAR ----------
function buildMessage() {
  const p = current;
  return [
    `Hola ${CONFIG.storeName} 👋`,
    `Quiero apartar esta prenda:`,
    `• Producto: ${p.name}`,
    `• Marca: ${p.brand}`,
    `• Género: ${p.gender}`,
    `• Talla: ${selSize || "—"}`,
    `• Color: ${selColor}`,
    `• Cantidad: ${qty}`,
    `• Total: ${money(p.price * qty)}`,
    `¿Me confirmas disponibilidad?`,
  ].join("\n");
}
function apart(channel) {
  const msg = buildMessage();
  if (channel === "whatsapp") {
    if (!selSize) { toast("Elige una talla primero 🙂"); return; }
    saveReservation(msg);
    window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
    toast("Abriendo WhatsApp… ✅");
  } else {
    navigator.clipboard?.writeText(msg).catch(() => {});
    window.open(`https://instagram.com/${CONFIG.instagram}`, "_blank", "noopener");
    saveReservation(msg);
    toast("Mensaje copiado · pégalo en nuestro DM 💬");
  }
}
function copyMsg() {
  navigator.clipboard?.writeText(buildMessage())
    .then(() => toast("Mensaje copiado al portapapeles 📋"))
    .catch(() => toast("No se pudo copiar"));
}

// ---------- RESERVAS (localStorage) ----------
const KEY = "lulushark_reservations";
const loadResv = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
function saveReservation(msg) {
  const r = loadResv();
  r.unshift({ msg, ts: Date.now() });
  localStorage.setItem(KEY, JSON.stringify(r.slice(0, 20)));
  updateBagBadge(); renderDrawer();
}
function removeResv(i) {
  const r = loadResv(); r.splice(i, 1);
  localStorage.setItem(KEY, JSON.stringify(r));
  updateBagBadge(); renderDrawer();
}
function updateBagBadge() {
  const n = loadResv().length;
  const b = $("#bagCount");
  b.textContent = n; b.classList.toggle("hidden", n === 0);
}
function renderDrawer() {
  const body = $("#drawerBody");
  const r = loadResv();
  if (!r.length) { body.innerHTML = `<div class="drawer-empty">Aún no tienes prendas apartadas.<br>¡Explora el catálogo! 🛍️</div>`; return; }
  body.innerHTML = r.map((it, i) => {
    const get = (lbl) => { const ln = it.msg.split("\n").find((x) => x.includes(lbl)); return ln ? ln.replace(/.*:\s*/, "") : ""; };
    const prod = get("Producto:") || "Prenda";
    const size = get("Talla:");
    const q = get("Cantidad:");
    const total = get("Total:");
    return `<div class="resv">
      <div class="t">${prod}</div>
      <div class="m">Talla ${size} · Cant. ${q} · ${total}</div>
      <button class="rm" onclick="removeResv(${i})">Eliminar ✕</button>
    </div>`;
  }).join("");
}
function openDrawer() { $("#drawer").classList.add("open"); $("#drawerOverlay").classList.add("open"); renderDrawer(); }
function closeDrawer() { $("#drawer").classList.remove("open"); $("#drawerOverlay").classList.remove("open"); }
$("#bagBtn").onclick = openDrawer;
$("#drawerClose").onclick = closeDrawer;
$("#drawerOverlay").onclick = closeDrawer;

// ---------- TOAST ----------
let toastTimer;
function toast(t) {
  const el = $("#toast"); el.textContent = t; el.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
}

// ---------- INIT ----------
updateBagBadge();
applyFilters();

// Exponer funciones usadas en atributos onclick inline (los módulos no las ponen en window)
Object.assign(window, {
  openProduct, toggleWish, pickColor, pickSize, chQty, apart, copyMsg, removeResv,
});
