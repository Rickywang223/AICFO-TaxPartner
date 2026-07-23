/**
 * AI CFO · 税务合伙人 Mock 数据层
 * 用于 Phase 2 原型展示，后续对接真实 API
 */

// ==================== 智能体列表 ====================
export const agents = [
  { id: 'agent-assistant',  icon: '👩‍💼', name: '杨姐的助理',  status: 'urgent',  badge: '3项紧急', summary: '今天有3件事需要处理', pendingCount: 0, lastActive: '刚刚',    description: '你的专属税务工作助手',
    dashTabs: { biDashboards: [{ id: 'db-1', name: '默认看板', type: 'bi' }], fixedTabs: [{ id: 'tasks', name: '任务管理', type: 'tasks' }, { id: 'capability', name: '能力管理', type: 'capability' }, { id: 'knowledge', name: '知识库', type: 'knowledge' }] } },
  { id: 'agent-certify',   icon: '📄', name: '发票认证专员', status: 'warning', badge: '45%完成', summary: '还剩23张待认证', pendingCount: 23, lastActive: '11:30',  description: '专门负责发票认证的智能体',
    dashTabs: { biDashboards: [{ id: 'db-1', name: '今日工作台', type: 'bi' }, { id: 'db-2', name: '认证分析', type: 'bi' }], fixedTabs: [{ id: 'tasks', name: '任务管理', type: 'tasks' }, { id: 'capability', name: '能力管理', type: 'capability' }, { id: 'knowledge', name: '知识库', type: 'knowledge' }] } },
  { id: 'agent-risk',      icon: '⚠️', name: '风险预警官',   status: 'urgent',  badge: '2家高危', summary: '新增1家风险公司', pendingCount: 2, lastActive: '09:15',  description: '7×24小时监控企业税务风险',
    dashTabs: { biDashboards: [{ id: 'db-1', name: '默认看板', type: 'bi' }], fixedTabs: [{ id: 'tasks', name: '任务管理', type: 'tasks' }, { id: 'capability', name: '能力管理', type: 'capability' }, { id: 'knowledge', name: '知识库', type: 'knowledge' }] } },
  { id: 'agent-declare',   icon: '📋', name: '申报管家',     status: 'normal',  badge: '96%完成', summary: '距截止还有12天', pendingCount: 0, lastActive: '昨天',   description: '自动跟踪各税种申报进度',
    dashTabs: { biDashboards: [{ id: 'db-1', name: '默认看板', type: 'bi' }], fixedTabs: [{ id: 'tasks', name: '任务管理', type: 'tasks' }, { id: 'capability', name: '能力管理', type: 'capability' }, { id: 'knowledge', name: '知识库', type: 'knowledge' }] } },
  { id: 'agent-compliance', icon: '🔍', name: '稽查合规师',  status: 'warning', badge: '新预警',   summary: '税负率1.78%正常', pendingCount: 1, lastActive: '10:42',  description: '专业税务稽查与合规分析',
    dashTabs: { biDashboards: [{ id: 'db-1', name: '默认看板', type: 'bi' }], fixedTabs: [{ id: 'tasks', name: '任务管理', type: 'tasks' }, { id: 'capability', name: '能力管理', type: 'capability' }, { id: 'knowledge', name: '知识库', type: 'knowledge' }] } },
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
// 每个智能体可多个 BI 看板，keyed by BI tab ID
export const agentDashboardData = {

  // ----- 杨姐的助理 -----
  'agent-assistant': {
    'db-1': {
      kpiCards: [
        { id: 'cert-rate',    label: '认证率',      value: '77%',  valueFull: '77/100张', trend: 'up',   change: '+2%',    status: 'warning' },
        { id: 'risk-count',   label: '风险数',      value: '2家',  valueFull: '2家高危公司',           trend: 'down',  change: '-1家',   status: 'urgent'  },
        { id: 'declare-rate', label: '申报进度',    value: '96.2%', valueFull: '23/24家完成',           trend: 'up',   change: '+0.5%',   status: 'normal'  },
        { id: 'tax-rate',     label: '本月税负',    value: '2.8%', valueFull: '增值税税负率',           trend: 'up',   change: '+0.1%',   status: 'normal'  },
      ],
      sections: [
        { id: 'danger-invoices', title: '🔥 高危发票（3张待处理）', type: 'invoice-list',
          items: [
            { company: '苏宁电器',       amount: '¥456,000', urgency: 'critical', daysLeft: 3,  deadline: '2026-07-26', note: '仅剩3天' },
            { company: '雪峰致远科技',   amount: '¥12,300',  urgency: 'warning',  daysLeft: 7,  deadline: '2026-07-30', note: '7天到期' },
            { company: '华中第1分公司',  amount: '¥1,200',   urgency: 'warning',  daysLeft: 7,  deadline: '2026-07-30', note: '7天到期' },
          ],
          actions: [
            { text: '一键全部认证', type: 'primary', action: 'batch-certify' },
            { text: '查看明细',    type: 'default', action: 'view-invoice-detail' },
          ]
        },
        { id: 'today-tasks', title: '📋 今日待办（5项）', type: 'task-list',
          items: [
            { text: '整理本月进项发票',   status: 'in_progress' },
            { text: '审核华东区报销单',   status: 'pending' },
            { text: '更新供应商税号',     status: 'pending' },
            { text: '完成月度税务报告',   status: 'completed' },
            { text: '沟通Q3税务筹划',     status: 'pending' },
          ],
        },
      ],
    },
  },

  // ----- 发票认证专员 -----
  'agent-certify': {
    // ⭐ 看板一：今日工作台（默认）
    'db-1': {
      name: '今日工作台',
      // No top-level kpiCards — moved into health-snapshot section
      sections: [
        // ⭐ 区域1：今日待办中心（最重要！放最顶部）
        { id: 'urgent-center', title: '🎯 今日待办中心', type: 'urgent-center',
          deadlineLabel: '7月28日截止',
          daysLeft: 5,
          urgentTasks: [
            { text: '苏宁电器 ¥456,000 · 23张未认证', urgency: 92, note: '金额最大 · 建议立即处理',
              actions: [
                { text: '一键认证', type: 'primary', action: 'certify-suning' },
                { text: '查看明细', type: 'default', action: 'view-suning-detail' },
              ] },
            { text: '华中区认证率45% · 低于集团平均线', urgency: 85, note: '异常票23张',
              actions: [
                { text: '发送督办通知', type: 'primary', action: 'urge-huazhong' },
                { text: '下钻查看', type: 'default', action: 'drill-huazhong' },
              ] },
          ],
          pendingTasks: [
            { text: '雪峰致远异常发票  ¥12,300 · 供应商异常率8%',
              actions: [ { text: '查看处理', type: 'default', action: 'handle-xuefeng' } ] },
            { text: '华南区认证率67% · 距截止15天',
              actions: [ { text: '下钻查看', type: 'default', action: 'drill-huanan' } ] },
            { text: '导出本月认证清单供财务核对',
              actions: [ { text: '导出清单', type: 'default', action: 'export-list' } ] },
          ],
        },

        // 💡 区域2：集团健康一瞥（4卡片）
        { id: 'health', title: '💡 集团健康一瞥', type: 'health-snapshot',
          cards: [
            { id: 'countdown', label: '📅 认证倒计时', value: '5天', sub: '距截止 7月28日', status: 'danger',
              action: { text: '查看全部', type: 'default', action: 'view-queue' } },
            { id: 'progress', label: '📊 认证进度', value: '77%', sub: '已认证77/100张', status: 'warning',
              action: { text: '查看明细', type: 'default', action: 'view-progress' } },
            { id: 'loss', label: '💰 过期损失', value: '¥315万', sub: '本月过期损失预估', status: 'danger',
              action: { text: '生成补认证工单', type: 'primary', action: 'gen-work-order' } },
            { id: 'score', label: '🏆 健康评分', value: 'B级', sub: '综合评分74分', status: 'normal',
              action: { text: '查看详情', type: 'default', action: 'view-health-detail' } },
          ],
        },

        // 🔥 区域3：申报紧迫度排行
        { id: 'urgency', title: '🔥 申报紧迫度排行', type: 'urgency-rank',
          deadlineLabel: '距截止还有 5 天',
          groups: [
            { level: 'urgent', label: '🔴 优先处理',
              items: [
                { company: '苏宁电器', amount: '¥456,000', count: '23张', region: '华中区·万达店', age: '发票开具超90天', loss: '¥45.6万', urgency: 92,
                  actions: [ { text: '一键认证', type: 'primary', action: 'certify-suning' }, { text: '查看明细', type: 'default', action: 'view-suning-detail' } ] },
                { company: '雪峰致远科技', amount: '¥178,000', count: '8张', region: '华南区·广州分公司', age: '供应商异常率8%', loss: '¥17.8万', urgency: 78,
                  actions: [ { text: '一键认证', type: 'primary', action: 'certify-xuefeng' }, { text: '查看明细', type: 'default', action: 'view-xuefeng-detail' } ] },
              ],
              batchActions: [ { text: '一键认证两项', type: 'primary', action: 'batch-certify-urgent' }, { text: '导出待认证清单', type: 'default', action: 'export-urgent-list' } ],
            },
            { level: 'watch', label: '🟠 关注处理',
              items: [
                { company: '美团', amount: '¥89,000', count: '8张', region: '华南区·深圳分公司', age: '发票开具30天', loss: '¥8.9万', urgency: 55,
                  actions: [ { text: '一键认证', type: 'primary', action: 'certify-meituan' }, { text: '查看明细', type: 'default', action: 'view-meituan-detail' } ] },
              ],
            },
            { level: 'safe', label: '🟢 常规处理',
              count: '193.7万张',
              note: '其余未认证发票正常安排，暂无需特别关注',
              action: { text: '查看全部清单 →', type: 'default', action: 'view-all' },
            },
          ],
        },

        // ⚡ 区域4：智能建议
        { id: 'suggestions', title: '⚡ 智能建议', type: 'smart-suggestions',
          items: [
            { title: '开启自动认证规则', desc: '预计可提升认证率至85%',
              actions: [ { text: '立即开启 ⚡', type: 'primary', action: 'enable-auto' }, { text: '了解更多', type: 'default', action: 'learn-more' } ] },
            { title: '优先处理高危发票', desc: '3张跨期发票<15天',
              actions: [ { text: '一键认证所有高危', type: 'primary', action: 'certify-danger' }, { text: '导出待认证清单', type: 'default', action: 'export-list' } ] },
            { title: '华中区域认证率仅45%', desc: '低于集团平均线',
              actions: [ { text: '下钻查看', type: 'default', action: 'drill-huazhong' }, { text: '发送督办通知', type: 'primary', action: 'urge-huazhong' } ] },
            { title: 'AI已生成补认证清单', desc: '预计可挽回损失¥80万',
              actions: [ { text: '查看清单', type: 'default', action: 'view-list' }, { text: '生成补认证工单', type: 'primary', action: 'gen-work-order' } ] },
          ],
        },
      ],
    },
    // ⭐ 看板二：认证分析
    'db-2': {
      name: '认证分析',
      sections: [
        { id: 'trend', title: '📈 认证率趋势（近30天）', type: 'trend-chart',
          currentRate: 77,
          targetRate: 85,
          gap: -8,
          dataPoints: [
            { label: '第1周', value: 72 },
            { label: '第2周', value: 75 },
            { label: '第3周', value: 73 },
            { label: '第4周', value: 77 },
          ],
        },
        { id: 'region', title: '🗺️ 区域认证率分布', type: 'region-chart',
          regions: [
            { name: '华东区', rate: 76, color: 'normal' },
            { name: '华南区', rate: 92, color: 'normal' },
            { name: '华中区', rate: 65, color: 'urgent', note: '↓ 连续3天下降' },
            { name: '华北区', rate: 88, color: 'normal' },
            { name: '西南区', rate: 95, color: 'normal' },
          ],
          actions: [
            { text: '查看华中区明细', type: 'default', action: 'view-detail' },
          ],
        },
        { id: 'alerts', title: '⚠️ 异常预警', type: 'alert-list',
          items: [
            { level: 'error',   text: '华中区认证率连续3天下降',     time: '今日' },
            { level: 'warning', text: '雪峰致远发票税率异常（13%→6%）', time: '昨日' },
            { level: 'info',    text: '本月认证截止日还剩5天',         time: '今日' },
          ],
        },
        { id: 'efficiency', title: '📊 认证效率统计', type: 'efficiency-table',
          headers: ['指标', '本周', '环比'],
          rows: [
            { label: '平均认证时长', current: '2.3min', change: '-0.5min', trend: 'up' },
            { label: '单日最高',     current: '156张',  change: '+23张',   trend: 'up' },
            { label: '自动认证率',   current: '68%',    change: '+5%',     trend: 'up' },
          ],
          actions: [
            { text: '导出分析报告', type: 'primary', action: 'export' },
            { text: '查看明细',     type: 'default', action: 'view-detail' },
          ],
        },
      ],
    },
  },

  // ----- 风险预警官 -----
  'agent-risk': {
    'db-1': {
      kpiCards: [
        { id: 'high-risk',     label: '高危公司',     value: '2家', valueFull: '风险评分<60', trend: 'down', change: '+1家', status: 'urgent' },
        { id: 'medium-risk',   label: '中危公司',     value: '7家', valueFull: '风险评分60-75', trend: 'down', change: '+2家', status: 'warning' },
        { id: 'risk-trend',    label: '风险趋势',     value: '↑12%', valueFull: '较上月上升', trend: 'up',   change: '+12%', status: 'urgent' },
        { id: 'safe-count',    label: '安全公司',     value: '67家', valueFull: '评分>75',    trend: 'up',   change: '+3家', status: 'normal' },
      ],
      sections: [
        { id: 'risk-heatmap', title: '⚠️ 高风险公司', type: 'risk-list',
          items: [
            { company: '苏宁电器', riskScore: 58, status: 'critical', issue: '发票连续逾期3次', trend: 'up' },
            { company: '雪峰致远科技', riskScore: 62, status: 'warning', issue: '税负率异常偏低', trend: 'up' },
          ],
          actions: [
            { text: '风险排查', type: 'primary', action: 'risk-check' },
            { text: '生成报告', type: 'default', action: 'gen-report' },
          ]
        },
      ],
    },
  },

  // ----- 申报管家 -----
  'agent-declare': {
    'db-1': {
      kpiCards: [
        { id: 'completed',     label: '已完成',     value: '23家', valueFull: '共24家', trend: 'up',   change: '+1家', status: 'normal' },
        { id: 'pending',       label: '未申报',     value: '1家',  valueFull: '华中第1分公司', trend: 'down', change: '—',    status: 'warning' },
        { id: 'deadline',      label: '距截止日',   value: '12天', valueFull: '下次申报截止8/15', trend: 'down', change: '—', status: 'normal' },
        { id: 'on-time-rate',  label: '准时率',     value: '99.3%', valueFull: '全年申报准时率', trend: 'up', change: '+0.1%', status: 'normal' },
      ],
      sections: [
        { id: 'tax-progress', title: '📊 各税种申报进度', type: 'tax-table',
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
        },
      ],
    },
  },

  // ----- 稽查合规师 -----
  'agent-compliance': {
    'db-1': {
      kpiCards: [
        { id: 'health-score',   label: '健康评分',   value: '92分', valueFull: '较上月+1分', trend: 'up',   change: '+1分', status: 'normal' },
        { id: 'risk-items',     label: '检查项',     value: '3项',  valueFull: '需整改2项',   trend: 'down', change: '+1项', status: 'warning' },
        { id: 'tax-burden',     label: '税负率',     value: '1.78%', valueFull: '增值税税负率',  trend: 'down', change: '-0.05%', status: 'normal' },
        { id: 'inspections',    label: '在查案件',   value: '0件',  valueFull: '无在查税务案件', trend: 'flat', change: '—', status: 'normal' },
      ],
      sections: [
        { id: 'compliance-checks', title: '🔍 合规检查项', type: 'checklist',
          items: [
            { check: '发票认证及时性',   status: 'pass',   detail: '本月认证率82%，符合要求' },
            { check: '申报数据一致性',   status: 'warn',   detail: '华中第1分公司增值税申报数据异常' },
            { check: '税负率健康度',     status: 'pass',   detail: '增值税税负率2.8%，在合理区间' },
          ],
          actions: [
            { text: '开始合规检查', type: 'primary', action: 'start-check' },
            { text: '生成报告',    type: 'default', action: 'gen-report' },
          ]
        },
      ],
    },
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

// ==================== 任务管理 Mock 数据 ====================
export const agentTasks = {
  'agent-assistant': [
    { id: 't1', title: '整理本月进项发票', description: '整理并归类本月所有进项发票', status: 'in_progress', priority: 'high', assignee: '杨姐', dueDate: '2026-07-25', createdAt: '2026-07-23' },
    { id: 't2', title: '更新供应商信息', description: '新增3家供应商税务登记信息', status: 'pending', priority: 'medium', assignee: '杨姐', dueDate: '2026-07-28', createdAt: '2026-07-22' },
    { id: 't3', title: '完成月度税务报告', description: '汇总本月税务数据并生成报告', status: 'completed', priority: 'high', assignee: '杨姐', dueDate: '2026-07-20', createdAt: '2026-07-15' },
  ],
  'agent-certify': [
    { id: 't1', title: '认证华东区高危发票', description: '涉及苏宁电器等3家公司，共¥469,500', status: 'in_progress', priority: 'high', assignee: '杨姐', dueDate: '2026-07-25', createdAt: '2026-07-23' },
    { id: 't2', title: '批量认证普通发票', description: '23张待认证普通发票批量处理', status: 'pending', priority: 'medium', assignee: '杨姐', dueDate: '2026-07-26', createdAt: '2026-07-22' },
    { id: 't3', title: '导出认证清单', description: '导出本月认证清单供财务核对', status: 'pending', priority: 'low', assignee: '杨姐', dueDate: '2026-07-30', createdAt: '2026-07-21' },
    { id: 't4', title: '处理异常发票', description: '3张税率异常的发票需要人工确认', status: 'completed', priority: 'high', assignee: '杨姐', dueDate: '2026-07-22', createdAt: '2026-07-20' },
  ],
  'agent-risk': [
    { id: 't1', title: '排查高危风险公司', description: '2家高风险企业深入排查', status: 'in_progress', priority: 'high', assignee: '杨姐', dueDate: '2026-07-24', createdAt: '2026-07-23' },
    { id: 't2', title: '更新风险预警规则', description: '根据最新政策更新预警阈值', status: 'pending', priority: 'medium', assignee: '杨姐', dueDate: '2026-07-29', createdAt: '2026-07-22' },
  ],
  'agent-declare': [
    { id: 't1', title: '催报未申报公司', description: '华中第1分公司尚未完成本月申报', status: 'in_progress', priority: 'high', assignee: '杨姐', dueDate: '2026-07-24', createdAt: '2026-07-23' },
  ],
  'agent-compliance': [
    { id: 't1', title: '完成季度合规检查', description: 'Q2季度合规检查全部项目', status: 'in_progress', priority: 'high', assignee: '杨姐', dueDate: '2026-07-26', createdAt: '2026-07-23' },
    { id: 't2', title: '整理合规报告', description: '汇总检查结果并生成合规报告', status: 'pending', priority: 'medium', assignee: '杨姐', dueDate: '2026-07-28', createdAt: '2026-07-22' },
  ],
}

// ==================== 能力管理 Mock 数据 ====================
export const agentCapabilities = {
  'agent-assistant': {
    mcps: [
      { id: 'mcp-invoice', name: '发票数据服务', type: 'api', endpoint: 'https://api.tax/internal/invoice', status: 'online', lastActive: '刚刚', description: '金税系统发票数据接口' },
      { id: 'mcp-declare', name: '申报数据服务', type: 'api', endpoint: 'https://api.tax/internal/declare', status: 'online', lastActive: '3分钟前', description: '电子税务局申报接口' },
    ],
    llm: { provider: 'DeepSeek', model: 'deepseek-v4-flash', temperature: 0.3, maxTokens: 4096, status: 'active' },
  },
  'agent-certify': {
    mcps: [
      { id: 'mcp-invoice-db', name: '发票数据库', type: 'database', endpoint: 'mysql://tax-db/internal', status: 'online', lastActive: '刚刚', description: '金税系统发票数据接口' },
      { id: 'mcp-cert-api', name: '认证服务API', type: 'api', endpoint: 'https://api.tax/certify', status: 'online', lastActive: '1分钟前', description: '发票认证服务接口' },
    ],
    llm: { provider: 'DeepSeek', model: 'deepseek-v4-flash', temperature: 0.2, maxTokens: 4096, status: 'active' },
  },
  'agent-risk': {
    mcps: [
      { id: 'mcp-risk-db', name: '风险数据库', type: 'database', endpoint: 'mysql://risk-db/internal', status: 'online', lastActive: '30秒前', description: '企业风险评分数据库' },
      { id: 'mcp-warning', name: '预警规则引擎', type: 'api', endpoint: 'https://api.tax/risk/engine', status: 'error', lastActive: '2小时前', description: '风险预警规则计算引擎' },
    ],
    llm: { provider: 'DeepSeek', model: 'deepseek-v4-flash', temperature: 0.4, maxTokens: 4096, status: 'active' },
  },
  'agent-declare': {
    mcps: [
      { id: 'mcp-declare-db', name: '申报数据库', type: 'database', endpoint: 'mysql://declare-db/internal', status: 'online', lastActive: '10分钟前', description: '各税种申报进度数据库' },
    ],
    llm: { provider: 'DeepSeek', model: 'deepseek-v4-flash', temperature: 0.3, maxTokens: 4096, status: 'active' },
  },
  'agent-compliance': {
    mcps: [
      { id: 'mcp-compliance-db', name: '合规数据库', type: 'database', endpoint: 'mysql://compliance-db/internal', status: 'online', lastActive: '30分钟前', description: '税务合规检查数据库' },
      { id: 'mcp-report', name: '报告生成服务', type: 'api', endpoint: 'https://api.tax/report/gen', status: 'online', lastActive: '5分钟前', description: '自动生成合规检查报告' },
    ],
    llm: { provider: 'DeepSeek', model: 'deepseek-v4-flash', temperature: 0.3, maxTokens: 4096, status: 'active' },
  },
}

// ==================== 知识库 Mock 数据 ====================
export const agentKnowledge = {
  'agent-assistant': {
    documents: [
      { id: 'doc-1', name: '增值税发票认证流程.pdf', type: 'application/pdf', size: '2.3 MB', status: 'indexed', uploadedAt: '2026-07-22', chunks: 42 },
      { id: 'doc-2', name: '企业税务合规手册.docx', type: 'application/docx', size: '1.8 MB', status: 'indexed', uploadedAt: '2026-07-20', chunks: 28 },
    ],
    dataSources: [
      { id: 'ds-1', name: 'ERP系统数据库', type: 'mysql', host: '192.168.1.100', dbName: 'erp_tax', status: 'connected' },
    ],
  },
  'agent-certify': {
    documents: [
      { id: 'doc-1', name: '发票认证操作规范.pdf', type: 'application/pdf', size: '3.1 MB', status: 'indexed', uploadedAt: '2026-07-21', chunks: 56 },
      { id: 'doc-2', name: '高危发票识别标准.docx', type: 'application/docx', size: '890 KB', status: 'indexed', uploadedAt: '2026-07-19', chunks: 15 },
      { id: 'doc-3', name: '2026年税务新政解读.pdf', type: 'application/pdf', size: '5.2 MB', status: 'indexing', uploadedAt: '2026-07-23', chunks: 0 },
    ],
    dataSources: [
      { id: 'ds-1', name: '金税系统', type: 'api', host: 'api.golden-tax.gov.cn', status: 'connected' },
    ],
  },
  'agent-risk': {
    documents: [
      { id: 'doc-1', name: '企业风险评分模型.pdf', type: 'application/pdf', size: '4.5 MB', status: 'indexed', uploadedAt: '2026-07-18', chunks: 78 },
    ],
    dataSources: [
      { id: 'ds-1', name: '企业信用数据库', type: 'mysql', host: '192.168.1.200', dbName: 'credit_db', status: 'connected' },
      { id: 'ds-2', name: '税务稽查黑名单', type: 'api', host: 'api.tax.gov/blacklist', status: 'error' },
    ],
  },
  'agent-declare': {
    documents: [
      { id: 'doc-1', name: '各税种申报指南.pdf', type: 'application/pdf', size: '6.8 MB', status: 'indexed', uploadedAt: '2026-07-15', chunks: 102 },
      { id: 'doc-2', name: '申报截止日期表.xlsx', type: 'application/xlsx', size: '450 KB', status: 'indexed', uploadedAt: '2026-07-10', chunks: 8 },
    ],
    dataSources: [
      { id: 'ds-1', name: '电子税务局', type: 'api', host: 'api.etax.gov.cn', status: 'connected' },
    ],
  },
  'agent-compliance': {
    documents: [
      { id: 'doc-1', name: '税务稽查条例汇编.pdf', type: 'application/pdf', size: '8.2 MB', status: 'indexed', uploadedAt: '2026-07-01', chunks: 135 },
    ],
    dataSources: [
      { id: 'ds-1', name: '法规数据库', type: 'mysql', host: '192.168.1.150', dbName: 'regulations', status: 'connected' },
    ],
  },
}
