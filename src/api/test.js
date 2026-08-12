import { getTestPlans, createTestPlan } from './testPlanApi';
import { getRunHistory } from './runApi';

export async function requestGet() {
  const result = await getTestPlans({ page: 0, size: 100 });
  return Array.isArray(result) ? result : result?.content || [];
}

export async function requestPost(params) {
  return await createTestPlan(params);
}

export async function makeTest(params) {
  return await createTestPlan(params);
}

export async function getTests() {
  const result = await getRunHistory({ page: 0, size: 100 });
  return Array.isArray(result) ? result : result?.content || [];
}

export { getTestPlans, createTestPlan, getRunHistory };
