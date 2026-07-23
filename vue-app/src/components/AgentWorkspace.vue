<template>
  <div class="workspace">
    <!-- 白色整体卡片 -->
    <div class="workspace-card">
      <!-- 统一标题栏（双行） -->
      <div class="workspace-header">
        <div class="header-top">
          <div class="header-top-left">
            <span class="header-icon">{{ currentAgent.icon }}</span>
            <span class="header-name">{{ currentAgent.name }}</span>
            <span class="header-desc">{{ currentAgent.description }}</span>
          </div>
          <div class="header-top-right">
            <button class="header-btn" title="聊天记录">📋</button>
            <button class="header-btn" title="搜索">🔍</button>
            <button class="header-btn" title="设置">⚙️</button>
          </div>
        </div>
      </div>

      <!-- 工作区主体：聊天 + 看板 -->
      <div class="workspace-body">
        <div class="workspace-chat">
          <ChatPanel
            :agent="currentAgent"
            :messages="messages"
            :sending="sending"
            @send="handleSend"
            @action="handleAction"
          />
        </div>
        <div class="workspace-dash">
          <AgentViewContainer
            :agent-id="agentId"
            :dash-tabs="currentAgent.dashTabs"
            :dashboards="allDashboards"
            :tasks="currentTasks"
            :capabilities="currentCapabilities"
            :knowledge="currentKnowledge"
            @action="handleAction"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import ChatPanel from './ChatPanel.vue'
import AgentViewContainer from './AgentViewContainer.vue'
import {
  agents,
  agentDashboardData,
  agentTasks,
  agentCapabilities,
  agentKnowledge,
  initialMessages,
  getChatResponse,
} from '../mockData.js'

const route = useRoute()

const agentId = computed(() => route.params.agentId || 'agent-assistant')

const currentAgent = computed(() => {
  return agents.find(a => a.id === agentId.value) || agents[0]
})

const allDashboards = computed(() => {
  return agentDashboardData[agentId.value] || {}
})

const currentTasks = computed(() => {
  return agentTasks[agentId.value] || []
})

const currentCapabilities = computed(() => {
  return agentCapabilities[agentId.value] || { mcps: [], llm: null }
})

const currentKnowledge = computed(() => {
  return agentKnowledge[agentId.value] || { documents: [], dataSources: [] }
})

const messages = ref([])
const sending = ref(false)

// Reset tab when agent changes
watch(agentId, () => {
  resetMessages()
}, { immediate: true })

function resetMessages() {
  const initial = initialMessages[agentId.value]
  if (initial) {
    messages.value = JSON.parse(JSON.stringify(initial))
  } else {
    messages.value = []
  }
}

function handleSend(text) {
  if (sending.value) return
  sending.value = true

  setTimeout(() => {
    const response = getChatResponse(agentId.value, text)
    if (response.messages) {
      messages.value.push(...response.messages)
    }
    sending.value = false
  }, 600)
}

function handleAction(action) {
  let userText = ''

  switch (action.action) {
    case 'view-invoices':
    case 'drill-cert-rate':
      userText = '看一下高危发票的情况'
      break
    case 'analyze-east':
      userText = '分析一下华东区为什么这么低'
      break
    case 'urge-declare':
    case 'urge-huazhong':
      userText = '帮我催报未申报的公司'
      break
    case 'batch-certify':
    case 'certify-danger':
      userText = '帮我认证这些发票'
      break
    case 'view-queue':
      userText = '查看认证队列'
      break
    case 'risk-check':
      userText = '开始风险排查'
      break
    case 'gen-report':
    case 'download-report':
      userText = '帮我生成报告'
      break
    case 'contact-finance':
    case 'contact-suning':
      userText = '联系苏宁电器财务'
      break
    case 'start-check':
      userText = '开始合规检查'
      break
    case 'send-urge':
      userText = '发督办通知给华东区'
      break
    case 'view-east-detail':
      userText = '查看华东区明细'
      break
    case 'view-detail':
    case 'view-invoice-detail':
      userText = '查看明细'
      break
    case 'export':
      userText = '帮我导出清单'
      break
    case 'notify-fix':
      userText = '通知华中第1分公司整改'
      break
    case 'certify-normal':
      userText = '继续认证普通发票'
      break
    case 'urge-again':
      userText = '再次催报'
      break
    default:
      userText = action.text || '帮我看看'
  }

  handleSend(userText)
}
</script>

<style scoped>
.workspace {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px;
}

/* 白色整体卡片 */
.workspace-card {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
}

/* 统一标题栏（双行） */
.workspace-header {
  flex-shrink: 0;
  padding: 24px 16px 12px;
}
.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.header-top-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.header-icon {
  font-size: 22px;
}
.header-name {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a2e;
}
.header-desc {
  font-size: 13px;
  color: #8c8c8c;
}
.header-top-right {
  display: flex;
  align-items: center;
  gap: 2px;
}
.header-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 15px;
  padding: 4px 6px;
  border-radius: 4px;
  line-height: 1;
  transition: background 0.15s;
}
.header-btn:hover {
  background: #f0f0f0;
}

/* 工作区主体 */
.workspace-body {
  display: flex;
  flex: 1;
  min-height: 0;
}

.workspace-chat {
  flex: 0 0 42%;
  min-width: 320px;
  max-width: 520px;
  border-right: 1px solid #f0f0f0;
}

.workspace-dash {
  flex: 1;
  min-width: 0;
  overflow: auto;
}

@media (max-width: 1280px) {
  .workspace-chat {
    flex: 0 0 42%;
    min-width: 280px;
  }
}
</style>
