<template>
  <div class="card card-warning mt-4 col-6">
    <div class="card-body warning-text">
      <h3 class="card-title">Доступ ограничен!</h3>
      <p class="card-text">
        Для продолжения работы с системой требуется аутентификация!
      </p>
      <a :href="authURL" class="btn btn-outline-warning warning-text">Войти</a>
    </div>
  </div>
</template>

<script>
import { authURL } from '@/helpers';

export default {
  name: 'Login',
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
