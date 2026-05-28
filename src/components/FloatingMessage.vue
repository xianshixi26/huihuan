<!-- src/components/FloatingMessage.vue -->
<template>
  <Teleport to="body">
    <Transition name="fade-up">
      <div v-if="visible" class="float-msg" :style="{ left: x + 'px', top: y + 'px' }">
        {{ text }}
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { useFloatingMessage } from '../store/message'
const { visible, text, x, y } = useFloatingMessage()
</script>

<style scoped>
.float-msg {
  position: fixed;
  background: #1e1e22;
  color: #f0d0a0;
  padding: 6px 16px;
  border-radius: 28px;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  pointer-events: none;
  z-index: 10000;
  box-shadow: 0 2px 12px rgba(0,0,0,0.5);
  border-left: 3px solid #c0a080;
}
.fade-up-enter-active, .fade-up-leave-active {
  transition: all 0.4s ease;
}
.fade-up-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>