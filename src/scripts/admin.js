// ============================================================
// ATHLETIC VAULT · Panel Admin (SPA)
// Vistas: dashboard, productos (CRUD), inventario, reservas,
// marcas, configuración. Datos vía src/lib/db.js.
// ============================================================
import {
  getProducts, getProduct, upsertProduct, deleteProduct, duplicateProduct,
  getInventory, setStock, stockStatus,
  getReservations, addReservation, updateReservation, deleteReservation, RESERVATION_STATUSES,
  getSettings, saveSettings, getStats, buildWhatsAppMessage,
} from "../lib/db.js";
import { isLoggedIn, currentUser, logout } from "../lib/auth.js";
import { BRANDS, silhouette, svgURI } from "../data/products.js";

const BASE = document.body?.dataset?.base || "";
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const money = (n) => "$" + Number(n || 0).toLocaleString("es-MX");
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const imgFor = (p) => p.image || svgURI(silhouette(p.category, p.colors?.[0]?.hex || "#2b2b2b"));

// ---------- Protección de ruta ----------
if (!isLoggedIn()) {
  window.location.replace(BASE + "/admin/login");
}

// ---------- Toast ----------
let toastTimer;
function toast(msg, isErr = false) {
  const el = $("#aToast");
  if (!el) return;
  el.textContent = msg;
  el.classList.toggle("err", isErr);
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
}

// ---------- Modal ----------
const modalOverlay = $("#modalOverlay");
const modal = $("#modal");
function openModal(html) {
  modal.innerHTML = html;
  modalOverlay.classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeModal() {
  modalOverlay.classList.remove("open");
  document.body.style.overflow = "";
}
modalOverlay?.addEventListener("click", (e) => { if (e.target === modalOverlay) closeModal(); });
$("#modal")?.addEventListener("click", (e) => { if (e.target.closest("[data-close-modal]")) closeModal(); });

// ---------- User ----------
const user = currentUser() || "Admin";
$("#userName").textContent = user;
$("#userAv").textContent = user.charAt(0).toUpperCase();
$("#logoutBtn").addEventListener("click", () => { logout(); window.location.href = BASE + "/admin/login"; });

// ---------- Helpers de estado ----------
const statusBadge = (s) => {
  const map = { disponible: "green", bajo: "yellow", agotado: "red" };
  const label = { disponible: "Disponible", bajo: "Bajo", agotado: "Agotado" };
  return `<span class="badge badge--${map[s]}"><span class="dot"></span>${label[s]}</span>`;
};
const resBadge = (s) => {
  const map = { PENDIENTE: "yellow", CONTACTADO: "blue", CONFIRMADO: "green", PAGADO: "green", ENTREGADO: "green", CANCELADO: "gray" };
  return `<span class="badge badge--${map[s] || "gray"}"><span class="dot"></span>${s}</span>`;
};
const fmtDate = (ts) => new Date(ts).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });

// ============================================================
// VISTAS
// ============================================================
const view = $("#adminView");
let currentView = "dashboard";

function topbar(title, sub, actions = "") {
  return `<div class="admin-top"><div><h1>${title}</h1>${sub ? `<div class="sub">${sub}</div>` : ""}</div><div class="actions">${actions}</div></div>`;
}

// ---------- DASHBOARD ----------
function renderDashboard() {
  const s = getStats();
  const inv = getInventory();
  const res = getReservations();
  const low = inv.filter((i) => i.status === "bajo");
  const out = inv.filter((i) => i.status === "agotado");
  const pending = res.filter((r) => r.status === "PENDIENTE");

  view.innerHTML = `
    ${topbar("Dashboard", "Resumen general de la tienda")}
    <div class="stat-grid">
      <div class="stat-card"><div class="lbl"><span class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 7 12 3 4 7v10l8 4 8-4z"/></svg></span>Productos</div><div class="val">${s.products}</div></div>
      <div class="stat-card yellow"><div class="lbl"><span class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg></span>Bajo inventario</div><div class="val">${s.lowStock}</div></div>
      <div class="stat-card accent"><div class="lbl"><span class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="m15 9-6 6M9 9l6 6"/></svg></span>Agotados</div><div class="val">${s.outOfStock}</div></div>
      <div class="stat-card blue"><div class="lbl"><span class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg></span>Reservas</div><div class="val">${s.reservations}</div></div>
      <div class="stat-card green"><div class="lbl"><span class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg></span>Ventas</div><div class="val">${s.sales}</div></div>
      <div class="stat-card green"><div class="lbl"><span class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></span>Ingresos</div><div class="val">${money(s.revenue)}</div></div>
    </div>

    <div class="panel">
      <div class="panel-head"><h3>Reservas pendientes</h3><button class="btn-a btn-a--ghost btn-a--sm" data-goto="reservations">Ver todas</button></div>
      <div class="panel-body">
        ${pending.length ? `<div class="tbl-wrap"><table class="tbl">
          <thead><tr><th>ID</th><th>Fecha</th><th>Cliente</th><th>WhatsApp</th><th>Tipo</th><th class="num">Total</th><th>Estado</th></tr></thead>
          <tbody>${pending.map((r) => `
            <tr>
              <td class="muted">${r.id}</td>
              <td>${fmtDate(r.createdAt)}</td>
              <td>${esc(r.customer)}</td>
              <td>${esc(r.whatsapp) || "—"}</td>
              <td>${r.type === "reserva" ? "Reserva" : "Compra"}</td>
              <td class="num">${money(r.total)}</td>
              <td>${resBadge(r.status)}</td>
            </tr>`).join("")}</tbody>
        </table></div>` : `<div class="a-empty"><div class="big">📭</div><h4>Sin reservas pendientes</h4><p>Las nuevas solicitudes aparecerán aquí.</p></div>`}
      </div>
    </div>

    <div class="panel">
      <div class="panel-head"><h3>Inventario crítico</h3><button class="btn-a btn-a--ghost btn-a--sm" data-goto="inventory">Ver inventario</button></div>
      <div class="panel-body">
        ${low.length || out.length ? `<div class="tbl-wrap"><table class="tbl">
          <thead><tr><th>Producto</th><th>SKU</th><th class="num">Stock</th><th>Estado</th></tr></thead>
          <tbody>${[...out, ...low].map((i) => `
            <tr>
              <td><div class="prod-cell"><img src="${imgFor(i)}" alt=""/><div><div class="nm">${esc(i.name)}</div><div class="br">${esc(i.brand)}</div></div></div></td>
              <td class="muted">${i.sku}</td>
              <td class="num">${i.stock}</td>
              <td>${statusBadge(i.status)}</td>
            </tr>`).join("")}</tbody>
        </table></div>` : `<div class="a-empty"><div class="big">✅</div><h4>Inventario saludable</h4><p>No hay productos bajo stock o agotados.</p></div>`}
      </div>
    </div>
  `;
}

// ---------- PRODUCTOS (CRUD) ----------
let prodSearch = "";
function renderProducts() {
  const all = getProducts();
  const list = all.filter((p) => (p.name + " " + p.brand + " " + (p.sku || "")).toLowerCase().includes(prodSearch.toLowerCase()));
  view.innerHTML = `
    ${topbar("Productos", `${all.length} productos en catálogo`, `<button class="btn-a" id="newProdBtn">+ Nuevo producto</button>`)}
    <div class="toolbar">
      <div class="left">
        <input class="search-inp" id="prodSearch" placeholder="Buscar por nombre, marca o SKU…" value="${esc(prodSearch)}" />
        <span class="count-pill">${list.length} resultados</span>
      </div>
    </div>
    <div class="panel"><div class="panel-body">
      ${list.length ? `<div class="tbl-wrap"><table class="tbl">
        <thead><tr><th>Producto</th><th>SKU</th><th>Categoría</th><th class="num">Precio</th><th class="num">Stock</th><th>Estado</th><th style="text-align:right">Acciones</th></tr></thead>
        <tbody>${list.map((p) => `
          <tr>
            <td><div class="prod-cell"><img src="${imgFor(p)}" alt=""/><div><div class="nm">${esc(p.name)}</div><div class="br">${esc(p.brand)}</div></div></div></td>
            <td class="muted">${p.sku}</td>
            <td>${esc(p.category)}</td>
            <td class="num">${money(p.price)}</td>
            <td class="num">${p.stock}</td>
            <td>${statusBadge(stockStatus(p.stock))}</td>
            <td><div class="actions-cell">
              <button class="btn-a btn-a--ghost btn-a--sm" data-edit="${p.id}">Editar</button>
              <button class="btn-a btn-a--ghost btn-a--sm" data-dup="${p.id}">Duplicar</button>
              <button class="btn-a btn-a--danger btn-a--sm" data-del="${p.id}">Eliminar</button>
            </div></td>
          </tr>`).join("")}</tbody>
      </table></div>` : `<div class="a-empty"><div class="big">📦</div><h4>Sin productos</h4><p>Crea tu primer producto.</p></div>`}
    </div></div>
  `;
  $("#newProdBtn").addEventListener("click", () => openProductForm(null));
  $("#prodSearch").addEventListener("input", (e) => { prodSearch = e.target.value; renderProducts(); const inp = $("#prodSearch"); inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); });
  $$("[data-edit]").forEach((b) => b.addEventListener("click", () => openProductForm(getProduct(Number(b.dataset.edit)))));
  $$("[data-dup]").forEach((b) => b.addEventListener("click", () => { const c = duplicateProduct(Number(b.dataset.dup)); if (c) { toast("Producto duplicado"); renderProducts(); } }));
  $$("[data-del]").forEach((b) => b.addEventListener("click", () => {
    const p = getProduct(Number(b.dataset.del));
    if (confirm(`¿Eliminar "${p.name}"? Esta acción no se puede deshacer.`)) { deleteProduct(p.id); toast("Producto eliminado"); renderProducts(); }
  }));
}

function openProductForm(p) {
  const isEdit = !!p;
  const d = p || { brand: BRANDS[0].name, gender: "Mujer", category: "Legging", name: "", price: 0, oldPrice: "", sizes: ["XS","S","M","L"], colors: [{ name: "Negro", hex: "#1a1a1a" }], stock: 10, minStock: 3, rating: 5, badge: "", desc: "", materials: "", care: "", status: "activo", featured: false, isNew: false };
  const cats = ["Legging","Bra deportivo","Tank top","Camiseta","Short","Hoodie","Chaqueta","Pantalón","Gorra","Bolsa","Botella","Conjunto"];
  openModal(`
    <div class="modal-head"><h3>${isEdit ? "Editar producto" : "Nuevo producto"}</h3><button class="modal-close" data-close-modal aria-label="Cerrar">&times;</button></div>
    <div class="modal-body">
      <form id="prodForm">
        <div class="form-grid">
          <div class="field full"><label>Imagen del producto (opcional)</label>
            <div class="img-upload">
              <div class="img-preview" id="imgPreview">${d.image ? `<img src="${d.image}" alt="preview" />` : '<span class="img-ph">Sin imagen</span>'}</div>
              <div class="img-ctrl">
                <input type="file" id="imgFile" accept="image/*" />
                <div class="hint-sm">JPG, PNG o WebP. Se guarda en el navegador (localStorage).</div>
                <button type="button" class="btn-a btn-a--ghost btn-a--sm" id="imgRemove" ${d.image ? "" : 'style="display:none"'}>Quitar imagen</button>
              </div>
            </div>
          </div>
          <div class="field"><label>Nombre *</label><input name="name" required value="${esc(d.name)}" /></div>
          <div class="field"><label>Marca *</label><select name="brand">${BRANDS.map((b) => `<option value="${b.name}" ${d.brand === b.name ? "selected" : ""}>${b.name}</option>`).join("")}</select></div>
          <div class="field"><label>Género</label><select name="gender"><option ${d.gender === "Mujer" ? "selected" : ""}>Mujer</option><option ${d.gender === "Hombre" ? "selected" : ""}>Hombre</option></select></div>
          <div class="field"><label>Categoría</label><select name="category">${cats.map((c) => `<option ${d.category === c ? "selected" : ""}>${c}</option>`).join("")}</select></div>
          <div class="field"><label>Precio (MXN) *</label><input name="price" type="number" min="0" required value="${d.price}" /></div>
          <div class="field"><label>Precio anterior (opcional)</label><input name="oldPrice" type="number" min="0" value="${d.oldPrice || ""}" /></div>
          <div class="field"><label>Stock</label><input name="stock" type="number" min="0" value="${d.stock}" /></div>
          <div class="field"><label>Stock mínimo (alerta)</label><input name="minStock" type="number" min="0" value="${d.minStock ?? 3}" /></div>
          <div class="field full"><label>Tallas (separadas por coma)</label><input name="sizes" value="${esc((d.sizes || []).join(", "))}" /></div>
          <div class="field full"><label>Colores (nombre:hex, separados por coma)</label><input name="colors" value="${esc((d.colors || []).map((c) => `${c.name}:${c.hex}`).join(", "))}" /><div class="hint-sm">Ej: Negro:#1a1a1a, Blanco:#f5f5f4</div></div>
          <div class="field"><label>Rating (0-5)</label><input name="rating" type="number" min="0" max="5" value="${d.rating}" /></div>
          <div class="field"><label>Badge (opcional)</label><input name="badge" value="${esc(d.badge || "")}" placeholder="NUEVO, MÁS VENDIDO…" /></div>
          <div class="field full"><label>Descripción</label><textarea name="desc">${esc(d.desc || "")}</textarea></div>
          <div class="field"><label>Material</label><input name="materials" value="${esc(d.materials || "")}" /></div>
          <div class="field"><label>Cuidado</label><input name="care" value="${esc(d.care || "")}" /></div>
          <div class="field full" style="display:flex;gap:24px">
            <label class="check-row"><input type="checkbox" name="featured" ${d.featured ? "checked" : ""} /> Destacado</label>
            <label class="check-row"><input type="checkbox" name="isNew" ${d.isNew ? "checked" : ""} /> Nuevo</label>
            <label class="check-row"><input type="checkbox" name="statusInactive" ${d.status === "inactivo" ? "checked" : ""} /> Inactivo</label>
          </div>
        </div>
        <div class="form-actions">
          <button type="button" class="btn-a btn-a--ghost" data-close-modal>Cancelar</button>
          <button type="submit" class="btn-a">${isEdit ? "Guardar cambios" : "Crear producto"}</button>
        </div>
      </form>
    </div>
  `);
  // Imagen: se lee como dataURL (base64) y se guarda en el producto
  let imgData = d.image || "";
  const imgFile = $("#imgFile");
  const imgPreview = $("#imgPreview");
  if (imgFile) {
    imgFile.addEventListener("change", () => {
      const file = imgFile.files[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) { toast("Imagen muy grande (máx. 2 MB)", true); imgFile.value = ""; return; }
      const reader = new FileReader();
      reader.onload = () => { imgData = reader.result; imgPreview.innerHTML = `<img src="${imgData}" alt="preview" />`; const rm = $("#imgRemove"); if (rm) rm.style.display = ""; };
      reader.readAsDataURL(file);
    });
  }
  $("#imgRemove")?.addEventListener("click", () => { imgData = ""; imgPreview.innerHTML = '<span class="img-ph">Sin imagen</span>'; if (imgFile) imgFile.value = ""; const rm = $("#imgRemove"); if (rm) rm.style.display = "none"; });

  $("#prodForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const parseColors = (v) => v.split(",").map((s) => s.trim()).filter(Boolean).map((s) => { const [name, hex] = s.split(":").map((x) => x.trim()); return { name: name || "Color", hex: hex || "#1a1a1a" }; });
    const rec = {
      ...(isEdit ? { id: p.id, sku: p.sku, createdAt: p.createdAt } : {}),
      image: imgData || undefined,
      name: f.get("name").trim(),
      brand: f.get("brand"),
      gender: f.get("gender"),
      category: f.get("category"),
      price: Number(f.get("price")) || 0,
      oldPrice: Number(f.get("oldPrice")) || undefined,
      stock: Number(f.get("stock")) || 0,
      minStock: Number(f.get("minStock")) ?? 3,
      sizes: f.get("sizes").split(",").map((s) => s.trim()).filter(Boolean),
      colors: parseColors(f.get("colors")),
      rating: Math.max(0, Math.min(5, Number(f.get("rating")) || 0)),
      badge: f.get("badge").trim(),
      desc: f.get("desc").trim(),
      materials: f.get("materials").trim(),
      care: f.get("care").trim(),
      featured: !!f.get("featured"),
      isNew: !!f.get("isNew"),
      status: f.get("statusInactive") ? "inactivo" : "activo",
    };
    if (!rec.colors.length) rec.colors = [{ name: "Negro", hex: "#1a1a1a" }];
    upsertProduct(rec);
    closeModal();
    toast(isEdit ? "Producto actualizado" : "Producto creado");
    renderProducts();
  });
}

// ---------- INVENTARIO ----------
function renderInventory() {
  const inv = getInventory();
  view.innerHTML = `
    ${topbar("Inventario", `${inv.length} referencias · control de stock`)}
    <div class="panel"><div class="panel-body">
      <div class="tbl-wrap"><table class="tbl">
        <thead><tr><th>Producto</th><th>SKU</th><th>Tallas</th><th>Colores</th><th class="num">Stock</th><th class="num">Mín.</th><th>Estado</th><th style="text-align:right">Ajustar</th></tr></thead>
        <tbody>${inv.map((i) => `
          <tr>
            <td><div class="prod-cell"><img src="${imgFor(i)}" alt=""/><div><div class="nm">${esc(i.name)}</div><div class="br">${esc(i.brand)}</div></div></div></td>
            <td class="muted">${i.sku}</td>
            <td class="muted">${esc((i.sizes || []).join(", "))}</td>
            <td>${(i.colors || []).slice(0, 5).map((c) => `<span class="cdot" style="background:${c.hex};display:inline-block;width:14px;height:14px;border-radius:50%;margin-right:3px;border:1px solid rgba(0,0,0,.1)" title="${esc(c.name)}"></span>`).join("")}</td>
            <td class="num"><strong>${i.stock}</strong></td>
            <td class="num muted">${i.minStock}</td>
            <td>${statusBadge(i.status)}</td>
            <td><div class="actions-cell"><button class="btn-a btn-a--ghost btn-a--sm" data-adj="${i.id}">Ajustar</button></div></td>
          </tr>`).join("")}</tbody>
      </table></div>
    </div></div>
  `;
  $$("[data-adj]").forEach((b) => b.addEventListener("click", () => {
    const p = getProduct(Number(b.dataset.adj));
    openModal(`
      <div class="modal-head"><h3>Ajustar stock</h3><button class="modal-close" data-close-modal>&times;</button></div>
      <div class="modal-body">
        <p style="color:var(--a-muted);margin-bottom:16px">${esc(p.name)} · <span class="muted">${p.sku}</span></p>
        <div class="field"><label>Stock actual</label><input value="${p.stock}" disabled /></div>
        <div class="field"><label>Nuevo stock</label><input id="newStock" type="number" min="0" value="${p.stock}" /></div>
        <div class="form-actions"><button class="btn-a btn-a--ghost" data-close-modal>Cancelar</button><button class="btn-a" id="saveStock">Guardar</button></div>
      </div>
    `);
    $("#saveStock").addEventListener("click", () => {
      setStock(p.id, Number($("#newStock").value) || 0);
      closeModal(); toast("Stock actualizado"); renderInventory();
    });
  }));
}

// ---------- RESERVAS ----------
let resFilter = "TODAS";
function renderReservations() {
  const all = getReservations();
  const list = resFilter === "TODAS" ? all : all.filter((r) => r.status === resFilter);
  view.innerHTML = `
    ${topbar("Reservas", `${all.length} solicitudes · compras y reservas`)}
    <div class="toolbar"><div class="left">
      <select class="search-inp" id="resFilter" style="min-width:180px">
        <option value="TODAS" ${resFilter === "TODAS" ? "selected" : ""}>Todas</option>
        ${RESERVATION_STATUSES.map((s) => `<option ${resFilter === s ? "selected" : ""}>${s}</option>`).join("")}
      </select>
      <span class="count-pill">${list.length} resultados</span>
    </div></div>
    <div class="panel"><div class="panel-body">
      ${list.length ? `<div class="tbl-wrap"><table class="tbl">
        <thead><tr><th>ID</th><th>Fecha</th><th>Cliente</th><th>WhatsApp</th><th>Productos</th><th class="num">Total</th><th>Estado</th><th style="text-align:right">Acciones</th></tr></thead>
        <tbody>${list.map((r) => `
          <tr>
            <td class="muted">${r.id}</td>
            <td>${fmtDate(r.createdAt)}</td>
            <td>${esc(r.customer)}</td>
            <td>${esc(r.whatsapp) || "—"}</td>
            <td>${r.items.length} art. <span class="muted">(${r.items.reduce((s, i) => s + i.qty, 0)} pzas)</span></td>
            <td class="num">${money(r.total)}</td>
            <td>
              <select class="res-status" data-res="${r.id}" style="background:var(--a-panel-2);border:1px solid var(--a-line);color:var(--a-text);border-radius:7px;padding:6px 8px;font-size:12px">
                ${RESERVATION_STATUSES.map((s) => `<option ${r.status === s ? "selected" : ""}>${s}</option>`).join("")}
              </select>
            </td>
            <td><div class="actions-cell">
              <button class="btn-a btn-a--ghost btn-a--sm" data-viewres="${r.id}">Ver</button>
              ${r.whatsapp ? `<a class="btn-a btn-a--ghost btn-a--sm" href="https://wa.me/${esc(r.whatsapp)}" target="_blank" rel="noopener">WhatsApp</a>` : ""}
              <button class="btn-a btn-a--danger btn-a--sm" data-delres="${r.id}">Eliminar</button>
            </div></td>
          </tr>`).join("")}</tbody>
      </table></div>` : `<div class="a-empty"><div class="big">📭</div><h4>Sin reservas</h4><p>Aún no hay solicitudes de compra o reserva.</p></div>`}
    </div></div>
  `;
  $("#resFilter").addEventListener("change", (e) => { resFilter = e.target.value; renderReservations(); });
  $$(".res-status").forEach((sel) => sel.addEventListener("change", (e) => {
    updateReservation(e.target.dataset.res, { status: e.target.value });
    toast("Estado actualizado" + (e.target.value === "CONFIRMADO" ? " · stock descontado" : ""));
    renderReservations();
  }));
  $$("[data-viewres]").forEach((b) => b.addEventListener("click", () => openReservationDetail(getReservations().find((r) => r.id === b.dataset.viewres))));
  $$("[data-delres]").forEach((b) => b.addEventListener("click", () => { if (confirm("¿Eliminar esta reserva?")) { deleteReservation(b.dataset.delres); toast("Reserva eliminada"); renderReservations(); } }));
}

function openReservationDetail(r) {
  if (!r) return;
  const s = getSettings();
  const msg = buildWhatsAppMessage(r, s);
  openModal(`
    <div class="modal-head"><h3>Reserva ${r.id}</h3><button class="modal-close" data-close-modal>&times;</button></div>
    <div class="modal-body">
      <div style="display:flex;gap:24px;flex-wrap:wrap;margin-bottom:18px">
        <div><div class="hint-sm">Cliente</div><strong>${esc(r.customer)}</strong></div>
        <div><div class="hint-sm">WhatsApp</div><strong>${esc(r.whatsapp) || "—"}</strong></div>
        <div><div class="hint-sm">Tipo</div><strong>${r.type === "reserva" ? "Reserva" : "Compra"}</strong></div>
        <div><div class="hint-sm">Fecha</div><strong>${fmtDate(r.createdAt)}</strong></div>
        <div><div class="hint-sm">Estado</div>${resBadge(r.status)}</div>
      </div>
      <div class="tbl-wrap"><table class="tbl">
        <thead><tr><th>Producto</th><th>Talla</th><th>Color</th><th class="num">Cant.</th><th class="num">Subtotal</th></tr></thead>
        <tbody>${r.items.map((i) => `<tr><td>${esc(i.brand)} ${esc(i.name)}</td><td>${esc(i.size || "—")}</td><td>${esc(i.color || "—")}</td><td class="num">${i.qty}</td><td class="num">${money(i.price * i.qty)}</td></tr>`).join("")}</tbody>
      </table></div>
      <div style="text-align:right;margin-top:14px;font-size:18px;font-weight:800">Total: ${money(r.total)} MXN</div>
      <div class="form-actions">
        ${r.whatsapp ? `<a class="btn-a btn-a--ghost" href="https://wa.me/${esc(r.whatsapp)}?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">Abrir WhatsApp</a>` : ""}
        <button class="btn-a" data-close-modal>Cerrar</button>
      </div>
    </div>
  `);
}

// ---------- MARCAS ----------
function renderBrands() {
  const prods = getProducts();
  view.innerHTML = `
    ${topbar("Marcas", `${BRANDS.length} marcas comercializadas`)}
    <div class="panel"><div class="panel-body">
      <div class="tbl-wrap"><table class="tbl">
        <thead><tr><th>Marca</th><th>Slug</th><th>Etiqueta</th><th class="num">Productos</th></tr></thead>
        <tbody>${BRANDS.map((b) => `
          <tr>
            <td><strong>${b.name}</strong></td>
            <td class="muted">/${b.slug}</td>
            <td>${b.tag}</td>
            <td class="num">${prods.filter((p) => p.brandSlug === b.slug || p.brand === b.name).length}</td>
          </tr>`).join("")}</tbody>
      </table></div>
      <div class="hint-sm" style="padding:14px 20px">Las marcas se definen en <code>src/data/products.js</code>. No somos distribuidores oficiales; comercializamos productos originales de estas marcas.</div>
    </div></div>
  `;
}

// ---------- CONFIGURACIÓN ----------
function renderConfig() {
  const s = getSettings();
  view.innerHTML = `
    ${topbar("Configuración", "Datos de la tienda y mensajes")}
    <div class="panel"><div class="panel-head"><h3>Tienda</h3></div><div class="panel-body pad">
      <div class="form-grid">
        <div class="field"><label>Nombre de la tienda</label><input id="c_storeName" value="${esc(s.storeName)}" /></div>
        <div class="field"><label>WhatsApp (solo números, con lada)</label><input id="c_whatsapp" value="${esc(s.whatsapp)}" /><div class="hint-sm">México: 521 + número. Ej: 5215512345678</div></div>
        <div class="field"><label>Email</label><input id="c_email" value="${esc(s.email)}" /></div>
        <div class="field"><label>Instagram (sin @)</label><input id="c_instagram" value="${esc(s.instagram)}" /></div>
        <div class="field"><label>TikTok</label><input id="c_tiktok" value="${esc(s.tiktok)}" /></div>
        <div class="field"><label>Costo de envío (MXN)</label><input id="c_shippingCost" type="number" min="0" value="${s.shippingCost}" /></div>
        <div class="field"><label>Envío gratis desde (MXN)</label><input id="c_freeShippingFrom" type="number" min="0" value="${s.freeShippingFrom}" /></div>
        <div class="field full"><label>Texto de envío</label><input id="c_shippingText" value="${esc(s.shippingText)}" /></div>
      </div>
    </div></div>
    <div class="panel"><div class="panel-head"><h3>Mensaje de WhatsApp</h3></div><div class="panel-body pad">
      <div class="field"><label>Plantilla del mensaje</label><textarea id="c_waMessage" rows="7">${esc(s.waMessage)}</textarea></div>
      <div class="hint-sm">Variables: {store} {tipo} {cliente} {whatsapp} {items} {subtotal}</div>
    </div></div>
    <div class="form-actions" style="border:0;padding:0">
      <button class="btn-a" id="saveConfig">Guardar configuración</button>
    </div>
  `;
  $("#saveConfig").addEventListener("click", () => {
    saveSettings({
      storeName: $("#c_storeName").value.trim(),
      whatsapp: $("#c_whatsapp").value.replace(/\D/g, ""),
      email: $("#c_email").value.trim(),
      instagram: $("#c_instagram").value.trim(),
      tiktok: $("#c_tiktok").value.trim(),
      shippingCost: Number($("#c_shippingCost").value) || 0,
      freeShippingFrom: Number($("#c_freeShippingFrom").value) || 0,
      shippingText: $("#c_shippingText").value.trim(),
      waMessage: $("#c_waMessage").value,
    });
    toast("Configuración guardada");
  });
}

// ---------- Router ----------
const views = { dashboard: renderDashboard, products: renderProducts, inventory: renderInventory, reservations: renderReservations, brands: renderBrands, config: renderConfig };
function go(name) {
  currentView = name;
  $$(".side-link").forEach((l) => l.classList.toggle("active", l.dataset.view === name));
  (views[name] || renderDashboard)();
}
$$("#sideNav .side-link").forEach((l) => l.addEventListener("click", () => go(l.dataset.view)));
document.addEventListener("click", (e) => { const g = e.target.closest("[data-goto]"); if (g) go(g.dataset.goto); });

go("dashboard");
