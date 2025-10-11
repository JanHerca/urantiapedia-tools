<template>
  <div class="row no-wrap-sm items-center">
    <div class="q-px-sm-md">
      {{ label + ':' }}
    </div>

    <q-select
      :modelValue="theValue"
      :options="options"
      option-value="value"
      option-label="label"
      dense
      outlined
      :class="classes"
      @update:modelValue="onSelected"
    />
  </div>
</template>

<script setup>

const theValue = defineModel({
  type: Object,
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