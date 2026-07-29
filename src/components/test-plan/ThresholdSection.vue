<template>
  <v-card class="pa-6 rounded-lg elevation-1 border mb-6">
    <div class="text-h6 font-weight-bold mb-4 d-flex align-center">
      <v-icon color="primary" class="mr-2">mdi-check-decagram-outline</v-icon>
      통과 기준 (Pass/Fail Thresholds)
    </div>

    <v-row>
      <!-- 성공률 통과 기준 -->
      <v-col cols="12" md="6">
        <v-text-field
          v-model.number="modelValue.passSuccessRate"
          label="최소 성공률 (Success Rate)"
          type="number"
          variant="outlined"
          density="comfortable"
          prefix="≥"
          suffix="%"
          prepend-inner-icon="mdi-percent"
          hint="예: 95.0% 이상 시 PASS"
          persistent-hint
        />
      </v-col>

      <!-- p95 응답시간 통과 기준 -->
      <v-col cols="12" md="6">
        <v-text-field
          v-model.number="modelValue.passP95Latency"
          label="최대 p95 응답시간 (Latency)"
          type="number"
          variant="outlined"
          density="comfortable"
          prefix="≤"
          suffix="ms"
          prepend-inner-icon="mdi-timer-outline"
          hint="예: 800 ms 이하 시 PASS"
          persistent-hint
        />
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
export default {
  name: 'ThresholdSection',
  props: {
    modelValue: {
      type: Object,
      required: true
    }
  }
};
</script>
