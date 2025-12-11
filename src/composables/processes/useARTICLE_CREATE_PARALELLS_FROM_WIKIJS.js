import { useReadFromJSON } from '../urantiabook/useReadFromJSON.js';
import { useReadArticlesFromWikijs } from '../articles/useReadArticlesFromWikijs.js';
import { useWriteUBParalellsToTSV } from '../articles/useWriteUBParalellsToTSV.js';

import { UrantiaBook } from 'src/core/urantiabook.js';

/**
 * Create UB paralells file from Wiki.js
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {Ref<boolean>} processing Processing flag.
 * @param {function} addLog Function to add log messages.
 * @param {function} addErrors Function to add error messages.
 * @param {function} addSuccess Function to add success messages.
 */
export const useARTICLE_CREATE_PARALELLS_FROM_WIKIJS = (
  language,
  uiLanguage,
  processing,
  addLog,
  addErrors,
  addSuccess
) => {
  const { readFromJSON } = useReadFromJSON(uiLanguage, addLog);
  const { readArticlesFromWikijs } = useReadArticlesFromWikijs(language, uiLanguage,
    addLog);
  const { writeUBParalellsToTSV } = useWriteUBParalellsToTSV(uiLanguage, addLog);

  /**
   * Reads UB (*.json)
   * Reads articles (*.md)
   * Writes cross refs (paralells) (*.tsv)
   * @param {string} bookFolder Folder with Urantia Book in JSON format.
   * @param {string} articlesFolder Folder with articles in Markdown format.
   * @param {string} paralellsFile Output file with paralells.
   */
  const executeProcess = async (
    bookFolder,
    articlesFolder,
    paralellsFile
  ) => {
    processing.value = true;
    addLog('Executing process: ARTICLE_CREATE_PARALELLS_FROM_WIKIJS');
    try {
      const papers = readFromJSON(bookFolder);
      const ubook = new UrantiaBook(language.value, papers);
      const articles = readArticlesFromWikijs(articlesFolder, ubook);
      await writeUBParalellsToTSV(paralellsFile, articles);

      addSuccess('Process successful: ARTICLE_CREATE_PARALELLS_FROM_WIKIJS');
    } catch (errors) {
      addErrors(errors);
    } finally {
      processing.value = false;
    }
  };

  return { executeProcess };
};