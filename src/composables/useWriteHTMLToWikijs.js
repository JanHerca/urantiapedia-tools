import { reflectPromise } from 'src/core/utils.js';
import { fixWikijsHeader } from 'src/core/wikijs.js';

/**
 * Writes a file in HTML format that can be imported in Wiki.js only if content 
 * is new or file not exists.
 */
export const useWriteHTMLToWikijs = () => {
  /**
   * Writes a HTML for Wiki.js only if content is new or file not exists.
   * Updates date of last modification avoiding a new date for creation date.
   * @param {string} filePath File.
   * @param {string} header Header.
   * @param {string} body Body.
   */
  const writeHTMLToWikijs = async (filePath, header, body) => {
    try {
      //Only write if content is new or file not exists
      //Update date created avoiding a new date for it
      const buf = (await reflectPromise(window.NodeAPI.readFile(filePath))).value;
      if (buf) {
        const previousLines = buf.toString().split('\n');
        const curLines = (header + body).split('\n');
        const newHeader = fixWikijsHeader(header, previousLines, curLines);
        if (newHeader) {
          await window.NodeAPI.writeFile(filePath, newHeader + body);
        }
        return;
      }
      await window.NodeAPI.writeFile(filePath, header + body);
    } catch (err) {
      throw err;
    }
  };

  return {
    writeHTMLToWikijs
  };
};