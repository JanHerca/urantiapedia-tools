<template>
  <q-page class="q-pa-md column no-scroll no-wrap" :style-fn="pageStyle">
    <div class="row col q-col-gutter-sm no-wrap">
      <div class="col-auto column no-wrap" style="width: 300px;">
        <div class="col scroll q-pr-sm">
          <InputGroupTextArea
            label="Old Refs"
            placeholder="1390.1;1392.5;1501"
            :rows="3"
            class="q-mb-sm"
            v-model="oldRefs"
          />
          <InputGroupTextArea
            label="New Refs"
            placeholder="126:3.6;126:4.7;135:5"
            :rows="3"
            class="q-mb-sm"
            v-model="newRefs"
          />
          <InputGroupTextArea
            label="Text"
            placeholder="the only possible meaning the term Messiah"
            :rows="3"
            class="q-mb-sm"
            v-model="searchText"
          />
          <InputGroupFile
            label="File"
            placeholder="Browse path"
            v-model="fileName"
            class="q-pa-sm-none q-mb-sm-md"
            classes="full-width"
          />
          <q-checkbox 
            v-model="isFileSecondLan" 
            label="File is in second language" 
            size="sm" 
            class="q-mb-sm" />
          <InputSelect
            label="Search language"
            :options="allLanguages" 
            v-model="searchLanguage"
            class="q-mb-sm"
          />
          <InputSelect
            label="Second language"
            :options="allLanguages" 
            v-model="secondLanguage"
            class="q-mb-sm"
          />
          <q-checkbox 
            v-model="copyWithQuotes" 
            label="Copy with quotation marks" 
            size="sm" 
            class="q-mb-sm" 
          />
          <q-checkbox 
            v-model="copyWithLink" 
            label="Copy text with link" 
            size="sm" 
            class="q-mb-sm" 
          />
          <InputSelect
            label="Copy type"
            :options="copyTypes" 
            v-model="copyType"
            class="q-mb-sm"
          />
        </div>
        <div class="q-pt-sm">
          <ButtonProgress
            :processing="isSearching"
            :label="Strings.btnSearch[uiLanguage]"
            class="full-width"
            @click="startSearch"
          />
          <ButtonProgress
            :processing="isAddingQuotes"
            label="Add Quotes to Files"
            class="full-width"
            @click="addQuotes"
          />
          <Message 
            v-if="error != null"
            type="warning"
            :dark="darkTheme"
            :text="error"
            class="q-mb-sm-md"
          />
        </div>
      </div>

      <div class="col column no-wrap">
        <div class="row q-col-gutter-sm q-mb-sm q-pb-none">
          <div class="col-6">
            <q-banner>Results in search language</q-banner>
          </div>
          <div class="col-6">
            <q-banner>Results in second language</q-banner>
          </div>
        </div>
        <q-card class="col scroll">
          <div class="row full-width">
            <div class="col-12">
              <q-list bordered separator>
                <UrantiaBookPars
                  v-for="result in searchResults"
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
import { storeToRefs } from 'pinia';
import { useSearch } from 'src/stores/search';
import { Strings } from 'src/core/strings';
import InputGroupTextArea from 'src/components/InputGroupTextArea.vue';
import InputGroupFile from 'src/components/InputGroupFile.vue';
import InputSelect from 'src/components/InputSelect.vue';
import UrantiaBookPars from 'src/components/UrantiaBookPars.vue';
import ButtonProgress from 'src/components/ButtonProgress.vue';
import Message from 'src/components/Message.vue';

const searchStore = useSearch();

const {
  allLanguages,
  copyTypes,
  startSearch,
  addQuotes 
} = searchStore;
const {
  uiLanguage,
  darkTheme,
  oldRefs,
  newRefs,
  searchText,
  fileName,
  isFileSecondLan,
  searchLanguage,
  secondLanguage,
  copyWithQuotes,
  copyWithLink,
  copyType,
  isSearching,
  isAddingQuotes,
  searchResults,
  error
} = storeToRefs(searchStore);

const pageStyle = (offset) => {
  // offset is header height (around 50px)
  return { height: `calc(100vh - ${offset}px)` };
};

</script>

<style scoped>

</style>