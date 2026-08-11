const themeToggle = document.querySelector(".theme-toggle");

function setTheme(isDark) {
    document.body.classList.toggle("dark-theme", isDark);
    themeToggle.textContent = isDark ? "☀" : "☾";
    themeToggle.setAttribute("aria-label", isDark ? "Ativar modo claro" : "Ativar modo escuro");
    localStorage.setItem("tech-ia-theme", isDark ? "dark" : "light");
}

setTheme(localStorage.getItem("tech-ia-theme") === "dark");
themeToggle.addEventListener("click", () => setTheme(!document.body.classList.contains("dark-theme")));
