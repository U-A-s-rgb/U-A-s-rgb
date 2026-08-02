/* ============================================================
 *  app.js  —  应用主逻辑：事件绑定、结果渲染、交互
 * ============================================================ */

(function () {
    const $ = sel => document.querySelector(sel);
    const validator = window.MCValidator;
    const generator = window.MCGenerator;
    const { SAMPLE_PROMPTS } = window.MCData;

    /* ---------- Toast ---------- */
    let toastTimer = null;
    function toast(msg, type) {
        const el = $('#toast');
        el.textContent = msg;
        el.className = 'toast show' + (type ? ' ' + type : '');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => { el.className = 'toast'; }, 2200);
    }

    /* ---------- 复制到剪贴板 ---------- */
    async function copyText(text, btn) {
        try {
            await navigator.clipboard.writeText(text);
        } catch (e) {
            // 降级方案
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand('copy'); } catch (e2) { }
            document.body.removeChild(ta);
        }
        if (btn) {
            const old = btn.textContent;
            btn.textContent = '✓ 已复制';
            btn.classList.add('copied');
            setTimeout(() => { btn.textContent = old; btn.classList.remove('copied'); }, 1500);
        } else {
            toast('已复制到剪贴板', 'success');
        }
    }

    /* ---------- 左侧：指令纠错 ---------- */
    function doValidate() {
        const input = $('#cmdInput').value;
        const strict = $('#strictMode').checked;
        if (!input.trim()) {
            $('#validateResult').innerHTML = '<div class="result-placeholder">请先输入要纠错的指令</div>';
            return;
        }
        const result = validator.validate(input, { strict });
        $('#validateResult').innerHTML = validator.renderResult(result);
        bindFixButtons();
    }

    function bindFixButtons() {
        document.querySelectorAll('.issue-fix').forEach(btn => {
            btn.addEventListener('click', () => {
                const fix = btn.getAttribute('data-fix');
                const whole = btn.getAttribute('data-whole') === '1';
                const input = $('#cmdInput');
                if (whole) {
                    input.value = fix;
                } else {
                    // 替换第一个错误token（简单实现：直接整体替换为fix）
                    input.value = fix;
                }
                toast('已应用修复，正在重新校验…', 'success');
                doValidate();
            });
        });
    }

    $('#validateBtn').addEventListener('click', doValidate);
    $('#clearBtn').addEventListener('click', () => {
        $('#cmdInput').value = '';
        $('#validateResult').innerHTML = '<div class="result-placeholder">校验结果会显示在这里…</div>';
        $('#cmdInput').focus();
    });
    // Ctrl+Enter 快捷校验
    $('#cmdInput').addEventListener('keydown', e => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); doValidate(); }
    });

    /* ---------- 右侧：指令生成 ---------- */
    let wikiAbort = null;

    async function doGenerate() {
        const input = $('#effectInput').value;
        if (!input.trim()) {
            $('#generateResult').innerHTML = '<div class="result-placeholder">请先描述你想要的效果</div>';
            return;
        }
        const useNet = $('#useNetSearch').checked;
        const genResult = generator.generate(input);

        // 立即显示本地结果
        $('#generateResult').innerHTML = generator.renderGenResult(genResult, null);
        bindCopyButtons();

        // 联网搜索补充
        const netStatus = $('#netStatus');
        if (useNet) {
            if (wikiAbort) wikiAbort.abort();
            wikiAbort = new AbortController();
            netStatus.textContent = '正在联网搜索…';
            netStatus.className = 'net-status searching';

            // 选搜索关键词：优先识别到的ID/意图，否则用原文
            const s = genResult.semantic;
            let kw = s.item || s.entity || s.effect || s.enchant || s.block || s.weather || s.mode || s.intent || input;
            const wiki = await generator.searchWiki(kw, wikiAbort.signal);

            if (wiki && wiki.aborted) return;
            // 重新渲染（本地结果 + Wiki）
            $('#generateResult').innerHTML = generator.renderGenResult(genResult, wiki);
            bindCopyButtons();

            if (wiki && wiki.error) {
                netStatus.textContent = '联网失败（离线模式）';
                netStatus.className = 'net-status offline';
            } else if (wiki && wiki.items && wiki.items.length) {
                netStatus.textContent = `已搜索到 ${wiki.items.length} 条Wiki条目`;
                netStatus.className = 'net-status online';
            } else {
                netStatus.textContent = '未找到相关Wiki条目';
                netStatus.className = 'net-status offline';
            }
        } else {
            netStatus.textContent = '已关闭联网搜索';
            netStatus.className = 'net-status offline';
        }
    }

    function bindCopyButtons() {
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const cmd = btn.getAttribute('data-cmd');
                copyText(cmd, btn);
            });
        });
    }

    $('#generateBtn').addEventListener('click', doGenerate);
    $('#effectInput').addEventListener('keydown', e => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); doGenerate(); }
    });

    /* ---------- 随机示例 ---------- */
    $('#surpriseBtn').addEventListener('click', () => {
        const sample = SAMPLE_PROMPTS[Math.floor(Math.random() * SAMPLE_PROMPTS.length)];
        $('#effectInput').value = sample;
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

    /* ---------- 初始网络状态 ---------- */
    if (navigator.onLine) {
        $('#netStatus').textContent = '联网搜索已就绪';
        $('#netStatus').className = 'net-status online';
    } else {
        $('#netStatus').textContent = '当前处于离线状态';
        $('#netStatus').className = 'net-status offline';
    }

    /* ---------- 预填示例（首次访问） ---------- */
    if (!$('#cmdInput').value) {
        $('#cmdInput').value = '/give @p diamond_sword 1';
    }
})();
