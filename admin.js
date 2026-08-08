const api = window.TECH_IA_API_URL || "/api";
const tokenKey = "tech-ia-admin-token";
const loginPanel = document.querySelector("#login-panel");
const adminPanel = document.querySelector("#admin-panel");
const loginForm = document.querySelector("#login-form");
const postForm = document.querySelector("#post-form");
const list = document.querySelector("#admin-post-list");
const message = (id, text, error = false) => { const el = document.querySelector(id); el.textContent = text; el.classList.toggle("error", error); };
const authHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem(tokenKey)}` });
const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
const themeToggle = document.querySelector(".theme-toggle");

function setTheme(isDark) {
    document.body.classList.toggle("dark-theme", isDark);
    themeToggle.textContent = isDark ? "☀" : "☾";
    themeToggle.setAttribute("aria-label", isDark ? "Ativar modo claro" : "Ativar modo escuro");
    localStorage.setItem("tech-ia-theme", isDark ? "dark" : "light");
}

setTheme(localStorage.getItem("tech-ia-theme") === "dark");
themeToggle.addEventListener("click", () => setTheme(!document.body.classList.contains("dark-theme")));

function showAdmin() { loginPanel.hidden = true; adminPanel.hidden = false; loadPosts(); }
async function loadPosts() {
    const response = await fetch(`${api}/posts/admin/all`, { headers: authHeaders() });
    if (!response.ok) { localStorage.removeItem(tokenKey); location.reload(); return; }
    const { posts } = await response.json();
    list.innerHTML = posts.length ? posts.map((post) => `<article class="admin-post"><div><strong>${escapeHtml(post.titulo)}</strong><p>${escapeHtml(post.categoria)} · ${post.publicado ? "Publicado" : "Rascunho"}</p></div><div><button class="filter" data-edit="${encodeURIComponent(JSON.stringify(post))}" type="button">Editar</button><button class="filter danger" data-delete="${post.id}" type="button">Excluir</button></div></article>`).join("") : "<p>Nenhum post cadastrado.</p>";
}
loginForm.addEventListener("submit", async (event) => {
    event.preventDefault(); message("#login-message", "Entrando...");
    const body = Object.fromEntries(new FormData(loginForm));
    const response = await fetch(`${api}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await response.json();
    if (!response.ok) return message("#login-message", data.message || "Não foi possível entrar.", true);
    localStorage.setItem(tokenKey, data.token); showAdmin();
});
postForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(postForm));
    data.publicado = postForm.publicado.checked; data.destaque = postForm.destaque.checked;
    const id = data.id; delete data.id;
    const response = await fetch(`${api}/posts${id ? `/${id}` : ""}`, { method: id ? "PUT" : "POST", headers: authHeaders(), body: JSON.stringify(data) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) return message("#post-message", result.message || "Não foi possível salvar.", true);
    message("#post-message", "Post salvo com sucesso."); resetForm(); loadPosts();
});
list.addEventListener("click", async (event) => {
    const edit = event.target.dataset.edit;
    if (edit) { const post = JSON.parse(decodeURIComponent(edit)); Object.entries(post).forEach(([key, value]) => { if (postForm.elements[key]) postForm.elements[key].type === "checkbox" ? postForm.elements[key].checked = value : postForm.elements[key].value = value || ""; }); document.querySelector("#form-title").textContent = "Editar post"; document.querySelector("#cancel-edit").hidden = false; window.scrollTo({ top: 0, behavior: "smooth" }); }
    const id = event.target.dataset.delete;
    if (id && confirm("Excluir este post permanentemente?")) { const response = await fetch(`${api}/posts/${id}`, { method: "DELETE", headers: authHeaders() }); if (response.ok) loadPosts(); }
});
function resetForm() { postForm.reset(); postForm.elements.id.value = ""; document.querySelector("#form-title").textContent = "Novo post"; document.querySelector("#cancel-edit").hidden = true; }
document.querySelector("#cancel-edit").addEventListener("click", resetForm);
document.querySelector("#logout").addEventListener("click", () => { localStorage.removeItem(tokenKey); location.reload(); });
if (localStorage.getItem(tokenKey)) showAdmin();
