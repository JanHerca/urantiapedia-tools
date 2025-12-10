import { getWikijsHeader } from 'src/core/wikijs.js';

import { useWriteHTMLToWikijs } from '../useWriteHTMLToWikijs.js';

/**
 * Writes the current index read to Wiki.js HTML format.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 * @param {function} createArticlesIndex Function to create an index.
 */
export const useWriteIndexFileToWikijs = (
  uiLanguage,
  addLog
) => {
  const { writeHTMLToWikijs } = useWriteHTMLToWikijs();

  /**
   * Writes the current index read to Wiki.js HTML format.
   * @param {string} filePath Output Wiki file.
   * @param {Object} index Object with the index.
   */
  const writeIndexFileToWikijs = async (filePath, index) => {
    try {
      
      let body = '';
      let header = '';
      header += getWikijsHeader(index.title.trim(), index.tags.map(t => t.trim()));
      header += '\r\n';
      addLog(`Compiling pug template articleindex.pug`);
      await window.NodeAPI.compileTemplate('articleindex.pug');
      body = await window.NodeAPI.renderTemplate('articleindex.pug', index);
      
      addLog(`Writing file: ${filePath}`);
      await writeHTMLToWikijs(filePath, header, body);

    } catch (err) {
      throw err;
    }
  };

  return {
    writeIndexFileToWikijs
  };
};