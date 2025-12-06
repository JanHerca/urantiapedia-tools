import { useReadFromJSON } from '../urantiabook/useReadFromJSON.js';
import { useReadSubsections } from '../urantiabook/useReadSubsections.js';
import { useWriteToJSON } from '../urantiabook/useWriteToJSON.js';

/**
 * Update Subsections in Urantia Book (TSV) [Only Spanish]
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {Ref<boolean>} processing Processing flag.
 * @param {function} addLog Function to add log messages.
 * @param {function} addErrors Function to add error messages.
 * @param {function} addSuccess Function to add success messages.
 */
export const useBOOK_JSON_SUBSECTIONS_TSV_TO_JSON = (
  language,
  uiLanguage,
  processing,
  addLog,
  addErrors,
  addSuccess
) => {
  const { readFromJSON } = useReadFromJSON(uiLanguage, addLog);
  const { readSubsections } = useReadSubsections(uiLanguage, addLog);
  const { writeToJSON } = useWriteToJSON(uiLanguage, addLog);

  /**
   * Reads UB (*.json) + 
   * Reads Subsections (*.tsv) => 
   * Writes (*.json)
   * @param {string} bookFolder Folder with UB in JSON format.
   * @param {string} subsectionsFile File with subsections in TSV format.
   */
  const executeProcess = async (bookFolder, subsectionsFile) => {
    processing.value = true;
    addLog('Executing process: BOOK_JSON_SUBSECTIONS_TSV_TO_JSON');

    try {
      let papers = await readFromJSON(bookFolder);
      papers = await readSubsections(subsectionsFile, papers);
      await writeToJSON(bookFolder, papers);
      addSuccess('Process successful: BOOK_JSON_SUBSECTIONS_TSV_TO_JSON');
    } catch (errors) {
      addErrors(errors);
    } finally {
      processing.value = false;
    }
  };

  return { executeProcess };
};