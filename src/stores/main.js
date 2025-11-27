import { ref, watch, computed } from 'vue';
import { defineStore } from 'pinia';
import { LocalStorage } from 'quasar';
import { Dark } from 'quasar';
import { date } from 'quasar';
import path from 'path';

import { Strings } from 'src/core/strings';
import { Processes } from 'src/core/processes';

export const useMain = defineStore('main', () => {
  const API = window.NodeAPI;

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
  const initialDarkTheme = LocalStorage.getItem('darkTheme') === 'true';
  const initialUrantiapediaFolder = LocalStorage.getItem('urantiapediaFolder') || '';
  const initialTransProjID = LocalStorage.getItem('translateProjectID') || '';
  const initialTranslateAPIKey = LocalStorage.getItem('translateAPIKey') || '';
  const initialAirTableAPIKey = LocalStorage.getItem('airTableAPIKey') || '';
  const initialAirTableBaseID = LocalStorage.getItem('airTableBaseID') || '';
  const initialOpenAIAPIKey = LocalStorage.getItem('openAIAPIKey') || '';

  //State
  const language = ref('en');
  const uiLanguage = ref(uiLanCode);
  const urantiapediaFolder = ref(initialUrantiapediaFolder);
  const process = ref('BIBLEREF_TXT_BOOK_JSON_TO_TXT');
  const processData = ref({ active: false, desc: {}, controls: [] });
  const darkTheme = ref(initialDarkTheme);
  const translateProjectID = ref(initialTransProjID);
  const translateAPIKey = ref(initialTranslateAPIKey);
  const airTableAPIKey = ref(initialAirTableAPIKey);
  const airTableBaseID = ref(initialAirTableBaseID);
  const openAIAPIKey = ref(initialOpenAIAPIKey);
  const translateSourceLanguage = ref(allLanguages[0]);
  const translateTargetLanguage = ref(allLanguages[0]);
  const logs = ref([]);

  //Watchers
  watch(uiLanguage, (newVal) => {
    LocalStorage.set('language', newVal);
  });

  watch(darkTheme, (newVal) => {
    LocalStorage.set('darkTheme', newVal);
    Dark.set(newVal);
  });

  watch(urantiapediaFolder, (newVal) => {
    LocalStorage.set('urantiapediaFolder', newVal);
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

  watch(process, (newVal) => {
    const selected = Processes[newVal];
    const lan = language.value;
    const extraPath = selected.extraPath && selected.extraPath[lan] 
      ? selected.extraPath[lan] 
      : '';
    // const resolveControl = async(c) => {
    //   const control = { type: c.type };
    //   if (c.type === 'file' || c.type === 'folder') {
    //     control.value = (await API.pathJoin('{ Urantiapedia Folder }', ...c.value))
    //       .replace('{0}', lan)
    //       .replace('{extraPath}', extraPath);
    //   }
    //   return control;
    // }
    // Promise.all(selected.controls.map(c => resolveControl(c)))
    //   .then(resolvedControls => {
    //     processData.value = {
    //       controls: resolvedControls
    //     };
    //   });
    processData.value = {
      controls: selected.controls.map(c => {
        const control = { type: c.type };
        if (c.type === 'file' || c.type === 'folder') {
          control.value = path.join('{ Urantiapedia Folder }', ...c.value)
            .replace('{0}', lan)
            .replace('{extraPath}', extraPath);
        }
        return control;
      })
    };
  }, { immediate: true });

  //Computeds
  const allProcesses = computed(() => {
    return Object.keys(Processes)
      .map(key => ({
        label: Processes[key].desc[uiLanguage.value],
        value: key,
        active: Processes[key].active
      }))
      .filter(proc => proc.active);
  });

  //Actions
  const addLog = (message, type = 'log') => {
    const timeStamp = date.formatDate(Date.now(), 'HH:mm:ss');
    logs.value.push({
      time: timeStamp,
      message: message,
      type: type,
    });
  };

  const addWarning = (msg) => addLog(msg, 'warning');

  const addError = (msg) => addLog(msg, 'error');

  return {
    //Constants
    uiLanguages,
    allLanguages,
    //State
    language,
    uiLanguage,
    urantiapediaFolder,
    process,
    processData,
    darkTheme,
    translateProjectID,
    translateAPIKey,
    airTableAPIKey,
    airTableBaseID,
    openAIAPIKey,
    translateSourceLanguage,
    translateTargetLanguage,
    logs,
    //Computeds
    allProcesses,
    //Actions
    addLog,
    addWarning,
    addError,
  };
});
