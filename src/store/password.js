import { defineStore } from 'pinia'

// 每章多组密码池：数字、字母数字组合、中文
const passwordPools = {
  1: [
    { pass: '8421', hint: '倒过来看世界，时间会给你答案' },
    { pass: '0723', hint: '那天晚上，他再也没有回来' },
    { pass: 'L1N2', hint: '姓氏藏头，名字藏尾' },
    { pass: '回', hint: '一个框，一张口，困住了什么' },
    { pass: 'A3C1', hint: '教室的坐标，藏着出口的钥匙' },
  ],
  2: [
    { threshold: 50, pass: '50', hint: '一半是生，一半是死' },
    { threshold: 33, pass: '33', hint: '三生三死，循环不息' },
    { threshold: 77, pass: '77', hint: '双七之数，阴阳交替' },
    { threshold: 42, pass: '42', hint: '生命、宇宙、一切的答案' },
    { threshold: 61, pass: '61', hint: '倒过来看，也许数字会说话' },
    { threshold: 37, pass: '37', hint: '生命、宇宙与一切的碎片' },
  ],
  3: [
    { pass: '忘', hint: '心上一个亡，唯有放下才能离开' },
    { pass: '蛇', hint: '第六个生肖，诱惑与欺骗' },
    { pass: 'XU3', hint: '班长的姓氏，三心二意的三' },
    { pass: '旧', hint: '一日之隔，昨日之日不可留' },
    { pass: 'M7R', hint: '镜像倒看，也许就是出口' },
    { pass: '37', hint: '十二与一，循环与终结之间' },
  ],
}

export const usePasswordStore = defineStore('password', {
  state: () => ({
    chapterPasswords: {},
    initialized: false,
  }),

  actions: {
    initPasswords(force = false) {
      if (this.initialized && !force) return
      for (const ch of [1, 2, 3]) {
        const pool = passwordPools[ch]
        const picked = pool[Math.floor(Math.random() * pool.length)]
        this.chapterPasswords[ch] = { ...picked }
      }
      this.initialized = true
    },

    getPassword(chapter) {
      return this.chapterPasswords[chapter]?.pass || null
    },

    getHint(chapter) {
      return this.chapterPasswords[chapter]?.hint || ''
    },

    getThreshold(chapter) {
      return this.chapterPasswords[chapter]?.threshold || 50
    },

    resetPasswords() {
      this.chapterPasswords = {}
      this.initialized = false
      this.initPasswords()
    },
  },
})
