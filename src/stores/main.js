import { ref, watch } from 'vue';
import { defineStore } from 'pinia';
import { LocalStorage } from 'quasar';
import { Dark } from 'quasar';

import { Strings } from 'src/core/strings';

export const useMain = defineStore('main', () => {
  //Constants
  const uiLanguages = [
    { label: 'English', value: 'en' },
    { label: 'Spanish', value: 'es' }
  ];
  const allLanguages = Object.keys(Strings.bookLanguages).map(code => ({
    label: Strings.bookLanguages[code],
    value: code
  }));

  //Storage
  const uiLanCode = LocalStorage.getItem('language') || 'en';
  const initialLan = uiLanguages.find(l => l.value === uiLanCode) || uiLanguages[0];
  const initialDarkTheme = LocalStorage.getItem('darkTheme') === 'true';
  const initialTransProjID = LocalStorage.getItem('translateProjectID') || '';
  const initialTranslateAPIKey = LocalStorage.getItem('translateAPIKey') || '';
  const initialAirTableAPIKey = LocalStorage.getItem('airTableAPIKey') || '';
  const initialAirTableBaseID = LocalStorage.getItem('airTableBaseID') || '';
  const initialOpenAIAPIKey = LocalStorage.getItem('openAIAPIKey') || '';

  //State
  const uiLanguage = ref({...initialLan});
  const darkTheme = ref(initialDarkTheme);
  const translateProjectID = ref(initialTransProjID);
  const translateAPIKey = ref(initialTranslateAPIKey);
  const airTableAPIKey = ref(initialAirTableAPIKey);
  const airTableBaseID = ref(initialAirTableBaseID);
  const openAIAPIKey = ref(initialOpenAIAPIKey);
  const translateSourceLanguage = ref(allLanguages[0]);
  const translateTargetLanguage = ref(allLanguages[0]);

  //Watchers
  watch(uiLanguage, (newVal) => {
    LocalStorage.set('language', newVal.value);
  });

  watch(darkTheme, (newVal) => {
    LocalStorage.set('darkTheme', newVal);
    Dark.set(newVal);
  });

  watch(translateProjectID, (newVal) => {
    LocalStorage.set('translateProjectID', newVal);
  });

  watch(translateAPIKey, (newVal) => {
    LocalStorage.set('translateAPIKey', newVal);
  });

  watch(airTableAPIKey, (newVal) => {
    LocalStorage.set('airTableAPIKey', newVal);
  });

  watch(airTableBaseID, (newVal) => {
    LocalStorage.set('airTableBaseID', newVal);
  });

  watch(openAIAPIKey, (newVal) => {
    LocalStorage.set('openAIAPIKey', newVal);
  });

  //Actions

  return {
    //Constants
    uiLanguages,
    allLanguages,
    //State
    uiLanguage,
    darkTheme,
    translateProjectID,
    translateAPIKey,
    airTableAPIKey,
    airTableBaseID,
    openAIAPIKey,
    translateSourceLanguage,
    translateTargetLanguage,
    //Actions

  };
});
