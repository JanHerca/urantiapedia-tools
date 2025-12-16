import { reflectPromise } from 'src/core/utils.js';
import { useGetFiles } from '../useGetFiles.js';
import { useProcessLines } from './useProcessLines.js';

import path from 'path';

/**
 * Creates a collection of files with content ready for being translated in an
 * external tool.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 * @param {function} addWarning Function to add warning messages.
 */
export const usePrepareTranslation = (
  uiLanguage,
  addLog,
  addWarning
) => {
  const { getFiles } = useGetFiles(uiLanguage, addLog);
  const { processLines } = useProcessLines(uiLanguage, addLog);

  /**
   * Creates a collection of files with content ready for being translated in an
   * external tool.
   * @param {string} sourcePath Source file path.
   * @param {string} sourceLan Source language code, like `en`.
   * @param {string} targetLan Target language code, like `es`.
   * @param {boolean} isLibraryBook If it is a book (otherwise is an article).
   * @param {UrantiaBook} sourceBook Urantia Book in source language.
   * @param {UrantiaBook} targetBook Urantia Book in target language.
   * @param {string} urantiapediaFolder Urantiapedia folder.
   */
  const prepareFile = async (
    sourcePath,
    sourceLan,
    targetLan,
    isLibraryBook,
    sourceBook,
    targetBook,
  ) => {
    const result = {};
    try {
      //Read the file
      const buf = await window.NodeAPI.readFile(sourcePath);
      const lines = buf.toString().split('\n');

      addLog(`Preparing translation of file: ${sourcePath}`);
      //Preparing
      const errors = [];
      result.objects = processLines(lines, sourceLan, targetLan, isLibraryBook,
        targetBook, errors);
      result.errors = errors.flat().slice();
      return result;

    } catch (err) {
      throw err;
    }
  };


  /**
   * Creates a collection of files with content ready for being translated in an
   * external tool.
   * @param {string} sourcePath Source file path.
   * @param {string} sourcePath Target file path.
   * @param {string} sourceLan Source language code, like `en`.
   * @param {string} targetLan Target language code, like `es`.
   * @param {boolean} isLibraryBook If it is a book (otherwise is an article).
   * @param {UrantiaBook} sourceBook Urantia Book in source language.
   * @param {UrantiaBook} targetBook Urantia Book in target language.
   * @param {string} urantiapediaFolder Urantiapedia folder.
   */
  const prepareFolder = async (
    sourcePath,
    targetPath,
    sourceLan,
    targetLan,
    isLibraryBook,
    sourceBook,
    targetBook,
    urantiapediaFolder
  ) => {
    try {
      addLog(`Preparing translation of folder: ${sourcePath}`);
      const files = await getFiles(sourcePath);
      const promises = files.map(file => {
        const promise = prepareFile(file, sourceLan, targetLan,
          isLibraryBook, sourceBook, targetBook);
        return reflectPromise(promise);
      });
      const results = await Promise.all(promises);
      const errors = results.filter(r => r.error).map(r => r.error);
      if (errors.length > 0) {
        throw errors;
      }

      const output = {};
      results.forEach((result, i) => {
        const name = files[i].replace(urantiapediaFolder, '').replace(/\\/g, '/');
        output[name] = result.value;
      });

      //Writing the objects file (_translate.json)
      const filePath = path.join(targetPath, '_translate.json');
      addLog(`Writing to file: ${filePath}`);
      const json = JSON.stringify(output, null, 4);
      await window.NodeAPI.writeFile(filePath, json);

      //Writing the files to translate (_translate_XX.md)
      //TODO: Include in translate key of each object an array with file index and line
      //TODO: Create a max of 99 files (better if 10 to 20) with texts
      //TODO: Improvements: extract texts from copyright lines
      //TODO: Improvements: add original and trasnlated UB pars for use in quotes
      //TODO: Improvements: process Markdown tables to avoid problems in translations

    } catch (err) {
      throw err;
    }
  };

  return {
    prepareFolder
  };
};