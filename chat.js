const chatApiBase = window.TECH_IA_API_URL || "/api";

document.body.insertAdjacentHTML("beforeend", `
    <button id="ai-launcher" class="ai-launcher" type="button" aria-label="Abrir assistente Tech & IA" aria-expanded="false" aria-controls="ai-panel"><span aria-hidden="true">✦</span><span>IA</span></button>
    <aside id="ai-panel" class="ai-panel" aria-label="Assistente Tech & IA" aria-hidden="true">
        <header class="ai-header"><div class="ai-identity"><span class="ai-logo" aria-hidden="true">✦</span><div><strong>Tech &amp; IA</strong><small>Assistente do blog</small></div></div><button id="ai-close" class="ai-close" type="button" aria-label="Fechar assistente">×</button></header>
        <div id="ai-messages" class="ai-messages" aria-live="polite"><div class="ai-message ai-message-assistant"><span class="ai-message-avatar" aria-hidden="true">✦</span><p>Olá! Como posso ajudar você com tecnologia hoje? 👋</p></div></div>
        <form id="ai-form" class="ai-composer"><label class="sr-only" for="ai-input">Faça uma pergunta</label><textarea id="ai-input" rows="1" placeholder="Pergunte à Tech & IA..."></textarea><button id="ai-send" type="submit" aria-label="Enviar mensagem">➤</button></form>
        <p class="ai-status">Enter envia · Shift + Enter quebra a linha</p>
    </aside>
    <div id="ai-backdrop" class="ai-backdrop" hidden></div>
`);

const aiLauncher = document.querySelector("#ai-launcher");
const aiPanel = document.querySelector("#ai-panel");
const aiClose = document.querySelector("#ai-close");
const aiBackdrop = document.querySelector("#ai-backdrop");
const aiForm = document.querySelector("#ai-form");
const aiMessages = document.querySelector("#ai-messages");
const aiInput = document.querySelector("#ai-input");
const aiSend = document.querySelector("#ai-send");
let chatHistory = [];

function setAiPanelOpen(isOpen) {
    aiPanel.classList.toggle("open", isOpen);
    aiPanel.setAttribute("aria-hidden", String(!isOpen));
    aiLauncher.setAttribute("aria-expanded", String(isOpen));
    aiBackdrop.hidden = !isOpen;
    requestAnimationFrame(() => aiBackdrop.classList.toggle("visible", isOpen));
}

function addChatMessage(role, content) {
    const message = document.createElement("div");
    message.className = `ai-message ai-message-${role}`;
    const avatar = document.createElement("span");
    avatar.className = "ai-message-avatar";
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = role === "user" ? "Você" : "✦";
    const text = document.createElement("p");
    text.textContent = content;
    message.append(avatar, text);
    aiMessages.append(message);
    aiMessages.scrollTop = aiMessages.scrollHeight;
    return message;
}

function setChatLoading(isLoading) {
    aiInput.disabled = isLoading;
    aiSend.disabled = isLoading;
    aiSend.textContent = isLoading ? "…" : "➤";
}

async function sendChatMessage() {
    const message = aiInput.value.trim();
    if (!message || aiInput.disabled) return;
    addChatMessage("user", message);
    const historyForRequest = chatHistory.slice(-8);
    chatHistory.push({ role: "user", content: message });
    aiInput.value = "";
    aiInput.style.height = "auto";
    setChatLoading(true);
    const typing = addChatMessage("assistant", "A IA está digitando...");
    typing.classList.add("ai-typing");
    try {
        const response = await fetch(`${chatApiBase}/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message, history: historyForRequest }) });
        const data = await response.json().catch(() => ({}));
        typing.remove();
        if (!response.ok) throw new Error(data.message || "Não foi possível obter uma resposta.");
        addChatMessage("assistant", data.reply);
        chatHistory.push({ role: "assistant", content: data.reply });
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
aiBackdrop.addEventListener("click", () => setAiPanelOpen(false));
aiForm.addEventListener("submit", (event) => { event.preventDefault(); sendChatMessage(); });
aiInput.addEventListener("keydown", (event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendChatMessage(); } });
aiInput.addEventListener("input", () => { aiInput.style.height = "auto"; aiInput.style.height = `${Math.min(aiInput.scrollHeight, 110)}px`; });
document.addEventListener("keydown", (event) => { if (event.key === "Escape" && aiPanel.classList.contains("open")) setAiPanelOpen(false); });
