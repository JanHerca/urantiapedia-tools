<template>
  <q-page class="q-pa-md column">
    <div class="row col q-col-gutter-md">
      <div class="col-12 col-md-6 column">
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
        <div
          v-for="control in processData.controls">
          <InputGroupFolder
            v-if="control.type === 'folder'"
            label="Folder"
            v-model="control.value"
            :basePath="urantiapediaFolder"
            class="q-pa-sm-none q-mb-sm-md"
            classes="full-width"
          />
          <InputGroupFile
            v-if="control.type === 'file'"
            label="File"
            v-model="control.value"
            class="q-pa-sm-none q-mb-sm-md"
            classes="full-width"
          />
        </div>
        <Message 
          v-if="urantiapediaFolder === ''"
          type="warning"
          :dark="darkTheme"
          text="Urantiapedia folder is required in Settings."
          class="q-mb-sm-md"
        />
        <div>
          <q-btn 
            color="primary"
            class="q-mb-sm-md"
            :disabled="processing"
            @click="onExecuteClick">
            <div v-if="processing" class="row items-center q-pr-sm">
              <q-spinner
                color="white"
                size="1em"
              />
            </div>
            {{ Strings.exeButton[uiLanguage] }}
          </q-btn>
        </div>
      </div>
      <div class="col-12 col-md-6 column">
        <Terminal 
          :logs="filteredLogs" 
          class="col" />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import InputGroupSelect from 'src/components/InputGroupSelect.vue';
import InputGroupFolder from 'src/components/InputGroupFolder.vue';
import InputGroupFile from 'src/components/InputGroupFile.vue';
import Message from 'src/components/Message.vue';
import Terminal from 'src/components/Terminal.vue';
import { Strings } from 'src/core/strings';
import { useMain } from 'src/stores/main';
import { 
  useBIBLEREF_TXT_BOOK_JSON_TO_TXT,
  useBIBLEREF_JSON_TO_MARKDOWN,
  useBOOK_JSON_TO_BIBLEREF_JSON,
  useBOOK_JSON_BIBLEREF_JSON_TO_JSON,
  useBOOK_JSON_BIBLEREF_MARKDOWN_TO_JSON,
  useBOOK_JSON_SUBSECTIONS_TSV_TO_JSON,
  useBOOK_HTML_TO_JSON,
  useBOOK_JSON_TO_TXT,
  useBOOK_JSON_TOPICS_TXT_TO_WIKIJS,
  useBOOK_MULTIPLE_JSON_TOPICS_TXT_TO_WIKIJS
} from 'src/composables/processes';


const mainStore = useMain();
const { allLanguages, addLog, addWarning, addErrors, addSuccess } = mainStore;
const {
  language,
  uiLanguage,
  darkTheme,
  urantiapediaFolder,
  process,
  processData,
  processing,
  allProcesses,
  filteredLogs,
} = storeToRefs(mainStore);

//Handlers

const onExecuteClick = () => {
  const values = processData.value.controls.map(c => {
    return c.type === 'file' || c.type === 'folder' 
      ? c.value.replace('{ Urantiapedia Folder }', urantiapediaFolder.value)
      : c.value;
  });
  let executor;
  switch (process.value) {
    case 'BIBLEREF_TXT_BOOK_JSON_TO_TXT':
      executor = useBIBLEREF_TXT_BOOK_JSON_TO_TXT(
        language, uiLanguage, processing, addLog, addErrors, addSuccess);
      break;
    case 'BIBLEREF_JSON_TO_MARKDOWN':
      executor = useBIBLEREF_JSON_TO_MARKDOWN(
        language, uiLanguage, processing, addLog, addErrors, addSuccess);
      break;
    case 'BOOK_JSON_TO_BIBLEREF_JSON':
      executor = useBOOK_JSON_TO_BIBLEREF_JSON(
        language, uiLanguage, processing, addLog, addErrors, addSuccess);
      break;
    case 'BOOK_JSON_BIBLEREF_JSON_TO_JSON':
      executor = useBOOK_JSON_BIBLEREF_JSON_TO_JSON(
        language, uiLanguage, processing, addLog, addErrors, addSuccess);
      break;
    case 'BOOK_JSON_BIBLEREF_MARKDOWN_TO_JSON':
      values.push(urantiapediaFolder.value);
      executor = useBOOK_JSON_BIBLEREF_MARKDOWN_TO_JSON(
        language, uiLanguage, processing, addLog, addErrors, addSuccess);
      break;
    case 'BOOK_JSON_SUBSECTIONS_TSV_TO_JSON':
      executor = useBOOK_JSON_SUBSECTIONS_TSV_TO_JSON(
        language, uiLanguage, processing, addLog, addErrors, addSuccess);
      break;
    case 'BOOK_HTML_TO_JSON':
      executor = useBOOK_HTML_TO_JSON(
        language, uiLanguage, processing, addLog, addErrors, addSuccess);
      break;
    case 'BOOK_JSON_TO_TXT':
      executor = useBOOK_JSON_TO_TXT(
        language, uiLanguage, processing, addLog, addErrors, addSuccess);
      break;
    case 'BOOK_JSON_TOPICS_TXT_TO_WIKIJS':
      values.push(urantiapediaFolder.value);
      executor = useBOOK_JSON_TOPICS_TXT_TO_WIKIJS(
        language, uiLanguage, processing, addLog, addWarning, addErrors, addSuccess);
      break;
    case 'BOOK_MULTIPLE_JSON_TOPICS_TXT_TO_WIKIJS':
      values.push(urantiapediaFolder.value);
      executor = useBOOK_MULTIPLE_JSON_TOPICS_TXT_TO_WIKIJS(
        language, uiLanguage, processing, addLog, addWarning, addErrors, addSuccess);
      break;
    default:
      addErrors(`Process "${process.value}" is not implemented.`);
      break;
  }
  if (executor) {
    const { executeProcess } = executor;
    executeProcess(...values);
  }
};

</script>

<style scoped>

</style>