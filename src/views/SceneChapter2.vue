<template>
  <div class="scene">
    <StatusPanel />
    <div
      class="viewport"
      :class="currentMap"
      @mousedown="handleMapClick"
      :style="{ backgroundImage: `url(${bgImage})` }"
    >
      <div class="map-layer">
        <div
          v-for="obj in visibleTargets"
          :key="obj.id"
          class="map-obj"
          :style="{ left: obj.x + 'px', top: obj.y + 'px' }"
          @mousedown.stop="interact(obj, $event)"
        >
          <div
            class="obj-icon"
            :class="{
              trap: obj.isTrap,
              med: obj.type === 'medicine',
              portal: obj.isPortal,
              console: obj.isConsole,
            }"
          >
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

    <!-- 电磁频率解谜面板 -->
    <div v-if="showPuzzle" class="modal" @click.self="showPuzzle = false">
      <div class="puzzle-panel">
        <h3>🎛️ 电磁频率耦合终端</h3>
        <p>调节双轴频率至谐振点 (目标: 50)</p>
        <div class="slider-row">
          <span>⚡ 频率轴 A</span>
          <input type="range" min="0" max="100" v-model.number="freqA" />
          <span>{{ freqA }}</span>
        </div>
        <div class="slider-row">
          <span>🌀 偏振轴 B</span>
          <input type="range" min="0" max="100" v-model.number="freqB" />
          <span>{{ freqB }}</span>
        </div>
        <p class="deviation">偏差度：{{ Math.abs((freqA + freqB) / 2 - 50) }}</p>
        <div class="flex-btns">
          <button class="game-btn" @click="checkResonance">注入能量</button>
          <button class="game-btn" @click="showPuzzle = false">取消</button>
        </div>
      </div>
    </div>

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
import { useRouter } from "vue-router";
import { usePlayerStore } from "../store/player";
import { useSystemMessage } from "../store/systemMessage";
import { drawPixelBackground } from "../utils/drawPixelBackground";
import StatusPanel from "../components/StatusPanel.vue";
import DialogBox from "../components/DialogBox.vue";

const router = useRouter();
const playerStore = usePlayerStore();
const msgStore = useSystemMessage();

const currentMap = ref("lab");
const playerPos = ref({ x: 150, y: 300 });
const hoverTip = ref("");
const showPuzzle = ref(false);
const freqA = ref(10);
const freqB = ref(90);
const activeDialog = ref(null);
const bgImage = ref("");

// 交互物列表（坐标与 Canvas 背景严格对应）
const targets = ref([
  // ========== 实验室 (lab) ==========
  {
    id: "portal_control",
    map: "lab",
    name: "监控室通道",
    x: 100, y: 330,         // Canvas 门位置 (80,280 区域)
    isPortal: true,
    toMap: "control",
    spawn: { x: 200, y: 330 },
    icon: "🚪",
  },
  {
    id: "notes",
    map: "lab",
    name: "L04实验记录本",
    x: 250, y: 290,         // 实验台上 (100,250 区域)
    type: "clue",
    icon: "📒",
    desc: "记录了“记忆交换系统”的副作用：每一次交换都在割裂灵魂。",
  },
  {
    id: "trap_gas",
    map: "lab",
    name: "泄漏的剧毒气罐",
    x: 875, y: 360,         // 气罐位置 (850,300)
    isTrap: true,
    icon: "🛢️",
    penalty: -20,
    msg: "吸入神经毒气，眼前景象开始扭曲...",
  },
  {
    id: "clue_screen",
    map: "control",
    name: "加密的主机屏幕",
    x: 675, y: 190,         // 电脑终端位置 (600,150)
    type: "clue",
    icon: "🖥️",
    desc: "显示“回环实验已运行444次，受试者：林迟”。",
  },
  {
    id: "console",
    map: "control",
    name: "主能谱控制台",
    x: 500, y: 430,         // 控制台位置 (0, h-120)
    isConsole: true,
    icon: "🎛️",
  },
  {
    id: "portal_lab",
    map: "control",
    name: "返回实验室",
    x: 100, y: 330,
    isPortal: true,
    toMap: "lab",
    spawn: { x: 100, y: 330 },
    icon: "🚪",
  },
  {
    id: "portal_showcase",
    map: "control",
    name: "标本陈列走廊",
    x: 1100, y: 330,        // Canvas 右侧传送门
    isPortal: true,
    toMap: "showcase",
    spawn: { x: 200, y: 350 },
    icon: "🚪",
  },
  // ========== 标本走廊 (showcase) ==========
  {
    id: "portal_control_back",
    map: "showcase",
    name: "返回监控室",
    x: 50, y: 330,          // 左侧传送门
    isPortal: true,
    toMap: "control",
    spawn: { x: 1100, y: 330 },
    icon: "🚪",
  },
  {
    id: "med_alpra",
    map: "showcase",
    name: "阿普唑仑速溶片",
    x: 140, y: 220,         // 第一个标本柜内
    type: "medicine",
    icon: "💊",
    desc: "对焦虑造成的狂躁有极佳的压制效果。回复 30 点理智。",
    effectValue: 30,
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
  const canvas = document.createElement("canvas");
  drawPixelBackground(canvas, mapType);
  bgImage.value = canvas.toDataURL();
};

watch(currentMap, (newMap) => generateBackground(newMap));

onMounted(() => {
  playerStore.currentChapter = 2;
  generateBackground(currentMap.value);
});

const handleMapClick = (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  playerPos.value = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
  hoverTip.value = "";
};

const interact = (target, event) => {
  playerPos.value = { x: target.x, y: target.y + 20 };
  hoverTip.value = target.name;

  if (target.isPortal) {
    hoverTip.value = "进入通道...";
    setTimeout(() => {
      currentMap.value = target.toMap;
      playerPos.value = target.spawn;
      hoverTip.value = "";
    }, 300);
    return;
  }

  if (target.isTrap) {
    playerStore.updateAttributes(target.penalty, 10);
    msgStore.show(target.msg);
    targets.value = targets.value.filter((t) => t.id !== target.id);
    hoverTip.value = "";
    return;
  }

  if (target.isConsole) {
    showPuzzle.value = true;
    return;
  }

  if (target.type === "clue" || target.type === "medicine") {
    playerStore.addItemToBag({
      id: target.id,
      name: target.name,
      type: target.type,
      desc: target.desc,
      effectValue: target.effectValue || 0,
      count: 1,
    });
    msgStore.show(`📦 获得：${target.name}`);
    targets.value = targets.value.filter((t) => t.id !== target.id);
    hoverTip.value = "";
    return;
  }
};

const checkResonance = () => {
  const avg = (freqA.value + freqB.value) / 2;
  if (Math.abs(avg - 50) <= 2) {
    msgStore.show("⚡ 频率共振成功！电磁壁垒消解，通道开启！");
    showPuzzle.value = false;
    router.push("/chapter3");
  } else {
    msgStore.show("⚠️ 频率冲突，机箱冒烟！理智值下降 8 点");
    playerStore.updateAttributes(-8, 3);
  }
};

const onDialogOption = (opt) => {
  activeDialog.value = null;
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
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.6);
  cursor: default;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
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
  font-size: 28px;
  filter: drop-shadow(0 2px 4px black);
}
.obj-icon.trap {
  filter: drop-shadow(0 0 8px #ff3333);
}
.obj-icon.med {
  filter: drop-shadow(0 0 6px #44ff44);
}
.obj-icon.portal,
.obj-icon.console {
  filter: drop-shadow(0 0 4px #aa8866);
}
.obj-label {
  font-size: 11px;
  background: rgba(0, 0, 0, 0.7);
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
.puzzle-panel {
  background: #121214;
  border: 1px solid #3a3a3e;
  border-radius: 24px;
  padding: 28px;
  width: 420px;
  text-align: center;
}
.slider-row {
  margin: 16px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.slider-row input {
  width: 200px;
}
.deviation {
  margin: 16px 0;
  color: #c0a080;
}
.flex-btns {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 20px;
}
</style>