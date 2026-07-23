<template>
  <div class="app-layout">
    <!-- 顶部栏 -->
    <header class="app-header">
      <div class="header-left">
        <img :src="logoUrl" alt="云砾" class="logo-img" />
      </div>
      <div class="header-center">
        <span class="header-title">AI CFO · 智能税务合伙人</span>
      </div>
      <div class="header-right">
        <span class="client-tag">凯德地产</span>
        <div class="right-divider"></div>
        <button class="icon-btn" title="客服">💬</button>
        <button class="icon-btn" title="帮助文档">📖</button>
        <a-badge :count="3" :offset="[-2, 2]" size="small">
          <button class="icon-btn" title="通知">🔔</button>
        </a-badge>
        <div class="right-divider"></div>
        <span class="user-name">杨姐</span>
      </div>
    </header>

    <div class="app-body">
      <!-- 左侧导航栏：三段式 -->
      <aside class="app-sidebar">

        <!-- 第一部分：智能体驾驶舱 -->
        <div class="nav-section">
          <router-link to="/cockpit" class="nav-item cockpit-item" :class="{ 'nav-active': $route.path === '/cockpit' }">
            <span class="nav-icon">🏁</span>
            <span class="nav-name">智能体驾驶舱</span>
          </router-link>
        </div>

        <div class="section-divider"></div>

        <!-- 第二部分：智能体列表 -->
        <div class="nav-section agent-section">
          <div v-for="agent in sortedAgents" :key="agent.id" class="nav-item agent-nav-item"
            :class="{ 'nav-active': isAgentActive(agent.id) }" @click="switchAgent(agent)">
            <span class="nav-icon">{{ agent.icon }}</span>
            <span class="nav-name">{{ agent.name }}</span>
            <span v-if="agent.pendingCount > 0" class="pending-dot">{{ agent.pendingCount > 99 ? '99+' : agent.pendingCount }}</span>
          </div>
        </div>

        <div class="section-divider"></div>

        <!-- 第三部分：系统模块 -->
        <div class="nav-section">
          <router-link to="/capabilities" class="nav-item" :class="{ 'nav-active': $route.path === '/capabilities' }">
            <span class="nav-icon">⚡</span>
            <span class="nav-name">能力中心</span>
          </router-link>
          <router-link to="/knowledge" class="nav-item" :class="{ 'nav-active': $route.path === '/knowledge' }">
            <span class="nav-icon">📚</span>
            <span class="nav-name">知识库</span>
          </router-link>
          <router-link to="/agent-manage" class="nav-item" :class="{ 'nav-active': $route.path === '/agent-manage' }">
            <span class="nav-icon">🤖</span>
            <span class="nav-name">管理智能体</span>
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
import { getSortedAgents } from './mockData.js'
import logoUrl from './assets/logo.jpg'

const route = useRoute()
const router = useRouter()

const sortedAgents = getSortedAgents()

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
  height: 56px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  padding: 0 24px;
  flex-shrink: 0;
  z-index: 10;
  position: relative;
}
.header-left {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
.logo-img {
  height: 26px;
}
.header-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
}
.header-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a2e;
  letter-spacing: 0.3px;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
  flex-shrink: 0;
}
.client-tag {
  font-size: 13px;
  color: #595959;
  background: #f5f6fa;
  padding: 2px 10px;
  border-radius: 4px;
  font-weight: 500;
}
.right-divider {
  width: 1px;
  height: 16px;
  background: #e0e0e0;
  margin: 0 4px;
}
.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 4px 6px;
  border-radius: 4px;
  line-height: 1;
  transition: background 0.15s;
}
.icon-btn:hover {
  background: #f0f0f0;
}
.user-name {
  font-size: 13px;
  font-weight: 500;
  color: #1a1a2e;
  margin-left: 4px;
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
  padding: 12px 0;
  overflow-y: auto;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

/* Section divider */
.section-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 8px 12px;
  flex-shrink: 0;
}

/* Navigation sections */
.nav-section {
  padding: 0 8px;
  flex-shrink: 0;
}
.agent-section {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

/* Unified nav item */
.nav-item {
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
  position: relative;
}
.nav-item:hover {
  background: #f5f6fa;
  color: #1a1a2e;
}
.nav-active {
  background: #f0f5ff !important;
  color: #1677ff !important;
  font-weight: 500;
}
.nav-icon {
  font-size: 16px;
  width: 22px;
  text-align: center;
  flex-shrink: 0;
}
.nav-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Cockpit item special styling */
.cockpit-item {
  background: #fff;
}

/* Pending red dot */
.pending-dot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: #f5222d;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  flex-shrink: 0;
}

/* Agent section scroll */
.agent-section::-webkit-scrollbar {
  width: 4px;
}
.agent-section::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 2px;
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
