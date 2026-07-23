<template>
  <div class="tool-page">
    <div class="tool-header">
      <h2 class="tool-title">🤖 智能体管理</h2>
      <a-button type="primary">+ 新建智能体</a-button>
    </div>

    <div class="tool-body">
      <div class="agent-search-bar">
        <span class="search-icon">🔍</span>
        <input v-model="searchQuery" type="text" class="search-input" placeholder="搜索智能体名称..." />
      </div>

      <div class="agent-list">
        <div v-for="agent in filteredAgents" :key="agent.id" class="agent-card">
          <div class="agent-card-left">
            <span class="agent-avatar">{{ agent.icon }}</span>
          </div>
          <div class="agent-card-body">
            <div class="agent-name-row">
              <span class="agent-name">{{ agent.name }}</span>
              <span class="agent-status" :class="'status-' + agent.status">
                {{ agent.status === 'online' ? '🟢 在线' : agent.status === 'paused' ? '⏸️ 已暂停' : '🔴 离线' }}
              </span>
            </div>
            <div class="agent-desc">{{ agent.description }}</div>
            <div class="agent-meta">
              <span>能力: {{ agent.capabilities?.length || 0 }}个</span>
              <span>知识库: {{ agent.knowledgeBases?.length || 0 }}个</span>
              <span>模型: {{ agent.model }}</span>
            </div>
            <div class="agent-stats">
              <span>最近活跃: {{ formatTime(agent.stats?.lastActiveAt) }}</span>
              <span>总对话: {{ agent.stats?.totalConversations || 0 }}次</span>
            </div>
          </div>
          <div class="agent-card-actions">
            <a-button size="small">📝 编辑</a-button>
            <a-button size="small" :type="agent.status === 'paused' ? 'primary' : 'default'">
              {{ agent.status === 'paused' ? '▶ 恢复' : '⏸ 暂停' }}
            </a-button>
            <a-button size="small" danger>🗑 删除</a-button>
            <a-button size="small" type="primary" ghost>💬 去对话</a-button>
          </div>
        </div>
      </div>

      <div class="agent-footer">共 {{ filteredAgents.length }} 个智能体</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { managedAgents } from '../mockData.js'

const searchQuery = ref('')

const filteredAgents = computed(() => {
  if (!searchQuery.value) return managedAgents
  const q = searchQuery.value.toLowerCase()
  return managedAgents.filter(a => a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q))
})

function formatTime(iso) {
  if (!iso) return '--'
  const d = new Date(iso)
  const now = new Date()
  const diff = (now - d) / 1000 / 60
  if (diff < 1) return '刚刚'
  if (diff < 60) return Math.floor(diff) + '分钟前'
  if (diff < 1440) return Math.floor(diff / 60) + '小时前'
  return d.toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.tool-page { padding: 24px; height: 100%; display: flex; flex-direction: column; }
.tool-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-shrink: 0; }
.tool-title { font-size: 18px; font-weight: 600; margin: 0; }
.tool-body { flex: 1; min-height: 0; display: flex; flex-direction: column; overflow-y: auto; }

.agent-search-bar { display: flex; align-items: center; gap: 6px; padding: 8px 12px; border: 1px solid #e8e8e8; border-radius: 6px; margin-bottom: 16px; max-width: 320px; background: #fff; }
.agent-search-bar .search-icon { font-size: 14px; }
.agent-search-bar .search-input { border: none; outline: none; flex: 1; font-size: 13px; }
.agent-search-bar .search-input::placeholder { color: #bfbfbf; }

.agent-list { display: flex; flex-direction: column; gap: 10px; }
.agent-card { display: flex; gap: 14px; padding: 16px; background: #fff; border: 1px solid #e8e8e8; border-radius: 8px; transition: box-shadow 0.2s; }
.agent-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.agent-card-left { display: flex; align-items: flex-start; padding-top: 2px; }
.agent-avatar { font-size: 28px; }
.agent-card-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.agent-name-row { display: flex; align-items: center; gap: 8px; }
.agent-name { font-size: 15px; font-weight: 600; color: #1a1a2e; }
.agent-status { font-size: 12px; }
.status-online { color: #52c41a; }
.status-paused { color: #fa8c16; }
.agent-desc { font-size: 13px; color: #8c8c8c; }
.agent-meta { display: flex; gap: 16px; font-size: 12px; color: #8c8c8c; }
.agent-stats { font-size: 12px; color: #bfbfbf; display: flex; gap: 16px; }
.agent-card-actions { display: flex; flex-direction: column; gap: 6px; flex-shrink: 0; }
.agent-footer { padding: 12px 0; font-size: 12px; color: #bfbfbf; }
</style>
