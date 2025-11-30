import { getError } from 'src/core/utils.js';
import path from 'path';
// import { promises as fs } from 'fs';

/**
 * Returns the array of files in folder with given format.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 */
export const useReadFolder = (
  uiLanguage,
  addLog
) => {
  /**
   * Returns the array of files in folder with given format.
   * @param {string} dirPath Folder path.
   * @param {string} format Format as '.txt' or '.tex'. Several formats can be
   * passed this way: '.html;.htm'
   * @return {Promise<string[]>}
   */
  const readFolder = async(dirPath, format) => {
    addLog(`Reading folder: ${dirPath}`);
    let files = null;
    try {
      files = await window.NodeAPI.readDir(dirPath);
    } catch (err) {
      throw getError(uiLanguage.value, 'folder_not_exists', dirPath);
    }
    if (files) {
      const formats = format.split(';');
      const ffiles = files.filter(file => {
        return (formats.indexOf(path.extname(file)) != -1);
      });
      if (ffiles.length === 0) {
        throw getError(uiLanguage.value, 'files_not_with_format', format);
      }
      return ffiles;
    }
  };

  return { readFolder };

};

