const MAX_MESSAGE_LENGTH = 800;
const MAX_HISTORY_MESSAGES = 4;
const MAX_CONTEXT_LENGTH = 3500;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT = Math.min(Math.max(Number(process.env.CHAT_RATE_LIMIT) || 8, 1), 50);
const MAX_TOKENS = Math.min(Math.max(Number(process.env.CHAT_MAX_TOKENS) || 340, 64), 500);
const requestLog = new Map();

const systemPrompt = `Você é a assistente do Tech & IA Blog. Responda sempre em português do Brasil, de forma didática, objetiva e amigável. Seu foco é tecnologia, programação, Linux, APIs e Inteligência Artificial. Use blocos de código Markdown quando isso ajudar. Não invente fatos e indique quando uma informação precisa ser verificada. Seja concisa: prefira no máximo 220 palavras ou 8 tópicos. Sempre conclua a última frase e nunca deixe uma resposta incompleta. Não use linhas separadoras como --- e não inclua explicações sobre o próprio limite de tokens.`;

function isAllowed(req) {
    const now = Date.now();
    const key = req.ip || "unknown";
    const recentRequests = (requestLog.get(key) || []).filter((time) => now - time < RATE_WINDOW_MS);
    if (recentRequests.length >= RATE_LIMIT) return false;
    recentRequests.push(now);
    requestLog.set(key, recentRequests);
    return true;
}

function cleanHistory(history) {
    if (!Array.isArray(history)) return [];
    return history
        .filter((item) => item && ["user", "assistant"].includes(item.role) && typeof item.content === "string")
        .slice(-MAX_HISTORY_MESSAGES)
        .map((item) => ({ role: item.role, content: item.content.trim().slice(0, MAX_MESSAGE_LENGTH) }))
        .filter((item) => item.content);
}

function cleanArticleContext(context) {
    if (!context || typeof context !== "object") return "";
    const title = typeof context.title === "string" ? context.title.trim().slice(0, 180) : "";
    const summary = typeof context.summary === "string" ? context.summary.trim().slice(0, 500) : "";
    const content = typeof context.content === "string" ? context.content.trim().slice(0, MAX_CONTEXT_LENGTH) : "";
    if (!title || !content) return "";
    return `\n\nA pessoa está lendo o artigo "${title}" no Tech & IA Blog. Use o contexto abaixo somente para responder perguntas sobre ele. Se a pergunta não for relacionada, responda normalmente.\nResumo: ${summary}\nConteúdo: ${content}`;
}

function finishReply(reply, finishReason) {
    if (finishReason !== "length") return reply;
    const sentenceEnd = Math.max(reply.lastIndexOf("."), reply.lastIndexOf("!"), reply.lastIndexOf("?"));
    if (sentenceEnd > reply.length * 0.45) {
        return `${reply.slice(0, sentenceEnd + 1)}\n\n_Resposta encurtada para respeitar o limite de uso._`;
    }
    return `${reply}\n\n_Resposta encurtada para respeitar o limite de uso._`;
}

async function chat(req, res, next) {
    try {
        if (!isAllowed(req)) return res.status(429).json({ message: "Limite de mensagens atingido. Aguarde uma hora e tente novamente." });

        const message = typeof req.body.message === "string" ? req.body.message.trim() : "";
        if (!message || message.length > MAX_MESSAGE_LENGTH) {
            return res.status(400).json({ message: `A mensagem deve ter entre 1 e ${MAX_MESSAGE_LENGTH} caracteres.` });
        }
        if (!process.env.HF_TOKEN) {
            return res.status(503).json({ message: "O assistente ainda não foi configurado no servidor." });
        }

        const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.HF_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: process.env.HF_MODEL || "Qwen/Qwen2.5-7B-Instruct:fastest",
                messages: [{ role: "system", content: systemPrompt + cleanArticleContext(req.body.articleContext) }, ...cleanHistory(req.body.history), { role: "user", content: message }],
                max_tokens: MAX_TOKENS,
                temperature: 0.4
            }),
            signal: AbortSignal.timeout(30000)
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            console.error("Erro Hugging Face:", response.status, data);
            return res.status(502).json({ message: "A IA não conseguiu responder agora. Tente novamente em instantes." });
        }
        const reply = data.choices?.[0]?.message?.content?.trim();
        if (!reply) return res.status(502).json({ message: "A IA retornou uma resposta inválida. Tente novamente." });
        res.json({ reply: finishReply(reply, data.choices?.[0]?.finish_reason) });
    } catch (error) {
        if (error.name === "TimeoutError") return res.status(504).json({ message: "A resposta da IA demorou demais. Tente novamente." });
        next(error);
    }
}

module.exports = { chat };
