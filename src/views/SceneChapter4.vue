<template>
  <div class="scene">
    <StatusPanel />
    <div
      class="viewport"
      :class="currentMap"
      @mousedown="handleMapClick"
    >
      <img class="bg-img" :src="bgImage" alt="scene" />
      <div class="vignette"></div>
      <div class="map-layer">
        <div
          v-for="obj in visibleTargets"
          :key="obj.id"
          class="map-obj"
          :style="{ left: obj.x + 'px', top: obj.y + 'px' }"
          @mousedown.stop="interact(obj, $event)"
        >
          <div class="obj-icon" :class="{ trap: obj.isTrap, portal: obj.isPortal, shadow: obj.id === 'shadow' }">
            {{ obj.icon }}
          </div>
          <div class="obj-label">{{ obj.name }}</div>
        </div>

        <div class="player" :style="{ left: playerPos.x + 'px', top: playerPos.y + 'px' }">
          <div class="player-icon">👤</div>
        </div>
      </div>
      <div v-if="hoverTip" class="hover-tip">{{ hoverTip }}</div>
    </div>

    <!-- 结局判定面板 -->
    <div v-if="showEnding" class="modal" @click.self="showEnding = false">
      <div class="ending-panel">
        <h3>🔮 终焉审判</h3>
        <p>你的精神刻印已被锁定</p>
        <div class="stats">
          <div>🧠 最终理智：{{ playerStore.reason }}</div>
          <div>👁️ 最终执念：{{ playerStore.obsession }}</div>
          <div>🔗 完成推理链：{{ playerStore.completedDeductions.length }}</div>
          <div>📦 收集线索：{{ playerStore.bag.filter(i => i.type === 'clue').length }}</div>
        </div>
        <button class="game-btn" @click="executeEnding">执行宿命判定</button>
      </div>
    </div>

    <div v-if="activeDialog" class="dialog-overlay"></div>
    <DialogBox
      v-if="activeDialog"
      :speaker="activeDialog.speaker"
      :text="activeDialog.text"
      :options="activeDialog.options"
      @next="activeDialog = null"
      @select-option="onDialogOption"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { usePlayerStore } from "../store/player";
import { useSystemMessage } from "../store/systemMessage";
import { drawPixelBackground } from "../utils/drawPixelBackground";
import StatusPanel from "../components/StatusPanel.vue";
import DialogBox from "../components/DialogBox.vue";

const playerStore = usePlayerStore();
const msgStore = useSystemMessage();

const currentMap = ref("gate");
const playerPos = ref({ x: 200, y: 350 });
const hoverTip = ref("");
const showEnding = ref(false);
const activeDialog = ref(null);
const bgImage = ref("");
const bgImages = { gate: '/images/学校门口.png', void: '/images/旋涡.png' }

const targets = ref([
  // ========== 学校正大门 (gate) ==========
  {
    id: "portal_void",
    map: "gate",
    name: "因果裂隙",
    x: 1100, y: 330,        // Canvas 右侧传送门
    isPortal: true,
    toMap: "void",
    spawn: { x: 200, y: 350 },
    icon: "🌀",
  },
  {
    id: "trap_mirror",
    map: "gate",
    name: "空间开裂的倒影",
    x: 600, y: 280,
    isTrap: true,
    icon: "🪞",
    penalty: -10,
    msg: "镜面碎裂，虚幻的你在尖啸...",
  },

  // ========== 虚无终焉轴心 (void) ==========
  {
    id: "portal_gate",
    map: "void",
    name: "现实裂隙",
    x: 100, y: 330,         // 左侧传送门
    isPortal: true,
    toMap: "gate",
    spawn: { x: 600, y: 350 },
    icon: "🌀",
  },
  {
    id: "shadow",
    map: "void",
    name: "执念·林迟",
    x: 600, y: 250,         // 中心漩涡附近
    icon: "👁️",
  },
  {
    id: "clue_truth",
    map: "void",
    name: "因果核心气泡",
    x: 400, y: 190,
    type: "clue",
    icon: "🫧",
    desc: "真相：黑化人格正通过修改告示将你永久抹杀在循环中。",
  },
]);

const visibleTargets = computed(() => {
  return targets.value.filter(
    (t) =>
      t.map === currentMap.value &&
      !playerStore.bag.some((i) => i.id === t.id)
  );
});

const generateBackground = (mapType) => {
  if (bgImages[mapType]) { bgImage.value = bgImages[mapType]; return }
  const canvas = document.createElement("canvas");
  drawPixelBackground(canvas, mapType);
  bgImage.value = canvas.toDataURL();
};

watch(currentMap, (newMap) => generateBackground(newMap));

onMounted(() => {
  playerStore.currentChapter = 4;
  generateBackground(currentMap.value);
});

const handleMapClick = (e) => {
  if (activeDialog.value) return
  const rect = e.currentTarget.getBoundingClientRect();
  playerPos.value = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
  hoverTip.value = "";
};

const interact = (target, event) => {
  if (activeDialog.value) return
  playerPos.value = { x: target.x, y: target.y + 20 };
  hoverTip.value = target.name;

  if (target.isPortal) {
    hoverTip.value = "踏入裂隙...";
    setTimeout(() => {
      currentMap.value = target.toMap;
      playerPos.value = target.spawn;
      hoverTip.value = "";
    }, 400);
    return;
  }

  if (target.isTrap) {
    playerStore.updateAttributes(target.penalty, 5);
    msgStore.show(target.msg);
    targets.value = targets.value.filter((t) => t.id !== target.id);
    hoverTip.value = "";
    return;
  }

  if (target.id === "shadow") {
    showEnding.value = true;
    return;
  }

  if (target.type === "clue") {
    playerStore.addItemToBag({
      id: target.id,
      name: target.name,
      type: "clue",
      desc: target.desc,
      count: 1,
    });
    msgStore.show(`📜 神识觉醒：${target.name}`);
    targets.value = targets.value.filter((t) => t.id !== target.id);
    hoverTip.value = "";
  }
};

const onDialogOption = (opt) => {
  activeDialog.value = null;
};

const executeEnding = () => {
  let endingTitle = ""
  let endingMsg = ""
  const dc = playerStore.completedDeductions.length
  const ratio = playerStore.reason > 0 ? playerStore.obsession / playerStore.reason : 999

  if (playerStore.reason >= 70 && playerStore.obsession < 25 && dc >= 2) {
    endingTitle = "🎉 真结局A — 告别执念"
    endingMsg = "你串联了所有关键线索，理智战胜了执念。第445次循环——你终于推开了真实的校门。门外是黎明的第一缕光。\n\n「循环已经结束，林迟。你可以离开了。」"
  } else if (playerStore.reason >= 50 && dc >= 1 && ratio < 1.5) {
    endingTitle = "🌅 真结局B — 接受自我"
    endingMsg = "你承认执念也是自己的一部分——不逃避，不否定。循环没有消失，但你学会了与它共存。\n\n「欢迎回来，林迟。无论多少次，我都会在这里等你。」——沈知夏"
  } else if (playerStore.obsession >= 70) {
    endingTitle = "💀 假结局 — 执念吞噬"
    endingMsg = "你的执念压倒了理智。镜中的自己变成了那个黑化的身影——你成为了第445个被困在循环中的执念碎片。\n\n「我就是你——现在，你也是我了。」"
  } else if (playerStore.reason <= 15) {
    endingTitle = "🌀 假结局 — 精神崩溃"
    endingMsg = "理智所剩无几，现实与幻觉已经无法分辨。你在循环中迷失了方向，最终倒在了无尽重复的走廊中。\n\n「下一个循环见，林迟。」"
  } else {
    endingTitle = "🔄 普通结局 — 循环继续"
    endingMsg = "你没有找到完整的真相——但这一次，你比之前更接近了。循环仍在继续，但第446次...你会做得更好。\n\n「有些谜题需要时间。我会等你的。」"
  }

  const fullMsg = `${endingTitle}\n\n${endingMsg}\n\n🧠 最终理智：${playerStore.reason} | 👁️ 最终执念：${playerStore.obsession} | 🔗 完成推理链：${dc}`

  if (playerStore.obsession >= 70 || playerStore.reason <= 15) {
    msgStore.show(fullMsg, 6000)
    setTimeout(() => { window.location.reload() }, 7000)
  } else {
    msgStore.show(fullMsg, 8000)
    setTimeout(() => { window.location.reload() }, 9000)
  }
};
</script>

<style scoped>
.scene {
  width: 100vw;
  height: 100vh;
  background: #0a0a0c;
}
.viewport {
  width: 1200px;
  height: 500px;
  position: absolute;
  top: 105px;
  left: 50%;
  transform: translateX(-50%);
  overflow: hidden;
  border-radius: 16px;
  box-shadow: 0 0 40px rgba(0,0,0,0.6), inset 0 0 80px rgba(0,0,0,0.25);
  border: 1px solid rgba(255,255,255,0.06);
  cursor: default;
  animation: viewport-in 0.6s ease;
}
.bg-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; }
@keyframes viewport-in { from { opacity: 0; filter: blur(8px); } to { opacity: 1; filter: blur(0); } }
.vignette { position: absolute; inset: 0; z-index: 4; pointer-events: none; box-shadow: inset 0 0 120px rgba(0,0,0,0.55), inset 0 0 40px rgba(0,0,0,0.35); }
.map-layer {
  width: 100%;
  height: 100%;
  position: relative;
}
.map-obj {
  position: absolute;
  transform: translate(-50%, -50%);
  text-align: center;
  cursor: pointer;
  z-index: 10;
}
.obj-icon {
  font-size: 32px;
  filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.5));
}
.obj-icon.trap {
  filter: drop-shadow(0 0 8px #ff3333);
}
.obj-icon.portal {
  filter: drop-shadow(0 0 4px #aa8866);
}
.obj-label {
  font-size: 11px;
  background: rgba(0, 0, 0, 0.6);
  padding: 2px 8px;
  border-radius: 20px;
  white-space: nowrap;
  margin-top: 4px;
  color: #ddd;
}
.player {
  position: absolute;
  width: 36px;
  height: 42px;
  transform: translate(-50%, -50%);
  transition: left 0.2s, top 0.2s;
  text-align: center;
  pointer-events: none;
  z-index: 20;
}
.player-icon {
  font-size: 30px;
  filter: drop-shadow(0 2px 2px black);
}
.hover-tip {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  background: #1a1a1c;
  padding: 4px 18px;
  border-radius: 40px;
  font-size: 12px;
  color: #ddd;
  border-left: 3px solid #c0a080;
  z-index: 30;
}
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}
.ending-panel {
  background: #121214;
  border: 1px solid #5a2a2a;
  border-radius: 24px;
  padding: 30px;
  width: 360px;
  text-align: center;
}
.stats {
  margin: 20px 0;
  background: #1a1a1c;
  padding: 12px;
  border-radius: 16px;
  display: flex;
  justify-content: space-around;
}
.dialog-overlay { position: absolute; inset: 0; z-index: 15; background: rgba(0,0,0,0.2); pointer-events: all; }
</style>