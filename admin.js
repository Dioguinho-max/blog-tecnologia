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
const contentField = postForm.elements.conteudo;
const draftKey = "tech-ia-post-draft";
let activeCommentFilter = "pending";

function setTheme(isDark) {
    document.body.classList.toggle("dark-theme", isDark);
    themeToggle.textContent = isDark ? "☀" : "☾";
    themeToggle.setAttribute("aria-label", isDark ? "Ativar modo claro" : "Ativar modo escuro");
    localStorage.setItem("tech-ia-theme", isDark ? "dark" : "light");
}

setTheme(localStorage.getItem("tech-ia-theme") === "dark");
themeToggle.addEventListener("click", () => setTheme(!document.body.classList.contains("dark-theme")));

function showAdmin() { loginPanel.hidden = true; adminPanel.hidden = false; document.querySelector("#admin-comments").hidden = false; restoreDraft(); loadPosts(); loadComments(); }
async function loadComments() { const target = document.querySelector("#admin-comment-list"); const response = await fetch(`${api}/comments/admin/all`, { headers: authHeaders() }); if (!response.ok) return; const { comments } = await response.json(); const pending = comments.filter((comment) => !comment.published); const visible = activeCommentFilter === "all" ? comments : comments.filter((comment) => activeCommentFilter === "published" ? comment.published : !comment.published); const badge = document.querySelector("#pending-comments-count"); badge.textContent = pending.length; badge.hidden = !pending.length; target.innerHTML = visible.length ? visible.map((comment) => `<article class="admin-post"><div><strong>${escapeHtml(comment.authorName)} ${comment.published ? "· Publicado" : "· Pendente"}</strong><p>${escapeHtml(comment.postTitle)} — ${escapeHtml(comment.content)}</p></div><div>${comment.published ? "" : `<button class="filter" data-approve-comment="${comment.id}">Aprovar</button>`}<button class="filter danger" data-delete-comment="${comment.id}">Excluir</button></div></article>`).join("") : "<p>Nenhum comentário nesta lista.</p>"; }

function escapePreview(value) {
    return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
}

function renderPreview(content) {
    return content.split(/```/).map((block, index) => {
        if (index % 2) return `<pre><code>${escapePreview(block.replace(/^\w*\n?/, "").trim())}</code></pre>`;
        return block.trim().split(/\n\s*\n/).filter(Boolean).map((part) => {
            const heading = part.match(/^#{1,3}\s+(.+)/);
            if (heading) return `<h3>${escapePreview(heading[1])}</h3>`;
            const lines = part.split("\n");
            if (lines.every((line) => /^[-*]\s+/.test(line))) return `<ul>${lines.map((line) => `<li>${escapePreview(line.replace(/^[-*]\s+/, ""))}</li>`).join("")}</ul>`;
            return `<p>${escapePreview(part).replace(/\n/g, "<br>")}</p>`;
        }).join("");
    }).join("") || "<p class=\"preview-empty\">Escreva o conteúdo para ver a prévia.</p>";
}

function setupEditor() {
    const toolbar = document.createElement("div");
    toolbar.className = "editor-toolbar";
    toolbar.innerHTML = '<button type="button" data-insert="heading">Tópico</button><button type="button" data-insert="list">Lista</button><button type="button" data-insert="code">Código</button><span id="draft-status">Rascunho não salvo</span>';
    contentField.before(toolbar);
    const preview = document.createElement("section");
    preview.className = "post-preview";
    preview.innerHTML = '<p class="eyebrow">Pré-visualização</p><div id="preview-content"></div>';
    postForm.after(preview);
    const previewContent = preview.querySelector("#preview-content");

    function updateEditor() {
        previewContent.innerHTML = renderPreview(contentField.value);
        if (!postForm.elements.id.value) {
            const draft = Object.fromEntries(new FormData(postForm));
            draft.publicado = postForm.publicado.checked;
            draft.destaque = postForm.destaque.checked;
            if (draft.titulo || draft.conteudo || draft.resumo) {
                localStorage.setItem(draftKey, JSON.stringify(draft));
                toolbar.querySelector("#draft-status").textContent = "Rascunho salvo automaticamente";
            } else {
                localStorage.removeItem(draftKey);
                toolbar.querySelector("#draft-status").textContent = "Rascunho não salvo";
            }
        }
    }
    toolbar.addEventListener("click", (event) => {
        const action = event.target.dataset.insert;
        if (!action) return;
        const templates = { heading: "## Novo tópico\n\n", list: "- Item da lista\n", code: "```js\n// Seu código aqui\n```\n" };
        const start = contentField.selectionStart;
        const text = templates[action];
        contentField.setRangeText(text, start, contentField.selectionEnd, "end");
        contentField.focus();
        updateEditor();
    });
    contentField.addEventListener("input", updateEditor);
    postForm.addEventListener("input", (event) => { if (event.target !== contentField) updateEditor(); });
    window.techIaEditor = { update: updateEditor };
    updateEditor();
}

function restoreDraft() {
    if (postForm.elements.id.value || contentField.value) return;
    try {
        const draft = JSON.parse(localStorage.getItem(draftKey) || "null");
        if (!draft || !draft.titulo) return;
        Object.entries(draft).forEach(([key, value]) => { if (postForm.elements[key]) postForm.elements[key].type === "checkbox" ? postForm.elements[key].checked = value : postForm.elements[key].value = value; });
        window.techIaEditor?.update();
        message("#post-message", "Rascunho local restaurado.");
    } catch { localStorage.removeItem(draftKey); }
}
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
    localStorage.removeItem(draftKey); message("#post-message", "Post salvo com sucesso."); resetForm(); loadPosts();
});
list.addEventListener("click", async (event) => {
    const edit = event.target.dataset.edit;
    if (edit) { const post = JSON.parse(decodeURIComponent(edit)); Object.entries(post).forEach(([key, value]) => { if (postForm.elements[key]) postForm.elements[key].type === "checkbox" ? postForm.elements[key].checked = value : postForm.elements[key].value = value || ""; }); document.querySelector("#form-title").textContent = "Editar post"; document.querySelector("#cancel-edit").hidden = false; window.techIaEditor?.update(); window.scrollTo({ top: 0, behavior: "smooth" }); }
    const id = event.target.dataset.delete;
    if (id && confirm("Excluir este post permanentemente?")) { const response = await fetch(`${api}/posts/${id}`, { method: "DELETE", headers: authHeaders() }); if (response.ok) loadPosts(); }
});
function resetForm() { postForm.reset(); postForm.elements.id.value = ""; document.querySelector("#form-title").textContent = "Novo post"; document.querySelector("#cancel-edit").hidden = true; window.techIaEditor?.update(); }
document.querySelector("#cancel-edit").addEventListener("click", resetForm);
document.querySelector("#admin-comment-list").addEventListener("click", async (event) => { const id = event.target.dataset.approveComment; const remove = event.target.dataset.deleteComment; if (id) await fetch(`${api}/comments/admin/${id}/publish`, { method: "PUT", headers: authHeaders() }); if (remove && confirm("Excluir este comentário?")) await fetch(`${api}/comments/admin/${remove}`, { method: "DELETE", headers: authHeaders() }); if (id || remove) loadComments(); });
document.querySelectorAll("[data-comment-filter]").forEach((button) => button.addEventListener("click", () => { activeCommentFilter = button.dataset.commentFilter; document.querySelectorAll("[data-comment-filter]").forEach((item) => item.classList.toggle("active", item === button)); loadComments(); }));
document.querySelector("#logout").addEventListener("click", () => { localStorage.removeItem(tokenKey); location.reload(); });
setupEditor();
if (localStorage.getItem(tokenKey)) showAdmin();
