import { useRead as useReadPL } from 'src/composables/paralells/useRead.js';
import { useReadUBParalellsFromTSV } from 'src/composables/articles/useReadUBParalellsFromTSV.js';
import { useReadCorrections } from 'src/composables/urantiabook/useReadCorrections.js';
import { useReadFromJSON } from 'src/composables/urantiabook/useReadFromJSON.js';
import { useReadFromTXT } from 'src/composables/topicindex/useReadFromTXT.js';
import { useUpdateTopicNames } from 'src/composables/topicindex/useUpdateTopicNames.js';
import { useGetRefsForSearching } from 'src/composables/topicindex/useGetRefsForSearching.js';
import { useReadFolder } from 'src/composables/useReadFolder.js';

import { TopicIndex } from '/src/core/topicindex.js';
import { Paralells } from 'src/core/paralells.js';
import { Articles } from 'src/core/articles.js';
import { reflectPromise } from 'src/core/utils.js';

import path from 'path';

//TODO: Add links to topics in english and master versions
//TODO: Add Extended index in headers
//TODO: Add authors in Index (not in Extended)
//TODO: Add links in home page & About UB page to go directly to multi
//TODO: Add a diff system
//TODO: Allow images to be also centered (not only left by default)

/**
 * Convert Multiple Urantia Book (JSON) + Topic Index (TXT) to Wiki.js
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 * @param {function} addWarning Function to add warning messages.
 * @param {function} addErrors Function to add error messages.
 * @param {function} addSuccess Function to add success messages.
 */
export const useBOOK_JSON_TOPICS_TXT_TO_WIKIJS = (
  language,
  uiLanguage,
  addLog,
  addWarning,
  addErrors,
  addSuccess
) => {
  const { readParalells } = useReadPL(language, uiLanguage, addLog);
  const { readUBParalellsFromTSV } = useReadUBParalellsFromTSV(uiLanguage, addLog);
  const { readCorrections } = useReadCorrections(language, uiLanguage, addLog);
  const { readFromJSON } = useReadFromJSON(uiLanguage, addLog);
  const { readFromTXT } = useReadFromTXT(uiLanguage, addLog);
  const { updateTopicNames } = useUpdateTopicNames(language, uiLanguage, addLog);
  const { getRefsForSearching } = useGetRefsForSearching(uiLanguage, addLog);
  const { readFolder } = useReadFolder(uiLanguage, addLog);

  /**
	 * Reads paralells (*.md) +
	 * Reads corrections for English (*.tsv)
	 * Reads master UB (*.json) + 
	 * Reads Topic Index (*.txt) + 
	 * Get paths to several UB versions +
	 * Reads all UB versions (*.json) +
	 * Checks book versions + Writes (Wiki.js *.html)
   * @param {string} topicsFolder Folder with Topic Index in TXT format.
   * @param {string} bookFolder Folder with Urantia Book in JSON format.
   * @param {string} paralellsFile File with paralells (cross-references).
   * @param {string} correctionsFile File with corrections done in the English 
   * Urantia Book 1955 edition.
   * @param {string} outputFolder Output folder for HTML files.
   * @param {string} urantiapediaFolder Urantiapedia folder.
   */
  const executeProcess = async (
    topicsFolder, 
    bookFolder, 
    paralellsFile, 
    correctionsFile,
    outputFolder, 
    urantiapediaFolder
  ) => {
    addLog('Executing process: BOOK_JSON_TOPICS_TXT_TO_WIKIJS');
    try {
      //Reading paralells
      const { 
        books, 
        footnotes, 
        translations: translationsPL 
      } = await readParalells(urantiapediaFolder);
      const bookParalells = new Paralells(language.value, books, footnotes, translationsPL);
      //Reading articles
      const articles = readUBParalellsFromTSV(paralellsFile);
      const articleParalells = new Articles(language.value, articles);
      //Reading corrections
      const corrections = await readCorrections(correctionsFile);
      //Reading The Urantia Book
      const masterDir = path.join(bookFolder, `book-${language.value}-footnotes`);
      const papers = await readFromJSON(masterDir);
      const ub_book = new UrantiaBook(language.value, papers);
      //Reading Topic Index
      const topicsFolderEN = topicsFolder.replace(`topic-index-${language.value}`, 
        'topic-index-en');
      const topicsEN = await readFromTXT(topicsFolderEN);
      updateTopicNames(topicsEN, topicsEN);
      const ref_topicsEN = getRefsForSearching(ub_book, topicsEN);
      const topicIndexEN = new TopicIndex('en', topicsEN, ref_topicsEN);

      const exists = await reflectPromise(readFolder(topicsFolder, '.txt'));
      let topics, topicIndex, ref_topics;
      if (exists.value) {
        topics = await readFromTXT(topicsFolder);
        updateTopicNames(topics, topicsEN);
        ref_topics = getRefsForSearching(ub_book, topics);
        topicIndex = new TopicIndex(language.value, topics, ref_topics);
      }
      //Get Data of book versions
      //TODO
      //Checks
      //TODO
      //Write
      //TODO
      addSuccess('Process successful: BOOK_JSON_TOPICS_TXT_TO_WIKIJS');
    } catch (errors) {
      addErrors(errors);
    }

  };
  
  return { executeProcess };
};