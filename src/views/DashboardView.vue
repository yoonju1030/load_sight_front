<template>
  <section class="dashboard-page">
    <header class="page-header">
      <div>
        <h1>{{ $t('dashboard.title') }}</h1>
        <p>{{ $t('dashboard.description') }}</p>
      </div>

      <router-link to="/test-plans/new" class="primary-button">
        <span aria-hidden="true">+</span>
        {{ $t('dashboard.newTest') }}
      </router-link>
    </header>

    <div class="metric-grid" :aria-label="$t('dashboard.summary')">
      <article v-for="metric in metrics" :key="metric.label" class="metric-card">
        <span class="metric-label">{{ metric.label }}</span>
        <strong :class="metric.tone ? `metric-value--${metric.tone}` : ''">
          {{ metric.value }}
        </strong>
      </article>
    </div>

    <article class="panel running-panel">
      <div class="panel-title-row">
        <h2>{{ $t('dashboard.runningTests') }}</h2>
        <span class="running-badge">{{ isRunning ? 'RUNNING' : 'STOPPED' }}</span>
      </div>

      <div class="running-content">
        <div class="test-summary">
          <strong>{{ $t('dashboard.memberLookup') }}</strong>
          <span>GET https://api.example.com/users</span>
        </div>

        <div class="live-stat">
          <strong>{{ isRunning ? '98 RPS' : '0 RPS' }}</strong>
          <span>p95 220ms · {{ $t('dashboard.columns.errorRate') }} 0.4%</span>
        </div>

        <router-link to="/runs/run-101/live" class="secondary-button">
          {{ $t('dashboard.monitoring') }}
        </router-link>

        <button
          type="button"
          class="stop-button"
          :disabled="!isRunning"
          @click="stopTest"
        >
          {{ isRunning ? $t('dashboard.stop') : $t('dashboard.stopped') }}
        </button>
      </div>

      <div
        class="progress-track"
        role="progressbar"
        :aria-valuenow="isRunning ? 57 : 100"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-label="$t('dashboard.progress')"
      >
        <span :style="{ width: isRunning ? '57%' : '100%' }" />
      </div>
      <time class="elapsed-time">01:24 / 02:30</time>
    </article>

    <article class="panel history-panel">
      <h2>{{ $t('dashboard.recentRuns') }}</h2>

      <div
        v-if="isRecentRunsLoading"
        class="recent-runs-state"
        role="status"
        aria-live="polite"
      >
        <span class="recent-runs-spinner" aria-hidden="true" />
        <span>{{ $t('dashboard.recentRunsLoading') }}</span>
      </div>

      <div v-else-if="recentRuns.length" class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{{ $t('dashboard.columns.testName') }}</th>
              <th>{{ $t('dashboard.columns.status') }}</th>
              <th>{{ $t('dashboard.columns.startedAt') }}</th>
              <th>p95</th>
              <th>{{ $t('dashboard.columns.errorRate') }}</th>
              <th><span class="sr-only">{{ $t('dashboard.columns.result') }}</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="run in recentRuns" :key="run.id">
              <td class="test-name">{{ run.name }}</td>
              <td>
                <span class="status-chip" :class="`status-chip--${run.tone}`">
                  {{ $t(run.statusKey) }}
                </span>
              </td>
              <td>{{ run.startedAt }}</td>
              <td>{{ run.p95 }}</td>
              <td>{{ run.errorRate }}</td>
              <td>
                <router-link :to="`/runs/${run.id}/result`" class="result-button">
                  {{ $t('dashboard.result') }}
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="recent-runs-state">
        <span class="recent-runs-empty-icon" aria-hidden="true">+</span>
        <strong>{{ $t('dashboard.recentRunsEmpty') }}</strong>
        <span>{{ $t('dashboard.recentRunsEmptyDescription') }}</span>
        <router-link to="/test-plans/new" class="primary-button recent-runs-action">
          {{ $t('dashboard.newTest') }}
        </router-link>
      </div>
    </article>
  </section>
</template>

<script>
import { getRecentRuns } from '../api/runApi';

const statusMeta = {
  COMPLETED: { statusKey: 'dashboard.status.completed', tone: 'success' },
  FINISHED: { statusKey: 'dashboard.status.completed', tone: 'success' },
  PASS: { statusKey: 'dashboard.status.completed', tone: 'success' },
  FAILED: { statusKey: 'dashboard.status.failed', tone: 'danger' },
  FAIL: { statusKey: 'dashboard.status.failed', tone: 'danger' },
  CANCELLED: { statusKey: 'dashboard.status.cancelled', tone: 'neutral' },
  CANCELED: { statusKey: 'dashboard.status.cancelled', tone: 'neutral' },
  STOPPED: { statusKey: 'dashboard.status.cancelled', tone: 'neutral' },
  STOPPING: { statusKey: 'dashboard.status.cancelled', tone: 'neutral' },
  CREATED: { statusKey: 'runs.status.running', tone: 'success' },
  STARTING: { statusKey: 'runs.status.running', tone: 'success' },
  RUNNING: { statusKey: 'runs.status.running', tone: 'success' }
};

export default {
  name: 'DashboardView',
  data() {
    return {
      isRunning: true,
      isRecentRunsLoading: true,
      recentRuns: []
    };
  },
  computed: {
    metrics() {
      return [
        { label: this.$t('dashboard.metrics.running'), value: this.isRunning ? '1' : '0' },
        { label: this.$t('dashboard.metrics.last7Days'), value: '12' },
        { label: this.$t('dashboard.metrics.avgSuccess'), value: '98.7%', tone: 'success' },
        { label: this.$t('dashboard.metrics.needsAttention'), value: '2', tone: 'danger' }
      ];
    }
  },
  mounted() {
    this.fetchRecentRuns();
  },
  methods: {
    async fetchRecentRuns() {
      try {
        const runs = await getRecentRuns(3);
        this.recentRuns = (Array.isArray(runs) ? runs : []).map(this.normalizeRecentRun);
      } catch (error) {
        console.error('최근 실행 목록을 불러오지 못했습니다.', error);
        this.recentRuns = [];
      } finally {
        this.isRecentRunsLoading = false;
      }
    },
    normalizeRecentRun(run) {
      const status = String(run.status || 'CANCELLED').toUpperCase();
      const meta = statusMeta[status] || statusMeta.CANCELLED;

      return {
        id: run.id,
        name: run.planName || run.name || '-',
        statusKey: meta.statusKey,
        tone: meta.tone,
        startedAt: this.formatStartedAt(run.startTime || run.startedAt),
        p95: this.formatLatency(run.p95Latency ?? run.p95),
        errorRate: this.formatErrorRate(run.errorRate)
      };
    },
    formatStartedAt(value) {
      if (!value) return '-';

      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return String(value);

      return new Intl.DateTimeFormat(this.$i18n.locale, {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    },
    formatLatency(value) {
      if (value === null || value === undefined) return '-';

      const latency = Number(value);
      if (!Number.isFinite(latency)) return '-';
      return latency >= 1000 ? `${(latency / 1000).toFixed(1)}s` : `${latency}ms`;
    },
    formatErrorRate(value) {
      if (value === null || value === undefined) return '-';

      const rate = Number(value);
      return Number.isFinite(rate) ? `${rate.toFixed(1)}%` : '-';
    },
    stopTest() {
      this.isRunning = false;
    }
  }
};
</script>

<style scoped>
.dashboard-page {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  padding: 17px 20px 40px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 41px;
  margin-bottom: 6px;
}

.page-header h1 {
  margin: 0 0 1px;
  color: #1e293b;
  font-size: 20px;
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: -0.55px;
}

.page-header p {
  margin: 0;
  color: #8a96a8;
  font-size: 9px;
  font-weight: 500;
}

.primary-button,
.secondary-button,
.stop-button,
.result-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 160ms ease, border-color 160ms ease,
    transform 160ms ease;
}

.primary-button {
  gap: 4px;
  width: 161px;
  height: 14px;
  color: #ffffff;
  font-size: 9px;
  background: #2f6bea;
  border: 0;
}

.primary-button:hover {
  background: #1d4ed8;
}

.primary-button span {
  font-size: 9px;
  line-height: 1;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 9px;
  margin-bottom: 9px;
}

.metric-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 54px;
  padding: 9px 10px;
  background: #ffffff;
  border: 1px solid #e0e5eb;
  border-radius: 9px;
}

.metric-label {
  margin-bottom: 1px;
  color: #8b96a7;
  font-size: 9px;
  font-weight: 500;
}

.metric-card strong {
  color: #202a3a;
  font-size: 16px;
  font-weight: 800;
  line-height: 1.15;
}

.metric-card .metric-value--success {
  color: #16944b;
}

.metric-card .metric-value--danger {
  color: #dc3d31;
}

.panel {
  background: #ffffff;
  border: 1px solid #dde3ea;
  border-radius: 9px;
}

.panel h2 {
  margin: 0;
  color: #263244;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: -0.2px;
}

.running-panel {
  position: relative;
  min-height: 94px;
  margin-bottom: 10px;
  padding: 11px 10px 14px;
}

.panel-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.running-badge {
  padding: 2px 6px;
  color: #2f6bea;
  font-size: 8px;
  font-weight: 800;
  background: #edf3ff;
  border-radius: 999px;
}

.running-content {
  display: grid;
  grid-template-columns: 1.4fr 0.48fr 0.94fr 0.94fr;
  align-items: center;
  gap: 7px;
}

.test-summary,
.live-stat {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.test-summary strong,
.live-stat strong {
  overflow: hidden;
  color: #293445;
  font-size: 8px;
  font-weight: 800;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.test-summary span,
.live-stat span {
  overflow: hidden;
  color: #8a96a8;
  font-size: 8px;
  font-weight: 500;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.secondary-button,
.stop-button {
  width: 100%;
  height: 14px;
  font-size: 8px;
}

.secondary-button {
  color: #465267;
  background: #ffffff;
  border: 1px solid #d1d9e4;
}

.secondary-button:hover {
  color: #2f6bea;
  border-color: #2f6bea;
}

.stop-button {
  color: #ffffff;
  background: #e32626;
  border: 1px solid #e32626;
}

.stop-button:hover:not(:disabled) {
  background: #c81e1e;
  border-color: #c81e1e;
}

.stop-button:disabled {
  cursor: default;
  background: #9aa5b5;
  border-color: #9aa5b5;
}

.progress-track {
  height: 4px;
  margin-top: 10px;
  overflow: hidden;
  background: #e8edf3;
  border-radius: 999px;
}

.progress-track span {
  display: block;
  height: 100%;
  background: #2f6bea;
  transition: width 200ms ease;
}

.elapsed-time {
  position: absolute;
  right: 10px;
  bottom: 5px;
  color: #a5afbd;
  font-size: 7px;
  font-style: normal;
}

.history-panel {
  padding: 11px 10px 13px;
}

.history-panel h2 {
  margin-bottom: 7px;
}

.table-wrap {
  overflow-x: auto;
}

.recent-runs-state {
  display: flex;
  min-height: 118px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  color: #8591a3;
  font-size: 9px;
  text-align: center;
  background: #fafcff;
  border: 1px dashed #dce3ec;
  border-radius: 8px;
}

.recent-runs-state strong {
  color: #334155;
  font-size: 11px;
}

.recent-runs-empty-icon {
  display: inline-flex;
  width: 25px;
  height: 25px;
  align-items: center;
  justify-content: center;
  color: #2f6bea;
  font-size: 17px;
  font-weight: 500;
  background: #eaf1ff;
  border-radius: 50%;
}

.recent-runs-action {
  width: auto;
  min-width: 92px;
  margin-top: 3px;
  padding: 0 12px;
}

.recent-runs-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid #dbe4f0;
  border-top-color: #2f6bea;
  border-radius: 50%;
  animation: recent-runs-spin 700ms linear infinite;
}

@keyframes recent-runs-spin {
  to {
    transform: rotate(360deg);
  }
}

table {
  width: 100%;
  border-spacing: 0;
  border-collapse: collapse;
  table-layout: fixed;
}

th {
  height: 22px;
  padding: 5px 7px;
  color: #8591a3;
  font-size: 8px;
  font-weight: 700;
  text-align: left;
  background: #f5f8fc;
  border-bottom: 1px solid #e6ebf1;
}

td {
  height: 30px;
  padding: 6px 7px;
  color: #566276;
  font-size: 8px;
  font-weight: 500;
  border-bottom: 1px solid #edf0f4;
}

tbody tr:last-child td {
  border-bottom: 0;
}

tbody tr:hover {
  background: #fafcff;
}

th:first-child,
td:first-child {
  width: 15%;
}

th:nth-child(2),
td:nth-child(2) {
  width: 10%;
}

th:nth-child(3),
td:nth-child(3) {
  width: 14%;
}

th:nth-child(4),
td:nth-child(4) {
  width: 10%;
}

th:nth-child(5),
td:nth-child(5) {
  width: 10%;
}

th:last-child,
td:last-child {
  width: 39%;
}

.test-name {
  color: #263244;
  font-weight: 800;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  min-height: 13px;
  padding: 2px 4px;
  font-size: 7px;
  font-weight: 800;
  border-radius: 999px;
}

.status-chip--success {
  color: #159253;
  background: #e8f8ef;
}

.status-chip--danger {
  color: #db4035;
  background: #ffedeb;
}

.status-chip--neutral {
  color: #718096;
  background: #edf1f5;
}

.result-button {
  width: 132px;
  max-width: 100%;
  height: 14px;
  color: #465267;
  font-size: 8px;
  background: #ffffff;
  border: 1px solid #d1d9e4;
}

.result-button:hover {
  color: #2f6bea;
  border-color: #2f6bea;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (min-width: 1100px) {
  .dashboard-page {
    padding: 28px 34px 56px;
  }

  .page-header {
    min-height: 58px;
    margin-bottom: 10px;
  }

  .page-header h1 {
    font-size: 25px;
  }

  .page-header p {
    font-size: 11px;
  }

  .primary-button {
    width: 190px;
    height: 34px;
    font-size: 12px;
  }

  .metric-grid {
    gap: 14px;
    margin-bottom: 14px;
  }

  .metric-card {
    height: 82px;
    padding: 14px 16px;
    border-radius: 12px;
  }

  .metric-label {
    font-size: 11px;
  }

  .metric-card strong {
    font-size: 24px;
  }

  .panel {
    border-radius: 12px;
  }

  .panel h2 {
    font-size: 15px;
  }

  .running-panel {
    min-height: 138px;
    margin-bottom: 16px;
    padding: 17px 16px 21px;
  }

  .panel-title-row {
    margin-bottom: 10px;
  }

  .running-badge {
    padding: 4px 8px;
    font-size: 9px;
  }

  .running-content {
    gap: 12px;
  }

  .test-summary strong,
  .live-stat strong {
    font-size: 12px;
  }

  .test-summary span,
  .live-stat span {
    font-size: 9px;
  }

  .secondary-button,
  .stop-button {
    height: 27px;
    font-size: 10px;
  }

  .progress-track {
    height: 6px;
    margin-top: 14px;
  }

  .elapsed-time {
    right: 16px;
    bottom: 7px;
    font-size: 8px;
  }

  .history-panel {
    padding: 17px 16px 20px;
  }

  .history-panel h2 {
    margin-bottom: 10px;
  }

  .recent-runs-state {
    min-height: 160px;
    gap: 7px;
    font-size: 11px;
  }

  .recent-runs-state strong {
    font-size: 14px;
  }

  .recent-runs-empty-icon {
    width: 34px;
    height: 34px;
    font-size: 21px;
  }

  .recent-runs-action {
    height: 28px;
    font-size: 10px;
  }

  th {
    height: 34px;
    padding: 8px 11px;
    font-size: 10px;
  }

  td {
    height: 45px;
    padding: 9px 11px;
    font-size: 10px;
  }

  .status-chip {
    min-width: 34px;
    min-height: 20px;
    padding: 3px 7px;
    font-size: 8px;
  }

  .result-button {
    width: 160px;
    height: 25px;
    font-size: 9px;
  }
}

@media (max-width: 760px) {
  .dashboard-page {
    padding: 18px 14px 32px;
  }

  .page-header {
    align-items: flex-start;
  }

  .page-header h1 {
    font-size: 22px;
  }

  .page-header p {
    margin-top: 3px;
    font-size: 10px;
  }

  .primary-button {
    width: auto;
    height: 32px;
    padding: 0 14px;
    font-size: 11px;
  }

  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    margin-top: 14px;
  }

  .metric-card {
    height: 72px;
  }

  .metric-label {
    font-size: 10px;
  }

  .metric-card strong {
    font-size: 22px;
  }

  .running-panel,
  .history-panel {
    padding: 14px;
  }

  .panel h2 {
    font-size: 13px;
  }

  .running-badge {
    font-size: 8px;
  }

  .running-content {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .test-summary strong,
  .live-stat strong {
    font-size: 11px;
  }

  .test-summary span,
  .live-stat span {
    font-size: 8px;
  }

  .secondary-button,
  .stop-button {
    height: 28px;
    font-size: 9px;
  }

  .progress-track {
    margin-top: 12px;
  }

  table {
    min-width: 620px;
  }

  th,
  td {
    font-size: 9px;
  }
}
</style>
