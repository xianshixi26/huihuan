// src/store/systemMessage.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSystemMessage = defineStore('systemMessage', () => {
  const visible = ref(false)
  const message = ref('')
  let timer = null

  const show = (msg, autoClose = 3000) => {
    if (timer) clearTimeout(timer)
    message.value = msg
    visible.value = true
    timer = setTimeout(() => {
      visible.value = false
    }, autoClose)
  }

  const hide = () => {
    visible.value = false
    if (timer) clearTimeout(timer)
  }

  return { visible, message, show, hide }
})