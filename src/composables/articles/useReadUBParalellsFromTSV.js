import { reflectPromise } from 'src/core/utils.js';

/**
 * Reads cross refs (paralells) between articles and Urantia Book.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 */
export const useReadUBParalellsFromTSV = (
  uiLanguage,
  addLog
) => {
  /**
   * Reads cross refs (paralells) between articles and Urantia Book.
   * @param {string} filePath File with cross refs. (.tsv)
   * @return {Promise<Object[]>} Returns an array of objects with paralells data.
   */
  const readUBParalellsFromTSV = async (filePath) => {
    addLog(`Reading file: ${filePath}`);
    try {
      const result = await reflectPromise(window.NodeAPI.readFile(filePath));
      const buf = result.value;
      if (!buf) {
        addLog(`File not found: ${filePath}`);
        return [];
      }
      const lines = buf.toString().split('\n');
      const paralells = lines.map(line => {
        const data = line.split('\t');
        return {
          anchor: data[0],
          ref: data[1],
          title: data[2],
          url: data[3],
          author: data[4],
          publication: data[5],
          year: data[6]
        };
      });
      return paralells;
    } catch (err) {
      throw err;
    }
  };

  return {
    readUBParalellsFromTSV
  };
};