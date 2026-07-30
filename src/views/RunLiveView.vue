<template>
  <section class="run-live-page">
    <header class="run-header">
      <div class="run-heading">
        <h1>{{ run.name }}</h1>
        <p>{{ run.method }} {{ run.url }}</p>
      </div>

      <div class="header-actions">
        <span class="running-badge" :class="{ 'running-badge--stopped': !isRunning }">
          <i aria-hidden="true"></i>
          {{ isRunning ? 'RUNNING' : 'STOPPED' }}
        </span>
        <button
          type="button"
          class="stop-button"
          :disabled="!isRunning || isStopping"
          @click="handleStop"
        >
          {{ isStopping ? '중지 중' : isRunning ? '중지' : '중지됨' }}
        </button>
      </div>
    </header>

    <section class="progress-card">
      <div class="progress-labels">
        <strong>{{ isRunning ? '테스트 실행 중' : '테스트가 중지되었습니다' }}</strong>
        <time>{{ formattedElapsed }} / {{ formattedDuration }}</time>
      </div>
      <div
        class="progress-track"
        role="progressbar"
        :aria-valuenow="progress"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label="테스트 진행률"
      >
        <span :style="{ width: `${progress}%` }"></span>
      </div>
    </section>

    <div class="metric-grid">
      <article class="metric-card">
        <span>현재 RPS</span>
        <strong>{{ metrics.rps }}</strong>
      </article>
      <article class="metric-card">
        <span>전체 요청</span>
        <strong>{{ metrics.totalRequests.toLocaleString() }}</strong>
      </article>
      <article class="metric-card">
        <span>성공률</span>
        <strong class="metric-success">{{ successRate }}%</strong>
      </article>
      <article class="metric-card">
        <span>p95</span>
        <strong>{{ metrics.p95Latency }}ms</strong>
      </article>
    </div>

    <div class="monitor-grid">
      <article class="monitor-card chart-card">
        <div class="card-heading">
          <h2>응답시간</h2>
          <div class="chart-legend" aria-label="차트 범례">
            <span><i class="legend-dot legend-dot--average"></i>평균</span>
            <span><i class="legend-dot legend-dot--p95"></i>p95</span>
          </div>
        </div>

        <svg
          class="response-chart"
          viewBox="0 0 320 118"
          preserveAspectRatio="none"
          role="img"
          aria-label="평균 및 p95 응답시간 추이"
        >
          <g class="chart-grid">
            <line v-for="y in [18, 43, 68, 93]" :key="y" x1="0" :y1="y" x2="320" :y2="y" />
          </g>
          <line class="chart-axis" x1="0" y1="108" x2="320" y2="108" />
          <polyline class="chart-line chart-line--average" :points="averagePolyline" />
          <polyline class="chart-line chart-line--p95" :points="p95Polyline" />
          <circle
            v-for="(point, index) in averageChartPoints"
            :key="`average-${index}`"
            class="chart-point chart-point--average"
            :cx="point.x"
            :cy="point.y"
            r="1.8"
          />
          <circle
            v-for="(point, index) in p95ChartPoints"
            :key="`p95-${index}`"
            class="chart-point chart-point--p95"
            :cx="point.x"
            :cy="point.y"
            r="1.8"
          />
        </svg>
      </article>

      <article class="monitor-card status-card">
        <h2>처리량 및 상태 코드</h2>
        <dl>
          <div>
            <dt>Target RPS</dt>
            <dd>{{ run.targetRps }}</dd>
          </div>
          <div>
            <dt>Actual RPS</dt>
            <dd>{{ metrics.rps }}</dd>
          </div>
          <div>
            <dt>HTTP 200</dt>
            <dd class="status-success">{{ metrics.http200.toLocaleString() }}</dd>
          </div>
          <div>
            <dt>HTTP 500</dt>
            <dd class="status-danger">{{ metrics.http500 }}</dd>
          </div>
          <div>
            <dt>Timeout</dt>
            <dd class="status-warning">{{ metrics.timeout }}</dd>
          </div>
        </dl>
      </article>
    </div>

    <article class="errors-card">
      <h2>최근 오류</h2>
      <div v-if="recentErrors.length" class="errors-table-wrap">
        <table>
          <tbody>
            <tr v-for="error in recentErrors" :key="`${error.time}-${error.type}`">
              <td>{{ error.time }}</td>
              <td :class="error.type === 'Timeout' ? 'error-timeout' : 'error-server'">
                {{ error.type }}
              </td>
              <td class="error-path">{{ error.path }}</td>
              <td>{{ error.duration }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="no-errors">최근 발생한 오류가 없습니다.</p>
    </article>
  </section>
</template>

<script>
import { getRunDetails, stopRun } from '../api/runApi';

const initialRun = () => ({
  id: '',
  name: '자산 목록 조회',
  method: 'GET',
  url: 'http://localhost:8085/asset/getTotalAsset',
  targetRps: 100,
  durationSec: 60
});

export default {
  name: 'RunLiveView',
  data() {
    return {
      run: initialRun(),
      isRunning: true,
      isStopping: false,
      elapsedSec: 28,
      metrics: {
        rps: 97,
        totalRequests: 2716,
        p95Latency: 380,
        http200: 2705,
        http500: 8,
        timeout: 3
      },
      averageSeries: [185, 196, 215, 242, 278, 325, 380],
      p95Series: [105, 115, 126, 145, 171, 205, 250],
      recentErrors: [
        {
          time: '15:22:01',
          type: 'Timeout',
          path: '/asset/getTotalAsset',
          duration: '5,000ms'
        },
        {
          time: '15:20:04',
          type: 'HTTP 500',
          path: '/asset/getTotalAsset',
          duration: '382ms'
        }
      ],
      refreshTimer: null
    };
  },
  computed: {
    progress() {
      if (!this.run.durationSec) return 0;
      return Math.min(100, Math.round((this.elapsedSec / this.run.durationSec) * 100));
    },
    formattedElapsed() {
      return this.formatDuration(this.elapsedSec);
    },
    formattedDuration() {
      return this.formatDuration(this.run.durationSec);
    },
    successRate() {
      if (!this.metrics.totalRequests) return '0.0';
      return ((this.metrics.http200 / this.metrics.totalRequests) * 100).toFixed(1);
    },
    averageChartPoints() {
      return this.toChartPoints(this.averageSeries);
    },
    p95ChartPoints() {
      return this.toChartPoints(this.p95Series);
    },
    averagePolyline() {
      return this.averageChartPoints.map(({ x, y }) => `${x},${y}`).join(' ');
    },
    p95Polyline() {
      return this.p95ChartPoints.map(({ x, y }) => `${x},${y}`).join(' ');
    }
  },
  async mounted() {
    this.run.id = this.$route.params.runId;
    await this.loadRun();
    this.startRefresh();
  },
  beforeUnmount() {
    this.stopRefresh();
  },
  methods: {
    async loadRun() {
      try {
        const details = await getRunDetails(this.$route.params.runId);
        const sourceMetrics = details?.metrics || {};

        this.run = {
          ...this.run,
          id: details?.id || this.$route.params.runId,
          name: details?.name || this.run.name,
          method: details?.method || this.run.method,
          url: details?.url || this.run.url,
          targetRps: sourceMetrics.targetRps || details?.targetRps || this.run.targetRps,
          durationSec: details?.durationSec || this.run.durationSec
        };

        if (details?.elapsedSec != null) this.elapsedSec = details.elapsedSec;
        if (sourceMetrics.rps != null) this.metrics.rps = sourceMetrics.rps;
        if (sourceMetrics.totalRequests != null) {
          this.metrics.totalRequests = sourceMetrics.totalRequests;
        }
        if (sourceMetrics.p95Latency != null) {
          this.metrics.p95Latency = sourceMetrics.p95Latency;
        }
        if (sourceMetrics.http200 != null) this.metrics.http200 = sourceMetrics.http200;
        if (sourceMetrics.http500 != null) this.metrics.http500 = sourceMetrics.http500;
        if (sourceMetrics.timeout != null) this.metrics.timeout = sourceMetrics.timeout;

        this.isRunning = !['STOPPED', 'CANCELLED'].includes(details?.status);
      } catch {
        this.run.id = this.$route.params.runId;
      }
    },
    startRefresh() {
      if (!this.isRunning) return;
      this.refreshTimer = window.setInterval(this.updateLiveMetrics, 2000);
    },
    stopRefresh() {
      if (this.refreshTimer) {
        window.clearInterval(this.refreshTimer);
        this.refreshTimer = null;
      }
    },
    updateLiveMetrics() {
      if (!this.isRunning) return;

      this.elapsedSec = Math.min(this.run.durationSec, this.elapsedSec + 2);
      const drift = [-2, 1, 3, -1, 2][this.elapsedSec % 5];
      this.metrics.rps = Math.max(0, this.run.targetRps - 3 + drift);
      this.metrics.totalRequests += this.metrics.rps * 2;
      this.metrics.http200 += this.metrics.rps * 2;
      this.metrics.p95Latency = Math.max(250, this.metrics.p95Latency + drift * 4);

      this.averageSeries = [
        ...this.averageSeries.slice(-6),
        Math.round(this.metrics.p95Latency * 0.62)
      ];
      this.p95Series = [...this.p95Series.slice(-6), this.metrics.p95Latency];

      if (this.elapsedSec >= this.run.durationSec) {
        this.isRunning = false;
        this.stopRefresh();
      }
    },
    async handleStop() {
      this.isStopping = true;
      try {
        await stopRun(this.run.id);
        this.isRunning = false;
        this.stopRefresh();
      } finally {
        this.isStopping = false;
      }
    },
    formatDuration(seconds) {
      const safeSeconds = Math.max(0, Number(seconds) || 0);
      const minutes = Math.floor(safeSeconds / 60);
      const remainder = safeSeconds % 60;
      return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
    },
    toChartPoints(series) {
      const max = Math.max(...this.averageSeries, ...this.p95Series, 1);
      const min = Math.min(...this.averageSeries, ...this.p95Series, 0);
      const range = max - min || 1;
      const width = 312;

      return series.map((value, index) => ({
        x: 4 + (index * width) / Math.max(series.length - 1, 1),
        y: 104 - ((value - min) / range) * 88
      }));
    }
  }
};
</script>

<style scoped>
.run-live-page {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  padding: 17px 20px 42px;
}

.run-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 45px;
  padding-bottom: 8px;
  border-bottom: 1px solid #d7e1f3;
}

.run-heading {
  min-width: 0;
}

.run-heading h1 {
  margin: 0 0 2px;
  color: #1e293b;
  font-size: 20px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.55px;
}

.run-heading p {
  overflow: hidden;
  margin: 0;
  color: #7d899b;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-size: 8px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: 14px;
}

.running-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #2563eb;
  font-size: 8px;
  font-weight: 800;
}

.running-badge i {
  width: 4px;
  height: 4px;
  background: #2563eb;
  border-radius: 50%;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.running-badge--stopped {
  color: #718096;
}

.running-badge--stopped i {
  background: #718096;
  box-shadow: none;
}

.stop-button {
  display: inline-flex;
  width: 157px;
  height: 14px;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 8px;
  font-weight: 700;
  background: #e32626;
  border: 0;
  border-radius: 6px;
  cursor: pointer;
}

.stop-button:hover:not(:disabled) {
  background: #c81e1e;
}

.stop-button:disabled {
  cursor: default;
  background: #9aa5b5;
}

.progress-card {
  margin-top: 8px;
  padding: 9px 10px 10px;
  background: #f5f9ff;
  border: 1px solid #b9d2ff;
  border-radius: 8px;
}

.progress-labels {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 7px;
}

.progress-labels strong,
.progress-labels time {
  color: #2f6bea;
  font-size: 9px;
  font-weight: 800;
  font-style: normal;
}

.progress-track {
  height: 5px;
  overflow: hidden;
  background: #dbe7f8;
  border-radius: 999px;
}

.progress-track span {
  display: block;
  height: 100%;
  background: #2f6bea;
  border-radius: inherit;
  transition: width 300ms ease;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 9px;
  margin-top: 9px;
}

.metric-card {
  display: flex;
  height: 54px;
  justify-content: center;
  flex-direction: column;
  padding: 9px 10px;
  background: #ffffff;
  border: 1px solid #dfe5ec;
  border-radius: 9px;
}

.metric-card span {
  margin-bottom: 1px;
  color: #8b96a7;
  font-size: 9px;
  font-weight: 500;
}

.metric-card strong {
  color: #202a3a;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.15;
}

.metric-card .metric-success {
  color: #16944b;
}

.monitor-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 9px;
  margin-top: 9px;
}

.monitor-card,
.errors-card {
  padding: 10px;
  background: #ffffff;
  border: 1px solid #dfe5ec;
  border-radius: 9px;
}

.monitor-card {
  min-height: 191px;
}

.monitor-card h2,
.errors-card h2 {
  margin: 0;
  color: #263244;
  font-size: 11px;
  font-weight: 800;
}

.card-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chart-legend {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chart-legend span {
  display: flex;
  align-items: center;
  gap: 3px;
  color: #7f8b9d;
  font-size: 7px;
}

.legend-dot {
  display: inline-block;
  width: 4px;
  height: 4px;
  border-radius: 50%;
}

.legend-dot--average {
  background: #2f6bea;
}

.legend-dot--p95 {
  background: #ff761f;
}

.response-chart {
  display: block;
  width: 100%;
  height: 130px;
  margin-top: 11px;
  overflow: visible;
}

.chart-grid line {
  stroke: #eef1f5;
  stroke-width: 1;
}

.chart-axis {
  stroke: #98a4b5;
  stroke-width: 0.8;
}

.chart-line {
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.chart-line--average {
  stroke: #2f6bea;
}

.chart-line--p95 {
  stroke: #ff761f;
}

.chart-point {
  stroke-width: 1;
  fill: #ffffff;
}

.chart-point--average {
  stroke: #2f6bea;
}

.chart-point--p95 {
  stroke: #ff761f;
}

.status-card dl {
  margin: 9px 0 0;
}

.status-card dl > div {
  display: grid;
  grid-template-columns: 1fr 0.65fr;
  min-height: 28px;
  align-items: center;
  padding: 0 8px;
  border-bottom: 1px solid #edf0f4;
}

.status-card dl > div:last-child {
  border-bottom: 0;
}

.status-card dt,
.status-card dd {
  margin: 0;
  font-size: 8px;
}

.status-card dt {
  color: #566276;
}

.status-card dd {
  color: #263244;
  font-weight: 800;
}

.status-card .status-success {
  color: #159253;
}

.status-card .status-danger {
  color: #db4035;
}

.status-card .status-warning {
  color: #d66b16;
}

.errors-card {
  min-height: 86px;
  margin-top: 9px;
}

.errors-card h2 {
  margin-bottom: 7px;
}

.errors-table-wrap {
  overflow-x: auto;
}

.errors-card table {
  width: 100%;
  min-width: 520px;
  border-spacing: 0;
  border-collapse: collapse;
}

.errors-card td {
  height: 25px;
  padding: 5px 0;
  color: #566276;
  font-size: 8px;
  border-bottom: 1px solid #edf0f4;
}

.errors-card tr:last-child td {
  border-bottom: 0;
}

.errors-card td:first-child {
  width: 9%;
}

.errors-card td:nth-child(2) {
  width: 11%;
}

.errors-card td:last-child {
  width: 15%;
  font-weight: 800;
  text-align: right;
}

.error-path {
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
}

.error-timeout,
.error-server {
  color: #dc342b !important;
}

.no-errors {
  margin: 18px 0;
  color: #8a96a8;
  font-size: 9px;
  text-align: center;
}

@media (min-width: 1100px) {
  .run-live-page {
    padding: 28px 34px 56px;
  }

  .run-header {
    min-height: 66px;
    padding-bottom: 12px;
  }

  .run-heading h1 {
    font-size: 25px;
  }

  .run-heading p {
    font-size: 10px;
  }

  .running-badge {
    font-size: 9px;
  }

  .stop-button {
    width: 190px;
    height: 30px;
    font-size: 10px;
  }

  .progress-card {
    margin-top: 13px;
    padding: 13px 15px 15px;
  }

  .progress-labels strong,
  .progress-labels time {
    font-size: 10px;
  }

  .progress-track {
    height: 7px;
  }

  .metric-grid,
  .monitor-grid {
    gap: 14px;
    margin-top: 14px;
  }

  .metric-card {
    height: 82px;
    padding: 14px 16px;
    border-radius: 12px;
  }

  .metric-card span {
    font-size: 11px;
  }

  .metric-card strong {
    font-size: 24px;
  }

  .monitor-card,
  .errors-card {
    padding: 15px;
    border-radius: 12px;
  }

  .monitor-card {
    min-height: 285px;
  }

  .monitor-card h2,
  .errors-card h2 {
    font-size: 14px;
  }

  .chart-legend span {
    font-size: 8px;
  }

  .response-chart {
    height: 210px;
  }

  .status-card dl > div {
    min-height: 42px;
    padding: 0 12px;
  }

  .status-card dt,
  .status-card dd {
    font-size: 10px;
  }

  .errors-card {
    min-height: 130px;
    margin-top: 14px;
  }

  .errors-card td {
    height: 36px;
    font-size: 9px;
  }
}

@media (max-width: 760px) {
  .run-live-page {
    padding: 18px 14px 36px;
  }

  .run-heading h1 {
    font-size: 21px;
  }

  .run-heading p {
    max-width: 55vw;
    font-size: 8px;
  }

  .header-actions {
    gap: 8px;
  }

  .running-badge {
    font-size: 8px;
  }

  .stop-button {
    width: 80px;
    height: 30px;
    font-size: 9px;
  }

  .progress-labels strong,
  .progress-labels time {
    font-size: 9px;
  }

  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .metric-card {
    height: 72px;
  }

  .metric-card span {
    font-size: 10px;
  }

  .metric-card strong {
    font-size: 22px;
  }

  .monitor-grid {
    grid-template-columns: 1fr;
  }

  .monitor-card h2,
  .errors-card h2 {
    font-size: 12px;
  }

  .chart-legend span,
  .status-card dt,
  .status-card dd,
  .errors-card td {
    font-size: 8px;
  }
}
</style>
