<template>
  <section class="test-plan-page">
    <header class="page-header">
      <div>
        <h1>테스트 플랜</h1>
        <p>반복 실행할 API 테스트 설정을 관리합니다.</p>
      </div>

      <router-link to="/test-plans/new" class="primary-button">
        <span aria-hidden="true">+</span>
        새 테스트
      </router-link>
    </header>

    <form class="filter-panel" @submit.prevent="applyFilters">
      <label class="search-field">
        <span class="sr-only">테스트명 또는 URL 검색</span>
        <input
          v-model.trim="searchInput"
          type="search"
          placeholder="테스트명 또는 URL 검색"
        >
      </label>

      <label class="method-field">
        <span class="sr-only">Method 필터</span>
        <select v-model="methodInput">
          <option value="ALL">Method 전체</option>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>
      </label>

      <button type="submit" class="search-button">검색</button>
    </form>

    <article class="list-panel">
      <div v-if="filteredPlans.length" class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>이름</th>
              <th>Method</th>
              <th>대상 URL</th>
              <th>부하 조건</th>
              <th>최근 실행</th>
              <th>수정일</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="plan in filteredPlans" :key="plan.id">
              <td class="plan-name">{{ plan.name }}</td>
              <td>
                <span class="method-badge" :class="`method-badge--${plan.method.toLowerCase()}`">
                  {{ plan.method }}
                </span>
              </td>
              <td class="url-cell">{{ plan.url }}</td>
              <td class="load-cell">
                {{ plan.rps }} RPS · {{ plan.duration }}초 · 동시성 {{ plan.concurrency }}
              </td>
              <td>
                <span class="status-badge" :class="`status-badge--${plan.statusTone}`">
                  {{ plan.lastRunStatus }}
                </span>
              </td>
              <td class="date-cell">{{ plan.updatedAt }}</td>
              <td>
                <div class="row-actions">
                  <button type="button" class="run-button" @click="runPlan(plan)">
                    실행
                  </button>
                  <router-link :to="`/test-plans/${plan.id}/edit`" class="edit-button">
                    수정
                  </router-link>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="empty-state">
        <strong>검색 결과가 없습니다.</strong>
        <span>검색어나 Method 조건을 변경해 주세요.</span>
        <button type="button" @click="resetFilters">필터 초기화</button>
      </div>
    </article>
  </section>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'TestPlanListView',
  data() {
    return {
      searchInput: '',
      methodInput: 'ALL',
      appliedSearch: '',
      appliedMethod: 'ALL'
    };
  },
  computed: {
    ...mapGetters('testPlan', ['plans']),
    normalizedPlans() {
      return (this.plans || []).map((plan) => ({
        ...plan,
        rps: plan.rps ?? plan.loadConfig?.targetRps ?? 0,
        duration:
          plan.duration ??
          plan.loadConfig?.durationSeconds ??
          (plan.loadConfig?.durationMinutes || 0) * 60,
        concurrency: plan.concurrency ?? plan.loadConfig?.vusers ?? 0,
        lastRunStatus: plan.lastRunStatus || '이력 없음',
        statusTone: plan.statusTone || 'neutral'
      }));
    },
    filteredPlans() {
      const keyword = this.appliedSearch.toLowerCase();

      return this.normalizedPlans.filter((plan) => {
        const matchesMethod =
          this.appliedMethod === 'ALL' || plan.method === this.appliedMethod;
        const matchesKeyword =
          !keyword ||
          plan.name.toLowerCase().includes(keyword) ||
          plan.url.toLowerCase().includes(keyword);

        return matchesMethod && matchesKeyword;
      });
    }
  },
  mounted() {
    this.fetchPlans();
  },
  methods: {
    ...mapActions('testPlan', ['fetchPlans']),
    applyFilters() {
      this.appliedSearch = this.searchInput;
      this.appliedMethod = this.methodInput;
    },
    resetFilters() {
      this.searchInput = '';
      this.methodInput = 'ALL';
      this.applyFilters();
    },
    runPlan(plan) {
      this.$router.push({
        name: 'RunLive',
        params: { runId: `plan-${plan.id}` }
      });
    }
  }
};
</script>

<style scoped>
.test-plan-page {
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
.run-button,
.edit-button {
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
  gap: 4px;
  width: 161px;
  height: 14px;
  color: #ffffff;
  font-size: 7px;
  background: #2f6bea;
  border: 0;
}

.primary-button:hover,
.search-button:hover,
.run-button:hover {
  background: #1d4ed8;
}

.primary-button span {
  font-size: 9px;
  line-height: 1;
}

.filter-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 96px 161px;
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
.method-field {
  display: block;
}

.search-field input,
.method-field select {
  width: 100%;
  height: 27px;
  padding: 0 10px;
  color: #445065;
  font-size: 7px;
  background: #ffffff;
  border: 1px solid #d5dce6;
  border-radius: 5px;
  outline: none;
  transition: border-color 160ms ease, box-shadow 160ms ease;
}

.search-field input::placeholder {
  color: #7f8b9d;
  opacity: 1;
}

.search-field input:focus,
.method-field select:focus {
  border-color: #2f6bea;
  box-shadow: 0 0 0 2px rgba(47, 107, 234, 0.12);
}

.method-field select {
  appearance: auto;
  cursor: pointer;
}

.search-button {
  height: 14px;
  color: #ffffff;
  font-size: 6px;
  background: #2f6bea;
  border: 0;
}

.list-panel {
  min-height: 179px;
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
  min-width: 630px;
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
  height: 44px;
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
  width: 9%;
}

th:nth-child(2),
td:nth-child(2) {
  width: 7%;
}

th:nth-child(3),
td:nth-child(3) {
  width: 16%;
}

th:nth-child(4),
td:nth-child(4) {
  width: 15%;
}

th:nth-child(5),
td:nth-child(5) {
  width: 8%;
}

th:nth-child(6),
td:nth-child(6) {
  width: 9%;
}

th:last-child,
td:last-child {
  width: 36%;
}

.plan-name {
  color: #253145;
  font-weight: 800;
  line-height: 1.35;
}

.url-cell {
  color: #263244;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  line-height: 1.45;
  overflow-wrap: anywhere;
}

.load-cell {
  line-height: 1.45;
}

.date-cell {
  white-space: nowrap;
}

.method-badge,
.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 13px;
  padding: 2px 5px;
  font-size: 5px;
  font-weight: 800;
  border-radius: 999px;
  white-space: nowrap;
}

.method-badge--get {
  color: #2563eb;
  background: #edf3ff;
}

.method-badge--post {
  color: #e45d18;
  background: #fff3e8;
}

.method-badge--put {
  color: #8b5cf6;
  background: #f3efff;
}

.method-badge--delete {
  color: #dc2626;
  background: #ffeded;
}

.status-badge--success {
  color: #159253;
  background: #e8f8ef;
}

.status-badge--danger {
  color: #db4035;
  background: #ffedeb;
}

.status-badge--neutral {
  max-width: 35px;
  color: #718096;
  text-align: center;
  white-space: normal;
  background: #edf1f5;
}

.row-actions {
  display: flex;
  width: 132px;
  max-width: 100%;
  flex-direction: column;
}

.run-button,
.edit-button {
  width: 100%;
  height: 14px;
  font-size: 5px;
}

.run-button {
  color: #ffffff;
  background: #2f6bea;
  border: 1px solid #2f6bea;
}

.edit-button {
  color: #465267;
  background: #ffffff;
  border: 1px solid #d1d9e4;
}

.edit-button:hover {
  color: #2f6bea;
  border-color: #2f6bea;
}

.empty-state {
  display: flex;
  min-height: 157px;
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
  .test-plan-page {
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
    grid-template-columns: minmax(0, 1fr) 150px 190px;
    gap: 10px;
    min-height: 74px;
    margin-bottom: 14px;
    padding: 15px;
    border-radius: 12px;
  }

  .search-field input,
  .method-field select {
    height: 38px;
    padding: 0 13px;
    font-size: 11px;
  }

  .search-button {
    height: 30px;
    font-size: 10px;
  }

  .list-panel {
    min-height: 274px;
    padding: 15px;
    border-radius: 12px;
  }

  th {
    height: 34px;
    padding: 8px 10px;
    font-size: 9px;
  }

  td {
    height: 66px;
    padding: 10px;
    font-size: 9px;
  }

  .method-badge,
  .status-badge {
    min-height: 20px;
    padding: 3px 7px;
    font-size: 8px;
  }

  .status-badge--neutral {
    max-width: 52px;
  }

  .row-actions {
    width: 160px;
  }

  .run-button,
  .edit-button {
    height: 24px;
    font-size: 8px;
  }
}

@media (max-width: 760px) {
  .test-plan-page {
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
    grid-template-columns: minmax(0, 1fr) 115px;
    margin-top: 14px;
    padding: 12px;
  }

  .search-field input,
  .method-field select {
    height: 34px;
    font-size: 10px;
  }

  .search-button {
    grid-column: 1 / -1;
    height: 32px;
    font-size: 10px;
  }

  .list-panel {
    padding: 10px;
  }

  th,
  td {
    font-size: 8px;
  }
}
</style>
