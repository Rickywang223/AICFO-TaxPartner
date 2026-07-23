/**
 * AI CFO · 税务合伙人 Mock 数据层
 * 用于 Phase 2 原型展示，后续对接真实 API
 */

// ==================== 智能体列表 ====================
export const agents = [
  { id: 'agent-assistant',  icon: '👩‍💼', name: '杨姐的助理',  status: 'urgent',  badge: '3项紧急', summary: '今天有3件事需要处理', pendingCount: 0, lastActive: '刚刚' },
  { id: 'agent-certify',   icon: '📄', name: '发票认证专员', status: 'warning', badge: '45%完成', summary: '还剩23张待认证', pendingCount: 23, lastActive: '11:30' },
  { id: 'agent-risk',      icon: '⚠️', name: '风险预警官',   status: 'urgent',  badge: '2家高危', summary: '新增1家风险公司', pendingCount: 2, lastActive: '09:15' },
  { id: 'agent-declare',   icon: '📋', name: '申报管家',     status: 'normal',  badge: '96%完成', summary: '距截止还有12天', pendingCount: 0, lastActive: '昨天' },
  { id: 'agent-compliance', icon: '🔍', name: '稽查合规师',  status: 'warning', badge: '新预警',   summary: '税负率1.78%正常', pendingCount: 1, lastActive: '10:42' },
]

export function getBadgeColor(status) {
  return status === 'urgent' ? 'red' : status === 'warning' ? 'orange' : 'green'
}

// 按待办数降序排列（有红点的排上面）
export function getSortedAgents() {
  return [...agents].sort((a, b) => b.pendingCount - a.pendingCount)
}

// ==================== 智能体驾驶舱数据 ====================
export const cockpitData = {
  total: 5,
  running: 4,
  stopped: 1,
  completedToday: 12,
  pendingToday: 26,
  abnormalAgents: [
    { id: 'agent-risk', name: '风险预警官', issue: '数据源断开' },
  ],
  agentStatuses: [
    { id: 'agent-assistant',  name: '杨姐的助理',  status: 'running',  lastActive: '刚刚' },
    { id: 'agent-certify',   name: '发票认证专员', status: 'running',  lastActive: '3分钟前' },
    { id: 'agent-risk',      name: '风险预警官',   status: 'stopped',  lastActive: '2小时前' },
    { id: 'agent-declare',   name: '申报管家',     status: 'running',  lastActive: '10分钟前' },
    { id: 'agent-compliance', name: '稽查合规师',  status: 'running',  lastActive: '30分钟前' },
  ],
}

// ==================== 各智能体 Dashboard 数据 ====================
export const agentDashboards = {

  // ----- 杨姐的助理 -----
  'agent-assistant': {
    kpiCards: [
      { id: 'cert-rate',    label: '认证率',      value: '77%',  valueFull: '77/100张', trend: 'up',   change: '+2%',    status: 'warning' },
      { id: 'risk-count',   label: '风险数',      value: '2家',  valueFull: '2家高危公司',           trend: 'down',  change: '-1家',   status: 'urgent'  },
      { id: 'declare-rate', label: '申报进度',    value: '96.2%', valueFull: '23/24家完成',           trend: 'up',   change: '+0.5%',   status: 'normal'  },
      { id: 'tax-rate',     label: '本月税负',    value: '2.8%', valueFull: '增值税税负率',           trend: 'up',   change: '+0.1%',   status: 'normal'  },
    ],
    sections: [
      {
        id: 'danger-invoices',
        title: '🔥 高危发票（3张待处理）',
        type: 'invoice-list',
        items: [
          { company: '苏宁电器',       amount: '¥456,000', urgency: 'critical', daysLeft: 3,  note: '仅剩3天' },
          { company: '雪峰致远科技',   amount: '¥12,300',  urgency: 'warning',  daysLeft: 7,  note: '7天到期' },
          { company: '华中第1分公司',  amount: '¥1,200',   urgency: 'warning',  daysLeft: 7,  note: '7天到期' },
        ],
        actions: [
          { text: '一键全部认证', type: 'primary', action: 'batch-certify' },
          { text: '查看明细',    type: 'default', action: 'view-invoice-detail' },
        ]
      },
      {
        id: 'today-tasks',
        title: '📋 今日待办（5项）',
        type: 'task-list',
        items: [
          { label: '月度申报截止 7/25',         urgent: true,  note: '剩余2天' },
          { label: '华东区认证率仅 41.4%',      urgent: true,  note: '远低于全国平均' },
          { label: '华中第1分公司发票对账',     urgent: false, note: '待处理' },
          { label: '增值税申报表核对',           urgent: false, note: '例行工作' },
          { label: '新供应商税务资质审核',      urgent: false, note: '3家待审' },
        ],
      }
    ],
    regionChart: {
      title: '区域认证排行',
      data: [
        { region: '华北', rate: 88, change: '+2%',  status: 'normal' },
        { region: '华南', rate: 82, change: '0%',   status: 'normal' },
        { region: '华东', rate: 41, change: '-35%', status: 'urgent' },
        { region: '华中', rate: 45, change: '-26%', status: 'urgent' },
      ]
    }
  },

  // ----- 发票认证专员 -----
  'agent-certify': {
    kpiCards: [
      { id: 'today-progress', label: '今日认证',     value: '77%',  valueFull: '77/100张',     trend: 'up',   change: '+5张',  status: 'warning' },
      { id: 'pending-count',  label: '待认证',       value: '23张', valueFull: '其中高危3张',   trend: 'down', change: '-12张', status: 'urgent'  },
      { id: 'month-progress', label: '本月目标',     value: '82%',  valueFull: '已完成820/1000张', trend: 'up', change: '+3%',   status: 'normal'  },
      { id: 'avg-time',       label: '平均认证耗时', value: '2.3h', valueFull: '从开票到认证',   trend: 'down', change: '-0.5h',  status: 'normal'  },
    ],
    sections: [
      {
        id: 'certify-queue',
        title: '📄 认证队列',
        type: 'dual-list',
        columns: [
          {
            title: '🔥 高危（3张）',
            items: [
              { company: '苏宁电器',       amount: '¥456,000', daysLeft: 3 },
              { company: '雪峰致远科技',   amount: '¥12,300',  daysLeft: 7 },
              { company: '华中第1分公司',  amount: '¥1,200',   daysLeft: 7 },
            ]
          },
          {
            title: '📋 普通（20张）',
            items: [
              { company: '华北配送中心',   amount: '¥23,000' },
              { company: '华南供应链',     amount: '¥18,500' },
              { company: '华东物流公司',   amount: '¥9,800' },
              { company: '其他 17 张...',   amount: '—' },
            ]
          }
        ],
        actions: [
          { text: '一键认证高危', type: 'primary', action: 'certify-danger' },
          { text: '批量认证',    type: 'default', action: 'batch-certify' },
          { text: '导出清单',    type: 'default', action: 'export' },
        ]
      }
    ]
  },

  // ----- 风险预警官 -----
  'agent-risk': {
    kpiCards: [
      { id: 'high-risk',     label: '高危公司',     value: '2家', valueFull: '风险评分<60', trend: 'down', change: '+1家', status: 'urgent' },
      { id: 'medium-risk',   label: '中危公司',     value: '7家', valueFull: '风险评分60-75', trend: 'down', change: '+2家', status: 'warning' },
      { id: 'risk-trend',    label: '风险趋势',     value: '↑12%', valueFull: '较上月上升', trend: 'up',   change: '+12%', status: 'urgent' },
      { id: 'safe-count',    label: '安全公司',     value: '67家', valueFull: '评分>75',    trend: 'up',   change: '+3家', status: 'normal' },
    ],
    sections: [
      {
        id: 'risk-heatmap',
        title: '⚠️ 高风险公司',
        type: 'risk-list',
        items: [
          { company: '苏宁电器', riskScore: 58, status: 'critical', issue: '发票连续逾期3次', trend: 'up' },
          { company: '雪峰致远科技', riskScore: 62, status: 'warning', issue: '税负率异常偏低', trend: 'up' },
        ],
        actions: [
          { text: '风险排查', type: 'primary', action: 'risk-check' },
          { text: '生成报告', type: 'default', action: 'gen-report' },
        ]
      }
    ]
  },

  // ----- 申报管家 -----
  'agent-declare': {
    kpiCards: [
      { id: 'completed',     label: '已完成',     value: '23家', valueFull: '共24家', trend: 'up',   change: '+1家', status: 'normal' },
      { id: 'pending',       label: '未申报',     value: '1家',  valueFull: '华中第1分公司', trend: 'down', change: '—',    status: 'warning' },
      { id: 'deadline',      label: '距截止日',   value: '12天', valueFull: '下次申报截止8/15', trend: 'down', change: '—', status: 'normal' },
      { id: 'on-time-rate',  label: '准时率',     value: '99.3%', valueFull: '全年申报准时率', trend: 'up', change: '+0.1%', status: 'normal' },
    ],
    sections: [
      {
        id: 'tax-progress',
        title: '📊 各税种申报进度',
        type: 'tax-table',
        columns: ['税种', '应报', '已报', '完成率', '状态'],
        rows: [
          { tax: '增值税',       total: 24, done: 24, rate: 100, status: 'done' },
          { tax: '企业所得税',   total: 24, done: 23, rate: 95.8, status: 'pending' },
          { tax: '印花税',       total: 24, done: 24, rate: 100, status: 'done' },
          { tax: '房产税',       total: 24, done: 22, rate: 91.7, status: 'pending' },
        ],
        actions: [
          { text: '催报未申报公司', type: 'primary', action: 'urge' },
          { text: '导出申报汇总',  type: 'default', action: 'export' },
        ]
      }
    ]
  },

  // ----- 稽查合规师 -----
  'agent-compliance': {
    kpiCards: [
      { id: 'health-score',   label: '健康评分',   value: '92分', valueFull: '较上月+1分', trend: 'up',   change: '+1分', status: 'normal' },
      { id: 'risk-items',     label: '检查项',     value: '3项',  valueFull: '需整改2项',   trend: 'down', change: '+1项', status: 'warning' },
      { id: 'tax-burden',     label: '税负率',     value: '1.78%', valueFull: '增值税税负率',  trend: 'down', change: '-0.05%', status: 'normal' },
      { id: 'inspections',    label: '在查案件',   value: '0件',  valueFull: '无在查税务案件', trend: 'flat', change: '—', status: 'normal' },
    ],
    sections: [
      {
        id: 'compliance-checks',
        title: '🔍 合规检查项',
        type: 'checklist',
        items: [
          { check: '发票认证及时性',   status: 'pass',   detail: '本月认证率82%，符合要求' },
          { check: '申报数据一致性',   status: 'warn',   detail: '华中第1分公司增值税申报数据异常' },
          { check: '税负率健康度',     status: 'pass',   detail: '增值税税负率2.8%，在合理区间' },
        ],
        actions: [
          { text: '开始合规检查', type: 'primary', action: 'start-check' },
          { text: '生成报告',    type: 'default', action: 'gen-report' },
        ]
      }
    ]
  },
}

// ==================== 各智能体对话初始消息 ====================
export const initialMessages = {
  'agent-assistant': [
    {
      role: 'ai',
      text: '早上好，杨姐！☀️ 今天有 **3件重要事项** 需要您关注：\n\n**1️⃣ 高危发票即将到期** — 苏宁电器 ¥456,000 仅剩3天\n**2️⃣ 华东区认证率仅41%** — 远低于全国平均71%\n**3️⃣ 月度申报截止7/25** — 剩余2天',
      time: '08:00',
      actions: [
        { text: '先看发票', type: 'primary', action: 'view-invoices' },
        { text: '分析华东区', type: 'default', action: 'analyze-east' },
        { text: '催未申报', type: 'default', action: 'urge-declare' },
      ]
    },
    {
      role: 'ai',
      text: '💡 今日小贴士：华中第1分公司近期数据波动较大，建议重点关注。',
      time: '08:00',
      actions: []
    },
  ],
  'agent-certify': [
    {
      role: 'ai',
      text: '早！今天认证进度 **77/100张**，还有23张待认证。其中有 **3张高危发票** 建议优先处理。',
      time: '08:00',
      actions: [
        { text: '一键认证高危', type: 'primary', action: 'certify-danger' },
        { text: '查看全部队列', type: 'default', action: 'view-queue' },
      ]
    },
  ],
  'agent-risk': [
    {
      role: 'ai',
      text: '⚠️ 风险预警：今日新增 **1家高危公司**，共有2家高危、7家中危需要关注。风险趋势较上月上升12%。',
      time: '08:00',
      actions: [
        { text: '风险排查', type: 'primary', action: 'risk-check' },
        { text: '生成风险报告', type: 'default', action: 'gen-report' },
      ]
    },
  ],
  'agent-declare': [
    {
      role: 'ai',
      text: '📋 申报进度：已申报 **23/24家**，华中第1分公司企业所得税未完成。距截止日还有12天，时间充裕。',
      time: '08:00',
      actions: [
        { text: '催报华中第1', type: 'primary', action: 'urge-huazhong' },
        { text: '查看明细', type: 'default', action: 'view-detail' },
      ]
    },
  ],
  'agent-compliance': [
    {
      role: 'ai',
      text: '🔍 合规检查：本月健康评分 **92分**（↑1分），3项检查中有1项异常：华中第1分公司增值税申报数据不一致。',
      time: '08:00',
      actions: [
        { text: '开始检查', type: 'primary', action: 'start-check' },
        { text: '查看详情', type: 'default', action: 'view-detail' },
      ]
    },
  ],
}

// ==================== 对话的响应映射（关键词 → 回复 + 看板变化） ====================
export function getChatResponse(agentId, userText) {
  const text = userText.toLowerCase()

  // 杨姐的助理
  if (agentId === 'agent-assistant') {
    if (text.includes('发票') || text.includes('高危') || text.includes('认证')) {
      return {
        messages: [
          { role: 'user', text: userText, time: getNow() },
          { role: 'ai', text: '已切换到高危发票视图 👇 当前有 **3张高危发票** 需要处理：\n\n| 公司 | 金额 | 剩余天数 |\n|:---|:---|:---|\n| 苏宁电器 | ¥456,000 | **3天** 🔥 |\n| 雪峰致远 | ¥12,300 | 7天 ⚠️ |\n| 华中第1分公司 | ¥1,200 | 7天 ⚠️ |\n\n建议优先处理苏宁电器，金额最大且时间最紧。', time: getNow(), actions: [{ text: '一键全部认证', type: 'primary', action: 'batch-certify' }, { text: '联系财务', type: 'default', action: 'contact-finance' }] },
        ],
        dashboardContext: 'danger-invoices'
      }
    }
    if (text.includes('华东') || text.includes('区域') || text.includes('对比')) {
      return {
        messages: [
          { role: 'user', text: userText, time: getNow() },
          { role: 'ai', text: '📊 **华东区分析**：\n\n华东区当前认证率 **41.4%**，远低于全国平均 **71%**，差距 **-35%**。\n\n主要原因：\n1️⃣ 华东区第1分公司 **23张发票未认证**\n2️⃣ 该分公司本月新更换财务负责人\n3️⃣ 系统对接存在延迟\n\n建议：点击下方按钮发送督办通知。', time: getNow(), actions: [{ text: '发督办通知', type: 'primary', action: 'send-urge' }, { text: '查看明细', type: 'default', action: 'view-east-detail' }] },
        ],
        dashboardContext: 'region-analysis'
      }
    }
    if (text.includes('申报') || text.includes('催') || text.includes('未申报')) {
      return {
        messages: [
          { role: 'user', text: userText, time: getNow() },
          { role: 'ai', text: '📋 当前未申报情况：\n\n仅 **华中第1分公司** 企业所得税未完成申报（截止日 7/25 还剩2天）。\n\n已发送催报通知。其他23家均已按时完成。', time: getNow(), actions: [{ text: '再次催报', type: 'primary', action: 'urge-again' }] },
        ],
        dashboardContext: 'declare-status'
      }
    }

    // Default response
    return {
      messages: [
        { role: 'user', text: userText, time: getNow() },
        { role: 'ai', text: '好的，我了解了。当前您的核心关注指标：\n\n- ✅ 认证率 **77%**（目标90%）\n- ⚠️ 风险数 **2家高危**\n- ✅ 申报进度 **96.2%**\n- ✅ 本月税负 **2.8%**\n\n有什么具体想了解的吗？我可以帮您查看发票、分析区域数据或跟踪申报进度。', time: getNow(), actions: [{ text: '查看高危发票', type: 'primary', action: 'view-invoices' }, { text: '分析华东区', type: 'default', action: 'analyze-east' }] },
      ],
      dashboardContext: 'default'
    }
  }

  // 发票认证专员
  if (agentId === 'agent-certify') {
    if (text.includes('认证') || text.includes('处理') || text.includes('高危')) {
      return {
        messages: [
          { role: 'user', text: userText, time: getNow() },
          { role: 'ai', text: '✅ **已开始批量认证！**\n\n正在处理3张高危发票...\n\n| 公司 | 金额 | 结果 |\n|:---|:---|:---|\n| 苏宁电器 | ¥456,000 | ✅ 认证成功 |\n| 雪峰致远 | ¥12,300 | ✅ 认证成功 |\n| 华中第1分公司 | ¥1,200 | ✅ 认证成功 |\n\n**全部完成！** 高危发票已清零。当前认证进度：80/100张。', time: getNow(), actions: [{ text: '继续认证普通发票', type: 'primary', action: 'certify-normal' }] },
        ],
        dashboardContext: 'certify-result'
      }
    }
    return {
      messages: [
        { role: 'user', text: userText, time: getNow() },
        { role: 'ai', text: '当前认证进度 **77/100张**（77%），剩余23张待认证，其中3张高危。', time: getNow(), actions: [{ text: '查看认证队列', type: 'primary', action: 'view-queue' }] },
      ],
      dashboardContext: 'default'
    }
  }

  // 风险预警官
  if (agentId === 'agent-risk') {
    if (text.includes('排查') || text.includes('检查') || text.includes('详情')) {
      return {
        messages: [
          { role: 'user', text: userText, time: getNow() },
          { role: 'ai', text: '🔍 **风险排查结果：**\n\n| 公司 | 风险分 | 问题 | 建议 |\n|:---|:---:|:---|:---|\n| 苏宁电器 | 58 | 连续逾期3次 | **立即联系** |\n| 雪峰致远 | 62 | 税负率异常 | 下发自查通知 |\n\n排查完成。已生成风险报告，建议今天内处理苏宁电器。', time: getNow(), actions: [{ text: '联系苏宁财务', type: 'primary', action: 'contact-suning' }, { text: '下载报告', type: 'default', action: 'download-report' }] },
        ],
        dashboardContext: 'risk-detail'
      }
    }
    return {
      messages: [
        { role: 'user', text: userText, time: getNow() },
        { role: 'ai', text: '当前风险概况：高危 2家、中危 7家、安全 67家。风险趋势较上月上升12%，需要关注。', time: getNow(), actions: [{ text: '开始排查', type: 'primary', action: 'risk-check' }] },
      ],
      dashboardContext: 'default'
    }
  }

  // 申报管家
  if (agentId === 'agent-declare') {
    if (text.includes('催') || text.includes('华中')) {
      return {
        messages: [
          { role: 'user', text: userText, time: getNow() },
          { role: 'ai', text: '📤 **已发送催报通知！**\n\n已向华中第1分公司税务负责人发送催报通知（短信+系统内通知）。\n\n当前状态：**等待对方确认**，请在下午再次查看进度。', time: getNow(), actions: [{ text: '查看申报明细', type: 'default', action: 'view-detail' }] },
        ],
        dashboardContext: 'urge-sent'
      }
    }
    return {
      messages: [
        { role: 'user', text: userText, time: getNow() },
        { role: 'ai', text: '申报进度：已申报23/24家，仅华中第1分公司企业所得税未完成。截止日7/25，时间充足。', time: getNow(), actions: [{ text: '催报未申报公司', type: 'primary', action: 'urge-huazhong' }] },
      ],
      dashboardContext: 'default'
    }
  }

  // 稽查合规师
  if (agentId === 'agent-compliance') {
    if (text.includes('检查') || text.includes('开始')) {
      return {
        messages: [
          { role: 'user', text: userText, time: getNow() },
          { role: 'ai', text: '🔍 **合规检查进行中...**\n\n✅ 发票认证及时性 — **通过**\n❌ 申报数据一致性 — **异常**（华中第1分公司）\n✅ 税负率健康度 — **通过**\n\n已生成《合规检查报告》，建议通知华中第1分公司修正申报数据。', time: getNow(), actions: [{ text: '通知整改', type: 'primary', action: 'notify-fix' }, { text: '下载报告', type: 'default', action: 'download-report' }] },
        ],
        dashboardContext: 'check-result'
      }
    }
    return {
      messages: [
        { role: 'user', text: userText, time: getNow() },
        { role: 'ai', text: '本月健康评分92分（↑1分），3项检查中1项异常。整体合规状况良好，建议尽快处理华中第1分公司的数据不一致问题。', time: getNow(), actions: [{ text: '开始合规检查', type: 'primary', action: 'start-check' }] },
      ],
      dashboardContext: 'default'
    }
  }

  // Fallback
  return {
    messages: [
      { role: 'user', text: userText, time: getNow() },
      { role: 'ai', text: '收到您的消息，正在处理中...', time: getNow(), actions: [] },
    ],
    dashboardContext: 'default'
  }
}

function getNow() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
