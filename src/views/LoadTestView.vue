<template>
  <v-container fluid class="load-test-container">
    <!-- 현재 테스트 상태 & 최근 테스트 결과 대시보드 -->
    <v-row class="mb-4">
      <v-col cols="12" md="6">
        <CurrentTestStatusCard />
      </v-col>
      <v-col cols="12" md="6">
        <TestHistoryCard />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <TestConfigForm />
      </v-col>
    </v-row>

    <StatsCardsRow
      :set-error-rate-chart-ref="(el) => { errorRateChartRef.value = el }"
      :set-p95-latency-chart-ref="(el) => { p95LatencyChartRef.value = el }"
    />

    <LogPanel />

    <ResponseTimeChart />

    <TestDetailsDialog />
  </v-container>
</template>

<script>
import { defineComponent, ref, provide, onMounted, onUnmounted } from 'vue'
import { useLoadTest } from '../composables/useLoadTest'
import CurrentTestStatusCard from '../components/load-test/CurrentTestStatusCard.vue'
import TestHistoryCard from '../components/load-test/TestHistoryCard.vue'
import TestConfigForm from '../components/load-test/TestConfigForm.vue'
import StatsCardsRow from '../components/load-test/StatsCardsRow.vue'
import LogPanel from '../components/load-test/LogPanel.vue'
import ResponseTimeChart from '../components/load-test/ResponseTimeChart.vue'
import TestDetailsDialog from '../components/load-test/TestDetailsDialog.vue'
import { getTests } from '../api/test'

export default defineComponent({
  name: 'LoadTestView',
  components: {
    CurrentTestStatusCard,
    TestHistoryCard,
    TestConfigForm,
    StatsCardsRow,
    LogPanel,
    ResponseTimeChart,
    TestDetailsDialog
  },
  setup() {
    const chartCanvasRef = ref(null)
    const logContainerRef = ref(null)
    const errorRateChartRef = ref(null)
    const p95LatencyChartRef = ref(null)

    const loadTest = useLoadTest({
      chartCanvasRef,
      logContainerRef,
      errorRateChartRef,
      p95LatencyChartRef
    })

    provide('loadTest', loadTest)
    provide('setChartCanvasRef', (el) => { chartCanvasRef.value = el })
    provide('setLogContainerRef', (el) => { logContainerRef.value = el })

    onMounted(() => {
      window.addEventListener('resize', () => {
        loadTest.drawChart()
        loadTest.setupRealtimeCharts()
      })
      loadTest.loadTestHistory()
      loadTest.setupRealtimeCharts()

      getTests()
        .then((result) => {
          loadTest.testHistory.value = result.data ?? result
        })
        .catch((err) => {
          console.error(err)
        })
    })

    onUnmounted(() => {
      window.removeEventListener('resize', loadTest.drawChart)
    })

    return {}
  }
})
</script>

<style scoped>
.load-test-container {
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
  min-height: 100vh;
  padding: 24px;
}
@media (max-width: 600px) {
  .load-test-container {
    padding: 12px;
  }
}
</style>
