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
  </q-page>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import InputGroupSelect from 'src/components/InputGroupSelect.vue';
import { Strings } from 'src/core/strings';
import { useMain } from 'src/stores/main';

const mainStore = useMain();
const { allLanguages } = mainStore;
const {
  language,
  uiLanguage,
  process,
  allProcesses
} = storeToRefs(mainStore);

</script>