import { tr, getError } from 'src/core/utils.js';
import { getWikijsHeader } from 'src/core/wikijs.js';
import { BibleAbbreviations as BibleAbbs } from 'src/core/bibleAbbs';
import { useWriteHTMLToWikijs } from '../useWriteHTMLToWikijs';
import path from 'path';

/**
 * Create the List of All Indexes to Wiki.js
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {Ref<boolean>} processing Processing flag.
 * @param {function} addLog Function to add log messages.
 * @param {function} addErrors Function to add error messages.
 * @param {function} addSuccess Function to add success messages.
 */
export const useALL_INDEXES = (
  language,
  uiLanguage,
  processing,
  addLog,
  addErrors,
  addSuccess
) => {
  const { writeHTMLToWikijs } = useWriteHTMLToWikijs();

  /**
   * Writes the list of all indexes in Urantiapedia.
   * @param {string} dirPath Folder to save the 'index.html' file.
   */
  const writeListOfAllIndexes = async (dirPath) => {
    try {
      addLog(`Reading folder: ${dirPath}`);
      const lan = language.value;

      const baseName = path.basename(dirPath.replace(/\\/g, '/'));
      const exists = await window.NodeAPI.exists(dirPath);
      if (!exists) {
        throw getError(uiLanguage.value, 'dir_no_access', baseName)
      }

      const filePath = path.join(dirPath, 'index.html');
      const title = tr('indexAll', lan);
      const bname = tr('bookName', lan);
      const iname = tr('bookIndexName', lan);
      const ename = tr('bookExtIndexName', lan);
      const sname = tr('bibleName', lan);
      const bbooks = Object.values(BibleAbbs[lan]);
      const oldTestBooks = bbooks.filter(e => e[2] === 'OT');
      const newTestBooks = bbooks.filter(e => e[2] === 'NT');
      const apoBooks = bbooks.filter(e => e[2] === 'APO');
      const allBooks = [
        [tr('bibleOldTestament', lan), oldTestBooks],
        [tr('bibleNewTestament', lan), newTestBooks],
        [tr('bibleApocrypha', lan), apoBooks],
      ];
      const indexAllDesc = tr('indexAllDesc', lan);
      const indexAllBooks = tr('indexAllBooks', lan);
      const ub = `/${lan}/The_Urantia_Book/`;

      let body = '';
      let header = '';
      header += getWikijsHeader(title, ['index']);
      header += '\r\n';

      body += `<p>${indexAllDesc}</p>\r\n\r\n`;
      body += `<h2>${indexAllBooks}</h2>\r\n\r\n`;
      body += `<h3>${bname}</h3>\r\n`;
      body += `<ul>\r\n` +
        `    <li><a href="${ub}/Index" title="${bname} ${iname}">${bname} - ${iname}</a></li>\r\n` +
        `    <li><a href="${ub}/Index_Extended" title="${bname} ${ename}">${bname} - ${ename}</a></li>\r\n` +
        `</ul>\r\n\r\n`;
      body += `<h3>${sname}</h3>\r\n\r\n`;
      body += `<ul>\r\n` +
        `    <li><a href="/${lan}/index/bible" title="${sname} ${iname}">${sname} - ${iname}</a></li>\r\n` +
        `</ul>\r\n\r\n`;
      allBooks.forEach((ab, j) => {
        const hstyle = (j != 2 ?
          ' style="-moz-column-width: 11.5em; -webkit-column-width: 11.5em; column-width: 11.5em; margin-top: 1em;"' : '');
        body += `<h4${hstyle}>${ab[0]}</h4>\r\n`;
        body += `<div>\r\n`;
        body += `    <ul style="margin: 0; padding-top: 0px;">\r\n` +
          ab[1].map((book, i) => {
            const style = (j != 2 && i === 0 ?
              ' style="margin-top:0px;"' : '');
            return `        <li${style}><a href="${book[1]}" title="${book[0]}">${book[0]}</a></li>\r\n`;
          }).join('') +
          `    </ul>\r\n` +
          `</div>\r\n\r\n`;
      });

      await writeHTMLToWikijs(filePath, header, body);
    } catch (err) {
      throw err;
    }

  };

  /**
   * Creates a page of all indexes
   * 
   * @param {string} folder Folder to save the 'index.html' file.
   */
  const executeProcess = async (
    folder
  ) => {
    processing.value = true;
    addLog('Executing process: ALL_INDEXES');
    try {
      await writeListOfAllIndexes(folder);

      addSuccess('Process successful: ALL_INDEXES');
    } catch (errors) {
      addErrors(errors);
    } finally {
      processing.value = false;
    }
  };

  return { executeProcess };
};