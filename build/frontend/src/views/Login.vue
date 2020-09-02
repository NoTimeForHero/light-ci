<template>
  <div class="card card-warning mt-4 col-6">
    <div class="card-body warning-text">
      <h3 class="card-title">Доступ ограничен!</h3>
      <p class="card-text">
        Для продолжения работы с системой требуется аутентификация!
      </p>
      <a :href="targetURL" class="btn btn-outline-warning warning-text">Войти</a>
    </div>
  </div>
</template>

<script>
import { authURL } from '@/helpers';

export default {
  name: 'Login',
  props: {
    redirect: String
  },
  computed: {
    targetURL() {
      const redirect = `${document.location.origin}${this.redirect}?token=`;
      return this.authURL + encodeURIComponent(redirect);
    }
  },
  data() {
    return {
      authURL
    };
  }
};

</script>

<style scoped>
  .warning-text {
    color: #6d5201;
  }
  .card-warning {
    border: 1px #6d5201 solid;
  }
</style>
