/**
 * AI CFO · 税务合伙人 共享状态
 * 确保组件间数据变化同步（如智能体创建 → 左侧栏立即出现）
 */
import { reactive, computed } from 'vue'

// ==================== 智能体管理 ====================
const _agents = reactive([
  { id: 'agent-assistant',  icon: '👩‍💼', name: '杨姐的助理',   status: 'online',  badge: '3项紧急', summary: '今天有3件事需要处理', pendingCount: 0, lastActive: '刚刚',    description: '你的专属税务工作助手',     style: 'professional', capabilities: ['cap-leq', 'cap-king', 'cap-claude4'], knowledgeBases: ['kb-tax'], ontologies: ['onto-001'], model: 'Claude 4', temperature: 0.3, stats: { totalConversations: 120, todayConversations: 8, lastActiveAt: new Date().toISOString() },
  dashTabs: { biDashboards: [{ id: 'db-1', name: '默认看板', type: 'bi' }], fixedTabs: [{ id: 'tasks', name: '任务管理', type: 'tasks' }, { id: 'capability', name: '能力管理', type: 'capability' }, { id: 'knowledge', name: '知识库', type: 'knowledge' }] } },
  { id: 'agent-certify',    icon: '📄', name: '发票认证专员', status: 'warning', badge: '45%完成', summary: '还剩23张待认证', pendingCount: 23, lastActive: '11:30',  description: '专门负责发票认证的智能体',   style: 'concise',     capabilities: ['cap-py-certify', 'cap-py-invoice', 'cap-leq'],                knowledgeBases: ['kb-tax'], ontologies: ['onto-001', 'onto-002'],
    dashTabs: { biDashboards: [{ id: 'db-1', name: '默认看板', type: 'bi' }], fixedTabs: [{ id: 'tasks', name: '任务管理', type: 'tasks' }, { id: 'capability', name: '能力管理', type: 'capability' }, { id: 'knowledge', name: '知识库', type: 'knowledge' }] } },
  { id: 'agent-risk',       icon: '⚠️', name: '风险预警官',   status: 'normal', badge: '0风险',  summary: '一切正常', pendingCount: 0, lastActive: '3小时前',  description: '7×24小时监控企业税务风险',   style: 'data',        capabilities: ['cap-leq', 'cap-claude4'],                   knowledgeBases: [],               model: 'Claude 4', temperature: 0.1, stats: { totalConversations: 89,  todayConversations: 12, lastActiveAt: '2026-07-23T14:20:00' },
    dashTabs: { biDashboards: [{ id: 'db-1', name: '默认看板', type: 'bi' }], fixedTabs: [{ id: 'tasks', name: '任务管理', type: 'tasks' }, { id: 'capability', name: '能力管理', type: 'capability' }, { id: 'knowledge', name: '知识库', type: 'knowledge' }] } },
  { id: 'agent-declare',    icon: '📋', name: '申报管家',     status: 'paused', badge: '12日截止', summary: '距离申报截止还剩12天', pendingCount: 0, lastActive: '昨天',    description: '专注税务申报全流程管理',     style: 'professional', capabilities: ['cap-king', 'cap-gpt4o'],                knowledgeBases: ['kb-tax', 'kb-internal'], model: 'GPT-4o', temperature: 0.3, stats: { totalConversations: 42,  todayConversations: 0,  lastActiveAt: '2026-07-22T16:00:00' },
    dashTabs: { biDashboards: [{ id: 'db-1', name: '默认看板', type: 'bi' }], fixedTabs: [{ id: 'tasks', name: '任务管理', type: 'tasks' }, { id: 'capability', name: '能力管理', type: 'capability' }, { id: 'knowledge', name: '知识库', type: 'knowledge' }] } },
  { id: 'agent-compliance', icon: '🔍', name: '稽查合规师',   status: 'normal', badge: '',      summary: '专注税务稽查合规', pendingCount: 0, lastActive: '10:00',   description: '专注税务稽查合规检查',       style: 'professional', capabilities: ['cap-claude4', 'cap-feishu'],                 knowledgeBases: [],               model: 'Claude 4', temperature: 0.3, stats: { totalConversations: 23,  todayConversations: 2,  lastActiveAt: '2026-07-23T10:00:00' },
    dashTabs: { biDashboards: [{ id: 'db-1', name: '默认看板', type: 'bi' }], fixedTabs: [{ id: 'tasks', name: '任务管理', type: 'tasks' }, { id: 'capability', name: '能力管理', type: 'capability' }, { id: 'knowledge', name: '知识库', type: 'knowledge' }] } },
])

export const agentList = _agents

export function getSortedAgents() {
  const order = { urgent: 0, warning: 1, normal: 2, paused: 3, idle: 4 }
  return _agents.slice().sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9))
}

export function addAgent(agent) {
  _agents.push(agent)
}

export function removeAgent(id) {
  const idx = _agents.findIndex(a => a.id === id)
  if (idx > -1) _agents.splice(idx, 1)
}

export function updateAgent(id, data) {
  const a = _agents.find(x => x.id === id)
  if (a) Object.assign(a, data)
}
