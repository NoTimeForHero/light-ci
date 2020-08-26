<template>
    <div>
        <div class="row mt-4">
            <div class="form-group">
                <span class="switch">
                    <button class="btn btn-primary mr-4" @click="refresh()">Обновить</button>
                    <input type="checkbox" class="switch" id="switch-normal" v-model="isRefresh">
                    <label for="switch-normal">Обновлять автоматически</label>
                </span>
            </div>
        </div>
        <div class="row mt-4" v-if="builds">

            <ul class="nav nav-tabs">
                <li class="nav-item">
                    <a class="nav-link btn-primary" href="javascript:void(0)" @click="showLogs">Логи</a>
                </li>
                <li class="nav-item" v-for="(build,name) in builds" :key="name">
                    <a class="nav-link" :class="isActive(build.build_id)"
                        @click="showBuild(build)" href="javascript:void(0)">{{name}}</a>
                </li>
            </ul>

            <table class="table mt-4" v-if="logs && page === 'logs'">
                <thead>
                    <tr>
                        <th>Проект</th>
                        <th>ID билда</th>
                        <th>Обновлён</th>
                        <th>Время выполнения</th>
                        <td>Результат</td>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="build in logs" :key="build.build_id">
                        <td>{{build.name}}</td>
                        <td>
                            <a href="javascript:void(0);" @click="showBuild(build,true)">{{build.build_id}}</a>
                        </td>
                        <td v-tippy="{ placement : 'top',  arrow: true }"
                            :content="build.updated|fullDate">
                            {{build.updated|fromNow}}
                        </td>
                        <td>{{build.elapsed/1000}} секунд</td>
                        <td>
                            <build-status :build="build" :status_list="BUILD_STATUS" />
                        </td>
                    </tr>
                </tbody>
            </table>

            <table class="table mt-4" v-if="build && page === 'build'">
                <tbody>
                    <tr>
                        <th>Проект:</th>
                        <td>{{build.name}}</td>
                    </tr>
                    <tr>
                        <th>ID билда:</th>
                        <td>{{build.build_id}}</td>
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
                    <tr v-if="build.can_build">
                        <td colspan="2">
                            <button class="btn btn-warning" @click="rebuild(build.name)">Пересобрать</button>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div v-if="!builds">
                <h2>Нет проектов для отображения!</h2>
            </div>

        </div>
    </div>
</template>

<script>

import BuildStatus from '../components/BuildStatus.vue';
import { BUILD_STATUS } from '../assets/constants';

export default {
  data() {
    return {
      isLoading: true,
      isRefresh: false,
      builds: null,
      build: null,
      logs: null,
      page: null,
    };
  },
  components: {
    'build-status': BuildStatus,
  },
  watch: {
    isRefresh(value) {
      clearInterval(this.timerRefresh);
      if (value) {
        this.timerRefresh = setInterval(() => this.refresh(), 1000);
      }
    },
  },
  methods: {
    isActive(id) {
      return this.build?.build_id === id ? 'active' : '';
    },
    async rebuild(title) {
      await fetch(`/api/project/${title}`, { method: 'POST' });
      await this.loadBuilds();
    },
    async loadBuilds() {
      this.builds = await fetch('/api/last-builds').then((x) => x.json());
      this.build = this.builds?.[this.build?.name];
    },
    async loadLogs() {
      this.logs = await fetch('/api/logs').then((x) => x.json());
    },
    showBuild(build, resetTimer = false) {
      this.build = build;
      if (resetTimer) this.isRefresh = false;
      this.page = 'build';
    },
    async showLogs() {
      this.build = null;
      this.page = 'logs';
    },
    async refresh() {
      await this.loadBuilds();
      await this.loadLogs();
      this.$forceUpdate();
    },
  },
  async mounted() {
    this.BUILD_STATUS = BUILD_STATUS;
    await this.refresh();
    this.isLoading = false;
    if (this.builds) this.build = Object.values(this.builds)?.[0];
    this.page = 'build';
  },
};
</script>
