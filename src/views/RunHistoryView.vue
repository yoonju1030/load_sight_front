<template>
  <section class="run-history-page">
    <header class="page-header">
      <div>
        <h1>실행 이력</h1>
        <p>실행한 API 부하 테스트의 결과와 성능 지표를 확인합니다.</p>
      </div>

      <router-link to="/test-plans" class="primary-button">
        테스트 실행
      </router-link>
    </header>

    <form class="filter-panel" @submit.prevent="applyFilters">
      <label class="search-field">
        <span class="sr-only">테스트명 또는 실행 ID 검색</span>
        <input
          v-model.trim="searchInput"
          type="search"
          placeholder="테스트명 또는 실행 ID 검색"
        >
      </label>

      <label class="select-field">
        <span class="sr-only">상태 필터</span>
        <select v-model="statusInput">
          <option value="ALL">상태 전체</option>
          <option value="PASS">성공</option>
          <option value="WARNING">주의</option>
          <option value="FAIL">실패</option>
          <option value="CANCELLED">취소</option>
          <option value="RUNNING">실행 중</option>
        </select>
      </label>

      <label class="select-field">
        <span class="sr-only">조회 기간</span>
        <select v-model="periodInput">
          <option value="ALL">전체 기간</option>
          <option value="7">최근 7일</option>
          <option value="30">최근 30일</option>
        </select>
      </label>

      <button type="submit" class="search-button">검색</button>
    </form>

    <article class="history-panel">
      <div v-if="filteredRuns.length" class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>실행 ID</th>
              <th>테스트명</th>
              <th>상태</th>
              <th>시작 시간</th>
              <th>실행 시간</th>
              <th>요청 수</th>
              <th>성공률</th>
              <th>p95</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="run in filteredRuns" :key="run.id">
              <td class="run-id">{{ run.id }}</td>
              <td class="plan-name">{{ run.planName }}</td>
              <td>
                <span class="status-badge" :class="`status-badge--${run.statusTone}`">
                  {{ run.statusLabel }}
                </span>
              </td>
              <td class="date-cell">{{ run.startTime }}</td>
              <td>{{ run.duration }}</td>
              <td>{{ run.totalRequests.toLocaleString() }}</td>
              <td :class="{ 'metric-danger': run.successRate < 95 }">
                {{ run.successRate.toFixed(1) }}%
              </td>
              <td :class="{ 'metric-danger': run.p95Latency >= 1000 }">
                {{ formatLatency(run.p95Latency) }}
              </td>
              <td>
                <router-link
                  :to="run.status === 'RUNNING'
                    ? `/runs/${run.id}/live`
                    : `/runs/${run.id}/result`"
                  class="result-button"
                >
                  {{ run.status === 'RUNNING' ? '모니터링' : '결과' }}
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="empty-state">
        <strong>검색 결과가 없습니다.</strong>
        <span>검색어, 상태 또는 조회 기간을 변경해 주세요.</span>
        <button type="button" @click="resetFilters">필터 초기화</button>
      </div>
    </article>
  </section>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

const statusMeta = {
  PASS: { label: '성공', tone: 'success' },
  WARNING: { label: '주의', tone: 'warning' },
  FAIL: { label: '실패', tone: 'danger' },
  CANCELLED: { label: '취소', tone: 'neutral' },
  STOPPED: { label: '취소', tone: 'neutral' },
  RUNNING: { label: '실행 중', tone: 'running' }
};

export default {
  name: 'RunHistoryView',
  data() {
    return {
      searchInput: '',
      statusInput: 'ALL',
      periodInput: 'ALL',
      appliedSearch: '',
      appliedStatus: 'ALL',
      appliedPeriod: 'ALL'
    };
  },
  computed: {
    ...mapGetters('run', ['runHistory']),
    normalizedRuns() {
      return (this.runHistory || []).map((run) => {
        const status = String(run.status || 'CANCELLED').toUpperCase();
        const meta = statusMeta[status] || statusMeta.CANCELLED;

        return {
          ...run,
          status,
          statusLabel: meta.label,
          statusTone: meta.tone,
          planName: run.planName || run.name || '이름 없는 테스트',
          startTime: run.startTime || run.endTime || '-',
          duration: run.duration || '-',
          totalRequests: Number(run.totalRequests ?? run.requestCount ?? 0),
          successRate: Number(run.successRate ?? 0),
          p95Latency: Number(run.p95Latency ?? run.p95 ?? 0)
        };
      });
    },
    filteredRuns() {
      const keyword = this.appliedSearch.toLowerCase();

      return this.normalizedRuns.filter((run) => {
        const matchesKeyword =
          !keyword ||
          String(run.id).toLowerCase().includes(keyword) ||
          run.planName.toLowerCase().includes(keyword);
        const matchesStatus =
          this.appliedStatus === 'ALL' ||
          run.status === this.appliedStatus ||
          (this.appliedStatus === 'CANCELLED' && run.status === 'STOPPED');
        const matchesPeriod = this.isWithinPeriod(run.startTime);

        return matchesKeyword && matchesStatus && matchesPeriod;
      });
    }
  },
  mounted() {
    this.fetchRunHistory();
  },
  methods: {
    ...mapActions('run', ['fetchRunHistory']),
    applyFilters() {
      this.appliedSearch = this.searchInput;
      this.appliedStatus = this.statusInput;
      this.appliedPeriod = this.periodInput;
    },
    resetFilters() {
      this.searchInput = '';
      this.statusInput = 'ALL';
      this.periodInput = 'ALL';
      this.applyFilters();
    },
    isWithinPeriod(value) {
      if (this.appliedPeriod === 'ALL' || !value || value === '-') return true;

      const runDate = new Date(String(value).replace(' ', 'T'));
      if (Number.isNaN(runDate.getTime())) return true;

      const cutoff = new Date();
      cutoff.setHours(0, 0, 0, 0);
      cutoff.setDate(cutoff.getDate() - Number(this.appliedPeriod));

      return runDate >= cutoff;
    },
    formatLatency(value) {
      if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}s`;
      }
      return `${value}ms`;
    }
  }
};
</script>

<style scoped>
.run-history-page {
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
.search-button,
.result-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: color 160ms ease, background-color 160ms ease,
    border-color 160ms ease;
}

.primary-button {
  width: 161px;
  height: 14px;
  color: #ffffff;
  font-size: 7px;
  background: #2f6bea;
  border: 0;
}

.primary-button:hover,
.search-button:hover {
  background: #1d4ed8;
}

.filter-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 88px 88px 126px;
  align-items: center;
  gap: 6px;
  min-height: 49px;
  margin-bottom: 9px;
  padding: 10px;
  background: #ffffff;
  border: 1px solid #dfe5ec;
  border-radius: 9px;
}

.search-field,
.select-field {
  display: block;
}

.search-field input,
.select-field select {
  width: 100%;
  height: 27px;
  padding: 0 10px;
  color: #445065;
  font-size: 7px;
  background: #ffffff;
  border: 1px solid #d5dce6;
  border-radius: 5px;
  outline: none;
}

.search-field input::placeholder {
  color: #7f8b9d;
  opacity: 1;
}

.search-field input:focus,
.select-field select:focus {
  border-color: #2f6bea;
  box-shadow: 0 0 0 2px rgba(47, 107, 234, 0.12);
}

.select-field select {
  cursor: pointer;
}

.search-button {
  height: 14px;
  color: #ffffff;
  font-size: 6px;
  background: #2f6bea;
  border: 0;
}

.history-panel {
  min-height: 220px;
  padding: 10px;
  background: #ffffff;
  border: 1px solid #dfe5ec;
  border-radius: 9px;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 720px;
  border-spacing: 0;
  border-collapse: collapse;
  table-layout: fixed;
}

th {
  height: 23px;
  padding: 5px 7px;
  color: #7c889a;
  font-size: 6px;
  font-weight: 700;
  text-align: left;
  background: #f5f8fc;
  border-bottom: 1px solid #e5eaf0;
}

td {
  height: 41px;
  padding: 7px;
  color: #4f5b6e;
  font-size: 6px;
  font-weight: 500;
  vertical-align: middle;
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
  width: 13%;
}

th:nth-child(2),
td:nth-child(2) {
  width: 14%;
}

th:nth-child(3),
td:nth-child(3) {
  width: 8%;
}

th:nth-child(4),
td:nth-child(4) {
  width: 15%;
}

th:nth-child(5),
td:nth-child(5) {
  width: 9%;
}

th:nth-child(6),
td:nth-child(6) {
  width: 9%;
}

th:nth-child(7),
td:nth-child(7),
th:nth-child(8),
td:nth-child(8) {
  width: 8%;
}

th:last-child,
td:last-child {
  width: 16%;
}

.run-id {
  color: #69768a;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
}

.plan-name {
  color: #253145;
  font-weight: 800;
}

.date-cell {
  white-space: nowrap;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 25px;
  min-height: 13px;
  padding: 2px 5px;
  font-size: 5px;
  font-weight: 800;
  border-radius: 999px;
  white-space: nowrap;
}

.status-badge--success {
  color: #159253;
  background: #e8f8ef;
}

.status-badge--warning {
  color: #c7770a;
  background: #fff6df;
}

.status-badge--danger {
  color: #db4035;
  background: #ffedeb;
}

.status-badge--neutral {
  color: #718096;
  background: #edf1f5;
}

.status-badge--running {
  color: #2563eb;
  background: #edf3ff;
}

.metric-danger {
  color: #d9362b;
  font-weight: 800;
}

.result-button {
  width: 90px;
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

.empty-state {
  display: flex;
  min-height: 198px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 5px;
  color: #8490a2;
}

.empty-state strong {
  color: #344054;
  font-size: 10px;
}

.empty-state span {
  font-size: 7px;
}

.empty-state button {
  margin-top: 4px;
  padding: 5px 12px;
  color: #2f6bea;
  font-size: 7px;
  font-weight: 700;
  background: #ffffff;
  border: 1px solid #b9c8e5;
  border-radius: 5px;
  cursor: pointer;
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
  .run-history-page {
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

  .filter-panel {
    grid-template-columns: minmax(0, 1fr) 135px 135px 160px;
    gap: 10px;
    min-height: 74px;
    margin-bottom: 14px;
    padding: 15px;
    border-radius: 12px;
  }

  .search-field input,
  .select-field select {
    height: 38px;
    padding: 0 13px;
    font-size: 11px;
  }

  .search-button {
    height: 30px;
    font-size: 10px;
  }

  .history-panel {
    min-height: 330px;
    padding: 15px;
    border-radius: 12px;
  }

  th {
    height: 34px;
    padding: 8px 10px;
    font-size: 9px;
  }

  td {
    height: 58px;
    padding: 10px;
    font-size: 9px;
  }

  .status-badge {
    min-width: 38px;
    min-height: 20px;
    padding: 3px 7px;
    font-size: 8px;
  }

  .result-button {
    width: 120px;
    height: 24px;
    font-size: 8px;
  }
}

@media (max-width: 760px) {
  .run-history-page {
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

  .filter-panel {
    grid-template-columns: minmax(0, 1fr) 110px;
    margin-top: 14px;
    padding: 12px;
  }

  .search-field input,
  .select-field select {
    height: 34px;
    font-size: 10px;
  }

  .search-button {
    height: 32px;
    font-size: 10px;
  }

  .history-panel {
    padding: 10px;
  }

  th,
  td {
    font-size: 8px;
  }
}

@media (max-width: 460px) {
  .filter-panel {
    grid-template-columns: 1fr;
  }
}
</style>
