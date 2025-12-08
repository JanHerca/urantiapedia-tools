import { tr, getError, reflectPromise } from 'src/core/utils.js';
import { getWikijsHeader, getWikijsNavLinks,
  getWikijsBookRefLink } from 'src/core/wikijs.js';
import { useWriteHTMLToWikijs } from '../useWriteHTMLToWikijs.js';

import path from 'path';

/**
 * Writes `Bible` in HTML format for Wiki.js, each chapter a file. 
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 * @param {function} addWarning Function to add warning messages.
 */
export const useWriteToWikijs = (
  language,
  uiLanguage,
  addLog
) => {
  const { writeHTMLToWikijs } = useWriteHTMLToWikijs();

  /**
   * Converts the array of references to HTML for Wiki.js.
   * @param {Array.<Object>} refs References.
   * @return {Array.<string>}
   */
  const footnotesToWikijs = (refs) => {
    return refs
    .reduce((ac, cur) => {
      const { bible_ref, bible_chapter, bible_vers} = cur;
      const link = getWikijsBookRefLink(cur.lu_ref, language.value);
      const html = `<i>${cur.text}</i>: ${link}. `;
      const index = ac.findIndex(i => i.bible_ref === cur.bible_ref);
      if (index === -1) {
        ac.push({
          bible_ref,
          bible_chapter,
          bible_vers,
          html: `${cur.bible_ref} ${html}`
        });
      } else {
        ac[index].html = ac[index].html + ' ' + html;
      }
      return ac;
    }, [])
    .map((cur, i) => {
      const { bible_ref, bible_chapter, bible_vers} = cur;
      const html =
        `<li id="fn${i + 1}"><a href="#cite${i + 1}">↑</a> ${cur.html}</li>\r\n`;
      return {
        bible_ref,
        bible_chapter,
        bible_vers,
        html: `${html}`,
        cite: i + 1
      };
    });
  };



  /**
   * Writes a chapter of `Bible` in HTML format for Wiki.js.
   * @param {string} filePath Output file.
   * @param {Object} book Book object.
   * @param {Object} chapter Object with chapter data.
   * @param {?Object} book_bibleref Object with Bible refs.
   */
  const writeFileToWikijs = async (filePath, book, chapter, book_bibleref) => {
    try {
      const chIndex = book.chapters.findIndex(c => c.title === chapter.title);
      if (chIndex === -1) {
        throw getError(uiLanguage.value, 'bible_chapter_not_found', filePath,
          chapter.title);
      }
      const refs = book_bibleref 
        ? book_bibleref.refs.filter(r => r.bible_chapter === chIndex + 1)
        : [];
      const wfootnotes = footnotesToWikijs(refs);
      const fnStyle = wfootnotes.length > 10 
        ? ' style="column-width: 30em;"' 
        : '';
      const foundVers = [];
      const missingVers = [];

      //Header
      let body = '';
      let header = '';
      const chapterText = tr('bookChapter', language.value);
      const navText = `${book.title} - ${chapterText}`;
      // const prevChapter = book.chapters
      // 	.find(c=>c.title === (chIndex - 1).toString());
      // const nextChapter = book.chapters
      // 	.find(c=>c.title === (chIndex + 1).toString());
      const prevChapter = book.chapters[chIndex - 1];
      const nextChapter = book.chapters[chIndex + 1];
      const title = `${navText} ${chapter.title}`;
      const bookPath = book.path.startsWith('/' + language.value) ?
        book.path : '/' + language.value + book.path;
      const extraTag = (book_bibleref ? ['bible—' + book.titleEN.toLowerCase()] : []);

      header += getWikijsHeader(title, ['bible', ...extraTag]);
      header += '\r\n';
      const navigation = getWikijsNavLinks({
        prevTitle: prevChapter ? `${navText} ${prevChapter.title}` : null,
        prevPath: prevChapter ? `${book.path}/${prevChapter.title}` : null,
        nextTitle: nextChapter ? `${navText} ${nextChapter.title}` : null,
        nextPath: nextChapter ? `${book.path}/${nextChapter.title}` : null,
        indexPath: `${bookPath}/${tr('bookIndexName', 'en')}`
      });
      body += navigation;
      // body += `<h1>${title}</h1>\r\n`;

      const writePar = (par) => {
        const v = par.substring(0, par.indexOf(' '));
        const p = par.substring(par.indexOf(' '));
        const isNumber = !isNaN(parseInt(v));
        if (isNumber) {
          foundVers.push(parseInt(v));
        }
        const id = isNumber ? ` id="v${v}"` : '';
        const vers = isNumber ? `<sup><small>${v}</small></sup>` : '';
        const text = isNumber ? p : par;
        const footnotes = (isNumber ? wfootnotes
          .filter(f => f.bible_vers === parseInt(v))
          .map(f => {
            return `<sup id="cite${f.cite}">` +
              `<a href="#fn${f.cite}">[${f.cite}]</a></sup>`;
          }).join(' ') : '');
        body += `<p${id}>${vers} ${text} ${footnotes}</p>\r\n`;
      };

      //Verses previous to any section
      chapter.pars.forEach(writePar);

      //Verses in sections
      chapter.sections.forEach(section => {
        body += `<h2> ${section.title} </h2>\r\n`;
        section.pars.forEach(writePar);
      });

      //Check if we have all chapter verses
      const lastVer = Math.max(...foundVers);
      for (let iVer = 1; iVer <= lastVer; iVer++) {
        if (foundVers.indexOf(iVer) === -1) {
          missingVers.push(iVer);
        }
      }
      if (missingVers.length > 0) {
        throw getError(uiLanguage.value, 'bible_chapter_missing_verses', 
          filePath, chapter.title, missingVers.join(', '));
      }

      //Footer
      body += '<br/>\r\n';
      body += navigation;

      //References section
      if (wfootnotes.length > 0) {
        body += `<h2>${this.tr('topic_references')}</h2>\r\n`;
        body += `<div${fnStyle}>\r\n<ol>\r\n`;
        wfootnotes.forEach(f => body += '  ' + f.html);
        body += '</ol>\r\n</div>\r\n';
      }

      //Only write if content is new or file not exists
      //Avoid a new date for creation date
      await writeHTMLToWikijs(filePath, header, body)
    } catch (err) {
      throw err;
    }
    
  };

  /**
   * Creates the folder for a Bible book if needed and writes.
   * @param {string} dirPath Folder path.
   * @param {Object} book Object with one book.
   * @param {Object} chapter Object with one chapter of the book.
   */
  const createFolderAndWrite = async (dirPath, book, chapter) => {
    try {
      const bookNameEN = book.path.split('/').reverse()[0];
      const bookFolder = path.join(dirPath, bookNameEN);
      const filePathHTML = path.join(dirPath, bookNameEN, `${chapter.title}.html`);
      const access = await window.NodeAPI.exists(bookFolder);
      if (!access) {
        await window.NodeAPI.createFolder(bookFolder);
      }
      addLog(`Writing file: ${filePathHTML}`);
      return await writeFileToWikijs(filePathHTML, book, chapter, book_bibleref);
    } catch (err) {
      throw err;
    }
  };


  /**
   * Writes `Bible` in HTML format for Wiki.js, each chapter a file. 
   * It requires reading previously from any format.
   * @param {string} dirPath Folder path.
   * @param {Object[]} biblebooks Objects with Bible books.
   * @param {?Object[]} bibleref An optional Bible Reference.
   */
  const writeToWikijs = async (dirPath, biblebooks, bibleref) => {
    addLog(`Writing to folder: ${dirPath}`);
    try {
      const baseName = path.basename(dirPath);
      const access = await window.NodeAPI.exists(dirPath);
      if (!access) {
        throw getError(uiLanguage.value, 'dir_no_access', baseName)
      }
      let promises = [];
      biblebooks.forEach(book => {
        book.chapters.forEach(chapter => {
          let book_bibleref;
          if (bibleref) {
            book_bibleref = bibleref.find(b => b.titleEN === book.titleEN);
          }
          const p = createFolderAndWrite(dirPath, book, chapter, book_bibleref);
          promises.push(reflectPromise(p));
        });
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
    writeToWikijs
  };
};