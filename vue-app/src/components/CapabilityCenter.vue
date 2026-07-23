<template>
  <div>
    <!-- 面包屑 + 动作栏 -->
    <div class="page-header">
      <div>
        <h2 class="page-title">🔧 能力中心</h2>
        <p class="page-subtitle">管理智能体的各项能力，配置执行流程和触发方式</p>
      </div>
      <a-button type="primary" @click="showCreateModal">+ 新建能力</a-button>
    </div>

    <!-- 分类标签 -->
    <div class="cat-tabs">
      <a-tag
        v-for="cat in categories"
        :key="cat.id"
        :color="activeCat === cat.name ? 'blue' : 'default'"
        :class="{ 'cat-tag-active': activeCat === cat.name }"
        style="cursor: pointer; margin-bottom: 4px;"
        @click="activeCat = cat.name"
      >
        {{ cat.icon }} {{ cat.name }}
      </a-tag>
    </div>

    <!-- 能力表格 -->
    <a-card :loading="loading" :body-style="{ padding: '12px' }">
      <a-table
        :dataSource="filteredCapabilities"
        :columns="columns"
        :pagination="false"
        :scroll="{ x: 700 }"
        rowKey="id"
        size="small"
      >
        <template #bodyCell="{ column, record }">
          <!-- 名称列 -->
          <template v-if="column.key === 'name'">
            <span style="font-weight: 500; font-size: 13px;">{{ record.icon }} {{ record.name }}</span>
          </template>
          <!-- 类型列 -->
          <template v-else-if="column.key === 'type'">
            <a-tag :color="typeColor(record.type)" style="font-size: 11px;">
              {{ typeLabel(record.type) }}
            </a-tag>
          </template>
          <!-- 状态列 -->
          <template v-else-if="column.key === 'status'">
            <a-badge :status="record.status === 'enabled' ? 'success' : 'default'" :text="record.status === 'enabled' ? '已启用' : '已禁用'" />
          </template>
          <!-- 绑定智能体列 -->
          <template v-else-if="column.key === 'bound'">
            <a-tag v-if="record.boundAgents?.length" color="blue" style="font-size: 11px;">
              被 {{ record.boundAgents.length }} 个智能体使用
            </a-tag>
            <span v-else style="color: #bfbfbf; font-size: 12px;">未绑定</span>
          </template>
          <!-- 操作列 -->
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a @click="editCapability(record)">📝 编辑</a>
              <a-popconfirm
                title="确认删除此能力？"
                @confirm="deleteCapability(record.id)"
              >
                <a style="color: #ff4d4f;">🗑 删除</a>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 新建/编辑对话框 -->
    <a-modal
      v-model:open="modalOpen"
      :title="isEditing ? '编辑能力' : '新建能力'"
      :confirm-loading="saving"
      @ok="saveCapability"
      @cancel="modalOpen = false"
      width="600px"
      ok-text="💾 保存"
      cancel-text="取消"
    >
      <a-form :model="formData" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="16">
            <a-form-item label="能力名称">
              <a-input v-model:value="formData.name" placeholder="如：发票合规检查" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="执行类型">
              <a-select v-model:value="formData.type">
                <a-select-option value="auto">⚡ 自动执行</a-select-option>
                <a-select-option value="ai_assisted">🧠 AI辅助</a-select-option>
                <a-select-option value="manual">👤 人工确认</a-select-option>
                <a-select-option value="connection">🔗 连接</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="能力描述">
          <a-textarea v-model:value="formData.description" rows="2" placeholder="能力概述..." />
        </a-form-item>
        <a-form-item label="执行步骤">
          <div v-for="(step, i) in formData.steps" :key="i" style="display: flex; gap: 8px; margin-bottom: 6px;">
            <a-input v-model:value="step.name" placeholder="步骤名称" style="flex: 2;" />
            <a-input v-model:value="step.skill" placeholder="选择Skill..." style="flex: 3;" />
            <a-button type="text" danger @click="formData.steps.splice(i, 1)">✕</a-button>
          </div>
          <a-button type="dashed" block @click="formData.steps.push({ name:'', skill:'' })" style="margin-top: 4px;">
            + 添加步骤
          </a-button>
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="触发方式">
              <a-select v-model:value="formData.trigger">
                <a-select-option value="manual">手动</a-select-option>
                <a-select-option value="scheduled">定时</a-select-option>
                <a-select-option value="event">事件触发</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="输出格式">
              <a-select v-model:value="formData.outputFormat">
                <a-select-option value="text">文本</a-select-option>
                <a-select-option value="json">JSON</a-select-option>
                <a-select-option value="table">表格</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const loading = ref(false)
const capabilities = ref([])
const categories = ref([])
const activeCat = ref('全部能力')
const modalOpen = ref(false)
const saving = ref(false)
const isEditing = ref(false)
const editingId = ref(null)

const formData = ref({
  name: '', type: 'ai_assisted', description: '', steps: [],
  trigger: 'manual', outputFormat: 'json',
})

const columns = [
  { title: '能力名称', dataIndex: 'name', key: 'name', width: 200 },
  { title: '类型', dataIndex: 'type', key: 'type', width: 120 },
  { title: '描述', dataIndex: 'description', key: 'desc', ellipsis: true },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '绑定', key: 'bound', width: 150 },
  { title: '操作', key: 'action', width: 150 },
]

const filteredCapabilities = computed(() => {
  return activeCat.value === '全部能力'
    ? capabilities.value
    : capabilities.value.filter(c => c.category === activeCat.value)
})

function typeColor(type) {
  return { auto: 'blue', ai_assisted: 'purple', manual: 'orange', connection: 'cyan' }[type] || 'default'
}
function typeLabel(type) {
  return { auto: '⚡自动执行', ai_assisted: '🧠AI辅助', manual: '👤人工确认', connection: '🔗连接' }[type] || type
}

async function loadCapabilities() {
  loading.value = true
  try {
    const res = await axios.get('/api/capabilities')
    capabilities.value = res.data
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

async function loadCategories() {
  try {
    const res = await axios.get('/api/cap-categories')
    categories.value = res.data
  } catch (e) { console.error(e) }
}

function showCreateModal() {
  isEditing.value = false
  editingId.value = null
  formData.value = { name: '', type: 'ai_assisted', description: '', steps: [], trigger: 'manual', outputFormat: 'json' }
  modalOpen.value = true
}

function editCapability(cap) {
  isEditing.value = true
  editingId.value = cap.id
  formData.value = {
    name: cap.name, type: cap.type, description: cap.description,
    steps: cap.steps?.map(s => ({ ...s })) || [],
    trigger: cap.trigger, outputFormat: cap.outputFormat,
  }
  modalOpen.value = true
}

async function saveCapability() {
  saving.value = true
  try {
    const payload = { ...formData.value, category: '全部能力' }
    if (isEditing.value && editingId.value) {
      await axios.put(`/api/capabilities/${editingId.value}`, payload)
    } else {
      await axios.post('/api/capabilities', payload)
    }
    modalOpen.value = false
    await loadCapabilities()
  } catch (e) { console.error(e) }
  finally { saving.value = false }
}

async function deleteCapability(id) {
  try {
    await axios.delete(`/api/capabilities/${id}`)
    await loadCapabilities()
  } catch (e) { console.error(e) }
}

onMounted(() => {
  loadCapabilities()
  loadCategories()
})
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}
.page-title { font-size: 20px; font-weight: 600; margin: 0; }
.page-subtitle { font-size: 13px; color: #8c8c8c; margin: 4px 0 0; }
.cat-tabs { margin-bottom: 12px; display: flex; flex-wrap: wrap; gap: 4px; }
.cat-tag-active { font-weight: 600; }
</style>
