import TempView from '../views/TempView.vue';
import RunComparisonView from '../views/RunComparisonView.vue';
import InputView from '../views/InputView.vue';
import RunResultView from '../views/RunResultView.vue';
import DashboardView from '../views/DashboardView.vue';
import TestPlanListView from '../views/TestPlanListView.vue';
import TestPlanFormView from '../views/TestPlanFormView.vue';
import RunHistoryView from '../views/RunHistoryView.vue';
import RunLiveView from '../views/RunLiveView.vue';

const routes = [
    {path: '/', name: "Dashboard", component: DashboardView},
    {path: '/test-plans', name: "TestPlans", component: TestPlanListView},
    {path: '/test-plans/new', name: "NewTestPlan", component: TestPlanFormView},
    {path: '/test-plans/:planId/edit', name: "EditTestPlan", component: TestPlanFormView},
    {path: '/runs', name: "Runs", component: RunHistoryView},
    {path: '/runs/:runId/live', name: "RunLive", component: RunLiveView},
    {path: '/runs/:runId/result', name: "RunResult", component: RunResultView},
    {path: '/compare', name: "Compare", component: RunComparisonView},
    {path: '/temp', name: "Temp", component: TempView},
    {path: '/another', redirect: '/compare'},
    {path: '/input', name: "Input", component: InputView},
    {path: '/output', redirect: '/runs/run-240724-02/result'},
]

export default routes;
