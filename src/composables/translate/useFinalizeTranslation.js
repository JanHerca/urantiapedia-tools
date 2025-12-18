import { Strings } from 'src/core/strings.js';
import { strformat } from 'src/core/utils.js';

/**
 * Create an array of lines from an array of objects that reconstruct the
   * final translation adding the parts not required for translation.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 * @param {function} addWarning Function to add warning messages.
 */
export const useFinalizeTranslation = (
  uiLanguage,
  addLog,
  addWarning
) => {
  /**
   * Create an array of lines from an array of objects that reconstruct the
   * final translation adding the parts not required for translation.
   * @param {Object[]} objects Objects with original and translation info.
   * @param {string} sourceLan Source language code, like `en`.
   * @param {string} targetLan Target language code, like `es`.
   * @param {UrantiaBook} targetBook Urantia Book in target language.
   * @param {string[]} errors Array of errors for adding any issue found.
   * @return {string[]} Array of lines.
   */
  const finalizeTranslation = (
    objects, 
    sourceLan, 
    targetLan, 
    targetBook,
    errors
  ) => {
    const sourceAbb = Strings.bookAbb[sourceLan];
    const targetAbb = Strings.bookAbb[targetLan];
    const qStart = Strings.quotationStart[sourceLan];
    const qEnd = Strings.quotationEnd[sourceLan];
    const qStart2 = Strings.quotationStart[targetLan];
    const qEnd2 = Strings.quotationEnd[targetLan];
    // const reExtract = new RegExp('%%([\\d| ]+)%%', 'g');
    const reQuotations = new RegExp(`${qStart}([^${qEnd}]*)${qEnd}`, 'g');
    const reQuotations2 = new RegExp(`"([^"]*)"`, 'g');
    const reBlanks = new RegExp('^[\\t| ]+', 'g');
    const reAbb = new RegExp(`${sourceAbb}([ .;:?!-—])`, 'g');
    const reDocEN = new RegExp('document (\\d+)', 'g');
    const reBr = new RegExp('<br[\\/]?>$', 'g');
    //err1 and err2 now are fixed
    const err1 = 'Extract mark {0} is not valid in translation: <i>{1}</i>';
    const err2 = 'Extract marks number fail in translation: <i>{0}</i>';
    const err3 = 'Paragraph of Urantia Book not found: <i>{0}</i>';
    const err4 = 'Quote group with different length than ref: <i>{0}</i>';

    return objects
      .filter(obj => obj.remove != true)
      .map((obj, j, array) => {
        let { text, translation: tr, quoteGroup: q } = obj;
        // let numExtracts = 0;
        let par = null;
        let objGroup = null;
        let qindex = 0;
        let quotated = false;
        let italic = false;
        //If nothing to translate or replace exit with original text
        if (obj.ignore &&
          obj.line_type != 'quote' &&
          obj.extracts.length === 0) {
          return obj.line;
        }
        //If nothing to translate but yes to replace take text
        if (obj.ignore && !tr && obj.extracts.length > 0) {
          tr = text;
        }
        //Replace title
        if (obj.line_type === 'title') {
          tr = `title: "${tr}"`;
        }
        //Replace description
        if (obj.line_type === 'description') {
          tr = `description: "${tr}"`;
        }
        //Replace quotes
        if (obj.line_type === 'quote' && q) {
          if (obj.line.length < 7) {
            return obj.line;
          }
          quotated = obj.line.substring(0, 8).indexOf(qStart) != -1;
          italic = obj.line.substring(0, 8).indexOf('_') != -1;

          if (q[2].length === 4) {
            //Quote with multiple lines
            objGroup = array.filter(m => {
              return (q[0] <= m.index && q[1] >= m.index &&
                m.line.length >= 7);
            });
            if (objGroup.length != (q[2][3] - q[2][2] + 1)) {
              errors.push(strformat(err4, q[2]));
              return obj.line;
            }
            qindex = objGroup.findIndex(m => m.index === obj.index);
          }

          par = targetBook.getPar(q[2][0], q[2][1], q[2][2] + qindex);
          if (!par) {
            errors.push(strformat(err3, q[2]));
            return obj.line;
          }
          tr = '> ' + (quotated ? qStart2 : '') +
            (italic ? '_' : '') + par.par_content +
            (italic ? '_' : '') + (quotated ? qEnd2 : '') +
            (text.indexOf('%%0%%') != -1 ? ' (%%0%%)' : '');
        }
        //Replace quotation marks (before replace extracts, contain ")
        if (obj.line_type === 'other') {
          tr = tr.replace(reQuotations, (match, p1) => {
            return `${qStart2}${p1}${qEnd2}`;
          });
          tr = tr.replace(reQuotations2, (match, p1) => {
            return `${qStart2}${p1}${qEnd2}`;
          });
        }
        //Replace extracts
        if (obj.extracts.length > 0) {
          obj.extracts.forEach((extract, i) => {
            const reExtract = new RegExp(`%%([${i}| ]+)%%`, 'g');
            const len = text.length;
            const tlen = tr.length;
            const { index } = [...text.matchAll(reExtract)][0];
            const matches = [...tr.matchAll(reExtract)];
            if (matches.length == 1) {
              tr = tr.replace(reExtract, extract);
            } else {
              let tindex = tlen > len
                ? index * (len / tlen)
                : index * (tlen / len);
              tindex = Math.floor(tindex);
              const j = tr.indexOf(" ", tindex);
              tindex = j === -1 ? tindex : j;
              tr = tr.slice(0, tindex) + " " + extract +
                tr.slice(tindex);
            }
          });
        }
        //Replace wrong UB abbs
        if ([...obj.line.matchAll(reAbb)].length > 0 &&
          [...tr.matchAll(reAbb)].length > 0) {
          tr = tr.replace(reAbb, (match, p1) => `${targetAbb}${p1}`);
        }
        //Replace 'document \d+' with 'paper \d+' if target is English
        if (targetLan === 'en' &&
          [...tr.matchAll(reDocEN)].length > 0) {
          tr = tr.replace(reDocEN, (match, p1) => `paper ${p1}`);
        }
        // Do a fix if ends in <br> and it is no more
        if ([...obj.line.trim().matchAll(reBr)].length > 0 &&
          [...tr.trim().matchAll(reBr)].length === 0) {
          tr += '<br>';
        }
        //Replace starting blank spaces
        const blanks = [...obj.line.matchAll(reBlanks)].map(n => n[0]);
        if (blanks[0]) {
          tr = tr.replace(reBlanks, '');
          tr = blanks[0] + tr;
        }
        return tr;
      });
  };
};