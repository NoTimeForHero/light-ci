<template>
  <div class="w-100" v-if="logs">
    <table class="table mt-2">
      <thead>
      <tr>
        <th>Проект</th>
        <th>ID билда</th>
        <th>Обновлён</th>
        <th>Время выполнения</th>
        <th>Состояние</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="build in logs" :key="build.buildID">
        <td>{{build.project}}</td>
        <td>
          <img src="../assets/icon_key.png" width="24" height="24" class="mr-2" alt="verified"
            v-if="build.verified" v-tippy :content="getVerifiedTooltip(build)"
          />
          <router-link :to="`/build/${build.buildID}`">{{build.buildID}}</router-link>
        </td>
        <td v-tippy="{ placement : 'top',  arrow: true }"
            :content="build.updated|fullDate">
          {{build.updated|fromNow}}
        </td>
        <td>
          <template v-if="build.elapsed">{{build.elapsed/1000}} секунд</template>
          <template v-else>Неизвестно</template>
        </td>
        <td>
          <build-status :build="build" :status_list="BUILD_STATUS" />
        </td>
      </tr>
      </tbody>
    </table>
    <Paginator :currentPage="page" :totalPages="pagesTotal" @navigate="navigate" />
  </div>
</template>

<script>
import { BUILD_STATUS } from '@/assets/constants';
import BuildStatus from '../components/BuildStatus.vue';
import Paginator from '../components/Paginator.vue';

export default {
  name: 'Logs',
  props: {
    buildsPerPage: Number,
    updateTick: Number,
    page: Number
  },
  components: {
    'build-status': BuildStatus,
    Paginator
  },
  data() {
    return {
      logs: null,
      pagesTotal: 0
    };
  },
  computed: {
    pages() {
      return [1, 2, 3, 4];
    }
  },
  watch: {
    page() {
      this.load();
    },
    updateTick() {
      this.load();
    }
  },
  methods: {
    navigate(page) {
      this.$router.push(`/logs/${page}`);
    },
    async load() {
      const count = this.buildsPerPage;
      const offset = count * (this.page - 1);
      const data = await fetch(`/api/logs?count=${count}&offset=${offset}`).then((x) => x.json());
      this.pagesTotal = Math.ceil(data.total / count);
      this.logs = data.logs;
    },
    getVerifiedTooltip(build) {
      if (!build.verified) return null;
      const { company, subject } = build.verified;
      const type = company ? 'организацией' : 'пользователем';
      return `Запущен ${type} ${subject}`;
    }
  },
  mounted() {
    this.BUILD_STATUS = BUILD_STATUS;
    this.load();
  }
};
</script>

<style scoped>
  .hidden {
    display: none;
  }
</style>
