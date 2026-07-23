<template>
  <div class="tool-page">
    <!-- Header -->
    <div class="tool-header">
      <h2 class="tool-title">🔧 能力中心</h2>
      <a-button type="primary" @click="showCreateModal">+ 新建能力</a-button>
    </div>

    <div class="tool-body">
      <!-- Left: Category Tree -->
      <div class="cat-tree">
        <div
          v-for="cat in categories"
          :key="cat.id"
          class="cat-node"
          :class="{ 'cat-active': activeCat === cat.id }"
          @click="activeCat = cat.id"
        >
          <span class="cat-icon">{{ cat.icon }}</span>
          <span class="cat-name">{{ cat.name }}</span>
        </div>
        <div class="cat-search">
          <span class="search-icon">🔍</span>
          <input v-model="searchQuery" type="text" class="search-input" placeholder="搜索能力..." />
        </div>
      </div>

      <!-- Right: Capability Cards -->
      <div class="cap-list">
        <!-- Category section headers -->
        <template v-for="(catCap, cIdx) in groupedCaps" :key="cIdx">
          <div class="cap-section-header">
            <span class="cap-section-icon">{{ catCap.catIcon }}</span>
            <span class="cap-section-name">{{ catCap.catName }}</span>
            <span class="cap-section-count">{{ catCap.items.length }} 项</span>
          </div>

          <div class="cap-grid">
            <div v-for="cap in catCap.items" :key="cap.id" class="cap-card" :class="'cap-type-' + cap.type">
              <!-- Top: name + status -->
              <div class="cap-card-top">
                <div class="cap-name-row">
                  <span class="cap-icon">{{ cap.icon }}</span>
                  <span class="cap-name">{{ cap.name }}</span>
                </div>
                <a-tag :color="cap.status === 'enabled' ? 'green' : 'default'" size="small">
                  {{ cap.status === 'enabled' ? '🟢 已启用' : '🟡 已禁用' }}
                </a-tag>
              </div>

              <!-- Description -->
              <div class="cap-desc">{{ cap.description }}</div>

              <!-- MCP specific -->
              <div v-if="cap.type === 'connection'" class="cap-meta">
                <div class="meta-row"><span class="meta-label">Endp.</span><span class="meta-value mono">{{ cap.endpoint }}</span></div>
                <div class="meta-row"><span class="meta-label">状态</span><span class="meta-value" :class="cap.connectionStatus === 'connected' ? 'text-green' : 'text-red'">{{ cap.connectionStatus === 'connected' ? '✅ 已连接' : '❌ 断开' }}</span></div>
                <div class="meta-row"><span class="meta-label">活跃</span><span class="meta-value">{{ cap.lastActive }}</span></div>
              </div>

              <!-- Model specific -->
              <div v-if="cap.type === 'model'" class="cap-meta">
                <div class="meta-row"><span class="meta-label">供应商</span><span class="meta-value">{{ cap.modelProvider }}</span></div>
                <div class="meta-row"><span class="meta-label">版本</span><span class="meta-value">{{ cap.modelVersion }}</span></div>
                <div class="meta-row"><span class="meta-label">温度</span><span class="meta-value">{{ cap.temperature }}</span></div>
              </div>

              <!-- Channel specific -->
              <div v-if="cap.type === 'channel'" class="cap-meta">
                <div class="meta-row"><span class="meta-label">渠道</span><span class="meta-value">{{ channelLabel(cap.channelType) }}</span></div>
                <div class="meta-row">
                  <span class="meta-label">配置</span>
                  <span class="meta-value" :class="cap.channelConfig?.status === 'configured' ? 'text-green' : 'text-orange'">
                    {{ cap.channelConfig?.status === 'configured' ? '✅ 已配置' : '🟡 未配置' }}
                  </span>
                </div>
              </div>

              <!-- Bound agents -->
              <div class="cap-bound">
                <template v-if="cap.boundAgents?.length">
                  <span class="bound-label">绑定:</span>
                  <span v-for="aid in cap.boundAgents" :key="aid" class="bound-agent-tag">{{ agentName(aid) }}</span>
                </template>
                <span v-else class="bound-none">未绑定</span>
              </div>

              <!-- Actions -->
              <div class="cap-actions">
                <a-button size="small" @click="editCapability(cap)">📝 编辑</a-button>
                <a-button v-if="cap.type === 'connection'" size="small" class="btn-test" @click="testConnection(cap)">🔗 测试连接</a-button>
                <a-button v-if="cap.type === 'channel' && cap.channelConfig?.status !== 'configured'" size="small" class="btn-config" @click="configureChannel(cap)">⚙️ 配置</a-button>
                <a-button size="small" :type="cap.status === 'enabled' ? 'default' : 'primary'" @click="toggleCapability(cap)">
                  {{ cap.status === 'enabled' ? '⏸ 禁用' : '▶ 启用' }}
                </a-button>
              </div>
            </div>
          </div>
        </template>

        <!-- Empty state -->
        <a-empty v-if="!groupedCaps.length" description="未找到匹配的能力" :image="aEmpty.PRESENTED_IMAGE_SIMPLE" style="margin: 60px 0;" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Empty as aEmpty } from 'ant-design-vue'
import { capabilityCategories, capabilities } from '../mockData.js'

const categories = capabilityCategories
const allCaps = capabilities
const activeCat = ref('all')
const searchQuery = ref('')

const filteredCaps = computed(() => {
  let list = activeCat.value === 'all'
    ? allCaps
    : allCaps.filter(c => c.category === activeCat.value)
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(c => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q))
  }
  return list
})

const groupedCaps = computed(() => {
  const groups = []
  for (const cat of categories) {
    if (cat.id === 'all') continue
    const items = filteredCaps.value.filter(c => c.category === cat.id)
    if (items.length) {
      groups.push({ catId: cat.id, catName: cat.name, catIcon: cat.icon, items })
    }
  }
  return groups
})

function agentName(id) {
  const map = { 'agent-assistant': '杨姐的助理', 'agent-certify': '认证专员', 'agent-risk': '预警官', 'agent-declare': '申报管家', 'agent-compliance': '合规师' }
  return map[id] || id
}

function channelLabel(type) {
  return { feishu: '飞书', dingtalk: '钉钉', wecom: '企微', sms: '短信' }[type] || type
}

function showCreateModal() {
  // Phase 2: implement modal
}

function editCapability(cap) {
  // Phase 2: implement edit modal
}

function testConnection(cap) {
  alert(`测试连接: ${cap.name}\nEndpoint: ${cap.endpoint}`)
}

function configureChannel(cap) {
  alert(`配置通道: ${cap.name}`)
}

function toggleCapability(cap) {
  cap.status = cap.status === 'enabled' ? 'disabled' : 'enabled'
}
</script>

<style scoped>
.tool-page { padding: 24px; height: 100%; display: flex; flex-direction: column; }
.tool-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-shrink: 0; }
.tool-title { font-size: 18px; font-weight: 600; margin: 0; }
.tool-body { display: flex; gap: 20px; flex: 1; min-height: 0; }

/* Left: Category Tree */
.cat-tree { width: 180px; flex-shrink: 0; display: flex; flex-direction: column; gap: 2px; }
.cat-node { display: flex; align-items: center; gap: 8px; padding: 9px 12px; border-radius: 6px; cursor: pointer; transition: all 0.15s; color: #595959; font-size: 13px; }
.cat-node:hover { background: #f5f6fa; color: #1a1a2e; }
.cat-active { background: #f0f5ff !important; color: #1677ff !important; font-weight: 500; }
.cat-icon { font-size: 15px; width: 20px; text-align: center; }
.cat-search { margin-top: 16px; display: flex; align-items: center; gap: 6px; padding: 6px 10px; border: 1px solid #e8e8e8; border-radius: 6px; }
.search-icon { font-size: 13px; }
.search-input { border: none; outline: none; flex: 1; font-size: 12px; background: transparent; }
.search-input::placeholder { color: #bfbfbf; }

/* Right: Capability List */
.cap-list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; }
.cap-section-header { display: flex; align-items: center; gap: 8px; padding: 8px 0; font-size: 13px; font-weight: 600; color: #1a1a2e; border-bottom: 1px solid #f0f0f0; }
.cap-section-count { font-size: 12px; color: #bfbfbf; font-weight: 400; margin-left: auto; }
.cap-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 10px; margin-bottom: 8px; }

/* Card */
.cap-card { background: #fff; border: 1px solid #e8e8e8; border-radius: 8px; padding: 14px; display: flex; flex-direction: column; gap: 8px; transition: box-shadow 0.2s; }
.cap-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.cap-type-connection { border-left: 3px solid #1677ff; }
.cap-type-model { border-left: 3px solid #722ed1; }
.cap-type-channel { border-left: 3px solid #13c2c2; }

.cap-card-top { display: flex; justify-content: space-between; align-items: flex-start; }
.cap-name-row { display: flex; align-items: center; gap: 6px; }
.cap-icon { font-size: 16px; }
.cap-name { font-size: 14px; font-weight: 600; color: #1a1a2e; }
.cap-desc { font-size: 12px; color: #8c8c8c; line-height: 1.4; }
.cap-meta { display: flex; flex-direction: column; gap: 3px; background: #fafafa; padding: 8px 10px; border-radius: 4px; }
.meta-row { display: flex; align-items: center; gap: 8px; font-size: 12px; }
.meta-label { color: #8c8c8c; width: 48px; flex-shrink: 0; }
.meta-value { color: #595959; }
.mono { font-family: 'SFMono-Regular', Consolas, monospace; font-size: 11px; word-break: break-all; }
.text-green { color: #52c41a; }
.text-red { color: #f5222d; }
.text-orange { color: #fa8c16; }
.cap-bound { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; font-size: 12px; }
.bound-label { color: #8c8c8c; }
.bound-agent-tag { display: inline-block; background: #f0f5ff; color: #1677ff; padding: 1px 6px; border-radius: 3px; font-size: 11px; }
.bound-none { color: #d9d9d9; font-size: 12px; }
.cap-actions { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 2px; }
.btn-test { border-color: #1677ff; color: #1677ff; }
.btn-config { border-color: #13c2c2; color: #13c2c2; }
</style>
