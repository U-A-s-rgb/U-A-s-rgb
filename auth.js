/* ============================================================
 *  auth.js  —  用户登录 / 注册 / 会话管理
 *  说明：纯前端模拟（localStorage），非真实安全认证。
 *  适合"看起来正规"的展示场景，请勿存储真实敏感密码。
 * ============================================================ */

(function () {
    const STORAGE_KEYS = {
        USERS: 'mc_users',
        CURRENT: 'mc_current_user',
        ADMIN: 'mc_admin_session',
        STATS: 'mc_stats'
    };

    /* ---------- 管理员密码 ---------- */
    // 大H 小u 720702
    const ADMIN_PASSWORD = 'Hu720702';

    /* ---------- 简单哈希（仅用于避免明文直接可见，非加密） ---------- */
    function simpleHash(str) {
        let h = 0;
        for (let i = 0; i < str.length; i++) {
            h = ((h << 5) - h) + str.charCodeAt(i);
            h |= 0;
        }
        return 'h' + (h >>> 0).toString(16);
    }

    /* ---------- 用户数据读写 ---------- */
    function getUsers() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]'); }
        catch (e) { return []; }
    }
    function saveUsers(users) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }

    /* ---------- 统计数据 ---------- */
    function getStats() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.STATS) || '{}');
        } catch (e) { return {}; }
    }
    function saveStats(stats) {
        localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
    }
    function bumpStat(key) {
        const s = getStats();
        s[key] = (s[key] || 0) + 1;
        s.lastActive = Date.now();
        saveStats(s);
    }

    /* ---------- 当前登录用户 ---------- */
    function getCurrentUser() {
        const username = localStorage.getItem(STORAGE_KEYS.CURRENT);
        if (!username) return null;
        const users = getUsers();
        return users.find(u => u.username === username) || null;
    }
    function setCurrentUser(username) {
        if (username) localStorage.setItem(STORAGE_KEYS.CURRENT, username);
        else localStorage.removeItem(STORAGE_KEYS.CURRENT);
    }

    /* ---------- 校验用户名/密码 ---------- */
    function validateUsername(name) {
        if (!name) return '用户名不能为空';
        if (name.length < 2 || name.length > 16) return '用户名长度需为 2-16 位';
        if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(name)) return '用户名只能包含中英文、数字、下划线';
        return null;
    }
    function validatePassword(pwd) {
        if (!pwd) return '密码不能为空';
        if (pwd.length < 6) return '密码至少 6 位';
        if (pwd.length > 32) return '密码最多 32 位';
        return null;
    }

    /* ---------- 注册 ---------- */
    function register(username, password) {
        const ue = validateUsername(username);
        if (ue) return { ok: false, error: ue };
        const pe = validatePassword(password);
        if (pe) return { ok: false, error: pe };

        const users = getUsers();
        if (users.some(u => u.username === username)) {
            return { ok: false, error: '该用户名已被注册' };
        }
        const user = {
            username,
            passwordHash: simpleHash(password),
            createdAt: Date.now(),
            lastLogin: Date.now(),
            role: 'user'
        };
        users.push(user);
        saveUsers(users);
        setCurrentUser(username);
        bumpStat('registerCount');
        return { ok: true, user: { username, createdAt: user.createdAt, role: 'user' } };
    }

    /* ---------- 登录 ---------- */
    function login(username, password) {
        const users = getUsers();
        const user = users.find(u => u.username === username);
        if (!user) return { ok: false, error: '用户不存在，请先注册' };
        if (user.passwordHash !== simpleHash(password)) {
            return { ok: false, error: '密码错误' };
        }
        user.lastLogin = Date.now();
        saveUsers(users);
        setCurrentUser(username);
        bumpStat('loginCount');
        return { ok: true, user: { username, createdAt: user.createdAt, role: user.role || 'user' } };
    }

    /* ---------- 登出 ---------- */
    function logout() {
        setCurrentUser(null);
    }

    /* ---------- 管理员登录 ---------- */
    function adminLogin(password) {
        if (password === ADMIN_PASSWORD) {
            const token = simpleHash(ADMIN_PASSWORD + Date.now());
            const session = { token, loginAt: Date.now(), expires: Date.now() + 1000 * 60 * 60 }; // 1小时
            localStorage.setItem(STORAGE_KEYS.ADMIN, JSON.stringify(session));
            bumpStat('adminLoginCount');
            return { ok: true, session };
        }
        return { ok: false, error: '管理员密码错误' };
    }
    function isAdmin() {
        try {
            const s = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN) || 'null');
            if (!s) return false;
            if (Date.now() > s.expires) {
                localStorage.removeItem(STORAGE_KEYS.ADMIN);
                return false;
            }
            return true;
        } catch (e) { return false; }
    }
    function adminLogout() {
        localStorage.removeItem(STORAGE_KEYS.ADMIN);
    }

    /* ---------- 管理员操作 ---------- */
    function deleteUser(username) {
        const users = getUsers();
        const filtered = users.filter(u => u.username !== username);
        if (filtered.length === users.length) return { ok: false, error: '用户不存在' };
        saveUsers(filtered);
        // 如果删的是当前登录用户，也登出
        if (localStorage.getItem(STORAGE_KEYS.CURRENT) === username) {
            setCurrentUser(null);
        }
        return { ok: true };
    }
    function resetUserPassword(username, newPwd) {
        const pe = validatePassword(newPwd);
        if (pe) return { ok: false, error: pe };
        const users = getUsers();
        const u = users.find(x => x.username === username);
        if (!u) return { ok: false, error: '用户不存在' };
        u.passwordHash = simpleHash(newPwd);
        saveUsers(users);
        return { ok: true };
    }
    function clearAllData() {
        localStorage.removeItem(STORAGE_KEYS.USERS);
        localStorage.removeItem(STORAGE_KEYS.CURRENT);
        localStorage.removeItem(STORAGE_KEYS.ADMIN);
        localStorage.removeItem(STORAGE_KEYS.STATS);
        return { ok: true };
    }

    /* ---------- 时间格式化 ---------- */
    function formatTime(ts) {
        if (!ts) return '-';
        const d = new Date(ts);
        const pad = n => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }

    /* ---------- 导出 ---------- */
    window.MCAuth = {
        register, login, logout,
        adminLogin, isAdmin, adminLogout,
        getCurrentUser, getUsers, getStats,
        deleteUser, resetUserPassword, clearAllData,
        bumpStat, formatTime,
        ADMIN_PASSWORD // 暴露用于提示，实际校验在 adminLogin 内
    };
})();
