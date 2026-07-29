<template>
  <v-sheet class="d-flex flex-column align-center justify-center pa-8 text-center rounded-lg bg-surface border" elevation="0">
    <v-icon :color="iconColor" size="64" class="mb-4 text-medium-emphasis">
      {{ icon }}
    </v-icon>
    <div class="text-h6 font-weight-bold text-high-emphasis mb-1">
      {{ title }}
    </div>
    <div class="text-body-2 text-medium-emphasis mb-5 max-width-400">
      {{ description }}
    </div>
    <v-btn
      v-if="actionLabel"
      color="primary"
      variant="elevated"
      class="text-none px-6 rounded-md font-weight-bold"
      prepend-icon="mdi-plus"
      @click="$emit('action')"
    >
      {{ actionLabel }}
    </v-btn>
  </v-sheet>
</template>

<script>
export default {
  name: 'EmptyState',
  props: {
    icon: { type: String, default: 'mdi-file-document-outline' },
    iconColor: { type: String, default: 'primary' },
    title: { type: String, default: '데이터가 없습니다' },
    description: { type: String, default: '새로운 항목을 추가하거나 검색 조건을 변경해 보세요.' },
    actionLabel: { type: String, default: '' }
  },
  emits: ['action']
};
</script>

<style scoped>
.max-width-400 {
  max-width: 400px;
}
</style>
