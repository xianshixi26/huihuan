// src/store/gameData.js
import { reactive } from 'vue'

// 1. 全局响应式状态
export const gameState = reactive({
  currentChapter: 1,      // 当前章节 (1 或 2)
  currentMapId: 'map_1',   // 当前地图ID (map_1 到 map_4)
  player: {
    x: 200,
    y: 500,
    clues: [],            // 已收集的线索ID数组
    attributes: { reason: 50, obsession: 20 } // 角色属性：理智，执念
  }
})

// 2. 1-4全地图、NPC、1:1线索的完整静态配置
export const chaptersConfig = {
  // ==================== 第一章：校园惊魂 (包含地图1、地图2) ====================
  1: {
    title: "第一章：循环起点",
    maps: {
      'map_1': {
        name: "高三(1)班教室",
        bgImage: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=1200", // 替换为你本地的图片路径
        width: 1200,
        height: 800
      },
      'map_2': {
        name: "教学楼旧走廊",
        bgImage: "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?q=80&w=1500", 
        width: 1500,
        height: 600
      }
    },
    
    // 第一章的 NPC（合理分配在地图1和2）
    npcs: [
      {
        id: "npc_zhou",
        name: "周野",
        mapId: "map_1", // 站在教室里
        x: 900,
        y: 450,
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=zhou",
        dialogs: { initial: "林迟，你顶撞了规则，真的没发现这里的异常吗？" }
      },
      {
        id: "npc_shen",
        name: "沈知夏",
        mapId: "map_2", // 站在走廊尽头
        x: 600,
        y: 350,
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=shen",
        dialogs: { initial: "别相信黑板上的字，那不是我写的。" }
      }
    ],

    // 第一章的 10 个线索（5有用 : 5无用，平铺在地图1和地图2中）
    clues: [
      // ---- 有用线索 (5个) ----
      {
        id: "clue_01",
        name: "沈知夏的草稿纸",
        mapId: "map_1",
        x: 250, y: 350,
        isUseful: true,
        description: "上面用红笔写着：‘理智不能归零，否则就再也出不去了’。",
        influence: { reason: 5, obsession: 0 }
      },
      {
        id: "clue_02",
        name: "值日生日志",
        mapId: "map_1",
        x: 150, y: 600,
        isUseful: true,
        description: "最后一页写着：‘注意，执念·林迟已经出现，他会修改告示’。",
        influence: { reason: 2, obsession: 0 }
      },
      {
        id: "clue_03",
        name: "撕破的教师守则",
        mapId: "map_2",
        x: 300, y: 250,
        isUseful: true,
        description: "守则第三条被涂黑了，隐约能看到‘不要回头’四个字。",
        influence: { reason: -2, obsession: 5 }
      },
      {
        id: "clue_04",
        name: "神秘的旧照片",
        mapId: "map_2",
        x: 850, y: 400,
        isUseful: true,
        description: "照片背景是学校老校区，背面写着‘循环无法打破，除非...’",
        influence: { reason: 5, obsession: -2 }
      },
      {
        id: "clue_05",
        name: "带血的校徽",
        mapId: "map_2",
        x: 1300, y: 200,
        isUseful: true,
        description: "背面刻着林迟的名字，但这枚校徽看起来已经生锈了几十年。",
        influence: { reason: -10, obsession: 10 }
      },

      // ---- 无用线索 (5个) ----
      {
        id: "clue_junk_01",
        name: "空易拉罐",
        mapId: "map_1",
        x: 700, y: 200,
        isUseful: false,
        description: "一个普通的可乐罐，不知道是谁丢在这里的废品。",
        influence: { reason: 0, obsession: 0 }
      },
      {
        id: "clue_junk_02",
        name: "过期的请假条",
        mapId: "map_1",
        x: 550, y: 550,
        isUseful: false,
        description: "上周的请假条，名字写着张三，已经失效了。",
        influence: { reason: 0, obsession: 0 }
      },
      {
        id: "clue_junk_03",
        name: "坏掉的手电筒",
        mapId: "map_2",
        x: 100, y: 450,
        isUseful: false,
        description: "没有电池，外壳布满灰尘，无法使用。",
        influence: { reason: 0, obsession: 1 }
      },
      {
        id: "clue_junk_04",
        name: "一张数学试卷",
        mapId: "map_2",
        x: 1100, y: 480,
        isUseful: false,
        description: "写满了复杂的几何公式，得分为150分。对解谜毫无作用。",
        influence: { reason: 1, obsession: 0 }
      },
      {
        id: "clue_junk_05",
        name: "一团废纸屑",
        mapId: "map_1",
        x: 1050, y: 650,
        isUseful: false,
        description: "打开看里面什么也没写，只是普通的空白草稿纸碎屑。",
        influence: { reason: 0, obsession: 0 }
      }
    ],

    // 传送点：连接地图1和地图2
    transferPoints: [
      { fromMap: 'map_1', toMap: 'map_2', x: 1150, y: 400, label: "推门出去（前往走廊）", spawnX: 80, spawnY: 350 },
      { fromMap: 'map_2', toMap: 'map_1', x: 50, y: 350, label: "返回教室", spawnX: 1080, spawnY: 400 }
    ]
  },

  // ==================== 第二章：迷雾探索 (包含地图3、地图4) ====================
  2: {
    title: "第二章：真相边缘",
    maps: {
      'map_3': {
        name: "荒废的学校小树林",
        bgImage: "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1000",
        width: 1200,
        height: 1000
      },
      'map_4': {
        name: "秘密地下实验室",
        bgImage: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?q=80&w=1200",
        width: 1000,
        height: 800
      }
    },

    // 第二章的 NPC（这里放置剩下的1个NPC，或者你可以根据剧情添加额外互动）
    npcs: [
      {
        id: "npc_he",
        name: "保安老何",
        mapId: "map_3", // 守在小树林
        x: 400,
        y: 700,
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=he",
        dialogs: { initial: "大半夜的，赶紧回宿舍，别在小树林瞎转悠！" }
      }
    ],

    // 第二章的 10 个新线索（同样是 5有用 : 5无用，平铺在地图3和4）
    clues: [
      // ---- 有用线索 (5个) ----
      {
        id: "clue_06",
        name: "L04实验记录本",
        mapId: "map_4",
        x: 500, y: 400,
        isUseful: true,
        description: "记录了‘记忆交换系统’的副作用：每一次交换都在割裂灵魂。",
        influence: { reason: -5, obsession: 8 }
      },
      {
        id: "clue_07",
        name: "树根下的泥土扰动",
        mapId: "map_3",
        x: 200, y: 300,
        isUseful: true,
        description: "这里明显有人挖过，地底下埋着一个没有名字的空骨灰盒。",
        influence: { reason: -8, obsession: 5 }
      },
      {
        id: "clue_08",
        name: "老何的对讲机",
        mapId: "map_3",
        x: 800, y: 650,
        isUseful: true,
        description: "对讲机里传来沙沙声，里面在重复播放林迟自己白天的声音。",
        influence: { reason: -5, obsession: 5 }
      },
      {
        id: "clue_09",
        name: "加密的主机屏幕",
        mapId: "map_4",
        x: 850, y: 300,
        isUseful: true,
        description: "屏幕亮着，显示‘回环实验已运行444次，受试者：林迟’。",
        influence: { reason: -10, obsession: 12 }
      },
      {
        id: "clue_10",
        name: "沈知夏留下的发卡",
        mapId: "map_4",
        x: 150, y: 600,
        isUseful: true,
        description: "发卡上刻着一个日期，那是林迟记忆中完全不存在的一天。",
        influence: { reason: 5, obsession: -2 }
      },

      // ---- 无用线索 (5个) ----
      {
        id: "clue_junk_06",
        name: "干燥的枯树枝",
        mapId: "map_3",
        x: 900, y: 200,
        isUseful: false,
        description: "一根随处可见的树枝，踩上去会断裂发出脆响。",
        influence: { reason: -1, obsession: 0 }
      },
      {
        id: "clue_junk_07",
        name: "空塑料矿泉水瓶",
        mapId: "map_3",
        x: 500, y: 450,
        isUseful: false,
        description: "普通的包装，生产日期是今年，里面全是泥沙。",
        influence: { reason: 0, obsession: 0 }
      },
      {
        id: "clue_junk_08",
        name: "废弃的橡胶手套",
        mapId: "map_4",
        x: 300, y: 200,
        isUseful: false,
        description: "实验室保洁用的医用手套，已经发黄老化了。",
        influence: { reason: 0, obsession: 0 }
      },
      {
        id: "clue_junk_09",
        name: "生锈的铁钉",
        mapId: "map_4",
        x: 700, y: 700,
        isUseful: false,
        description: "不知道从哪个设备上掉下来的螺丝铁钉。",
        influence: { reason: 0, obsession: 0 }
      },
      {
        id: "clue_junk_10",
        name: "一成不变的烂抹布",
        mapId: "map_3",
        x: 1100, y: 800,
        isUseful: false,
        description: "挂在小树林铁栅栏上的一块破布，毫无探索价值。",
        influence: { reason: 0, obsession: 0 }
      }
    ],

    // 传送点：连接地图3和地图4
    transferPoints: [
      { fromMap: 'map_3', toMap: 'map_4', x: 1100, y: 500, label: "进入地下通道", spawnX: 100, spawnY: 400 },
      { fromMap: 'map_4', toMap: 'map_3', x: 50, y: 400, label: "爬出地面", spawnX: 1000, spawnY: 500 }
    ]
  }
}