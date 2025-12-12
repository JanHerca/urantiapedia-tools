import { useReadFileFromMarkdown } from '../library/useReadFileFromMarkdown.js';
import { useCreateBlankFiles } from '../library/useCreateBlankFiles.js';

/**
 * Copy files to folder from an index
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {Ref<boolean>} processing Processing flag.
 * @param {function} addLog Function to add log messages.
 * @param {function} addErrors Function to add error messages.
 * @param {function} addSuccess Function to add success messages.
 */
export const useLIBRARY_CREATE_BLANK_FROM_LIST = (
  language,
  uiLanguage,
  processing,
  addLog,
  addErrors,
  addSuccess
) => {
  const { readFileFromMarkdown } = useReadFileFromMarkdown(uiLanguage, addLog);
  const { createBlankFiles } = useCreateBlankFiles(language, uiLanguage, addLog);

  /**
   * Reads a Articles Index File (TSV)
   * Copy the articles to an existing folder
   * @param {string} bookFile File with the definition of a book in Markdown format.
   * @param {string} outputFolder Output folder.
   */
  const executeProcess = async (
    bookFile,
    outputFolder
  ) => {
    processing.value = true;
    addLog('Executing process: LIBRARY_CREATE_BLANK_FROM_LIST');
    try {
      const book = await readFileFromMarkdown(bookFile);
      await createBlankFiles(outputFolder);

      addSuccess('Process successful: LIBRARY_CREATE_BLANK_FROM_LIST');
    } catch (errors) {
      addErrors(errors);
    } finally {
      processing.value = false;
    }
  };

  return { executeProcess };
};