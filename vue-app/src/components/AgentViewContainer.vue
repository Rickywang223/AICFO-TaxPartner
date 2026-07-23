<template>
  <div class="agent-view-container">
    <!-- Tab Bar -->
    <div class="tab-bar">
      <div class="tab-bar-left">
        <div
          v-for="tab in biDashboards"
          :key="tab.id"
          :class="['tab', 'tab-bi', { active: activeTabId === tab.id }]"
          @click="activeTabId = tab.id"
          @dblclick="onRenameBiDashboard(tab)"
        >
          <span class="tab-label">{{ tab.name }}</span>
          <span
            v-if="!isFirstBiDashboard(tab.id)"
            class="tab-close"
            @click.stop="onDeleteBiDashboard(tab.id)"
            title="删除"
          >×</span>
        </div>
        <button class="add-tab-btn" title="添加数据看板" @click="addBiDashboard">+</button>
      </div>
      <div class="tab-bar-divider">|</div>
      <div class="tab-bar-right">
        <div
          v-for="tab in fixedTabs"
          :key="tab.id"
          :class="['tab', 'tab-fixed', { active: activeTabId === tab.id }]"
          @click="activeTabId = tab.id"
        >
          {{ tab.name }}
        </div>
      </div>
    </div>

    <!-- View Area -->
    <div class="view-area">
      <AgentDashboard
        v-if="activeTabId.startsWith('db-') && activeBiDashboard"
        :key="'db-' + activeTabId"
        :dashboard="activeBiDashboard"
        @action="onAction"
      />
      <TaskManager
        v-else-if="activeTabId === 'tasks'"
        :tasks="tasks"
        :agent-id="agentId"
        @action="onAction"
      />
      <CapabilityManager
        v-else-if="activeTabId === 'capability'"
        :capabilities="capabilities"
        @action="onAction"
      />
      <KnowledgeManager
        v-else-if="activeTabId === 'knowledge'"
        :knowledge="knowledge"
        @action="onAction"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import AgentDashboard from './AgentDashboard.vue'
import TaskManager from './TaskManager.vue'
import CapabilityManager from './CapabilityManager.vue'
import KnowledgeManager from './KnowledgeManager.vue'

const props = defineProps({
  agentId: { type: String, required: true },
  dashTabs: { type: Object, required: true },
  dashboards: { type: Object, default: () => ({}) },
  tasks: { type: Array, required: true },
  capabilities: { type: Object, required: true },
  knowledge: { type: Object, required: true }
})

const emit = defineEmits(['action'])

// Active BI dashboard data — pick the right one by activeTabId
const activeBiDashboard = computed(() => {
  return props.dashboards[activeTabId.value] || { kpiCards: [], sections: [] }
})

// Ensure first BI dashboard is always named — use existing or default
function ensureFirstDashboard(tabs) {
  if (tabs && tabs.length > 0 && !tabs[0].name) {
    tabs[0].name = '默认看板'
  }
  return tabs
}

// Reactive copy of biDashboards from props — so we can mutate locally
const biDashboards = reactive(ensureFirstDashboard([...((props.dashTabs && props.dashTabs.biDashboards) || [])]))

// Sync from props when dashTabs changes externally
watch(
  () => props.dashTabs,
  (newVal) => {
    if (newVal && newVal.biDashboards) {
      biDashboards.splice(0, biDashboards.length, ...ensureFirstDashboard([...newVal.biDashboards]))
    }
  },
  { deep: true }
)

// Fixed tabs — derive from dashTabs.fixedTabs, or fallback to defaults
const fixedTabs = computed(() => {
  if (props.dashTabs && props.dashTabs.fixedTabs && props.dashTabs.fixedTabs.length > 0) {
    return props.dashTabs.fixedTabs
  }
  return [
    { id: 'tasks', name: '任务管理', type: 'fixed' },
    { id: 'capability', name: '能力管理', type: 'fixed' },
    { id: 'knowledge', name: '知识库', type: 'fixed' }
  ]
})

// Active tab — defaults to first BI dashboard id
const activeTabId = ref(
  (biDashboards.length > 0 && biDashboards[0].id) || null
)

// Ensure activeTabId is valid after tab deletions
watch(activeTabId, (val) => {
  const ids = biDashboards.map(t => t.id).concat(fixedTabs.value.map(t => t.id))
  if (val && !ids.includes(val)) {
    activeTabId.value = (biDashboards.length > 0 && biDashboards[0].id) || null
  }
})

// Check if a BI tab is the first (immutable one)
function isFirstBiDashboard(id) {
  return biDashboards.length > 0 && biDashboards[0].id === id
}

// Generate a new unique db-N id
function nextDbId() {
  let max = 0
  biDashboards.forEach(t => {
    const m = t.id.match(/^db-(\d+)$/)
    if (m) max = Math.max(max, parseInt(m[1], 10))
  })
  return `db-${max + 1}`
}

// Add a new BI dashboard tab
function addBiDashboard() {
  const id = nextDbId()
  const n = biDashboards.length + 1
  biDashboards.push({
    id,
    name: `数据看板${n}`,
    type: 'bi'
  })
  activeTabId.value = id
}

// Rename a BI dashboard (double-click triggers a prompt)
function onRenameBiDashboard(tab) {
  if (isFirstBiDashboard(tab.id)) return // first tab cannot be renamed
  const newName = prompt('重命名数据看板:', tab.name)
  if (newName && newName.trim() && newName.trim() !== tab.name) {
    tab.name = newName.trim()
  }
  // If user cancelled or entered empty, keep the old name
}

// Delete a BI dashboard tab
function onDeleteBiDashboard(id) {
  if (isFirstBiDashboard(id)) return // first tab cannot be deleted
  const tab = biDashboards.find(t => t.id === id)
  if (!tab) return
  const confirmed = confirm(`确定删除"${tab.name}"?`)
  if (!confirmed) return
  const idx = biDashboards.findIndex(t => t.id === id)
  biDashboards.splice(idx, 1)
  // If the active tab was the deleted one, switch to the first BI dashboard
  if (activeTabId.value === id) {
    activeTabId.value = biDashboards.length > 0 ? biDashboards[0].id : null
  }
}

// Forward child action events
function onAction(payload) {
  emit('action', payload)
}
</script>

<style scoped>
.agent-view-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Tab Bar */
.tab-bar {
  display: flex;
  align-items: center;
  padding: 8px 16px 0;
  border-bottom: 1px solid #f0f0f0;
  background: #fff;
  flex-shrink: 0;
}

.tab-bar-left {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  overflow-x: auto;
}

.tab-bar-divider {
  color: #e8e8e8;
  margin: 0 8px;
  font-size: 16px;
  line-height: 1;
  user-select: none;
  margin-left: auto;
}

.tab-bar-right {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
}

/* Individual Tab */
.tab {
  padding: 6px 14px;
  border-radius: 6px 6px 0 0;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  user-select: none;
  transition: color 0.2s, background 0.2s;
  color: #666;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.tab:hover {
  color: #1677ff;
  background: #f0f5ff;
}

.tab.active {
  color: #1677ff;
  background: #f0f5ff;
  font-weight: 500;
}

.tab-label {
  line-height: 1;
}

/* Close button (×) on BI tabs */
.tab-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  font-size: 13px;
  line-height: 1;
  border-radius: 50%;
  cursor: pointer;
  color: #999;
  transition: color 0.15s, background 0.15s;
}

.tab-close:hover {
  color: #ff4d4f;
  background: rgba(255, 77, 79, 0.1);
}

/* Add BI dashboard button */
.add-tab-btn {
  border: 1px dashed #d9d9d9;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: transparent;
  color: #999;
  padding: 0;
  line-height: 1;
  margin-left: 4px;
  transition: color 0.2s, border-color 0.2s;
  flex-shrink: 0;
}

.add-tab-btn:hover {
  color: #1677ff;
  border-color: #1677ff;
}

/* View Area */
.view-area {
  flex: 1;
  padding: 16px;
}
</style>
