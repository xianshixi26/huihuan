<template>
  <div id="game-root">
    <router-view />
    <MemoryShop :isVisible="playerStore.isShopOpen" @close="playerStore.isShopOpen = false" />
    <SystemMessage :visible="msgStore.visible" :message="msgStore.message" @close="msgStore.hide" />
    <div v-if="playerStore.gameState === 'DEAD'" class="death-screen">
      <div class="death-card">
        <h1>意识断裂</h1>
        <p>理智归零，林迟永远迷失在循环中...</p>
        <button class="game-btn" @click="handleRetry">重组意识</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import MemoryShop from './components/MemoryShop.vue'
import SystemMessage from './components/SystemMessage.vue'
import { usePlayerStore } from './store/player'
import { useSystemMessage } from './store/systemMessage'
import { useRouter } from 'vue-router'

const playerStore = usePlayerStore()
const msgStore = useSystemMessage()
const router = useRouter()

const handleRetry = () => {
  playerStore.fullReset()
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
</style>