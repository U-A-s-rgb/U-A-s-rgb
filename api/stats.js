/* ============================================================
 *  api/stats.js  —  统计数据（管理员查看）
 *  GET /api/stats
 * ============================================================ */

const { query, initDb } = require('../lib/db');
const { requireAdmin } = require('../lib/auth');
const { ok, handleError } = require('../lib/response');

let initialized = false;

export default async function handler(req, res) {
    try {
        if (!initialized) { await initDb(); initialized = true; }
        const admin = requireAdmin(req);

        const { rows } = await query('SELECT stat_key, stat_value, updated_at FROM stats');
        const stats = {};
        rows.forEach(r => { stats[r.stat_key] = r.stat_value; });

        const userCount = await query('SELECT COUNT(*) AS c FROM users WHERE role = $1', ['user']);
        const bannedCount = await query('SELECT COUNT(*) AS c FROM users WHERE is_banned = TRUE');

        return ok(res, {
            stats,
            userCount: parseInt(userCount.rows[0].c),
            bannedCount: parseInt(bannedCount.rows[0].c),
            serverTime: new Date().toISOString()
        });
    } catch (err) {
        handleError(res, err);
    }
}
