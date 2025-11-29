import { useReadFromJSON } from 'src/composables/urantiabook/useReadFromJSON.js';
import { useWriteRefsToJSON } from 'src/composables/urantiabook/useWriteRefsToJSON.js';
import { UrantiaBook } from 'src/core/urantiabook.js';

/**
 * Save Bible Refs in (JSON) in JSON.
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 * @param {function} addErrors Function to add error messages.
 * @param {function} addSuccess Function to add success messages.
 */
export const useBOOK_JSON_TO_BIBLEREF_JSON = (
  language,
  uiLanguage,
  addLog,
  addErrors,
  addSuccess
) => {
  const { readFromJSON } = useReadFromJSON(uiLanguage, addLog);
  const { writeRefsToJSON } = useWriteRefsToJSON(uiLanguage, addLog);

  /**
   * Executes the process.
   * Reads UB (*.json) from a translation with Bible Refs => 
   * Writes (*.json)
   * @param {string} bookFolder Folder with UB in JSON format.
   * @param {string} outputFile File with footnotes in JSON.
   */
  const executeProcess = async (bookFolder, outputFile) => {
    addLog('Executing process: BOOK_JSON_TO_BIBLEREF_JSON');

    try {
      const papers = await readFromJSON(bookFolder);
      const urantiabook = new UrantiaBook(language.value, papers);
      await writeRefsToJSON(outputFile, urantiabook);
      addSuccess('Process successful: BOOK_JSON_TO_BIBLEREF_JSON');
    } catch (errors) {
      addErrors(errors);
    }
  };

  return { executeProcess };
};