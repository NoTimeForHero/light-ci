import { baseURL } from '@/helpers';
import Vue from 'vue';
import VueRouter from 'vue-router';
import Main from '../views/Main.vue';
import Login from '../views/Login.vue';
import Build from '../views/Build.vue';
import Logs from '../views/Logs.vue';

Vue.use(VueRouter);

const routes = [

  {
    path: '/',
    name: 'Main',
    component: Main,
    children: [
      { path: '/build/:build', component: Build },
      {
        path: '/logs/:page?',
        component: Logs,
        props: (route) => ({
          buildsPerPage: 6,
          page: parseInt(route.params.page, 10) || 1
        })
      }
    ]
  },
  {
    path: '/login/:redirect?',
    name: 'Login',
    component: Login,
    props: (route) => ({
      redirect: route.params.redirect || '/'
    })
  }
  // {
  //   path: '/about',
  //   name: 'About',
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () => import(/* webpackChunkName: "about" */ '../views/About.vue'),
  // },
];

const router = new VueRouter({
  mode: 'history',
  base: baseURL || process.env.BASE_URL,
  routes
});

export default router;
