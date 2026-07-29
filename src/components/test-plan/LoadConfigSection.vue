<template>
  <v-card class="pa-6 rounded-lg elevation-1 border mb-6">
    <div class="text-h6 font-weight-bold mb-4 d-flex align-center">
      <v-icon color="primary" class="mr-2">mdi-speedometer</v-icon>
      부하 설정 (Load Config)
    </div>

    <v-row>
      <!-- 가상 사용자 수 -->
      <v-col cols="12" md="6">
        <div class="d-flex justify-space-between align-center mb-1">
          <span class="text-subtitle-2 font-weight-medium">가상 사용자 (VUsers)</span>
          <span class="text-primary font-weight-bold">{{ modelValue.vusers }} 명</span>
        </div>
        <v-slider
          v-model="modelValue.vusers"
          :min="1"
          :max="2000"
          :step="10"
          color="primary"
          thumb-label
          hide-details
        />
        <v-text-field
          v-model.number="modelValue.vusers"
          type="number"
          variant="outlined"
          density="compact"
          class="mt-2"
          suffix="명"
          hide-details
        />
      </v-col>

      <!-- 목표 RPS -->
      <v-col cols="12" md="6">
        <div class="d-flex justify-space-between align-center mb-1">
          <span class="text-subtitle-2 font-weight-medium">목표 RPS (Requests Per Second)</span>
          <span class="text-primary font-weight-bold">{{ modelValue.targetRps }} RPS</span>
        </div>
        <v-slider
          v-model="modelValue.targetRps"
          :min="10"
          :max="10000"
          :step="50"
          color="primary"
          thumb-label
          hide-details
        />
        <v-text-field
          v-model.number="modelValue.targetRps"
          type="number"
          variant="outlined"
          density="compact"
          class="mt-2"
          suffix="RPS"
          hide-details
        />
      </v-col>

      <!-- 테스트 지속 시간 -->
      <v-col cols="12" md="6" class="mt-4">
        <v-text-field
          v-model.number="modelValue.durationMinutes"
          label="테스트 지속 시간"
          type="number"
          variant="outlined"
          density="comfortable"
          suffix="분 (min)"
          prepend-inner-icon="mdi-clock-outline"
          hide-details
        />
      </v-col>

      <!-- Ramp-up 시간 -->
      <v-col cols="12" md="6" class="mt-4">
        <v-text-field
          v-model.number="modelValue.rampUpSeconds"
          label="Ramp-up 시간"
          type="number"
          variant="outlined"
          density="comfortable"
          suffix="초 (sec)"
          prepend-inner-icon="mdi-chart-timeline-variant"
          hide-details
        />
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
export default {
  name: 'LoadConfigSection',
  props: {
    modelValue: {
      type: Object,
      required: true
    }
  }
};
</script>
