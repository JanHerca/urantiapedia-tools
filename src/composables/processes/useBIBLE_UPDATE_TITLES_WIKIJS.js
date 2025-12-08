import { useUpdateWikijsTitles } from '../bible/useUpdateWikijsTitles.js';

/**
 * Update titles in Bible pages (MARKDOWN)
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {Ref<boolean>} processing Processing flag.
 * @param {function} addLog Function to add log messages.
 * @param {function} addErrors Function to add error messages.
 * @param {function} addSuccess Function to add success messages.
 */
export const useBIBLE_UPDATE_TITLES_WIKIJS = (
  language,
  uiLanguage,
  processing,
  addLog,
  addErrors,
  addSuccess
) => {
  const { updateWikijsTitles } = useUpdateWikijsTitles(language, uiLanguage, addLog);

  /**
   * Reads Bible pages (*.md) => 
   * Updates titles => Writes (*.md)
   * @param {string} outputFolder Output folder for HTML files.
   */
  const executeProcess = async (
    outputFolder
  ) => {
    processing.value = true;
    addLog('Executing process: BIBLE_UPDATE_TITLES_WIKIJS');
    try {

      await updateWikijsTitles(outputFolder);

      addSuccess('Process successful: BIBLE_UPDATE_TITLES_WIKIJS');
    } catch (errors) {
      addErrors(errors);
    } finally {
      processing.value = false;
    }
  };

  return { executeProcess };
};