import { getError, reflectPromise } from 'src/core/utils.js';
import { useGetFiles } from '../useGetFiles.js';
import { useProcessLines } from './useProcessLines.js';

import path from 'path';

/**
 * Writes the current index read to Wiki.js HTML format.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 * @param {function} addWarning Function to add warning messages.
 */
export const useEstimateFolder = (
  uiLanguage,
  addLog,
  addWarning
) => {
  const { getFiles } = useGetFiles(uiLanguage, addLog);
  const { processLines } = useProcessLines(uiLanguage, addLog);

  /**
   * Estimates number of characters required for translation in a Markdown file.
   * @param {string} sourcePath Source file path.
   * @param {string} sourceLan Source language code, like `en`.
   * @param {string} targetLan Target language code, like `es`.
   * @param {boolean} isLibraryBook If it is a book (otherwise is an article).
   * @param {UrantiaBook} targetBook Urantia Book in target language.
   * @param {?string[]} errors Optional array for issues.
   * @return {Promise} Returns an array of strings with a report of issues found.
   */
  const estimateFile = async (
    sourcePath,
    sourceLan,
    targetLan,
    isLibraryBook,
    targetBook,
    errors = []
  ) => {
    const result = {};
    try {
      //Read the file
      const buf = await window.NodeAPI.readFile(sourcePath);
      const lines = buf.toString().split('\n');

      addLog(`Estimating file: ${sourcePath}`);
      //Process lines
      result.objects = processLines(lines, sourceLan, targetLan, isLibraryBook,
        targetBook, errors);
      result.errors = errors.flat().slice();
      const lineCount = result.objects
        .reduce((ac, cur) => ac + cur.line.length, 0);
      result.lineCount = lineCount;
      const trCount = result.objects
        .filter(obj => obj.ignore != true)
        .reduce((ac, cur) => ac + (cur.text ? cur.text.length : 0), 0);
      result.trCount = trCount;
      if (result.errors.length > 0) {
        result.errors.forEach(e => addWarning(e));
      }
      return result;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Estimates number of characters required for translation in all Markdown
   * files inside a folder.
   * @param {string} sourcePath Source file path.
   * @param {string} sourceLan Source language code, like `en`.
   * @param {string} targetLan Target language code, like `es`.
   * @param {boolean} isLibraryBook If it is a book (otherwise is an article).
   * @param {UrantiaBook} targetBook Urantia Book in target language.
   * @param {string} urantiapediaFolder Urantiapedia folder.
   * @return {Promise<Array>} Returns an array of arrays of strings.
   */
  const estimateFolder = async (
    sourcePath,
    sourceLan,
    targetLan,
    isLibraryBook,
    targetBook,
    urantiapediaFolder
  ) => {
    try {
      addLog(`Estimating folder: ${sourcePath}`);
      const files = await getFiles(sourcePath);
      const promises = files.map(file => {
        const promise = estimateFile(file, sourceLan, targetLan,
          isLibraryBook, targetBook);
        return reflectPromise(promise);
      });
      const results = await Promise.all(promises);
      const errors = results.filter(r => r.error).map(r => r.error);
      if (errors.length > 0) {
        throw errors;
      }
      let lineCount = 0;
      let trCount = 0;
      const output = {
        objects: {},
        summary: []
      };

      results.forEach((result, i) => {
        const obj = result.value;
        output.objects[files[i]] = obj;
        lineCount += obj.lineCount;
        trCount += obj.trCount;
        const name = files[i].replace(urantiapediaFolder, '').replace(/\\/g, '/');
        output.summary.push({
          name,
          text_in_file: obj.lineCount,
          text_to_translate: obj.trCount
        });
      });
      output.summary.push({
        name: 'Total',
        text_in_file: lineCount,
        text_to_translate: trCount
      });

      return output;

    } catch (err) {
      throw err;
    }
  }

  return {
    estimateFolder
  };
};