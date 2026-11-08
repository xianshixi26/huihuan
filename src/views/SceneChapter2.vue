<template>
  <div class="scene">
    <StatusPanel />
    <div class="viewport" :class="currentMap" @mousedown="handleMapClick">
      <img class="bg-img" :src="bgImage" alt="scene" />
      <div class="vignette"></div>
      <div class="map-layer">
        <div v-for="obj in visibleTargets" :key="obj.id" class="map-obj"
          :class="{
            always: obj.isNpc || obj.isPortal || obj.isConsole,
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

    <div v-if="showPuzzle" class="modal" @click.self="showPuzzle = false">
      <div class="puzzle-panel">
        <h3>🎛️ 电磁频率耦合终端</h3>
        <p class="puzzle-hint">{{ freqHint }}</p>
        <div class="slider-row"><span>⚡ 频率轴 A</span><button class="adj-btn" @click="freqA = Math.max(0, freqA - 1)">−</button><input type="range" min="0" max="100" v-model.number="freqA" /><button class="adj-btn" @click="freqA = Math.min(100, freqA + 1)">+</button><span class="freq-val">{{ freqA }}</span></div>
        <div class="slider-row"><span>🌀 偏振轴 B</span><button class="adj-btn" @click="freqB = Math.max(0, freqB - 1)">−</button><input type="range" min="0" max="100" v-model.number="freqB" /><button class="adj-btn" @click="freqB = Math.min(100, freqB + 1)">+</button><span class="freq-val">{{ freqB }}</span></div>
        <p class="deviation">🎯 目标谐振点：{{ targetThreshold }} | 偏差度：{{ Math.abs((freqA + freqB) / 2 - targetThreshold) }}</p>
        <div class="flex-btns"><button class="game-btn" @click="checkResonance">注入能量</button><button class="game-btn" @click="showPuzzle = false">取消</button></div>
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
const currentMap = ref("lab"); const playerPos = ref({ x: 150, y: 300 }); const hoverTip = ref("")
const showPuzzle = ref(false); const freqA = ref(10); const freqB = ref(90); const activeDialog = ref(null); const bgImage = ref("")
const bgImages = { lab: '/images/实验室.png', control: '/images/监控室.png', showcase: '/images/标本室.png' }
const showInteract = ref(null); const collectedInteract = ref([])
const targetThreshold = computed(() => passwordStore.getThreshold(2))
const freqHint = computed(() => `🎯 提示：「${passwordStore.getHint(2)}」——目标谐振点：${targetThreshold.value}`)

const PROXIMITY = 80
const isNearby = (obj) => Math.hypot(playerPos.value.x - obj.x, playerPos.value.y - obj.y) < PROXIMITY

const anchors = ref([
  // ============================================================
  // 化学实验室 (lab) — 像素原画 实验室.png
  // 常显: 沈知夏NPC、许衡NPC、右侧安全门
  // 线索全部隐藏绑定原画实物，走近亮黄光
  // ============================================================
  // --- NPC 常显 ---
  { id: "shen", map: "lab", name: "沈知夏", x: 300, y: 360, isNpc: true, icon: "🧑" },
  { id: "xuheng", map: "lab", name: "班长许衡", x: 700, y: 280, isNpc: true, icon: "👨‍🎓" },
  // --- 门 常显（右侧安全门）---
  { id: "portal_control", map: "lab", name: "→ 监控室通道", x: 1120, y: 330, isPortal: true, toMap: "control", spawn: { x: 200, y: 330 }, icon: "🚪" },
  // --- 线索（隐藏，走近亮黄光）---
  // [线索] 实验笔记 → 中间实验台书本
  { id: "notes", map: "lab", name: "实验台上的笔记", x: 500, y: 320, type: "clue", icon: "📒", desc: "一本布满灰尘的实验记录，封面写着「记忆提取实验·绝密」。大部分被涂盖，只剩「第4组」「分裂」「444次」几个词隐约可见。" },
  // [线索] 残留试管 → 左侧试管架
  { id: "clue_tube", map: "lab", name: "试管架上的残留试管", x: 200, y: 240, type: "clue", icon: "🧪", desc: "试管底部残留着淡绿色的液体，标签上写着「444号·林迟」。液体已经干了，但管壁上留有一层结晶。" },
  // [线索] 报告单 → 地面碎纸
  { id: "clue_report", map: "lab", name: "地面的碎纸报告单", x: 800, y: 440, type: "clue", icon: "📋", desc: "几张被撕碎的报告单散落在地面，拼起来能看到「实验终止日期：9月23日」「负责人：陈某某」。" },
  // [陷阱] 毒气罐 → 右侧气罐
  { id: "trap_gas", map: "lab", name: "泄漏的剧毒气罐", x: 950, y: 400, isTrap: true, icon: "🛢️", penalty: -20, msg: "吸入神经毒气，眼前景象扭曲..." },

  // ============================================================
  // 监控机房 (control) — 像素原画 监控室.png
  // 常显: 门禁门、主能谱控制台、返回门
  // ============================================================
  // --- 门 常显 ---
  { id: "portal_lab", map: "control", name: "← 返回实验室", x: 80, y: 330, isPortal: true, toMap: "lab", spawn: { x: 1100, y: 330 }, icon: "🚪" },
  { id: "portal_showcase", map: "control", name: "→ 标本陈列走廊", x: 1120, y: 330, isPortal: true, toMap: "showcase", spawn: { x: 200, y: 350 }, icon: "🚪" },
  // --- 交互物件 常显 ---
  { id: "console", map: "control", name: "主能谱控制台", x: 500, y: 440, isConsole: true, icon: "🎛️" },
  // --- 线索（隐藏，走近亮黄光）---
  // [线索] 监控日志 → 操作台白纸
  { id: "clue_screen", map: "control", name: "操作台上的监控日志", x: 600, y: 300, type: "clue", icon: "🖥️", desc: "一台老旧CRT显示器泛着绿光。数据跳动中一组数字反复闪烁。屏幕角落有一个输入提示符在等待指令。" },
  // [线索] 录像硬盘 → 绿色屏监控主机
  { id: "clue_hdd", map: "control", name: "监控主机的录像硬盘", x: 850, y: 240, type: "clue", icon: "💾", desc: "硬盘标签写着「回环实验录像·第444次」。侧面贴着便签：上一次成功逃脱的记录在第442和443次。" },
  // [线索] 检修工单 → 右侧储物柜
  { id: "clue_order", map: "control", name: "储物柜里的检修工单", x: 1050, y: 280, type: "clue", icon: "📝", desc: "工单上写着：频率耦合装置异常，谐振点每次重启均偏移。建议手动校准至随机值。签名：陈。" },
  // [线索] 按钮记录 → 左侧控制台
  { id: "clue_btnlog", map: "control", name: "控制台的按钮记录", x: 300, y: 380, type: "clue", icon: "🎚️", desc: "控制台面板上贴着一张小纸条，上面手写着上一次成功的频率参数：A=37, B=37。旁边打了个勾。" },

  // ============================================================
  // 标本解剖室 (showcase) — 像素原画 标本室.png
  // 常显: 右侧通道门、返回门
  // ============================================================
  // --- NPC ---
  { id: "shadow_phantom", map: "showcase", name: "模糊的倒影", x: 500, y: 250, isNpc: true, icon: "👁️" },
  // --- 门 常显 ---
  { id: "portal_control_back", map: "showcase", name: "← 返回监控室", x: 80, y: 330, isPortal: true, toMap: "control", spawn: { x: 1100, y: 330 }, icon: "🚪" },
  // --- 线索（隐藏，走近亮黄光）---
  // [线索] 病历纸 → 左下桌面纸张
  { id: "clue_record", map: "showcase", name: "桌面的病历纸", x: 200, y: 390, type: "clue", icon: "📄", desc: "病历纸上记录着受试者编号443-445，其中443和444的「执念提取量」一栏被红笔圈出。两个数字相加等于37。" },
  // [线索] 刀具物证 → 中下操作台托盘
  { id: "clue_knife", map: "showcase", name: "操作台托盘里的刀具", x: 600, y: 430, type: "clue", icon: "🔪", desc: "托盘里有一把生锈的手术刀，刀柄上刻着序号「443」。旁边的标签写着：执念分离手术工具·已消毒。" },
  // [线索] 标本记录 → 玻璃标本柜
  { id: "clue_specimen", map: "showcase", name: "玻璃柜里的标本记录", x: 900, y: 260, type: "clue", icon: "🧫", desc: "标本瓶的标签写着「444号·林迟」。瓶内空无一物，但瓶底有一张折起来的纸条。" },
  // [线索] 药剂瓶 → 左上置物架
  { id: "med_alpra", map: "showcase", name: "置物架上的药剂瓶", x: 250, y: 180, type: "medicine", icon: "💊", desc: "对焦虑造成的狂躁有极佳的压制效果。回复 30 点理智。", effectValue: 30 },
  // [交互] 置物架
  { id: "obj_shelf", map: "showcase", name: "左上置物架", x: 180, y: 140, isInteractive: true, icon: "🧴", interactText: "置物架上散落着各种药剂瓶和实验器材。角落塞着一本沾满灰尘的值班表。", clueId: "clue_duty", clueName: "沾灰的值班表", clueDesc: "值班表上最后一个名字是林迟，日期是去年的今天。备注栏写着一个手写的「37」。" },
])

const visibleTargets = computed(() => anchors.value.filter(t => {
  if (t.map !== currentMap.value) return false
  if (t.isInteractive) return !collectedInteract.value.includes(t.id)
  return !playerStore.bag.some(i => i.id === t.id)
}))

const generateBackground = (mapType) => { if (bgImages[mapType]) { bgImage.value = bgImages[mapType]; return }; const canvas = document.createElement("canvas"); drawPixelBackground(canvas, mapType); bgImage.value = canvas.toDataURL() }
watch(currentMap, (newMap) => generateBackground(newMap))
onMounted(() => { playerStore.currentChapter = 2; passwordStore.initPasswords(); playerStore.unlockStory('s7_ch2_lab'); generateBackground(currentMap.value) })

const handleMapClick = (e) => { if (activeDialog.value) return; const rect = e.currentTarget.getBoundingClientRect(); playerPos.value = { x: e.clientX - rect.left, y: e.clientY - rect.top }; hoverTip.value = "" }

const interact = (target, event) => {
  if (activeDialog.value) return
  if (!target.isNpc && !target.isPortal && !target.isConsole && !isNearby(target)) return
  playerPos.value = { x: target.x, y: target.y + 20 }; hoverTip.value = target.name
  if (target.isPortal) { hoverTip.value = "进入通道..."; setTimeout(() => { currentMap.value = target.toMap; playerPos.value = target.spawn; hoverTip.value = "" }, 300); return }
  if (target.isTrap) { const r = playerStore.updateAttributes(target.penalty, 10); msgStore.show(target.msg); if (r) { msgStore.show(playerStore.statusDescription, 4000); return }; anchors.value = anchors.value.filter(t => t.id !== target.id); hoverTip.value = ""; return }
  if (target.isConsole) { showPuzzle.value = true; return }
  if (target.isNpc) { openNpcDialog(target.id); return }
  if (target.isInteractive) { showInteract.value = target; return }
  if (target.type === "clue" || target.type === "medicine") {
    playerStore.addItemToBag({ id: target.id, name: target.name, type: target.type, desc: target.desc, effectValue: target.effectValue || 0, count: 1 })
    msgStore.show("获得：" + target.name); if (target.id === 'notes') playerStore.unlockStory('s8_ch2_experiment'); if (target.id === 'clue_screen') playerStore.unlockStory('s10_ch2_444')
    anchors.value = anchors.value.filter(t => t.id !== target.id); hoverTip.value = ""; return
  }
}

const collectInteractClue = () => { const obj = showInteract.value; if (!obj) return; playerStore.addItemToBag({ id: obj.clueId, name: obj.clueName, type: "clue", desc: obj.clueDesc, count: 1 }); msgStore.show("获得：" + obj.clueName); collectedInteract.value.push(obj.id); showInteract.value = null }

const openNpcDialog = (npcId) => {
  const dialogs = {
    shen: { speaker: "沈知夏", text: "你找到实验记录了？控制台的谐振频率每次都不一样，你得从周围的线索推断出正确的数值。", options: [{ text: "「终端上有什么提示吗？」", action: "CLOSE" }, { text: "「你到底是什么人？」", action: "CLOSE", reasonDelta: 3, obsessionDelta: -2 }], onClose: () => { if (!playerStore.hasClueByName("沈知夏的暗示")) { playerStore.addItemToBag({ id: "npc_shen_clue", name: "沈知夏的暗示", type: "clue", desc: "沈知夏点着实验记录的「444」说：有些东西看不到不代表不存在。444的一半是222，再一半是111。加起来的数字，就是线索。", count: 1 }); msgStore.show("从对话中察觉线索：「沈知夏的暗示」"); playerStore.unlockStory('s9_ch2_shen') } } },
    xuheng: { speaker: "班长许衡", text: "林迟！你怎么还在这里？那天晚上——一年前的晚上——我也在实验室。后来他们就把我的记忆删除了。你有没有找到一本值日日志？", options: [{ text: "「找到了，但被撕掉了一页。」", action: "CLOSE", reasonDelta: 5, obsessionDelta: 0 }], onClose: () => { if (!playerStore.hasClueByName("许衡的证词")) { playerStore.addItemToBag({ id: "clue_xuheng", name: "许衡的证词", type: "clue", desc: "许衡说他一年前也在实验室。他说「他们」删除了他的记忆。日志是他撕的，为了留下证据。", count: 1 }); msgStore.show("从对话中察觉线索：「许衡的证词」") } } },
    shadow_phantom: { speaker: "？？？", text: "（一个与你一模一样的身影在标本瓶的倒影中一闪而过）你看到的数字不是偶然。442次失败，2次成功。你每一次都在最后一刻退缩了。", options: [{ text: "「你是谁？！」", action: "CLOSE", reasonDelta: -3, obsessionDelta: 8 }], onClose: () => { msgStore.show("👁️ 那个身影消失了，但你的执念值上升了...") } },
  }
  activeDialog.value = dialogs[npcId] || null
}
const onDialogNext = () => { const d = activeDialog.value; activeDialog.value = null; if (d?.onClose) d.onClose() }
const onDialogOption = (opt) => { const d = activeDialog.value; if (opt?.reasonDelta || opt?.obsessionDelta) { playerStore.updateAttributes(opt.reasonDelta || 0, opt.obsessionDelta || 0) }; activeDialog.value = null; if (d?.onClose) d.onClose() }

const checkResonance = () => { const avg = (freqA.value + freqB.value) / 2; if (Math.abs(avg - targetThreshold.value) <= 3) { msgStore.show("⚡ 频率共振成功！电磁壁垒消解，通道开启！"); showPuzzle.value = false; router.push("/chapter3") } else { msgStore.show(`⚠️ 频率冲突！机箱冒烟...偏差度：${Math.abs(avg - targetThreshold.value)}`); const r = playerStore.updateAttributes(-8, 3); if (r) { msgStore.show(playerStore.statusDescription, 4000) } } }
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
.puzzle-panel { background: #12141a; border: 1px solid #3a3d44; border-radius: 24px; padding: 28px; width: 440px; text-align: center; }
.puzzle-hint { font-size: 12px; color: #c0a080; margin: 10px 0; padding: 8px; background: #1a1c24; border-radius: 8px; }
.slider-row { margin: 16px 0; display: flex; align-items: center; gap: 8px; }
.slider-row input { width: 160px; }
.adj-btn { width: 28px; height: 28px; border-radius: 50%; border: 1px solid #5a5a5e; background: #1e1e22; color: #c0a080; font-size: 16px; cursor: pointer; line-height: 1; padding: 0; }
.adj-btn:hover { background: #3a3a3e; color: #fff; }
.freq-val { width: 30px; text-align: center; font-family: monospace; color: #ffccaa; font-weight: bold; }
.deviation { margin: 16px 0; color: #c0a080; }
.flex-btns { display: flex; gap: 16px; justify-content: center; margin-top: 20px; }
.dialog-overlay { position: absolute; inset: 0; z-index: 15; background: rgba(0,0,0,0.2); pointer-events: all; }
.interact-popup { background: #12141a; border: 1px solid #3a3d44; border-radius: 16px; padding: 24px; width: 420px; text-align: center; color: #c8ccd4; }
.interact-popup p { line-height: 1.7; margin-bottom: 16px; font-size: 14px; }
.btns { display: flex; gap: 16px; justify-content: center; }
</style>
