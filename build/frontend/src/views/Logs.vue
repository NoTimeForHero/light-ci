<template>
  <table class="table mt-4" v-if="logs">
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
      <td>{{build.name}}</td>
      <td>
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
</template>

<script>
import { BUILD_STATUS } from '@/assets/constants';
import BuildStatus from '../components/BuildStatus.vue';

export default {
  name: 'Logs',
  props: {
    updateTick: Number,
  },
  components: {
    'build-status': BuildStatus,
  },
  data() {
    return {
      logs: null,
    };
  },
  watch: {
    updateTick() {
      this.load();
    },
  },
  methods: {
    async load() {
      this.logs = await fetch('/api/logs').then((x) => x.json());
    },
  },
  mounted() {
    this.BUILD_STATUS = BUILD_STATUS;
    this.load();
  },
};
</script>

<style scoped>

</style>
