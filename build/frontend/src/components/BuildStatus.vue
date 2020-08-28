<template>
    <span>
        <div class="alert-secondary p-2" v-if="build.status === status_list.ready">
            Готово к запуску
        </div>
        <div class="alert-warning p-2" v-if="build.status === status_list.processing">
            Выполняется
        </div>
        <template v-if="build.status === status_list.completed">
            <div v-if="build.exitCode == 0" class="alert-success p-2">Завершено</div>
            <div v-else class="alert-danger p-2">Ошибка</div>
        </template>
    </span>
</template>

<script>
export default {
  props: { build: Object, status_list: Object }
};
</script>
