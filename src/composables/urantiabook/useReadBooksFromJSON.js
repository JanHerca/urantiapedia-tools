import { useReadFromJSON } from './useReadFromJSON.js';

/**
 * Read several books in JSON. First book must be in English, the others one or 
 * several translations in a given language.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 */
export const useReadBooksFromJSON = (
  uiLanguage,
  addLog
) => {
  const { readFromJSON } = useReadFromJSON(uiLanguage, addLog);

  /**
   * Read several books in JSON. First book must be in English, the others one or 
   * several translations in a given language.
   * @param {Object[]} data Data of folders with JSON files.
   * @param {string} language The language of books from second on.
   * @returns {Promise<Object[]>} Returns an array of objects. Each object has:
   * language, year, copyright, label, isMaster, papers, path.
   */
  const readBooksFromJSON = async (language, data) => {
    addLog(`Reading all books`);
    try {
      const books = data.map((f, i) => {
        const { year, copyright, label, path } = f;
        const folderLan = (i === 0 ? 'en' : language);
        const book = {
          language: folderLan,
          year,
          copyright,
          label,
          isMaster: (f.name === `book-${language}-footnotes`),
          path
        }
        return book;
      });
      const promises = books.map((b, i) => {
        return readFromJSON(b.path);
      });
      const bookPapers = await Promise.all(promises);
      return books.map((b, i) => ({...b, papers: bookPapers[i]}));
    } catch (err) {
      throw err;
    }
  };

  return {
    readBooksFromJSON
  };
};