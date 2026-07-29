import common from '../utils/common';

/**
 * 대시보드 요약 KPI 및 실행 중인 테스트 정보 조회
 */
export async function getDashboardSummary() {
  try {
    const res = await common.axiosCall('GET', '/api/v1/runs/dashboard-summary');
    return res?.data ?? res;
  } catch (err) {
    console.warn('getDashboardSummary mock fallback:', err);
    return {
      runningCount: 2,
      todayCount: 8,
      todayDiffPercent: 14,
      avgSuccessRate: 98.6,
      successRateDiffPercent: 1.2,
      avgP95Latency: 412,
      p95LatencyDiffMs: -18,
      requestCount: 23,
      requestCountDiff: -7,
      runningRun: {
        id: 'run-101',
        planId: 1,
        name: '회원가입 API 부하 테스트',
        status: 'RUNNING',
        progress: 45,
        elapsedTime: '00:06:25',
        rps: 1200,
        vusers: 200
      }
    };
  }
}

/**
 * 실행 이력 목록 조회
 */
export async function getRunHistory(params = {}) {
  try {
    const res = await common.axiosCall('GET', '/api/v1/runs', params);
    return res?.data ?? res;
  } catch (err) {
    console.warn('getRunHistory mock fallback:', err);
    return getMockRunHistory();
  }
}

/**
 * 실행 단건 상세 조회 (모니터링 또는 결과)
 */
export async function getRunDetails(runId) {
  try {
    const res = await common.axiosCall('GET', `/api/v1/runs/${runId}`);
    return res?.data ?? res;
  } catch (err) {
    console.warn('getRunDetails mock fallback:', err);
    return getMockRunDetail(runId);
  }
}

/**
 * 테스트 중지
 */
export async function stopRun(runId) {
  try {
    const res = await common.axiosCall('POST', `/api/v1/runs/${runId}/stop`);
    return res?.data ?? res;
  } catch (err) {
    console.warn('stopRun mock fallback:', err);
    return { success: true, runId, status: 'STOPPED' };
  }
}

/**
 * 두 실행 결과 비교 데이터 조회
 */
export async function getRunComparison(baseRunId, compareRunId) {
  try {
    const res = await common.axiosCall('GET', '/api/v1/runs/compare', { baseRunId, compareRunId });
    return res?.data ?? res;
  } catch (err) {
    console.warn('getRunComparison mock fallback:', err);
    return {
      verdict: '성능 개선됨',
      summary: '비교 실행이 기준 실행 대비 전반적으로 개선되었습니다.',
      diffs: {
        successRateDiffP: 5.34,
        p95LatencyDiffPercent: -38.8,
        errorRateDiffPercent: -64.7
      },
      metricsTable: [
        { label: '요청 수', base: '600,000', compare: '726,000', diff: '+120,000', changeRate: '+20.0% ↑' },
        { label: '성공률', base: '93.38%', compare: '98.72%', diff: '+5.34%p', changeRate: '+5.72% ↑' },
        { label: 'p50 응답시간', base: '320 ms', compare: '198 ms', diff: '-122 ms', changeRate: '-38.1% ↓' },
        { label: 'p95 응답시간', base: '672 ms', compare: '412 ms', diff: '-260 ms', changeRate: '-38.8% ↓' },
        { label: 'p99 응답시간', base: '1,350 ms', compare: '780 ms', diff: '-570 ms', changeRate: '-42.2% ↓' },
        { label: '에러율', base: '3.62%', compare: '1.28%', diff: '-2.34%p', changeRate: '-64.7% ↓' }
      ]
    };
  }
}

function getMockRunHistory() {
  return [
    {
      id: 'run-240724-01',
      planName: '자산 목록 조회',
      status: 'RUNNING',
      startTime: '2026-07-24 14:20',
      endTime: '-',
      duration: '28초',
      totalRequests: 2716,
      successRate: 99.6,
      p95Latency: 380
    },
    {
      id: 'run-240724-02',
      planName: '회원 생성',
      status: 'FAIL',
      startTime: '2026-07-24 13:42',
      endTime: '2026-07-24 13:43',
      duration: '30초',
      totalRequests: 1200,
      successRate: 88,
      p95Latency: 4200
    },
    {
      id: 'run-240723-01',
      planName: '로그인 API',
      status: 'WARNING',
      startTime: '2026-07-23 18:10',
      endTime: '2026-07-23 18:12',
      duration: '1분 30초',
      totalRequests: 7200,
      successRate: 96.4,
      p95Latency: 890
    },
    {
      id: 'run-240722-01',
      planName: '자산 목록 조회',
      status: 'CANCELLED',
      startTime: '2026-07-22 16:05',
      endTime: '2026-07-22 16:05',
      duration: '18초',
      totalRequests: 1780,
      successRate: 98.5,
      p95Latency: 340
    },
    {
      id: 'run-240721-01',
      planName: '회원 생성',
      status: 'PASS',
      startTime: '2026-07-21 11:30',
      endTime: '2026-07-21 11:31',
      duration: '30초',
      totalRequests: 1200,
      successRate: 99.7,
      p95Latency: 410
    }
  ];
}

function getMockRunDetail(runId) {
  return {
    id: runId || 'run-101',
    name: '자산 목록 조회',
    method: 'GET',
    url: 'http://localhost:8085/asset/getTotalAsset',
    status: 'RUNNING',
    statusText: '테스트가 실행 중입니다.',
    executionTime: '2026-07-24 15:19:36',
    elapsedSec: 28,
    durationSec: 60,
    targetThresholds: { successRate: 99, p95Latency: 1000 },
    metrics: {
      totalRequests: 2716,
      successRate: 99.6,
      p50Latency: 212,
      p95Latency: 380,
      p99Latency: 620,
      errorCount: 11,
      errorRate: 0.4,
      rps: 97,
      targetRps: 100,
      vusers: 20,
      targetVusers: 20,
      http200: 2705,
      http500: 8,
      timeout: 3
    },
    statusCodes: {
      '2xx': 99.6,
      '4xx': 0,
      '5xx': 0.3
    },
    topErrors: [
      { code: 500, count: 6120, ratio: 66.3, message: 'Internal Server Error' },
      { code: 503, count: 2345, ratio: 25.4, message: 'Service Unavailable' },
      { code: 404, count: 751, ratio: 8.1, message: 'Not Found' }
    ],
    bottlenecks: [
      '1. /v1/signup - DB 응답 시간 지연 (p85 620 ms)',
      '2. /v1/signup/verify - 외부 API 호출 지연',
      '3. DB Connections 사용률 82%'
    ]
  };
}
