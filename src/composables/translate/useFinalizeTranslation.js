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

  //err1 and err2 now are fixed
  const err1 = 'Extract mark {0} is not valid in translation: {1}';
  const err2 = 'Extract marks number fail in translation: {0}';
  const err3 = 'Paragraph of Urantia Book not found: {0}';
  const err4 = 'Quote group with different length than ref: {0}';

  /**
   * Replaces the title of a header with its final content.
   */
  const replaceTitle = (obj, tr) => {
    if (obj.line_type === 'title') {
      tr = `title: "${tr}"`;
    }
    return tr;
  };

  /**
   * Replaces the description of a header with its final content.
   */
  const replaceDescription = (obj, tr) => {
    if (obj.line_type === 'description') {
      tr = `description: "${tr}"`;
    }
    return tr;
  };

  /**
   * Replaces quotes from Urantia Book with one in target language.
   */
  const replaceQuotes = (obj, tr, targetBook, errors) => {
    let { text, quoteGroup, line_type, line, index } = obj;
    let par = null;
    let objGroup = null;
    let qindex = 0;

    let italic = false;
    let quotated = false;
    if (line_type === 'quote' && quoteGroup) {
      if (line.length < 7) {
        return line;
      }
      quotated = line.substring(0, 8).indexOf(qStart) != -1;
      italic = line.substring(0, 8).indexOf('_') != -1;

      if (quoteGroup[2].length === 4) {
        //Quote with multiple lines
        objGroup = array.filter(m => {
          return (
            quoteGroup[0] <= m.index && 
            quoteGroup[1] >= m.index &&
            m.line.length >= 7
          );
        });
        if (objGroup.length != (quoteGroup[2][3] - quoteGroup[2][2] + 1)) {
          errors.push(strformat(err4, quoteGroup[2]));
          return line;
        }
        qindex = objGroup.findIndex(m => m.index === index);
      }

      par = targetBook.getPar(quoteGroup[2][0], quoteGroup[2][1], quoteGroup[2][2] + qindex);
      if (!par) {
        errors.push(strformat(err3, quoteGroup[2]));
        return line;
      }
      tr = '> ' + (quotated ? qStart2 : '') +
        (italic ? '_' : '') + par.par_content +
        (italic ? '_' : '') + (quotated ? qEnd2 : '') +
        (text.indexOf('%%0%%') != -1 ? ' (%%0%%)' : '');
    }
    return tr;
  };

  /**
   * Replaces quotation marks.
   */
  const replaceQuotationMarks = (obj, tr, reQuotations, reQuotations2, qStart2, qEnd2) => {
    let { line_type } = obj;
    if (line_type === 'other') {
      tr = tr.replace(reQuotations, (match, p1) => {
        return `${qStart2}${p1}${qEnd2}`;
      });
      tr = tr.replace(reQuotations2, (match, p1) => {
        return `${qStart2}${p1}${qEnd2}`;
      });
    }
    return tr;
  };

  /**
   * Replace extracts with the original text. A extract is a fragment of text
   * that must not be translated and is replaced with a tag with this pattern:
   * `%%number%%` where number is a integer index.
   */
  const replaceExtracts = (obj, tr) => {
    let { extracts, text } = obj;
    if (extracts.length > 0) {
      extracts.forEach((extract, i) => {
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
          tr = tr.slice(0, tindex) + " " + extract + tr.slice(tindex);
        }
      });
    }
    return tr;
  };

  /**
   * Replaces the Urantia Book abbreviation (for example, UB in English) with
   * the equivalent in target language.
   */
  const replaceWrongUBAbbs = (obj, tr, reAbb, targetAbb) => {
    let { line } = obj;
    if (
      [...line.matchAll(reAbb)].length > 0 &&
      [...tr.matchAll(reAbb)].length > 0
    ) {
      return tr.replace(reAbb, (match, p1) => `${targetAbb}${p1}`);
    }
    return tr;
  };

  /**
   * Replaces the word `document` when target language is English with more
   * correct word `paper`. This should be done only in articles.
   */
  const replaceDocumentWord = (obj, tr, reDocEN, targetLan, isLibraryBook) => {
    if (
      !isLibraryBook &&
      targetLan === 'en' &&
      [...tr.matchAll(reDocEN)].length > 0
    ) {
      return tr.replace(reDocEN, (match, p1) => `paper ${p1}`);
    }
    return tr;
  };

  /**
   * Replaces text ending with `<br>` if original ends with that tag.
   */
  const replaceBrAtEnd = (obj, tr, reBr) => {
    let { line } = obj;
    if (
      [...line.trim().matchAll(reBr)].length > 0 &&
      [...tr.trim().matchAll(reBr)].length === 0
    ) {
      tr += '<br>';
    }
    return tr;
  };

  /**
   * Replaces text adding blank spaces at start if original starts with that.
   */
  const replaceStartingBlankSpaces = (obj, tr, reBlanks) => {
    let { line } = obj;
    const blanks = [...line.matchAll(reBlanks)].map(n => n[0]);
    if (blanks[0]) {
      tr = tr.replace(reBlanks, '');
      tr = blanks[0] + tr;
    }
    return tr;
  };

  /**
   * Replaces text adding figcaption and small tags if missing.
   */
  const replaceHTMLTags = (obj, tr) => {
    let { line } = obj;
    const tags = ['figcaption', 'small'];
    tags.forEach(tag => {
      if (line.trim().startsWith(`<${tag}>`) && !tr.startsWith(`<${tag}>`)) {
        tr = `<${tag}>${tr}`;
      }
      if (line.trim().endsWith(`</${tag}>`) && !tr.endsWith(`</${tag}>`)) {
        tr = `${tr}</${tag}>`;
      }
    });

    return tr;
  };

  /**
   * Replaces abbreviation of person name to show like this: `R. H. Woodward`
   * instead of RH Woodward.
   */
  const replacePersonNamesAbb = (obj, tr, reName) => {
    let { line } = obj;
    let matches;

    while ((matches = reName.exec(line)) !== null) {
      const sourceName = matches[0];
      const parts = sourceName.split(/\s+(?=[A-Z][a-z]+)/);
      if (parts.length < 2) continue;
      const sourceInitials = parts[0];
      const surname = parts[1];
      const collapsedInitials = sourceInitials.replace(/\.|\s/g, '');
      const collapsedName = `${collapsedInitials} ${surname}`;
      const escapedName = collapsedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const reReplace = new RegExp(`\\b${escapedName}\\b`, 'g');
      tr = tr.replace(reReplace, sourceName);
    }

    return tr;
  };

  /**
   * Create an array of lines from an array of objects that reconstruct the
   * final translation adding the parts not required for translation.
   * @param {Object[]} objects Objects with original and translation info.
   * @param {string} sourceLan Source language code, like `en`.
   * @param {string} targetLan Target language code, like `es`.
   * @param {boolean} isLibraryBook If it is a book (otherwise is an article).
   * @param {UrantiaBook} sourceBook Urantia Book in source language.
   * @param {UrantiaBook} targetBook Urantia Book in target language.
   * @param {string[]} errors Array of errors for adding any issue found.
   * @return {string[]} Array of lines.
   */
  const finalizeTranslation = (
    objects, 
    sourceLan, 
    targetLan, 
    isLibraryBook,
    sourceBook,
    targetBook,
    errors
  ) => {
    const sourceAbb = Strings.bookAbb[sourceLan];
    const targetAbb = Strings.bookAbb[targetLan];
    const qStart = Strings.quotationStart[sourceLan];
    const qEnd = Strings.quotationEnd[sourceLan];
    const qStart2 = Strings.quotationStart[targetLan];
    const qEnd2 = Strings.quotationEnd[targetLan];
    const reQuotations = new RegExp(`${qStart}([^${qEnd}]*)${qEnd}`, 'g');
    const reQuotations2 = new RegExp(`"([^"]*)"`, 'g');
    const reBlanks = new RegExp('^[\\t| ]+', 'g');
    const reAbb = new RegExp(`${sourceAbb}([ .;:?!-—])`, 'g');
    const reDocEN = new RegExp('document (\\d+)', 'g');
    const reBr = new RegExp('<br[\\/]?>$', 'g');
    const reName = /\b(?:[A-Z]\.\s*)+[A-Z][a-z]+\b/g;

    return objects
      .filter(obj => obj.remove != true)
      .map(obj => {
        let { text, translation: tr } = obj;

        //If nothing to translate or replace exit with original text
        if (
          obj.ignore &&
          obj.line_type != 'quote' &&
          obj.extracts.length === 0
        ) {
          return obj.line;
        }
        //If nothing to translate but yes to replace take text
        if (obj.ignore && !tr && obj.extracts.length > 0) {
          tr = text;
        }
        //Replace title
        tr = replaceTitle(obj, tr);
        //Replace description
        tr = replaceDescription(obj, tr);
        //Replace quotes
        tr = replaceQuotes(obj, tr, targetBook, errors);
        //Replace quotation marks (before replace extracts, contain ")
        tr = replaceQuotationMarks(obj, tr, reQuotations, reQuotations2, qStart2, qEnd2);
        //Replace extracts
        tr = replaceExtracts(obj, tr);
        //Replace wrong UB abbs
        tr = replaceWrongUBAbbs(obj, tr, reAbb, targetAbb);
        //Replace 'document \d+' with 'paper \d+' if target is English
        tr = replaceDocumentWord(obj, tr, reDocEN, targetLan, isLibraryBook);
        // Do a fix if ends in <br> and it is no more
        tr = replaceBrAtEnd(obj, tr, reBr);
        //Replace starting blank spaces
        tr = replaceStartingBlankSpaces(obj, tr, reBlanks);
        //Replace figcaption and small tags
        tr = replaceHTMLTags(obj, tr);
        //Replace abreviated name in persons like R. H. Woodward
        tr = replacePersonNamesAbb(obj, tr, reName);
        return tr;
      });
  };


  return { finalizeTranslation };
};