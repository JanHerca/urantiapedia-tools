<template>
  <q-btn 
    color="primary"
    class="q-mb-sm-md"
    :disabled="processing">
    <div v-if="processing" class="row items-center q-pr-sm">
      <q-spinner
        color="white"
        size="1em"
      />
    </div>
    {{ label }}
  </q-btn>
</template>

<script setup>

const props = defineProps({
  label: { type: String },
  processing: { type: Boolean, default: false }
});
</script>

<style scoped></style>