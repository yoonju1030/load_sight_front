<template>
  <div>
    <!-- 모드 1: 대시보드 KPI (5개 또는 4개 카드) -->
    <v-row v-if="mode === 'dashboard'" class="mb-4">
      <v-col cols="12" sm="6" md="2-4" lg="2-4" v-for="(kpi, idx) in dashboardKpis" :key="idx">
        <v-card class="pa-4 rounded-lg elevation-1 border h-100">
          <div class="text-caption text-medium-emphasis mb-1 font-weight-medium">{{ kpi.title }}</div>
          <div class="d-flex align-baseline ga-2">
            <span class="text-h4 font-weight-bold">{{ kpi.value }}</span>
            <span v-if="kpi.unit" class="text-subtitle-1 text-medium-emphasis">{{ kpi.unit }}</span>
          </div>
          <div v-if="kpi.change" class="text-caption mt-2 d-flex align-center" :class="kpi.isUp ? 'text-success' : 'text-error'">
            <v-icon size="16">{{ kpi.isUp ? 'mdi-triangle-small-up' : 'mdi-triangle-small-down' }}</v-icon>
            <span>{{ kpi.change }}</span>
            <span class="text-medium-emphasis ml-1">(어제 대비)</span>
          </div>
          <div v-else-if="kpi.status" class="mt-2">
            <v-chip color="success" size="x-small" density="compact" class="font-weight-bold">
              ● {{ kpi.status }}
            </v-chip>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- 모드 2: 실시간 모니터링 / 결과 지표 (5개 카드) -->
    <v-row v-else class="mb-4">
      <v-col cols="12" sm="6" md="2-4" v-for="(card, idx) in runCards" :key="idx">
        <v-card class="pa-4 rounded-lg elevation-1 border h-100">
          <div class="d-flex justify-space-between align-center mb-1">
            <span class="text-caption text-medium-emphasis font-weight-medium">{{ card.title }}</span>
            <v-icon size="18" :color="card.color">{{ card.icon }}</v-icon>
          </div>
          <div class="d-flex align-baseline ga-1">
            <span class="text-h4 font-weight-bold" :class="`text-${card.color}`">{{ card.value }}</span>
            <span v-if="card.unit" class="text-caption text-medium-emphasis">{{ card.unit }}</span>
          </div>
          <div v-if="card.target" class="text-caption text-medium-emphasis mt-2">
            목표: <strong>{{ card.target }}</strong>
          </div>
          <div v-else-if="card.subText" class="text-caption text-medium-emphasis mt-2">
            {{ card.subText }}
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  name: 'MetricCards',
  props: {
    mode: { type: String, default: 'run' }, // 'dashboard' | 'run'
    metrics: { type: Object, default: () => ({}) },
    dashboardData: { type: Object, default: () => ({}) }
  },
  computed: {
    dashboardKpis() {
      const d = this.dashboardData || {};
      return [
        { title: '실행 중 테스트', value: d.runningCount ?? 2, unit: '', status: '진행 중' },
        { title: '오늘 실행횟수', value: d.todayCount ?? 8, unit: '', change: `${d.todayDiffPercent ?? 14}%`, isUp: true },
        { title: '평균 성공률', value: `${d.avgSuccessRate ?? 98.6}%`, unit: '', change: `${d.successRateDiffPercent ?? 1.2}%`, isUp: true },
        { title: '평균 응답시간 (p95)', value: d.avgP95Latency ?? 412, unit: 'ms', change: `${d.p95LatencyDiffMs ?? -18}ms`, isUp: false },
        { title: '요청 발생 수', value: d.requestCount ?? 23, unit: '', change: `${d.requestCountDiff ?? -7}`, isUp: false }
      ];
    },
    runCards() {
      const m = this.metrics || {};
      return [
        {
          title: 'RPS (초당 요청 수)',
          value: (m.rps ?? m.totalRequests ?? 1204).toLocaleString(),
          unit: 'req/s',
          target: m.targetRps ? `${m.targetRps.toLocaleString()} RPS` : null,
          color: 'primary',
          icon: 'mdi-flash-outline'
        },
        {
          title: '성공률',
          value: `${m.successRate ?? 98.72}%`,
          unit: '',
          target: m.targetThresholds?.successRate ? `≥ ${m.targetThresholds.successRate}%` : '≥ 95%',
          color: (m.successRate ?? 98.72) >= 95 ? 'success' : 'error',
          icon: 'mdi-check-circle-outline'
        },
        {
          title: 'p95 응답시간',
          value: `${m.p95Latency ?? 412}`,
          unit: 'ms',
          target: m.targetThresholds?.p95Latency ? `≤ ${m.targetThresholds.p95Latency} ms` : '≤ 600 ms',
          color: (m.p95Latency ?? 412) <= 600 ? 'primary' : 'warning',
          icon: 'mdi-timer-outline'
        },
        {
          title: '가상 사용자 (VUsers)',
          value: `${m.vusers ?? 200}`,
          unit: '명',
          target: m.targetVusers ? `목표 ${m.targetVusers}` : '목표 200',
          color: 'info',
          icon: 'mdi-account-group-outline'
        },
        {
          title: '에러율',
          value: `${m.errorRate ?? 1.28}%`,
          unit: '',
          subText: `에러 ${m.errorCount ?? 15} 건`,
          color: (m.errorRate ?? 1.28) > 2 ? 'error' : 'warning',
          icon: 'mdi-alert-circle-outline'
        }
      ];
    }
  }
};
</script>
