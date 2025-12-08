import { tr } from 'src/core/utils.js';
import { getWikijsHeader } from 'src/core/wikijs.js';
import { BibleAbbreviations as BibleAbbs } from 'src/core/bibleAbbs.js';
import { useWriteHTMLToWikijs } from '../useWriteHTMLToWikijs.js';

import path from 'path';

/**
 * Writes an index of `Bible` in HTML format for Wiki.js.
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 * @param {function} addWarning Function to add warning messages.
 */
export const useWriteIndexToWikijs = (
  language,
  uiLanguage,
  addLog
) => {
  const { writeHTMLToWikijs } = useWriteHTMLToWikijs();

  /**
   * Writes a full index of `Bible` in HTML format for Wiki.js.
   * It requires reading previously from any format.
   * @param {string} dirPath Folder path.
   * @param {Object[]} biblebooks Array of objects with Bible books.
   */
  const writeFullIndexToWikijs = async (dirPath, biblebooks) => {
    try {
      const booknames = Object.values(BibleAbbs[language.value]).map(e => e[0]);
      const filePath = path.join(dirPath, `bible.html`);
      const bibleIndex = tr('bibleFullIndex', language.value);
      addLog(`Writing to file: ${filePath}`);
  
      //Header
      let body = '';
      let header = '';
      header += getWikijsHeader(bibleIndex);
      header += '\r\n';
      body += '\r\n<ul>\r\n';
      body += booknames.map(name => {
        const book = biblebooks.find(book => book.title === name);
        if (!book) return '';
        // const bookNameEN = book.titleEN.replace(/ /g, '_');
        const bookNameEN = book.path.split('/').reverse()[0];
        const chapters = book.chapters.map((c, i) => {
          const path = `/${language.value}/Bible/${bookNameEN}/${i + 1}`;
          return `<a href="${path}">${i + 1}</a>`;
        }).join(' ');
        return `\t<li>${name}: ${chapters}</li>\r\n`;
      }).join('');
      body += '</ul>\r\n';
  
      //Only write if content is new or file not exists
      //Avoid a new date for creation date
      await writeHTMLToWikijs(filePath, header, body);
    } catch (err) {
      throw err;
    }
  };

  /**
   * Writes an index of `Bible` in HTML format for Wiki.js.
   * It requires reading previously from any format.
   * @param {string} dirPath Folder path.
   * @param {Object[]} biblebooks Array of objects with Bible books.
   */
  const writeIndexToWikijs = async (dirPath, biblebooks) => {
    addLog(`Writing to folder: ${dirPath}`);
    try {

      const booknames = Object.values(BibleAbbs[language.value]).map(e => e[0]);
      const indexName = tr('bookIndexName', language.value);
      const chapterName = tr('bookChapter', language.value);
      const bibleIndex = tr('bibleFullIndex', language.value);
      const frontPage = tr('frontpage', language.value).toUpperCase();
      const bibleIndexPath = `/${language.value}/index/bible`;
      const indexPath = dirPath.replace('Bible', 'index');
  
      const promises = booknames
        .filter(name => {
          return biblebooks
            .find(book => book.title === name) != undefined;
        })
        .map(name => {
          const book = biblebooks
            .find(book => book.title === name);
          const bookpath = language.value === 'en' 
            ? `/en${book.path}` 
            : `${book.path}`;
          // const bookNameEN = book.titleEN.replace(/ /g, '_');
          const bookNameEN = book.path.split('/').reverse()[0];
          const title = `${book.title} - ${indexName}`;
          const filePath = path.join(dirPath, bookNameEN, `Index.html`);

          addLog(`Writing to file: ${filePath}`);

          let header = '';
          let body = '';
          header += getWikijsHeader(title, ['Bible', 'index']);
          header += '\r\n';
          body += `<ul>\r\n`;
          body += `\t<li><a href="${bookpath}">${frontPage}</a></li>\r\n`;
          body += book.chapters
            .map(c => {
              const p = `${bookpath}/${c.title}`;
              const text = `${chapterName} ${c.title}`;
              return `\t<li><a href="${p}">${text}</a></li>\r\n`;
            })
            .join(' ');
          body += '</ul>\r\n';
          body += `<p><a href="${bibleIndexPath}" ` +
            `title="${bibleIndex}">` +
            `${bibleIndex}</a></p>\r\n`;
          
          //Only write if content is new or file not exists
          //Avoid a new date for creation date
          return writeHTMLToWikijs(filePath, header, body);
        });
      promises.push(writeFullIndexToWikijs(indexPath, biblebooks));
      await Promise.all(promises);
    } catch (err) {
      throw err;
    }
  };

  return {
    writeIndexToWikijs
  };
};