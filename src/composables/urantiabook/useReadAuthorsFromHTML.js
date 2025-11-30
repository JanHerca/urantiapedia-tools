import { getError } from 'src/core/utils.js';
import { bookConfigs } from 'src/core/urantiabookConfigs.js';

import path from 'path';
import cheerio from 'cheerio';

/**
 * Reads `The Urantia Book` authors from a HTML file.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 */
export const useReadAuthorsFromHTML = (
  uiLanguage,
  addLog
) => {
  /**
   * Read the `The Urantia Book` authors from a HTML file and update papers.
   * @param {string} dirPath Folder path with the HTML file to read.
   * @param {Object[]} papers Array of objects with UB papers.
   * @returns {Promise<Object[]>} Promise with the array of paper objects updated.
   */
  const readAuthorsFromHTML = async (dirPath, papers) => {
    addLog(`Reading folder: ${dirPath}`);
    let files = null;
    const language = path.basename(dirPath).replace('book-', '');
    try {
      files = await window.NodeAPI.readDir(dirPath);
    } catch (err) {
      throw getError(uiLanguage.value, 'folder_not_exists', dirPath);
    }
    if (files) {
      try {
        const config = bookConfigs.find(c => c.languages.indexOf(language) != -1);
        const file = files.find(filename => {
          return config.titlesFile.test(filename);
        });
        if (!file) {
          throw getError(uiLanguage.value, 'file_not_exists', '"Titles"');
        }
        const filePath = path.join(dirPath, file);
        const buf = await window.NodeAPI.readFile(filePath);
        const content = buf.toString();
        const $ = cheerio.load(content);
        const authors = this.getAuthorsFromHTML($);
        //Write authors
        papers.forEach(p => p.author = authors[p.paper_index]);
        return papers;
      } catch (err) {
        throw err;
      }
    }
  };

  return {
    readAuthorsFromHTML
  };
};