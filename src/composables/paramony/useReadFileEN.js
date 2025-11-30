import { getError, extractVers } from 'src/core/utils.js';
import { BibleAbbreviations as BibleAbbs } from 'src/core/bibleAbbs.js';

/**
 * Reads the Paramony file of a book in English.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 */
export const useReadFileEN = (
  uiLanguage,
  addLog
) => {
  const booknamesEN = Object.values(BibleAbbs.en).map(e => e[0]);
  const booknames = Object.values(BibleAbbs.en).map(e => e[0]);
	const bookabbs = Object.keys(BibleAbbs.en);

  /**
   * Read the file of a book in English.
   * @param {string} bookFileName Book file name in English, as 
   * `The Urantia Book`, `1 Chronicles`, etc.
   * @param {string[]} lines Lines.
   * @returns {Promise} Promise that returns an array of objects with footnotes
   * for the given book.
   */
  const readFileEN = async (bookFileName, lines) => {
    addLog(`Reading content for book: ${bookFileName}`);
    try {
      const errors = [];
      const footnotes = [];
      const biblebooks = [];
      let comment = false;
      const bookIndex = booknamesEN.indexOf(bookFileName);
      const addError = (code, i) => {
        errors.push(getError(uiLanguage.value, code, bookFileName + '.md', i));
      };
      lines.forEach((line, i) => {
        if (!comment && line.startsWith('<!--')) {
          comment = true;
        }
        if (!comment && line.indexOf('|') != -1) {
          const values = line.trim()
            .replace(/^\||\|$/g, '')
            .split('|').map(v => v.trim());
          if (bookFileName === 'The Urantia Book') {
            //Case of Urantia Book
            if (
              values.length >= 5 && 
              values[0] != 'num' &&
              values[0].indexOf('---') === -1
            ) {
              const num = parseInt(values[0]);
              const pos = parseInt(values[1]);
              const index = parseInt(values[2].split(':')[0]);
              let paper = footnotes.find(p => p.paperIndex === index);
              if (!paper) {
                paper = {
                  paperIndex: index,
                  footnotes: {
                    texts: [],
                    bible_refs: [],
                    locations: []
                  }
                };
                footnotes.push(paper);
              }
              const { footnotes: pfootnotes } = paper;
              if (!pfootnotes.texts[num]) {
                pfootnotes.texts[num] = [];
              }
              if (!pfootnotes.bible_refs[num]) {
                pfootnotes.bible_refs[num] = [];
              }
              pfootnotes.texts[num][pos] = values[3];
              pfootnotes.bible_refs[num][pos] = values[4];
              pfootnotes.locations[num] = values[2];
            }
          } else if (bookIndex != -1) {
            //Case of Bible book
            if (
              values.length >= 6 && 
              values[0] != 'book' &&
              values[0].indexOf('---') === -1
            ) {
              let [ , bible_ref, , par_ref, text, type ] = values;
              let book = biblebooks.find(b => b.titleEN === bookFileName);
              let data2, data3, chapter, vers, ref;
              if (!book) {
                book = {
                  titleEN: bookFileName,
                  title: booknames[bookIndex],
                  abb: bookabbs[bookIndex],
                  file: bookFileName + '.md',
                  refs: []
                };
                biblebooks.push(book);
              }

              data2 = bible_ref.split(':');
              data3 = par_ref.split('/');
              if (data2.length < 2) {
                addError('bibleref_bad_ref', i);
              } else if (data3.length != 2) {
                addError('bibleref_bad_ub_ref', i);
              } else {
                chapter = parseInt(data2[0]);
                vers = extractVers(data2[1]);
                if (vers === 'all') {
                  bible_ref = chapter.toString();
                  vers = 1;
                }
                if (chapter === 0 || vers === 0 || isNaN(chapter) || vers == null) {
                  addError('bibleref_bad_number', i);
                } else {
                  ref = {
                    bible_ref: bible_ref,
                    bible_chapter: chapter,
                    bible_vers: vers,
                    lu_ref: data3[0],
                    text: text,
                    type: type
                  };
                  book.refs.push(ref);
                }
              }
            }
          }
        }
        if (comment && line.trim().endsWith('-->')) {
          comment = false;
        }
      });
      if (errors.length > 0) {
        throw errors;
      }
      return footnotes.length > 0 ? footnotes : biblebooks;
    } catch (err) {
      throw err;
    }
    
  };

  return {
    readFileEN
  };
};