// ============================================================
// ATHLETIC VAULT · Capa de datos (data access layer)
// ------------------------------------------------------------
// IMPORTANTE (arquitectura):
// Este sitio es 100% frontend estático (Astro + GitHub Pages).
// Esta capa persiste en localStorage del navegador y está
// DISEÑADA PARA SER SUSTITUIDA por un backend real
// (Supabase / Firebase / PostgreSQL) sin tocar la UI.
//
// Cada función de aquí es el único punto de acceso a datos.
// Para conectar un backend, reemplaza el cuerpo de estas
// funciones por llamadas a tu API/SDK. La interfaz (firmas)
// se mantiene igual.
//
// NO guardar contraseñas ni secretos aquí. Ver auth.js.
// ============================================================

import { PRODUCTS, CONFIG } from "../data/products.js";
import { isSupabaseConfigured, saveCollection, fetchCollection } from "./supabase.js";

const NS = "av_"; // namespace de claves
const SEED_VERSION = 2; // 2 = catálogo reducido a 4 marcas (Gymshark, lululemon, Under Armour, Alo)

const read = (k, d) => {
  try {
    const v = localStorage.getItem(NS + k);
    return v === null ? d : JSON.parse(v);
  } catch {
    return d;
  }
};
// Propagar a la nube (fire-and-forget). No hace nada si Supabase no está configurado.
function sync(k, v) {
  if (!isSupabaseConfigured()) return;
  saveCollection(k, v).catch((e) => console.warn("[AV] No se pudo sincronizar con la nube:", e));
}
const write = (k, v, opts = {}) => {
  localStorage.setItem(NS + k, JSON.stringify(v));
  if (opts.sync !== false) sync(k, v);
};

// ------------------------------------------------------------
// Configuración (centralizada, editable desde el panel)
// ------------------------------------------------------------
const DEFAULT_SETTINGS = {
  storeName: CONFIG.storeName,
  whatsapp: CONFIG.whatsapp, // SOLO números, con código de país
  email: "hola@athleticvault.mx",
  instagram: CONFIG.instagram,
  tiktok: "athleticvault.mx",
  shippingText: "Envíos a todo México · Gratis en compras mayores a $2,000 MXN",
  shippingCost: 150,
  freeShippingFrom: 2000,
  waMessage:
    "Hola {store} 👋, quiero realizar una solicitud de {tipo}.\n\nCliente: {cliente}\n\nProductos:\n{items}\n\nSubtotal: {subtotal} MXN\n\nQuedo pendiente para continuar con la compra.",
};

export function getSettings() {
  return { ...DEFAULT_SETTINGS, ...read("settings", {}) };
}
export function saveSettings(patch) {
  write("settings", { ...getSettings(), ...patch });
  return getSettings();
}

// ------------------------------------------------------------
// Productos (semilla desde el catálogo base + overrides locales)
// ------------------------------------------------------------
function seedProducts() {
  if (read("seedVersion", 0) !== SEED_VERSION) {
    // Semilla: copia del catálogo base con SKU y estado
    const seeded = PRODUCTS.map((p, i) => ({
      ...p,
      sku: p.sku || `AV-${String(i + 1).padStart(4, "0")}`,
      status: p.status || "activo", // activo | inactivo
      featured: p.featured ?? false,
      isNew: p.isNew ?? p.badge === "NUEVO",
      createdAt: p.createdAt || Date.now() - (PRODUCTS.length - i) * 864e5,
    }));
    write("products", seeded, { sync: false });
    write("seedVersion", SEED_VERSION, { sync: false });
  }
}
seedProducts();

// Sincronización inicial con la nube: si hay datos en Supabase, sobrescribe
// el localStorage local. No hace nada si Supabase no está configurado.
export async function initCloudSync() {
  if (!isSupabaseConfigured()) return false;
  try {
    const [products, settings] = await Promise.all([
      fetchCollection("products"),
      fetchCollection("settings"),
    ]);
    if (products) write("products", products, { sync: false });
    if (settings) write("settings", settings, { sync: false });
    return true;
  } catch (e) {
    console.warn("[AV] No se pudo sincronizar con la nube, usando datos locales:", e);
    return false;
  }
}

export function getProducts() {
  return read("products", []);
}
export function getProduct(id) {
  return getProducts().find((p) => p.id === Number(id));
}
export function upsertProduct(p) {
  const list = getProducts();
  const idx = list.findIndex((x) => x.id === p.id);
  if (idx >= 0) list[idx] = { ...list[idx], ...p };
  else {
    const nextId = list.length ? Math.max(...list.map((x) => x.id)) + 1 : 0;
    list.push({
      ...p,
      id: p.id ?? nextId,
      sku: p.sku || `AV-${String(nextId + 1).padStart(4, "0")}`,
      status: p.status || "activo",
      createdAt: p.createdAt || Date.now(),
    });
  }
  write("products", list);
  return list;
}
export function deleteProduct(id) {
  write("products", getProducts().filter((p) => p.id !== Number(id)));
}
export function duplicateProduct(id) {
  const src = getProduct(id);
  if (!src) return null;
  const list = getProducts();
  const nextId = list.length ? Math.max(...list.map((x) => x.id)) + 1 : 0;
  const copy = {
    ...src,
    id: nextId,
    sku: `AV-${String(nextId + 1).padStart(4, "0")}`,
    name: src.name + " (copia)",
    createdAt: Date.now(),
  };
  list.push(copy);
  write("products", list);
  return copy;
}

// ------------------------------------------------------------
// Inventario (por producto; estado derivado del stock)
// ------------------------------------------------------------
export function stockStatus(stock) {
  if (stock <= 0) return "agotado";
  if (stock <= 2) return "bajo";
  return "disponible";
}
export function getInventory() {
  return getProducts().map((p) => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    brand: p.brand,
    category: p.category,
    sizes: p.sizes,
    colors: p.colors,
    stock: p.stock,
    minStock: p.minStock ?? 3,
    status: stockStatus(p.stock),
  }));
}
export function setStock(id, stock) {
  const list = getProducts();
  const p = list.find((x) => x.id === Number(id));
  if (p) {
    p.stock = Math.max(0, Number(stock) || 0);
    write("products", list);
  }
}

// ------------------------------------------------------------
// Reservas / solicitudes de compra
// ------------------------------------------------------------
const RES_STATUSES = ["PENDIENTE", "CONTACTADO", "CONFIRMADO", "PAGADO", "ENTREGADO", "CANCELADO"];
export const RESERVATION_STATUSES = RES_STATUSES;

export function getReservations() {
  return read("reservations", []);
}
export function addReservation(r) {
  const list = getReservations();
  const rec = {
    id: "R" + Date.now().toString(36).toUpperCase(),
    createdAt: Date.now(),
    status: "PENDIENTE",
    confirmed: false, // true => descontar inventario
    ...r,
  };
  list.unshift(rec);
  write("reservations", list);
  return rec;
}
export function updateReservation(id, patch) {
  const list = getReservations();
  const r = list.find((x) => x.id === id);
  if (r) {
    Object.assign(r, patch);
    // Al confirmar, descontar inventario (una sola vez)
    if (patch.status === "CONFIRMADO" && !r.confirmed) {
      r.confirmed = true;
      const prods = getProducts();
      r.items.forEach((it) => {
        const p = prods.find((x) => x.id === it.id);
        if (p) p.stock = Math.max(0, p.stock - it.qty);
      });
      write("products", prods);
    }
    write("reservations", list);
  }
  return r;
}
export function deleteReservation(id) {
  write("reservations", getReservations().filter((x) => x.id !== id));
}

// ------------------------------------------------------------
// Estadísticas para el dashboard
// ------------------------------------------------------------
export function getStats() {
  const prods = getProducts();
  const inv = getInventory();
  const res = getReservations();
  return {
    products: prods.length,
    lowStock: inv.filter((i) => i.status === "bajo").length,
    outOfStock: inv.filter((i) => i.status === "agotado").length,
    reservations: res.length,
    pendingReservations: res.filter((r) => r.status === "PENDIENTE").length,
    confirmedReservations: res.filter((r) => r.status === "CONFIRMADO").length,
    sales: res.filter((r) => ["PAGADO", "ENTREGADO"].includes(r.status)).length,
    revenue: res
      .filter((r) => ["PAGADO", "ENTREGADO"].includes(r.status))
      .reduce((s, r) => s + (r.total || 0), 0),
  };
}

// ------------------------------------------------------------
// Utilidad: construir mensaje de WhatsApp a partir de una reserva
// ------------------------------------------------------------
export function buildWhatsAppMessage(res, settings) {
  const items = res.items
    .map(
      (it) =>
        `${it.qty}x ${it.brand} ${it.name}\nTalla: ${it.size || "—"}\nColor: ${it.color || "—"}\nPrecio: $${(it.price * it.qty).toLocaleString("es-MX")} MXN`
    )
    .join("\n\n");
  const tpl = settings.waMessage || DEFAULT_SETTINGS.waMessage;
  return tpl
    .replace("{store}", settings.storeName)
    .replace("{tipo}", res.type === "reserva" ? "RESERVA" : "COMPRA")
    .replace("{cliente}", res.customer || "Cliente")
    .replace("{whatsapp}", res.whatsapp || "—")
    .replace("{items}", items)
    .replace("{subtotal}", (res.total || 0).toLocaleString("es-MX"));
}
