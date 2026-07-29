<template>
  <v-row v-if="isRunning || hasResults">
    <v-col cols="12">
      <v-card class="log-card" elevation="6">
        <v-card-title class="log-header">
          <v-icon left color="primary" size="24">mdi-console</v-icon>
          <span class="text-h6 font-weight-bold">실시간 로그</span>
          <v-spacer></v-spacer>
          <v-chip color="primary" size="small" variant="flat">
            <v-icon left size="16">mdi-counter</v-icon>
            {{ logs.length }} 개
          </v-chip>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pa-0">
          <div class="log-container" ref="logContainerRef">
            <div
              v-for="(log, index) in displayLogs"
              :key="index"
              :class="['log-entry', log.type]"
            >
              <span class="log-time">{{ log.time }}</span>
              <span class="log-badge" :class="log.type"></span>
              <span class="log-message">{{ log.message }}</span>
              <span v-if="log.responseTime" class="log-time-info">({{ log.responseTime }}ms)</span>
            </div>
            <div v-if="displayLogs.length === 0" class="log-empty">로그가 없습니다</div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import { defineComponent, inject, ref, onMounted, nextTick } from 'vue'

export default defineComponent({
  name: 'LogPanel',
  setup() {
    const loadTest = inject('loadTest')
    const logContainerRef = ref(null)
    const setLogContainerRef = inject('setLogContainerRef', null)
    onMounted(() => {
      nextTick(() => {
        if (setLogContainerRef && logContainerRef.value) {
          setLogContainerRef(logContainerRef.value)
        }
      })
    })
    return {
      logContainerRef,
      isRunning: loadTest.isRunning,
      hasResults: loadTest.hasResults,
      logs: loadTest.logs,
      displayLogs: loadTest.displayLogs
    }
  }
})
</script>

<style scoped>
.log-card {
  border-radius: 12px;
  overflow: hidden;
  margin-top: 24px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
  transition: box-shadow 0.3s ease;
}
.log-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}
.log-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 20px;
}
.log-container {
  height: 450px;
  overflow-y: auto;
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 16px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
}
.log-container::-webkit-scrollbar {
  width: 8px;
}
.log-container::-webkit-scrollbar-track {
  background: #1e1e1e;
}
.log-container::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 4px;
}
.log-entry {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  padding: 6px 0;
  transition: background-color 0.2s ease;
}
.log-entry:hover {
  background-color: rgba(255, 255, 255, 0.05);
}
.log-entry.success {
  color: #4caf50;
  border-left: 3px solid #4caf50;
}
.log-entry.error {
  color: #f44336;
  border-left: 3px solid #f44336;
}
.log-entry.warning {
  color: #ff9800;
  border-left: 3px solid #ff9800;
}
.log-entry.info {
  color: #2196f3;
  border-left: 3px solid #2196f3;
}
.log-badge {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 12px;
  flex-shrink: 0;
}
.log-badge.success { background-color: #4caf50; }
.log-badge.error { background-color: #f44336; }
.log-badge.warning { background-color: #ff9800; }
.log-badge.info { background-color: #2196f3; }
.log-time {
  color: #858585;
  margin-right: 12px;
  min-width: 140px;
  font-size: 12px;
}
.log-message {
  flex: 1;
  word-break: break-word;
}
.log-time-info {
  color: #858585;
  margin-left: 12px;
  font-size: 12px;
  white-space: nowrap;
}
.log-empty {
  text-align: center;
  color: #666;
  padding: 40px;
  font-style: italic;
}
@media (max-width: 960px) {
  .log-time {
    min-width: 100px;
    font-size: 11px;
  }
}
</style>
