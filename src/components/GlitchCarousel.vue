<template>
  <div class="carousel-shell">
    <!-- 噪点叠加层 -->
    <div class="noise-overlay"></div>
    <!-- 扫描线 -->
    <div class="scanlines"></div>

    <!-- 轮播主体 -->
    <div class="carousel-track" :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
      <div
        v-for="(slide, idx) in slides"
        :key="idx"
        class="carousel-slide"
        :class="{ active: idx === currentIndex, leaving: idx === leavingIndex }"
      >
        <div class="slide-image" :style="{ backgroundImage: `url(${slide.image})` }">
          <div class="glitch-layer" :style="{ backgroundImage: `url(${slide.image})` }"></div>
        </div>
        <div class="slide-subtitle">{{ slide.subtitle }}</div>
      </div>
    </div>

    <!-- 指示器 -->
    <div class="carousel-dots">
      <span
        v-for="(_, idx) in slides"
        :key="idx"
        class="dot"
        :class="{ active: idx === currentIndex }"
        @click="goTo(idx)"
      ></span>
    </div>

    <!-- 底部氛围文字 -->
    <div class="carousel-ambient">{{ slides[currentIndex]?.ambient || '' }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  slides: { type: Array, default: () => [] },
  interval: { type: Number, default: 5000 },
})

const currentIndex = ref(0)
const leavingIndex = ref(-1)
let timer = null

const goTo = (idx) => {
  if (idx === currentIndex.value) return
  leavingIndex.value = currentIndex.value
  setTimeout(() => { leavingIndex.value = -1 }, 500)
  currentIndex.value = idx
}

const next = () => {
  const nxt = (currentIndex.value + 1) % props.slides.length
  goTo(nxt)
}

onMounted(() => {
  if (props.slides.length > 1) {
    timer = setInterval(next, props.interval)
  }
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.carousel-shell {
  width: 100%;
  max-width: 680px;
  height: 320px;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.06);
  box-shadow: 0 0 40px rgba(0,0,0,0.5), inset 0 0 30px rgba(0,0,0,0.3);
}

/* 噪点 */
.noise-overlay {
  position: absolute; inset: 0; z-index: 5; pointer-events: none;
  opacity: 0.25;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

/* 扫描线 */
.scanlines {
  position: absolute; inset: 0; z-index: 6; pointer-events: none;
  background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px);
}

/* 轨道 */
.carousel-track {
  display: flex;
  height: 100%;
  transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
}

/* 单张幻灯片 */
.carousel-slide {
  min-width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

/* 图片容器 */
.slide-image {
  position: absolute; inset: 0;
  background-size: cover;
  background-position: center;
  filter: brightness(0.7) contrast(1.1) saturate(0.5);
}

/* 故障偏移层 */
.glitch-layer {
  position: absolute; inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 0;
  mix-blend-mode: screen;
}
.carousel-slide.active .glitch-layer {
  animation: glitch-shift 4s infinite;
}

@keyframes glitch-shift {
  0%, 90%, 100% { opacity: 0; transform: translate(0, 0); }
  91% { opacity: 0.3; transform: translate(-4px, 2px); }
  92% { opacity: 0.15; transform: translate(6px, -1px); }
  93% { opacity: 0.25; transform: translate(-2px, -3px); }
  94% { opacity: 0.1; transform: translate(3px, 1px); }
  95% { opacity: 0; transform: translate(0, 0); }
}

/* 入场故障 */
.carousel-slide.active {
  animation: slide-enter 0.6s steps(4) forwards;
}
@keyframes slide-enter {
  0%   { filter: brightness(2) blur(4px); }
  25%  { filter: brightness(0.5) blur(2px); }
  50%  { filter: brightness(1.5) blur(1px); }
  75%  { filter: brightness(0.8) blur(0.5px); }
  100% { filter: brightness(1) blur(0); }
}

/* 离场 */
.carousel-slide.leaving {
  animation: slide-leave 0.5s ease-in forwards;
}
@keyframes slide-leave {
  to { opacity: 0; filter: brightness(0.2) blur(8px); }
}

/* 底行独白 */
.slide-subtitle {
  position: absolute;
  bottom: 16px; left: 50%; transform: translateX(-50%);
  z-index: 10;
  background: rgba(0,0,0,0.6);
  color: rgba(255,255,255,0.5);
  font-size: 12px;
  padding: 6px 20px;
  border-radius: 20px;
  letter-spacing: 2px;
  white-space: nowrap;
  font-style: italic;
  transition: opacity 0.4s;
}

/* 指示器圆点 */
.carousel-dots {
  position: absolute;
  bottom: 48px; left: 50%; transform: translateX(-50%);
  z-index: 10;
  display: flex; gap: 10px;
}
.dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  cursor: pointer;
  transition: all 0.3s;
}
.dot.active { background: #8a7550; box-shadow: 0 0 6px #8a7550; }
.dot:hover { background: rgba(255,255,255,0.5); }

/* 底部氛围文字 */
.carousel-ambient {
  position: absolute;
  bottom: 8px; width: 100%; text-align: center;
  z-index: 10;
  font-size: 10px;
  color: rgba(255,255,255,0.2);
  letter-spacing: 3px;
  pointer-events: none;
}
</style>
