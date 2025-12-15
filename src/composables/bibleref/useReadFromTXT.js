import { useReadFolder } from '../useReadFolder.js';
import { getError, reflectPromise, extractVers } from 'src/core/utils.js';
import { BibleAbbreviations as BibleAbbs } from 'src/core/bibleAbbs.js';

import path from 'path';

/**
 * Reads Bible references from a folder with files in TXT format.
 * @example
 * biblerefs = [
 *   {
 *     titleEN: '1 Chronicles',
 *     title: 'I Crónicas',
 *     file: '1 Chronicles.txt',
 *     abb: '1 Cr',
 *     refs: [
 *       {
 *         bible_ref: '10:1-5',
 *         bible_chapter: 10,
 *         bible_vers: 1,
 *         lu_ref: '134:9.5',
 *         text: 'Gilboa, donde murió Saúl',
 *         type: 'C'
 *       },
 *       ...
 *     ]
 *   }
 * ];
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 */
export const useReadFromTXT = (
  language, 
  uiLanguage, 
  addLog
) => {
  const { readFolder } = useReadFolder(uiLanguage, addLog);

  /**
   * Extracts Bible references from TXT lines.
   * @param {string} baseName Base file name.
   * @param {string[]} lines Array of lines from the TXT file.
   * @returns {Object} Object with book title, abbreviation, and references.
   */
  const extractFromTXT = (baseName, lines) => {
    const booknameEN = path.basename(baseName.replace(/\\/g, '/'), '.txt');
    const booknamesEN = Object.values(BibleAbbs.en).map(e => e[0]);
    const booknames = Object.values(BibleAbbs[language.value]).map(e => e[0]);
    const bookabbs = Object.keys(BibleAbbs[language.value]);
    const bookIndex = booknamesEN.indexOf(booknameEN);
    if (bookIndex === -1) {
      throw getError(uiLanguage.value, 'bibleref_bookname_invalid', baseName, 0);
    }
    const book = {
      titleEN: booknameEN,
      title: booknames[bookIndex],
      abb: bookabbs[bookIndex],
      file: baseName,
      refs: []
    };

    const errors = [];
    lines.forEach((line, i) => {
      let data = null,
      ref,
      data2,
      data3,
      bible_ref,
      chapter,
      vers;
      if (line.trim() != '' && !line.startsWith('#') && !line.startsWith('Book')) {
        data = line.split('\t');
        if (data.length < 6) {
          errors.push(getError(uiLanguage.value, 'bibleref_no_data', baseName, i));
        } else {
          bible_ref = data[1];
          data2 = bible_ref.split(':');
          data3 = data[3].split('/');
          if (data2.length < 2) {
            errors.push(getError(uiLanguage.value, 'bibleref_bad_ref', baseName, i));
          } else if (data3.length != 2) {
            errors.push(getError(uiLanguage.value, 'bibleref_bad_ub_ref', baseName, i));
          } else {
            chapter = parseInt(data2[0]);
            vers = extractVers(data2[1]);
            if (vers === 'all') {
              bible_ref = chapter.toString();
              vers = 1;
            }
            if (chapter === 0 || vers === 0 || isNaN(chapter) || vers == null) {
              errors.push(getError(uiLanguage.value, 'bibleref_bad_number', baseName, i));
            } else {
              ref = {
                bible_ref: bible_ref,
                bible_chapter: chapter,
                bible_vers: vers,
                lu_ref: data3[0],
                text: data[4],
                type: data[5].trim()
              };
              book.refs.push(ref);
            }
          }
        }
      }
    });
    if (errors.length > 0) {
      throw errors;
    }
    return book;
  };

  /**
   * Reads a Bible reference from a file in TXT format.
   * @param {string} filePath File path.
   * @returns {Promise<Object>} Promise that returns an object with Bible book 
   * and its references.
   */
  const readFileFromTXT = async(filePath) => {
    addLog(`Reading file: ${filePath}`);
    const baseName = path.basename(filePath.replace(/\\/g, '/'));

    try {
      const buf = await window.NodeAPI.readFile(filePath);
      const lines = buf.toString().split('\n');
      const book = extractFromTXT(baseName, lines);
      return book;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Reads Bible references from a folder with files in TXT format.
   * @param {string} dirPath Folder path.
   * @returns {Promise<Object[]>} Promise that returns an array of objects
   * with Bible books and their references.
   */
  const readFromTXT = async(dirPath) => {
    try {
      const files = await readFolder(dirPath, '.txt');
      
      const promises = files.map(file => {
        const filePath = path.join(dirPath, file);
        return reflectPromise(readFileFromTXT(filePath));
      });

      const results = await Promise.all(promises);
      const errors = results.filter(r => r.error).map(r => r.error);
      if (errors.length > 0) {
        throw errors;
      }
      return results.map(r => r.value);
    } catch (err) {
      throw err;
    }
  };

  return {
    readFromTXT
  };
};
