import { getError } from 'src/core/utils.js';
import { bookConfigs } from 'src/core/urantiabookConfigs.js';

import path from 'path';
import * as cheerio from 'cheerio';

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
   * Returns the array of Urantia Book authors names from HTML content.
   * @param {Object} $ Object with the document as a jQuery object.
   */
  const getAuthorsFromHTML = ($) => {
    const authorConfig = bookConfigs[0].authors;
    let i, node, result = [], index, author;
    if (!authorConfig) return result;
    const nodes = authorConfig.map(a => $(a.item));
    const n = nodes.findIndex(nn => nn.length > 0);
    if (n === -1) return result;
    const [ indexsel, indexpos ] = authorConfig[n].index;
    const [ authorsel, authorpos ] = authorConfig[n].author;
    for (i = 0; i < nodes[n].length; i++) {
      node = nodes[n][i];
      index = $($(node).find(indexsel)[indexpos]).html();
      author = $($(node).find(authorsel)[authorpos]).html();
      if (index && author && !isNaN(parseInt(index))) {
        result[parseInt(index)] = author;
      }
    }
    return result;
  };

  /**
   * Read the `The Urantia Book` authors from a HTML file and update papers.
   * @param {string} dirPath Folder path with the HTML file to read.
   * @param {Object[]} papers Array of objects with UB papers.
   * @returns {Promise<Object[]>} Promise with the array of paper objects updated.
   */
  const readAuthorsFromHTML = async (dirPath, papers) => {
    addLog(`Reading authors file in folder: ${dirPath}`);
    let files = null;
    const language = path.basename(dirPath.replace(/\\/g, '/')).replace('book-', '');
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
        const authors = getAuthorsFromHTML($);
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