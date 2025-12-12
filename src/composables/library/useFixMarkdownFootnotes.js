import { reflectPromise } from 'src/core/utils.js';

import { useReadFolder } from '../useReadFolder.js';

/**
 * Writes the current index read to Wiki.js HTML format.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 * @param {function} addWarning Function to add warning messages.
 */
export const useFixMarkdownFootnotes = (
  uiLanguage,
  addLog,
  addWarning
) => {
  const { readFolder } = useReadFolder(uiLanguage, addLog);

  /**
   * Fixes an array of lines with some Markdown content ensuring that footnotes
   * numbers match the order of appearance.
   * @param {string} file File in process.
   * @return {string[]} The lines fixed.
   */
  const fixMarkdownFile = async (file) => {
    try {
      addLog(`Reading file: ${file}`);

      const buf = await window.NodeAPI.readFile(file);
      const lines = buf.toString().split('\n');

      const footnotePattern = /\[ (p\. [0-9ivxlc]+) \]|\[\^(\d+)\]/g;
      const footnotePattern2 = /^\[\^(\d+)\]: /g;
      let index = 0;
      let index2 = 0;
      let largestNumber = 0;
      let afterPage = false;
      const updatedLines = lines.map(line => {
        let isPattern2 = false;
        let line2 = line.replace(footnotePattern2, (match, p) => {
          index2++;
          isPattern2 = true;
          return `[^${index2}]: `;
        });
        if (!isPattern2) {
          // const matches = [];
          // let found;
          // while((found = footnotePattern.exec(line)) !== null) {
          // 	matches.push(found[1] != undefined ? found[1] : found[2]);
          // }
          line2 = line.replace(footnotePattern, (match, p1, p2) => {
            if (p1 != undefined) {
              afterPage = true;
              index = index + largestNumber;
              largestNumber = 0;
              return match;
            }
            if (afterPage) {
              const number = parseInt(p2);
              if (number > largestNumber) {
                largestNumber = number;
              }
              return `[^${index + number}]`;
            }
            index++;
            return `[^${index}]`;
          });
        }
        return line2;
      });
      if (largestNumber > 0) {
        index = index + largestNumber;
      }
      if (index != index2) {
        addWarning(`Number of footnotes unmatch: ${file}`);
      }

      addLog(`Writing file: ${file}`);
      await window.NodeAPI.writeFile(file, updatedLines.join('\n'));

    } catch (err) {
      throw err;
    }
  };

  /**
   * Fixes Markdown footnotes of files in a folder.
   * @param {string} dirPath Folder path.
   */
  const fixMarkdownFootnotes = async (dirPath) => {
    try {
      addLog(`Reading files in folder: ${dirPath}`);

      const files = await readFolder(dirPath, '.md');
      const promises = files.map(file => reflectPromise(fixMarkdownFile(file)));
      const results = await Promise.all(promises);
      const errors = results.filter(r => r.error).map(r => r.error);
      if (errors.length > 0) {
        throw errors;
      }

    } catch (err) {
      throw err;
    }
  };

  return {
    fixMarkdownFootnotes
  };
};