<template>
  <div class="scene">
    <StatusPanel />
    <div class="viewport" @mousedown="handleMapClick">
      <img class="bg-img" src="/images/门卫值班室.png" alt="门卫值班室" />
      <div class="map-layer">
        <div v-for="obj in visibleTargets" :key="obj.id" class="map-obj"
          :class="{ always: obj.isNpc || obj.isPortal, clue: obj.type === 'clue' || obj.type === 'medicine' || obj.isInteractive, nearby: (obj.type === 'clue' || obj.type === 'medicine' || obj.isInteractive) && isNearby(obj) }"
          :style="{ left: obj.x + 'px', top: obj.y + 'px' }" @mousedown.stop="interact(obj, $event)">
          <div v-if="(obj.type === 'clue' || obj.type === 'medicine' || obj.isInteractive) && isNearby(obj)" class="glow-ring"></div>
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
import { useRouter } from "vue-router"
import { usePlayerStore } from "../store/player"
import { useSystemMessage } from "../store/systemMessage"
import StatusPanel from "../components/StatusPanel.vue"
import DialogBox from "../components/DialogBox.vue"

const router = useRouter(); const playerStore = usePlayerStore(); const msgStore = useSystemMessage()
const playerPos = ref({ x: 200, y: 350 }); const hoverTip = ref(""); const activeDialog = ref(null)
const showInteract = ref(null); const collectedInteract = ref([])
const PROXIMITY = 80
const isNearby = (obj) => Math.hypot(playerPos.value.x - obj.x, playerPos.value.y - obj.y) < PROXIMITY

const anchors = ref([
  { id: "portal_exit", map: "room", name: "→ 离开宿舍", x: 1120, y: 350, isPortal: true, icon: "🚪" },
  { id: "clue_diary", map: "room", name: "书桌上的日记本", x: 280, y: 380, type: "clue", icon: "📓", desc: "一本陈旧的日记本，封面写着「值班日志」。翻到最后一页，笔迹变得潦草：'第444次了，他还是来了。每次都一样——他走到门前，然后停下。我不敢开门。'" },
  { id: "clue_phone", map: "room", name: "书桌座机的录音", x: 340, y: 350, type: "clue", icon: "📞", desc: "座机上贴着便签：留言已满。播放最后一条录音——一个沙哑的声音：'林迟，如果你听到这条留言，不要相信镜子里的自己。那不是你。'" },
  { id: "clue_toolbox", map: "room", name: "工具箱里的维修记录", x: 900, y: 420, type: "clue", icon: "🧰", desc: "工具箱里夹着一本维修记录簿。每一页都写着同一句话：'门锁更换，原因：被人从外面撬开。'连续400多条记录，日期都是同一天。" },
  { id: "clue_bednote", map: "room", name: "床铺上的字条", x: 150, y: 300, type: "clue", icon: "🛏️", desc: "枕头下压着一张字条，字迹歪歪扭扭：'别出去。外面不是学校。外面是深渊。我在这个房间里躲了444天。等你看到这个字条的时候，我应该已经不在了。'" },
  { id: "obj_wardrobe", map: "room", name: "破旧衣柜", x: 600, y: 280, isInteractive: true, icon: "🚪", interactText: "衣柜门虚掩着，里面挂着一件发黄的保安制服。制服口袋里有一张对折的照片。", clueId: "clue_photo2", clueName: "衣柜里的照片", clueDesc: "照片上是三个人的合影：林迟、沈知夏、周野。背景是老校区的教学楼。照片背面写着：9月23日，实验前一天。我们在笑，但每个人眼里都有恐惧。" },
])
const visibleTargets = computed(() => anchors.value.filter(t => { if (t.isInteractive) return !collectedInteract.value.includes(t.id); return !playerStore.bag.some(i => i.id === t.id) }))
onMounted(() => { playerStore.currentChapter = 3 })
const handleMapClick = (e) => { if (activeDialog.value) return; const rect = e.currentTarget.getBoundingClientRect(); playerPos.value = { x: e.clientX - rect.left, y: e.clientY - rect.top }; hoverTip.value = "" }
const interact = (target) => { if (activeDialog.value) return; if (!target.isNpc && !target.isPortal && !isNearby(target)) return; playerPos.value = { x: target.x, y: target.y + 25 }; hoverTip.value = target.name; if (target.isPortal) { router.push("/chapter3") }; if (target.isInteractive) { showInteract.value = target; return }; if (target.type === "clue") { playerStore.addItemToBag({ id: target.id, name: target.name, type: target.type, desc: target.desc, count: 1 }); msgStore.show("获得：" + target.name); anchors.value = anchors.value.filter(t => t.id !== target.id); hoverTip.value = "" } }
const collectInteractClue = () => { const obj = showInteract.value; if (!obj) return; playerStore.addItemToBag({ id: obj.clueId, name: obj.clueName, type: "clue", desc: obj.clueDesc, count: 1 }); msgStore.show("获得：" + obj.clueName); collectedInteract.value.push(obj.id); showInteract.value = null }
const onDialogNext = () => { activeDialog.value = null }
const onDialogOption = () => { activeDialog.value = null }
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
