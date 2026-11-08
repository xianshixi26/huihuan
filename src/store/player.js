import { defineStore } from 'pinia'

// 剧情文本库：每段都是小说式叙事，通过特定事件触发解锁
const STORY_CONTENT = {
  s1_ch1_start: {
    chapter: 1, title: '深夜返校',
    text: '9月23日，凌晨1:47。林迟推开教学楼的大门，走廊里空无一人。他本该在家睡觉，但数学作业落在了教室课桌里——明天不交的话，陈老师不会放过他。整栋楼安静得不正常，走廊顶灯发出微弱的嗡鸣声，像是某种老旧机器的喘息。'
  },
  s2_ch1_abnormal: {
    chapter: 1, title: '停滞的时间',
    text: '林迟看了一眼手机——1:47。他走过走廊，推开教室门，找到作业，又看了一眼手机。还是1:47。他等了30秒，再看了一眼。1:47。秒针在动，但分钟从未前进。墙上挂钟的钟摆停在了同一个位置，像是被一只无形的手按住了。'
  },
  s3_ch1_zhouye: {
    chapter: 1, title: '周野的出现',
    text: '就在林迟盯着时钟发愣的时候，身后传来一个熟悉的声音。"林迟？你也在这里？"是他的挚友周野，手里也拿着几本书，表情却不像平时那样轻松。周野说他也是来取东西的——但他的眼神在闪烁，似乎隐瞒了什么。他最后低声说了一句："我好像来过这里……不止一次。"'
  },
  s4_ch1_rule: {
    chapter: 1, title: '不要回头',
    text: '走廊墙壁上有一行暗红色的字，像是用指甲刮出来的：不要回头。林迟本能地想回头看，但周野猛地抓住了他的肩膀。"别回头，"周野的声音在发抖，"上次我就是回了头，然后……就什么都不记得了。"墙壁上的字迹还在往下渗着什么，浓稠的，暗红色的。'
  },
  s5_ch1_paper: {
    chapter: 1, title: '沈知夏的草稿纸',
    text: '在教室内的一张课桌上，林迟发现了半张草稿纸。上面潦草地画着箭头、数字，还有一个被反复涂改的红叉。纸上的字迹是沈知夏的——那个安静的女孩，总喜欢坐在窗边。她在这张纸上反复计算着同一个问题：理智如果归零，会发生什么？她的结论是——永远困在循环里。'
  },
  s6_ch1_password: {
    chapter: 1, title: '走廊尽头的门',
    text: '走廊尽头有一扇旧木门，上面装着一个老式密码锁。周野说他试过很多次，每次都打不开——密码好像每次都不一样。林迟注意到门框上刻着一行小字，像是某种提示。也许答案不在锁上，而是藏在周围的环境里。墙上的数字、课桌里的纸片、同学的对话——这些碎片拼在一起，可能就是钥匙。'
  },

  s7_ch2_lab: {
    chapter: 2, title: '地下实验室',
    text: '穿过木门，林迟发现自己来到了一个完全陌生的空间——一间隐藏在教学楼地下的实验室。空气中弥漫着化学试剂的气味，实验台上散落着试管和记录本。墙壁上覆盖着密密麻麻的笔记，全是关于同一场实验的记录。实验名称被涂黑了，但受试者的名字还隐约可辨：林迟。'
  },
  s8_ch2_experiment: {
    chapter: 2, title: 'L04实验记录',
    text: '林迟翻开那本标着L04的实验记录。大部分内容被黑色记号笔涂掉了，但零散的词语拼凑出一个恐怖的事实：学校进行过一场叫"执念提取"的实验，试图将人的负面情绪分离出来，创造出"完美的人格"。副作用远比想象中严重——受试者开始出现人格分裂、记忆错乱，以及一种被描述为"循环感知"的症状。'
  },
  s9_ch2_shen: {
    chapter: 2, title: '沈知夏的真相',
    text: '在实验室里，沈知夏再次出现。这一次她不再拐弯抹角。"我是第443号受试者，"她说，声音很轻，但每个字都像是在冰面上敲击。"你是444号。我们的执念被提取出来，封存在了这些仪器里。但执念不会消失——它变成了另一个人格，不断修改我们看到的现实。"她指着主机屏幕上的数字："你已经在这个循环里失败了444次。"'
  },
  s10_ch2_444: {
    chapter: 2, title: '444次循环',
    text: '主机屏幕上跳动的数据让林迟感到一阵眩晕。444次。他经历了444次循环，而每一次都以失败告终。不是444次不同的循环——是同一个夜晚，重复了444遍。他一次次回到教室，一次次走到这扇门前，一次次试图逃脱。每一次他都失败了。但有两次——数据里有两次异常——他成功逃脱过，只是他不记得了，因为记忆被强制清除。'
  },

  s11_ch3_forest: {
    chapter: 3, title: '深夜的小树林',
    text: '穿过实验室的通道，林迟来到了学校后山的小树林。月光透过稀疏的树枝洒在地上，一切都笼罩在一种不真实的寂静中。他认得这里——一年前，他和几个同学曾经在这里偷偷聚会。那晚发生了什么？为什么从那之后，一切都变了？树下埋着什么东西，土层明显被人翻动过。'
  },
  s12_ch3_photo: {
    chapter: 3, title: '旧照片',
    text: '在一棵老榕树的树根旁，林迟发现了一张泛黄的旧照片。照片上是他自己——但不是现在这个样子。照片里的他正和几个同学一起笑，背景是老校区的教学楼。照片背面有一行被水浸模糊的字：循环无法打破，除非……后面的字迹已经完全看不清了。照片右下角的日期是去年的9月23日。'
  },
  s13_ch3_laohe: {
    chapter: 3, title: '老何的警告',
    text: '保安老何在门卫小屋里，用一种复杂的神情看着林迟。"你终于来了，"他说，从口袋里摸出一支皱巴巴的烟，"你每次都会来。有时候你敲门，有时候你翻墙，有时候你根本不认识我。但每次，你都会走到这扇门前。"他递过来一张裹在烟卷里的纸条，上面只有一句话：林迟，你已经死在444次循环里了。'
  },
  s14_ch3_gate: {
    chapter: 3, title: '隐藏的校门',
    text: '老何身后的小屋里，隐藏着一扇从未被打开的门。老何说这扇门只有"放下执念"的人才能推开。门上的密码锁刻着十二生肖的图案，其中一个位置是空的。"每个人看到的空位都不一样，"老何吐了一口烟，"你看到的那个空位，就是你最放不下的东西。填上它，门就会开。"'
  },
}

export const usePlayerStore = defineStore('player', {
  state: () => ({
    playerName: '林迟',
    personality: '',
    reason: 50,
    obsession: 20,
    currentChapter: 1,
    gameState: 'MENU',
    bag: [],
    isShopOpen: false,
    deductionConnections: [],
    completedDeductions: [],
    statusEffect: null,
    deathCause: '',
    storyProgress: 0,
    storyLog: [],
    unlockedStoryIds: [],
    showProfile: false,
  }),

  getters: {
    sanityTier(state) {
      if (state.reason >= 60) return 'high'
      if (state.reason >= 30) return 'mid'
      return 'low'
    },
    obsessionRatio(state) {
      if (state.reason <= 0) return 999
      return (state.obsession / state.reason).toFixed(2)
    },
    isInDanger(state) {
      return state.obsession >= 60 || state.reason <= 20
    },
    statusDescription(state) {
      const tier = this.sanityTier
      const ratio = parseFloat(this.obsessionRatio)
      if (state.reason <= 0) return '意识已断裂，林迟永远迷失在循环中...'
      if (state.obsession >= 80) return '执念即将吞噬一切，你感到另一个自己在苏醒...'
      if (ratio >= 2.0) return '执念远大于理智，你已经开始分不清现实和幻觉...'
      if (ratio >= 1.0) return '执念与理智正在对抗，线索变得模糊不清...'
      if (tier === 'low') return '理智所剩无几，周围的景象开始扭曲...'
      if (tier === 'mid') return '思维尚算清晰，但偶尔会感到一阵眩晕...'
      return '头脑清醒，你能敏锐地察觉到事态的真相。'
    },
  },

  actions: {
    initCharacter(type) {
      this.personality = type
      if (type === '理智型') {
        this.reason = 50
        this.obsession = 20
      } else if (type === '偏执型') {
        this.reason = 30
        this.obsession = 50
      } else if (type === '逃避型') {
        this.reason = 40
        this.obsession = 10
      }
      this.bag = []
      this.deductionConnections = []
      this.completedDeductions = []
      this.statusEffect = null
      this.deathCause = ''
      this.storyProgress = 0
      this.storyLog = []
      this.unlockedStoryIds = []
      this.gameState = 'PLAYING'
    },

    updateAttributes(rDelta, oDelta) {
      this.reason = Math.max(0, Math.min(100, this.reason + rDelta))
      this.obsession = Math.max(0, Math.min(100, this.obsession + oDelta))

      // 死亡条件1：理智归零
      if (this.reason <= 0) {
        this.gameState = 'DEAD'
        this.deathCause = '精神崩溃'
        this.isShopOpen = false
        return 'DEAD'
      }

      // 死亡条件2：执念过高触发假结局
      if (this.obsession >= 80) {
        this.gameState = 'DEAD'
        this.deathCause = '执念吞噬'
        this.isShopOpen = false
        return 'FAKE_ENDING'
      }

      // 危险状态：执念/理智比值过高
      const ratio = this.reason > 0 ? this.obsession / this.reason : 999
      if (ratio >= 2.5 && this.reason <= 25) {
        this.gameState = 'DEAD'
        this.deathCause = '意识迷失'
        this.isShopOpen = false
        return 'LOST'
      }

      // 状态效果更新
      if (this.reason < 20) {
        this.statusEffect = 'dizzy'
      } else if (this.obsession >= 60) {
        this.statusEffect = 'haunted'
      } else {
        this.statusEffect = null
      }

      return null
    },

    // 完全重置游戏（用于强行突围死亡）
    fullReset() {
      const personality = this.personality || '理智型'
      if (personality === '理智型') {
        this.reason = 50
        this.obsession = 20
      } else if (personality === '偏执型') {
        this.reason = 30
        this.obsession = 50
      } else if (personality === '逃避型') {
        this.reason = 40
        this.obsession = 10
      }
      this.currentChapter = 1
      this.bag = []
      this.deductionConnections = []
      this.completedDeductions = []
      this.statusEffect = null
      this.deathCause = ''
      this.storyProgress = 0
      this.storyLog = []
      this.unlockedStoryIds = []
      this.gameState = 'PLAYING'
      this.isShopOpen = false
    },

    addItemToBag(item) {
      const existing = this.bag.find(i => i.id === item.id)
      if (existing) {
        if (item.type !== 'clue' && item.type !== 'map') {
          existing.count += (item.count || 1)
          return true
        }
        return false
      } else {
        this.bag.push({ ...item, count: item.count || 1 })
        return true
      }
    },

    useMedicineItem(itemId) {
      const index = this.bag.findIndex(i => i.id === itemId)
      if (index !== -1) {
        const item = this.bag[index]
        if (item.type === 'medicine' && item.count > 0) {
          this.reason = Math.min(100, this.reason + (item.effectValue || 0))
          item.count--
          if (item.count <= 0) {
            this.bag.splice(index, 1)
          }
          return true
        }
      }
      return false
    },

    hasClueByName(clueName) {
      return this.bag.some(i => i.type === 'clue' && i.name === clueName)
    },

    recordDeduction(fromId, toId, chainName, isCorrect) {
      const exists = this.deductionConnections.some(
        c => (c.fromId === fromId && c.toId === toId) || (c.fromId === toId && c.toId === fromId)
      )
      if (!exists) {
        this.deductionConnections.push({ fromId, toId, chainName, isCorrect })
      }
      if (chainName && isCorrect && !this.completedDeductions.includes(chainName)) {
        this.completedDeductions.push(chainName)
      }
    },

    checkDeathConditions() {
      if (this.reason <= 0) { this.gameState = 'DEAD'; this.deathCause = '精神崩溃'; return 'DEAD' }
      if (this.obsession >= 80) { this.gameState = 'DEAD'; this.deathCause = '执念吞噬'; return 'FAKE_ENDING' }
      return null
    },
    // 解锁剧情段落（传入 storyId，从 STORY_CONTENT 读取）
    unlockStory(storyId) {
      if (this.unlockedStoryIds.includes(storyId)) return
      const content = STORY_CONTENT[storyId]
      if (!content) return
      this.unlockedStoryIds.push(storyId)
      this.storyLog.push({ id: storyId, chapter: content.chapter, title: content.title, text: content.text })
      const totalStories = Object.keys(STORY_CONTENT).length
      this.storyProgress = Math.min(100, Math.floor((this.unlockedStoryIds.length / totalStories) * 100))
    },
    get storyContent() { return STORY_CONTENT },
    get totalStoryCount() { return Object.keys(STORY_CONTENT).length },
    toggleProfile() { this.showProfile = !this.showProfile },
  },
})
