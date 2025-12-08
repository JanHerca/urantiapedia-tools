import { BibleAbbreviations as BibleAbbs } from 'src/core/bibleAbbs.js';

/**
 * Reads the Paramony file of a book in a language other than English.
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 */
export const useReadFileOther = (
  language,
  uiLanguage,
  addLog
) => {

  /**
   * Translates the current ref in English to current language.
   * @param {string} ref Bible ref.
   * @return {string}
   */
  translateBibleRef = (ref) => {
    let abb, abb2;
    for (abb in BibleAbbs.en) {
      if (ref.startsWith(`${abb} `)) {
        const booknameEN = BibleAbbs.en[abb][1];
        for (abb2 in BibleAbbs[language.value]) {
          if (BibleAbbs[language.value][abb2][1] === booknameEN) {
            return ref.replace(abb, abb2);
          }
        }
      }
    }
    return ref;
  };

  /**
   * Read the file in a language other than English.
   * @param {string} type Type of Paramony, `The Urantia Book` or `Bible`.
   * @param {string[]} lines Lines.
   * @param {Object[]} paramony Array of objects with the Paramony for Urantia
   * Book or Bible books. The objects the array are modified in place.
   * @return {Promise<Object[]>} Returns an array of objects with problems found
   * in translations. Each object contains titleEN, bible_ref, lu_ref and text.
   */
  const readFileOther = async (type, lines, paramony) => {
    addLog(`Reading content for ${type}`);
    try {
      let comment = false;
      const translations = [];
      const noTranslated = [];
      lines.forEach(line => {
        if (!comment && line.startsWith('<!--')) {
          comment = true;
        }
        if (!comment && line.indexOf('|') != -1) {
          const values = line.trim()
            .replace(/^\||\|$/g, '')
            .split('|').map(v => v.trim());
          if (
            values.length == 2 &&
            values[0] != 'text' &&
            values[0].indexOf('---') === -1
          ) {
            translations.push({
              text: values[0],
              translation: values[1]
            });
          }
        }
        if (comment && line.trim().endsWith('-->')) {
          comment = false;
        }
      });
      if (type === 'The Urantia Book') {
        paramony.forEach(paper => {
          paper.footnotes.texts.forEach(textAr => {
            const newAr = textAr.map(text => {
              const tr = translations.find(t => t.text === text);
              return (tr ? tr.translation : text);
            });
            newAr.forEach((text, i) => {
              textAr[i] = text;
            });
          });
          paper.footnotes.bible_refs.forEach(refsAr => {
            const newAr = refsAr.map(refs => {
              const fs = refs.split(';')
                .map(n => n.trim().replace(/^:|\.$/g, '').trim())
                .map(n => translateBibleRef(n)).join('; ');
              return fs;
            });
            newAr.forEach((refs, i) => {
              refsAr[i] = refs;
            });
          });
        });
      } else if (type === 'Bible') {
        paramony.forEach(book => {
          book.refs.forEach(ref => {
            const tr = translations.find(t => t.text === ref.text);
            if (tr) {
              ref.text = tr.translation;
            } else {
              noTranslated.push({
                titleEN: book.titleEN,
                bible_ref: ref.bible_ref,
                lu_ref: ref.lu_ref,
                text: ref.text
              });
            }
          });
        });
      }
      return noTranslated;
    } catch (err) {
      throw err;
    }
  };

  return {
    readFileOther
  };
};