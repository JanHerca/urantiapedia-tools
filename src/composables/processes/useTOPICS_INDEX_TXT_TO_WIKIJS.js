import { useReadFromTXT } from '../topicindex/useReadFromTXT.js';
import { useWriteIndexToWikijs } from '../topicindex/useWriteIndexToWikijs.js';

import { TopicIndex } from 'src/core/topicindex.js';

/**
 * Create index of Topic Index (TXT) to Wiki.js
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {Ref<boolean>} processing Processing flag.
 * @param {function} addLog Function to add log messages.
 * @param {function} addErrors Function to add error messages.
 * @param {function} addSuccess Function to add success messages.
 * @param {string[]} topicIndexes Different indexes of topics.
 */
export const useTOPICS_INDEX_TXT_TO_WIKIJS = (
  language,
  uiLanguage,
  processing,
  addLog,
  addErrors,
  addSuccess,
  topicIndexes
) => {
  const { readFromTXT } = useReadFromTXT(uiLanguage, addLog);
  const { writeIndexToWikijs } = useWriteIndexToWikijs(language, uiLanguage, addLog);

  /**
   * Reads TopicIndex index (*.txt) => 
   * Writes (*.html)
   * @param {string} topicIndexFolder Folder with TopicIndex in TXT format.
   * @param {string} outputFolder Output folder for HTML files.
   * @param {?string} index Topic index to output. By default is 'ALL INDEXES'.
   * @param {?string} letter Topic letter to output. By default is 'ALL'.
   */
  const executeProcess = async (
    topicIndexFolder,
    outputFolder,
    index = 'ALL INDEXES'
  ) => {
    processing.value = true;
    addLog('Executing process: TOPICS_INDEX_TXT_TO_WIKIJS');
    try {
      const category = index === 'ALL INDEXES' ? 'ALL' : index;
      const topics = await readFromTXT(topicIndexFolder, category);
      const topicIndex = new TopicIndex(language.value, topics);
      let topicsEN, topicIndexEN;
      if (language.value != 'en') {
        const topicIndexFolderEN = topicIndexFolder
          .replace(`topic-index-${language.value}`, 'topic-index-en');
        topicsEN = await readFromTXT(topicIndexFolderEN, category);
        topicIndexEN = new TopicIndex('en', topics);
      }

      const promises = index === 'ALL INDEXES'
        ? topicIndexes.map(ti => writeIndexToWikijs(outputFolder, ti, topicIndex, topicIndexEN))
        : [writeIndexToWikijs(outputFolder, index, topicIndex, topicIndexEN)];

      const results = await Promise.all(promises);
      const errors = results.filter(r => r.error).map(r => r.error);
      if (errors.length > 0) {
        throw errors;
      }

      addSuccess('Process successful: TOPICS_INDEX_TXT_TO_WIKIJS');
    } catch (errors) {
      addErrors(errors);
    } finally {
      processing.value = false;
    }
  };

  return { executeProcess };
};