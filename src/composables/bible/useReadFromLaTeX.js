import { useReadFolder } from '../useReadFolder.js';

import { getError, replaceTags, extractStr, reflectPromise } from 'src/core/utils.js';
import { LaTeXSeparator as LSep } from 'src/core/enums.js';
import { BibleAbbreviations as BibleAbbs } from 'src/core/bibleAbbs.js';

import path from 'path';

/**
 * Reads the Bible from LaTeX files (.tex).
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 */
export const useReadFromLaTeX = (
  language,
  uiLanguage,
  addLog
) => {
  const { readFolder } = useReadFolder(uiLanguage, addLog);

  /**
   * Extracts a Bible book from an array of lines read.
   * @param {string} baseName Base name of the file read.
   * @param {string[]} lines Array of lines.
   */
  const extractFromLaTex = (baseName, lines) => {
    try {
      let extract;
      const book = {
        chapters: []
      };
      let bookIndex = -1;
      let currentChapter = null;
      let currentSection = null;
      let previousVer = 0;
      let currentVer = 0;
      let m = 0;
      const isTR = language.value === 'tr';
      const booknames = Object.values(BibleAbbs[language.value]).map(e => e[0]);
      const booknamesEN = Object.values(BibleAbbs['en']).map(e => e[0]);
      const bookpaths = Object.values(BibleAbbs[language.value]).map(e => e[1]);
      const bookabbs = Object.keys(BibleAbbs[language.value]);
      const errors = [];

      lines.forEach((line, i) => {
        const replaceErr = [];
        if (line.startsWith(LSep.TITLE_START)) {
          extract = extractStr(line, LSep.TITLE_START, LSep.END);
          if (!extract) {
            errors.push(getError(uiLanguage.value, 'bible_no_title', baseName, i));
          } else if (booknames.indexOf(extract) === -1) {
            errors.push(getError(uiLanguage.value, 'bible_title_invalid', baseName, i));
          } else {
            bookIndex = booknames.indexOf(extract);
            book.file = path.basename(baseName.replace(/\\/g, '/'), '.tex');
            book.title = extract;
            book.titleEN = booknamesEN[bookIndex];
            book.path = bookpaths[bookIndex];
            book.abb = bookabbs[bookIndex];
          }
        } else if (line.startsWith(LSep.CHAPTER_START)) {
          previousVer = 0;
          currentVer = null;
          extract = extractStr(line, LSep.CHAPTER_START, LSep.END);
          if (!extract) {
            errors.push(getError(uiLanguage.value, 'bible_no_chapter', baseName, i));
          } else {
            currentChapter = {
              title: extract,
              pars: [],
              sections: []
            };
            book.chapters.push(currentChapter);
            currentSection = null;
          }
        } else if (line.startsWith(LSep.SECTION_START)) {
          extract = extractStr(line, LSep.SECTION_START, LSep.END);
          if (!extract) {
            errors.push(getError(uiLanguage.value, 'bible_no_section', baseName, i));
          } else {
            currentSection = {
              title: extract,
              pars: []
            };
            if (!currentChapter) {
              errors.push(getError(uiLanguage.value, 'bible_section_order', baseName, i));
            } else {
              currentChapter.sections.push(currentSection);
            }
          }
        } else if (
          line.startsWith(LSep.PAR_START) &&
          !line.startsWith(LSep.PART_START)
        ) {
          extract = line.substring(5).trim();
          extract = replaceTags(extract, LSep.ITALIC_START, LSep.END, '<i>', '</i>',
            replaceErr, uiLanguage.value);
          if (replaceErr.length > 0) {
            errors.push(getError(uiLanguage.value, 'bible_chapter_wrong_italics',
              baseName, 
              book.chapters.length, extract));
          }
          currentVer = extract.substring(0, extract.indexOf(' '));
          currentVer = (!isNaN(parseInt(currentVer)) ?
            parseInt(currentVer) : null);
          if (
            currentVer != null &&
            (currentVer <= previousVer || (!isTR && currentVer != previousVer + 1))
          ) {
            const solution = `; Solution: \\par ${previousVer + 1} ` + 
              `[${book.chapters.length}:${previousVer}]`;
            errors.push(getError(uiLanguage.value, 'bible_chapter_missing_verses',
              baseName,
              book.chapters.length,
              extract + solution));
          } else {
            m = 1;
            if (
              isTR && previousVer != null &&
              currentVer != null &&
              previousVer + m < currentVer
            ) {
              //A fix for weird verses in Turkish
              while (previousVer + m < currentVer) {
                if (!currentSection && currentChapter) {
                  currentChapter.pars.push(`${previousVer + m} ` +
                    `(#${book.chapters.length}:${previousVer})`);
                } else if (currentSection) {
                  currentSection.pars.push(`${previousVer + m} ` +
                    `(#${book.chapters.length}:${previousVer})`);
                }
                m++;
              }

            }
            if (!currentSection && currentChapter) {
              currentChapter.pars.push(extract);
            } else if (currentSection) {
              currentSection.pars.push(extract);
            }
          }
          if (currentVer != null) {
            previousVer = currentVer;
          }
        }
      });
      if (errors.length > 0) {
        throw errors;
      }
      return book;
    } catch (err) {
      throw err;
    }
  };

  /**
   * Read a Bible book from a file in LaTeX.
   * @param {string} filePath File path.
   */
  const readFileFromLaTeX = async (filePath) => {
    try {
      addLog(`Reading file ${filePath}`);
      const baseName = path.basename(filePath.replace(/\\/g, '/'));
      const buf = await window.NodeAPI.readFile(filePath);
      const lines = buf.toString().split('\n');
      const errors = [];
      const book = extractFromLaTex(baseName, lines, errors);
      return book;

    } catch (err) {
      throw err;
    }

  };

  /**
   * Reads the Bible from a folder with LaTeX files (.tex)
   * @param {string} dirPath Folder.
   * @returns {Promise<Object[]>} Promise that returns the array of objects
   * with Bible books.
   */
  const readFromLaTeX = async (dirPath) => {
    addLog(`Reading folder: ${dirPath}`);
    try {
      const files = await readFolder(dirPath, '.tex');

      const promises = files.map(file => {
        const filePath = path.join(dirPath, file);
        return reflectPromise(readFileFromLaTeX(filePath));
      });

      const results = await Promise.all(promises);
      const errors = results.filter(r => r.error).map(r => r.error);
      if (errors.length > 0) {
        throw errors;
      }
      return results.map(r => r.value);
    } catch (err) {
      throw err;
    }
  };

  return {
    readFromLaTeX
  };
};