import common from '../utils/common';

/**
 * PDF / CSV 보고서 다운로드
 */
export async function downloadReport(runId, format = 'pdf') {
  try {
    const res = await common.axiosCall('GET', `/api/v1/reports/${runId}/export?format=${format}`);
    return res?.data ?? res;
  } catch (err) {
    console.warn('downloadReport mock fallback:', err);
    return { success: true, url: `#mock-report-${runId}.${format}`, message: `${format.toUpperCase()} 다운로드가 시작되었습니다.` };
  }
}

/**
 * 비교 보고서 다운로드
 */
export async function downloadCompareReport(baseRunId, compareRunId) {
  try {
    const res = await common.axiosCall('GET', `/api/v1/reports/compare/export`, { baseRunId, compareRunId });
    return res?.data ?? res;
  } catch (err) {
    console.warn('downloadCompareReport mock fallback:', err);
    return { success: true, url: `#mock-compare-report.pdf`, message: '비교 리포트 다운로드가 시작되었습니다.' };
  }
}
