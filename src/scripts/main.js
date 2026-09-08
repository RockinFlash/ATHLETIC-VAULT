// ============================================================
// ATHLETIC VAULT · Interactividad (vanilla JS, sin dependencias)
// ============================================================
import { PRODUCTS, getProduct, silhouette, silhouetteAlt, svgURI, CONFIG } from "../data/products.js";
import { getSettings, addReservation, buildWhatsAppMessage } from "../lib/db.js";

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const money = (n) => "$" + Number(n).toLocaleString("es-MX");
const BASE = document.body?.dataset?.base || "";
const imgFor = (p, colorHex, view = "full") =>
  svgURI(view === "alt" ? silhouetteAlt(p.category, colorHex || p.colors[0]?.hex || "#2b2b2b") : silhouette(p.category, colorHex || p.colors[0]?.hex || "#2b2b2b"));

// ------------------------------------------------------------
// Toast
// ------------------------------------------------------------
let toastTimer;
function toast(msg) {
  const el = $("#toast");
  if (!el) return;
  $("#toastMsg").textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
}

// ------------------------------------------------------------
// Header: estado al hacer scroll
// ------------------------------------------------------------
const header = $("#header");
if (header) {
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 12);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

// ------------------------------------------------------------
// Navegación móvil (burger) + mega-menu en móvil
// ------------------------------------------------------------
const nav = $("#nav");
const burger = $("#burgerBtn");
if (nav && burger) {
  burger.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    burger.setAttribute("aria-expanded", open);
    document.body.style.overflow = open ? "hidden" : "";
  });
  // Cerrar al hacer clic en un enlace
  $$(".nav a").forEach((a) =>
    a.addEventListener("click", () => {
      nav.classList.remove("open");
      document.body.style.overflow = "";
    })
  );
  // En móvil, el item "Marcas" expande su mega-menu en vez de hover
  const brandItem = $(".nav-item");
  if (brandItem) {
    const link = brandItem.querySelector(":scope > a");
    link.addEventListener("click", (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        brandItem.classList.toggle("open");
      }
    });
  }
}

// ------------------------------------------------------------
// THE VAULT: tabs de filtrado (sin recarga)
// ------------------------------------------------------------
const vaultTabs = $("#vaultTabs");
const vaultGrid = $("#vaultGrid");
if (vaultTabs && vaultGrid) {
  const cards = $$(".pcard", vaultGrid);
  const empty = $("#vaultEmpty");
  vaultTabs.addEventListener("click", (e) => {
    const tab = e.target.closest(".tab");
    if (!tab) return;
    $$(".tab", vaultTabs).forEach((t) => {
      t.classList.remove("active");
      t.setAttribute("aria-selected", "false");
    });
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");
    const f = tab.dataset.filter;
    let visible = 0;
    cards.forEach((c) => {
      let show = true;
      if (f.startsWith("brand:")) show = c.dataset.brand === f.split(":")[1];
      else if (f.startsWith("gender:")) show = c.dataset.gender === f.split(":")[1];
      else if (f.startsWith("accessory:")) show = c.dataset.accessory === "1";
      c.classList.toggle("hidden", !show);
      if (show) {
        visible++;
        c.style.animation = "none";
        void c.offsetWidth; // reinicia animación
        c.style.animation = "";
        c.style.animationDelay = `${Math.min(visible * 40, 400)}ms`;
      }
    });
    if (empty) empty.classList.toggle("hidden", visible > 0);
  });
}

// ------------------------------------------------------------
// Catálogo: filtros + orden + contador
// ------------------------------------------------------------
const catalogGrid = $("#catalogGrid");
if (catalogGrid) {
  const cards = $$(".pcard", catalogGrid);
  const empty = $("#catalogEmpty");
  const count = $("#resultCount");
  const clearBtn = $("#clearFilters");
  const filters = $("#filters");
  const filterToggle = $("#filterToggle");
  const sortSel = $("#sortSelect");
  const priceMin = $("#priceMin");
  const priceMax = $("#priceMax");

  const state = {
    brands: new Set(),
    cats: new Set(),
    sizes: new Set(),
    colors: new Set(),
    min: priceMin ? Number(priceMin.value) : 0,
    max: priceMax ? Number(priceMax.value) : Infinity,
    inStock: false,
    lowStock: false,
    sort: "featured",
  };

  function apply() {
    let visible = 0;
    cards.forEach((c) => {
      const p = Number(c.dataset.price);
      const sizes = (c.dataset.sizes || "").split(" ");
      const colors = (c.dataset.colors || "").toLowerCase();
      const stock = Number(c.dataset.stock);
      let ok = true;
      if (state.brands.size && !state.brands.has(c.dataset.brand)) ok = false;
      if (ok && state.cats.size && !state.cats.has(c.dataset.category)) ok = false;
      if (ok && state.sizes.size && !state.sizes.has(sizes)) ok = false;
      if (ok && state.colors.size && ![...state.colors].some((col) => colors.includes(col))) ok = false;
      if (ok && (p < state.min || p > state.max)) ok = false;
      if (ok && state.inStock && stock <= 0) ok = false;
      if (ok && state.lowStock && stock > 6) ok = false;
      c.classList.toggle("hidden", !ok);
      if (ok) visible++;
    });
    // Orden
    const sorted = [...cards].sort((a, b) => {
      switch (state.sort) {
        case "price-asc": return a.dataset.price - b.dataset.price;
        case "price-desc": return b.dataset.price - a.dataset.price;
        case "discount": return (b.dataset.offer === "1" ? 1 : 0) - (a.dataset.offer === "1" ? 1 : 0);
        case "name": return a.querySelector(".pname").textContent.localeCompare(b.querySelector(".pname").textContent);
        default: return 0;
      }
    });
    sorted.forEach((c) => catalogGrid.appendChild(c));
    if (count) count.textContent = `${visible} producto${visible === 1 ? "" : "s"}`;
    if (empty) empty.classList.toggle("hidden", visible > 0);
    if (clearBtn) {
      const active = state.brands.size + state.cats.size + state.sizes.size + state.colors.size > 0 || state.inStock || state.lowStock;
      clearBtn.classList.toggle("hidden", !active);
    }
  }

  // Checkboxes (marca / categoría / disponibilidad)
  $$(".fgroup input[type=checkbox]", filters).forEach((cb) => {
    cb.addEventListener("change", () => {
      const facet = cb.closest(".fgroup").dataset.facet;
      const set = facet === "brand" ? state.brands : facet === "category" ? state.cats : null;
      if (set) cb.checked ? set.add(cb.value) : set.delete(cb.value);
      if (facet === "availability") {
        state.inStock = cb.value === "in" && cb.checked;
        state.lowStock = cb.value === "low" && cb.checked;
      }
      apply();
    });
  });

  // Chips (talla / color)
  $$(".fchip", filters).forEach((chip) => {
    chip.addEventListener("click", () => {
      const on = chip.classList.toggle("active");
      const key = chip.dataset.size ? "sizes" : "colors";
      const val = chip.dataset.size || chip.dataset.color;
      on ? state[key].add(val) : state[key].delete(val);
      apply();
    });
  });

  // Precio
  const onPrice = () => {
    state.min = Number(priceMin.value) || 0;
    state.max = Number(priceMax.value) || Infinity;
    apply();
  };
  priceMin?.addEventListener("input", onPrice);
  priceMax?.addEventListener("input", onPrice);

  // Orden
  sortSel?.addEventListener("change", () => { state.sort = sortSel.value; apply(); });

  // Limpiar
  clearBtn?.addEventListener("click", () => {
    state.brands.clear(); state.cats.clear(); state.sizes.clear(); state.colors.clear();
    state.inStock = false; state.lowStock = false;
    $$(".fgroup input[type=checkbox]", filters).forEach((cb) => (cb.checked = false));
    $$(".fchip", filters).forEach((c) => c.classList.remove("active"));
    if (priceMin) priceMin.value = priceMin.min;
    if (priceMax) priceMax.value = priceMax.max;
    state.min = priceMin ? Number(priceMin.min) : 0;
    state.max = priceMax ? Number(priceMax.max) : Infinity;
    apply();
  });

  // Drawer de filtros en móvil
  filterToggle?.addEventListener("click", () => filters.classList.toggle("open"));
  apply();
}

// ------------------------------------------------------------
// Búsqueda (overlay)
// ------------------------------------------------------------
const searchOverlay = $("#searchOverlay");
const searchInput = $("#searchInput");
const searchResults = $("#searchResults");
const searchEmpty = $("#searchEmpty");
if (searchOverlay && searchInput) {
  const openSearch = () => {
    searchOverlay.classList.add("open");
    searchOverlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setTimeout(() => searchInput.focus(), 200);
  };
  const closeSearch = () => {
    searchOverlay.classList.remove("open");
    searchOverlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };
  $("#searchToggle")?.addEventListener("click", openSearch);
  $("#searchClose")?.addEventListener("click", closeSearch);
  searchOverlay.addEventListener("click", (e) => { if (e.target === searchOverlay) closeSearch(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeSearch(); });

  function render(q) {
    const term = q.trim().toLowerCase();
    if (!term) { searchResults.innerHTML = ""; searchEmpty?.classList.add("hidden"); return; }
    const matches = PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.brand.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term)
    ).slice(0, 8);
    if (!matches.length) {
      searchResults.innerHTML = "";
      searchEmpty?.classList.remove("hidden");
      return;
    }
    searchEmpty?.classList.add("hidden");
    searchResults.innerHTML = matches
      .map(
        (p) => `
      <a class="search-result" href="${BASE}/producto/${p.id}">
        <img src="${imgFor(p)}" alt="${p.name}" loading="lazy"/>
        <div>
          <div class="sr-brand">${p.brand}</div>
          <div class="sr-name">${p.name}</div>
          <div class="sr-price">${money(p.price)} MXN</div>
        </div>
      </a>`
      )
      .join("");
  }
  searchInput.addEventListener("input", () => render(searchInput.value));
  $$(".search-chip").forEach((chip) =>
    chip.addEventListener("click", () => {
      searchInput.value = chip.dataset.chip;
      render(chip.dataset.chip);
    })
  );
}

// ------------------------------------------------------------
// Carrito (localStorage)
// ------------------------------------------------------------
const CART_KEY = "av_cart";
const FAV_KEY = "av_favs";
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch { return d; } };
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));

let cart = load(CART_KEY, []);
let favs = load(FAV_KEY, []);

const drawer = $("#cartDrawer");
const drawerOverlay = $("#drawerOverlay");
const cartBody = $("#cartBody");
const cartFoot = $("#cartFoot");
const cartEmpty = $("#cartEmpty");
const bagCount = $("#bagCount");
const favCount = $("#favCount");

function openDrawer() {
  drawer?.classList.add("open");
  drawerOverlay?.classList.add("open");
  drawer?.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function closeDrawer() {
  drawer?.classList.remove("open");
  drawerOverlay?.classList.remove("open");
  drawer?.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}
$("#bagBtn")?.addEventListener("click", openDrawer);
$("#drawerClose")?.addEventListener("click", closeDrawer);
drawerOverlay?.addEventListener("click", closeDrawer);

function cartQty() { return cart.reduce((s, i) => s + i.qty, 0); }
function cartTotal() { return cart.reduce((s, i) => s + i.qty * i.price, 0); }

function updateBadges(pop) {
  const q = cartQty();
  if (bagCount) {
    bagCount.textContent = q;
    bagCount.classList.toggle("show", q > 0);
    bagCount.classList.toggle("hidden", q === 0);
    if (pop && q > 0) { bagCount.classList.remove("pop"); void bagCount.offsetWidth; bagCount.classList.add("pop"); }
  }
  if (favCount) {
    favCount.textContent = favs.length;
    favCount.classList.toggle("show", favs.length > 0);
    favCount.classList.toggle("hidden", favs.length === 0);
  }
}

let cartMode = "compra"; // "compra" | "reserva"
const cartSuccess = $("#cartSuccess");

function showSuccess(title, msg) {
  if (!cartSuccess) return;
  $("#successTitle").textContent = title;
  $("#successMsg").textContent = msg;
  cartBody.style.display = "none";
  cartFoot.style.display = "none";
  cartSuccess.style.display = "";
}
function hideSuccess() {
  if (!cartSuccess) return;
  cartSuccess.style.display = "none";
  cartBody.style.display = "";
}

function renderCart() {
  if (!cartBody) return;
  hideSuccess();
  if (!cart.length) {
    cartBody.innerHTML = `<div class="drawer-empty" id="cartEmpty"><div class="big">🛍️</div><h3>Tu carrito está vacío</h3><p>Explora la colección y agrega tus piezas favoritas.</p></div>`;
    cartFoot?.style.setProperty("display", "none");
    $("#cartCountLabel") && ($("#cartCountLabel").textContent = "");
    return;
  }
  cartFoot?.style.setProperty("display", "");
  const label = $("#cartCountLabel");
  if (label) label.textContent = `(${cartQty()})`;
  cartBody.innerHTML = cart
    .map(
      (i) => `
    <div class="cart-item" data-key="${i.key}">
      <img src="${i.img}" alt="${i.name}"/>
      <div class="ci-info">
        <div class="ci-brand">${i.brand}</div>
        <div class="ci-name">${i.name}</div>
        <div class="ci-meta">${i.color}${i.size ? " · " + i.size : ""}</div>
        <div class="ci-qty">
          <button data-act="dec" aria-label="Restar">−</button>
          <span>${i.qty}</span>
          <button data-act="inc" aria-label="Sumar">+</button>
        </div>
      </div>
      <div class="ci-right">
        <div class="ci-price">${money(i.price * i.qty)}</div>
        <button class="ci-remove" data-act="rm">Quitar</button>
      </div>
    </div>`
    )
    .join("");
  const total = cartTotal();
  const s = getSettings();
  $("#cartSubtotal").textContent = money(total) + " MXN";
  $("#cartTotal").textContent = money(total) + " MXN";
  $("#cartShipping").textContent = total >= s.freeShippingFrom ? "GRATIS" : money(s.shippingCost) + " MXN";
}

function addToCart(p, color, size, qty = 1, mode = "compra") {
  const key = `${p.id}|${color}|${size || ""}`;
  const found = cart.find((i) => i.key === key);
  if (found) found.qty += qty;
  else cart.push({ key, id: p.id, name: p.name, brand: p.brand, price: p.price, color, size, qty, mode, img: imgFor(p, color) });
  save(CART_KEY, cart);
  renderCart();
  updateBadges(true);
  toast(mode === "reserva" ? "Agregado a tu reserva" : "Agregado al carrito");
}

cartBody?.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-act]");
  if (!btn) return;
  const key = btn.closest(".cart-item").dataset.key;
  const item = cart.find((i) => i.key === key);
  if (!item) return;
  const act = btn.dataset.act;
  if (act === "inc") item.qty++;
  else if (act === "dec") item.qty = Math.max(1, item.qty - 1);
  else if (act === "rm") cart = cart.filter((i) => i.key !== key);
  save(CART_KEY, cart);
  renderCart();
  updateBadges();
});

// Modo del carrito (comprar / apartar)
const drawerMode = $("#drawerMode");
function setCartMode(mode) {
  cartMode = mode;
  $$("#drawerMode .mode-btn").forEach((b) => b.classList.toggle("active", b.dataset.mode === mode));
  const lbl = $("#checkoutLabel");
  if (lbl) lbl.textContent = mode === "reserva" ? "Apartar por WhatsApp" : "Continuar por WhatsApp";
  const note = $("#drawerNote");
  if (note) note.textContent = mode === "reserva" ? "Reserva sin compromiso. Te contactamos para confirmar pago y envío." : "Sin cuenta. Te contactamos por WhatsApp para confirmar.";
}
drawerMode?.addEventListener("click", (e) => {
  const b = e.target.closest(".mode-btn");
  if (b) setCartMode(b.dataset.mode);
});

// Checkout por WhatsApp (compra o reserva)
$("#checkoutBtn")?.addEventListener("click", () => {
  if (!cart.length) return;
  const s = getSettings();
  const customer = $("#guestName")?.value.trim() || "Cliente";
  const phone = $("#guestPhone")?.value.trim() || "";
  const items = cart.map((i) => ({ id: i.id, brand: i.brand, name: i.name, color: i.color, size: i.size, qty: i.qty, price: i.price }));
  const total = cartTotal();
  const res = addReservation({ type: cartMode, customer, whatsapp: phone, items, total });
  const msg = buildWhatsAppMessage(res, s);
  window.open(`https://wa.me/${s.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
  showSuccess(
    cartMode === "reserva" ? "¡Reserva registrada!" : "¡Pedido enviado!",
    cartMode === "reserva"
      ? `Abrimos WhatsApp con tu reserva ${res.id}. Envía el mensaje para que la confirmemos y te apartemos las piezas.`
      : `Abrimos WhatsApp con tu pedido ${res.id}. Envía el mensaje para confirmar disponibilidad y envío.`
  );
});

// Cerrar vista de éxito
$("#successClose")?.addEventListener("click", () => {
  cart = [];
  save(CART_KEY, cart);
  renderCart();
  updateBadges();
  hideSuccess();
  closeDrawer();
});

// ------------------------------------------------------------
// Favoritos
// ------------------------------------------------------------
const favDrawer = $("#favDrawer");
const favOverlay = $("#favOverlay");
const favBody = $("#favBody");
const favCountLabel = $("#favCountLabel");

function openFavDrawer() {
  renderFavs();
  favDrawer?.classList.add("open");
  favOverlay?.classList.add("open");
  favDrawer?.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function closeFavDrawer() {
  favDrawer?.classList.remove("open");
  favOverlay?.classList.remove("open");
  favDrawer?.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}
$("#favOpen")?.addEventListener("click", openFavDrawer);
$("#favClose")?.addEventListener("click", closeFavDrawer);
favOverlay?.addEventListener("click", closeFavDrawer);

function renderFavs() {
  if (!favBody) return;
  const items = favs.map((id) => getProduct(id)).filter(Boolean);
  if (!favCountLabel) return;
  favCountLabel.textContent = items.length ? `(${items.length})` : "";
  if (!items.length) {
    favBody.innerHTML = `<div class="drawer-empty" id="favEmpty"><div class="big">🤍</div><h3>Aún no tienes favoritos</h3><p>Toca el corazón en cualquier producto para guardarlo aquí.</p><a class="btn btn--primary btn--block" href="${BASE}/" style="margin-top:18px">Explorar colección</a></div>`;
    return;
  }
  favBody.innerHTML = items
    .map(
      (p) => `
    <div class="cart-item" data-fav-id="${p.id}">
      <a href="${BASE}/producto/${p.id}" style="flex:none">
        <img src="${imgFor(p)}" alt="${p.name}"/>
      </a>
      <div class="ci-info">
        <div class="ci-brand">${p.brand}</div>
        <div class="ci-name">${p.name}</div>
        <div class="ci-meta">${p.colors?.[0]?.name || ""}${p.sizes?.length ? " · " + p.sizes.join(" / ") : ""}</div>
      </div>
      <div class="ci-right">
        <div class="ci-price">${money(p.price)}</div>
        <button class="ci-remove" data-fav-rm="${p.id}">Quitar</button>
      </div>
    </div>`
    )
    .join("");
}

function toggleFav(id) {
  const has = favs.includes(id);
  favs = has ? favs.filter((f) => f !== id) : [...favs, id];
  save(FAV_KEY, favs);
  updateBadges();
  syncFavUI();
  if (favDrawer?.classList.contains("open")) renderFavs();
  toast(has ? "Quitado de favoritos" : "Agregado a favoritos");
}
function syncFavUI() {
  $$("[data-wish]").forEach((b) => b.classList.toggle("active", favs.includes(Number(b.dataset.wish))));
  const pf = $("#favBtn");
  if (pf) pf.classList.toggle("active", favs.includes(Number(pf.dataset.pid)));
}
// Delegación para wish en tarjetas
document.addEventListener("click", (e) => {
  const w = e.target.closest("[data-wish]");
  if (w) { e.preventDefault(); e.stopPropagation(); toggleFav(Number(w.dataset.wish)); }
});
// Delegación para quitar favoritos del panel
favBody?.addEventListener("click", (e) => {
  const rm = e.target.closest("[data-fav-rm]");
  if (rm) { e.preventDefault(); toggleFav(Number(rm.dataset.favRm)); }
});

// ------------------------------------------------------------
// Countdown (drops)
// ------------------------------------------------------------
const cd = $("#countdown");
if (cd) {
  const target = new Date(cd.dataset.target).getTime();
  const pad = (n) => String(n).padStart(2, "0");
  const tick = () => {
    let diff = target - Date.now();
    if (diff < 0) diff = 0;
    const d = Math.floor(diff / 864e5);
    const h = Math.floor((diff % 864e5) / 36e5);
    const m = Math.floor((diff % 36e5) / 6e4);
    const s = Math.floor((diff % 6e4) / 1e3);
    cd.querySelector('[data-cd="d"]').textContent = pad(d);
    cd.querySelector('[data-cd="h"]').textContent = pad(h);
    cd.querySelector('[data-cd="m"]').textContent = pad(m);
    cd.querySelector('[data-cd="s"]').textContent = pad(s);
  };
  tick();
  setInterval(tick, 1000);
}

// ------------------------------------------------------------
// Formulario de drop
// ------------------------------------------------------------
$("#dropForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const input = e.target.querySelector("input");
  if (input && input.value) {
    const list = load("av_drops", []);
    if (!list.includes(input.value)) list.push(input.value);
    save("av_drops", list);
    input.value = "";
    toast("¡Alerta activada! Te avisaremos 🚀");
  }
});

// ------------------------------------------------------------
// Skeleton loaders: muestra placeholders breves al cargar un grid
// ------------------------------------------------------------
const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
function skeletonize(grid, count = 8, ms = 420) {
  if (!grid || reduceMotion) return;
  const skels = Array.from({ length: count })
    .map(() => `<div class="skel"><div class="sk-thumb"></div><div class="sk-line"></div><div class="sk-line short"></div></div>`)
    .join("");
  const holder = document.createElement("div");
  holder.className = "pgrid pgrid--skel";
  holder.style.cssText = "grid-column:1/-1";
  holder.innerHTML = skels;
  grid.parentNode.insertBefore(holder, grid);
  grid.style.opacity = "0";
  setTimeout(() => {
    holder.remove();
    grid.style.transition = "opacity .4s var(--ease)";
    grid.style.opacity = "1";
  }, ms);
}
skeletonize($("#catalogGrid"));
skeletonize($("#vaultGrid"));

// ------------------------------------------------------------
// Reveal on scroll
// ------------------------------------------------------------
const revealEls = $$(".reveal");
if (revealEls.length && "IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }),
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("in"));
}

// ------------------------------------------------------------
// FAQ accordion
// ------------------------------------------------------------
$$(".faq-item h4").forEach((h) =>
  h.addEventListener("click", () => h.closest(".faq-item").classList.toggle("open"))
);

// ------------------------------------------------------------
// Página de producto: color, talla, galería, carrito, fav
// ------------------------------------------------------------
const mainImg = $("#mainImg");
if (mainImg) {
  const pid = Number($("#favBtn")?.dataset.pid || 0);
  const p = getProduct(pid);
  const stock = Number($(".product-info")?.dataset.stock ?? p.stock);
  const out = stock <= 0;
  let pMode = "compra";

  // Nota de stock dinámica
  const stockNote = $("#stockNote");
  function renderStockNote() {
    if (!stockNote) return;
    stockNote.classList.remove("ok", "out");
    if (out) {
      stockNote.textContent = "Agotado — vuelve pronto";
      stockNote.classList.add("out");
    } else if (stock <= 6) {
      stockNote.textContent = `¡Solo ${stock} unidades disponibles!`;
    } else {
      stockNote.textContent = "En existencia";
      stockNote.classList.add("ok");
    }
  }
  renderStockNote();

  // Toggle de modo (Comprar / Apartar)
  const modeToggle = $("#modeToggle");
  const addCartBtn = $("#addCart");
  const addCartLabel = $("#addCartLabel");
  function setProductMode(mode) {
    pMode = mode;
    $$("#modeToggle .mode-btn").forEach((b) => b.classList.toggle("active", b.dataset.mode === mode));
    if (addCartLabel) addCartLabel.textContent = mode === "reserva" ? "Apartar producto" : "Agregar al carrito";
  }
  modeToggle?.addEventListener("click", (e) => {
    const b = e.target.closest(".mode-btn");
    if (b) setProductMode(b.dataset.mode);
  });

  // Bloquear si agotado
  if (out && addCartBtn) {
    addCartBtn.disabled = true;
    if (addCartLabel) addCartLabel.textContent = "Agotado";
  }

  // Color (swatches)
  $$("#colorOpts .color-opt").forEach((opt) =>
    opt.addEventListener("click", () => {
      $$("#colorOpts .color-opt").forEach((o) => o.classList.remove("active"));
      opt.classList.add("active");
      const hex = opt.dataset.color;
      mainImg.src = imgFor(p, hex, "full");
      const cn = $("#colorName");
      if (cn) cn.textContent = opt.dataset.name;
      // sincroniza thumbs (vista completa del color)
      $$("#thumbs button").forEach((t) => t.classList.toggle("active", t.dataset.color === hex && t.dataset.view === "full"));
    })
  );
  // Talla
  $$("#sizeOpts .size-opt").forEach((s) =>
    s.addEventListener("click", () => {
      $$("#sizeOpts .size-opt").forEach((o) => o.classList.remove("active"));
      s.classList.add("active");
    })
  );
  // Thumbs de galería (vista completa o detalle)
  $$("#thumbs button").forEach((t) =>
    t.addEventListener("click", () => {
      $$("#thumbs button").forEach((o) => o.classList.remove("active"));
      t.classList.add("active");
      mainImg.src = imgFor(p, t.dataset.color, t.dataset.view || "full");
      const hex = t.dataset.color;
      $$("#colorOpts .color-opt").forEach((o) => o.classList.toggle("active", o.dataset.color === hex));
      const cn = $("#colorName");
      if (cn) cn.textContent = p.colors.find((c) => c.hex === hex)?.name || "";
    })
  );
  // Agregar al carrito / apartar
  addCartBtn?.addEventListener("click", () => {
    if (out) return;
    const color = $("#colorOpts .color-opt.active")?.dataset.name || p.colors[0].name;
    const size = $("#sizeOpts .size-opt.active")?.dataset.size || p.sizes[0];
    addToCart(p, color, size, 1, pMode);
    setCartMode(pMode);
    openDrawer();
  });
  // Favorito
  const pf = $("#favBtn");
  if (pf) {
    pf.dataset.pid = p.id;
    pf.classList.toggle("active", favs.includes(p.id));
    pf.addEventListener("click", () => toggleFav(p.id));
  }
}

// ------------------------------------------------------------
// Init
// ------------------------------------------------------------
renderCart();
updateBadges();
syncFavUI();
