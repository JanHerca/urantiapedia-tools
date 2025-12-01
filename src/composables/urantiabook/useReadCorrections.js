import { getError } from 'src/core/utils.js';

/**
 * Reads the file that contains corrections done in the English Urantia Book
 * 1955 edition.
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 */
export const useReadCorrections = (
  language,
  uiLanguage,
  addLog
) => {
  /**
   * Reads the file that contains corrections done in the English Urantia Book
   * 1955 edition, to add them as footnotes and to generate a Multi-column 
   * version in English.
   * The default location is `input/txt/ub_corrections.tsv`.
   * @returns {Promise<(Object[]|null)>} Promise that returns corrections objects
   * or null if language is not English.
   */
  const readCorrections = async (filePath) => {
    addLog(`Reading file: ${filePath}`);
    if (language.value != 'en') return null;
    try {
      const buf = await window.NodeAPI.readFile(filePath);
      const lines = buf.toString().split('\n');
      const corrections = [];
      lines.forEach((line, i) => {
        if (i === 0) return;
        const [ref, original, corrected, review, decision] = line.split('\t');
        const m = ref.match(/^(\d+:\d+\.\d+)\s*(?:\((\d+\.\d+)\))?$/);
        if (!m) throw getError(uiLanguage.value, `Invalid ref format: ${line}`);
        const [_, par_ref, par_pageref] = m;
        const html = ` ${original}<br/>Review: ${review}<br/>Decision: ${decision}`;
  
        corrections.push({
          par_ref,
          par_pageref,
          original,
          corrected,
          review,
          decision,
          html
        })
      });
      return corrections;
    } catch (err) {
      throw err;
    }
  };

  return {
    readCorrections
  };
};