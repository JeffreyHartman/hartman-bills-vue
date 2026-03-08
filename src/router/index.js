import { createRouter, createWebHistory } from 'vue-router';
import { authReady } from '@/lib/supabase.js';
import store from '@/store/index.js';
import BillsView from '@/views/BillsView.vue';
import BillDetailsView from '@/views/BillDetailsView.vue';
import EditBillView from '@/views/EditBillView.vue';
import LoginView from '@/views/LoginView.vue';

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'bills',
    component: BillsView
  },
  {
    path: '/bill/new',
    name: 'bill-add',
    component: EditBillView
  },
  {
    path: '/bill/:id',
    name: 'bill-details',
    component: BillDetailsView
  },
  {
    path: '/bill/:id/edit',
    name: 'bill-edit',
    component: EditBillView
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

router.beforeEach(async (to) => {
  if (to.meta.requiresAuth === false) return;

  // Wait for the initial auth state to be known (set by onAuthStateChange in App.vue).
  // We avoid calling getSession() here because it can hang on page refresh.
  await authReady;
  if (!store.state.user) {
    return { name: 'login' };
  }
});

export default router;
