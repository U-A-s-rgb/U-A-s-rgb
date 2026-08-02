/* ============================================================
 *  lib/response.js  —  统一响应格式 & 错误处理
 * ============================================================ */

function send(res, status, body) {
    res.status(status).json(body);
}

function ok(res, data = null) {
    send(res, 200, { ok: true, data });
}

function created(res, data = null) {
    send(res, 201, { ok: true, data });
}

function error(res, status, message, code) {
    send(res, status, { ok: false, error: { message, code } });
}

function handleError(res, err) {
    const status = err.statusCode || 500;
    const msg = process.env.NODE_ENV === 'production'
        ? (status >= 500 ? '服务器内部错误' : err.message)
        : err.message;
    error(res, status, msg, err.code);
}

module.exports = { ok, created, error, handleError, send };
