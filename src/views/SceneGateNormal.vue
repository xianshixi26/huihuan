<template>
  <div class="scene">
    <StatusPanel />
    <div class="viewport" @mousedown="handleMapClick">
      <img class="bg-img" src="/images/学校门口.png" alt="学校门口" />
      <div class="map-layer">
        <div v-for="obj in visibleTargets" :key="obj.id" class="map-obj"
          :class="{ always: obj.isPortal, clue: obj.type === 'clue' || obj.isInteractive, nearby: (obj.type === 'clue' || obj.isInteractive) && isNearby(obj) }"
          :style="{ left: obj.x + 'px', top: obj.y + 'px' }" @mousedown.stop="interact(obj, $event)">
          <div v-if="(obj.type === 'clue' || obj.isInteractive) && isNearby(obj)" class="glow-ring"></div>
          <div class="obj-icon">{{ obj.icon }}</div>
          <div class="obj-label">{{ obj.name }}</div>
        </div>
        <div class="player" :style="{ left: playerPos.x + 'px', top: playerPos.y + 'px' }"><div class="player-icon">👤</div></div>
      </div>
      <div v-if="hoverTip" class="hover-tip">{{ hoverTip }}</div>
    </div>
    <div v-if="showEnding" class="modal" @click.self="showEnding = false">
      <div class="ending-panel">
        <h3>🔮 终焉审判</h3><p>你的精神刻印已被锁定</p>
        <div class="stats"><div>🧠 {{ playerStore.reason }}</div><div>👁️ {{ playerStore.obsession }}</div><div>🔗 {{ playerStore.completedDeductions.length }}</div><div>📦 {{ playerStore.bag.filter(i => i.type === 'clue').length }}</div></div>
        <button class="game-btn" @click="executeEnding">执行宿命判定</button>
      </div>
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
const playerPos = ref({ x: 200, y: 350 }); const hoverTip = ref(""); const showEnding = ref(false); const activeDialog = ref(null)
const showInteract = ref(null); const collectedInteract = ref([])
const PROXIMITY = 80
const isNearby = (obj) => Math.hypot(playerPos.value.x - obj.x, playerPos.value.y - obj.y) < PROXIMITY
const anchors = ref([
  { id: "portal_void", map: "gate", name: "🔒 上锁的铁艺大门", x: 600, y: 350, isPortal: true, icon: "🚪" },
  { id: "clue_poster", map: "gate", name: "围墙上的封闭告示", x: 200, y: 220, type: "clue", icon: "📜", desc: "一张泛黄的封闭告示贴在校门旁的围墙上：'即日起校园全面封闭，所有人员不得出入。如有紧急情况，联系实验管理处。'落款日期：一年前的9月23日。" },
  { id: "clue_bike", map: "gate", name: "倒地单车旁的零件", x: 950, y: 430, type: "clue", icon: "🚲", desc: "一辆倒在地上的自行车，车筐里的东西散落一地。其中有一个学生证，姓名栏已经磨损，学号后三位是443。旁边的快递盒上写着收件人：沈知夏。" },
  { id: "clue_trash", map: "gate", name: "垃圾桶里的纸条", x: 850, y: 380, type: "clue", icon: "🗑️", desc: "垃圾桶里有一团揉皱的纸条，展平后看到一行匆忙的字迹：'他在循环里。不要去大门。那是假的。真正的出口在漩涡深处——你必须在执念吞噬你之前找到它。'字迹是林迟自己的。" },
  { id: "clue_map", map: "gate", name: "墙上的校园地图残片", x: 1050, y: 200, type: "clue", icon: "🗺️", desc: "一张残破的校园地图钉在墙上，大部分区域被红笔划掉了。剩下的区域用蓝笔标注了一条路线：教室→实验室→小树林→大门。但大门的标记上被打了一个巨大的红叉。" },
  { id: "obj_guardhouse", map: "gate", name: "废弃的门卫亭", x: 1100, y: 340, isInteractive: true, icon: "🏚️", interactText: "门卫亭的窗户碎了，里面有一张便签贴在监控屏幕上。", clueId: "clue_guardnote", clueName: "门卫亭便签", clueDesc: "便签背面写着一串数字：37。注释：第443次和第444次之间的间隔天数。" },
])
const visibleTargets = computed(() => anchors.value.filter(t => { if (t.isInteractive) return !collectedInteract.value.includes(t.id); return !playerStore.bag.some(i => i.id === t.id) }))
onMounted(() => { playerStore.currentChapter = 4 })
const handleMapClick = (e) => { if (activeDialog.value) return; const rect = e.currentTarget.getBoundingClientRect(); playerPos.value = { x: e.clientX - rect.left, y: e.clientY - rect.top }; hoverTip.value = "" }
const interact = (target) => { if (activeDialog.value) return; if (!target.isPortal && !isNearby(target)) return; playerPos.value = { x: target.x, y: target.y + 20 }; hoverTip.value = target.name; if (target.isPortal) { showEnding.value = true; return }; if (target.isInteractive) { showInteract.value = target; return }; if (target.type === "clue") { playerStore.addItemToBag({ id: target.id, name: target.name, type: target.type, desc: target.desc, count: 1 }); msgStore.show("获得：" + target.name); anchors.value = anchors.value.filter(t => t.id !== target.id); hoverTip.value = "" } }
const collectInteractClue = () => { const obj = showInteract.value; if (!obj) return; playerStore.addItemToBag({ id: obj.clueId, name: obj.clueName, type: "clue", desc: obj.clueDesc, count: 1 }); msgStore.show("获得：" + obj.clueName); collectedInteract.value.push(obj.id); showInteract.value = null }
const onDialogNext = () => { activeDialog.value = null }
const onDialogOption = () => { activeDialog.value = null }
const executeEnding = () => { let t="",m=""; const dc=playerStore.completedDeductions.length, r=playerStore.reason>0?playerStore.obsession/playerStore.reason:999; if(playerStore.reason>=70&&playerStore.obsession<25&&dc>=2){t="🎉 真结局A";m="你打破了第445次循环。"}else if(playerStore.reason>=50&&dc>=1&&r<1.5){t="🌅 真结局B";m="你学会了与执念共存。"}else if(playerStore.obsession>=70){t="💀 假结局";m="执念吞噬了你。"}else if(playerStore.reason<=15){t="🌀 假结局";m="精神崩溃。"}else{t="🔄 普通结局";m="循环继续，但更接近了。"}; msgStore.show(`${t}\n${m}\n🧠${playerStore.reason}|👁️${playerStore.obsession}|🔗${dc}`,7000); setTimeout(()=>{window.location.reload()},8000) }
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
.ending-panel { background: #12141a; border: 1px solid #5a2a2a; border-radius: 24px; padding: 30px; width: 380px; text-align: center; }
.stats { margin: 20px 0; background: #1a1c24; padding: 12px; border-radius: 16px; display: flex; flex-wrap: wrap; justify-content: space-around; gap: 8px; font-size: 13px; }
.dialog-overlay { position: absolute; inset: 0; z-index: 15; background: rgba(0,0,0,0.2); pointer-events: all; }
.interact-popup { background: #12141a; border: 1px solid #3a3d44; border-radius: 16px; padding: 24px; width: 420px; text-align: center; color: #c8ccd4; }
.interact-popup p { line-height: 1.7; margin-bottom: 16px; font-size: 14px; }
.btns { display: flex; gap: 16px; justify-content: center; }
</style>
