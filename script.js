// ==========================
// Tech & IA Blog
// script.js
// ==========================

// Mensagem ao carregar o site
window.addEventListener("load", () => {
    console.log("✅ Bem-vindo ao Tech & IA Blog!");
});

// Seleciona todos os links do menu
const links = document.querySelectorAll("nav a");

// Destaca o link clicado
links.forEach(link => {
    link.addEventListener("click", (event) => {

        // Remove a classe "ativo" de todos
        links.forEach(item => item.classList.remove("ativo"));

        // Adiciona a classe ao link clicado
        event.target.classList.add("ativo");
    });
});