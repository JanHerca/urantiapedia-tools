<template>
  <div class="row no-wrap-sm items-center">
    <div class="flex items-center q-px-sm-md">
      {{ label }} :
    </div>

    <q-input
      filled
      dense
      :modelValue="theFolderPath"
      :class="classes"
      @update:modelValue="onPathChanged">
      <template v-slot:append>
        <q-icon 
          name="folder_open" 
          @click="text = ''" 
          class="cursor-pointer q-pr-sm-sm" />
        <q-icon 
          name="close" 
          @click="theFolderPath = ''" 
          class="cursor-pointer" />
      </template>
    </q-input>
  </div>
</template>

<script setup>

const theFolderPath = defineModel({
  type: String,
  required: true
});

const props = defineProps({
  label: { type: String, default: 'Label' },
  classes: { type: String, default: '' }
});

const emits = defineEmits({
  'openFolderClick': () => true
});

const onPathChanged = (val) => {
  theFolderPath.value = val;
};

onOpenFolderClick = () => {
  emits('openFolderClick');
};

</script>

<style scoped></style>