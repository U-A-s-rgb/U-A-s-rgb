/* ============================================================
 *  api/admin-login.js  —  管理员入口登录
 *  POST /api/admin-login  { password }
 * ============================================================ */

const { query, initDb } = require('../lib/db');
const { signToken, ADMIN_PASSWORD } = require('../lib/auth');
const { ok, error, handleError } = require('../lib/response');

let initialized = false;

export default async function handler(req, res) {
    try {
        if (!initialized) { await initDb(); initialized = true; }

        if (req.method !== 'POST') {
            return error(res, 405, '方法不允许');
        }

        const { password } = req.body || {};

        if (!password) {
            return error(res, 400, '请输入管理员密码');
        }

        if (password !== ADMIN_PASSWORD) {
            return error(res, 401, '管理员密码错误');
        }

        // 确保管理员账号存在
        await query(`
            INSERT INTO users (username, password_hash, role)
            VALUES ($1, $2, 'admin')
            ON CONFLICT (username) DO NOTHING
        `, ['__admin__', 'admin_managed']);

        const token = signToken({ id: 0, username: 'admin', role: 'admin' });

        await query(
            'INSERT INTO stats (stat_key, stat_value) VALUES ($1, 1) ON CONFLICT (stat_key) DO UPDATE SET stat_value = stats.stat_value + 1',
            ['admin_login_count']
        );

        return ok(res, {
            token,
            user: { username: 'admin', role: 'admin' }
        });
    } catch (err) {
        handleError(res, err);
    }
}
