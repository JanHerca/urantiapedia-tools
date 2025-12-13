<template>
  <q-select 
    :label="label"
    :modelValue="options.find(option => option.value === theValue)" 
    :options="options" 
    option-value="value"
    option-label="label" 
    emit-value 
    outlined 
    options-dense
    :class="classes"
    @update:modelValue="onSelected" />
</template>

<script setup>

const theValue = defineModel({
  type: String,
  required: true
});

const props = defineProps({
  label: { type: String, default: 'Label' },
  options: { type: Array, default: () => [] },
  classes: { type: String, default: '' }
});

const onSelected = (val) => {
  theValue.value = val;
};

</script>

<style scoped></style>