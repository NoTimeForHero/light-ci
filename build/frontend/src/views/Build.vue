<template>
  <div class="w-100 mt-2">
    <div class="alert alert-danger" v-if="error">
        {{error.message}}
    </div>
    <table class="table" v-if="build">
      <tbody>
      <tr>
        <th>Проект:</th>
        <td>{{build.project}}</td>
      </tr>
      <tr>
        <th>ID билда:</th>
        <td>{{build.buildID}}</td>
      </tr>
      <tr>
        <th class="align-middle">Статус:</th>
        <td>
          <build-status :build="build" :status_list="BUILD_STATUS" />
        </td>
      </tr>
      <tr>
        <th>Создан:</th>
        <td v-tippy="{ placement : 'top',  arrow: true }"
            :content="build.created|fullDate">
          {{build.created|fromNow}}
        </td>
      </tr>
      <tr>
        <th>Обновлён: </th>
        <td v-tippy="{ placement : 'top',  arrow: true }"
            :content="build.updated|fullDate">
          {{build.updated|fromNow}}
        </td>
      </tr>
      <tr v-if="build.elapsed">
        <th>Время выполнения: </th>
        <td>{{build.elapsed/1000}} секунд</td>
      </tr>
      <tr v-if="build.verified">
        <th>Запущен: </th>
        <td>
          <span v-if="build.verified.company && build.verified.subject === 'GitHub'">
            <img src="https://github.com/favicon.ico" />
            <span class="ml-2">GitHub</span>
          </span>
          <span v-else>
            <span class="type">{{build.verified.company ? "Организацией" : "Пользователем"}}</span>
            &nbsp;
            <span class="subject">{{build.verified.subject}}</span>
          </span>
        </td>
      </tr>
      <template v-if="build.logs">
        <tr>
          <th scope="row" colspan="2">STDErr:</th>
        </tr>
        <tr>
          <td colspan="2">
            <p v-for="(line,index) in build.logs.stderr" :key="`${line}-${index}`">{{line}}</p>
          </td>
        </tr>
        <tr>
          <th scope="row" colspan="2">STDOut:</th>
        </tr>
        <tr>
          <td colspan="2">
            <p v-for="(line,index) in build.logs.stdout" :key="`${line}-${index}`">{{line}}</p>
          </td>
        </tr>
        <tr>
          <th scope="row" colspan="2">Ошибки:</th>
        </tr>
        <tr>
          <td colspan="2">{{build.logs.err || "Не найдены"}}</td>
        </tr>
      </template>
      <tr v-if="build.canBuild">
        <td colspan="2">
          <button class="btn btn-warning" @click="rebuild(build.project)">Пересобрать</button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from '@/ajax';
import { mustJSON } from '@/helpers';
import { BUILD_STATUS } from '@/assets/constants';
import BuildStatus from '../components/BuildStatus.vue';

export default {
  name: 'Build',
  props: {
    updateTick: Number
  },
  components: {
    'build-status': BuildStatus
  },
  data() {
    return {
      build: null,
      error: null
    };
  },
  watch: {
    // eslint-disable-next-line func-names
    '$route.params.build': function () {
      this.load();
    },
    updateTick() {
      this.load();
    }
  },
  methods: {
    rebuild(name) {
      this.$emit('rebuild', name);
    },
    async load() {
      const { build } = this.$route.params;
      this.error = null;
      try {
        this.build = await axios.get(`/api/build/${build}`).then(mustJSON);
      } catch (error) {
        this.error = error;
      }
    }
  },
  mounted() {
    this.BUILD_STATUS = BUILD_STATUS;
    this.load();
  }
};
</script>

<style scoped>

</style>
