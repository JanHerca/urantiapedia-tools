import path from 'path';

/**
 * Reads the default location of the Paralells in Markdown.
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 */
export const useRead = (
  language,
  uiLanguage,
  addLog
) => {
  /**
   * Reads the Markdown file.
   * @param {string[]} lines Lines.
   * @returns {Promise} Promise that returns an object with books and footnotes.
   */
  const readFileEN = (lines) => {
    let comment = false;
    let target = null;
    let header = [];
    const books = [];
    const footnotes = [];

    lines.forEach((line, i) => {
      if (!comment && line.startsWith('<!--')) {
        comment = true;
      }
      if (!comment && line.startsWith('#')) {
        if (line.indexOf('Books') != -1) {
          target = books;
        } else if (line.indexOf('Paralells') != -1) {
          target = footnotes;
        }
      }
      if (!comment && line.indexOf('|') != -1) {
        const values = line.trim()
          .replace(/^\||\|$/g, '')
          .split('|').map(v => v.trim());
        if (values[0] === 'title' || values[0] === 'ub_ref') {
          header = values;
        } else if (
          target && 
          values.length > 0 &&
          values[0] != 'title' && 
          values[0] != 'ub_ref' &&
          values[0].indexOf('---') === -1 &&
          header.length === values.length
        ) {
          const obj = {};
          values.forEach((v, i) => obj[header[i]] = v);
          target.push(obj);
        }
      }
      if (comment && line.trim().endsWith('-->')) {
        comment = false;
      }
    });
    return { books, footnotes };
  };

  /**
   * Reads the Markdown file.
   * @param {string[]} lines Lines.
   * @returns {Promise} Promise that returns an array of translations.
   */
  const readFileOther = (lines) => {
    let comment = false;
    const translations = [];

    lines.forEach(line => {
      if (!comment && line.startsWith('<!--')) {
        comment = true;
      }
      if (!comment && line.indexOf('|') != -1) {
        const values = line.trim()
          .replace(/^\||\|$/g, '')
          .split('|').map(v => v.trim());
        if (
          values.length == 2 &&
          values[0] != 'text' &&
          values[0].indexOf('---') === -1
        ) {
          translations.push({
            text: values[0],
            translation: values[1]
          });
        }
      }
      if (comment && line.trim().endsWith('-->')) {
        comment = false;
      }
    });

    return translations;
  };

  /**
   * Reads the default location of the Paralells in Markdown.
   * @param {string} urantiapediaFolder Urantiapedia folder.
   * @returns {Promise} Promise that returns an object with paralells.
   */
  const readParalells = async (urantiapediaFolder) => {
    addLog(`Reading paralells`);
    try {
      const filePathEN = path.join(urantiapediaFolder, 'input', 'markdown',
        'en', 'paralells.md');
      addLog(`Reading file: ${filePathEN}`);
      const bufEN = await window.NodeAPI.readFile(filePathEN);
      const linesEN = bufEN.toString().split('\n');
      const { books, footnotes } = readFileEN(linesEN);

      let translations = [];
      if (language.value != 'en') {
        const filePathOther = path.join(urantiapediaFolder, 'input', 'markdown',
          language.value, 'paralells.md');
        const exists = await window.NodeAPI.exists(filePathOther);
        if (exists) {
          addLog(`Reading file: ${filePathOther}`);
          const bufOther = await window.NodeAPI.readFile(filePathOther);
          const linesOther = bufOther.toString().split('\n');
          translations = readFileOther(linesOther);
        }
      }
      return { books, footnotes, translations };
    } catch (err) {
      throw err;
    }
  };

  return {
    readParalells
  };
};