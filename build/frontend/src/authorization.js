import axios from '@/ajax';
import router from '@/router';
import { authTokenName } from '@/helpers';

export default function inject() {
  axios.interceptors.request.use(
    async (config) => {
      const token = localStorage.getItem(authTokenName);
      // eslint-disable-next-line no-param-reassign
      if (token) config.headers.common.Authorization = `Bearer ${token}`;
      return config;
    }, (reject) => Promise.reject(reject)
  );

  axios.interceptors.response.use(
    (config) => config,
    (err) => {
      if (!err.response) return Promise.reject(err);
      const { status, data } = err.response;
      if (status !== 403 || data?.type !== 'authorization') return Promise.reject(err);
      const path = encodeURIComponent(router.currentRoute.fullPath);
      router.push(`/login/${path}`);
      return Promise.reject(err);
    }
  );

  router.beforeEach((to, from, next) => {
    if (to.path === '/logout') {
      localStorage.removeItem(authTokenName);
      return next('/logs');
    }

    const { token } = to.query;
    if (!token) return next();
    localStorage.setItem(authTokenName, token);
    // eslint-disable-next-line
    delete to.query.token;
    return next(to);
  });
}
