import { useReadFromJSON } from '../urantiabook/useReadFromJSON.js';
import { useReadDataOfBookVersions } from '../urantiabook/useReadDataOfBookVersions.js';
import { useReadBooksFromJSON } from '../urantiabook/useReadBooksFromJSON';
import { useWriteIndexToWikijs } from '../urantiabook/useWriteIndexToWikijs.js';

import { UrantiaBook } from 'src/core/urantiabook.js';

import path from 'path';

/**
 * Convert Urantia Book Index (JSON) to Wiki.js
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {Ref<boolean>} processing Processing flag.
 * @param {function} addLog Function to add log messages.
 * @param {function} addErrors Function to add error messages.
 * @param {function} addSuccess Function to add success messages.
 */
export const useBOOK_INDEX_MULTIPLE_JSON_TO_WIKIJS = (
  language,
  uiLanguage,
  processing,
  addLog,
  addErrors,
  addSuccess
) => {
  const { readFromJSON } = useReadFromJSON(uiLanguage, addLog);
  const { readDataOfBookVersions } = useReadDataOfBookVersions(uiLanguage, addLog);
  const { readBooksFromJSON } = useReadBooksFromJSON(uiLanguage, addLog);
  const { writeIndexToWikijs } = useWriteIndexToWikijs(language, uiLanguage, addLog);
  /**
   * Reads Master UB (*.json) => 
   * Get paths to several UB versions +
   * Reads all UB versions (*.json) +
   * Checks book versions + Writes (Wiki.js *.html)
   * Writes Indexes (*.html)
   * @param {string} bookFolder Folder with Urantia Book in JSON format.
   * @param {string} outputFolder Output folder for HTML files.
   */
  const executeProcess = async (
    bookFolder,
    outputFolder
  ) => {
    processing.value = true;
    addLog('Executing process: BOOK_INDEX_MULTIPLE_JSON_TO_WIKIJS');

    try {
      const masterDir = path.join(bookFolder, `book-${language.value}-footnotes`);
      //Reading The Urantia Book
      const masterPapers = await readFromJSON(masterDir);
      const masterBook = new UrantiaBook(language.value, masterPapers);
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
      const book = books.find(b => b.isMaster);
      await writeIndexToWikijs(outputFolder, book, books);

      addSuccess('Process successful: BOOK_INDEX_MULTIPLE_JSON_TO_WIKIJS');
    } catch (errors) {
      addErrors(errors);
    } finally {
      processing.value = false;
    }
  };

  return { executeProcess };
};