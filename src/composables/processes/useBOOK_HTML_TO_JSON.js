import { useReadFromHTML } from 'src/composables/urantiabook/useReadFromHTML.js';
import { useReadAuthorsFromHTML } from 'src/composables/urantiabook/useReadAuthorsFromHTML.js';
import { useReadSubsections } from 'src/composables/urantiabook/useReadSubsections.js';
import { useWriteToJSON } from 'src/composables/urantiabook/useWriteToJSON.js';

/**
 * Convert Urantia Book from HTML to JSON.
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 * @param {function} addErrors Function to add error messages.
 * @param {function} addSuccess Function to add success messages.
 */
export const useBOOK_HTML_TO_JSON = (
  language,
  uiLanguage,
  addLog,
  addErrors,
  addSuccess
) => {
  const { readFromJSON } = useReadFromJSON(uiLanguage, addLog);
  const { readAuthorsFromHTML } = useReadAuthorsFromHTML(uiLanguage, addLog);
  const { readSubsections } = useReadSubsections(uiLanguage, addLog);
  const { writeToJSON } = useWriteToJSON(uiLanguage, addLog);

  /**
   * Reads UB (*.html) +
   * Reads authors (*.html) +
   * Read subsections (*.tsv) => 
   * Writes (*.json)
   * @param {string} bookFolder Folder with UB in JSON format.
   * @param {string} subsectionsFile File with subsections in TSV format.
   */
  const executeProcess = async (bookFolder, subsectionsFile) => {
    addLog('Executing process: BOOK_HTML_TO_JSON');

    try {
      let papers = await readFromJSON(bookFolder);
      papers = await readAuthorsFromHTML(bookFolder, papers);
      papers = await readSubsections(subsectionsFile, papers);
      await writeToJSON(bookFolder, papers);
      addSuccess('Process successful: BOOK_HTML_TO_JSON');
    } catch (errors) {
      addErrors(errors);
    }
  };

  return { executeProcess };
};