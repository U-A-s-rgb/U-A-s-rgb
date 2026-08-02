/* ============================================================
 *  api/health.js  —  健康检查 + API 信息
 *  GET /api/health
 * ============================================================ */

const { ok } = require('../lib/response');

export default async function handler(req, res) {
    return ok(res, {
        name: '我的世界网易版指令纠错神器',
        version: '1.0.0',
        status: 'ok',
        timestamp: new Date().toISOString()
    });
}
