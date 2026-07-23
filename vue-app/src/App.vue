<template>
  <a-layout style="min-height: 100vh">
    <!-- 顶部栏 -->
    <a-layout-header class="top-header">
      <div class="header-left">
        <img :src="logoUrl" alt="云砾" class="logo-img" />
        <span class="logo-text">AI CFO · 智能税务合伙人</span>
      </div>
      <div class="header-right">
        <a-badge :count="3" :offset="[-4, 4]" size="small">
          <a-button type="text" class="header-btn">🔔 通知</a-button>
        </a-badge>
        <a-button type="text" class="header-btn">⚙️ 设置</a-button>
        <a-button type="text" danger class="header-btn">🆘 SOS</a-button>
      </div>
    </a-layout-header>

    <a-layout>
      <!-- 左侧导航栏 -->
      <a-layout-sider width="220" class="side-sider" :collapsible="false">
        <div class="section-label">🤖 我的智能体</div>
        <a-menu
          mode="inline"
          :selectedKeys="[currentAgentId]"
          class="agent-menu"
        >
          <a-menu-item
            v-for="agent in agents"
            :key="agent.id"
            @click="switchAgent(agent)"
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
          <a-menu-item key="/agent-manage">
            <router-link to="/agent-manage">🤖 管理智能体</router-link>
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
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { agents, getBadgeColor as badgeColor } from './mockData.js'
import logoUrl from './assets/logo.jpg'

const route = useRoute()
const router = useRouter()

const currentRoute = computed(() => route.path)

// Extract current agent ID from route params (workspace/:agentId)
const currentAgentId = computed(() => {
  if (route.path.startsWith('/workspace/')) {
    return route.params.agentId
  }
  // When on a tool page, highlight none
  return ''
})

function switchAgent(agent) {
  router.push(`/workspace/${agent.id}`)
}
</script>

<style>
/* Global reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Top Header */
.top-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  padding: 0 20px;
  line-height: 56px;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.logo-img {
  height: 28px;
}
.logo-text {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 4px;
}
.header-btn {
  font-size: 13px;
}

/* Sidebar */
.side-sider {
  background: #fff;
  border-right: 1px solid #f0f0f0;
  padding: 16px 0;
  overflow-y: auto;
}
.section-label {
  font-size: 12px;
  color: #8c8c8c;
  padding: 4px 16px 8px;
  font-weight: 500;
  letter-spacing: 0.5px;
}
.agent-menu, .tool-menu {
  border-inline-end: none !important;
}

/* Agent Item */
.agent-item {
  padding: 4px 0;
}
.agent-top {
  display: flex;
  align-items: center;
  gap: 6px;
}
.agent-icon {
  font-size: 18px;
}
.agent-name {
  font-size: 13px;
  font-weight: 500;
  color: #1a1a2e;
}
.agent-badge {
  margin-left: auto;
  font-size: 11px;
  line-height: 18px;
}
.agent-summary {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Selected agent in sidebar */
.ant-menu-item-selected {
  background: #f0f5ff !important;
}
.ant-menu-item-selected .agent-name {
  color: #1677ff;
}

/* Tool menu */
.tool-menu .ant-menu-item {
  height: 36px;
  line-height: 36px;
  font-size: 13px;
}

/* Main Content Area */
.main-content {
  background: #f5f6fa;
  overflow: hidden;
}

/* Sidebar scroll */
.side-sider::-webkit-scrollbar {
  width: 4px;
}
.side-sider::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 2px;
}
</style>
