import { useReadFromJSON } from 'src/composables/paramony/useReadFromJSON.js';
import { useWriteToMarkdown } from 'src/composables/paramony/useWriteToMarkdown';

/**
 * Process: Convert Bible Refs in Urantia Book (JSON) to Markdown.
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 * @param {function} addErrors Function to add error messages.
 * @param {function} addSuccess Function to add success messages.
 */
export const useBIBLEREF_JSON_TO_MARKDOWN = (
  language,
  uiLanguage,
  addLog,
  addErrors,
  addSuccess
) => {
  const { readFromJSON } = useReadFromJSON(uiLanguage, addLog);
  const { writeToMarkdown } = useWriteToMarkdown(uiLanguage, addLog, 
    addErrors);

  /**
   * Executes the process.
   * Reads Bible Refs (*.json) => 
   * Writes Bible Refs (*.md)
   * @param {string} inputPath File with footnotes in JSON.
   * @param {string} outputPath File with footnotes in Markdown.
   */
  const executeProcess = async (inputPath, outputPath) => {
    addLog('Executing process: BIBLEREF_JSON_TO_MARKDOWN');

    try {
      const footnotes = await readFromJSON(inputPath);
      await writeToMarkdown(outputPath, 'The Urantia Book', footnotes);
      addSuccess('Process successful: BIBLEREF_JSON_TO_MARKDOWN');
    } catch (errors) {
      addErrors(errors);
    }
  };

  return { executeProcess };
}