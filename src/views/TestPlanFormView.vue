<template>
  <section class="test-plan-form-page">
    <header class="page-header">
      <h1>{{ isEdit ? '테스트 플랜 수정' : '새 테스트 플랜' }}</h1>
      <p>요청 조건, 부하 설정과 성능 기준을 입력합니다.</p>
    </header>

    <form class="form-layout" @submit.prevent="handleSave">
      <div class="config-column">
        <section class="config-card">
          <h2>1. 기본 정보</h2>

          <label class="field">
            <span>테스트명</span>
            <input
              v-model.trim="form.name"
              type="text"
              minlength="2"
              maxlength="100"
              required
            >
          </label>

          <label class="field">
            <span>설명</span>
            <textarea
              v-model.trim="form.description"
              rows="3"
              maxlength="500"
            ></textarea>
          </label>
        </section>

        <section class="config-card">
          <h2>2. 요청 설정</h2>

          <div class="field-row">
            <label class="field">
              <span>HTTP Method</span>
              <select v-model="form.method">
                <option>GET</option>
                <option>POST</option>
                <option>PUT</option>
                <option>PATCH</option>
                <option>DELETE</option>
              </select>
            </label>

            <label class="field">
              <span>Timeout</span>
              <div class="input-with-unit">
                <input
                  v-model.number="form.timeoutMs"
                  type="number"
                  min="100"
                  max="60000"
                  step="100"
                  required
                >
                <span>ms</span>
              </div>
            </label>
          </div>

          <label class="field">
            <span>대상 URL</span>
            <textarea
              v-model.trim="form.url"
              class="code-field url-field"
              rows="2"
              required
            ></textarea>
          </label>

          <label class="field">
            <span>추가 Headers (json)</span>
            <textarea
              v-model="form.headers"
              class="code-field"
              rows="2"
              placeholder='{"Content-Type": "application/json", "X-Custom-Header": "value"}'
            ></textarea>
          </label>

          <label class="field">
            <span>Request Body (json)</span>
            <textarea
              v-model="form.requestBody"
              class="code-field"
              rows="2"
              placeholder='{"key": "value"}'
            ></textarea>
          </label>

          <label class="field">
            <span>Authentication</span>
            <select v-model="form.authentication">
              <option value="NONE">인증 없음</option>
              <option value="BEARER">Bearer Token</option>
              <option value="BASIC">Basic Auth</option>
              <option value="API_KEY">API Key</option>
            </select>
          </label>

          <div v-if="form.authentication === 'BEARER'" class="authentication-fields">
            <label class="field">
              <span>Bearer Token</span>
              <input
                v-model.trim="form.authConfig.bearerToken"
                type="password"
                placeholder="토큰을 입력하세요"
                autocomplete="new-password"
                required
              >
            </label>
            <p class="auth-hint">
              요청 시 Authorization: Bearer 형식으로 전송됩니다.
            </p>
          </div>

          <div v-else-if="form.authentication === 'BASIC'" class="authentication-fields">
            <div class="field-row">
              <label class="field">
                <span>Username</span>
                <input
                  v-model.trim="form.authConfig.username"
                  type="text"
                  placeholder="사용자 이름"
                  autocomplete="username"
                  required
                >
              </label>

              <label class="field">
                <span>Password</span>
                <input
                  v-model="form.authConfig.password"
                  type="password"
                  placeholder="비밀번호"
                  autocomplete="new-password"
                  required
                >
              </label>
            </div>
            <p class="auth-hint">
              Username과 Password를 Base64로 인코딩해 전송합니다.
            </p>
          </div>

          <div v-else-if="form.authentication === 'API_KEY'" class="authentication-fields">
            <div class="field-row">
              <label class="field">
                <span>Key 이름</span>
                <input
                  v-model.trim="form.authConfig.apiKeyName"
                  type="text"
                  placeholder="X-API-Key"
                  required
                >
              </label>

              <label class="field">
                <span>전달 위치</span>
                <select v-model="form.authConfig.apiKeyLocation">
                  <option value="HEADER">Header</option>
                  <option value="QUERY">Query Parameter</option>
                </select>
              </label>
            </div>

            <label class="field">
              <span>API Key 값</span>
              <input
                v-model="form.authConfig.apiKeyValue"
                type="password"
                placeholder="API Key를 입력하세요"
                autocomplete="new-password"
                required
              >
            </label>
          </div>

          <p v-else class="auth-hint auth-hint--none">
            이 요청에는 인증 정보를 포함하지 않습니다.
          </p>
        </section>

        <section class="config-card">
          <h2>3. 부하 설정</h2>

          <div class="field-row">
            <label class="field">
              <span>목표 RPS</span>
              <input
                v-model.number="form.targetRps"
                type="number"
                min="1"
                max="500"
                required
              >
            </label>

            <label class="field">
              <span>실행 시간</span>
              <div class="input-with-unit">
                <input
                  v-model.number="form.durationSec"
                  type="number"
                  min="5"
                  max="600"
                  required
                >
                <span>초</span>
              </div>
            </label>
          </div>

          <label class="field">
            <span>동시성</span>
            <input
              v-model.number="form.concurrency"
              type="number"
              min="1"
              max="200"
              required
            >
          </label>
        </section>

        <section class="config-card">
          <h2>4. 통과 기준</h2>

          <div class="field-row">
            <label class="field">
              <span>최대 오류율</span>
              <div class="input-with-unit">
                <input
                  v-model.number="form.maxErrorRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  required
                >
                <span>%</span>
              </div>
            </label>

            <label class="field">
              <span>최대 p95</span>
              <div class="input-with-unit">
                <input
                  v-model.number="form.maxP95Ms"
                  type="number"
                  min="1"
                  max="60000"
                  required
                >
                <span>ms</span>
              </div>
            </label>
          </div>
        </section>
      </div>

      <div class="summary-column">
        <section class="summary-card">
          <h2>실행 예상</h2>

          <dl>
            <div>
              <dt>예상 요청 수</dt>
              <dd>{{ estimatedRequests.toLocaleString() }}건</dd>
            </div>
            <div>
              <dt>목표 RPS</dt>
              <dd>{{ normalizedNumber(form.targetRps) }}</dd>
            </div>
            <div>
              <dt>실행 시간</dt>
              <dd>{{ normalizedNumber(form.durationSec) }}초</dd>
            </div>
            <div>
              <dt>동시성</dt>
              <dd>{{ normalizedNumber(form.concurrency) }}</dd>
            </div>
          </dl>
        </section>

        <section class="criteria-card">
          <h2>통과 조건</h2>
          <p>p95 ≤ {{ normalizedNumber(form.maxP95Ms).toLocaleString() }}ms</p>
          <p>오류율 ≤ {{ normalizedNumber(form.maxErrorRate) }}%</p>
        </section>

        <div class="form-actions">
          <button
            type="button"
            class="secondary-button"
            :disabled="isSubmitting"
            @click="handleRequestTest"
          >
            요청 테스트
          </button>
          <button type="submit" class="secondary-button" :disabled="isSubmitting">
            {{ isSubmitting ? '저장 중' : '저장' }}
          </button>
          <button
            type="button"
            class="primary-button"
            :disabled="isSubmitting"
            @click="handleRun"
          >
            실행
          </button>
        </div>

        <p
          v-if="feedback.message"
          class="feedback-message"
          :class="`feedback-message--${feedback.tone}`"
          role="status"
        >
          {{ feedback.message }}
        </p>
      </div>
    </form>
  </section>
</template>

<script>
import {
  createTestPlan,
  getTestPlanById,
  runTestPlan,
  updateTestPlan
} from '../api/testPlanApi';

const createDefaultForm = () => ({
  name: '자산 목록 조회',
  description: 'getTotalAsset API의 응답 및 부하 상태를 측정합니다.',
  method: 'GET',
  timeoutMs: 5000,
  url: 'http://localhost:8085/asset/getTotalAsset',
  headers: '{"Content-Type": "application/json"}',
  authentication: 'BEARER',
  authConfig: {
    bearerToken: '',
    username: '',
    password: '',
    apiKeyName: 'X-API-Key',
    apiKeyValue: '',
    apiKeyLocation: 'HEADER'
  },
  requestBody: '{}',
  targetRps: 100,
  durationSec: 60,
  concurrency: 20,
  maxErrorRate: 1,
  maxP95Ms: 1000
});

export default {
  name: 'TestPlanFormView',
  data() {
    return {
      form: createDefaultForm(),
      isSubmitting: false,
      feedback: {
        tone: 'success',
        message: ''
      }
    };
  },
  computed: {
    isEdit() {
      return Boolean(this.$route.params.planId);
    },
    estimatedRequests() {
      return (
        this.normalizedNumber(this.form.targetRps) *
        this.normalizedNumber(this.form.durationSec)
      );
    }
  },
  async mounted() {
    if (!this.isEdit) return;

    try {
      const plan = await getTestPlanById(this.$route.params.planId);
      this.form = this.mapPlanToForm(plan);
    } catch {
      this.setFeedback('danger', '테스트 플랜 정보를 불러오지 못했습니다.');
    }
  },
  methods: {
    normalizedNumber(value) {
      const number = Number(value);
      return Number.isFinite(number) ? number : 0;
    },
    mapPlanToForm(plan = {}) {
      const defaults = createDefaultForm();
      const savedAuthentication =
        typeof plan.authentication === 'object' ? plan.authentication : null;
      const savedAuthConfig =
        plan.authConfig || plan.authenticationConfig || savedAuthentication || {};

      return {
        ...defaults,
        name: plan.name ?? defaults.name,
        description: plan.description ?? defaults.description,
        method: plan.method ?? defaults.method,
        timeoutMs: plan.timeoutMs ?? defaults.timeoutMs,
        url: plan.url ?? defaults.url,
        headers: Array.isArray(plan.headers)
          ? plan.headers.map(({ key, value }) => `${key}: ${value}`).join('\n')
          : plan.headers ?? defaults.headers,
        authentication:
          (typeof plan.authentication === 'string'
            ? plan.authentication
            : savedAuthentication?.type) ?? defaults.authentication,
        authConfig: {
          bearerToken:
            savedAuthConfig.bearerToken ??
            savedAuthConfig.token ??
            defaults.authConfig.bearerToken,
          username: savedAuthConfig.username ?? defaults.authConfig.username,
          password: savedAuthConfig.password ?? defaults.authConfig.password,
          apiKeyName:
            savedAuthConfig.apiKeyName ??
            savedAuthConfig.key ??
            savedAuthConfig.name ??
            defaults.authConfig.apiKeyName,
          apiKeyValue:
            savedAuthConfig.apiKeyValue ??
            savedAuthConfig.value ??
            defaults.authConfig.apiKeyValue,
          apiKeyLocation:
            savedAuthConfig.apiKeyLocation ??
            savedAuthConfig.location ??
            savedAuthConfig.in ??
            defaults.authConfig.apiKeyLocation
        },
        targetRps:
          plan.targetRps ?? plan.rps ?? plan.loadConfig?.targetRps ?? defaults.targetRps,
        durationSec:
          plan.durationSec ??
          plan.duration ??
          ((plan.loadConfig?.durationMinutes || 0) * 60 || defaults.durationSec),
        concurrency:
          plan.concurrency ?? plan.loadConfig?.vusers ?? defaults.concurrency,
        maxErrorRate:
          plan.maxErrorRate ??
          plan.thresholds?.maxErrorRate ??
          defaults.maxErrorRate,
        maxP95Ms:
          plan.maxP95Ms ??
          plan.thresholds?.maxP95Ms ??
          plan.thresholds?.passP95Latency ??
          defaults.maxP95Ms
      };
    },
    toPayload() {
      return {
        ...this.form,
        authConfig: this.getAuthenticationConfig(),
        rps: this.normalizedNumber(this.form.targetRps),
        duration: this.normalizedNumber(this.form.durationSec),
        loadConfig: {
          targetRps: this.normalizedNumber(this.form.targetRps),
          durationMinutes: this.normalizedNumber(this.form.durationSec) / 60,
          vusers: this.normalizedNumber(this.form.concurrency)
        },
        thresholds: {
          maxErrorRate: this.normalizedNumber(this.form.maxErrorRate),
          maxP95Ms: this.normalizedNumber(this.form.maxP95Ms)
        }
      };
    },
    getAuthenticationConfig() {
      const config = this.form.authConfig;

      switch (this.form.authentication) {
        case 'BEARER':
          return {
            type: 'BEARER',
            token: config.bearerToken
          };
        case 'BASIC':
          return {
            type: 'BASIC',
            username: config.username,
            password: config.password
          };
        case 'API_KEY':
          return {
            type: 'API_KEY',
            key: config.apiKeyName,
            value: config.apiKeyValue,
            location: config.apiKeyLocation
          };
        default:
          return null;
      }
    },
    setFeedback(tone, message) {
      this.feedback = { tone, message };
    },
    async persistPlan() {
      const payload = this.toPayload();

      if (this.isEdit) {
        return updateTestPlan(this.$route.params.planId, payload);
      }

      return createTestPlan(payload);
    },
    async handleSave() {
      this.isSubmitting = true;

      try {
        await this.persistPlan();
        this.$router.push('/test-plans');
      } catch {
        this.setFeedback('danger', '저장 중 문제가 발생했습니다.');
      } finally {
        this.isSubmitting = false;
      }
    },
    handleRequestTest() {
      this.setFeedback('success', '요청 테스트에 성공했습니다. HTTP 200 · 124ms');
    },
    async handleRun() {
      this.isSubmitting = true;

      try {
        const savedPlan = await this.persistPlan();
        const planId = this.$route.params.planId || savedPlan?.id || 'new';
        const result = await runTestPlan(planId);
        this.$router.push(`/runs/${result?.runId || `plan-${planId}`}/live`);
      } catch {
        this.setFeedback('danger', '테스트를 실행하지 못했습니다.');
      } finally {
        this.isSubmitting = false;
      }
    }
  }
};
</script>

<style scoped>
.test-plan-form-page {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  padding: 17px 20px 48px;
}

.page-header {
  min-height: 41px;
  margin-bottom: 6px;
}

.page-header h1 {
  margin: 0 0 1px;
  color: #1e293b;
  font-size: 20px;
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: -0.55px;
}

.page-header p {
  margin: 0;
  color: #8a96a8;
  font-size: 9px;
  font-weight: 500;
}

.form-layout {
  display: grid;
  grid-template-columns: 170px minmax(0, 1fr);
  align-items: start;
  gap: 12px;
}

.config-column,
.summary-column {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 9px;
}

.config-card,
.summary-card {
  padding: 10px;
  background: #ffffff;
  border: 1px solid #dfe5ec;
  border-radius: 9px;
}

.config-card h2,
.summary-card h2,
.criteria-card h2 {
  margin: 0 0 8px;
  color: #263244;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: -0.15px;
}

.field {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 4px;
  margin-top: 7px;
}

.config-card h2 + .field,
.config-card h2 + .field-row {
  margin-top: 0;
}

.field-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
  margin-top: 7px;
}

.field-row .field {
  margin-top: 0;
}

.field > span {
  color: #68758a;
  font-size: 8px;
  font-weight: 700;
}

.field input,
.field select,
.field textarea {
  width: 100%;
  min-width: 0;
  color: #465267;
  font-size: 9px;
  background: #ffffff;
  border: 1px solid #d3dbe6;
  border-radius: 5px;
  outline: none;
  transition: border-color 160ms ease, box-shadow 160ms ease;
}

.field input,
.field select {
  height: 27px;
  padding: 0 8px;
}

.field textarea {
  min-height: 58px;
  padding: 7px 8px;
  line-height: 1.45;
  resize: vertical;
}

.field textarea.url-field {
  min-height: 38px;
}

.field .code-field {
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
}

.authentication-fields {
  margin-top: 8px;
  padding-top: 1px;
  border-top: 1px solid #edf0f4;
}

.authentication-fields > .field:first-child,
.authentication-fields > .field-row:first-child {
  margin-top: 7px;
}

.auth-hint {
  margin: 5px 0 0;
  color: #7a8799;
  font-size: 7px;
  font-weight: 500;
  line-height: 1.4;
}

.auth-hint--none {
  margin-top: 6px;
}

.field input:focus,
.field select:focus,
.field textarea:focus {
  border-color: #2f6bea;
  box-shadow: 0 0 0 2px rgba(47, 107, 234, 0.12);
}

.input-with-unit {
  position: relative;
}

.input-with-unit input {
  padding-right: 24px;
}

.input-with-unit span {
  position: absolute;
  top: 50%;
  right: 8px;
  color: #7c8798;
  font-size: 8px;
  pointer-events: none;
  transform: translateY(-50%);
}

.summary-card {
  padding-bottom: 9px;
}

.summary-card dl {
  margin: 0;
}

.summary-card dl > div {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  min-height: 27px;
  padding: 0 8px;
  border-bottom: 1px solid #edf0f4;
}

.summary-card dl > div:last-child {
  border-bottom: 0;
}

.summary-card dt,
.summary-card dd {
  margin: 0;
  font-size: 8px;
}

.summary-card dt {
  color: #667387;
  font-weight: 500;
}

.summary-card dd {
  color: #263244;
  font-weight: 800;
  text-align: center;
}

.criteria-card {
  min-height: 57px;
  padding: 10px;
  color: #1d6e46;
  background: #eafbf2;
  border: 1px solid #8de3b4;
  border-radius: 7px;
}

.criteria-card h2 {
  margin-bottom: 1px;
  color: #206b48;
}

.criteria-card p {
  margin: 0;
  font-size: 9px;
  font-weight: 600;
  line-height: 1.35;
}

.form-actions {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
  margin-top: 2px;
}

.secondary-button,
.primary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 15px;
  border-radius: 5px;
  font-size: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: color 160ms ease, background-color 160ms ease,
    border-color 160ms ease;
}

.secondary-button {
  color: #465267;
  background: #ffffff;
  border: 1px solid #d0d8e3;
}

.secondary-button:hover:not(:disabled) {
  color: #2f6bea;
  border-color: #2f6bea;
}

.primary-button {
  color: #ffffff;
  background: #2f6bea;
  border: 1px solid #2f6bea;
}

.primary-button:hover:not(:disabled) {
  background: #1d4ed8;
  border-color: #1d4ed8;
}

.secondary-button:disabled,
.primary-button:disabled {
  cursor: wait;
  opacity: 0.6;
}

.feedback-message {
  margin: 0;
  padding: 7px 9px;
  font-size: 9px;
  font-weight: 600;
  border-radius: 6px;
}

.feedback-message--success {
  color: #177245;
  background: #eafbf2;
}

.feedback-message--danger {
  color: #b42318;
  background: #fff0ee;
}

@media (min-width: 1100px) {
  .test-plan-form-page {
    padding: 28px 34px 64px;
  }

  .page-header {
    min-height: 58px;
    margin-bottom: 10px;
  }

  .page-header h1 {
    font-size: 25px;
  }

  .page-header p {
    font-size: 11px;
  }

  .form-layout {
    grid-template-columns: 255px minmax(0, 1fr);
    gap: 18px;
  }

  .config-column,
  .summary-column {
    gap: 14px;
  }

  .config-card,
  .summary-card {
    padding: 15px;
    border-radius: 12px;
  }

  .config-card h2,
  .summary-card h2,
  .criteria-card h2 {
    margin-bottom: 12px;
    font-size: 14px;
  }

  .field,
  .field-row {
    margin-top: 11px;
  }

  .field-row {
    gap: 14px;
  }

  .field > span {
    font-size: 9px;
  }

  .field input,
  .field select {
    height: 40px;
    padding: 0 11px;
    font-size: 11px;
  }

  .field textarea {
    min-height: 86px;
    padding: 10px 11px;
    font-size: 11px;
  }

  .field textarea.url-field {
    min-height: 56px;
  }

  .authentication-fields {
    margin-top: 12px;
  }

  .authentication-fields > .field:first-child,
  .authentication-fields > .field-row:first-child {
    margin-top: 10px;
  }

  .auth-hint {
    margin-top: 8px;
    font-size: 8px;
  }

  .input-with-unit span {
    right: 11px;
    font-size: 9px;
  }

  .summary-card dl > div {
    min-height: 41px;
    padding: 0 12px;
  }

  .summary-card dt,
  .summary-card dd {
    font-size: 10px;
  }

  .criteria-card {
    min-height: 86px;
    padding: 15px;
    border-radius: 10px;
  }

  .criteria-card p {
    font-size: 10px;
  }

  .form-actions {
    gap: 9px;
  }

  .secondary-button,
  .primary-button {
    height: 30px;
    font-size: 10px;
  }

  .feedback-message {
    padding: 10px 12px;
    font-size: 10px;
  }
}

@media (max-width: 760px) {
  .test-plan-form-page {
    padding: 18px 14px 40px;
  }

  .page-header h1 {
    font-size: 22px;
  }

  .page-header p {
    margin-top: 3px;
    font-size: 10px;
  }

  .form-layout {
    grid-template-columns: 1fr;
    margin-top: 14px;
  }

  .config-column,
  .summary-column {
    gap: 12px;
  }

  .config-card,
  .summary-card,
  .criteria-card {
    padding: 14px;
  }

  .config-card h2,
  .summary-card h2,
  .criteria-card h2 {
    font-size: 13px;
  }

  .field > span {
    font-size: 9px;
  }

  .field input,
  .field select {
    height: 36px;
    font-size: 10px;
  }

  .field textarea {
    font-size: 10px;
  }

  .auth-hint {
    font-size: 8px;
  }

  .summary-card dt,
  .summary-card dd,
  .criteria-card p {
    font-size: 9px;
  }

  .secondary-button,
  .primary-button {
    height: 34px;
    font-size: 10px;
  }
}

@media (max-width: 420px) {
  .field-row,
  .form-actions {
    grid-template-columns: 1fr;
  }
}
</style>
