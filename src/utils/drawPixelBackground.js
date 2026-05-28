/**
 * 绘制俯瞰视角像素风格背景（物体坐标与交互物严格对应）
 * 场景宽度1200，高度500
 */

export function drawPixelBackground(canvas, sceneType, width = 1200, height = 500) {
  const ctx = canvas.getContext('2d')
  canvas.width = width
  canvas.height = height
  ctx.imageSmoothingEnabled = false

  switch (sceneType) {
    case 'classroom':
      drawClassroom(ctx, width, height)
      break
    case 'corridor':
      drawCorridor(ctx, width, height)
      break
    case 'lab':
      drawLab(ctx, width, height)
      break
    case 'control':
      drawControl(ctx, width, height)
      break
    case 'showcase':
      drawShowcase(ctx, width, height)
      break
    case 'forest':
      drawForest(ctx, width, height)
      break
    case 'shack':
      drawShack(ctx, width, height)
      break
    case 'gate':
      drawGate(ctx, width, height)
      break
    case 'void':
      drawVoid(ctx, width, height)
      break
    default:
      drawDefault(ctx, width, height)
  }
}

// ---------- 教室 (classroom) ----------
// 交互物坐标：门(1100,320)，周野NPC(820,340)，草稿纸(300,220)，日志(550,410)，粉笔擦陷阱(950,180)
function drawClassroom(ctx, w, h) {
  // 木质地板底色
  ctx.fillStyle = '#3a2a1a'
  ctx.fillRect(0, 0, w, h)
  // 木地板条纹
  ctx.fillStyle = '#4a3828'
  for (let y = h - 80; y < h; y += 8) ctx.fillRect(0, y, w, 3)
  // 黑板 (左侧，坐标60,80)
  ctx.fillStyle = '#1a2a1a'
  ctx.fillRect(60, 80, 280, 160)
  ctx.fillStyle = '#8b5a2b'
  ctx.fillRect(55, 75, 290, 10)
  ctx.fillStyle = '#c0a060'
  for (let i = 0; i < 3; i++) ctx.fillRect(70, 120 + i * 40, 260, 2)
  // 讲台 (围绕黑板)
  ctx.fillStyle = '#6b4a2a'
  ctx.fillRect(380, h - 110, 200, 60)
  ctx.fillStyle = '#8b6a3a'
  ctx.fillRect(390, h - 120, 180, 15)
  // 课桌 (4张，坐标与草稿纸、日志位置对应)
  const desks = [[300, 220], [550, 410], [800, 310], [1050, 290]]
  desks.forEach(([x, y]) => {
    ctx.fillStyle = '#7a5a3a'
    ctx.fillRect(x, y, 70, 40)
    ctx.fillStyle = '#5a3a1a'
    ctx.fillRect(x + 10, y - 10, 50, 12)
    // 书本装饰
    ctx.fillStyle = '#aa8866'
    ctx.fillRect(x + 15, y + 5, 15, 8)
    ctx.fillRect(x + 40, y + 5, 15, 8)
  })
  // 窗户 (右侧)
  ctx.fillStyle = '#4a6a8a'
  ctx.fillRect(w - 120, 60, 80, 100)
  ctx.fillStyle = '#2a3a4a'
  for (let i = 0; i < 3; i++) ctx.fillRect(w - 120 + i * 27, 60, 4, 100)
  // 教室门 (右下角，坐标1100,320)
  ctx.fillStyle = '#5a3a2a'
  ctx.fillRect(1100, 320, 60, 150)
  ctx.fillStyle = '#c0a060'
  ctx.fillRect(1135, 380, 10, 30)
  // 门把手
  ctx.fillStyle = '#ffcc88'
  ctx.fillRect(1135, 380, 6, 20)
  // 地面粉笔痕迹
  ctx.fillStyle = '#aa8866'
  for (let i = 0; i < 20; i++) ctx.fillRect(200 + i * 15, h - 20, 4, 2)
}

// ---------- 走廊 (corridor) ----------
// 交互物：返回教室门(80,320)，血字墙痕(450,200)，旧木门(1050,310)，药品(700,360)
function drawCorridor(ctx, w, h) {
  ctx.fillStyle = '#1e1a1a'
  ctx.fillRect(0, 0, w, h)
  // 墙砖缝
  ctx.strokeStyle = '#2a2222'
  ctx.lineWidth = 1
  for (let x = 0; x < w; x += 80) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, h)
    ctx.stroke()
  }
  // 储物柜 (左侧)
  ctx.fillStyle = '#4a3a2a'
  for (let i = 0; i < 5; i++) {
    ctx.fillRect(50 + i * 110, 50, 100, 180)
    ctx.fillStyle = '#6a5a3a'
    ctx.fillRect(60 + i * 110, 60, 80, 50)
    ctx.fillStyle = '#c0a060'
    ctx.fillRect(95 + i * 110, 75, 10, 20)
    ctx.fillStyle = '#4a3a2a'
  }
  // 顶灯
  for (let x = 100; x < w; x += 200) {
    ctx.fillStyle = '#ffdd99'
    ctx.fillRect(x, 10, 40, 8)
    ctx.fillStyle = '#aa8866'
    ctx.fillRect(x + 15, 18, 10, 15)
  }
  // 窗户 (右侧)
  for (let y = 100; y < h - 100; y += 120) {
    ctx.fillStyle = '#4a6a8a'
    ctx.fillRect(w - 100, y, 80, 100)
    ctx.fillStyle = '#2a3a4a'
    for (let i = 0; i < 2; i++) ctx.fillRect(w - 100 + i * 40, y, 5, 100)
  }
  // 返回教室的门 (左侧，坐标80,320)
  ctx.fillStyle = '#5a3a2a'
  ctx.fillRect(80, 320, 60, 150)
  ctx.fillStyle = '#c0a060'
  ctx.fillRect(115, 380, 10, 30)
  // 血字墙痕 (左侧墙壁，坐标450,200)
  ctx.fillStyle = '#8a1a1a'
  ctx.font = 'bold 24px monospace'
  ctx.fillText('8421', 420, 180)
  ctx.fillStyle = '#aa3333'
  for (let i = 0; i < 5; i++) ctx.fillRect(430 + i * 8, 200, 4, 30)
  // 旧木门 (右侧，坐标1050,310)
  ctx.fillStyle = '#5a3a2a'
  ctx.fillRect(1050, 310, 70, 180)
  ctx.fillStyle = '#c0a060'
  ctx.fillRect(1090, 380, 10, 30)
  // 地上药品 (坐标700,360)
  ctx.fillStyle = '#44aa44'
  ctx.fillRect(700, 360, 12, 12)
  ctx.fillStyle = '#88ff88'
  ctx.fillRect(702, 362, 4, 4)
}

// ---------- 实验室 (lab) ----------
function drawLab(ctx, w, h) {
  ctx.fillStyle = '#0a1a0a'
  ctx.fillRect(0, 0, w, h)
  // 金属网格地板
  ctx.strokeStyle = '#2a4a2a'
  for (let y = 0; y < h; y += 40) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(w, y)
    ctx.stroke()
  }
  // 实验台 (左侧)
  ctx.fillStyle = '#3a5a3a'
  ctx.fillRect(100, 250, 300, 80)
  ctx.fillStyle = '#8a8a6a'
  ctx.fillRect(120, 230, 260, 20)
  // 试管架
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = '#aaffaa'
    ctx.fillRect(140 + i * 35, 210, 8, 25)
  }
  // 电脑终端 (右侧)
  ctx.fillStyle = '#2a2a2a'
  ctx.fillRect(600, 150, 150, 100)
  ctx.fillStyle = '#44ff44'
  ctx.fillRect(620, 170, 110, 60)
  ctx.fillStyle = '#aaaaaa'
  ctx.fillRect(670, 220, 10, 30)
  // 气罐 (右下)
  ctx.fillStyle = '#6a6a6a'
  ctx.fillRect(850, 300, 50, 120)
  ctx.fillStyle = '#aa4444'
  ctx.fillRect(860, 280, 30, 20)
  // 管道
  ctx.strokeStyle = '#8a8a8a'
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.moveTo(920, 300)
  ctx.lineTo(980, 200)
  ctx.lineTo(980, 80)
  ctx.stroke()
  // 传送门入口 (左侧)
  ctx.fillStyle = '#2a4a6a'
  ctx.fillRect(80, 280, 40, 100)
  ctx.fillStyle = '#88aaff'
  ctx.fillRect(85, 290, 30, 80)
}

// ---------- 监控室 (control) ----------
function drawControl(ctx, w, h) {
  ctx.fillStyle = '#140a0a'
  ctx.fillRect(0, 0, w, h)
  // 大屏幕矩阵
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 2; j++) {
      ctx.fillStyle = '#1a1a2a'
      ctx.fillRect(100 + i * 200, 50 + j * 150, 150, 100)
      ctx.fillStyle = '#00aa88'
      ctx.fillRect(110 + i * 200, 60 + j * 150, 130, 80)
      for (let k = 0; k < 80; k += 8) {
        ctx.fillStyle = '#00000022'
        ctx.fillRect(110 + i * 200, 60 + j * 150 + k, 130, 2)
      }
    }
  }
  // 控制台
  ctx.fillStyle = '#4a4a4a'
  ctx.fillRect(0, h - 120, w, 60)
  for (let i = 0; i < 12; i++) {
    ctx.fillStyle = '#aa5555'
    ctx.fillRect(50 + i * 60, h - 110, 20, 30)
    ctx.fillStyle = '#88ff88'
    ctx.fillRect(55 + i * 60, h - 105, 10, 15)
  }
  // 传送门
  ctx.fillStyle = '#2a4a6a'
  ctx.fillRect(w - 100, 280, 40, 100)
  ctx.fillStyle = '#88aaff'
  ctx.fillRect(w - 95, 290, 30, 80)
}

// ---------- 标本走廊 (showcase) ----------
function drawShowcase(ctx, w, h) {
  ctx.fillStyle = '#1a1a22'
  ctx.fillRect(0, 0, w, h)
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = '#3a3a4a'
    ctx.fillRect(50 + i * 180, 80, 140, 200)
    ctx.fillStyle = '#88aaff'
    ctx.fillRect(60 + i * 180, 90, 120, 180)
    ctx.fillStyle = '#aaccff'
    ctx.fillRect(90 + i * 180, 110, 60, 120)
    ctx.fillStyle = '#336699'
    ctx.fillRect(105 + i * 180, 100, 30, 15)
    ctx.fillStyle = '#00aa88'
    ctx.fillRect(95 + i * 180, 200, 50, 25)
  }
  // 传送门
  ctx.fillStyle = '#2a4a6a'
  ctx.fillRect(30, 280, 40, 100)
  ctx.fillStyle = '#88aaff'
  ctx.fillRect(35, 290, 30, 80)
}

// ---------- 小树林 (forest) ----------
function drawForest(ctx, w, h) {
  ctx.fillStyle = '#1a2418'
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = '#2a3a20'
  for (let y = h - 60; y < h; y += 10) ctx.fillRect(0, y, w, 5)
  const trunks = [[150, 300], [400, 200], [700, 280], [1000, 320]]
  trunks.forEach(([x, y]) => {
    ctx.fillStyle = '#4a2a1a'
    ctx.fillRect(x, y, 30, h - y)
    ctx.fillStyle = '#6a4a2a'
    for (let i = 0; i < 5; i++) ctx.fillRect(x - 5 + i * 8, y + 20, 3, 40)
    ctx.fillStyle = '#2a5a2a'
    for (let i = 0; i < 3; i++) {
      ctx.beginPath()
      ctx.moveTo(x + 15, y - 20 + i * 30)
      ctx.lineTo(x - 20, y + i * 20)
      ctx.lineTo(x + 50, y + i * 20)
      ctx.fill()
    }
  })
  // 落叶
  for (let i = 0; i < 200; i++) {
    ctx.fillStyle = `rgba(80, 60, 30, ${Math.random() * 0.5})`
    ctx.fillRect(20 + Math.random() * (w - 40), h - 60 + Math.random() * 50, 2, 2)
  }
  ctx.fillStyle = '#ddccaa'
  ctx.beginPath()
  ctx.arc(w - 80, 60, 30, 0, Math.PI * 2)
  ctx.fill()
  // 传送门 (右侧)
  ctx.fillStyle = '#2a4a6a'
  ctx.fillRect(w - 80, 320, 40, 100)
  ctx.fillStyle = '#88aaff'
  ctx.fillRect(w - 75, 330, 30, 80)
}

// ---------- 门卫小屋 (shack) ----------
function drawShack(ctx, w, h) {
  ctx.fillStyle = '#2a1e12'
  ctx.fillRect(0, 0, w, h)
  for (let x = 0; x < w; x += 40) {
    ctx.fillStyle = '#4a2a1a'
    ctx.fillRect(x, 0, 20, h)
  }
  // 床
  ctx.fillStyle = '#6a5a3a'
  ctx.fillRect(200, h - 140, 140, 60)
  ctx.fillStyle = '#8a7a5a'
  ctx.fillRect(210, h - 150, 120, 15)
  ctx.fillStyle = '#aa8866'
  ctx.fillRect(210, h - 135, 120, 40)
  // 桌子
  ctx.fillStyle = '#7a5a3a'
  ctx.fillRect(600, h - 120, 100, 50)
  ctx.fillStyle = '#c0a060'
  ctx.fillRect(620, h - 130, 60, 15)
  // 窗户
  ctx.fillStyle = '#4a6a8a'
  ctx.fillRect(850, 80, 100, 100)
  ctx.fillStyle = '#2a3a4a'
  for (let i = 0; i < 2; i++) {
    ctx.fillRect(850 + i * 50, 80, 5, 100)
    ctx.fillRect(850, 80 + i * 50, 100, 5)
  }
  // 门
  ctx.fillStyle = '#5a3a2a'
  ctx.fillRect(w - 100, h - 180, 60, 150)
  ctx.fillStyle = '#c0a060'
  ctx.fillRect(w - 65, h - 100, 10, 30)
  // 传送门 (右侧)
  ctx.fillStyle = '#2a4a6a'
  ctx.fillRect(w - 80, 320, 40, 100)
}

// ---------- 学校大门 (gate) ----------
function drawGate(ctx, w, h) {
  ctx.fillStyle = '#2a2a2a'
  ctx.fillRect(0, 0, w, h)
  for (let x = 0; x < w; x += 40) {
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(x, 0, 8, h)
  }
  ctx.fillStyle = '#3a3a3a'
  ctx.fillRect(0, 80, w, 15)
  ctx.fillRect(0, h - 120, w, 15)
  ctx.fillStyle = '#aa8844'
  ctx.fillRect(w / 2 - 20, h - 100, 40, 40)
  ctx.fillStyle = '#ffaa66'
  ctx.fillRect(w / 2 - 10, h - 90, 20, 20)
  ctx.fillStyle = '#6a6a6a'
  ctx.fillRect(50, 120, 10, 200)
  ctx.fillStyle = '#ffdd99'
  ctx.beginPath()
  ctx.arc(55, 120, 20, 0, Math.PI * 2)
  ctx.fill()
  // 传送门 (右侧)
  ctx.fillStyle = '#2a4a6a'
  ctx.fillRect(w - 100, 280, 40, 100)
  ctx.fillStyle = '#88aaff'
  ctx.fillRect(w - 95, 290, 30, 80)
}

// ---------- 虚无 (void) ----------
function drawVoid(ctx, w, h) {
  ctx.fillStyle = '#080404'
  ctx.fillRect(0, 0, w, h)
  for (let i = 0; i < 50; i++) {
    ctx.beginPath()
    const angle = i * 0.5
    const r = 100 + i * 5
    const x = w / 2 + Math.cos(angle) * r
    const y = h / 2 + Math.sin(angle) * r
    ctx.fillStyle = `rgba(100, 20, 20, ${0.1 + i * 0.01})`
    ctx.fillRect(x, y, 4, 4)
  }
  for (let i = 0; i < 300; i++) {
    ctx.fillStyle = `rgba(255, 100, 100, ${Math.random() * 0.5})`
    ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2)
  }
  ctx.fillStyle = '#ff4444'
  ctx.beginPath()
  ctx.arc(w / 2, h / 2, 15, 0, Math.PI * 2)
  ctx.fill()
  // 传送门
  ctx.fillStyle = '#2a4a6a'
  ctx.fillRect(80, 280, 40, 100)
  ctx.fillStyle = '#88aaff'
  ctx.fillRect(85, 290, 30, 80)
}

function drawDefault(ctx, w, h) {
  ctx.fillStyle = '#0a0a0c'
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = '#2a2a2e'
  for (let i = 0; i < w; i += 40) {
    for (let j = 0; j < h; j += 40) {
      ctx.fillRect(i, j, 2, 2)
    }
  }
}