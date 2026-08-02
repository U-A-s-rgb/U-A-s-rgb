/* ============================================================
 *  api/login.js  —  用户登录
 *  POST /api/login  { username, password }
 * ============================================================ */

const { query, initDb } = require('../lib/db');
const { verifyPassword, signToken } = require('../lib/auth');
const { ok, error, handleError } = require('../lib/response');

let initialized = false;

export default async function handler(req, res) {
    try {
        if (!initialized) { await initDb(); initialized = true; }

        if (req.method !== 'POST') {
            return error(res, 405, '方法不允许');
        }

        const { username, password } = req.body || {};

        if (!username || !password) {
            return error(res, 400, '用户名和密码不能为空');
        }

        const result = await query(
            'SELECT id, username, password_hash, role, is_banned, created_at FROM users WHERE username = $1',
            [username]
        );

        if (result.rows.length === 0) {
            return error(res, 401, '用户不存在或密码错误');
        }

        const user = result.rows[0];

        if (user.is_banned) {
            return error(res, 403, '该账号已被封禁');
        }

        const valid = await verifyPassword(password, user.password_hash);
        if (!valid) {
            return error(res, 401, '用户名或密码错误');
        }

        await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);
        await query(
            'INSERT INTO stats (stat_key, stat_value) VALUES ($1, 1) ON CONFLICT (stat_key) DO UPDATE SET stat_value = stats.stat_value + 1',
            ['login_count']
        );

        const token = signToken({ id: user.id, username: user.username, role: user.role });

        return ok(res, {
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                createdAt: user.created_at
            }
        });
    } catch (err) {
        handleError(res, err);
    }
}
