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
        </div>
        <div class="q-pt-sm">
          <Message 
            v-if="urantiapediaFolder === ''"
            type="warning"
            :dark="darkTheme"
            text="Urantiapedia folder is required in Settings." />
          <ProgressButton
            :processing="translating"
            label="Translate"
            @click="startTranslate" />
          <ProgressButton
            :processing="estimating"
            label="Estimate"
            @click="startEstimate" 
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
import Message from 'src/components/Message.vue';
import Terminal from 'src/components/Terminal.vue';
import TerminalButtonGroup from 'src/components/TerminalButtonGroup.vue';
import ProgressButton from 'src/components/ProgressButton.vue';
import { useTranslate } from 'src/stores/translate';

const translateStore = useTranslate();
const {
  allLanguages,
  startTranslate,
  startEstimate
} = translateStore;
const { 
  urantiapediaFolder,
  darkTheme,
  sourceLanguage,
  targetLanguage,
  sourceFolder,
  targetFolder,
  translating,
  estimating,
  logs: logsComplete,
  filteredLogs,
  logsFilter
} = storeToRefs(translateStore);

const pageStyle = (offset) => {
  // offset is header height (around 50px)
  return { height: `calc(100vh - ${offset}px)` };
};

</script>