// ============================================================
// ATHLETIC VAULT · Autenticación de administrador
// ------------------------------------------------------------
// Modelo de UNA sola cuenta (no hay registro público):
//  - El único admin es "admin" con una contraseña fija.
//  - NO existe "crear cuenta": nadie más puede registrarse.
//  - La contraseña NUNCA se guarda en texto plano: se valida
//    comparando el hash SHA-256(salt + password) contra el hash
//    precomputado de abajo.
//
// ⚠️ AVISO DE SEGURIDAD:
// Este sitio es frontend estático, por lo que la validación vive
// en el navegador. Es suficiente para un panel privado, pero para
// producción real se recomienda mover la validación a un backend
// (Supabase Auth / Firebase Auth / API propia). La UI no cambia;
// solo se reemplaza login() por la llamada al proveedor.
//
// PARA CAMBIAR LA CONTRASEÑA:
//  1. Elige la nueva contraseña.
//  2. Genera el hash:  node -e "console.log(require('crypto').createHash('sha256').update('<SALT><NUEVA_CONTRASEÑA>').digest('hex'))"
//     (usa el mismo SALT de abajo).
//  3. Reemplaza ADMIN_HASH.
// ============================================================

const SESSION_KEY = "av_admin_session";

// Credencial única de administrador (fija, no registrable)
const ADMIN_USERNAME = "admin";
const ADMIN_SALT = "a3f8c2e19b4d7f6058e2c1d9b7a4f3e6";
const ADMIN_HASH = "276aab78c9daca2dd32b8a325ea1e212efdf9b5e468a76528d8474f820ae9f91";

// Hash SHA-256 (Web Crypto, async)
async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Validar credenciales. Devuelve { ok, error? }
export async function login(username, password) {
  if (!username || !password) return { ok: false, error: "Ingresa usuario y contraseña." };
  if (username.trim().toLowerCase() !== ADMIN_USERNAME) {
    return { ok: false, error: "Usuario o contraseña incorrectos." };
  }
  const hash = await sha256(ADMIN_SALT + password);
  if (hash !== ADMIN_HASH) return { ok: false, error: "Usuario o contraseña incorrectos." };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ username: ADMIN_USERNAME, at: Date.now() }));
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
