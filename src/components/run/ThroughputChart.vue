<template>
  <v-card class="pa-4 rounded-lg elevation-1 border mb-6">
    <div class="d-flex align-center justify-space-between mb-4">
      <div class="d-flex align-center ga-2">
        <v-icon color="primary">mdi-chart-bar</v-icon>
        <span class="text-subtitle-1 font-weight-bold">{{ title }}</span>
      </div>
      <v-chip size="x-small" color="primary" variant="tonal">평균 1,204 RPS</v-chip>
    </div>

    <!-- 차트 Canvas -->
    <div class="chart-container" style="position: relative; height: 220px; width: 100%;">
      <canvas ref="throughputCanvas" style="width: 100%; height: 100%; display: block;"></canvas>
    </div>
  </v-card>
</template>

<script>
export default {
  name: 'ThroughputChart',
  props: {
    title: { type: String, default: '응답시간 분포 (ms)' }
  },
  mounted() {
    this.drawChart();
    window.addEventListener('resize', this.drawChart);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.drawChart);
  },
  methods: {
    drawChart() {
      const canvas = this.$refs.throughputCanvas;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio || 500;
      canvas.height = rect.height * window.devicePixelRatio || 220;
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      // 히스토그램 데이터
      const bins = ['200ms', '400ms', '600ms', '800ms', '1000ms', '1200ms+'];
      const values = [15, 65, 88, 35, 12, 5];

      const paddingLeft = 35;
      const paddingBottom = 30;
      const paddingTop = 20;
      const paddingRight = 20;

      const chartW = width - paddingLeft - paddingRight;
      const chartH = height - paddingTop - paddingBottom;

      const maxVal = 100;
      const barWidth = chartW / bins.length - 12;

      // Y축 선
      ctx.strokeStyle = '#eee';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const yPos = paddingTop + chartH - (chartH / 4) * i;
        ctx.beginPath();
        ctx.moveTo(paddingLeft, yPos);
        ctx.lineTo(width - paddingRight, yPos);
        ctx.stroke();
      }

      // 막대 그리기
      bins.forEach((b, idx) => {
        const val = values[idx];
        const barH = (val / maxVal) * chartH;
        const x = paddingLeft + idx * (barWidth + 12) + 6;
        const y = paddingTop + chartH - barH;

        // Gradient
        const grad = ctx.createLinearGradient(0, y, 0, paddingTop + chartH);
        grad.addColorStop(0, '#2196f3');
        grad.addColorStop(1, '#90caf9');

        ctx.fillStyle = grad;
        ctx.fillRect(x, y, barWidth, barH);

        // 값 표시
        ctx.fillStyle = '#424242';
        ctx.font = '11px sans-serif';
        ctx.fillText(`${val}%`, x + barWidth / 2 - 10, y - 5);

        // X축 라벨
        ctx.fillText(b, x + barWidth / 2 - 16, height - 8);
      });
    }
  }
};
</script>
