<template>
  <div class="tool-page">
    <div class="tool-header"><h2 class="tool-title">📚 知识库</h2></div>
    <div class="tool-body">
      <div class="src-tabs">
        <span class="src-tab" :class="{ 'src-active': activeSrc === 'file' }" @click="activeSrc = 'file'">📄 文件</span>
        <span class="src-tab" :class="{ 'src-active': activeSrc === 'db' }" @click="activeSrc = 'db'">🗄️ 数据库</span>
        <span class="src-tab" :class="{ 'src-active': activeSrc === 'onto' }" @click="activeSrc = 'onto'">🧠 本体</span>
      </div>

      <!-- File View -->
      <template v-if="activeSrc === 'file'">
        <div class="upload-zone" :class="{ 'uploading': uploading }" @click="!uploading && simulateUpload()" @dragover.prevent="uploading = true" @dragleave="uploading = false" @drop.prevent="simulateUpload">
      <template v-if="uploading">
        <a-progress type="circle" :percent="uploadProgress" :size="60" />
        <span class="upload-text">正在上传...</span>
      </template>
      <template v-else>
        <span class="upload-icon">📂</span>
        <span class="upload-text">拖拽文件到此处，或点击上传</span>
        <span class="upload-hint">支持 PDF / Word / Excel / TXT / CSV</span>
      </template>
    </div>
        <div class="search-bar">
          <span class="search-icon">🔍</span>
          <input v-model="fileQuery" type="text" class="search-input" placeholder="搜索文件名..." />
        </div>
        <div v-if="!categories.length" class="empty-state"><span class="empty-icon">📂</span><span class="empty-text">知识库还是空的，拖拽文件开始上传</span></div>
        <div v-else class="kb-list">
          <div v-for="cat in categories" :key="cat.id" class="kb-category">
            <div class="kb-cat-header" @click="expandedCat = expandedCat === cat.id ? null : cat.id">
              <span class="kb-cat-icon">{{ cat.icon }}</span>
              <span class="kb-cat-name">{{ cat.name }}</span>
              <span class="kb-cat-meta">{{ cat.fileCount }}文件</span>
              <span class="kb-cat-status" :class="cat.parsedCount === cat.fileCount ? 'status-done' : 'status-partial'">{{ cat.parsedCount === cat.fileCount ? '✅ 全部解析' : `⏳ ${cat.parsedCount}/${cat.fileCount}已解析` }}</span>
              <span v-if="cat.boundAgents?.length" class="kb-cat-bound">🤖 已绑定</span>
              <span class="kb-cat-toggle">{{ expandedCat === cat.id ? '▼' : '▶' }}</span>
            </div>
            <div v-if="expandedCat === cat.id" class="kb-files">
              <div v-for="file in cat.files" :key="file.id" class="kb-file">
                <span class="file-icon">📄</span>
                <span class="file-name">{{ file.name }}</span>
                <span class="file-status" :class="'file-' + file.status">{{ file.status === 'parsed' ? '✅' : '⏳' }}</span>
                <span class="file-meta">{{ file.uploadedAt }}</span>
                <span v-if="file.referencedBy?.length" class="file-refs">🤖 被 {{ file.referencedBy.map(a => agentName(a)).join('、') }} 引用</span>
                <span class="file-actions"><a-button size="small" type="link">预览</a-button><a-button size="small" type="link" danger>删除</a-button></span>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- DB View -->
      <template v-if="activeSrc === 'db'">
        <div v-if="!dbConnections.length" class="empty-state"><span class="empty-icon">🗄️</span><span class="empty-text">暂无数据库连接，点击下方按钮添加</span></div>
        <div v-else class="db-list">
          <div v-for="(db, i) in dbConnections" :key="i" class="db-card">
            <div class="db-card-top">
              <span class="db-status-dot">{{ db.status === 'connected' ? '🟢' : '🔴' }}</span>
              <span class="db-name">{{ db.name }}</span>
              <span class="db-type">{{ db.type.toUpperCase() }}</span>
            </div>
            <div class="db-meta">
              <span>主机: {{ db.host }}:{{ db.port }}</span>
              <span>延迟: {{ db.latency }}</span>
              <span>绑定: {{ db.boundAgents?.length ? db.boundAgents.map(a => agentName(a)).join('、') : '未绑定' }}</span>
            </div>
            <div class="db-actions">
              <a-button size="small" @click="testDb(db)">🔗 测试连接</a-button>
              <a-button size="small" danger @click="disconnectDb(i)">断开</a-button>
              <a-button size="small" @click="editDb(db)">编辑配置</a-button>
            </div>
          </div>
        </div>
        <a-button type="dashed" block @click="showDbModal" style="margin-top: 4px;">+ 连接数据库</a-button>
      </template>

      <!-- Ontology View -->
      <template v-if="activeSrc === 'onto'">
        <!-- Editor Mode -->
        <template v-if="editingOntology">
          <div class="onto-editor-toolbar">
            <a-button type="text" @click="editingOntology = null; editingEntity = null">⬅ 返回列表</a-button>
            <span class="onto-editor-title">{{ editingOntology.icon }} {{ editingOntology.name }}</span>
            <a-button size="small" @click="addEntity">+ 添加实体</a-button>
          </div>
          <div class="onto-editor-body">
            <!-- Left: Entity List -->
            <div class="onto-entity-list">
              <div
                v-for="ent in editingOntology.entities"
                :key="ent.id"
                class="onto-entity-item"
                :class="{ 'entity-active': editingEntity?.id === ent.id }"
                @click="selectEntity(ent)"
              >
                <div class="entity-item-top">
                  <span class="entity-icon">{{ ent.icon }}</span>
                  <span class="entity-name">{{ ent.name }}</span>
                  <span class="entity-counts">{{ ent.properties?.length || 0 }}属性</span>
                </div>
                <div class="entity-item-actions">
                  <a-button size="small" type="link" @click.stop="renameEntity(ent)">✏️</a-button>
                  <a-button size="small" type="link" danger @click.stop="deleteEntity(ent)">🗑</a-button>
                </div>
              </div>
            </div>

            <!-- Right: Entity Editor -->
            <div class="onto-entity-editor">
              <template v-if="editingEntity">
                <div class="entity-editor-header">
                  <span class="editor-entity-name">{{ editingEntity.icon }} {{ editingEntity.name }}</span>
                  <span class="editor-entity-desc">{{ editingEntity.description }}</span>
                </div>

                <!-- Properties Section -->
                <div class="editor-section">
                  <div class="editor-section-header">
                    <span>📋 属性</span>
                    <a-button size="small" type="primary" ghost @click="addProperty">+ 添加属性</a-button>
                  </div>
                  <div class="editor-section-list">
                    <div v-for="prop in editingEntity.properties" :key="prop.id" class="editor-row">
                      <span class="row-name">{{ prop.name }}</span>
                      <span class="row-type">{{ typeLabel(prop.type) }}</span>
                      <span v-if="prop.required" class="row-required">必填</span>
                      <span v-if="prop.type === 'enum'" class="row-enum">{{ prop.enumValues?.join(', ') }}</span>
                      <span v-if="prop.example" class="row-example">例: {{ prop.example }}</span>
                      <span class="row-actions">
                        <a-button size="small" type="link" @click="editProperty(prop)">✏️</a-button>
                        <a-button size="small" type="link" danger @click="deleteProperty(prop)">🗑</a-button>
                      </span>
                    </div>
                    <div v-if="!editingEntity.properties?.length" class="editor-empty">暂无属性，点击上方添加</div>
                  </div>
                </div>

                <!-- Relations Section -->
                <div class="editor-section">
                  <div class="editor-section-header">
                    <span>🔗 关系</span>
                    <a-button size="small" type="primary" ghost @click="addRelation">+ 添加关系</a-button>
                  </div>
                  <div class="editor-section-list">
                    <div v-for="rel in editingEntity.relations" :key="rel.id || rel.label + rel.targetEntity" class="editor-row">
                      <span class="row-name">{{ rel.label }}</span>
                      <span class="row-type">{{ relTypeLabel(rel.type) }}</span>
                      <span class="row-target">→ {{ entityName(rel.targetEntity) }}</span>
                      <span class="row-actions">
                        <a-button size="small" type="link" @click="editRelation(rel)">✏️</a-button>
                        <a-button size="small" type="link" danger @click="deleteRelation(rel)">🗑</a-button>
                      </span>
                    </div>
                    <div v-if="!editingEntity.relations?.length" class="editor-empty">暂无关系，点击上方添加</div>
                  </div>
                </div>
              </template>
              <div v-else class="editor-empty-state">
                <span class="empty-icon">👈</span><span>请选择或创建一个实体</span>
              </div>
            </div>
          </div>
        </template>

        <!-- List Mode -->
        <template v-else>
          <div v-if="!ontologies.length" class="empty-state"><span class="empty-icon">🧠</span><span class="empty-text">暂无本体，点击下方按钮创建</span></div>
      <div v-else class="onto-list">
        <div v-for="onto in ontoStats" :key="onto.id" class="onto-card" @click="viewOntology(onto)">
          <div class="onto-card-top">
            <span class="onto-icon">{{ onto.icon }}</span>
            <span class="onto-name">{{ onto.name }}</span>
            <span class="onto-status" :class="'onto-' + onto.status">{{ onto.status === 'published' ? '🟢 已发布' : '🟡 草稿' }}</span>
          </div>
          <div class="onto-desc">{{ onto.description }}</div>
          <div class="onto-meta">
            <span>{{ onto.entityCount }}个实体</span>
            <span>{{ onto.propertyCount }}个属性</span>
            <span>{{ onto.relationCount }}个关系</span>
            <span>v{{ onto.version }}</span>
          </div>
          <div class="onto-footer">
            <span class="onto-date">更新于 {{ onto.updatedAt }}</span>
            <span v-if="onto.boundAgents?.length" class="onto-bound">🤖 绑定: {{ onto.boundAgents.map(a => agentName(a)).join('、') }}</span>
            <span v-else class="onto-bound-none">未绑定</span>
          </div>
          <div class="onto-actions" @click.stop>
            <a-button size="small">📝 编辑</a-button>
            <a-button size="small" danger>🗑 删除</a-button>
            <a-button size="small">📤 导出</a-button>
          </div>
        </div>
      </div>
      <a-button type="dashed" block @click="showOntoModal" style="margin-top: 4px;">+ 创建本体</a-button>
    </template>
    </template>
    </div>
  </div>

    <!-- DB Connection Modal -->
    <a-modal v-model:open="dbModalOpen" :title="editingDb ? '编辑数据库连接' : '🔗 连接数据库'" @ok="saveDb" @cancel="dbModalOpen = false" width="520px" ok-text="💾 保存" cancel-text="取消">
      <a-form :model="dbForm" layout="vertical">
        <a-form-item label="连接名称"><a-input v-model:value="dbForm.name" placeholder="如：金蝶ERP生产库" /></a-form-item>
        <a-row :gutter="16">
          <a-col :span="8"><a-form-item label="数据库类型"><a-select v-model:value="dbForm.type"><a-select-option value="mysql">MySQL</a-select-option><a-select-option value="postgresql">PostgreSQL</a-select-option><a-select-option value="sqlserver">SQL Server</a-select-option><a-select-option value="oracle">Oracle</a-select-option></a-select></a-form-item></a-col>
          <a-col :span="12"><a-form-item label="主机地址"><a-input v-model:value="dbForm.host" placeholder="192.168.1.100" /></a-form-item></a-col>
          <a-col :span="4"><a-form-item label="端口"><a-input v-model:value="dbForm.port" placeholder="3306" /></a-form-item></a-col>
        </a-row>
        <a-form-item label="数据库名"><a-input v-model:value="dbForm.database" placeholder="kingdee_prod" /></a-form-item>
        <a-row :gutter="16">
          <a-col :span="12"><a-form-item label="用户名"><a-input v-model:value="dbForm.username" placeholder="reader" /></a-form-item></a-col>
          <a-col :span="12"><a-form-item label="密码"><a-input-password v-model:value="dbForm.password" placeholder="输入密码" /></a-form-item></a-col>
        </a-row>
        <div class="db-test-area">
          <a-button @click="testDbForm">🔗 测试连接</a-button>
          <span class="db-test-result" :class="dbTestResult.status">{{ dbTestResult.msg }}</span>
        </div>
      </a-form>
    </a-modal>

    <!-- Ontology Modal -->
    <a-modal v-model:open="ontoModalOpen" title="🧠 创建本体" @ok="createOntology" @cancel="ontoModalOpen = false" width="480px" ok-text="💾 创建" cancel-text="取消">
      <a-form :model="ontoForm" layout="vertical">
        <a-form-item label="本体名称"><a-input v-model:value="ontoForm.name" placeholder="如：税务核心本体" /></a-form-item>
        <a-form-item label="描述"><a-textarea v-model:value="ontoForm.description" rows="3" placeholder="描述本体的用途和覆盖范围..." /></a-form-item>
      </a-form>
    </a-modal>

    <!-- Entity Rename Modal -->
    <a-modal v-model:open="entityModalOpen" title="✏️ 重命名实体" @ok="saveEntityRename" @cancel="entityModalOpen = false" width="460px" ok-text="💾 保存" cancel-text="取消">
      <a-form :model="entityForm" layout="vertical">
        <a-form-item label="实体名称"><a-input v-model:value="entityForm.name" placeholder="如：发票" /></a-form-item>
        <a-form-item label="图标">
          <a-select v-model:value="entityForm.icon">
            <a-select-option value="📄">📄 文档</a-select-option>
            <a-select-option value="🏢">🏢 公司</a-select-option>
            <a-select-option value="🏪">🏪 门店</a-select-option>
            <a-select-option value="📋">📋 申报</a-select-option>
            <a-select-option value="📝">📝 明细</a-select-option>
            <a-select-option value="👤">👤 人员</a-select-option>
            <a-select-option value="🔗">🔗 链接</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="描述"><a-textarea v-model:value="entityForm.description" rows="2" placeholder="实体的业务含义..." /></a-form-item>
      </a-form>
    </a-modal>

    <!-- Property Modal -->
    <a-modal v-model:open="propModalOpen" :title="propForm.id ? '✏️ 编辑属性' : '📋 添加属性'" @ok="saveProperty" @cancel="propModalOpen = false" width="500px" ok-text="💾 保存" cancel-text="取消">
      <a-form :model="propForm" layout="vertical">
        <a-form-item label="属性名称"><a-input v-model:value="propForm.name" placeholder="如：发票号码" /></a-form-item>
        <a-form-item label="数据类型">
          <a-select v-model:value="propForm.type">
            <a-select-option value="string">🔤 文本</a-select-option>
            <a-select-option value="number">🔢 数字</a-select-option>
            <a-select-option value="date">📅 日期</a-select-option>
            <a-select-option value="enum">📋 枚举</a-select-option>
            <a-select-option value="boolean">✅ 布尔</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item v-if="propForm.type === 'enum'" label="枚举值（逗号分隔）">
          <a-input v-model:value="propForm.enumValuesStr" placeholder="0%, 3%, 6%, 9%, 13%" />
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12"><a-form-item label="示例值"><a-input v-model:value="propForm.example" placeholder="123456789012" /></a-form-item></a-col>
          <a-col :span="12"><a-form-item label=" "><a-checkbox v-model:checked="propForm.required">必填</a-checkbox></a-form-item></a-col>
        </a-row>
      </a-form>
    </a-modal>

    <!-- Relation Modal -->
    <a-modal v-model:open="relationModalOpen" :title="relationForm.id ? '✏️ 编辑关系' : '🔗 添加关系'" @ok="saveRelation" @cancel="relationModalOpen = false" width="500px" ok-text="💾 保存" cancel-text="取消">
      <a-form :model="relationForm" layout="vertical">
        <a-form-item label="关系标签"><a-input v-model:value="relationForm.label" placeholder="如：所属公司" /></a-form-item>
        <a-form-item label="目标实体">
          <a-select v-model:value="relationForm.targetEntity">
            <a-select-option v-for="ent in editingOntology?.entities || []" :key="ent.id" :value="ent.id">
              {{ ent.icon }} {{ ent.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="关系类型">
          <a-select v-model:value="relationForm.type">
            <a-select-option value="belongsTo">🔗 属于 (belongsTo)</a-select-option>
            <a-select-option value="hasMany">🔗 拥有多个 (hasMany)</a-select-option>
            <a-select-option value="relatesTo">🔗 关联 (relatesTo)</a-select-option>
            <a-select-option value="contains">🔗 包含 (contains)</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { knowledgeCategories, ontologies } from '../mockData.js'

const categories = knowledgeCategories
const activeSrc = ref('file')
const fileQuery = ref('')
const expandedCat = ref('kb-tax')
const uploading = ref(false)
const uploadProgress = ref(0)
const dbConnections = ref([
  { name: '金蝶ERP生产库', type: 'mysql', host: '192.168.1.100', port: 3306, database: 'kingdee_prod', username: 'reader', status: 'connected', latency: '12ms', boundAgents: ['agent-declare', 'agent-certify'] },
  { name: '税局接口数据库', type: 'postgresql', host: '10.0.0.50', port: 5432, database: 'tax_api', username: 'api_reader', status: 'connected', latency: '8ms', boundAgents: ['agent-risk'] },
])
const dbModalOpen = ref(false)
const editingDb = ref(null)
const dbTestResult = reactive({ status: '', msg: '' })
const ontoModalOpen = ref(false)
const ontoForm = reactive({ name: '', description: '' })
const editingOntology = ref(null)
const editingEntity = ref(null)
const entityForm = reactive({ id: '', name: '', icon: '📄', description: '' })
const propForm = reactive({ id: '', name: '', type: 'string', required: false, constraints: [], enumValues: [], enumValuesStr: '', example: '' })
const relationForm = reactive({ id: '', targetEntity: '', type: 'belongsTo', label: '' })
const propModalOpen = ref(false)
const relationModalOpen = ref(false)
const entityModalOpen = ref(false)

const ontoStats = computed(() => ontologies.map(o => ({
  ...o,
  entityCount: o.entities?.length || 0,
  propertyCount: o.entities?.reduce((s, e) => s + (e.properties?.length || 0), 0) || 0,
  relationCount: o.entities?.reduce((s, e) => s + (e.relations?.length || 0), 0) || 0,
})))

const dbForm = reactive({
  name: '', type: 'mysql', host: '', port: '3306', database: '', username: '', password: '',
})

function agentName(id) {
  const map = { 'agent-assistant': '杨姐的助理', 'agent-certify': '认证专员', 'agent-risk': '预警官', 'agent-declare': '申报管家', 'agent-compliance': '合规师' }
  return map[id] || id
}

function typeLabel(t) {
  return { string: '文本', number: '数字', date: '日期', enum: '枚举', boolean: '布尔' }[t] || t
}

function relTypeLabel(t) {
  return { belongsTo: '属于', hasMany: '拥有多个', relatesTo: '关联', contains: '包含', references: '引用' }[t] || t
}

function entityName(id) {
  if (!editingOntology.value) return id
  const e = editingOntology.value.entities.find(x => x.id === id)
  return e ? e.name : id
}

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

function showDbModal() { editingDb.value = null; Object.assign(dbForm, { name: '', type: 'mysql', host: '', port: '3306', database: '', username: '', password: '' }); dbTestResult.msg = ''; dbModalOpen.value = true }

function editDb(db) { editingDb.value = db; Object.assign(dbForm, { name: db.name, type: db.type, host: db.host, port: String(db.port), database: db.database, username: db.username, password: '' }); dbTestResult.msg = ''; dbModalOpen.value = true }

function saveDb() {
  const entry = { name: dbForm.name, type: dbForm.type, host: dbForm.host, port: parseInt(dbForm.port) || 3306, database: dbForm.database, username: dbForm.username, status: 'connected', latency: '—', boundAgents: [] }
  if (editingDb.value) { Object.assign(editingDb.value, entry) } else { dbConnections.value.push(entry) }
  dbModalOpen.value = false
}

function testDbForm() { dbTestResult.status = 'success'; dbTestResult.msg = '✅ 连接成功！延迟 15ms' }

function testDb(db) { db.latency = Math.floor(Math.random() * 30 + 5) + 'ms'; db.status = 'connected' }

function disconnectDb(i) { dbConnections.value[i].status = 'disconnected' }

function showOntoModal() {
  ontoForm.name = ''; ontoForm.description = ''; ontoModalOpen.value = true
}

function createOntology() {
  if (!ontoForm.name) return
  ontologies.unshift({
    id: 'onto-' + Date.now(),
    name: ontoForm.name,
    description: ontoForm.description || '暂无描述',
    icon: '🧠',
    status: 'draft',
    version: 1,
    entityCount: 0,
    propertyCount: 0,
    relationCount: 0,
    boundAgents: [],
    entities: [],
    createdAt: new Date().toISOString().slice(0, 10),
    updatedAt: new Date().toISOString().slice(0, 10),
  })
  ontoModalOpen.value = false
}

function viewOntology(onto) {
  editingOntology.value = onto
  editingEntity.value = (onto.entities && onto.entities.length > 0) ? onto.entities[0] : null
}

function selectEntity(ent) { editingEntity.value = ent }

function addEntity() {
  if (!editingOntology.value) return
  const ent = { id: 'ent-' + Date.now(), name: '新实体', icon: '📄', description: '', properties: [], relations: [] }
  editingOntology.value.entities.push(ent)
  editingEntity.value = ent
}

function deleteEntity(ent) {
  if (!editingOntology.value) return
  const idx = editingOntology.value.entities.indexOf(ent)
  if (idx > -1) {
    editingOntology.value.entities.splice(idx, 1)
    editingEntity.value = editingOntology.value.entities.length ? editingOntology.value.entities[0] : null
  }
}

function renameEntity(ent) {
  entityForm.id = ent.id; entityForm.name = ent.name; entityForm.icon = ent.icon; entityForm.description = ent.description
  entityModalOpen.value = true
}

function saveEntityRename() {
  const ent = editingOntology.value.entities.find(e => e.id === entityForm.id)
  if (ent) { ent.name = entityForm.name; ent.icon = entityForm.icon; ent.description = entityForm.description }
  entityModalOpen.value = false
}

function addProperty() {
  propForm.id = ''; propForm.name = ''; propForm.type = 'string'; propForm.required = false; propForm.constraints = []; propForm.enumValues = []; propForm.enumValuesStr = ''; propForm.example = ''
  propModalOpen.value = true
}

function editProperty(prop) {
  Object.assign(propForm, prop)
  propModalOpen.value = true
}

function saveProperty() {
  if (!editingEntity.value) return
  const data = { ...propForm }
  if (data.type === 'enum') {
    data.enumValues = data.enumValuesStr ? data.enumValuesStr.split(/[,，]\s*/).filter(Boolean) : []
  } else {
    data.enumValues = []
  }
  delete data.enumValuesStr
  if (!data.id) {
    data.id = 'prop-' + Date.now()
    editingEntity.value.properties.push(data)
  } else {
    const p = editingEntity.value.properties.find(x => x.id === data.id)
    if (p) Object.assign(p, data)
  }
  propModalOpen.value = false
}

function deleteProperty(prop) {
  if (!editingEntity.value) return
  const idx = editingEntity.value.properties.indexOf(prop)
  if (idx > -1) editingEntity.value.properties.splice(idx, 1)
}

function addRelation() {
  relationForm.targetEntity = ''; relationForm.type = 'belongsTo'; relationForm.label = ''
  relationModalOpen.value = true
}

function editRelation(rel) {
  Object.assign(relationForm, rel)
  relationModalOpen.value = true
}

function saveRelation() {
  if (!editingEntity.value) return
  if (!relationForm.label) return
  if (!relationForm.id) {
    relationForm.id = 'rel-' + Date.now()
    editingEntity.value.relations.push({ ...relationForm })
  } else {
    const r = editingEntity.value.relations.find(x => x.id === relationForm.id)
    if (r) Object.assign(r, relationForm)
  }
  relationModalOpen.value = false
}

function deleteRelation(rel) {
  if (!editingEntity.value) return
  const idx = editingEntity.value.relations.indexOf(rel)
  if (idx > -1) editingEntity.value.relations.splice(idx, 1)
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
.empty-state { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 40px 0; color: #bfbfbf; }
.empty-icon { font-size: 36px; }
.empty-text { font-size: 14px; }
.upload-zone { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 24px; border: 2px dashed #d9d9d9; border-radius: 8px; background: #fafafa; cursor: pointer; transition: border-color 0.2s; }
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
.db-test-area { display: flex; align-items: center; gap: 12px; margin-top: 8px; }
.db-test-result { font-size: 12px; }
.db-test-result.success { color: #52c41a; }
.db-test-result.fail { color: #f5222d; }

/* ===== 本体视图 ===== */
.onto-list { display: flex; flex-direction: column; gap: 10px; }
.onto-card { padding: 14px; border: 1px solid #e8e8e8; border-radius: 8px; background: #fff; cursor: pointer; transition: box-shadow 0.2s; }
.onto-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.onto-card-top { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.onto-icon { font-size: 20px; }
.onto-name { font-size: 15px; font-weight: 600; color: #1a1a2e; flex: 1; }
.onto-status { font-size: 11px; padding: 1px 6px; border-radius: 3px; }
.onto-published { color: #52c41a; background: #f6ffed; }
.onto-draft { color: #fa8c16; background: #fff7e6; }
.onto-desc { font-size: 12px; color: #8c8c8c; margin-bottom: 4px; }
.onto-meta { display: flex; gap: 12px; font-size: 11px; color: #8c8c8c; margin-bottom: 4px; }
.onto-footer { display: flex; gap: 12px; font-size: 11px; align-items: center; margin-bottom: 10px; }
.onto-date { color: #bfbfbf; }
.onto-bound { color: #1677ff; }
.onto-bound-none { color: #d9d9d9; }
.onto-actions { display: flex; gap: 6px; }

/* ===== 本体编辑器 ===== */
.onto-editor-toolbar { display: flex; align-items: center; gap: 12px; padding-bottom: 12px; border-bottom: 1px solid #f0f0f0; flex-shrink: 0; }
.onto-editor-title { font-size: 15px; font-weight: 600; color: #1a1a2e; flex: 1; }
.onto-editor-body { display: flex; gap: 16px; flex: 1; min-height: 0; overflow: hidden; }
.onto-entity-list { width: 220px; flex-shrink: 0; overflow-y: auto; display: flex; flex-direction: column; gap: 2px; border-right: 1px solid #f0f0f0; padding-right: 12px; }
.onto-entity-item { display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; border-radius: 6px; cursor: pointer; transition: all 0.15s; }
.onto-entity-item:hover { background: #f5f6fa; }
.entity-active { background: #f0f5ff !important; }
.entity-item-top { display: flex; align-items: center; gap: 6px; }
.entity-icon { font-size: 16px; }
.entity-name { font-size: 13px; font-weight: 500; color: #1a1a2e; }
.entity-counts { font-size: 11px; color: #bfbfbf; }
.entity-item-actions { display: flex; gap: 2px; opacity: 0; transition: opacity 0.15s; }
.onto-entity-item:hover .entity-item-actions { opacity: 1; }

.onto-entity-editor { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; }
.entity-editor-header { margin-bottom: 4px; }
.editor-entity-name { font-size: 16px; font-weight: 600; color: #1a1a2e; }
.editor-entity-desc { font-size: 12px; color: #8c8c8c; margin-left: 8px; }
.editor-section { border: 1px solid #e8e8e8; border-radius: 6px; background: #fff; overflow: hidden; }
.editor-section-header { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #fafafa; border-bottom: 1px solid #e8e8e8; font-size: 13px; font-weight: 500; }
.editor-section-list { padding: 4px 0; }
.editor-row { display: flex; align-items: center; gap: 8px; padding: 6px 12px; font-size: 13px; border-bottom: 1px solid #f5f5f5; }
.editor-row:last-child { border-bottom: none; }
.editor-row:hover { background: #fafafa; }
.row-name { font-weight: 500; color: #1a1a2e; min-width: 80px; }
.row-type { color: #8c8c8c; font-size: 12px; background: #f5f5f5; padding: 1px 5px; border-radius: 3px; }
.row-required { color: #f5222d; font-size: 11px; }
.row-enum { color: #1677ff; font-size: 11px; }
.row-example { color: #bfbfbf; font-size: 11px; }
.row-target { color: #722ed1; font-size: 13px; font-weight: 500; }
.row-actions { margin-left: auto; display: flex; gap: 2px; opacity: 0; transition: opacity 0.15s; }
.editor-row:hover .row-actions { opacity: 1; }
.editor-empty { padding: 20px; text-align: center; font-size: 12px; color: #bfbfbf; }
.editor-empty-state { display: flex; align-items: center; justify-content: center; gap: 8px; height: 100%; font-size: 14px; color: #bfbfbf; }
.editor-empty-state .empty-icon { font-size: 24px; }
</style>
