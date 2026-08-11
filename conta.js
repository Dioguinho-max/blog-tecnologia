const supabaseUrl = window.TECH_IA_SUPABASE_URL;
const supabaseKey = window.TECH_IA_SUPABASE_KEY;
const storageKey = "tech-ia-reader-session";
const form = document.querySelector("#account-form");
const modeButton = document.querySelector("#account-mode");
const message = document.querySelector("#account-message");
let signupMode = false;

function setTheme(dark) { document.body.classList.toggle("dark-theme", dark); document.querySelector(".theme-toggle").textContent = dark ? "☀" : "☾"; localStorage.setItem("tech-ia-theme", dark ? "dark" : "light"); }
setTheme(localStorage.getItem("tech-ia-theme") === "dark");
document.querySelector(".theme-toggle").addEventListener("click", () => setTheme(!document.body.classList.contains("dark-theme")));
function showMessage(text, error = false) { message.textContent = text; message.classList.toggle("error", error); }
function showSession(session) { form.hidden = true; modeButton.hidden = true; document.querySelector("#account-user").hidden = false; document.querySelector("#account-email").textContent = session.user.email; }
function setMode() { signupMode = !signupMode; document.querySelector("#account-title").textContent = signupMode ? "Crie sua conta" : "Entre na sua conta"; document.querySelector("#account-submit").textContent = signupMode ? "Criar conta" : "Entrar"; modeButton.textContent = signupMode ? "Já tem conta? Entrar" : "Ainda não tem conta? Criar cadastro"; showMessage(""); }
modeButton.addEventListener("click", setMode);
form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const { email, password } = Object.fromEntries(new FormData(form));
    showMessage("Processando...");
    const endpoint = signupMode ? "/auth/v1/signup" : "/auth/v1/token?grant_type=password";
    const response = await fetch(`${supabaseUrl}${endpoint}`, { method: "POST", headers: { apikey: supabaseKey, "Content-Type": "application/json" }, body: JSON.stringify({ email, password, options: { emailRedirectTo: `${window.TECH_IA_SITE_URL}/conta.html` } }) });
    const data = await response.json();
    if (!response.ok) return showMessage(data.msg || data.message || "Não foi possível concluir a operação.", true);
    if (signupMode && !data.access_token) return showMessage("Cadastro criado. Verifique seu e-mail para confirmar a conta.");
    localStorage.setItem(storageKey, JSON.stringify(data)); showSession(data); showMessage("Login realizado com sucesso.");
});
document.querySelector("#account-logout").addEventListener("click", () => { localStorage.removeItem(storageKey); location.reload(); });
try { const session = JSON.parse(localStorage.getItem(storageKey)); if (session?.user) showSession(session); } catch { localStorage.removeItem(storageKey); }
