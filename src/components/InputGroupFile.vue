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
          class="cursor-pointer q-pr-sm-sm" />
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
  classes: { type: String, default: '' },
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
      ? path.replace(props.basePath, '{ Urantiapedia Folder }')
      : path;
  }
}

const onOpenFileClick = () => {
  chooseFile();
};

</script>

<style scoped></style>