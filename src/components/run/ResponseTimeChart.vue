<template>
  <v-card class="pa-4 rounded-lg elevation-1 border mb-6">
    <div class="d-flex align-center justify-space-between mb-4">
      <div class="d-flex align-center ga-2">
        <v-icon color="primary">mdi-chart-line</v-icon>
        <span class="text-subtitle-1 font-weight-bold">{{ title }}</span>
      </div>

      <!-- 차트 범례 -->
      <div class="d-flex align-center ga-4 text-caption">
        <div class="d-flex align-center ga-1">
          <span class="legend-dot" style="background-color: #4caf50;"></span>
          <span>p50 (중앙값)</span>
        </div>
        <div class="d-flex align-center ga-1">
          <span class="legend-dot" style="background-color: #2196f3;"></span>
          <span>p95 (95백분위)</span>
        </div>
        <div class="d-flex align-center ga-1">
          <span class="legend-dot" style="background-color: #9c27b0;"></span>
          <span>p99 (99백분위)</span>
        </div>
      </div>
    </div>

    <!-- 차트 Canvas -->
    <div class="chart-container" style="position: relative; height: 260px; width: 100%;">
      <canvas ref="chartCanvas" style="width: 100%; height: 100%; display: block;"></canvas>
    </div>
  </v-card>
</template>

<script>
export default {
  name: 'ResponseTimeChart',
  props: {
    title: { type: String, default: '응답시간 차트 (ms)' },
    dataPoints: { type: Array, default: null }
  },
  data() {
    return {
      resizeObserver: null
    };
  },
  mounted() {
    this.drawChart();
    window.addEventListener('resize', this.drawChart);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.drawChart);
  },
  watch: {
    dataPoints: {
      deep: true,
      handler() {
        this.drawChart();
      }
    }
  },
  methods: {
    drawChart() {
      const canvas = this.$refs.chartCanvas;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio || 600;
      canvas.height = rect.height * window.devicePixelRatio || 260;
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      // 데이터셋 구성
      const times = ['14:28', '14:29', '14:30', '14:31', '14:32', '14:33'];
      const p50 = [180, 190, 195, 200, 192, 198];
      const p95 = [380, 420, 410, 450, 412, 425];
      const p99 = [680, 750, 720, 810, 780, 790];

      const paddingLeft = 45;
      const paddingBottom = 30;
      const paddingTop = 20;
      const paddingRight = 20;

      const chartW = width - paddingLeft - paddingRight;
      const chartH = height - paddingTop - paddingBottom;

      const maxVal = 1000;

      // 격자선 및 Y축 눈금
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 1;
      ctx.fillStyle = '#757575';
      ctx.font = '11px sans-serif';

      const steps = 4;
      for (let i = 0; i <= steps; i++) {
        const yVal = Math.round((maxVal / steps) * i);
        const yPos = paddingTop + chartH - (chartH / steps) * i;

        ctx.beginPath();
        ctx.moveTo(paddingLeft, yPos);
        ctx.lineTo(width - paddingRight, yPos);
        ctx.stroke();

        ctx.fillText(`${yVal} ms`, 5, yPos + 4);
      }

      // X축 라벨
      const stepX = chartW / (times.length - 1);
      times.forEach((t, idx) => {
        const xPos = paddingLeft + idx * stepX;
        ctx.fillText(t, xPos - 12, height - 8);
      });

      // 라인 그리기 함수
      const drawLine = (data, color) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();

        data.forEach((val, idx) => {
          const x = paddingLeft + idx * stepX;
          const y = paddingTop + chartH - (val / maxVal) * chartH;
          if (idx === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // 포인트 점
        data.forEach((val, idx) => {
          const x = paddingLeft + idx * stepX;
          const y = paddingTop + chartH - (val / maxVal) * chartH;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(x, y, 3.5, 0, Math.PI * 2);
          ctx.fill();
        });
      };

      drawLine(p50, '#4caf50');
      drawLine(p95, '#2196f3');
      drawLine(p99, '#9c27b0');
    }
  }
};
</script>

<style scoped>
.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}
</style>
