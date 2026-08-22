const fallbackPosts = [];

const grid = document.querySelector("#posts-grid");
const featuredContainer = document.querySelector("#featured-post");
const searchInput = document.querySelector("#search-posts");
const filters = document.querySelectorAll(".filter");
const count = document.querySelector("#results-count");
const emptyState = document.querySelector("#empty-state");
const loadMoreButton = document.querySelector("#load-more-posts");
const apiBase = window.TECH_IA_API_URL || "/api";
let activeCategory = "Todos";
let posts = fallbackPosts;
let postsPage = 1;
let postsPages = 1;

function normalizePost(post) {
    return {
        id: post.id,
        title: post.titulo,
        date: new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(new Date(post.createdAt)),
        category: post.categoria,
        image: post.imagem || "imagens/ia.jpg",
        alt: post.imagemAlt || post.titulo,
        excerpt: post.resumo,
        // A página dinâmica pode usar este identificador quando for implementada.
        link: `posts/post.html?id=${post.id}`,
        featured: post.destaque
    };
}

async function loadPostsFromApi() {
    try {
        const response = await fetch(`${apiBase}/posts?limit=12&page=1`);
        if (!response.ok) throw new Error("API indisponível");
        const data = await response.json();
        posts = data.posts?.length ? data.posts.map(normalizePost) : [];
        postsPage = data.pagination?.page || 1; postsPages = data.pagination?.pages || 1;
    } catch (error) {
        console.error('Erro ao carregar post:', error );
        posts = [];
        
    }
}

function postCard(post) {
    return `<article class="post-card">
        <img src="${post.image}" alt="${post.alt}" loading="lazy">
        <div class="post-content">
            <span class="tag">${post.category}</span>
            <h3>${post.title}</h3>
            <p class="post-meta">${post.date}</p>
            <p class="post-excerpt">${post.excerpt}</p>
            <a class="button button-primary" href="${post.link}">Ler artigo <span aria-hidden="true">→</span></a>
        </div>
    </article>`;
}

function renderPosts() {
  if (!posts.length) {
    grid.innerHTML = `<p class="empty-message">Nenhum artigo ainda.</p>`;
    count.textContent = "0 artigos encontrados";
    emptyState.hidden = false;
    return;
  }

  const term = searchInput.value.trim().toLocaleLowerCase("pt-BR");

  const visiblePosts = posts.filter((post) => {
    const matchesCategory =
      activeCategory === "Todos" || post.category === activeCategory;

    const content = `${post.title} ${post.category} ${post.excerpt}`.toLocaleLowerCase("pt-BR");

    return matchesCategory && content.includes(term);
  });

  grid.innerHTML = visiblePosts.map(postCard).join("");

  emptyState.hidden = visiblePosts.length > 0;

  count.textContent = `${visiblePosts.length} ${
    visiblePosts.length === 1
      ? "artigo encontrado"
      : "artigos encontrados"
  }`;
  loadMoreButton.hidden = postsPage >= postsPages;
}

loadMoreButton.addEventListener("click", async () => { if (postsPage >= postsPages) return; loadMoreButton.disabled = true; loadMoreButton.textContent = "Carregando..."; try { const response = await fetch(`${apiBase}/posts?limit=12&page=${postsPage + 1}`); const data = await response.json(); const known = new Set(posts.map((post) => post.id)); posts.push(...(data.posts || []).map(normalizePost).filter((post) => !known.has(post.id))); postsPage = data.pagination?.page || postsPage + 1; postsPages = data.pagination?.pages || postsPages; renderPosts(); } finally { loadMoreButton.disabled = false; loadMoreButton.textContent = "Carregar mais artigos"; } });

function renderFeatured() {
  if (!posts.length) {
    featuredContainer.innerHTML = "<p>Nenhum artigo em destaque.</p>";
    return;
  }

  const post = posts.find((item) => item.featured) || posts[0];

  featuredContainer.innerHTML = `
    <img src="${post.image}" alt="${post.alt}">
    <div class="featured-content">
      <span class="tag">${post.category} · Artigo em destaque</span>
      <h3>${post.title}</h3>
      <p>${post.excerpt}</p>
      <a class="button button-primary" href="${post.link}">
        Ler artigo <span aria-hidden="true">→</span>
      </a>
    </div>
  `;
}

filters.forEach((filter) => {
    filter.addEventListener("click", () => {
        activeCategory = filter.dataset.category;
        filters.forEach((item) => item.classList.toggle("active", item === filter));
        renderPosts();
    });
});

searchInput.addEventListener("input", renderPosts);

document.querySelectorAll(".main-nav [data-category]").forEach((link) => {
    link.addEventListener("click", () => {
        const category = link.dataset.category;
        const filter = [...filters].find((item) => item.dataset.category === category);
        if (filter) filter.click();
    });
});

const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");
menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
});

const themeToggle = document.querySelector(".theme-toggle");
const navAccountAvatar = document.querySelector("#nav-account-avatar");
const accountAvatarButton = document.querySelector("#account-avatar-link");
const accountPopover = document.querySelector("#account-popover");
let readerSession;
try {
    readerSession = JSON.parse(localStorage.getItem("tech-ia-reader-session"));
    const email = readerSession?.user?.email || "Usuário";
    navAccountAvatar.src = readerSession?.user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&background=2563eb&color=fff`;
    navAccountAvatar.alt = `Conta de ${email}`;
} catch {
    navAccountAvatar.src = "https://ui-avatars.com/api/?name=Conta&background=2563eb&color=fff";
    navAccountAvatar.alt = "Abrir conta";
}
function renderAccountPopover() {
    if (readerSession?.user) {
        accountPopover.innerHTML = `<strong>${readerSession.user.email}</strong><span>Conta conectada</span><a href="conta.html">Minha biblioteca</a><details><summary>Configurações</summary><form id="popover-settings"><label class="popover-avatar-picker" title="Escolher nova foto de perfil"><img src="${navAccountAvatar.src}" alt="Foto de perfil atual"><span aria-hidden="true">📷</span><input id="popover-avatar" type="file" accept="image/*"><b>Alterar foto</b></label><label>Novo e-mail<input name="email" type="email" placeholder="Novo e-mail"></label><label>Nova senha<input name="password" type="password" minlength="6" placeholder="Nova senha"></label><button type="submit">Salvar alterações</button></form></details><button id="popover-logout" type="button">Sair da conta</button>`;
        document.querySelector("#popover-logout").addEventListener("click", () => { localStorage.removeItem("tech-ia-reader-session"); location.reload(); });
        document.querySelector("#popover-settings").addEventListener("submit", async (event) => { event.preventDefault(); const body = Object.fromEntries(new FormData(event.currentTarget)); delete body.avatar; Object.keys(body).forEach((key) => !body[key] && delete body[key]); if (!Object.keys(body).length) return; const response = await fetch(`${window.TECH_IA_SUPABASE_URL}/auth/v1/user`, { method: "PUT", headers: { apikey: window.TECH_IA_SUPABASE_KEY, Authorization: `Bearer ${readerSession.access_token}`, "Content-Type": "application/json" }, body: JSON.stringify(body) }); if (response.ok) alert("Configurações atualizadas."); });
        document.querySelector("#popover-avatar").addEventListener("change", async (event) => { const file = event.target.files[0]; if (!file) return; const path = `${readerSession.user.id}/avatar-${Date.now()}`; const upload = await fetch(`${window.TECH_IA_SUPABASE_URL}/storage/v1/object/avatars/${path}`, { method: "POST", headers: { apikey: window.TECH_IA_SUPABASE_KEY, Authorization: `Bearer ${readerSession.access_token}`, "Content-Type": file.type }, body: file }); if (!upload.ok) return alert("Não foi possível enviar a foto."); const avatar_url = `${window.TECH_IA_SUPABASE_URL}/storage/v1/object/public/avatars/${path}`; const update = await fetch(`${window.TECH_IA_SUPABASE_URL}/auth/v1/user`, { method: "PUT", headers: { apikey: window.TECH_IA_SUPABASE_KEY, Authorization: `Bearer ${readerSession.access_token}`, "Content-Type": "application/json" }, body: JSON.stringify({ data: { avatar_url } }) }); readerSession.user = await update.json(); localStorage.setItem("tech-ia-reader-session", JSON.stringify(readerSession)); navAccountAvatar.src = avatar_url; renderAccountPopover(); });
    } else {
        accountPopover.innerHTML = '<strong>Entre na comunidade</strong><span>Salve favoritos e acompanhe leituras.</span><a href="conta.html">Entrar ou criar conta</a>';
    }
}
accountAvatarButton.addEventListener("click", () => { const open = accountPopover.hidden; accountPopover.hidden = !open; accountAvatarButton.setAttribute("aria-expanded", String(open)); if (open) renderAccountPopover(); });
document.addEventListener("click", (event) => { if (!event.target.closest(".account-menu")) { accountPopover.hidden = true; accountAvatarButton.setAttribute("aria-expanded", "false"); } });
async function loadReaderDashboard() {
    const section = document.querySelector("#reader-dashboard");
    if (!section || !readerSession?.access_token) return;
    try {
        const response = await fetch(`${apiBase}/reader/me`, { headers: { Authorization: `Bearer ${readerSession.access_token}` } });
        if (!response.ok) return;
        const data = await response.json(); const progress = data.progress || []; const favorites = data.favorites || [];
        const continuing = progress.find((item) => item.progress > 0 && item.progress < 100) || progress[0];
        const card = (item, extra = "") => `<article><span class="tag">${item.categoria}</span><h3>${item.titulo}</h3><p>${item.resumo}</p>${extra}<a href="posts/post.html?id=${encodeURIComponent(item.id)}">Ler artigo →</a></article>`;
        document.querySelector("#reader-dashboard-content").innerHTML = `${continuing ? `<div><h3>Continue lendo</h3>${card(continuing, `<div class="reader-progress"><span style="width:${continuing.progress}%"></span></div><small>${continuing.progress}% concluído</small>`)}</div>` : ""}${favorites.length ? `<div><h3>Favoritos</h3>${card(favorites[0])}${favorites.length > 1 ? `<small>+ ${favorites.length - 1} favorito(s) salvo(s)</small>` : ""}</div>` : ""}`;
        section.hidden = !continuing && !favorites.length;
    } catch { /* O blog continua funcionando sem dados do leitor. */ }
}
function setTheme(isDark) {
    document.body.classList.toggle("dark-theme", isDark);
    themeToggle.textContent = isDark ? "☀" : "☾";
    themeToggle.setAttribute("aria-label", isDark ? "Ativar modo claro" : "Ativar modo escuro");
    localStorage.setItem("tech-ia-theme", isDark ? "dark" : "light");
}
setTheme(localStorage.getItem("tech-ia-theme") === "dark");
themeToggle.addEventListener("click", () => setTheme(!document.body.classList.contains("dark-theme")));

document.querySelector("#current-year").textContent = new Date().getFullYear();

loadPostsFromApi().finally(() => {
    renderFeatured();
    renderPosts();
    loadReaderDashboard();
});
