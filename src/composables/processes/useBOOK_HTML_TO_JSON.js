import { useReadFromHTML } from '../urantiabook/useReadFromHTML.js';
import { useReadAuthorsFromHTML } from '../urantiabook/useReadAuthorsFromHTML.js';
import { useReadSubsections } from '../urantiabook/useReadSubsections.js';
import { useWriteToJSON } from '../urantiabook/useWriteToJSON.js';

/**
 * Convert Urantia Book from HTML to JSON.
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {Ref<boolean>} processing Processing flag.
 * @param {function} addLog Function to add log messages.
 * @param {function} addErrors Function to add error messages.
 * @param {function} addSuccess Function to add success messages.
 */
export const useBOOK_HTML_TO_JSON = (
  language,
  uiLanguage,
  processing,
  addLog,
  addErrors,
  addSuccess
) => {
  const { readFromHTML } = useReadFromHTML(uiLanguage, addLog);
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
    processing.value = true;
    addLog('Executing process: BOOK_HTML_TO_JSON');

    try {
      let papers = await readFromHTML(bookFolder);
      papers = await readAuthorsFromHTML(bookFolder, papers);
      papers = await readSubsections(subsectionsFile, papers);
      await writeToJSON(bookFolder, papers);
      addSuccess('Process successful: BOOK_HTML_TO_JSON');
    } catch (errors) {
      addErrors(errors);
    } finally {
      processing.value = false;
    }
  };

  return { executeProcess };
};