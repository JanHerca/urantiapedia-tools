import path from 'path';

/**
 * Get folders under the given path.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 */
export const useGetFolders = (
  uiLanguage,
  addLog
) => {
  /**
   * Get folders that are under the given path.
   * @param {string} dirPath Folder.
   * @param {string[]} folders Array to store folder paths.
   * @param {number} level Current level.
   * @param {number} maxLevels Maximum number of levels.
   */
  const readDir = async (dirPath, folders, level, maxLevels) => {
    level++;
    try {
      const result = await window.NodeAPI.readDir(dirPath, { withFileTypes: true });
      const foldersToAdd = result
        .filter(r => r.isDirectory)
        .map(r => path.join(dirPath, r.name));
      folders.push(...foldersToAdd);
      if (level <= maxLevels) {
        const promises = foldersToAdd
          .map(sf => readDir(sf, folders, level, maxLevels));
        await Promise.all(promises);
      }
    } catch (err) {
      throw err;
    }
  };

  /**
   * Get folders that are under the given path.
   * @param {string} dirPath Folder.
   * @param {number} maxLevels Maximum number of levels.
   */
  const getFolders = async (dirPath, maxLevels = 1) => {
    addLog(`Reading folder: ${dirPath}`);
    const folders = [];
    await readDir(dirPath, folders, 0, maxLevels);
    return folders;
  };

  return { getFolders };
};