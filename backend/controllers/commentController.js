const { pool } = require("../config/database");

async function listPublished(req, res, next) {
    try {
        const result = await pool.query("SELECT id, author_name AS \"authorName\", content, created_at AS \"createdAt\" FROM comments WHERE post_id=$1 AND published=true ORDER BY created_at DESC", [req.params.postId]);
        res.json({ comments: result.rows });
    } catch (error) { next(error); }
}

async function create(req, res, next) {
    try {
        const content = typeof req.body.content === "string" ? req.body.content.trim() : "";
        if (!content || content.length > 1000) return res.status(400).json({ message: "O comentário deve ter entre 1 e 1000 caracteres." });
        const metadata = req.reader.user_metadata || {};
        const authorName = String(metadata.full_name || metadata.name || req.reader.email?.split("@")[0] || "Leitor").trim().slice(0, 100);
        const result = await pool.query("INSERT INTO comments (post_id, user_id, author_name, content) VALUES ($1,$2,$3,$4) RETURNING id", [req.params.postId, req.reader.id, authorName, content]);
        res.status(201).json({ id: result.rows[0].id, message: "Comentário enviado para moderação." });
    } catch (error) { next(error); }
}

async function listMine(req, res, next) {
    try {
        const result = await pool.query("SELECT id, author_name AS \"authorName\", content, published, created_at AS \"createdAt\" FROM comments WHERE post_id=$1 AND user_id=$2 ORDER BY created_at DESC", [req.params.postId, req.reader.id]);
        res.json({ comments: result.rows });
    } catch (error) { next(error); }
}

async function removeMine(req, res, next) {
    try {
        const result = await pool.query("DELETE FROM comments WHERE id=$1 AND user_id=$2 RETURNING id", [req.params.id, req.reader.id]);
        if (!result.rowCount) return res.status(404).json({ message: "Comentário não encontrado." });
        res.status(204).end();
    } catch (error) { next(error); }
}

async function listAdmin(req, res, next) {
    try {
        const result = await pool.query("SELECT c.id, c.author_name AS \"authorName\", c.content, c.published, c.created_at AS \"createdAt\", p.titulo AS \"postTitle\" FROM comments c JOIN posts p ON p.id=c.post_id ORDER BY c.created_at DESC");
        res.json({ comments: result.rows });
    } catch (error) { next(error); }
}

async function publish(req, res, next) {
    try {
        const result = await pool.query("UPDATE comments SET published=true WHERE id=$1 RETURNING id", [req.params.id]);
        if (!result.rowCount) return res.status(404).json({ message: "Comentário não encontrado." });
        res.status(204).end();
    } catch (error) { next(error); }
}

async function remove(req, res, next) {
    try {
        const result = await pool.query("DELETE FROM comments WHERE id=$1 RETURNING id", [req.params.id]);
        if (!result.rowCount) return res.status(404).json({ message: "Comentário não encontrado." });
        res.status(204).end();
    } catch (error) { next(error); }
}

module.exports = { listPublished, create, listMine, removeMine, listAdmin, publish, remove };
