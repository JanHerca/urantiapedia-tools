<template>
  <q-checkbox 
    :modelValue="theValue" 
    :label="label" 
    size="sm" 
    :class="classes"
    @update:modelValue="onSelected"
  />
</template>

<script setup>

const theValue = defineModel({
  type: Boolean,
  required: true
});

const props = defineProps({
  label: { type: String, default: 'Label' },
  classes: { type: String, default: 'q-mb-sm' }
});

const onSelected = (val) => {
  theValue.value = val;
};

defineEmits(['click']);
</script>

<style scoped></style>