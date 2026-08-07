<template>
  <main class="login-page">
    <LocaleSwitcher class="page-locale" />
    <section class="login-card" aria-labelledby="login-title">
      <div class="brand-area">
        <div class="brand-mark" aria-hidden="true">
          <span class="brand-bar brand-bar--one"></span>
          <span class="brand-bar brand-bar--two"></span>
          <span class="brand-bar brand-bar--three"></span>
        </div>
        <strong>LoadSight</strong>
      </div>

      <div class="login-heading">
        <span class="eyebrow">{{ $t('auth.tagline') }}</span>
        <p>{{ $t('auth.description') }}</p>
      </div>

      <div v-if="registered" class="success-message" role="status">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M8 12l2.5 2.5L16 9" />
        </svg>
        {{ $t('auth.registered') }}
      </div>

      <form class="login-form" novalidate @submit.prevent="handleSubmit">
        <label class="field">
          <span>{{ $t('auth.email') }}</span>
          <span class="input-wrap">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 6h16v12H4zM4 7l8 6 8-6" />
            </svg>
            <input
              v-model.trim="form.email"
              type="email"
              name="email"
              autocomplete="username"
              :placeholder="$t('auth.emailPlaceholder')"
              :aria-invalid="Boolean(fieldErrors.email)"
              :aria-describedby="fieldErrors.email ? 'email-error' : undefined"
              @input="clearError('email')"
            />
          </span>
          <small v-if="fieldErrors.email" id="email-error" class="field-error">
            {{ fieldErrors.email }}
          </small>
        </label>

        <label class="field">
          <span>{{ $t('auth.password') }}</span>
          <span class="input-wrap">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="5" y="10" width="14" height="10" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              name="password"
              autocomplete="current-password"
              :placeholder="$t('auth.passwordPlaceholder')"
              :aria-invalid="Boolean(fieldErrors.password)"
              :aria-describedby="fieldErrors.password ? 'password-error' : undefined"
              @input="clearError('password')"
            />
            <button
              class="password-toggle"
              type="button"
              :aria-label="showPassword ? $t('auth.hidePassword') : $t('auth.showPassword')"
              @click="showPassword = !showPassword"
            >
              <svg v-if="showPassword" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z" />
                <circle cx="12" cy="12" r="2.5" />
              </svg>
              <svg v-else viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 3l18 18M10.6 6.2A9.4 9.4 0 0 1 12 6c6 0 9.5 6 9.5 6a16 16 0 0 1-2.1 2.8M6.2 6.2C3.8 8 2.5 12 2.5 12s3.5 6 9.5 6c1 0 2-.2 2.8-.5M9.9 9.9a3 3 0 0 0 4.2 4.2" />
              </svg>
            </button>
          </span>
          <small v-if="fieldErrors.password" id="password-error" class="field-error">
            {{ fieldErrors.password }}
          </small>
        </label>

        <div v-if="submitError" class="submit-error" role="alert">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v6M12 17h.01" />
          </svg>
          {{ submitError }}
        </div>

        <button class="login-button" type="submit" :disabled="isLoading">
          <span v-if="isLoading" class="spinner" aria-hidden="true"></span>
          {{ isLoading ? $t('auth.submitting') : $t('auth.submit') }}
          <svg v-if="!isLoading" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 12h14M14 7l5 5-5 5" />
          </svg>
        </button>
      </form>

      <p class="signup-link">
        {{ $t('auth.noAccount') }}
        <router-link to="/signup">{{ $t('auth.signup') }}</router-link>
      </p>

      <div class="demo-box">
        <div>
          <strong>{{ $t('auth.demoAccount') }}</strong>
          <span>{{ demoEmail }} / {{ demoPassword }}</span>
        </div>
        <button type="button" @click="fillDemoAccount">{{ $t('auth.fillDemo') }}</button>
      </div>

      <p class="security-note">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3l7 3v5c0 4.6-2.9 8.4-7 10-4.1-1.6-7-5.4-7-10V6z" />
          <path d="M9.5 12l1.7 1.7 3.8-4" />
        </svg>
        {{ $t('auth.security') }}
      </p>
    </section>

    <p class="login-footer">{{ $t('footer') }}</p>
  </main>
</template>

<script>
import { mapGetters } from 'vuex';
import { DEMO_EMAIL, DEMO_PASSWORD } from '../api/authApi';
import LocaleSwitcher from '../components/common/LocaleSwitcher.vue';

export default {
  name: 'LoginView',
  components: {
    LocaleSwitcher
  },
  data() {
    return {
      form: {
        email: '',
        password: ''
      },
      fieldErrors: {
        email: '',
        password: ''
      },
      submitError: '',
      showPassword: false,
      demoEmail: DEMO_EMAIL,
      demoPassword: DEMO_PASSWORD
    };
  },
  computed: {
    ...mapGetters('auth', ['isLoading']),
    registered() {
      return this.$route.query.registered === 'true';
    }
  },
  created() {
    if (typeof this.$route.query.email === 'string') {
      this.form.email = this.$route.query.email;
    }
  },
  methods: {
    clearError(field) {
      this.fieldErrors[field] = '';
      this.submitError = '';
    },
    validate() {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      this.fieldErrors.email = !this.form.email
        ? this.$t('auth.validation.emailRequired')
        : !emailPattern.test(this.form.email)
          ? this.$t('auth.validation.emailInvalid')
          : '';
      this.fieldErrors.password = this.form.password
        ? ''
        : this.$t('auth.validation.passwordRequired');

      return !this.fieldErrors.email && !this.fieldErrors.password;
    },
    fillDemoAccount() {
      this.form.email = this.demoEmail;
      this.form.password = this.demoPassword;
      this.fieldErrors.email = '';
      this.fieldErrors.password = '';
      this.submitError = '';
    },
    async handleSubmit() {
      if (!this.validate()) return;

      this.submitError = '';

      try {
        await this.$store.dispatch('auth/login', { ...this.form });
        const redirect = this.$route.query.redirect;
        await this.$router.replace(
          typeof redirect === 'string' &&
            redirect.startsWith('/') &&
            !redirect.startsWith('//')
            ? redirect
            : '/'
        );
      } catch (error) {
        const status = error?.response?.status;
        this.submitError =
          error?.code === 'INVALID_CREDENTIALS' || status === 401 || status === 403
            ? this.$t('auth.error.invalidCredentials')
            : this.$t('auth.error.unavailable');
      }
    }
  }
};
</script>

<style scoped>
.login-page {
  --login-primary: #2f6bea;
  --login-primary-dark: #2258cb;
  display: grid;
  min-height: 100vh;
  padding: 42px 20px 28px;
  place-items: center;
  color: #172033;
  background:
    radial-gradient(circle at 14% 18%, rgba(47, 107, 234, 0.1), transparent 28%),
    radial-gradient(circle at 88% 82%, rgba(85, 190, 181, 0.1), transparent 27%),
    #f6f8fc;
}

.login-page::before,
.login-page::after {
  position: fixed;
  z-index: 0;
  content: "";
  border: 1px solid rgba(47, 107, 234, 0.08);
  border-radius: 50%;
}

.login-page::before {
  top: -180px;
  left: -130px;
  width: 420px;
  height: 420px;
}

.login-page::after {
  right: -100px;
  bottom: -160px;
  width: 360px;
  height: 360px;
}

.page-locale {
  position: fixed;
  top: 22px;
  right: 24px;
  z-index: 2;
}

.login-card {
  position: relative;
  z-index: 1;
  width: min(100%, 460px);
  padding: 38px 42px 34px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(217, 225, 236, 0.9);
  border-radius: 22px;
  box-shadow: 0 24px 70px rgba(25, 43, 76, 0.11);
}

.brand-area {
  display: flex;
  align-items: center;
  gap: 11px;
  margin-bottom: 34px;
}

.brand-area > strong {
  color: #172033;
  font-size: 21px;
  font-weight: 850;
  letter-spacing: -0.6px;
}

.brand-mark {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 3px;
  width: 36px;
  height: 36px;
  padding: 8px;
  background: linear-gradient(145deg, #3977ee, #2258cb);
  border-radius: 10px;
  box-shadow: 0 7px 16px rgba(47, 107, 234, 0.27);
}

.brand-bar {
  width: 4px;
  background: #ffffff;
  border-radius: 4px;
}

.brand-bar--one {
  height: 8px;
  opacity: 0.72;
}

.brand-bar--two {
  height: 14px;
}

.brand-bar--three {
  height: 11px;
  opacity: 0.86;
}

.login-heading {
  margin-bottom: 28px;
}

.eyebrow {
  display: block;
  margin-bottom: 9px;
  color: var(--login-primary);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.25px;
}

.login-heading h1 {
  margin: 0 0 9px;
  color: #172033;
  font-size: 29px;
  font-weight: 850;
  line-height: 1.25;
  letter-spacing: -1.2px;
}

.login-heading p {
  margin: 0;
  color: #7c899c;
  font-size: 13px;
  line-height: 1.6;
}

.success-message {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 11px 12px;
  margin: -8px 0 20px;
  color: #147747;
  font-size: 11px;
  font-weight: 650;
  line-height: 1.5;
  background: #edf9f3;
  border: 1px solid #c8ebd9;
  border-radius: 9px;
}

.success-message svg {
  flex: 0 0 auto;
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.8;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 7px;
  color: #3a4658;
  font-size: 12px;
  font-weight: 750;
}

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrap > svg {
  position: absolute;
  left: 14px;
  width: 18px;
  height: 18px;
  fill: none;
  stroke: #91a0b4;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.7;
  pointer-events: none;
}

.input-wrap input {
  width: 100%;
  height: 48px;
  padding: 0 44px;
  color: #1d2939;
  font: inherit;
  font-size: 13px;
  font-weight: 550;
  outline: none;
  background: #fbfcfe;
  border: 1px solid #dce3ed;
  border-radius: 10px;
  transition: border-color 160ms ease, box-shadow 160ms ease, background 160ms ease;
}

.input-wrap input::placeholder {
  color: #abb5c3;
  font-weight: 450;
}

.input-wrap input:hover {
  border-color: #c7d1df;
}

.input-wrap input:focus {
  background: #ffffff;
  border-color: var(--login-primary);
  box-shadow: 0 0 0 4px rgba(47, 107, 234, 0.1);
}

.input-wrap input[aria-invalid="true"] {
  border-color: #e05858;
}

.password-toggle {
  position: absolute;
  right: 9px;
  display: grid;
  width: 34px;
  height: 34px;
  padding: 8px;
  color: #8c99aa;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 7px;
  place-items: center;
}

.password-toggle:hover {
  color: #46566c;
  background: #f0f3f8;
}

.password-toggle svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.7;
}

.field-error {
  color: #cf3e3e;
  font-size: 11px;
  font-weight: 600;
}

.submit-error {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 12px;
  margin-top: -3px;
  color: #b73333;
  font-size: 11px;
  font-weight: 650;
  background: #fff2f2;
  border: 1px solid #f5cece;
  border-radius: 9px;
}

.submit-error svg {
  flex: 0 0 auto;
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-width: 1.8;
}

.login-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  height: 49px;
  margin-top: 4px;
  color: #ffffff;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  background: linear-gradient(135deg, #3977ee, #2863d9);
  border: 0;
  border-radius: 10px;
  box-shadow: 0 9px 18px rgba(47, 107, 234, 0.2);
  transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease;
}

.login-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #2f6bea, #2258cb);
  box-shadow: 0 11px 22px rgba(47, 107, 234, 0.26);
  transform: translateY(-1px);
}

.login-button:disabled {
  cursor: wait;
  opacity: 0.72;
}

.login-button svg {
  width: 17px;
  height: 17px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
}

.signup-link {
  margin: 19px 0 0;
  color: #7c899c;
  font-size: 11px;
  text-align: center;
}

.signup-link a {
  margin-left: 4px;
  color: var(--login-primary);
  font-weight: 800;
  text-decoration: none;
}

.signup-link a:hover {
  text-decoration: underline;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.45);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 700ms linear infinite;
}

.demo-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 13px;
  margin-top: 18px;
  background: #f5f8fd;
  border: 1px solid #e1e8f2;
  border-radius: 10px;
}

.demo-box div {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}

.demo-box strong {
  color: #425067;
  font-size: 10px;
}

.demo-box span {
  overflow: hidden;
  color: #718097;
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.demo-box button {
  flex: 0 0 auto;
  padding: 6px 9px;
  color: var(--login-primary);
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
  background: #ffffff;
  border: 1px solid #cddbf2;
  border-radius: 7px;
}

.demo-box button:hover {
  background: #edf3ff;
}

.security-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: 20px 0 0;
  color: #97a3b3;
  font-size: 10px;
}

.security-note svg {
  width: 14px;
  height: 14px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.7;
}

.login-footer {
  position: fixed;
  bottom: 17px;
  z-index: 1;
  margin: 0;
  color: #a0aaba;
  font-size: 10px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 560px) {
  .login-page {
    padding: 18px 14px 48px;
    background: #ffffff;
  }

  .login-card {
    padding: 30px 24px;
    border: 0;
    border-radius: 0;
    box-shadow: none;
  }

  .page-locale {
    position: absolute;
    top: 16px;
    right: 16px;
  }

  .brand-area {
    margin-bottom: 40px;
  }

  .login-heading h1 {
    font-size: 27px;
  }

  .demo-box {
    align-items: flex-start;
  }
}

@media (prefers-reduced-motion: reduce) {
  .login-button,
  .input-wrap input {
    transition: none;
  }
}
</style>
