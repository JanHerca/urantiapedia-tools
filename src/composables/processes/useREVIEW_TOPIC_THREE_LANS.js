import { useReadFromTXT } from '../topicindex/useReadFromTXT.js';
import { useCheckTopic } from '../topicindex/useCheckTopic.js';
import { useCompare } from '../topicindex/useCompare.js';
import { useWriteErrors } from '../topicindex/useWriteErrors.js';
import { useReadFromJSON } from '../urantiabook/useReadFromJSON.js';

import { TopicIndex } from 'src/core/topicindex.js';
import { UrantiaBook } from 'src/core/urantiabook.js';

import path from 'path';

/**
 * Review Topic Index (TXT) in EN/ES/FR languages
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {Ref<boolean>} processing Processing flag.
 * @param {function} addLog Function to add log messages.
 * @param {function} addErrors Function to add error messages.
 * @param {function} addSuccess Function to add success messages.
 */
export const useREVIEW_TOPIC_THREE_LANS = (
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
  const { compare } = useCompare(uiLanguage, addLog);
  const { writeErrors } = useWriteErrors(uiLanguage, addLog);

  /**
   * Reads the Topic Index and Urantia Book for a language.
   * @param {string} lan Language.
   * @param {string} topicsFolder Folder with Topis in all languages 
   * in TXT format.
   * @param {string} booksFolder Folder with Urantia Book in all languages 
   * in JSON format.
   * @returns An object with TopicIndex and UrantiaBook.
   */
  const read = async (lan, topicsFolder, booksFolder) => {
    const topicFolder = path.join(topicsFolder, `topic-index-${lan}`);
    const bookFolder = path.join(booksFolder, `book-${lan}-footnotes`);
    const topics = await readFromTXT(topicFolder);
    const topicIndex = new TopicIndex(lan, topics);
    const papers = await readFromJSON(bookFolder);
    const book = new UrantiaBook(lan, papers);

    return { topicIndex, book, topicFolder };
  };

  /**
   * Reads TopicIndex (*.txt) in EN/ES/FR 
   * Reads UB (*.json) in EN/ES/FR
   * check each topic index
   * Checks by each pair that same topics exits in each language
   * @param {string} topicsFolder Folder with Topis in all languages 
   * in TXT format.
   * @param {string} booksFolder Folder with Urantia Book in all languages 
   * in JSON format.
   * @param {string[]} languages Languages with Topics to compare. By default
   * are English, Spanish, and French. The first language must be English.
   */
  const executeProcess = async (
    topicsFolder,
    booksFolder,
    languages = ['en', 'es', 'fr']
  ) => {
    processing.value = true;
    addLog('Executing process: REVIEW_TOPIC_THREE_LANS');
    try {
      if (languages.length === 0) {
        throw new Error('No languages to check.');
      } else if (languages.length === 1) {
        throw new Error('Only one language is not enough to do checks.');
      } else if (languages[0] != 'en') {
        throw new Error('First language to check must be English');
      }
      //Read
      const promises = languages.map(lan => read(lan, topicsFolder, booksFolder));
      const input = await Promise.all(promises);
      const topicIndexEN = input[0].topicIndex;
      //Check
      languages.forEach((_, i) => {
        const { book, topicIndex } = input[i];
        check(book, topicIndex, topicIndexEN);
      });
      //Compare
      languages.forEach((_, i) => {
        languages.forEach((_, j) => {
          const ti = input[i].topicIndex;
          const ti2 = input[j].topicIndex;
          compare(ti, ti2);
        });
      });
      //Write errors
      const promises2 = languages.map((_, i) => {
        const { topicIndex, topicFolder } = input[i];
        return writeErrors(topicFolder, topicIndex);
      });
      await Promise.all(promises2);

      addSuccess('Process successful: REVIEW_TOPIC_THREE_LANS');
    } catch (errors) {
      addErrors(errors);
    } finally {
      processing.value = false;
    }
  };

  return { executeProcess };
};