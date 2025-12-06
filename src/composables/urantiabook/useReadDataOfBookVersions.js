import { getError } from 'src/core/utils.js';
import { Strings } from 'src/core/strings';
import path from 'path';

/**
 * Reads the data of Urantia Book versions sorted by year.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 */
export const useReadDataOfBookVersions = (
  uiLanguage,
  addLog
) => {
  /**
   * Reads data of Urantia Book versions sorted by year.
   * @param {string} language Language.
   * @param {string} dirPath Directory with JSON folders.
   */
  const readDataOfBookVersions = async (language, dirPath) => {
    addLog(`Reading folder: ${dirPath}`);
    let files = null;
    try {
      files = await window.NodeAPI.readDir(dirPath, { withFileTypes: true });
    } catch (err) {
      throw getError(uiLanguage.value, 'folder_not_exists', dirPath);
    }
    if (files) {
      const regEx = new RegExp(`book-(en|${language})-.+`);
      const folders = files
        .filter(dirent => {
          return (dirent.isDirectory &&
            dirent.name.match(regEx) != null);
        })
        .map(dirent => {
          const data = {
            name: dirent.name,
            path: path.join(dirPath, dirent.name),
            year: Strings.bookMasterYear.en,
            copyright: Strings.foundation[language],
            label: Strings.bookMasterYear.en
          };
          if (dirent.name === 'book-en-footnotes') {
            return data;
          } else if (dirent.name === `book-${language}-footnotes`) {
            data.year = Strings.bookMasterYear[language];
            data.label = Strings.bookMasterYear[language];
            return data;
          } else {
            const byear = Strings.bookYears[language]
              ? Strings.bookYears[language].find(by => by.name === dirent.name)
              : null;
            return byear
              ? {
                ...data,
                ...byear,
                copyright: byear.copyright === "UF"
                  ? Strings.foundation[language]
                  : byear.copyright
              }
              : data;
          }
        })
        .sort((a, b) => {
          //Sort from left (older) to right (newer)
          return (a.year - b.year);
        });
        return folders;
    }
    throw getError(uiLanguage.value, 'No data found for book versions');
  };

  return {
    readDataOfBookVersions
  };
};