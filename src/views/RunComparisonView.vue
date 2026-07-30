<template>
  <section class="comparison-page">
    <header class="page-header">
      <h1>실행 결과 비교</h1>
      <p>두 실행의 성능 지표와 응답 분포를 비교합니다.</p>
    </header>

    <section class="run-selector-card" aria-label="비교 실행 선택">
      <label>
        <span>기준 실행</span>
        <select v-model="baseRunId" :disabled="isLoadingRuns" @change="handleBaseChange">
          <option v-for="run in completedRuns" :key="run.id" :value="run.id">
            {{ runOptionLabel(run) }}
          </option>
        </select>
      </label>

      <label>
        <span>비교 실행</span>
        <select
          v-model="compareRunId"
          :disabled="isLoadingRuns || !comparisonCandidates.length"
          @change="loadComparison"
        >
          <option v-for="run in comparisonCandidates" :key="run.id" :value="run.id">
            {{ runOptionLabel(run) }}
          </option>
        </select>
      </label>
    </section>

    <div v-if="isLoadingRuns" class="loading-panel" role="status">
      실행 이력을 불러오는 중입니다.
    </div>

    <template v-else-if="baseRunId && compareRunId">
      <section class="summary-panel" :class="`summary-panel--${summaryTone}`">
        <span class="summary-icon" aria-hidden="true">{{ summaryIcon }}</span>
        <div>
          <strong>종합 결과: {{ summaryLabel }}</strong>
          <p>{{ comparison.summary }}</p>
        </div>
      </section>

      <article class="content-card metrics-card">
        <div v-if="isLoadingComparison" class="inline-loading" role="status">
          비교 결과를 계산하는 중입니다.
        </div>
        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>지표</th>
                <th>기준</th>
                <th>비교</th>
                <th>변화</th>
                <th>판정</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="metric in comparison.metrics" :key="metric.label">
                <td>{{ metric.label }}</td>
                <td>{{ metric.base }}</td>
                <td>{{ metric.compare }}</td>
                <td :class="`change-value change-value--${metric.tone}`">
                  {{ metric.change }}
                </td>
                <td>
                  <span class="verdict-badge" :class="`verdict-badge--${metric.tone}`">
                    {{ metric.verdict }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

      <article class="content-card chart-card">
        <div class="chart-heading">
          <h2>응답시간 비교 차트</h2>
          <div class="chart-legend" aria-label="차트 범례">
            <span><i class="legend-dot legend-dot--base"></i>기준 실행</span>
            <span><i class="legend-dot legend-dot--compare"></i>비교 실행</span>
          </div>
        </div>

        <svg
          class="comparison-chart"
          viewBox="0 0 640 144"
          preserveAspectRatio="none"
          role="img"
          aria-label="기준 실행과 비교 실행의 응답시간 변화"
        >
          <g class="chart-guides">
            <line v-for="y in chartGuideLines" :key="y" x1="0" :y1="y" x2="640" :y2="y" />
          </g>
          <line class="chart-axis" x1="0" y1="130" x2="640" y2="130" />
          <polyline class="chart-line chart-line--base" :points="basePolyline" />
          <polyline class="chart-line chart-line--compare" :points="comparePolyline" />
          <circle
            v-for="(point, index) in baseChartPoints"
            :key="`base-${index}`"
            class="chart-point chart-point--base"
            :cx="point.x"
            :cy="point.y"
            r="2.2"
          />
          <circle
            v-for="(point, index) in compareChartPoints"
            :key="`compare-${index}`"
            class="chart-point chart-point--compare"
            :cx="point.x"
            :cy="point.y"
            r="2.2"
          />
        </svg>
      </article>
    </template>

    <section v-else class="empty-state">
      <strong>비교할 수 있는 실행 결과가 부족합니다.</strong>
      <p>동일한 테스트 플랜을 두 번 이상 실행한 후 다시 확인해 주세요.</p>
    </section>
  </section>
</template>

<script>
import { getRunComparison, getRunHistory } from '../api/runApi';

const defaultComparison = () => ({
  verdict: '개선',
  summary: 'p95는 72.4% 감소했고, 실제 RPS는 18.2% 증가했습니다.',
  metrics: [
    {
      label: '평균 응답',
      base: '812ms',
      compare: '214ms',
      change: '-73.6%',
      verdict: '개선',
      tone: 'success'
    },
    {
      label: 'p95',
      base: '1,420ms',
      compare: '392ms',
      change: '-72.4%',
      verdict: '개선',
      tone: 'success'
    },
    {
      label: 'p99',
      base: '2,810ms',
      compare: '740ms',
      change: '-73.7%',
      verdict: '개선',
      tone: 'success'
    },
    {
      label: '오류율',
      base: '2.4%',
      compare: '0.2%',
      change: '-2.2%p',
      verdict: '개선',
      tone: 'success'
    },
    {
      label: '실제 RPS',
      base: '82',
      compare: '97',
      change: '+18.2%',
      verdict: '개선',
      tone: 'success'
    }
  ],
  trends: {
    base: [310, 360, 450, 570, 760, 980, 1240],
    compare: [120, 145, 180, 225, 300, 410, 560]
  }
});

export default {
  name: 'RunComparisonView',
  data() {
    return {
      runs: [],
      baseRunId: '',
      compareRunId: '',
      comparison: defaultComparison(),
      isLoadingRuns: true,
      isLoadingComparison: false,
      chartGuideLines: [27, 57, 87, 117]
    };
  },
  computed: {
    completedRuns() {
      return this.runs.filter((run) => run.status !== 'RUNNING');
    },
    baseRun() {
      return this.completedRuns.find((run) => run.id === this.baseRunId);
    },
    comparisonCandidates() {
      const candidates = this.completedRuns.filter((run) => run.id !== this.baseRunId);
      if (!this.baseRun) return candidates;

      const samePlanRuns = candidates.filter(
        (run) => run.planName === this.baseRun.planName
      );
      return samePlanRuns.length ? samePlanRuns : candidates;
    },
    summaryTone() {
      const verdict = String(this.comparison.verdict || '');
      if (verdict.includes('개선') || verdict.includes('통과')) return 'success';
      if (verdict.includes('저하') || verdict.includes('실패')) return 'danger';
      return 'neutral';
    },
    summaryIcon() {
      if (this.summaryTone === 'success') return '✓';
      if (this.summaryTone === 'danger') return '!';
      return '−';
    },
    summaryLabel() {
      const verdict = String(this.comparison.verdict || '변화 없음');
      return verdict.replace(/^성능\s*/, '').replace(/됨$/, '');
    },
    baseChartPoints() {
      return this.toChartPoints(
        this.comparison.trends.base,
        this.comparison.trends.compare
      );
    },
    compareChartPoints() {
      return this.toChartPoints(
        this.comparison.trends.compare,
        this.comparison.trends.base
      );
    },
    basePolyline() {
      return this.toPolyline(this.baseChartPoints);
    },
    comparePolyline() {
      return this.toPolyline(this.compareChartPoints);
    }
  },
  async mounted() {
    await this.loadRuns();
  },
  methods: {
    async loadRuns() {
      this.isLoadingRuns = true;
      try {
        const history = await getRunHistory();
        this.runs = (Array.isArray(history) ? history : history?.items || [])
          .map((run) => ({
            ...run,
            id: String(run.id),
            planName: run.planName || run.name || '이름 없는 테스트',
            status: String(run.status || '').toUpperCase(),
            startTime: run.startTime || run.executionTime || run.endTime || '-'
          }))
          .sort((a, b) => String(b.startTime).localeCompare(String(a.startTime)));

        const requestedRunId = String(this.$route.query.runId || '');
        const requestedRun = this.completedRuns.find((run) => run.id === requestedRunId);
        this.baseRunId = requestedRun?.id || this.completedRuns[0]?.id || '';
        this.compareRunId = this.comparisonCandidates[0]?.id || '';

        if (this.baseRunId && this.compareRunId) {
          await this.loadComparison();
        }
      } finally {
        this.isLoadingRuns = false;
      }
    },
    async handleBaseChange() {
      if (!this.comparisonCandidates.some((run) => run.id === this.compareRunId)) {
        this.compareRunId = this.comparisonCandidates[0]?.id || '';
      }

      if (this.compareRunId) {
        await this.loadComparison();
      }
    },
    async loadComparison() {
      if (!this.baseRunId || !this.compareRunId) return;

      this.isLoadingComparison = true;
      try {
        const data = await getRunComparison(this.baseRunId, this.compareRunId);
        this.comparison = this.normalizeComparison(data);
      } finally {
        this.isLoadingComparison = false;
      }
    },
    normalizeComparison(data) {
      const defaults = defaultComparison();
      if (!data) return defaults;

      const sourceMetrics = Array.isArray(data.metrics)
        ? data.metrics
        : data.metricsTable;
      const metrics =
        Array.isArray(sourceMetrics) && sourceMetrics.length
          ? sourceMetrics.slice(0, 5).map((metric) => {
              const change =
                metric.change ??
                metric.changeRate ??
                metric.diff ??
                '-';
              const verdict =
                metric.verdict ||
                this.resolveMetricVerdict(metric.label, change);

              return {
                label: metric.label || metric.name || '-',
                base: String(metric.base ?? metric.baseline ?? '-'),
                compare: String(metric.compare ?? metric.comparison ?? '-'),
                change: String(change),
                verdict,
                tone: this.verdictTone(verdict)
              };
            })
          : defaults.metrics;

      const trends = data.responseTrend || data.trends || {};

      return {
        verdict: data.verdict || defaults.verdict,
        summary: data.summary || defaults.summary,
        metrics,
        trends: {
          base: this.validSeries(
            trends.base || trends.baseline,
            defaults.trends.base
          ),
          compare: this.validSeries(
            trends.compare || trends.comparison,
            defaults.trends.compare
          )
        }
      };
    },
    resolveMetricVerdict(label, change) {
      const value = parseFloat(String(change).replace(/,/g, ''));
      if (!Number.isFinite(value) || value === 0) return '동일';

      const higherIsBetter =
        String(label).includes('RPS') ||
        String(label).includes('성공') ||
        String(label).includes('요청 수');
      const improved = higherIsBetter ? value > 0 : value < 0;
      return improved ? '개선' : '저하';
    },
    verdictTone(verdict) {
      if (String(verdict).includes('개선')) return 'success';
      if (String(verdict).includes('저하')) return 'danger';
      return 'neutral';
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
      const width = 628;

      return series.map((value, index) => ({
        x: 6 + (index * width) / Math.max(series.length - 1, 1),
        y: 124 - ((Number(value) - min) / range) * 98
      }));
    },
    toPolyline(points) {
      return points.map(({ x, y }) => `${x},${y}`).join(' ');
    },
    runOptionLabel(run) {
      return `${run.startTime} · ${run.planName}`;
    }
  }
};
</script>

<style scoped>
.comparison-page {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  padding: 17px 20px 42px;
}

.page-header {
  display: flex;
  min-height: 58px;
  justify-content: center;
  flex-direction: column;
}

.page-header h1 {
  margin: 0 0 2px;
  color: #1e293b;
  font-size: 20px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.55px;
}

.page-header p {
  margin: 0;
  color: #8a96a8;
  font-size: 9px;
  font-weight: 500;
}

.run-selector-card {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
  padding: 10px;
  background: #ffffff;
  border: 1px solid #dfe5ec;
  border-radius: 9px;
}

.run-selector-card label {
  display: block;
  min-width: 0;
}

.run-selector-card label > span {
  display: block;
  margin-bottom: 4px;
  color: #657185;
  font-size: 8px;
  font-weight: 700;
}

.run-selector-card select {
  width: 100%;
  height: 27px;
  padding: 0 9px;
  color: #4a566a;
  font-size: 9px;
  background: #ffffff;
  border: 1px solid #d6dde7;
  border-radius: 5px;
  outline: none;
  cursor: pointer;
}

.run-selector-card select:focus {
  border-color: #2f6bea;
  box-shadow: 0 0 0 2px rgba(47, 107, 234, 0.12);
}

.run-selector-card select:disabled {
  cursor: default;
  background: #f5f7fa;
}

.loading-panel,
.empty-state {
  display: flex;
  min-height: 260px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: #7c889a;
  font-size: 9px;
}

.empty-state strong {
  color: #344054;
  font-size: 11px;
}

.empty-state p {
  margin: 5px 0 0;
  font-size: 8px;
}

.summary-panel {
  display: flex;
  min-height: 50px;
  align-items: center;
  gap: 10px;
  margin-top: 9px;
  padding: 9px 12px;
  background: #effcf5;
  border: 1px solid #a9e6c5;
  border-radius: 8px;
}

.summary-icon {
  flex: 0 0 auto;
  color: #159253;
  font-size: 14px;
  font-weight: 800;
}

.summary-panel strong {
  display: block;
  color: #16894d;
  font-size: 11px;
  font-weight: 800;
}

.summary-panel p {
  margin: 2px 0 0;
  color: #2f9a61;
  font-size: 8px;
}

.summary-panel--danger {
  background: #fff3f1;
  border-color: #f4b7af;
}

.summary-panel--danger .summary-icon,
.summary-panel--danger strong {
  color: #d9362b;
}

.summary-panel--danger p {
  color: #b64b43;
}

.summary-panel--neutral {
  background: #f5f7fa;
  border-color: #d7dee8;
}

.summary-panel--neutral .summary-icon,
.summary-panel--neutral strong,
.summary-panel--neutral p {
  color: #667388;
}

.content-card {
  margin-top: 9px;
  padding: 10px;
  background: #ffffff;
  border: 1px solid #dfe5ec;
  border-radius: 9px;
}

.metrics-card {
  min-height: 194px;
}

.inline-loading {
  display: flex;
  min-height: 172px;
  align-items: center;
  justify-content: center;
  color: #7c889a;
  font-size: 8px;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 570px;
  border-spacing: 0;
  border-collapse: collapse;
  table-layout: fixed;
}

th {
  height: 26px;
  padding: 6px 9px;
  color: #7c889a;
  font-size: 8px;
  font-weight: 700;
  text-align: left;
  background: #f6f8fb;
  border-bottom: 1px solid #e8ecf1;
}

td {
  height: 31px;
  padding: 6px 9px;
  color: #4f5b6e;
  font-size: 8px;
  font-weight: 500;
  border-bottom: 1px solid #edf0f4;
}

tbody tr:last-child td {
  border-bottom: 0;
}

th:first-child,
td:first-child {
  width: 23%;
  color: #263244;
  font-weight: 800;
}

th:nth-child(2),
td:nth-child(2),
th:nth-child(3),
td:nth-child(3) {
  width: 21%;
}

th:nth-child(4),
td:nth-child(4) {
  width: 20%;
}

th:last-child,
td:last-child {
  width: 15%;
}

.change-value {
  font-weight: 800;
}

.change-value--success {
  color: #159253;
}

.change-value--danger {
  color: #d9362b;
}

.change-value--neutral {
  color: #718096;
}

.verdict-badge {
  display: inline-flex;
  min-width: 29px;
  min-height: 14px;
  align-items: center;
  justify-content: center;
  padding: 2px 6px;
  font-size: 7px;
  font-weight: 800;
  border-radius: 999px;
  white-space: nowrap;
}

.verdict-badge--success {
  color: #159253;
  background: #e8f8ef;
}

.verdict-badge--danger {
  color: #d9362b;
  background: #ffedeb;
}

.verdict-badge--neutral {
  color: #718096;
  background: #edf1f5;
}

.chart-card {
  min-height: 191px;
}

.chart-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.chart-heading h2 {
  margin: 0;
  color: #263244;
  font-size: 10px;
  font-weight: 800;
}

.chart-legend {
  display: flex;
  align-items: center;
  gap: 9px;
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

.legend-dot--base {
  background: #2f6bea;
}

.legend-dot--compare {
  background: #ff6b1a;
}

.comparison-chart {
  display: block;
  width: 100%;
  height: 137px;
  margin-top: 9px;
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

.chart-line--base {
  stroke: #2f6bea;
}

.chart-line--compare {
  stroke: #ff6b1a;
}

.chart-point {
  fill: #ffffff;
  stroke-width: 1.2;
}

.chart-point--base {
  stroke: #2f6bea;
}

.chart-point--compare {
  stroke: #ff6b1a;
}

@media (min-width: 1100px) {
  .comparison-page {
    padding: 28px 34px 56px;
  }

  .page-header {
    min-height: 86px;
  }

  .page-header h1 {
    font-size: 25px;
  }

  .page-header p {
    font-size: 10px;
  }

  .run-selector-card {
    gap: 14px;
    padding: 15px;
    border-radius: 12px;
  }

  .run-selector-card label > span {
    margin-bottom: 6px;
    font-size: 9px;
  }

  .run-selector-card select {
    height: 39px;
    padding: 0 13px;
    font-size: 10px;
  }

  .summary-panel,
  .content-card {
    margin-top: 14px;
  }

  .summary-panel {
    min-height: 74px;
    gap: 14px;
    padding: 13px 16px;
    border-radius: 10px;
  }

  .summary-icon {
    font-size: 20px;
  }

  .summary-panel strong {
    font-size: 13px;
  }

  .summary-panel p {
    font-size: 9px;
  }

  .content-card {
    padding: 15px;
    border-radius: 12px;
  }

  .metrics-card {
    min-height: 288px;
  }

  .inline-loading {
    min-height: 258px;
    font-size: 11px;
  }

  th {
    height: 39px;
    padding: 9px 13px;
    font-size: 9px;
  }

  td {
    height: 47px;
    padding: 9px 13px;
    font-size: 9px;
  }

  .verdict-badge {
    min-width: 43px;
    min-height: 20px;
    padding: 3px 8px;
    font-size: 8px;
  }

  .chart-card {
    min-height: 284px;
  }

  .chart-heading h2 {
    font-size: 13px;
  }

  .chart-legend {
    gap: 14px;
  }

  .chart-legend span {
    font-size: 8px;
  }

  .legend-dot {
    width: 6px;
    height: 6px;
  }

  .comparison-chart {
    height: 211px;
    margin-top: 14px;
  }
}

@media (max-width: 760px) {
  .comparison-page {
    padding: 18px 14px 36px;
  }

  .page-header {
    min-height: 72px;
  }

  .page-header h1 {
    font-size: 21px;
  }

  .page-header p {
    margin-top: 3px;
    font-size: 9px;
  }

  .run-selector-card {
    grid-template-columns: 1fr;
  }

  .run-selector-card label > span {
    font-size: 9px;
  }

  .run-selector-card select {
    height: 34px;
    font-size: 9px;
  }

  .summary-panel strong {
    font-size: 11px;
  }

  .summary-panel p {
    font-size: 8px;
  }

  th,
  td {
    font-size: 8px;
  }

  .chart-heading h2 {
    font-size: 11px;
  }

  .chart-legend span {
    font-size: 7px;
  }
}
</style>
