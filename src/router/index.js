import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import CountryView from '../views/CountryView.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: 'SatoshiPrice',
    }
  },
  {
    path: '/country/:country_id',
    name: 'Country',
    component: CountryView,
    props: true,
    meta: {
      title: 'SatoshiPrice',
    }
  }
]



const router = new VueRouter({
  mode: 'history',
  routes
})


export default router
