<template>
  <div class="workspace">
    <!-- 白色整体卡片 -->
    <div class="workspace-card">
      <!-- 统一标题栏 -->
      <div class="workspace-header">
        <div class="header-left">
          <span class="header-icon">{{ currentAgent.icon }}</span>
          <span class="header-name">{{ currentAgent.name }}</span>
          <span class="header-divider">|</span>
          <span class="header-summary">{{ currentAgent.summary }}</span>
        </div>
        <div class="header-right">
          <a-tag :color="badgeColor" class="header-badge">{{ currentAgent.badge }}</a-tag>
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
          <AgentDashboard
            :dashboard="currentDashboard"
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
import AgentDashboard from './AgentDashboard.vue'
import {
  agents,
  agentDashboards,
  initialMessages,
  getChatResponse,
  getBadgeColor,
} from '../mockData.js'

const route = useRoute()

const agentId = computed(() => route.params.agentId || 'agent-assistant')
const badgeColor = computed(() => getBadgeColor(currentAgent.value.status))

const currentAgent = computed(() => {
  return agents.find(a => a.id === agentId.value) || agents[0]
})

const currentDashboard = computed(() => {
  return agentDashboards[agentId.value] || agentDashboards['agent-assistant']
})

const messages = ref([])
const sending = ref(false)

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
  overflow: hidden;
}

/* 统一标题栏 */
.workspace-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 52px;
  padding: 0 16px;
  flex-shrink: 0;
  border-bottom: 1px solid #f0f0f0;
}
.header-left {
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
.header-divider {
  color: #e8e8e8;
  font-size: 14px;
  font-weight: 200;
}
.header-summary {
  font-size: 13px;
  color: #8c8c8c;
}
.header-right {
  display: flex;
  align-items: center;
}
.header-badge {
  font-size: 12px;
}

/* 工作区主体 */
.workspace-body {
  display: flex;
  flex: 1;
  min-height: 0;
}

.workspace-chat {
  width: 380px;
  min-width: 320px;
  flex-shrink: 0;
  border-right: 1px solid #f0f0f0;
}

.workspace-dash {
  flex: 1;
  min-width: 0;
}

@media (max-width: 1280px) {
  .workspace-chat {
    width: 340px;
    min-width: 280px;
  }
}
</style>
