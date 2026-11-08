<template>
  <div class="scene">
    <StatusPanel />
    <div class="viewport" :class="currentMap" @mousedown="handleMapClick">
      <img class="bg-img" :src="bgImage" alt="scene" />
      <div class="vignette"></div>
      <div class="map-layer">
        <div v-for="obj in visibleTargets" :key="obj.id" class="map-obj"
          :class="{
            always: obj.isNpc || obj.isPortal || obj.isHiddenGate,
            clue: obj.type === 'clue' || obj.type === 'medicine' || obj.isTrap || obj.isInteractive,
            nearby: (obj.type === 'clue' || obj.type === 'medicine' || obj.isTrap || obj.isInteractive) && isNearby(obj)
          }"
          :style="{ left: obj.x + 'px', top: obj.y + 'px' }" @mousedown.stop="interact(obj, $event)"
        >
          <div v-if="(obj.type === 'clue' || obj.type === 'medicine' || obj.isTrap || obj.isInteractive) && isNearby(obj)" class="glow-ring"></div>
          <div class="obj-icon">{{ obj.icon }}</div>
          <div class="obj-label">{{ obj.name }}</div>
        </div>
        <div class="player" :style="{ left: playerPos.x + 'px', top: playerPos.y + 'px' }"><div class="player-icon">👤</div></div>
      </div>
      <div v-if="hoverTip" class="hover-tip">{{ hoverTip }}</div>
    </div>

    <div v-if="showGateLock" class="modal" @click.self="showGateLock = false">
      <div class="padlock-box">
        <h3>🔒 诡异校门</h3>
        <p class="lock-hint">{{ gateHint }}</p>
        <input v-model="gatePassword" maxlength="4" placeholder="输入密码" class="code-input" />
        <div class="btns"><button class="game-btn" @click="checkGatePassword">确认</button><button class="game-btn" @click="showGateLock = false">取消</button></div>
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
import { ref, computed, onMounted, watch } from "vue"
import { useRouter } from "vue-router"
import { usePlayerStore } from "../store/player"
import { useSystemMessage } from "../store/systemMessage"
import { usePasswordStore } from "../store/password"
import { drawPixelBackground } from "../utils/drawPixelBackground"
import StatusPanel from "../components/StatusPanel.vue"
import DialogBox from "../components/DialogBox.vue"

const router = useRouter(); const playerStore = usePlayerStore(); const msgStore = useSystemMessage(); const passwordStore = usePasswordStore()
const currentMap = ref("forest"); const playerPos = ref({ x: 250, y: 350 }); const hoverTip = ref("")
const activeDialog = ref(null); const bgImage = ref("")
const bgImages = { forest: '/images/森林.png', shack: '/images/门卫值班室.png' }
const hiddenGateUnlocked = ref(false); const showGateLock = ref(false); const gatePassword = ref("")
const showInteract = ref(null); const collectedInteract = ref([])
const gateHint = computed(() => `🔑 提示：「${passwordStore.getHint(3)}」`)

const PROXIMITY = 80
const isNearby = (obj) => Math.hypot(playerPos.value.x - obj.x, playerPos.value.y - obj.y) < PROXIMITY

const anchors = ref([
  // ============================================================
  // 夜晚树林 (forest) — 像素原画 森林.png
  // 常显: 左侧建筑入口、下棋老人NPC
  // ============================================================
  // --- 门 常显（左侧建筑入口）---
  { id: "portal_shack", map: "forest", name: "→ 门卫小屋", x: 100, y: 350, isPortal: true, toMap: "shack", spawn: { x: 150, y: 350 }, icon: "🚪" },
  // --- NPC 常显 ---
  { id: "old_man", map: "forest", name: "下棋的老人", x: 400, y: 480, isNpc: true, icon: "♟️" },
  // --- 线索（隐藏，走近亮黄光）---
  // [线索] 药丸 → 右侧林间草丛
  { id: "med_pill", map: "forest", name: "草丛里的药丸", x: 950, y: 420, type: "medicine", icon: "💊", desc: "一瓶未开封的利培酮，瓶身沾着露水。恢复35理智。", effectValue: 35 },
  // [线索] 布条 → 地面落叶坑
  { id: "clue_cloth", map: "forest", name: "落叶坑里的布条", x: 600, y: 460, type: "clue", icon: "🧣", desc: "一条撕破的校服布条，上面绣着「林迟」的名字。布条边缘有烧焦的痕迹——和日志残页上的焦痕一模一样。" },
  // [线索] 警示牌残片 → 左侧铁丝网
  { id: "clue_sign", map: "forest", name: "铁丝网上的警示牌", x: 250, y: 240, type: "clue", icon: "⚠️", desc: "一块生锈的警示牌半挂在铁丝网上，上面写着：「实验区域·闲人免进·违规者后果自负」。落款日期已模糊。" },
  // [线索] 旧照片
  { id: "leaves", map: "forest", name: "树根下的旧照片", x: 500, y: 300, type: "clue", icon: "🖼️", desc: "老校区背景的合照，背面写着一行被水浸模糊的字。隐约能看到「无法打破，除非...」后面是一个中文字的起笔。" },
  // [线索] 树皮刻痕
  { id: "clue_tree", map: "forest", name: "树皮上的刻痕", x: 750, y: 220, type: "clue", icon: "🌳", desc: "一棵老树的树皮上刻着十二个动物图案。「蛇」被画了一个圈。" },
  // [陷阱] 捕兽夹
  { id: "trap_bear", map: "forest", name: "枯叶下的捕兽夹", x: 700, y: 380, isTrap: true, icon: "⚙️", penalty: -15, msg: "捕兽夹猛然合拢，惊出冷汗..." },
  // [交互] 石碑
  { id: "obj_stone", map: "forest", name: "林间石碑", x: 350, y: 360, isInteractive: true, icon: "🪦", interactText: "一块半埋在地里的石碑，刻着十二生肖。蛇的位置被凿了洞，洞里塞着纸条。", clueId: "clue_stone", clueName: "石碑里的纸条", clueDesc: "纸条上写着：蛇排第六，但真正的答案不是6。从蛇开始往后退一位——第5个。" },

  // ============================================================
  // 门卫小屋 (shack) — 暂无图片，保留Canvas绘制
  // ============================================================
  { id: "portal_forest", map: "shack", name: "← 返回小树林", x: 80, y: 350, isPortal: true, toMap: "forest", spawn: { x: 150, y: 350 }, icon: "🚪" },
  { id: "laohe", map: "shack", name: "保安老何", x: 270, y: 380, isNpc: true, icon: "👮" },
  { id: "radio", map: "shack", name: "老旧的收音机", x: 500, y: 250, isNpc: true, icon: "📻" },
  { id: "clue_badge", map: "shack", name: "带血的校徽", x: 650, y: 370, type: "clue", icon: "🥇", desc: "校徽背面刻着林迟的名字，但已经严重锈蚀了十几年。" },
  { id: "med_sedative", map: "shack", name: "强效镇静复合剂", x: 500, y: 400, type: "medicine", icon: "💊", desc: "回复 40 点理智", effectValue: 40 },
  { id: "hidden_gate", map: "shack", name: "??? 隐藏校门 ???", x: 900, y: 370, isPortal: true, toMap: "chapter4", spawn: { x: 200, y: 350 }, icon: "🚪", isHiddenGate: true },
])

const visibleTargets = computed(() => anchors.value.filter(t => {
  if (t.map !== currentMap.value) return false
  if (t.id === "hidden_gate") return hiddenGateUnlocked.value
  if (t.isInteractive) return !collectedInteract.value.includes(t.id)
  return !playerStore.bag.some(i => i.id === t.id)
}))

const generateBackground = (mapType) => { if (bgImages[mapType]) { bgImage.value = bgImages[mapType]; return }; const canvas = document.createElement("canvas"); drawPixelBackground(canvas, mapType); bgImage.value = canvas.toDataURL() }
watch(currentMap, (newMap) => generateBackground(newMap))
onMounted(() => { playerStore.currentChapter = 3; passwordStore.initPasswords(); playerStore.unlockStory('s11_ch3_forest'); generateBackground(currentMap.value) })

const handleMapClick = (e) => { if (activeDialog.value) return; const rect = e.currentTarget.getBoundingClientRect(); playerPos.value = { x: e.clientX - rect.left, y: e.clientY - rect.top }; hoverTip.value = "" }

const interact = (target, event) => {
  if (activeDialog.value) return
  if (!target.isNpc && !target.isPortal && !target.isHiddenGate && !isNearby(target)) return
  playerPos.value = { x: target.x, y: target.y + 20 }; hoverTip.value = target.name
  if (target.isPortal) { if (target.toMap === "chapter4") { showGateLock.value = true; return }; hoverTip.value = "推门..."; setTimeout(() => { currentMap.value = target.toMap; playerPos.value = target.spawn; hoverTip.value = "" }, 300); return }
  if (target.isTrap) { const r = playerStore.updateAttributes(target.penalty, 10); msgStore.show(target.msg); if (r) { msgStore.show(playerStore.statusDescription, 4000); return }; anchors.value = anchors.value.filter(t => t.id !== target.id); hoverTip.value = ""; return }
  if (target.isNpc) { openNpcDialog(target.id); return }
  if (target.isInteractive) { showInteract.value = target; return }
  if (target.type === "clue" || target.type === "medicine") {
    playerStore.addItemToBag({ id: target.id, name: target.name, type: target.type, desc: target.desc, effectValue: target.effectValue || 0, count: 1 })
    msgStore.show("获得：" + target.name); if (target.id === 'leaves') playerStore.unlockStory('s12_ch3_photo')
    anchors.value = anchors.value.filter(t => t.id !== target.id); hoverTip.value = ""; return
  }
}

const collectInteractClue = () => { const obj = showInteract.value; if (!obj) return; playerStore.addItemToBag({ id: obj.clueId, name: obj.clueName, type: "clue", desc: obj.clueDesc, count: 1 }); msgStore.show("获得：" + obj.clueName); collectedInteract.value.push(obj.id); showInteract.value = null }

const openNpcDialog = (npcId) => {
  const dialogs = {
    laohe: { speaker: "保安老何", text: "大半夜的不回宿舍在外面瞎转悠什么？...等等，你看起来有点眼熟。一年前是不是也有个姓林的学生出过事？校门从那以后就锁死了，除非你知道那个字。", options: [{ text: "「什么字？老何你告诉我！」", reasonDelta: 5, obsessionDelta: -2, action: "ASK_HINT" }, { text: "「不说就算了，我自己找。」", reasonDelta: -5, obsessionDelta: 5, action: "LEAVE" }] },
    radio: { speaker: "老旧收音机", text: "（收音机发出沙沙的电流声，隐约能听到机械女声在循环播报）「...第444次...受试者编号...4...4...3...差...1...」", options: [{ text: "凑近仔细听", action: "CLOSE", reasonDelta: 3, obsessionDelta: -1 }], onClose: () => { msgStore.show("📻 收音机里的声音断断续续：'443和444...只差1...那个1就是...' 然后信号中断了。") } },
    old_man: { speaker: "下棋的老人", text: "年轻人，来下盘棋？...你看这棋盘，十二个格子，每个格子对应一个生肖。但总有一个是空着的。我下了一辈子，那个空格永远填不上——就像你这循环，永远少一个答案。", options: [{ text: "「那个空着的格子是哪个生肖？」", action: "CLOSE", reasonDelta: 5, obsessionDelta: -2 }, { text: "「我没时间下棋。」", action: "CLOSE", reasonDelta: 0, obsessionDelta: 3 }] },
  }
  activeDialog.value = dialogs[npcId] || null
}
const onDialogNext = () => { const d = activeDialog.value; activeDialog.value = null; if (d?.onClose) d.onClose() }
const onDialogOption = (opt) => {
  const d = activeDialog.value
  if (opt?.reasonDelta || opt?.obsessionDelta) { const r = playerStore.updateAttributes(opt.reasonDelta || 0, opt.obsessionDelta || 0); if (r) { msgStore.show(playerStore.statusDescription, 4000); activeDialog.value = null; return } }
  if (opt?.action === "ASK_HINT") { if (!playerStore.hasClueByName("老何的皱烟纸")) { playerStore.addItemToBag({ id: "clue_he_hint", name: "老何的皱烟纸", type: "clue", desc: "烟卷里裹着一张字条：「林迟，你已经死在444次循环里了...只有放下执念，才能推开真实的门。答案是一个字。」", count: 1 }); msgStore.show("🔍 老何递给你一支烟，里面藏着秘密纸条。") }; hiddenGateUnlocked.value = true; playerStore.unlockStory('s13_ch3_laohe'); playerStore.unlockStory('s14_ch3_gate'); msgStore.show("✨ 小屋角落浮现出一道诡异的木门..."); anchors.value = anchors.value.filter(t => t.id !== "laohe") }
  activeDialog.value = null; if (d?.onClose) d.onClose()
}

const checkGatePassword = () => { if (gatePassword.value === passwordStore.getPassword(3)) { msgStore.show("🔓 校门打开了！"); showGateLock.value = false; router.push("/chapter4") } else { msgStore.show("❌ 密码错误！执念反噬..."); const r = playerStore.updateAttributes(-10, 5); if (r) { msgStore.show(playerStore.statusDescription, 4000) } } }
</script>

<style scoped>
.scene { width: 100vw; height: 100vh; background: #080a0e; }
.viewport { width: 1200px; height: 500px; position: absolute; top: 105px; left: 50%; transform: translateX(-50%); overflow: hidden; border-radius: 16px; box-shadow: 0 0 40px rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.06); cursor: default; animation: viewport-in 0.6s ease; }
.bg-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; }
@keyframes viewport-in { from { opacity: 0; filter: blur(8px); } to { opacity: 1; filter: blur(0); } }
.vignette { position: absolute; inset: 0; z-index: 4; pointer-events: none; box-shadow: inset 0 0 120px rgba(0,0,0,0.55), inset 0 0 40px rgba(0,0,0,0.35); }
.map-layer { width: 100%; height: 100%; position: relative; }
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
.padlock-box { background: #12141a; border: 1px solid #3a3d44; border-radius: 24px; padding: 28px; width: 400px; text-align: center; }
.lock-hint { font-size: 12px; color: #c0a080; margin: 12px 0; padding: 8px; background: #1a1c24; border-radius: 8px; }
.code-input { background: #1e1e22; border: 1px solid #5a5a5e; color: #ffccaa; font-size: 28px; text-align: center; width: 180px; margin: 20px 0; border-radius: 8px; }
.btns { display: flex; gap: 16px; justify-content: center; }
.dialog-overlay { position: absolute; inset: 0; z-index: 15; background: rgba(0,0,0,0.2); pointer-events: all; }
.interact-popup { background: #12141a; border: 1px solid #3a3d44; border-radius: 16px; padding: 24px; width: 420px; text-align: center; color: #c8ccd4; }
.interact-popup p { line-height: 1.7; margin-bottom: 16px; font-size: 14px; }
</style>
