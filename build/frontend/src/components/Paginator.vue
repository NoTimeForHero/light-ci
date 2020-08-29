<script>
// eslint-disable-next-line no-unused-vars
const SHOW_NEAR = 2;

export default {
  props: {
    currentPage: Number,
    totalPages: Number
  },
  computed: {
    pages() {
      const pages = [];
      const { currentPage, totalPages } = this;
      const firstPage = 1;

      if (currentPage - SHOW_NEAR > firstPage) {
        pages.push({ value: 1, disabled: false });
        pages.push({ value: '...', disabled: true });
      }

      for (let page = currentPage - SHOW_NEAR; page < currentPage; page += 1) {
        if (page < 1) continue;
        pages.push({ value: page, disabled: false });
      }
      pages.push({ value: currentPage, disabled: true });
      for (let page = currentPage + 1; page <= currentPage + SHOW_NEAR; page += 1) {
        if (page > totalPages) continue;
        pages.push({ value: page, disabled: false });
      }

      if (currentPage < totalPages - SHOW_NEAR) {
        pages.push({ value: '...', disabled: true });
        pages.push({ value: totalPages, disabled: false });
      }

      return pages;
    }
  },
  methods: {
    gotoPage(page) {
      this.$emit('navigate', page);
    }
  }
};
</script>

<template>
  <nav aria-label="Page navigation example">
    <ul class="pagination">
      <li class="page-item" v-for="(page,i) in pages"
        :key="`${page.value}-${i}`"
        :class="{'disabled': page.disabled}">
          <a class="page-link" href="javascript:void(0)" @click="gotoPage(page.value)">{{page.value}}</a>
      </li>
    </ul>
  </nav>
</template>
