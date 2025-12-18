import { ref } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import { useMain } from 'src/stores/main.js';
import { UrantiaBook } from 'src/core/urantiabook.js';
import { useReadFromJSON } from 'src/composables/urantiabook/useReadFromJSON.js';
import { usePrepareTranslation } from 'src/composables/translate/usePrepareTranslation.js';
import { useBuildTranslation } from 'src/composables/translate/useBuildTranslation.js';
import { useEstimateFolder } from 'src/composables/translate/useEstimateFolder.js';

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
  const { prepareFolder } = usePrepareTranslation(uiLanguage, addLog, addWarning);
  const { buildTranslationFolder } = useBuildTranslation(uiLanguage, addLog, addWarning);
  const { estimateFolder } = useEstimateFolder(uiLanguage, addLog, addWarning);

  // Constants

  //Variables
  let sourceBook = null;
  let targetBook = null;
  const objects = {};

  //Storage
  const sourceLanguage = ref('en');
  const targetLanguage = ref('es');
  const sourceFolder = ref(path.join(urantiapediaFolder.value, 'tests', 'article_progress'));
  const targetFolder = ref(path.join(urantiapediaFolder.value, 'tests', 'article_translated'));
  const translating = ref(false);
  const preparing = ref(false);
  const building = ref(false);
  const estimating = ref(false);

  //Functions
  /**
   * Reads the Urantia Book in both source and target language to be used for
   * later us in translations.
   */
  const loadTranslateBooks = async () => {
    const root = path.join(urantiapediaFolder.value, 'input', 'json');
    const dirSourceBook = path.join(root, `book-${sourceLanguage.value}`);
    const dirTargetBook = path.join(root, `book-${targetLanguage.value}`);

    const loadSource = (
      !sourceBook ||
      sourceBook.language != sourceLanguage.value ||
      sourceBook.papers.length == 0
    );
    const loadTarget = (
      !targetBook ||
      targetBook.language != targetLanguage.value ||
      targetBook.papers.length == 0
    );

    if (loadSource) {
      const sourcePapers = await readFromJSON(dirSourceBook);
      sourceBook = new UrantiaBook(sourceLanguage.value, sourcePapers);
    }
    if (loadTarget) {
      const targetPapers = await readFromJSON(dirTargetBook);
      targetBook = new UrantiaBook(targetLanguage.value, targetPapers);
    }
  };

  //Actions

  /**
   * Translates all files inside a folder requesting translations to a Google
   * Translate web services (requires a Google account for payments).
   */
  const startTranslate = async () => {
    if (urantiapediaFolder.value === '') return;
    if (!sourceFolder.value || sourceFolder.value == '') {
      addErrors('Origin folder missing.');
      return;
    }
    if (!targetFolder.value || targetFolder.value == '') {
      addErrors('Target folder missing.');
      return;
    }

    translating.value = true;
    try {
      if (!sourceFolder.value || sourceFolder.value == '') {
        throw new Error('Origin folder missing.');
      }
      if (!targetFolder.value || targetFolder.value == '') {
        throw new Error('Target folder missing.');
      }
      const sourceFolderN = sourceFolder.value.replace(/\\/g, '/');
      const targetFolderN = targetFolder.value.replace(/\\/g, '/');
      const isLibraryBook = path.basename(sourceFolderN).startsWith('book');
  
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

      addSuccess('Translation ended with success');
    } catch (err) {
      addErrors(err);
    } finally {
      translating.value = false;
    }
  };

  /**
   * Executes a preparation for a translation of files in a folder creating some
   * intermediate files that can later be used for translation in external tools.
   */
  const prepareTranslation = async () => {
    if (urantiapediaFolder.value === '') return;
    if (!sourceFolder.value || sourceFolder.value == '') {
      addErrors('Origin folder missing.');
      return;
    }
    if (!targetFolder.value || targetFolder.value == '') {
      addErrors('Target folder missing.');
      return;
    }

    preparing.value = true;
    try {
      const sourceFolderN = sourceFolder.value.replace(/\\/g, '/');
      const targetFolderN = targetFolder.value.replace(/\\/g, '/');
      const isLibraryBook = path.basename(sourceFolderN).startsWith('book');

      await loadTranslateBooks();
      await prepareFolder(
        sourceFolderN, 
        targetFolderN, 
        sourceLanguage.value,
        targetLanguage.value,
        isLibraryBook,
        sourceBook, 
        targetBook,
        urantiapediaFolder.value
      );

      addSuccess('Preparation of translation ended with success');
    } catch (err) {
      addErrors(err);
    } finally {
      preparing.value = false;
    }
  };

  /**
   * Executes a rebuild of folders and files using expected files with the
   * translations created using a external tool.
   */
  const buildTranslation = async () => {
    if (urantiapediaFolder.value === '') return;
    if (!sourceFolder.value || sourceFolder.value == '') {
      addErrors('Origin folder missing.');
      return;
    }
    if (!targetFolder.value || targetFolder.value == '') {
      addErrors('Target folder missing.');
      return;
    }

    building.value = true;
    try {
      const sourceFolderN = sourceFolder.value.replace(/\\/g, '/');
      const targetFolderN = targetFolder.value.replace(/\\/g, '/');

      await buildTranslationFolder(
        sourceFolderN, 
        targetFolderN
      );

      addSuccess('Build of translation ended with success');
    } catch (err) {
      addErrors(err);
    } finally {
      building.value = false;
    }
  };

  /**
   * Executes an estimation of characters to translate in all files in a folder .
   */
  const startEstimate = async () => {
    if (urantiapediaFolder.value === '') return;
    if (!sourceFolder.value || sourceFolder.value == '') {
      addErrors('Origin folder missing.');
      return;
    }

    estimating.value = true;
    try {
      const sourceFolderN = sourceFolder.value.replace(/\\/g, '/');
      const isLibraryBook = path.basename(sourceFolderN).startsWith('book');

      await loadTranslateBooks();
      const output = await estimateFolder(
        sourceFolderN, 
        sourceLanguage.value, 
        targetLanguage.value, 
        isLibraryBook, 
        targetBook,
        urantiapediaFolder.value
      );

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
    preparing,
    building,
    estimating,
    logs,
    filteredLogs,
    logsFilter,
    //Actions
    startTranslate,
    prepareTranslation,
    buildTranslation,
    startEstimate
  }
});