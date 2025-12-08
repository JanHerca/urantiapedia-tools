import { useReadFromLaTeX } from '../bible/useReadFromLaTeX.js';

import { getError } from 'src/core/utils.js';

/**
 * Check Bible (LaTeX) comparing with English
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {Ref<boolean>} processing Processing flag.
 * @param {function} addLog Function to add log messages.
 * @param {function} addErrors Function to add error messages.
 * @param {function} addSuccess Function to add success messages.
 */
export const useBIBLE_TEX_CHECK = (
  language,
  uiLanguage,
  processing,
  addLog,
  addErrors,
  addSuccess
) => {
  const { readFromLaTeX } = useReadFromLaTeX(language, uiLanguage, addLog);

  /**
   * Compares two Bibles to see if any verse or chapter is missing.
   * @param {Object[]} bible Objects with Bible to use for comparison.
   * @param {Object[]} bibleEN Objects with Bible in English to use for comparison.
   * @return {Promise} An array of errors.
   */
  const compare = (bible, bibleEN) => {
    const errors = [];
    const addErr = (msg) =>
      errors.push(getError(uiLanguage.value, 'bible_error', msg));
    bibleEN.forEach(book => {
      const book2 = bible
        .find(b => b.titleEN === book.title);
      if (!book2) {
        addErr(`Book ${book.title} not found`);
        return;
      }
    });
    if (errors.length > 0) throw errors;
  };

  /**
   * Reads Bible pages (cuurent and English) (*.tex)
   * Compares
   * @param {string} bibleFolder Folder with Bible in LaTeX format.
   * @param {string} bibleFolderEN Folder with Bible (English) in LaTeX format.
   */
  const executeProcess = async (
    bibleFolder,
    bibleFolderEN
  ) => {
    processing.value = true;
    addLog('Executing process: BIBLE_TEX_CHECK');
    try {

      const bible = await readFromLaTeX(bibleFolder);
      const bibleEN = await readFromLaTeX(bibleFolderEN);
      compare(bible, bibleEN);


      addSuccess('Process successful: BIBLE_TEX_CHECK');
    } catch (errors) {
      addErrors(errors);
    } finally {
      processing.value = false;
    }
  };

  return { executeProcess };
};