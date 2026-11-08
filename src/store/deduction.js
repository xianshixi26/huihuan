import { defineStore } from 'pinia'

// 独立函数：根据理智值返回不同质量的串联结果（不依赖 store 上下文）
function getResultBySanity(result, reason) {
  if (!result) return null
  if (reason >= 60) {
    return { ...result, quality: 'clear', text: result.puzzle + '\n\n💡 提示：' + (result.hint || '暂无更多提示') }
  } else if (reason >= 30) {
    return { ...result, quality: 'partial', text: result.puzzle }
  } else {
    if (Math.random() < 0.5) {
      return { ...result, quality: 'blurred', text: '你感到头昏脑涨，线索之间的联系变得模糊不清...也许你需要恢复一下理智再尝试。' }
    }
    return { ...result, quality: 'partial', text: result.puzzle }
  }
}

// 推理链定义（5条：3真2假）
export const chainDefinitions = {
  'truth_loop': {
    name: '循环的真相', requiredConnections: [['clue_paper', 'clue_log'], ['graffiti', 'clue_screen']],
    conclusion: '你逐渐明白——循环不是诅咒，而是你自己创造的牢笼。每一次失败都让你忘得更深，但线索总在重复出现。',
    ending: '真结局 - 告别执念',
    puzzle: '墙壁上的数字和日志的日期，拼在一起构成了一个密码。倒过来看——那是你第一次来到这间教室的日期。',
  },
  'truth_lab': {
    name: '实验室的秘密', requiredConnections: [['notes', 'clue_screen'], ['clue_paper', 'notes']],
    conclusion: '学校进行过执念提取实验。你是第444号。循环是实验的副作用——而控制台的谐振频率是你唯一的出口。',
    ending: '真结局 - 接受自我',
    puzzle: '谐振频率藏在实验记录和主机数据的交集中。十位数是你失败的次数，个位数是你成功的次数。',
  },
  'truth_self': {
    name: '直面执念', requiredConnections: [['shadow_clue', 'notes'], ['npc_shen_clue', 'shadow_clue']],
    conclusion: '执念不是敌人。它是被你割舍的情感。只有与它和解——承认那是你的一部分——循环才会结束。',
    ending: '真结局 - 彻底遗忘',
    puzzle: '443和444。差1。你需要的密码，就是那个「1」代表的东西——也许是日期，也许是次数，也许是一个字。',
  },
  'fake_ritual': {
    name: '仪式陷阱', requiredConnections: [['graffiti', 'clue_paper'], ['notes', 'graffiti']],
    isMisleading: true,
    conclusion: '你误以为墙壁上的数字是某种仪式的密码——但这条路只会让你陷入更深的偏执。真相不在超自然中。',
    puzzle: '超自然不是答案——但数字本身确实有意义。只是不在墙上。',
  },
  'fake_blame': {
    name: '错怪周野', requiredConnections: [['npc_zhou_clue', 'clue_log'], ['npc_zhou_clue', 'npc_shen_clue']],
    isMisleading: true,
    conclusion: '你认定周野是幕后黑手——但他是另一个受害者。错误指控让你孤立无援，无法获得关键帮助。',
    puzzle: '信任是循环中最稀缺的资源。你选择了怀疑，但代价是失去一个盟友。',
  },
}

export const useDeductionStore = defineStore('deduction', {
  state: () => ({
    activeBrainstormClue: null,
    selectedTargetId: null,
    discoveredConnections: [],
    completedChains: [],
    lastConnectionResult: null,
    puzzleProgress: {},
  }),

  getters: {
    clueMetaMap: () => ({
      // ==================== 第一章线索 ====================
      'clue_paper': {
        id: 'clue_paper', name: '沈知夏的草稿纸', chapter: 1,
        rawDesc: '一张揉皱的草稿纸，潦草地画着几个数字和箭头，箭头指向一个被反复涂红叉的「0」。角落有模糊的日期印记。',
        interpretedDesc: '箭头不只是在计算——它们在指向某个特定的位置。日期印记虽然模糊，但年份的最后一位是「3」。',
        sourceType: 'item', sourceName: '教室课桌',
        connections: [
          { targetId: 'clue_log', chain: 'truth_loop', isCorrect: true,
            puzzle: '草稿纸上的箭头一共画了8个，日志撕去的日期是23号。拼起来看——8和23，也许不是随机的。',
            hint: '两个线索的数字拼在一起，可能是一扇门的密码。', hintForPassword: 1 },
          { targetId: 'notes', chain: 'truth_lab', isCorrect: true,
            puzzle: '草稿纸提到「理智归零」，实验记录提到「分裂」。归零与分裂——是否在暗示某种临界值？',
            hint: '临界值的一半，就是你要找的答案。', hintForPassword: 2 },
          { targetId: 'graffiti', chain: 'fake_ritual', isCorrect: false,
            puzzle: '血字和草稿纸都出现了同一个数字——但这可能只是一个巧合，而非线索。',
            hint: '这个联系很薄弱，也许根本不是正确的方向。' },
        ]
      },
      'clue_log': {
        id: 'clue_log', name: '值日生日志', chapter: 1,
        rawDesc: '一本普通的班级日志，最后一页被人撕去了一半，残页边缘有烧焦的痕迹。剩余残片上只有日期「23号」和半个签名。',
        interpretedDesc: '撕去的日期正好是一年前。签名的最后一笔拖得很长，像是被人匆忙划掉的。那个签名——看起来像是「林」字的起笔。',
        sourceType: 'item', sourceName: '教室讲台',
        connections: [
          { targetId: 'clue_paper', chain: 'truth_loop', isCorrect: true,
            puzzle: '草稿纸有8个箭头，日志的日期是23号。8-2-3...这组数字是否隐藏着什么顺序？',
            hint: '倒过来念试试——3、2、8，还是别的什么？', hintForPassword: 1 },
          { targetId: 'npc_zhou_clue', chain: 'fake_blame', isCorrect: false,
            puzzle: '日志的签名像是「林」字，周野说那天他也在——难道他才是撕掉日志的人？',
            hint: '小心，怀疑会让你迷失方向。' },
          { targetId: 'shadow_clue', chain: 'truth_self', isCorrect: true,
            puzzle: '日志的「林」字签名和黑化人格自称林迟——也许不是在指正主，而是在指一个被遗忘的自我。',
            hint: '执念也是林迟的一部分，就像影子离不开光。' },
        ]
      },
      'graffiti': {
        id: 'graffiti', name: '血字墙痕', chapter: 1,
        rawDesc: '走廊墙壁上暗红色的痕迹，从某个特定角度看隐约能辨认出几个数字的轮廓。痕迹摸上去有些黏腻。',
        interpretedDesc: '倒过来看——四个数字清晰可见。但数字周围还有更小的划痕，像是被指甲刮出来的。一共七道。',
        sourceType: 'environment', sourceName: '教学楼旧走廊',
        connections: [
          { targetId: 'notes', chain: 'truth_lab', isCorrect: true,
            puzzle: '墙上数字和实验记录编号的前缀一致。七个指甲划痕——七次实验？七个受试者？',
            hint: '数字是锁，划痕是钥匙。加起来也许就是一个完整的密码。', hintForPassword: 1 },
          { targetId: 'clue_screen', chain: 'truth_lab', isCorrect: true,
            puzzle: '墙上数字倒过来看，和主机屏幕上闪烁的循环次数——前两位是一致的。',
            hint: '循环的次数和墙上的数字，取交集的那一位。' },
          { targetId: 'npc_zhou_clue', chain: 'fake_ritual', isCorrect: false,
            puzzle: '周野说他也看到过这些数字——但他坚持认为是某种献祭仪式的符咒。别被他带偏了。',
            hint: '这不是超自然，这是人为的实验记录。' },
        ]
      },
      'npc_zhou_clue': {
        id: 'npc_zhou_clue', name: '周野的恍惚之言', chapter: 1,
        rawDesc: '周野不经意地看了看走廊尽头，低声说了一句：「我好像来过这里，但又不记得是什么时候了...」他手里捏着一张撕破的纸片。',
        interpretedDesc: '周野也困在循环中，但他失去了一部分记忆。他手里的纸片上有半行字：「第4组实验——」。周野曾是实验助手。',
        sourceType: 'npc', sourceName: '周野',
        connections: [
          { targetId: 'npc_shen_clue', chain: 'truth_self', isCorrect: true,
            puzzle: '周野和沈知夏都提到了「记忆缺失」——他们都接触过实验。但一个在掩饰，一个在揭示。',
            hint: '两个证人的证词矛盾之处，就是真相藏匿之处。' },
          { targetId: 'clue_log', chain: 'fake_blame', isCorrect: false,
            puzzle: '周野手里的纸片和日志的残页能对上——这证明了他在现场。但这不是他撕的，是他在试图还原。',
            hint: '看似确凿的证据，有时指向的是另一个方向。' },
          { targetId: 'notes', chain: 'truth_loop', isCorrect: true,
            puzzle: '周野的纸片上写着「第4组」，实验记录的第4组正是关于「记忆删除」的。周野的记忆不是丢失——是被删除了。',
            hint: '第4组实验的关键数字，也许就是你们的共同密码。', hintForPassword: 1 },
        ]
      },

      // ==================== 第二章线索 ====================
      'notes': {
        id: 'notes', name: 'L04实验记录本', chapter: 2,
        rawDesc: '一本布满灰尘的实验记录，封面写着「记忆提取实验·绝密」。大部分被涂盖，只剩零散词语：「第4组」、「分裂」、「444次」。',
        interpretedDesc: '学校进行过执念提取实验。被涂盖的段落提到了副作用：人格分裂、记忆错乱、循环感知。第444号受试者的姓名被完全烧焦——但编号旁有一个手写的「林」。',
        sourceType: 'item', sourceName: '地下实验室',
        connections: [
          { targetId: 'clue_screen', chain: 'truth_lab', isCorrect: true,
            puzzle: '记录的444号和主机显示的444次循环——不是巧合。你被困了444次，每一次都以失败告终。你还有最后一次机会。',
            hint: '找出控制台的谐振点，那是实验留下的后门。频率值的十位数和个位数之和，就是关键。', hintForPassword: 2 },
          { targetId: 'clue_paper', chain: 'truth_loop', isCorrect: true,
            puzzle: '记录的「分裂」和草稿纸的「归零」——两者都在描述同一种状态：意识崩溃的临界点。',
            hint: '临界值的数值，就藏在两个线索的交集中。' },
          { targetId: 'npc_teacher_clue', chain: 'truth_lab', isCorrect: true,
            puzzle: '化学老师的实验记录和这本绝密记录有相同的笔迹——那个老师，就是当年实验的执行者之一。',
            hint: '老师经常提到的那个化学常数，也许是密码的一部分。' },
        ]
      },
      'clue_screen': {
        id: 'clue_screen', name: '加密的主机屏幕', chapter: 2,
        rawDesc: '一台老旧CRT显示器泛着绿光。一行行数据跳动，其中一组数字反复闪烁。屏幕角落有一个输入提示符在等待指令。',
        interpretedDesc: '「回环实验已运行444次，受试者：林迟。」闪烁的数字是442——比444少了2。那缺失的2次，是你成功逃脱过的2次，但你不记得了。',
        sourceType: 'item', sourceName: '监控室终端',
        connections: [
          { targetId: 'notes', chain: 'truth_lab', isCorrect: true,
            puzzle: '444减去442——那2次成功的循环里发生了什么？答案是「谐振」。你两次成功都是因为找到了正确的频率。',
            hint: '频率的数值不是随机的——它是实验记录中反复出现的某个数字。', hintForPassword: 2 },
          { targetId: 'graffiti', chain: 'truth_loop', isCorrect: true,
            puzzle: '主机闪烁的数字和墙上血字——都缺少了某一位。缺失的那一位，就是控制台的正确频率。',
            hint: '把两个数字拼在一起，找它们的共同缺位。' },
        ]
      },
      'npc_shen_clue': {
        id: 'npc_shen_clue', name: '沈知夏的暗示', chapter: 2,
        rawDesc: '沈知夏看着实验记录说：有些东西看不到不代表不存在。你需要用另一种方式去「看」。她的手指在「444」上轻轻点了一下。',
        interpretedDesc: '沈知夏知道循环的运作方式——理智值会影响你看到的线索。她点「444」，是在暗示你：注意这个数字的变化。',
        sourceType: 'npc', sourceName: '沈知夏',
        connections: [
          { targetId: 'notes', chain: 'truth_lab', isCorrect: true,
            puzzle: '沈知夏点出的444，实验记录的444，主机显示的444——三个444。但444的一半是222，再一半是111。把这些数字加起来...',
            hint: '4+4+4=12。12是什么？是时钟的刻度，也是生肖的轮回。', hintForPassword: 3 },
          { targetId: 'shadow_clue', chain: 'truth_self', isCorrect: true,
            puzzle: '沈知夏在帮你对抗执念人格——她不是旁观者，她是当年实验的另一个受试者。她是第443号。',
            hint: '两个受试者，443和444。差1。这1个差距，决定了谁留在循环里。' },
        ]
      },
      // ===== Ch1 新增 =====
      'clue_chem': { id: 'clue_chem', name: '化学笔记残页', chapter: 1, sourceType: 'item', sourceName: '办公桌',
        rawDesc: '一本摊开的化学笔记，方程式结果被涂黑，边缘反复写着6.02。', interpretedDesc: '阿伏伽德罗常数——但在这个语境下，它暗示着"无穷"。',
        connections: [
          { targetId: 'npc_teacher_clue', chain: 'truth_lab', isCorrect: true, puzzle: '化学笔记和老师笔记本上的笔迹一模一样。6.02这个数字反复出现——不是巧合，是一个关键的常数。', hint: '6+0+2=8，这个数字也许有用。', hintForPassword: 1 },
          { targetId: 'clue_paper', chain: 'truth_loop', isCorrect: true, puzzle: '草稿纸上的箭头指向0，化学笔记写着6.02×10²³——从0到无穷。循环的起点和终点。', hint: '循环的次数，也许和笔记里的某个数字有关。' },
        ]
      },
      'clue_bucket': { id: 'clue_bucket', name: '反复清洗的地砖', chapter: 1, sourceType: 'environment', sourceName: '教学楼走廊',
        rawDesc: '一块被擦得锃亮的地砖，砖缝里卡着浸湿的纸片。', interpretedDesc: '刘姨每天都在擦同一块地砖——不是污渍，是在覆盖痕迹。纸片上模糊的字可能是一个关键密码。',
        connections: [
          { targetId: 'clue_aunt', chain: 'truth_loop', isCorrect: true, puzzle: '刘姨擦的地砖和她的抱怨吻合——七道划痕，和墙上血字周围的划痕数量相同。七个受试者？七个密码？', hint: '七是一个关键数字。记住它。' },
          { targetId: 'graffiti', chain: 'truth_lab', isCorrect: true, puzzle: '地砖上的七道划痕——墙上血字周围也是七道。这不是随机破坏，是某种计数。', hint: '七道划痕 = 七次失败的逃脱。数字就在墙上。' },
        ]
      },
      'clue_schedule': { id: 'clue_schedule', name: '褪色的值日表', chapter: 1, sourceType: 'environment', sourceName: '走廊公告栏',
        rawDesc: '褪色的值日表上只有周五值日生清晰可辨——林迟。', interpretedDesc: '林迟是周五值日生。周五——一个星期的终点。也是循环的起点？',
        connections: [
          { targetId: 'clue_log', chain: 'truth_loop', isCorrect: true, puzzle: '值日表和日志都提到了日期。日志是23号，周五大扫除——23号是星期几？把日期和星期对应起来。', hint: '星期和日期的对应关系，也许就是密码的数字。' },
          { targetId: 'clue_bucket', chain: 'fake_ritual', isCorrect: false, puzzle: '周五是林迟值日，地砖被反复擦洗——也许林迟在值日那天做错了什么，需要掩盖？', hint: '但这种解读可能太过简单了...' },
        ]
      },
      // Ch1 交互物件线索
      'clue_notebook': { id: 'clue_notebook', name: '无名笔记本', chapter: 1, sourceType: 'item', sourceName: '教室书柜',
        rawDesc: '一本没有署名的笔记，最后一页用红笔写着一个算式：8×2÷4+1=?', interpretedDesc: '算式的结果：8×2=16, 16÷4=4, 4+1=5。答案是5。',
        connections: [
          { targetId: 'clue_firenote', chain: 'truth_loop', isCorrect: true, puzzle: '笔记本的算式结果是5，消防柜纸条说四位数和为15。剩下的三个数字之和是10——需要从其他线索中找出这三个数字。', hint: '5是第一个数字。剩下三位之和为10。', hintForPassword: 1 },
          { targetId: 'clue_paper', chain: 'truth_loop', isCorrect: true, puzzle: '笔记本算出的是5，草稿纸指向「0」。5和0——也许密码的首位和末位？', hint: '首位5，末位0。中间两位数之和为10。' },
        ]
      },
      'clue_namelist': { id: 'clue_namelist', name: '泛黄的班级名单', chapter: 1, sourceType: 'item', sourceName: '讲台抽屉',
        rawDesc: '一份泛黄的班级名单，43个名字，第23号位置被涂黑。', interpretedDesc: '43-23=20。第20号就是被隐藏的名字——林迟在班级里的学号。',
        connections: [
          { targetId: 'clue_log', chain: 'truth_loop', isCorrect: true, puzzle: '名单第23号被涂黑，日志的日期也是23号。23不是巧合——它是关键数字。43-23=20，第20号是林迟。', hint: '23和20。密码可能由这两个数字组成。' },
          { targetId: 'clue_schedule', chain: 'truth_loop', isCorrect: true, puzzle: '值日表上周五是林迟值日。名单上第20号是林迟。周五是第5天——5和20，一组对应关系。', hint: '5和20，取其中的一位作为密码。' },
        ]
      },
      'clue_firenote': { id: 'clue_firenote', name: '消防柜里的纸条', chapter: 1, sourceType: 'item', sourceName: '走廊消防柜',
        rawDesc: '一张皱巴巴的纸条写着：密码的每一位都是数字，四位之和为15。', interpretedDesc: '四位密码，和为15。这是一个约束条件——结合其他线索中的数字，可以反推出密码。',
        connections: [
          { targetId: 'clue_notebook', chain: 'truth_loop', isCorrect: true, puzzle: '笔记本得出5，纸条说和为15。已知5，剩下三个数字和为10。需要从其他线索找剩下的数字。', hint: '已知一个5，还差和为10的三个数字。' },
          { targetId: 'graffiti', chain: 'truth_loop', isCorrect: true, puzzle: '墙上血字的数字加上和为15的约束——可能的组合只有几个。试着把墙上数字的每一位加起来，看是否等于15。', hint: '如果墙上数字的和等于15，那就是密码。' },
        ]
      },
      'clue_notice': { id: 'clue_notice', name: '撕破的公告', chapter: 1, sourceType: 'item', sourceName: '走廊公告栏',
        rawDesc: '半张公告残留的文字：实验中、记忆、删除。年份栏只剩下最后一位：3。', interpretedDesc: '公告是关于记忆删除实验的通知。年份末尾是3——所有线索中的年份末尾都是3。3不是年份，是密码的其中一位。',
        connections: [
          { targetId: 'clue_paper', chain: 'truth_loop', isCorrect: true, puzzle: '公告的年份末尾是3，草稿纸的年份末尾也是3。所有线索都指向3——3是密码中确定的一位。', hint: '3是四个数字之一。' },
          { targetId: 'clue_chem', chain: 'truth_lab', isCorrect: true, puzzle: '公告提到记忆删除，化学笔记记录了同样的实验内容。两条线索互相印证——记忆删除实验是真实存在的。', hint: '密码可能和实验编号有关。' },
        ]
      },

      'clue_aunt': { id: 'clue_aunt', name: '刘姨的抱怨', chapter: 1, sourceType: 'npc', sourceName: '保洁员刘姨',
        rawDesc: '刘姨每天都在擦同一块地。她说："就跟昨天一模一样。"', interpretedDesc: '刘姨是最早发现循环的人——但她无法表达，只能用"重复"来形容。她的行为本身就是循环的证据。',
        connections: [
          { targetId: 'clue_bucket', chain: 'truth_loop', isCorrect: true, puzzle: '刘姨的话证实了你的猜测——循环是真实的。她说"跟昨天一样"，每天都是同一天。循环一次是一天，你被困了多少天？', hint: '记得主机屏幕上闪烁的次数吗？那个数字，就是你的答案。' },
        ]
      },

      'npc_teacher_clue': { id: 'npc_teacher_clue', name: '陈老师的化学笔记', chapter: 2,
        rawDesc: '办公桌上摊开一本化学笔记，翻到最后一页，上面写着一串化学方程式——但方程式的结果被涂成了黑块。',
        interpretedDesc: '笔记的边角写着一个反复出现的常数：6.02×10²³。这是阿伏伽德罗常数——但在这个上下文中，它暗示着「无穷」。无穷的循环，无穷的分裂。',
        sourceType: 'item', sourceName: '教师办公室',
        connections: [
          { targetId: 'notes', chain: 'truth_lab', isCorrect: true,
            puzzle: '化学老师的常数6.02，和实验记录的444——6+0+2=8，4+4+4=12。8和12之间差了4。',
            hint: '差值是4。记住这个数字，它会在你最需要的时候出现。', hintForPassword: 2 },
        ]
      },

      // ===== Ch2 新增 =====
      // Ch2 交互物件线索
      'clue_locker': { id: 'clue_locker', name: '铁柜里的实验残页', chapter: 2, sourceType: 'item', sourceName: '实验室铁柜',
        rawDesc: '残页上只有一个完整的方程式和一行注释：频率=两次成功之和÷失败的次数。', interpretedDesc: '2次成功÷442次失败=？不对。两次成功之和=4，失败的次数=442。4÷442太微小了。换个思路——成功的次数是2，失败的次数是3（因为444=4+4+4=12，1+2=3）。',
        connections: [
          { targetId: 'clue_sink', chain: 'truth_lab', isCorrect: true, puzzle: '残页的公式和卡片的计算——残页说频率=和÷次数，卡片算出111÷3=37。37可能就是控制台的谐振点。', hint: '37是一个质数。试试把它作为目标频率。', hintForPassword: 2 },
          { targetId: 'notes', chain: 'truth_lab', isCorrect: true, puzzle: '实验记录和残页公式互补——记录提供了数字，残页提供了公式。把两者结合起来就能算出正确的谐振频率。', hint: '谐振频率藏在444和222的运算结果中。' },
        ]
      },
      'clue_sink': { id: 'clue_sink', name: '水槽里的卡片', chapter: 2, sourceType: 'item', sourceName: '实验室水槽',
        rawDesc: '一张塑封卡片上印着计算过程：444÷2=222, 222÷2=111, 111÷3=37。37被圈了出来。', interpretedDesc: '37是阿伏伽德罗常数6.02+10²³的另一个解读：6+0+2=8，但卡片给出了37。37是质数——它不代表任何化学常数，它是控制台的目标频率。',
        connections: [
          { targetId: 'clue_locker', chain: 'truth_lab', isCorrect: true, puzzle: '卡片的37就是残页公式的答案。两次成功÷失败次数——但37比任何除法结果都大。所以公式的真正含义是——把两个数字拼起来，不是除。', hint: '3和7。37就是你要的谐振频率。', hintForPassword: 2 },
          { targetId: 'clue_screen', chain: 'truth_lab', isCorrect: true, puzzle: '主机显示的444次和卡片上的444——444÷2=222, 222÷2=111。444→222→111，每次除以2。但111÷3=37打破了½的规律。37是异常值——异常值就是密码。', hint: '控制台的频率就是37。' },
        ]
      },

      'clue_specimen': { id: 'clue_specimen', name: '碎裂的标本瓶', chapter: 2, sourceType: 'item', sourceName: '标本陈列走廊',
        rawDesc: '标本瓶标签写着「444号·林迟」。瓶内空无一物，瓶底有一张折起来的纸条。', interpretedDesc: '444号——是受试者编号。空瓶意味着样本已被取出，或者从未存在过。纸条上写着什么？',
        connections: [
          { targetId: 'notes', chain: 'truth_lab', isCorrect: true, puzzle: '标本瓶的444号与实验记录不谋而合。你是第444号——你的执念被提取了，装在了这个瓶子里。现在它是空的——执念回到了你身上。', hint: '444——4+4+4=12。12个月。一年。一切开始的那天。' },
          { targetId: 'clue_screen', chain: 'truth_loop', isCorrect: true, puzzle: '444号样本——444次循环。每一次循环产生一个样本，但只有一个存活。你就是那个存活的样本。', hint: '空瓶的含义是：你的执念已经不在实验室里了。它在你体内。' },
        ]
      },
      'clue_xuheng': { id: 'clue_xuheng', name: '许衡的证词', chapter: 2, sourceType: 'npc', sourceName: '班长许衡',
        rawDesc: '许衡说一年前他在实验室看到了不该看的东西，记忆被删除了。', interpretedDesc: '许衡是知情者。他撕了日志是为了保留证据。他说的"他们"就是实验的执行者——陈老师是其中之一。',
        connections: [
          { targetId: 'npc_teacher_clue', chain: 'truth_lab', isCorrect: true, puzzle: '许衡说"他们"删了他的记忆。陈老师的实验记录里有"第4组：记忆删除"——对上了。', hint: '陈老师就是实验执行者之一。他的笔记里有密码的线索。' },
          { targetId: 'notes', chain: 'truth_lab', isCorrect: true, puzzle: '许衡的记忆碎片和实验记录的副作用描述完全吻合："记忆错乱、循环感知"。他也在循环中，只是他不记得了。', hint: '许衡的证词证实了实验记录的真实性。' },
        ]
      },

      // ==================== 第三章线索 ====================
      // Ch3 交互物件线索
      'clue_stone': { id: 'clue_stone', name: '石碑里的纸条', chapter: 3, sourceType: 'item', sourceName: '林间石碑',
        rawDesc: '纸条上写着：蛇排第六，但真正的答案不是6。从蛇开始往后退一位——第5个。', interpretedDesc: '十二生肖中蛇排第6，往后退一位是龙排第5。答案不是6，是5。或者不是5，是「龙」。',
        connections: [
          { targetId: 'clue_tree', chain: 'truth_self', isCorrect: true, puzzle: '树上的蛇被圈出来是第6个，石碑说退一位是第5个。第5个生肖是龙——龙在密码中可能代表一个字或一个数字。', hint: '龙=5。或者龙本身就是一个字——取决于密码的类型。', hintForPassword: 3 },
          { targetId: 'clue_well', chain: 'truth_self', isCorrect: true, puzzle: '石碑的蛇退一位是龙，枯井的刻字有多个「林」字。林+龙——两个字的关联？还是各自独立？', hint: '林是第8画，龙是第5画。8+5=13。密码可能是一位的数字。' },
        ]
      },
      'clue_well': { id: 'clue_well', name: '枯井木板上的刻字', chapter: 3, sourceType: 'environment', sourceName: '小树林枯井',
        rawDesc: '木板上刻着：他姓林，我也姓林，我们都死在了这里。署名是一个用指甲抓出来的扭曲的林字。', interpretedDesc: '不止一个林迟。或者——林迟不是一个人，是一个代号。443号、444号——都是林迟。',
        connections: [
          { targetId: 'clue_stone', chain: 'truth_self', isCorrect: true, puzzle: '枯井的刻字暗示多个「林」存在——实验的每个受试者都叫林迟。石碑指向龙——龙是传说中的神兽，它的一条命就是一次循环。', hint: '循环的次数和龙的神话有关——龙有九子，循环有九层吗？' },
          { targetId: 'clue_badge', chain: 'truth_self', isCorrect: true, puzzle: '校徽上也是林迟的名字——但刻字说「我们都死在了这里」。你是第几个林迟？444÷12=37——每个生肖周期37次循环。', hint: '37再次出现。密码可能和37有关。', hintForPassword: 3 },
        ]
      },

      'leaves': { id: 'leaves', name: '神秘的旧照片', chapter: 3, sourceType: 'item', sourceName: '小树林',
        rawDesc: '老校区背景的合照，背面写着一行被水浸模糊的字。隐约能看到「无法打破，除非...」。', interpretedDesc: '照片是一年前的。上面的人你认识——周野、沈知夏、许衡，还有你自己。你们曾经是一起做实验的同学。',
        connections: [
          { targetId: 'clue_badge', chain: 'truth_self', isCorrect: true, puzzle: '照片和校徽——照片上有你和其他人，校徽上只有你的名字。那晚发生了什么，让你的同伴们从照片中"消失"了？', hint: '照片背面的话后半句——答案就在校门的密码上。', hintForPassword: 3 },
          { targetId: 'clue_he_hint', chain: 'truth_self', isCorrect: true, puzzle: '老何的烟纸写着"你已经死在444次循环里了"。旧照片证明你曾经是活着的——某个时刻之前。', hint: '找出照片拍摄的日期，那就是一切改变的起点。' },
        ]
      },
      'clue_badge': { id: 'clue_badge', name: '带血的校徽', chapter: 3, sourceType: 'item', sourceName: '门卫小屋',
        rawDesc: '校徽背面刻着林迟的名字，但校徽生锈了几十年，边缘沾着暗红色污渍。', interpretedDesc: '血是林迟的——但不是现在的林迟，是一年前的林迟。那次实验中流下的血。',
        connections: [
          { targetId: 'leaves', chain: 'truth_self', isCorrect: true, puzzle: '校徽上的血和照片上的微笑——同一个人，不同的命运。一年前那个实验失败的夜晚，一切都分裂了。', hint: '分裂成了444个碎片。只有拼凑完整，才能找到那个字。', hintForPassword: 3 },
          { targetId: 'clue_he_hint', chain: 'truth_self', isCorrect: true, puzzle: '老何的烟纸和带血的校徽都指向一个事实：你确实"死"过。但不是物理上的死亡——是人格的分裂。', hint: '放下执念，才能推开校门。那个字就是答案。' },
        ]
      },
      'clue_he_hint': { id: 'clue_he_hint', name: '老何的皱烟纸', chapter: 3, sourceType: 'npc', sourceName: '保安老何',
        rawDesc: '烟卷里裹着一张字条：「林迟，你已经死在444次循环里了...只有放下执念，才能推开真实的门。」', interpretedDesc: '老何知道真相。他可能不是保安——他是上一批实验的幸存者，负责看守循环的出口。',
        connections: [
          { targetId: 'clue_badge', chain: 'truth_self', isCorrect: true, puzzle: '烟纸和校徽——老何说你"死"了444次，校徽上的血印证了这一点。但"死"不是结束——是循环中的人格分裂。', hint: '444次。第445次就是这一次。你还有机会。' },
          { targetId: 'leaves', chain: 'truth_self', isCorrect: true, puzzle: '照片里的人就是"活着"的你。老何说你死了——但照片证明你真实存在过。矛盾指向真相：你在实验中分裂了。', hint: '接受分裂——那个字就在你的执念中。' },
          { targetId: 'clue_tree', chain: 'truth_self', isCorrect: true, puzzle: '老何说的"放下执念"和树上的生肖图案——十二个生肖，一个空格。那个空格代表的就是"放下"。', hint: '空格的生肖是什么？那就是你的答案。', hintForPassword: 3 },
        ]
      },
      'clue_tree': { id: 'clue_tree', name: '树皮上的刻痕', chapter: 3, sourceType: 'environment', sourceName: '小树林老树',
        rawDesc: '一棵老树的树皮上刻着十二个动物图案，「蛇」被画了一个圈。', interpretedDesc: '十二生肖中蛇排第六。但在循环的语境中——蛇象征着循环（蛇咬尾）。被圈起来意味着它是关键。',
        connections: [
          { targetId: 'clue_he_hint', chain: 'truth_self', isCorrect: true, puzzle: '树上的蛇被圈出来——蛇在十二生肖排第六。6是完成一次循环所需的天数吗？还是密码的数字？', hint: '老何的烟纸密码和蛇的序号——两者之间只差一个数字。', hintForPassword: 3 },
          { targetId: 'leaves', chain: 'fake_ritual', isCorrect: false, puzzle: '蛇和照片——也许这是一种献祭仪式，把照片里的人"献祭"给循环？', hint: '这种解释似乎走向了错误的方向...' },
        ]
      },

      // ==================== 第四章线索 ====================
      'clue_truth': { id: 'clue_truth', name: '因果核心气泡', chapter: 4, sourceType: 'environment', sourceName: '虚无终焉轴心',
        rawDesc: '一个悬浮在空中的气泡，里面闪烁着无数记忆碎片。黑化人格正通过它修改循环的规则。', interpretedDesc: '这是循环的核心——执念人格就是通过它来篡改文本和误导你的。破坏它需要你同时具备理智和勇气。',
        connections: [
          { targetId: 'shadow_clue', chain: 'truth_self', isCorrect: true, puzzle: '气泡是执念修改循环的通道。黑化人格通过它把误导信息散布到各个场景——你看到的矛盾规则、错误提示，都来自这里。', hint: '识别哪些信息来自气泡，哪些来自现实。这是最终推理的关键。' },
          { targetId: 'notes', chain: 'truth_lab', isCorrect: true, puzzle: '气泡就是实验记录中提到的"执念提取"装置。444号样本被提取后，执念留在了这个气泡里——不断修改循环来折磨你。', hint: '气泡连接着所有线索。你每一次串联线索，都在削弱它的力量。' },
        ]
      },
      'shadow_clue': {
        id: 'shadow_clue', name: '黑化人格的低语', chapter: 4,
        rawDesc: '那个和你一模一样的身影在废弃教室中出现：「林迟，我就是你。你忘了一年前的事吗？那天晚上，你也在这间教室里——」',
        interpretedDesc: '一年前的那个深夜，你因愧疚和恐惧分裂出了执念人格。循环不是惩罚，是你自己创造的牢笼——用来逃避那段记忆。',
        sourceType: 'npc', sourceName: '执念·林迟',
        connections: [
          { targetId: 'notes', chain: 'truth_self', isCorrect: true,
            puzzle: '实验记录的第444号就是你。执念是因实验而分裂的人格碎片——他说的「那天晚上」就是实验失败的那个晚上。',
            hint: '实验的日期——如果你能回忆起来——就是最后的密码。', hintForPassword: 3 },
          { targetId: 'npc_shen_clue', chain: 'truth_self', isCorrect: true,
            puzzle: '执念自称是你，沈知夏说443和444差1。差的那个1——是你选择放弃的那部分记忆。',
            hint: '找回那1段记忆，你就能真正离开。' },
        ]
      },
    }),
  },

  actions: {
    startBrainstorm(clueId) {
      if (!this.clueMetaMap[clueId]) return false
      this.activeBrainstormClue = clueId
      this.selectedTargetId = null
      this.lastConnectionResult = null
      return true
    },

    getAvailableConnections(clueId, playerBag) {
      const meta = this.clueMetaMap[clueId]
      if (!meta || !meta.connections) return []
      return meta.connections
        .map(conn => {
          const targetMeta = this.clueMetaMap[conn.targetId]
          const isFound = playerBag.some(i => i.id === conn.targetId)
          return { ...conn, isFound, name: targetMeta ? targetMeta.name : conn.targetId, rawDesc: targetMeta ? targetMeta.rawDesc : '', chapter: targetMeta ? targetMeta.chapter : 0 }
        })
        .filter(conn => conn.isFound) // 只显示已获取的线索
    },

    // 生成无预定义连接时的通用但有意义的结论
    generateFallbackResult(fromMeta, toMeta, fromId, toId, reason) {
      const sameChapter = fromMeta.chapter === toMeta.chapter
      const types = ['item', 'npc', 'environment']
      const roll = Math.random()

      if (!sameChapter) {
        // 跨章节串联
        const crossHints = [
          `这两条线索来自不同的场景——但也许这正是关键。线索「${fromMeta.name}」和「${toMeta.name}」虽然地点不同，但都指向了同一个方向：有人在试图掩盖什么。试着回到${toMeta.chapter === 1 ? '教室' : toMeta.chapter === 2 ? '实验室' : '小树林'}再找找看。`,
          `跨越章节的线索往往藏着最深的秘密。「${fromMeta.name}」出现的地方和「${toMeta.name}」出现的地方——如果你把这两个地点连成一条线，线的中点指向哪里？那就是你要去的地方。`,
          `${fromMeta.name}和${toMeta.name}看似毫无关联，但如果考虑到循环的本质——时间在这里是折叠的。一年前发生的事，和今晚发生的事，会重叠在同一个空间。`,
        ]
        return { success: true, text: crossHints[Math.floor(Math.random() * crossHints.length)], isCorrect: true }
      }

      // 同章节：根据来源类型生成
      if (fromMeta.sourceType === 'npc' || toMeta.sourceType === 'npc') {
        const npcHints = [
          `有人告诉过你关于「${toMeta.name}」的事——仔细回忆一下对话中提到的细节。也许那个NPC的话里藏着数字或日期。`,
          `对话中往往藏着一半的真相。「${fromMeta.name}」和「${toMeta.name}」拼在一起，构成了一段完整的信息。试着把两段描述中的关键数字提取出来。`,
          `这个人的话不能全信。${fromMeta.sourceType === 'npc' ? fromMeta.sourceName : toMeta.sourceName}也许在隐瞒什么——将两段线索对照来看，矛盾之处就是突破口。`,
        ]
        return { success: roll > 0.3, text: npcHints[Math.floor(Math.random() * npcHints.length)], isCorrect: roll > 0.3 }
      }

      if (fromMeta.sourceType === 'environment' || toMeta.sourceType === 'environment') {
        const envHints = [
          `环境中的痕迹是不会说谎的。${fromMeta.sourceType === 'environment' ? fromMeta.sourceName : toMeta.sourceName}的「${fromMeta.sourceType === 'environment' ? fromMeta.name : toMeta.name}」——仔细观察它周围的细节，你可能漏掉了什么东西。`,
          `墙壁、地板、空气中——循环会在环境中留下痕迹。你看到的这些环境线索，每一条都是实验留下的伤疤。数字、划痕、甚至气味的浓度，都可能是线索。`,
          `环境中隐藏的信息往往最容易被忽略。试着回想一下你在${fromMeta.sourceType === 'environment' ? fromMeta.sourceName : toMeta.sourceName}还看到了什么——除了明显的线索，有什么不自然的地方？`,
        ]
        return { success: true, text: envHints[Math.floor(Math.random() * envHints.length)], isCorrect: true }
      }

      // 同章节物品类线索
      const itemHints = [
        `「${fromMeta.name}」和「${toMeta.name}」都是你亲手找到的物品。试着把它们的描述并排放在一起——有没有重复出现的字、数字、或符号？重复的就是关键。`,
        `两件物品都属于同一个人吗？如果不是——它们为什么会出现在同一个地方？${fromMeta.sourceName}和${toMeta.sourceName}之间的关联，就是你要找的答案。`,
        `物品是不会说话的证人。「${fromMeta.name}」上的痕迹和「${toMeta.name}」上的痕迹——它们的制造者可能是同一个人。注意不同物品之间的共同特征。`,
        `拿起这两件物品，在脑海里还原它们的位置关系。它们在场景中相距多远？如果距离很近，它们可能是同一事件的遗留物。`,
      ]
      return { success: true, text: itemHints[Math.floor(Math.random() * itemHints.length)], isCorrect: true }
    },

    attemptConnection(fromId, toId, playerReason) {
      // 只有自引用才拒绝
      if (fromId === toId) {
        this.lastConnectionResult = {
          success: false,
          text: '同一条线索无法与自己建立联系。试着选择另一条线索——也许你会发现意想不到的关联。',
        }
        this.selectedTargetId = null
        return null
      }

      const reason = typeof playerReason === 'number' ? playerReason : 50
      const meta = this.clueMetaMap[fromId]
      const toMeta = this.clueMetaMap[toId]

      // 有预定义的连接 → 使用 puzzle 数据
      if (meta && meta.connections) {
        const conn = meta.connections.find(c => c.targetId === toId)
        if (conn) {
          const result = getResultBySanity({
            success: conn.isCorrect,
            puzzle: conn.puzzle || '这些线索之间存在着某种联系...',
            hint: conn.hint || '',
            hintForPassword: conn.hintForPassword || 0,
            label: conn.label,
            isCorrect: conn.isCorrect,
          }, reason)

          // 记录连接（允许重复）
          this.discoveredConnections.push({ fromId, toId, chain: conn.chain, isCorrect: conn.isCorrect })

          // 检查推理链是否完成
          const chain = chainDefinitions[conn.chain]
          if (chain) {
            const chainConns = this.discoveredConnections.filter(c => c.chain === conn.chain)
            const required = chain.requiredConnections
            const allDone = required.every(([a, b]) =>
              chainConns.some(c => (c.fromId === a && c.toId === b) || (c.fromId === b && c.toId === a))
            )
            if (allDone && !this.completedChains.includes(conn.chain)) {
              this.completedChains.push(conn.chain)
              const chainResult = chain.isMisleading
                ? `⚠️ 错误推理链完成：「${chain.name}」\n\n${chain.conclusion}\n\n${chain.puzzle}\n\n这个方向可能走不通...`
                : `🧩 推理链完成：「${chain.name}」\n\n${chain.conclusion}\n\n🔑 ${chain.puzzle}`
              this.lastConnectionResult = { success: !chain.isMisleading, text: chainResult, chainCompleted: chain, isCorrect: !chain.isMisleading }
              this.selectedTargetId = null
              return chain
            }
          }

          this.lastConnectionResult = {
            success: conn.isCorrect,
            text: conn.isCorrect
              ? `✅ 串联成功\n\n📝 ${result.text}`
              : `❓ 存疑串联\n\n📝 ${result.text}`,
            chainCompleted: null,
            isCorrect: conn.isCorrect,
            hintForPassword: conn.hintForPassword || 0,
          }
          this.selectedTargetId = null
          return null
        }
      }

      // 无预定义连接 → 生成通用但有意义的结论
      if (meta && toMeta) {
        const fallback = this.generateFallbackResult(meta, toMeta, fromId, toId, reason)
        this.discoveredConnections.push({ fromId, toId, chain: 'generic', isCorrect: fallback.isCorrect })
        this.lastConnectionResult = {
          success: fallback.success,
          text: `🔗 线索关联\n\n📝 ${fallback.text}`,
          chainCompleted: null,
          isCorrect: fallback.isCorrect,
        }
        this.selectedTargetId = null
        return null
      }

      // 最坏情况：有线索无元数据
      this.lastConnectionResult = {
        success: false,
        text: '这条线索的信息暂时不完整。继续探索其他场景，或许能找到更多线索来完善你的推理。',
      }
      this.selectedTargetId = null
      return null
    },

    selectTarget(targetId) { this.selectedTargetId = targetId },
    clearSelection() { this.selectedTargetId = null },

    closeBrainstorm() {
      this.activeBrainstormClue = null
      this.selectedTargetId = null
      this.lastConnectionResult = null
    },
  },
})
