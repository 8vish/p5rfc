import { createRouter, createWebHashHistory } from 'vue-router';

import MainPage from '@/views/MainPage.vue';
import PersonaPage from '@/views/PersonaPage.vue';
import FusionPage from '@/views/FusionPage.vue';

const routes = [
    {
        path: '/',
        name: 'Main',
        component: MainPage
    },
    {
        path: '/#persona!:name',
        name: 'Persona',
        component: PersonaPage
    },
    {
        path: '/#fusion!:name!:skills?',
        name: 'Fusion',
        component: FusionPage
    }
];

const router = createRouter({
    history: createWebHashHistory(), // Use createWebHashHistory for hash-based routing
    routes,
    scrollBehavior (to, from, savedPosition) {
        return { top: 0, behavior: 'smooth' };
    }
});
export default router;
