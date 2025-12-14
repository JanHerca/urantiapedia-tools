<template>
  <q-btn 
    :color="color"
    :class="classes"
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
  processing: { type: Boolean, default: false },
  color: { type: String, default: 'primary'},
  classes: { type: String, default: 'full-width q-mb-sm-md'}
});
</script>

<style scoped></style>