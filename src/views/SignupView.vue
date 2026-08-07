<template>
  <main class="signup-page">
    <LocaleSwitcher class="page-locale" />
    <section class="signup-card" aria-labelledby="signup-title">
      <router-link
        to="/login"
        class="brand-area"
        :aria-label="$t('signup.backToLogin')"
      >
        <span class="brand-mark" aria-hidden="true">
          <i></i><i></i><i></i>
        </span>
        <strong>LoadSight</strong>
      </router-link>

      <header class="signup-heading">
        <span>{{ $t('signup.eyebrow') }}</span>
        <p>{{ $t('signup.description') }}</p>
      </header>

      <form class="signup-form" novalidate @submit.prevent="handleSubmit">
        <label class="field">
          <span>{{ $t('signup.name') }}</span>
          <span class="input-wrap">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="8" r="4" />
              <path d="M4.5 20c.7-4 3.2-6 7.5-6s6.8 2 7.5 6" />
            </svg>
            <input
              v-model.trim="form.name"
              type="text"
              autocomplete="name"
              :placeholder="$t('signup.namePlaceholder')"
              :aria-invalid="Boolean(errors.name)"
              @input="clearError('name')"
            />
          </span>
          <small v-if="errors.name" class="field-error">{{ errors.name }}</small>
        </label>

        <label class="field">
          <span>{{ $t('signup.email') }}</span>
          <span class="input-wrap">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 6h16v12H4zM4 7l8 6 8-6" />
            </svg>
            <input
              v-model.trim="form.email"
              type="email"
              autocomplete="email"
              :placeholder="$t('auth.emailPlaceholder')"
              :aria-invalid="Boolean(errors.email)"
              @input="clearError('email')"
            />
          </span>
          <small v-if="errors.email" class="field-error">{{ errors.email }}</small>
        </label>

        <label class="field">
          <span>{{ $t('signup.password') }}</span>
          <span class="input-wrap">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="5" y="10" width="14" height="10" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              :placeholder="$t('signup.passwordPlaceholder')"
              :aria-invalid="Boolean(errors.password)"
              @input="clearError('password')"
            />
            <button
              type="button"
              class="password-toggle"
              :aria-label="showPassword ? $t('auth.hidePassword') : $t('auth.showPassword')"
              @click="showPassword = !showPassword"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z" />
                <circle cx="12" cy="12" r="2.5" />
              </svg>
            </button>
          </span>
          <small v-if="errors.password" class="field-error">{{ errors.password }}</small>
          <small v-else class="field-hint">{{ $t('signup.passwordHint') }}</small>
        </label>

        <label class="field">
          <span>{{ $t('signup.passwordConfirm') }}</span>
          <span class="input-wrap">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="5" y="10" width="14" height="10" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
            <input
              v-model="form.passwordConfirm"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              :placeholder="$t('signup.passwordConfirmPlaceholder')"
              :aria-invalid="Boolean(errors.passwordConfirm)"
              @input="clearError('passwordConfirm')"
            />
          </span>
          <small v-if="errors.passwordConfirm" class="field-error">
            {{ errors.passwordConfirm }}
          </small>
        </label>

        <label class="agreement">
          <input v-model="form.agreed" type="checkbox" @change="clearError('agreed')" />
          <span>{{ $t('signup.agreement') }}</span>
        </label>
        <small v-if="errors.agreed" class="field-error agreement-error">
          {{ $t('signup.agreementRequired') }}
        </small>

        <div v-if="submitError" class="submit-error" role="alert">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v6M12 17h.01" />
          </svg>
          {{ submitError }}
        </div>

        <button class="signup-button" type="submit" :disabled="submitting">
          <span v-if="submitting" class="spinner" aria-hidden="true"></span>
          {{ submitting ? $t('signup.submitting') : $t('signup.submit') }}
          <svg v-if="!submitting" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 12h14M14 7l5 5-5 5" />
          </svg>
        </button>
      </form>

      <p class="login-link">
        {{ $t('signup.hasAccount') }}
        <router-link to="/login">{{ $t('signup.login') }}</router-link>
      </p>
    </section>

    <p class="page-footer">{{ $t('footer') }}</p>
  </main>
</template>

<script>
import { register } from '../api/authApi';
import LocaleSwitcher from '../components/common/LocaleSwitcher.vue';

export default {
  name: 'SignupView',
  components: {
    LocaleSwitcher
  },
  data() {
    return {
      form: {
        name: '',
        email: '',
        password: '',
        passwordConfirm: '',
        agreed: false
      },
      errors: {
        name: '',
        email: '',
        password: '',
        passwordConfirm: '',
        agreed: ''
      },
      showPassword: false,
      submitting: false,
      submitError: ''
    };
  },
  methods: {
    clearError(field) {
      this.errors[field] = '';
      this.submitError = '';
    },
    validate() {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

      this.errors.name = this.form.name.length >= 2
        ? ''
        : this.$t('signup.validation.name');
      this.errors.email = !this.form.email
        ? this.$t('signup.validation.emailRequired')
        : !emailPattern.test(this.form.email)
          ? this.$t('signup.validation.emailInvalid')
          : '';
      this.errors.password = !this.form.password
        ? this.$t('signup.validation.passwordRequired')
        : !passwordPattern.test(this.form.password)
          ? this.$t('signup.validation.passwordInvalid')
          : '';
      this.errors.passwordConfirm = !this.form.passwordConfirm
        ? this.$t('signup.validation.passwordConfirmRequired')
        : this.form.password !== this.form.passwordConfirm
          ? this.$t('signup.validation.passwordMismatch')
          : '';
      this.errors.agreed = this.form.agreed ? '' : 'required';

      return !Object.values(this.errors).some(Boolean);
    },
    async handleSubmit() {
      if (!this.validate()) return;

      this.submitting = true;
      this.submitError = '';

      try {
        await register(this.form);
        await this.$router.replace({
          name: 'Login',
          query: { registered: 'true', email: this.form.email }
        });
      } catch (error) {
        this.submitError = error?.response?.status === 409
          ? this.$t('signup.error.duplicate')
          : this.$t('signup.error.unavailable');
      } finally {
        this.submitting = false;
      }
    }
  }
};
</script>

<style scoped>
.signup-page {
  --signup-primary: #2f6bea;
  display: grid;
  min-height: 100vh;
  padding: 34px 20px 48px;
  place-items: center;
  color: #172033;
  background:
    radial-gradient(circle at 13% 15%, rgba(47, 107, 234, 0.1), transparent 27%),
    radial-gradient(circle at 87% 84%, rgba(85, 190, 181, 0.1), transparent 26%),
    #f6f8fc;
}

.page-locale {
  position: fixed;
  top: 22px;
  right: 24px;
  z-index: 2;
}

.signup-card {
  position: relative;
  z-index: 1;
  width: min(100%, 500px);
  padding: 34px 42px 30px;
  background: rgba(255, 255, 255, 0.97);
  border: 1px solid rgba(217, 225, 236, 0.9);
  border-radius: 22px;
  box-shadow: 0 24px 70px rgba(25, 43, 76, 0.11);
}

.brand-area {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 27px;
  color: #172033;
  text-decoration: none;
}

.brand-area strong {
  font-size: 20px;
  font-weight: 850;
  letter-spacing: -0.6px;
}

.brand-mark {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 3px;
  width: 34px;
  height: 34px;
  padding: 8px;
  background: linear-gradient(145deg, #3977ee, #2258cb);
  border-radius: 10px;
  box-shadow: 0 7px 16px rgba(47, 107, 234, 0.27);
}

.brand-mark i {
  width: 4px;
  height: 8px;
  background: #ffffff;
  border-radius: 4px;
  opacity: 0.75;
}

.brand-mark i:nth-child(2) {
  height: 14px;
  opacity: 1;
}

.brand-mark i:nth-child(3) {
  height: 11px;
  opacity: 0.86;
}

.signup-heading {
  margin-bottom: 23px;
}

.signup-heading > span {
  display: block;
  margin-bottom: 7px;
  color: var(--signup-primary);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.25px;
}

.signup-heading h1 {
  margin: 0 0 7px;
  font-size: 27px;
  font-weight: 850;
  line-height: 1.25;
  letter-spacing: -1.1px;
}

.signup-heading p {
  margin: 0;
  color: #7c899c;
  font-size: 12px;
}

.signup-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #3a4658;
  font-size: 11px;
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
  width: 17px;
  height: 17px;
  fill: none;
  stroke: #91a0b4;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.7;
  pointer-events: none;
}

.input-wrap input {
  width: 100%;
  height: 44px;
  padding: 0 43px;
  color: #1d2939;
  font: inherit;
  font-size: 12px;
  font-weight: 550;
  outline: none;
  background: #fbfcfe;
  border: 1px solid #dce3ed;
  border-radius: 10px;
  transition: border-color 160ms ease, box-shadow 160ms ease;
}

.input-wrap input::placeholder {
  color: #abb5c3;
  font-weight: 450;
}

.input-wrap input:focus {
  background: #ffffff;
  border-color: var(--signup-primary);
  box-shadow: 0 0 0 4px rgba(47, 107, 234, 0.1);
}

.input-wrap input[aria-invalid="true"] {
  border-color: #e05858;
}

.password-toggle {
  position: absolute;
  right: 9px;
  display: grid;
  width: 32px;
  height: 32px;
  padding: 7px;
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
  width: 17px;
  height: 17px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.7;
}

.field-error,
.field-hint {
  font-size: 10px;
  font-weight: 600;
}

.field-error {
  color: #cf3e3e;
}

.field-hint {
  color: #96a2b2;
}

.agreement {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 2px;
  color: #69768a;
  font-size: 10px;
  line-height: 1.5;
  cursor: pointer;
}

.agreement input {
  width: 15px;
  height: 15px;
  margin: 0;
  accent-color: var(--signup-primary);
}

.agreement-error {
  margin-top: -8px;
}

.submit-error {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 12px;
  color: #b73333;
  font-size: 10px;
  font-weight: 650;
  background: #fff2f2;
  border: 1px solid #f5cece;
  border-radius: 9px;
}

.submit-error svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-width: 1.8;
}

.signup-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  height: 47px;
  margin-top: 2px;
  color: #ffffff;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  background: linear-gradient(135deg, #3977ee, #2863d9);
  border: 0;
  border-radius: 10px;
  box-shadow: 0 9px 18px rgba(47, 107, 234, 0.2);
  transition: transform 160ms ease, box-shadow 160ms ease;
}

.signup-button:hover:not(:disabled) {
  box-shadow: 0 11px 22px rgba(47, 107, 234, 0.26);
  transform: translateY(-1px);
}

.signup-button:disabled {
  cursor: wait;
  opacity: 0.72;
}

.signup-button svg {
  width: 17px;
  height: 17px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.45);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 700ms linear infinite;
}

.login-link {
  margin: 18px 0 0;
  color: #7c899c;
  font-size: 11px;
  text-align: center;
}

.login-link a {
  margin-left: 4px;
  color: var(--signup-primary);
  font-weight: 800;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}

.page-footer {
  position: fixed;
  bottom: 17px;
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
  .signup-page {
    padding: 20px 14px 48px;
    background: #ffffff;
  }

  .signup-card {
    padding: 26px 22px;
    border: 0;
    border-radius: 0;
    box-shadow: none;
  }

  .page-locale {
    position: absolute;
    top: 16px;
    right: 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .signup-button,
  .input-wrap input {
    transition: none;
  }
}
</style>
