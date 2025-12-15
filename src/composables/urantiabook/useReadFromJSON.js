import { useReadFolder } from '../useReadFolder.js';
import { extractStr, getError, reflectPromise } from 'src/core/utils.js';

import path from 'path';

/**
 * Reads `The Urantia Book` from a folder with files in JSON format.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 */
export const useReadFromJSON = (
  uiLanguage,
  addLog
) => {
  const { readFolder } = useReadFolder(uiLanguage, addLog);

  /**
   * Reads a paper from `The Urantia Book` from a file in JSON format.
   * @param {string} filePath File path.
   * @returns {Promise<Object>} Promise that returns an object with paper content.
   */
  const readFileFromJSON = async(filePath) => {
    addLog(`Reading file: ${filePath}`);
    const baseName = path.basename(filePath.replace(/\\/g, '/'));
    const paperIndex = parseInt(extractStr(baseName, 'Doc', '.json'));
    if (isNaN(paperIndex)) {
      throw getError(uiLanguage.value, 'book_no_paper_index', baseName, 1);
    }
    try {
      const buf = await window.NodeAPI.readFile(filePath);
      const content = buf.toString();
      const paper = JSON.parse(content);
      return paper;
    } catch (err) {
      throw err;
    }
  };

  /**
   * Reads `The Urantia Book` from a folder with files in JSON format.
   * @param {string} dirPath Folder path.
   * @returns {Promise<Object[]>} Promise that returns the array of objects
   * with paper content.
   */
  const readFromJSON = async(dirPath) => {
    addLog(`Reading folder: ${dirPath}`);
    try {
      const files = await readFolder(dirPath, '.json');

      const promises = files.map(file => {
        const filePath = path.join(dirPath, file);
        return reflectPromise(readFileFromJSON(filePath));
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
    readFromJSON
  };
};
