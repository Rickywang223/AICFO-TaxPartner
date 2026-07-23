<template>
  <div class="cockpit-page">
    <div class="cockpit-header">
      <h2>🏁 智能体驾驶舱</h2>
      <p class="cockpit-subtitle">所有智能体运行状态总览</p>
    </div>

    <!-- 全局统计 -->
    <div class="stats-row">
      <div class="stat-card total">
        <div class="stat-num">{{ data.total }}</div>
        <div class="stat-label">智能体总数</div>
      </div>
      <div class="stat-card running">
        <div class="stat-num">{{ data.running }}</div>
        <div class="stat-label">运行中</div>
      </div>
      <div class="stat-card stopped">
        <div class="stat-num">{{ data.stopped }}</div>
        <div class="stat-label">已停止</div>
      </div>
      <div class="stat-card done">
        <div class="stat-num">{{ data.completedToday }}</div>
        <div class="stat-label">今日完成</div>
      </div>
      <div class="stat-card pending">
        <div class="stat-num">{{ data.pendingToday }}</div>
        <div class="stat-label">待处理任务</div>
      </div>
    </div>

    <!-- 异常提醒 -->
    <div v-if="data.abnormalAgents.length" class="alert-section">
      <div class="alert-title">⚠️ 需要关注</div>
      <div v-for="ab in data.abnormalAgents" :key="ab.id" class="alert-item">
        <span class="alert-icon">🔴</span>
        <span class="alert-text">{{ ab.name }} — {{ ab.issue }}</span>
        <button class="alert-btn" @click="goToAgent(ab.id)">查看</button>
      </div>
    </div>

    <!-- 智能体运行状态列表 -->
    <div class="agent-status-section">
      <div class="section-title">智能体运行状态</div>
      <div
        v-for="as in data.agentStatuses"
        :key="as.id"
        class="agent-status-item"
        @click="goToAgent(as.id)"
      >
        <span class="status-dot" :class="as.status === 'running' ? 'dot-green' : 'dot-gray'"></span>
        <span class="as-name">{{ as.name }}</span>
        <span class="as-status-tag" :class="as.status">{{ as.status === 'running' ? '运行中' : '已停止' }}</span>
        <span class="as-time">{{ as.lastActive }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { cockpitData, agents } from '../mockData.js'
import { useRouter } from 'vue-router'

const data = cockpitData
const router = useRouter()

function goToAgent(agentId) {
  router.push(`/workspace/${agentId}`)
}
</script>

<style scoped>
.cockpit-page {
  padding: 32px;
  max-width: 800px;
}
.cockpit-header {
  margin-bottom: 28px;
}
.cockpit-header h2 {
  font-size: 22px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0;
}
.cockpit-subtitle {
  font-size: 14px;
  color: #8c8c8c;
  margin-top: 4px;
}
/* Stats */
.stats-row {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}
.stat-card {
  flex: 1;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  transition: box-shadow 0.15s;
}
.stat-card:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.stat-num {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
}
.stat-label {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 4px;
}
.stat-card.total .stat-num { color: #1677ff; }
.stat-card.running .stat-num { color: #52c41a; }
.stat-card.stopped .stat-num { color: #f5222d; }
.stat-card.done .stat-num { color: #52c41a; }
.stat-card.pending .stat-num { color: #fa8c16; }
/* Alert */
.alert-section {
  background: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}
.alert-title {
  font-size: 14px;
  font-weight: 600;
  color: #cf1322;
  margin-bottom: 10px;
}
.alert-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
}
.alert-icon {
  font-size: 8px;
}
.alert-text {
  flex: 1;
  font-size: 13px;
  color: #434343;
}
.alert-btn {
  padding: 2px 12px;
  font-size: 12px;
  border: 1px solid #f5222d;
  border-radius: 4px;
  background: #fff;
  color: #f5222d;
  cursor: pointer;
}
.alert-btn:hover {
  background: #f5222d;
  color: #fff;
}
/* Agent status list */
.agent-status-section {
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 16px;
}
.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 12px;
}
.agent-status-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid #f5f5f5;
}
.agent-status-item:last-child {
  border-bottom: none;
}
.agent-status-item:hover {
  background: #f5f6fa;
}
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dot-green { background: #52c41a; }
.dot-gray { background: #d9d9d9; }
.as-name {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: #1a1a2e;
}
.as-status-tag {
  font-size: 12px;
  padding: 1px 8px;
  border-radius: 4px;
}
.as-status-tag.running {
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}
.as-status-tag.stopped {
  background: #fff2f0;
  color: #f5222d;
  border: 1px solid #ffccc7;
}
.as-time {
  font-size: 12px;
  color: #8c8c8c;
}
</style>
