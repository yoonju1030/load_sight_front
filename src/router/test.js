import TempView from '../views/TempView.vue';
import AnotherView from '../views/AnotherView.vue';
import InputView from '../views/InputView.vue';
import OutputView from '../views/OutputView.vue';
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
    {path: '/runs/:runId/result', name: "RunResult", component: OutputView},
    {path: '/compare', name: "Compare", component: AnotherView},
    {path: '/temp', name: "Temp", component: TempView},
    {path: '/another', name: "Another", component: AnotherView},
    {path: '/input', name: "Input", component: InputView},
    {path: '/output', name: "Output", component: OutputView},
]

export default routes;
