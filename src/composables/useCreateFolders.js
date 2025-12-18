import { tr, getError, reflectPromise } from 'src/core/utils.js';

import path from 'path';

export const useCreateFolders = (
  uiLanguage,
  addLog
) => {

  /**
   * Creates a folder if not exists.
   * @param {string} folder Folder path.
   */
  const createFolderIfNotExists = async (folder) => {
    try {
      addLog(`Creating folder: ${folder}`);
      const exists = await window.NodeAPI.exists(folder);
      if (!exists) {
        await window.NodeAPI.createFolder(folder);
      }
    } catch (er) {
      throw getError(uiLanguage.value, 'folder_no_access', folder);
    }
  };

  /**
   * Get folders that are under the given path.
   * @param {string} sourcePath Source path.
   * @param {string} targetPath Target path.
   * @param {string[]} folders Array to store folder paths.
   * @param {number} level Current level.
   * @param {number} maxLevels Maximum number of levels.
   */
  const readDir = async (sourcePath, targetPath, folders, level, maxLevels) => {
    level++;
    try {
      const result = await window.NodeAPI.readDir(sourcePath, { withFileTypes: true });
      const foldersToRead = result
        .filter(r => r.isDirectory)
        .map(r => path.join(sourcePath, r.name));
      const foldersToAdd = result
        .filter(r => r.isDirectory)
        .map(r => path.join(targetPath, r.name));
      folders.push(...foldersToAdd);
      if (level <= maxLevels) {
        const promises = foldersToRead
          .map((sf, i) => readDir(sf, foldersToAdd[i], folders, level, maxLevels));
        await Promise.all(promises);
      }
    } catch (err) {
      throw err;
    }
  };

  /**
   * Creates the same folders from source into target (only folders, not files).
   * @param {string} sourcePath Source path.
   * @param {string} targetPath Target path.
   * @param {number} maxLevels Maximum number of levels.
   */
  const createFolders = async (sourcePath, targetPath, maxLevels = 1) => {
    try {
      addLog(`Creating folders from: ${sourcePath}`);
      const folders = [];
      await readDir(sourcePath, targetPath, folders, 0, maxLevels);
      const promises = folders.map(folder => {
        const promise = createFolderIfNotExists(folder);
        return reflectPromise(promise);
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

  return { createFolders };
};