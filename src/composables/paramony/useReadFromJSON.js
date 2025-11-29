import { getError } from 'src/core/utils.js';

/**
 * Reads the default location of the Paramony in JSON with an array of footnotes.
 * 
 * @example
 * 
 * footnotes = [
 *   {
 *      paperIndex: 0,
 *      footnotes: [
 *         texts: [
 *            ['God as Creator of everything', 
 *             'God as Creator of heaven, earth']
 *         ],
 *         bible_refs: [
 *            ['Gn 1:1-27; Gn 2:4-23; Ex 20:11; Neh 9:6',
 *             'Ex 31:17; 2 Ki 19:15; 2 Ch 2:12']
 *         ],
 *         locations: ['0:2.12#1']
 *      ]
 *   },
 *   ...
 * ];
 * @param {Ref<string>} language Language ref.
 * @param {function} addLog Function to add log messages.
 */
export const useReadFromJSON = (language, addLog) => {

  /**
   * Reads the default location of the Paramony in JSON.
   * Files are called `footnotes-book-xx.json`.
   * @param {string} filePath File path.
   * @returns {Promise<Object[]>} Promise that returns the array of objects
   * with footnotes content.
   */
  const readFromJSON = async (filePath) => {
    addLog(`Reading file: ${filePath}`);
    try {
      const exists = await window.NodeAPI.exists(filePath);
      if (!exists) {
        throw getError(language.value, 'file_not_exists', filePath);
      }
      const buf = await window.NodeAPI.readFile(filePath);
      const content = buf.toString();
      const jsonContent = JSON.parse(content);
      return jsonContent.content;
    } catch (err) {
      throw err;
    }
  };

  return {
    readFromJSON
  };
};
