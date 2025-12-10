import { useNormalize } from '../topicindex/useNormalize.js';

/**
 * Normalize entries Topic Index (TXT) to TXT
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {Ref<boolean>} processing Processing flag.
 * @param {function} addLog Function to add log messages.
 * @param {function} addErrors Function to add error messages.
 * @param {function} addSuccess Function to add success messages.
 */
export const useNORM_TOPIC_TXT = (
  language,
  uiLanguage,
  processing,
  addLog,
  addErrors,
  addSuccess
) => {
  const { normalize } = useNormalize(uiLanguage, addLog);

  /**
   * Reads TopicIndex (*.txt) => 
   * Rewrites but modifying first entry line
   * @param {string} topicIndexFolder Folder with Topic Index in TXT format.
   */
  const executeProcess = async (
    topicIndexFolder
  ) => {
    processing.value = true;
    addLog('Executing process: NORM_TOPIC_TXT');
    try {

      await normalize(topicIndexFolder);

      addSuccess('Process successful: NORM_TOPIC_TXT');
    } catch (errors) {
      addErrors(errors);
    } finally {
      processing.value = false;
    }
  };

  return { executeProcess };
};