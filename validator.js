/* ============================================================
 *  validator.js  —  网易版/基岩版指令本地校验引擎
 *  100% 在浏览器本地运行，不发任何请求
 * ============================================================ */

(function () {
    const {
        ALIAS, ENTITY_IDS, ITEM_IDS, BLOCK_IDS, EFFECT_IDS, ENCHANT_IDS,
        GAMERULES, COMMAND_SPECS
    } = window.MCData;

    /* ---------- 工具：转义HTML ---------- */
    function esc(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    /* ---------- 切分指令为 token（保留位置） ----------
     *  支持：空格分隔、引号字符串、花括号NBT
     */
    function tokenize(cmd) {
        const tokens = [];
        let i = 0;
        const n = cmd.length;
        while (i < n) {
            // 跳过空白
            while (i < n && /\s/.test(cmd[i])) i++;
            if (i >= n) break;
            const start = i;
            // 引号字符串
            if (cmd[i] === '"' || cmd[i] === "'") {
                const q = cmd[i++];
                while (i < n && cmd[i] !== q) {
                    if (cmd[i] === '\\' && i + 1 < n) i += 2;
                    else i++;
                }
                if (i < n) i++; // 吃掉结尾引号
                tokens.push({ text: cmd.slice(start, i), start, end: i });
                continue;
            }
            // 花括号 NBT { ... }
            if (cmd[i] === '{') {
                let depth = 0;
                while (i < n) {
                    if (cmd[i] === '{') depth++;
                    else if (cmd[i] === '}') { depth--; if (depth === 0) { i++; break; } }
                    else if (cmd[i] === '"') {
                        i++;
                        while (i < n && cmd[i] !== '"') { if (cmd[i] === '\\') i++; i++; }
                    }
                    i++;
                }
                tokens.push({ text: cmd.slice(start, i), start, end: i });
                continue;
            }
            // 方括号选择器参数 [ ... ]
            if (cmd[i] === '[') {
                let depth = 0;
                while (i < n) {
                    if (cmd[i] === '[') depth++;
                    else if (cmd[i] === ']') { depth--; if (depth === 0) { i++; break; } }
                    i++;
                }
                // 把方括号并入前一个 token（选择器）
                if (tokens.length > 0 && /^@[pars]\{?$/.test(tokens[tokens.length - 1].text)) {
                    const prev = tokens[tokens.length - 1];
                    prev.text = cmd.slice(prev.start, i);
                    prev.end = i;
                } else {
                    tokens.push({ text: cmd.slice(start, i), start, end: i });
                }
                continue;
            }
            // 普通token
            while (i < n && !/\s/.test(cmd[i]) && cmd[i] !== '"' && cmd[i] !== "'"
                && cmd[i] !== '{' && cmd[i] !== '[') {
                i++;
            }
            tokens.push({ text: cmd.slice(start, i), start, end: i });
        }
        return tokens;
    }

    /* ---------- 剥离 minecraft: 前缀 ---------- */
    function stripNS(id) {
        if (!id) return id;
        return id.startsWith('minecraft:') ? id.slice(10) : id;
    }

    /* ---------- 校验目标选择器 @p[name=xx,r=10] ---------- */
    function checkSelector(token, strict) {
        const issues = [];
        const t = token.text;
        const m = t.match(/^@(p|a|s|e|r)(\[(.*)\])?$/);
        if (!m) {
            // 不是选择器，可能是玩家名
            if (/^[a-zA-Z0-9_]{1,16}$/.test(t) || /"|'/.test(t)) {
                return { issues, type: 'player' };
            }
            return null; // 既不是选择器也不是合法玩家名
        }
        const [, sel, , params] = m;
        if (params) {
            // 拆分参数
            const parts = params.split(',').map(p => p.trim()).filter(Boolean);
            const validKeys = ['name', 'type', 'r', 'rm', 'c', 'm', 'l', 'lm',
                'scores', 'tag', 'dx', 'dy', 'dz', 'x', 'y', 'z', 'family',
                'hasitem', 'haspermission'];
            parts.forEach(part => {
                const eq = part.indexOf('=');
                if (eq === -1) {
                    issues.push({ type: 'error', title: '选择器参数格式错误',
                        detail: `参数 <code>${esc(part)}</code> 缺少 <code>=</code>，正确格式如 <code>type=zombie</code>。`,
                        token });
                    return;
                }
                const key = part.slice(0, eq).trim().toLowerCase();
                const val = part.slice(eq + 1).trim();
                if (!validKeys.includes(key)) {
                    issues.push({ type: 'error', title: '未知的选择器参数',
                        detail: `<code>${esc(key)}</code> 不是基岩版支持的选择器参数。常用：<code>type, name, r, rm, c, tag, scores</code>。`,
                        token });
                }
                // r/rm/dx/dy/dz/c/l/lm 应为数字
                if (['r', 'rm', 'c', 'l', 'lm', 'dx', 'dy', 'dz'].includes(key)) {
                    if (!/^-?\d+$/.test(val)) {
                        issues.push({ type: 'error', title: '选择器参数应为整数',
                            detail: `<code>${esc(key)}</code> 的值应为整数，当前为 <code>${esc(val)}</code>。`,
                            token });
                    }
                }
                // type 应为合法实体ID
                if (key === 'type') {
                    const id = stripNS(val.toLowerCase());
                    if (!ENTITY_IDS.has(id) && strict) {
                        issues.push({ type: 'warn', title: '可能无效的实体类型',
                            detail: `<code>type=${esc(val)}</code> 中的实体ID <code>${esc(id)}</code> 不在常用实体列表中，请确认拼写。`,
                            token });
                    }
                }
            });
        }
        return { issues, type: 'selector' };
    }

    /* ---------- 校验坐标 ---------- */
    function isCoord(str) {
        // 单个坐标分量：~ / ~5 / ~-3 / ^ / ^5 / 12.5 / -3
        return /^(\^?-?\d*\.?\d+|~$|~-?\d*\.?\d*$|\^-?\d*\.?\d*$)$/.test(str);
    }
    function isCoordTriple(a, b, c) {
        return isCoord(a) && isCoord(b) && isCoord(c);
    }

    /* ---------- 校验整数/小数 ---------- */
    function isInt(s) { return /^-?\d+$/.test(s); }
    function isFloat(s) { return /^-?\d*\.?\d+$/.test(s); }
    function isBool(s) { return s === 'true' || s === 'false'; }

    /* ---------- 校验JSON/NBT ---------- */
    function isJSON(s) {
        if (!s.startsWith('{')) return false;
        try { JSON.parse(s); return true; } catch (e) {
            // NBT 可能不是严格JSON（如 powered:1b），宽松判断
            return /^\{.*\}$/.test(s);
        }
    }

    /* ---------- 主校验函数 ---------- */
    function validate(rawCmd, options) {
        const strict = !!(options && options.strict);
        const issues = [];
        const tokens = []; // 高亮用：{text, type, start, end}

        if (!rawCmd || !rawCmd.trim()) {
            return { ok: false, issues: [{ type: 'error', title: '空输入',
                detail: '请输入要校验的指令。' }], tokens: [], raw: '' };
        }

        let cmd = rawCmd.trim();
        // 检查前导 /
        if (!cmd.startsWith('/')) {
            issues.push({ type: 'warn', title: '缺少指令前缀',
                detail: '命令方块里的指令通常以 <code>/</code> 开头。虽然命令方块中可省略，但加上更规范。',
                fix: '/' + cmd, wholeCmd: true });
        } else {
            cmd = cmd.slice(1);
        }

        const toks = tokenize(cmd);
        if (toks.length === 0) {
            issues.push({ type: 'error', title: '指令为空',
                detail: '只检测到前缀 <code>/</code>，没有命令内容。' });
            return { ok: false, issues, tokens: [{ text: '/', type: 'warn', start: 0, end: 1 }], raw: rawCmd };
        }

        const cmdName = toks[0].text.toLowerCase();
        tokens.push({ text: toks[0].text, type: 'tok', start: toks[0].start, end: toks[0].end, kind: 'cmd' });

        const spec = COMMAND_SPECS[cmdName];
        if (!spec) {
            // 未知命令：尝试给建议
            const suggestion = suggestCommand(cmdName);
            issues.push({
                type: 'error', title: '未知命令',
                detail: `<code>${esc(cmdName)}</code> 不是有效的基岩版/网易版命令。${suggestion}`,
                token: toks[0]
            });
            toks.slice(1).forEach(t => tokens.push({ text: t.text, type: 'ok', start: t.start, end: t.end }));
            return { ok: false, issues, tokens, raw: rawCmd };
        }

        // 校验参数
        const args = toks.slice(1).filter(t => t.text !== '');
        const specs = spec.args;

        // 参数数量检查（最后一个非可选参数必须存在）
        let reqCount = 0;
        for (const a of specs) { if (!a.startsWith('?')) reqCount++; else break; }
        if (args.length < reqCount) {
            issues.push({ type: 'error', title: '参数不足',
                detail: `<code>${cmdName}</code> 至少需要 <code>${reqCount}</code> 个参数，当前只有 <code>${args.length}</code> 个。用法：${spec.desc}。`,
                token: toks[0] });
        }

        // 逐参数校验
        let argIdx = 0;
        for (let si = 0; si < specs.length && argIdx < args.length; si++) {
            const specItem = specs[si];
            const optional = specItem.startsWith('?');
            const type = optional ? specItem.slice(1) : specItem;
            const tok = args[argIdx];
            const r = checkArg(type, tok, args, argIdx, cmdName, strict);
            tokens.push({ text: tok.text, type: r.ok ? 'ok' : (r.level || 'err'),
                start: tok.start, end: tok.end });
            if (r.issues) issues.push(...r.issues);
            // 某些类型会消耗多个 token（如坐标）
            if (r.consumed) argIdx += r.consumed;
            else argIdx++;
        }

        // 剩余未识别的参数
        while (argIdx < args.length) {
            const tok = args[argIdx];
            // 剩余通常作为文本
            tokens.push({ text: tok.text, type: 'ok', start: tok.start, end: tok.end });
            argIdx++;
            if (strict) {
                issues.push({ type: 'info', title: '多余参数',
                    detail: `参数 <code>${esc(tok.text)}</code> 可能超出 <code>${cmdName}</code> 的标准用法。`,
                    token: tok });
            }
        }

        const hasError = issues.some(i => i.type === 'error');
        return { ok: !hasError, issues, tokens, raw: rawCmd, spec, cmdName };
    }

    /* ---------- 单个参数校验 ---------- */
    function checkArg(type, tok, args, idx, cmdName, strict) {
        const val = tok.text;
        const issues = [];
        let consumed = 1;
        let ok = true;
        let level = 'err';

        switch (type) {
            case 'target':
            case 'target_or_coord':
            case 'target_or_as': {
                if (val.startsWith('@')) {
                    const r = checkSelector(tok, strict);
                    if (r === null) {
                        ok = false;
                        issues.push({ type: 'error', title: '无效的目标选择器',
                            detail: `<code>${esc(val)}</code> 不是合法的选择器。正确格式：<code>@p</code>、<code>@a[name=xx]</code> 等。`,
                            token: tok });
                    } else if (r.issues) {
                        issues.push(...r.issues);
                        if (r.issues.some(i => i.type === 'error')) ok = false;
                    }
                } else if (type === 'target_or_coord' && isCoord(val)) {
                    // tp 的第一个参数可能是坐标
                    return checkCoordTriple(args, idx, '目标或坐标');
                } else {
                    // 玩家名
                    if (!/^[a-zA-Z0-9_]{1,16}$/.test(val.replace(/^["']|["']$/g, ''))) {
                        ok = false;
                        issues.push({ type: 'error', title: '无效的玩家名',
                            detail: `<code>${esc(val)}</code> 不是合法的玩家名或选择器。玩家名只能含字母、数字、下划线，且不超过16位。`,
                            token: tok });
                    }
                }
                break;
            }
            case 'coord':
            case 'coord_or_facing': {
                const r = checkCoordTriple(args, idx, '坐标');
                return { ...r, consumed: 3 };
            }
            case 'int': {
                if (!isInt(val)) {
                    ok = false;
                    issues.push({ type: 'error', title: '需要整数',
                        detail: `参数 <code>${esc(val)}</code> 应为整数（如 <code>64</code>）。`,
                        token: tok });
                }
                break;
            }
            case 'float': {
                if (!isFloat(val)) {
                    ok = false;
                    issues.push({ type: 'error', title: '需要数字',
                        detail: `参数 <code>${esc(val)}</code> 应为数字（如 <code>1.5</code>）。`,
                        token: tok });
                }
                break;
            }
            case 'bool': {
                if (!isBool(val)) {
                    ok = false;
                    issues.push({ type: 'error', title: '需要布尔值',
                        detail: `参数 <code>${esc(val)}</code> 应为 <code>true</code> 或 <code>false</code>。`,
                        token: tok });
                }
                break;
            }
            case 'block': {
                const id = stripNS(val.toLowerCase());
                if (!BLOCK_IDS.has(id)) {
                    if (strict) {
                        ok = false; level = 'warn';
                        issues.push({ type: 'warn', title: '疑似无效的方块ID',
                            detail: `<code>${esc(val)}</code> 不在常用方块ID列表中。基岩版ID多为下划线小写，如 <code>stone</code>、<code>oak_log</code>。`,
                            token: tok });
                    } else {
                        ok = true; // 宽松：可能是新方块
                    }
                }
                break;
            }
            case 'item': {
                const id = stripNS(val.toLowerCase());
                if (!ITEM_IDS.has(id) && !BLOCK_IDS.has(id)) {
                    if (strict) {
                        ok = false; level = 'warn';
                        issues.push({ type: 'warn', title: '疑似无效的物品ID',
                            detail: `<code>${esc(val)}</code> 不在常用物品ID列表中。请检查拼写，如 <code>diamond</code>、<code>iron_sword</code>。`,
                            token: tok });
                    } else {
                        ok = true;
                    }
                }
                break;
            }
            case 'entity': {
                const id = stripNS(val.toLowerCase());
                if (!ENTITY_IDS.has(id)) {
                    ok = false;
                    issues.push({ type: 'error', title: '无效的实体ID',
                        detail: `<code>${esc(val)}</code> 不是有效的实体ID。常见：<code>creeper</code>、<code>zombie</code>、<code>villager</code>。`,
                        token: tok });
                }
                break;
            }
            case 'effect':
            case 'effect_or_clear': {
                if (val === 'clear') break;
                const id = stripNS(val.toLowerCase());
                if (!EFFECT_IDS.has(id)) {
                    ok = false;
                    issues.push({ type: 'error', title: '无效的效果ID',
                        detail: `<code>${esc(val)}</code> 不是有效的状态效果ID。常见：<code>speed</code>、<code>strength</code>、<code>night_vision</code>。或用 <code>clear</code> 清除。`,
                        token: tok });
                }
                break;
            }
            case 'enchant':
            case 'enchant_or_int': {
                if (isInt(val)) break;
                const id = stripNS(val.toLowerCase());
                if (!ENCHANT_IDS.has(id)) {
                    ok = false;
                    issues.push({ type: 'error', title: '无效的附魔ID',
                        detail: `<code>${esc(val)}</code> 不是有效的附魔ID。常见：<code>sharpness</code>、<code>protection</code>、<code>unbreaking</code>。`,
                        token: tok });
                }
                break;
            }
            case 'gamerule': {
                if (!GAMERULES.has(val.toLowerCase())) {
                    ok = false; level = 'warn';
                    issues.push({ type: 'warn', title: '未知游戏规则',
                        detail: `<code>${esc(val)}</code> 不在常用游戏规则列表中。常见：<code>keepinventory</code>、<code>commandblocksenabled</code>、<code>pvp</code>。`,
                        token: tok });
                }
                break;
            }
            case 'mode': {
                const v = val.toLowerCase();
                if (!['survival', 'creative', 'adventure', 'spectator', 's', 'c', 'a', '0', '1', '2'].includes(v)) {
                    ok = false;
                    issues.push({ type: 'error', title: '无效的游戏模式',
                        detail: `<code>${esc(val)}</code> 不是有效模式。应为 <code>survival</code>/<code>creative</code>/<code>adventure</code>/<code>spectator</code>。`,
                        token: tok });
                }
                break;
            }
            case 'difficulty': {
                if (!['peace', 'easy', 'normal', 'hard', '0', '1', '2', '3'].includes(val.toLowerCase())) {
                    ok = false;
                    issues.push({ type: 'error', title: '无效的难度',
                        detail: `应为 <code>peace</code>/<code>easy</code>/<code>normal</code>/<code>hard</code>。`,
                        token: tok });
                }
                break;
            }
            case 'weather_type': {
                if (!['clear', 'rain', 'thunder'].includes(val.toLowerCase())) {
                    ok = false;
                    issues.push({ type: 'error', title: '无效的天气类型',
                        detail: `应为 <code>clear</code>、<code>rain</code> 或 <code>thunder</code>。`,
                        token: tok });
                }
                break;
            }
            case 'time_op': {
                if (!['set', 'add', 'query'].includes(val.toLowerCase())) {
                    ok = false;
                    issues.push({ type: 'error', title: '无效的 time 操作',
                        detail: `应为 <code>set</code>、<code>add</code> 或 <code>query</code>。`,
                        token: tok });
                }
                break;
            }
            case 'weather': {
                if (!['clear', 'rain', 'thunder', 'query'].includes(val.toLowerCase())) {
                    ok = false;
                    issues.push({ type: 'error', title: '无效的天气',
                        detail: `应为 <code>clear</code>、<code>rain</code> 或 <code>thunder</code>。`,
                        token: tok });
                }
                break;
            }
            case 'title_type': {
                if (!['title', 'subtitle', 'actionbar', 'clear', 'reset', 'times'].includes(val.toLowerCase())) {
                    ok = false;
                    issues.push({ type: 'error', title: '无效的标题类型',
                        detail: `应为 <code>title</code>/<code>subtitle</code>/<code>actionbar</code>/<code>clear</code>/<code>reset</code>。`,
                        token: tok });
                }
                break;
            }
            case 'json': {
                if (!isJSON(val)) {
                    ok = false; level = 'warn';
                    issues.push({ type: 'warn', title: 'NBT格式可能不正确',
                        detail: `<code>${esc(val)}</code> 应为花括号包裹的NBT，如 <code>{powered:1b}</code>。基岩版NBT格式较宽松，仅供参考。`,
                        token: tok });
                }
                break;
            }
            case 'string':
            case 'rest':
            case 'particle':
            case 'sound':
            case 'operation':
            case 'tag_op':
            case 'op':
            case 'slot_type':
            case 'structure_type':
            case 'function_path':
            case 'amount_or_target':
            case 'int_or_string':
                ok = true;
                break;
            default:
                ok = true;
        }

        return { ok, level: ok ? 'ok' : level, issues, consumed };
    }

    /* ---------- 校验坐标三元组 ---------- */
    function checkCoordTriple(args, idx, label) {
        const a = args[idx] && args[idx].text;
        const b = args[idx + 1] && args[idx + 1].text;
        const c = args[idx + 2] && args[idx + 2].text;
        const issues = [];
        if (!a || !b || !c) {
            return { ok: false, level: 'err', issues: [{ type: 'error', title: '坐标不完整',
                detail: `${label}需要3个分量（如 <code>~ ~ ~</code> 或 <code>100 70 200</code>）。`,
                token: args[idx] }] };
        }
        let ok = true;
        let level = 'err';
        [a, b, c].forEach((v, i) => {
            if (!isCoord(v)) {
                ok = false;
                issues.push({ type: 'error', title: `坐标分量无效`,
                    detail: `坐标的第${i + 1}个分量 <code>${esc(v)}</code> 无效。应为 <code>~</code>、<code>~5</code>、<code>100</code> 或 <code>^5</code> 等。`,
                    token: args[idx + i] });
            }
        });
        // 检查 ^ 和 ~ 混用
        const hasCaret = [a, b, c].some(v => v.startsWith('^'));
        const hasTilde = [a, b, c].some(v => v.startsWith('~'));
        if (hasCaret && hasTilde) {
            issues.push({ type: 'warn', title: '坐标类型混用',
                detail: `局部坐标 <code>^</code> 和相对坐标 <code>~</code> 不能在同一组坐标中混用。`,
                token: args[idx] });
        }
        return { ok, level: ok ? 'ok' : level, issues };
    }

    /* ---------- 命令名建议 ---------- */
    function suggestCommand(name) {
        const all = Object.keys(COMMAND_SPECS).filter(k => !k.startsWith('_'));
        // 简单编辑距离
        let best = null, bestD = Infinity;
        for (const c of all) {
            const d = lev(name, c);
            if (d < bestD) { bestD = d; best = c; }
        }
        if (best && bestD <= 3) {
            return `你是否想输入 <code>${best}</code>？（${COMMAND_SPECS[best].desc}）`;
        }
        return '';
    }
    function lev(a, b) {
        const m = a.length, n = b.length;
        const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
        for (let i = 0; i <= m; i++) dp[i][0] = i;
        for (let j = 0; j <= n; j++) dp[0][j] = j;
        for (let i = 1; i <= m; i++)
            for (let j = 1; j <= n; j++)
                dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1,
                    dp[i - 1][j - 1] + (a[i - 1].toLowerCase() === b[j - 1].toLowerCase() ? 0 : 1));
        return dp[m][n];
    }

    /* ---------- 渲染校验结果HTML ---------- */
    function renderResult(result) {
        if (!result) return '<div class="result-placeholder">无结果</div>';
        const html = [];
        // 汇总
        if (result.ok) {
            html.push(`<div class="v-summary ok">✓ 指令语法正确${result.issues.length ? '（有' + result.issues.length + '条建议）' : ''}</div>`);
        } else {
            const errs = result.issues.filter(i => i.type === 'error').length;
            html.push(`<div class="v-summary err">✗ 发现 ${errs} 处错误${result.issues.length > errs ? '，另有' + (result.issues.length - errs) + '条建议' : ''}</div>`);
        }

        // 高亮指令
        if (result.tokens && result.tokens.length) {
            html.push('<div class="cmd-display">');
            // 还原前缀 /
            const prefix = result.raw.trim().startsWith('/') ? '/' : '';
            html.push('<span class="tok-ok">' + esc(prefix) + '</span>');
            result.tokens.forEach(t => {
                let cls = 'tok-ok';
                if (t.type === 'err') cls = 'tok-err';
                else if (t.type === 'warn') cls = 'tok-warn';
                else if (t.kind === 'cmd') cls = 'tok-ok';
                html.push(`<span class="${cls}">${esc(t.text)}</span>`);
                html.push('<span class="tok-ok"> </span>');
            });
            html.push('</div>');
        }

        // 问题列表
        if (result.issues.length) {
            html.push('<div class="issue-list">');
            result.issues.forEach((iss, idx) => {
                const tagMap = { error: '错误', warn: '警告', info: '提示', suggest: '建议' };
                html.push(`<div class="issue ${iss.type}">`);
                html.push(`<div class="issue-head"><span class="issue-tag">${tagMap[iss.type] || iss.type}</span>${esc(iss.title || '')}</div>`);
                html.push(`<div class="issue-body">${iss.detail || ''}</div>`);
                if (iss.fix) {
                    html.push(`<div class="issue-fix" data-fix="${esc(iss.fix)}" data-whole="${iss.wholeCmd ? 1 : 0}">${esc(iss.fix)}</div>`);
                }
                html.push('</div>');
            });
            html.push('</div>');
        }

        return html.join('');
    }

    /* ---------- 导出 ---------- */
    window.MCValidator = { validate, renderResult, tokenize, esc };
})();
