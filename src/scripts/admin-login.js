// Panel Admin · Login (first-run + validación)
import { hasAccount, createAccount, login } from "../lib/auth.js";

const BASE = document.body?.dataset?.base || "";
const $ = (s) => document.querySelector(s);
const form = $("#loginForm");
const err = $("#loginErr");
const title = $("#loginTitle");
const hint = $("#loginHint");
const submit = $("#loginSubmit");
const pw = $("#password");
const pwToggle = $("#pwToggle");

function showErr(msg) { err.textContent = msg; err.classList.add("show"); }
function clearErr() { err.classList.remove("show"); }

// Show / hide contraseña
pwToggle?.addEventListener("click", () => {
  const show = pw.type === "password";
  pw.type = show ? "text" : "password";
  pwToggle.textContent = show ? "Ocultar" : "Mostrar";
});

// First-run: si no hay cuenta, mostrar modo "crear cuenta"
let creating = false;
if (!hasAccount()) {
  creating = true;
  title.textContent = "Crear cuenta de administrador";
  hint.textContent = "Primera vez: crea la cuenta de admin. Se guarda hasheada en este navegador.";
  submit.textContent = "Crear cuenta y entrar";
  pw.setAttribute("autocomplete", "new-password");
}

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearErr();
  const username = $("#username").value.trim();
  const password = pw.value;
  submit.disabled = true;
  submit.textContent = "Procesando…";

  try {
    if (creating) {
      const res = await createAccount(username, password);
      if (!res.ok) { showErr(res.error); return; }
      // cuenta creada -> iniciar sesión
      const lg = await login(username, password);
      if (!lg.ok) { showErr(lg.error); return; }
      window.location.href = BASE + "/admin";
    } else {
      const res = await login(username, password);
      if (!res.ok) { showErr(res.error); return; }
      window.location.href = BASE + "/admin";
    }
  } catch (err) {
    showErr("Ocurrió un error. Intenta de nuevo.");
  } finally {
    submit.disabled = false;
    submit.textContent = creating ? "Crear cuenta y entrar" : "Entrar";
  }
});
