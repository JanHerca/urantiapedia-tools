import { useRead as useReadParalells } from '../paralells/useRead.js';
import { useReadUBParalellsFromTSV } from '../articles/useReadUBParalellsFromTSV.js';
import { useReadCorrections } from '../urantiabook/useReadCorrections.js';
import { useReadFromJSON } from '../urantiabook/useReadFromJSON.js';
import { useReadFromTXT } from '../topicindex/useReadFromTXT.js';
import { useUpdateTopicNames } from '../topicindex/useUpdateTopicNames.js';
import { useGetRefsForSearching } from '../topicindex/useGetRefsForSearching.js';
import { useReadDataOfBookVersions } from '../urantiabook/useReadDataOfBookVersions.js';
import { useReadBooksFromJSON } from '../urantiabook/useReadBooksFromJSON';
import { useWriteToWikijs } from '../urantiabook/useWriteToWikijs.js';
import { useReadFolder } from '../useReadFolder.js';

import { TopicIndex } from 'src/core/topicindex.js';
import { Paralells } from 'src/core/paralells.js';
import { Articles } from 'src/core/articles.js';
import { UrantiaBook } from 'src/core/urantiabook.js';
import { reflectPromise } from 'src/core/utils.js';

import path from 'path';

//TODO: Add Extended index in headers
//TODO: Add links in home page & About UB page to go directly to multi
//TODO: Add a diff system
//TODO: Allow images to be also centered (not only left by default)

/**
 * Convert Multiple Urantia Book (JSON) + Topic Index (TXT) to Wiki.js
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {Ref<boolean>} processing Processing flag.
 * @param {function} addLog Function to add log messages.
 * @param {function} addWarning Function to add warning messages.
 * @param {function} addErrors Function to add error messages.
 * @param {function} addSuccess Function to add success messages.
 */
export const useBOOK_MULTIPLE_JSON_TOPICS_TXT_TO_WIKIJS = (
  language,
  uiLanguage,
  processing,
  addLog,
  addWarning,
  addErrors,
  addSuccess
) => {
  const { readParalells } = useReadParalells(language, uiLanguage, addLog);
  const { readUBParalellsFromTSV } = useReadUBParalellsFromTSV(uiLanguage, addLog);
  const { readCorrections } = useReadCorrections(language, uiLanguage, addLog);
  const { readFromJSON } = useReadFromJSON(uiLanguage, addLog);
  const { readFromTXT } = useReadFromTXT(uiLanguage, addLog);
  const { updateTopicNames } = useUpdateTopicNames(uiLanguage, addLog);
  const { getRefsForSearching } = useGetRefsForSearching(uiLanguage, addLog);
  const { readDataOfBookVersions } = useReadDataOfBookVersions(uiLanguage, addLog);
  const { readBooksFromJSON } = useReadBooksFromJSON(uiLanguage, addLog);
  const { writeMultipleToWikijs } = useWriteToWikijs(language, 
    uiLanguage, addLog, addWarning);
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
    processing.value = true;
    addLog('Executing process: BOOK_MULTIPLE_JSON_TOPICS_TXT_TO_WIKIJS');
    try {
      //Reading books paralells
      const { 
        books: paralelledBooks, 
        footnotes, 
        translations 
      } = await readParalells(urantiapediaFolder);
      const bookParalells = new Paralells(language.value, paralelledBooks, 
        footnotes, translations);
      
      //Reading articles paralells
      const articles = await readUBParalellsFromTSV(paralellsFile);
      const articleParalells = new Articles(language.value, articles);
      
      //Reading corrections
      const corrections = await readCorrections(correctionsFile);
      
      //Reading The Urantia Book
      const masterDir = path.join(bookFolder, `book-${language.value}-footnotes`);
      const masterPapers = await readFromJSON(masterDir);
      const masterBook = new UrantiaBook(language.value, masterPapers);
      
      //Reading Topic Index
      const topicsFolderEN = topicsFolder.replace(`topic-index-${language.value}`, 
        'topic-index-en');
      const topicsEN = await readFromTXT(topicsFolderEN);
      updateTopicNames('en', topicsEN);
      const ref_topicsEN = getRefsForSearching(masterBook, topicsEN);
      const topicIndexEN = new TopicIndex('en', topicsEN, ref_topicsEN);
      const exists = await reflectPromise(readFolder(topicsFolder, '.txt'));
      let topics, topicIndex, ref_topics;
      if (exists.value) {
        topics = await readFromTXT(topicsFolder);
        updateTopicNames(language.value, topics, topicsEN);
        ref_topics = getRefsForSearching(masterBook, topics);
        topicIndex = new TopicIndex(language.value, topics, ref_topics);
      }
      
      //Get Data of book versions
      const folders = await readDataOfBookVersions(language.value, bookFolder);
      const books = await readBooksFromJSON(language.value, folders);
      
      //Checks
      const errors = books
        .filter(b => !b.isMaster)
        .map(b => new UrantiaBook(language.value, b.papers))
        .map(bi => masterBook.checkBook(bi))
        .find(e => e.length > 0);
      if (errors) throw errors;
      
      //No errors, proceed
      await writeMultipleToWikijs(
        outputFolder, 
        books,
        topicIndex, 
        topicIndexEN, 
        null, //Images are not shown in multi-column UB pages
        null,  //Maps are not shown in multi-column UB pages
        bookParalells,
        articleParalells,
        corrections
      );
      
      addSuccess('Process successful: BOOK_MULTIPLE_JSON_TOPICS_TXT_TO_WIKIJS');
    } catch (errors) {
      addErrors(errors);
    } finally {
      processing.value = false;
    }

  };
  
  return { executeProcess };
};