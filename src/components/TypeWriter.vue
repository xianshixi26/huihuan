<template>
  <span class="typewriter">
    <span class="typewriter-text">{{ displayedText }}</span>
    <span class="typewriter-cursor" :class="{ blink: !isTyping }">▌</span>
  </span>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  text: { type: String, required: true },
  speed: { type: Number, default: 30 },
})

const emit = defineEmits(['complete'])

const displayedText = ref('')
const isTyping = ref(false)
let timer = null

const start = () => {
  if (timer) clearInterval(timer)
  displayedText.value = ''
  isTyping.value = true
  let index = 0
  timer = setInterval(() => {
    if (index < props.text.length) {
      displayedText.value += props.text[index]
      index++
    } else {
      clearInterval(timer)
      isTyping.value = false
      emit('complete')
    }
  }, props.speed)
}

watch(() => props.text, start, { immediate: true })

onBeforeUnmount(() => { if (timer) clearInterval(timer) })
</script>

<style scoped>
.typewriter {
  position: relative;
}

.typewriter-text {
  color: #c8ccd4;
  letter-spacing: 0.3px;
}

.typewriter-cursor {
  color: #8a7550;
  font-weight: 300;
  margin-left: 2px;
  opacity: 1;
  transition: opacity 0.3s;
}
.typewriter-cursor.blink {
  animation: cursor-blink 0.9s infinite;
}

@keyframes cursor-blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
</style>
