import { useReadFileEN } from './useReadFileEN.js';
import { useReadFileOther } from './useReadFileOther.js';
import { useReadFolder } from '../useReadFolder.js';

import { BibleAbbreviations as BibleAbbs } from 'src/core/bibleAbbs.js';

import path from 'path';

/**
 * Reads the default location of the Paramony in Markdown for Bible..
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 */
export const useReadForBible = (
  language,
  uiLanguage,
  addLog
) => {
  const { readFileEN } = useReadFileEN(uiLanguage, addLog);
  const { readFileOther } = useReadFileOther(language, uiLanguage, addLog);
  const { readFolder } = useReadFolder(uiLanguage, addLog);

  const booknamesEN = Object.values(BibleAbbs.en).map(e => e[0]);

  /**
   * Reads the file for a book in English.
   * @param {string} paramonyFolder Folder with Bible Refs in Markdown format.
   * @param {string} name Name of book.
   * @returns {Promise<Object>} Returns an object with the refs for a Bible book.
   */
  const readFileWithEN = async (paramonyFolder, name) => {
    const paramonyFolderEN = paramonyFolder.replace(
      `${path.sep}${language.value}${path.sep}`, 
      `${path.sep}en${path.sep}`);
    const filePath = path.join(paramonyFolderEN, `${name}.md`);
    addLog(`Reading file: ${filePath}`);
    try {
      const buf = await window.NodeAPI.readFile(filePath);
      const lines = buf.toString().split('\n');
      const biblebooks = await readFileEN(name, lines);
      return biblebooks[0];
    } catch (err) {
      throw err;
    }
  };

  /**
   * Reads the files for other language apart from English.
   * @param {string} paramonyFolder Folder with Bible Refs in Markdown format.
   * @param {Object[]} biblebooks Array of objects where store the content for
   * the other language.
   * @return {Promise<Object[]>} Returns an array of objects with problems found
   * in translations. Each object contains titleEN, bible_ref, lu_ref and text.
   */
  const readFilesWithOther = async (paramonyFolder, biblebooks) => {
    const filePathOtherUB = path.join(paramonyFolder, 'The Urantia Book.md');
    const filePathOtherBible = path.join(paramonyFolder, 'Bible.md');
    try {
      addLog(`Reading file: ${filePathOtherUB}`);
      const bufUB = await window.NodeAPI.readFile(filePathOtherUB);
      const linesUB = bufUB.toString().split('\n');
      addLog(`Reading file: ${filePathOtherBible}`);
      const bufBible = await window.NodeAPI.readFile(filePathOtherBible);
      const linesBible = bufBible.toString().split('\n');

      const lines = [...linesUB, ...linesBible];
      //TODO: Why read here UB lines if only Bible books are updated??
      const noTranslated = await readFileOther('Bible', lines, biblebooks);
      return noTranslated;
    } catch (err) {
      throw err;
    }

  };

  /**
   * Reads the default location of the Paramony in Markdown for Bible.
   * @param {string} paramonyFolder Folder with Bible Refs in Markdown format.
   * @returns {Promise} Promise that returns null in resolve function or an 
   * array of errors in reject function.
   */
  const readForBible = async (paramonyFolder) => {
    try {
      const files = await readFolder(paramonyFolder, '.md');
      const bookNames = booknamesEN.filter(name => {
        return files.find(f => f.endsWith(`${name}.md`)) != undefined;
      });

      const noTranslated = [];

      const promises = bookNames.map(name => {
        return reflectPromise(readFileWithEN(paramonyFolder, name));
      });
      const biblebooks = await Promise.all(promises);
      const errors = biblebooks.filter(r => r.error).map(r => r.error);
      if (errors.length > 0) {
        throw errors;
      }
      if (language.value != 'en') {
        const noTranslated = await readFilesWithOther(paramonyFolder, biblebooks);
      }

      return {
        biblebooks,
        noTranslated
      }
    } catch (err) {
      throw err;
    }
  };

  return {
    readForBible
  };
};