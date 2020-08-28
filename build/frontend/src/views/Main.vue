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
          </ul>
        </div>
        <div class="row mt-4" v-if="projects">
            <router-view :updateTick="updateTick" @rebuild="rebuild" />
        </div>
    </div>
</template>

<script>
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
    }
  },
  methods: {
    isActive(id) {
      return this.build === id ? 'active' : '';
    },
    async rebuild(project) {
      const { build } = await fetch(`/api/build/${project}`, { method: 'POST' }).then((x) => x.json());
      await this.$router.push(`/build/${build}`);
    },
    async refresh() {
      this.projects = await fetch('/api/projects').then((x) => x.json());
      this.updateTick += 1;
      this.$forceUpdate();
    }
  },
  async mounted() {
    await this.refresh();
    this.isLoading = false;
    this.page = 'build';
  }
};
</script>
