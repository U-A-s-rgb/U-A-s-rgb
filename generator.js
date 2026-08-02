/* ============================================================
 *  generator.js  —  自然语言 → 网易版指令 生成器
 *  本地语义解析 + 模板匹配 + Minecraft Wiki 联网搜索补充
 * ============================================================ */

(function () {
    const { ALIAS, GEN_TEMPLATES, targetName } = window.MCData;

    /* ---------- 文本规范化 ---------- */
    function normalize(text) {
        if (!text) return '';
        return text
            .replace(/[\u3000\u200b]/g, ' ')        // 全角空格
            .replace(/【/g, '[').replace(/】/g, ']')
            .replace(/（/g, '(').replace(/）/g, ')')
            .replace(/，/g, ',').replace(/：/g, ':')
            .replace(/[。！？!?]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    /* ---------- 提取数字（含中文数字） ---------- */
    function extractNumbers(text) {
        const nums = [];
        // 先替换中文数字
        let t = text;
        // 处理 "一组" "半组"
        t = t.replace(/一整组/g, '64').replace(/一组/g, '64').replace(/半组/g, '32');
        // 处理 "六十四" 等（通过ALIAS预替换）
        // 普通数字
        const re = /-?\d+/g;
        let m;
        while ((m = re.exec(t)) !== null) {
            nums.push(parseInt(m[0], 10));
        }
        return { nums, text: t };
    }

    /* ---------- 中文数字转阿拉伯 ---------- */
    const CN_NUM = { '零': 0, '一': 1, '二': 2, '两': 2, '三': 3, '四': 4, '五': 5,
        '六': 6, '七': 7, '八': 8, '九': 9, '十': 10 };
    function parseCnNumber(text) {
        // 简单处理：十X = 10+X, X十 = X*10, X十Y = X*10+Y, 纯数字
        const m = text.match(/^([零一二两三四五六七八九十]+)$/);
        if (!m) return null;
        const s = m[1];
        if (/十/.test(s)) {
            const parts = s.split('十');
            const left = parts[0] ? CN_NUM[parts[0]] : 0;
            const right = parts[1] ? CN_NUM[parts[1]] : 0;
            if (parts[0] === '' && parts[1] === '') return 10;
            if (parts[0] === '') return 10 + right;
            if (parts[1] === '') return left * 10;
            return left * 10 + right;
        }
        if (s.length === 1 && CN_NUM[s] != null) return CN_NUM[s];
        return null;
    }

    /* ---------- 从文本中提取 ID（中文别名 → 英文） ---------- */
    function extractIds(text, idSet) {
        const found = [];
        // 按别名长度降序，优先匹配长的
        const entries = Object.entries(ALIAS)
            .filter(([, v]) => typeof v === 'string' && idSet.has(v))
            .sort((a, b) => b[0].length - a[0].length);
        let masked = text;
        for (const [cn, en] of entries) {
            const idx = masked.indexOf(cn);
            if (idx >= 0) {
                found.push({ en, cn, pos: idx });
                // 屏蔽已匹配部分，避免重叠
                masked = masked.slice(0, idx) + ' '.repeat(cn.length) + masked.slice(idx + cn.length);
            }
        }
        // 也检测直接的英文ID
        const words = text.split(/[\s,，]+/);
        for (const w of words) {
            const clean = w.toLowerCase().replace(/^minecraft:/, '');
            if (idSet.has(clean) && !found.some(f => f.en === clean)) {
                found.push({ en: clean, cn: clean, pos: -1 });
            }
        }
        return found;
    }

    /* ---------- 提取目标选择器 ---------- */
    function extractTarget(text) {
        if (/所有玩家|大家|全体/.test(text)) {
            if (/附近|周围/.test(text)) return '@a[r=64]';
            return '@a';
        }
        // 仅"自己"映射到 @s；"给我"等不强制，交给模板默认值（命令方块场景多为 @p）
        if (/自己|手持|手上/.test(text)) return '@s';
        if (/最近|身边|附近(?!的?(玩家|人))/.test(text) && /玩家|人/.test(text)) return '@p';
        if (/最近的玩家|身边的人/.test(text)) return '@p';
        if (/随机|任意玩家/.test(text)) return '@r';
        if (/所有实体|一切实体/.test(text)) return '@e';
        if (/附近|周围/.test(text) && !/玩家/.test(text)) return '@e[r=64]';
        // 显式 @x
        const m = text.match(/@([paser])(\[[^\]]*\])?/);
        if (m) return '@' + m[1] + (m[2] || '');
        return null;
    }

    /* ---------- 提取坐标 ---------- */
    function extractCoord(text) {
        // 三个连续数字坐标
        const m = text.match(/(-?\d+)\s+(-?\d+)\s+(-?\d+)/);
        if (m) return `${m[1]} ${m[2]} ${m[3]}`;
        if (/脚下|原地|这里|当前位置/.test(text)) return '~ ~ ~';
        if (/头顶|上面|上方/.test(text)) return '~ ~1 ~';
        if (/面前|前方|前面/.test(text)) return '^^^3';
        if (/下方|下面/.test(text)) return '~ ~-1 ~';
        return null;
    }

    /* ---------- 识别意图 ---------- */
    function detectIntent(text) {
        const t = text.toLowerCase();
        // 顺序很重要：越具体的越靠前
        if (/死亡不掉落|死亡保留|keepinventory/.test(t)) return 'keepinventory';
        if (/火焰蔓延|防火蔓延|dofiretick/.test(t)) return 'nofirespread';
        if (/生物破坏|防爆|mobgriefing/.test(t)) return 'nomobgrief';
        if (/锁定白天|永远白天|alwaysday/.test(t)) return 'alwaysday';
        if (/闪电|打雷劈|雷劈/.test(t) && !/天气|雷雨/.test(t)) return 'lightning';
        if (/闪电|雷/.test(t) && /天气|雷雨|雷暴/.test(t)) return 'weather';
        if (/给.*经验|加.*经验|经验|等级/.test(text) && /(\d+|级)/.test(text)) return 'xp';
        if (/附魔|附.*魔/.test(text)) return 'enchant';
        if (/清空背包|清空.*物品|clear/.test(t)) return 'clear';
        if (/广播|公屏|全服说|喊话/.test(text)) return 'say';
        if (/标题|屏幕中央|屏幕中间|显示.*字/.test(text)) return 'title';
        if (/传送|到.*坐标|去.*坐标|tp\b/.test(text) || (/\d+\s+\d+\s+\d+/.test(text) && /传送|到|去/.test(text))) return 'tp';
        if (/生成|召唤|出现|刷.*只|召唤/.test(text)) return 'summon';
        if (/效果|buff|加.*速|加速|力量|隐身|夜视|抗火|回血|中毒|缓慢|跳跃|急迫/.test(text)) return 'effect';
        if (/给予|给个|给我|给我|送|发/.test(text) && /个|件|把/.test(text)) return 'give';
        if (/游戏模式|模式|生存|创造|冒险|旁观|上帝模式/.test(text)) return 'gamemode';
        if (/天气|下雨|晴天|雷雨|雷暴/.test(text)) return 'weather';
        if (/时间|白天|中午|夜晚|晚上|黑夜|天亮|天黑/.test(text)) return 'time';
        if (/难度|和平|简单|普通|困难/.test(text) && !/模式/.test(text)) return 'difficulty';
        if (/放置|放.*个|放一个|摆/.test(text) && !/区域/.test(text)) return 'setblock';
        if (/填充|铺|填满|覆盖区域/.test(text)) return 'fill';
        if (/击杀|杀死|清除.*怪物|清除.*实体|kill|消灭/.test(text)) return 'kill';
        // 默认：如果是 give 类描述
        if (/给我|给我|给/.test(text)) return 'give';
        return null;
    }

    /* ---------- 主解析函数 ---------- */
    function parse(text) {
        const norm = normalize(text);
        const { nums, text: numText } = extractNumbers(norm);
        const intent = detectIntent(norm);

        const semantic = {
            intent,
            raw: norm,
            target: extractTarget(norm),
            coord: extractCoord(norm),
            nums,
        };

        // 根据意图提取特定ID和数值
        switch (intent) {
            case 'give': {
                const items = extractIds(norm, window.MCData.ITEM_IDS);
                if (items.length) semantic.item = items[0].en;
                semantic.count = nums[0] || 1;
                break;
            }
            case 'summon': {
                const ents = extractIds(norm, window.MCData.ENTITY_IDS);
                if (ents.length) semantic.entity = ents[0].en;
                break;
            }
            case 'effect': {
                const effs = extractIds(norm, window.MCData.EFFECT_IDS);
                if (effs.length) semantic.effect = effs[0].en;
                semantic.duration = nums[0] || 30;
                semantic.amplifier = nums[1] != null ? nums[1] - 1 : 0;
                // "等级X" / "X级"
                const lm = norm.match(/等级?\s*(\d+)/);
                if (lm) semantic.amplifier = parseInt(lm[1], 10) - 1;
                if (semantic.amplifier < 0) semantic.amplifier = 0;
                break;
            }
            case 'enchant': {
                const encs = extractIds(norm, window.MCData.ENCHANT_IDS);
                if (encs.length) semantic.enchant = encs[0].en;
                const lm = norm.match(/等级?\s*(\d+)/);
                semantic.level = lm ? parseInt(lm[1], 10) : (nums[0] || 1);
                break;
            }
            case 'xp': {
                const m = norm.match(/(\d+)\s*(级|L)?/);
                semantic.amount = m ? (m[2] ? m[1] + 'L' : m[1]) : (nums[0] || 100);
                break;
            }
            case 'gamemode': {
                const m = extractIds(norm, new Set(['survival', 'creative', 'adventure', 'spectator']));
                if (m.length) semantic.mode = m[0].en;
                else {
                    if (/生存/.test(norm)) semantic.mode = 'survival';
                    else if (/创造/.test(norm)) semantic.mode = 'creative';
                    else if (/冒险/.test(norm)) semantic.mode = 'adventure';
                    else if (/旁观|上帝/.test(norm)) semantic.mode = 'spectator';
                }
                break;
            }
            case 'weather': {
                const m = extractIds(norm, new Set(['clear', 'rain', 'thunder']));
                if (m.length) semantic.weather = m[0].en;
                else {
                    if (/晴|无雨|停雨/.test(norm)) semantic.weather = 'clear';
                    else if (/雷/.test(norm)) semantic.weather = 'thunder';
                    else if (/雨/.test(norm)) semantic.weather = 'rain';
                }
                if (nums[0]) semantic.duration = nums[0];
                break;
            }
            case 'time': {
                const m = extractIds(norm, new Set(['day', 'night', 'noon']));
                if (m.length) semantic.time = m[0].en;
                else {
                    if (/白天|天亮|黎明/.test(norm)) semantic.time = 'day';
                    else if (/中午|正午/.test(norm)) semantic.time = 'noon';
                    else if (/夜晚|晚上|黑夜|天黑/.test(norm)) semantic.time = 'night';
                    else if (nums[0] != null) semantic.time = nums[0];
                }
                break;
            }
            case 'difficulty': {
                const m = extractIds(norm, new Set(['peace', 'easy', 'normal', 'hard']));
                if (m.length) semantic.difficulty = m[0].en;
                break;
            }
            case 'setblock': {
                const blocks = extractIds(norm, window.MCData.BLOCK_IDS);
                if (blocks.length) semantic.block = blocks[0].en;
                break;
            }
            case 'fill': {
                const blocks = extractIds(norm, window.MCData.BLOCK_IDS);
                if (blocks.length) semantic.block = blocks[0].en;
                // 提取两组坐标
                const coords = norm.match(/(-?\d+)\s+(-?\d+)\s+(-?\d+)/g);
                if (coords && coords.length >= 2) {
                    semantic.coord1 = coords[0];
                    semantic.coord2 = coords[1];
                }
                break;
            }
            case 'clear': {
                const items = extractIds(norm, window.MCData.ITEM_IDS);
                if (items.length) semantic.item = items[0].en;
                break;
            }
            case 'tp': {
                // 如果有具体坐标，已在 extractCoord 处理
                // 检查目标
                break;
            }
        }

        return semantic;
    }

    /* ---------- 匹配模板生成指令 ---------- */
    function generate(text) {
        const semantic = parse(text);
        const results = [];
        for (const tpl of GEN_TEMPLATES) {
            if (tpl.test(semantic)) {
                const r = tpl.build(semantic);
                if (r) {
                    results.push({ ...r, name: tpl.name, semantic });
                }
            }
        }
        return { results, semantic };
    }

    /* ---------- 联网搜索 Minecraft Wiki ---------- */
    async function searchWiki(keyword, signal) {
        if (!keyword) return null;
        const url = `https://minecraft.wiki/api.php?action=opensearch&search=${encodeURIComponent(keyword)}&limit=5&format=json&origin=*`;
        try {
            const resp = await fetch(url, { signal });
            if (!resp.ok) throw new Error('HTTP ' + resp.status);
            const data = await resp.json();
            // data = [keyword, [titles], [descriptions], [urls]]
            if (!data || !data[1] || !data[1].length) return { items: [] };
            const items = data[1].map((title, i) => ({
                title,
                url: data[3] && data[3][i] ? data[3][i] : `https://minecraft.wiki/${encodeURIComponent(title)}`,
                desc: data[2] && data[2][i] ? data[2][i] : ''
            }));
            return { items };
        } catch (e) {
            if (e.name === 'AbortError') return { aborted: true };
            return { error: e.message };
        }
    }

    /* ---------- 渲染生成结果 ---------- */
    function renderGenResult(genResult, wikiResult) {
        const { results, semantic } = genResult;
        const html = [];

        if (!results.length) {
            html.push(`<div class="issue info" style="border-left-color:var(--info)">
                <div class="issue-head">未能直接生成指令</div>
                <div class="issue-body">
                    没有匹配到合适的指令模板。可以尝试更具体的描述，例如：
                    <br>• "给我64个钻石"  • "在脚下生成一只苦力怕"  • "设置创造模式"
                    <br>识别到的意图：<code>${esc(semantic.intent || '未知')}</code>
                </div></div>`);
        } else {
            results.forEach(r => {
                const confMap = { high: '高匹配', mid: '中等匹配', low: '低匹配' };
                html.push('<div class="gen-item">');
                html.push(`<div class="gen-cmd">${esc(r.cmd)}</div>`);
                html.push('<div class="gen-meta">');
                html.push(`<span class="gen-desc">${esc(r.desc)}</span>`);
                html.push(`<span class="gen-confidence ${r.confidence}">${confMap[r.confidence] || r.confidence}</span>`);
                html.push(`<button class="copy-btn" data-cmd="${esc(r.cmd)}">📋 复制</button>`);
                html.push('</div>');
                if (r.notes) {
                    html.push(`<div class="gen-notes">💡 ${esc(r.notes)}</div>`);
                }
                html.push('</div>');
            });
        }

        // Wiki 搜索结果
        if (wikiResult) {
            if (wikiResult.error) {
                html.push(`<div class="gen-wiki">🔗 联网搜索失败：${esc(wikiResult.error)}（可稍后重试）</div>`);
            } else if (wikiResult.items && wikiResult.items.length) {
                html.push('<div class="gen-wiki">🔗 Minecraft Wiki 相关条目：<br>');
                wikiResult.items.slice(0, 4).forEach(it => {
                    html.push(`• <a href="${esc(it.url)}" target="_blank" rel="noopener">${esc(it.title)}</a>`);
                    if (it.desc) html.push(` <span style="color:var(--text-muted)">— ${esc(it.desc)}</span>`);
                    html.push('<br>');
                });
                html.push('</div>');
            }
        }

        return html.join('');
    }

    function esc(s) { return window.MCValidator.esc(s); }

    /* ---------- 导出 ---------- */
    window.MCGenerator = { generate, searchWiki, renderGenResult, parse };
})();
