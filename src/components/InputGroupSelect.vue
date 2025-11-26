<template>
  <div class="row no-wrap items-center">
    <div class="flex items-center q-px-sm text-no-wrap q-mr-sm">
      {{ label }}
    </div>

    <q-select
      :modelValue="options.find(option => option.value === theValue)"
      :options="options"
      option-value="value"
      option-label="label"
      emit-value
      dense
      outlined
      class="col"
      :class="classes"
      @update:modelValue="onSelected"
    />
  </div>
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

<style scoped>

</style>