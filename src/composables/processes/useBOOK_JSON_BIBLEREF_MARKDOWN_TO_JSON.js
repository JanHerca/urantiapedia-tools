import { useReadFromJSON } from '../urantiabook/useReadFromJSON.js';
import { useUpdateRefs } from '../urantiabook/useUpdateRefs.js';
import { useWriteToJSON } from '../urantiabook/useWriteToJSON.js';
import { useReadForUB } from '../paramony/useReadForUB.js';


import { getError } from 'src/core/utils.js';

import path from 'path';

/**
 * Update Bible Refs in Urantia Book.
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {Ref<boolean>} processing Processing flag.
 * @param {function} addLog Function to add log messages.
 * @param {function} addErrors Function to add error messages.
 * @param {function} addSuccess Function to add success messages.
 */
export const useBOOK_JSON_BIBLEREF_MARKDOWN_TO_JSON = (
  language,
  uiLanguage,
  processing,
  addLog,
  addErrors,
  addSuccess
) => {
  const { readFromJSON } = useReadFromJSON(uiLanguage, addLog);
  const { readForUB } = useReadForUB(language, uiLanguage, addLog);
  const { updateRefs } = useUpdateRefs(uiLanguage, addLog);
  const { writeToJSON } = useWriteToJSON(uiLanguage, addLog);

  /**
   * Executes the process.
   * Reads UB (*.json) + 
   * Reads Bible Refs (*.md) => 
   * Writes (*.json)
   * @param {string} bookFolder Folder with UB in JSON format.
   * @param {string} urantiapediaFolder Folder with Urantiapedia.
   */
  const executeProcess = async (bookFolder, urantiapediaFolder) => {
    processing.value = true;
    addLog('Executing process: BOOK_JSON_BIBLEREF_MARKDOWN_TO_JSON');

    try {
      let papers = await readFromJSON(bookFolder);
      const footnotes = await readForUB(urantiapediaFolder);
      papers = await updateRefs(papers, footnotes);
      const baseName = path.basename(bookFolder.replace(/\\/g, '/'));
      let parentPath = path.dirname(bookFolder);
      let newjsonDir = path.join(parentPath, `${baseName}-footnotes`);
      const exists = await window.NodeAPI.exists(newjsonDir);
      if (!exists) {
        throw getError(uiLanguage.value, 'footnotes_folder_required', baseName);
      }
      await writeToJSON(newjsonDir, papers);
      addSuccess('Process successful: BOOK_JSON_BIBLEREF_MARKDOWN_TO_JSON');
    } catch (errors) {
      addErrors(errors);
    } finally {
      processing.value = false;
    }
  };

  return { executeProcess };
};