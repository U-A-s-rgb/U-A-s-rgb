/* ============================================================
 *  lib/db.js  —  Postgres 数据库连接 + 表初始化
 *  Vercel 环境变量: DATABASE_URL
 * ============================================================ */

const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 1,
    idleTimeoutMillis: 30000
});

pool.on('error', (err) => {
    console.error('Unexpected PostgreSQL error:', err);
});

async function query(text, params) {
    const res = await pool.query(text, params);
    return res;
}

async function initDb() {
    await query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(32) UNIQUE NOT NULL,
            password_hash VARCHAR(128) NOT NULL,
            role VARCHAR(16) NOT NULL DEFAULT 'user',
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            last_login TIMESTAMPTZ,
            is_banned BOOLEAN NOT NULL DEFAULT FALSE
        )
    `);
    await query(`
        CREATE TABLE IF NOT EXISTS stats (
            id SERIAL PRIMARY KEY,
            stat_key VARCHAR(64) UNIQUE NOT NULL,
            stat_value INTEGER NOT NULL DEFAULT 0,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);
    // 种子数据：统计项初始化
    const keys = ['register_count', 'login_count', 'admin_login_count', 'cmd_validations', 'cmd_generations'];
    for (const k of keys) {
        await query(
            'INSERT INTO stats (stat_key, stat_value) VALUES ($1, 0) ON CONFLICT (stat_key) DO NOTHING',
            [k]
        );
    }
}

module.exports = { query, initDb, pool };
