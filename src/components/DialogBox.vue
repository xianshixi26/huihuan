<!-- src/components/DialogBox.vue -->
<template>
  <div class="dialog-container">
    <div v-if="speaker" class="speaker-tag">✦ {{ speaker }}</div>
    <div class="dialog-text">
      <span>{{ displayedText }}</span>
      <span v-if="isTyping" class="cursor">_</span>
    </div>
    <div v-if="!isTyping && options?.length" class="options-area">
      <div v-for="(opt, idx) in options" :key="idx" class="option" @click="selectOption(opt)">
        <span class="bullet">▶</span> {{ opt.text }}
      </div>
    </div>
    <div v-else-if="!isTyping" class="next-hint" @click="emitNext">▼ 继续</div>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import { usePlayerStore } from '../store/player'

const props = defineProps({
  speaker: String,
  text: String,
  options: Array,
})
const emit = defineEmits(['next', 'select-option'])
const playerStore = usePlayerStore()

const displayedText = ref('')
const isTyping = ref(false)
let timer = null

const startTyping = () => {
  if (timer) clearInterval(timer)
  displayedText.value = ''
  isTyping.value = true
  let index = 0
  let speed = 25
  if (playerStore.reason < 30) speed = 50
  if (playerStore.reason < 15) speed = 80
  timer = setInterval(() => {
    if (index < props.text.length) {
      displayedText.value += props.text[index]
      index++
    } else {
      clearInterval(timer)
      isTyping.value = false
    }
  }, speed)
}

const emitNext = () => {
  if (props.options?.length) return
  emit('next')
}

const selectOption = (opt) => {
  emit('select-option', opt)
}

watch(() => props.text, () => {
  if (props.text) startTyping()
}, { immediate: true })

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.dialog-container {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  width: 1100px;
  background: rgba(12, 12, 14, 0.96);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px 28px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
  z-index: 20;
}
.speaker-tag {
  position: absolute;
  top: -20px;
  left: 24px;
  background: #2a2a2e;
  border: 1px solid #5a5a5e;
  padding: 4px 18px;
  border-radius: 40px;
  font-size: 12px;
  font-weight: 600;
  color: #e0e0e0;
  letter-spacing: 1px;
}
.dialog-text {
  font-size: 15px;
  line-height: 1.6;
  color: #f5f5f5;
  min-height: 70px;
  font-weight: 500;
}
.cursor {
  animation: blink 0.8s infinite;
  color: #c0a080;
  margin-left: 2px;
}
.next-hint {
  text-align: right;
  margin-top: 12px;
  font-size: 12px;
  color: #a0a0a4;
  cursor: pointer;
  transition: color 0.2s;
}
.next-hint:hover {
  color: #e0e0e0;
}
.options-area {
  margin-top: 18px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
.option {
  background: rgba(30, 30, 34, 0.8);
  border: 1px solid #3a3a3e;
  padding: 8px 20px;
  border-radius: 40px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}
.option:hover {
  background: #3a3a40;
  border-color: #a0a0a4;
  transform: translateY(-2px);
}
.bullet {
  margin-right: 6px;
  color: #c0a080;
}
@keyframes blink {
  50% { opacity: 0; }
}
</style>