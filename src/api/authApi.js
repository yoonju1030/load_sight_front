import common from '../utils/common';

const DEMO_EMAIL = 'admin@loadsight.io';
const DEMO_PASSWORD = 'LoadSight!123';
const mockAccounts = new Map();

function normalizeAuthResponse(response, credentials) {
  const payload = response?.data?.data ?? response?.data ?? response;

  return {
    token: payload?.accessToken ?? payload?.token ?? null,
    user: payload?.user ?? {
      name: payload?.name ?? 'LoadSight 관리자',
      email: payload?.email ?? credentials.email
    }
  };
}

function canUseDemoLogin(error) {
  const mockSetting = process.env.VUE_APP_ENABLE_MOCK_AUTH;
  const mockEnabled =
    mockSetting === 'true' ||
    (mockSetting !== 'false' && process.env.NODE_ENV !== 'production');

  if (!mockEnabled) return false;

  const status = error?.response?.status;
  return !status || status === 404 || status >= 500;
}

export async function login(credentials) {
  try {
    const response = await common.axiosCall('POST', '/api/v1/auth/login', credentials);
    return normalizeAuthResponse(response, credentials);
  } catch (error) {
    if (canUseDemoLogin(error)) {
      const registeredAccount = mockAccounts.get(credentials.email);

      if (
        (credentials.email === DEMO_EMAIL &&
          credentials.password === DEMO_PASSWORD) ||
        registeredAccount?.password === credentials.password
      ) {
        return {
          token: 'demo-session',
          user: {
            name: registeredAccount?.name ?? 'LoadSight 관리자',
            email: credentials.email
          }
        };
      }

      const demoError = new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
      demoError.code = 'INVALID_CREDENTIALS';
      throw demoError;
    }

    throw error;
  }
}

export async function register(account) {
  try {
    const response = await common.axiosCall('POST', '/api/v1/auth/signup', {
      name: account.name,
      email: account.email,
      password: account.password
    });
    return response?.data?.data ?? response?.data ?? response;
  } catch (error) {
    if (canUseDemoLogin(error)) {
      if (account.email === DEMO_EMAIL || mockAccounts.has(account.email)) {
        const duplicateError = new Error('이미 가입된 이메일입니다.');
        duplicateError.response = { status: 409 };
        throw duplicateError;
      }

      mockAccounts.set(account.email, {
        name: account.name,
        password: account.password
      });

      return {
        success: true,
        user: {
          name: account.name,
          email: account.email
        }
      };
    }

    throw error;
  }
}

export async function logout() {
  try {
    await common.axiosCall('POST', '/api/v1/auth/logout');
  } catch (error) {
    // The local session still needs to end if the server is unavailable.
    console.warn('logout request failed:', error);
  }
}

export { DEMO_EMAIL, DEMO_PASSWORD };
