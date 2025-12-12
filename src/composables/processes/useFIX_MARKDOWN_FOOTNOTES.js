import { useFixMarkdownFootnotes } from '../library/useFixMarkdownFootnotes.js';

/**
 * Fix footnotes in Markdown files
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {Ref<boolean>} processing Processing flag.
 * @param {function} addLog Function to add log messages.
 * @param {function} addErrors Function to add error messages.
 * @param {function} addSuccess Function to add success messages.
 * @param {function} addWarning Function to add warning messages.
 */
export const useFIX_MARKDOWN_FOOTNOTES = (
  language,
  uiLanguage,
  processing,
  addLog,
  addErrors,
  addSuccess,
  addWarning
) => {
  const { fixMarkdownFootnotes } = useFixMarkdownFootnotes(uiLanguage, 
    addLog, addWarning);

  /**
   * Reads a folder with Markdown files
   * 
   * @param {string} folder Folder with a book in Markdown format.
   */
  const executeProcess = async (
    folder
  ) => {
    processing.value = true;
    addLog('Executing process: FIX_MARKDOWN_FOOTNOTES');
    try {
      await fixMarkdownFootnotes(folder);

      addSuccess('Process successful: FIX_MARKDOWN_FOOTNOTES');
    } catch (errors) {
      addErrors(errors);
    } finally {
      processing.value = false;
    }
  };

  return { executeProcess };
};