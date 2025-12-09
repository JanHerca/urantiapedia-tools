<template>
  <div class="row no-wrap items-center">
    <div class="flex items-center q-px-sm text-no-wrap q-mr-sm">
      {{ label }}
    </div>

    <q-input
      filled
      dense
      v-model="theText"
      class="col"
      :class="classes">
    </q-input>
  </div>
</template>

<script setup>

const theText = defineModel({
  type: String,
  required: true
});

const props = defineProps({
  label: { type: String, default: 'Label' },
  placeholder: { type: String, default: 'Enter a text' },
  classes: { type: String, default: '' },
});

</script>

<style scoped></style>