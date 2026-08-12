<template>
  <footer v-if="totalPages > 1" class="pagination-bar">
    <span class="pagination-summary">
      {{ $t('pagination.summary', { start: startItem, end: endItem, total: totalElements }) }}
    </span>

    <nav class="pagination-nav" :aria-label="$t('pagination.label')">
      <button
        type="button"
        class="pagination-arrow"
        :disabled="page === 0"
        :aria-label="$t('pagination.previous')"
        @click="$emit('change', page - 1)"
      >
        ‹
      </button>

      <button
        v-for="pageNumber in visiblePages"
        :key="pageNumber"
        type="button"
        class="pagination-page"
        :class="{ 'pagination-page--active': pageNumber === page + 1 }"
        :aria-current="pageNumber === page + 1 ? 'page' : undefined"
        @click="$emit('change', pageNumber - 1)"
      >
        {{ pageNumber }}
      </button>

      <button
        type="button"
        class="pagination-arrow"
        :disabled="page >= totalPages - 1"
        :aria-label="$t('pagination.next')"
        @click="$emit('change', page + 1)"
      >
        ›
      </button>
    </nav>
  </footer>
</template>

<script>
export default {
  name: 'PaginationControls',
  props: {
    page: {
      type: Number,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    totalElements: {
      type: Number,
      required: true
    },
    totalPages: {
      type: Number,
      required: true
    }
  },
  emits: ['change'],
  computed: {
    startItem() {
      return this.totalElements ? this.page * this.size + 1 : 0;
    },
    endItem() {
      return Math.min((this.page + 1) * this.size, this.totalElements);
    },
    visiblePages() {
      const visibleCount = Math.min(5, this.totalPages);
      const maxStart = Math.max(1, this.totalPages - visibleCount + 1);
      const start = Math.min(Math.max(1, this.page + 1 - 2), maxStart);

      return Array.from({ length: visibleCount }, (_, index) => start + index);
    }
  }
};
</script>

<style scoped>
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 12px;
  color: #7b8798;
  font-size: 9px;
}

.pagination-nav {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination-nav button {
  display: inline-flex;
  width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: #526077;
  font-size: 9px;
  font-weight: 700;
  background: #ffffff;
  border: 1px solid #d8e0ea;
  border-radius: 5px;
  cursor: pointer;
}

.pagination-nav button:hover:not(:disabled):not(.pagination-page--active) {
  color: #2f6bea;
  border-color: #9db8ef;
}

.pagination-nav button:disabled {
  color: #b8c0cc;
  cursor: default;
  background: #f7f9fb;
}

.pagination-nav .pagination-page--active {
  color: #ffffff;
  background: #2f6bea;
  border-color: #2f6bea;
}

.pagination-arrow {
  font-size: 15px !important;
}

@media (min-width: 1100px) {
  .pagination-bar {
    padding-top: 16px;
    font-size: 10px;
  }

  .pagination-nav button {
    width: 30px;
    height: 30px;
    font-size: 10px;
  }
}

@media (max-width: 520px) {
  .pagination-bar {
    flex-direction: column;
    justify-content: center;
  }
}
</style>
