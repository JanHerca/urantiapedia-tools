import { useReadFromJSON } from 'src/composables/urantiabook/useReadFromJSON.js';
import { useReadRefsFromJSON } from 'src/composables/urantiabook/useReadRefsFromJSON.js';
import { useUpdateRefs } from 'src/composables/urantiabook/useUpdateRefs.js';
import { useWriteToJSON } from 'src/composables/urantiabook/useWriteToJSON.js';

import { getError } from 'src/core/utils.js';

import path from 'path';

/**
 * Update Bible Refs in Urantia Book (JSON)
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 * @param {function} addErrors Function to add error messages.
 * @param {function} addSuccess Function to add success messages.
 */
export const useBOOK_JSON_BIBLEREF_JSON_TO_JSON = (
  language,
  uiLanguage,
  addLog,
  addErrors,
  addSuccess
) => {
  const { readFromJSON } = useReadFromJSON(uiLanguage, addLog);
  const { readRefsFromJSON } = useReadRefsFromJSON(uiLanguage, addLog);
  const { updateRefs } = useUpdateRefs(uiLanguage, addLog);
  const { writeToJSON } = useWriteToJSON(uiLanguage, addLog);

  /**
   * Executes the process.
   * Reads UB (*.json) + 
   * Reads Bible Refs (*.json) => 
   * Writes (*.json)
   * @param {string} bookFolder Folder with UB in JSON format.
   * @param {string} bibleRefsFolder Folder with footnotes files in JSON.
   */
  const executeProcess = async (bookFolder, bibleRefsFolder) => {
    addLog('Executing process: BOOK_JSON_BIBLEREF_JSON_TO_JSON');

    try {
      let papers = await readFromJSON(bookFolder);
      const footnotes = await readRefsFromJSON(bibleRefsFolder);
      papers = await updateRefs(papers, footnotes);
      const baseName = path.basename(bookFolder);
      let parentPath = path.dirname(bookFolder);
      let newjsonDir = path.join(parentPath, `${baseName}-footnotes`);
      const exists = await window.NodeAPI.exists(newjsonDir);
      if (!exists) {
        throw getError(uiLanguage.value, 'footnotes_folder_required', baseName);
      }
      await writeToJSON(newjsonDir, papers);
      addSuccess('Process successful: BOOK_JSON_BIBLEREF_JSON_TO_JSON');
    } catch (errors) {
      addErrors(errors);
    }
  };

  return { executeProcess };
};