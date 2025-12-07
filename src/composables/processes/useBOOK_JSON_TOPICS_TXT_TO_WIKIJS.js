import { useRead as useReadIC } from '../imagecatalog/useRead.js';
import { useRead as useReadMC } from '../mapcatalog/useRead.js';
import { useRead as useReadPL } from '../paralells/useRead.js';
import { useReadFromJSON } from '../urantiabook/useReadFromJSON.js';
import { useReadFromTXT } from '../topicindex/useReadFromTXT.js';
import { useUpdateTopicNames } from '../topicindex/useUpdateTopicNames.js';
import { useGetRefsForSearching } from '../topicindex/useGetRefsForSearching.js';
import { useReadUBParalellsFromTSV } from '../articles/useReadUBParalellsFromTSV.js';
import { useReadCorrections } from '../urantiabook/useReadCorrections.js';
import { useWriteToWikijs } from '../urantiabook/useWriteToWikijs.js';
import { useReadFolder } from '../useReadFolder.js';

import { ImageCatalog } from 'src/core/imagecatalog.js';
import { MapCatalog } from 'src/core/mapcatalog.js';
import { TopicIndex } from 'src/core/topicindex.js';
import { Paralells } from 'src/core/paralells.js';
import { Articles } from 'src/core/articles.js';
import { UrantiaBook } from 'src/core/urantiabook.js';
import { reflectPromise } from 'src/core/utils.js';

/**
 * Convert Urantia Book (JSON) + Topic Index (TXT) to Wiki.js
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {Ref<boolean>} processing Processing flag.
 * @param {function} addLog Function to add log messages.
 * @param {function} addWarning Function to add warning messages.
 * @param {function} addErrors Function to add error messages.
 * @param {function} addSuccess Function to add success messages.
 */
export const useBOOK_JSON_TOPICS_TXT_TO_WIKIJS = (
  language,
  uiLanguage,
  processing,
  addLog,
  addWarning,
  addErrors,
  addSuccess
) => {
  const { readImageCatalog } = useReadIC(language, uiLanguage, addLog);
  const { readMapCatalog } = useReadMC(language, uiLanguage, addLog);
  const { readParalells } = useReadPL(language, uiLanguage, addLog);
  const { readFromJSON } = useReadFromJSON(uiLanguage, addLog);
  const { readFromTXT } = useReadFromTXT(uiLanguage, addLog);
  const { updateTopicNames } = useUpdateTopicNames(uiLanguage, addLog);
  const { getRefsForSearching } = useGetRefsForSearching(uiLanguage, addLog);
  const { readUBParalellsFromTSV } = useReadUBParalellsFromTSV(uiLanguage, addLog);
  const { readCorrections } = useReadCorrections(language, uiLanguage, addLog);
  const { readFolder } = useReadFolder(uiLanguage, addLog);
  const { writeToWikijs } = useWriteToWikijs(language, uiLanguage, addLog, addWarning);


  /**
   * Reads image catalog (*.md) + 
   * Reads map catalog (*.md) +
   * Reads book paralells (*.md) +
   * Reads UB (*.json) + 
   * Reads Topic Index (*.txt) => 
   * Reads articles paralells (*.tsv)
   * Reads corrections for English (*.tsv)
   * Writes (Wiki.js *.html)
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
    addLog('Executing process: BOOK_JSON_TOPICS_TXT_TO_WIKIJS');

    try {
      //Reading image catalog
      const images = await readImageCatalog(urantiapediaFolder);
      const imageCatalog = new ImageCatalog(language.value, images);
      
      //Reading map catalog
      const { 
        maps, 
        translations: translationsMC 
      } = await readMapCatalog(urantiapediaFolder);
      const mapCatalog = new MapCatalog(language.value, maps, translationsMC);
      
      //Reading books paralells
      const { 
        books, 
        footnotes, 
        translations: translationsPL 
      } = await readParalells(urantiapediaFolder);
      const bookParalells = new Paralells(language.value, books, footnotes, 
        translationsPL);
      
      //Reading articles paralells
      const articles = await readUBParalellsFromTSV(paralellsFile);
      const articleParalells = new Articles(language.value, articles);
      
      //Reading corrections
      const corrections = await readCorrections(correctionsFile);
      
      //Reading The Urantia Book
      const papers = await readFromJSON(bookFolder);
      const ub_book = new UrantiaBook(language.value, papers);
      
      //Reading Topic Index
      let topicIndex;
      const exists = await reflectPromise(readFolder(topicsFolder, '.txt'));
      if (exists.value) {
        const topics = await readFromTXT(topicsFolder);
        if (language.value === 'en') {
          updateTopicNames(language.value, topics);
        } else {
          const topicsFolderEN = topicsFolder.replace(`topic-index-${language.value}`, 
            'topic-index-en');
          const topicsEN = await readFromTXT(topicsFolderEN);
          updateTopicNames(language.value, topics, topicsEN);
        }
        const ref_topics = getRefsForSearching(ub_book, topics);
        topicIndex = new TopicIndex(language.value, topics, ref_topics);
      }
      
      //Write
      await writeToWikijs(
        outputFolder, 
        papers, 
        topicIndex, 
        null, // The TopicIndex in English is not needed i this process
        imageCatalog,
        mapCatalog,
        bookParalells,
        articleParalells,
        corrections);

      addSuccess('Process successful: BOOK_JSON_TOPICS_TXT_TO_WIKIJS');
    } catch (errors) {
      addErrors(errors);
    } finally {
      processing.value = false;
    }
  };

  return { executeProcess };
};
