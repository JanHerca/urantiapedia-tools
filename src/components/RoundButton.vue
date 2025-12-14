<template>
  <q-btn 
    round dense flat 
    :color="color" 
    :icon="icon" 
    :title="title">
    <q-tooltip>{{ title }}</q-tooltip>
  </q-btn>
</template>

<script setup>
const props = defineProps({
  title: { type: String, default: 'Label' },
  icon: { type: String, default: 'add_circle' },
  color: { type: String, default: 'primary' }
});

</script>

<style scoped></style>