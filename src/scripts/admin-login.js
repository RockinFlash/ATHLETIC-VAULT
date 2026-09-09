// Panel Admin · Login (cuenta única, sin registro público)
import { login } from "../lib/auth.js";

const BASE = document.body?.dataset?.base || "";
const $ = (s) => document.querySelector(s);
const form = $("#loginForm");
const err = $("#loginErr");
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

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearErr();
  const username = $("#username").value.trim();
  const password = pw.value;
  submit.disabled = true;
  submit.textContent = "Procesando…";

  try {
    const res = await login(username, password);
    if (!res.ok) { showErr(res.error); return; }
    window.location.href = BASE + "/admin";
  } catch (err) {
    showErr("Ocurrió un error. Intenta de nuevo.");
  } finally {
    submit.disabled = false;
    submit.textContent = "Entrar";
  }
});
