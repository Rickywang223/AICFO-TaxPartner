<template>
  <div class="task-manager">
    <!-- Toolbar: Search + Add -->
    <div class="toolbar">
      <a-input-search
        v-model:value="searchText"
        placeholder="搜索任务..."
        style="width: 240px"
        allow-clear
      />
      <div class="toolbar-right">
        <a-button type="primary" @click="showAddModal = true">
          + 新建任务
        </a-button>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="filter-tabs">
      <div
        v-for="tab in filterTabs"
        :key="tab.key"
        class="filter-tab"
        :class="{ active: activeFilter === tab.key }"
        @click="activeFilter = tab.key"
      >
        {{ tab.label }}
        <span v-if="tab.count !== undefined" class="filter-count">{{ tab.count }}</span>
      </div>
    </div>

    <!-- Task List -->
    <div v-if="filteredTasks.length === 0" class="empty-state">
      <div class="empty-icon">📋</div>
      <div class="empty-text">暂无任务</div>
    </div>

    <div v-else class="task-list">
      <div
        v-for="task in filteredTasks"
        :key="task.id"
        class="task-card"
        :class="{ expanded: expandedId === task.id }"
      >
        <!-- Card Header (always visible) -->
        <div class="task-header" @click="toggleExpand(task.id)">
          <div class="task-left">
            <!-- Priority dot -->
            <span
              class="priority-dot"
              :class="'priority-' + task.priority"
              :title="'优先级: ' + priorityLabel(task.priority)"
            ></span>
            <!-- Title -->
            <div class="task-title-area">
              <input
                v-if="expandedId === task.id && editingField === 'title'"
                v-model="editingTitle"
                class="inline-title-input"
                @blur="saveTitle(task)"
                @keyup.enter="saveTitle(task)"
                @keyup.escape="cancelEdit"
                ref="titleInputRef"
                autofocus
              />
              <span v-else class="task-title" :class="{ 'title-completed': task.status === 'completed' }">
                {{ task.title }}
              </span>
            </div>
          </div>

          <div class="task-meta">
            <!-- Status badge -->
            <a-tag :color="statusColor(task.status)" class="status-tag">
              {{ statusLabel(task.status) }}
            </a-tag>
            <!-- Due date -->
            <span v-if="task.dueDate" class="due-date">{{ task.dueDate }}</span>
            <!-- Assignee -->
            <span v-if="task.assignee" class="assignee">{{ task.assignee }}</span>
          </div>

          <div class="task-actions">
            <!-- Status dropdown when expanded -->
            <a-select
              v-if="expandedId === task.id"
              v-model:value="task.status"
              size="small"
              style="width: 120px"
              @change="onStatusChange(task)"
              @click.stop
            >
              <a-select-option value="pending">待处理</a-select-option>
              <a-select-option value="in_progress">进行中</a-select-option>
              <a-select-option value="completed">已完成</a-select-option>
              <a-select-option value="cancelled">已取消</a-select-option>
            </a-select>

            <!-- Delete -->
            <a-popconfirm
              title="确定删除此任务?"
              ok-text="确定"
              cancel-text="取消"
              @confirm.stop="deleteTask(task)"
              @click.stop
            >
              <a-button size="small" danger type="text" class="delete-btn">🗑</a-button>
            </a-popconfirm>

            <!-- Expand indicator -->
            <span class="expand-icon">{{ expandedId === task.id ? '▲' : '▼' }}</span>
          </div>
        </div>

        <!-- Expanded Details -->
        <div v-if="expandedId === task.id" class="task-details">
          <div class="detail-row">
            <span class="detail-label">描述</span>
            <span class="detail-value" v-if="!task.description" style="color: #bfbfbf;">暂无描述</span>
            <span class="detail-value" v-else>{{ task.description }}</span>
          </div>
          <div class="detail-row" v-if="task.createdAt">
            <span class="detail-label">创建时间</span>
            <span class="detail-value">{{ task.createdAt }}</span>
          </div>
          <div class="detail-row" v-if="task.agentId">
            <span class="detail-label">所属智能体</span>
            <span class="detail-value">{{ task.agentId }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Task Modal -->
    <a-modal
      v-model:visible="showAddModal"
      title="新建任务"
      ok-text="创建"
      cancel-text="取消"
      @ok="handleAddTask"
      :confirm-loading="isSubmitting"
    >
      <a-form layout="vertical">
        <a-form-item label="任务名称" required>
          <a-input v-model:value="form.title" placeholder="输入任务名称" />
          <div v-if="formError === 'title'" class="form-error">请输入任务名称</div>
        </a-form-item>
        <a-form-item label="描述">
          <a-textarea v-model:value="form.description" placeholder="输入任务描述" :rows="3" />
        </a-form-item>
        <a-form-item label="优先级">
          <a-select v-model:value="form.priority">
            <a-select-option value="high">高</a-select-option>
            <a-select-option value="medium">中</a-select-option>
            <a-select-option value="low">低</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="截止日期">
          <a-input v-model:value="form.dueDate" placeholder="YYYY-MM-DD" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'

const props = defineProps({
  tasks: { type: Array, default: () => [] },
  agentId: { type: String, required: true }
})

const emit = defineEmits(['action'])

// --- Reactive local copy of tasks ---
const localTasks = reactive([])

function syncTasks() {
  localTasks.splice(0, localTasks.length, ...props.tasks.map(t => ({ ...t })))
}
watch(() => props.tasks, syncTasks, { deep: true, immediate: true })

// --- Filter & Search ---
const activeFilter = ref('all')
const searchText = ref('')

const filterTabs = computed(() => {
  const counts = { all: localTasks.length }
  for (const st of ['pending', 'in_progress', 'completed']) {
    counts[st] = localTasks.filter(t => t.status === st).length
  }
  return [
    { key: 'all', label: '全部', count: counts.all },
    { key: 'pending', label: '待处理', count: counts.pending },
    { key: 'in_progress', label: '进行中', count: counts.in_progress },
    { key: 'completed', label: '已完成', count: counts.completed }
  ]
})

const filteredTasks = computed(() => {
  let list = localTasks
  if (activeFilter.value !== 'all') {
    list = list.filter(t => t.status === activeFilter.value)
  }
  if (searchText.value.trim()) {
    const q = searchText.value.trim().toLowerCase()
    list = list.filter(t => t.title.toLowerCase().includes(q))
  }
  return list
})

// --- Expand / Inline editing ---
const expandedId = ref(null)
const editingField = ref(null)
const editingTitle = ref('')
const titleInputRef = ref(null)

function toggleExpand(taskId) {
  if (expandedId.value === taskId) {
    expandedId.value = null
    editingField.value = null
  } else {
    expandedId.value = taskId
    editingField.value = null
  }
}

function startEditTitle(task) {
  editingField.value = 'title'
  editingTitle.value = task.title
  nextTick(() => {
    if (titleInputRef.value) titleInputRef.value.focus()
  })
}

function saveTitle(task) {
  if (editingTitle.value.trim()) {
    task.title = editingTitle.value.trim()
    emit('action', { action: 'update-task', task: { ...task } })
  }
  editingField.value = null
}

function cancelEdit() {
  editingField.value = null
}

function onStatusChange(task) {
  emit('action', { action: 'update-task', task: { ...task } })
}

// --- Add Task ---
const showAddModal = ref(false)
const isSubmitting = ref(false)
const formError = ref(null)

const form = reactive({
  title: '',
  description: '',
  priority: 'medium',
  dueDate: ''
})

function resetForm() {
  form.title = ''
  form.description = ''
  form.priority = 'medium'
  form.dueDate = ''
  formError.value = null
}

function handleAddTask() {
  if (!form.title.trim()) {
    formError.value = 'title'
    return
  }
  formError.value = null
  isSubmitting.value = true

  const newTask = {
    id: 'task-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    title: form.title.trim(),
    description: form.description.trim(),
    status: 'pending',
    priority: form.priority,
    dueDate: form.dueDate || null,
    assignee: null,
    createdAt: new Date().toISOString().slice(0, 10)
  }

  localTasks.push(newTask)
  emit('action', { action: 'add-task', task: newTask })

  isSubmitting.value = false
  showAddModal.value = false
  resetForm()
}

// --- Delete Task ---
function deleteTask(task) {
  const idx = localTasks.findIndex(t => t.id === task.id)
  if (idx !== -1) {
    localTasks.splice(idx, 1)
    if (expandedId.value === task.id) expandedId.value = null
  }
  emit('action', { action: 'delete-task', task: { id: task.id } })
}

// --- Helpers ---
function statusColor(status) {
  const map = { pending: 'blue', in_progress: 'orange', completed: 'green', cancelled: 'default' }
  return map[status] || 'default'
}

function statusLabel(status) {
  const map = { pending: '待处理', in_progress: '进行中', completed: '已完成', cancelled: '已取消' }
  return map[status] || status
}

function priorityLabel(priority) {
  const map = { high: '高', medium: '中', low: '低' }
  return map[priority] || priority
}
</script>

<style scoped>
.task-manager {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  min-height: 300px;
}

/* Toolbar */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

/* Filter Tabs */
.filter-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 0;
}

.filter-tab {
  padding: 8px 16px;
  font-size: 13px;
  cursor: pointer;
  color: #666;
  border-bottom: 2px solid transparent;
  transition: color 0.2s, border-color 0.2s;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-tab:hover {
  color: #1677ff;
}

.filter-tab.active {
  color: #1677ff;
  border-bottom-color: #1677ff;
  font-weight: 500;
}

.filter-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  background: #f0f0f0;
  color: #999;
  font-size: 11px;
  padding: 0 5px;
  font-weight: 400;
}

.filter-tab.active .filter-count {
  background: #f0f5ff;
  color: #1677ff;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #bfbfbf;
}

.empty-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 14px;
}

/* Task List */
.task-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Task Card */
.task-card {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  background: #fff;
  transition: box-shadow 0.2s, border-color 0.2s;
  overflow: hidden;
}

.task-card:hover {
  border-color: #d9d9d9;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* Task Header */
.task-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  user-select: none;
}

.task-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

/* Priority Dot */
.priority-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.priority-high { background: #ff4d4f; }
.priority-medium { background: #fa8c16; }
.priority-low { background: #d9d9d9; }

/* Title */
.task-title-area {
  flex: 1;
  min-width: 0;
}

.task-title {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a2e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.title-completed {
  text-decoration: line-through;
  color: #bfbfbf;
}

.inline-title-input {
  width: 100%;
  border: 1px solid #1677ff;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 14px;
  font-weight: 500;
  color: #1a1a2e;
  outline: none;
  background: #fff;
  box-sizing: border-box;
}

/* Meta area */
.task-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.status-tag {
  font-size: 12px;
  line-height: 1;
  margin-right: 0;
}

.due-date {
  font-size: 12px;
  color: #8c8c8c;
  white-space: nowrap;
}

.assignee {
  font-size: 12px;
  color: #8c8c8c;
  white-space: nowrap;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Actions area */
.task-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.delete-btn {
  font-size: 14px;
  padding: 0 4px;
  opacity: 0.4;
  transition: opacity 0.2s;
}

.task-card:hover .delete-btn {
  opacity: 0.8;
}

.expand-icon {
  font-size: 10px;
  color: #bfbfbf;
  transition: color 0.2s;
}

.task-card:hover .expand-icon {
  color: #999;
}

/* Expanded Details */
.task-details {
  border-top: 1px solid #f5f6fa;
  padding: 12px 16px 16px;
  background: #fafafa;
}

.detail-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 13px;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-label {
  color: #8c8c8c;
  flex-shrink: 0;
  min-width: 56px;
}

.detail-value {
  color: #595959;
  line-height: 1.5;
  word-break: break-all;
}

/* Form error */
.form-error {
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 4px;
}
</style>
