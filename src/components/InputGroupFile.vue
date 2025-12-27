<template>
  <div class="row no-wrap items-center">
    <div class="flex items-center q-px-sm text-no-wrap q-mr-sm">
      {{ label }}
    </div>

    <q-input
      outlined
      dense
      v-model="theFilePath"
      class="col"
      :placeholder="placeholder"
      :class="classes">
      <template v-slot:append>
        <q-icon 
          name="file_open" 
          @click="onOpenFileClick" 
          class="cursor-pointer q-pr-xs-sm" />
        <q-icon 
          name="close" 
          @click="theFilePath = ''" 
          class="cursor-pointer" />
      </template>
    </q-input>
  </div>
</template>

<script setup>

const theFilePath = defineModel({
  type: String,
  required: true
});

const props = defineProps({
  label: { type: String, default: 'Label' },
  placeholder: { type: String, default: 'Select a file' },
  classes: { type: String, default: 'full-width q-pa-xs-none q-mb-xs-md' },
  basePath: { type: String, default: '' },
  filters: { type: Array, default: () => ['*'] }
});

const chooseFile = async () => {
  if (!window.NodeAPI) return
  const path = await window.NodeAPI.selectPath({
    type: 'file',
    filters: props.filters
  });
  if (path) {
    theFilePath.value = props.basePath != ''
      ? path.replace(/\\/g, '/').replace(props.basePath, '{ Urantiapedia Folder }')
      : path.replace(/\\/g, '/');
  }
}

const onOpenFileClick = () => {
  chooseFile();
};

</script>

<style scoped></style>