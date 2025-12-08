import { tr, getError, replaceSpecialChars, reflectPromise, 
  getBookPaperTitle } from 'src/core/utils.js';
import { getWikijsBookIndexLink, getWikijsHeader, getWikijsBookCopyright, 
  getWikijsLinks, getWikijsBookButtons, getWikijsBookIndexPartTitle,
  getWikijsBookIndexPartDesc, getWikijsBookIndexPaper } from 'src/core/wikijs.js';
import { useWriteHTMLToWikijs } from '../useWriteHTMLToWikijs.js';

/**
 * Writes `The Urantia Book` in HTML format that can be imported in Wiki.js.
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 * @param {function} addWarning Function to add warning messages.
 */
export const useWriteIndexToWikijs = (
  language,
  uiLanguage,
  addLog,
) => {
  const { writeHTMLToWikijs } = useWriteHTMLToWikijs();
  const colors = ['blue', 'purple', 'teal', 'deep-orange', 'indigo',
    'pink', 'blue-grey']; //Colors for up to 7 columns max

  /**
   * Writes index pages of `The Urantia Book` in Wiki.js format.
   * The name of resulting files are `Index.html` and `Index_Extended.html`.
   * @param {string} dirPath Folder path.
   * @param {Object} book Object with the Urantia Book.
   * @param {?Object[]} books Optional array of Urantia Books objects with 
   * the papers in several versions. The first one must be the english version, 
   * and one must be the master version, with links to footnotes.
   */
  const writeIndexToWikijs = async (
    dirPath,
    book,
    books
  ) => {
    addLog(`Writing index to folder: ${dirPath}`);
    try {
      const lan = language.value;
      const multi = (books != null);
      const copyrights = multi
        ? books.map(b => b.copyright)
        : ["UF"];
      const iparts = [0, 1, 2, 3, 4];
      const idocs = [0, 1, 32, 57, 120];
      const bookArray = books ? books : [book];
      const bookMaster = books
        ? bookArray.find(b => b.isMaster)
        : bookArray[0];
      const data = bookArray.map(book => {
        const isMaster = (books ? book.isMaster : true);
        const isExtra = (book.language != 'en' && !isMaster);
        const key = book.language + (isExtra ? `${book.year}` : '');
        const parts_titles = iparts.map(i => {
          return tr(`bookPart${i}`, key).toUpperCase();
        });
        const parts_descs = iparts.map(i => {
          if (i === 0) return null;
          return tr(`bookPart${i}Desc`, key).split('|').map(d => d.trim());
        });
        const tpapers = book.papers
          .slice()
          .sort((a, b) => a.paper_index - b.paper_index)
          .map(paper => {
            const paperMaster = bookMaster.papers
              .find(p => p.paper_index === paper.paper_index);
            return {
              index: paper.paper_index,
              title: replaceSpecialChars(getBookPaperTitle(paper,
                book.language, false)),
              sections: paper.sections.map((s, k) => {
                const sectionMaster = paperMaster.sections[k];
                return {
                  index: s.section_index,
                  title: (s.section_title ?
                    replaceSpecialChars(s.section_title) : null),
                  subsections: s.subsections
                    ? s.subsections
                    : sectionMaster.subsections
                };
              }),
              author: paper.author
                ? paper.author
                : paperMaster.author
            };
          });
        return {
          language: book.language,
          parts_titles,
          parts_descs,
          year: book.year,
          label: lan === 'en' && multi ? '1955 SRT' : book.label,
          papers: tpapers,
          isMaster
        };
      });
      if (lan === 'en' && multi) {
        data.push({
          ...data[0],
          label: '1955 ORIGINAL',
          isMaster: false
        });
      }
      const years = data.map(d => d.year);
      const labels = data.map(d => d.label);
      const filePath1 = path.join(dirPath, 'Index.html');
      const filePath2 = path.join(dirPath, 'Index_Extended.html');
      const title1 = `${tr('bookName', lan)} — ${tr('bookIndexName', lan)}`;
      const title2 = `${tr('bookName', lan)} — ${tr('bookExtIndexName', lan)}`;
      const copyright = getWikijsBookCopyright(years, copyrights, lan);
      const indexLink1 = getWikijsBookIndexLink(lan, multi, false);
      const indexLink2 = getWikijsBookIndexLink(lan, multi, true);
      let header1 = '';
      let header2 = '';
      let body1 = '';
      let body2 = '';
      let errs = [];
  
      let papers = book.papers.slice().sort((a, b) =>
        a.paper_index - b.paper_index);
  
      //Write header
      header1 += getWikijsHeader(title1, ['the urantia book—papers']);
      header1 += '\r\n';
      header2 += getWikijsHeader(title2, ['the urantia book—papers']);
      header2 += '\r\n';
      //Write copyright
      body1 += copyright;
      body2 += copyright;
      //Write top links
      body1 += getWikijsLinks('', indexLink1, '');
      body2 += getWikijsLinks('', indexLink2, '');
      //Write top buttons
      if (multi) {
        const buttons = getWikijsBookButtons(labels, lan, colors);
        body1 += buttons;
        body2 += buttons;
      }
      papers.forEach(paper => {
        const i = paper.paper_index;
        const ipart = idocs.indexOf(i);
        let error = null;
  
        if (!Array.isArray(paper.sections)) {
          error = 'book_no_sections';
        } else if (paper.sections.find(s => s.section_ref == null)) {
          error = 'book_section_no_reference';
        } else if (!paper.paper_title) {
          error = 'book_paper_no_title';
        }
  
        if (error) {
          errs.push(getError(uiLanguage.value, error, filePath1));
          return;
        }
        //Part title & description
        if (ipart != -1) {
          const partTitle = getWikijsBookIndexPartTitle(data, ipart,
            multi);
          const partDesc = getWikijsBookIndexPartDesc(data, ipart,
            multi);
          body1 += partTitle;
          body2 += partTitle;
          body1 += partDesc;
          body2 += partDesc;
          if (!multi) body1 += '<ul>\r\n';
        }
        //Paper titles (and section titles for extended index)
        body1 += getWikijsBookIndexPaper(data, i, multi, false);
        body2 += getWikijsBookIndexPaper(data, i, multi, true);
        if ((idocs.indexOf(i + 1) != -1 || i === papers.length - 1) && !multi) {
          body1 += '</ul>\r\n';
        }
      });
  
      //Write bottom links
      body1 += '<br>\r\n';
      body1 += getWikijsLinks('', indexLink1, '');
      body2 += '<br>\r\n';
      body2 += getWikijsLinks('', indexLink2, '');
  
      if (errs.length > 0) {
        reject(errs);
        return;
      }
  
      const p1 = reflectPromise(writeHTMLToWikijs(filePath1, header1, body1));
      const p2 = reflectPromise(writeHTMLToWikijs(filePath2, header2, body2));
  
      const results = Promise.all([p1, p2]);
      const errors = results.filter(r => r.error).map(r => r.error);
      if (errors.length > 0) {
        throw errors;
      }
    } catch (err) {
      throw err;
    }
  };

  return {
    writeIndexToWikijs
  };
};