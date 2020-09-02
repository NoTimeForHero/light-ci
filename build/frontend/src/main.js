import Vue from 'vue';
import VueTippy from 'vue-tippy';

import App from './App.vue';
import router from './router';
import axios from './ajax';
import DateTimeHelper from './assets/simple-datetime-helper';

import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/bs-switch.css';

Vue.use(VueTippy);
Vue.config.productionTip = false;

const dtHelper = new DateTimeHelper('ru');
Vue.filter('fromNow', (value) => dtHelper.fromNow(value));
Vue.filter('fullDate', (value) => dtHelper.fullDate(value));

axios.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('authToken');
    // eslint-disable-next-line no-param-reassign
    if (token) config.headers.common.Authorization = token;
    return config;
  }, (reject) => Promise.reject(reject)
);

axios.interceptors.response.use(
  (config) => config,
  (err) => {
    if (!err.response) return Promise.reject(err);
    const { status, data } = err.response;
    if (status !== 403 || data?.type !== 'authorization') return Promise.reject(err);
    router.push('/login');
    return Promise.reject(err);
  }
);

new Vue({
  router,
  render: (h) => h(App)
}).$mount('#app');
