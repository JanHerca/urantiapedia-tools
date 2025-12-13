<template>
  <q-page class="q-pa-md column no-scroll no-wrap" :style-fn="pageStyle">
    <div class="row col q-col-gutter-sm no-wrap">
      <div class="col-auto column no-wrap q-mr-md" style="width: 260px;">
        <div class="col scroll q-pr-sm">
          <InputSelect
            label="Topic categories"
            :options="topicFilters" 
            v-model="filterCategory"
            class="q-mb-sm"
          />
          <InputSelect
            label="Topic letters"
            :options="topicLetters" 
            v-model="filterLetter"
            class="q-mb-sm"
          />
          <q-checkbox 
            v-model="filterNonRevised" 
            label="Non-Revised" 
            size="sm"
            class="q-mb-sm"
          />
          <q-checkbox 
            v-model="filterErrors" 
            label="With errors" 
            size="sm" 
            class="q-mb-sm"
          />
          <InputSelect
            label="Redirects"
            :options="redirectsFilters" 
            v-model="filterRedirects"
            class="q-mb-sm"
          />
          <div class="row q-col-gutter-xs">
            <div class="col-6">
              <InputSelect
                dense
                label="Length"
                :options="lengthFilters" 
                v-model="filterLengthOp"
                class="q-mb-sm"
              />
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
            @click="loadTopics"
          />
          <div class="text-caption text-italic text-grey-7">
            Topics filtered: <span class="text-weight-bold">{{ filteredCount }}</span>
          </div>
          <Message 
              v-if="error != null"
              type="warning"
              :dark="darkTheme"
              :text="error"
              class="q-mb-sm-md"
            />
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
      <div class="col-auto column no-wrap q-mr-md" style="width: 260px;">
        <div class="row q-gutter-sm q-mb-sm">
          <q-btn 
            round dense flat 
            color="primary" 
            icon="add_circle" 
            title="Add topic">
            <q-tooltip>Add topic</q-tooltip>
          </q-btn>
          <q-btn 
            round dense flat 
            color="negative" 
            icon="remove_circle" 
            title="Remove topic">
            <q-tooltip>Remove topic</q-tooltip>
          </q-btn>
          <q-btn 
            round dense flat 
            color="primary" 
            icon="drive_file_rename_outline" 
            title="Rename topic">
            <q-tooltip>Rename topic</q-tooltip>
          </q-btn>
          <q-btn 
            round dense flat 
            color="primary" 
            icon="save" 
            title="Save changes" 
            :loading="saving">
            <q-tooltip>Save changes</q-tooltip>
          </q-btn>
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
        <q-input 
          dense outlined 
          v-model="topicAliases" 
          label="Aliases"
          class="q-mb-sm">
          <template v-slot:after>
            <q-btn 
              round dense flat 
              icon="edit" 
              color="primary" 
              @click="editAlias" />
          </template>
        </q-input>
        <q-input 
          dense outlined 
          v-model="topicRefs" 
          label="Refs" 
          class="q-mb-sm">
          <template v-slot:after>
            <q-btn 
              round dense flat 
              icon="edit" 
              color="primary" 
              @click="editRefs" />
          </template>
        </q-input>
        <q-input 
          dense outlined 
          v-model="topicSeeAlso" 
          label="See Also"
          class="q-mb-sm">
          <template v-slot:after>
            <q-btn 
              round dense flat 
              icon="edit" 
              color="primary" 
              @click="editSeeAlso" />
          </template>
        </q-input>
        <q-input 
          dense outlined 
          v-model="topicLinks" 
          label="Links"
          class="q-mb-sm">
          <template v-slot:after>
            <q-btn 
              round dense flat 
              icon="edit" 
              color="primary" 
              @click="editLinks" />
          </template>
        </q-input>
        <InputSelect
          dense
          label="Category"
          :options="topicFilters" 
          v-model="topicCategory"
          class="q-mb-sm"
        />
        <div class="row items-center justify-end">
          <q-checkbox 
            v-model="topicRevised" 
            label="Revised" 
            dense 
            size="sm" />
        </div>
      </div>
      <div class="col column no-wrap">
        <div class="col-auto q-gutter-y-sm q-mb-sm scroll-x">
          <div class="row q-col-gutter-sm">
            <div class="col-4">
              <InputSelect
                dense
                label="Language 1"
                :options="allLanguages" 
                v-model="lang1"
              />
            </div>
            <div class="col-4">
              <InputSelect
                dense
                label="Language 2"
                :options="allLanguages" 
                v-model="lang2"
              />
            </div>
            <div class="col-4">
              <InputSelect
                dense
                label="Language 3"
                :options="allLanguages" 
                v-model="lang3"
              />
            </div>
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
        <div class="col row q-col-gutter-sm">
          <div class="col-6 column">
            <q-card class="col scroll" bordered flat>
              <q-list dense separator>
                <q-item v-for="n in 20" :key="`line-${n}`">
                  <q-item-section>Topic line content example {{ n }}</q-item-section>
                </q-item>
              </q-list>
            </q-card>
          </div>
          <div class="col-6 column">
            <q-card class="col scroll" bordered flat>
              <q-list dense separator>
                <q-item v-for="n in 20" :key="`ub-${n}`">
                  <q-item-section>UB Content example {{ n }}</q-item-section>
                </q-item>
              </q-list>
            </q-card>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { useTopics } from 'src/stores/topics';
import InputSelect from 'src/components/InputSelect.vue';
import ButtonProgress from 'src/components/ButtonProgress.vue';
import Message from 'src/components/Message.vue';
import TopicListItem from 'src/components/TopicListItem.vue';

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
  selectedTopic,
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

const pageStyle = (offset) => {
  // offset is header height (around 50px)
  return { height: `calc(100vh - ${offset}px)` };
};

const handleTopicSelection = (topic) => {
  topicEditing.value = topic.name;
  console.log('Tópico seleccionado:', topic.name);
};

</script>

<style scoped>
.border-grey {
  border: 1px solid #ddd;
}
</style>