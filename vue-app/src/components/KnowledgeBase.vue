<template>
  <div class="tool-page">
    <div class="tool-header">
      <h2 class="tool-title">📚 知识库</h2>
    </div>

    <div class="tool-body">
      <div class="src-tabs">
        <span class="src-tab" :class="{ 'src-active': activeSrc === 'file' }" @click="activeSrc = 'file'">📄 文件</span>
        <span class="src-tab" :class="{ 'src-active': activeSrc === 'db' }" @click="activeSrc = 'db'">🗄️ 数据库</span>
      </div>

      <!-- File View -->
      <template v-if="activeSrc === 'file'">
        <div class="upload-zone">
          <span class="upload-icon">📂</span>
          <span class="upload-text">拖拽文件到此处，或点击上传</span>
          <span class="upload-hint">支持 PDF / Word / Excel / TXT / CSV</span>
        </div>

        <div class="search-bar">
          <span class="search-icon">🔍</span>
          <input v-model="fileQuery" type="text" class="search-input" placeholder="搜索文件名..." />
        </div>

        <div class="kb-list">
          <div v-for="cat in categories" :key="cat.id" class="kb-category" :class="{ 'kb-expanded': expandedCat === cat.id }">
            <div class="kb-cat-header" @click="expandedCat = expandedCat === cat.id ? null : cat.id">
              <span class="kb-cat-icon">{{ cat.icon }}</span>
              <span class="kb-cat-name">{{ cat.name }}</span>
              <span class="kb-cat-meta">{{ cat.fileCount }}文件</span>
              <span class="kb-cat-status" :class="cat.parsedCount === cat.fileCount ? 'status-done' : 'status-partial'">
                {{ cat.parsedCount === cat.fileCount ? '✅ 全部解析' : `⏳ ${cat.parsedCount}/${cat.fileCount}已解析` }}
              </span>
              <span v-if="cat.boundAgents?.length" class="kb-cat-bound">🤖 已绑定</span>
              <span class="kb-cat-toggle">{{ expandedCat === cat.id ? '▼' : '▶' }}</span>
            </div>
            <div v-if="expandedCat === cat.id" class="kb-files">
              <div v-for="file in cat.files" :key="file.id" class="kb-file">
                <span class="file-icon">📄</span>
                <span class="file-name">{{ file.name }}</span>
                <span class="file-status" :class="'file-' + file.status">
                  {{ file.status === 'parsed' ? '✅' : '⏳' }}
                </span>
                <span class="file-meta">{{ file.uploadedAt }}</span>
                <span v-if="file.referencedBy?.length" class="file-refs">🤖 被 {{ file.referencedBy.map(a => agentName(a)).join('、') }} 引用</span>
                <span class="file-actions">
                  <a-button size="small" type="link">预览</a-button>
                  <a-button size="small" type="link" danger>删除</a-button>
                </span>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- DB View -->
      <template v-if="activeSrc === 'db'">
        <div class="db-list">
          <div class="db-card">
            <div class="db-card-top">
              <span class="db-status-dot">🟢</span>
              <span class="db-name">金蝶ERP生产库</span>
              <span class="db-type">MySQL</span>
            </div>
            <div class="db-meta">
              <span>主机: 192.168.1.100:3306</span>
              <span>延迟: 12ms</span>
              <span>绑定: 申报管家、发票认证专员</span>
            </div>
            <div class="db-actions">
              <a-button size="small">🔗 测试连接</a-button>
              <a-button size="small" danger>断开</a-button>
              <a-button size="small">编辑配置</a-button>
            </div>
          </div>
          <div class="db-card">
            <div class="db-card-top">
              <span class="db-status-dot">🟢</span>
              <span class="db-name">税局接口数据库</span>
              <span class="db-type">PostgreSQL</span>
            </div>
            <div class="db-meta">
              <span>主机: 10.0.0.50:5432</span>
              <span>延迟: 8ms</span>
              <span>绑定: 风险预警官</span>
            </div>
            <div class="db-actions">
              <a-button size="small">🔗 测试连接</a-button>
              <a-button size="small" danger>断开</a-button>
              <a-button size="small">编辑配置</a-button>
            </div>
          </div>
          <a-button type="dashed" block style="margin-top: 12px;">+ 连接数据库</a-button>
        </div>
        <div v-if="!categories.length" class="empty-state">
          <span class="empty-icon">📂</span>
          <span class="empty-text">暂无文档，请拖拽文件上传</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { knowledgeCategories } from '../mockData.js'

const categories = knowledgeCategories
const activeSrc = ref('file')
const fileQuery = ref('')
const expandedCat = ref('kb-tax')

function agentName(id) {
  const map = { 'agent-assistant': '杨姐的助理', 'agent-certify': '认证专员', 'agent-risk': '预警官', 'agent-declare': '申报管家', 'agent-compliance': '合规师' }
  return map[id] || id
}
</script>

<style scoped>
.tool-page { padding: 24px; height: 100%; display: flex; flex-direction: column; }
.tool-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-shrink: 0; }
.tool-title { font-size: 18px; font-weight: 600; margin: 0; }
.tool-body { flex: 1; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; }

.src-tabs { display: flex; gap: 0; border: 1px solid #e8e8e8; border-radius: 6px; overflow: hidden; width: fit-content; }
.src-tab { padding: 6px 16px; cursor: pointer; font-size: 13px; color: #595959; background: #fafafa; border-right: 1px solid #e8e8e8; transition: all 0.15s; }
.src-tab:last-child { border-right: none; }
.src-tab:hover { background: #f0f5ff; }
.src-active { background: #fff !important; color: #1677ff; font-weight: 500; }

.upload-zone { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 24px; border: 2px dashed #d9d9d9; border-radius: 8px; background: #fafafa; cursor: pointer; }
.upload-zone:hover { border-color: #1677ff; }
.upload-icon { font-size: 28px; }
.upload-text { font-size: 14px; color: #595959; font-weight: 500; }
.upload-hint { font-size: 12px; color: #bfbfbf; }

.search-bar { display: flex; align-items: center; gap: 6px; padding: 8px 12px; border: 1px solid #e8e8e8; border-radius: 6px; background: #fff; max-width: 320px; }
.search-bar .search-icon { font-size: 14px; }
.search-bar .search-input { border: none; outline: none; flex: 1; font-size: 13px; }
.search-bar .search-input::placeholder { color: #bfbfbf; }

.kb-list { display: flex; flex-direction: column; gap: 2px; }
.kb-category { border: 1px solid #e8e8e8; border-radius: 6px; overflow: hidden; background: #fff; }
.kb-cat-header { display: flex; align-items: center; gap: 8px; padding: 10px 14px; cursor: pointer; font-size: 13px; }
.kb-cat-header:hover { background: #fafafa; }
.kb-cat-icon { font-size: 16px; }
.kb-cat-name { font-weight: 500; color: #1a1a2e; flex: 1; }
.kb-cat-meta { font-size: 11px; color: #8c8c8c; }
.kb-cat-status { font-size: 11px; }
.status-done { color: #52c41a; }
.status-partial { color: #fa8c16; }
.kb-cat-bound { font-size: 11px; color: #1677ff; background: #f0f5ff; padding: 1px 6px; border-radius: 3px; }
.kb-cat-toggle { color: #bfbfbf; font-size: 11px; }

.kb-files { border-top: 1px solid #f0f0f0; }
.kb-file { display: flex; align-items: center; gap: 8px; padding: 8px 14px 8px 30px; font-size: 13px; border-bottom: 1px solid #f5f5f5; }
.kb-file:last-child { border-bottom: none; }
.file-icon { font-size: 14px; }
.file-name { flex: 1; color: #1a1a2e; }
.file-status { font-size: 12px; }
.file-parsed { color: #52c41a; }
.file-parsing { color: #fa8c16; }
.file-meta { font-size: 11px; color: #bfbfbf; }
.file-refs { font-size: 11px; color: #1677ff; }
.file-actions { display: flex; gap: 4px; }

.db-list { display: flex; flex-direction: column; gap: 10px; }
.db-card { padding: 14px; border: 1px solid #e8e8e8; border-radius: 8px; background: #fff; }
.db-card-top { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.db-status-dot { font-size: 14px; }
.db-name { font-size: 14px; font-weight: 600; color: #1a1a2e; flex: 1; }
.db-type { font-size: 11px; color: #1677ff; background: #f0f5ff; padding: 1px 6px; border-radius: 3px; }
.db-meta { display: flex; gap: 16px; font-size: 12px; color: #8c8c8c; margin-bottom: 8px; }
.db-actions { display: flex; gap: 6px; }
</style>
