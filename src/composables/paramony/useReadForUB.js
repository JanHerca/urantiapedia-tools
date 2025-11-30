import { useReadFileEN } from 'src/composables/paramony/useReadFileEN.js';
import { useReadFileOther } from 'src/composables/paramony/useReadFileOther.js';

import path from 'path';

/**
 * Reads the default location of the Paramony in Markdown for Urantia Book.
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 */
export const useReadForUB = (
  language,
  uiLanguage,
  addLog
) => {
  const { readFileEN } = useReadFileEN(uiLanguage, addLog);
  const { readFileOther } = useReadFileOther(language, uiLanguage, addLog);

  /**
   * Reads the default location of the Paramony in Markdown for Urantia Book.
   * @param {string} urantiapediaFolder Folder with Urantiapedia.
   * @returns {Promise} Promise that returns an array of objects with footnotes.
   */
  const readForUB = async (urantiapediaFolder) => {
    try {
      const filePathEN = path.join(urantiapediaFolder, 'input', 'markdown',
        'en', 'paramony', 'The Urantia Book.md');
      const filePathOther = path.join(urantiapediaFolder, 'input', 'markdown',
        `${language.value}`, 'paramony', 'The Urantia Book.md');
      addLog(`Reading file: ${filePathEN}`);
      const bufEN = await window.NodeAPI.readFile(filePathEN);
      const linesEN = bufEN.toString().split('\n');
      const footnotesEN = await readFileEN('The Urantia Book', linesEN);
      let footnotesOther = [];
      if (language.value != 'en') {
        addLog(`Reading file: ${filePathOther}`);
        const bufOther = await window.NodeAPI.readFile(filePathOther);
        const linesOther = bufOther.toString().split('\n');
        footnotesOther = await readFileOther('The Urantia Book', linesOther, 
          footnotesEN);
      }
      return language.value === 'en' ? footnotesEN : footnotesOther;
    } catch (err) {
      throw err;
    }
  };

  return {
    readForUB
  };
};