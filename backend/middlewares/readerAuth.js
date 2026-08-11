async function authenticateReader(req, res, next) {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "Entre na sua conta para usar este recurso." });
    try {
        const response = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, { headers: { apikey: process.env.SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${token}` } });
        const user = await response.json();
        if (!response.ok || !user.id) return res.status(401).json({ message: "Sessão inválida. Entre novamente." });
        req.reader = user;
        next();
    } catch { res.status(503).json({ message: "Não foi possível validar sua sessão." }); }
}
module.exports = authenticateReader;
