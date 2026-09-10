// ============================================================
// ATHLETIC VAULT · Cliente Supabase (opcional)
// ------------------------------------------------------------
// Conecta el sitio (estático) con Supabase para que los cambios
// del panel admin sean GLOBALES (todos los visitantes ven lo
// mismo) en vez de quedarse en el localStorage de cada navegador.
//
// SIN configurar (URL/key vacías) → no hace nada: el sitio sigue
// funcionando 100% en localStorage (modo demo local).
//
// PARA CONFIGURAR (≈5 min, gratis):
//   1. Crea cuenta + proyecto en https://supabase.com
//   2. SQL Editor → pega supabase/schema.sql → Run
//   3. Authentication → Users → "Add user" (correo + contraseña)
//      → esa es tu cuenta de admin.
//   4. Project Settings → API → copia "Project URL" y "anon public"
//      y pégalo abajo.
//   5. En el login del panel, usa el CORREO + contraseña del paso 3.
//
// Ver supabase/SETUP.md para la guía completa.
// ============================================================
import { createClient } from "@supabase/supabase-js";

// ⚙️ PEGA AQUÍ tus credenciales de Supabase
const SUPABASE_URL = ""; //      ej: "https://abcdefgh.supabase.co"
const SUPABASE_ANON_KEY = ""; // la key "anon public" (NUNCA la "service_role")

export function isSupabaseConfigured() {
  return !!SUPABASE_URL && !!SUPABASE_ANON_KEY && SUPABASE_URL.startsWith("http");
}

let _client = null;
export function client() {
  if (!isSupabaseConfigured()) return null;
  if (!_client) _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return _client;
}

// Cada colección vive en una tabla:
//  - store        → productos + settings (escritura solo admin autenticado)
//  - reservations → solicitudes de compra (los clientes las crean sin login)
const TABLE_FOR = { products: "store", settings: "store", reservations: "reservations" };
const tableFor = (key) => TABLE_FOR[key] || "store";

// Lectura (pública, con la key anon)
export async function fetchCollection(key) {
  const c = client();
  if (!c) return null;
  const { data, error } = await c
    .from(tableFor(key))
    .select("value")
    .eq("key", key)
    .maybeSingle();
  if (error) throw error;
  return data ? data.value : null;
}

// Escritura (RLS decide: store→solo autenticado, reservations→anon)
export async function saveCollection(key, value) {
  const c = client();
  if (!c) return;
  const { error } = await c
    .from(tableFor(key))
    .upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) throw error;
}

// ---- Autenticación del admin (Supabase Auth) ----
export async function adminSignIn(email, password) {
  const c = client();
  if (!c) return { ok: false, error: "Supabase no está configurado." };
  const { error } = await c.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: "Usuario o contraseña incorrectos." };
  return { ok: true };
}

export function adminSignOut() {
  try {
    client()?.auth.signOut();
  } catch {
    /* noop */
  }
}
