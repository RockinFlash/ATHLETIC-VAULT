// ============================================================
// ATHLETIC VAULT · Autenticación local (modo demo)
// ------------------------------------------------------------
// AVISO DE SEGURIDAD (importante):
// Este sitio es frontend estático. Esta autenticación vive en
// el navegador (localStorage) y es SOLO para demo/local.
//
//  - NO hay contraseñas en el código fuente.
//  - La cuenta de admin se crea la PRIMERA vez que alguien
//    accede a /admin/login (first-run).
//  - La contraseña se guarda HASHEADA (SHA-256 + salt), nunca
//    en texto plano.
//
// PARA PRODUCCIÓN REAL: mover la validación a un backend
// (Supabase Auth / Firebase Auth / API propia). La UI del
// panel no cambia; solo se reemplaza login() por la llamada
// al proveedor de auth.
// ============================================================

const USER_KEY = "av_admin_user";
const SESSION_KEY = "av_admin_session";

// Hash SHA-256 con salt (Web Crypto, async)
async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
const randomSalt = () =>
  [...crypto.getRandomValues(new Uint8Array(16))].map((b) => b.toString(16).padStart(2, "0")).join("");

export function hasAccount() {
  return !!localStorage.getItem(USER_KEY);
}

// Crear la cuenta de admin (solo si no existe). Devuelve true si se creó.
export async function createAccount(username, password) {
  if (hasAccount()) return { ok: false, error: "Ya existe una cuenta de administrador." };
  if (!username || username.trim().length < 3) return { ok: false, error: "El usuario debe tener al menos 3 caracteres." };
  if (!password || password.length < 6) return { ok: false, error: "La contraseña debe tener al menos 6 caracteres." };
  const salt = randomSalt();
  const hash = await sha256(salt + password);
  localStorage.setItem(USER_KEY, JSON.stringify({ username: username.trim(), salt, hash, createdAt: Date.now() }));
  return { ok: true };
}

// Validar credenciales. Devuelve { ok, error? }
export async function login(username, password) {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return { ok: false, error: "No existe cuenta. Crea la cuenta de administrador." };
  const u = JSON.parse(raw);
  if (u.username !== username.trim()) return { ok: false, error: "Usuario o contraseña incorrectos." };
  const hash = await sha256(u.salt + password);
  if (hash !== u.hash) return { ok: false, error: "Usuario o contraseña incorrectos." };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ username: u.username, at: Date.now() }));
  return { ok: true };
}

export function logout() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function isLoggedIn() {
  try {
    return !!sessionStorage.getItem(SESSION_KEY);
  } catch {
    return false;
  }
}

export function currentUser() {
  try {
    const s = sessionStorage.getItem(SESSION_KEY);
    return s ? JSON.parse(s).username : null;
  } catch {
    return null;
  }
}
