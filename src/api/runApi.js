import common from '../utils/common';

/**
 * 대시보드 최근 실행 목록 조회
 */
export async function getRecentRuns(limit = 3) {
  const res = await common.axiosCall('GET', '/api/v1/runs', { page: 0, size: limit });
  const payload = res?.data ?? res;
  return Array.isArray(payload) ? payload : payload?.content || [];
}

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
    const runs = getMockRunHistory().filter((run) => {
      const search = String(params.search || '').toLowerCase();
      const matchesSearch =
        !search ||
        String(run.id).toLowerCase().includes(search) ||
        run.planName.toLowerCase().includes(search);
      const matchesStatus = !params.status || run.status === params.status;
      const cutoff = params.days
        ? new Date(Date.now() - Number(params.days) * 24 * 60 * 60 * 1000)
        : null;
      const runDate = new Date(String(run.startTime).replace(' ', 'T'));
      const matchesPeriod = !cutoff || Number.isNaN(runDate.getTime()) || runDate >= cutoff;
      return matchesSearch && matchesStatus && matchesPeriod;
    });
    return createMockPage(runs, params);
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
      verdict: '개선',
      summary: 'p95는 72.4% 감소했고, 실제 RPS는 18.2% 증가했습니다.',
      diffs: {
        p95LatencyDiffPercent: -72.4,
        errorRateDiffP: -2.2,
        rpsDiffPercent: 18.2
      },
      metricsTable: [
        { label: '평균 응답', base: '812ms', compare: '214ms', changeRate: '-73.6%', verdict: '개선' },
        { label: 'p95', base: '1,420ms', compare: '392ms', changeRate: '-72.4%', verdict: '개선' },
        { label: 'p99', base: '2,810ms', compare: '740ms', changeRate: '-73.7%', verdict: '개선' },
        { label: '오류율', base: '2.4%', compare: '0.2%', changeRate: '-2.2%p', verdict: '개선' },
        { label: '실제 RPS', base: '82', compare: '97', changeRate: '+18.2%', verdict: '개선' }
      ],
      responseTrend: {
        base: [310, 360, 450, 570, 760, 980, 1240],
        compare: [120, 145, 180, 225, 300, 410, 560]
      }
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

function createMockPage(items, params = {}) {
  const page = Math.max(Number(params.page) || 0, 0);
  const size = Math.max(Number(params.size) || 10, 1);
  const start = page * size;
  const totalElements = items.length;
  const totalPages = totalElements ? Math.ceil(totalElements / size) : 0;

  return {
    content: items.slice(start, start + size),
    page,
    size,
    totalElements,
    totalPages,
    first: page === 0,
    last: totalPages === 0 || page >= totalPages - 1
  };
}

function getMockRunDetail(runId) {
  if (runId && !['run-101', 'run-240724-01'].includes(runId)) {
    return {
      id: runId,
      planId: 1,
      name: '자산 목록 조회',
      method: 'GET',
      url: 'http://localhost:8085/asset/getTotalAsset',
      status: 'FAIL',
      statusText: '설정한 성능 기준을 충족하지 못했습니다.',
      executionTime: '2026-08-06 15:20',
      durationSec: 60,
      targetThresholds: { successRate: 99, p95Latency: 1000 },
      metrics: {
        totalRequests: 5812,
        averageLatency: 412,
        p50Latency: 388,
        p95Latency: 1284,
        p99Latency: 1610,
        errorCount: 35,
        errorRate: 0.6,
        rps: 76,
        targetRps: 100,
        http200: 5777,
        http500: 12,
        timeout: 21,
        connectionError: 2
      },
      responseTrend: {
        average: [120, 150, 190, 240, 310, 410, 540],
        p95: [280, 340, 430, 560, 760, 980, 1284]
      },
      rpsTrend: {
        actual: [18, 24, 34, 48, 66, 82, 100],
        target: [4, 7, 12, 19, 27, 39, 55]
      },
      analysisMessages: [
        '후반부에 p95가 증가했습니다. 자원 포화 가능성이 있습니다.',
        '실제 RPS가 목표의 76%에 머물렀습니다.'
      ],
      errorAnalysis: [
        { type: 'Timeout', count: 21 },
        { type: 'HTTP 500', count: 12 },
        { type: 'Connection Error', count: 2 }
      ]
    };
  }

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
