<template>
  <div class="row no-wrap-sm items-center">
    <div class="q-px-sm-md">
      {{ label + ':' }}
    </div>

    <q-file 
      dense
      outlined
      filled 
      bottom-slots 
      :class="classes"
      :modelValue="theFile" 
      clearable
      :label="placeholder"
      @update:modelValue="onSelected">
      <template v-slot:prepend>
        <q-icon name="cloud_upload" @click.stop.prevent />
      </template>
    </q-file>
  </div>
</template>

<script setup>

const theFile = defineModel({
  type: Object,
  required: true
});

const props = defineProps({
  label: { type: String, default: 'Label' },
  placeholder: { type: String, default: 'Select a file' },
  classes: { type: String, default: '' }
});

const onSelected = (val) => {
  theFile.value = val;
};

</script>

<style scoped></style>