<template>
  <div class="dialog-container">
    <div v-if="speaker" class="speaker-tag">
      <span class="speaker-dot"></span>
      {{ speaker }}
    </div>
    <div class="dialog-text">
      <span>{{ displayedText }}</span>
      <span v-if="isTyping" class="cursor">▌</span>
    </div>
    <div v-if="!isTyping && options?.length" class="options-area">
      <div v-for="(opt, idx) in options" :key="idx" class="option" @click="selectOption(opt)">
        <span class="bullet">▶</span> {{ opt.text }}
      </div>
    </div>
    <div v-else-if="!isTyping" class="next-hint" @click="emitNext">
      <span class="next-text">继续</span>
      <span class="next-arrow">▼</span>
    </div>
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
  background: linear-gradient(180deg, rgba(18,20,26,0.97) 0%, rgba(10,12,16,0.98) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px;
  padding: 22px 28px 18px;
  box-shadow:
    0 12px 40px rgba(0,0,0,0.6),
    inset 0 1px 0 rgba(255,255,255,0.02);
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  width: 900px;
  z-index: 20;
  animation: dialog-in 0.3s cubic-bezier(0.16,1,0.3,1);
}

@keyframes dialog-in {
  from { opacity: 0; transform: translateX(-50%) translateY(16px); filter: blur(4px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); filter: blur(0); }
}

.speaker-tag {
  position: absolute;
  top: -13px;
  left: 24px;
  background: #1a1c24;
  border: 1px solid #3a3d44;
  padding: 4px 18px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: #8a7550;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.speaker-dot {
  width: 5px; height: 5px;
  background: #8b1a1a;
  border-radius: 50%;
  box-shadow: 0 0 6px #8b1a1a;
}

.dialog-text {
  font-size: 15px;
  line-height: 1.7;
  color: #c8ccd4;
  min-height: 60px;
  font-weight: 400;
  padding: 4px 0;
  letter-spacing: 0.3px;
}
.cursor {
  display: inline-block;
  color: #8a7550;
  margin-left: 2px;
  font-weight: 300;
  animation: blink 0.8s infinite;
}

.next-hint {
  text-align: right;
  margin-top: 12px;
  font-size: 12px;
  color: #6a6e76;
  cursor: pointer;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
}
.next-hint:hover { color: #8a7550; }
.next-arrow { animation: bounce 1.5s infinite; }

@keyframes bounce {
  0%,100% { transform: translateY(0); }
  50% { transform: translateY(4px); opacity: 0.5; }
}

.options-area {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid rgba(255,255,255,0.06);
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.option {
  background: linear-gradient(135deg, #1a1c24 0%, #1f2128 100%);
  border: 1px solid #252830;
  padding: 8px 20px;
  border-radius: 22px;
  font-size: 13px;
  font-weight: 500;
  color: #c8ccd4;
  cursor: pointer;
  transition: all 0.2s ease;
}
.option:hover {
  background: #252a30;
  border-color: #8a7550;
  color: #e8eaf0;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.4);
}
.bullet {
  color: #8a7550;
  margin-right: 5px;
  font-size: 10px;
}

@keyframes blink {
  50% { opacity: 0; }
}
</style>
