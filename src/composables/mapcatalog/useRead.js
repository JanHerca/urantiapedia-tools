import path from 'path';

/**
 * Reads the default location of the map catalog.
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 */
export const useRead = (
  language,
  uiLanguage,
  addLog
) => {
  const supported = ['en', 'es'];
  /**
   * Reads the lines and stored them in result array.
   * @param {string[]} lines Lines.
   * @param {string} firstColum Name of first column in expected table.
   * @param {Array} result Array to stored results.
   */
  const readFileLines = (lines, firstColumn, result) => {
    let comment = false;
    let header = [];
    lines.forEach(line => {
      if (!comment && line.startsWith('<!--')) {
        comment = true;
      }
      if (!comment && line.indexOf('|') != -1) {
        const values = line.trim()
          .replace(/^\||\|$/g, '')
          .split('|').map(v => v.trim());
        if (values[0] === firstColumn) {
          header = values;
        } else if (
          values.length > 0 &&
          values[0] != firstColumn &&
          values[0].indexOf('---') === -1 &&
          header.length === values.length
        ) {
          const obj = {};
          values.forEach((v, i) => obj[header[i]] = v);
          result.push(obj);
        }
      }
      if (comment && line.trim().endsWith('-->')) {
        comment = false;
      }
    });
  };

  /**
   * Read the file in english.
   * @param {string[]} lines Lines.
   * @returns {Object[]} Array of map objects.
   */
  const readFileEN = (lines) => {
    const maps = [];
    readFileLines(lines, 'ref', maps);
    return maps;
  };

  /**
   * Read the file in other language not english.
   * @param {string[]} lines Lines.
   */
  const readFileOther = (lines) => {
    const translations = [];
    readFileLines(lines, 'text', translations);
    return translations;
  };

  /**
   * Reads the default location of the map catalog.
   * @param {string} urantiapediaFolder Urantiapedia folder.
   * @returns {Promise} Promise that returns array of objects with map data.
   */
  const readMapCatalog = async (urantiapediaFolder) => {
    addLog(`Reading map catalog`);
    try {
      if (!supported.includes(language.value)) {
        addLog(`Map catalog not supported for: ${language.value}`);
        return null;
      }
      const mapcatalogFileEN = path.join(urantiapediaFolder, 'input', 
        'markdown', 'en', 'map_catalog.md');
      addLog(`Reading file: ${mapcatalogFileEN}`);
      const bufEN = await window.NodeAPI.readFile(mapcatalogFileEN);
      const linesEN = bufEN.toString().split('\n');
      const maps = readFileEN(linesEN);
      let translations = [];
      if (language.value != 'en') {
        const mapcatalogFileCurrent = path.join(urantiapediaFolder, 'input', 
          'markdown', language.value, 'map_catalog.md');
        addLog(`Reading file: ${mapcatalogFileCurrent}`);
        const bufCurrent = await window.NodeAPI.readFile(mapcatalogFileCurrent);
        const linesCurrent = bufCurrent.toString().split('\n');
        translations = readFileOther(linesCurrent);
      }
      return { maps, translations };
    } catch (err) {
      throw err;
    }
  };

  return {
    readMapCatalog
  };
};
