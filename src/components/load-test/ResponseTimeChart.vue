<template>
  <v-row v-if="hasResults">
    <v-col cols="12">
      <v-card class="chart-card" elevation="6">
        <v-card-title class="chart-header">
          <v-icon left color="primary" size="24">mdi-chart-line</v-icon>
          <span class="text-h6 font-weight-bold">응답 시간 분포</span>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pa-4">
          <div class="chart-container">
            <canvas :ref="el => setChartCanvasRef && setChartCanvasRef(el)"></canvas>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import { defineComponent, inject } from 'vue'

export default defineComponent({
  name: 'ResponseTimeChart',
  setup() {
    const loadTest = inject('loadTest')
    const setChartCanvasRef = inject('setChartCanvasRef', null)
    return {
      hasResults: loadTest.hasResults,
      setChartCanvasRef
    }
  }
})
</script>

<style scoped>
.chart-card {
  border-radius: 12px;
  overflow: hidden;
  margin-top: 24px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
  transition: box-shadow 0.3s ease;
}
.chart-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}
.chart-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 20px;
}
.chart-container {
  width: 100%;
  height: 350px;
  position: relative;
  background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
  border-radius: 8px;
  padding: 16px;
}
.chart-container canvas {
  width: 100%;
  height: 100%;
  border-radius: 8px;
}
</style>
