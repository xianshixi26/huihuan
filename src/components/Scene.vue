<template>
  <div class="scene-shell">
    <Transition name="scene-fade">
      <div class="scene-viewport" :key="currentMap">
        <div class="vignette-overlay"></div>
        <div class="scene-content">
          <slot name="map" />
        </div>
        <div class="scene-hud-top">
          <slot name="hud" />
        </div>
      </div>
    </Transition>
    <div class="scene-overlay-bottom">
      <slot name="overlay" />
    </div>
  </div>
</template>

<script setup>
defineProps({ currentMap: String })
</script>

<style scoped>
.scene-shell {
  width: 100vw; height: 100vh;
  background: var(--bg-deep, #0a0c10);
  position: relative; overflow: hidden;
}

.scene-viewport {
  width: 1200px; height: 500px;
  position: absolute;
  top: 105px; left: 50%;
  transform: translateX(-50%);
  border-radius: 16px;
  overflow: hidden;
  box-shadow:
    0 0 40px rgba(0,0,0,0.6),
    inset 0 0 80px rgba(0,0,0,0.3);
  border: 1px solid #252830;
}

.vignette-overlay {
  position: absolute; inset: 0; z-index: 5; pointer-events: none;
  box-shadow: inset 0 0 120px rgba(0,0,0,0.5), inset 0 0 40px rgba(0,0,0,0.3);
}

.scene-content { position: relative; width: 100%; height: 100%; z-index: 1; }

.scene-hud-top {
  position: absolute; top: 14px; left: 14px; z-index: 100;
}

.scene-overlay-bottom {
  position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%);
  z-index: 20; width: 900px;
}

/* 场景切换淡入淡出 */
.scene-fade-enter-active,
.scene-fade-leave-active { transition: opacity 0.5s ease, filter 0.5s ease; }
.scene-fade-enter-from { opacity: 0; filter: blur(6px); }
.scene-fade-leave-to   { opacity: 0; filter: blur(6px); }
</style>
