import { useReadFolder } from '../useReadFolder.js';
import { reflectPromise } from 'src/core/utils.js';
import { BibleAbbreviations as BibleAbbs } from 'src/core/bibleAbbs.js';

import path from 'path';

/**
 * Updates titles in Bible pages.
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 */
export const useUpdateWikijsTitles = (
  language,
  uiLanguage,
  addLog
) => {
  const { readFolder } = useReadFolder(uiLanguage, addLog);

  const updateWikijsTitle = async (filePath) => {
    addLog(`Reading file: ${filePath}`);

    try {
      const buf = await window.NodeAPI.readFile(filePath);
      const lines = buf.toString().split('\n');
      const idx = lines.findIndex(line => line.startsWith('title: '));
      if (idx === -1) {
        throw [new Error('Title line not found')];
      }
      const title = lines[idx].split(':')[1].trim();
      const booknames = Object.values(BibleAbbs[language.value]).map(e => e[0]);
      const booknamesEN = Object.values(BibleAbbs['en']).map(e => e[0]);
      const iTitle = booknamesEN.indexOf(title);
      if (iTitle === -1) {
        throw new Error(`Title ${title} not found`);
      }
      const newTitle = booknames[iTitle];
      lines[idx] = `title: ${newTitle}`;
      await window.NodeAPI.writeFile(filePath, lines.join('\n'));

    } catch(err) {
      throw err;
    }
  };

  /**
   * Updates titles in Bible pages.
   * @param {string} dirPath Folder path.
   * @return {Promise} Promise that returns null in resolve function or an
   * array of errors in reject function.
   */
  const updateWikijsTitles = async (dirPath) => {
    addLog(`Reading folder: ${dirPath}`);

    try {
      const files = await readFolder(dirPath, '.md');

      const promises = files.map(file => {
        const filePath = path.join(dirPath, file);
        return reflectPromise(updateWikijsTitle(filePath));
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

  return {
    updateWikijsTitles
  };
};