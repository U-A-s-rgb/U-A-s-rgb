/* ============================================================
 *  api/register.js  —  用户注册
 *  POST /api/register  { username, password }
 * ============================================================ */

const { query, initDb } = require('../lib/db');
const { hashPassword, signToken } = require('../lib/auth');
const { ok, error, handleError } = require('../lib/response');

let initialized = false;

export default async function handler(req, res) {
    try {
        if (!initialized) { await initDb(); initialized = true; }

        if (req.method !== 'POST') {
            return error(res, 405, '方法不允许');
        }

        const { username, password } = req.body || {};

        if (!username || typeof username !== 'string') {
            return error(res, 400, '用户名不能为空');
        }
        if (username.length < 2 || username.length > 32) {
            return error(res, 400, '用户名长度需为 2-32 位');
        }
        if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(username)) {
            return error(res, 400, '用户名只能包含中英文、数字、下划线');
        }
        if (!password || typeof password !== 'string') {
            return error(res, 400, '密码不能为空');
        }
        if (password.length < 6 || password.length > 64) {
            return error(res, 400, '密码长度需为 6-64 位');
        }

        const existing = await query('SELECT id FROM users WHERE username = $1', [username]);
        if (existing.rows.length > 0) {
            return error(res, 409, '该用户名已被注册');
        }

        const hash = await hashPassword(password);
        const result = await query(
            'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING id, username, role, created_at',
            [username, hash, 'user']
        );

        const user = result.rows[0];
        const token = signToken({ id: user.id, username: user.username, role: user.role });

        await query(
            'INSERT INTO stats (stat_key, stat_value) VALUES ($1, 1) ON CONFLICT (stat_key) DO UPDATE SET stat_value = stats.stat_value + 1',
            ['register_count']
        );

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
