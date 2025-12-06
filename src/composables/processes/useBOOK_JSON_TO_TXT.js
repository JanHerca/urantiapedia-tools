import { useReadFromJSON } from '../urantiabook/useReadFromJSON.js';
import { useWriteToTXT } from '../urantiabook/useWriteToTXT.js';

/**
 * Convert Urantia Book from JSON to TXT.
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {Ref<boolean>} processing Processing flag.
 * @param {function} addLog Function to add log messages.
 * @param {function} addErrors Function to add error messages.
 * @param {function} addSuccess Function to add success messages.
 */
export const useBOOK_JSON_TO_TXT = (
  language,
  uiLanguage,
  processing,
  addLog,
  addErrors,
  addSuccess
) => {
  const { readFromJSON } = useReadFromJSON(uiLanguage, addLog);
  const { writeToTXT } = useWriteToTXT(uiLanguage, addLog);

  /**
   * Executes the process.
   * Reads UB (*.json) => 
   * Writes (*.txt)
   * @param {string} bookFolder Folder with UB in JSON format.
   * @param {string} outputFolder Output folder for TXT files.
   */
  const executeProcess = async (bookFolder, outputFolder) => {
    processing.value = true;
    addLog('Executing process: BOOK_JSON_TO_TXT');

    try {
      const papers = await readFromJSON(bookFolder);
      await writeToTXT(outputFolder, papers);

      addSuccess('Process successful: BOOK_JSON_TO_TXT');
    } catch (errors) {
      addErrors(errors);
    } finally {
      processing.value = false;
    }
  };

  return { executeProcess };
};
