import { extendArray } from 'src/core/utils.js';

import path from 'path';

/**
 * Write errors in a file called 'errors.json'.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 */
export const useWriteErrors = (
  uiLanguage,
  addLog
) => {
  /**
   * Write errors in a file called 'errors.json'.
   * @param {string} dirPath Output folder.
   * @param {TopicIndex} topicIndex Topic Index in current language to process.
   */
  const writeErrors = async (dirPath, topicIndex) => {
    try {
      const filePath = path.join(dirPath, 'errors.json');
      addLog(`Writing errors: ${filePath}`);
      let errors = [];
  
      topicIndex.topics.forEach(t => {
        const errs = t.errors.map(e => {
          const fileline = e.fileline.toString().padStart(4, '0');
          return `${t.filename}:${fileline} > '${t.name}': ${e.desc}`
        });
        if (errs.length > 0) {
          extendArray(errors, errs);
        }
      });
  
      errors.sort();
  
      const errorsText = JSON.stringify(errors, null, 4);
  
      await window.NodeAPI.writeFile(filePath, errorsText);
  
    } catch (err) {
      throw err;
    }

  };

  return { writeErrors };
};