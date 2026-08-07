<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="450px">
    <v-card class="rounded-lg pa-2">
      <v-card-title class="d-flex align-center pt-4 px-4 font-weight-bold text-h6">
        <v-icon :color="color" class="mr-2" size="28">{{ icon }}</v-icon>
        <span>{{ title }}</span>
      </v-card-title>

      <v-card-text class="px-4 py-2 text-body-1 text-medium-emphasis">
        {{ message }}
      </v-card-text>

      <v-card-actions class="pa-4 d-flex justify-end">
        <v-btn variant="outlined" color="grey-darken-1" class="text-none px-4" @click="cancel">
          {{ cancelText }}
        </v-btn>
        <v-btn :color="color" variant="elevated" class="text-none px-4 text-white" @click="confirm">
          {{ confirmText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'ConfirmDialog',
  props: {
    modelValue: { type: Boolean, default: false },
    title: { type: String, default: '확인' },
    message: { type: String, default: '정말로 계속하시겠습니까?' },
    confirmText: { type: String, default: '확인' },
    cancelText: { type: String, default: '취소' },
    color: { type: String, default: 'primary' },
    icon: { type: String, default: 'mdi-help-circle-outline' }
  },
  emits: ['update:modelValue', 'confirm', 'cancel'],
  methods: {
    confirm() {
      this.$emit('confirm');
      this.$emit('update:modelValue', false);
    },
    cancel() {
      this.$emit('cancel');
      this.$emit('update:modelValue', false);
    }
  }
};
</script>
