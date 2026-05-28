<!-- src/components/MemoryShop.vue -->
<template>
  <div class="memory-shop-overlay" v-if="isVisible" @click.self="$emit('close')">
    <div class="shop-content">
      <h3>🔮 潜意识记忆交换</h3>
      <p class="warning">警告：窥探记忆将消耗精神稳定性（20 理智/次）。</p>
      <div class="shop-actions">
        <button class="exec-btn" @click="handleExchange">注入 20 理智强制交换线索物品</button>
      </div>
      <button class="close-btn" @click="$emit('close')">关闭面板</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { usePlayerStore } from '../store/player'
import { useSystemMessage } from '../store/systemMessage'

const props = defineProps(['isVisible'])
const emit = defineEmits(['close'])

const playerStore = usePlayerStore()
const msgStore = useSystemMessage()

const localCluesPool = {
  1: [
    { id: 'clue_paper', name: '沈知夏的草稿纸', desc: '【Ch.1 核心物证】上面记录着模糊的数字公式，写着理智绝对不能归零。' },
    { id: 'clue_log', name: '值日生日志', desc: '【Ch.1 核心物证】最后一页记录着：‘注意，执念·林迟已经出现，他会修改告示’。' },
    { id: 'graffiti', name: '黑板上的血字墙痕', desc: '【Ch.1 核心物证】隐约留下了一行倒写的暗红色数字：‘8421’。' }
  ],
  2: [
    { id: 'notes', name: 'L04实验记录本', desc: '【Ch.2 核心物证】记录了回环实验的副作用：每一次交换都在割裂灵魂。' },
    { id: 'clue_screen', name: '加密的主机屏幕', desc: '【Ch.2 核心物证】系统提示：‘回环实验已运行444次，受试者：林迟’。' }
  ],
  3: [
    { id: 'leaves', name: '神秘的旧照片', desc: '【Ch.3 核心物证】老校区背景的合照，背面写着：‘循环无法打破，除非...’' },
    { id: 'clue_badge', name: '带血的校徽', desc: '【Ch.3 核心物证】卡在地缝里的旧校徽，正面刻着属于林迟的学号。' }
  ],
  4: [
    { id: 'clue_truth', name: '因果核心气泡', desc: '【Ch.4 核心物证】世界真相：黑化人格正在试图将你永久抹杀在循环中。' }
  ]
}

const handleExchange = () => {
  if (playerStore.reason <= 20) {
    msgStore.show('❌ 你的理智值不足，无法承受记忆扭曲！')
    return
  }

  const currentCh = playerStore.currentChapter || 1
  const currentChPool = localCluesPool[currentCh] || []
  const uncollected = currentChPool.filter(clue => !playerStore.bag.some(item => item.id === clue.id))
  
  if (uncollected.length > 0) {
    playerStore.updateAttributes(-20, 0)
    const randomPick = uncollected[Math.floor(Math.random() * uncollected.length)]
    msgStore.show(`🔮 核心物证具现化成功！获得：《${randomPick.name}》，已同步至行囊背包中。`)
    playerStore.addItemToBag({
      id: randomPick.id,
      name: randomPick.name,
      type: 'clue',
      desc: randomPick.desc,
      count: 1
    })
  } else {
    msgStore.show('👁️ 脑海中的因果线已完全解开，本章节全部核心线索已在行囊中。')
  }
  emit('close')
}
</script>

<style scoped>
.memory-shop-overlay {
  position: fixed; 
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 5, 5, 0.92);
  display: flex; 
  justify-content: center;
  align-items: center;
  z-index: 2000;
}
.shop-content {
  background: #121214; 
  border: 1px solid #b71c1c; 
  padding: 30px;
  color: #eee; 
  width: 420px; 
  text-align: center; 
  box-shadow: 0 0 30px rgba(183,28,28,0.4);
  border-radius: 2px;
}
h3 { margin: 0 0 10px 0; font-size: 16px; color: #e53935; letter-spacing: 1px; }
.warning { font-size: 11px; color: #888; margin-bottom: 20px; }
.shop-actions { margin: 20px 0; }
.exec-btn {
  width: 100%; background: #4a148c; border: 1px solid #7b1fa2; color: #fff;
  font-size: 12px; padding: 12px; cursor: pointer; font-weight: bold; letter-spacing: 1px;
}
.close-btn { margin-top: 20px; background: #333; color: #fff; border: none; padding: 8px 16px; cursor: pointer; width: 100%; font-size: 11px; }
.close-btn:hover { background: #444; }
</style>