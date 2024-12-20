import { createRouter, createWebHistory } from 'vue-router';
import ShowOrder from '../components/ShowOrder.vue'
import ManuManagement from '../components/ManuManagement.vue'
import ChargePage from '../components/ChargePage.vue'

const routes = [
  {
    path: '/',
    redirect: 'show-orders'
  },
  {
    path: '/show-orders',
    name: 'ShowOrder',
    component: ShowOrder
  },
  {
    path: '/manu-management',
    name: 'ManuManagement',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    // component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
    component: ManuManagement
  },
  {
    path: '/charge-page',
    name: 'ChargePage',
    component: ChargePage
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
