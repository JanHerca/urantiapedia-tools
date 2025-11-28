import { getError, extendArray, findBibleAbb } from 'src/core/utils.js';

/**
 * UrantiaBook class.
 */
export class UrantiaBook {
  language = 'en';
  papers = [];

  constructor(language, papers) {
    this.language = language;
    this.papers = papers;
  }

  /**
   * Checks if a book has the same papers, sections, and pars as current and
   * throw errors.
   * @param {UrantiaBook} book Another book to check.
   * @return {boolean}
   */
  checkBook(book) {
    const errs = [];
    this.papers.forEach(paper => {
      const index = paper.paper_index;
      const paper2 = book.papers.find(p => p.paper_index === index);
      if (!paper2) {
        errs.push(getError(this.language, 'book_paper_not_found', index));
        return;
      }
      if (!Array.isArray(paper2.sections) || paper2.sections.length == 0) {
        errs.push(getError(this.language, 'book_no_sections', index));
        return;
      }
      paper.sections.forEach(section => {
        const sref = section.section_ref;
        const section2 = paper2.sections.find(s => s.section_ref === sref);
        if (!section2) {
          errs.push(getError(this.language, 'book_section_not_found', sref));
          return;
        }
        if (!Array.isArray(section2.pars) || section2.pars.length == 0) {
          errs.push(getError(this.language, 'book_section_no_pars', sref));
          return;
        }
        section.pars.forEach(par => {
          const pref = par.par_ref;
          const par2 = section2.pars.find(p => p.par_ref == pref);
          if (!par2) {
            errs.push(getError(this.language, 'book_par_not_found', pref, index));
            return;
          }
        });
      })
    });
    if (errs.length > 0) {
      throw errs;
    }
    return true;
  }

  /**
   * Returns an array with three values [paper_id, section_id, par_id]
   * For example: for '101:2.1' returns [101,2,1]
   * Input always must have three value or triggers an exception.
   * @param {string} lu_ref Reference to UB.
   * @return {Array}
   */
  getRef(lu_ref) {
    let data, data2, paper_id, section_id, par_id;
    const err = getError(this.language, 'book_wrong_reference', lu_ref);
    data = lu_ref.split(':');
    if (data.length != 2) {
      throw err;
    }
    paper_id = parseInt(data[0]);
    if (isNaN(paper_id)) {
      throw err;
    }
    data2 = data[1].split('.');
    if (data2.length != 2) {
      throw err;
    }
    section_id = parseInt(data2[0]);
    par_id = parseInt(data2[1]);
    if (isNaN(section_id) || isNaN(par_id)) {
      throw err;
    }
    return [paper_id, section_id, par_id];
  }

  /**
   * Returns an array of arrays with three values [paper_id, section_id, par_id]
   * with all paragraphs included in the reference.
   * For example '101' returns an array of all paragraphs of paper 101.
   * For example '101:2.1,3-4' returns [[101,2,1], [101,2,3], [101,2,4]]
   * Checks if references exist.
   * If anything goes wrong returns an exception.
   * @param {string} ref UB reference.
   * @return {Array.<number[]>}
   */
  getRefs(ref) {
    let data2, data3, dd, section_id, paper, section, min, max;
    const err = getError(this.language, 'book_wrong_reference', ref);
    const data = ref.split(':');
    const result = [];
    let fail = false;
    const paper_id = parseInt(data[0]);
    if (isNaN(paper_id)) {
      throw err;
    }
    paper = this.papers.find(p => p.paper_index === paper_id);
    if (!paper) {
      throw err;
    }
    if (data.length === 1) {
      //Only paper case
      paper.sections.forEach(s => {
        s.pars.forEach(p => {
          result.push(this.getRef(p.par_ref));
        });
      });
    } else if (data.length > 1) {
      data2 = data[1].split('.');
      if (data2.length === 1) {
        //Case of only paper and section/sections
        dd = data2[0].split('-');
        min = parseInt(dd[0]);
        max = (dd.length > 1 ? parseInt(dd[1]) : parseInt(dd[0]));
        if (isNaN(min) || isNaN(max) ||
          !paper.sections.find(s => s.section_index === min) ||
          !paper.sections.find(s => s.section_index === max)) {
          throw err;
        }
        paper.sections.forEach(s => {
          if (s.section_index >= min && s.section_index <= max) {
            s.pars.forEach(p => {
              result.push(this.getRef(p.par_ref));
            });
          }
        });
      } else if (data.length > 1) {
        if (data2[0].indexOf('-') != -1) {
          throw err;
        }
        section_id = parseInt(data2[0]);
        if (isNaN(section_id)) {
          throw err;
        }
        section = paper.sections.find(s => s.section_index === section_id);
        if (!section) {
          throw err;
        }
        data3 = data2[1].split(',');
        data3.forEach(d => {
          dd = d.split('-');
          min = parseInt(dd[0]);
          max = (dd.length > 1 ? parseInt(dd[1]) : parseInt(dd[0]));
          if (isNaN(min) || isNaN(max) ||
            section.pars.length < min || section.pars.length < max) {
            fail = true;
          } else {
            section.pars.slice(min - 1, max).forEach(p => {
              result.push(this.getRef(p.par_ref));
            });
          }
        });
        if (fail) {
          throw err;
        }
      }
    }
    return result;
  }

  /**
   * Returns an array of arrays with three values 
   * [paper_id, section_id, par_id]
   * with all paragraphs included in the references.
   * For example '101' returns an array of all paragraphs of paper 101.
   * For example '101:2.1,3-4' returns [[101,2,1], [101,2,3], [101,2,4]]
   * Checks if references exist. References that fail are returned as nulls.
   * References are not duplicated.
   * @param {string[]} refs UB references.
   * @return {Array.<number[]>}
   */
  getArrayOfRefs(refs) {
    const result = [];
    const strRefs = [];
    refs.forEach(ref => {
      let arRefs = null;
      try {
        arRefs = this.getRefs(ref);
      } catch (er) { }

      if (arRefs) {
        arRefs = arRefs.filter(r => {
          const str = `${r[0]}:${r[1]}.${r[2]}`;
          const added = (strRefs.indexOf(str) != -1);
          if (!added) {
            strRefs.push(str);
          }
          return !added;
        });
        extendArray(result, arRefs);
      } else {
        result.push(null);
      }
    });
    return result;
  }

  /**
   * Returns an array of arrays with three values [paper_id, section_id, par_id]
   * with all paragraphs included in the old references.
   * For example: '1390.1' returns [[126,3,6]].
   * For example: '1501' returns [[135,5,6], [135,5,7], [135,5,8], [135,6,1], [135,6,2]]
   * Checks if reference exist. References that fail are returned as nulls.
   * References are not duplicated.
   * @param {string[]} refs UB old references.
   * @return {Array.<number[]>}
   */
  getArrayOfRefsFromOldRefs(refs) {
    const result = [];
    const strRefs = [];
    const strRefs2 = [];
    refs.forEach(ref => {
      const data = ref.split('.').map(d => parseInt(d));
      const invalid = (data.find(d => isNaN(d)) != null);
      let str;
      if (invalid || data.length == 0) {
        result.push(null);
      } else {
        str = `${data[0]}.${(data.length === 1 ? '' : data[1])}`;
        if (strRefs.indexOf(str) === -1) {
          strRefs.push(str);
        }
      }
    });
    this.papers.forEach(paper => {
      paper.sections.forEach(section => {
        section.pars.forEach(par => {
          const pref = par.par_ref;
          const ref = par.par_pageref;
          const index = strRefs.findIndex(r => ref.startsWith(r));
          if (index != -1 && strRefs2.indexOf(pref) == -1) {
            strRefs2.push(pref);
            result.push(this.getRef(pref));
          }
        });
      });
    });
    return result;
  }

  /**
   * Returns footnotes that contain a giving paragraph from `The Urantia Book`.
   * @param {string} lu_ref Reference to `The Urantia Book`.
   * @return {Array}
   */
  getFootnotes(lu_ref) {
    let paper, section, par_content, footnotes = [];
    const err2 = getError(this.language, 'book_wrong_reference', lu_ref);
    //
    let ref;
    try {
      ref = this.getRef(lu_ref);
    } catch (err) {
      throw err;
    }
    const [ paper_id, section_id, par_id ] = ref;
    paper = this.papers.find(p => p.paper_index === paper_id);
    if (!paper) {
      throw err2;
    }
    section = paper.sections.find(s => s.section_index === section_id);
    if (!section) {
      throw err2;
    }
    par_content = section.pars[par_id - 1] 
      ? section.pars[par_id - 1].par_content 
      : null;
    if (!par_content) {
      throw err2;
    }
    for (let i = 0; i < paper.footnotes.length; i++) {
      if (par_content.indexOf(`{${i}}`) != -1) {
        footnotes.push(paper.footnotes[i]);
      }
    }
    return footnotes;
  }

  /**
   * Returns an array with pairs [text, biblical ref].
   * @param {Array} footnotes Array of footnotes.
   * @return {Array}
   */
  getSubFootnotes(footnotes) {
    const subfootnotes = [];
    const err = getError(this.language, 'book_wrong_footnotes');
    footnotes.forEach(f => {
      let parts, text, text2, fs, ab;
      parts = f.split('*').filter(n => n.trim() != '');
      if (parts.length === 0 || parts.length % 2 != 0) {
        throw err;
      }

      for (let p = 0; p < parts.length; p = p + 2) {
        text = parts[p];
        text2 = parts[p + 1];
        if (text2[0] === ':') {
          text2 = text2.substring(1).trim();
          if (text2[text2.length - 1] === '.') {
            text2 = text2.substring(0, text2.length - 1);
          }
        }
        fs = text2.split(';');

        fs.forEach(fss => {
          fss = fss.trim();
          let ref = null;
          let ab2 = findBibleAbb(this.language, fss);
          if (ab2) {
            ab = ab2;
            ref = fss.substring(ab.length).trim();
          } else {
            ref = fss;
          }
          if (ab && ref) {
            subfootnotes.push([text, `${ab} ${ref}`]);
          }
        });
      }
    });
    return subfootnotes;
  }

  /**
   * Returns a paragraph from book using a reference.
   * If the reference does not exist returns null.
   * @param {number} paperIndex Paper index starting at zero.
   * @param {number} sectionIndex Section index starting at zero.
   * @param {number} parIndex Paragraph index starting at 1.
   * @return {Object}
   */
  getPar(paperIndex, sectionIndex, parIndex) {
    const paper = this.papers.find(p => p.paper_index === paperIndex);
    if (!paper) {
      return null;
    }
    const section = paper.sections.find(s => s.section_index === sectionIndex);
    if (!section) {
      return null;
    }
    return section.pars[parIndex - 1];
  }

  /**
   * Returns the referenced paragraph in plain text without any tag or mark.
   * @param {number[]} ref Reference as an array of three numbers.
   * @returns {string}
   */
  toParInPlainText(ref) {
    let result = '';
    const errs = [];
    if (!ref) {
      errs.push(getError(this.language, 'Error: Ref is null'));
      return result;
    }
    const par = this.getPar(ref[0], ref[1], ref[2]);
    if (!par) {
      errs.push(getError(this.language, `Error: Ref ${ref[0]}:${ref[1]}.${ref[2]}} not found`));
      return result;
    }
    //Remove the references to footnotes and marks
    result = par.par_content
      .replace(/{(\d+)}|\*|\$/g, function (match, number) { return ''; });
    return result;
  }

  /**
   * Searches text in the book and returns an array of paragraph references
   * that contain the text.
   * @param {string} text Text to search.
   * @returns {string[]}
   */
  search(text) {
    const result = [];
    this.papers.forEach(paper => {
      paper.sections.forEach(section => {
        section.pars.forEach(par => {
          const par_content = par.par_content.replace(/_|\*/g, '');
          if (par_content.indexOf(text) != -1 &&
            result.indexOf(par.par_ref) === -1) {
            result.push(par.par_ref);
          }
        });
      });
    });
    return result;
  }

}
