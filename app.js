/* ============================================================
 *  app.js  —  应用主逻辑（含登录/管理员集成）
 * ============================================================ */

(function () {
    const $ = sel => document.querySelector(sel);
    const api = window.MCAPIClient;

    /* ---------- Toast ---------- */
    let toastTimer = null;
    function toast(msg, type) {
        const el = $('#toast');
        el.textContent = msg;
        el.className = 'toast show' + (type ? ' ' + type : '');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => { el.className = 'toast'; }, 2200);
    }

    /* ---------- 登录/注册/管理员 切换 ---------- */
    const authOverlay = $('#authOverlay');
    const authForms = {
        login: $('#loginForm'),
        register: $('#registerForm'),
        admin: $('#adminForm')
    };

    function showAuthTab(tab) {
        Object.values(authForms).forEach(f => f.classList.remove('active'));
        authForms[tab].classList.add('active');
        document.querySelectorAll('.auth-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.tab === tab);
        });
        // 清空错误
        ['loginError', 'registerError', 'adminError'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = '';
        });
    }

    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => showAuthTab(tab.dataset.tab));
    });

    document.querySelectorAll('[data-goto]').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            showAuthTab(link.dataset.goto);
        });
    });

    function showAuth(initialTab) {
        showAuthTab(initialTab || 'login');
        authOverlay.classList.add('show');
    }
    function hideAuth() {
        authOverlay.classList.remove('show');
    }

    /* ---------- 登录表单 ---------- */
    authForms.login.addEventListener('submit', async e => {
        e.preventDefault();
        const form = e.target;
        const username = form.username.value.trim();
        const password = form.password.value;
        const errEl = $('#loginError');

        errEl.textContent = '';
        const res = await api.api.login(username, password);
        if (!res.ok) {
            errEl.textContent = res.data?.error?.message || '登录失败';
            return;
        }
        api.saveSession(res.data);
        hideAuth();
        updateUserBar();
        toast('登录成功', 'success');
    });

    /* ---------- 注册表单 ---------- */
    authForms.register.addEventListener('submit', async e => {
        e.preventDefault();
        const form = e.target;
        const username = form.username.value.trim();
        const password = form.password.value;
        const password2 = form.password2.value;
        const errEl = $('#registerError');

        errEl.textContent = '';
        if (password !== password2) {
            errEl.textContent = '两次密码不一致';
            return;
        }

        const res = await api.api.register(username, password);
        if (!res.ok) {
            errEl.textContent = res.data?.error?.message || '注册失败';
            return;
        }
        api.saveSession(res.data);
        hideAuth();
        updateUserBar();
        toast('注册成功，欢迎加入！', 'success');
    });

    /* ---------- 管理员表单 ---------- */
    authForms.admin.addEventListener('submit', async e => {
        e.preventDefault();
        const form = e.target;
        const password = form.adminPassword.value;
        const errEl = $('#adminError');

        errEl.textContent = '';
        const res = await api.api.adminLogin(password);
        if (!res.ok) {
            errEl.textContent = res.data?.error?.message || '管理员登录失败';
            return;
        }
        api.saveSession(res.data);
        hideAuth();
        updateUserBar();
        toast('管理员登录成功', 'success');
        openAdminPanel();
    });

    /* ---------- 顶部用户栏 ---------- */
    function updateUserBar() {
        const user = api.getUser();
        if (!user) {
            $('#userBar').classList.add('hidden');
            $('#loginBtn').classList.remove('hidden');
            $('#adminBtn').classList.add('hidden');
            return;
        }
        $('#userBar').classList.remove('hidden');
        $('#loginBtn').classList.add('hidden');
        $('#userAvatar').textContent = user.username.charAt(0).toUpperCase();
        $('#userName').textContent = user.username;

        const badge = $('#userBadge');
        badge.classList.remove('admin');
        badge.textContent = '';
        if (user.role === 'admin') {
            badge.classList.add('admin');
            badge.textContent = '管理员';
            $('#adminBtn').classList.remove('hidden');
        } else {
            $('#adminBtn').classList.add('hidden');
        }
    }

    $('#loginBtn').addEventListener('click', () => showAuth('login'));
    $('#logoutBtn').addEventListener('click', () => {
        api.clearAuth();
        updateUserBar();
        toast('已退出登录', 'success');
    });

    /* ---------- 管理员面板 ---------- */
    const adminPanel = $('#adminPanel');

    async function openAdminPanel() {
        if (!api.isAdmin()) {
            toast('需要管理员权限', 'error');
            return;
        }
        adminPanel.classList.remove('hidden');
        await loadAdminData();
    }
    function closeAdminPanel() {
        adminPanel.classList.add('hidden');
    }
    $('#adminBtn').addEventListener('click', openAdminPanel);
    $('#adminClose').addEventListener('click', closeAdminPanel);
    $('#adminRefresh').addEventListener('click', loadAdminData);

    async function loadAdminData() {
        const statsRes = await api.api.stats();
        if (statsRes.ok) {
            const s = statsRes.data;
            const st = s.stats || {};
            $('#statUsers').textContent = s.userCount ?? '-';
            $('#statLogins').textContent = st.login_count || 0;
            $('#statCmds').textContent = (st.cmd_validations || 0) + (st.cmd_generations || 0);
            $('#statBanned').textContent = s.bannedCount ?? 0;
        }

        const usersRes = await api.api.adminUsers();
        if (usersRes.ok) {
            const tbody = $('#adminUserList');
            const users = usersRes.data.users || [];
            if (users.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="loading">暂无用户</td></tr>';
                return;
            }
            tbody.innerHTML = users.map(u => {
                const role = u.role === 'admin'
                    ? '<span class="role-badge admin">管理员</span>'
                    : '<span class="role-badge user">用户</span>';
                const status = u.is_banned
                    ? '<span class="status-badge banned">已封禁</span>'
                    : '<span class="status-badge active">正常</span>';
                const canEdit = u.role !== 'admin';
                return `
                    <tr data-id="${u.id}">
                        <td>${u.id}</td>
                        <td>${u.username}</td>
                        <td>${role}</td>
                        <td>${formatTime(u.created_at)}</td>
                        <td>${formatTime(u.last_login)}</td>
                        <td>${status}</td>
                        <td>
                            <div class="admin-ops">
                                ${canEdit ? `<button class="btn-ban" data-id="${u.id}" data-banned="${u.is_banned}">${u.is_banned ? '解封' : '封禁'}</button>` : '<span style="color:var(--text-muted)">-</span>'}
                                ${canEdit ? `<button class="btn-reset warn" data-id="${u.id}">重置密码</button>` : ''}
                                ${canEdit ? `<button class="btn-del danger" data-id="${u.id}">删除</button>` : ''}
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');

            tbody.querySelectorAll('.btn-ban').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const id = btn.dataset.id;
                    const banned = btn.dataset.banned === 'true';
                    if (!confirm(banned ? '确定解封该用户？' : '确定封禁该用户？')) return;
                    const res = await api.api.adminBan(id, !banned);
                    if (res.ok) { toast('操作成功', 'success'); await loadAdminData(); }
                    else toast(res.data?.error?.message || '操作失败', 'error');
                });
            });
            tbody.querySelectorAll('.btn-del').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const id = btn.dataset.id;
                    if (!confirm('确定删除该用户？此操作不可恢复！')) return;
                    const res = await api.api.adminDeleteUser(id);
                    if (res.ok) { toast('已删除', 'success'); await loadAdminData(); }
                    else toast(res.data?.error?.message || '删除失败', 'error');
                });
            });
            tbody.querySelectorAll('.btn-reset').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const id = btn.dataset.id;
                    const newPwd = prompt('请输入新密码（至少6位）：');
                    if (!newPwd) return;
                    if (newPwd.length < 6) { toast('密码至少6位', 'error'); return; }
                    const res = await api.api.adminResetPassword(id, newPwd);
                    if (res.ok) toast('密码已重置', 'success');
                    else toast(res.data?.error?.message || '重置失败', 'error');
                });
            });
        }
    }

    function formatTime(iso) {
        if (!iso) return '-';
        const d = new Date(iso);
        const pad = n => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }

    /* ---------- 指令纠错 ---------- */
    async function doValidate() {
        const input = $('#cmdInput').value;
        const strict = $('#strictMode').checked;
        if (!input.trim()) {
            $('#validateResult').innerHTML = '<div class="result-placeholder">请先输入要纠错的指令</div>';
            return;
        }
        const result = window.MCValidator.validate(input, { strict });
        $('#validateResult').innerHTML = window.MCValidator.renderResult(result);
        bindFixButtons();

        // 上报校验统计（静默失败）
        try {
            await fetch('/api/stats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (e) {}
    }

    function bindFixButtons() {
        document.querySelectorAll('.issue-fix').forEach(btn => {
            btn.addEventListener('click', () => {
                const fix = btn.getAttribute('data-fix');
                $('#cmdInput').value = fix;
                toast('已应用修复', 'success');
                doValidate();
            });
        });
    }

    $('#validateBtn').addEventListener('click', doValidate);
    $('#clearBtn').addEventListener('click', () => {
        $('#cmdInput').value = '';
        $('#validateResult').innerHTML = '<div class="result-placeholder">校验结果会显示在这里…</div>';
    });
    $('#cmdInput').addEventListener('keydown', e => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); doValidate(); }
    });

    /* ---------- 指令生成 ---------- */
    let wikiAbort = null;

    async function doGenerate() {
        const input = $('#effectInput').value;
        if (!input.trim()) {
            $('#generateResult').innerHTML = '<div class="result-placeholder">请先描述你想要的效果</div>';
            return;
        }
        const useNet = $('#useNetSearch').checked;
        const genResult = window.MCGenerator.generate(input);
        $('#generateResult').innerHTML = window.MCGenerator.renderGenResult(genResult, null);
        bindCopyButtons();

        const netStatus = $('#netStatus');
        if (useNet) {
            if (wikiAbort) wikiAbort.abort();
            wikiAbort = new AbortController();
            netStatus.textContent = '联网搜索中…';
            netStatus.className = 'net-status searching';

            const s = genResult.semantic;
            let kw = s.item || s.entity || s.effect || s.enchant || s.block || s.weather || s.mode || s.intent || input;
            const wiki = await window.MCGenerator.searchWiki(kw, wikiAbort.signal);
            if (wiki && wiki.aborted) return;
            $('#generateResult').innerHTML = window.MCGenerator.renderGenResult(genResult, wiki);
            bindCopyButtons();

            if (wiki && wiki.error) {
                netStatus.textContent = '联网失败';
                netStatus.className = 'net-status offline';
            } else if (wiki && wiki.items && wiki.items.length) {
                netStatus.textContent = `找到 ${wiki.items.length} 条Wiki条目`;
                netStatus.className = 'net-status online';
            } else {
                netStatus.textContent = '未找到相关Wiki';
                netStatus.className = 'net-status offline';
            }
        } else {
            netStatus.textContent = '已关闭联网搜索';
            netStatus.className = 'net-status offline';
        }
    }

    function bindCopyButtons() {
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const cmd = btn.getAttribute('data-cmd');
                try {
                    await navigator.clipboard.writeText(cmd);
                } catch (e) {
                    const ta = document.createElement('textarea');
                    ta.value = cmd;
                    ta.style.position = 'fixed';
                    ta.style.opacity = '0';
                    document.body.appendChild(ta);
                    ta.select();
                    try { document.execCommand('copy'); } catch (e2) {}
                    document.body.removeChild(ta);
                }
                const old = btn.textContent;
                btn.textContent = '✓ 已复制';
                btn.classList.add('copied');
                setTimeout(() => { btn.textContent = old; btn.classList.remove('copied'); }, 1500);
            });
        });
    }

    $('#generateBtn').addEventListener('click', doGenerate);
    $('#effectInput').addEventListener('keydown', e => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); doGenerate(); }
    });

    $('#surpriseBtn').addEventListener('click', () => {
        const samples = window.MCData.SAMPLE_PROMPTS;
        $('#effectInput').value = samples[Math.floor(Math.random() * samples.length)];
        doGenerate();
    });

    /* ---------- 主题切换 ---------- */
    const themeBtn = $('#themeToggle');
    const savedTheme = localStorage.getItem('mc-theme') || 'dark';
    if (savedTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        themeBtn.textContent = '☀️';
    }
    themeBtn.addEventListener('click', () => {
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        if (isLight) {
            document.documentElement.removeAttribute('data-theme');
            themeBtn.textContent = '🌙';
            localStorage.setItem('mc-theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            themeBtn.textContent = '☀️';
            localStorage.setItem('mc-theme', 'light');
        }
    });

    /* ---------- 初始化 ---------- */
    function init() {
        updateUserBar();
        if (!api.isLoggedIn()) {
            // 未登录自动显示登录框
            showAuth('login');
        }
        // 预填示例
        if (!$('#cmdInput').value) {
            $('#cmdInput').value = '/give @p diamond_sword 1';
        }
        // 检查网络状态
        const netStatus = $('#netStatus');
        if (navigator.onLine) {
            netStatus.textContent = '联网已就绪';
            netStatus.className = 'net-status online';
        } else {
            netStatus.textContent = '离线模式';
            netStatus.className = 'net-status offline';
        }
    }

    init();
})();
