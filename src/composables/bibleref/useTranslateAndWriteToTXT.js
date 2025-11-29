import { getError, reflectPromise } from 'src/core/utils.js';

import path from 'path';

/**
 * Translates Bible references using `The Urantia Book` and writes TXT files.
 * @param {Ref<string>} language Language ref.
 * @param {function} addLog Function to add log messages.
 * @param {function} addWarning Function to add warning messages.
 */
export const useTranslateAndWriteToTXT = (language, addLog, addWarning) => {

  /**
   * Translates Bible references using `The Urantia Book`.
   * @param {Object[]} bible_books Array of Bible books with references.
   * @param {UrantiaBook} ub_book UrantiaBook instance.
   * @returns {Object[]} Translated Bible books.
   */
  const translate = (bible_books, ub_book) => {
    addLog(`Translating Bible references`);

    const errors = [];
    bible_books.forEach(book => {
      book.refs.forEach(ref => {
        if (!ref) {
          addWarning(`No reference found in book ${book.abb}`);
          return;
        }
        const bref = `${book.abb} ${ref.bible_ref}`;
        let footnotes, subfootnotes, subfootnote;

        try {
          footnotes = ub_book.getFootnotes(ref.lu_ref);
          subfootnotes = ub_book.getSubFootnotes(footnotes);
          subfootnote = subfootnotes.find(sf => sf[1] === bref);
          if (subfootnote) {
            ref.text_tr = subfootnote[0];
          }
        } catch (err) {
          errors.push(getError(language.value, `${err.message}: ${bref}`));
        }
      });
    });

    if (errors.length > 0) {
      throw errors;
    }

    return bible_books;

  };

  /**
   * Writes a Bible book problems to a file in TXT format.
   * @param {string} filePath File path.
   * @param {Object} bible_book Bible book with its references.
   * @returns {Promise}
   */
  const writeFileToTXT = async (filePath, bible_book) => {
    addLog(`Writing file: ${filePath}`);
    let txt = '';
    try {
      bible_book.refs.forEach(ref => {
        if (!ref) {
          return;
        }
        const text_tr = (ref.text_tr ? ref.text_tr : ref.text);
        const problem = (ref.text_tr ? '' : 'PROBLEM');
        txt += `${bible_book.titleEN}\t${ref.bible_ref}\t#` +
          `\t${ref.lu_ref}/#\t${text_tr}\t${ref.type}` +
          `\t${problem}\r\n`;
      });
      await window.NodeAPI.writeFile(filePath, txt);
    } catch (err) {
      throw err;
    }
  };

  /**
   * Writes Bible books problems to files in TXT format.
   * @param {string} dirPath Folder path.
   * @param {Object[]} bible_books Array of Bible books with references.
   * @returns {Promise}
   */
  const writeToTXT = async (dirPath, bible_books) => {
    addLog(`Writing to TXT in folder: ${dirPath}`);
    try {
      const promises = bible_books.map(book => {
        const filePath = path.join(dirPath, book.file);
        return reflectPromise(writeFileToTXT(filePath, book));
      });
      const results = await Promise.all(promises);
      const errors = results.filter(r => r.error).map(r => r.error);
      if (errors.length > 0) {
        throw errors;
      }
    } catch (err) {
      throw err;
    }

  };

  return {
    translate,
    writeToTXT
  };
};
