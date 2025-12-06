import { useReadFromJSON } from '../urantiabook/useReadFromJSON.js';
import { useReadFromTXT } from '../bibleref/useReadFromTXT.js';
import { useTranslateAndWriteToTXT } from '../bibleref/useTranslateAndWriteToTXT';
import { UrantiaBook } from 'src/core/urantiabook.js';

/**
 * Process: Translate Bible Refs (TXT) + UB (JSON) to TXT
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {Ref<boolean>} processing Processing flag.
 * @param {function} addLog Function to add log messages.
 * @param {function} addErrors Function to add error messages.
 * @param {function} addSuccess Function to add success messages.
 */
export const useBIBLEREF_TXT_BOOK_JSON_TO_TXT = (
  language,
  uiLanguage,
  processing,
  addLog,
  addErrors,
  addSuccess
) => {
  const { readFromJSON } = useReadFromJSON(uiLanguage, addLog);
  const { readFromTXT } = useReadFromTXT(language, uiLanguage, addLog);
  const {
    translate,
    writeToTXT
  } = useTranslateAndWriteToTXT(uiLanguage, addLog, addErrors);

  /**
   * Executes the process.
   * Reads UB (*.json) + 
   * Reads Bible Refs (*.txt) => 
   * Writes translation (*.txt)
   * @param {string} bookFolder Folder with UB in JSON format.
   * @param {string} biblerefFolder Folder with Bible Refs in TXT format.
   */
  const executeProcess = async (bookFolder, biblerefFolder) => {
    processing.value = true;
    addLog('Executing process: BIBLEREF_TXT_BOOK_JSON_TO_TXT');

    try {
      const papers = await readFromJSON(bookFolder);
      let biblerefs = await readFromTXT(biblerefFolder);
      const urantiabook = new UrantiaBook(language.value, papers);
      biblerefs = translate(biblerefs, urantiabook);
      await writeToTXT(biblerefFolder, biblerefs);
      addSuccess('Process successful: BIBLEREF_TXT_BOOK_JSON_TO_TXT');
    } catch (errors) {
      addErrors(errors);
    } finally {
      processing.value = false;
    }
  };

  return { executeProcess };
}