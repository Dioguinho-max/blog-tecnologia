const jwt = require("jsonwebtoken");

function authenticateAdmin(req, res, next) {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "Token de acesso não informado." });

    try {
        req.admin = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ message: "Token inválido ou expirado." });
    }
}

module.exports = authenticateAdmin;
