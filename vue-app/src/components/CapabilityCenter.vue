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
        <div v-for="cat in categories" :key="cat.id" class="cat-node" :class="{ 'cat-active': activeCat === cat.id }" @click="activeCat = cat.id">
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
        <template v-for="(catCap, cIdx) in groupedCaps" :key="cIdx">
          <div class="cap-section-header">
            <span class="cap-section-icon">{{ catCap.catIcon }}</span>
            <span class="cap-section-name">{{ catCap.catName }}</span>
            <span class="cap-section-count">{{ catCap.items.length }} 项</span>
          </div>
          <div class="cap-grid">
            <div v-for="cap in catCap.items" :key="cap.id" class="cap-card" :class="'cap-type-' + cap.type">
              <div class="cap-card-top">
                <div class="cap-name-row">
                  <span class="cap-icon">{{ cap.icon }}</span>
                  <span class="cap-name">{{ cap.name }}</span>
                </div>
                <a-tag :color="cap.status === 'enabled' ? 'green' : 'default'" size="small">
                  {{ cap.status === 'enabled' ? '🟢 已启用' : '🟡 已禁用' }}
                </a-tag>
              </div>
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
                  <span class="meta-value" :class="cap.channelConfig?.status === 'configured' ? 'text-green' : 'text-orange'">{{ cap.channelConfig?.status === 'configured' ? '✅ 已配置' : '🟡 未配置' }}</span>
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
                <a-button v-if="cap.type === 'connection'" size="small" class="btn-test" :loading="testingId === cap.id" @click="testConnection(cap)">🔗 测试连接</a-button>
                <a-button v-if="cap.type === 'channel' && cap.channelConfig?.status !== 'configured'" size="small" class="btn-config" @click="configureChannel(cap)">⚙️ 配置</a-button>
                <a-button size="small" :type="cap.status === 'enabled' ? 'default' : 'primary'" @click="toggleCapability(cap)">
                  {{ cap.status === 'enabled' ? '⏸ 禁用' : '▶ 启用' }}
                </a-button>
              </div>
            </div>
          </div>
        </template>
        <a-empty v-if="!groupedCaps.length" description="未找到匹配的能力" :image="aEmpty.PRESENTED_IMAGE_SIMPLE" style="margin: 60px 0;" />
      </div>
    </div>

    <!-- New/Edit Capability Modal -->
    <a-modal v-model:open="modalOpen" :title="isEditing ? '📝 编辑能力' : '🔧 新建能力'" @ok="saveCapability" @cancel="modalOpen = false" width="600px" ok-text="💾 保存" cancel-text="取消">
      <a-form :model="form" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="16">
            <a-form-item label="能力名称"><a-input v-model:value="form.name" placeholder="如：乐企直连" /></a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="能力分类">
              <a-select v-model:value="form.category">
                <a-select-option value="mcp">🔌 MCP服务</a-select-option>
                <a-select-option value="model">🤖 大模型</a-select-option>
                <a-select-option value="channel">💬 聊天通道</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="能力描述"><a-textarea v-model:value="form.description" rows="2" placeholder="能力概述..." /></a-form-item>

        <!-- MCP specific fields -->
        <template v-if="form.category === 'mcp'">
          <a-form-item label="Endpoint 地址"><a-input v-model:value="form.endpoint" placeholder="https://..." /></a-form-item>
        </template>

        <!-- Model specific fields -->
        <template v-if="form.category === 'model'">
          <a-row :gutter="16">
            <a-col :span="12"><a-form-item label="供应商"><a-input v-model:value="form.modelProvider" placeholder="Anthropic / OpenAI / 阿里云" /></a-form-item></a-col>
            <a-col :span="12"><a-form-item label="版本"><a-input v-model:value="form.modelVersion" placeholder="claude-4 / gpt-4o" /></a-form-item></a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="12"><a-form-item label="温度 (Temperature)"><a-input-number v-model:value="form.temperature" :min="0" :max="2" :step="0.1" style="width:100%" /></a-form-item></a-col>
            <a-col :span="12"><a-form-item label="最大 Token"><a-input-number v-model:value="form.maxTokens" :min="512" :step="1024" style="width:100%" /></a-form-item></a-col>
          </a-row>
        </template>

        <!-- Channel specific fields -->
        <template v-if="form.category === 'channel'">
          <a-form-item label="渠道类型">
            <a-select v-model:value="form.channelType">
              <a-select-option value="feishu">飞书</a-select-option>
              <a-select-option value="dingtalk">钉钉</a-select-option>
              <a-select-option value="wecom">企业微信</a-select-option>
              <a-select-option value="sms">短信</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="Webhook 地址"><a-input v-model:value="form.webhook" placeholder="https://open.feishu.cn/..." /></a-form-item>
        </template>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { Empty as aEmpty, message } from 'ant-design-vue'
import { capabilityCategories, capabilities } from '../mockData.js'

const categories = capabilityCategories
const allCaps = capabilities
const activeCat = ref('mcp')
const searchQuery = ref('')
const modalOpen = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const testingId = ref(null)

const form = reactive({
  name: '', category: 'mcp', description: '',
  endpoint: '', modelProvider: '', modelVersion: '', temperature: 0.3, maxTokens: 4096,
  channelType: 'feishu', webhook: '', icon: '🔌',
})

const filteredCaps = computed(() => {
  let list = allCaps.filter(c => c.category === activeCat.value)
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(c => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q))
  }
  return list
})

const groupedCaps = computed(() => {
  const groups = []
  for (const cat of categories) {
    const items = filteredCaps.value.filter(c => c.category === cat.id)
    if (items.length) groups.push({ catId: cat.id, catName: cat.name, catIcon: cat.icon, items })
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

function resetForm() {
  form.name = ''; form.category = 'mcp'; form.description = ''
  form.endpoint = ''; form.modelProvider = ''; form.modelVersion = ''; form.temperature = 0.3; form.maxTokens = 4096
  form.channelType = 'feishu'; form.webhook = ''; form.icon = '🔌'
}

function showCreateModal() {
  isEditing.value = false; editingId.value = null; resetForm(); modalOpen.value = true
}

function editCapability(cap) {
  isEditing.value = true; editingId.value = cap.id
  form.name = cap.name; form.category = cap.category; form.description = cap.description
  form.endpoint = cap.endpoint || ''; form.modelProvider = cap.modelProvider || ''; form.modelVersion = cap.modelVersion || ''
  form.temperature = cap.temperature ?? 0.3; form.maxTokens = cap.maxTokens ?? 4096
  form.channelType = cap.channelType || 'feishu'; form.webhook = cap.channelConfig?.webhook || ''
  form.icon = { mcp: '🔌', model: '🤖', channel: '💬' }[cap.category] || '🔌'
  modalOpen.value = true
}

function saveCapability() {
  if (isEditing.value && editingId.value) {
    const cap = allCaps.find(c => c.id === editingId.value)
    if (cap) {
      cap.name = form.name; cap.description = form.description
      if (cap.type === 'connection') cap.endpoint = form.endpoint
      if (cap.type === 'model') { cap.modelProvider = form.modelProvider; cap.modelVersion = form.modelVersion; cap.temperature = form.temperature; cap.maxTokens = form.maxTokens }
      if (cap.type === 'channel') { cap.channelType = form.channelType; cap.channelConfig = { ...cap.channelConfig, webhook: form.webhook } }
    }
  } else {
    const id = 'cap-' + Date.now()
    const newCap = {
      id, name: form.name, category: form.category, icon: form.icon,
      status: 'enabled', description: form.description, boundAgents: [],
      type: { mcp: 'connection', model: 'model', channel: 'channel' }[form.category],
    }
    if (form.category === 'mcp') newCap.endpoint = form.endpoint; newCap.lastActive = '刚刚'; newCap.connectionStatus = 'connected'
    if (form.category === 'model') { newCap.modelProvider = form.modelProvider; newCap.modelVersion = form.modelVersion; newCap.temperature = form.temperature; newCap.maxTokens = form.maxTokens }
    if (form.category === 'channel') { newCap.channelType = form.channelType; newCap.channelConfig = { webhook: form.webhook, status: form.webhook ? 'configured' : 'unconfigured' } }
    allCaps.push(newCap)
  }
  modalOpen.value = false
}

async function testConnection(cap) {
  testingId.value = cap.id
  message.loading({ content: `正在测试 ${cap.name}...`, key: 'test-' + cap.id, duration: 0 })
  await new Promise(r => setTimeout(r, 1500))
  cap.connectionStatus = Math.random() > 0.2 ? 'connected' : 'disconnected'
  cap.lastActive = '刚刚'
  message.success({ content: cap.connectionStatus === 'connected' ? `✅ ${cap.name} 连接成功` : `❌ ${cap.name} 连接失败`, key: 'test-' + cap.id, duration: 3 })
  testingId.value = null
}

function configureChannel(cap) {
  cap.channelConfig = { webhook: 'https://open.feishu.cn/...', secret: '***', status: 'configured' }
  message.success(`✅ ${cap.name} 配置已保存`)
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
.cat-tree { width: 180px; flex-shrink: 0; display: flex; flex-direction: column; gap: 2px; }
.cat-node { display: flex; align-items: center; gap: 8px; padding: 9px 12px; border-radius: 6px; cursor: pointer; transition: all 0.15s; color: #595959; font-size: 13px; }
.cat-node:hover { background: #f5f6fa; color: #1a1a2e; }
.cat-active { background: #f0f5ff !important; color: #1677ff !important; font-weight: 500; }
.cat-icon { font-size: 15px; width: 20px; text-align: center; }
.cat-search { margin-top: 16px; display: flex; align-items: center; gap: 6px; padding: 6px 10px; border: 1px solid #e8e8e8; border-radius: 6px; }
.search-icon { font-size: 13px; }
.search-input { border: none; outline: none; flex: 1; font-size: 12px; background: transparent; }
.search-input::placeholder { color: #bfbfbf; }
.cap-list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; }
.cap-section-header { display: flex; align-items: center; gap: 8px; padding: 8px 0; font-size: 13px; font-weight: 600; color: #1a1a2e; border-bottom: 1px solid #f0f0f0; }
.cap-section-count { font-size: 12px; color: #bfbfbf; font-weight: 400; margin-left: auto; }
.cap-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 10px; margin-bottom: 8px; }
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
