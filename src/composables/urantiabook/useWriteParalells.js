import { tr, getError, findBibleAbb, getBookPaperTitle,
  replaceSpecialChars } from 'src/core/utils.js';
import { BibleAbbreviations as BibleAbbs } from 'src/core/bibleAbbs';
import path from 'path';

/**
 * Writes an index pages of paralells of `The Urantia Book` in Wiki.js format.
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 */
export const useWriteParalells = (
  language,
  uiLanguage,
  addLog
) => {
  /**
   * Writes an index pages of paralells of `The Urantia Book` in Wiki.js format.
   * The name of resulting file is `paralells.md`.
   * @param {string} dirPath Folder path.
   * @param {Object[]} papers Array of objects with Urantia Book papers.
   */
  const writeParalells = async (dirPath, papers) => {
    try {
      addLog(`Creating paralells: ${dirPath}`);
      const lan = language.value;

      const ub = tr('bookName', 'en').replace(/\s/g, '_');
      const part0 = tr('bookPart0', lan);
      const part1 = tr('bookPart1', lan);
      const part2 = tr('bookPart2', lan);
      const part3 = tr('bookPart3', lan);
      const part4 = tr('bookPart4', lan);
      const ot = tr('bibleOldTestament', lan);
      const nt = tr('bibleNewTestament', lan);
      const ap = tr('bibleApocrypha', lan);
      const filePath = path.join(dirPath, 'paralells_.md');
      const abbs = BibleAbbs[lan];
      const getBooks = c => {
        return Object.values(abbs).filter(a => a[2] == c).map(a => a[0]);
      };
      const otBooks = getBooks('OT');
      const ntBooks = getBooks('NT');
      const apBooks = getBooks('APO');
      let md = '';
      let errs = [];

      papers = papers.slice().sort((a, b) => a.paper_index - b.paper_index);

      papers.forEach(paper => {
        try {
          let error = null;
          const i = paper.paper_index;
          let title = paper.paper_title;
          const path = `/${lan}/${ub}/${i}`;
          const bookAbbsAll = paper.footnotes
            .map(f => {
              const bAbbs = f.split('*')
                .filter((n, j) => n.trim() != '' && j % 2 == 0)
                .map(n => n.trim().replace(/^:|\.$/g, '').trim())
                .map(n => n.split(';').map(i => i.trim()))
                .reduce((a, b) => [...a, ...b], [])
                .map(n => findBibleAbb(lan, n));
              if (bAbbs.findIndex(n => n == null) != -1) {
                error = 'bibleref_bad_ref';
                errs.push(getError(uiLanguage.value, error, `Paper ${i}`, f));
              }
              return bAbbs;
            })
            .reduce((a, b) => [...a, ...b], []);

          if (!paper.paper_title) {
            errs.push(getError(uiLanguage.value, 'book_paper_no_title', `Paper ${i}`));
            return;
          } else if (error === 'bibleref_bad_ref') {
            return;
          }

          const bookAbbs = bookAbbsAll.filter((n, j, ar) => ar.indexOf(n) == j);
          const bibleBooks = bookAbbs.map(n => abbs[n]);

          const booksOT = bibleBooks
            .filter(n => otBooks.indexOf(n[0]) != -1)
            .sort((a, b) => otBooks.indexOf(a[0]) - otBooks.indexOf(b[0]))
            .map(a => `[${a[0]}](${a[1]}/Index)`)
            .join(', ');
          const booksNT = bibleBooks
            .filter(n => ntBooks.indexOf(n[0]) != -1)
            .sort((a, b) => ntBooks.indexOf(a[0]) - ntBooks.indexOf(b[0]))
            .map(a => `[${a[0]}](${a[1]}/Index)`)
            .join(', ');
          const booksAP = bibleBooks
            .filter(n => apBooks.indexOf(n[0]) != -1)
            .sort((a, b) => apBooks.indexOf(a[0]) - apBooks.indexOf(b[0]))
            .map(a => `[${a[0]}](${a[1]}/Index)`)
            .join(', ');

          title = getBookPaperTitle(paper, lan, false);
          title = replaceSpecialChars(title);
          md += (i === 0 ? `### ${part0}\r\n\r\n` : '');
          md += (i === 1 ? `### ${part1}\r\n\r\n` : '');
          md += (i === 32 ? `### ${part2}\r\n\r\n` : '');
          md += (i === 57 ? `### ${part3}\r\n\r\n` : '');
          md += (i === 120 ? `### ${part4}\r\n\r\n` : '');
          md += `* [${title}](${path})\r\n`;
          md += (booksOT == '' ? '' : `  - ${ot}: ${booksOT}\r\n`);
          md += (booksNT == '' ? '' : `  - ${nt}: ${booksNT}\r\n`);
          md += (booksAP == '' ? '' : `  - ${ap}: ${booksAP}\r\n`);
          md += [0, 31, 56, 119, 196].indexOf(i) != -1 ? '\r\n' : '';
        } catch (e) {
          errs.push(new Error(e.message + ':' + `Paper ${i}`));
        }
      });

      if (errs.length > 0) {
        throw errs;
      }

      addLog(`Writing paralells: ${filePath}`);
      await window.NodeAPI.writeFile(filePath, md);

    } catch (err) {
      throw err;
    }
  };

  return { writeParalells };

};

