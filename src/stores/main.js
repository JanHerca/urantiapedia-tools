import { ref, watch, watchEffect, computed } from 'vue';
import { defineStore } from 'pinia';
import { LocalStorage } from 'quasar';
import { Dark } from 'quasar';
import { date } from 'quasar';
import path from 'path';

import { Strings } from 'src/core/strings';
import { Processes } from 'src/core/processes';
import { getStackTraceArray } from 'src/core/utils';

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
  const initialDarkTheme = LocalStorage.getItem('darkTheme') === true;
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
  const processing = ref(false);
  const darkTheme = ref(initialDarkTheme);
  const translateProjectID = ref(initialTransProjID);
  const translateAPIKey = ref(initialTranslateAPIKey);
  const airTableAPIKey = ref(initialAirTableAPIKey);
  const airTableBaseID = ref(initialAirTableBaseID);
  const openAIAPIKey = ref(initialOpenAIAPIKey);
  const translateSourceLanguage = ref(allLanguages[0]);
  const translateTargetLanguage = ref(allLanguages[0]);
  const logs = ref([]);
  const logsFilter = ref(null); //'warning', 'error' or null

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

  watchEffect(() => {
    const selected = Processes[process.value];
    const lan = language.value;
    const extraPath = selected.extraPath && selected.extraPath[lan] 
      ? selected.extraPath[lan] 
      : '';
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
  });

  //Computeds
  const allProcesses = computed(() => {
    return Object.keys(Processes)
      .map(key => ({
        label: (Processes[key].emoji || '') + ' ' + Processes[key].desc[uiLanguage.value],
        value: key,
        active: Processes[key].active
      }))
      .filter(proc => proc.active);
  });

  const filteredLogs = computed(() => {
    return logsFilter.value
      ? logs.value.filter(log => log.type === logsFilter.value)
      : logs.value;
  });

  //Actions
  const addLog = (message, type = 'log', stack = []) => {
    message = message.replace(urantiapediaFolder.value, '{ Urantiapedia Folder }');
    const timeStamp = date.formatDate(Date.now(), 'HH:mm:ss');
    const log = {
      time: timeStamp,
      message,
      type,
    };
    if (stack && stack.length > 0) {
      log.stack = stack;
    }
    logs.value.push(log);
  };

  const addWarning = (msg) => addLog(msg, 'warning');

  const addErrors = (msgOrErrors) => {
    if (Array.isArray(msgOrErrors)) {
      const allErrors = msgOrErrors.every(err => err instanceof Error);
      if (allErrors) {
        const stack = [];
        msgOrErrors.forEach((err, i, array) => {
          const stackArray = getStackTraceArray(err);
          if (stack.length === 0 && stackArray.length > 0) {
            stack.push(...stackArray);
          }
          if (i === array.length - 1) {
            addLog(err.message, 'error', stack);
          } else {
            addLog(err.message, 'error');
          }
        });
      }
      return;
    }
    const arrayMsgOrErrors = Array.isArray(msgOrErrors)
      ? msgOrErrors
      : [msgOrErrors];
    arrayMsgOrErrors.forEach(errMsg => {
      if (errMsg instanceof Error) {
        const stack = getStackTraceArray(errMsg);
        addLog(errMsg.message, 'error', stack);
        return;
      }
      addLog(errMsg, 'error');
    });
  };

  const addSuccess = (msg) => addLog(msg, 'success');

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
    processing,
    darkTheme,
    translateProjectID,
    translateAPIKey,
    airTableAPIKey,
    airTableBaseID,
    openAIAPIKey,
    translateSourceLanguage,
    translateTargetLanguage,
    logs,
    logsFilter,
    //Computeds
    allProcesses,
    filteredLogs,
    //Actions
    addLog,
    addWarning,
    addErrors,
    addSuccess,
  };
});
