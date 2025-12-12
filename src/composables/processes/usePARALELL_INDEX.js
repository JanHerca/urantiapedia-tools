import { useReadFromJSON } from '../urantiabook/useReadFromJSON';
import { useWriteParalells } from '../urantiabook/useWriteParalells';

/**
 * Create index of paralells
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {Ref<boolean>} processing Processing flag.
 * @param {function} addLog Function to add log messages.
 * @param {function} addErrors Function to add error messages.
 * @param {function} addSuccess Function to add success messages.
 */
export const usePARALELL_INDEX = (
  language,
  uiLanguage,
  processing,
  addLog,
  addErrors,
  addSuccess
) => {
  const { readFromJSON } = useReadFromJSON(uiLanguage, addLog);
  const { writeParalells } = useWriteParalells(language, uiLanguage, addLog);

  /**
   * Reads UB (*.json)
   * Writes paralells (*.md)
   * @param {string} bookFolder Folder with Urantia Book in JSON format.
   * @param {string} outputFolder Output folder.
   */
  const executeProcess = async (
    bookFolder,
    outputFolder
  ) => {
    processing.value = true;
    addLog('Executing process: PARALELL_INDEX');
    try {
      const papers = await readFromJSON(bookFolder);
      await writeParalells(outputFolder, papers);

      addSuccess('Process successful: PARALELL_INDEX');
    } catch (errors) {
      addErrors(errors);
    } finally {
      processing.value = false;
    }
  };

  return { executeProcess };
};