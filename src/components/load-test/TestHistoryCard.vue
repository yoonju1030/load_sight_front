<template>
  <v-card class="dashboard-card history-card" elevation="6">
    <v-card-title class="dashboard-header">
      <v-icon left color="primary">mdi-history</v-icon>
      <span class="text-h6 font-weight-bold">최근 테스트 결과</span>
      <v-spacer></v-spacer>
      <v-btn
        icon
        size="small"
        variant="text"
        @click="clearHistory"
        :disabled="testHistory.length === 0"
      >
        <v-icon>mdi-delete-sweep</v-icon>
      </v-btn>
    </v-card-title>
    <v-divider></v-divider>
    <v-card-text class="pa-0">
      <div v-if="testHistory.length === 0" class="empty-history">
        <v-icon size="48" color="grey-lighten-1">mdi-information-outline</v-icon>
        <div class="text-body-1 mt-2 grey--text">테스트 결과가 없습니다</div>
      </div>
      <v-list v-else class="history-list">
        <v-list-item
          v-for="(test, index) in testHistory"
          :key="test.id"
          class="history-item"
          :class="{ active: index === 0 }"
        >
          <template v-slot:prepend>
            <v-avatar :color="getStatusColor(test.statistics?.successRate ?? 0)" size="40">
              <v-icon color="white">{{ getStatusIcon(test.statistics?.successRate ?? 0) }}</v-icon>
            </v-avatar>
          </template>
          <v-list-item-title class="history-title">
            {{ test.name }}
          </v-list-item-title>
          <v-list-item-subtitle class="history-subtitle">
            <div class="d-flex align-center mt-1">
              <v-chip size="x-small" :color="getStatusColor(test.statistics?.successRate ?? 0)" variant="flat" class="mr-2">
                {{ (test.statistics?.successRate ?? 0).toFixed(1) }}% 성공
              </v-chip>
              <span class="text-caption mr-2">p95: {{ test.statistics?.p95Latency ?? '-' }}ms</span>
              <span class="text-caption">{{ formatDate(test.timestamp) }}</span>
            </div>
          </v-list-item-subtitle>
          <template v-slot:append>
            <v-btn icon size="small" variant="text" @click="viewTestDetails(test)">
              <v-icon>mdi-chevron-right</v-icon>
            </v-btn>
          </template>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script>
import { defineComponent, inject } from 'vue'

export default defineComponent({
  name: 'TestHistoryCard',
  setup() {
    const loadTest = inject('loadTest')
    return {
      testHistory: loadTest.testHistory,
      clearHistory: loadTest.clearHistory,
      viewTestDetails: loadTest.viewTestDetails,
      formatUrl: loadTest.formatUrl,
      formatDate: loadTest.formatDate,
      getStatusColor: loadTest.getStatusColor,
      getStatusIcon: loadTest.getStatusIcon
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
.history-card {
  border-left: 4px solid #764ba2;
}
.empty-history {
  padding: 40px;
  text-align: center;
}
.history-list {
  max-height: 320px; /* 4개 항목 높이만 보이도록 */
  overflow-y: auto;
}
.history-item {
  border-bottom: 1px solid #e0e0e0;
  transition: background-color 0.2s ease;
  padding: 12px 16px !important;
}
.history-item:hover {
  background-color: #f5f5f5;
}
.history-item.active {
  background-color: #e3f2fd;
  border-left: 4px solid #2196f3;
}
.history-title {
  font-weight: 600;
  font-size: 14px;
}
.history-subtitle {
  margin-top: 4px;
}
</style>
