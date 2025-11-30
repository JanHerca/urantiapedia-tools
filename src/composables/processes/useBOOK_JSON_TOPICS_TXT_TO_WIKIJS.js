import { useRead as useReadIC } from 'src/composables/imagecatalog/useRead.js';
import { useRead as useReadMC } from 'src/composables/mapcatalog/useRead.js';
import { useReadFromJSON } from 'src/composables/urantiabook/useReadFromJSON.js';
import { useReadFromTXT } from 'src/composables/topicindex/useReadFromTXT.js';
import { useWriteToTXT } from 'src/composables/urantiabook/useWriteToTXT.js';
import { useReadFolder } from 'src/composables/useReadFolder.js';

import { reflectPromise } from 'src/core/utils.js';

/**
 * Convert Urantia Book (JSON) + Topic Index (TXT) to Wiki.js
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 * @param {function} addErrors Function to add error messages.
 * @param {function} addSuccess Function to add success messages.
 */
export const useBOOK_JSON_TOPICS_TXT_TO_WIKIJS = (
  language,
  uiLanguage,
  addLog,
  addErrors,
  addSuccess
) => {
  const { readImageCatalog } = useReadIC(language, uiLanguage, addLog);
  const { readMapCatalog } = useReadMC(language, uiLanguage, addLog);
  const { readFromJSON } = useReadFromJSON(uiLanguage, addLog);
  const { readFromTXT } = useReadFromTXT(uiLanguage, addLog);
  const { readFolder } = useReadFolder(uiLanguage, addLog);
  const { writeToTXT } = useWriteToTXT(uiLanguage, addLog);


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
   * @param {string} outputFolder Output folder for HTML files.
   * @param {string} urantiapediaFolder Urantiapedia folder.
   */
  const executeProcess = async (
    topicsFolder, 
    bookFolder, 
    paralellsFile, 
    outputFolder, 
    urantiapediaFolder
  ) => {
    addLog('Executing process: BOOK_JSON_TOPICS_TXT_TO_WIKIJS');

    try {
      //Reading image catalog
      const imagecatalog = await readImageCatalog(urantiapediaFolder);
      //Reading map catalog
      const { maps, translations } = await readMapCatalog(urantiapediaFolder);
      //Reading The Urantia Book
      const papers = await readFromJSON(bookFolder);
      //Reading Topic Index
      let topics, topicsEN;
      const exists = await reflectPromise(readFolder(topicsFolder, '.txt'));
      if (exists.value) {
        topics = await readFromTXT(topicsFolder);
        if (language.value != 'en') {
          const topicsFolderEN = topicsFolder.replace(`topic-index-${language.value}`, 
           'topic-index-en');
          topicsEN = await readFromTXT(topicsFolderEN);
        }
      }
      //TODO: Follow with the rest of process


      addSuccess('Process successful: BOOK_JSON_TOPICS_TXT_TO_WIKIJS');
    } catch (errors) {
      addErrors(errors);
    }
  };

  return { executeProcess };
};
