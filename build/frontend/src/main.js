import Vue from 'vue';
import VueTippy from 'vue-tippy';

import injectAuthorization from '@/authorization';
import router from './router';
import App from './App.vue';
import DateTimeHelper from './assets/simple-datetime-helper';

import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/bs-switch.css';

Vue.use(VueTippy);
Vue.config.productionTip = false;

const dtHelper = new DateTimeHelper('ru');
Vue.filter('fromNow', (value) => dtHelper.fromNow(value));
Vue.filter('fullDate', (value) => dtHelper.fullDate(value));

injectAuthorization();

const app = new Vue({
  router,
  render: (h) => h(App)
});
app.$mount('#app');
