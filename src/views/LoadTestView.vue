<template>
  <v-container fluid class="load-test-container">
    <!-- 현재 테스트 상태 & 최근 테스트 결과 대시보드 -->
    <v-row class="mb-4">
      <!-- 현재 테스트 상태 -->
      <v-col cols="12" md="6">
        <v-card class="dashboard-card current-test-card" elevation="6">
          <v-card-title class="dashboard-header">
            <v-icon left color="primary">mdi-play-circle</v-icon>
            <span class="text-h6 font-weight-bold">현재 테스트 상태</span>
            <v-spacer></v-spacer>
            <v-chip
              :color="isRunning ? 'success' : 'grey'"
              size="small"
              variant="flat"
            >
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
              <!-- <div class="info-row">
                <v-icon color="primary" size="20">mdi-timer</v-icon>
                <span class="info-label">경과 시간:</span>
                <span class="info-value">{{ elapsedTime }}</span>
              </div> -->
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
      </v-col>

      <!-- 최근 테스트 결과 -->
      <v-col cols="12" md="6">
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
                v-for="(test, index) in testHistory.slice(0, 5)"
                :key="test.id"
                class="history-item"
                :class="{ 'active': index === 0 }"
              >
                <template v-slot:prepend>
                  <v-avatar
                    :color="getStatusColor(test.statistics.successRate)"
                    size="40"
                  >
                    <v-icon color="white">{{ getStatusIcon(test.statistics.successRate) }}</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title class="history-title">
                  {{ test.testName || test.testConfig.testName || `${test.testConfig.method} ${formatUrl(test.testConfig.url)}` }}
                </v-list-item-title>
                <v-list-item-subtitle class="history-subtitle">
                  <div class="d-flex align-center mt-1">
                    <v-chip size="x-small" :color="getStatusColor(test.statistics.successRate)" variant="flat" class="mr-2">
                      {{ test.statistics.successRate.toFixed(1) }}% 성공
                    </v-chip>
                    <span class="text-caption mr-2">p95: {{ test.statistics.p95Latency }}ms</span>
                    <span class="text-caption">{{ formatDate(test.timestamp) }}</span>
                  </div>
                </v-list-item-subtitle>
                <template v-slot:append>
                  <v-btn
                    icon
                    size="small"
                    variant="text"
                    @click="viewTestDetails(test)"
                  >
                    <v-icon>mdi-chevron-right</v-icon>
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card class="main-card" elevation="8">
          <v-card-title class="card-header">
            <v-icon left size="32" color="primary">mdi-speedometer</v-icon>
            <span class="text-h5 font-weight-bold">API 부하 테스트</span>
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text class="pa-6">
            <!-- 테스트 정보 섹션 -->
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

              <!-- 인증 설정 섹션 -->
              <v-expansion-panel class="expansion-panel auth-panel">
                <v-expansion-panel-title class="expansion-title">
                  <v-icon left color="primary">mdi-lock</v-icon>
                  <span class="font-weight-medium">인증 설정</span>
                  <v-chip
                    v-if="config.authType !== 'none'"
                    size="small"
                    color="success"
                    class="ml-2"
                  >
                    활성화
                  </v-chip>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-alert
                    type="info"
                    variant="tonal"
                    class="mb-4"
                    density="compact"
                  >
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

                  <!-- Bearer Token -->
                  <v-card
                    v-if="config.authType === 'bearer'"
                    variant="outlined"
                    class="auth-card"
                  >
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
                      >
                        <template v-slot:append-inner>
                          <v-icon
                            @click="showBearerToken = !showBearerToken"
                            style="cursor: pointer;"
                          >
                            {{ showBearerToken ? 'mdi-eye-off' : 'mdi-eye' }}
                          </v-icon>
                        </template>
                      </v-text-field>
                      <v-chip color="info" size="small" variant="tonal" class="mt-2">
                        <v-icon left size="16">mdi-information</v-icon>
                        Authorization: Bearer {token}
                      </v-chip>
                    </v-card-text>
                  </v-card>

                  <!-- Basic Authentication -->
                  <v-card
                    v-if="config.authType === 'basic'"
                    variant="outlined"
                    class="auth-card"
                  >
                    <v-card-text>
                      <v-row>
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="config.auth.basicUsername"
                            label="Username"
                            placeholder="username"
                            variant="outlined"
                            density="comfortable"
                            prepend-inner-icon="mdi-account"
                          ></v-text-field>
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
                          >
                            <template v-slot:append-inner>
                              <v-icon
                                @click="showBasicPassword = !showBasicPassword"
                                style="cursor: pointer;"
                              >
                                {{ showBasicPassword ? 'mdi-eye-off' : 'mdi-eye' }}
                              </v-icon>
                            </template>
                          </v-text-field>
                        </v-col>
                      </v-row>
                      <v-chip color="info" size="small" variant="tonal" class="mt-2">
                        <v-icon left size="16">mdi-information</v-icon>
                        Authorization: Basic {base64(username:password)}
                      </v-chip>
                    </v-card-text>
                  </v-card>

                  <!-- API Key (Header) -->
                  <v-card
                    v-if="config.authType === 'apikey-header'"
                    variant="outlined"
                    class="auth-card"
                  >
                    <v-card-text>
                      <v-text-field
                        v-model="config.auth.apiKeyHeaderName"
                        label="Header Name"
                        placeholder="X-API-Key"
                        variant="outlined"
                        density="comfortable"
                        prepend-inner-icon="mdi-tag"
                        hint="예: X-API-Key, X-Auth-Token 등"
                        class="mb-3"
                      ></v-text-field>
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
                      >
                        <template v-slot:append-inner>
                          <v-icon
                            @click="showApiKey = !showApiKey"
                            style="cursor: pointer;"
                          >
                            {{ showApiKey ? 'mdi-eye-off' : 'mdi-eye' }}
                          </v-icon>
                        </template>
                      </v-text-field>
                      <v-chip color="info" size="small" variant="tonal" class="mt-2">
                        <v-icon left size="16">mdi-information</v-icon>
                        {Header Name}: {API Key}
                      </v-chip>
                    </v-card-text>
                  </v-card>

                  <!-- API Key (Query Parameter) -->
                  <v-card
                    v-if="config.authType === 'apikey-query'"
                    variant="outlined"
                    class="auth-card"
                  >
                    <v-card-text>
                      <v-text-field
                        v-model="config.auth.apiKeyQueryName"
                        label="Query Parameter Name"
                        placeholder="api_key"
                        variant="outlined"
                        density="comfortable"
                        prepend-inner-icon="mdi-tag"
                        hint="예: api_key, key, token 등"
                        class="mb-3"
                      ></v-text-field>
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
                      >
                        <template v-slot:append-inner>
                          <v-icon
                            @click="showApiKey = !showApiKey"
                            style="cursor: pointer;"
                          >
                            {{ showApiKey ? 'mdi-eye-off' : 'mdi-eye' }}
                          </v-icon>
                        </template>
                      </v-text-field>
                      <v-chip color="info" size="small" variant="tonal" class="mt-2">
                        <v-icon left size="16">mdi-information</v-icon>
                        URL에 ?{Parameter Name}={API Key} 형식으로 추가됩니다
                      </v-chip>
                    </v-card-text>
                  </v-card>

                  <!-- Custom Header -->
                  <v-card
                    v-if="config.authType === 'custom'"
                    variant="outlined"
                    class="auth-card"
                  >
                    <v-card-text>
                      <v-text-field
                        v-model="config.auth.customHeaderName"
                        label="Header Name"
                        placeholder="X-Custom-Auth"
                        variant="outlined"
                        density="comfortable"
                        prepend-inner-icon="mdi-tag"
                        class="mb-3"
                      ></v-text-field>
                      <v-text-field
                        v-model="config.auth.customHeaderValue"
                        label="Header Value"
                        placeholder="custom-value"
                        variant="outlined"
                        density="comfortable"
                        prepend-inner-icon="mdi-text"
                      ></v-text-field>
                      <v-chip color="info" size="small" variant="tonal" class="mt-2">
                        <v-icon left size="16">mdi-information</v-icon>
                        {Header Name}: {Header Value}
                      </v-chip>
                    </v-card-text>
                  </v-card>

                  <!-- 인증 미사용 -->
                  <v-alert
                    v-if="config.authType === 'none'"
                    type="warning"
                    variant="tonal"
                    class="mt-4"
                  >
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
                      <v-text-field
                        v-model.number="config.concurrentRequests"
                        label="동시 요청 수"
                        type="number"
                        min="1"
                        max="100"
                        variant="outlined"
                        density="comfortable"
                        hint="동시에 실행할 요청 수"
                        prepend-inner-icon="mdi-account-multiple"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model.number="config.totalRequests"
                        label="총 요청 수"
                        type="number"
                        min="1"
                        variant="outlined"
                        density="comfortable"
                        hint="전체 요청 횟수"
                        prepend-inner-icon="mdi-counter"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model.number="config.requestInterval"
                        label="요청 간격 (ms)"
                        type="number"
                        min="1"
                        variant="outlined"
                        density="comfortable"
                        hint="요청 사이의 대기 시간 (밀리초)"
                        prepend-inner-icon="mdi-timer-outline"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>

            <!-- 진행률 표시 -->
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
                    <v-progress-linear
                      :model-value="parseFloat(progress)"
                      color="primary"
                      height="8"
                      rounded
                      striped
                    ></v-progress-linear>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <!-- 제어 버튼 -->
            <v-row class="mt-2">
              <v-col cols="12">
                <div class="button-group">
                  <v-btn
                    color="primary"
                    size="large"
                    :disabled="isRunning || !isValidConfig"
                    @click="startLoadTest"
                    :loading="isRunning"
                    class="control-btn"
                    elevation="4"
                  >
                    <v-icon left>mdi-play-circle</v-icon>
                    테스트 시작
                  </v-btn>
                  <v-btn
                    color="error"
                    size="large"
                    :disabled="!isRunning"
                    @click="stopLoadTest"
                    class="control-btn"
                    elevation="4"
                  >
                    <v-icon left>mdi-stop-circle</v-icon>
                    테스트 중지
                  </v-btn>
                  <v-btn
                    color="success"
                    size="large"
                    :disabled="!hasResults"
                    @click="downloadReport"
                    class="control-btn"
                    elevation="4"
                  >
                    <v-icon left>mdi-download-circle</v-icon>
                    리포트 다운로드
                  </v-btn>
                  <v-btn
                    color="grey-darken-1"
                    size="large"
                    :disabled="!hasResults"
                    @click="clearResults"
                    class="control-btn"
                    elevation="4"
                  >
                    <v-icon left>mdi-delete-circle</v-icon>
                    결과 초기화
                  </v-btn>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 실시간 통계 -->
    <v-row v-if="isRunning || hasResults" class="stats-row">
      <v-col cols="12" md="2">
        <v-card class="stat-card success-card" elevation="6" :class="{ 'pulse-animation': isRunning }">
          <v-card-text class="text-center pa-4">
            <v-icon size="48" class="mb-2">mdi-check-circle</v-icon>
            <div class="text-h6 mb-1">성공</div>
            <div class="text-h3 font-weight-bold mb-2">{{ stats.success }}</div>
            <v-chip color="success" size="small" variant="flat">
              성공률: {{ successRate }}%
            </v-chip>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="2">
        <v-card class="stat-card error-card" elevation="6" :class="{ 'pulse-animation': isRunning }">
          <v-card-text class="text-center pa-4">
            <v-icon size="48" class="mb-2">mdi-close-circle</v-icon>
            <div class="text-h6 mb-1">실패</div>
            <div class="text-h3 font-weight-bold mb-2">{{ stats.failed }}</div>
            <v-chip color="error" size="small" variant="flat">
              실패률: {{ failureRate }}%
            </v-chip>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="2">
        <v-card class="stat-card error-rate-card" elevation="6" :class="{ 'pulse-animation': isRunning }">
          <v-card-text class="text-center pa-4">
            <v-icon size="48" class="mb-2">mdi-alert-circle</v-icon>
            <div class="text-h6 mb-1">Error Rate</div>
            <div class="text-h3 font-weight-bold mb-2">{{ errorRate }}%</div>
            <div class="realtime-chart-container">
              <canvas ref="errorRateChart" class="realtime-chart"></canvas>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="2">
        <v-card class="stat-card info-card" elevation="6" :class="{ 'pulse-animation': isRunning }">
          <v-card-text class="text-center pa-4">
            <v-icon size="48" class="mb-2">mdi-clock-outline</v-icon>
            <div class="text-h6 mb-1">평균 응답 시간</div>
            <div class="text-h3 font-weight-bold mb-2">{{ averageResponseTime }}ms</div>
            <div class="d-flex justify-space-between mt-2">
              <v-chip color="info" size="x-small" variant="flat">
                최소: {{ stats.minTime === Infinity ? 0 : stats.minTime }}ms
              </v-chip>
              <v-chip color="info" size="x-small" variant="flat">
                최대: {{ stats.maxTime }}ms
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="2">
        <v-card class="stat-card p95-card" elevation="6" :class="{ 'pulse-animation': isRunning }">
          <v-card-text class="text-center pa-4">
            <v-icon size="48" class="mb-2">mdi-chart-timeline-variant</v-icon>
            <div class="text-h6 mb-1">Latency (p95)</div>
            <div class="text-h3 font-weight-bold mb-2">{{ p95Latency }}ms</div>
            <div class="realtime-chart-container">
              <canvas ref="p95LatencyChart" class="realtime-chart"></canvas>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="2">
        <v-card class="stat-card warning-card" elevation="6" :class="{ 'pulse-animation': isRunning }">
          <v-card-text class="text-center pa-4">
            <v-icon size="48" class="mb-2">mdi-speedometer-medium</v-icon>
            <div class="text-h6 mb-1">초당 요청 수</div>
            <div class="text-h3 font-weight-bold mb-2">{{ requestsPerSecond }}</div>
            <v-chip color="warning" size="small" variant="flat">
              진행률: {{ progress }}%
            </v-chip>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 실시간 로그 -->
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
            <div class="log-container" ref="logContainer">
              <div
                v-for="(log, index) in displayLogs"
                :key="index"
                :class="['log-entry', log.type]"
              >
                <span class="log-time">{{ log.time }}</span>
                <span class="log-badge" :class="log.type"></span>
                <span class="log-message">{{ log.message }}</span>
                <span v-if="log.responseTime" class="log-time-info">
                  ({{ log.responseTime }}ms)
                </span>
              </div>
              <div v-if="displayLogs.length === 0" class="log-empty">
                로그가 없습니다
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 응답 시간 차트 -->
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
              <canvas ref="chartCanvas"></canvas>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 테스트 상세 정보 다이얼로그 -->
    <v-dialog v-model="showTestDialog" max-width="800" scrollable>
      <v-card>
        <v-card-title class="dialog-header">
          <v-icon left color="primary">mdi-information</v-icon>
          <span class="text-h6 font-weight-bold">테스트 상세 정보</span>
          <v-spacer></v-spacer>
          <v-btn icon variant="text" @click="showTestDialog = false">
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
                  <span class="detail-value">{{ selectedTest.testConfig.method }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">URL:</span>
                  <span class="detail-value">{{ selectedTest.testConfig.url }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">동시 요청:</span>
                  <span class="detail-value">{{ selectedTest.testConfig.concurrentRequests }}개</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">총 요청:</span>
                  <span class="detail-value">{{ selectedTest.testConfig.totalRequests }}개</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">실행 시간:</span>
                  <span class="detail-value">{{ formatDateTime(selectedTest.timestamp) }}</span>
                </div>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="detail-section">
                <h3 class="detail-title">결과 요약</h3>
                <div class="detail-item">
                  <span class="detail-label">성공률:</span>
                  <v-chip :color="getStatusColor(selectedTest.statistics.successRate)" size="small" variant="flat">
                    {{ selectedTest.statistics.successRate.toFixed(2) }}%
                  </v-chip>
                </div>
                <div class="detail-item">
                  <span class="detail-label">에러율:</span>
                  <span class="detail-value">{{ selectedTest.statistics.errorRate.toFixed(2) }}%</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">평균 응답 시간:</span>
                  <span class="detail-value">{{ selectedTest.statistics.averageResponseTime }}ms</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">p50 Latency:</span>
                  <span class="detail-value">{{ selectedTest.statistics.p50Latency }}ms</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">p95 Latency:</span>
                  <span class="detail-value">{{ selectedTest.statistics.p95Latency }}ms</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">초당 요청 수:</span>
                  <span class="detail-value">{{ selectedTest.statistics.requestsPerSecond }}</span>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="showTestDialog = false">닫기</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { defineComponent, ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { makeTest, getTests } from '../api/test'

export default defineComponent({
  name: 'LoadTestView',
  setup() {
    const panels = ref([0, 1, 2, 3])
    const isRunning = ref(false)
    const showBearerToken = ref(false)
    const showBasicPassword = ref(false)
    const showApiKey = ref(false)
    const testHistory = ref([])
    const showTestDialog = ref(false)
    const selectedTest = ref(null)
    const elapsedTimeInterval = ref(null)
    
    const config = ref({
      testName: '',
      description: '',
      method: 'GET',
      url: '',
      headers: '',
      body: '',
      concurrentRequests: 5,
      totalRequests: 100,
      requestInterval: 1,
      authType: 'none',
      auth: {
        bearerToken: '',
        basicUsername: '',
        basicPassword: '',
        apiKeyHeaderName: 'X-API-Key',
        apiKeyHeaderValue: '',
        apiKeyQueryName: 'api_key',
        apiKeyQueryValue: '',
        customHeaderName: '',
        customHeaderValue: ''
      }
    })

    const authTypes = [
      { title: '인증 없음', value: 'none' },
      { title: 'Bearer Token', value: 'bearer' },
      { title: 'Basic Authentication', value: 'basic' },
      { title: 'API Key (Header)', value: 'apikey-header' },
      { title: 'API Key (Query Parameter)', value: 'apikey-query' },
      { title: 'Custom Header', value: 'custom' }
    ]

    const stats = ref({
      success: 0,
      failed: 0,
      totalTime: 0,
      minTime: Infinity,
      maxTime: 0,
      startTime: null,
      endTime: null
    })

    const logs = ref([])
    const results = ref([])
    const chartCanvas = ref(null)
    const logContainer = ref(null)
    const errorRateChart = ref(null)
    const p95LatencyChart = ref(null)
    
    // 실시간 그래프 데이터
    const realtimeData = ref({
      errorRate: [],
      p95Latency: [],
      timestamps: []
    })
    
    // let chartContext = null
    let stopFlag = false
    let activeRequests = 0

    const httpMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

    const isValidConfig = computed(() => {
      return config.value.url.trim() !== '' && 
             config.value.totalRequests > 0 && 
             config.value.concurrentRequests > 0
    })

    const hasResults = computed(() => {
      return results.value.length > 0 || stats.value.success + stats.value.failed > 0
    })

    const successRate = computed(() => {
      const total = stats.value.success + stats.value.failed
      return total > 0 ? ((stats.value.success / total) * 100).toFixed(2) : 0
    })

    const failureRate = computed(() => {
      const total = stats.value.success + stats.value.failed
      return total > 0 ? ((stats.value.failed / total) * 100).toFixed(2) : 0
    })

    const averageResponseTime = computed(() => {
      const total = stats.value.success + stats.value.failed
      return total > 0 ? Math.round(stats.value.totalTime / total) : 0
    })

    const requestsPerSecond = computed(() => {
      if (!stats.value.startTime) return 0
      const elapsed = (Date.now() - stats.value.startTime) / 1000
      const total = stats.value.success + stats.value.failed
      return elapsed > 0 ? (total / elapsed).toFixed(2) : 0
    })

    const progress = computed(() => {
      const total = stats.value.success + stats.value.failed
      return config.value.totalRequests > 0 
        ? ((total / config.value.totalRequests) * 100).toFixed(1) 
        : 0
    })

    // Error Rate 계산 (실시간)
    const errorRate = computed(() => {
      const total = stats.value.success + stats.value.failed
      if (total === 0) return 0
      const errorCount = results.value.filter(r => {
        return !r.success || (r.statusCode >= 500 && r.statusCode < 600) || r.errorType === 'timeout'
      }).length
      return ((errorCount / total) * 100).toFixed(2)
    })

    // Percentile 계산 함수
    const calculatePercentile = (percentile) => {
      if (results.value.length === 0) return 0
      
      const successfulResults = results.value
        .filter(r => r.success && r.latency_ms !== undefined)
        .map(r => r.latency_ms)
        .sort((a, b) => a - b)
      
      if (successfulResults.length === 0) return 0
      
      const index = Math.ceil((percentile / 100) * successfulResults.length) - 1
      return successfulResults[Math.max(0, index)] || 0
    }

    // p50, p95 Latency 계산
    const p50Latency = computed(() => {
      return calculatePercentile(50)
    })

    const p95Latency = computed(() => {
      return calculatePercentile(95)
    })

    const displayLogs = computed(() => {
      return logs.value.slice(-100).reverse() // 최근 100개만 표시
    })

    const addLog = (message, type = 'info', responseTime = null) => {
      const now = new Date()
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`
      
      logs.value.push({
        time: timeStr,
        message,
        type,
        responseTime
      })

      // 로그가 너무 많아지면 오래된 것 삭제
      if (logs.value.length > 1000) {
        logs.value = logs.value.slice(-1000)
      }

      // 로그 컨테이너 자동 스크롤
      nextTick(() => {
        if (logContainer.value) {
          logContainer.value.scrollTop = logContainer.value.scrollHeight
        }
      })
    }

    const updateStats = (responseTime, success) => {
      if (success) {
        stats.value.success++
      } else {
        stats.value.failed++
      }

      stats.value.totalTime += responseTime
      stats.value.minTime = Math.min(stats.value.minTime, responseTime)
      stats.value.maxTime = Math.max(stats.value.maxTime, responseTime)
    }

    // 인증 헤더 생성 함수
    const buildAuthHeaders = () => {
      const authHeaders = {}
      
      switch (config.value.authType) {
        case 'bearer':
          if (config.value.auth.bearerToken.trim()) {
            authHeaders['Authorization'] = `Bearer ${config.value.auth.bearerToken.trim()}`
          }
          break
          
        case 'basic':
          if (config.value.auth.basicUsername.trim() && config.value.auth.basicPassword.trim()) {
            const credentials = `${config.value.auth.basicUsername.trim()}:${config.value.auth.basicPassword.trim()}`
            const encoded = btoa(credentials)
            authHeaders['Authorization'] = `Basic ${encoded}`
          }
          break
          
        case 'apikey-header':
          if (config.value.auth.apiKeyHeaderName.trim() && config.value.auth.apiKeyHeaderValue.trim()) {
            authHeaders[config.value.auth.apiKeyHeaderName.trim()] = config.value.auth.apiKeyHeaderValue.trim()
          }
          break
          
        case 'custom':
          if (config.value.auth.customHeaderName.trim() && config.value.auth.customHeaderValue.trim()) {
            authHeaders[config.value.auth.customHeaderName.trim()] = config.value.auth.customHeaderValue.trim()
          }
          break
      }
      
      return authHeaders
    }

    // URL에 Query Parameter 추가
    const buildUrlWithQuery = (url) => {
      if (config.value.authType === 'apikey-query') {
        if (config.value.auth.apiKeyQueryName.trim() && config.value.auth.apiKeyQueryValue.trim()) {
          const separator = url.includes('?') ? '&' : '?'
          return `${url}${separator}${encodeURIComponent(config.value.auth.apiKeyQueryName.trim())}=${encodeURIComponent(config.value.auth.apiKeyQueryValue.trim())}`
        }
      }
      return url
    }

    const makeRequest = async () => {
      if (stopFlag) return

      const startTime = Date.now()
      let responseTime = 0
      let success = false
      let errorMessage = null
      let statusCode = null

      try {
        // 기본 헤더
        const headers = {}
        
        // 인증 헤더 추가
        const authHeaders = buildAuthHeaders()
        Object.assign(headers, authHeaders)
        
        // 사용자 정의 헤더 추가
        if (config.value.headers.trim()) {
          try {
            Object.assign(headers, JSON.parse(config.value.headers))
          } catch (e) {
            addLog(`헤더 파싱 오류: ${e.message}`, 'error')
            return
          }
        }

        let body = null
        if (config.value.body.trim() && ['POST', 'PUT', 'PATCH'].includes(config.value.method)) {
          try {
            body = JSON.parse(config.value.body)
          } catch (e) {
            addLog(`Body 파싱 오류: ${e.message}`, 'error')
            return
          }
        }

        // URL에 Query Parameter 추가 (API Key Query인 경우)
        const finalUrl = buildUrlWithQuery(config.value.url)

        const axiosConfig = {
          name: config.value.testName,
          descriptions: config.value.description,
          targetUrl: finalUrl,
          method: config.value.method.toUpperCase(),
          // headers,
          data: body,
          thread: config.value.concurrentRequests,
          totalRequest: config.value.totalRequests,
          requestInterval: config.value.requestInterval,
          authType: config.value.authType.replace("-","_"),
          auth: config.value.auth,
          timeout: 30000
        }

        const response = await makeTest(axiosConfig)

        updateStats(responseTime, success)
        addLog(
          `${config.value.method} ${config.value.url} - ${statusCode} ${response.statusText}`,
          success ? 'success' : 'warning',
          responseTime
        )

        results.value.push({
          timestamp: new Date().toISOString(),
          method: config.value.method,
          url: config.value.url,
          statusCode,
          latency_ms: responseTime,
          responseTime, // 하위 호환성 유지
          success,
          error: null,
          errorType: null
        })

      } catch (error) {
        responseTime = Date.now() - startTime
        success = false
        statusCode = error.response?.status || 0
        errorMessage = error.message
        
        // error_type 계산
        let errorType = null
        if (error.code === 'ECONNABORTED' || errorMessage.includes('timeout')) {
          errorType = 'timeout'
        } else if (statusCode >= 500 && statusCode < 600) {
          errorType = '5xx'
        } else if (statusCode > 0) {
          errorType = 'other'
        } else {
          errorType = 'network'
        }

        updateStats(responseTime, success)
        addLog(
          `${config.value.method} ${config.value.url} - ${errorMessage}`,
          'error',
          responseTime
        )

        results.value.push({
          timestamp: new Date().toISOString(),
          method: config.value.method,
          url: config.value.url,
          statusCode,
          latency_ms: responseTime,
          responseTime, // 하위 호환성 유지
          success: false,
          error: errorMessage,
          errorType
        })
      }
    }

    const startLoadTest = async () => {
      // 초기화
      stopFlag = false
      isRunning.value = true
      stats.value = {
        success: 0,
        failed: 0,
        totalTime: 0,
        minTime: Infinity,
        maxTime: 0,
        startTime: Date.now(),
        endTime: null
      }
      logs.value = []
      results.value = []
      activeRequests = 0
      
      // 실시간 그래프 데이터 초기화
      realtimeData.value = {
        errorRate: [],
        p95Latency: [],
        timestamps: []
      }

      addLog('부하 테스트 시작', 'info')
      addLog(`설정: ${config.value.concurrentRequests}개 동시 요청, 총 ${config.value.totalRequests}개 요청`, 'info')

      let completedRequests = 0
      const totalRequests = config.value.totalRequests

      // 동시 요청 실행
      const executeRequests = async () => {
        makeRequest().finally(() => {
          activeRequests--
          completedRequests++
          
          if (completedRequests >= totalRequests || stopFlag) {
            if (activeRequests === 0) {
              finishTest()
            }
          }
        })
      }

      executeRequests()
    }

    const finishTest = () => {
      isRunning.value = false
      stats.value.endTime = Date.now()
      stopFlag = false
      
      const duration = (stats.value.endTime - stats.value.startTime) / 1000
      addLog(`부하 테스트 완료 - 총 ${stats.value.success + stats.value.failed}개 요청, 소요 시간: ${duration.toFixed(2)}초`, 'info')
      
      // 테스트 결과를 히스토리에 저장
      saveTestToHistory()
      
      // 경과 시간 업데이트 중지
      if (elapsedTimeInterval.value) {
        clearInterval(elapsedTimeInterval.value)
        elapsedTimeInterval.value = null
      }
      
      nextTick(() => {
        drawChart()
      })
    }

    const stopLoadTest = () => {
      stopFlag = true
      addLog('부하 테스트 중지 요청', 'warning')
    }

    const drawChart = () => {
      if (!chartCanvas.value || results.value.length === 0) return

      const canvas = chartCanvas.value
      const ctx = canvas.getContext('2d')
    //   chartContext = ctx

      // 캔버스 크기 설정
      const container = canvas.parentElement
      canvas.width = container.clientWidth
      canvas.height = 300

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 성공한 요청만 필터링
      const successfulResults = results.value.filter(r => r.success)
      if (successfulResults.length === 0) return

      const padding = 40
      const chartWidth = canvas.width - padding * 2
      const chartHeight = canvas.height - padding * 2

      // Y축 범위 계산
      const responseTimes = successfulResults.map(r => r.responseTime)
      const maxTime = Math.max(...responseTimes)
      const minTime = Math.min(...responseTimes)
      const range = maxTime - minTime || 1

      // 배경 그라데이션
      const gradient = ctx.createLinearGradient(0, padding, 0, canvas.height - padding)
      gradient.addColorStop(0, 'rgba(102, 126, 234, 0.1)')
      gradient.addColorStop(1, 'rgba(118, 75, 162, 0.1)')
      ctx.fillStyle = gradient
      ctx.fillRect(padding, padding, chartWidth, chartHeight)

      // 그리드 그리기
      ctx.strokeStyle = '#e0e0e0'
      ctx.lineWidth = 1
      for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i
        ctx.beginPath()
        ctx.moveTo(padding, y)
        ctx.lineTo(canvas.width - padding, y)
        ctx.stroke()
      }

      // Y축 그리기
      ctx.beginPath()
      ctx.moveTo(padding, padding)
      ctx.lineTo(padding, canvas.height - padding)
      ctx.stroke()

      // 데이터 포인트 그리기 (그라데이션 선)
      const lineGradient = ctx.createLinearGradient(padding, padding, canvas.width - padding, canvas.height - padding)
      lineGradient.addColorStop(0, '#667eea')
      lineGradient.addColorStop(1, '#764ba2')
      ctx.strokeStyle = lineGradient
      ctx.lineWidth = 3
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()

      successfulResults.forEach((result, index) => {
        const x = padding + (chartWidth / (successfulResults.length - 1 || 1)) * index
        const y = padding + chartHeight - ((result.responseTime - minTime) / range) * chartHeight
        
        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })

      ctx.stroke()

      // 포인트 그리기 (그라데이션 원)
      successfulResults.forEach((result, index) => {
        const x = padding + (chartWidth / (successfulResults.length - 1 || 1)) * index
        const y = padding + chartHeight - ((result.responseTime - minTime) / range) * chartHeight
        
        const pointGradient = ctx.createRadialGradient(x, y, 0, x, y, 6)
        pointGradient.addColorStop(0, '#ffffff')
        pointGradient.addColorStop(0.5, '#667eea')
        pointGradient.addColorStop(1, '#764ba2')
        
        ctx.fillStyle = pointGradient
        ctx.beginPath()
        ctx.arc(x, y, 5, 0, Math.PI * 2)
        ctx.fill()
        
        // 외곽선
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2
        ctx.stroke()
      })

      // 축 레이블
      ctx.fillStyle = '#555'
      ctx.font = 'bold 13px Arial'
      ctx.textAlign = 'center'
      
      // X축 레이블
      ctx.fillText('요청 순서', canvas.width / 2, canvas.height - 8)

      // Y축 레이블
      ctx.save()
      ctx.translate(18, canvas.height / 2)
      ctx.rotate(-Math.PI / 2)
      ctx.fillText('응답 시간 (ms)', 0, 0)
      ctx.restore()

      // Y축 값
      ctx.textAlign = 'right'
      ctx.font = '11px Arial'
      ctx.fillStyle = '#777'
      for (let i = 0; i <= 5; i++) {
        const value = maxTime - (range / 5) * i
        const y = padding + (chartHeight / 5) * i
        ctx.fillText(Math.round(value).toString(), padding - 12, y + 4)
      }
    }

    const downloadReport = () => {
      const report = {
        testName: config.value.testName || '',
        description: config.value.description || '',
        testConfig: {
          testName: config.value.testName || '',
          description: config.value.description || '',
          method: config.value.method,
          url: config.value.url,
          concurrentRequests: config.value.concurrentRequests,
          totalRequests: config.value.totalRequests,
          requestInterval: config.value.requestInterval,
          authType: config.value.authType,
          auth: config.value.authType !== 'none' ? {
            // 민감한 정보는 마스킹
            bearerToken: config.value.auth.bearerToken ? '***' : '',
            basicUsername: config.value.auth.basicUsername || '',
            basicPassword: config.value.auth.basicPassword ? '***' : '',
            apiKeyHeaderName: config.value.auth.apiKeyHeaderName || '',
            apiKeyHeaderValue: config.value.auth.apiKeyHeaderValue ? '***' : '',
            apiKeyQueryName: config.value.auth.apiKeyQueryName || '',
            apiKeyQueryValue: config.value.auth.apiKeyQueryValue ? '***' : '',
            customHeaderName: config.value.auth.customHeaderName || '',
            customHeaderValue: config.value.auth.customHeaderValue ? '***' : ''
          } : null
        },
        statistics: {
          totalRequests: stats.value.success + stats.value.failed,
          success: stats.value.success,
          failed: stats.value.failed,
          successRate: parseFloat(successRate.value),
          failureRate: parseFloat(failureRate.value),
          errorRate: parseFloat(errorRate.value),
          averageResponseTime: averageResponseTime.value,
          minResponseTime: stats.value.minTime === Infinity ? 0 : stats.value.minTime,
          maxResponseTime: stats.value.maxTime,
          p50Latency: p50Latency.value,
          p95Latency: p95Latency.value,
          duration: stats.value.endTime && stats.value.startTime 
            ? (stats.value.endTime - stats.value.startTime) / 1000 
            : 0,
          requestsPerSecond: parseFloat(requestsPerSecond.value)
        },
        results: results.value,
        logs: logs.value
      }

      // 파일명 생성
      const testNameForFile = config.value.testName 
        ? config.value.testName.replace(/[^a-zA-Z0-9가-힣]/g, '-').substring(0, 50)
        : 'load-test-report'
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')

      // JSON 다운로드
      const jsonBlob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
      const jsonUrl = URL.createObjectURL(jsonBlob)
      const jsonLink = document.createElement('a')
      jsonLink.href = jsonUrl
      jsonLink.download = `${testNameForFile}-${timestamp}.json`
      jsonLink.click()
      URL.revokeObjectURL(jsonUrl)

      // CSV 다운로드
      const csvHeaders = ['Timestamp', 'Method', 'URL', 'Status Code', 'Latency (ms)', 'Success', 'Error', 'Error Type']
      const csvRows = results.value.map(r => [
        r.timestamp,
        r.method,
        r.url,
        r.statusCode,
        r.latency_ms || r.responseTime,
        r.success,
        r.error || '',
        r.errorType || ''
      ])

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')

      const csvBlob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const csvUrl = URL.createObjectURL(csvBlob)
      const csvLink = document.createElement('a')
      csvLink.href = csvUrl
      csvLink.download = `${testNameForFile}-${timestamp}.csv`
      csvLink.click()
      URL.revokeObjectURL(csvUrl)

      addLog('리포트 다운로드 완료', 'success')
    }

    const clearResults = () => {
      stats.value = {
        success: 0,
        failed: 0,
        totalTime: 0,
        minTime: Infinity,
        maxTime: 0,
        startTime: null,
        endTime: null
      }
      logs.value = []
      results.value = []
      
      // 실시간 그래프 데이터 초기화
      realtimeData.value = {
        errorRate: [],
        p95Latency: [],
        timestamps: []
      }
      
      if (chartCanvas.value) {
        const ctx = chartCanvas.value.getContext('2d')
        ctx.clearRect(0, 0, chartCanvas.value.width, chartCanvas.value.height)
      }
      
      // 실시간 그래프 초기화
      if (errorRateChart.value) {
        const ctx = errorRateChart.value.getContext('2d')
        ctx.clearRect(0, 0, errorRateChart.value.width, errorRateChart.value.height)
      }
      
      if (p95LatencyChart.value) {
        const ctx = p95LatencyChart.value.getContext('2d')
        ctx.clearRect(0, 0, p95LatencyChart.value.width, p95LatencyChart.value.height)
      }
    }

    // 경과 시간 계산
    const elapsedTime = computed(() => {
      if (!stats.value.startTime) return '00:00'
      const elapsed = isRunning.value 
        ? (Date.now() - stats.value.startTime) / 1000
        : (stats.value.endTime - stats.value.startTime) / 1000
      const minutes = Math.floor(elapsed / 60)
      const seconds = Math.floor(elapsed % 60)
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    })

    // 테스트 히스토리 저장
    const saveTestToHistory = () => {
      if (results.value.length === 0) return

      const testResult = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        testName: config.value.testName || '',
        description: config.value.description || '',
        testConfig: {
          testName: config.value.testName || '',
          description: config.value.description || '',
          method: config.value.method,
          url: config.value.url,
          concurrentRequests: config.value.concurrentRequests,
          totalRequests: config.value.totalRequests,
          requestInterval: config.value.requestInterval,
          authType: config.value.authType
        },
        statistics: {
          totalRequests: stats.value.success + stats.value.failed,
          success: stats.value.success,
          failed: stats.value.failed,
          successRate: parseFloat(successRate.value),
          failureRate: parseFloat(failureRate.value),
          errorRate: parseFloat(errorRate.value),
          averageResponseTime: averageResponseTime.value,
          minResponseTime: stats.value.minTime === Infinity ? 0 : stats.value.minTime,
          maxResponseTime: stats.value.maxTime,
          p50Latency: p50Latency.value,
          p95Latency: p95Latency.value,
          duration: stats.value.endTime && stats.value.startTime 
            ? (stats.value.endTime - stats.value.startTime) / 1000 
            : 0,
          requestsPerSecond: parseFloat(requestsPerSecond.value)
        }
      }

      // 히스토리 배열 앞에 추가 (최신이 먼저)
      testHistory.value.unshift(testResult)
      
      // 최대 50개까지만 저장
      if (testHistory.value.length > 50) {
        testHistory.value = testHistory.value.slice(0, 50)
      }

      // 로컬 스토리지에 저장
      try {
        localStorage.setItem('loadTestHistory', JSON.stringify(testHistory.value))
      } catch (e) {
        console.warn('히스토리 저장 실패:', e)
      }
    }

    // 히스토리 불러오기
    const loadTestHistory = () => {
      try {
        const saved = localStorage.getItem('loadTestHistory')
        if (saved) {
          testHistory.value = JSON.parse(saved)
        }
      } catch (e) {
        console.warn('히스토리 불러오기 실패:', e)
      }
    }

    // 히스토리 초기화
    const clearHistory = () => {
      testHistory.value = []
      try {
        localStorage.removeItem('loadTestHistory')
      } catch (e) {
        console.warn('히스토리 삭제 실패:', e)
      }
    }

    // 테스트 상세 정보 보기
    const viewTestDetails = (test) => {
      selectedTest.value = test
      showTestDialog.value = true
    }

    // URL 포맷팅 (도메인만 표시)
    const formatUrl = (url) => {
      try {
        const urlObj = new URL(url)
        return urlObj.hostname + urlObj.pathname.substring(0, 30) + (urlObj.pathname.length > 30 ? '...' : '')
      } catch {
        return url.substring(0, 40) + (url.length > 40 ? '...' : '')
      }
    }

    // 날짜 포맷팅
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      const now = new Date()
      const diff = now - date
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(diff / 3600000)
      const days = Math.floor(diff / 86400000)

      if (minutes < 1) return '방금 전'
      if (minutes < 60) return `${minutes}분 전`
      if (hours < 24) return `${hours}시간 전`
      if (days < 7) return `${days}일 전`
      
      return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    }

    // 날짜 시간 포맷팅
    const formatDateTime = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }

    // 상태에 따른 색상 반환
    const getStatusColor = (successRate) => {
      if (successRate >= 95) return 'success'
      if (successRate >= 80) return 'warning'
      return 'error'
    }

    // 상태에 따른 아이콘 반환
    const getStatusIcon = (successRate) => {
      if (successRate >= 95) return 'mdi-check-circle'
      if (successRate >= 80) return 'mdi-alert-circle'
      return 'mdi-close-circle'
    }

    // 실시간 그래프 그리기 함수
    const drawRealtimeChart = (canvas, data, color, label, maxValue = null) => {
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      const width = canvas.width
      const height = canvas.height

      // 캔버스 초기화
      ctx.clearRect(0, 0, width, height)

      if (!data || data.length === 0) return

      // 최대 30개 데이터 포인트만 표시
      const displayData = data.slice(-30)
      if (displayData.length < 1) return

      // Y축 범위 계산
      const values = displayData.map(d => parseFloat(d) || 0)
      const minVal = 0
      const maxVal = maxValue || Math.max(...values, 1) || 1
      const range = maxVal - minVal || 1

      // 패딩
      const padding = 4
      const chartWidth = width - padding * 2
      const chartHeight = height - padding * 2

      // 그리드 라인
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
      ctx.lineWidth = 1
      for (let i = 0; i <= 3; i++) {
        const y = padding + (chartHeight / 3) * i
        ctx.beginPath()
        ctx.moveTo(padding, y)
        ctx.lineTo(width - padding, y)
        ctx.stroke()
      }

      // 데이터가 1개일 때는 점만 표시
      if (displayData.length === 1) {
        const x = padding + chartWidth / 2
        const y = padding + chartHeight - ((parseFloat(displayData[0]) - minVal) / range) * chartHeight
        
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(x, y, 3, 0, Math.PI * 2)
        ctx.fill()
        return
      }

      // 데이터 라인 그리기
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()

      displayData.forEach((value, index) => {
        const x = padding + (chartWidth / (displayData.length - 1 || 1)) * index
        const y = padding + chartHeight - ((parseFloat(value) - minVal) / range) * chartHeight

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })

      ctx.stroke()

      // 포인트 그리기
      ctx.fillStyle = color
      displayData.forEach((value, index) => {
        const x = padding + (chartWidth / (displayData.length - 1 || 1)) * index
        const y = padding + chartHeight - ((parseFloat(value) - minVal) / range) * chartHeight

        ctx.beginPath()
        ctx.arc(x, y, 2.5, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    // 실시간 데이터 수집 및 그래프 업데이트
    const collectRealtimeData = () => {
      if (!isRunning.value) return

      const currentErrorRate = parseFloat(errorRate.value) || 0
      const currentP95Latency = p95Latency.value || 0

      // 데이터 추가
      realtimeData.value.errorRate.push(currentErrorRate)
      realtimeData.value.p95Latency.push(currentP95Latency)
      realtimeData.value.timestamps.push(Date.now())

      // 최대 30개 데이터만 유지 (약 1분간의 데이터, 2초 간격)
      if (realtimeData.value.errorRate.length > 30) {
        realtimeData.value.errorRate.shift()
        realtimeData.value.p95Latency.shift()
        realtimeData.value.timestamps.shift()
      }

      // 그래프 업데이트
      nextTick(() => {
        if (errorRateChart.value && realtimeData.value.errorRate.length > 0) {
          const maxErrorRate = Math.max(...realtimeData.value.errorRate, 100, 1)
          drawRealtimeChart(errorRateChart.value, realtimeData.value.errorRate, '#ffffff', 'Error Rate', maxErrorRate)
        }

        if (p95LatencyChart.value && realtimeData.value.p95Latency.length > 0) {
          const maxLatency = Math.max(...realtimeData.value.p95Latency, 1000, 1)
          drawRealtimeChart(p95LatencyChart.value, realtimeData.value.p95Latency, '#ffffff', 'p95 Latency', maxLatency)
        }
      })
    }

    // 실시간 업데이트를 위한 interval
    let updateInterval = null

    // 2초 주기로 실시간 통계 업데이트 (테스트 실행 중)
    const startRealTimeUpdate = () => {
      if (updateInterval) {
        clearInterval(updateInterval)
      }
      
      // 실시간 데이터 초기화
      realtimeData.value = {
        errorRate: [],
        p95Latency: [],
        timestamps: []
      }

      // 캔버스 크기 설정
      setupRealtimeCharts()
      
      // 초기 데이터 수집
      collectRealtimeData()

      updateInterval = setInterval(() => {
        if (isRunning.value) {
          collectRealtimeData()
        }
      }, 2000) // 2초 주기
    }

    const stopRealTimeUpdate = () => {
      if (updateInterval) {
        clearInterval(updateInterval)
        updateInterval = null
      }
    }

    watch(() => results.value.length, () => {
      if (hasResults.value && !isRunning.value) {
        nextTick(() => {
          drawChart()
        })
      }
    })

    // 테스트 실행 상태 감시하여 interval 시작/중지
    watch(() => isRunning.value, (newVal) => {
      if (newVal) {
        startRealTimeUpdate()
      } else {
        stopRealTimeUpdate()
      }
    })

    // 캔버스 크기 설정
    const setupRealtimeCharts = () => {
      nextTick(() => {
        if (errorRateChart.value) {
          errorRateChart.value.width = errorRateChart.value.offsetWidth || 200
          errorRateChart.value.height = 80
        }
        if (p95LatencyChart.value) {
          p95LatencyChart.value.width = p95LatencyChart.value.offsetWidth || 200
          p95LatencyChart.value.height = 80
        }
      })
    }

    onMounted(() => {
      window.addEventListener('resize', () => {
        drawChart()
        setupRealtimeCharts()
      })
      loadTestHistory()
      setupRealtimeCharts()
      
      // 경과 시간 업데이트를 위한 interval
      elapsedTimeInterval.value = setInterval(() => {
        // computed가 자동으로 업데이트됨
      }, 1000)

      getTests()
      .then((result) => {
        testHistory.value = result.data
          console.log(result.data);
      })
      .catch((error) => {
          console.error(error);
      });
    })
    
    // 통계 카드가 표시될 때 캔버스 크기 설정
    watch(() => hasResults.value, () => {
      if (hasResults.value) {
        setupRealtimeCharts()
      }
    })

    onUnmounted(() => {
      window.removeEventListener('resize', drawChart)
      stopRealTimeUpdate()
      if (elapsedTimeInterval.value) {
        clearInterval(elapsedTimeInterval.value)
      }
      stopFlag = true
    })

    return {
      panels,
      isRunning,
      config,
      stats,
      logs,
      chartCanvas,
      logContainer,
      errorRateChart,
      p95LatencyChart,
      httpMethods,
      authTypes,
      showBearerToken,
      showBasicPassword,
      showApiKey,
      testHistory,
      showTestDialog,
      selectedTest,
      elapsedTime,
      isValidConfig,
      hasResults,
      successRate,
      failureRate,
      errorRate,
      averageResponseTime,
      p50Latency,
      p95Latency,
      requestsPerSecond,
      progress,
      displayLogs,
      startLoadTest,
      stopLoadTest,
      downloadReport,
      clearResults,
      clearHistory,
      viewTestDetails,
      formatUrl,
      formatDate,
      formatDateTime,
      getStatusColor,
      getStatusIcon,
    }
  }
})
</script>

<style scoped>
.load-test-container {
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
  min-height: 100vh;
  padding: 24px;
}

/* 대시보드 카드 스타일 */
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

.history-card {
  border-left: 4px solid #764ba2;
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

.empty-history {
  padding: 40px;
  text-align: center;
}

.history-list {
  max-height: 400px;
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

/* 다이얼로그 스타일 */
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

.stats-row {
  margin-top: 24px;
}

.stat-card {
  border-radius: 12px;
  transition: box-shadow 0.3s ease;
  cursor: pointer;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.success-card {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
}

.error-card {
  background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
  color: white;
}

.info-card {
  background: linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%);
  color: white;
}

.warning-card {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.error-rate-card {
  background: linear-gradient(135deg, #c94b4b 0%, #4b134f 100%);
  color: white;
}

.p95-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.realtime-chart-container {
  width: 100%;
  height: 80px;
  margin-top: 12px;
  position: relative;
}

.realtime-chart {
  width: 100%;
  height: 100%;
  display: block;
}

.pulse-animation {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}

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

.log-container::-webkit-scrollbar-thumb:hover {
  background: #777;
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

.log-badge.success {
  background-color: #4caf50;
}

.log-badge.error {
  background-color: #f44336;
}

.log-badge.warning {
  background-color: #ff9800;
}

.log-badge.info {
  background-color: #2196f3;
}

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

/* 반응형 디자인 */
@media (max-width: 960px) {
  .button-group {
    flex-direction: column;
  }
  
  .control-btn {
    width: 100%;
  }
  
  .log-time {
    min-width: 100px;
    font-size: 11px;
  }
}

@media (max-width: 600px) {
  .load-test-container {
    padding: 12px;
  }
  
  .stat-card {
    margin-bottom: 12px;
  }
}
</style>
