import { createRouter, createWebHistory } from 'vue-router';
import BillsView from '../views/BillsView.vue';
import BillDetailsView from '../views/BillDetailsView.vue';
import EditBillView from '../views/EditBillView.vue';

const routes = [
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

export default router;
