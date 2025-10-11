<template>
  <q-page class="q-pa-sm-md">
    <InputGroupSelect
      id="drpLanguage"
      label="UI Language"
      :options="uiLanguages"
      v-model="uiLanguage"
      class="q-pa-sm-none q-mb-sm-md"
    />
    <InputGroupToggle
      id="tglDarkTheme"
      label="Dark Theme"
      v-model="darkTheme"
      class="q-pa-sm-none q-mb-sm-md"
    />
    <InputGroupPassword
      id="txtTranslateProjectID"
      label="Google Cloud Project ID"
      v-model="translateProjectID"
      class="q-pa-sm-none q-mb-sm-md"
      classes="full-width"
    />
    <InputGroupPassword
      id="txtTranslateAPIKey"
      label="Google Cloud Translation API Key"
      v-model="translateAPIKey"
      class="q-pa-sm-none q-mb-sm-md"
      classes="full-width"
    />
    <InputGroupPassword
      id="txtAirTableAPIKey"
      label="AirTable API Key or Token"
      v-model="airTableAPIKey"
      class="q-pa-sm-none q-mb-sm-md"
      classes="full-width"
    />
    <InputGroupPassword
      id="txtAirTableBaseID"
      label="AirTable Base ID (of database called 'UB Database')"
      v-model="airTableBaseID"
      class="q-pa-sm-none q-mb-sm-md"
      classes="full-width"
    />
    <InputGroupPassword
      id="txtOpenAIAPIKey"
      label="OpenAI API key"
      v-model="openAIAPIKey"
      class="q-pa-sm-none q-mb-sm-md"
      classes="full-width"
    />
  </q-page>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import InputGroupSelect from 'src/components/InputGroupSelect.vue';
import InputGroupToggle from 'src/components/InputGroupToggle.vue';
import InputGroupPassword from 'src/components/InputGroupPassword.vue';
import { useMain } from 'src/stores/main';

const mainStore = useMain();
const { uiLanguages } = mainStore;
const { 
  uiLanguage, 
  darkTheme,
  translateProjectID,
  translateAPIKey,
  airTableAPIKey,
  airTableBaseID,
  openAIAPIKey
} = storeToRefs(mainStore);



</script>