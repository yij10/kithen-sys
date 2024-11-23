import { createApp } from 'vue';
import App from './App.vue'
import router from './router'
import axios from 'axios';
axios.defaults.baseURL = 'http://localhost:3000';

const token = localStorage.getItem('token');
if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

createApp(App).use(router).mount('#app')
