import { getError } from 'src/core/utils.js';

/**
 * Reads the subsections file. Subsections are sentences that appear in
 * Urantia Book extended index below some sections.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 */
export const useReadSubsections = (
  uiLanguage,
  addLog
) => {

  /**
   * Reads the subsections file in TSV and update the passed Urantia Book papers.
   * @param {string} filePath File path.
   * @param {Object[]} papers Urantia Book papers.
   * @returns {Promise<Object[]>} Promise that returns the array of objects
   * with Urantia Book papers.
   */
  const readSubsections = async (filePath, papers) => {
    addLog(`Reading subsections file: ${filePath}`);
    try {
      const buf = await window.NodeAPI.readFile(filePath);
      const lines = buf.toString().split('\n');
      if (lines.length === 0) {
        throw getError(uiLanguage.value, 'subsections_no_lines');
      }
      lines.forEach((line, i) => {
        //Skip first line
        if (i === 0) return;
        const [ref, texts] = line.trim().split('\t');
        if (!ref || !texts) {
          throw getError(uiLanguage.value, 'subsections_no_values', i);
        }
        const [paperIndex, sectionIndex] = ref.split(':');
        if (paperIndex == undefined || sectionIndex == undefined) {
          throw getError(uiLanguage.value, 'subsections_no_values', i);
        }
        const paper = papers.find(p => p.paper_index.toString() === paperIndex);
        if (!paper) {
          throw getError(uiLanguage.value, 'subsections_ref_invalid', ref);
        }
        const section = paper.sections.find(s => s.section_ref === ref);
        section.subsections = texts.split('|').map(t => t.trim());
      });
      return papers;
    } catch (err) {
      throw err;
    }
  };

  return {
    readSubsections
  };
};
