import { createRouter, createWebHistory } from 'vue-router';
import { supabase } from '@/lib/supabase.js';
import BillsView from '../views/BillsView.vue';
import BillDetailsView from '../views/BillDetailsView.vue';
import EditBillView from '../views/EditBillView.vue';
import LoginView from '../views/LoginView.vue';

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

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { name: 'login' };
  }
});

export default router;
