// ============================================================
// ATHLETIC VAULT · Interactividad (vanilla JS, sin dependencias)
// ============================================================
import { PRODUCTS, getProduct, silhouette, silhouetteAlt, svgURI, brandSlug, BRANDS, CONFIG } from "../data/products.js";
import { getSettings, addReservation, buildWhatsAppMessage, getProducts, initCloudSync } from "../lib/db.js";

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const money = (n) => "$" + Number(n).toLocaleString("es-MX");
const BASE = document.body?.dataset?.base || "";
const imgFor = (p, colorHex, view = "full") =>
  svgURI(view === "alt" ? silhouetteAlt(p.category, colorHex || p.colors[0]?.hex || "#2b2b2b") : silhouette(p.category, colorHex || p.colors[0]?.hex || "#2b2b2b"));
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// ------------------------------------------------------------
// Skeleton loaders: ocultan el grid (con placeholders) MIENTRAS se
// sincroniza con la nube, para evitar el "flash" de datos viejos.
// ------------------------------------------------------------
const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
const _skelHolders = new Map(); // grid -> holder
function showSkeleton(grid, count = 8) {
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
  _skelHolders.set(grid, holder);
}
function revealGrid(grid) {
  const holder = _skelHolders.get(grid);
  if (holder) { holder.remove(); _skelHolders.delete(grid); }
  if (!grid) return;
  grid.style.transition = "opacity .4s var(--ease)";
  grid.style.opacity = "1";
}

// Normaliza un producto de la capa de datos (db.js) añadiendo los campos
// derivados que products.js asigna en build-time.
function normalizeProduct(p) {
  return {
    ...p,
    brandSlug: p.brandSlug || brandSlug(p.brand),
    gender: (p.gender || "").toLowerCase(),
    accessory: p.accessory ?? ["Bolsa", "Botella", "Gorra"].includes(p.category),
    offer: p.offer ?? !!p.oldPrice,
    discount: p.discount ?? (p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0),
    lowStock: p.lowStock ?? p.stock <= 6,
  };
}
// Lee un producto de la capa de datos (refleja los cambios del admin).
function dbGetProduct(id) {
  const p = getProducts().find((x) => x.id === Number(id));
  return p ? normalizeProduct(p) : null;
}
// HTML de una tarjeta de producto (réplica de ProductCard.astro).
function cardHTML(p, i) {
  const hex = p.colors[0]?.hex || "#2b2b2b";
  const img = p.image || svgURI(silhouette(p.category, hex));
  const imgAlt = p.image || svgURI(silhouetteAlt(p.category, hex));
  const sizesLabel = p.sizes.length > 4 ? `${p.sizes.length} tallas` : p.sizes.join(" · ");
  const out = p.stock <= 0;
  const low = !out && p.stock <= 6;
  const badge = p.badge
    ? `<span class="pbadge ${p.offer ? "pbadge--red" : ""}">${p.offer ? '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z"/></svg>' : ""}${esc(p.badge)}</span>`
    : "";
  const dots = p.colors.slice(0, 4).map((c) => `<span class="cdot" style="background:${c.hex}" title="${esc(c.name)}"></span>`).join("");
  const more = p.colors.length > 4 ? `<span class="more">+${p.colors.length - 4}</span>` : "";
  return `<article class="pcard ${out ? "pcard--out" : ""}" style="animation-delay:${Math.min(i * 45, 450)}ms" data-id="${p.id}" data-brand="${esc(p.brandSlug)}" data-gender="${esc(p.gender)}" data-category="${esc(p.category)}" data-price="${p.price}" data-offer="${p.offer ? "1" : "0"}" data-accessory="${p.accessory ? "1" : "0"}" data-sizes="${esc(p.sizes.join(" "))}" data-colors="${esc(p.colors.map((c) => c.name).join(" "))}" data-stock="${p.stock}">
    <div class="pthumb">
      <img class="pthumb-img" src="${img}" alt="${esc(p.name)}" loading="lazy" width="600" height="600" />
      <img class="pthumb-img pthumb-img--alt" src="${imgAlt}" alt="" aria-hidden="true" loading="lazy" width="600" height="600" />
      ${badge}
      ${out ? '<span class="pbadge pbadge--out">AGOTADO</span>' : ""}
      ${!out && low ? `<span class="pbadge pbadge--low">Solo quedan ${p.stock}</span>` : ""}
      <button class="wish" data-wish="${p.id}" aria-label="Agregar a favoritos"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></button>
    </div>
    <div class="pbody">
      <div class="pbrand">${esc(p.brand)}</div>
      <h3 class="pname">${esc(p.name)}</h3>
      <div class="pprice">
        <span class="now">$${Number(p.price).toLocaleString("es-MX")} MXN</span>
        ${p.oldPrice ? `<span class="was">${Number(p.oldPrice).toLocaleString("es-MX")}</span>` : ""}
        ${p.discount > 0 ? `<span class="off">-${p.discount}%</span>` : ""}
      </div>
      <div class="pcolors">${dots}${more}</div>
      <div class="psize">${esc(sizesLabel)}</div>
    </div>
  </article>`;
}
// HTML de las facetas de filtro (réplica de Catalog.astro).
function facetsHTML(products, showBrand) {
  const cats = [...new Set(products.map((p) => p.category))];
  const sizes = [...new Set(products.flatMap((p) => p.sizes))].sort();
  const colors = [...new Set(products.flatMap((p) => p.colors.map((c) => c.name)))];
  const brands = showBrand ? BRANDS.filter((b) => products.some((p) => p.brandSlug === b.slug)) : [];
  const prices = products.map((p) => p.price);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  let html = "";
  if (showBrand && brands.length) {
    html += `<div class="fgroup" data-facet="brand"><h4 class="flabel">Marca</h4>${brands.map((b) => `<label class="fopt"><input type="checkbox" value="${esc(b.slug)}" /><span>${esc(b.name)}</span></label>`).join("")}</div>`;
  }
  html += `<div class="fgroup" data-facet="category"><h4 class="flabel">Categoría</h4>${cats.map((c) => `<label class="fopt"><input type="checkbox" value="${esc(c)}" /><span>${esc(c)}</span></label>`).join("")}</div>`;
  html += `<div class="fgroup" data-facet="size"><h4 class="flabel">Talla</h4><div class="fchips">${sizes.map((s) => `<button class="fchip" data-size="${esc(s)}">${esc(s)}</button>`).join("")}</div></div>`;
  html += `<div class="fgroup" data-facet="color"><h4 class="flabel">Color</h4><div class="fchips">${colors.map((c) => `<button class="fchip" data-color="${esc(c)}">${esc(c)}</button>`).join("")}</div></div>`;
  html += `<div class="fgroup" data-facet="price"><h4 class="flabel">Precio (MXN)</h4><div style="display:flex;gap:10px;align-items:center"><input type="number" id="priceMin" min="0" max="${maxPrice}" value="${minPrice}" style="width:100%" aria-label="Precio mínimo" /><span style="color:var(--muted)">—</span><input type="number" id="priceMax" min="0" max="${maxPrice}" value="${maxPrice}" style="width:100%" aria-label="Precio máximo" /></div></div>`;
  html += `<div class="fgroup" data-facet="availability"><h4 class="flabel">Disponibilidad</h4><label class="fopt"><input type="checkbox" value="in" /><span>En existencia</span></label><label class="fopt"><input type="checkbox" value="low" /><span>Pocas unidades</span></label></div>`;
  return html;
}

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
// THE VAULT: tabs de filtrado (sin recarga) + hidratación desde db
// ------------------------------------------------------------
const vaultTabs = $("#vaultTabs");
const vaultGrid = $("#vaultGrid");
function initVault() {
  if (!vaultTabs || !vaultGrid) return;
  const empty = $("#vaultEmpty");
  vaultTabs.onclick = (e) => {
    const tab = e.target.closest(".tab");
    if (!tab) return;
    $$(".tab", vaultTabs).forEach((t) => {
      t.classList.remove("active");
      t.setAttribute("aria-selected", "false");
    });
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");
    const f = tab.dataset.filter;
    const cards = $$(".pcard", vaultGrid);
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
  };
}
function hydrateVault() {
  if (!vaultGrid) return;
  const all = getProducts().map(normalizeProduct).filter((p) => p.status !== "inactivo");
  if (!all.length) return; // sin datos: se mantiene el build-time
  vaultGrid.innerHTML = all.map((p, i) => cardHTML(p, i)).join("");
  initVault(); // re-vincula tabs con las nuevas tarjetas
}
// Ocultar los grids (skeletons) ANTES de sincronizar, para no mostrar datos viejos.
showSkeleton($("#catalogGrid"));
showSkeleton(vaultGrid);
// Sincronizar con la nube (si está configurada) ANTES de hidratar el catálogo
await initCloudSync();
initVault();
hydrateVault();

// Navegación: SOLO al tocar la IMAGEN del producto se abre la ficha.
// El cuerpo blanco (nombre/precio/tallas) NO navega.
// ------------------------------------------------------------
document.addEventListener("click", (e) => {
  const thumb = e.target.closest(".pthumb");
  if (!thumb) return;
  const card = thumb.closest(".pcard");
  if (!card) return;
  // No interceptar el favorito (ni cualquier enlace dentro de la imagen)
  if (e.target.closest(".wish") || e.target.closest("a")) return;
  const id = card.dataset.id;
  if (id != null) window.location.href = BASE + "/producto/" + id;
});

// ------------------------------------------------------------
// Catálogo: filtros + orden + contador
// ------------------------------------------------------------
function initCatalog() {
  const catalogGrid = $("#catalogGrid");
  if (!catalogGrid) return;
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
      const sizeTokens = (c.dataset.sizes || "").toLowerCase().split(/\s+/).filter(Boolean);
      const colorTokens = (c.dataset.colors || "").toLowerCase();
      const stock = Number(c.dataset.stock);
      let ok = true;
      if (state.brands.size && !state.brands.has(c.dataset.brand)) ok = false;
      if (ok && state.cats.size && !state.cats.has(c.dataset.category)) ok = false;
      if (ok && state.sizes.size && ![...state.sizes].some((s) => sizeTokens.includes(s.toLowerCase()))) ok = false;
      if (ok && state.colors.size && ![...state.colors].some((col) => colorTokens.includes(col.toLowerCase()))) ok = false;
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
initCatalog();

// ------------------------------------------------------------
// Hidratación runtime: relee el catálogo de la capa de datos (db.js)
// para reflejar los cambios hechos en el panel admin (nuevos productos,
// ediciones, imágenes, stock). Si no hay datos locales, se mantiene el
// catálogo renderizado en build-time.
// ------------------------------------------------------------
function scopeFilter(scope, p) {
  if (p.status === "inactivo") return false;
  if (!scope) return true;
  if (scope.startsWith("gender:")) return p.gender === scope.split(":")[1];
  if (scope.startsWith("brand:")) return p.brandSlug === scope.split(":")[1];
  if (scope === "accessory") return !!p.accessory;
  if (scope === "new") return p.badge === "NUEVO";
  if (scope === "offer") return !!p.offer;
  if (scope === "drop") return p.badge === "NUEVO" || p.lowStock;
  return true;
}
function hydrateCatalog() {
  const section = $("#catalog");
  if (!section) return;
  const scope = section.dataset.scope || "";
  const showBrand = section.dataset.showBrand === "1";
  const all = getProducts().map(normalizeProduct).filter((p) => scopeFilter(scope, p));
  if (!all.length) return; // sin datos: se mantiene el build-time
  const filters = $("#filters");
  const grid = $("#catalogGrid");
  const count = $("#resultCount");
  if (filters) filters.innerHTML = facetsHTML(all, showBrand);
  if (grid) grid.innerHTML = all.map((p, i) => cardHTML(p, i)).join("");
  if (count) count.textContent = `${all.length} producto${all.length === 1 ? "" : "s"}`;
  initCatalog(); // re-vincula filtros con las nuevas tarjetas
}
hydrateCatalog();
// Mostrar los grids ya hidratados con los datos de la nube (evita el flash de datos viejos).
document.documentElement.classList.remove('av-loading');
revealGrid($("#catalogGrid"));
revealGrid(vaultGrid);

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
  // Icono de cuenta → panel admin (redirige a login si no hay sesión)
  $("#accountBtn")?.addEventListener("click", () => { window.location.href = BASE + "/admin"; });
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
function initProductPage() {
  const mainImg = $("#mainImg");
  if (!mainImg) return;
  // El ID se toma de la URL (robusto también para productos creados en el admin)
  const pid = Number(location.pathname.split("/").filter(Boolean).pop()) || Number($("#favBtn")?.dataset.pid || 0);
  const p = dbGetProduct(pid) || getProduct(pid);
  if (!p) {
    // ID sin producto (ni en catálogo base ni en la capa de datos)
    const main = document.querySelector("main");
    if (main) main.innerHTML = `<div class="wrap" style="padding:80px 20px;text-align:center"><div style="font-size:48px">🔍</div><h1 style="margin:16px 0 8px">Producto no disponible</h1><p style="color:var(--muted);margin-bottom:24px">Esta pieza ya no está en el catálogo o el enlace es incorrecto.</p><a class="btn btn--primary" href="${BASE}/">Volver a la tienda</a></div>`;
    return;
  }
  const stock = Number(p.stock);
  const out = stock <= 0;
  let pMode = "compra";
  // Imagen real subida desde el admin (si existe)
  if (p.image) mainImg.src = p.image;

  // Breadcrumb (refleja el producto real, no el seed de build-time)
  const bc = $(".breadcrumb");
  if (bc) {
    const links = bc.querySelectorAll("a");
    if (links[1]) {
      const g = (p.gender || "").toLowerCase();
      links[1].href = `${BASE}/${g}`;
      links[1].textContent = g === "hombre" ? "Hombre" : "Mujer";
    }
    if (links[2]) {
      links[2].href = `${BASE}/marca/${p.brandSlug || brandSlug(p.brand)}`;
      links[2].textContent = p.brand;
    }
    const last = bc.querySelector("span:not(.sep)");
    if (last) last.textContent = p.name;
  }

  // Hidratar la página de detalle desde la capa de datos (refleja ediciones del admin)
  const info = $(".product-info");
  if (info) {
    info.dataset.stock = p.stock;
    const brandEl = info.querySelector(".pbrand");
    if (brandEl) brandEl.innerHTML = `${esc(p.brand)} <span class="sku">· SKU ${esc(p.sku || "")}</span>`;
    const nameEl = info.querySelector("h1");
    if (nameEl) nameEl.textContent = p.name;
    const ratingEl = info.querySelector(".product-rating");
    if (ratingEl) {
      const star = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9l6.9-.7z"/></svg>';
      ratingEl.innerHTML = `<div class="stars">${star.repeat(p.rating || 0)}</div><span>${p.rating || 0}.0 · Producto original</span>`;
    }
    const priceEl = info.querySelector(".product-price");
    if (priceEl) priceEl.innerHTML = `<span class="now">$${Number(p.price).toLocaleString("es-MX")} MXN</span>${p.oldPrice ? `<span class="was">${Number(p.oldPrice).toLocaleString("es-MX")}</span>` : ""}${p.discount > 0 ? `<span class="off">-${p.discount}%</span>` : ""}`;
    const descEl = info.querySelector(".product-desc");
    if (descEl) descEl.textContent = p.desc || "";
    const colorOpts = $("#colorOpts");
    if (colorOpts) colorOpts.innerHTML = p.colors.map((c, i) => `<button class="color-opt ${i === 0 ? "active" : ""}" data-color="${c.hex}" data-name="${esc(c.name)}" style="background:${c.hex}" aria-label="${esc(c.name)}"></button>`).join("");
    const sizeOpts = $("#sizeOpts");
    if (sizeOpts) sizeOpts.innerHTML = p.sizes.map((s, i) => `<button class="size-opt ${i === 0 ? "active" : ""}" data-size="${esc(s)}">${esc(s)}</button>`).join("");
    const thumbs = $("#thumbs");
    if (thumbs) thumbs.innerHTML = `<button class="active" data-color="${p.colors[0].hex}" data-view="full" aria-label="Vista completa"><img src="${p.image || svgURI(silhouette(p.category, p.colors[0].hex))}" alt="Vista completa" loading="lazy" /></button><button data-color="${p.colors[0].hex}" data-view="alt" aria-label="Vista detalle"><img src="${p.image || svgURI(silhouetteAlt(p.category, p.colors[0].hex))}" alt="Vista detalle" loading="lazy" /></button>${p.colors.slice(1).map((c) => `<button data-color="${c.hex}" data-view="full" aria-label="Color ${esc(c.name)}"><img src="${p.image || svgURI(silhouette(p.category, c.hex))}" alt="${esc(c.name)}" loading="lazy" /></button>`).join("")}`;
    const colorName = $("#colorName");
    if (colorName) colorName.textContent = p.colors[0]?.name || "";
  }

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
      mainImg.src = p.image || imgFor(p, hex, "full");
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
      mainImg.src = p.image || imgFor(p, t.dataset.color, t.dataset.view || "full");
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
initProductPage();

// ------------------------------------------------------------
// Init
// ------------------------------------------------------------
renderCart();
updateBadges();
syncFavUI();
