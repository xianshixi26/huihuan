<!-- src/components/SystemMessage.vue -->
<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="system-message-container" @click="$emit('close')">
        <div class="system-message-box">
          <div class="text-content">
            <span>{{ message }}</span>
            <span class="cursor">_</span>
          </div>
          <div class="next-tip" @click.stop="$emit('close')">点击关闭 ✕</div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
  visible: Boolean,
  message: String
})
defineEmits(['close'])
</script>

<style scoped>
.system-message-container {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  width: 1100px;
  z-index: 150;
  cursor: pointer;
}
.system-message-box {
  width: 100%;
  min-height: 80px;
  background: rgba(12, 12, 14, 0.96);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px 28px;
  box-sizing: border-box;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
  position: relative;
}
.text-content {
  font-size: 15px;
  line-height: 1.6;
  color: #f5f5f5;
  letter-spacing: 1px;
  padding-right: 60px;
}
.cursor {
  animation: blink 0.8s infinite;
  color: #c0a080;
  margin-left: 2px;
}
.next-tip {
  position: absolute;
  bottom: 15px;
  right: 28px;
  font-size: 12px;
  color: #a0a0a4;
  cursor: pointer;
  transition: color 0.2s;
}
.next-tip:hover {
  color: #e0e0e0;
}
@keyframes blink {
  50% { opacity: 0; }
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>