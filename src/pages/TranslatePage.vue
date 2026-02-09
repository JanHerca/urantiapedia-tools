<template>
  <q-page class="q-pa-md column no-scroll no-wrap" :style-fn="pageStyle">
    <div class="row col q-col-gutter-sm no-wrap">
      <div class="col-4 column no-wrap">
        <div class="col scroll q-pr-sm">
          <InputGroupSelect
            label="Origin Language"
            :options="allLanguages"
            v-model="sourceLanguage" />
          <InputGroupSelect
            label="Target Language"
            :options="allLanguages"
            v-model="targetLanguage" />
          <InputGroupFolder
            label="Origin folder"
            v-model="sourceFolder" />
          <InputGroupFolder
            label="Target folder"
            v-model="targetFolder" />
          <InputGroupToggle
            id="tglLibraryBook"
            label="Library book"
            v-model="isLibraryBook"
            class="q-pa-sm-none q-mb-sm-md"
          />
        </div>
        <div class="q-pt-sm">
          <Message 
            v-if="urantiapediaFolder === ''"
            type="warning"
            :dark="darkTheme"
            text="Urantiapedia folder is required in Settings." />
          <ProgressButton
            :processing="translating"
            label="Translate (Automatic)"
            @click="startTranslation" />
          <ProgressButtonGroup
            :processing1="preparing"
            :processing2="building"
            label1="Translate (Manual) - Prepare"
            label2="Translate (Manual) - Build"
            @click1="prepareTranslation" 
            @click2="buildTranslation" />
          <ProgressButton
            :processing="estimating"
            label="Estimate"
            @click="startEstimation" 
            classes="full-width" />
        </div>
      </div>
      <div class="col col-8 column no-wrap">
        <div class="row q-col-gutter-sm q-mb-sm q-pb-none">
          <TerminalButtonGroup
            v-model:logs-complete="logsComplete"
            v-model:logs-filter="logsFilter"
          />
        </div>
        <Terminal 
          :logs="filteredLogs" 
          class="col scroll" />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import InputGroupSelect from 'src/components/InputGroupSelect.vue';
import InputGroupFolder from 'src/components/InputGroupFolder.vue';
import InputGroupToggle from 'src/components/InputGroupToggle.vue';
import Message from 'src/components/Message.vue';
import Terminal from 'src/components/Terminal.vue';
import TerminalButtonGroup from 'src/components/TerminalButtonGroup.vue';
import ProgressButton from 'src/components/ProgressButton.vue';
import ProgressButtonGroup from 'src/components/ProgressButtonGroup.vue';
import { useTranslate } from 'src/stores/translate';

const translateStore = useTranslate();
const {
  allLanguages,
  startTranslation,
  prepareTranslation,
  buildTranslation,
  startEstimation
} = translateStore;
const { 
  urantiapediaFolder,
  darkTheme,
  sourceLanguage,
  targetLanguage,
  sourceFolder,
  targetFolder,
  translating,
  preparing,
  building,
  estimating,
  logs: logsComplete,
  filteredLogs,
  logsFilter,
  isLibraryBook
} = storeToRefs(translateStore);

const pageStyle = (offset) => {
  // offset is header height (around 50px)
  return { height: `calc(100vh - ${offset}px)` };
};

</script>