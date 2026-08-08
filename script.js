const fallbackPosts = [
    {
        title: "O que é Inteligência Artificial?",
        date: "07 de Agosto de 2026",
        category: "IA",
        image: "imagens/ia.jpg",
        alt: "Representação visual de Inteligência Artificial",
        excerpt: "Descubra o que é Inteligência Artificial, como ela funciona e por que está transformando o mundo.",
        link: "posts/inteligencia-artificial.html",
        featured: true
    },
    {
        title: "Primeiros passos no Linux",
        date: "05 de Agosto de 2026",
        category: "Linux",
        image: "imagens/linux.png",
        alt: "Mascote Tux, símbolo do Linux",
        excerpt: "Conheça o sistema operacional Linux e aprenda os primeiros comandos essenciais do terminal.",
        link: "posts/linux.html"
    },
    {
        title: "O que é uma API?",
        date: "02 de Agosto de 2026",
        category: "Web",
        image: "imagens/api.jpeg",
        alt: "Conexão entre sistemas por uma API",
        excerpt: "Entenda como diferentes sistemas se comunicam por meio das APIs e por que elas são fundamentais.",
        link: "posts/api.html"
    }
];

const grid = document.querySelector("#posts-grid");
const featuredContainer = document.querySelector("#featured-post");
const searchInput = document.querySelector("#search-posts");
const filters = document.querySelectorAll(".filter");
const count = document.querySelector("#results-count");
const emptyState = document.querySelector("#empty-state");
const apiBase = window.TECH_IA_API_URL || "/api";
let activeCategory = "Todos";
let posts = fallbackPosts;

function normalizePost(post) {
    return {
        title: post.titulo,
        date: new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(new Date(post.createdAt)),
        category: post.categoria,
        image: post.imagem || "imagens/ia.jpg",
        alt: post.imagemAlt || post.titulo,
        excerpt: post.resumo,
        // A página dinâmica pode usar este identificador quando for implementada.
        link: `posts/post.html?id=${post._id}`,
        featured: post.destaque
    };
}

async function loadPostsFromApi() {
    try {
        const response = await fetch(`${apiBase}/posts?limit=50`);
        if (!response.ok) throw new Error("API indisponível");
        const data = await response.json();
        if (data.posts?.length) posts = data.posts.map(normalizePost);
    } catch {
        // O blog continua funcional em hospedagens estáticas, como GitHub Pages.
        posts = fallbackPosts;
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
    const term = searchInput.value.trim().toLocaleLowerCase("pt-BR");
    const visiblePosts = posts.filter((post) => {
        const matchesCategory = activeCategory === "Todos" || post.category === activeCategory;
        const content = `${post.title} ${post.category} ${post.excerpt}`.toLocaleLowerCase("pt-BR");
        return matchesCategory && content.includes(term);
    });
    grid.innerHTML = visiblePosts.map(postCard).join("");
    emptyState.hidden = visiblePosts.length > 0;
    count.textContent = `${visiblePosts.length} ${visiblePosts.length === 1 ? "artigo encontrado" : "artigos encontrados"}`;
}

function renderFeatured() {
    const post = posts.find((item) => item.featured) || posts[0];
    featuredContainer.innerHTML = `<img src="${post.image}" alt="${post.alt}">
        <div class="featured-content">
            <span class="tag">${post.category} · Artigo em destaque</span>
            <h3>${post.title}</h3>
            <p>${post.excerpt}</p>
            <a class="button button-primary" href="${post.link}">Ler artigo <span aria-hidden="true">→</span></a>
        </div>`;
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
});
