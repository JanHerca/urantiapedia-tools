<template>
  <q-page class="q-pa-sm-md">
    <InputGroupSelect 
      id="drpLanguage" 
      :label="Strings.lblLanguage[uiLanguage]" 
      :options="allLanguages" 
      v-model="language"
      class="q-pa-sm-none q-mb-sm-md"
    />
    <InputGroupSelect 
      id="drpProcess" 
      :label="Strings.lblProcess[uiLanguage]" 
      :options="allProcesses" 
      v-model="process"
      class="q-pa-sm-none q-mb-sm-md"
    />
    <div>
      <InputGroupFolder
        label="Folder"
        v-model="folderPath"
        :basePath="urantiapediaFolder"
        class="q-pa-sm-none q-mb-sm-md"
        classes="full-width"
      />
      <InputGroupFile
        label="File"
        v-model="filePath"
        class="q-pa-sm-none q-mb-sm-md"
        classes="full-width"
      />
    </div>
    <Message 
      v-if="urantiapediaFolder === ''"
      type="warning"
      :dark="darkTheme"
      text="Urantiapedia folder is required in Settings."
    />
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import InputGroupSelect from 'src/components/InputGroupSelect.vue';
import InputGroupFolder from 'src/components/InputGroupFolder.vue';
import InputGroupFile from 'src/components/InputGroupFile.vue';
import Message from 'src/components/Message.vue';
import { Strings } from 'src/core/strings';
import { useMain } from 'src/stores/main';

const folderPath = ref('');
const filePath = ref('');

const mainStore = useMain();
const { allLanguages } = mainStore;
const {
  language,
  uiLanguage,
  darkTheme,
  urantiapediaFolder,
  process,
  allProcesses,
  processData,
} = storeToRefs(mainStore);



</script>