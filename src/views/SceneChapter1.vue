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
        <!-- 交互物列表 -->
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
              npc: obj.isNpc,
              trap: obj.isTrap,
              med: obj.type === 'medicine',
              portal: obj.isPortal,
              door: obj.isDoor,
            }"
          >
            {{ obj.icon }}
          </div>
          <div class="obj-label">{{ obj.name }}</div>
        </div>

        <!-- 玩家角色 -->
        <div class="player" :style="{ left: playerPos.x + 'px', top: playerPos.y + 'px' }">
          <div class="player-icon">👤</div>
        </div>
      </div>
      <div v-if="hoverTip" class="hover-tip">{{ hoverTip }}</div>
    </div>

    <!-- 密码锁弹窗 -->
    <div v-if="showPadlock" class="modal" @click.self="showPadlock = false">
      <div class="padlock-box">
        <h3>🔒 旧木门密码锁</h3>
        <input v-model="password" maxlength="4" placeholder="****" class="code-input" />
        <div class="btns">
          <button class="game-btn" @click="checkPassword">确认</button>
          <button class="game-btn" @click="showPadlock = false">取消</button>
        </div>
      </div>
    </div>

    <!-- NPC 对话组件 -->
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

const currentMap = ref("classroom");
const playerPos = ref({ x: 180, y: 320 });
const hoverTip = ref("");
const showPadlock = ref(false);
const password = ref("");
const activeDialog = ref(null);
const bgImage = ref("");

// ---------- 交互物列表（坐标与 Canvas 绘制位置完全一致）----------
const targets = ref([
  // 教室 (classroom)
  {
    id: "door_out",
    map: "classroom",
    name: "教室门",
    x: 1130, y: 380,       // 门的中心点 (门区域: 1100,320 至 1160,470)
    isPortal: true,
    toMap: "corridor",
    spawn: { x: 120, y: 380 },
    icon: "🚪",
  },
  {
    id: "zhouye",
    map: "classroom",
    name: "周野",
    x: 820, y: 340,
    isNpc: true,
    icon: "🧑",
  },
  {
    id: "clue_paper",
    map: "classroom",
    name: "沈知夏的草稿纸",
    x: 335, y: 235,        // 放在第一张课桌上 (桌子区域 300,220)
    type: "clue",
    icon: "📜",
    desc: "“离不开了...不能再掉理智了”",
  },
  {
    id: "clue_log",
    map: "classroom",
    name: "值日生日志",
    x: 585, y: 425,        // 第二张课桌 (550,410)
    type: "clue",
    icon: "📖",
    desc: "“注意，执念林迟会修改告示”",
  },
  {
    id: "trap_eraser",
    map: "classroom",
    name: "诡异粉笔擦",
    x: 950, y: 180,
    isTrap: true,
    icon: "🧽",
    penalty: -15,
    msg: "吸入粉尘，视线模糊...理智-15",
  },

  // 走廊 (corridor)
  {
    id: "door_back",
    map: "corridor",
    name: "返回教室",
    x: 110, y: 380,        // 左侧门 (80,320 区域)
    isPortal: true,
    toMap: "classroom",
    spawn: { x: 1130, y: 380 },
    icon: "🚪",
  },
  {
    id: "graffiti",
    map: "corridor",
    name: "血字墙痕",
    x: 450, y: 200,
    type: "clue",
    icon: "🩸",
    desc: "倒写数字“8421”",
  },
  {
    id: "locked_door",
    map: "corridor",
    name: "旧木门",
    x: 1085, y: 400,       // 右侧门 (1050,310)
    isDoor: true,
    icon: "🚪",
  },
  {
    id: "med_chlor",
    map: "corridor",
    name: "盐酸氯丙嗪片",
    x: 706, y: 366,        // 药品绘制位置 (700,360)
    type: "medicine",
    icon: "💊",
    desc: "恢复25理智",
    effectValue: 25,
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
  playerStore.currentChapter = 1;
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
  playerPos.value = { x: target.x, y: target.y + 25 };
  hoverTip.value = target.name;

  if (target.isPortal) {
    hoverTip.value = "推开门...";
    setTimeout(() => {
      currentMap.value = target.toMap;
      playerPos.value = target.spawn;
      hoverTip.value = "";
    }, 300);
    return;
  }

  if (target.isTrap) {
    playerStore.updateAttributes(target.penalty, 5);
    msgStore.show(target.msg);
    targets.value = targets.value.filter((t) => t.id !== target.id);
    hoverTip.value = "";
    return;
  }

  if (target.isNpc) {
    activeDialog.value = {
      speaker: "周野",
      text: "林迟，走廊那扇门的密码被宿命涂改了，去找沈知夏留下的线索纸。",
      options: [{ text: "“我知道了，谢谢。”", action: "CLOSE" }],
    };
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

  if (target.isDoor) {
    showPadlock.value = true;
  }
};

const onDialogOption = (opt) => {
  activeDialog.value = null;
  if (opt.action === "REMOVE_NPC") {
    targets.value = targets.value.filter((t) => t.id !== "zhouye");
  }
};

const checkPassword = () => {
  if (password.value === "8421") {
    msgStore.show("🔓 木门打开了，你向前迈进...");
    showPadlock.value = false;
    router.push("/chapter2");
  } else {
    msgStore.show("❌ 密码错误，电击反噬！理智 -5");
    playerStore.updateAttributes(-5, 2);
  }
};
</script>

<style scoped>
/* 样式与之前相同，保持 */
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
.obj-icon.npc {
  filter: drop-shadow(0 0 6px #ffaa66);
}
.obj-icon.trap {
  filter: drop-shadow(0 0 8px #ff3333);
}
.obj-icon.med {
  filter: drop-shadow(0 0 6px #44ff44);
}
.obj-icon.portal,
.obj-icon.door {
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
.padlock-box {
  background: #121214;
  border: 1px solid #3a3a3e;
  border-radius: 24px;
  padding: 28px;
  width: 340px;
  text-align: center;
}
.code-input {
  background: #1e1e22;
  border: 1px solid #5a5a5e;
  color: #ffccaa;
  font-size: 28px;
  text-align: center;
  width: 150px;
  margin: 20px 0;
  border-radius: 8px;
}
.btns {
  display: flex;
  gap: 16px;
  justify-content: center;
}
</style>