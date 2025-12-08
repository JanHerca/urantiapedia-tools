import { useReadFileEN } from './useReadFileEN.js';
import { useReadFileOther } from './useReadFileOther.js';

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
      const footnotes = await readFileEN('The Urantia Book', linesEN);
      if (language.value != 'en') {
        addLog(`Reading file: ${filePathOther}`);
        const bufOther = await window.NodeAPI.readFile(filePathOther);
        const linesOther = bufOther.toString().split('\n');
        await readFileOther('The Urantia Book', linesOther, footnotes);
      }
      return footnotes;
    } catch (err) {
      throw err;
    }
  };

  return {
    readForUB
  };
};