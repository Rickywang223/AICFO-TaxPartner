<template>
  <div class="workspace">
    <!-- Chat Panel (1/3) -->
    <div class="workspace-chat">
      <ChatPanel
        :agent="currentAgent"
        :messages="messages"
        :sending="sending"
        @send="handleSend"
        @action="handleAction"
      />
    </div>

    <!-- Dashboard Panel (2/3) -->
    <div class="workspace-dash">
      <AgentDashboard
        :dashboard="currentDashboard"
        @action="handleAction"
      />
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
} from '../mockData.js'

const route = useRoute()

// Current agent from route param
const agentId = computed(() => route.params.agentId || 'agent-assistant')

const currentAgent = computed(() => {
  return agents.find(a => a.id === agentId.value) || agents[0]
})

const currentDashboard = computed(() => {
  return agentDashboards[agentId.value] || agentDashboards['agent-assistant']
})

// Messages state - reset when agent changes
const messages = ref([])
const sending = ref(false)

// Watch for agent changes -> reset messages
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

// Handle sending a message
function handleSend(text) {
  if (sending.value) return

  sending.value = true

  // Simulate API call delay
  setTimeout(() => {
    // Get response based on agent + user text
    const response = getChatResponse(agentId.value, text)

    // Add new messages
    if (response.messages) {
      messages.value.push(...response.messages)
    }

    sending.value = false
  }, 600) // 600ms simulated delay for natural feel
}

// Handle action button clicks from both chat and dashboard
function handleAction(action) {
  // Map action to a simulated user message
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
  height: 100%;
  overflow: hidden;
}

.workspace-chat {
  width: 380px;
  min-width: 320px;
  flex-shrink: 0;
  height: 100%;
}

.workspace-dash {
  flex: 1;
  min-width: 0;
  height: 100%;
  overflow: hidden;
}

/* Responsive: on narrower screens, chat can collapse */
@media (max-width: 1280px) {
  .workspace-chat {
    width: 340px;
    min-width: 280px;
  }
}
</style>
