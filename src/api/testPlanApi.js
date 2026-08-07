import common from '../utils/common';

/**
 * 테스트 플랜 목록 조회
 */
export async function getTestPlans(params = {}) {
  try {
    const res = await common.axiosCall('GET', '/api/v1/test-plans', params);
    return res?.data ?? res;
  } catch (err) {
    console.warn('getTestPlans mock fallback:', err);
    return getMockTestPlans();
  }
}

/**
 * 테스트 플랜 상세 조회
 */
export async function getTestPlanById(id) {
  try {
    const res = await common.axiosCall('GET', `/api/v1/test-plans/${id}`);
    return res?.data ?? res;
  } catch (err) {
    console.warn('getTestPlanById mock fallback:', err);
    return getMockTestPlans().find(p => p.id === Number(id)) || getMockTestPlans()[0];
  }
}

/**
 * 테스트 플랜 생성
 */
export async function createTestPlan(planData) {
  try {
    const res = await common.axiosCall('POST', '/api/v1/test-plans', planData);
    return res?.data ?? res;
  } catch (err) {
    console.warn('createTestPlan mock fallback:', err);
    return { success: true, id: Date.now(), ...planData };
  }
}

/**
 * 테스트 플랜 수정
 */
export async function updateTestPlan(id, planData) {
  try {
    const res = await common.axiosCall('POST', `/api/v1/test-plans/${id}`, planData);
    return res?.data ?? res;
  } catch (err) {
    console.warn('updateTestPlan mock fallback:', err);
    return { success: true, id, ...planData };
  }
}

/**
 * 테스트 플랜 삭제
 */
export async function deleteTestPlan(id) {
  try {
    const res = await common.axiosCall('POST', `/api/v1/test-plans/${id}/delete`);
    return res?.data ?? res;
  } catch (err) {
    console.warn('deleteTestPlan mock fallback:', err);
    return { success: true, id };
  }
}

/**
 * 테스트 플랜 실행 시작
 */
export async function runTestPlan(id) {
  try {
    const res = await common.axiosCall('POST', `/api/v1/test-plans/${id}/run`);
    return res?.data ?? res;
  } catch (err) {
    console.warn('runTestPlan mock fallback:', err);
    return { success: true, runId: `run-${Date.now()}`, status: 'RUNNING' };
  }
}

/**
 * Mock 데이터 제공 헬퍼
 */
function getMockTestPlans() {
  return [
    {
      id: 1,
      name: '자산 목록 조회',
      description: '전체 자산 목록 조회 API',
      method: 'GET',
      url: '/asset/getTotalAsset',
      rps: 100,
      duration: 60,
      concurrency: 20,
      lastRunStatus: '성공',
      statusTone: 'success',
      updatedAt: '2026-07-23',
      loadConfig: { vusers: 20, targetRps: 100, durationMinutes: 1 }
    },
    {
      id: 2,
      name: '회원 생성',
      description: '신규 회원 생성 API',
      method: 'POST',
      url: '/api/users',
      rps: 40,
      duration: 30,
      concurrency: 10,
      lastRunStatus: '실패',
      statusTone: 'danger',
      updatedAt: '2026-07-21',
      loadConfig: { vusers: 10, targetRps: 40, durationMinutes: 0.5 }
    },
    {
      id: 3,
      name: '로그인 API',
      description: '사용자 로그인 API',
      method: 'POST',
      url: '/auth/login',
      rps: 80,
      duration: 90,
      concurrency: 30,
      lastRunStatus: '이력 없음',
      statusTone: 'neutral',
      updatedAt: '2026-07-20',
      loadConfig: { vusers: 30, targetRps: 80, durationMinutes: 1.5 }
    }
  ];
}
