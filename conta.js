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
function showSession(session) { form.hidden = true; modeButton.hidden = true; document.querySelector("#google-login").hidden = true; document.querySelector(".oauth-separator").hidden = true; document.querySelector("#account-user").hidden = false; document.querySelector("#account-title").textContent = "Sua conta"; document.querySelector("#account-description").textContent = "Gerencie sua biblioteca, leitura e configurações."; document.querySelector("#account-email").textContent = session.user.email; document.querySelector("#account-avatar").src = session.user.user_metadata?.avatar_url || "https://ui-avatars.com/api/?name=" + encodeURIComponent(session.user.email); loadReaderLibrary(session); }
async function loadReaderLibrary(session) { const section = document.querySelector("#reader-library"), target = document.querySelector("#reader-library-content"); try { const response = await fetch(`${window.TECH_IA_API_URL || "/api"}/reader/me`, { headers: { Authorization: `Bearer ${session.access_token}` } }); if (!response.ok) return; const { favorites = [], progress = [] } = await response.json(); const article = (item, progressValue) => `<article><span class="tag">${item.categoria}</span><h3>${item.titulo}</h3>${progressValue === undefined ? "" : `<div class="reader-progress"><span style="width:${progressValue}%"></span></div><small>${progressValue}% concluído</small>`}<a href="posts/post.html?id=${encodeURIComponent(item.id)}">Abrir artigo →</a></article>`; target.innerHTML = `${progress.length ? `<div><h3>Progresso de leitura</h3>${progress.map((item) => article(item, item.progress)).join("")}</div>` : ""}${favorites.length ? `<div><h3>Favoritos</h3>${favorites.map((item) => article(item)).join("")}</div>` : ""}` || "<p class=\"comments-empty\">Sua biblioteca ainda está vazia. Explore os artigos para salvar favoritos e acompanhar leituras.</p>"; section.hidden = false; } catch { /* A conta continua disponível mesmo se a biblioteca não carregar. */ } }
function setMode() { signupMode = !signupMode; document.querySelector("#account-title").textContent = signupMode ? "Crie sua conta" : "Entre na sua conta"; document.querySelector("#account-submit").textContent = signupMode ? "Criar conta" : "Entrar"; modeButton.textContent = signupMode ? "Já tem conta? Entrar" : "Ainda não tem conta? Criar cadastro"; showMessage(""); }
modeButton.addEventListener("click", setMode);
form.insertAdjacentHTML("afterend", '<button id="forgot-password" class="account-link" type="button">Esqueci minha senha</button>');
document.querySelector("#forgot-password").addEventListener("click", async () => { const email = form.elements.email.value.trim() || prompt("Digite seu e-mail para receber o link de recuperação:"); if (!email) return; showMessage("Enviando link de recuperação..."); const response = await fetch(`${supabaseUrl}/auth/v1/recover?redirect_to=${encodeURIComponent(`${window.TECH_IA_SITE_URL}/conta.html`)}`, { method: "POST", headers: { apikey: supabaseKey, "Content-Type": "application/json" }, body: JSON.stringify({ email }) }); showMessage(response.ok ? "Se existir uma conta para esse e-mail, enviaremos um link de recuperação." : "Não foi possível solicitar a recuperação.", !response.ok); });
document.querySelector("#google-login").addEventListener("click", () => {
    const redirectTo = `${window.TECH_IA_SITE_URL}/conta.html`;
    window.location.assign(`${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectTo)}`);
});
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
async function finishGoogleLogin() {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const access_token = params.get("access_token");
    if (params.get("error_description")) return showMessage(params.get("error_description"), true);
    if (!access_token) return;
    window.history.replaceState({}, document.title, window.location.pathname);
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, { headers: { apikey: supabaseKey, Authorization: `Bearer ${access_token}` } });
    if (!response.ok) return showMessage("Não foi possível concluir o login com Google.", true);
    const user = await response.json();
    const session = { access_token, refresh_token: params.get("refresh_token"), token_type: params.get("token_type"), expires_in: Number(params.get("expires_in")), user };
    localStorage.setItem(storageKey, JSON.stringify(session));
    if (params.get("type") === "recovery") { window.history.replaceState({}, document.title, window.location.pathname); showSession(session); showMessage("Defina sua nova senha em Configurações da conta."); return; }
    window.location.replace("index.html");
}
finishGoogleLogin();
try { const session = JSON.parse(localStorage.getItem(storageKey)); if (session?.user) showSession(session); } catch { localStorage.removeItem(storageKey); }
