<template>
  <div class="row no-wrap-sm items-center">
    <div class="flex items-center q-px-sm-md">
      {{ label }} :
    </div>

    <q-toggle
      :modelValue="theValue"
	  :toggle-indeterminate="false"
      @update:modelValue="onChecked"
    />
  </div>
</template>

<script setup>

const theValue = defineModel({
  type: Boolean,
  required: true
});

const props = defineProps({
  label: { type: String, default: 'Label' }
});

const onChecked = (val) => {
  theValue.value = val;
};

</script>

<style scoped>

</style>