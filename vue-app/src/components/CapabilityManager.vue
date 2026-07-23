<template>
  <div class="capability-manager">
    <!-- Section 1: 已绑定能力 -->
    <div class="section-header">
      <h3 class="section-title">🔌 已绑定能力</h3>
      <span v-if="boundCapabilities.length" class="section-count">{{ boundCapabilities.length }} 个</span>
    </div>

    <div v-if="boundCapabilities.length" class="cap-grid">
      <div v-for="cap in boundCapabilities" :key="cap.id" class="cap-card">
        <div class="cap-card-top">
          <div class="cap-name-row">
            <span class="cap-icon">{{ cap.icon || '🔌' }}</span>
            <span class="cap-name">{{ cap.name }}</span>
            <span class="cap-type-tag" :class="'type-' + cap.category">{{ cap.category === 'mcp' ? 'MCP' : cap.category === 'model' ? '模型' : '通道' }}</span>
          </div>
        </div>
        <p class="cap-desc">{{ cap.description }}</p>
        <div class="cap-meta-row">
          <span v-if="cap.endpoint" class="cap-endpoint">🔗 {{ truncate(cap.endpoint, 30) }}</span>
          <span v-else-if="cap.modelVersion" class="cap-model">🧠 {{ cap.modelVersion }}</span>
          <span v-if="cap.lastActive" class="cap-active">⏱ {{ cap.lastActive }}</span>
        </div>
        <div class="cap-card-actions">
          <a-tag v-if="cap.connectionStatus === 'connected'" color="green">🟢 已连接</a-tag>
          <a-tag v-else-if="cap.connectionStatus === 'disconnected'" color="default">🔴 未连接</a-tag>
          <a-button v-if="cap.type === 'connection'" size="small" class="cap-test-btn" @click="testConnection(cap)" :loading="testingId === cap.id">测试连接</a-button>
        </div>
      </div>
    </div>
    <a-empty v-else description="暂未绑定能力，请到能力中心配置" :image="aEmpty.PRESENTED_IMAGE_SIMPLE" style="margin: 24px 0;" />

    <!-- Section 2: 大模型配置 -->
    <div class="section-header" style="margin-top: 20px;">
      <h3 class="section-title">🧠 大模型配置</h3>
    </div>

    <template v-if="currentLLM">
      <div class="llm-card">
        <div class="llm-card-row">
          <div class="llm-name-row">
            <span class="llm-icon">🤖</span>
            <span class="llm-name">{{ currentLLM.name || (currentLLM.provider + ' / ' + currentLLM.model) }}</span>
          </div>
          <a-tag color="green">已激活</a-tag>
        </div>
        <div class="llm-details">
          <div class="llm-detail-item"><span class="llm-detail-label">供应商</span><span class="llm-detail-badge">{{ currentLLM.modelProvider || currentLLM.provider }}</span></div>
          <div class="llm-detail-item"><span class="llm-detail-label">模型</span><span class="llm-detail-value">{{ currentLLM.modelVersion || currentLLM.model }}</span></div>
          <div class="llm-detail-item"><span class="llm-detail-label">Temperature</span><span class="llm-detail-badge">{{ currentLLM.temperature ?? '--' }}</span></div>
          <div class="llm-detail-item"><span class="llm-detail-label">Max Tokens</span><span class="llm-detail-value">{{ currentLLM.maxTokens ?? '--' }}</span></div>
        </div>
      </div>
    </template>
    <a-empty v-else description="未配置大模型" :image="aEmpty.PRESENTED_IMAGE_SIMPLE" style="margin: 24px 0;" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Empty as aEmpty, message } from 'ant-design-vue'
import { capabilities, agentCapabilities } from '../mockData.js'

const props = defineProps({ capabilities: { type: Object, default: () => ({ mcps: [], llm: {} }) }, agentId: { type: String } })
const emit = defineEmits(['action'])
const testingId = ref(null)

// Resolve bound capabilities from full capability list
const agentCapIds = computed(() => {
  if (props.agentId && agentCapabilities[props.agentId]) {
    const ac = agentCapabilities[props.agentId]
    return ac.mcps?.map(m => m.id) || []
  }
  return []
})

const boundCapabilities = computed(() => {
  const ids = agentCapIds.value
  if (!ids.length) return props.capabilities.mcps || []
  return capabilities.filter(c => ids.includes(c.id))
})

const currentLLM = computed(() => {
  if (props.capabilities.llm?.provider) return props.capabilities.llm
  if (props.agentId && agentCapabilities[props.agentId]?.llm) return agentCapabilities[props.agentId].llm
  const llm = capabilities.find(c => c.category === 'model' && c.status === 'enabled')
  return llm || null
})

async function testConnection(cap) {
  testingId.value = cap.id
  message.loading({ content: `正在测试 ${cap.name}...`, key: 'test-' + cap.id, duration: 0 })
  await new Promise(r => setTimeout(r, 1500))
  cap.connectionStatus = Math.random() > 0.2 ? 'connected' : 'disconnected'
  message.success({ content: cap.connectionStatus === 'connected' ? `✅ ${cap.name} 连接成功` : `❌ ${cap.name} 连接失败`, key: 'test-' + cap.id, duration: 3 })
  testingId.value = null
}

function truncate(str, max) { return str?.length > max ? str.slice(0, max) + '...' : str || '--' }
</script>

<style scoped>
.capability-manager { font-size: 13px; }
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.section-title { font-size: 15px; font-weight: 600; color: #1a1a2e; margin: 0; }
.section-count { font-size: 12px; color: #8c8c8c; }
.cap-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.cap-card { background: #fff; border: 1px solid #e8e8e8; border-radius: 8px; padding: 14px 16px; display: flex; flex-direction: column; gap: 8px; transition: box-shadow 0.2s; }
.cap-card:hover { box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); }
.cap-card-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.cap-name-row { display: flex; align-items: center; gap: 8px; min-width: 0; flex: 1; }
.cap-icon { font-size: 18px; flex-shrink: 0; }
.cap-name { font-weight: 600; font-size: 14px; color: #1a1a2e; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cap-type-tag { font-size: 10px; padding: 1px 6px; border-radius: 3px; font-weight: 500; flex-shrink: 0; }
.type-mcp { background: #e6f4ff; color: #1677ff; }
.type-model { background: #f6ffed; color: #52c41a; }
.type-channel { background: #fff7e6; color: #fa8c16; }
.cap-desc { margin: 0; font-size: 12px; color: #bfbfbf; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.cap-meta-row { display: flex; flex-wrap: wrap; gap: 8px; font-size: 11px; color: #8c8c8c; }
.cap-endpoint { color: #595959; }
.cap-active { color: #bfbfbf; }
.cap-card-actions { display: flex; align-items: center; gap: 8px; justify-content: flex-end; padding-top: 4px; }
.cap-test-btn { font-size: 12px; }

.llm-card { background: #fff; border: 1px solid #e8e8e8; border-radius: 8px; padding: 16px; transition: box-shadow 0.2s; }
.llm-card:hover { box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); }
.llm-card-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
.llm-name-row { display: flex; align-items: center; gap: 8px; min-width: 0; flex: 1; }
.llm-icon { font-size: 18px; flex-shrink: 0; }
.llm-name { font-weight: 600; font-size: 14px; color: #1a1a2e; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.llm-details { display: flex; flex-wrap: wrap; gap: 16px; }
.llm-detail-item { display: flex; align-items: center; gap: 6px; }
.llm-detail-label { font-size: 12px; color: #8c8c8c; }
.llm-detail-badge { display: inline-block; font-size: 11px; font-weight: 500; color: #595959; background: #f5f5f5; border: 1px solid #e8e8e8; border-radius: 4px; padding: 1px 8px; }
.llm-detail-value { font-size: 12px; color: #595959; font-weight: 500; }
</style>
