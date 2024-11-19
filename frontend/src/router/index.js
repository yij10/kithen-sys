import Vue from 'vue'
import VueRouter from 'vue-router'
import ShowOrder from '../components/ShowOrder.vue'
import ManuManagement from '../components/ManuManagement.vue'

Vue.use(VueRouter)

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
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
