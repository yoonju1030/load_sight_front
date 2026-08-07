<template>
  <section class="run-result-page">
    <header class="result-header">
      <div class="result-heading">
        <h1>{{ $t('result.title', { name: result.name }) }}</h1>
        <p>{{ $t('result.subtitle', {
          time: result.executionTime,
          duration: formattedDuration
        }) }}</p>
      </div>

      <div class="header-actions">
        <button type="button" class="action-button" @click="rerunTest">
          {{ $t('result.rerun') }}
        </button>
        <button type="button" class="action-button" @click="compareResult">
          {{ $t('result.compare') }}
        </button>
        <button
          type="button"
          class="action-button action-button--primary"
          :disabled="isDownloading"
          @click="exportReport"
        >
          {{ isDownloading ? $t('result.generating') : $t('result.report') }}
        </button>
      </div>
    </header>

    <div v-if="isLoading" class="loading-panel" role="status">
      {{ $t('result.loading') }}
    </div>

    <template v-else>
      <section class="threshold-alert" :class="`threshold-alert--${verdictTone}`">
        <strong>
          <span aria-hidden="true">{{ verdictIcon }}</span>
          {{ verdictLabel }}
        </strong>
        <p>{{ verdictMessage }}</p>
      </section>

      <div class="metric-grid">
        <article class="metric-card">
          <span>{{ $t('result.totalRequests') }}</span>
          <strong>{{ formatNumber(result.metrics.totalRequests) }}</strong>
        </article>
        <article class="metric-card">
          <span>{{ $t('result.averageResponse') }}</span>
          <strong>{{ formatMilliseconds(result.metrics.averageLatency) }}</strong>
        </article>
        <article class="metric-card">
          <span>p95</span>
          <strong :class="{ 'metric-danger': isP95Exceeded }">
            {{ formatMilliseconds(result.metrics.p95Latency) }}
          </strong>
        </article>
        <article class="metric-card">
          <span>{{ $t('result.errorRate') }}</span>
          <strong class="metric-success">{{ formatPercent(result.metrics.errorRate) }}</strong>
        </article>
      </div>

      <div class="chart-grid">
        <article class="content-card chart-card">
          <h2>{{ $t('result.responseTrend') }}</h2>
          <svg
            class="line-chart"
            viewBox="0 0 320 126"
            preserveAspectRatio="none"
            role="img"
            :aria-label="$t('result.responseChart')"
          >
            <g class="chart-guides">
              <line v-for="y in chartGuideLines" :key="`response-${y}`" x1="0" :y1="y" x2="320" :y2="y" />
            </g>
            <line class="chart-axis" x1="0" y1="114" x2="320" y2="114" />
            <polyline class="chart-line chart-line--blue" :points="responseP95Polyline" />
            <polyline class="chart-line chart-line--orange" :points="responseAveragePolyline" />
            <circle
              v-for="(point, index) in responseP95Points"
              :key="`p95-${index}`"
              class="chart-point chart-point--blue"
              :cx="point.x"
              :cy="point.y"
              r="1.7"
            />
            <circle
              v-for="(point, index) in responseAveragePoints"
              :key="`average-${index}`"
              class="chart-point chart-point--orange"
              :cx="point.x"
              :cy="point.y"
              r="1.7"
            />
          </svg>
        </article>

        <article class="content-card chart-card">
          <h2>{{ $t('result.rpsTrend') }}</h2>
          <svg
            class="line-chart"
            viewBox="0 0 320 126"
            preserveAspectRatio="none"
            role="img"
            :aria-label="$t('result.rpsChart')"
          >
            <g class="chart-guides">
              <line v-for="y in chartGuideLines" :key="`rps-${y}`" x1="0" :y1="y" x2="320" :y2="y" />
            </g>
            <line class="chart-axis" x1="0" y1="114" x2="320" y2="114" />
            <polyline class="chart-line chart-line--blue" :points="actualRpsPolyline" />
            <polyline class="chart-line chart-line--orange" :points="targetRpsPolyline" />
            <circle
              v-for="(point, index) in actualRpsPoints"
              :key="`actual-rps-${index}`"
              class="chart-point chart-point--blue"
              :cx="point.x"
              :cy="point.y"
              r="1.7"
            />
            <circle
              v-for="(point, index) in targetRpsPoints"
              :key="`target-rps-${index}`"
              class="chart-point chart-point--orange"
              :cx="point.x"
              :cy="point.y"
              r="1.7"
            />
          </svg>
        </article>
      </div>

      <div class="analysis-grid">
        <article class="content-card analysis-card">
          <h2>{{ $t('result.analysis') }}</h2>
          <ul>
            <li
              v-for="(message, index) in result.analysisMessages"
              :key="message"
              :class="{ 'analysis-warning': index === 0 && isP95Exceeded }"
            >
              <span>{{ index + 1 }}</span>
              {{ message }}
            </li>
          </ul>
        </article>

        <article class="content-card error-card">
          <h2>{{ $t('result.errorAnalysis') }}</h2>
          <div v-if="result.errors.length" class="error-table-wrap">
            <table>
              <tbody>
                <tr v-for="error in result.errors" :key="error.type">
                  <td>{{ error.type }}</td>
                  <td>{{ $t('result.count', { count: formatNumber(error.count) }) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="empty-errors">{{ $t('result.noErrors') }}</p>
        </article>
      </div>

      <p v-if="reportMessage" class="report-message" role="status">
        {{ reportMessage }}
      </p>
    </template>
  </section>
</template>

<script>
import { getRunDetails } from '../api/runApi';
import { downloadReport } from '../api/reportApi';

const defaultResult = () => ({
  id: '',
  planId: null,
  name: '자산 목록 조회',
  executionTime: '2026-08-06 15:20',
  durationSec: 60,
  targetRps: 100,
  thresholds: {
    p95Latency: 1000
  },
  metrics: {
    totalRequests: 5812,
    averageLatency: 412,
    p95Latency: 1284,
    errorRate: 0.6,
    actualRps: 76
  },
  responseTrend: {
    average: [120, 150, 190, 240, 310, 410, 540],
    p95: [280, 340, 430, 560, 760, 980, 1284]
  },
  rpsTrend: {
    actual: [18, 24, 34, 48, 66, 82, 100],
    target: [4, 7, 12, 19, 27, 39, 55]
  },
  analysisMessages: [
    '후반부에 p95가 증가했습니다. 자원 포화 가능성이 있습니다.',
    '실제 RPS가 목표의 76%에 머물렀습니다.'
  ],
  errors: [
    { type: 'Timeout', count: 21 },
    { type: 'HTTP 500', count: 12 },
    { type: 'Connection Error', count: 2 }
  ]
});

export default {
  name: 'RunResultView',
  data() {
    return {
      result: defaultResult(),
      isLoading: true,
      isDownloading: false,
      reportMessage: '',
      chartGuideLines: [24, 51, 78, 105]
    };
  },
  computed: {
    p95Threshold() {
      return Number(this.result.thresholds.p95Latency) || 1000;
    },
    isP95Exceeded() {
      return this.result.metrics.p95Latency > this.p95Threshold;
    },
    verdictTone() {
      if (this.isP95Exceeded) return 'warning';
      if (this.result.metrics.errorRate > 1) return 'danger';
      return 'success';
    },
    verdictIcon() {
      return this.verdictTone === 'success' ? '✓' : '⚠';
    },
    verdictLabel() {
      if (this.isP95Exceeded) return this.$t('result.verdict.below');
      if (this.result.metrics.errorRate > 1) return this.$t('result.verdict.errorExceeded');
      return this.$t('result.verdict.passed');
    },
    verdictMessage() {
      if (this.isP95Exceeded) {
        return this.$t('result.verdict.p95Message', {
          threshold: this.formatNumber(this.p95Threshold)
        });
      }
      if (this.result.metrics.errorRate > 1) {
        return this.$t('result.verdict.errorMessage');
      }
      return this.$t('result.verdict.passedMessage');
    },
    formattedDuration() {
      const seconds = Math.max(0, Number(this.result.durationSec) || 0);
      if (seconds < 60) return this.$t('result.seconds', { value: seconds });
      const minutes = Math.floor(seconds / 60);
      const remainder = seconds % 60;
      return remainder
        ? this.$t('result.minutesSeconds', { minutes, seconds: remainder })
        : this.$t('result.seconds', { value: minutes * 60 });
    },
    responseP95Points() {
      return this.toChartPoints(
        this.result.responseTrend.p95,
        this.result.responseTrend.average
      );
    },
    responseAveragePoints() {
      return this.toChartPoints(
        this.result.responseTrend.average,
        this.result.responseTrend.p95
      );
    },
    responseP95Polyline() {
      return this.toPolyline(this.responseP95Points);
    },
    responseAveragePolyline() {
      return this.toPolyline(this.responseAveragePoints);
    },
    actualRpsPoints() {
      return this.toChartPoints(
        this.result.rpsTrend.actual,
        this.result.rpsTrend.target
      );
    },
    targetRpsPoints() {
      return this.toChartPoints(
        this.result.rpsTrend.target,
        this.result.rpsTrend.actual
      );
    },
    actualRpsPolyline() {
      return this.toPolyline(this.actualRpsPoints);
    },
    targetRpsPolyline() {
      return this.toPolyline(this.targetRpsPoints);
    }
  },
  async mounted() {
    await this.loadResult();
  },
  methods: {
    async loadResult() {
      this.isLoading = true;
      try {
        const details = await getRunDetails(this.$route.params.runId);
        this.applyDetails(details);
      } finally {
        this.isLoading = false;
      }
    },
    applyDetails(details) {
      if (!details) return;

      const defaults = defaultResult();
      const metrics = details.metrics || {};
      const thresholds = details.targetThresholds || details.thresholds || {};
      const responseTrend = details.responseTrend || details.trends?.responseTime || {};
      const rpsTrend = details.rpsTrend || details.trends?.rps || {};

      this.result = {
        ...defaults,
        id: details.id || this.$route.params.runId,
        planId: details.planId ?? defaults.planId,
        name: details.planName || details.name || defaults.name,
        executionTime:
          details.executionTime ||
          details.startTime ||
          details.endTime ||
          defaults.executionTime,
        durationSec: details.durationSec ?? defaults.durationSec,
        targetRps: metrics.targetRps ?? details.targetRps ?? defaults.targetRps,
        thresholds: {
          ...defaults.thresholds,
          p95Latency:
            thresholds.p95Latency ??
            thresholds.p95 ??
            defaults.thresholds.p95Latency
        },
        metrics: {
          totalRequests: Number(
            metrics.totalRequests ?? details.totalRequests ?? defaults.metrics.totalRequests
          ),
          averageLatency: Number(
            metrics.averageLatency ??
            metrics.avgLatency ??
            metrics.p50Latency ??
            defaults.metrics.averageLatency
          ),
          p95Latency: Number(
            metrics.p95Latency ?? details.p95Latency ?? defaults.metrics.p95Latency
          ),
          errorRate: Number(
            metrics.errorRate ?? details.errorRate ?? defaults.metrics.errorRate
          ),
          actualRps: Number(metrics.rps ?? details.rps ?? defaults.metrics.actualRps)
        },
        responseTrend: {
          average: this.validSeries(
            responseTrend.average || responseTrend.avg,
            defaults.responseTrend.average
          ),
          p95: this.validSeries(responseTrend.p95, defaults.responseTrend.p95)
        },
        rpsTrend: {
          actual: this.validSeries(
            rpsTrend.actual || rpsTrend.rps,
            defaults.rpsTrend.actual
          ),
          target: this.validSeries(rpsTrend.target, defaults.rpsTrend.target)
        },
        analysisMessages: this.resolveAnalysisMessages(details, metrics, defaults),
        errors: this.resolveErrors(details, metrics, defaults)
      };
    },
    resolveAnalysisMessages(details, metrics, defaults) {
      const messages =
        details.analysisMessages ||
        details.analysis ||
        details.bottlenecks;

      if (Array.isArray(messages) && messages.length) {
        return messages.slice(0, 2).map((message) =>
          typeof message === 'string'
            ? message.replace(/^\d+\.\s*/, '')
            : message.message
        );
      }

      const actualRps = Number(metrics.rps ?? defaults.metrics.actualRps);
      const targetRps = Number(metrics.targetRps ?? details.targetRps ?? defaults.targetRps);
      const achievement = targetRps ? Math.round((actualRps / targetRps) * 100) : 0;

      return [
        defaults.analysisMessages[0],
        `실제 RPS가 목표의 ${achievement}%에 머물렀습니다.`
      ];
    },
    resolveErrors(details, metrics, defaults) {
      const source = details.errorAnalysis || details.errors || details.topErrors;
      if (Array.isArray(source) && source.length) {
        return source.slice(0, 3).map((error) => ({
          type: error.type || error.message || `HTTP ${error.code}`,
          count: Number(error.count ?? error.value ?? 0)
        }));
      }

      const generated = [
        { type: 'Timeout', count: Number(metrics.timeout ?? 0) },
        { type: 'HTTP 500', count: Number(metrics.http500 ?? 0) },
        { type: 'Connection Error', count: Number(metrics.connectionError ?? 0) }
      ];

      return generated.some((error) => error.count > 0) ? generated : defaults.errors;
    },
    validSeries(series, fallback) {
      if (!Array.isArray(series) || series.length < 2) return fallback;
      return series.map((value) => Number(value) || 0);
    },
    toChartPoints(series, comparisonSeries) {
      const values = [...series, ...comparisonSeries].map((value) => Number(value) || 0);
      const max = Math.max(...values, 1);
      const min = Math.min(...values, 0);
      const range = max - min || 1;
      const width = 312;

      return series.map((value, index) => ({
        x: 4 + (index * width) / Math.max(series.length - 1, 1),
        y: 108 - ((Number(value) - min) / range) * 88
      }));
    },
    toPolyline(points) {
      return points.map(({ x, y }) => `${x},${y}`).join(' ');
    },
    formatNumber(value) {
      return Number(value || 0).toLocaleString('ko-KR');
    },
    formatMilliseconds(value) {
      return `${this.formatNumber(value)}ms`;
    },
    formatPercent(value) {
      return `${Number(value || 0).toFixed(1)}%`;
    },
    rerunTest() {
      if (this.result.planId) {
        this.$router.push(`/test-plans/${this.result.planId}/edit`);
        return;
      }
      this.$router.push('/test-plans');
    },
    compareResult() {
      this.$router.push({
        path: '/compare',
        query: { runId: this.result.id || this.$route.params.runId }
      });
    },
    async exportReport() {
      this.isDownloading = true;
      this.reportMessage = '';
      try {
        const report = await downloadReport(
          this.result.id || this.$route.params.runId,
          'pdf'
        );
        this.reportMessage =
          this.$i18n.locale === 'ko' && report?.message
            ? report.message
            : this.$t('result.reportRequested');
      } catch {
        this.reportMessage = this.$t('result.reportFailed');
      } finally {
        this.isDownloading = false;
      }
    }
  }
};
</script>

<style scoped>
.run-result-page {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  padding: 17px 20px 42px;
}

.result-header {
  display: flex;
  min-height: 58px;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.result-heading {
  min-width: 0;
}

.result-heading h1 {
  margin: 0 0 2px;
  color: #1e293b;
  font-size: 20px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.55px;
}

.result-heading p {
  margin: 0;
  color: #8a96a8;
  font-size: 9px;
  font-weight: 500;
}

.header-actions {
  display: grid;
  width: min(58%, 530px);
  flex: 0 0 auto;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
}

.action-button {
  height: 14px;
  padding: 0 8px;
  color: #465267;
  font-size: 8px;
  font-weight: 700;
  background: #ffffff;
  border: 1px solid #d4dce7;
  border-radius: 6px;
  cursor: pointer;
  transition: color 160ms ease, border-color 160ms ease, background 160ms ease;
}

.action-button:hover:not(:disabled) {
  color: #2f6bea;
  border-color: #2f6bea;
}

.action-button--primary {
  color: #ffffff;
  background: #2f6bea;
  border-color: #2f6bea;
}

.action-button--primary:hover:not(:disabled) {
  color: #ffffff;
  background: #1d4ed8;
}

.action-button:disabled {
  cursor: wait;
  opacity: 0.65;
}

.loading-panel {
  display: flex;
  min-height: 260px;
  align-items: center;
  justify-content: center;
  color: #7c889a;
  font-size: 9px;
}

.threshold-alert {
  min-height: 47px;
  padding: 9px 12px;
  background: #fff9ea;
  border: 1px solid #f6cd63;
  border-radius: 8px;
}

.threshold-alert strong {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #d26a16;
  font-size: 9px;
  font-weight: 800;
}

.threshold-alert p {
  margin: 2px 0 0;
  color: #5c6677;
  font-size: 8px;
}

.threshold-alert--danger {
  background: #fff3f1;
  border-color: #f4b7af;
}

.threshold-alert--danger strong {
  color: #d9362b;
}

.threshold-alert--success {
  background: #eefbf4;
  border-color: #a9dec1;
}

.threshold-alert--success strong {
  color: #159253;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 9px;
  margin-top: 9px;
}

.metric-card,
.content-card {
  background: #ffffff;
  border: 1px solid #dfe5ec;
  border-radius: 9px;
}

.metric-card {
  display: flex;
  height: 54px;
  justify-content: center;
  flex-direction: column;
  padding: 9px 10px;
}

.metric-card span {
  margin-bottom: 2px;
  color: #8b96a7;
  font-size: 8px;
  font-weight: 600;
}

.metric-card strong {
  color: #202a3a;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.1;
}

.metric-card .metric-danger {
  color: #e25c14;
}

.metric-card .metric-success {
  color: #159253;
}

.chart-grid,
.analysis-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
  margin-top: 9px;
}

.content-card {
  padding: 10px;
}

.content-card h2 {
  margin: 0;
  color: #263244;
  font-size: 10px;
  font-weight: 800;
}

.chart-card {
  min-height: 199px;
}

.line-chart {
  display: block;
  width: 100%;
  height: 144px;
  margin-top: 10px;
  overflow: visible;
}

.chart-guides line {
  stroke: #eef1f5;
  stroke-width: 1;
}

.chart-axis {
  stroke: #a4aebe;
  stroke-width: 0.9;
}

.chart-line {
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.chart-line--blue {
  stroke: #2f6bea;
}

.chart-line--orange {
  stroke: #ff6b1a;
}

.chart-point {
  fill: #ffffff;
  stroke-width: 1;
}

.chart-point--blue {
  stroke: #2f6bea;
}

.chart-point--orange {
  stroke: #ff6b1a;
}

.analysis-card,
.error-card {
  min-height: 115px;
}

.analysis-card ul {
  display: grid;
  gap: 6px;
  margin: 9px 0 0;
  padding: 0;
  list-style: none;
}

.analysis-card li {
  display: flex;
  min-height: 32px;
  align-items: center;
  padding: 7px 10px;
  color: #647084;
  font-size: 8px;
  background: #f8fafc;
  border: 1px solid #e1e6ed;
  border-radius: 7px;
}

.analysis-card li span {
  display: inline-flex;
  width: 12px;
  height: 12px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  margin-right: 3px;
  color: #7d899b;
  border: 1px solid #bfc8d4;
  border-radius: 50%;
}

.analysis-card .analysis-warning {
  color: #5e6674;
  background: #fffbef;
  border-color: #f4cf70;
}

.error-table-wrap {
  margin-top: 8px;
}

.error-card table {
  width: 100%;
  border-spacing: 0;
  border-collapse: collapse;
}

.error-card td {
  height: 24px;
  padding: 4px 8px;
  color: #566276;
  font-size: 8px;
  border-bottom: 1px solid #edf0f4;
}

.error-card tr:last-child td {
  border-bottom: 0;
}

.error-card td:last-child {
  width: 28%;
  color: #263244;
  font-weight: 800;
}

.empty-errors {
  margin: 25px 0;
  color: #8a96a8;
  font-size: 9px;
  text-align: center;
}

.report-message {
  margin: 9px 0 0;
  color: #526176;
  font-size: 9px;
  text-align: right;
}

@media (min-width: 1100px) {
  .run-result-page {
    padding: 28px 34px 56px;
  }

  .result-header {
    min-height: 86px;
  }

  .result-heading h1 {
    font-size: 25px;
  }

  .result-heading p {
    font-size: 10px;
  }

  .header-actions {
    gap: 10px;
  }

  .action-button {
    height: 30px;
    font-size: 10px;
  }

  .threshold-alert {
    min-height: 69px;
    padding: 13px 15px;
    border-radius: 10px;
  }

  .threshold-alert strong {
    font-size: 11px;
  }

  .threshold-alert p {
    font-size: 9px;
  }

  .metric-grid,
  .chart-grid,
  .analysis-grid {
    gap: 14px;
    margin-top: 14px;
  }

  .metric-card {
    height: 82px;
    padding: 14px 16px;
    border-radius: 12px;
  }

  .metric-card span {
    font-size: 10px;
  }

  .metric-card strong {
    font-size: 24px;
  }

  .content-card {
    padding: 15px;
    border-radius: 12px;
  }

  .content-card h2 {
    font-size: 13px;
  }

  .chart-card {
    min-height: 298px;
  }

  .line-chart {
    height: 222px;
    margin-top: 15px;
  }

  .analysis-card,
  .error-card {
    min-height: 172px;
  }

  .analysis-card ul {
    gap: 9px;
    margin-top: 13px;
  }

  .analysis-card li {
    min-height: 47px;
    padding: 10px 14px;
    font-size: 9px;
  }

  .analysis-card li span {
    width: 17px;
    height: 17px;
    margin-right: 5px;
  }

  .error-table-wrap {
    margin-top: 12px;
  }

  .error-card td {
    height: 36px;
    padding: 6px 12px;
    font-size: 9px;
  }
}

@media (max-width: 760px) {
  .run-result-page {
    padding: 18px 14px 36px;
  }

  .result-header {
    align-items: flex-start;
    flex-direction: column;
    padding-bottom: 12px;
  }

  .result-heading h1 {
    font-size: 21px;
  }

  .result-heading p {
    margin-top: 3px;
    font-size: 9px;
  }

  .header-actions {
    width: 100%;
  }

  .action-button {
    height: 32px;
    font-size: 9px;
  }

  .threshold-alert strong {
    font-size: 10px;
  }

  .threshold-alert p {
    font-size: 8px;
  }

  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .metric-card {
    height: 70px;
  }

  .metric-card span {
    font-size: 9px;
  }

  .metric-card strong {
    font-size: 20px;
  }

  .chart-grid,
  .analysis-grid {
    grid-template-columns: 1fr;
  }

  .content-card h2 {
    font-size: 11px;
  }

  .analysis-card li,
  .error-card td {
    font-size: 8px;
  }
}

@media (max-width: 420px) {
  .header-actions {
    grid-template-columns: 1fr;
  }
}
</style>
