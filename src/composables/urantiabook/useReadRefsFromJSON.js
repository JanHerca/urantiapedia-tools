import { getError } from 'src/core/utils.js';

import path from 'path';

//TODO: Is this not repeated in paramony / useReadFromJSON.js

/**
 * Reads `The Urantia Book` from a folder with files in JSON format.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 */
export const useReadRefsFromJSON = (
  uiLanguage,
  addLog
) => {
	/**
	 * Reads references (footnotes) from a file called `footnotes-book-xx.json` 
	 * in parent folder of the one passed in param and stores everything in a
	 * footnotes object.
	 * @param {string} dirPath Folder path.
   * @returns {Promise<Object[]>} Promise that returns the array of objects
   * with footnotes content.
	 */
	const readRefsFromJSON = async (dirPath) => {
    addLog(`Accessing folder: ${dirPath}`);

    try {
      const baseName = path.basename(dirPath.replace(/\\/g, '/'));
      const access = await window.NodeAPI.exists(dirPath);
      if (!access) {
        throw getError(uiLanguage.value, 'folder_no_access', baseName);
      }

      addLog(`Reading folder: ${dirPath}`);
      let parentPath = path.dirname(dirPath);
      let filePath = path.join(parentPath, `footnotes-${baseName}.json`);
      const exists = await window.NodeAPI.exists(filePath);
      if (!exists) {
        throw getError(uiLanguage.value, 'file_not_exists', filePath);
      }
      const buf = await window.NodeAPI.readFile(filePath);
      const content = buf.toString();
      const obj = JSON.parse(content);
      const footnotes = obj.content;
      return footnotes;
    } catch (err) {
      throw err;
    }
	};

  return {
    readRefsFromJSON
  };
};