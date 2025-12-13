<template>
  <q-page class="q-pa-md column">
    <div class="row col q-col-gutter-md">
      <div class="col-12 col-md-6 column">
        <InputGroupSelect 
          :label="Strings.lblLanguage[uiLanguage]" 
          :options="allLanguages" 
          v-model="language"
          class="q-pa-sm-none q-mb-sm-md"
        />
        <InputGroupSelect 
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
          <InputGroupSelect 
            v-if="control.type === 'select'"
            :label="Strings[`lbl${control.subtype}`][uiLanguage]" 
            :options="control.values" 
            v-model="control.value"
            class="q-pa-sm-none q-mb-sm-md"
          />
          <InputGroupText
            v-if="control.type === 'text'"
            :label="control.label"
            :placeholder="control.placeholder"
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
          <ButtonProgress
            :processing="processing"
            :label="Strings.exeButton[uiLanguage]"
            @click="onExecuteClick"
          />
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
import InputGroupText from 'src/components/InputGroupText.vue';
import Message from 'src/components/Message.vue';
import Terminal from 'src/components/Terminal.vue';
import ButtonProgress from 'src/components/ButtonProgress.vue';
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
  useBOOK_MULTIPLE_JSON_TOPICS_TXT_TO_WIKIJS,
  useBOOK_INDEX_JSON_TO_WIKIJS,
  useBOOK_INDEX_MULTIPLE_JSON_TO_WIKIJS,
  useBIBLE_TEX_BIBLEREF_MARKDOWN_TO_WIKIJS,
  useBIBLE_TEX_TO_BIBLEINDEX_WIKIJS,
  useBIBLE_UPDATE_TITLES_WIKIJS,
  useBIBLE_TEX_CHECK,
  useTOPICS_TXT_TO_WIKIJS,
  useTOPICS_INDEX_TXT_TO_WIKIJS,
  useREVIEW_TOPIC_TXT_LU_JSON,
  useREVIEW_TOPIC_THREE_LANS,
  useSUM_TOPIC_TXT,
  useNORM_TOPIC_TXT,
  useARTICLE_INDEX_TO_WIKIJS,
  useARTICLE_INDEX_ADD_FROM_TRANSLATION,
  useARTICLE_NAVIGATION_HEADERS_IN_WIKIJS,
  useARTICLE_ANCHORS_IN_WIKIJS,
  useARTICLE_CREATE_PARALELLS_FROM_WIKIJS,
  useARTICLE_CREATE_BLANK_FROM_LIST,
  useARTICLE_COPY_TO_FOLDER,
  useLIBRARY_CREATE_BLANK_FROM_LIST,
  useFIX_MARKDOWN_FOOTNOTES,
  useALL_INDEXES,
  usePARALELL_INDEX
} from 'src/composables/processes';


const mainStore = useMain();
const { 
  topicTypes, 
  allLanguages, 
  addLog, 
  addWarning, 
  addErrors, 
  addSuccess,
  addTable
} = mainStore;
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

const topicIndexes = ['ALL', ...topicTypes];

//Handlers

const onExecuteClick = () => {
  const values = processData.value.controls.map(c => {
    return c.type === 'file' || c.type === 'folder' 
      ? c.value.replace('{ Urantiapedia Folder }', urantiapediaFolder.value)
      : c.value;
  });
  let executor;
  const basicParams = [language, uiLanguage, processing, addLog, addErrors, 
    addSuccess];
  switch (process.value) {
    case 'BIBLEREF_TXT_BOOK_JSON_TO_TXT':
      executor = useBIBLEREF_TXT_BOOK_JSON_TO_TXT(...basicParams);
      break;
    case 'BIBLEREF_JSON_TO_MARKDOWN':
      executor = useBIBLEREF_JSON_TO_MARKDOWN(...basicParams);
      break;
    case 'BOOK_JSON_TO_BIBLEREF_JSON':
      executor = useBOOK_JSON_TO_BIBLEREF_JSON(...basicParams);
      break;
    case 'BOOK_JSON_BIBLEREF_JSON_TO_JSON':
      executor = useBOOK_JSON_BIBLEREF_JSON_TO_JSON(...basicParams);
      break;
    case 'BOOK_JSON_BIBLEREF_MARKDOWN_TO_JSON':
      values.push(urantiapediaFolder.value);
      executor = useBOOK_JSON_BIBLEREF_MARKDOWN_TO_JSON(...basicParams);
      break;
    case 'BOOK_JSON_SUBSECTIONS_TSV_TO_JSON':
      executor = useBOOK_JSON_SUBSECTIONS_TSV_TO_JSON(...basicParams);
      break;
    case 'BOOK_HTML_TO_JSON':
      executor = useBOOK_HTML_TO_JSON(...basicParams);
      break;
    case 'BOOK_JSON_TO_TXT':
      executor = useBOOK_JSON_TO_TXT(...basicParams);
      break;
    case 'BOOK_JSON_TOPICS_TXT_TO_WIKIJS':
      values.push(urantiapediaFolder.value);
      executor = useBOOK_JSON_TOPICS_TXT_TO_WIKIJS(...basicParams, addWarning);
      break;
    case 'BOOK_MULTIPLE_JSON_TOPICS_TXT_TO_WIKIJS':
      values.push(urantiapediaFolder.value);
      executor = useBOOK_MULTIPLE_JSON_TOPICS_TXT_TO_WIKIJS(...basicParams, addWarning);
      break;
    case 'BOOK_INDEX_JSON_TO_WIKIJS':
      executor = useBOOK_INDEX_JSON_TO_WIKIJS(...basicParams);
      break;
    case 'BOOK_INDEX_MULTIPLE_JSON_TO_WIKIJS':
      executor = useBOOK_INDEX_MULTIPLE_JSON_TO_WIKIJS(...basicParams);
      break;
    case 'BIBLE_TEX_BIBLEREF_MARKDOWN_TO_WIKIJS':
      executor = useBIBLE_TEX_BIBLEREF_MARKDOWN_TO_WIKIJS(...basicParams, addWarning);
      break;
    case 'BIBLE_TEX_TO_BIBLEINDEX_WIKIJS':
      executor = useBIBLE_TEX_TO_BIBLEINDEX_WIKIJS(...basicParams);
      break;
    case 'BIBLE_UPDATE_TITLES_WIKIJS':
      executor = useBIBLE_UPDATE_TITLES_WIKIJS(...basicParams);
      break;
    case 'BIBLE_TEX_CHECK':
      executor = useBIBLE_TEX_CHECK(...basicParams);
      break;
    case 'TOPICS_TXT_TO_WIKIJS':
      executor = useTOPICS_TXT_TO_WIKIJS(...basicParams);
      break;
    case 'TOPICS_INDEX_TXT_TO_WIKIJS':
      executor = useTOPICS_INDEX_TXT_TO_WIKIJS(...basicParams, topicIndexes);
      break;
    case 'REVIEW_TOPIC_TXT_LU_JSON':
      executor = useREVIEW_TOPIC_TXT_LU_JSON(...basicParams);
      break;
    case 'REVIEW_TOPIC_THREE_LANS':
      executor = useREVIEW_TOPIC_THREE_LANS(...basicParams);
      break;
    case 'SUM_TOPIC_TXT':
      executor = useSUM_TOPIC_TXT(...basicParams, addTable, topicTypes);
      break;
    case 'NORM_TOPIC_TXT':
      executor = useNORM_TOPIC_TXT(...basicParams);
      break;
    case 'ARTICLE_INDEX_TO_WIKIJS':
      executor = useARTICLE_INDEX_TO_WIKIJS(...basicParams);
      break;
    case 'ARTICLE_INDEX_ADD_FROM_TRANSLATION':
      executor = useARTICLE_INDEX_ADD_FROM_TRANSLATION(...basicParams);
      break;
    case 'ARTICLE_NAVIGATION_HEADERS_IN_WIKIJS':
      executor = useARTICLE_NAVIGATION_HEADERS_IN_WIKIJS(...basicParams);
      break;
    case 'ARTICLE_ANCHORS_IN_WIKIJS':
      executor = useARTICLE_ANCHORS_IN_WIKIJS(...basicParams);
      break;
    case 'ARTICLE_CREATE_PARALELLS_FROM_WIKIJS':
      executor = useARTICLE_CREATE_PARALELLS_FROM_WIKIJS(...basicParams);
      break;
    case 'ARTICLE_CREATE_BLANK_FROM_LIST':
      executor = useARTICLE_CREATE_BLANK_FROM_LIST(...basicParams);
      break;
    case 'ARTICLE_AUTHORS_INDEXES':
      executor = useARTICLE_AUTHORS_INDEXES(...basicParams);
      break;
    case 'ARTICLE_COPY_TO_FOLDER':
      executor = useARTICLE_COPY_TO_FOLDER(...basicParams);
      break;
    case 'LIBRARY_CREATE_BLANK_FROM_LIST':
      executor = useLIBRARY_CREATE_BLANK_FROM_LIST(...basicParams);
      break;
    case 'FIX_MARKDOWN_FOOTNOTES':
      executor = useFIX_MARKDOWN_FOOTNOTES(...basicParams, addWarning);
      break;
    case 'ALL_INDEXES':
      executor = useALL_INDEXES(...basicParams);
      break;
    case 'PARALELL_INDEX':
      executor = usePARALELL_INDEX(...basicParams);
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