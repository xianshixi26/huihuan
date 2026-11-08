<template>
  <div class="brainstorm-overlay" @click.self="close">
    <div class="brainstorm-panel">
      <!-- 顶部标题栏 -->
      <div class="panel-header">
        <div class="header-left">
          <span class="header-icon">🔍</span>
          <span class="header-title">头脑风暴 · 线索串联</span>
        </div>
        <div class="header-center" v-if="activeMeta">
          <span class="current-clue-tag">当前线索：{{ activeMeta.name }}</span>
        </div>
        <button class="close-btn" @click="close">✕ 关闭</button>
      </div>

      <!-- 主面板区域 -->
      <div class="board-area" ref="boardRef">
        <!-- SVG连线层 -->
        <svg class="connection-svg" v-if="nodePositions.length">
          <line
            v-for="(line, idx) in connectionLines"
            :key="'line-' + idx"
            :x1="line.x1" :y1="line.y1"
            :x2="line.x2" :y2="line.y2"
            :stroke="line.isMisleading ? '#663333' : '#8b0000'"
            stroke-width="2"
            :stroke-dasharray="line.isMisleading ? '6,3' : 'none'"
            opacity="0.8"
          />
        </svg>

        <!-- 中心线索卡片 -->
        <div class="center-node" v-if="activeMeta" :style="centerStyle">
          <div class="node-card main-card">
            <div class="card-glow"></div>
            <div class="card-icon">📜</div>
            <div class="card-name">{{ activeMeta.name }}</div>
            <div class="card-section">
              <div class="section-label">🔎 表面观察</div>
              <div class="section-text">{{ activeMeta.rawDesc }}</div>
            </div>
            <div class="card-section interpreted">
              <div class="section-label">💡 深层解读</div>
              <div class="section-text">{{ activeMeta.interpretedDesc }}</div>
            </div>
            <div class="card-source">{{ activeMeta.sourceName }}</div>
          </div>
        </div>

        <!-- 周围关联线索节点 -->
        <div
          v-for="(conn, idx) in connectionNodes"
          :key="conn.targetId"
          class="surround-node found"
          :class="{ selected: conn.targetId === deductionStore.selectedTargetId }"
          :style="getSurroundPos(idx, connectionNodes.length)"
          @click="onNodeClick(conn)"
        >
          <div class="node-card surround-card">
            <div class="card-icon">📌</div>
            <div class="card-name">{{ conn.name }}</div>
            <div class="card-hint found-hint">{{ conn.label }}</div>
          </div>
        </div>

        <!-- 连接按钮 -->
        <div class="connection-action" v-if="deductionStore.selectedTargetId">
          <button class="connect-btn" @click="confirmConnection">🔗 确认串联</button>
          <button class="cancel-btn" @click="deductionStore.clearSelection()">取消选择</button>
        </div>
      </div>

      <!-- 底部结果/提示区 -->
      <div class="result-area" v-if="deductionStore.lastConnectionResult">
        <div class="result-text" :class="{ success: deductionStore.lastConnectionResult.success, fail: !deductionStore.lastConnectionResult.success }">
          {{ deductionStore.lastConnectionResult.text }}
        </div>
      </div>
      <div class="result-area instruction" v-else-if="!deductionStore.selectedTargetId">
        <p>点击周围线索卡片选择要串联的目标</p>
        <p class="sub">只有已收集的线索才能进行串联推理，未获取的线索无法参与</p>
      </div>

      <!-- 已完成推理链 -->
      <div class="chains-bar" v-if="deductionStore.completedChains.length">
        <div v-for="cid in deductionStore.completedChains" :key="cid" class="chain-badge completed">
          ✅ {{ chainDefinitions[cid]?.name || cid }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useDeductionStore, chainDefinitions } from '../store/deduction'
import { usePlayerStore } from '../store/player'

const props = defineProps({ clueId: String })
const emit = defineEmits(['close'])

const deductionStore = useDeductionStore()
const playerStore = usePlayerStore()
const boardRef = ref(null)

const nodePositions = ref([])

const activeMeta = computed(() => {
  if (!deductionStore.activeBrainstormClue) return null
  return deductionStore.clueMetaMap[deductionStore.activeBrainstormClue] || null
})

const connectionNodes = computed(() => {
  if (!deductionStore.activeBrainstormClue) return []
  return deductionStore.getAvailableConnections(deductionStore.activeBrainstormClue, playerStore.bag)
})

const connectionLines = computed(() => {
  const lines = []
  if (!boardRef.value || !activeMeta.value) return lines
  const centerX = boardRef.value.clientWidth / 2
  const centerY = boardRef.value.clientHeight / 2
  const count = connectionNodes.value.length

  deductionStore.discoveredConnections.forEach(conn => {
    const fromIdx = connectionNodes.value.findIndex(n => n.targetId === conn.toId)
    if (fromIdx >= 0) {
      const angle = (2 * Math.PI * fromIdx) / count - Math.PI / 2
      const radius = Math.min(boardRef.value.clientWidth, boardRef.value.clientHeight) * 0.35
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)
      const chainDef = chainDefinitions[conn.chain]
      lines.push({ x1: centerX, y1: centerY, x2: x, y2: y, isMisleading: chainDef?.isMisleading || false })
    }
  })
  return lines
})

const centerStyle = computed(() => ({
  position: 'absolute',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
}))

const getSurroundPos = (index, total) => {
  if (!boardRef.value) return {}
  const angle = (2 * Math.PI * index) / total - Math.PI / 2
  const radius = Math.min(boardRef.value.clientWidth, boardRef.value.clientHeight) * 0.35
  const cx = boardRef.value.clientWidth / 2
  const cy = boardRef.value.clientHeight / 2
  const x = cx + radius * Math.cos(angle) - 75
  const y = cy + radius * Math.sin(angle) - 50
  return {
    position: 'absolute',
    left: x + 'px',
    top: y + 'px',
  }
}

const onNodeClick = (conn) => {
  deductionStore.selectTarget(conn.targetId)
}

const confirmConnection = () => {
  if (!deductionStore.activeBrainstormClue || !deductionStore.selectedTargetId) return
  const chain = deductionStore.attemptConnection(
    deductionStore.activeBrainstormClue,
    deductionStore.selectedTargetId,
    playerStore.reason
  )
  if (chain) {
    playerStore.recordDeduction(
      deductionStore.activeBrainstormClue,
      deductionStore.selectedTargetId,
      chain.name || '',
      !chain.isMisleading
    )
  }
}

const close = () => {
  deductionStore.closeBrainstorm()
  emit('close')
}

watch(() => props.clueId, (newId) => {
  if (newId) {
    nextTick(() => deductionStore.startBrainstorm(newId))
  }
}, { immediate: true })
</script>

<style scoped>
.brainstorm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(5, 3, 2, 0.94);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  backdrop-filter: blur(4px);
}

.brainstorm-panel {
  width: 95vw;
  max-width: 1200px;
  height: 88vh;
  background: #1a1410;
  border: 1px solid #3a2a1a;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 0 60px rgba(139, 0, 0, 0.15), inset 0 0 100px rgba(0, 0, 0, 0.3);
  background-image:
    radial-gradient(ellipse at 20% 50%, rgba(139, 0, 0, 0.04) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 50%, rgba(139, 0, 0, 0.04) 0%, transparent 50%);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  border-bottom: 1px solid #2a1a0a;
  background: #120d08;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-icon { font-size: 20px; }

.header-title {
  font-size: 15px;
  font-weight: 600;
  color: #c0a080;
  letter-spacing: 2px;
  font-family: 'Courier New', monospace;
}

.header-center { flex: 1; text-align: center; }

.current-clue-tag {
  background: #2a1a0a;
  border: 1px solid #5a3a1a;
  padding: 4px 16px;
  border-radius: 20px;
  font-size: 12px;
  color: #c0a080;
}

.close-btn {
  background: none;
  border: 1px solid #3a2a1a;
  color: #aa8866;
  padding: 6px 14px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}
.close-btn:hover { background: #3a1a1a; color: #ffcccc; }

/* 面板主体 */
.board-area {
  flex: 1;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 50%, rgba(30, 15, 5, 0.6) 0%, rgba(10, 5, 2, 0.9) 100%);
}

.connection-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 5;
}

/* 中心节点 */
.center-node { z-index: 20; pointer-events: none; }

.main-card {
  width: 300px;
  background: #1a1410;
  border: 2px solid #8b0000;
  border-radius: 12px;
  padding: 18px;
  position: relative;
  box-shadow: 0 0 24px rgba(139, 0, 0, 0.3);
}

.card-glow {
  position: absolute;
  inset: -4px;
  border-radius: 16px;
  background: transparent;
  box-shadow: 0 0 30px rgba(139, 0, 0, 0.2);
  pointer-events: none;
}

.card-icon { font-size: 32px; text-align: center; margin-bottom: 6px; }

.card-name {
  font-size: 15px;
  font-weight: 700;
  color: #e0c080;
  text-align: center;
  margin-bottom: 12px;
  letter-spacing: 1px;
}

.card-section { margin-bottom: 10px; }

.card-section.interpreted {
  border-left: 2px solid #8b0000;
  padding-left: 10px;
  margin-top: 8px;
}

.section-label {
  font-size: 10px;
  color: #aa8866;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 4px;
}

.section-text {
  font-size: 12px;
  color: #cccccc;
  line-height: 1.5;
}

.card-source {
  text-align: center;
  font-size: 10px;
  color: #665544;
  margin-top: 8px;
  font-style: italic;
}

/* 周围节点 */
.surround-node {
  z-index: 15;
  cursor: pointer;
  width: 150px;
  transition: all 0.2s;
}

.surround-node:hover { transform: scale(1.05); }

.surround-card {
  width: 150px;
  background: #1a1410;
  border: 1px solid #3a2a1a;
  border-radius: 10px;
  padding: 12px;
  text-align: center;
  transition: all 0.2s;
}

.surround-node.found .surround-card {
  border-color: #5a4a2a;
  background: #1e1814;
}
.surround-node.selected .surround-card {
  border-color: #c0a080;
  box-shadow: 0 0 16px rgba(192, 160, 128, 0.3);
}
.surround-node.unfound .surround-card {
  opacity: 0.6;
  border-style: dashed;
}

.surround-card .card-icon { font-size: 22px; margin-bottom: 2px; }
.surround-card .card-name {
  font-size: 11px;
  color: #c0a080;
  margin-bottom: 4px;
  font-weight: 600;
}
.surround-node.unfound .card-name { color: #665544; }

.card-hint {
  font-size: 10px;
  color: #665544;
}
.card-hint.found-hint { color: #887766; }

/* 连接操作 */
.connection-action {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  z-index: 30;
}

.connect-btn {
  background: #3a1a1a;
  border: 1px solid #8b0000;
  color: #e0c080;
  padding: 10px 24px;
  border-radius: 24px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 1px;
  transition: all 0.2s;
}
.connect-btn:hover { background: #5a2a2a; box-shadow: 0 0 16px rgba(139, 0, 0, 0.3); }

.cancel-btn {
  background: #1a1a1c;
  border: 1px solid #3a3a3e;
  color: #aaaaaa;
  padding: 10px 20px;
  border-radius: 24px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}
.cancel-btn:hover { background: #2a2a2e; }

/* 结果区 */
.result-area {
  padding: 16px 24px;
  border-top: 1px solid #2a1a0a;
  background: #120d08;
  flex-shrink: 0;
  min-height: 40px;
  text-align: center;
}

.result-text {
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-line;
}
.result-text.success { color: #88cc88; }
.result-text.fail { color: #cc8888; }

.instruction { color: #665544; font-size: 12px; }
.instruction .sub { font-size: 11px; color: #443322; margin-top: 4px; }

/* 已完成推理链 */
.chains-bar {
  padding: 8px 24px;
  border-top: 1px solid #2a1a0a;
  background: #0d0906;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.chain-badge {
  background: #1a2a1a;
  border: 1px solid #3a5a3a;
  color: #88cc88;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
}
</style>
