import { useReadFromTXT } from '../topicindex/useReadFromTXT.js';
import { useCheckTopic } from '../topicindex/useCheckTopic.js';
import { useWriteErrors } from '../topicindex/useWriteErrors.js';
import { useReadFromJSON } from '../urantiabook/useReadFromJSON.js';

import { TopicIndex } from 'src/core/topicindex.js';
import { UrantiaBook } from 'src/core/urantiabook.js';

/**
 * Review Topic Index (TXT) + JSON (UB)
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {Ref<boolean>} processing Processing flag.
 * @param {function} addLog Function to add log messages.
 * @param {function} addErrors Function to add error messages.
 * @param {function} addSuccess Function to add success messages.
 */
export const useREVIEW_TOPIC_TXT_LU_JSON = (
  language,
  uiLanguage,
  processing,
  addLog,
  addErrors,
  addSuccess
) => {
  const { readFromTXT } = useReadFromTXT(uiLanguage, addLog);
  const { readFromJSON } = useReadFromJSON(uiLanguage, addLog);
  const { check } = useCheckTopic(uiLanguage, addLog);
  const { writeErrors } = useWriteErrors(uiLanguage, addLog);

  /**
   * Reads TopicIndex (*.txt) => 
   * Reads UB (*.json) => 
   * Checks
   * @param {string} topicIndexFolder Folder with TopicIndex in TXT format.
   * @param {string} bookFolder Folder with Urantia Book in JSON format.
   * @param {?string} category Topic category to check. By default is 'ALL'.
   * @param {?string} letter Topic letter to output. By default is 'ALL'.
   * @param {?string} topicName Topic name in English of topic to check. If one
   * is provided then category and letter are ignored and that topic is the only
   * checked.
   */
  const executeProcess = async (
    topicIndexFolder,
    bookFolder,
    category = 'ALL',
    letter = 'ALL',
    topicName
  ) => {
    processing.value = true;
    addLog('Executing process: REVIEW_TOPIC_TXT_LU_JSON');
    try {
      const categoryToUse = topicName != '' ? 'ALL' : category;
      const letterToUse = topicName != '' ? 'ALL' : letter;
      const topics = await readFromTXT(topicIndexFolder, categoryToUse, letterToUse);
      const topicIndex = new TopicIndex(language.value, topics);

      const papers = await readFromJSON(bookFolder);
      const book = new UrantiaBook(language.value, papers);

      check(book, topicIndex, null, categoryToUse, letterToUse, 
        topicName != '' ? topicName : null);
      
      const topicsWithErrors = topicIndex.topics
        .sort((a, b) => {
          if (a.sorting > b.sorting) return 1;
          if (a.sorting < b.sorting) return -1;
          return 0;
        })
        .filter(t => t.errors && t.errors.length > 0);
      if (topicsWithErrors.length === 0) {
        addSuccess('All topics in current filter are correct');
      } else {
        topicsWithErrors.forEach(t => {
          addLog(`Topic with errors: ${t.name} (${t.sorting})`);
          const errs = t.errors.map(err => `${err.desc} [${t.filename}:${err.fileline}]`);
          addErrors(errs);
        });
      }

      await writeErrors(topicIndexFolder, topicIndex);

      addSuccess('Process successful: REVIEW_TOPIC_TXT_LU_JSON');
    } catch (errors) {
      addErrors(errors);
    } finally {
      processing.value = false;
    }
  };

  return { executeProcess };
};