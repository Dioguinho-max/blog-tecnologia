const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
    throw new Error("A variável DATABASE_URL não foi definida.");
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function connectDatabase() {
    await pool.query("SELECT 1");
    await pool.query("CREATE EXTENSION IF NOT EXISTS pgcrypto");
    await pool.query(`
        CREATE TABLE IF NOT EXISTS posts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            titulo VARCHAR(160) NOT NULL,
            conteudo TEXT NOT NULL CHECK (char_length(conteudo) <= 50000),
            resumo VARCHAR(320) NOT NULL,
            categoria VARCHAR(20) NOT NULL CHECK (categoria IN ('IA', 'Linux', 'Web', 'Tecnologia')),
            imagem TEXT DEFAULT '',
            imagem_alt VARCHAR(180) DEFAULT '',
            publicado BOOLEAN NOT NULL DEFAULT false,
            destaque BOOLEAN NOT NULL DEFAULT false,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);
    await pool.query("CREATE INDEX IF NOT EXISTS posts_publicados_em_idx ON posts (publicado, destaque DESC, created_at DESC)");
    await pool.query("CREATE INDEX IF NOT EXISTS posts_busca_idx ON posts USING GIN (to_tsvector('portuguese', titulo || ' ' || resumo || ' ' || categoria))");
    await pool.query(`
        CREATE TABLE IF NOT EXISTS chat_usage (
            session_id UUID NOT NULL,
            usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
            request_count INTEGER NOT NULL DEFAULT 0 CHECK (request_count >= 0),
            PRIMARY KEY (session_id, usage_date)
        )
    `);
    console.log("PostgreSQL (Supabase) conectado.");
}

module.exports = { connectDatabase, pool };
