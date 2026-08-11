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
function showSession(session) { form.hidden = true; modeButton.hidden = true; document.querySelector("#account-user").hidden = false; document.querySelector("#account-email").textContent = session.user.email; document.querySelector("#account-avatar").src = session.user.user_metadata?.avatar_url || "https://ui-avatars.com/api/?name=" + encodeURIComponent(session.user.email); }
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
    localStorage.setItem(storageKey, JSON.stringify(data));
    showMessage("Login realizado com sucesso. Redirecionando...");
    window.location.replace("index.html");
});
document.querySelector("#account-logout").addEventListener("click", () => { localStorage.removeItem(storageKey); location.reload(); });
document.querySelector("#avatar-input").addEventListener("change", async (event) => { const file = event.target.files[0]; const session = JSON.parse(localStorage.getItem(storageKey)); if (!file || !session) return; const path = `${session.user.id}/avatar-${Date.now()}`; const upload = await fetch(`${supabaseUrl}/storage/v1/object/avatars/${path}`, { method: "POST", headers: { apikey: supabaseKey, Authorization: `Bearer ${session.access_token}`, "Content-Type": file.type }, body: file }); if (!upload.ok) return showMessage("Não foi possível enviar a foto.", true); const avatar_url = `${supabaseUrl}/storage/v1/object/public/avatars/${path}`; const update = await fetch(`${supabaseUrl}/auth/v1/user`, { method: "PUT", headers: { apikey: supabaseKey, Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" }, body: JSON.stringify({ data: { avatar_url } }) }); const user = await update.json(); session.user = user; localStorage.setItem(storageKey, JSON.stringify(session)); showSession(session); });
document.querySelector("#settings-form").addEventListener("submit", async (event) => { event.preventDefault(); const session = JSON.parse(localStorage.getItem(storageKey)); const body = Object.fromEntries(new FormData(event.currentTarget)); Object.keys(body).forEach((key) => !body[key] && delete body[key]); const response = await fetch(`${supabaseUrl}/auth/v1/user`, { method: "PUT", headers: { apikey: supabaseKey, Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" }, body: JSON.stringify(body) }); showMessage(response.ok ? "Configurações atualizadas." : "Não foi possível atualizar.", !response.ok); });
try { const session = JSON.parse(localStorage.getItem(storageKey)); if (session?.user) showSession(session); } catch { localStorage.removeItem(storageKey); }
