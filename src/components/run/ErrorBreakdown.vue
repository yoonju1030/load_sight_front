<template>
  <v-row>
    <!-- 상태 코드 분포 도넛 차트 -->
    <v-col cols="12" md="5">
      <v-card class="pa-4 rounded-lg elevation-1 border h-100">
        <div class="text-subtitle-1 font-weight-bold mb-3 d-flex align-center ga-2">
          <v-icon color="primary">mdi-chart-pie</v-icon>
          <span>상태 코드 분포</span>
        </div>

        <div class="d-flex align-center justify-center py-2" style="position: relative; height: 180px;">
          <canvas ref="pieCanvas" style="width: 160px; height: 160px;"></canvas>
          <div class="donut-center text-center" style="position: absolute;">
            <div class="text-caption text-medium-emphasis">성공률</div>
            <div class="text-h6 font-weight-bold text-success">98.7%</div>
          </div>
        </div>

        <div class="d-flex justify-space-around text-caption pt-2 border-t">
          <div class="d-flex align-center ga-1">
            <span class="legend-box" style="background: #4caf50;"></span>
            <span>2xx (98.7%)</span>
          </div>
          <div class="d-flex align-center ga-1">
            <span class="legend-box" style="background: #ff9800;"></span>
            <span>4xx (0.8%)</span>
          </div>
          <div class="d-flex align-center ga-1">
            <span class="legend-box" style="background: #f44336;"></span>
            <span>5xx (0.5%)</span>
          </div>
        </div>
      </v-card>
    </v-col>

    <!-- 최근 오류 패널 (RunErrorPanel) -->
    <v-col cols="12" md="7">
      <v-card class="pa-4 rounded-lg elevation-1 border h-100">
        <div class="d-flex align-center justify-space-between mb-3">
          <div class="text-subtitle-1 font-weight-bold d-flex align-center ga-2">
            <v-icon color="error">mdi-alert-octagon-outline</v-icon>
            <span>최근 오류 (Top Error Logs)</span>
          </div>
          <v-btn variant="text" size="small" color="primary" class="font-weight-bold">
            전체 보기 →
          </v-btn>
        </div>

        <v-table density="compact" class="text-caption border rounded">
          <thead>
            <tr>
              <th class="text-left">시간</th>
              <th class="text-left">상태 코드</th>
              <th class="text-left">오류 메시지</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(err, idx) in errorLogs" :key="idx">
              <td class="text-medium-emphasis">{{ err.time }}</td>
              <td>
                <v-chip
                  :color="err.code >= 500 ? 'error' : 'warning'"
                  size="x-small"
                  variant="flat"
                  class="font-weight-bold"
                >
                  {{ err.code }}
                </v-chip>
              </td>
              <td class="font-weight-medium">{{ err.message }}</td>
            </tr>
          </tbody>
        </v-table>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'ErrorBreakdown',
  props: {
    statusCodes: { type: Object, default: () => ({ '2xx': 98.7, '4xx': 0.8, '5xx': 0.5 }) },
    errors: { type: Array, default: null }
  },
  data() {
    return {
      defaultLogs: [
        { time: '14:33:12', code: 500, message: 'Internal Server Error' },
        { time: '14:33:05', code: 503, message: 'Service Unavailable' },
        { time: '14:32:58', code: 500, message: 'Internal Server Error' },
        { time: '14:32:51', code: 404, message: 'Not Found' },
        { time: '14:32:45', code: 500, message: 'Internal Server Error' }
      ]
    };
  },
  computed: {
    errorLogs() {
      return this.errors || this.defaultLogs;
    }
  },
  mounted() {
    this.drawDonut();
  },
  methods: {
    drawDonut() {
      const canvas = this.$refs.pieCanvas;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      canvas.width = 160 * window.devicePixelRatio;
      canvas.height = 160 * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      const centerX = 80;
      const centerY = 80;
      const radius = 65;
      const innerRadius = 45;

      const slices = [
        { percent: 0.987, color: '#4caf50' },
        { percent: 0.008, color: '#ff9800' },
        { percent: 0.005, color: '#f44336' }
      ];

      let startAngle = -Math.PI / 2;

      slices.forEach(slice => {
        const sliceAngle = slice.percent * 2 * Math.PI;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = slice.color;
        ctx.fill();
        startAngle += sliceAngle;
      });
    }
  }
};
</script>

<style scoped>
.legend-box {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  display: inline-block;
}
.donut-center {
  pointer-events: none;
}
</style>
