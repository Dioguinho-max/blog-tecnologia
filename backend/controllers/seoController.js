const { pool } = require("../config/database");

const escapeXml = (value) => String(value).replace(/[<>&'\"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[char]);

async function sitemap(req, res, next) {
    try {
        const siteUrl = (process.env.PUBLIC_SITE_URL || "https://techiablog.vercel.app").replace(/\/$/, "");
        const result = await pool.query("SELECT id, updated_at FROM posts WHERE publicado = true ORDER BY updated_at DESC");
        const urls = [
            `<url><loc>${siteUrl}/</loc></url>`,
            `<url><loc>${siteUrl}/sobre.html</loc></url>`,
            ...result.rows.map((post) => `<url><loc>${siteUrl}/posts/post.html?id=${escapeXml(post.id)}</loc><lastmod>${new Date(post.updated_at).toISOString()}</lastmod></url>`)
        ];
        res.type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}</urlset>`);
    } catch (error) { next(error); }
}

module.exports = { sitemap };
