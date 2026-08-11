const chatApiBase = window.TECH_IA_API_URL || "/api";

document.body.insertAdjacentHTML("beforeend", `
    <button id="ai-launcher" class="ai-launcher" type="button" aria-label="Abrir assistente Tech & IA" aria-expanded="false" aria-controls="ai-panel"><span aria-hidden="true">✦</span><span>IA</span></button>
    <aside id="ai-panel" class="ai-panel" aria-label="Assistente Tech & IA" aria-hidden="true">
        <header class="ai-header"><div class="ai-identity"><span class="ai-logo" aria-hidden="true">✦</span><div><strong>Tech &amp; IA</strong><small>Assistente do blog</small></div></div><div class="ai-header-actions"><button id="ai-clear" class="ai-clear" type="button">Limpar</button><button id="ai-close" class="ai-close" type="button" aria-label="Fechar assistente">×</button></div></header>
        <div id="ai-messages" class="ai-messages" aria-live="polite"><div id="ai-suggestions" class="ai-suggestions" aria-label="Sugestões de perguntas"></div></div>
        <form id="ai-form" class="ai-composer"><label class="sr-only" for="ai-input">Faça uma pergunta</label><textarea id="ai-input" rows="1" placeholder="Pergunte à Tech & IA..."></textarea><button id="ai-send" type="submit" aria-label="Enviar mensagem">➤</button></form>
        <p class="ai-status">Enter envia · Shift + Enter quebra a linha</p>
    </aside>
    <div id="ai-backdrop" class="ai-backdrop" hidden></div>
`);

const aiLauncher = document.querySelector("#ai-launcher");
const aiPanel = document.querySelector("#ai-panel");
const aiClose = document.querySelector("#ai-close");
const aiClear = document.querySelector("#ai-clear");
const aiBackdrop = document.querySelector("#ai-backdrop");
const aiForm = document.querySelector("#ai-form");
const aiMessages = document.querySelector("#ai-messages");
const aiInput = document.querySelector("#ai-input");
const aiSend = document.querySelector("#ai-send");
const aiSuggestions = document.querySelector("#ai-suggestions");
const HISTORY_KEY = "tech-ia-chat-history";
const SESSION_KEY = "tech-ia-chat-session";
let chatHistory = loadChatHistory();
const DAILY_LIMIT = 10;

function loadChatHistory() {
    try {
        const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
        return Array.isArray(saved) ? saved.filter((item) => item && ["user", "assistant"].includes(item.role) && typeof item.content === "string").slice(-20) : [];
    } catch { return []; }
}

function saveChatHistory() {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(chatHistory.slice(-20)));
}

function rememberMessage(role, content) {
    chatHistory.push({ role, content });
    chatHistory = chatHistory.slice(-20);
    saveChatHistory();
}

function getSessionId() {
    let sessionId = localStorage.getItem(SESSION_KEY);
    if (!sessionId) {
        sessionId = crypto.randomUUID();
        localStorage.setItem(SESSION_KEY, sessionId);
    }
    return sessionId;
}

function getArticleContext() {
    const context = window.TECH_IA_ARTICLE_CONTEXT;
    if (!context?.title || !context?.content) return null;
    return { title: context.title, summary: context.summary || "", content: context.content.slice(0, 3500) };
}

function renderSuggestions() {
    const context = getArticleContext();
    const suggestions = context
        ? [
            { label: "Resumir este artigo", prompt: "Resuma este artigo em tópicos simples." },
            { label: "Explique de forma simples", prompt: "Explique o assunto deste artigo de forma simples, como para um iniciante." },
            { label: "Criar exercício", prompt: "Crie um exercício prático baseado neste artigo, sem entregar a resposta imediatamente." }
        ]
        : [
            { label: "Por onde começar?", prompt: "Quais artigos do Tech & IA Blog você recomenda para quem está começando em tecnologia?" },
            { label: "Explicar Linux", prompt: "Explique o que é Linux de forma simples." },
            { label: "O que é uma API?", prompt: "Explique o que é uma API com um exemplo simples." }
        ];
    aiSuggestions.replaceChildren(...suggestions.map(({ label, prompt }) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = label;
        button.dataset.prompt = prompt;
        return button;
    }));
}

function getDailyUsage() {
    const key = "tech-ia-chat-usage";
    const today = new Date().toISOString().slice(0, 10);
    try {
        const saved = JSON.parse(localStorage.getItem(key) || "{}");
        return saved.date === today ? saved : { date: today, count: 0 };
    } catch { return { date: today, count: 0 }; }
}

function consumeDailyUsage() {
    const usage = getDailyUsage();
    if (usage.count >= DAILY_LIMIT) return false;
    localStorage.setItem("tech-ia-chat-usage", JSON.stringify({ ...usage, count: usage.count + 1 }));
    return true;
}

function setAiPanelOpen(isOpen) {
    aiPanel.classList.toggle("open", isOpen);
    aiPanel.setAttribute("aria-hidden", String(!isOpen));
    aiLauncher.setAttribute("aria-expanded", String(isOpen));
    aiBackdrop.hidden = !isOpen;
    requestAnimationFrame(() => aiBackdrop.classList.toggle("visible", isOpen));
}

function appendInlineMarkdown(target, value) {
    value.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).forEach((part) => {
        const bold = part.match(/^\*\*(.+)\*\*$/);
        if (bold) {
            const strong = document.createElement("strong");
            strong.textContent = bold[1];
            target.append(strong);
        } else {
            target.append(document.createTextNode(part.replace(/^_(.+)_$/, "$1")));
        }
    });
}

function renderChatContent(container, content) {
    let list = null;
    let listType = null;
    let codeBlock = null;

    content.split("\n").forEach((rawLine) => {
        const line = rawLine.trim();
        if (/^```/.test(line)) {
            if (codeBlock) { codeBlock = null; return; }
            const pre = document.createElement("pre");
            const code = document.createElement("code");
            pre.append(code);
            container.append(pre);
            codeBlock = code;
            list = null;
            return;
        }
        if (codeBlock) {
            codeBlock.textContent += `${rawLine}\n`;
            return;
        }
        if (!line || /^[-—]{3,}$/.test(line)) { list = null; listType = null; return; }

        const heading = line.match(/^#{1,3}\s+(.+)/);
        const ordered = line.match(/^\d+[.)]\s+(.+)/);
        const bullet = line.match(/^[-*]\s+(.+)/);
        if (heading) {
            const title = document.createElement("strong");
            title.className = "ai-md-heading";
            appendInlineMarkdown(title, heading[1]);
            container.append(title);
            list = null;
            return;
        }
        if (ordered || bullet) {
            const type = ordered ? "ol" : "ul";
            if (!list || listType !== type) {
                list = document.createElement(type);
                listType = type;
                container.append(list);
            }
            const item = document.createElement("li");
            appendInlineMarkdown(item, (ordered || bullet)[1]);
            list.append(item);
            return;
        }
        const paragraph = document.createElement("p");
        appendInlineMarkdown(paragraph, line);
        container.append(paragraph);
        list = null;
        listType = null;
    });
}

function addChatMessage(role, content) {
    const message = document.createElement("div");
    message.className = `ai-message ai-message-${role}`;
    const avatar = document.createElement("span");
    avatar.className = "ai-message-avatar";
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = role === "user" ? "Você" : "✦";
    const text = document.createElement("div");
    text.className = "ai-message-content";
    renderChatContent(text, content);
    message.append(avatar, text);
    aiMessages.insertBefore(message, aiSuggestions);
    aiMessages.scrollTop = aiMessages.scrollHeight;
    return message;
}

function addChatSources(sources) {
    if (!Array.isArray(sources) || !sources.length) return;
    const sourceBox = document.createElement("div");
    sourceBox.className = "ai-sources";
    const title = document.createElement("span");
    title.textContent = "Artigos consultados";
    sourceBox.append(title);
    const postPath = window.location.pathname.includes("/posts/") ? "post.html" : "posts/post.html";
    sources.forEach((source) => {
        const link = document.createElement("a");
        link.href = `${postPath}?id=${encodeURIComponent(source.id)}`;
        link.textContent = source.titulo;
        sourceBox.append(link);
    });
    aiMessages.insertBefore(sourceBox, aiSuggestions);
    aiMessages.scrollTop = aiMessages.scrollHeight;
}

function setChatLoading(isLoading) {
    aiInput.disabled = isLoading;
    aiSend.disabled = isLoading;
    aiSend.textContent = isLoading ? "…" : "➤";
}

function updateUsageLabel(remaining = DAILY_LIMIT - getDailyUsage().count) {
    document.querySelector(".ai-status").textContent = `${Math.max(remaining, 0)} de ${DAILY_LIMIT} mensagens disponíveis hoje`;
}

async function typeAssistantMessage(content) {
    const message = addChatMessage("assistant", "");
    const text = message.querySelector(".ai-message-content");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        renderChatContent(text, content);
        return;
    }
    for (let index = 0; index < content.length; index += 4) {
        text.replaceChildren();
        renderChatContent(text, content.slice(0, index + 4));
        aiMessages.scrollTop = aiMessages.scrollHeight;
        await new Promise((resolve) => setTimeout(resolve, 14));
    }
}

async function sendChatMessage() {
    const message = aiInput.value.trim();
    if (!message || aiInput.disabled) return;
    let session;
    try { session = JSON.parse(localStorage.getItem("tech-ia-reader-session")); } catch { session = null; }
    if (!session?.access_token) {
        addChatMessage("assistant", "Para usar a IA, entre na sua conta primeiro. Acesse a página Conta no menu. 🔐");
        return;
    }
    if (!consumeDailyUsage()) {
        addChatMessage("assistant", "Você atingiu o limite diário de 10 mensagens deste navegador. Volte amanhã para continuar. ✨");
        return;
    }
    updateUsageLabel();
    addChatMessage("user", message);
    const historyForRequest = chatHistory.slice(-4);
    rememberMessage("user", message);
    aiInput.value = "";
    aiInput.style.height = "auto";
    setChatLoading(true);
    const typing = addChatMessage("assistant", "A IA está digitando...");
    typing.classList.add("ai-typing");
    try {
        const response = await fetch(`${chatApiBase}/chat`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ message, history: historyForRequest, articleContext: getArticleContext(), sessionId: getSessionId() }) });
        const data = await response.json().catch(() => ({}));
        typing.remove();
        if (!response.ok) throw new Error(data.message || "Não foi possível obter uma resposta.");
        await typeAssistantMessage(data.reply);
        addChatSources(data.sources);
        rememberMessage("assistant", data.reply);
        updateUsageLabel(data.remaining);
    } catch (error) {
        typing.remove();
        addChatMessage("assistant", error.message || "Ocorreu um erro ao conversar com a IA.");
    } finally {
        setChatLoading(false);
        aiInput.focus();
    }
}

aiLauncher.addEventListener("click", () => setAiPanelOpen(true));
aiClose.addEventListener("click", () => setAiPanelOpen(false));
aiClear.addEventListener("click", () => {
    chatHistory = [];
    localStorage.removeItem(HISTORY_KEY);
    aiMessages.replaceChildren(aiSuggestions);
    addChatMessage("assistant", "Conversa limpa. Como posso ajudar você? 👋");
    renderSuggestions();
});
aiBackdrop.addEventListener("click", () => setAiPanelOpen(false));
aiForm.addEventListener("submit", (event) => { event.preventDefault(); sendChatMessage(); });
aiInput.addEventListener("keydown", (event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendChatMessage(); } });
aiInput.addEventListener("input", () => { aiInput.style.height = "auto"; aiInput.style.height = `${Math.min(aiInput.scrollHeight, 110)}px`; });
aiSuggestions.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-prompt]");
    if (!button || aiInput.disabled) return;
    aiInput.value = button.dataset.prompt;
    sendChatMessage();
});
document.addEventListener("keydown", (event) => { if (event.key === "Escape" && aiPanel.classList.contains("open")) setAiPanelOpen(false); });
window.addEventListener("techiaarticlecontext", renderSuggestions);
renderSuggestions();
if (chatHistory.length) chatHistory.forEach((item) => addChatMessage(item.role, item.content));
else addChatMessage("assistant", "Olá! Como posso ajudar você com tecnologia hoje? 👋");
updateUsageLabel();
