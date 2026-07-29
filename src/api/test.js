import { getTestPlans, createTestPlan } from './testPlanApi';
import { getRunHistory } from './runApi';

export async function requestGet() {
  return await getTestPlans();
}

export async function requestPost(params) {
  return await createTestPlan(params);
}

export async function makeTest(params) {
  return await createTestPlan(params);
}

export async function getTests() {
  return await getRunHistory();
}

export { getTestPlans, createTestPlan, getRunHistory };