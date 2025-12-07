import { useReadFolder } from '../useReadFolder.js';
import { extractStr, getError, extendArray, reflectPromise, 
  replaceTags, removeHTMLTags, getUBRef } from 'src/core/utils.js';
import { bookConfigs } from 'src/core/urantiabookConfigs.js';
import { HTMLSeparator as HSep } from 'src/core/enums.js';

import path from 'path';
import * as cheerio from 'cheerio';

/**
 * Reads `The Urantia Book` from a folder with files in HTML format.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 */
export const useReadFromHTML = (
  uiLanguage,
  addLog
) => {
  const { readFolder } = useReadFolder(uiLanguage, addLog);

  /**
   * Returns an array of section objects from the given HTML. Section zero
   * is not included.
   * @param {Object} $ Object with the document as a jQuery object.
   * @param {NodeList} nodes List of HTML nodes to use.
   * @param {Object} config Config to use.
   * @param {int} paperIndex Paper index.
   * @return {Object[]}
   */
  const getSectionsFromHTML = ($, nodes, config, paperIndex) => {
    let i, node, c, a, result = [], id = 0, title;
    for (i = 0; i < nodes.length; i++) {
      node = nodes[i];
      c = node.children;
      if (config.name === 'generic') {
        a = node.attribs;
        id = parseInt(a.id.split('_')[1]);
        title = c[0].data;
      } else {
        title = $(node).html();
        if (config.removeTagsInSecs === true) {
          title = removeHTMLTags(title, HSep.ANCHOR_START, HSep.ANCHOR_END,
            false, [], uiLanguage.value);
        }
      }
      title = replaceTags(title, HSep.ITALIC_START, HSep.ITALIC_END, '*', '*', 
        [], uiLanguage.value);
      if (config.sec_exception && title.indexOf(config.sec_exception) != -1) {
        continue;
      }
      if (config.name != 'generic') {
        id++;
        //Exception in document 139
        if (paperIndex === 139 && id === 9) {
          id++;
        }
      }
      result.push({
        section_index: id,
        section_ref: `${paperIndex}:${id}`,
        section_title: title,
        pars: []
      });
    };
    return result;
  };

  /**
   * Returns data from a paragraph from an HTML node with the paragraph.
   * Returns null if it is not a valid paragraph and must be ignored.
   * @param {Object} $ Object with the document as a jQuery object.
   * @param {Node} node HTML node.
   * @param {Object} config Config to use.
   * @param {int} paperIndex Paper index.
   * @return {Object}
   */
  const getParFromHTML = ($, node, config, paperIndex) => {
    const a = node.attribs, c = node.children;
    const sectionTag = config.secs;
    const titleTags = `h1,h3,${sectionTag}`;
    const is_b = [31, 56, 120].includes(paperIndex);
    let pId, sId, pindex = 0, ref, pref, n;
    if (config.name === 'generic') {
      if (!a || !a.id || a.id[0] != 'U' || c.length === 0 ||
        c[0].type != 'tag' || c[0].name != 'small') {
        return null;
      }
      pId = a.id.split('_');
      sId = pId[1];
      pindex = pId[2];
      pref = extractStr(c[0].children[0].data, '(', ')');
    } else {
      const exc = config.sec_exception;
      const filterFunc =
        (i, e) => !exc || !is_b || (is_b && $(e).text().indexOf(exc) === -1);
      const filterFunc2 = (i, e) => $(e).text().indexOf('(') != -1;
      pindex = $(node).prevAll()
        .filter(filterFunc)
        .map((i, e) => {
          return (
            titleTags.indexOf(e.name) != -1 ||
            $(e).children().filter(titleTags).length > 0
          );
        })
        .toArray()
        .indexOf(true) + 1;
      sId = $(node).prevAll(`${sectionTag},div:has(${sectionTag})`)
        .filter(filterFunc).length;
      //Exception in document 139
      if (paperIndex === 139 && sId >= 9) {
        sId = sId + 1;
      }
      pref = '';
      n = $(node).find('sup').filter(filterFunc2);
      if (n.length > 0) {
        pref = n.text().replace('(', '').replace(')', '');
      }
    }

    ref = `${paperIndex}:${sId}.${pindex}`;
    return {
      par_ref: ref,
      par_pageref: pref
    };
  };

  /**
   * Modifies special tags in an HTML content.
   * @param {string} text Text with HTML tags.
   * @param {string[]} errs Array for error messages.
   * @return {string}
   */
  const modifyTagsInHTML = (text, errs) => {
    //TODO: A function that receives an array of actions to do in a string
    text = removeHTMLTags(text, HSep.SMALL_START, HSep.SMALL_END, true, 
      errs, uiLanguage.value);
    text = replaceTags(text, HSep.ITALIC_START, HSep.ITALIC_END, '*', '*', 
      errs, uiLanguage.value);
    text = replaceTags(text, HSep.SMALLCAPS_START, HSep.SMALLCAPS_END, '$', '$', 
      errs, uiLanguage.value);
    text = replaceTags(text, HSep.UNDERLINE_START, HSep.UNDERLINE_END, '|', '|', 
      errs, uiLanguage.value);
    text = replaceTags(text, HSep.UNDERLINE2_START, HSep.UNDERLINE2_END, '|', '|', 
      errs, uiLanguage.value);
    text = replaceTags(text, HSep.UNDERLINE3_START, HSep.UNDERLINE3_END, '|', '|', 
      errs, uiLanguage.value);
    text = replaceTags(text, HSep.RIGHT_START, HSep.RIGHT_END, '', '', 
      errs, uiLanguage.value);
    text = replaceTags(text, HSep.BOLD_START, HSep.BOLD_END, '<b>', '</b>', 
      errs, uiLanguage.value);
    text = removeHTMLTags(text, HSep.SPAN_START, HSep.SPAN_END, false, 
      errs, uiLanguage.value);
    text = removeHTMLTags(text, HSep.ANCHOR_START, HSep.ANCHOR_END, false,
      errs, uiLanguage.value);
    text = text.trim();
    return text;
  };

  /**
   * Reads a paper from `The Urantia Book` from a file in HTML format.
   * @param {string} filePath File path.
   * @returns {Promise<Object>} Promise that returns an object with paper content
   * or null if is a file to ignore.
   */
  const readFileFromHTML = async (filePath) => {
    addLog(`Reading file: ${filePath}`);
    try {
      const baseName = path.basename(filePath);
      const dirPath = path.dirname(filePath);
      const ext = path.extname(filePath);
      const fname = baseName.replace(ext, '');
      const language = path.basename(dirPath).replace('book-', '');
      const paperIndex = parseInt(fname.substring(fname.length - 3));
      const config = bookConfigs.find(c => c.languages.indexOf(language) != -1);

      //Ignore HTML files that do not have paper number
      if (isNaN(paperIndex)) {
        return null;
      }

      const buf = await window.NodeAPI.readFile(filePath);
      const content = buf.toString();
      let errors = [];
      const $ = cheerio.load(content);
      const paperTitleQuery = config.paperTitle.replace(
        '{paperIndex}', paperIndex.toString());
      const paperTitle = $(paperTitleQuery).text();
      const secs = $(config.secs);
      const pars = $(config.pars);

      let paper = {
        paper_index: paperIndex,
        sections: [],
        footnotes: [],
        paper_title: paperTitle
      };
      const is_b = [31, 56, 120].includes(paperIndex);
      let i = 0, p, removeErr, text, pId, sec, pdata;
      //Add section 0 if it exists
      paper.sections.push({
        section_index: 0,
        section_ref: `${paperIndex}:0`,
        pars: []
      });
      //Add the rest of sections
      const sections = getSectionsFromHTML($, secs, config, paperIndex);
      extendArray(paper.sections, sections);
      //Add paragraphs
      for (i = 0; i < pars.length; i++) {
        p = pars[i];
        //Special case of par with asterisks (docs 31,56,120,134,144)
        // 31:10.21, 56:10.22, 120:3.11 (repeats, so we add 'b')
        // 134:6.14 (do not repeats, is a common par)
        // 144:5.11,25,38,54,73,87 (do not repeats, is a common par)
        if ($(p).text().indexOf('* * *') != -1) {
          const b = is_b ? 'b' : '';
          if (!is_b) {
            pId[2] = pId[2] + 1;
          }
          pdata = {
            par_ref: `${pId[0]}:${pId[1]}.${pId[2]}${b}`,
            par_pageref: `${pdata.par_pageref}${b}`,
            par_content: $(p).text().trim(),
            hide_ref: true
          };
          sec.pars.push(pdata);
          continue;
        }
        //Skip pars that are not ones (added for previous special case)
        if (config.pars_ok && p.name != config.pars_ok) {
          continue;
        }
        pdata = getParFromHTML($, p, config, paperIndex);
        if (!pdata) {
          continue;
        }
        pId = getUBRef(pdata.par_ref);
        sec = paper.sections.find(s => s.section_index === pId[1]);
        if (!sec) {
          extendArray(errors,
            getError(uiLanguage.value, 'book_section_not_found',
              `${paperIndex}:${pId[1]}`, -999));
          continue;
        }
        text = $(p).html();
        text = text.replace(/<sup>\d+:\d+\.\d+<\/sup>/, '');
        text = text.replace(/<sup>\(\d+.\d+\)<\/sup>/, '');
        text = text.replace(/<sup><\/sup>/, '');
        removeErr = [];
        text = modifyTagsInHTML(text, removeErr);
        if (removeErr.length > 0) {
          extendArray(errors, removeErr.map(e =>
            getError(uiLanguage.value, e, baseName, -999)));
        }
        pdata.par_content = text;
        sec.pars.push(pdata);
      };

      if (errors.length > 0) {
        throw errors;
      }

      //Remove section 0 if it is empty
      sec = paper.sections.find(s => s.section_index === 0);
      if (sec.pars.length === 0) {
        paper.sections.splice(paper.sections.indexOf(sec), 1);
      }

      return paper;
    } catch (err) {
      throw err;
    }
  };

  /**
   * Reads `The Urantia Book` from a folder with files in HTML format.
   * @param {string} dirPath Folder path.
   * @returns {Promise<Object[]>} Promise that returns the array of objects
   * with paper content.
   */
  const readFromHTML = async (dirPath) => {
    try {
      const files = await readFolder(dirPath, '.html;.htm');

      const promises = files.map(file => {
        const filePath = path.join(dirPath, file);
        return reflectPromise(readFileFromHTML(filePath));
      });

      const results = await Promise.all(promises);
      const errors = results.filter(r => r.error).map(r => r.error);
      if (errors.length > 0) {
        throw errors;
      }
      return results.map(r => r.value);
    } catch (err) {
      throw err;
    }
  };

  return {
    readFromHTML
  };
};
