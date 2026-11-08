<template>
  <div class="home-container">
    <div class="title-section">
      <h1 class="game-title glitch-text">《 回 环 》</h1>
      <p class="game-subtitle">MUTED RECURSION • 校园悬疑剧情解谜</p >
    </div>

    <!-- 记忆碎片轮播 -->
    <GlitchCarousel :slides="memorySlides" :interval="4000" />

    <div v-if="!showCharacterSelect" class="menu-buttons">
      <button class="game-btn" @click="showCharacterSelect = true">进入潜意识</button>
      <button class="game-btn" @click="openModal('settings')">环境配置</button>
      <button class="game-btn" @click="openModal('team')">观测团队</button>
    </div>

    <div v-else class="character-select-section">
      <h3 class="select-title">—— 构筑你的初始人格意志 ——</h3>
      <div class="card-wrapper">
        <div class="char-card" @click="selectRole('理智型')">
          <div class="card-edge"></div>
          <h4>理智型</h4>
          <p>“保持绝对清醒，冷静观察细节，是斩断死循环的唯一钥匙。”</p >
          <span class="stat-preview">理智 50 | 执念 20</span>
        </div>
        <div class="char-card" @click="selectRole('偏执型')">
          <div class="card-edge"></div>
          <h4>偏执型</h4>
          <p>“哪怕把这层虚伪的现实彻底撕碎，我也一定要揪出幕后真凶。”</p >
          <span class="stat-preview">理智 30 | 执念 50</span>
        </div>
        <div class="char-card" @click="selectRole('逃避型')">
          <div class="card-edge"></div>
          <h4>逃避型</h4>
          <p>“如果这一切只是一场荒诞的噩梦……只要我能睡过去就安全了吧。”</p >
          <span class="stat-preview">理智 40 | 执念 10</span>
        </div>
      </div>
      <button class="game-btn back-btn" @click="showCharacterSelect = false">退回主层</button>
    </div>

    <div v-if="activeModal" class="modal-overlay" @click.self="activeModal = null">
      <div class="modal-content">
        <h3 class="modal-title">{{ activeModal === 'settings' ? '环境配置' : '制作团队' }}</h3>
        <hr class="modal-hr" />
        
        <div v-if="activeModal === 'settings'" class="settings-view">
          <div class="setting-item">
            <span>思维传导速度：</span>
            <select v-model="settings.textSpeed" class="game-select">
              <option :value="60">稳定脉冲 (60ms)</option>
              <option :value="30">高频感知 (30ms)</option>
              <option :value="10">超感爆发 (10ms)</option>
            </select>
          </div>
          <div class="setting-item">
            <span>环境噪音共鸣：</span>
            <input type="range" min="0" max="100" v-model="settings.volume" class="game-slider" />
            <span style="font-family: monospace;">{{ settings.volume }}%</span>
          </div>
        </div>

        <div v-if="activeModal === 'team'" class="team-view">
          <p><strong>实训项目：</strong>《回环》解谜系统</p >
          <p><strong>核心开发：</strong>方泽锋，颜嘉耀，颜综宏</p >
          <p><strong>指导老师：</strong>沈敏君</p >
          <p style="font-size:11px; color:#555; margin-top:20px;">© 2026 广州软件学院 软件工程专业实训小组</p >
        </div>

        <button class="game-btn close-btn" @click="activeModal = null">重置返回</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '../store/player'
import GlitchCarousel from '../components/GlitchCarousel.vue'

const router = useRouter()
const playerStore = usePlayerStore()

const showCharacterSelect = ref(false)
const activeModal = ref(null)

// 记忆碎片轮播数据（图片放 /public/images/carousel/ 下面）
const memorySlides = [
  {
    image: '/images/轮播图一.png',
    subtitle: '这里我好像来过…但又什么都想不起来',
    ambient: 'MEMORY FRAGMENT · 01',
  },
  {
    image: '/images/轮播图二.png',
    subtitle: '走廊尽头有人在叫我，但我一回头就消失了',
    ambient: 'MEMORY FRAGMENT · 02',
  },
  {
    image: '/images/轮播图三.png',
    subtitle: '那扇门后面是什么？我不敢打开',
    ambient: 'MEMORY FRAGMENT · 03',
  },
]

const settings = reactive({ textSpeed: 30, volume: 75 })
const openModal = (type) => activeModal.value = type

const selectRole = (type) => {
  playerStore.initCharacter(type)
  router.push('/chapter1')
}
</script>

<style scoped>
.home-container {
  width: 100vw; height: 100vh;
  background: url('/images/背景图.png') center/cover no-repeat;
  display: flex; flex-direction: column; justify-content: center; align-items: center; position: relative;
}
.home-container::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(circle at center, rgba(20,5,5,0.4) 0%, rgba(2,2,2,0.65) 100%);
  z-index: 0; pointer-events: none;
}
.title-section { text-align: center; margin-bottom: 24px; position: relative; z-index: 1; }
.game-title { font-size: 56px; margin: 0; letter-spacing: 16px; font-weight: 900; }
.game-subtitle { color: #555; font-size: 13px; letter-spacing: 5px; margin-top: 15px; }
.menu-buttons { display: flex; flex-direction: column; gap: 18px; width: 200px; margin-top: 30px; position: relative; z-index: 1; }
.character-select-section { text-align: center; animation: fadeIn 0.4s ease; position: relative; z-index: 1; }
.select-title { color: #888; font-size: 14px; margin-bottom: 35px; letter-spacing: 3px; font-weight: normal; }
.card-wrapper { display: flex; gap: 25px; margin-bottom: 40px; }
.char-card {
  background: rgba(15, 15, 15, 0.9); border: 1px solid #222; padding: 30px 22px;
  width: 210px; cursor: pointer; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); position: relative;
}
.char-card:hover {
  border-color: #8b0000; box-shadow: 0 10px 25px rgba(139, 0, 0, 0.3); transform: translateY(-5px);
}
.char-card h4 { color: #fff; font-size: 18px; margin: 0 0 15px 0; letter-spacing: 2px; }
.char-card p { font-size: 12px; color: #888; height: 55px; line-height: 1.6; margin: 0; text-align: left; }
.stat-preview { font-size: 11px; color: #555; display: block; margin-top: 20px; font-family: monospace; }
.back-btn { padding: 8px 20px; font-size: 13px; }
.modal-overlay { position: absolute; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.85); display: flex; justify-content: center; align-items: center; z-index: 20; }
.modal-content { background: #0f0f0f; border: 1px solid #333; padding: 35px; width: 420px; box-shadow: 0 15px 40px rgba(0,0,0,0.9); }
.modal-title { margin:0; color: #a81515; font-size: 18px; letter-spacing: 2px; }
.modal-hr { border: 0; height: 1px; background: #222; margin: 20px 0; }
.setting-item { margin: 20px 0; display: flex; align-items: center; justify-content: space-between; font-size: 13px; color: #aaa; }
.game-select { background: #1a1a1a; color: #ccc; border: 1px solid #444; padding: 5px; outline: none; }
.game-slider { accent-color: #a81515; cursor: pointer; }
.team-view p { line-height: 1.9; font-size: 13px; color: #999; margin: 8px 0; text-align: left; }
.close-btn { margin-top: 15px; padding: 6px 18px; font-size: 12px; }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
</style>