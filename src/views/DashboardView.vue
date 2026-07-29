<template>
  <section class="dashboard-page">
    <header class="page-header">
      <div>
        <h1>대시보드</h1>
        <p>API 부하 테스트 현황을 한눈에 확인합니다.</p>
      </div>

      <router-link to="/test-plans/new" class="primary-button">
        <span aria-hidden="true">+</span>
        새 테스트
      </router-link>
    </header>

    <div class="metric-grid" aria-label="테스트 요약">
      <article v-for="metric in metrics" :key="metric.label" class="metric-card">
        <span class="metric-label">{{ metric.label }}</span>
        <strong :class="metric.tone ? `metric-value--${metric.tone}` : ''">
          {{ metric.value }}
        </strong>
      </article>
    </div>

    <article class="panel running-panel">
      <div class="panel-title-row">
        <h2>실행 중인 테스트</h2>
        <span class="running-badge">{{ isRunning ? 'RUNNING' : 'STOPPED' }}</span>
      </div>

      <div class="running-content">
        <div class="test-summary">
          <strong>회원 조회 API</strong>
          <span>GET https://api.example.com/users</span>
        </div>

        <div class="live-stat">
          <strong>{{ isRunning ? '98 RPS' : '0 RPS' }}</strong>
          <span>p95 220ms · 오류율 0.4%</span>
        </div>

        <router-link to="/runs/run-101/live" class="secondary-button">
          모니터링
        </router-link>

        <button
          type="button"
          class="stop-button"
          :disabled="!isRunning"
          @click="stopTest"
        >
          {{ isRunning ? '중지' : '중지됨' }}
        </button>
      </div>

      <div
        class="progress-track"
        role="progressbar"
        :aria-valuenow="isRunning ? 57 : 100"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label="테스트 진행률"
      >
        <span :style="{ width: isRunning ? '57%' : '100%' }" />
      </div>
      <time class="elapsed-time">01:24 / 02:30</time>
    </article>

    <article class="panel history-panel">
      <h2>최근 실행</h2>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>테스트명</th>
              <th>상태</th>
              <th>시작 시간</th>
              <th>p95</th>
              <th>오류율</th>
              <th><span class="sr-only">결과 보기</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="run in recentRuns" :key="run.id">
              <td class="test-name">{{ run.name }}</td>
              <td>
                <span class="status-chip" :class="`status-chip--${run.tone}`">
                  {{ run.status }}
                </span>
              </td>
              <td>{{ run.startedAt }}</td>
              <td>{{ run.p95 }}</td>
              <td>{{ run.errorRate }}</td>
              <td>
                <router-link :to="`/runs/${run.id}/result`" class="result-button">
                  결과
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
  </section>
</template>

<script>
export default {
  name: 'DashboardView',
  data() {
    return {
      isRunning: true,
      recentRuns: [
        {
          id: 'run-103',
          name: '회원 조회',
          status: '완료',
          tone: 'success',
          startedAt: '오늘 14:20',
          p95: '280ms',
          errorRate: '0.1%'
        },
        {
          id: 'run-102',
          name: '재산 목록',
          status: '실패',
          tone: 'danger',
          startedAt: '오늘 13:42',
          p95: '4.2s',
          errorRate: '12.0%'
        },
        {
          id: 'run-101',
          name: '로그인 API',
          status: '취소',
          tone: 'neutral',
          startedAt: '어제 18:10',
          p95: '490ms',
          errorRate: '0.6%'
        }
      ]
    };
  },
  computed: {
    metrics() {
      return [
        { label: '실행 중', value: this.isRunning ? '1' : '0' },
        { label: '최근 7일 실행', value: '12' },
        { label: '평균 성공률', value: '98.7%', tone: 'success' },
        { label: '주의 필요', value: '2', tone: 'danger' }
      ];
    }
  },
  methods: {
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
  font-size: 17px;
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: -0.55px;
}

.page-header p {
  margin: 0;
  color: #8a96a8;
  font-size: 7px;
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
  font-size: 7px;
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
  font-size: 7px;
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
  font-size: 6px;
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
  font-size: 6px;
  font-weight: 500;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.secondary-button,
.stop-button {
  width: 100%;
  height: 14px;
  font-size: 6px;
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
  font-size: 5px;
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
  font-size: 6px;
  font-weight: 700;
  text-align: left;
  background: #f5f8fc;
  border-bottom: 1px solid #e6ebf1;
}

td {
  height: 30px;
  padding: 6px 7px;
  color: #566276;
  font-size: 6px;
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
  font-size: 5px;
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
  font-size: 6px;
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
