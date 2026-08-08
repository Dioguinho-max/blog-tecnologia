const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "E-mail e senha são obrigatórios." });
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD_HASH || !process.env.JWT_SECRET) {
        return res.status(503).json({ message: "Autenticação ainda não foi configurada no servidor." });
    }

    const emailMatches = email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase();
    const passwordMatches = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
    if (!emailMatches || !passwordMatches) return res.status(401).json({ message: "Credenciais inválidas." });

    const token = jwt.sign({ email: process.env.ADMIN_EMAIL, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "8h" });
    res.json({ token, expiresIn: "8h" });
}

module.exports = { login };
