import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from "./store"
import Filters from './filters';

Vue.config.productionTip = false

Vue.mixin({
  filters: Filters,
});


Vue.directive("tooltip", {
  bind: function (el) {
    el.addEventListener('mouseover', function (event) {
       store.commit('tooltip',event)
    });
    el.addEventListener('mouseout', function (event) {
      store.commit('tooltip',null)
    });
  }
});

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
