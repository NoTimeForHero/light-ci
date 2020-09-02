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
        <div class="row mt-2" v-if="projects">
          <ul class="nav nav-tabs">
            <li class="nav-item">
              <router-link class="nav-link btn-primary" to="/logs">Логи</router-link>
            </li>
            <li class="nav-item" v-for="(id,name) in projects" :key="id">
              <router-link class="nav-link" :class="isActive(id)" :to="`/build/${id}`">{{name}}</router-link>
            </li>
            <li class="nav-item" v-if="isAuthorized">
              <router-link class="nav-link btn-danger" to="/logout">Выйти</router-link>
            </li>
          </ul>
        </div>
        <div class="row" v-if="projects">
            <router-view :updateTick="updateTick" @rebuild="rebuild" />
        </div>
    </div>
</template>

<script>
import axios from '@/ajax';
import { isAuthorized, mustJSON } from '@/helpers';

export default {
  data() {
    return {
      isLoading: true,
      isRefresh: false,
      builds: null,
      projects: null,
      updateTick: 0
    };
  },
  watch: {
    isRefresh(value) {
      clearInterval(this.timerRefresh);
      if (value) {
        this.timerRefresh = setInterval(() => this.refresh(), 1000);
      }
    }
  },
  computed: {
    build() {
      return this.$route.params.build;
    },
    isAuthorized() {
      return isAuthorized();
    }
  },
  methods: {
    isActive(id) {
      return this.build === id ? 'active' : '';
    },
    async rebuild(project) {
      const { build } = await axios.post(`/api/build/${project}`).then(mustJSON);
      await this.$router.push(`/build/${build}`);
    },
    async refresh() {
      this.projects = await axios.get('/api/projects').then(mustJSON);
      this.updateTick += 1;
      this.$forceUpdate();
    }
  },
  async mounted() {
    console.log(this.$isAuthorized);
    await this.refresh();
    this.isLoading = false;
    this.page = 'build';
  }
};
</script>
