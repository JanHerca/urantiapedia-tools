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

      //Writing the files to translate (_translate_XX.md)
      let fileline = -1;
      let filename = 1;
      let text = '';
      let many = false;
      const texts = [];
      for (let key in output) {
        const { objects } = output[key];
        objects.forEach(obj => {
          if (filename > 99) {
            many = true;
            return;
          }
          if (fileline > 2000) {
            texts.push([filename, text]);
            filename++;
            fileline = -1;
            text = '';
          }
          if (obj.text) {
            fileline += 2;
            obj.fileline = fileline;
            obj.filename = `_translate_${filename.toString().padStart(2, '0')}.md`;
            text += (obj.text + (obj.text.endsWith('\r') ? '\n\r\n' : '\r\n\r\n'));
          }
        });
      }
      if (many) {
        throw new Error('Too many lines to translate. Reduce number of files.');
      }
      if (text != '') {
        texts.push([filename, text]);
      }
      const promises2 = texts.map(tt => {
        const fileName = `_translate_${tt[0].toString().padStart(2, '0')}.md`;
        const filePathMD = path.join(targetPath, fileName);
        addLog(`Writing to file: ${filePathMD}`);
        return window.NodeAPI.writeFile(filePathMD, tt[1]);
      });
      await Promise.all(promises2);

      //Writing the objects file (_translate.json)
      const filePath = path.join(targetPath, '_translate.json');
      addLog(`Writing to file: ${filePath}`);
      const json = JSON.stringify(output, null, 4);
      await window.NodeAPI.writeFile(filePath, json);

      //TODO: Improvement: If all the line is a link extract correctly
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