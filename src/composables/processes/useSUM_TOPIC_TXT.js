import { useReadFromTXT } from '../topicindex/useReadFromTXT.js';

import { TopicIndex } from 'src/core/topicindex.js';

/**
 * Summary of Topic Index (TXT)
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {Ref<boolean>} processing Processing flag.
 * @param {function} addLog Function to add log messages.
 * @param {function} addErrors Function to add error messages.
 * @param {function} addSuccess Function to add success messages.
 * @param {function} addTable Function to add table messages.
 */
export const useSUM_TOPIC_TXT = (
  language,
  uiLanguage,
  processing,
  addLog,
  addErrors,
  addSuccess,
  addTable,
  topicTypes
) => {
  const { readFromTXT } = useReadFromTXT(uiLanguage, addLog);

  /**
   * Reads TopicIndex (*.txt) => 
   * Summary
   * @param {string} topicIndexFolder Folder with Topic Index in TXT format.
   */
  const executeProcess = async (
    topicIndexFolder
  ) => {
    processing.value = true;
    addLog('Executing process: SUM_TOPIC_TXT');
    try {

      const topics = await readFromTXT(topicIndexFolder);
      const topicIndex = new TopicIndex(language.value, topics);
      const { topics: tTopics, lines: tLines } = topicIndex.getSummary(topicTypes);

      addTable('Number of topics', tTopics);
      addTable('Number of paragraphs in topics', tLines);

      addSuccess('Process successful: SUM_TOPIC_TXT');
    } catch (errors) {
      addErrors(errors);
    } finally {
      processing.value = false;
    }
  };

  return { executeProcess };
};