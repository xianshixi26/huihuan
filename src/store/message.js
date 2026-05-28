// src/store/message.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useFloatingMessage = defineStore('floatingMessage', () => {
  const visible = ref(false)
  const text = ref('')
  const x = ref(0)
  const y = ref(0)
  let timer = null

  const showMsg = (msg, clientX, clientY, duration = 2000) => {
    if (timer) clearTimeout(timer)
    text.value = msg
    x.value = clientX - 40
    y.value = clientY - 40
    visible.value = true
    timer = setTimeout(() => {
      visible.value = false
    }, duration)
  }

  return { visible, text, x, y, showMsg }
})