<template>
  <v-row v-if="isRunning || hasResults" class="stats-row">
    <v-col cols="12" md="2">
      <v-card class="stat-card success-card" elevation="6" :class="{ 'pulse-animation': isRunning }">
        <v-card-text class="text-center pa-4">
          <v-icon size="48" class="mb-2">mdi-check-circle</v-icon>
          <div class="text-h6 mb-1">성공</div>
          <div class="text-h3 font-weight-bold mb-2">{{ stats.success }}</div>
          <v-chip color="success" size="small" variant="flat">성공률: {{ successRate }}%</v-chip>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" md="2">
      <v-card class="stat-card error-card" elevation="6" :class="{ 'pulse-animation': isRunning }">
        <v-card-text class="text-center pa-4">
          <v-icon size="48" class="mb-2">mdi-close-circle</v-icon>
          <div class="text-h6 mb-1">실패</div>
          <div class="text-h3 font-weight-bold mb-2">{{ stats.failed }}</div>
          <v-chip color="error" size="small" variant="flat">실패률: {{ failureRate }}%</v-chip>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" md="2">
      <v-card class="stat-card error-rate-card" elevation="6" :class="{ 'pulse-animation': isRunning }">
        <v-card-text class="text-center pa-4">
          <v-icon size="48" class="mb-2">mdi-alert-circle</v-icon>
          <div class="text-h6 mb-1">Error Rate</div>
          <div class="text-h3 font-weight-bold mb-2">{{ errorRate }}%</div>
          <div class="realtime-chart-container">
            <canvas :ref="el => setErrorRateChartRef(el)" class="realtime-chart"></canvas>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" md="2">
      <v-card class="stat-card info-card" elevation="6" :class="{ 'pulse-animation': isRunning }">
        <v-card-text class="text-center pa-4">
          <v-icon size="48" class="mb-2">mdi-clock-outline</v-icon>
          <div class="text-h6 mb-1">평균 응답 시간</div>
          <div class="text-h3 font-weight-bold mb-2">{{ averageResponseTime }}ms</div>
          <div class="d-flex justify-space-between mt-2">
            <v-chip color="info" size="x-small" variant="flat">최소: {{ stats.minTime === Infinity ? 0 : stats.minTime }}ms</v-chip>
            <v-chip color="info" size="x-small" variant="flat">최대: {{ stats.maxTime }}ms</v-chip>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" md="2">
      <v-card class="stat-card p95-card" elevation="6" :class="{ 'pulse-animation': isRunning }">
        <v-card-text class="text-center pa-4">
          <v-icon size="48" class="mb-2">mdi-chart-timeline-variant</v-icon>
          <div class="text-h6 mb-1">Latency (p95)</div>
          <div class="text-h3 font-weight-bold mb-2">{{ p95Latency }}ms</div>
          <div class="realtime-chart-container">
            <canvas :ref="el => setP95LatencyChartRef(el)" class="realtime-chart"></canvas>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" md="2">
      <v-card class="stat-card warning-card" elevation="6" :class="{ 'pulse-animation': isRunning }">
        <v-card-text class="text-center pa-4">
          <v-icon size="48" class="mb-2">mdi-speedometer-medium</v-icon>
          <div class="text-h6 mb-1">초당 요청 수</div>
          <div class="text-h3 font-weight-bold mb-2">{{ requestsPerSecond }}</div>
          <v-chip color="warning" size="small" variant="flat">진행률: {{ progress }}%</v-chip>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import { defineComponent, inject } from 'vue'

export default defineComponent({
  name: 'StatsCardsRow',
  props: {
    setErrorRateChartRef: { type: Function, required: true },
    setP95LatencyChartRef: { type: Function, required: true }
  },
  setup() {
    const loadTest = inject('loadTest')
    return {
      isRunning: loadTest.isRunning,
      hasResults: loadTest.hasResults,
      stats: loadTest.stats,
      successRate: loadTest.successRate,
      failureRate: loadTest.failureRate,
      errorRate: loadTest.errorRate,
      averageResponseTime: loadTest.averageResponseTime,
      p95Latency: loadTest.p95Latency,
      requestsPerSecond: loadTest.requestsPerSecond,
      progress: loadTest.progress
    }
  }
})
</script>

<style scoped>
.stats-row {
  margin-top: 24px;
}
.stat-card {
  border-radius: 12px;
  transition: box-shadow 0.3s ease;
  cursor: pointer;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.stat-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}
.success-card {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
}
.error-card {
  background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
  color: white;
}
.info-card {
  background: linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%);
  color: white;
}
.warning-card {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}
.error-rate-card {
  background: linear-gradient(135deg, #c94b4b 0%, #4b134f 100%);
  color: white;
}
.p95-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}
.realtime-chart-container {
  width: 100%;
  height: 80px;
  margin-top: 12px;
  position: relative;
}
.realtime-chart {
  width: 100%;
  height: 100%;
  display: block;
}
.pulse-animation {
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}
@media (max-width: 600px) {
  .stat-card {
    margin-bottom: 12px;
  }
}
</style>
