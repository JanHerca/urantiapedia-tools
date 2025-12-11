import { getError } from 'src/core/utils.js';
import path from 'path';

/**
 * Get files recursively in a folder and inmediate subfolders.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 */
export const useGetFiles = (
  uiLanguage,
  addLog
) => {
  /**
   * Reads a folder and adds files found in all recursive subfolders.
   * @param {string} dirPath Folder.
   * @param {string[]} files Array to stores file paths.
   */
  const readDir = async (dirPath, files) => {
    try {
      const result = await window.NodeAPI.readDir(dirPath, { withFileTypes: true });
      const filesToAdd = result
        .filter(r => r.isFile)
        .map(r => path.join(dirPath, r.name));
      files.push(...filesToAdd);
      const subfolders = result
        .filter(r => r.isDirectory)
        .map(r => path.join(dirPath, r.name));
      const promises = subfolders.map(sf => readDir(sf, files));
      await Promise.all(promises);
    } catch (err) {
      throw getError(uiLanguage.value, 'folder_not_exists', dirPath);
    }
  };

  /**
   * Get files recursively in a folder and subfolders.
   * @param {string} dirPath Folder.
   */
  const getFiles = async (dirPath) => {
    addLog(`Reading folder: ${dirPath}`);
    const files = [];
    await readDir(dirPath, files);
    return files;
  };

  return { getFiles };
};