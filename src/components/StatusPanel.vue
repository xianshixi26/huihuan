<!-- src/components/StatusPanel.vue -->
<template>
  <div class="status-hud">
    <div class="stat-card">
      <div class="stat-header">🧠 理智</div>
      <div class="bar"><div class="fill reason" :style="{ width: playerStore.reason + '%' }"></div></div>
      <div class="stat-value" :class="{ low: playerStore.reason <= 20 }">{{ playerStore.reason }}/100</div>
    </div>
    <div class="stat-card">
      <div class="stat-header">👁️ 执念</div>
      <div class="bar"><div class="fill obsession" :style="{ width: playerStore.obsession + '%' }"></div></div>
      <div class="stat-value" :class="{ high: playerStore.obsession >= 40 }">{{ playerStore.obsession }}/100</div>
      <div class="action-group">
        <button class="hud-btn" @click="openExchange">🔮 记忆交换</button>
        <button class="hud-btn" @click="toggleBag">🎒 背包 ({{ totalCount }})</button>
      </div>
    </div>

    <!-- 背包模态框 -->
    <div v-if="showBag" class="modal" @click.self="showBag = false">
      <div class="bag-panel">
        <div class="bag-title"><span>🎒 行囊</span><button class="close" @click="showBag = false">✕</button></div>
        <div class="tabs">
          <button v-for="tab in tabs" :key="tab.id" :class="{ active: currentTab === tab.id }" @click="currentTab = tab.id">{{ tab.name }}</button>
        </div>
        <div class="items">
          <div v-for="item in filtered" :key="item.id" class="item-row">
            <div class="item-icon">{{ getIcon(item.type) }}</div>
            <div class="item-info">
              <strong>{{ item.name }}</strong><span v-if="item.count > 1" class="count">x{{ item.count }}</span>
              <div class="desc">{{ item.desc }}</div>
            </div>
            <div class="item-action">
              <button v-if="item.type === 'medicine'" class="use" @click="useItem(item.id)">使用</button>
            </div>
          </div>
          <div v-if="!filtered.length" class="empty">空空如也</div>
        </div>
      </div>
    </div>

    <!-- 记忆交换模态框 -->
    <div v-if="showExchange" class="modal" @click.self="closeExchange">
      <div class="exchange-panel">
        <h3>🔮 潜意识记忆交换</h3>
        <p class="warn">⚠️ 每次交换消耗 20 理智</p>
        <p>当前章节：第 {{ playerStore.currentChapter || 1 }} 章</p>
        <button class="game-btn" @click="handleExchange">注入 20 理智 · 强制交换</button>
        <div v-if="exchangeMsg" class="result">{{ exchangeMsg }}</div>
        <button class="close-btn" @click="closeExchange">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePlayerStore } from '../store/player'
import { useSystemMessage } from '../store/systemMessage'

const playerStore = usePlayerStore()
const msgStore = useSystemMessage()
const showBag = ref(false)
const showExchange = ref(false)
const exchangeMsg = ref('')
const currentTab = ref('all')

const tabs = [
  { id: 'all', name: '全部' },
  { id: 'medicine', name: '💊 药品' },
  { id: 'clue', name: '🔍 线索' }
]

const cluesPool = {
  1: [
    { id: 'clue_paper', name: '沈知夏的草稿纸', desc: '“不能再掉理智了...”' },
    { id: 'clue_log', name: '值日生日志', desc: '“林迟会修改告示”' },
    { id: 'graffiti', name: '血字墙痕', desc: '倒写数字“8421”' }
  ],
  2: [
    { id: 'notes', name: 'L04实验记录本', desc: '回环实验第444次' },
    { id: 'clue_screen', name: '加密主机屏幕', desc: '因果率偏移' }
  ],
  3: [
    { id: 'leaves', name: '旧照片', desc: '“只有献祭执念”' },
    { id: 'clue_badge', name: '带血校徽', desc: '生锈的1967年' }
  ],
  4: [
    { id: 'clue_truth', name: '因果核心气泡', desc: '黑化人格的阴谋' }
  ]
}

const totalCount = computed(() => playerStore.bag.reduce((s, i) => s + i.count, 0))
const filtered = computed(() => {
  if (currentTab.value === 'all') return playerStore.bag
  return playerStore.bag.filter(i => i.type === currentTab.value)
})

const getIcon = (type) => type === 'medicine' ? '💊' : '📜'
const useItem = (id) => playerStore.useMedicineItem(id)

const toggleBag = () => {
  showBag.value = !showBag.value
  showExchange.value = false
}
const openExchange = () => {
  showExchange.value = true
  showBag.value = false
  exchangeMsg.value = ''
}
const closeExchange = () => {
  showExchange.value = false
  exchangeMsg.value = ''
}

const handleExchange = () => {
  if (playerStore.reason <= 20) {
    exchangeMsg.value = '❌ 理智不足，无法交换'
    return
  }
  const ch = playerStore.currentChapter || 1
  const pool = cluesPool[ch] || []
  const uncollected = pool.filter(c => !playerStore.bag.some(i => i.id === c.id))
  if (!uncollected.length) {
    exchangeMsg.value = '👁️ 本章线索已集齐'
    return
  }
  playerStore.updateAttributes(-20, 0)
  const picked = uncollected[Math.floor(Math.random() * uncollected.length)]
  exchangeMsg.value = `🔮 获得：「${picked.name}」`
  playerStore.addItemToBag({ ...picked, type: 'clue', count: 1 })
}
</script>

<style scoped>
.status-hud {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 100;
  display: flex;
  gap: 16px;
  font-family: 'Courier New', 'Inter', monospace;
}
.stat-card {
  background: rgba(16, 16, 18, 0.85);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 10px 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.5);
}
.stat-header {
  font-size: 13px;
  font-weight: 600;
  color: #c0c0c4;
}
.bar {
  width: 120px;
  height: 6px;
  background: #2a2a2e;
  border-radius: 3px;
  overflow: hidden;
}
.fill {
  height: 100%;
  transition: width 0.2s;
}
.reason { background: #7a3a3a; box-shadow: 0 0 4px #b55; }
.obsession { background: #b57a2a; }
.stat-value {
  width: 55px;
  text-align: right;
  font-size: 13px;
  font-weight: 500;
}
.low { color: #ff8888; }
.high { color: #ffaa66; }
.action-group {
  display: flex;
  gap: 12px;
  margin-left: 16px;
  padding-left: 16px;
  border-left: 1px solid rgba(255,255,255,0.1);
}
.hud-btn {
  background: #2a2a2e;
  border: none;
  border-radius: 20px;
  padding: 4px 14px;
  font-size: 12px;
  font-weight: 500;
  color: #ddd;
  transition: 0.1s;
}
.hud-btn:hover {
  background: #4a4a4e;
  color: white;
}
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}
.bag-panel, .exchange-panel {
  background: #121214;
  border: 1px solid #3a3a3e;
  border-radius: 20px;
  width: 560px;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.bag-title {
  padding: 14px 20px;
  border-bottom: 1px solid #2a2a2e;
  display: flex;
  justify-content: space-between;
  font-weight: 600;
}
.tabs {
  display: flex;
  gap: 4px;
  padding: 8px 16px;
  background: #1a1a1c;
}
.tabs button {
  background: none;
  border: none;
  padding: 6px 14px;
  border-radius: 20px;
  color: #aaa;
  font-size: 12px;
}
.tabs button.active {
  background: #3a3a3e;
  color: white;
}
.items {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.item-row {
  background: #1e1e22;
  border-radius: 12px;
  padding: 10px;
  display: flex;
  align-items: center;
  gap: 14px;
}
.item-icon { font-size: 28px; }
.item-info { flex: 1; }
.desc { font-size: 12px; color: #aaa; margin-top: 4px; }
.count { color: #c0a080; margin-left: 6px; }
.use { background: #2a4a2a; border: none; border-radius: 20px; padding: 4px 12px; color: white; cursor: pointer; }
.empty { text-align: center; padding: 40px; color: #666; }
.exchange-panel {
  width: 420px;
  text-align: center;
  padding: 24px;
  gap: 12px;
}
.warn { font-size: 12px; color: #a0a0a4; }
.result { background: #1a1a1c; padding: 10px; border-left: 3px solid #c0a080; margin-top: 12px; font-size: 13px; }
.close-btn { background: #2a2a2e; border: none; padding: 6px; border-radius: 8px; margin-top: 8px; cursor: pointer; }
</style>