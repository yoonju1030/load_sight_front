import {createRouter, createWebHistory} from 'vue-router';
import test from "./test"
import LoginView from '../views/LoginView.vue';
import SignupView from '../views/SignupView.vue';
import store from '../store';

const routes=[
    {
        path: '/login',
        name: 'Login',
        component: LoginView,
        meta: { public: true, authPage: true }
    },
    {
        path: '/signup',
        name: 'Signup',
        component: SignupView,
        meta: { public: true, authPage: true }
    },
    ...test.map(route => ({
        ...route,
        meta: { ...route.meta, requiresAuth: true }
    })),
    {
        path: '/:pathMatch(.*)*',
        redirect: '/'
    }
]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})

router.beforeEach((to) => {
    const isAuthenticated = store.getters['auth/isAuthenticated'];

    if (to.meta.requiresAuth && !isAuthenticated) {
        return {
            name: 'Login',
            query: { redirect: to.fullPath }
        };
    }

    if (to.meta.authPage && isAuthenticated) {
        return { name: 'Dashboard' };
    }

    return true;
});

export default router;
