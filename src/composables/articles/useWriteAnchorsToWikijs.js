import { getError } from 'src/core/utils.js';
import { useGetFiles } from '../useGetFiles.js';

import path from 'path';

/**
 * Writes navigation headers of articles in Wiki.js format. 
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 */
export const useWriteAnchorsToWikijs = (
  language,
  uiLanguage,
  addLog
) => {
  const { getFiles } = useGetFiles(uiLanguage, addLog);

  const reLink = new RegExp(`\\[[^\\]]+\\]\\(\/${language.value}\/` +
    'The_Urantia_Book\/(\\d+)#p(\\d+)(?:_(\\d+))?\\)', 'g');
  const reAnchor = new RegExp('<a id="[as]\\d+_\\d+"><\\/a>', 'g');

  /**
   * Writes anchors in one file.
   * @param {string} filePath File path.
   * @param {string[]} studyAidPaths Array of paths with Study Aids.
   */
  const processFile = async (filePath, studyAidPaths) => {
    try {
      addLog(`Reading file: ${filePath}`);
      const filePath2 = filePath.replace(/\\/g, '/');
      const isStudyAid = studyAidPaths
        .find(p => filePath2.indexOf(p) != -1) != null;
      const prefix = (isStudyAid ? 's' : 'a');

      const buf = await window.NodeAPI.readFile(filePath);
      const lines = buf.toString().split('\n');
      
      const newLines = lines.map((line, i) => {
        const newLine = line.replace(reAnchor, '');
        let newLine2 = '';
        const matches = [...newLine.matchAll(reLink)];
        if (matches.length === 0) {
          return newLine;
        }
        const indexes = matches.map(m => m.index);
        indexes.forEach((index, n) => {
          const prev = (n === 0 ? 0 : indexes[n - 1]);
          const s = newLine.substring(prev, index);
          const id = `${prefix}${i}_${index}`;
          newLine2 += s + `<a id="${id}"></a>`;
        });
        newLine2 += newLine.substring(indexes[indexes.length - 1]);
        return newLine2;
      });

      const content = newLines.join('\n');
      addLog(`Writing file: ${filePath}`);
      await window.NodeAPI.writeFile(filePath, content);

    } catch (err) {
      throw err;
    }
  };

  /**
   * Writes anchors for links in Wiki.js format. 
   * Articles must be in Markdown format, and creates links for Urantia Book.
   * @param {string} dirPath Output folder.
   * @param {Object} index Object with the index.
   */
  const writeAnchorsToWikijs = async (dirPath, index) => {
    try {
      addLog(`Writing anchors in folder: ${dirPath}`);
      const files = await getFiles(dirPath);
      const studyAidPaths = index.issues.reduce((ac, cur) => {
        cur.articles.forEach(article => ac.push(article.path));
        return ac;
      }, []);
      const formats = ['.md'];
      const ffiles = files.filter(file => {
        return (formats.indexOf(path.extname(file)) != -1);
      });
      if (ffiles.length === 0) {
        throw getError(uiLanguage.value, 'files_not_with_format', formats.toString());
      }

      const promises = ffiles.map(filePath => 
        reflectPromise(processFile(filePath, studyAidPaths)));
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
    writeAnchorsToWikijs
  };
};