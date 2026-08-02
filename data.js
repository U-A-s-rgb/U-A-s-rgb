/* ============================================================
 *  data.js  —  网易版/基岩版指令数据库
 *  包含：命令规范、方块/物品/实体/效果 ID、中文别名、生成模板
 * ============================================================ */

/* ---------- 中文别名 -> 英文ID 映射 ---------- */
const ALIAS = {
    // 实体
    '苦力怕': 'creeper', 'JJ怪': 'creeper', '爬行者': 'creeper',
    '僵尸': 'zombie', '丧尸': 'zombie',
    '骷髅': 'skeleton', '小白': 'skeleton', '骨架': 'skeleton',
    '蜘蛛': 'spider',
    '末影人': 'enderman', '小黑': 'enderman',
    '猪': 'pig', '羊': 'sheep', '牛': 'cow', '鸡': 'chicken',
    '狼': 'wolf', '狗': 'wolf',
    '猫': 'cat', '豹猫': 'ocelot',
    '村民': 'villager', 'NPC': 'villager',
    '铁傀儡': 'iron_golem', '铁人': 'iron_golem',
    '雪傀儡': 'snow_golem', '雪人': 'snow_golem',
    '史莱姆': 'slime',
    '女巫': 'witch',
    '烈焰人': 'blaze',
    '恶魂': 'ghast',
    '末影龙': 'ender_dragon', '龙': 'ender_dragon',
    '凋灵': 'wither', '凋零': 'wither',
    '蝙蝠': 'bat',
    '鱿鱼': 'squid',
    '马': 'horse',
    '兔子': 'rabbit', '兔纸': 'rabbit',
    '守卫者': 'guardian',
    '潜影贝': 'shulker',
    '尸壳': 'husk',
    '流浪者': 'stray',
    '僵尸村民': 'zombie_villager',
    '僵尸猪人': 'zombie_pigman', '猪人': 'zombie_pigman',
    '洞穴蜘蛛': 'cave_spider',
    '蠹虫': 'silverfish',
    '岩浆怪': 'magma_cube',
    '岩浆': 'magma_cube',
    '羊驼': 'llama',
    '鹦鹉': 'parrot',
    '海龟': 'turtle',
    '海豚': 'dolphin',
    '溺尸': 'drowned',
    '幻翼': 'phantom',
    '掠夺者': 'pillager',
    '劫掠兽': 'ravager',
    '穿山甲': 'panda',
    '熊猫': 'panda',
    '狐狸': 'fox',
    '蜜蜂': 'bee',
    '流浪商人': 'wandering_trader',
    '行商': 'wandering_trader',
    '三叉戟': 'trident',
    '经验球': 'xp_orb', '经验': 'xp_orb',
    '掉落物': 'item',
    '箭': 'arrow',
    '雪球': 'snowball',
    '蛋': 'egg',
    '末影珍珠': 'ender_pearl', '末影珠': 'ender_pearl',
    '火焰弹': 'fireball',
    '烟花': 'fireworks_rocket',
    '矿车': 'minecart',
    '船': 'boat',
    '闪电': 'lightning_bolt', '雷': 'lightning_bolt',

    // 物品
    '钻石': 'diamond',
    '钻石剑': 'diamond_sword',
    '钻石镐': 'diamond_pickaxe',
    '钻石斧': 'diamond_axe',
    '钻石锹': 'diamond_shovel',
    '钻石头盔': 'diamond_helmet',
    '钻石胸甲': 'diamond_chestplate',
    '钻石护腿': 'diamond_leggings',
    '钻石靴子': 'diamond_boots',
    '铁锭': 'iron_ingot', '铁': 'iron_ingot',
    '铁剑': 'iron_sword',
    '铁镐': 'iron_pickaxe',
    '金锭': 'gold_ingot', '金': 'gold_ingot',
    '金苹果': 'golden_apple',
    '附魔金苹果': 'enchanted_golden_apple',
    '煤炭': 'coal',
    '木棍': 'stick', '棍子': 'stick',
    '红石': 'redstone',
    '红石粉': 'redstone',
    '红石火把': 'redstone_torch',
    '火药': 'gunpowder',
    '箭矢': 'arrow', '箭': 'arrow',
    '弓': 'bow',
    '弩': 'crossbow',
    '盾牌': 'shield',
    '三叉戟物品': 'trident',
    '鱼': 'fish', '生鱼': 'cod', '鳕鱼': 'cod', '鲑鱼': 'salmon',
    '面包': 'bread',
    '苹果': 'apple',
    '胡萝卜': 'carrot',
    '土豆': 'potato', '马铃薯': 'potato',
    '小麦': 'wheat',
    '西瓜': 'melon_slice',
    '南瓜': 'pumpkin',
    '甘蔗': 'sugar_cane',
    '鸡蛋': 'egg',
    '牛奶': 'milk_bucket', '奶': 'milk_bucket',
    '水桶': 'water_bucket',
    '熔岩桶': 'lava_bucket', '岩浆桶': 'lava_bucket',
    '经验瓶': 'experience_bottle',
    '末影之眼': 'ender_eye',
    '烈焰棒': 'blaze_rod',
    '地狱疣': 'nether_wart',
    '骨头': 'bone',
    '骨粉': 'bone_meal',
    '皮革': 'leather',
    '羽毛': 'feather',
    '线': 'string',
    '火药': 'gunpowder',
    '沙子': 'sand',
    '沙砾': 'gravel',
    '泥土': 'dirt',
    '圆石': 'cobblestone',
    '石头': 'stone',
    '橡木': 'oak_log', '原木': 'oak_log',
    '木板': 'oak_planks',
    '玻璃': 'glass',
    '玻璃瓶': 'glass_bottle',
    '书': 'book',
    '书架': 'bookshelf',
    '附魔台': 'enchanting_table',
    '工作台': 'crafting_table',
    '熔炉': 'furnace',
    '箱子': 'chest',
    '末影箱': 'ender_chest',
    '床': 'red_bed',
    '火把': 'torch',
    'TNT': 'tnt', '炸药': 'tnt',
    '指南针': 'compass',
    '地图': 'map',
    '钟': 'clock',
    '命名牌': 'name_tag',
    '鞍': 'saddle',
    '铁砧': 'anvil',
    '漏斗': 'hopper',
    '活塞': 'piston',
    '观察者': 'observer',
    '中继器': 'repeater',
    '比较器': 'comparator',
    '发射器': 'dispenser',
    '投掷器': 'dropper',
    '末地烛': 'end_rod',
    '海晶灯': 'sea_lantern',
    '信标': 'beacon',
    '下界反应堆': 'nether_reactor_core',

    // 方块
    '草方块': 'grass',
    '圆石方块': 'cobblestone',
    '石头方块': 'stone',
    '泥土方块': 'dirt',
    '沙子方块': 'sand',
    '沙砾方块': 'gravel',
    '橡木方块': 'oak_log',
    '木板方块': 'oak_planks',
    '玻璃方块': 'glass',
    '基岩': 'bedrock',
    '黑曜石': 'obsidian',
    '岩浆': 'lava',
    '水': 'water',
    '冰': 'ice',
    '雪': 'snow',
    '仙人掌': 'cactus',
    '南瓜方块': 'pumpkin',
    '西瓜方块': 'melon_block',
    '甘蔗方块': 'sugar_cane',
    '小麦方块': 'wheat',
    '胡萝卜方块': 'carrots',
    '土豆方块': 'potatoes',
    '树苗': 'oak_sapling',
    '花': 'dandelion',
    '蘑菇': 'red_mushroom',
    '藤蔓': 'vine',
    '睡莲': 'lily_pad',
    '可可豆': 'cocoa',

    // 效果
    '速度': 'speed', '加速': 'speed',
    '缓慢': 'slowness', '减速': 'slowness',
    '急迫': 'haste', '挖矿加速': 'haste',
    '挖掘疲劳': 'mining_fatigue',
    '力量': 'strength', '攻击力提升': 'strength',
    '瞬间治疗': 'instant_health', '治疗': 'instant_health', '回血': 'instant_health',
    '瞬间伤害': 'instant_damage', '伤害': 'instant_damage',
    '跳跃提升': 'jump_boost', '跳跃': 'jump_boost', '跳高': 'jump_boost',
    '反胃': 'nausea', '恶心': 'nausea',
    '生命恢复': 'regeneration', '回血buff': 'regeneration',
    '抗性提升': 'resistance', '抗性': 'resistance',
    '防火': 'fire_resistance', '抗火': 'fire_resistance',
    '水下呼吸': 'water_breathing', '呼吸': 'water_breathing',
    '隐身': 'invisibility', '隐身术': 'invisibility',
    '失明': 'blindness',
    '夜视': 'night_vision', '夜视仪': 'night_vision',
    '饥饿': 'hunger',
    '虚弱': 'weakness',
    '中毒': 'poison',
    '凋零': 'wither',
    '生命提升': 'health_boost',
    '吸收': 'absorption',
    '饱和': 'saturation',
    '飘浮': 'levitation', '漂浮': 'levitation',
    '发光': 'glowing',
    '幸运': 'luck',
    '霉运': 'unluck',

    // 附魔
    '保护': 'protection',
    '火焰保护': 'fire_protection',
    '摔落保护': 'feather_falling',
    '爆炸保护': 'blast_protection',
    '弹射物保护': 'projectile_protection',
    '荆棘': 'thorns',
    '水下速掘': 'aqua_affinity',
    '深海探索者': 'depth_strider',
    '冰霜行者': 'frost_walker',
    '锋利': 'sharpness',
    '亡灵杀手': 'smite',
    '节肢杀手': 'bane_of_arthropods',
    '击退': 'knockback',
    '火焰附加': 'fire_aspect',
    '抢夺': 'looting',
    '效率': 'efficiency',
    '精准采集': 'silk_touch',
    '耐久': 'unbreaking',
    '时运': 'fortune',
    '海之眷顾': 'luck_of_the_sea',
    '饵钓': 'lure',
    '力量附魔': 'power',
    '冲击': 'punch',
    '火矢': 'flame',
    '无限': 'infinity',
    '经验修补': 'mending',
    '消失诅咒': 'vanishing_curse',
    '多重射击': 'multishot',
    '穿透': 'piercing',
    '快速装填': 'quick_charge',
    '激流': 'riptide',
    '忠诚': 'loyalty',
    '引雷': 'channeling',

    // 游戏模式
    '生存': 'survival', '生存模式': 'survival', '0': 'survival',
    '创造': 'creative', '创造模式': 'creative', '1': 'creative',
    '冒险': 'adventure', '冒险模式': 'adventure', '2': 'adventure',
    '旁观': 'spectator', '旁观模式': 'spectator', '上帝模式': 'spectator',

    // 时间/天气
    '白天': 'day', '黎明': 'day',
    '中午': 'noon',
    '夜晚': 'night', '晚上': 'night', '黑夜': 'night',
    '晴天': 'clear', '无雨': 'clear',
    '雨天': 'rain', '下雨': 'rain',
    '雷雨': 'thunder', '雷暴': 'thunder', '打雷': 'thunder',

    // 难度
    '和平': 'peace', '和平难度': 'peace', '0难度': 'peace',
    '简单': 'easy', '简单难度': 'easy',
    '普通': 'normal', '普通难度': 'normal',
    '困难': 'hard', '困难难度': 'hard',

    // 数字
    '一': 1, '二': 2, '两': 2, '三': 3, '四': 4, '五': 5,
    '六': 6, '七': 7, '八': 8, '九': 9, '十': 10,
    '十一': 11, '十二': 12, '十六': 16, '三十二': 32, '六十四': 64,
    '一组': 64, '半组': 32, '一整组': 64,

    // 方向/方位
    '上': '~ ~1 ~', '上面': '~ ~1 ~', '头顶': '~ ~1 ~',
    '下': '~ ~-1 ~', '下面': '~ ~-1 ~', '脚下': '~ ~ ~',
    '北': '~ ~ ~-1', '南': '~ ~ ~1', '东': '~1 ~ ~', '西': '~ -1 ~ -1'.replace('-1 ~ -1','-1~~'),
};

/* ---------- 实体ID完整列表（基岩版常用） ---------- */
const ENTITY_IDS = new Set([
    'creeper', 'zombie', 'skeleton', 'spider', 'enderman', 'pig', 'sheep', 'cow',
    'chicken', 'wolf', 'ocelot', 'cat', 'villager', 'iron_golem', 'snow_golem',
    'slime', 'witch', 'blaze', 'ghast', 'ender_dragon', 'wither', 'bat', 'squid',
    'horse', 'rabbit', 'guardian', 'shulker', 'husk', 'stray', 'zombie_villager',
    'zombie_pigman', 'cave_spider', 'silverfish', 'magma_cube', 'llama', 'parrot',
    'turtle', 'dolphin', 'drowned', 'phantom', 'pillager', 'ravager', 'panda',
    'fox', 'bee', 'wandering_trader', 'trident', 'xp_orb', 'item', 'arrow',
    'snowball', 'egg', 'ender_pearl', 'fireball', 'fireworks_rocket', 'minecart',
    'boat', 'lightning_bolt', 'wither_skeleton', 'skeleton_horse', 'zombie_horse',
    'donkey', 'mule', 'evoker', 'vex', 'vindicator', 'mooshroom', 'cod', 'salmon',
    'pufferfish', 'tropical_fish', 'elder_guardian', 'wither_skull', 'ender_crystal',
    'leash_knot', 'painting', 'item_frame', 'armor_stand', 'eye_of_ender_signal',
    'falling_block', 'tnt', 'experience_bottle', 'fishing_hook', 'area_effect_cloud',
    'shulker_bullet', 'dragon_fireball', 'llama_spit', 'evocation_fang',
    'chorus_fruit', 'small_fireball', 'xporb', 'painting', 'marker', 'npc'
]);

/* ---------- 物品ID（基岩版命名空间 minecraft: 可省略） ---------- */
const ITEM_IDS = new Set([
    'diamond', 'diamond_sword', 'diamond_pickaxe', 'diamond_axe', 'diamond_shovel',
    'diamond_helmet', 'diamond_chestplate', 'diamond_leggings', 'diamond_boots',
    'iron_ingot', 'iron_sword', 'iron_pickaxe', 'iron_axe', 'iron_shovel',
    'iron_helmet', 'iron_chestplate', 'iron_leggings', 'iron_boots',
    'gold_ingot', 'golden_sword', 'golden_apple', 'enchanted_golden_apple',
    'golden_carrot', 'golden_axe', 'golden_helmet', 'golden_chestplate',
    'golden_leggings', 'golden_boots',
    'netherite_sword', 'netherite_pickaxe', 'netherite_axe', 'netherite_shovel',
    'netherite_helmet', 'netherite_chestplate', 'netherite_leggings', 'netherite_boots',
    'netherite_ingot', 'netherite_scrap',
    'coal', 'charcoal', 'stick', 'redstone', 'redstone_torch',
    'gunpowder', 'arrow', 'bow', 'crossbow', 'shield', 'trident',
    'cod', 'salmon', 'bread', 'apple', 'carrot', 'potato', 'wheat', 'melon_slice',
    'pumpkin', 'sugar_cane', 'egg', 'milk_bucket', 'water_bucket', 'lava_bucket',
    'experience_bottle', 'ender_eye', 'blaze_rod', 'nether_wart', 'bone', 'bone_meal',
    'leather', 'feather', 'string', 'sand', 'gravel', 'dirt', 'cobblestone', 'stone',
    'oak_log', 'spruce_log', 'birch_log', 'jungle_log', 'acacia_log', 'dark_oak_log',
    'oak_planks', 'glass', 'glass_bottle', 'book', 'bookshelf', 'enchanting_table',
    'crafting_table', 'furnace', 'chest', 'ender_chest', 'red_bed', 'torch', 'tnt',
    'compass', 'map', 'clock', 'name_tag', 'saddle', 'anvil', 'hopper', 'piston',
    'sticky_piston', 'observer', 'repeater', 'comparator', 'dispenser', 'dropper',
    'end_rod', 'sea_lantern', 'beacon', 'nether_reactor_core', 'bedrock', 'obsidian',
    'lava_bucket', 'snowball', 'ender_pearl', 'fireball', 'fireworks_rocket',
    'writable_book', 'written_book', 'sign', 'oak_sign', 'bucket', 'air',
    'flint_and_steel', 'shears', 'fishing_rod', 'carrot_on_a_stick',
    'warped_fungus_on_a_stick', 'spectral_arrow', 'tipped_arrow', 'lingering_potion',
    'splash_potion', 'potion', 'brick', 'netherbrick', 'netherrack', 'soul_sand',
    'glowstone', 'glowstone_dust', 'quartz', 'emerald', 'lapis_lazuli',
    'string', 'spider_eye', 'fermented_spider_eye', 'ghast_tear', 'magma_cream',
    'blaze_powder', 'sugar', 'glistering_melon_slice', 'rabbit_foot', 'rabbit_hide',
    'phantom_membrane', 'shulker_shell', 'turtle_helmet', 'scute',
    'nautilus_shell', 'heart_of_the_sea', 'conduit', 'prismarine_shard',
    'prismarine_crystals', 'clay_ball', 'brick', 'paper', 'slime_ball',
    'popped_chorus_fruit', 'chorus_fruit', 'end_crystal', 'popped_chorus_fruit'
]);

/* ---------- 方块ID ---------- */
const BLOCK_IDS = new Set([
    'stone', 'cobblestone', 'dirt', 'grass', 'sand', 'gravel', 'bedrock', 'obsidian',
    'oak_log', 'spruce_log', 'birch_log', 'jungle_log', 'acacia_log', 'dark_oak_log',
    'oak_planks', 'spruce_planks', 'birch_planks', 'jungle_planks', 'acacia_planks',
    'dark_oak_planks', 'oak_leaves', 'glass', 'glass_pane', 'chest', 'ender_chest',
    'crafting_table', 'furnace', 'blast_furnace', 'smoker', 'enchanting_table',
    'bookshelf', 'anvil', 'chipped_anvil', 'damaged_anvil', 'tnt', 'torch',
    'redstone_torch', 'redstone_wire', 'redstone_block', 'repeater', 'comparator',
    'piston', 'sticky_piston', 'observer', 'dispenser', 'dropper', 'hopper',
    'lava', 'water', 'ice', 'packed_ice', 'blue_ice', 'snow', 'snow_block',
    'cactus', 'pumpkin', 'carved_pumpkin', 'jack_o_lantern', 'melon_block',
    'sugar_cane', 'wheat', 'carrots', 'potatoes', 'beetroots', 'oak_sapling',
    'dandelion', 'poppy', 'red_mushroom', 'brown_mushroom', 'vine', 'lily_pad',
    'cocoa', 'bedrock', 'netherrack', 'soul_sand', 'soul_soil', 'glowstone',
    'sea_lantern', 'beacon', 'end_rod', 'end_stone', 'purpur_block', 'nether_bricks',
    'nether_brick_fence', 'magma_block', 'quartz_block', 'quartz_ore', 'emerald_ore',
    'diamond_ore', 'gold_ore', 'iron_ore', 'coal_ore', 'lapis_ore', 'redstone_ore',
    'air', 'barrier', 'command_block', 'repeating_command_block', 'chain_command_block',
    'structure_block', 'structure_void', 'jigsaw', 'spawner', 'mob_spawner',
    'end_portal_frame', 'end_portal', 'end_gateway', 'nether_portal',
    'iron_block', 'gold_block', 'diamond_block', 'emerald_block', 'lapis_block',
    'redstone_block', 'coal_block', 'hay_block', 'bone_block', 'slime_block',
    'honey_block', 'obsidian', 'crying_obsidian', 'respawn_anchor',
    'oak_fence', 'spruce_fence', 'birch_fence', 'oak_door', 'iron_door',
    'oak_stairs', 'cobblestone_stairs', 'brick_stairs', 'stone_brick_stairs',
    'ladder', 'scaffolding', 'loom', 'cartography_table', 'fletching_table',
    'smithing_table', 'grindstone', 'stonecutter', 'composter', 'barrel',
    'smoker', 'blast_furnace', 'lectern', 'brewing_stand', 'cauldron',
    'flower_pot', 'armor_stand', 'bell', 'lantern', 'soul_lantern',
    'campfire', 'soul_campfire', 'bee_nest', 'beehive', 'honeycomb_block'
]);

/* ---------- 效果ID ---------- */
const EFFECT_IDS = new Set([
    'speed', 'slowness', 'haste', 'mining_fatigue', 'strength', 'instant_health',
    'instant_damage', 'jump_boost', 'nausea', 'regeneration', 'resistance',
    'fire_resistance', 'water_breathing', 'invisibility', 'blindness',
    'night_vision', 'hunger', 'weakness', 'poison', 'wither', 'health_boost',
    'absorption', 'saturation', 'levitation', 'glowing', 'luck', 'unluck',
    'slow_falling', 'conduit_power', 'dolphin_grace', 'bad_omen', 'hero_of_the_village',
    'fatal_poison'
]);

/* ---------- 附魔ID ---------- */
const ENCHANT_IDS = new Set([
    'protection', 'fire_protection', 'feather_falling', 'blast_protection',
    'projectile_protection', 'thorns', 'aqua_affinity', 'depth_strider',
    'frost_walker', 'binding_curse', 'sharpness', 'smite', 'bane_of_arthropods',
    'knockback', 'fire_aspect', 'looting', 'sweeping', 'efficiency',
    'silk_touch', 'unbreaking', 'fortune', 'luck_of_the_sea', 'lure',
    'loyalty', 'impaling', 'riptide', 'channeling', 'multishot', 'piercing',
    'quick_charge', 'mending', 'vanishing_curse', 'power', 'punch', 'flame',
    'infinity', 'soul_speed'
]);

/* ---------- 游戏规则 ---------- */
const GAMERULES = new Set([
    'commandblockoutput', 'commandblocksenabled', 'dofiretick', 'domobspawning',
    'domobloot', 'dodaylightcycle', 'doentitydrops', 'doinsomnia', 'domobgriefing',
    'doweathercycle', 'keepinventory', 'mobgriefing', 'naturalregeneration',
    'pvp', 'sendcommandfeedback', 'showcoordinates', 'showdeathmessages',
    'showtags', 'drowningdamage', 'falldamage', 'firedamage', 'showbordereffect',
    'tntexplodes', 'showdaysplayed', 'immediaterespawn', 'functioncommandlimit',
    'maxcommandchainlength', 'randomtickspeed', 'spawnradius', 'showbordereffect',
    'doimmediate respawn', 'dolimitedcrafting', 'playerssleepingpercentage'
]);

/* ---------- 命令规范定义（基岩版/网易版） ----------
 *  args: 参数类型列表
 *    'target' 目标选择器 / 玩家名
 *    'coord'  坐标 ~ ~ ~ 或 x y z
 *    'int'    整数
 *    'float'  小数
 *    'string' 字符串
 *    'block'  方块ID
 *    'item'   物品ID
 *    'entity' 实体ID
 *    'effect' 效果ID
 *    'enchant'附魔ID
 *    'gamerule'游戏规则
 *    'mode'   游戏模式
 *    'rest'   剩余参数（文本/JSON）
 *    'json'   JSON NBT
 *    '...?'   可选参数（前缀?）
 *    'int?'   可选整数
 */
const COMMAND_SPECS = {
    'give':      { desc: '给予玩家物品', args: ['target', 'item', '?int', '?int'] },
    'clear':     { desc: '清除玩家物品', args: ['target', '?item', '?int', '?int'] },
    'summon':    { desc: '生成实体', args: ['entity', '?coord', '?json', '?rest'] },
    'tp':        { desc: '传送', args: ['target_or_coord', '?target', '?coord_or_facing'] },
    'teleport':  { desc: '传送（同tp）', args: ['target_or_coord', '?target', '?coord_or_facing'] },
    'kill':      { desc: '杀死实体', args: ['?target'] },
    'effect':    { desc: '给予效果', args: ['target', 'effect_or_clear', '?int', '?int', '?bool'] },
    'gamemode':  { desc: '设置游戏模式', args: ['mode', '?target'] },
    'gamerule':  { desc: '设置游戏规则', args: ['gamerule', '?bool'] },
    'setblock':  { desc: '放置方块', args: ['coord', 'block', '?mode'] },
    'fill':      { desc: '填充区域', args: ['coord', 'coord', 'block', '?mode'] },
    'clone':     { desc: '复制区域', args: ['coord', 'coord', 'coord', '?mode'] },
    'execute':   { desc: '条件执行', args: ['target_or_as', '?rest'] },
    'say':       { desc: '广播', args: ['rest'] },
    'tell':      { desc: '私聊', args: ['target', 'rest'] },
    'msg':       { desc: '私聊', args: ['target', 'rest'] },
    'w':         { desc: '私聊', args: ['target', 'rest'] },
    'title':     { desc: '显示标题', args: ['target', 'title_type', '?rest'] },
    'scoreboard':{ desc: '记分板', args: ['operation', '?rest'] },
    'particle':  { desc: '粒子效果', args: ['particle', '?coord', '?rest'] },
    'playsound': { desc: '播放音效', args: ['sound', '?target', '?coord', '?float', '?float', '?bool'] },
    'stopsound': { desc: '停止音效', args: ['target', '?rest'] },
    'setworldspawn': { desc: '设置世界出生点', args: ['?coord'] },
    'spawnpoint':{ desc: '设置出生点', args: ['?target', '?coord'] },
    'setmaxplayers': { desc: '设置最大玩家数', args: ['int'] },
    'weather':   { desc: '设置天气', args: ['weather_type', '?int'] },
    'time':      { desc: '设置时间', args: ['time_op', '?int_or_string'] },
    'difficulty':{ desc: '设置难度', args: ['difficulty'] },
    'defaultgamemode': { desc: '默认游戏模式', args: ['mode'] },
    'toggledownfall': { desc: '切换降雨', args: [] },
    'xp':        { desc: '给予经验', args: ['amount_or_target', '?target'] },
    'experience':{ desc: '给予经验', args: ['amount_or_target', '?target'] },
    'enchant':   { desc: '附魔', args: ['target', 'enchant_or_int', '?int'] },
    'replaceitem': { desc: '替换物品', args: ['target', 'slot_type', 'int', 'item', '?int', '?int'] },
    'tag':       { desc: '标签', args: ['target', 'tag_op', '?rest'] },
    'testfor':   { desc: '检测实体', args: ['target', '?coord', '?coord'] },
    'testforblock': { desc: '检测方块', args: ['coord', 'block', '?int'] },
    'tickingarea': { desc: '常加载区域', args: ['op', '?rest'] },
    'worldbuilder': { desc: '世界建造者', args: ['?bool'] },
    'list':      { desc: '列出玩家', args: [] },
    'listd':     { desc: '列出玩家详情', args: [] },
    'seed':      { desc: '查看种子', args: [] },
    'help':      { desc: '帮助', args: ['?rest'] },
    'stop':      { desc: '停止服务器', args: [] },
    'save':      { desc: '保存', args: ['op'] },
    'alwaysday': { desc: '锁定白天', args: ['?bool'] },
    'daylock':   { desc: '锁定白天', args: ['?bool'] },
    'mixer':     { desc: 'Mixer互动', args: ['?rest'] },
    'reload':    { desc: '重载', args: [] },
    'function':  { desc: '执行函数', args: ['function_path', '?rest'] },
    '_structure': { desc: '结构', args: ['?rest'] },
    'locate':    { desc: '定位结构', args: ['structure_type'] },
    'fillstructure': { desc: '填充结构', args: ['?rest'] },
    'getchunkdata': { desc: '获取区块数据', args: ['rest'] },
    'getentitydata': { desc: '获取实体数据', args: ['rest'] },
    'getspawnpoint': { desc: '获取出生点', args: ['?target'] },
    'globalpause': { desc: '全局暂停', args: ['bool'] },
    'kick':      { desc: '踢出玩家', args: ['target', '?rest'] },
    'op':        { desc: '给予OP', args: ['target'] },
    'deop':      { desc: '撤销OP', args: ['target'] },
    'ban':       { desc: '封禁', args: ['target', '?rest'] },
    'pardon':    { desc: '解封', args: ['target'] },
};

/* ---------- 指令生成模板 ----------
 *  每个模板: { keywords, weight, build(match) -> {cmd, desc, confidence, notes?} }
 *  match 函数接收解析后的语义对象 s，返回 null 表示不匹配
 */
const GEN_TEMPLATES = [
    /* ===== 给予物品 ===== */
    {
        name: 'give-item',
        test: s => s.intent === 'give' && s.item,
        build: s => {
            const target = s.target || '@p';
            const count = s.count || 1;
            return {
                cmd: `/give ${target} ${s.item} ${count}`,
                desc: `给予${targetName(target)} ${count}个${s.item}`,
                confidence: 'high',
                notes: '可把物品ID换成对应方块ID；count最大建议不超过64。'
            };
        }
    },
    /* ===== 召唤实体 ===== */
    {
        name: 'summon-entity',
        test: s => s.intent === 'summon' && s.entity,
        build: s => {
            const coord = s.coord || '~ ~ ~';
            return {
                cmd: `/summon ${s.entity} ${coord}`,
                desc: `在 ${coord} 生成一只 ${s.entity}`,
                confidence: 'high',
                notes: '若要带NBT数据，可写成 /summon creeper ~ ~ ~ {powered:1b}。'
            };
        }
    },
    /* ===== 传送 ===== */
    {
        name: 'teleport',
        test: s => s.intent === 'tp',
        build: s => {
            if (s.target && s.coord) {
                return {
                    cmd: `/tp ${s.target} ${s.coord}`,
                    desc: `把${targetName(s.target)}传送到 ${s.coord}`,
                    confidence: 'high'
                };
            }
            if (s.coord) {
                return {
                    cmd: `/tp @s ${s.coord}`,
                    desc: `把自己传送到 ${s.coord}`,
                    confidence: 'high'
                };
            }
            if (s.target) {
                return {
                    cmd: `/tp @s ${s.target}`,
                    desc: `把自己传送到 ${targetName(s.target)}`,
                    confidence: 'high'
                };
            }
            return null;
        }
    },
    /* ===== 效果 ===== */
    {
        name: 'effect',
        test: s => s.intent === 'effect' && s.effect,
        build: s => {
            const target = s.target || '@p';
            const dur = s.duration || 30;
            const amp = s.amplifier || 0;
            return {
                cmd: `/effect ${target} ${s.effect} ${dur} ${amp} true`,
                desc: `给${targetName(target)}添加 ${s.effect} 效果 ${dur}秒 等级${amp + 1}`,
                confidence: 'high',
                notes: '最后 true=隐藏粒子。等级0=1级，等级1=2级，以此类推。'
            };
        }
    },
    /* ===== 游戏模式 ===== */
    {
        name: 'gamemode',
        test: s => s.intent === 'gamemode' && s.mode,
        build: s => {
            const target = s.target || '@s';
            return {
                cmd: `/gamemode ${s.mode} ${target}`,
                desc: `把${targetName(target)}的游戏模式设为 ${s.mode}`,
                confidence: 'high'
            };
        }
    },
    /* ===== 天气 ===== */
    {
        name: 'weather',
        test: s => s.intent === 'weather' && s.weather,
        build: s => {
            const dur = s.duration ? ` ${s.duration}` : '';
            return {
                cmd: `/weather ${s.weather}${dur}`,
                desc: `设置天气为 ${s.weather}${s.duration ? '，持续' + s.duration + '秒' : ''}`,
                confidence: 'high'
            };
        }
    },
    /* ===== 时间 ===== */
    {
        name: 'time-set',
        test: s => s.intent === 'time' && s.time != null,
        build: s => {
            if (s.time === 'day') return { cmd: '/time set day', desc: '设置为白天', confidence: 'high' };
            if (s.time === 'night') return { cmd: '/time set night', desc: '设置为夜晚', confidence: 'high' };
            if (s.time === 'noon') return { cmd: '/time set noon', desc: '设置为正午', confidence: 'high' };
            return { cmd: `/time set ${s.time}`, desc: `设置时间为 ${s.time}`, confidence: 'high' };
        }
    },
    /* ===== 难度 ===== */
    {
        name: 'difficulty',
        test: s => s.intent === 'difficulty' && s.difficulty,
        build: s => ({ cmd: `/difficulty ${s.difficulty}`, desc: `设置难度为 ${s.difficulty}`, confidence: 'high' })
    },
    /* ===== 设置方块 ===== */
    {
        name: 'setblock',
        test: s => s.intent === 'setblock' && s.block,
        build: s => {
            const coord = s.coord || '~ ~ ~';
            return {
                cmd: `/setblock ${coord} ${s.block}`,
                desc: `在 ${coord} 放置 ${s.block}`,
                confidence: 'high',
                notes: '替换模式：末尾加 replace / destroy / keep。'
            };
        }
    },
    /* ===== 填充区域 ===== */
    {
        name: 'fill',
        test: s => s.intent === 'fill' && s.block,
        build: s => {
            const c1 = s.coord1 || '~~-1~';
            const c2 = s.coord2 || '~5~3~5';
            return {
                cmd: `/fill ${c1} ${c2} ${s.block}`,
                desc: `用 ${s.block} 填充区域 ${c1} 到 ${c2}`,
                confidence: 'mid',
                notes: '可加 replace/outline/hollow/keep 模式。'
            };
        }
    },
    /* ===== 击杀 ===== */
    {
        name: 'kill',
        test: s => s.intent === 'kill',
        build: s => {
            const target = s.target || '@e';
            return {
                cmd: `/kill ${target}`,
                desc: `清除${targetName(target)}`,
                confidence: 'high',
                notes: '注意 /kill @e 会清掉所有实体包括掉落物。'
            };
        }
    },
    /* ===== 经验 ===== */
    {
        name: 'xp',
        test: s => s.intent === 'xp' && s.amount,
        build: s => {
            const target = s.target || '@p';
            return {
                cmd: `/xp ${s.amount} ${target}`,
                desc: `给${targetName(target)} ${s.amount} 经验`,
                confidence: 'high',
                notes: '加 L 后缀表示等级：/xp 10L @p（给10级）'
            };
        }
    },
    /* ===== 附魔 ===== */
    {
        name: 'enchant',
        test: s => s.intent === 'enchant' && s.enchant,
        build: s => {
            const target = s.target || '@s';
            const lvl = s.level || 1;
            return {
                cmd: `/enchant ${target} ${s.enchant} ${lvl}`,
                desc: `给${targetName(target)}手持物品附魔 ${s.enchant} ${lvl}级`,
                confidence: 'mid',
                notes: '玩家必须手持对应物品；高级附魔建议用 /give 带 NBT。'
            };
        }
    },
    /* ===== 清除物品 ===== */
    {
        name: 'clear',
        test: s => s.intent === 'clear',
        build: s => {
            const target = s.target || '@p';
            if (s.item) {
                return {
                    cmd: `/clear ${target} ${s.item}`,
                    desc: `清除${targetName(target)}的 ${s.item}`,
                    confidence: 'high'
                };
            }
            return { cmd: `/clear ${target}`, desc: `清空${targetName(target)}的背包`, confidence: 'high' };
        }
    },
    /* ===== 广播 ===== */
    {
        name: 'say',
        test: s => s.intent === 'say' && s.text,
        build: s => ({ cmd: `/say ${s.text}`, desc: `在聊天框广播：${s.text}`, confidence: 'high' })
    },
    /* ===== 标题 ===== */
    {
        name: 'title',
        test: s => s.intent === 'title' && s.text,
        build: s => ({
            cmd: `/title @a title ${JSON.stringify({ text: s.text })}`,
            desc: `在所有玩家屏幕中央显示标题：${s.text}`,
            confidence: 'mid',
            notes: '可用 /title @a subtitle ... 设置副标题。'
        })
    },
    /* ===== 闪电 ===== */
    {
        name: 'lightning',
        test: s => s.intent === 'lightning',
        build: s => {
            const coord = s.coord || '~~2~';
            return {
                cmd: `/summon lightning_bolt ${coord}`,
                desc: `在 ${coord} 召唤一道闪电`,
                confidence: 'high'
            };
        }
    },
    /* ===== 保持物品 ===== */
    {
        name: 'keepinventory',
        test: s => s.intent === 'keepinventory',
        build: s => ({
            cmd: `/gamerule keepinventory true`,
            desc: '开启死亡不掉落',
            confidence: 'high'
        })
    },
    /* ===== 关闭火焰蔓延 ===== */
    {
        name: 'nofirespread',
        test: s => s.intent === 'nofirespread',
        build: s => ({ cmd: `/gamerule dofiretick false`, desc: '关闭火焰蔓延', confidence: 'high' })
    },
    /* ===== 关闭生物破坏 ===== */
    {
        name: 'nomobgrief',
        test: s => s.intent === 'nomobgrief',
        build: s => ({ cmd: `/gamerule mobgriefing false`, desc: '关闭生物破坏方块', confidence: 'high' })
    },
    /* ===== 锁定白天 ===== */
    {
        name: 'alwaysday',
        test: s => s.intent === 'alwaysday',
        build: s => ({ cmd: `/alwaysday true`, desc: '锁定为白天', confidence: 'high' })
    },
];

/* ---------- 随机示例库（供"随机示例"按钮使用） ---------- */
const SAMPLE_PROMPTS = [
    '给我64个钻石',
    '在脚下生成一只苦力怕',
    '给附近所有玩家加上速度效果10秒',
    '把我传送到 100 70 200',
    '设置为创造模式',
    '变成白天',
    '下一场雷雨',
    '清除附近所有怪物',
    '给手持剑附魔锋利5',
    '在我头顶放一个火把',
    '广播"服务器即将重启"',
    '给所有玩家500经验',
    '设置难度为困难',
    '开启死亡不掉落',
    '在我面前生成一只铁傀儡',
    '用石头填充 0 0 0 到 10 5 10',
    '给所有玩家屏幕显示"欢迎"',
    '召唤一道闪电',
    '给附近最近的玩家一个金苹果',
    '设置游戏模式为生存给所有玩家',
];

/* ---------- 工具函数 ---------- */
function targetName(t) {
    const map = { '@p': '最近玩家', '@a': '所有玩家', '@s': '自己', '@e': '所有实体', '@r': '随机玩家' };
    return map[t] || t;
}

// 暴露到全局
window.MCData = {
    ALIAS, ENTITY_IDS, ITEM_IDS, BLOCK_IDS, EFFECT_IDS, ENCHANT_IDS,
    GAMERULES, COMMAND_SPECS, GEN_TEMPLATES, SAMPLE_PROMPTS, targetName
};
