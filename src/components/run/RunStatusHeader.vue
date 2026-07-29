<template>
  <v-card class="pa-4 rounded-lg elevation-1 border mb-6" :class="bgClass">
    <div class="d-flex flex-wrap align-center justify-space-between ga-4">
      <!-- 좌측: 제목 및 상태 칩 -->
      <div class="d-flex align-center ga-3">
        <v-btn
          v-if="showBack"
          icon="mdi-arrow-left"
          variant="text"
          density="comfortable"
          @click="$router.back()"
        />
        <div>
          <div class="d-flex align-center ga-2">
            <span class="text-h6 font-weight-bold">{{ title }}</span>
            <v-chip :color="statusColor" variant="elevated" size="small" class="font-weight-bold text-white">
              {{ status }}
            </v-chip>
          </div>
          <div class="text-caption text-medium-emphasis mt-1">
            <span v-if="elapsedTime">경과 시간: <strong>{{ elapsedTime }}</strong></span>
            <span v-if="executionTime"> | 완료 시간: {{ executionTime }}</span>
            <span v-if="duration"> (실행 시간 {{ duration }})</span>
          </div>
        </div>
      </div>

      <!-- 우측: 액션 버튼들 -->
      <div class="d-flex align-center ga-2">
        <v-btn
          v-if="status === 'RUNNING'"
          color="error"
          variant="outlined"
          prepend-icon="mdi-stop-circle"
          class="text-none font-weight-bold"
          @click="$emit('stop')"
        >
          중지
        </v-btn>

        <v-btn
          v-if="status !== 'RUNNING' && showRerun"
          color="primary"
          variant="tonal"
          prepend-icon="mdi-play-circle-outline"
          class="text-none font-weight-bold"
          @click="$emit('rerun')"
        >
          재실행
        </v-btn>

        <v-btn
          v-if="showCompare"
          color="secondary"
          variant="outlined"
          prepend-icon="mdi-file-compare"
          class="text-none font-weight-bold"
          @click="$emit('compare')"
        >
          비교하기
        </v-btn>

        <v-btn
          v-if="showDownload"
          color="success"
          variant="elevated"
          prepend-icon="mdi-download"
          class="text-none font-weight-bold text-white"
          @click="$emit('download')"
        >
          리포트 다운로드
        </v-btn>
      </div>
    </div>

    <!-- PASS/WARNING/FAIL 판정 서브 배너 (결과 화면용) -->
    <v-alert
      v-if="statusText"
      :type="statusAlertStyle"
      variant="tonal"
      class="mt-4 mb-0 rounded-md"
      density="comfortable"
    >
      <div class="d-flex align-center justify-space-between">
        <span class="font-weight-bold text-subtitle-1">{{ statusText }}</span>
        <span v-if="thresholdsInfo" class="text-caption">
          성공률 ≥ {{ thresholdsInfo.successRate }}% | p95 응답시간 ≤ {{ thresholdsInfo.p95Latency }}ms
        </span>
      </div>
    </v-alert>
  </v-card>
</template>

<script>
export default {
  name: 'RunStatusHeader',
  props: {
    title: { type: String, default: '부하 테스트' },
    status: { type: String, default: 'RUNNING' }, // RUNNING, PASS, WARNING, FAIL, STOPPED
    elapsedTime: { type: String, default: '' },
    executionTime: { type: String, default: '' },
    duration: { type: String, default: '' },
    statusText: { type: String, default: '' },
    thresholdsInfo: { type: Object, default: null },
    showBack: { type: Boolean, default: true },
    showRerun: { type: Boolean, default: true },
    showCompare: { type: Boolean, default: true },
    showDownload: { type: Boolean, default: true }
  },
  emits: ['stop', 'rerun', 'compare', 'download'],
  computed: {
    statusColor() {
      switch (this.status) {
        case 'RUNNING': return 'info';
        case 'PASS': return 'success';
        case 'WARNING': return 'warning';
        case 'FAIL': return 'error';
        case 'STOPPED': return 'grey';
        default: return 'primary';
      }
    },
    bgClass() {
      return this.status === 'PASS' ? 'border-success' : '';
    },
    statusAlertStyle() {
      switch (this.status) {
        case 'PASS': return 'success';
        case 'WARNING': return 'warning';
        case 'FAIL': return 'error';
        default: return 'info';
      }
    }
  }
};
</script>
