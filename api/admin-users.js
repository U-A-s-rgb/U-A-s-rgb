/* ============================================================
 *  api/admin-users.js  —  管理员：用户管理
 *  GET  /api/admin-users         列表
 *  POST /api/admin-users/ban     封禁/解封 { id, ban }
 *  POST /api/admin-users/reset   重置密码 { id, newPassword }
 *  DELETE /api/admin-users/:id   删除
 * ============================================================ */

const { query, initDb } = require('../lib/db');
const { requireAdmin } = require('../lib/auth');
const { ok, error, handleError } = require('../lib/response');

let initialized = false;

export default async function handler(req, res) {
    try {
        if (!initialized) { await initDb(); initialized = true; }
        const admin = requireAdmin(req);

        const pathParts = req.url.split('?')[0].split('/').filter(Boolean);
        const action = pathParts[2] || 'list'; // admin-users -> action
        const id = pathParts[3];

        // DELETE /api/admin-users/:id
        if (req.method === 'DELETE' && id) {
            await query('DELETE FROM users WHERE id = $1 AND role != $2', [id, 'admin']);
            return ok(res);
        }

        // POST /api/admin-users/ban
        if (req.method === 'POST' && action === 'ban') {
            const { id: uid, ban } = req.body || {};
            await query('UPDATE users SET is_banned = $1 WHERE id = $2 AND role != $3', [ban, uid, 'admin']);
            return ok(res);
        }

        // POST /api/admin-users/reset
        if (req.method === 'POST' && action === 'reset') {
            const { id: uid, newPassword } = req.body || {};
            if (!newPassword || newPassword.length < 6) {
                return error(res, 400, '新密码至少 6 位');
            }
            const bcrypt = require('bcryptjs');
            const hash = await bcrypt.hash(newPassword, 10);
            await query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, uid]);
            return ok(res);
        }

        // GET 列表
        if (req.method === 'GET') {
            const { rows } = await query(`
                SELECT id, username, role, created_at, last_login, is_banned
                FROM users
                ORDER BY id DESC
                LIMIT 100
            `);
            return ok(res, { users: rows });
        }

        return error(res, 405, '方法不允许');
    } catch (err) {
        handleError(res, err);
    }
}
