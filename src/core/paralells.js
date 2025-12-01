import { tr } from 'src/core/utils.js';

/**
 * Paralells class (for cross references between Urantia Book and other books).
 */
export class Paralells {
  language = 'en';
  /**
   * @example
   * 
   * footnotes = [
   *   {
   *     ub_ref: '0:1.20-26',
   *     book_location: 'Hartshorne1-1-p8'
   *   }
   * ];
   */
  footnotes = [];

  /**
   * @example
   * 
   * books = [
   *   {
   *     title: 'Man’s Vision of God and the Logic of Theism',
   *     code: 'Hartshorne1',
   *     author: 'Charles Hartshorne',
   *     year: '1941',
   *     edition: 'Willett, Clark & Company, Chicago, New York, 1941',
   *     path: 'Charles_Hartshorne/Mans_Vision_of_God'
   *   }
   * ];
   */
  books = [];

  /**
   * @example
   * 
   * translations = [
   *   {
   *      text: 'Man’s Vision of God and the Logic of Theism',
   *      translation: 'La visión del hombre de Dios y la lógica del teísmo'
   *   },
   *   ...
   * ];
   */
  translations = [];

  constructor(language, footnotes, books, translations) {
    this.language = language;
    this.footnotes = footnotes;
    this.books = books;
    this.translations = translations;
  }

  /**
   * Gets the paralells for a given paper in The Urantia Book.
   * The result is already sorted.
   * @param {number} paperIndex Urantia Book paper index starting at zero.
   * [0-196].
   * @returns {Object[]} Returns an array of objects with the paralells. The 
   * objects have these values:
   * - ub_refs: full UB ref
   * - par_ref: paragraph reference
   * - sorting: a value for sorting
   * - location: the sentence index in which insert the footnote. If 999
   * the footnote must be inserted at the end of the paragraph.
   * - html: HTML fragment to add in the References section of Urantia Book 
   * paper.
   * Returns an empty array if no paralell exists.
   */
  getParalells(paperIndex) {
    const lan = this.language;
    const result = this.footnotes
      .filter(f => {
        const pindex = parseInt(f.ub_ref.split(':')[0]);
        return paperIndex === pindex;
      })
      .map(f => {
        const location = f.ub_ref.indexOf('#') != -1
          ? parseInt(f.ub_ref.split('#')[1]) 
          : 999;
        const r = f.ub_ref.split(/[:\.-]/g).map(v => parseInt(v));
        const s = r.slice(1, 3).map(v => v + 1000).join('') +
          (location + 1000).toString();
        const vals = f.book_location.split('-');
        const code = vals[0];
        const book = this.books.find(b => b.code === code);
        const trans = this.translations.find(t => t.text === book.title);
        const title = lan === 'en' 
          ? book.title 
          : (trans ? trans.translation : book.title);
        const blan = (trans ? lan : 'en');
        const chapter = vals[1];
        const ch = isNaN(parseInt(chapter)) 
          ? ''
          : tr('bookChapter', this.language).toLowerCase() + ' ';
        const page = vals[2];
        const path = `/${blan}/book/${book.path}/${chapter}#${page}`;
        const html = ` ${f.ub_ref}: <i>${title}</i>, ${book.author}, ` +
          `<a href="${path}">${ch}${chapter}, p. ${page}</a>`;
        return {
          ub_ref: f.ub_ref,
          par_ref: `${r[0]}:${r[1]}.${r[2]}`,
          sorting: s,
          location: location,
          html: html
        };
      });
    result.sort((a, b) => a.sorting - b.sorting);
    return result;
  }
}