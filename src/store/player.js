import { defineStore } from 'pinia'

export const usePlayerStore = defineStore('player', {
  state: () => ({
    playerName: '林迟',
    personality: '',
    reason: 50,
    obsession: 20,
    currentChapter: 1,
    gameState: 'MENU',
    bag: [],
    isShopOpen: false
  }),

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
      this.gameState = 'PLAYING'
    },
    
    updateAttributes(rDelta, oDelta) {
      this.reason = Math.max(0, Math.min(100, this.reason + rDelta))
      this.obsession = Math.max(0, Math.min(100, this.obsession + oDelta))
      if (this.reason <= 0) {
        this.gameState = 'DEAD'
        this.isShopOpen = false
      }
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
    }
  }
})