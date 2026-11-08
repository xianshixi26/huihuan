<template>
  <Transition name="dialog-slide">
    <div v-if="visible" class="dialog-panel">
      <div class="dialog-speaker" v-if="speaker">
        <span class="speaker-dot"></span>
        {{ speaker }}
      </div>
      <div class="dialog-body">
        <TypeWriter
          :text="text"
          :speed="speed"
          @complete="onTypingComplete"
        />
      </div>
      <div class="dialog-actions" v-if="!isTyping">
        <div class="dialog-options" v-if="options?.length">
          <button
            v-for="(opt, idx) in options"
            :key="idx"
            class="dialog-option"
            @click="$emit('select', opt)"
          >
            <span class="option-marker">▶</span>
            {{ opt.text }}
          </button>
        </div>
        <div class="dialog-next" v-else @click="$emit('next')">
          <span class="next-text">继续</span>
          <span class="next-arrow">▼</span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue'
import TypeWriter from './TypeWriter.vue'

const props = defineProps({
  speaker: String,
  text: String,
  options: Array,
  speed: { type: Number, default: 30 },
  visible: { type: Boolean, default: true },
})

defineEmits(['next', 'select'])

const isTyping = ref(true)

const onTypingComplete = () => { isTyping.value = false }

watch(() => props.text, () => { isTyping.value = true })
</script>

<style scoped>
.dialog-panel {
  background: linear-gradient(180deg, rgba(18,20,26,0.97) 0%, rgba(10,12,16,0.98) 100%);
  border: 1px solid #252830;
  border-radius: 16px;
  padding: 24px 28px 20px;
  position: relative;
  box-shadow:
    0 12px 40px rgba(0,0,0,0.6),
    0 0 1px rgba(200,200,200,0.05) inset;
  backdrop-filter: blur(8px);
}

.dialog-speaker {
  position: absolute; top: -14px; left: 24px;
  background: #1a1c24;
  border: 1px solid #3a3d44;
  padding: 4px 18px;
  border-radius: 20px;
  font-size: 12px; font-weight: 600;
  color: #8a7550;
  letter-spacing: 1px;
  display: flex; align-items: center; gap: 8px;
}
.speaker-dot {
  width: 6px; height: 6px;
  background: #8b1a1a;
  border-radius: 50%;
  box-shadow: 0 0 6px #8b1a1a;
}

.dialog-body {
  min-height: 60px;
  padding: 8px 0;
  font-size: 15px; line-height: 1.7;
  color: #c8ccd4;
}

.dialog-actions { margin-top: 4px; }

.dialog-options {
  display: flex; flex-wrap: wrap; gap: 14px;
  margin-top: 12px; padding-top: 16px;
  border-top: 1px solid #252830;
}

.dialog-option {
  background: linear-gradient(135deg, #1a1c24 0%, #1e1e26 100%);
  border: 1px solid #252830;
  padding: 8px 20px;
  border-radius: 22px;
  font-size: 13px; font-weight: 500;
  color: #c8ccd4;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}
.dialog-option:hover {
  border-color: #8a7550;
  background: #252a2e;
  color: #e8eaf0;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.4);
}
.option-marker {
  color: #8a7550;
  margin-right: 6px; font-size: 10px;
}

.dialog-next {
  text-align: right; margin-top: 12px;
  cursor: pointer; display: flex; align-items: center;
  justify-content: flex-end; gap: 8px;
  font-size: 12px; color: #6a6e76;
  transition: color 0.2s;
}
.dialog-next:hover { color: #8a7550; }
.next-arrow { animation: bounce 1.5s infinite; }

@keyframes bounce {
  0%,100% { transform: translateY(0); }
  50% { transform: translateY(4px); opacity: 0.5; }
}

/* 面板滑入动画 */
.dialog-slide-enter-active { transition: all 0.35s cubic-bezier(0.16,1,0.3,1); }
.dialog-slide-leave-active { transition: all 0.2s ease-in; }
.dialog-slide-enter-from {
  opacity: 0; transform: translateY(20px); filter: blur(4px);
}
.dialog-slide-leave-to {
  opacity: 0; transform: translateY(10px);
}
</style>
