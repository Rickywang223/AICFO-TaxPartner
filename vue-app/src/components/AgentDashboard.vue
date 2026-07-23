<template>
  <div class="dashboard-panel">
    <!-- Scrollable content -->
    <div class="dash-scroll">

      <!-- KPI Cards Row -->
      <div class="kpi-row">
        <div
          v-for="kpi in dashboard.kpiCards"
          :key="kpi.id"
          class="kpi-card"
          :class="'kpi-' + kpi.status"
          @click="$emit('action', { text: '查看' + kpi.label, type: 'default', action: 'drill-' + kpi.id })"
        >
          <div class="kpi-label">{{ kpi.label }}</div>
          <div class="kpi-value">{{ kpi.value }}</div>
          <div class="kpi-footer">
            <span class="kpi-full">{{ kpi.valueFull }}</span>
            <span class="kpi-change" :class="'change-' + kpi.trend">
              <template v-if="kpi.trend === 'up'">↑</template>
              <template v-else-if="kpi.trend === 'down'">↓</template>
              {{ kpi.change }}
            </span>
          </div>
        </div>
      </div>

      <!-- Section Cards -->
      <div v-for="sec in dashboard.sections" :key="sec.id" class="section-card">
        <div class="section-title">{{ sec.title }}</div>

        <!-- Type: invoice-list (高危发票列表) -->
        <div v-if="sec.type === 'invoice-list'" class="section-body">
          <div v-for="(item, idx) in sec.items" :key="idx" class="invoice-row" :class="'urg-' + item.urgency">
            <div class="invoice-left">
              <span class="invoice-urgency">{{ item.urgency }}</span>
              <div class="invoice-info">
                <div class="invoice-company">{{ item.company }}</div>
                <div class="invoice-meta">{{ item.amount }} · {{ item.daysLeft }}天到期</div>
              </div>
            </div>
            <div class="invoice-right">
              <a-tag :color="item.urgency === 'critical' ? 'red' : 'orange'" size="small">{{ item.note }}</a-tag>
            </div>
          </div>
          <div v-if="sec.actions" class="section-actions">
            <a-button
              v-for="(act, aidx) in sec.actions"
              :key="aidx"
              :type="act.type === 'primary' ? 'primary' : 'default'"
              size="small"
              class="section-action-btn"
              @click="$emit('action', act)"
            >{{ act.text }}</a-button>
          </div>
        </div>

        <!-- Type: task-list (待办列表) -->
        <div v-if="sec.type === 'task-list'" class="section-body">
          <div v-for="(item, idx) in sec.items" :key="idx" class="task-row" :class="{ 'task-urgent': item.urgent }">
            <div class="task-check">
              <a-checkbox />
            </div>
            <div class="task-info">
              <div class="task-label">{{ item.label }}</div>
              <div class="task-note">{{ item.note }}</div>
            </div>
            <div v-if="item.urgent" class="task-badge">
              <a-tag color="red" size="small">紧急</a-tag>
            </div>
          </div>
        </div>

        <!-- Type: dual-list (双栏列表，如认证队列) -->
        <div v-if="sec.type === 'dual-list'" class="section-body">
          <div class="dual-list">
            <div v-for="(col, cidx) in sec.columns" :key="cidx" class="dual-col">
              <div class="dual-col-title">{{ col.title }}</div>
              <div v-for="(item, iidx) in col.items" :key="iidx" class="dual-item">
                <span class="dual-item-name">{{ item.company }}</span>
                <span class="dual-item-amount">{{ item.amount }}</span>
                <span v-if="item.daysLeft" class="dual-item-days">{{ item.daysLeft }}天</span>
              </div>
            </div>
          </div>
          <div v-if="sec.actions" class="section-actions">
            <a-button
              v-for="(act, aidx) in sec.actions"
              :key="aidx"
              :type="act.type === 'primary' ? 'primary' : 'default'"
              size="small"
              class="section-action-btn"
              @click="$emit('action', act)"
            >{{ act.text }}</a-button>
          </div>
        </div>

        <!-- Type: risk-list (风险列表) -->
        <div v-if="sec.type === 'risk-list'" class="section-body">
          <div v-for="(item, idx) in sec.items" :key="idx" class="risk-row" :class="'risk-' + item.status">
            <div class="risk-left">
              <div class="risk-company">{{ item.company }}</div>
              <div class="risk-issue">{{ item.issue }}</div>
            </div>
            <div class="risk-right">
              <div class="risk-score">
                <a-progress
                  type="circle"
                  :percent="item.riskScore"
                  :size="48"
                  :strokeColor="item.riskScore < 60 ? '#f5222d' : '#fa8c16'"
                  :format="() => item.riskScore"
                />
              </div>
            </div>
          </div>
          <div v-if="sec.actions" class="section-actions">
            <a-button
              v-for="(act, aidx) in sec.actions"
              :key="aidx"
              :type="act.type === 'primary' ? 'primary' : 'default'"
              size="small"
              class="section-action-btn"
              @click="$emit('action', act)"
            >{{ act.text }}</a-button>
          </div>
        </div>

        <!-- Type: tax-table (申报进度表) -->
        <div v-if="sec.type === 'tax-table'" class="section-body">
          <div class="tax-table-wrap">
            <table class="tax-table">
              <thead>
                <tr>
                  <th v-for="col in sec.columns" :key="col">{{ col }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, ridx) in sec.rows" :key="ridx">
                  <td>{{ row.tax }}</td>
                  <td>{{ row.total }}</td>
                  <td>{{ row.done }}</td>
                  <td>
                    <a-progress :percent="row.rate" :size="80" :strokeColor="row.rate === 100 ? '#52c41a' : '#1677ff'" :format="() => row.rate + '%'" />
                  </td>
                  <td>
                    <a-tag :color="row.status === 'done' ? 'green' : 'orange'" size="small">{{ row.status === 'done' ? '已完成' : '未完成' }}</a-tag>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="sec.actions" class="section-actions">
            <a-button
              v-for="(act, aidx) in sec.actions"
              :key="aidx"
              :type="act.type === 'primary' ? 'primary' : 'default'"
              size="small"
              class="section-action-btn"
              @click="$emit('action', act)"
            >{{ act.text }}</a-button>
          </div>
        </div>

        <!-- Type: checklist (合规检查) -->
        <div v-if="sec.type === 'checklist'" class="section-body">
          <div v-for="(item, idx) in sec.items" :key="idx" class="check-item" :class="'check-' + item.status">
            <div class="check-status-icon">
              <span v-if="item.status === 'pass'" class="check-icon check-pass">✓</span>
              <span v-else class="check-icon check-warn">⚠</span>
            </div>
            <div class="check-info">
              <div class="check-title">{{ item.check }}</div>
              <div class="check-detail">{{ item.detail }}</div>
            </div>
          </div>
          <div v-if="sec.actions" class="section-actions">
            <a-button
              v-for="(act, aidx) in sec.actions"
              :key="aidx"
              :type="act.type === 'primary' ? 'primary' : 'default'"
              size="small"
              class="section-action-btn"
              @click="$emit('action', act)"
            >{{ act.text }}</a-button>
          </div>
        </div>

        <!-- Type: deadline-countdown (认证截止倒计时) -->
        <div v-if="sec.type === 'deadline-countdown'" class="section-body">
          <div class="deadline-header">
            <span class="deadline-date">本月截止：{{ sec.deadlineDate }}</span>
            <span class="deadline-days" :class="sec.daysLeft <= 3 ? 'days-urgent' : sec.daysLeft <= 10 ? 'days-warn' : ''">{{ sec.daysLeft }}天</span>
          </div>
          <div class="deadline-bar">
            <div class="deadline-bar-bg">
              <div class="deadline-bar-fill" :style="{ width: Math.min(100, ((30 - sec.daysLeft) / 30) * 100) + '%' }"></div>
              <span class="deadline-bar-today">今日</span>
              <span class="deadline-bar-end">截止</span>
            </div>
          </div>
          <div v-for="(item, idx) in sec.items" :key="idx" class="deadline-row" :class="'pri-' + item.priority">
            <span class="deadline-priority">
              <span v-if="item.priority === 'urgent'">🚨</span>
              <span v-else-if="item.priority === 'warning'">⚠️</span>
              <span v-else>📄</span>
            </span>
            <span class="deadline-company">{{ item.company }}</span>
            <span class="deadline-amount">{{ item.amount }}</span>
            <span class="deadline-suggest" :class="'sug-' + item.priority">{{ item.suggestDays }}</span>
          </div>
          <div v-if="sec.action" class="section-actions">
            <a-button :type="sec.action.type === 'primary' ? 'primary' : 'default'" size="small" @click="$emit('action', sec.action)">{{ sec.action.text }}</a-button>
          </div>
        </div>

        <!-- Type: cert-queue (认证队列) -->
        <div v-if="sec.type === 'cert-queue'" class="section-body">
          <div class="queue-table">
            <div class="queue-row queue-header">
              <span v-for="h in sec.headers" :key="h" class="queue-cell queue-hd">{{ h }}</span>
            </div>
            <div v-for="(item, idx) in sec.items" :key="idx" class="queue-row">
              <span class="queue-cell">{{ item.company }}</span>
              <span class="queue-cell">{{ item.amount }}</span>
              <span class="queue-cell">
                <a-tag :color="item.statusColor === 'processing' ? 'processing' : 'default'" size="small">{{ item.status }}</a-tag>
              </span>
            </div>
          </div>
        </div>

        <!-- Type: trend-chart (认证率趋势) -->
        <div v-if="sec.type === 'trend-chart'" class="section-body">
          <div class="trend-summary">
            <div class="trend-current">
              <span class="trend-value">{{ sec.currentRate }}%</span>
              <span class="trend-label">当前认证率</span>
            </div>
            <div class="trend-target">
              <span class="trend-value target">{{ sec.targetRate }}%</span>
              <span class="trend-label">目标线</span>
            </div>
            <div class="trend-gap" :class="sec.gap < 0 ? 'gap-negative' : ''">
              <span class="trend-value">{{ sec.gap > 0 ? '+' : '' }}{{ sec.gap }}%</span>
              <span class="trend-label">差距</span>
            </div>
          </div>
          <div class="trend-chart">
            <div v-for="(dp, idx) in sec.dataPoints" :key="idx" class="trend-bar-col">
              <div class="trend-bar-bg">
                <div class="trend-bar-fill" :style="{ height: dp.value + '%' }" :class="dp.value >= sec.targetRate ? 'fill-good' : 'fill-warn'"></div>
              </div>
              <span class="trend-bar-label">{{ dp.value }}%</span>
              <span class="trend-bar-name">{{ dp.label }}</span>
            </div>
          </div>
        </div>

        <!-- Type: region-chart (区域认证率分布) -->
        <div v-if="sec.type === 'region-chart'" class="section-body">
          <div v-for="(reg, idx) in sec.regions" :key="idx" class="region-row">
            <div class="region-name">{{ reg.name }}</div>
            <div class="region-bar-wrap">
              <div class="region-bar-bg">
                <div class="region-bar-fill" :class="'bar-' + reg.color" :style="{ width: reg.rate + '%' }"></div>
              </div>
              <span class="region-rate">{{ reg.rate }}%</span>
              <span v-if="reg.note" class="region-change change-urgent">{{ reg.note }}</span>
            </div>
          </div>
          <div v-if="sec.actions" class="section-actions">
            <a-button v-for="(act, aidx) in sec.actions" :key="aidx" :type="act.type === 'primary' ? 'primary' : 'default'" size="small" class="section-action-btn" @click="$emit('action', act)">{{ act.text }}</a-button>
          </div>
        </div>

        <!-- Type: alert-list (异常预警) -->
        <div v-if="sec.type === 'alert-list'" class="section-body">
          <div v-for="(item, idx) in sec.items" :key="idx" class="alert-row" :class="'alert-' + item.level">
            <span class="alert-icon">
              <span v-if="item.level === 'error'">🚨</span>
              <span v-else-if="item.level === 'warning'">⚠️</span>
              <span v-else>💡</span>
            </span>
            <span class="alert-text">{{ item.text }}</span>
            <span class="alert-time">{{ item.time }}</span>
          </div>
        </div>

        <!-- Type: efficiency-table (认证效率统计) -->
        <div v-if="sec.type === 'efficiency-table'" class="section-body">
          <div class="eff-table">
            <div class="eff-row eff-header">
              <span v-for="h in sec.headers" :key="h" class="eff-cell">{{ h }}</span>
            </div>
            <div v-for="(row, idx) in sec.rows" :key="idx" class="eff-row">
              <span class="eff-cell eff-label">{{ row.label }}</span>
              <span class="eff-cell eff-value">{{ row.current }}</span>
              <span class="eff-cell eff-change" :class="row.trend === 'up' ? 'change-up' : 'change-down'">{{ row.change }}</span>
            </div>
          </div>
          <div v-if="sec.actions" class="section-actions">
            <a-button v-for="(act, aidx) in sec.actions" :key="aidx" :type="act.type === 'primary' ? 'primary' : 'default'" size="small" class="section-action-btn" @click="$emit('action', act)">{{ act.text }}</a-button>
          </div>
        </div>
      </div>
      <div v-if="dashboard.regionChart" class="section-card">
        <div class="section-title">{{ dashboard.regionChart.title }}</div>
        <div class="section-body">
          <div v-for="(item, idx) in dashboard.regionChart.data" :key="idx" class="region-row">
            <div class="region-name">{{ item.region }}</div>
            <div class="region-bar-wrap">
              <div class="region-bar-bg">
                <div
                  class="region-bar-fill"
                  :class="'bar-' + item.status"
                  :style="{ width: item.rate + '%' }"
                ></div>
              </div>
              <span class="region-rate">{{ item.rate }}%</span>
              <span class="region-change" :class="'change-' + item.status">
                {{ item.change }}
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  dashboard: { type: Object, required: true },
})

const emit = defineEmits(['action'])
</script>

<style scoped>
.dashboard-panel {
  height: 100%;
  background: #f5f6fa;
  display: flex;
  flex-direction: column;
}

.dash-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* KPI Row */
.kpi-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.kpi-card {
  background: #fff;
  border-radius: 8px;
  padding: 14px 16px;
  border: 1px solid #e8e8e8;
  cursor: pointer;
  transition: box-shadow 0.2s;
}
.kpi-card:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.kpi-label {
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 4px;
}
.kpi-value {
  font-size: 28px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
}
.kpi-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
  font-size: 11px;
}
.kpi-full {
  color: #8c8c8c;
}
.kpi-change {
  font-weight: 500;
}
.change-up { color: #52c41a; }
.change-down { color: #f5222d; }

.kpi-normal .kpi-value { color: #1a1a2e; }
.kpi-warning .kpi-value { color: #fa8c16; }
.kpi-urgent .kpi-value { color: #f5222d; }

/* Section Card */
.section-card {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
  overflow: hidden;
}
.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}
.section-body {
  padding: 8px 16px 12px;
}
.section-actions {
  display: flex;
  gap: 8px;
  padding: 8px 0 0;
  flex-wrap: wrap;
}
.section-action-btn {
  font-size: 12px;
}

/* Invoice List */
.invoice-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
}
.invoice-row:last-child { border-bottom: none; }
.invoice-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.invoice-urgency { font-size: 16px; }
.invoice-info { min-width: 0; }
.invoice-company { font-size: 13px; font-weight: 500; color: #1a1a2e; }
.invoice-meta { font-size: 12px; color: #8c8c8c; }
.invoice-right { flex-shrink: 0; }

/* Task List */
.task-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
}
.task-row:last-child { border-bottom: none; }
.task-check { flex-shrink: 0; }
.task-info { flex: 1; min-width: 0; }
.task-label { font-size: 13px; color: #1a1a2e; }
.task-note { font-size: 12px; color: #8c8c8c; }
.task-badge { flex-shrink: 0; }
.task-urgent .task-label { font-weight: 500; }

/* Dual List */
.dual-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.dual-col-title {
  font-size: 13px;
  font-weight: 500;
  color: #1a1a2e;
  margin-bottom: 6px;
  padding: 4px 8px;
  background: #fafafa;
  border-radius: 4px;
}
.dual-item {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  padding: 4px 8px;
  border-bottom: 1px solid #f5f5f5;
}
.dual-item-name { color: #1a1a2e; }
.dual-item-amount { color: #8c8c8c; }
.dual-item-days { color: #fa8c16; font-weight: 500; }

/* Risk List */
.risk-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}
.risk-row:last-child { border-bottom: none; }
.risk-company { font-size: 13px; font-weight: 500; color: #1a1a2e; }
.risk-issue { font-size: 12px; color: #8c8c8c; margin-top: 2px; }
.risk-right { flex-shrink: 0; }

/* Tax Table */
.tax-table-wrap { overflow-x: auto; }
.tax-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}
.tax-table th {
  text-align: left;
  padding: 8px 10px;
  background: #fafafa;
  font-weight: 500;
  color: #8c8c8c;
  border-bottom: 1px solid #f0f0f0;
}
.tax-table td {
  padding: 8px 10px;
  border-bottom: 1px solid #f5f5f5;
  color: #1a1a2e;
}

/* Checklist */
.check-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}
.check-item:last-child { border-bottom: none; }
.check-status-icon { flex-shrink: 0; margin-top: 2px; }
.check-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: bold;
}
.check-pass { background: #f6ffed; color: #52c41a; border: 1px solid #b7eb8f; }
.check-warn { background: #fff7e6; color: #fa8c16; border: 1px solid #ffd591; }
.check-title { font-size: 13px; color: #1a1a2e; }
.check-detail { font-size: 12px; color: #8c8c8c; margin-top: 2px; }

/* Region Chart */
.region-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 0;
}
.region-name {
  width: 48px;
  font-size: 13px;
  font-weight: 500;
  color: #1a1a2e;
  flex-shrink: 0;
}
.region-bar-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}
.region-bar-bg {
  flex: 1;
  height: 18px;
  background: #f0f0f0;
  border-radius: 9px;
  overflow: hidden;
}
.region-bar-fill {
  height: 100%;
  border-radius: 9px;
  transition: width 0.5s ease;
}
.bar-normal { background: linear-gradient(90deg, #1677ff, #40a9ff); }
.bar-warning { background: linear-gradient(90deg, #fa8c16, #ffc53d); }
.bar-urgent { background: linear-gradient(90deg, #f5222d, #ff7875); }
.region-rate {
  width: 36px;
  text-align: right;
  font-size: 13px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: #1a1a2e;
}
.region-change {
  width: 48px;
  font-size: 11px;
  font-weight: 500;
}
.change-normal { color: #52c41a; }
.change-warning { color: #fa8c16; }
.change-urgent { color: #f5222d; }

/* Scrollbar */
.dash-scroll::-webkit-scrollbar {
  width: 4px;
}
.dash-scroll::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 2px;
}
.dash-scroll::-webkit-scrollbar-track {
  background: transparent;
}
</style>
