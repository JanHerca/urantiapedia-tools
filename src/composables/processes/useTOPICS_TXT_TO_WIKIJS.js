import { useReadFromTXT } from '../topicindex/useReadFromTXT.js';
import { useWriteToWikijs } from '../topicindex/useWriteToWikijs.js';

import { TopicIndex } from 'src/core/topicindex.js';

/**
 * Convert Topic Index (TXT) to Wiki.js
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {Ref<boolean>} processing Processing flag.
 * @param {function} addLog Function to add log messages.
 * @param {function} addErrors Function to add error messages.
 * @param {function} addSuccess Function to add success messages.
 */
export const useTOPICS_TXT_TO_WIKIJS = (
  language,
  uiLanguage,
  processing,
  addLog,
  addErrors,
  addSuccess
) => {
  const { readFromTXT } = useReadFromTXT(uiLanguage, addLog);
  const { writeToWikijs } = useWriteToWikijs(language, uiLanguage, addLog);

  /**
   * Reads TopicIndex (*.txt) => 
   * Writes (*.html)
   * @param {string} topicIndexFolder Folder with TopicIndex in TXT format.
   * @param {string} outputFolder Output folder for HTML files.
   * @param {?string} category Topic category to output. By default is 'ALL'.
   * @param {?string} letter Topic letter to output. By default is 'ALL'.
   */
  const executeProcess = async (
    topicIndexFolder,
    outputFolder,
    category = 'ALL',
    letter = 'ALL'
  ) => {
    processing.value = true;
    addLog('Executing process: TOPICS_TXT_TO_WIKIJS');
    try {
      const topics = await readFromTXT(topicIndexFolder, category);
      const topicIndex = new TopicIndex(language.value, topics);
      let topicsEN, topicIndexEN;
      if (language.value != 'en') {
        const topicIndexFolderEN = topicIndexFolder
          .replace(`topic-index-${language.value}`, 'topic-index-en');
        topicsEN = await readFromTXT(topicIndexFolderEN, category);
        topicIndexEN = new TopicIndex('en', topics);
      }

      await writeToWikijs(outputFolder, letter, topicIndex, topicIndexEN);

      addSuccess('Process successful: TOPICS_TXT_TO_WIKIJS');
    } catch (errors) {
      addErrors(errors);
    } finally {
      processing.value = false;
    }
  };

  return { executeProcess };
};