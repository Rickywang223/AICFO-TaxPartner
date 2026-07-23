<template>
  <a-layout style="min-height: 100vh">
    <!-- 顶部栏 -->
    <a-layout-header class="top-header">
      <img src="/logo.svg" alt="云砾" class="logo-img" />
      <div class="header-right">
        <a-button type="text" class="header-btn">⚙️ 设置</a-button>
        <a-button type="text" danger class="header-btn">🆘 SOS</a-button>
      </div>
    </a-layout-header>

    <a-layout>
      <!-- 左侧栏 -->
      <a-layout-sider width="240" class="side-sider" :collapsible="false">
        <div class="section-label">🤖 我的智能体</div>
        <a-menu
          mode="inline"
          :selectedKeys="[]"
          class="agent-menu"
        >
          <a-menu-item
            v-for="agent in agents"
            :key="agent.id"
            @click="selectAgent(agent)"
            :class="{ 'agent-active': selectedAgent?.id === agent.id }"
          >
            <div class="agent-item">
              <div class="agent-top">
                <span class="agent-icon">{{ agent.icon }}</span>
                <span class="agent-name">{{ agent.name }}</span>
                <a-tag
                  :color="badgeColor(agent.status)"
                  size="small"
                  class="agent-badge"
                >{{ agent.badge }}</a-tag>
              </div>
              <div class="agent-summary">{{ agent.summary }}</div>
            </div>
          </a-menu-item>
        </a-menu>

        <a-divider style="margin: 12px 0" />

        <div class="section-label">🛠 工具</div>
        <a-menu mode="inline" :selectedKeys="[currentRoute]" class="tool-menu">
          <a-menu-item key="/capabilities">
            <router-link to="/capabilities">🔧 能力中心</router-link>
          </a-menu-item>
          <a-menu-item key="/knowledge">
            <router-link to="/knowledge">📚 知识库</router-link>
          </a-menu-item>
          <a-menu-item key="/agents">
            <router-link to="/agents">🤖 管理智能体</router-link>
          </a-menu-item>
        </a-menu>
      </a-layout-sider>

      <!-- 主内容区 -->
      <a-layout-content class="main-content">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const currentRoute = computed(() => route.path)

const agents = ref([
  { id:'agent-assistant', icon:'👩‍💼', name:'杨姐的税务助理', status:'urgent', badge:'3项紧急', summary:'今天有3件事需要处理' },
  { id:'agent-certify', icon:'📄', name:'发票认证专员', status:'warning', badge:'45%完成', summary:'还剩23张待认证' },
  { id:'agent-risk', icon:'⚠️', name:'风险预警官', status:'urgent', badge:'2家高危', summary:'新增1家风险公司' },
  { id:'agent-declare', icon:'📋', name:'申报管家', status:'normal', badge:'96%完成', summary:'距截止还有12天' },
  { id:'agent-compliance', icon:'🔍', name:'稽查合规师', status:'warning', badge:'新预警', summary:'税负率1.78%正常' },
])

const selectedAgent = ref(agents.value[0])

function selectAgent(agent) {
  selectedAgent.value = agent
}

function badgeColor(status) {
  return status === 'urgent' ? 'red' : status === 'warning' ? 'orange' : 'green'
}
</script>

<style>
.top-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  padding: 0 20px;
  line-height: 48px;
}
.logo-img { height: 26px; }
.header-right { display: flex; gap: 4px; }
.header-btn { font-size: 13px; }
.side-sider {
  background: #fff;
  border-right: 1px solid #f0f0f0;
  padding: 12px 0;
}
.section-label {
  font-size: 12px;
  color: #8c8c8c;
  padding: 4px 16px 8px;
  font-weight: 500;
}
.agent-menu, .tool-menu {
  border-inline-end: none !important;
}
.agent-item { padding: 4px 0; }
.agent-top { display: flex; align-items: center; gap: 6px; }
.agent-icon { font-size: 16px; }
.agent-name { font-size: 13px; font-weight: 500; }
.agent-badge { font-size: 11px; margin-left: auto; }
.agent-summary { font-size: 12px; color: #8c8c8c; margin-top: 2px; }
.agent-active {
  background: #f0f5ff !important;
}
.main-content {
  background: #f5f5f5;
  padding: 24px;
  overflow-y: auto;
}
</style>
