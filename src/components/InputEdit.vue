<template>
  <q-input 
    dense outlined 
    :label="label"
    :modelValue="theValue" 
    :class="classes"
    @update:modelValue="onSelected" >
    <template v-slot:after>
      <q-btn 
        round dense flat 
        icon="edit" 
        color="primary" 
        @click="$emit('click')" />
    </template>
  </q-input>
</template>

<script setup>

const theValue = defineModel({
  type: String,
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