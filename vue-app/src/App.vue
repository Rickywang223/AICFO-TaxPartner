<template>
  <div class="app-layout">
    <!-- 顶部栏 -->
    <header class="app-header">
      <div class="header-left">
        <img :src="logoUrl" alt="云砾" class="logo-img" />
        <div class="header-divider"></div>
        <span class="logo-text">AI CFO · 智能税务合伙人</span>
        <div class="header-client">
          <span class="client-tag">凯德地产</span>
        </div>
      </div>
      <div class="header-right">
        <div class="header-user">
          <span class="user-role">税务经理</span>
          <span class="user-name">杨姐</span>
          <span class="user-avatar">👩‍💼</span>
        </div>
      </div>
    </header>

    <div class="app-body">
      <!-- 左侧导航栏 -->
      <aside class="app-sidebar">
        <div class="section-label">🤖 我的智能体</div>
        <div class="agent-list">
          <div
            v-for="agent in agents"
            :key="agent.id"
            class="agent-item"
            :class="{ 'agent-selected': isAgentActive(agent.id) }"
            @click="switchAgent(agent)"
          >
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
        </div>

        <div class="sidebar-divider"></div>

        <div class="section-label">🛠 工具</div>
        <div class="tool-list">
          <router-link to="/capabilities" class="tool-item" :class="{ 'tool-active': $route.path === '/capabilities' }">
            <span class="tool-icon">🔧</span>
            <span class="tool-name">能力中心</span>
          </router-link>
          <router-link to="/knowledge" class="tool-item" :class="{ 'tool-active': $route.path === '/knowledge' }">
            <span class="tool-icon">📚</span>
            <span class="tool-name">知识库</span>
          </router-link>
          <router-link to="/agent-manage" class="tool-item" :class="{ 'tool-active': $route.path === '/agent-manage' }">
            <span class="tool-icon">🤖</span>
            <span class="tool-name">管理智能体</span>
          </router-link>
        </div>
      </aside>

      <!-- 主内容区 -->
      <main class="app-main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { agents, getBadgeColor as badgeColor } from './mockData.js'
import logoUrl from './assets/logo.jpg'

const route = useRoute()
const router = useRouter()

function isAgentActive(agentId) {
  return route.path.startsWith('/workspace/') && route.params.agentId === agentId
}

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

/* ===== 整体布局 ===== */
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

/* ===== 顶部栏 ===== */
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  padding: 0 24px;
  flex-shrink: 0;
  z-index: 10;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 0;
}
.logo-img {
  height: 26px;
}
.header-divider {
  width: 1px;
  height: 20px;
  background: #e0e0e0;
  margin: 0 16px;
}
.logo-text {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a2e;
  letter-spacing: 0.3px;
}
.header-client {
  margin-left: 16px;
  padding-left: 16px;
  border-left: 1px solid #e0e0e0;
}
.client-tag {
  font-size: 13px;
  color: #595959;
  background: #f5f6fa;
  padding: 2px 10px;
  border-radius: 4px;
  font-weight: 500;
}
.header-right {
  display: flex;
  align-items: center;
}
.header-user {
  display: flex;
  align-items: center;
  gap: 8px;
}
.user-role {
  font-size: 12px;
  color: #8c8c8c;
}
.user-name {
  font-size: 13px;
  font-weight: 500;
  color: #1a1a2e;
}
.user-avatar {
  font-size: 20px;
}

/* ===== 主体区域 ===== */
.app-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* ===== 左侧导航栏 ===== */
.app-sidebar {
  width: 220px;
  background: #fff;
  border-right: 1px solid #e8e8e8;
  padding: 16px 0;
  overflow-y: auto;
  flex-shrink: 0;
}

.section-label {
  font-size: 12px;
  color: #8c8c8c;
  padding: 4px 16px 8px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

/* Agent List */
.agent-list {
  padding: 0 8px;
}
.agent-item {
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 2px;
  transition: background 0.15s;
}
.agent-item:hover {
  background: #f5f6fa;
}
.agent-selected {
  background: #f0f5ff !important;
}
.agent-selected .agent-name {
  color: #1677ff;
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

/* Divider */
.sidebar-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 12px 16px;
}

/* Tool List */
.tool-list {
  padding: 0 8px;
}
.tool-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border-radius: 6px;
  cursor: pointer;
  text-decoration: none;
  color: #595959;
  font-size: 13px;
  transition: background 0.15s;
  margin-bottom: 2px;
}
.tool-item:hover {
  background: #f5f6fa;
  color: #1a1a2e;
}
.tool-active {
  background: #f0f5ff !important;
  color: #1677ff !important;
}
.tool-icon {
  font-size: 14px;
}
.tool-name {
  font-size: 13px;
}

/* ===== 主内容区 ===== */
.app-main {
  flex: 1;
  background: #f5f6fa;
  overflow: hidden;
}

/* Sidebar scroll */
.app-sidebar::-webkit-scrollbar {
  width: 4px;
}
.app-sidebar::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 2px;
}
</style>
