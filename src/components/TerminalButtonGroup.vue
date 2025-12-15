<template>
  <q-btn-group flat>
    <q-btn 
      icon="warning" 
      label="Warnings" 
      color="orange-7"
      size="sm"
      @click="proxyLogsFilter = (logsFilter === 'warning' ? null : 'warning')"
      :flat="logsFilter !== 'warning'"
    />
    <q-btn 
      icon="error" 
      label="Errors" 
      color="red-7"
      size="sm"
      @click="proxyLogsFilter = (logsFilter === 'error' ? null : 'error')"
      :flat="logsFilter !== 'error'"
    />
    <q-btn 
      icon="not_interested" 
      label="Clear" 
      color="primary"
      size="sm"
      flat
      @click="proxyLogsComplete = []"
    />
  </q-btn-group>
</template>

<script setup>
import { computed } from 'vue';

//Props
const props = defineProps({
  logsFilter: { type: String, default: null },
  logsComplete: { type: Array, default: () => [] }
});

//Emits
const emit = defineEmits([
  'update:logsFilter',
  'update:logsComplete',
]);

//Computeds
const proxyLogsFilter = computed({
  get: () => props.logsFilter,
  set: (val) => emit('update:logsFilter', val)
});

const proxyLogsComplete = computed({
  get: () => props.logsComplete,
  set: (val) => emit('update:logsComplete', val)
});
</script>