<template>
  <div class="w-100">
    <div class="alert alert-danger" v-if="error">
        {{error.message}}
    </div>
    <table class="table" v-if="build">
      <tbody>
      <tr>
        <th>Проект:</th>
        <td>{{build.name}}</td>
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
          <button class="btn btn-warning" @click="rebuild(build.name)">Пересобрать</button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { BUILD_STATUS } from '@/assets/constants';
import BuildStatus from '../components/BuildStatus.vue';

class HttpError extends Error {
  constructor(message, http, json) {
    super(message);
    this.http = http;
    this.json = json;
    this.message = json?.error ?? message;
  }
}

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
        const http = await fetch(`/api/build/${build}`);
        const json = await http.json();
        if (http.status > 400) throw new HttpError('Ошибка на стороне сервера!', http, json);
        this.build = json;
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
