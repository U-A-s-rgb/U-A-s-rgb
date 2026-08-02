/* ============================================================
 *  lib/auth.js  —  JWT 签发 / 校验 + 密码哈希
 * ============================================================ */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'mc-cmd-fixer-dev-secret-change-me';
const JWT_EXPIRES_IN = '7d';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Hu720702';

async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

async function verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
}

function signToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (e) {
        return null;
    }
}

function authMiddleware(req) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return null;
    return verifyToken(token);
}

function requireAuth(req) {
    const user = authMiddleware(req);
    if (!user) {
        const err = new Error('未登录或登录已过期');
        err.statusCode = 401;
        throw err;
    }
    return user;
}

function requireAdmin(req) {
    const user = requireAuth(req);
    if (user.role !== 'admin') {
        const err = new Error('需要管理员权限');
        err.statusCode = 403;
        throw err;
    }
    return user;
}

module.exports = {
    hashPassword, verifyPassword,
    signToken, verifyToken,
    authMiddleware, requireAuth, requireAdmin,
    ADMIN_PASSWORD
};
