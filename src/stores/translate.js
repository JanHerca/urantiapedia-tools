import { ref, watch } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import { useMain } from 'src/stores/main.js';
import { UrantiaBook } from 'src/core/urantiabook.js';
import { useReadFromJSON } from 'src/composables/urantiabook/useReadFromJSON.js';
import { useEstimateFolder } from 'src/composables/translate/useEstimateFolder';

import path from 'path';

export const useTranslate = defineStore('translate', () => {
  const mainStore = useMain();
  const { 
    allLanguages, 
    addLog,
    addWarning,
    addErrors,
    addSuccess,
    addTable
  } = mainStore;
  const {
    uiLanguage,
    urantiapediaFolder,
    darkTheme,
    logs,
    filteredLogs,
    logsFilter,
    translateProjectID,
    translateAPIKey,
  } = storeToRefs(mainStore);

  const { readFromJSON } = useReadFromJSON(uiLanguage, addLog);
  const { estimateFolder } = useEstimateFolder(uiLanguage, addLog, addWarning);

  // Constants

  //Variables
  let sourceBook = null;
  let targetBook = null;
  const objects = {};

  //Storage
  const sourceLanguage = ref('en');
  const targetLanguage = ref('es');
  const sourceFolder = ref('');
  const targetFolder = ref('');
  const translating = ref(false);
  const estimating = ref(false);

  //Functions
  const loadTranslateBooks = async () => {
    const root = path.join(urantiapediaFolder.value, 'input', 'json');
    const dirSourceBook = path.join(root, `book-${sourceLanguage.value}`);
    const dirTargetBook = path.join(root, `book-${targetLanguage.value}`);

    const loadSource = (
      !sourceBook ||
      sourceBook.language != sourceLanguage.value ||
      sourceBook.papers.length == 0);
    const loadTarget = (
      !targetBook ||
      targetBook.language != targetLanguage.value ||
      targetBook.papers.length == 0);

    if (loadSource) {
      const sourcePapers = await readFromJSON(dirSourceBook);
      sourceBook = new UrantiaBook(sourceLanguage.value, sourcePapers);
    }
    if (loadTarget) {
      const targetPapers = await readFromJSON(dirTargetBook);
      targetBook = new UrantiaBook(targetLanguage.value, targetPapers);
    }
  };

  // const showTranslateLog = (issues) => {
  //   controls.logAreaTranslate.innerHTML = issues
  //     .map(arIssuesOrErr => {
  //       if (arIssuesOrErr instanceof Error) {
  //         return arIssuesOrErr.stack.split('\n').map((s, i) => {
  //           return (i === 0 ?
  //             `<p class="text-danger mt-1 mb-0">${s}</p>` :
  //             `<p class="text-danger ml-3 mb-0 small">${s}</p>`);
  //         }).join('');
  //       }
  //       return arIssuesOrErr.map((info, i) => {
  //         return (i == 0 ?
  //           `<p class="mb-1">${info}</p>` :
  //           `<p class="mb-1 alert alert-light small">${info}</p>`);
  //       }).join('');
  //     }).join('');
  // };

  // const showTranslateError = (errors) => {
  //   controls.logAreaTranslate.innerHTML = errors.map(err => {
  //     return err.stack.split('\n').map((s, i) => {
  //       return (i === 0 ?
  //         `<p class="text-danger mt-1 mb-0">${s}</p>` :
  //         `<p class="text-danger ml-3 mb-0 small">${s}</p>`);
  //     }).join('');
  //   }).join('');
  // };

  //Actions
  const startTranslate = async () => {
    // if (urantiapediaFolder.value === '') return;
    // const isLibraryBook = path.basename(sourceFolder.value.replace(/\\/g, '/')).startsWith('book');

    // if (!sourceFolder.value || sourceFolder.value == '' ||
    //   !targetFolder.value || targetFolder.value == '') {
    //   showTranslateError([new Error('Folder missing.')]);
    //   return;
    // }

    // //Test to translate a text
    // // translator.translateText('¡Hola mundo!', sourceLanguage.value, targetLanguage.value)
    // // 	.then(translations => alert(translations));

    // loadTranslateBooks()
    //   .then(() => {
    //     translator.configureBooks(bookTranslate, bookTranslate2);
    //     return translator.translateFolder(sourceFolder.value, targetFolder.value,
    //       sourceLanguage.value, targetLanguage.value);
    //   })
    //   .then(issues => showTranslateLog(issues))
    //   .catch(err => showTranslateError([err]));
  };

  const startEstimate = async () => {
    if (urantiapediaFolder.value === '') return;
    estimating.value = true;
    try {
      const isLibraryBook = path.basename(sourceFolder.value.replace(/\\/g, '/')).startsWith('book');
  
      if (!sourceFolder.value || sourceFolder.value == '') {
        throw new Error('Origin folder missing.');
      }

      await loadTranslateBooks();
      const output = await estimateFolder(
        sourceFolder.value, 
        sourceLanguage.value, 
        targetLanguage.value, 
        isLibraryBook, 
        targetBook,
        urantiapediaFolder.value
      );

      // for (let key in output.objects) {
      //   const errors = output.objects[key].errors;
      //   if (errors.length > 0) {
      //     addWarning(`File contains problems: ${key}`);
      //     errors.forEach(e => addWarning(e));
      //   }
      // }

      addTable('Translate estimations', output.summary);

      addSuccess('Estimation ended with success');
    } catch (err) {
      addErrors(err);
    } finally {
      estimating.value = false;
    }
  };


  return {
    //Constants
    allLanguages,
    //State
    uiLanguage,
    urantiapediaFolder,
    darkTheme,
    sourceLanguage,
    targetLanguage,
    sourceFolder,
    targetFolder,
    translating,
    estimating,
    logs,
    filteredLogs,
    logsFilter,
    //Actions
    startTranslate,
    startEstimate
  }
});