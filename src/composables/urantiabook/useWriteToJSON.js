import { getError, reflectPromise } from 'src/core/utils.js';

import path from 'path';

/**
 * Write the Urantia Book in JSON.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 */
export const useWriteToJSON = (
  uiLanguage,
  addLog
) => {
  /**
   * Writes a paper of `The Urantia Book` in JSON format.
   * @param {string} filePath File path.
   * @param {Object} paper Paper object.
   */
  const writeFileToJSON = async (filePath, paper) => {
    addLog(`Writing file: ${filePath}`);
    try {
      const json = JSON.stringify(paper, null, 4);
      await window.NodeAPI.writeFile(filePath, json);
    } catch (err) {
      throw err;
    }
  };

  /**
 * Writes `The Urantia Book` in JSON format.
 * @param {string} dirPath Folder path.
 * @param {Object[]} papers Array of objects with papers.
 */
  const writeToJSON = async (dirPath, papers) => {
    addLog(`Writing to folder: ${dirPath}`);
    try {
      const baseName = path.basename(dirPath);
      const access = await window.NodeAPI.exists(dirPath);
      if (!access) {
        throw getError(uiLanguage.value, 'folder_no_access', baseName)
      }
      const promises = papers
        .map(paper => {
          const i = paper.paper_index;
          const stri = (i > 99 ? `${i}` : (i > 9 ? `0${i}` : `00${i}`));
          const filePath = path.join(dirPath, `Doc${stri}.json`);
          return reflectPromise(writeFileToJSON(filePath, paper));
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
    writeToJSON
  };
};