<template>
  <div class="knowledge-manager">
    <!-- Section 1: 文档管理 -->
    <div class="section-card">
      <div class="section-header">
        <h3 class="section-title">📄 文档管理</h3>
        <div class="section-header-right">
          <div class="search-bar">
            <span class="search-icon">🔍</span>
            <input
              v-model="searchQuery"
              type="text"
              class="search-input"
              placeholder="搜索文档名称..."
            />
          </div>
          <button class="btn-upload" @click="handleUpload">上传文档</button>
        </div>
      </div>

      <div v-if="filteredDocuments.length === 0" class="empty-state">
        <span class="empty-icon">📂</span>
        <span class="empty-text">{{ searchQuery ? '未找到匹配的文档' : '暂无文档，请上传' }}</span>
      </div>

      <div v-else class="doc-list">
        <div
          v-for="doc in filteredDocuments"
          :key="doc.id"
          class="doc-card"
        >
          <div class="doc-main">
            <span class="doc-icon">{{ fileIcon(doc.type) }}</span>
            <div class="doc-info">
              <div class="doc-name">{{ doc.name }}</div>
              <div class="doc-meta">
                <span class="doc-size">{{ formatSize(doc.size) }}</span>
                <span class="doc-sep">·</span>
                <span class="doc-date">{{ doc.uploadedAt }}</span>
              </div>
            </div>
          </div>
          <div class="doc-right">
            <span
              class="status-badge"
              :class="'status-' + doc.status"
            >
              {{ statusLabel(doc.status) }}
            </span>
            <span v-if="doc.status === 'indexed' && doc.chunks != null" class="chunks-count">
              {{ doc.chunks }} 分块
            </span>
            <button
              class="btn-delete"
              title="删除文档"
              @click="confirmDelete(doc)"
            >✕</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 2: 数据源管理 -->
    <div class="section-card">
      <div class="section-header">
        <h3 class="section-title">🗄️ 数据源管理</h3>
      </div>

      <div v-if="localData.dataSources.length === 0" class="empty-state">
        <span class="empty-icon">🔌</span>
        <span class="empty-text">暂无数据源</span>
      </div>

      <div v-else class="ds-list">
        <div
          v-for="ds in localData.dataSources"
          :key="ds.id"
          class="ds-card"
        >
          <div class="ds-main">
            <div class="ds-info">
              <div class="ds-name">{{ ds.name }}</div>
              <div class="ds-meta">
                <span class="type-badge" :class="'type-' + ds.type">{{ ds.type === 'mysql' ? 'MySQL' : 'API' }}</span>
                <span class="ds-host">{{ ds.type === 'mysql' ? ds.host : (ds.endpoint || ds.host) }}</span>
                <span v-if="ds.dbName" class="ds-db">/ {{ ds.dbName }}</span>
              </div>
            </div>
          </div>
          <div class="ds-right">
            <span
              class="status-badge"
              :class="'ds-status-' + ds.status"
            >
              {{ dsStatusLabel(ds.status) }}
            </span>
            <button class="btn-test" @click="handleTestConnection(ds)">测试连接</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete confirmation modal -->
    <div v-if="deletingDoc" class="modal-overlay" @click.self="deletingDoc = null">
      <div class="modal-box">
        <div class="modal-title">确认删除</div>
        <div class="modal-body">
          确定要删除文档 <strong>{{ deletingDoc.name }}</strong> 吗？此操作不可撤销。
        </div>
        <div class="modal-actions">
          <button class="btn-cancel" @click="deletingDoc = null">取消</button>
          <button class="btn-confirm" @click="doDelete">确认删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'

const props = defineProps({
  knowledge: {
    type: Object,
    default: () => ({ documents: [], dataSources: [] }),
  },
})

const emit = defineEmits(['action'])

// --- Local reactive copy ---
const localData = reactive({
  documents: [],
  dataSources: [],
})

// Sync from prop
watch(
  () => props.knowledge,
  (val) => {
    localData.documents = val?.documents ? [...val.documents] : []
    localData.dataSources = val?.dataSources ? [...val.dataSources] : []
  },
  { immediate: true, deep: true },
)

// --- Search ---
const searchQuery = ref('')

const filteredDocuments = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return localData.documents
  return localData.documents.filter((d) => d.name.toLowerCase().includes(q))
})

// --- Delete state ---
const deletingDoc = ref(null)

function confirmDelete(doc) {
  deletingDoc.value = doc
}

function doDelete() {
  if (!deletingDoc.value) return
  const idx = localData.documents.findIndex((d) => d.id === deletingDoc.value.id)
  if (idx !== -1) {
    localData.documents.splice(idx, 1)
  }
  deletingDoc.value = null
}

// --- Helpers ---
function fileIcon(type) {
  const icons = { pdf: '📕', xlsx: '📊', docx: '📝' }
  return icons[type] || '📄'
}

function formatSize(bytes) {
  if (!bytes && bytes !== 0) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function statusLabel(status) {
  const labels = { indexing: '索引中', indexed: '已索引', error: '索引失败' }
  return labels[status] || status
}

function dsStatusLabel(status) {
  const labels = { connected: '已连接', error: '连接异常', disconnected: '未连接' }
  return labels[status] || status
}

// --- Placeholder actions ---
function handleUpload() {
  emit('action', { action: 'upload-document', type: 'upload' })
}

function handleTestConnection(ds) {
  emit('action', { action: 'test-connection', type: 'test', dataSourceId: ds.id, name: ds.name })
}
</script>

<style scoped>
.knowledge-manager {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}

/* Section Card */
.section-card {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0;
}

.section-header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Search Bar */
.search-bar {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #f5f5f5;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  padding: 4px 10px;
  transition: border-color 0.15s;
}
.search-bar:focus-within {
  border-color: #1677ff;
  background: #fff;
}
.search-icon {
  font-size: 13px;
  flex-shrink: 0;
}
.search-input {
  border: none;
  outline: none;
  background: transparent;
  font-size: 13px;
  color: #1a1a2e;
  width: 180px;
  padding: 4px 0;
}
.search-input::placeholder {
  color: #bfbfbf;
}

/* Upload Button */
.btn-upload {
  padding: 5px 14px;
  font-size: 13px;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  background: #1677ff;
  color: #fff;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s;
}
.btn-upload:hover {
  background: #4096ff;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 40px 16px;
  color: #bfbfbf;
}
.empty-icon {
  font-size: 28px;
}
.empty-text {
  font-size: 13px;
}

/* Document List */
.doc-list {
  padding: 8px 0;
}

.doc-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid #f5f5f5;
  transition: background 0.15s;
}
.doc-card:last-child {
  border-bottom: none;
}
.doc-card:hover {
  background: #fafafa;
}

.doc-main {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.doc-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.doc-info {
  min-width: 0;
  flex: 1;
}

.doc-name {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a2e;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.doc-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
  font-size: 12px;
  color: #8c8c8c;
}

.doc-sep {
  color: #e8e8e8;
}

.doc-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

/* Status Badge */
.status-badge {
  font-size: 12px;
  padding: 1px 8px;
  border-radius: 4px;
  white-space: nowrap;
  font-weight: 500;
}

.status-indexing {
  background: #e6f4ff;
  color: #1677ff;
  border: 1px solid #91caff;
}

.status-indexed {
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.status-error {
  background: #fff2f0;
  color: #f5222d;
  border: 1px solid #ffccc7;
}

/* Data source status overrides */
.ds-status-connected {
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.ds-status-error {
  background: #fff2f0;
  color: #f5222d;
  border: 1px solid #ffccc7;
}

.ds-status-disconnected {
  background: #fafafa;
  color: #8c8c8c;
  border: 1px solid #e8e8e8;
}

/* Chunks Count */
.chunks-count {
  font-size: 11px;
  color: #8c8c8c;
  white-space: nowrap;
}

/* Delete Button */
.btn-delete {
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: #bfbfbf;
  font-size: 13px;
  border-radius: 4px;
  cursor: pointer;
  transition: color 0.15s, background 0.15s;
}
.btn-delete:hover {
  color: #f5222d;
  background: #fff2f0;
}

/* Data Source List */
.ds-list {
  padding: 8px 0;
}

.ds-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #f5f5f5;
  transition: background 0.15s;
}
.ds-card:last-child {
  border-bottom: none;
}
.ds-card:hover {
  background: #fafafa;
}

.ds-main {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.ds-info {
  min-width: 0;
}

.ds-name {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a2e;
  margin-bottom: 3px;
}

.ds-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #8c8c8c;
  flex-wrap: wrap;
}

.type-badge {
  font-size: 11px;
  padding: 1px 7px;
  border-radius: 4px;
  font-weight: 500;
}
.type-mysql {
  background: #fff7e6;
  color: #d46b08;
  border: 1px solid #ffd591;
}
.type-api {
  background: #f0f5ff;
  color: #1677ff;
  border: 1px solid #adc6ff;
}

.ds-host {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ds-db {
  color: #bfbfbf;
}

.ds-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

/* Test Connection Button */
.btn-test {
  padding: 4px 12px;
  font-size: 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  color: #595959;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.15s, border-color 0.15s;
}
.btn-test:hover {
  color: #1677ff;
  border-color: #1677ff;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-box {
  background: #fff;
  border-radius: 10px;
  width: 380px;
  max-width: 90vw;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 12px;
}

.modal-body {
  font-size: 14px;
  color: #434343;
  line-height: 1.6;
  margin-bottom: 20px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-cancel {
  padding: 6px 16px;
  font-size: 13px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: #fff;
  color: #595959;
  cursor: pointer;
  transition: border-color 0.15s;
}
.btn-cancel:hover {
  border-color: #1677ff;
  color: #1677ff;
}

.btn-confirm {
  padding: 6px 16px;
  font-size: 13px;
  border: none;
  border-radius: 6px;
  background: #f5222d;
  color: #fff;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-confirm:hover {
  background: #ff4d4f;
}
</style>
