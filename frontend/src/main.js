import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios';
// import store from './store';

Vue.config.productionTip = false
axios.defaults.baseURL = 'http://localhost:3000';

const token = localStorage.getItem('token');
if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
