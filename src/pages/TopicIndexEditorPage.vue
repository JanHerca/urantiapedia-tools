<template>
  <q-page class="q-pa-md column no-scroll no-wrap" :style-fn="pageStyle">
    <div class="row col q-col-gutter-sm no-wrap">
      <div class="col-auto column no-wrap q-mr-md" style="width: 260px;">
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
          <ButtonProgress
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
        <q-separator class="q-my-sm" />
        <div class="col scroll rounded-borders border-grey">
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
      </div>
      <div class="col column no-wrap">
        <q-tabs
          dense
          v-model="tab"
          align="justify"
          class="bg-primary text-white shadow-2"
          :breakpoint="0"
          >
          <q-tab name="edit_data" label="Edit Data" icon="edit_document" />
          <q-tab name="edit_lines" label="Edit Lines" icon="edit_note" />
        </q-tabs>
        <q-separator />
        <q-tab-panels v-model="tab" animated class="no-scroll no-wrap">
          <q-tab-panel name="edit_data" class="no-scroll no-wrap">
            <div class="col-auto column no-wrap q-mr-md" style="width: 260px;">
              <div class="row q-gutter-sm q-mb-sm">
                <RoundButton icon="add_circle" title="Add topic" />
                <RoundButton icon="remove_circle" title="Remove topic" color="negative" />
                <RoundButton icon="drive_file_rename_outline" title="Rename topic" />
                <RoundButton icon="save" title="Save changes" />
              </div>
              <q-input 
                dense outlined 
                v-model="topicName" 
                label="Name" 
                class="q-mb-sm"
              />
              <q-input 
                dense outlined 
                v-model="topicUrl" 
                label="URL"
                class="q-mb-sm">
                <template v-slot:append>
                  <q-btn 
                    dense flat 
                    icon="link" 
                    type="a" 
                    :href="topicUrl" 
                    target="_blank" />
                </template>
              </q-input>
              <InputEdit label="Aliases" v-model="topicAliases" @click="editAlias" />
              <InputEdit label="Refs" v-model="topicRefs" @click="editRefs" />
              <InputEdit label="See Also" v-model="topicSeeAlso" @click="editSeeAlso" />
              <InputEdit label="Links" v-model="topicLinks" @click="editLinks" />
              <InputSelect
                dense
                label="Category"
                :options="topicFilters" 
                v-model="topicCategory" />
              <div class="row items-center justify-end">
                <q-checkbox 
                  v-model="topicRevised" 
                  label="Revised" 
                  dense 
                  size="sm" />
              </div>
            </div>
          </q-tab-panel>
          <q-tab-panel name="edit_lines" class="no-scroll no-wrap">
            <div class="col column no-wrap">
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
              <div class="row q-col-gutter-sm q-mb-xs">
                <div class="col-6">
                  <q-banner>Topic content & errors</q-banner>
                </div>
                <div class="col-6">
                  <q-banner>The Urantia Book content</q-banner>
                </div>
              </div>
              <div class="row q-col-gutter-sm">
                <div class="col-6 column">
                  <q-card class="col scroll" bordered flat>
                    <TopicLines
                      :topicErros="topicErrors"
                      :topicLines="topicLines"
                      :topicOpenAI="topicOpenAI"
                      :topicLineEditing="topicLineEditing"
                      :darkTheme="darkTheme"
                      @select-topic-line="handleTopicLineSelection"
                    />
                  </q-card>
                </div>
                <div class="col-6 column">
                  <q-card class="col scroll" bordered flat>
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
                  </q-card>
                </div>
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useTopics } from 'src/stores/topics';
import InputCheck from 'src/components/InputCheck.vue';
import InputEdit from 'src/components/InputEdit.vue';
import InputSelect from 'src/components/InputSelect.vue';
import ButtonProgress from 'src/components/ButtonProgress.vue';
import Message from 'src/components/Message.vue';
import RoundButton from 'src/components/RoundButton.vue';
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

const tab = ref('edit_data');

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