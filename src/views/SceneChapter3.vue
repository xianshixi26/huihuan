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
              npc: obj.isNpc,
              trap: obj.isTrap,
              med: obj.type === 'medicine',
              portal: obj.isPortal,
              hiddenGate: obj.isHiddenGate,
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

const currentMap = ref("forest");
const playerPos = ref({ x: 250, y: 350 });
const hoverTip = ref("");
const activeDialog = ref(null);
const bgImage = ref("");
const hiddenGateUnlocked = ref(false);

const targets = ref([
  // ========== 小树林 (forest) ==========
  {
    id: "portal_shack",
    map: "forest",
    name: "门卫小屋",
    x: 1120, y: 370,        // Canvas 右侧传送门 (w-80,320)
    isPortal: true,
    toMap: "shack",
    spawn: { x: 150, y: 350 },
    icon: "🚪",
  },
  {
    id: "leaves",
    map: "forest",
    name: "神秘的旧照片",
    x: 165, y: 320,         // 第一棵树附近 (150,300)
    type: "clue",
    icon: "🖼️",
    desc: "老校区背景，背面写着：“循环无法打破，除非...”",
  },
  {
    id: "trap_bear",
    map: "forest",
    name: "枯叶下的捕兽夹",
    x: 715, y: 300,         // 第三棵树附近 (700,280)
    isTrap: true,
    icon: "⚙️",
    penalty: -15,
    msg: "捕兽夹猛然合拢，你惊出一身冷汗...",
  },

  // ========== 门卫小屋 (shack) ==========
  {
    id: "portal_forest",
    map: "shack",
    name: "返回小树林",
    x: 1120, y: 370,        // Canvas 右侧门
    isPortal: true,
    toMap: "forest",
    spawn: { x: 1120, y: 370 },
    icon: "🚪",
  },
  {
    id: "laohe",
    map: "shack",
    name: "保安老何",
    x: 270, y: 380,         // 床的位置附近 (200, h-140)
    isNpc: true,
    icon: "👮",
  },
  {
    id: "clue_badge",
    map: "shack",
    name: "带血的校徽",
    x: 650, y: 370,         // 桌子上 (600, h-120)
    type: "clue",
    icon: "🥇",
    desc: "刻着林迟，但校徽已经严重锈蚀了几十年。",
  },
  {
    id: "med_sedative",
    map: "shack",
    name: "强效镇静复合剂",
    x: 500, y: 380,
    type: "medicine",
    icon: "💊",
    desc: "黑市流传的违禁制剂，可回复 40 点理智",
    effectValue: 40,
  },
  // 隐藏门（低声询问后解锁）
  {
    id: "hidden_gate",
    map: "shack",
    name: "??? 隐藏校门 ???",
    x: 900, y: 370,         // Canvas 右侧门位置
    isPortal: true,
    toMap: "chapter4",
    spawn: { x: 200, y: 350 },
    icon: "🚪",
    isHiddenGate: true,
  },
]);

const visibleTargets = computed(() => {
  return targets.value.filter((t) => {
    if (t.map !== currentMap.value) return false;
    if (playerStore.bag.some((i) => i.id === t.id)) return false;
    if (t.id === "hidden_gate") return hiddenGateUnlocked.value;
    return true;
  });
});

const generateBackground = (mapType) => {
  const canvas = document.createElement("canvas");
  drawPixelBackground(canvas, mapType);
  bgImage.value = canvas.toDataURL();
};

watch(currentMap, (newMap) => generateBackground(newMap));

onMounted(() => {
  playerStore.currentChapter = 3;
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
    if (target.toMap === "chapter4") {
      router.push("/chapter4");
      return;
    }
    hoverTip.value = "推门进入...";
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

  if (target.isNpc) {
    activeDialog.value = {
      speaker: "保安老何",
      text: "大半夜的不回宿舍在外面瞎转悠什么？校门锁死了，神仙也出不去！",
      options: [
        { text: "塞上烟卷低声询问", reasonDelta: 5, obsessionDelta: -2, action: "ASK_HINT" },
        { text: "强行撞击校门突围", reasonDelta: -10, obsessionDelta: 15, action: "ESCAPE" },
      ],
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
};

const onDialogOption = (opt) => {
  if (opt.reasonDelta) {
    playerStore.updateAttributes(opt.reasonDelta, opt.obsessionDelta || 0);
  }

  if (opt.action === "ASK_HINT") {
    const hintId = "clue_he_hint";
    const alreadyHas = playerStore.bag.some((item) => item.id === hintId);
    if (!alreadyHas) {
      playerStore.addItemToBag({
        id: hintId,
        name: "老何的皱烟纸",
        type: "clue",
        desc: '烟卷里裹着一张字条：「林迟，你其实已经死在444次循环里了……只有放下执念，才能推开真实的门。」',
        count: 1,
      });
      msgStore.show("🔍 老何递给你一支皱巴巴的烟，里面藏着秘密纸条。");
    } else {
      msgStore.show("👴 老何摆摆手：“该说的都说了，快走吧。”");
    }
    hiddenGateUnlocked.value = true;
    msgStore.show("✨ 小屋角落浮现出一道诡异的木门，散发着微弱的光芒...");
    targets.value = targets.value.filter((t) => t.id !== "laohe");
  } else if (opt.action === "ESCAPE") {
    msgStore.show("💀 你发疯般撞向老何，却被他一棍打翻在地...“你早就死了，林迟。” 意识坠入黑暗。");
    setTimeout(() => {
      playerStore.fullReset();
      router.push("/chapter1");
    }, 1000);
  }

  activeDialog.value = null;
};
</script>

<style scoped>
/* 样式与第一章基本相同，保持统一 */
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
.obj-icon.portal {
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
</style>