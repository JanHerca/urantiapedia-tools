<template>
  <div class="row no-wrap items-center">
    <div class="flex items-center q-px-sm text-no-wrap q-mr-sm">
      {{ label }}
    </div>

    <q-input
      filled
      dense
      v-model="theFolderPath"
      class="col"
      :class="classes">
      <template v-slot:append>
        <q-icon 
          name="folder_open" 
          @click="onOpenFolderClick" 
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
  placeholder: { type: String, default: 'Select a folder' },
  classes: { type: String, default: '' },
  basePath: { type: String, default: '' }
});

const chooseFolder = async () => {
  if (!window.NodeAPI) return
  const path = await window.NodeAPI.selectPath({
    type: 'folder',
    filters: []
  });
  if (path) {
    theFolderPath.value = props.basePath != ''
      ? path.replace(props.basePath, '{ Urantiapedia Folder }')
      : path;
  }
}

const onOpenFolderClick = () => {
  chooseFolder();
};

</script>

<style scoped></style>