import { reflectPromise } from 'src/core/utils.js';
import { useCreateFolders } from '../useCreateFolders.js';
import { useGetFiles } from '../useGetFiles.js';
import { useFinalizeTranslation } from './useFinalizeTranslation.js';

import path from 'path';

/**
 * Builds the folders and files translated using some temporary files created
 * in a previous step (with usePrepareTranslation).
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 * @param {function} addWarning Function to add warning messages.
 */
export const  useBuildTranslation = (
  uiLanguage,
  addLog,
  addWarning
) => {
  const { createFolders } = useCreateFolders(uiLanguage, addLog);
  const { getFiles } = useGetFiles(uiLanguage, addLog);
  const { finalizeTranslation } = useFinalizeTranslation(uiLanguage, addLog, 
    addWarning);

  /**
   * Reads a _translatedXX.md file and returns the lines from it.
   * @param {string} filePath File path.
   */
  const readTranslatedFile = async (filePath) => {
    try {
      addLog(`Reading file: ${filePath}`);
      const filename = path.basename(filePath.replace(/\\/g, '/'))
        .replace('translated', 'translate');
      const buf = await window.NodeAPI.readFile(filePath);
      const lines = buf.toString().split('\n');
      return { filename, lines };
    } catch (err) {
      throw err;
    }
  };

  /**
   * Builds the translation files inside the target folder.
   * @param {string} sourcePath Source file path.
   * @param {string} targetPath Target file path.
   * @param {string} sourceLan Source language code, like `en`.
   * @param {string} targetLan Target language code, like `es`.
   * @param {UrantiaBook} targetBook Urantia Book in target language.
   * @param {string} urantiapediaFolder Urantiapedia folder.
   */
  const buildTranslationFolder = async (
    sourcePath,
    targetPath,
    sourceLan,
    targetLan,
    targetBook,
    urantiapediaFolder
  ) => {
    try {
      addLog(`Building translation of folder: ${targetPath}`);

      //First check that required files exist
      const objectsFile = path.join(targetPath, '_translate.json');
      const exists = await window.NodeAPI.exists(objectsFile);
      if (!exists) {
        throw new Error('File _translate.json not found in target folder');
      }
      const files = await getFiles(targetPath);
      const translatedFiles = files.filter(file => {
        const baseName = path.basename(file.replace(/\\/g, '/'));
        return /^_translated_\d{2}\.md$/.test(baseName);
      });
      if (translatedFiles.length === 0) {
        throw new Error('No _translated_XX.md files found in target folder');
      }

      //Create target folders
      await createFolders(sourcePath, targetPath);

      //Read files
      const objectsBuf = await window.NodeAPI.readFile(objectsFile);
      const objects = JSON.parse(objectsBuf.toString());
      const translations = {};
      const promises = translatedFiles.map(file => {
        const promise = readTranslatedFile(file);
        return reflectPromise(promise);
      });
      const results = await Promise.all(promises);
      const errors = results.filter(r => r.error).map(r => r.error);
      if (errors.length > 0) {
        throw errors;
      }
      results.forEach(r => {
        translations[r.value.filename] = r.value.lines;
      });

      //Apply translations
      const translationErrors = [];
      for (let key in objects) {
        objects[key].objects
          .filter(obj => obj.ignore != true)
          .forEach(obj => {
            const { filename, fileline } = obj;
            if (translations[filename] && translations[filename][fileline - 1]) {
              obj.translation = translations[filename][fileline - 1];
            } else {
              const err = `Translation not found: Filename ${filename} : ${fileline}`;
              obj.translationError = err;
              translationErrors.push(new Error(err));
            }
          });
      }
      if (translationErrors.length > 0) {
        throw translationErrors;
      }

      //Rebuild files
      const translatedLines = {};
      for (let key in objects) {
        const objs = objects[key].objects;
        const errors = [];
        const lines = finalizeTranslation(
          objs, 
          sourceLan, 
          targetLan, 
          targetBook, 
          errors
        );
        translatedLines[key] = { lines, errors };
        if (errors.length > 0) {
          translationErrors.push(...errors.map(msg => new Error(msg)));
        }
      }
      if (translationErrors.length > 0) {
        throw translationErrors;
      }

      //Save new files
      const promises2 = Object.keys(translatedLines)
        .map(key => {
          const targetFile = path.join(urantiapediaFolder, key)
            .replace(sourcePath, targetPath);
          addLog(`Writing to file: ${targetFile}`);
          const lines = translatedLines[key].lines.join('');
          return window.NodeAPI.writeFile(targetFile, lines);
        })
      const results2 = await Promise.all(promises2);
      const errors2 = results2.filter(r => r.error).map(r => r.error);
      if (errors2.length > 0) {
        throw errors2;
      }
    } catch (err) {
      throw err;
    }

    //TODO: Errors in headers of books (adding " " in wrong place)
    //TODO: figcaption tags are removed in figure sometimes
    //TODO: Abbreviated names in persons like G. H. Barry are collapsed to GH Barry
  };

  return {
    buildTranslationFolder
  };
};