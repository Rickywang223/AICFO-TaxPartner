<template>
  <div class="chat-panel">
    <!-- Messages -->
    <div class="messages-area" ref="messagesRef">
      <div
        v-for="(msg, idx) in messages"
        :key="idx"
        class="message-row"
        :class="{ 'message-user': msg.role === 'user', 'message-ai': msg.role === 'ai' }"
      >
        <div class="message-bubble" :class="{ 'bubble-user': msg.role === 'user', 'bubble-ai': msg.role === 'ai' }">
          <div v-if="msg.role === 'ai'" class="message-content" v-html="renderMarkdown(msg.text)"></div>
          <div v-else class="message-content">{{ msg.text }}</div>

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

          <div class="message-time">{{ msg.time }}</div>
        </div>
      </div>
    </div>

    <!-- File Preview Bar -->
    <div v-if="attachments.length" class="file-preview-bar">
      <div v-for="(file, idx) in attachments" :key="idx" class="file-tag">
        <span class="file-icon">{{ fileIcon(file.type) }}</span>
        <span class="file-name">{{ file.name }}</span>
        <span class="file-remove" @click="removeFile(idx)">×</span>
      </div>
    </div>

    <!-- Input Area -->
    <div class="input-area">
      <div class="input-wrapper">
        <textarea
          v-model="inputText"
          class="chat-textarea"
          placeholder="输入消息..."
          :disabled="sending"
          @keydown="handleKeydown"
          rows="1"
          ref="textareaRef"
        ></textarea>
      </div>
      <div class="toolbar">
        <div class="toolbar-left">
          <button class="toolbar-btn" title="上传附件" @click="triggerUpload">
            <label class="upload-label">
              📎
              <input type="file" ref="fileInputRef" class="file-input-hidden" @change="handleFileSelect" multiple accept=".pdf,.xls,.xlsx,.doc,.docx,.png,.jpg,.jpeg" />
            </label>
          </button>
          <button class="toolbar-btn" title="表情" @click="toggleEmoji">😊</button>
          <button class="toolbar-btn" title="截图" @click="handleScreenshot">📷</button>
        </div>
        <div class="toolbar-right">
          <button class="send-btn" :class="{ 'send-active': inputText.trim() }" :disabled="sending || !inputText.trim()" @click="sendMessage">
            ➡️
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue'

const props = defineProps({
  agent: { type: Object, required: true },
  messages: { type: Array, required: true },
  sending: { type: Boolean, default: false },
})

const emit = defineEmits(['send', 'action'])

const inputText = ref('')
const messagesRef = ref(null)
const textareaRef = ref(null)
const fileInputRef = ref(null)
const attachments = ref([])

// Auto-scroll to bottom when messages change
watch(() => props.messages.length, async () => {
  await nextTick()
  scrollToBottom()
})

// Auto-resize textarea
watch(inputText, () => {
  autoResizeTextarea()
})

function scrollToBottom() {
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight
  }
}

function autoResizeTextarea() {
  const ta = textareaRef.value
  if (!ta) return
  ta.style.height = 'auto'
  const lineHeight = 22
  const maxHeight = lineHeight * 6 + 12
  const newHeight = Math.min(ta.scrollHeight, maxHeight)
  ta.style.height = Math.max(lineHeight + 12, newHeight) + 'px'
}

function handleKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

function sendMessage() {
  const text = inputText.value.trim()
  if (!text || props.sending) return
  emit('send', text)
  inputText.value = ''
  attachments.value = []
  autoResizeTextarea()
}

// File/Attachment handling
function triggerUpload() {
  fileInputRef.value?.click()
}

function handleFileSelect(e) {
  const files = Array.from(e.target.files)
  const remaining = 5 - attachments.value.length
  files.slice(0, remaining).forEach(f => {
    attachments.value.push({ name: f.name, type: f.type, size: f.size, file: f })
  })
  e.target.value = ''
}

function removeFile(idx) {
  attachments.value.splice(idx, 1)
}

function fileIcon(type) {
  if (!type) return '📄'
  if (type.includes('pdf')) return '📕'
  if (type.includes('excel') || type.includes('sheet') || type.includes('xls')) return '📊'
  if (type.includes('word') || type.includes('doc')) return '📝'
  if (type.includes('image') || type.includes('png') || type.includes('jpg')) return '🖼️'
  return '📄'
}

function toggleEmoji() {
  // Emoji picker - placeholder, insert a random emoji for demo
  const emojis = ['😊', '👍', '✅', '📌', '⚠️', '🔥', '💰', '📋', '⏰', '📢']
  const emoji = emojis[Math.floor(Math.random() * emojis.length)]
  inputText.value += emoji
  textareaRef.value?.focus()
}

function handleScreenshot() {
  // Screenshot trigger - placeholder, insert a screenshot file marker
  attachments.value.push({
    name: `截图_${new Date().toLocaleTimeString('zh-CN', {hour: '2-digit', minute: '2-digit'})}.png`,
    type: 'image/png',
    size: 0,
    isScreenshot: true,
  })
}

// Markdown renderer
function renderMarkdown(text) {
  if (!text) return ''
  return text
    .replace(/### (.+)/g, '<h4>$1</h4>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>')
}
</script>

<style scoped>
.chat-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Messages */
.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-row {
  display: flex;
}
.message-user {
  justify-content: flex-end;
}
.message-ai {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 85%;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.6;
}
.bubble-user {
  background: #1677ff;
  color: #fff;
  border-bottom-right-radius: 4px;
}
.bubble-ai {
  background: #f5f6fa;
  color: #1a1a2e;
  border-bottom-left-radius: 4px;
}

.message-content {
  word-break: break-word;
}
.message-content h4 {
  margin: 6px 0 4px;
  font-size: 14px;
}
.message-actions {
  display: flex;
  gap: 6px;
  margin-top: 8px;
  flex-wrap: wrap;
}
.action-btn {
  font-size: 12px;
}
.message-time {
  font-size: 11px;
  color: #bfbfbf;
  margin-top: 4px;
  text-align: right;
}

/* File Preview Bar */
.file-preview-bar {
  display: flex;
  gap: 6px;
  padding: 8px 12px 0;
  flex-wrap: wrap;
}
.file-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #f5f6fa;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 12px;
  color: #595959;
  border: 1px solid #e8e8e8;
}
.file-icon {
  font-size: 14px;
}
.file-name {
  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.file-remove {
  cursor: pointer;
  color: #bfbfbf;
  font-size: 14px;
  line-height: 1;
  margin-left: 2px;
}
.file-remove:hover {
  color: #f5222d;
}

/* Input Area */
.input-area {
  border-top: 1px solid #f0f0f0;
  padding: 8px 12px 10px;
}
.input-wrapper {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 6px 10px;
  transition: border-color 0.15s;
  background: #fff;
}
.input-wrapper:focus-within {
  border-color: #1677ff;
}
.chat-textarea {
  width: 100%;
  border: none;
  outline: none;
  resize: none;
  font-size: 13px;
  line-height: 22px;
  color: #1a1a2e;
  font-family: inherit;
  background: transparent;
  min-height: 34px;
  max-height: 144px;
}
.chat-textarea::placeholder {
  color: #bfbfbf;
}

/* Toolbar */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
}
.toolbar-left {
  display: flex;
  align-items: center;
  gap: 2px;
}
.toolbar-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 4px 6px;
  border-radius: 4px;
  line-height: 1;
  transition: background 0.15s;
}
.toolbar-btn:hover {
  background: #f0f0f0;
}
.upload-label {
  cursor: pointer;
}
.file-input-hidden {
  display: none;
}
.toolbar-right {
  display: flex;
  align-items: center;
}
.send-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  padding: 4px 8px;
  border-radius: 4px;
  line-height: 1;
  opacity: 0.4;
  transition: opacity 0.15s, background 0.15s;
}
.send-btn.send-active {
  opacity: 1;
}
.send-btn:hover {
  background: #f0f0f0;
}
.send-btn:disabled {
  cursor: not-allowed;
  opacity: 0.3;
}
</style>
