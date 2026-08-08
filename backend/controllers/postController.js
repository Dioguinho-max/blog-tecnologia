const { pool } = require("../config/database");

const fields = ["titulo", "conteudo", "resumo", "categoria", "imagem", "imagemAlt", "publicado", "destaque"];
const columns = { imagemAlt: "imagem_alt" };
const selectFields = "id, titulo, conteudo, resumo, categoria, imagem, imagem_alt AS \"imagemAlt\", publicado, destaque, created_at AS \"createdAt\", updated_at AS \"updatedAt\"";

function pickFields(body) {
    return Object.fromEntries(Object.entries(body).filter(([key]) => fields.includes(key)));
}

async function listPosts(req, res, next) {
    try {
        const { search = "", categoria, page = 1, limit = 12 } = req.query;
        const safeLimit = Math.min(Math.max(Number(limit) || 12, 1), 50);
        const safePage = Math.max(Number(page) || 1, 1);
        const values = [true];
        const clauses = ["publicado = $1"];
        if (categoria) { values.push(categoria); clauses.push(`categoria = $${values.length}`); }
        if (search.trim()) {
            values.push(`%${search.trim()}%`);
            clauses.push(`(titulo ILIKE $${values.length} OR resumo ILIKE $${values.length} OR categoria ILIKE $${values.length})`);
        }
        const where = clauses.join(" AND ");
        const count = await pool.query(`SELECT COUNT(*) FROM posts WHERE ${where}`, values);
        values.push(safeLimit, (safePage - 1) * safeLimit);
        const posts = await pool.query(`SELECT ${selectFields} FROM posts WHERE ${where} ORDER BY destaque DESC, created_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`, values);
        const total = Number(count.rows[0].count);
        res.json({ posts: posts.rows, pagination: { page: safePage, limit: safeLimit, total, pages: Math.ceil(total / safeLimit) } });
    } catch (error) { next(error); }
}

async function getPost(req, res, next) {
    try {
        const result = await pool.query(`SELECT ${selectFields} FROM posts WHERE id = $1 AND publicado = true`, [req.params.id]);
        if (!result.rowCount) return res.status(404).json({ message: "Post não encontrado." });
        res.json(result.rows[0]);
    } catch (error) { next(error); }
}

async function listAdminPosts(req, res, next) {
    try {
        const result = await pool.query(`SELECT ${selectFields} FROM posts ORDER BY updated_at DESC`);
        res.json({ posts: result.rows });
    } catch (error) { next(error); }
}

async function createPost(req, res, next) {
    try {
        const data = pickFields(req.body);
        if (!data.titulo || !data.conteudo || !data.resumo || !data.categoria) return res.status(400).json({ message: "Título, conteúdo, resumo e categoria são obrigatórios." });
        const keys = Object.keys(data);
        const dbColumns = keys.map((key) => columns[key] || key);
        const result = await pool.query(`INSERT INTO posts (${dbColumns.join(", ")}) VALUES (${keys.map((_, index) => `$${index + 1}`).join(", ")}) RETURNING ${selectFields}`, keys.map((key) => data[key]));
        res.status(201).json(result.rows[0]);
    } catch (error) { next(error); }
}

async function updatePost(req, res, next) {
    try {
        const data = pickFields(req.body);
        const keys = Object.keys(data);
        if (!keys.length) return res.status(400).json({ message: "Nenhum campo válido para atualizar." });
        const assignments = keys.map((key, index) => `${columns[key] || key} = $${index + 1}`);
        assignments.push("updated_at = NOW()");
        const result = await pool.query(`UPDATE posts SET ${assignments.join(", ")} WHERE id = $${keys.length + 1} RETURNING ${selectFields}`, [...keys.map((key) => data[key]), req.params.id]);
        if (!result.rowCount) return res.status(404).json({ message: "Post não encontrado." });
        res.json(result.rows[0]);
    } catch (error) { next(error); }
}

async function deletePost(req, res, next) {
    try {
        const result = await pool.query("DELETE FROM posts WHERE id = $1 RETURNING id", [req.params.id]);
        if (!result.rowCount) return res.status(404).json({ message: "Post não encontrado." });
        res.status(204).end();
    } catch (error) { next(error); }
}

module.exports = { listPosts, listAdminPosts, getPost, createPost, updatePost, deletePost };
