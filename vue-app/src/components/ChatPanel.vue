<template>
  <div class="chat-panel">
    <!-- Agent Header -->
    <div class="chat-header">
      <div class="chat-header-left">
        <span class="chat-agent-icon">{{ agent.icon }}</span>
        <div class="chat-agent-info">
          <div class="chat-agent-name">{{ agent.name }}</div>
          <div class="chat-agent-summary">{{ agent.summary }}</div>
        </div>
      </div>
      <a-tag :color="badgeColor" class="chat-badge">{{ agent.badge }}</a-tag>
    </div>

    <a-divider style="margin: 0" />

    <!-- Messages -->
    <div class="messages-area" ref="messagesRef">
      <div
        v-for="(msg, idx) in messages"
        :key="idx"
        class="message-row"
        :class="{ 'message-user': msg.role === 'user', 'message-ai': msg.role === 'ai' }"
      >
        <div class="message-bubble" :class="{ 'bubble-user': msg.role === 'user', 'bubble-ai': msg.role === 'ai' }">
          <!-- AI message: render markdown-like syntax -->
          <div v-if="msg.role === 'ai'" class="message-content" v-html="renderMarkdown(msg.text)"></div>
          <!-- User message: plain text -->
          <div v-else class="message-content">{{ msg.text }}</div>

          <!-- Action buttons (AI only) -->
          <div v-if="msg.role === 'ai' && msg.actions && msg.actions.length" class="message-actions">
            <a-button
              v-for="(act, aidx) in msg.actions"
              :key="aidx"
              :type="act.type === 'primary' ? 'primary' : 'default'"
              size="small"
              class="action-btn"
              @click="$emit('action', act)"
            >{{ act.text }}</a-button>
          </div>

          <!-- Timestamp -->
          <div class="message-time">{{ msg.time }}</div>
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <div class="input-area">
      <a-divider style="margin: 0" />
      <div class="input-row">
        <a-input
          v-model:value="inputText"
          placeholder="问AI... 例如：今天有什么需要处理的？"
          class="chat-input"
          @press-enter="sendMessage"
          :disabled="sending"
        />
        <a-button
          type="primary"
          class="send-btn"
          @click="sendMessage"
          :loading="sending"
        >
          <template #icon><SendOutlined /></template>
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue'
import { SendOutlined } from '@ant-design/icons-vue'
import { getBadgeColor } from '../mockData.js'

const props = defineProps({
  agent: { type: Object, required: true },
  messages: { type: Array, required: true },
  sending: { type: Boolean, default: false },
})

const emit = defineEmits(['send', 'action'])

const inputText = ref('')
const messagesRef = ref(null)
const badgeColor = computed(() => getBadgeColor(props.agent.status))

// Auto-scroll to bottom when messages change
watch(() => props.messages.length, async () => {
  await nextTick()
  scrollToBottom()
})

function sendMessage() {
  const text = inputText.value.trim()
  if (!text) return
  emit('send', text)
  inputText.value = ''
}

function scrollToBottom() {
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight
  }
}

// Simple markdown renderer for AI messages
function renderMarkdown(text) {
  if (!text) return ''

  let html = text
    // Escape HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Inline code
    .replace(/`(.+?)`/g, '<code>$1</code>')
    // Table: | col1 | col2 | ...\n |---|---| ...\n | val1 | val2 | ...
    .replace(/\|(.+)\|/g, (match) => {
      // Check if it's a table row
      const cells = match.split('|').filter(c => c.trim()).map(c => c.trim())
      if (cells.length === 0) return match
      const cellHtml = cells.map(c => `<td>${c}</td>`).join('')
      return `<tr>${cellHtml}</tr>`
    })
    // Wrap consecutive <tr> in <table>
    .replace(/((?:<tr>.*?<\/tr>\n?)+)/g, '<table class="msg-table">$1</table>')
    // Remove separator rows (|---| pattern)
    .replace(/<tr>(<td>[—\-]+<\/td>\s*)+<\/tr>/g, '')
    // Line breaks
    .replace(/\n/g, '<br>')

  return html
}
</script>

<style scoped>
.chat-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  border-right: 1px solid #f0f0f0;
}

/* Header */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  flex-shrink: 0;
}
.chat-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.chat-agent-icon {
  font-size: 24px;
  flex-shrink: 0;
}
.chat-agent-info {
  min-width: 0;
}
.chat-agent-name {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a2e;
  line-height: 1.3;
}
.chat-agent-summary {
  font-size: 12px;
  color: #8c8c8c;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.chat-badge {
  flex-shrink: 0;
  font-size: 11px;
}

/* Messages */
.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #fafafa;
}

.message-row {
  display: flex;
  flex-direction: column;
}
.message-user {
  align-items: flex-end;
}
.message-ai {
  align-items: flex-start;
}

.message-bubble {
  max-width: 95%;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.6;
  position: relative;
}

.bubble-ai {
  background: #fff;
  border: 1px solid #e8e8e8;
  color: #1a1a2e;
  border-bottom-left-radius: 4px;
}

.bubble-user {
  background: #1677ff;
  color: #fff;
  border-bottom-right-radius: 4px;
}

.message-content {
  word-break: break-word;
}

.message-time {
  font-size: 11px;
  color: #bbb;
  margin-top: 4px;
}

.message-user .message-time {
  color: rgba(255,255,255,0.6);
  text-align: right;
}

/* Action buttons */
.message-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.action-btn {
  font-size: 12px;
}

/* Table styling in messages */
:deep(.msg-table) {
  width: 100%;
  border-collapse: collapse;
  margin: 6px 0;
  font-size: 12px;
}
:deep(.msg-table td) {
  padding: 4px 8px;
  border: 1px solid #e8e8e8;
}
:deep(.msg-table tr:first-child td) {
  background: #f5f5f5;
  font-weight: 500;
}

/* Input */
.input-area {
  flex-shrink: 0;
  background: #fff;
}

.input-row {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  gap: 8px;
}

.chat-input {
  flex: 1;
}

.send-btn {
  flex-shrink: 0;
}

/* Scrollbar styling */
.messages-area::-webkit-scrollbar {
  width: 4px;
}
.messages-area::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 2px;
}
.messages-area::-webkit-scrollbar-track {
  background: transparent;
}
</style>
