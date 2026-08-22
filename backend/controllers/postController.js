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

async function adminStats(req, res, next) {
    try {
        const result = await pool.query(`SELECT
            (SELECT COUNT(*) FROM posts WHERE publicado=true)::int AS published,
            (SELECT COUNT(*) FROM posts WHERE publicado=false)::int AS drafts,
            (SELECT COUNT(*) FROM comments WHERE published=false)::int AS pending_comments,
            (SELECT COALESCE(SUM(view_count),0) FROM post_views)::int AS views,
            (SELECT titulo FROM posts p LEFT JOIN post_views v ON v.post_id=p.id WHERE p.publicado=true ORDER BY COALESCE(v.view_count,0) DESC, p.created_at DESC LIMIT 1) AS top_post`);
        res.json(result.rows[0]);
    } catch (error) { next(error); }
}

async function registerView(req, res, next) {
    try {
        await pool.query("INSERT INTO post_views (post_id, view_count) SELECT id, 1 FROM posts WHERE id=$1 AND publicado=true ON CONFLICT (post_id) DO UPDATE SET view_count=post_views.view_count+1, updated_at=NOW()", [req.params.id]);
        res.status(204).end();
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

module.exports = { listPosts, listAdminPosts, adminStats, registerView, getPost, createPost, updatePost, deletePost };
