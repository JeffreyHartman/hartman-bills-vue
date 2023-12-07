import { createRouter, createWebHistory } from 'vue-router'
import BillsView from '../views/BillsView.vue'
import BillDetailsView from '../views/BillDetailsView.vue'
import EditBillView from '../views/EditBillView.vue'

const routes = [
  {
    path: '/',
    name: 'bills',
    component: BillsView
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
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
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
