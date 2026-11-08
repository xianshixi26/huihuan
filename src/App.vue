<template>
  <div id="game-root">
    <router-view />
    <MemoryShop :isVisible="playerStore.isShopOpen" @close="playerStore.isShopOpen = false" />
    <SystemMessage :visible="msgStore.visible" :message="msgStore.message" @close="msgStore.hide" />
    <BrainstormingPanel v-if="brainstormClueId" :clueId="brainstormClueId" @close="brainstormClueId = null" />
    <PlayerProfile />
    <div v-if="playerStore.gameState === 'DEAD'" class="death-screen">
      <div class="death-card">
        <h1 v-if="playerStore.deathCause === '执念吞噬'">👁️ 执念吞噬</h1>
        <h1 v-else-if="playerStore.deathCause === '意识迷失'">🌀 意识迷失</h1>
        <h1 v-else>💀 意识断裂</h1>
        <p>{{ playerStore.statusDescription }}</p>
        <p class="death-cause">{{ playerStore.deathCause }}</p>
        <button class="game-btn" @click="handleRetry">重组意识</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, provide } from 'vue'
import MemoryShop from './components/MemoryShop.vue'
import SystemMessage from './components/SystemMessage.vue'
import BrainstormingPanel from './components/BrainstormingPanel.vue'
import PlayerProfile from './components/PlayerProfile.vue'
import { usePlayerStore } from './store/player'
import { useSystemMessage } from './store/systemMessage'
import { usePasswordStore } from './store/password'
import { useRouter } from 'vue-router'

const playerStore = usePlayerStore()
const msgStore = useSystemMessage()
const passwordStore = usePasswordStore()
const router = useRouter()

const brainstormClueId = ref(null)
provide('openBrainstorm', (id) => { brainstormClueId.value = id })

const handleRetry = () => {
  playerStore.fullReset()
  passwordStore.resetPasswords()
  router.push('/chapter1')
}
</script>

<style>
#game-root {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #0c0c0e;
}
.death-screen {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100000;
}
.death-card {
  background: #121214;
  border: 1px solid #5a2a2a;
  border-radius: 24px;
  padding: 32px;
  text-align: center;
  width: 380px;
}
.death-card h1 { color: #ff8888; margin-bottom: 12px; }
.death-cause { color: #ff4444; font-size: 12px; margin: 8px 0 16px; }
</style>