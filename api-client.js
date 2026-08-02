/* ============================================================
 *  api-client.js  —  前端 API 客户端
 *  所有后端请求都走这里，自动携带 JWT、处理错误
 * ============================================================ */

(function () {
    const API_BASE = '';

    const TOKEN_KEY = 'mc_token';
    const USER_KEY = 'mc_user';

    function getToken() { return localStorage.getItem(TOKEN_KEY); }
    function setToken(t) {
        if (t) localStorage.setItem(TOKEN_KEY, t);
        else localStorage.removeItem(TOKEN_KEY);
    }
    function getUser() {
        try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); }
        catch (e) { return null; }
    }
    function setUser(u) {
        if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
        else localStorage.removeItem(USER_KEY);
    }
    function clearAuth() {
        setToken(null);
        setUser(null);
    }

    async function request(path, options) {
        const opts = {
            headers: { 'Content-Type': 'application/json' },
            ...options
        };
        const token = getToken();
        if (token) {
            opts.headers['Authorization'] = 'Bearer ' + token;
        }

        try {
            const res = await fetch(API_BASE + path, opts);
            const data = await res.json().catch(() => ({}));
            return { ok: res.ok, status: res.status, data };
        } catch (e) {
            return { ok: false, status: 0, data: { error: { message: '网络错误，请检查连接' } } };
        }
    }

    const api = {
        async register(username, password) {
            return request('/api/register', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });
        },
        async login(username, password) {
            return request('/api/login', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });
        },
        async adminLogin(password) {
            return request('/api/admin-login', {
                method: 'POST',
                body: JSON.stringify({ password })
            });
        },
        async me() {
            return request('/api/me');
        },
        async adminUsers() {
            return request('/api/admin-users');
        },
        async adminBan(id, ban) {
            return request('/api/admin-users/ban', {
                method: 'POST',
                body: JSON.stringify({ id, ban })
            });
        },
        async adminResetPassword(id, newPassword) {
            return request('/api/admin-users/reset', {
                method: 'POST',
                body: JSON.stringify({ id, newPassword })
            });
        },
        async adminDeleteUser(id) {
            return request('/api/admin-users/' + id, { method: 'DELETE' });
        },
        async stats() {
            return request('/api/stats');
        },
        async health() {
            return request('/api/health');
        }
    };

    window.MCAPIClient = {
        api, getToken, setToken, getUser, setUser, clearAuth,
        isLoggedIn() { return !!getToken(); },
        isAdmin() {
            const u = getUser();
            return u && u.role === 'admin';
        },
        saveSession(data) {
            if (data.token) setToken(data.token);
            if (data.user) setUser(data.user);
        }
    };
})();
