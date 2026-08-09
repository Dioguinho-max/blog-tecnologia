const { pool } = require("./database");
//const initialPosts = require("../data/initialPosts");

async function seedPosts() {
    for (const post of initialPosts) {
        const exists = await pool.query("SELECT 1 FROM posts WHERE titulo = $1", [post.titulo]);
        if (exists.rowCount) continue;
        await pool.query(
            `INSERT INTO posts (titulo, resumo, conteudo, categoria, imagem, imagem_alt, publicado, destaque, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, true, $7, $8, $8)`,
            [post.titulo, post.resumo, post.conteudo, post.categoria, post.imagem, post.imagemAlt, post.destaque, post.createdAt]
        );
    }
    console.log("Posts iniciais verificados.");
}

module.exports = seedPosts;
