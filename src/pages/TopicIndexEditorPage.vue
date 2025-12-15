<template>
  <q-page class="q-pa-md column no-scroll no-wrap" :style-fn="pageStyle">
    <div class="row col q-col-gutter-sm no-wrap">
      <div class="col-auto column no-wrap" style="width: 260px;">
        <div class="col scroll q-pr-sm">
          <InputSelect
            label="Topic categories"
            :options="topicFilters" 
            v-model="filterCategory" />
          <InputSelect
            label="Topic letters"
            :options="topicLetters" 
            v-model="filterLetter" />
          <InputCheck 
            v-model="filterNonRevised" 
            label="Non-Revised" />
          <InputCheck 
            v-model="filterErrors" 
            label="With errors" />
          <InputSelect
            label="Redirects"
            :options="redirectsFilters" 
            v-model="filterRedirects" />
          <div class="row q-col-gutter-xs">
            <div class="col-6">
              <InputSelect
                dense
                label="Length"
                :options="lengthFilters" 
                v-model="filterLengthOp" />
            </div>
            <div class="col-6">
              <q-input 
                dense 
                outlined 
                v-model="filterLengthVal" 
                type="number" 
                label="Value" />
            </div>
          </div>
          <ProgressButton
            :processing="loading"
            label="Load topics"
            class="full-width"
            @click="loadTopics" />
          <div class="text-caption text-italic text-grey-7">
            Topics filtered: <span class="text-weight-bold">{{ filteredCount }}</span>
          </div>
          <Message 
            v-if="error != null"
            type="warning"
            :dark="darkTheme"
            :text="error" />
        </div>
        <div class="col scroll rounded-borders border-grey q-mb-xs-sm">
          <q-list dense separator>
            <TopicListItem
              v-for="topic in topicList"
              :key="topic.name"
              :topic="topic"
              :topic-editing="topicEditing"
              @select-topic="handleTopicSelection"
            />
          </q-list>
        </div>
        <q-btn-dropdown 
          label="Topic Data" 
          color="primary">
          <TopicData
            v-model:topicName="topicName"
            v-model:topicUrl="topicUrl"
            v-model:topicAliases="topicAliases"
            v-model:topicRefs="topicRefs"
            v-model:topicSeeAlso="topicSeeAlso"
            v-model:topicLinks="topicLinks"
            v-model:topicCategory="topicCategory"
            v-model:topicRevised="topicRevised"
          />
        </q-btn-dropdown>
      </div>
      <div class="col column no-wrap">
        <q-banner class="q-mb-sm">Topic content & errors</q-banner>
        <div class="row q-col-gutter-sm">
          <div class="col-4">
            <InputSelect
              dense
              label="Language 1"
              :options="allLanguages" 
              v-model="lang1" />
          </div>
          <div class="col-4">
            <InputSelect
              dense
              label="Language 2"
              :options="allLanguages" 
              v-model="lang2" />
          </div>
          <div class="col-4">
            <InputSelect
              dense
              label="Language 3"
              :options="allLanguages" 
              v-model="lang3" />
          </div>
        </div>
        <div v-if="hasTopics" class="row q-col-gutter-sm">
          <div v-for="n in 3" :key="n" class="col-4">
            <ProgressButton
              label="Request OpenAI"
              color="secondary"
              :processing="loading"
              @click=""
            />
          </div>
        </div>
        <q-card class="col scroll">
            <div class="row full-width">
              <div class="col-12">
                <TopicLines
                  :topicErros="topicErrors"
                  :topicLines="topicLines"
                  :topicOpenAI="topicOpenAI"
                  :topicLineEditing="topicLineEditing"
                  :darkTheme="darkTheme"
                  @select-topic-line="handleTopicLineSelection"
                />
              </div>
            </div>
          </q-card>
      </div>
      <div class="col column no-wrap">
        <q-banner class="q-mb-sm">The Urantia Book content</q-banner>
        <q-card class="col scroll">
          <div class="row full-width">
            <div class="col-12">
              <q-list dense separator>
                <UrantiaBookPars
                  v-for="result in ubPars"
                  :pars="result.pars"
                  :refs="result.refs"
                  :link-to-copy="result.linkToCopy"
                  :text-to-copy="result.textToCopy"
                  :row-class="result.rowClass.join(' ')"
                  :error-class="result.errClass.join(' ')"
                />
              </q-list>
            </div>
          </div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useTopics } from 'src/stores/topics';
import InputCheck from 'src/components/InputCheck.vue';
import InputSelect from 'src/components/InputSelect.vue';
import ProgressButton from 'src/components/ProgressButton.vue';
import Message from 'src/components/Message.vue';
import TopicData from 'src/components/TopicData.vue';
import TopicListItem from 'src/components/TopicListItem.vue';
import TopicLines from 'src/components/TopicLines.vue';
import UrantiaBookPars from 'src/components/UrantiaBookPars.vue';

const topicsStore = useTopics();

const {
  allLanguages,
  topicFilters,
  topicLetters,
  redirectsFilters,
  lengthFilters,
  editAlias,
  editRefs,
  editSeeAlso,
  editLinks,
  loadTopics
} = topicsStore;
const {
  darkTheme,
  filterCategory,
  filterLetter,
  filterNonRevised,
  filterErrors,
  filterRedirects,
  filterLengthOp,
  filterLengthVal,
  loading,
  filteredCount,
  topicList,
  topicEditing,
  topicErrors,
  topicLines,
  topicOpenAI,
  topicLineEditing,
  ubPars,
  saving,
  lang1,
  lang2,
  lang3,
  topicName,
  topicUrl,
  topicAliases,
  topicRevised,
  topicRefs,
  topicSeeAlso,
  topicLinks,
  topicCategory,
  error
} = storeToRefs(topicsStore);

const hasTopics = computed(() => topicLines.value && topicLines.value.length > 0);

const pageStyle = (offset) => {
  // offset is header height (around 50px)
  return { height: `calc(100vh - ${offset}px)` };
};

const handleTopicSelection = (topic) => {
  topicEditing.value = topic.name;
};
const handleTopicLineSelection = (topicLine) => {
  topicLineEditing.value = topicLine.fileline;
};

</script>

<style scoped>
.border-grey {
  border: 1px solid #ddd;
}
</style>