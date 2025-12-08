import { useReadFromLaTeX } from '../bible/useReadFromLaTeX.js';
import { useWriteIndexToWikijs } from '../bible/useWriteIndexToWikijs.js';

/**
 * Convert Bible (LaTeX) to index Wiki.js
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {Ref<boolean>} processing Processing flag.
 * @param {function} addLog Function to add log messages.
 * @param {function} addErrors Function to add error messages.
 * @param {function} addSuccess Function to add success messages.
 */
export const useBIBLE_TEX_TO_BIBLEINDEX_WIKIJS = (
  language,
  uiLanguage,
  processing,
  addLog,
  addErrors,
  addSuccess
) => {
  const { readFromLaTeX } = useReadFromLaTeX(language, uiLanguage, addLog);
  const { writeIndexToWikijs } = useWriteIndexToWikijs(language, uiLanguage, addLog);

  /**
   * Reads Bible (*.tex) => 
   * Writes index (*.html)
   * @param {string} bibleFolder Folder with Bible in LaTeX format.
   * @param {string} outputFolder Output folder for HTML files.
   */
  const executeProcess = async (
    bibleFolder,
    outputFolder
  ) => {
    processing.value = true;
    addLog('Executing process: BIBLE_TEX_TO_BIBLEINDEX_WIKIJS');
    try {
      const bible = await readFromLaTeX(bibleFolder);

      await writeIndexToWikijs(outputFolder, bible);

      addSuccess('Process successful: BIBLE_TEX_TO_BIBLEINDEX_WIKIJS');
    } catch (errors) {
      addErrors(errors);
    } finally {
      processing.value = false;
    }
  };

  return { executeProcess };
};