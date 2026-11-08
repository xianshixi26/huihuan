<template>
  <div class="scene">
    <StatusPanel />
    <div class="viewport" @mousedown="handleMapClick">
      <img class="bg-img" src="/images/旋涡.png" alt="旋涡" />
      <div class="map-layer">
        <div v-for="obj in visibleTargets" :key="obj.id" class="map-obj"
          :class="{ always: obj.isNpc || obj.isPortal, clue: obj.type === 'clue' || obj.isInteractive, nearby: (obj.type === 'clue' || obj.isInteractive) && isNearby(obj) }"
          :style="{ left: obj.x + 'px', top: obj.y + 'px' }" @mousedown.stop="interact(obj, $event)">
          <div v-if="(obj.type === 'clue' || obj.isInteractive) && isNearby(obj)" class="glow-ring"></div>
          <div class="obj-icon">{{ obj.icon }}</div>
          <div class="obj-label">{{ obj.name }}</div>
        </div>
        <div class="player" :style="{ left: playerPos.x + 'px', top: playerPos.y + 'px' }"><div class="player-icon">👤</div></div>
      </div>
      <div v-if="hoverTip" class="hover-tip">{{ hoverTip }}</div>
    </div>
    <div v-if="activeDialog" class="dialog-overlay"></div>
    <DialogBox v-if="activeDialog" :speaker="activeDialog.speaker" :text="activeDialog.text" :options="activeDialog.options" @next="onDialogNext" @select-option="onDialogOption" />
    <div v-if="showInteract" class="modal" @click.self="showInteract = null">
      <div class="interact-popup"><p>{{ showInteract.text }}</p><div class="btns"><button class="game-btn" @click="collectInteractClue">拾取线索</button><button class="game-btn" @click="showInteract = null">关闭</button></div></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import { usePlayerStore } from "../store/player"
import { useSystemMessage } from "../store/systemMessage"
import StatusPanel from "../components/StatusPanel.vue"
import DialogBox from "../components/DialogBox.vue"
const playerStore = usePlayerStore(); const msgStore = useSystemMessage()
const playerPos = ref({ x: 200, y: 350 }); const hoverTip = ref(""); const activeDialog = ref(null)
const showInteract = ref(null); const collectedInteract = ref([])
const PROXIMITY = 80
const isNearby = (obj) => Math.hypot(playerPos.value.x - obj.x, playerPos.value.y - obj.y) < PROXIMITY
const anchors = ref([
  { id: "shadow", map: "void", name: "执念·林迟", x: 600, y: 280, isNpc: true, icon: "👁️" },
  { id: "portal_gate", map: "void", name: "🌀 漩涡大门", x: 600, y: 380, isPortal: true, icon: "🌀" },
  { id: "clue_blood", map: "void", name: "立柱上的血色涂鸦", x: 200, y: 320, type: "clue", icon: "🩸", desc: "一根开裂的立柱上有人用鲜血写了几个字：'444变成445。'血还在往下流——不像是干的，像是刚写上去的。旁边有一行更小的字：'每次循环都加1。'" },
  { id: "clue_voidpage", map: "void", name: "断墙上的空间残页", x: 1000, y: 220, type: "clue", icon: "📃", desc: "一张残破的实验报告钉在断墙上，纸面正在缓缓燃烧——但烧了不知多久，始终没有烧完。报告标题是：记忆提取实验·最终阶段。受试者名单：443号（沈）、444号（林）。状态：均未成功逃脱循环。" },
  { id: "clue_shard", map: "void", name: "地面杂物里的侵蚀碎片", x: 800, y: 440, type: "clue", icon: "💎", desc: "一片半透明的晶体碎片埋在杂物堆里，拿起来时指尖感到一阵刺痛。碎片里封着一小段记忆——沈知夏的声音：'林迟，你已经接近真相了。不要停下来。第445次——这次你可以的。'" },
  { id: "obj_circle", map: "void", name: "地面的仪式圈", x: 600, y: 460, isInteractive: true, icon: "⭕", interactText: "地面上用粉笔画了一个巨大的圆圈，圈内有444道细小的划痕排列成螺旋状。圆心处放着一张白纸，纸上只有一个手写的数字。", clueId: "clue_number", clueName: "仪式圈中心的数字", clueDesc: "纸上写着一个数字：37。444道划痕指向圆心——每道是一次循环，37是唯一一次成功的频率。" },
])
const visibleTargets = computed(() => anchors.value.filter(t => { if (t.isInteractive) return !collectedInteract.value.includes(t.id); return !playerStore.bag.some(i => i.id === t.id) }))
onMounted(() => { playerStore.currentChapter = 4 })
const handleMapClick = (e) => { if (activeDialog.value) return; const rect = e.currentTarget.getBoundingClientRect(); playerPos.value = { x: e.clientX - rect.left, y: e.clientY - rect.top }; hoverTip.value = "" }
const interact = (target) => { if (activeDialog.value) return; if (!target.isNpc && !target.isPortal && !isNearby(target)) return; playerPos.value = { x: target.x, y: target.y + 20 }; hoverTip.value = target.name; if (target.isPortal) { msgStore.show("🌀 漩涡开始旋转..."); setTimeout(()=>{window.location.reload()},3000) }; if (target.isNpc) { openNpcDialog(); return }; if (target.isInteractive) { showInteract.value = target; return }; if (target.type === "clue") { playerStore.addItemToBag({ id: target.id, name: target.name, type: target.type, desc: target.desc, count: 1 }); msgStore.show("获得：" + target.name); anchors.value = anchors.value.filter(t => t.id !== target.id); hoverTip.value = "" } }
const collectInteractClue = () => { const obj = showInteract.value; if (!obj) return; playerStore.addItemToBag({ id: obj.clueId, name: obj.clueName, type: "clue", desc: obj.clueDesc, count: 1 }); msgStore.show("获得：" + obj.clueName); collectedInteract.value.push(obj.id); showInteract.value = null }
const openNpcDialog = () => { activeDialog.value = { speaker: "执念·林迟", text: "你终于走到这里了。我是你，也不是你。我是你在444次循环中积累的所有恐惧、愧疚和愤怒。如果你想推开这扇门——就必须接受我。", options: [{ text: "「我明白了。来吧。」", reasonDelta: -5, obsessionDelta: -10, action: "ACCEPT" }, { text: "「不，你不是我！」", reasonDelta: -15, obsessionDelta: 20, action: "REJECT" }] } }
const onDialogNext = () => { activeDialog.value = null }
const onDialogOption = (opt) => { if (opt.reasonDelta) playerStore.updateAttributes(opt.reasonDelta, opt.obsessionDelta||0); if (opt.action==="ACCEPT"){ msgStore.show("🌀 执念融入你的意识。第445次，你自由了。",6000); setTimeout(()=>{window.location.reload()},7000) } else { msgStore.show("💀 你拒绝了执念——循环将继续。",5000); setTimeout(()=>{window.location.reload()},6000) }; activeDialog.value = null }
</script>

<style scoped>
.scene { width: 100vw; height: 100vh; background: #080a0e; }
.viewport { width: 1200px; height: 500px; position: absolute; top: 105px; left: 50%; transform: translateX(-50%); overflow: hidden; border-radius: 16px; box-shadow: 0 0 40px rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.06); cursor: default; }
.bg-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; }
.map-layer { position: absolute; inset: 0; z-index: 1; }
.map-obj { position: absolute; transform: translate(-50%,-50%); text-align: center; z-index: 8; }
.map-obj.always { opacity: 1; pointer-events: auto; }
.map-obj.clue { opacity: 0; pointer-events: none; transition: opacity 0.25s; }
.map-obj.clue.nearby { opacity: 1; pointer-events: auto; }
.glow-ring { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 64px; height: 64px; border-radius: 50%; pointer-events: none; z-index: 0; animation: yellow-breathe 1s ease-in-out infinite; }
@keyframes yellow-breathe { 0%,100% { box-shadow: 0 0 6px 2px #FFDD00, 0 0 18px 5px rgba(255,221,0,0.35); background: rgba(255,221,0,0.04); } 50% { box-shadow: 0 0 14px 5px #FFDD00, 0 0 36px 10px rgba(255,221,0,0.55); background: rgba(255,221,0,0.10); } }
.obj-icon { font-size: 26px; filter: drop-shadow(0 2px 4px black); position: relative; z-index: 2; }
.obj-label { font-size: 10px; background: rgba(0,0,0,0.8); padding: 2px 10px; border-radius: 20px; white-space: nowrap; margin-top: 2px; color: #ddd; }
.player { position: absolute; width: 36px; height: 42px; transform: translate(-50%,-50%); transition: left 0.2s, top 0.2s; text-align: center; pointer-events: none; z-index: 20; }
.player-icon { font-size: 30px; filter: drop-shadow(0 2px 4px black); }
.hover-tip { position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%); background: #1a1a1c; padding: 4px 18px; border-radius: 40px; font-size: 12px; color: #ddd; border-left: 3px solid #c0a080; z-index: 30; }
.modal { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 200; }
.dialog-overlay { position: absolute; inset: 0; z-index: 15; background: rgba(0,0,0,0.2); pointer-events: all; }
.interact-popup { background: #12141a; border: 1px solid #3a3d44; border-radius: 16px; padding: 24px; width: 420px; text-align: center; color: #c8ccd4; }
.interact-popup p { line-height: 1.7; margin-bottom: 16px; font-size: 14px; }
.btns { display: flex; gap: 16px; justify-content: center; }
</style>
