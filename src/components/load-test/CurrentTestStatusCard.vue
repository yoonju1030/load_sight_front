<template>
  <v-card class="dashboard-card current-test-card" elevation="6">
    <v-card-title class="dashboard-header">
      <v-icon left color="primary">mdi-play-circle</v-icon>
      <span class="text-h6 font-weight-bold">현재 테스트 상태</span>
      <v-spacer></v-spacer>
      <v-chip :color="isRunning ? 'success' : 'grey'" size="small" variant="flat">
        <v-icon left size="16">{{ isRunning ? 'mdi-pulse' : 'mdi-pause-circle' }}</v-icon>
        {{ isRunning ? '실행 중' : '대기 중' }}
      </v-chip>
    </v-card-title>
    <v-divider></v-divider>
    <v-card-text v-if="isRunning" class="pa-4">
      <div class="current-test-info">
        <div v-if="config.testName" class="info-row">
          <v-icon color="primary" size="20">mdi-format-title</v-icon>
          <span class="info-label">테스트 이름:</span>
          <span class="info-value">{{ config.testName }}</span>
        </div>
        <div class="info-row">
          <v-icon color="primary" size="20">mdi-web</v-icon>
          <span class="info-label">Method:</span>
          <span class="info-value">{{ config.method }}</span>
        </div>
        <div class="info-row">
          <v-icon color="primary" size="20">mdi-link-variant</v-icon>
          <span class="info-label">URL:</span>
          <span class="info-value url-text">{{ config.url || '미설정' }}</span>
        </div>
        <div class="info-row">
          <v-icon color="primary" size="20">mdi-account-multiple</v-icon>
          <span class="info-label">동시 요청:</span>
          <span class="info-value">{{ config.concurrentRequests }}개</span>
        </div>
        <div class="info-row">
          <v-icon color="primary" size="20">mdi-counter</v-icon>
          <span class="info-label">진행 상황:</span>
          <span class="info-value">{{ stats.success + stats.failed }} / {{ config.totalRequests }}개</span>
        </div>
        <v-progress-linear
          :model-value="parseFloat(progress)"
          color="primary"
          height="8"
          rounded
          class="mt-3"
        ></v-progress-linear>
      </div>
    </v-card-text>
    <v-card-text v-else class="pa-4 text-center">
      <v-icon size="64" color="grey-lighten-1">mdi-pause-circle-outline</v-icon>
      <div class="text-h6 mt-4 grey--text">테스트가 실행되지 않고 있습니다</div>
      <div class="text-caption mt-2 grey--text">테스트를 시작하면 여기에 현재 상태가 표시됩니다</div>
    </v-card-text>
  </v-card>
</template>

<script>
import { defineComponent, inject } from 'vue'

export default defineComponent({
  name: 'CurrentTestStatusCard',
  setup() {
    const loadTest = inject('loadTest')
    return {
      isRunning: loadTest.isRunning,
      config: loadTest.config,
      stats: loadTest.stats,
      progress: loadTest.progress
    }
  }
})
</script>

<style scoped>
.dashboard-card {
  border-radius: 12px;
  overflow: hidden;
  transition: box-shadow 0.3s ease;
  height: 100%;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
}
.dashboard-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}
.dashboard-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 20px;
}
.current-test-card {
  border-left: 4px solid #667eea;
}
.current-test-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.info-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
}
.info-label {
  font-weight: 600;
  color: #666;
  min-width: 85px;
  font-size: 0.9em;
}
.info-value {
  color: #333;
  font-weight: 500;
  font-size: 0.95em;
}
.url-text {
  word-break: break-all;
  font-size: 0.85em;
  color: #667eea;
}
</style>
