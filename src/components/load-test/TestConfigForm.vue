<template>
  <v-card class="main-card" elevation="8">
    <v-card-title class="card-header">
      <v-icon left size="32" color="primary">mdi-speedometer</v-icon>
      <span class="text-h5 font-weight-bold">API 부하 테스트</span>
    </v-card-title>
    <v-divider></v-divider>
    <v-card-text class="pa-6">
      <v-expansion-panels v-model="panels" multiple class="mb-4">
        <v-expansion-panel class="expansion-panel">
          <v-expansion-panel-title class="expansion-title">
            <v-icon left color="primary">mdi-information</v-icon>
            <span class="font-weight-medium">테스트 정보</span>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="config.testName"
                  label="테스트 이름"
                  placeholder="예: API 부하 테스트 - 사용자 조회"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-format-title"
                  hint="테스트를 식별하기 위한 이름을 입력하세요"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="config.description"
                  label="테스트 설명"
                  placeholder="이 테스트의 목적이나 설명을 입력하세요"
                  variant="outlined"
                  rows="3"
                  prepend-inner-icon="mdi-text"
                  hint="테스트에 대한 추가 정보나 목적을 기록하세요"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <v-expansion-panel class="expansion-panel">
          <v-expansion-panel-title class="expansion-title">
            <v-icon left color="primary">mdi-api</v-icon>
            <span class="font-weight-medium">API 설정</span>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-row>
              <v-col cols="12" md="3">
                <v-select
                  v-model="config.method"
                  :items="httpMethods"
                  label="HTTP Method"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-web"
                ></v-select>
              </v-col>
              <v-col cols="12" md="9">
                <v-text-field
                  v-model="config.url"
                  label="API URL"
                  placeholder="https://api.example.com/endpoint"
                  variant="outlined"
                  density="comfortable"
                  required
                  prepend-inner-icon="mdi-link-variant"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="config.headers"
                  label="추가 Headers (JSON 형식)"
                  placeholder='{"Content-Type": "application/json", "X-Custom-Header": "value"}'
                  variant="outlined"
                  rows="3"
                  hint="인증 설정에서 자동으로 추가되는 헤더 외에 추가로 필요한 헤더를 입력하세요"
                  prepend-inner-icon="mdi-code-json"
                ></v-textarea>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="config.body"
                  label="Request Body (JSON 형식)"
                  placeholder='{"key": "value"}'
                  variant="outlined"
                  rows="4"
                  hint="POST/PUT/PATCH 요청 시 사용"
                  prepend-inner-icon="mdi-file-document-edit"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <v-expansion-panel class="expansion-panel auth-panel">
          <v-expansion-panel-title class="expansion-title">
            <v-icon left color="primary">mdi-lock</v-icon>
            <span class="font-weight-medium">인증 설정</span>
            <v-chip v-if="config.authType !== 'none'" size="small" color="success" class="ml-2">활성화</v-chip>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-alert type="info" variant="tonal" class="mb-4" density="compact">
              <v-icon left>mdi-information</v-icon>
              인증 방식을 선택하면 자동으로 헤더에 추가됩니다.
            </v-alert>
            <v-select
              v-model="config.authType"
              :items="authTypes"
              label="인증 방식"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-shield-check"
              class="mb-4"
            ></v-select>

            <v-card v-if="config.authType === 'bearer'" variant="outlined" class="auth-card">
              <v-card-text>
                <v-text-field
                  v-model="config.auth.bearerToken"
                  label="Bearer Token"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  variant="outlined"
                  density="comfortable"
                  :type="showBearerToken ? 'text' : 'password'"
                  prepend-inner-icon="mdi-key"
                  :append-inner-icon="showBearerToken ? 'mdi-eye-off' : 'mdi-eye'"
                  @click:append-inner="showBearerToken = !showBearerToken"
                  hint="Authorization: Bearer {token} 형식으로 자동 추가됩니다"
                ></v-text-field>
                <v-chip color="info" size="small" variant="tonal" class="mt-2">Authorization: Bearer {token}</v-chip>
              </v-card-text>
            </v-card>

            <v-card v-if="config.authType === 'basic'" variant="outlined" class="auth-card">
              <v-card-text>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field v-model="config.auth.basicUsername" label="Username" placeholder="username" variant="outlined" density="comfortable" prepend-inner-icon="mdi-account"></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="config.auth.basicPassword"
                      label="Password"
                      placeholder="password"
                      variant="outlined"
                      density="comfortable"
                      :type="showBasicPassword ? 'text' : 'password'"
                      prepend-inner-icon="mdi-lock"
                      :append-inner-icon="showBasicPassword ? 'mdi-eye-off' : 'mdi-eye'"
                      @click:append-inner="showBasicPassword = !showBasicPassword"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-chip color="info" size="small" variant="tonal" class="mt-2">Authorization: Basic {base64(username:password)}</v-chip>
              </v-card-text>
            </v-card>

            <v-card v-if="config.authType === 'apikey-header'" variant="outlined" class="auth-card">
              <v-card-text>
                <v-text-field v-model="config.auth.apiKeyHeaderName" label="Header Name" placeholder="X-API-Key" variant="outlined" density="comfortable" prepend-inner-icon="mdi-tag" hint="예: X-API-Key" class="mb-3"></v-text-field>
                <v-text-field
                  v-model="config.auth.apiKeyHeaderValue"
                  label="API Key"
                  placeholder="your-api-key-here"
                  variant="outlined"
                  density="comfortable"
                  :type="showApiKey ? 'text' : 'password'"
                  prepend-inner-icon="mdi-key"
                  :append-inner-icon="showApiKey ? 'mdi-eye-off' : 'mdi-eye'"
                  @click:append-inner="showApiKey = !showApiKey"
                ></v-text-field>
                <v-chip color="info" size="small" variant="tonal" class="mt-2">{Header Name}: {API Key}</v-chip>
              </v-card-text>
            </v-card>

            <v-card v-if="config.authType === 'apikey-query'" variant="outlined" class="auth-card">
              <v-card-text>
                <v-text-field v-model="config.auth.apiKeyQueryName" label="Query Parameter Name" placeholder="api_key" variant="outlined" density="comfortable" prepend-inner-icon="mdi-tag" class="mb-3"></v-text-field>
                <v-text-field
                  v-model="config.auth.apiKeyQueryValue"
                  label="API Key"
                  placeholder="your-api-key-here"
                  variant="outlined"
                  density="comfortable"
                  :type="showApiKey ? 'text' : 'password'"
                  prepend-inner-icon="mdi-key"
                  :append-inner-icon="showApiKey ? 'mdi-eye-off' : 'mdi-eye'"
                  @click:append-inner="showApiKey = !showApiKey"
                ></v-text-field>
                <v-chip color="info" size="small" variant="tonal" class="mt-2">URL에 ?{Parameter Name}={API Key} 형식으로 추가됩니다</v-chip>
              </v-card-text>
            </v-card>

            <v-card v-if="config.authType === 'custom'" variant="outlined" class="auth-card">
              <v-card-text>
                <v-text-field v-model="config.auth.customHeaderName" label="Header Name" placeholder="X-Custom-Auth" variant="outlined" density="comfortable" prepend-inner-icon="mdi-tag" class="mb-3"></v-text-field>
                <v-text-field v-model="config.auth.customHeaderValue" label="Header Value" placeholder="custom-value" variant="outlined" density="comfortable" prepend-inner-icon="mdi-text"></v-text-field>
                <v-chip color="info" size="small" variant="tonal" class="mt-2">{Header Name}: {Header Value}</v-chip>
              </v-card-text>
            </v-card>

            <v-alert v-if="config.authType === 'none'" type="warning" variant="tonal" class="mt-4">
              <v-icon left>mdi-alert</v-icon>
              인증 없이 요청이 전송됩니다.
            </v-alert>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <v-expansion-panel class="expansion-panel">
          <v-expansion-panel-title class="expansion-title">
            <v-icon left color="primary">mdi-tune</v-icon>
            <span class="font-weight-medium">부하 설정</span>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-row>
              <v-col cols="12" md="4">
                <v-text-field v-model.number="config.concurrentRequests" label="동시 요청 수" type="number" min="1" max="100" variant="outlined" density="comfortable" hint="동시에 실행할 요청 수" prepend-inner-icon="mdi-account-multiple"></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model.number="config.totalRequests" label="총 요청 수" type="number" min="1" variant="outlined" density="comfortable" hint="전체 요청 횟수" prepend-inner-icon="mdi-counter"></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model.number="config.requestInterval" label="요청 간격 (ms)" type="number" min="1" variant="outlined" density="comfortable" hint="요청 사이의 대기 시간 (밀리초)" prepend-inner-icon="mdi-timer-outline"></v-text-field>
              </v-col>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>

      <v-row v-if="isRunning" class="mb-4">
        <v-col cols="12">
          <v-card class="progress-card" elevation="2">
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-icon left color="primary">mdi-progress-clock</v-icon>
                <span class="text-subtitle-1 font-weight-medium">테스트 진행 중...</span>
                <v-spacer></v-spacer>
                <span class="text-subtitle-1 font-weight-bold">{{ progress }}%</span>
              </div>
              <v-progress-linear :model-value="parseFloat(progress)" color="primary" height="8" rounded striped></v-progress-linear>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-2">
        <v-col cols="12">
          <div class="button-group">
            <v-btn color="primary" size="large" :disabled="isRunning || !isValidConfig" @click="startLoadTest" :loading="isRunning" class="control-btn" elevation="4">
              <v-icon left>mdi-play-circle</v-icon>
              테스트 시작
            </v-btn>
            <v-btn color="error" size="large" :disabled="!isRunning" @click="stopLoadTest" class="control-btn" elevation="4">
              <v-icon left>mdi-stop-circle</v-icon>
              테스트 중지
            </v-btn>
            <v-btn color="success" size="large" :disabled="!hasResults" @click="downloadReport" class="control-btn" elevation="4">
              <v-icon left>mdi-download-circle</v-icon>
              리포트 다운로드
            </v-btn>
            <v-btn color="grey-darken-1" size="large" :disabled="!hasResults" @click="clearResults" class="control-btn" elevation="4">
              <v-icon left>mdi-delete-circle</v-icon>
              결과 초기화
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import { defineComponent, inject } from 'vue'

export default defineComponent({
  name: 'TestConfigForm',
  setup() {
    const loadTest = inject('loadTest')
    return {
      panels: loadTest.panels,
      config: loadTest.config,
      httpMethods: loadTest.httpMethods,
      authTypes: loadTest.authTypes,
      showBearerToken: loadTest.showBearerToken,
      showBasicPassword: loadTest.showBasicPassword,
      showApiKey: loadTest.showApiKey,
      isRunning: loadTest.isRunning,
      progress: loadTest.progress,
      isValidConfig: loadTest.isValidConfig,
      hasResults: loadTest.hasResults,
      startLoadTest: loadTest.startLoadTest,
      stopLoadTest: loadTest.stopLoadTest,
      downloadReport: loadTest.downloadReport,
      clearResults: loadTest.clearResults
    }
  }
})
</script>

<style scoped>
.main-card {
  border-radius: 12px;
  overflow: hidden;
  transition: box-shadow 0.3s ease;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
}
.main-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}
.card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 24px;
}
.expansion-panel {
  margin-bottom: 8px;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}
.expansion-panel.auth-panel {
  border: 1px solid #e0e0e0;
}
.expansion-title {
  font-size: 16px;
  padding: 16px;
  font-weight: 600;
}
.auth-card {
  background: #f8f9fa;
  border-radius: 8px;
  margin-top: 8px;
  border: 1px solid #e0e0e0;
}
.progress-card {
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}
.button-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.control-btn {
  border-radius: 8px;
  text-transform: none;
  font-weight: 600;
  transition: box-shadow 0.2s ease;
}
.control-btn:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}
@media (max-width: 960px) {
  .button-group {
    flex-direction: column;
  }
  .control-btn {
    width: 100%;
  }
}
</style>
