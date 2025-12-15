import { getError, reflectPromise } from 'src/core/utils.js';

import path from 'path';

/**
 * Write the Urantia Book in TXT, for recording audio.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 */
export const useWriteToTXT = (
  uiLanguage,
  addLog
) => {
  /**
   * Writes a paper of `The Urantia Book` in TXT format.
   * @param {string} filePath File path.
   * @param {Object} paper Paper object.
   */
  const writeFileToTXT = async (filePath, paper) => {
    addLog(`Writing file: ${filePath}`);
    try {
      let txt = '', error;

      if (!Array.isArray(paper.sections)) {
        error = 'book_no_sections';
      } else if (paper.sections.find(s => s.section_ref == null)) {
        error = 'book_section_no_reference';
      } else if (paper.sections.find(s => !Array.isArray(s.pars))) {
        error = 'book_section_no_pars';
      } else if (!paper.paper_title) {
        error = 'book_paper_no_title';
      }

      if (error) {
        throw getError(uiLanguage.value, error, filePath);
      }

      txt += `${paper.paper_title}\r\n{{Pause=2000}}\r\n`;

      paper.sections.forEach((section, i) => {
        if (section.section_title) {
          txt += `${section.section_title}\r\n{{Pause=2000}}\r\n`;
        }
        section.pars.forEach((par, j) => {
          let pcontent, end;
          if (!par.par_content) {
            error = 'book_par_no_refcontent';
            return;
          }
          pcontent = par.par_content
            .replace(/\*/g, '')
            .replace(/{\d+}/g, '');
          end = (j === section.pars.length - 1 ?
            '\r\n{{Pause=2000}}\r\n' : '{{Pause=1000}}\r\n');
          txt += `${pcontent}${end}`;
        });
      });

      if (error) {
        throw getError(uiLanguage.value, error, filePath);
      }

      await window.NodeAPI.writeFile(filePath, txt);
      
    } catch (err) {
      throw err;
    }
  };

  /**
   * Writes `The Urantia Book` in TXT format. This format removes any
   * formatting tag leaving the text as simple as possible for use it
   * in audio conversion.
   * @param {string} dirPath Folder path.
   * @param {Object[]} papers Array of objects with papers.
   */
  const writeToTXT = async (dirPath, papers) => {
    addLog(`Writing to folder: ${dirPath}`);
    try {
      const baseName = path.basename(dirPath.replace(/\\/g, '/'));
      const access = await window.NodeAPI.exists(dirPath);
      if (!access) {
        throw getError(uiLanguage.value, 'folder_no_access', baseName)
      }
      const promises = papers
        .map(paper => {
          const i = paper.paper_index;
          const stri = (i > 99 ? `${i}` : (i > 9 ? `0${i}` : `00${i}`));
          const filePath = path.join(dirPath,
            `UB_${stri}${i == 0 ? '_1' : ''}.txt`);
          return reflectPromise(writeFileToTXT(filePath, paper));
        });
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
    writeToTXT
  };
};