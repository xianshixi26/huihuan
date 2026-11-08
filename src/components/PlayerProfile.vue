<template>
  <Transition name="profile-slide">
    <div v-if="playerStore.showProfile" class="profile-overlay" @click.self="playerStore.toggleProfile()">
      <div class="profile-panel">
        <!-- 头部 -->
        <div class="profile-header">
          <div class="avatar-ring" :class="sanityClass">
            <div class="avatar">👤</div>
          </div>
          <div class="header-info">
            <h3>{{ playerStore.playerName }}</h3>
            <p class="personality-tag">{{ personalityDesc }}</p>
          </div>
          <button class="close-btn" @click="playerStore.toggleProfile()">✕</button>
        </div>

        <!-- 属性 -->
        <div class="section">
          <div class="section-title">📊 精神刻印</div>
          <div class="attr-row">
            <span>🧠 理智</span>
            <div class="mini-bar"><div class="fill reason" :style="{ width: playerStore.reason + '%' }"></div></div>
            <span :class="{ low: playerStore.reason <= 20 }">{{ playerStore.reason }}/100</span>
          </div>
          <div class="attr-row">
            <span>👁️ 执念</span>
            <div class="mini-bar"><div class="fill obsession" :style="{ width: playerStore.obsession + '%' }"></div></div>
            <span :class="{ high: playerStore.obsession >= 60 }">{{ playerStore.obsession }}/100</span>
          </div>
          <p class="status-text">{{ playerStore.statusDescription }}</p>
        </div>

        <!-- 剧情回溯 -->
        <div class="section story-section">
          <div class="section-title">📖 剧情回溯 <span class="progress-num">{{ playerStore.storyProgress }}%</span></div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: playerStore.storyProgress + '%' }"></div>
          </div>
          <div class="story-log" v-if="sortedStories.length">
            <div v-for="entry in sortedStories" :key="entry.id" class="story-block">
              <div class="story-title">▎{{ entry.title }}</div>
              <div class="story-body">{{ entry.text }}</div>
            </div>
          </div>
          <div v-else class="empty-text">
            <p>记忆碎片尚未解锁…</p>
            <p class="empty-hint">与NPC对话、探索场景、收集线索来唤醒记忆</p>
          </div>
        </div>

        <!-- 已获取线索 -->
        <div class="section">
          <div class="section-title">🔍 已获取线索 ({{ clueCount }})</div>
          <div class="clue-list" v-if="clueItems.length">
            <div v-for="clue in clueItems" :key="clue.id" class="clue-entry" @click="selectedClueRef = selectedClueRef?.id === clue.id ? null : clue">
              <span class="clue-icon">{{ clue.type === 'clue' ? '📜' : '💬' }}</span>
              <span class="clue-name">{{ clue.name }}</span>
              <span class="clue-arrow">{{ selectedClueRef?.id === clue.id ? '▾' : '▸' }}</span>
              <div v-if="selectedClueRef?.id === clue.id" class="clue-detail">{{ selectedClueRef.desc }}</div>
            </div>
          </div>
          <p v-else class="empty-text">背包空空如也</p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePlayerStore } from '../store/player'

const playerStore = usePlayerStore()
const selectedClueRef = ref(null)

const sanityClass = computed(() => {
  if (playerStore.sanityTier === 'high') return 'ring-high'
  if (playerStore.sanityTier === 'mid') return 'ring-mid'
  return 'ring-low'
})

const personalityDesc = computed(() => {
  const p = playerStore.personality
  if (p === '理智型') return '冷静观察者 · 逻辑优先'
  if (p === '偏执型') return '真相追寻者 · 不择手段'
  if (p === '逃避型') return '沉默回避者 · 自我保护'
  return '未选择人格'
})

const clueCount = computed(() => playerStore.bag.filter(i => i.type === 'clue').length)
const clueItems = computed(() => playerStore.bag.filter(i => i.type === 'clue'))

const sortedStories = computed(() => {
  return [...playerStore.storyLog].sort((a, b) => {
    if (a.chapter !== b.chapter) return a.chapter - b.chapter
    return playerStore.unlockedStoryIds.indexOf(a.id) - playerStore.unlockedStoryIds.indexOf(b.id)
  })
})
</script>

<style scoped>
.profile-overlay {
  position: fixed; inset: 0; z-index: 5000;
  background: rgba(0,0,0,0.7);
  display: flex; justify-content: flex-end;
}
.profile-panel {
  width: 400px; height: 100vh;
  background: linear-gradient(180deg, #12141a 0%, #0a0c10 100%);
  border-left: 1px solid #252830;
  overflow-y: auto;
  padding: 24px 20px;
  display: flex; flex-direction: column; gap: 20px;
  box-shadow: -8px 0 30px rgba(0,0,0,0.5);
}

/* 头部 */
.profile-header {
  display: flex; align-items: center; gap: 14px;
}
.avatar-ring {
  width: 52px; height: 52px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  border: 3px solid #3a3d44;
}
.ring-high { border-color: #3a6b4a; box-shadow: 0 0 10px rgba(58,107,74,0.3); }
.ring-mid  { border-color: #8a7550; box-shadow: 0 0 10px rgba(138,117,80,0.3); }
.ring-low  { border-color: #8b1a1a; box-shadow: 0 0 10px rgba(139,26,26,0.3); }
.avatar { font-size: 26px; }
.header-info h3 { font-size: 16px; color: #e8eaf0; margin: 0; }
.personality-tag { font-size: 11px; color: #6a6e76; margin: 2px 0 0 0; }
.close-btn { margin-left: auto; background: none; border: none; color: #6a6e76; font-size: 18px; cursor: pointer; }
.close-btn:hover { color: #e8eaf0; }

/* 区块 */
.section { background: #1a1c24; border-radius: 10px; padding: 14px; }
.section-title { font-size: 12px; color: #8a7550; margin-bottom: 10px; letter-spacing: 1px; font-weight: 600; }

/* 属性条 */
.attr-row { display: flex; align-items: center; gap: 10px; margin: 8px 0; font-size: 13px; }
.mini-bar { flex: 1; height: 6px; background: #252830; border-radius: 3px; overflow: hidden; }
.fill { height: 100%; transition: width 0.3s; }
.reason { background: #5a8a6a; }
.obsession { background: #8b5a2a; }
.low { color: #ff8888; }
.high { color: #ff6666; }
.status-text { font-size: 11px; color: #6a6e76; margin-top: 8px; font-style: italic; }

/* 进度条 */
.progress-num { float: right; font-size: 11px; color: #8a7550; }
.progress-bar { height: 6px; background: #252830; border-radius: 3px; overflow: hidden; margin: 8px 0 12px; }
.progress-fill { height: 100%; background: linear-gradient(90deg, #2d5a52, #5a8a6a); transition: width 0.5s; }

/* 剧情日志 */
.story-section .section { flex: 1; }
.story-log { max-height: 320px; overflow-y: auto; }
.story-block { padding: 12px 0; border-bottom: 1px solid #1e2028; }
.story-block:last-child { border-bottom: none; }
.story-title { font-size: 13px; color: #8a7550; font-weight: 600; margin-bottom: 8px; letter-spacing: 1px; }
.story-body { font-size: 13px; color: #b0b4ba; line-height: 1.8; text-indent: 2em; }
.empty-hint { font-size: 11px; color: #3a3d44; margin-top: 6px; }

/* 线索列表 */
.clue-list { max-height: 240px; overflow-y: auto; }
.clue-entry { padding: 8px 0; border-bottom: 1px solid #252830; cursor: pointer; display: flex; align-items: flex-start; gap: 8px; flex-wrap: wrap; }
.clue-entry:hover { background: rgba(255,255,255,0.02); }
.clue-icon { font-size: 14px; }
.clue-name { font-size: 13px; color: #c8ccd4; flex: 1; }
.clue-arrow { color: #6a6e76; font-size: 11px; }
.clue-detail { width: 100%; padding: 8px 0 0 22px; font-size: 12px; color: #8a8890; line-height: 1.6; border-top: 1px dashed #252830; margin-top: 4px; }
.empty-text { font-size: 12px; color: #4a4d54; text-align: center; padding: 20px 0; }

/* 动画 */
.profile-slide-enter-active { transition: all 0.3s ease; }
.profile-slide-leave-active { transition: all 0.25s ease; }
.profile-slide-enter-from .profile-panel { transform: translateX(100%); }
.profile-slide-enter-to .profile-panel { transform: translateX(0); }
.profile-slide-leave-from .profile-panel { transform: translateX(0); }
.profile-slide-leave-to .profile-panel { transform: translateX(100%); }
.profile-slide-enter-from { opacity: 0; }
.profile-slide-enter-to { opacity: 1; }
.profile-slide-leave-from { opacity: 1; }
.profile-slide-leave-to { opacity: 0; }
</style>
