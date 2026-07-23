<template>
  <div class="capability-manager">
    <!-- Section 1: MCP 服务 -->
    <div class="section-header">
      <h3 class="section-title">MCP 服务</h3>
      <span v-if="capabilities.mcps?.length" class="section-count">{{ capabilities.mcps.length }} 个服务</span>
    </div>

    <div v-if="capabilities.mcps?.length" class="mcp-grid">
      <div
        v-for="mcp in capabilities.mcps"
        :key="mcp.id"
        class="mcp-card"
      >
        <div class="mcp-card-top">
          <div class="mcp-name-row">
            <span class="mcp-status-dot" :class="'dot-' + mcp.status" :title="statusLabel(mcp.status)"></span>
            <span class="mcp-name">{{ mcp.name }}</span>
          </div>
          <a-tag :color="typeColor(mcp.type)" class="mcp-type-tag">{{ typeLabel(mcp.type) }}</a-tag>
        </div>

        <div class="mcp-meta">
          <div class="mcp-meta-item">
            <span class="mcp-meta-label">Endp.</span>
            <span class="mcp-meta-value" :title="mcp.endpoint">{{ truncate(mcp.endpoint, 36) }}</span>
          </div>
          <div class="mcp-meta-item">
            <span class="mcp-meta-label">最后活跃</span>
            <span class="mcp-meta-value">{{ mcp.lastActive || '--' }}</span>
          </div>
        </div>

        <p v-if="mcp.description" class="mcp-desc">{{ mcp.description }}</p>

        <div class="mcp-card-actions">
          <a-button size="small" class="mcp-test-btn" @click="$emit('action', { type: 'test-connection', mcpId: mcp.id, name: mcp.name })">
            测试连接
          </a-button>
        </div>
      </div>
    </div>

    <a-empty v-else description="暂无 MCP 服务" :image="aEmpty.PRESENTED_IMAGE_SIMPLE" style="margin: 32px 0;" />

    <!-- Section 2: 大模型配置 -->
    <div class="section-header" style="margin-top: 24px;">
      <h3 class="section-title">大模型配置</h3>
    </div>

    <template v-if="hasLLM">
      <div class="llm-card">
        <div class="llm-card-row">
          <div class="llm-name-row">
            <span class="llm-icon">🧠</span>
            <span class="llm-name">{{ capabilities.llm.provider }} / {{ capabilities.llm.model }}</span>
          </div>
          <a-tag v-if="capabilities.llm.status === 'active'" color="green" class="llm-status-badge">已激活</a-tag>
          <a-tag v-else color="default" class="llm-status-badge">{{ capabilities.llm.status || '未知' }}</a-tag>
        </div>

        <div class="llm-details">
          <div class="llm-detail-item">
            <span class="llm-detail-label">Temperature</span>
            <span class="llm-detail-badge">{{ capabilities.llm.temperature ?? '--' }}</span>
          </div>
          <div class="llm-detail-item">
            <span class="llm-detail-label">Max Tokens</span>
            <span class="llm-detail-value">{{ capabilities.llm.maxTokens ?? '--' }}</span>
          </div>
        </div>
      </div>
    </template>

    <a-empty v-else description="暂无大模型配置" :image="aEmpty.PRESENTED_IMAGE_SIMPLE" style="margin: 32px 0;" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Empty as aEmpty } from 'ant-design-vue'

const props = defineProps({
  capabilities: {
    type: Object,
    default: () => ({ mcps: [], llm: {} }),
  },
})

defineEmits(['action'])

const hasLLM = computed(() => {
  return props.capabilities.llm && (props.capabilities.llm.provider || props.capabilities.llm.model)
})

function typeColor(type) {
  return { database: 'cyan', api: 'blue', tool: 'purple' }[type] || 'default'
}

function typeLabel(type) {
  return { database: '数据库', api: 'API', tool: '工具' }[type] || type
}

function statusLabel(status) {
  return { online: '在线', offline: '离线', error: '异常' }[status] || status
}

function truncate(str, max) {
  if (!str) return '--'
  return str.length > max ? str.slice(0, max) + '...' : str
}
</script>

<style scoped>
.capability-manager {
  font-size: 13px;
}

/* Section header */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0;
}
.section-count {
  font-size: 12px;
  color: #8c8c8c;
}

/* MCP Grid */
.mcp-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

/* MCP Card */
.mcp-card {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: box-shadow 0.2s;
}
.mcp-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.mcp-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.mcp-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

/* Status dot */
.mcp-status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dot-online {
  background: #52c41a;
  box-shadow: 0 0 4px rgba(82, 196, 26, 0.4);
}
.dot-offline {
  background: #d9d9d9;
}
.dot-error {
  background: #f5222d;
  box-shadow: 0 0 4px rgba(245, 34, 45, 0.4);
}

.mcp-name {
  font-weight: 600;
  font-size: 14px;
  color: #1a1a2e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mcp-type-tag {
  font-size: 11px;
  flex-shrink: 0;
  line-height: 20px;
}

/* MCP Meta */
.mcp-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.mcp-meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}
.mcp-meta-label {
  color: #8c8c8c;
  flex-shrink: 0;
  min-width: 44px;
}
.mcp-meta-value {
  color: #595959;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mcp-desc {
  margin: 0;
  font-size: 12px;
  color: #bfbfbf;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.mcp-card-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 4px;
}
.mcp-test-btn {
  font-size: 12px;
}

/* LLM Card */
.llm-card {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 16px;
  transition: box-shadow 0.2s;
}
.llm-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.llm-card-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.llm-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
}
.llm-icon {
  font-size: 18px;
  flex-shrink: 0;
}
.llm-name {
  font-weight: 600;
  font-size: 14px;
  color: #1a1a2e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.llm-status-badge {
  flex-shrink: 0;
  font-size: 11px;
}

.llm-details {
  display: flex;
  gap: 24px;
}

.llm-detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.llm-detail-label {
  font-size: 12px;
  color: #8c8c8c;
}
.llm-detail-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 500;
  color: #595959;
  background: #f5f5f5;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 1px 8px;
}
.llm-detail-value {
  font-size: 12px;
  color: #595959;
  font-weight: 500;
}
</style>
