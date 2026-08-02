/* ============================================================
 *  api/me.js  —  获取当前登录用户信息
 *  GET /api/me
 * ============================================================ */

const { query, initDb } = require('../lib/db');
const { authMiddleware } = require('../lib/auth');
const { ok, error, handleError } = require('../lib/response');

let initialized = false;

export default async function handler(req, res) {
    try {
        if (!initialized) { await initDb(); initialized = true; }

        const payload = authMiddleware(req);
        if (!payload) {
            return error(res, 401, '未登录');
        }

        const result = await query(
            'SELECT id, username, role, created_at, last_login FROM users WHERE id = $1',
            [payload.id]
        );

        if (result.rows.length === 0) {
            return error(res, 404, '用户不存在');
        }

        return ok(res, { user: result.rows[0] });
    } catch (err) {
        handleError(res, err);
    }
}
