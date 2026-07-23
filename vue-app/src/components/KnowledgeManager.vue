<template>
  <div class="knowledge-manager">
    <!-- Section 1: 📄 文档管理 -->
    <div class="section-card">
      <div class="section-header">
        <h3 class="section-title">📄 文档管理</h3>
        <div class="section-header-right">
          <div class="search-bar">
            <span class="search-icon">🔍</span>
            <input v-model="searchQuery" type="text" class="search-input" placeholder="搜索文档名称..." />
          </div>
          <button class="btn-upload" @click="simulateUpload">📤 上传文档</button>
        </div>
      </div>

      <div v-if="uploading" class="upload-progress-bar">
        <div class="progress-track"><div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div></div>
        <span class="progress-text">{{ uploadProgress }}%</span>
      </div>

      <div v-if="filteredDocuments.length === 0" class="empty-state">
        <span class="empty-icon">📂</span>
        <span class="empty-text">{{ searchQuery ? '未找到匹配的文档' : '暂无文档，请上传' }}</span>
      </div>

      <div v-else class="doc-list">
        <div v-for="doc in filteredDocuments" :key="doc.id" class="doc-card">
          <div class="doc-main">
            <span class="doc-icon">{{ fileIcon(doc.type) }}</span>
            <div class="doc-info">
              <div class="doc-name">{{ doc.name }}</div>
              <div class="doc-meta">
                <span class="doc-size">{{ formatSize(doc.size) }}</span>
                <span class="doc-sep">·</span>
                <span class="doc-date">{{ doc.uploadedAt }}</span>
                <span v-if="doc.category" class="doc-category-tag">{{ doc.category }}</span>
              </div>
            </div>
          </div>
          <div class="doc-right">
            <span class="status-badge" :class="'status-' + doc.status">{{ statusLabel(doc.status) }}</span>
            <span v-if="doc.status === 'indexed' && doc.chunks != null" class="chunks-count">{{ doc.chunks }} 分块</span>
            <button class="btn-delete" title="删除文档" @click="confirmDelete(doc)">✕</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 2: 🧠 本体管理 -->
    <div class="section-card">
      <div class="section-header">
        <h3 class="section-title">🧠 本体管理</h3>
        <div class="section-header-right">
          <span v-if="boundOntologies.length" class="section-count">{{ boundOntologies.length }} 个已绑定</span>
        </div>
      </div>

      <div v-if="boundOntologies.length === 0" class="empty-state">
        <span class="empty-icon">🧠</span>
        <span class="empty-text">未绑定本体，请到本体管理中配置</span>
      </div>

      <div v-else class="onto-list">
        <div v-for="onto in boundOntologies" :key="onto.id" class="onto-card">
          <div class="onto-card-top">
            <span class="onto-icon">{{ onto.icon }}</span>
            <span class="onto-name">{{ onto.name }}</span>
            <span class="onto-status" :class="'onto-' + onto.status">{{ onto.status === 'published' ? '已发布' : '草稿' }}</span>
          </div>
          <div class="onto-desc">{{ onto.description }}</div>
          <div class="onto-meta">
            <span>{{ onto.entities?.length || 0 }}个实体</span>
            <span>{{ countProps(onto) }}个属性</span>
            <span>{{ countRels(onto) }}个关系</span>
            <span>v{{ onto.version }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 3: 🗄️ 数据源管理 -->
    <div class="section-card">
      <div class="section-header">
        <h3 class="section-title">🗄️ 数据源管理</h3>
      </div>
      <div v-if="localData.dataSources.length === 0" class="empty-state">
        <span class="empty-icon">🔌</span>
        <span class="empty-text">暂无数据源</span>
      </div>
      <div v-else class="ds-list">
        <div v-for="ds in localData.dataSources" :key="ds.id" class="ds-card">
          <div class="ds-main">
            <div class="ds-info">
              <div class="ds-name">{{ ds.name }}</div>
              <div class="ds-meta">
                <span class="type-badge" :class="'type-' + ds.type">{{ ds.type === 'mysql' ? 'MySQL' : ds.type === 'postgresql' ? 'PG' : 'API' }}</span>
                <span class="ds-host">{{ ds.host || ds.endpoint }}</span>
                <span v-if="ds.database" class="ds-db">/ {{ ds.database }}</span>
              </div>
            </div>
          </div>
          <div class="ds-right">
            <span class="status-badge" :class="'ds-status-' + ds.status">{{ dsStatusLabel(ds.status) }}</span>
            <button class="btn-test" @click="handleTestConnection(ds)">测试连接</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete confirmation modal -->
    <div v-if="deletingDoc" class="modal-overlay" @click.self="deletingDoc = null">
      <div class="modal-box">
        <div class="modal-title">确认删除</div>
        <div class="modal-body">确定要删除文档 <strong>{{ deletingDoc.name }}</strong> 吗？此操作不可撤销。</div>
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
import { ontologies } from '../mockData.js'

const props = defineProps({ knowledge: { type: Object, default: () => ({ documents: [], dataSources: [] }) }, agentId: { type: String } })
const emit = defineEmits(['action'])

const localData = reactive({ documents: [], dataSources: [] })
watch(() => props.knowledge, (val) => {
  localData.documents = val?.documents ? [...val.documents] : []
  localData.dataSources = val?.dataSources ? [...val.dataSources] : []
}, { immediate: true, deep: true })

// Ontology binding — find ontologies that have this agent in boundAgents
const boundOntologies = computed(() => {
  if (!props.agentId) return []
  return ontologies.filter(o => o.boundAgents?.includes(props.agentId) || o.boundAgents?.length === 0).slice(0, 3)
})

function countProps(onto) { return onto.entities?.reduce((s, e) => s + (e.properties?.length || 0), 0) || 0 }
function countRels(onto) { return onto.entities?.reduce((s, e) => s + (e.relations?.length || 0), 0) || 0 }

// Upload simulation
const uploading = ref(false)
const uploadProgress = ref(0)

function simulateUpload() {
  if (uploading.value) return
  uploading.value = true; uploadProgress.value = 0
  const timer = setInterval(() => {
    uploadProgress.value += Math.random() * 20 + 5
    if (uploadProgress.value >= 100) {
      clearInterval(timer); uploadProgress.value = 100
      setTimeout(() => { uploading.value = false; uploadProgress.value = 0 }, 500)
    }
  }, 300)
}

const searchQuery = ref('')
const filteredDocuments = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return localData.documents
  return localData.documents.filter(d => d.name.toLowerCase().includes(q))
})

const deletingDoc = ref(null)
function confirmDelete(doc) { deletingDoc.value = doc }
function doDelete() {
  if (!deletingDoc.value) return
  const idx = localData.documents.findIndex(d => d.id === deletingDoc.value.id)
  if (idx !== -1) localData.documents.splice(idx, 1)
  deletingDoc.value = null
}

function fileIcon(type) { return { pdf: '📕', xlsx: '📊', docx: '📝' }[type] || '📄' }
function formatSize(bytes) {
  if (!bytes && bytes !== 0) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
function statusLabel(s) { return { indexing: '索引中', indexed: '已索引', error: '索引失败' }[s] || s }
function dsStatusLabel(s) { return { connected: '已连接', error: '连接异常', disconnected: '未连接' }[s] || s }
function handleTestConnection(ds) { emit('action', { action: 'test-connection', type: 'test', dataSourceId: ds.id, name: ds.name }) }
</script>

<style scoped>
.knowledge-manager { display: flex; flex-direction: column; gap: 16px; padding: 16px; }
.section-card { background: #fff; border: 1px solid #e8e8e8; border-radius: 8px; overflow: hidden; }
.section-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid #f0f0f0; }
.section-title { font-size: 15px; font-weight: 600; color: #1a1a2e; margin: 0; }
.section-header-right { display: flex; align-items: center; gap: 10px; }
.section-count { font-size: 12px; color: #8c8c8c; }
.search-bar { display: flex; align-items: center; gap: 4px; background: #f5f5f5; border: 1px solid #e8e8e8; border-radius: 6px; padding: 4px 10px; transition: border-color 0.15s; }
.search-bar:focus-within { border-color: #1677ff; background: #fff; }
.search-icon { font-size: 13px; flex-shrink: 0; }
.search-input { border: none; outline: none; background: transparent; font-size: 13px; color: #1a1a2e; width: 180px; padding: 4px 0; }
.search-input::placeholder { color: #bfbfbf; }
.btn-upload { padding: 5px 14px; font-size: 13px; font-weight: 500; border: none; border-radius: 6px; background: #1677ff; color: #fff; cursor: pointer; white-space: nowrap; transition: background 0.15s; }
.btn-upload:hover { background: #4096ff; }
.upload-progress-bar { display: flex; align-items: center; gap: 8px; padding: 8px 16px; background: #f6ffed; }
.progress-track { flex: 1; height: 6px; background: #f0f0f0; border-radius: 3px; overflow: hidden; }
.progress-fill { height: 100%; background: #52c41a; border-radius: 3px; transition: width 0.3s; }
.progress-text { font-size: 12px; color: #52c41a; font-weight: 500; min-width: 36px; }
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; padding: 40px 16px; color: #bfbfbf; }
.empty-icon { font-size: 28px; }
.empty-text { font-size: 13px; }
.doc-list { padding: 8px 0; }
.doc-card { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; border-bottom: 1px solid #f5f5f5; transition: background 0.15s; }
.doc-card:last-child { border-bottom: none; }
.doc-card:hover { background: #fafafa; }
.doc-main { display: flex; align-items: center; gap: 12px; min-width: 0; flex: 1; }
.doc-icon { font-size: 20px; flex-shrink: 0; }
.doc-info { min-width: 0; flex: 1; }
.doc-name { font-size: 14px; font-weight: 500; color: #1a1a2e; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.doc-meta { display: flex; align-items: center; gap: 4px; margin-top: 2px; font-size: 12px; color: #8c8c8c; }
.doc-sep { color: #e8e8e8; }
.doc-category-tag { font-size: 11px; background: #f5f5f5; padding: 0 6px; border-radius: 3px; color: #8c8c8c; }
.doc-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.status-badge { font-size: 12px; padding: 1px 8px; border-radius: 4px; white-space: nowrap; font-weight: 500; }
.status-indexing { background: #e6f4ff; color: #1677ff; border: 1px solid #91caff; }
.status-indexed { background: #f6ffed; color: #52c41a; border: 1px solid #b7eb8f; }
.status-error { background: #fff2f0; color: #f5222d; border: 1px solid #ffccc7; }
.ds-status-connected { background: #f6ffed; color: #52c41a; border: 1px solid #b7eb8f; }
.ds-status-error { background: #fff2f0; color: #f5222d; border: 1px solid #ffccc7; }
.ds-status-disconnected { background: #fafafa; color: #8c8c8c; border: 1px solid #e8e8e8; }
.chunks-count { font-size: 11px; color: #8c8c8c; white-space: nowrap; }
.btn-delete { width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; border: none; background: transparent; color: #bfbfbf; font-size: 13px; border-radius: 4px; cursor: pointer; transition: color 0.15s, background 0.15s; }
.btn-delete:hover { color: #f5222d; background: #fff2f0; }

/* Ontology card */
.onto-list { padding: 8px; display: flex; flex-direction: column; gap: 8px; }
.onto-card { padding: 12px; border: 1px solid #e8e8e8; border-radius: 6px; background: #fafafa; }
.onto-card-top { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.onto-icon { font-size: 18px; }
.onto-name { font-size: 14px; font-weight: 600; color: #1a1a2e; flex: 1; }
.onto-status { font-size: 11px; padding: 1px 6px; border-radius: 3px; }
.onto-published { background: #f6ffed; color: #52c41a; }
.onto-draft { background: #fff7e6; color: #fa8c16; }
.onto-desc { font-size: 12px; color: #8c8c8c; margin-bottom: 4px; }
.onto-meta { display: flex; gap: 10px; font-size: 11px; color: #8c8c8c; }

/* Data Source */
.ds-list { padding: 8px 0; }
.ds-card { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid #f5f5f5; transition: background 0.15s; }
.ds-card:last-child { border-bottom: none; }
.ds-card:hover { background: #fafafa; }
.ds-main { display: flex; align-items: center; gap: 12px; min-width: 0; flex: 1; }
.ds-info { min-width: 0; }
.ds-name { font-size: 14px; font-weight: 500; color: #1a1a2e; margin-bottom: 3px; }
.ds-meta { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #8c8c8c; flex-wrap: wrap; }
.type-badge { font-size: 11px; padding: 1px 7px; border-radius: 4px; font-weight: 500; }
.type-mysql { background: #e6f4ff; color: #1677ff; }
.type-postgresql { background: #f6ffed; color: #52c41a; }
.ds-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.btn-test { padding: 3px 10px; font-size: 12px; border: 1px solid #d9d9d9; border-radius: 4px; background: #fff; cursor: pointer; color: #595959; transition: all 0.15s; }
.btn-test:hover { border-color: #1677ff; color: #1677ff; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-box { background: #fff; border-radius: 8px; padding: 24px; width: 400px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
.modal-title { font-size: 16px; font-weight: 600; margin-bottom: 16px; }
.modal-body { font-size: 14px; color: #595959; margin-bottom: 24px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 8px; }
.btn-cancel { padding: 5px 16px; font-size: 13px; border: 1px solid #d9d9d9; border-radius: 6px; background: #fff; cursor: pointer; }
.btn-confirm { padding: 5px 16px; font-size: 13px; border: none; border-radius: 6px; background: #f5222d; color: #fff; cursor: pointer; }
</style>
