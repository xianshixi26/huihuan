import PptxGenJS from "pptxgenjs";

const pptx = new PptxGenJS();

// ===== 全局样式配置 =====
pptx.layout = "LAYOUT_16x9";
pptx.author = "实训项目组";
pptx.subject = "校园悬疑交互式网站";

// 颜色方案 - 暗色悬疑风格
const C = {
  bg: "0D0D1A",         // 深蓝黑背景
  bgLight: "1A1A2E",    // 稍浅背景
  accent: "E94560",     // 红色强调
  accent2: "0F3460",    // 深蓝强调
  accent3: "16213E",    // 蓝黑
  gold: "FFD700",       // 金色
  text: "EAEAEA",       // 浅灰文字
  textDim: "8888AA",    // 暗灰文字
  white: "FFFFFF",
  green: "00D9A6",      // 绿色(成果)
  orange: "FF8C42",     // 橙色(警告)
};

// 通用辅助函数
function addBgRect(slide) {
  slide.background = { color: C.bg };
  // 顶部装饰线
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: 0.08,
    fill: { color: C.accent },
  });
}

function addSectionHeader(slide, sectionNum, sectionTitle) {
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.3, y: 0.3, w: 0.5, h: 0.5,
    fill: { color: C.accent },
    rectRadius: 0.05,
  });
  slide.addText(String(sectionNum), {
    x: 0.3, y: 0.3, w: 0.5, h: 0.5,
    fontSize: 22, fontFace: "Arial", color: C.white,
    align: "center", valign: "middle", bold: true,
  });
  slide.addText(sectionTitle, {
    x: 0.95, y: 0.3, w: 7, h: 0.5,
    fontSize: 22, fontFace: "Microsoft YaHei", color: C.white,
    bold: true, valign: "middle",
  });
  // 分割线
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.3, y: 0.9, w: 9, h: 0.02,
    fill: { color: C.accent2 },
  });
}

function addPageNum(slide, num, total) {
  slide.addText(`${num} / ${total}`, {
    x: 8.5, y: 6.8, w: 1.2, h: 0.3,
    fontSize: 10, fontFace: "Arial", color: C.textDim,
    align: "center",
  });
}

function addBulletList(slide, items, opts = {}) {
  const {
    x = 0.6, y = 1.3, w = 8.5, h = 5,
    fontSize = 14, color = C.text, lineSpacing = 1.6,
  } = opts;
  slide.addText(
    items.map((item) => ({
      text: item,
      options: { bullet: { code: "25B6", color: C.accent }, breakType: "none" },
    })),
    { x, y, w, h, fontSize, fontFace: "Microsoft YaHei", color, lineSpacingMultiple: lineSpacing, valign: "top" }
  );
}

function addTwoColumnBullets(slide, leftItems, rightItems, opts = {}) {
  const { y = 1.3, fontSize = 13, color = C.text } = opts;
  // 左列标题
  slide.addText(leftItems[0], {
    x: 0.4, y, w: 4.2, h: 0.4,
    fontSize: 15, fontFace: "Microsoft YaHei", color: C.gold, bold: true,
  });
  addBulletList(slide, leftItems.slice(1), { x: 0.6, y: y + 0.5, w: 4, fontSize, color });
  // 右列标题
  slide.addText(rightItems[0], {
    x: 5.2, y, w: 4.2, h: 0.4,
    fontSize: 15, fontFace: "Microsoft YaHei", color: C.gold, bold: true,
  });
  addBulletList(slide, rightItems.slice(1), { x: 5.4, y: y + 0.5, w: 4, fontSize, color });
}

// 总页数
const TOTAL = 18;

// ===== 页1：封面 =====
{
  const slide = pptx.addSlide();
  slide.background = { color: C.bg };
  // 全屏深色背景上的大标题
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: "100%",
    fill: { color: C.bg },
  });
  // 顶部红色装饰
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: 0.12,
    fill: { color: C.accent },
  });
  // 中间装饰线
  slide.addShape(pptx.ShapeType.rect, {
    x: 1.5, y: 2.2, w: 7, h: 0.03,
    fill: { color: C.accent },
  });
  // 主标题
  slide.addText("校园悬疑交互式网站", {
    x: 0.5, y: 1.2, w: 9, h: 1,
    fontSize: 38, fontFace: "Microsoft YaHei", color: C.white,
    bold: true, align: "center",
  });
  // 副标题
  slide.addText("—— 购物即探险，解密即收获 ——", {
    x: 0.5, y: 2.4, w: 9, h: 0.6,
    fontSize: 20, fontFace: "Microsoft YaHei", color: C.accent,
    align: "center",
  });
  // 英文副标题
  slide.addText("MUTED RECURSION — Campus Mystery Interactive Website", {
    x: 0.5, y: 3.1, w: 9, h: 0.4,
    fontSize: 13, fontFace: "Arial", color: C.textDim,
    align: "center", italic: true,
  });
  // 底部信息区
  slide.addShape(pptx.ShapeType.rect, {
    x: 2, y: 4.5, w: 6, h: 0.03,
    fill: { color: C.accent2 },
  });
  slide.addText("Web前端开发项目实训", {
    x: 0.5, y: 4.7, w: 9, h: 0.4,
    fontSize: 16, fontFace: "Microsoft YaHei", color: C.gold,
    align: "center",
  });
  slide.addText("指导老师：沈敏君", {
    x: 0.5, y: 5.2, w: 9, h: 0.35,
    fontSize: 13, fontFace: "Microsoft YaHei", color: C.textDim,
    align: "center",
  });
  slide.addText("开发者：方泽锋 / 颜嘉耀 / 颜宗鸿", {
    x: 0.5, y: 5.55, w: 9, h: 0.35,
    fontSize: 13, fontFace: "Microsoft YaHei", color: C.textDim,
    align: "center",
  });
  addPageNum(slide, 1, TOTAL);
}

// ===== 页2：目录 =====
{
  const slide = pptx.addSlide();
  addBgRect(slide);
  slide.addText("目  录", {
    x: 0.5, y: 0.3, w: 9, h: 0.7,
    fontSize: 28, fontFace: "Microsoft YaHei", color: C.white,
    bold: true, align: "center",
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 3.5, y: 1.0, w: 3, h: 0.03,
    fill: { color: C.accent },
  });
  const chapters = [
    { num: "01", title: "项目背景与定位", sub: "痛点分析 / 创意思路 / 目标用户" },
    { num: "02", title: "网站架构与功能设计", sub: "整体架构 / 交互模块 / 权限体系" },
    { num: "03", title: "技术实现与开发流程", sub: "前端技术栈 / 后端架构 / 迭代计划" },
    { num: "04", title: "交互体验与创意亮点", sub: "沉浸式设计 / 社区互动 / 氛围细节" },
    { num: "05", title: "实训成果与反思总结", sub: "完成情况 / 问题解决 / 未来方向" },
  ];
  chapters.forEach((ch, i) => {
    const yy = 1.4 + i * 1.0;
    slide.addShape(pptx.ShapeType.rect, {
      x: 1.2, y: yy, w: 0.6, h: 0.6,
      fill: { color: C.accent }, rectRadius: 0.08,
    });
    slide.addText(ch.num, {
      x: 1.2, y: yy, w: 0.6, h: 0.6,
      fontSize: 20, fontFace: "Arial", color: C.white,
      align: "center", valign: "middle", bold: true,
    });
    slide.addText(ch.title, {
      x: 2.1, y: yy, w: 5, h: 0.35,
      fontSize: 18, fontFace: "Microsoft YaHei", color: C.white, bold: true,
    });
    slide.addText(ch.sub, {
      x: 2.1, y: yy + 0.32, w: 5, h: 0.28,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDim,
    });
    if (i < chapters.length - 1) {
      slide.addShape(pptx.ShapeType.rect, {
        x: 1.47, y: yy + 0.6, w: 0.06, h: 0.4,
        fill: { color: C.accent2 },
      });
    }
  });
  addPageNum(slide, 2, TOTAL);
}

// ===== 第一部分：项目背景与定位 =====

// 页3：传统电商的痛点
{
  const slide = pptx.addSlide();
  addBgRect(slide);
  addSectionHeader(slide, 1, "项目背景与定位");
  slide.addText("传统电商的痛点", {
    x: 0.5, y: 1.1, w: 9, h: 0.5,
    fontSize: 20, fontFace: "Microsoft YaHei", color: C.gold, bold: true,
  });
  addBulletList(slide, [
    "界面同质化严重，千篇一律的商品列表与搜索框，用户产生审美疲劳",
    "缺乏情感互动与沉浸氛围，购物体验枯燥单一",
    "用户平均停留时间短，页面跳出率高，转化率持续走低",
    "无法满足Z世代对个性化、新鲜体验的强烈追求",
    "商业逻辑单一（搜索→浏览→购买），难以形成社群粘性与用户忠诚度",
    "商品与用户之间缺少情感连接，购买决策完全依赖价格与评价",
  ], { y: 1.7 });
  addPageNum(slide, 3, TOTAL);
}

// 页4：创意思路
{
  const slide = pptx.addSlide();
  addBgRect(slide);
  addSectionHeader(slide, 1, "项目背景与定位");
  slide.addText("校园悬疑交互式网站的创意思路", {
    x: 0.5, y: 1.1, w: 9, h: 0.5,
    fontSize: 20, fontFace: "Microsoft YaHei", color: C.gold, bold: true,
  });
  addBulletList(slide, [
    "将购物流程融入悬疑解密剧情中 —— 用户不是在「逛店」，而是在「破案」",
    "用户扮演校园侦探角色，通过完成推理任务来解锁商品购买资格",
    "网站页面设计充满神秘感与探索欲，每一个角落都可能藏着线索",
    "利用交互叙事大幅提升用户参与度与停留时长",
    "跳脱传统电商的「搜索→购买」线性模式，创造「探索→发现→解密→收获」的全新体验链路",
  ], { y: 1.7 });
  // 右侧亮点框
  slide.addShape(pptx.ShapeType.rect, {
    x: 6.5, y: 4.5, w: 3, h: 1.5,
    fill: { color: C.accent2 }, rectRadius: 0.1,
  });
  slide.addText("核心理念\n内容即商品\n叙事即营销", {
    x: 6.5, y: 4.5, w: 3, h: 1.5,
    fontSize: 15, fontFace: "Microsoft YaHei", color: C.gold,
    align: "center", valign: "middle", bold: true, lineSpacingMultiple: 1.5,
  });
  addPageNum(slide, 4, TOTAL);
}

// 页5：目标用户与核心价值
{
  const slide = pptx.addSlide();
  addBgRect(slide);
  addSectionHeader(slide, 1, "项目背景与定位");
  addTwoColumnBullets(slide, [
    "目标用户定位",
    "高校在校生及年轻职场人群",
    "喜欢悬疑、推理、解谜类文化的群体",
    "追求个性化、沉浸式购物体验的用户",
    "对传统电商审美疲劳的内容消费者",
    "乐于分享和社群互动的活跃用户",
  ], [
    "核心价值主张",
    "购物即探险，解密即收获",
    "让每一次点击都充满惊喜与悬念",
    "重构人、货、场的关系",
    "网站即舞台，用户即主角",
    "打造校园文化圈层的独特记忆点",
  ]);
  addPageNum(slide, 5, TOTAL);
}

// ===== 第二部分：网站架构与功能设计 =====

// 页6：整体架构概览
{
  const slide = pptx.addSlide();
  addBgRect(slide);
  addSectionHeader(slide, 2, "网站架构与功能设计");
  slide.addText("整体架构概览", {
    x: 0.5, y: 1.1, w: 9, h: 0.5,
    fontSize: 20, fontFace: "Microsoft YaHei", color: C.gold, bold: true,
  });
  // 五个模块方块
  const modules = [
    { name: "首页", desc: "迷雾校园入口\n最新案件预告", color: C.accent },
    { name: "剧情区", desc: "多线叙事\n用户选择影响走向", color: "8B0000" },
    { name: "线索商店", desc: "解密获得线索币\n兑换限定商品", color: C.accent2 },
    { name: "人物档案", desc: "NPC角色故事墙\n拓展世界观", color: "2D4A7A" },
    { name: "推理论坛", desc: "交流谜题解法\n剧情猜测讨论", color: "1B4332" },
  ];
  modules.forEach((m, i) => {
    const xx = 0.4 + i * 1.9;
    slide.addShape(pptx.ShapeType.rect, {
      x: xx, y: 1.8, w: 1.7, h: 2.2,
      fill: { color: m.color }, rectRadius: 0.1,
      shadow: { type: "outer", blur: 6, offset: 3, color: "000000", opacity: 0.4 },
    });
    slide.addText(m.name, {
      x: xx, y: 1.9, w: 1.7, h: 0.6,
      fontSize: 16, fontFace: "Microsoft YaHei", color: C.white,
      align: "center", valign: "middle", bold: true,
    });
    slide.addText(m.desc, {
      x: xx, y: 2.6, w: 1.7, h: 1.2,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.text,
      align: "center", valign: "top", lineSpacingMultiple: 1.4,
    });
    // 箭头连接
    if (i < modules.length - 1) {
      slide.addText("→", {
        x: xx + 1.7, y: 2.5, w: 0.2, h: 0.4,
        fontSize: 18, color: C.accent, align: "center", valign: "middle",
      });
    }
  });
  // 底部说明
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.4, y: 4.4, w: 9, h: 0.03,
    fill: { color: C.accent2 },
  });
  slide.addText("五个核心模块形成闭环：用户从首页进入 → 剧情区探索 → 收集线索 → 商店兑换 → 论坛交流 → 回到剧情区深入探索", {
    x: 0.5, y: 4.6, w: 8.8, h: 0.5,
    fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDim,
    align: "center",
  });
  addPageNum(slide, 6, TOTAL);
}

// 页7：核心交互功能模块
{
  const slide = pptx.addSlide();
  addBgRect(slide);
  addSectionHeader(slide, 2, "网站架构与功能设计");
  slide.addText("核心交互功能模块", {
    x: 0.5, y: 1.1, w: 9, h: 0.5,
    fontSize: 20, fontFace: "Microsoft YaHei", color: C.gold, bold: true,
  });
  const features = [
    { icon: "🎭", name: "沉浸式剧情编辑器", desc: "支持分支剧情与选择节点，用户决策影响故事走向" },
    { icon: "🔐", name: "解谜小游戏", desc: "密码锁、拼图、暗号解读等多种交互式谜题" },
    { icon: "🔗", name: "智能线索关联系统", desc: "用户收集的线索自动拼合，形成完整推理链" },
    { icon: "🗺", name: "虚拟校园地图", desc: "可探索的2D场景漫游，每个地点隐藏不同线索" },
    { icon: "💬", name: "实时弹幕系统", desc: "营造悬疑氛围，群体推理乐趣，实时互动" },
  ];
  features.forEach((f, i) => {
    const yy = 1.7 + i * 0.9;
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.5, y: yy, w: 8.8, h: 0.75,
      fill: { color: C.bgLight }, rectRadius: 0.08,
    });
    slide.addText(f.icon, {
      x: 0.6, y: yy, w: 0.6, h: 0.75,
      fontSize: 22, align: "center", valign: "middle",
    });
    slide.addText(f.name, {
      x: 1.3, y: yy + 0.05, w: 2.5, h: 0.35,
      fontSize: 14, fontFace: "Microsoft YaHei", color: C.accent, bold: true,
    });
    slide.addText(f.desc, {
      x: 1.3, y: yy + 0.38, w: 7.5, h: 0.32,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDim,
    });
  });
  addPageNum(slide, 7, TOTAL);
}

// 页8：用户角色与权限体系
{
  const slide = pptx.addSlide();
  addBgRect(slide);
  addSectionHeader(slide, 2, "网站架构与功能设计");
  slide.addText("用户角色与权限体系", {
    x: 0.5, y: 1.1, w: 9, h: 0.5,
    fontSize: 20, fontFace: "Microsoft YaHei", color: C.gold, bold: true,
  });
  const roles = [
    { role: "普通访客", perm: "有限探索免费剧情，基础解密权限", color: C.textDim },
    { role: "校园侦探", perm: "完整剧情体验，线索收集与背包功能", color: C.text },
    { role: "高级解密者", perm: "独家案件、隐藏商品、优先购买权", color: C.gold },
    { role: "NPC扮演者", perm: "自定义发布悬疑任务，用户共创内容", color: C.accent },
    { role: "后台管理员", perm: "剧情更新、商品上架、用户数据监控", color: C.green },
  ];
  // 表头
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 1.7, w: 8.8, h: 0.5,
    fill: { color: C.accent2 },
  });
  slide.addText("角色", {
    x: 0.6, y: 1.7, w: 2.2, h: 0.5,
    fontSize: 13, fontFace: "Microsoft YaHei", color: C.white, bold: true, valign: "middle",
  });
  slide.addText("权限说明", {
    x: 2.8, y: 1.7, w: 6, h: 0.5,
    fontSize: 13, fontFace: "Microsoft YaHei", color: C.white, bold: true, valign: "middle",
  });
  roles.forEach((r, i) => {
    const yy = 2.2 + i * 0.7;
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.5, y: yy, w: 8.8, h: 0.6,
      fill: { color: i % 2 === 0 ? C.bgLight : C.bg },
    });
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.5, y: yy, w: 0.06, h: 0.6,
      fill: { color: r.color },
    });
    slide.addText(r.role, {
      x: 0.7, y: yy, w: 2, h: 0.6,
      fontSize: 13, fontFace: "Microsoft YaHei", color: r.color, bold: true, valign: "middle",
    });
    slide.addText(r.perm, {
      x: 2.8, y: yy, w: 6, h: 0.6,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.text, valign: "middle",
    });
  });
  // 底部说明
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 5.8, w: 8.8, h: 0.03,
    fill: { color: C.accent },
  });
  slide.addText("权限逐级递增，激励用户通过解密与互动提升等级", {
    x: 0.5, y: 5.9, w: 8.8, h: 0.4,
    fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDim, align: "center",
  });
  addPageNum(slide, 8, TOTAL);
}

// 页9：商品解锁机制
{
  const slide = pptx.addSlide();
  addBgRect(slide);
  addSectionHeader(slide, 2, "网站架构与功能设计");
  slide.addText("独特的商品解锁机制", {
    x: 0.5, y: 1.1, w: 9, h: 0.5,
    fontSize: 20, fontFace: "Microsoft YaHei", color: C.gold, bold: true,
  });
  addBulletList(slide, [
    "商品解锁条件 = 解密成功，而非直接付费",
    "每个商品对应一段独立番外剧情或隐藏线索",
    "限定商品仅在特定剧情分支中可解锁，增加收藏稀有感",
    "用户可邀请好友参与案件协作，降低解锁门槛",
    "商品详情页附有剧情线索卡，购买后可在线「拆包推理」",
    "商品本身也是叙事的一部分 —— 买到的不只是物品，更是故事",
  ], { y: 1.7 });
  // 右侧对比框
  slide.addShape(pptx.ShapeType.rect, {
    x: 6.2, y: 4.3, w: 3.2, h: 1.8,
    fill: { color: C.accent2 }, rectRadius: 0.1,
  });
  slide.addText("传统电商\n搜索 → 购买\n\n悬疑电商\n探索 → 解密 → 解锁 → 收获", {
    x: 6.2, y: 4.3, w: 3.2, h: 1.8,
    fontSize: 12, fontFace: "Microsoft YaHei", color: C.text,
    align: "center", valign: "middle", lineSpacingMultiple: 1.3,
  });
  addPageNum(slide, 9, TOTAL);
}

// ===== 第三部分：技术实现 =====

// 页10：前端技术栈
{
  const slide = pptx.addSlide();
  addBgRect(slide);
  addSectionHeader(slide, 3, "技术实现与开发流程");
  slide.addText("前端技术栈选择", {
    x: 0.5, y: 1.1, w: 9, h: 0.5,
    fontSize: 20, fontFace: "Microsoft YaHei", color: C.gold, bold: true,
  });
  const techs = [
    { name: "Vue.js 3", desc: "Composition API + script setup，实现动态交互与组件化开发", tag: "框架" },
    { name: "Pinia", desc: "轻量级状态管理，管理游戏属性、线索、背包等全局状态", tag: "状态" },
    { name: "Vue Router 4", desc: "路由管理，支持章节场景切换与页面导航", tag: "路由" },
    { name: "GSAP", desc: "悬疑氛围转场与特效动画，故障艺术风格", tag: "动画" },
    { name: "ECharts", desc: "数据可视化，呈现用户探索路径与线索网络", tag: "可视化" },
    { name: "Web Audio API", desc: "氛围音效与关键节点音效触发", tag: "音效" },
    { name: "Vite", desc: "快速构建工具，HMR热更新提升开发效率", tag: "构建" },
  ];
  techs.forEach((t, i) => {
    const yy = 1.7 + i * 0.65;
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.5, y: yy, w: 8.8, h: 0.55,
      fill: { color: i % 2 === 0 ? C.bgLight : C.bg },
    });
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.5, y: yy, w: 1.5, h: 0.55,
      fill: { color: C.accent2 }, rectRadius: 0.05,
    });
    slide.addText(t.tag, {
      x: 0.5, y: yy, w: 1.5, h: 0.55,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.gold,
      align: "center", valign: "middle", bold: true,
    });
    slide.addText(t.name, {
      x: 2.2, y: yy, w: 2, h: 0.55,
      fontSize: 13, fontFace: "Microsoft YaHei", color: C.accent, bold: true, valign: "middle",
    });
    slide.addText(t.desc, {
      x: 4.2, y: yy, w: 5, h: 0.55,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.text, valign: "middle",
    });
  });
  addPageNum(slide, 10, TOTAL);
}

// 页11：后端架构设计
{
  const slide = pptx.addSlide();
  addBgRect(slide);
  addSectionHeader(slide, 3, "技术实现与开发流程");
  slide.addText("后端架构设计", {
    x: 0.5, y: 1.1, w: 9, h: 0.5,
    fontSize: 20, fontFace: "Microsoft YaHei", color: C.gold, bold: true,
  });
  addTwoColumnBullets(slide, [
    "服务端技术",
    "服务器：Node.js + Express",
    "API风格：RESTful，支持剧情分支动态加载",
    "身份验证：JWT实现用户登录与权限管理",
    "日志系统：记录用户解密路径用于优化",
  ], [
    "数据与实时",
    "数据库：MySQL存储剧情节点与用户数据",
    "缓存：Redis管理实时状态与会话",
    "WebSocket：实时推送交互反馈",
    "请求限流：防止暴力破解谜题",
  ], { y: 1.7 });
  // 底部架构图示意
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 4.5, w: 8.8, h: 1.8,
    fill: { color: C.bgLight }, rectRadius: 0.1,
  });
  slide.addText("客户端（浏览器）  ←→  API网关  ←→  业务服务层  ←→  数据层", {
    x: 0.5, y: 4.6, w: 8.8, h: 0.5,
    fontSize: 14, fontFace: "Microsoft YaHei", color: C.accent, align: "center", bold: true,
  });
  slide.addText("Vue3 SPA          Express路由     剧情/用户/商品     MySQL + Redis", {
    x: 0.5, y: 5.1, w: 8.8, h: 0.4,
    fontSize: 11, fontFace: "Arial", color: C.textDim, align: "center",
  });
  slide.addText("JWT认证 → 每次请求携带token → 后端验证 → 返回对应权限数据", {
    x: 0.5, y: 5.6, w: 8.8, h: 0.4,
    fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDim, align: "center",
  });
  addPageNum(slide, 11, TOTAL);
}

// 页12：开发迭代计划
{
  const slide = pptx.addSlide();
  addBgRect(slide);
  addSectionHeader(slide, 3, "技术实现与开发流程");
  slide.addText("开发阶段与迭代计划", {
    x: 0.5, y: 1.1, w: 9, h: 0.5,
    fontSize: 20, fontFace: "Microsoft YaHei", color: C.gold, bold: true,
  });
  const phases = [
    { phase: "第一阶段", title: "核心框架搭建", desc: "首页、登录注册、基础剧情展示框架", color: C.accent },
    { phase: "第二阶段", title: "悬疑交互开发", desc: "引入悬疑交互，开发第一条完整解密故事线", color: "E94560" },
    { phase: "第三阶段", title: "商品系统接入", desc: "上线线索商店、兑换功能、商品详情页", color: C.accent2 },
    { phase: "第四阶段", title: "社群生态建设", desc: "用户共创模块、推理论坛、侦探勋章系统", color: "2D4A7A" },
    { phase: "第五阶段", title: "优化与打磨", desc: "性能优化、安全加固、用户体验打磨", color: C.green },
  ];
  phases.forEach((p, i) => {
    const yy = 1.7 + i * 0.95;
    // 时间线圆点
    slide.addShape(pptx.ShapeType.ellipse, {
      x: 0.8, y: yy + 0.15, w: 0.3, h: 0.3,
      fill: { color: p.color },
    });
    // 连接线
    if (i < phases.length - 1) {
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.93, y: yy + 0.45, w: 0.04, h: 0.5,
        fill: { color: C.accent2 },
      });
    }
    slide.addText(p.phase, {
      x: 1.3, y: yy, w: 1.5, h: 0.3,
      fontSize: 12, fontFace: "Microsoft YaHei", color: p.color, bold: true,
    });
    slide.addText(p.title, {
      x: 2.8, y: yy, w: 3, h: 0.3,
      fontSize: 14, fontFace: "Microsoft YaHei", color: C.white, bold: true,
    });
    slide.addText(p.desc, {
      x: 2.8, y: yy + 0.3, w: 6, h: 0.3,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDim,
    });
  });
  addPageNum(slide, 12, TOTAL);
}

// ===== 第四部分：交互体验与创意亮点 =====

// 页13：沉浸式叙事设计
{
  const slide = pptx.addSlide();
  addBgRect(slide);
  addSectionHeader(slide, 4, "交互体验与创意亮点");
  slide.addText("沉浸式叙事设计", {
    x: 0.5, y: 1.1, w: 9, h: 0.5,
    fontSize: 20, fontFace: "Microsoft YaHei", color: C.gold, bold: true,
  });
  const items = [
    { icon: "🌫", title: "开屏动画", desc: "雾锁校园，神秘打字机效果呈现欢迎语，一秒入戏" },
    { icon: "🌙", title: "昼夜变化", desc: "根据用户活跃时段切换页面色调与音效，白天/夜晚不同体验" },
    { icon: "💬", title: "角色对话", desc: "打字机字体 + 故障艺术效果，增加悬疑感与紧迫感" },
    { icon: "✨", title: "线索收集反馈", desc: "用户点击触发粒子效果与音效反馈，强化收集成就感" },
    { icon: "🔀", title: "分支视觉区分", desc: "根据选择产生不同微动效与光影变化，暗示决策影响" },
  ];
  items.forEach((item, i) => {
    const yy = 1.7 + i * 0.9;
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.5, y: yy, w: 8.8, h: 0.75,
      fill: { color: C.bgLight }, rectRadius: 0.08,
    });
    slide.addText(item.icon, {
      x: 0.6, y: yy, w: 0.6, h: 0.75,
      fontSize: 22, align: "center", valign: "middle",
    });
    slide.addText(item.title, {
      x: 1.3, y: yy + 0.05, w: 2, h: 0.3,
      fontSize: 14, fontFace: "Microsoft YaHei", color: C.accent, bold: true,
    });
    slide.addText(item.desc, {
      x: 3.3, y: yy + 0.05, w: 5.8, h: 0.65,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.text, valign: "middle",
    });
  });
  addPageNum(slide, 13, TOTAL);
}

// 页14：社区互动与用户共创
{
  const slide = pptx.addSlide();
  addBgRect(slide);
  addSectionHeader(slide, 4, "交互体验与创意亮点");
  slide.addText("社区互动与用户共创", {
    x: 0.5, y: 1.1, w: 9, h: 0.5,
    fontSize: 20, fontFace: "Microsoft YaHei", color: C.gold, bold: true,
  });
  addBulletList(slide, [
    "推理论坛设有「热案榜」，用户投票决定下一个剧情走向",
    "用户可上传自制解密任务，通过审核后加入网站互动库",
    "剧情评分系统，优秀推理者可获得「侦探勋章」与虚拟道具",
    "每周推出「午夜谜题」限时挑战，前三名获实体奖励",
    "用户间可组队解谜，共享线索与进度，增强社交属性",
    "NPC扮演者制度 —— 用户可化身悬疑故事的「导演」",
  ], { y: 1.7 });
  // 右下角
  slide.addShape(pptx.ShapeType.rect, {
    x: 6.5, y: 5.0, w: 3, h: 1.2,
    fill: { color: C.accent2 }, rectRadius: 0.1,
  });
  slide.addText("UGC + PGC\n用户共创生态\n降低内容成本", {
    x: 6.5, y: 5.0, w: 3, h: 1.2,
    fontSize: 13, fontFace: "Microsoft YaHei", color: C.gold,
    align: "center", valign: "middle", bold: true, lineSpacingMultiple: 1.4,
  });
  addPageNum(slide, 14, TOTAL);
}

// 页15：氛围营造细节
{
  const slide = pptx.addSlide();
  addBgRect(slide);
  addSectionHeader(slide, 4, "交互体验与创意亮点");
  slide.addText("悬疑氛围营造细节", {
    x: 0.5, y: 1.1, w: 9, h: 0.5,
    fontSize: 20, fontFace: "Microsoft YaHei", color: C.gold, bold: true,
  });
  const details = [
    { cat: "配色方案", desc: "暗色系为主 + 雾气渐变，营造神秘压抑的校园氛围" },
    { cat: "字体选择", desc: "打字机字体用于对话，手写体用于线索，增强真实感" },
    { cat: "音效设计", desc: "关键节点触发悬疑音效，环境白噪音持续渲染沉浸感" },
    { cat: "转场动画", desc: "故障闪烁、画面撕裂、像素化过渡，强化时空错乱感" },
    { cat: "交互反馈", desc: "鼠标悬停暗示可交互，点击后粒子爆发 + 声效确认" },
    { cat: "响应式适配", desc: "不同屏幕尺寸下保持最佳视觉效果与交互体验" },
  ];
  details.forEach((d, i) => {
    const yy = 1.7 + i * 0.8;
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.5, y: yy, w: 1.8, h: 0.65,
      fill: { color: C.accent2 }, rectRadius: 0.06,
    });
    slide.addText(d.cat, {
      x: 0.5, y: yy, w: 1.8, h: 0.65,
      fontSize: 13, fontFace: "Microsoft YaHei", color: C.gold,
      align: "center", valign: "middle", bold: true,
    });
    slide.addText(d.desc, {
      x: 2.5, y: yy, w: 6.8, h: 0.65,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.text, valign: "middle",
    });
  });
  addPageNum(slide, 15, TOTAL);
}

// ===== 第五部分：实训成果与反思 =====

// 页16：项目完成情况
{
  const slide = pptx.addSlide();
  addBgRect(slide);
  addSectionHeader(slide, 5, "实训成果与反思总结");
  slide.addText("项目完成情况", {
    x: 0.5, y: 1.1, w: 9, h: 0.5,
    fontSize: 20, fontFace: "Microsoft YaHei", color: C.gold, bold: true,
  });
  // 成果数据卡片
  const stats = [
    { num: "3", label: "完整剧情分支", color: C.accent },
    { num: "2", label: "原创虚拟商品", color: C.accent2 },
    { num: "300+", label: "7天访问量", color: C.green },
    { num: "85%", label: "用户好评率", color: C.gold },
  ];
  stats.forEach((s, i) => {
    const xx = 0.5 + i * 2.3;
    slide.addShape(pptx.ShapeType.rect, {
      x: xx, y: 1.7, w: 2, h: 1.8,
      fill: { color: C.bgLight }, rectRadius: 0.1,
      shadow: { type: "outer", blur: 4, offset: 2, color: "000000", opacity: 0.3 },
    });
    slide.addText(s.num, {
      x: xx, y: 1.8, w: 2, h: 0.9,
      fontSize: 32, fontFace: "Arial", color: s.color,
      align: "center", valign: "middle", bold: true,
    });
    slide.addText(s.label, {
      x: xx, y: 2.7, w: 2, h: 0.5,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.text,
      align: "center", valign: "middle",
    });
  });
  // 详细完成内容
  addBulletList(slide, [
    "成功搭建Vue3项目原型，实现三个完整的剧情分支可玩流程",
    "上线两件虚拟原创商品，并完成解密兑换流程验证",
    "初步接入真实用户测试，获得7天内约300次访问数据",
    "论坛模块实现基础发帖、回复与评分功能",
    "用户反馈问卷显示85%的受访者认为界面设计有吸引力",
  ], { y: 3.8, fontSize: 12 });
  addPageNum(slide, 16, TOTAL);
}

// 页17：遇到的问题与解决方案
{
  const slide = pptx.addSlide();
  addBgRect(slide);
  addSectionHeader(slide, 5, "实训成果与反思总结");
  slide.addText("遇到的问题与解决方案", {
    x: 0.5, y: 1.1, w: 9, h: 0.5,
    fontSize: 20, fontFace: "Microsoft YaHei", color: C.gold, bold: true,
  });
  const problems = [
    { q: "剧情分支过多导致前端状态管理复杂", a: "重构为状态机模式，统一管理剧情节点" },
    { q: "解谜游戏耦合度过高影响页面加载", a: "改为按需加载模块，懒加载解谜组件" },
    { q: "线索关联逻辑出现死循环", a: "引入图论算法优化关联树结构" },
    { q: "用户交互反馈延迟", a: "引入WebSocket实时推送替代轮询" },
    { q: "用户尝试暴力破解谜题", a: "加入请求频率限制与验证码机制" },
  ];
  // 表头
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.4, y: 1.7, w: 9, h: 0.5,
    fill: { color: C.accent2 },
  });
  slide.addText("遇到的问题", {
    x: 0.5, y: 1.7, w: 4.3, h: 0.5,
    fontSize: 13, fontFace: "Microsoft YaHei", color: C.white, bold: true, valign: "middle",
  });
  slide.addText("解决方案", {
    x: 5, y: 1.7, w: 4.3, h: 0.5,
    fontSize: 13, fontFace: "Microsoft YaHei", color: C.white, bold: true, valign: "middle",
  });
  problems.forEach((p, i) => {
    const yy = 2.2 + i * 0.85;
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.4, y: yy, w: 9, h: 0.75,
      fill: { color: i % 2 === 0 ? C.bgLight : C.bg },
    });
    slide.addText(p.q, {
      x: 0.5, y: yy, w: 4.3, h: 0.75,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.orange, valign: "middle",
    });
    slide.addShape(pptx.ShapeType.rect, {
      x: 4.9, y: yy + 0.15, w: 0.03, h: 0.45,
      fill: { color: C.accent },
    });
    slide.addText(p.a, {
      x: 5.1, y: yy, w: 4.2, h: 0.75,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.green, valign: "middle",
    });
  });
  addPageNum(slide, 17, TOTAL);
}

// 页18：未来优化方向 + 对传统电商的启示
{
  const slide = pptx.addSlide();
  addBgRect(slide);
  addSectionHeader(slide, 5, "实训成果与反思总结");
  addTwoColumnBullets(slide, [
    "未来优化方向",
    "引入AI生成剧情，降低内容创作成本",
    "实现跨平台适配（移动端 + 小程序）",
    "接入第三方API（校园地图等）",
    "探索线下实体店铺联动（扫码进入案件）",
    "建立悬疑创作者社区，完善UGC生态",
  ], [
    "对传统电商的启示",
    "用户体验应从功能性转向情感性",
    "游戏化设计可有效提升停留与转化",
    "内容即商品，叙事即营销",
    "社群生态是留住用户的核心",
    "个性化 + 沉浸式 + 社交化 = Z世代新方向",
  ]);
  // 底部结语
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 5.5, w: 9, h: 0.03,
    fill: { color: C.accent },
  });
  slide.addText("感谢聆听 · 期待交流", {
    x: 0.5, y: 5.7, w: 9, h: 0.6,
    fontSize: 22, fontFace: "Microsoft YaHei", color: C.accent,
    align: "center", bold: true,
  });
  addPageNum(slide, 18, TOTAL);
}

// ===== 生成文件 =====
const outputPath = "d:/webproject/huihuan/校园悬疑交互式网站-实训报告.pptx";
await pptx.writeFile({ fileName: outputPath });
console.log(`✅ PPT 已生成: ${outputPath}`);
