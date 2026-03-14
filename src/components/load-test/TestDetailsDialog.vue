<template>
  <v-dialog :model-value="showTestDialog" @update:model-value="closeDialog" max-width="800" scrollable>
    <v-card>
      <v-card-title class="dialog-header">
        <v-icon left color="primary">mdi-information</v-icon>
        <span class="text-h6 font-weight-bold">테스트 상세 정보</span>
        <v-spacer></v-spacer>
        <v-btn icon variant="text" @click="closeDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text v-if="selectedTest" class="pa-4">
        <v-row>
          <v-col cols="12">
            <div class="detail-section">
              <h3 class="detail-title">테스트 정보</h3>
              <div v-if="selectedTest.testName || selectedTest.testConfig?.testName" class="detail-item">
                <span class="detail-label">테스트 이름:</span>
                <span class="detail-value">{{ selectedTest.testName || selectedTest.testConfig.testName }}</span>
              </div>
              <div v-if="selectedTest.description || selectedTest.testConfig?.description" class="detail-item">
                <span class="detail-label">설명:</span>
                <span class="detail-value">{{ selectedTest.description || selectedTest.testConfig.description }}</span>
              </div>
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" md="6">
            <div class="detail-section">
              <h3 class="detail-title">테스트 설정</h3>
              <div class="detail-item">
                <span class="detail-label">Method:</span>
                <span class="detail-value">{{ selectedTest.specJson.method }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">URL:</span>
                <span class="detail-value">{{ selectedTest.targetUrl}}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">동시 요청:</span>
                <span class="detail-value">{{ selectedTest.specJson.threads }}개</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">총 요청:</span>
                <span class="detail-value">{{ selectedTest.specJson.totalRequest }}개</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">실행 시간:</span>
                <span class="detail-value">{{ formatDateTime(selectedTest.createdAt) }}</span>
              </div>
            </div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="detail-section" v-if="selectedTest.statistics">
              <h3 class="detail-title">결과 요약</h3>
              <div class="detail-item">
                <span class="detail-label">성공률:</span>
                <v-chip :color="getStatusColor(selectedTest.statistics?.successRate ?? 0)" size="small" variant="flat">
                  {{ (selectedTest.statistics?.successRate ?? 0).toFixed(2) }}%
                </v-chip>
              </div>
              <div class="detail-item">
                <span class="detail-label">에러율:</span>
                <span class="detail-value">{{ (selectedTest.statistics?.errorRate ?? 0).toFixed(2) }}%</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">평균 응답 시간:</span>
                <span class="detail-value">{{ selectedTest.statistics?.averageResponseTime ?? '-' }}ms</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">p50 Latency:</span>
                <span class="detail-value">{{ selectedTest.statistics?.p50Latency ?? '-' }}ms</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">p95 Latency:</span>
                <span class="detail-value">{{ selectedTest.statistics?.p95Latency ?? '-' }}ms</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">초당 요청 수:</span>
                <span class="detail-value">{{ selectedTest.statistics?.requestsPerSecond ?? '-' }}</span>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="closeDialog">닫기</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { defineComponent, inject } from 'vue'

export default defineComponent({
  name: 'TestDetailsDialog',
  setup() {
    const loadTest = inject('loadTest')
    const closeDialog = () => {
      loadTest.showTestDialog.value = false
    }
    return {
      showTestDialog: loadTest.showTestDialog,
      selectedTest: loadTest.selectedTest,
      formatDateTime: loadTest.formatDateTime,
      getStatusColor: loadTest.getStatusColor,
      closeDialog
    }
  }
})
</script>

<style scoped>
.dialog-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 20px;
}
.detail-section {
  margin-bottom: 24px;
}
.detail-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
  border-bottom: 2px solid #667eea;
  padding-bottom: 8px;
}
.detail-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 12px;
}
.detail-label {
  font-weight: 600;
  color: #666;
  min-width: 120px;
}
.detail-value {
  color: #333;
  font-weight: 500;
}
</style>
