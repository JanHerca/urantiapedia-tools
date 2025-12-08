import { useReadFromJSON } from '../urantiabook/useReadFromJSON.js';
import { useWriteIndexToWikijs } from '../urantiabook/useWriteIndexToWikijs.js';

/**
 * Convert Urantia Book Index (JSON) to Wiki.js
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {Ref<boolean>} processing Processing flag.
 * @param {function} addLog Function to add log messages.
 * @param {function} addErrors Function to add error messages.
 * @param {function} addSuccess Function to add success messages.
 */
export const useBOOK_INDEX_JSON_TO_WIKIJS = (
  language,
  uiLanguage,
  processing,
  addLog,
  addErrors,
  addSuccess
) => {
  const { readFromJSON } = useReadFromJSON(uiLanguage, addLog);
  const { writeIndexToWikijs } = useWriteIndexToWikijs(language, uiLanguage, addLog);
  /**
   * Reads UB (*.json) => 
   * Writes Indexes (*.html)
   * @param {string} bookFolder Folder with Urantia Book in JSON format.
   * @param {string} outputFolder Output folder for HTML files.
   */
  const executeProcess = async (
    bookFolder,
    outputFolder
  ) => {
    processing.value = true;
    addLog('Executing process: BOOK_INDEX_JSON_TO_WIKIJS');

    try {
      //Reading The Urantia Book
      const papers = await readFromJSON(bookFolder);
      const book = {
        language: language.value,
        isMaster: true,
        year: '', //This is not needed here
        papers
      };
      await writeIndexToWikijs(outputFolder, book);

      addSuccess('Process successful: BOOK_INDEX_JSON_TO_WIKIJS');
    } catch (errors) {
      addErrors(errors);
    } finally {
      processing.value = false;
    }
  };

  return { executeProcess };
};