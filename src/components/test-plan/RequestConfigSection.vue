<template>
  <v-card class="pa-6 rounded-lg elevation-1 border mb-6">
    <div class="text-h6 font-weight-bold mb-4 d-flex align-center">
      <v-icon color="primary" class="mr-2">mdi-api</v-icon>
      요청 설정 (Request Config)
    </div>

    <v-row class="ga-2">
      <!-- Method & URL -->
      <v-col cols="12" md="3">
        <v-select
          v-model="modelValue.method"
          :items="['GET', 'POST', 'PUT', 'DELETE', 'PATCH']"
          label="HTTP Method"
          variant="outlined"
          density="comfortable"
          hide-details
        />
      </v-col>
      <v-col cols="12" md="9">
        <v-text-field
          v-model="modelValue.url"
          label="Target URL"
          placeholder="https://api.loadsight.com/v1/signup"
          variant="outlined"
          density="comfortable"
          hide-details
          prepend-inner-icon="mdi-link-variant"
        />
      </v-col>

      <!-- 태그 -->
      <v-col cols="12" class="mt-2">
        <v-combobox
          v-model="modelValue.tags"
          label="태그 (엔터로 추가)"
          chips
          multiple
          clearable
          variant="outlined"
          density="comfortable"
          hide-details
        />
      </v-col>
    </v-row>

    <!-- Headers & Params 탭 -->
    <v-tabs v-model="activeTab" class="mt-6 border-b" color="primary">
      <v-tab value="headers">HTTP Headers</v-tab>
      <v-tab value="query">Query Params</v-tab>
      <v-tab value="body" v-if="['POST', 'PUT', 'PATCH'].includes(modelValue.method)">Request Body</v-tab>
    </v-tabs>

    <v-window v-model="activeTab" class="pt-4">
      <!-- Headers -->
      <v-window-item value="headers">
        <div v-for="(h, idx) in modelValue.headers" :key="idx" class="d-flex align-center ga-2 mb-2">
          <v-text-field v-model="h.key" placeholder="Key (e.g. Content-Type)" variant="outlined" density="compact" hide-details />
          <v-text-field v-model="h.value" placeholder="Value (e.g. application/json)" variant="outlined" density="compact" hide-details />
          <v-btn icon="mdi-delete-outline" variant="text" color="error" size="small" @click="removeHeader(idx)" />
        </div>
        <v-btn size="small" variant="tonal" color="primary" class="mt-2" prepend-icon="mdi-plus" @click="addHeader">
          헤더 추가
        </v-btn>
      </v-window-item>

      <!-- Query Params -->
      <v-window-item value="query">
        <div v-for="(p, idx) in modelValue.queryParams" :key="idx" class="d-flex align-center ga-2 mb-2">
          <v-text-field v-model="p.key" placeholder="Key" variant="outlined" density="compact" hide-details />
          <v-text-field v-model="p.value" placeholder="Value" variant="outlined" density="compact" hide-details />
          <v-btn icon="mdi-delete-outline" variant="text" color="error" size="small" @click="removeParam(idx)" />
        </div>
        <v-btn size="small" variant="tonal" color="primary" class="mt-2" prepend-icon="mdi-plus" @click="addParam">
          파라미터 추가
        </v-btn>
      </v-window-item>

      <!-- Request Body -->
      <v-window-item value="body">
        <v-textarea
          v-model="modelValue.body"
          rows="6"
          variant="outlined"
          density="comfortable"
          placeholder="{\n  &quot;key&quot;: &quot;value&quot;\n}"
          font-family="monospace"
          hide-details
        />
      </v-window-item>
    </v-window>
  </v-card>
</template>

<script>
export default {
  name: 'RequestConfigSection',
  props: {
    modelValue: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      activeTab: 'headers'
    };
  },
  methods: {
    addHeader() {
      if (!this.modelValue.headers) this.modelValue.headers = [];
      this.modelValue.headers.push({ key: '', value: '' });
    },
    removeHeader(idx) {
      this.modelValue.headers.splice(idx, 1);
    },
    addParam() {
      if (!this.modelValue.queryParams) this.modelValue.queryParams = [];
      this.modelValue.queryParams.push({ key: '', value: '' });
    },
    removeParam(idx) {
      this.modelValue.queryParams.splice(idx, 1);
    }
  }
};
</script>
