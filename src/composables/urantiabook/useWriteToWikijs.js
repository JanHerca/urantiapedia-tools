import { tr, strformat, getError, extendArray, getAllIndexes, reflectPromise, 
  replaceTags, getRefsLocations, getUBRef, findBibleAbb, replaceWords, 
  removeAllHTML, getBookPaperTitle } from 'src/core/utils.js';
import { getWikijsBookLink, getWikijsHeader, getWikijsBookCopyright, 
  getWikijsLinks, getWikijsBookButtons, getWikijsBookTitles, 
  getWikijsBookSectionTitles, fixWikijsHeader } from 'src/core/wikijs.js';
import { getWikijsBookParRef } from 'src/core/wikijs.js';
import { BibleAbbreviations as BibleAbbs } from 'src/core/bibleAbbs';
import { HTMLSeparator as HSep } from 'src/core/enums.js';

import path from 'path';

/**
 * Writes `The Urantia Book` in HTML format that can be imported in Wiki.js.
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 * @param {function} addWarning Function to add warning messages.
 */
export const useWriteToWikijs = (
  language,
  uiLanguage,
  addLog,
  addWarning
) => {
  const audio = ['en', 'es', 'fr', 'it', 'pt', 'de'];
  const colors = ['blue', 'purple', 'teal', 'deep-orange', 'indigo',
    'pink', 'blue-grey']; //Colors for up to 7 columns max

  /**
   * Returns a clone of a paper but replacing the corrections to obtain
   * the original 1955 paper. This only works for English edition.
   * @param {Object[]} papers Array of paper objects.
   * @param {Object[]} corrections Array of correction objects.
   * @param {number} paper_index Index of paper.
   */
  const getOriginalPaper = (papers, corrections, paper_index) => {
    const paper = papers.find(p => p.paper_index === paper_index);
    const clone = {
      ...paper,
      sections: paper.sections.map(section => {
        return {
          ...section,
          pars: section.pars.map(p => ({ ...p }))
        };
      }),
      footnotes: paper.footnotes.slice()
    };
    const correctionsFiltered = corrections.filter(c => {
      const r = c.par_ref.split(/[:\.]/);
      return parseInt(r[0]) === paper_index;
    });
    correctionsFiltered.forEach(c => {
      clone.sections.forEach(section => {
        section.pars.forEach(p => {
          if (p.par_ref === c.par_ref) {
            let original = c.original.indexOf('...') != -1
              ? c.original.split('...')[1]
              : c.original;
            original = original.indexOf('. (') != -1
              ? original.split('. (')[0]
              : original;
            original = replaceTags(original, HSep.ITALIC_START,
              HSep.ITALIC_END, '*', '*', []);
            const corrected = replaceTags(c.corrected, HSep.ITALIC_START,
              HSep.ITALIC_END, '*', '*', []);
            if (p.par_content.indexOf(corrected) === -1) {
              addWarning(`Error finding corrected text (${p.par_ref})`);
            }
            p.par_content = p.par_content.replace(corrected,
              original);
          }
        });
      });
    });
    return clone;
  };

  /**
   * Returns the HTML fragment for Wiki.js of a footnote.
   * @param {string} footnote Footnote.
   * @returns {string}
   */
  const footnoteToWikijs = (footnote) => {
    let html = '', parts, text, fs, ab;
    parts = footnote.split('*').filter(m => m.trim() != '');
    //Check
    if (parts.length === 0 || parts.length % 2 != 0) {
      return 'FOOTNOTE ERROR';
    }
    for (let p = 0; p < parts.length; p = p + 2) {
      text = parts[p];
      html += ` <i>${text}</i>: `;

      fs = parts[p + 1].split(';')
        .map(n => n.trim().replace(/^:|\.$/g, '').trim());
      fs.forEach((fss, i) => {
        fss = fss.trim();
        let chapter = null, vers = null, ver = null, ref = null, path = null;
        let ab2 = findBibleAbb(language.value, fss);
        if (ab2) {
          ab = ab2;
          ref = fss.substring(ab.length).trim();
        } else {
          ref = fss;
        }
        if (ab && ref) {
          path = `/${language.value}/Bible/${BibleAbbs[language.value][ab][1]}`;
          if (ref.indexOf(':')) {
            chapter = ref.substring(0, ref.indexOf(':'));
            vers = ref.substring(ref.indexOf(':') + 1);
            ver = vers.replace(/[-/,]/g, '|').split('|')[0];
            if (ver === '') {
              ver = '1';
            }
          }
          html += (chapter && vers && ver 
            ? `<a href="${path}/${chapter}#v${ver}">${ab} ${chapter}:${vers}</a>`
            : `<a href="${path}/1">${ab} 1</a>`);
          html += (i != fs.length - 1 ? '; ' : '. ');
        }
      });
    }
    return html;
  };

  /**
   * Converts array of Paramony footnotes to objects with sorting info.
   * The output is already sorted.
   * @param {Object} paper Paper object.
   * @returns {Object[]} Returns and array of objects with footnotes. The
   * objects have these values:
   * - index: number used to mark the footnote in paper.
   * - par_ref: paragraph reference
   * - sorting: a value for sorting
   * - html: HTML fragment to add in the References section of Urantia Book
   * paper.
   * Returns an empty array if no Paramony footnotes exists.
   */
  const footnotesToObjects = (paper) => {
    const result = [];
    const footnotes = paper.footnotes;
    paper.sections.forEach(section => {
      if (result.length === footnotes.length) {
        return;
      }
      section.pars.forEach(par => {
        if (
          result.length === footnotes.length ||
          !par.par_ref || 
          !par.par_content
        ) {
          return;
        }
        getRefsLocations(par.par_content, footnotes.length)
          .map(loc => loc === -1 ? 998 : loc + 1)
          .forEach(loc => {
            const footnote = footnotes[result.length];
            const location = par.par_ref + `#${loc}`;
            const s = location.split(/[:\.#]/g)
              .map(v => parseInt(v)).slice(1)
              .map(v => v + 1000).join('');

            result.push({
              index: result.length,
              par_ref: par.par_ref,
              sorting: s,
              html: footnoteToWikijs(footnote)
            });
          });

      });
    });
    result.sort((a, b) => a.sorting - b.sorting);
    return result;
  };

  /**
   * Returns audio HTML fragment for Wiki.js.
   * @param {number} paperIndex Paper index.
   * @returns {string}
   */
  const audioToWikijs = (paperIndex) => {
    let html = '';
    let stri = (paperIndex > 99 ? `${paperIndex}` :
      (paperIndex > 9 ? `0${paperIndex}` : `00${paperIndex}`));
    if (audio.includes(language.value)) {
      stri = (paperIndex === 0 ? stri + '_1' : stri);
      html += 
        `<p style="text-align: center;">\r\n` +
        `<audio controls="controls" style="width:100%;max-width:400px;" preload="none">\r\n` +
        `<source src="/audio/audio_${language.value}/ub_${stri}.mp3" type="audio/mpeg">\r\n` +
        `</audio>\r\n` +
        `</p>\r\n`;
    }
    return html;
  };

  /**
   * Adds footnote marks in the paragraph text and returns it.
   * @param {Object[]} footnoteDef An array with the definition of the
   * footnotes for all the footnote sections.
   * @param {string} pcontent Final text of the paragraph.
   * @param {Object} par Object with paragraph data.
   * @return {string}
   */
  const addFootnoteMarks = (footnoteDef, pcontent, par) => {
    const cite = `<sup id="{0}"><a href="{1}">[{2}]</a></sup>`;
    const icon = `<img class="emoji" draggable="false" alt="{0}" ` +
      `src="/_assets/svg/twemoji/{1}.svg">`;
    const r = par.par_ref.split(/[:\.]/);
    footnoteDef.forEach(fnsection => {
      const oldFn = !['a', 's'].includes(fnsection.suffix);
      const urls = oldFn
        ? []
        : fnsection.footnotes.map(f => f.url ? f.url : '').sort();
      fnsection.footnotes
        .filter(fn => {
          return fn.par_ref
            ? fn.par_ref === par.par_ref
            : fn.par_refs.indexOf(par.par_ref) != -1;
        })
        .forEach((fn, k) => {
          fnsection.index++;
          const fni = oldFn
            ? fnsection.index
            : fnsection.footnotes.indexOf(fn) + 1;
          const { index: citei, suffix: fns, alt: fna, twemoji: fnt }
            = fnsection;
          const i = urls.indexOf(fn.url ? fn.url : '');
          const cite_id = oldFn
            ? `cite_${fns}${citei}`
            : `cite_${fns}${r[1]}_${r[2]}_${i}`;
          const link = oldFn
            ? `#fn_${fns}${fni}`
            : `#fn_${fns}${r[1]}_${r[2]}_${i}`;
          const text = strformat(cite, cite_id, link, fni);
          const fnicon = strformat(icon, fna, fnt);
          if (fn.index != null) {
            const i2 = par.par_content.indexOf(`{${fn.index}}`);
            const i1 = par.par_content.indexOf(`{${fn.index - 1}}`);
            if (k == 0 || (i2 - i1 > 4)) {
              pcontent = pcontent.replace(`{${fn.index}}`,
                fnicon + text);
            } else {
              pcontent = pcontent.replace(`{${fn.index}}`, text);
            }
          } else if (fn.location === 999) {
            if (k == 0) {
              pcontent += fnicon;
            }
            pcontent += text;
          } else if (fn.location != null) {
            const indexes = getAllIndexes(pcontent, '.');
            const tindex = indexes[fn.location - 1];
            pcontent = pcontent.substring(0, tindex) +
              fnicon + text + pcontent.substring(tindex);
          } else if (fnsection.suffix === 'c' && fn.corrected) {
            //Case for English 1955 corrections
            const seps = ['.', ',', ';', ':', '?', '!'];
            const indexesHtml = getAllIndexes(pcontent, seps);
            const indexesNoHtml = getAllIndexes(par.par_content, seps);
            const contentNoHtml = removeAllHTML(par.par_content)
              .replace(/[\*\$]/g, '')
              .replace(/\{\d+\}/g, '');
            const correctedNoHtml = removeAllHTML(fn.corrected);
            if (indexesHtml.length != indexesNoHtml.length) {
              addWarning(`Error in footnotes: indexes ${pcontent}`);
              return;
            }
            let cindex = contentNoHtml.indexOf(correctedNoHtml);
            if (cindex === -1) {
              addWarning(`Error in footnotes: not found: ${pcontent}`);
              return;
            }
            cindex = cindex + correctedNoHtml.length - 1;
            const cindexNoHtml = indexesNoHtml.findIndex(i => i >= cindex);
            if (cindexNoHtml === -1) {
              addWarning(`Error in footnotes: index fails: ${pcontent}`);
              return;
            }
            cindex = indexesHtml[cindexNoHtml];
            pcontent = pcontent.substring(0, cindex) +
              fnicon + text + pcontent.substring(cindex);
          }
        });
    });
    return pcontent;
  };

  /**
   * Returns the References section from the array of footnotes to Wiki.js.
   * @param {Object[]} footnoteDef An array with the definition of the
   * footnotes for all the footnote sections.
   * @return {string}
   */
  const referencesSectionToWikijs = (footnoteDef) => {
    const icon = 
      `<img class="emoji" draggable="false" alt="{0}" ` +
      `src="/_assets/svg/twemoji/{1}.svg">`;
    const style = '-moz-column-width: 30em; -webkit-column-width: 30em; ' +
      'column-width: 30em; margin-top: 1em;';
    const cite =
      `  <li{0}><a href="#cite_{2}{1}">↑ <small id="fn_{2}{1}">` +
      `{4}</small></a>{3}</li>\r\n`;
    const cite2 = `  <li{0}>{1}</li>\r\n`;
    let html = '';
    html += `<h2>${tr('topic_references', language.value)}</h2>\r\n`;
    footnoteDef.forEach(fnsection => {
      if (fnsection.footnotes.length === 0) {
        return;
      }
      const { suffix, alt, twemoji } = fnsection;
      const fnicon = strformat(icon, alt, twemoji);
      html += `<h3>${fnicon} ${fnsection.section}</h3>\r\n`;

      html += `<div style="${style}">\r\n<ol style="margin: 0; ` +
        `padding-top: 0px;">\r\n`;
      fnsection.footnotes.forEach((f, n) => {
        const style2 = (n === 0 ? ' style="margin-top:0px;"' : '');
        if (suffix === 'a' || suffix === 's') {
          html += strformat(cite2, style2, f.html);
        } else {
          html += strformat(cite, style2, n + 1, suffix, f.html, f.par_ref);
        }
      });
      html += '</ol>\r\n</div>\r\n';
    });

    return html;
  };

  /**
   * Writes a paper of `The Urantia Book` in HTML format that can be imported 
   * in Wiki.js.
   * @param {string} filePath Output file.
   * @param {Object[]} ubPapers Array of objects with all the papers in the
   * Urantia Book.
   * @param {(Object|Object[])} papers JSON object with the paper or array of
   * JSON objects with paper in several versions. The first one must be the
   * english version, and one must be the master version, with links to footnotes.
   * @param {?TopicIndex} topicIndex Optional TopicIndex with topics.
   * @param {?TopicIndex[]} topicIndexEN Optional TopicIndex with topics in english.
   * If previous param is english is not required otherwise is required.
   * @param {?ImageCatalog} imageCatalog Optional array of images in image catalog.
   * @param {?MapCatalog} mapCatalog Optional array of maps in map catalog.
   * @param {?Paralells} bookParalells Optional array of books paralells.
   * @param {?Articles} articlesParalells Optional array of articles paralells.
   * @param {?Object[]} corrections Optional array of corrections done in the 
   * English Urantia Book 1955 edition.
   */
  const writeFileToWikijs = async (
    filePath, 
    ubPapers,
    papers, 
    topicIndex, 
    topicIndexEN,
    imageCatalog, 
    mapCatalog, 
    bookParalells, 
    articlesParalells,
    corrections
  ) => {
    addLog(`Writing file: ${filePath}`);
    try {
      const multi = Array.isArray(papers);
      const years = multi
        ? papers.map(p => p.year)
        : [tr('bookMasterYear', language.value)];
      const copyrights = multi
        ? papers.map(p => p.copyright)
        : ["UF"];
      const topicIndexes = multi
        ? papers.map((p, i) => (i === 0 ? topicIndexEN : topicIndex))
        : [topicIndex];
      const masterIndex = multi
        ? papers.findIndex(pp => pp.isMaster)
        : -1;
      const paper = multi
        ? papers[masterIndex]
        : papers;
      const index = paper.paper_index;
      const prev = index - 1;
      const next = index + 1;
      let error = null;
  
      //Get all footnotes: Bible (paramony), books (paralells), articles (paralells), etc.
      const paramonyFn = Array.isArray(paper.footnotes) && paper.footnotes.length > 0
        ? footnotesToObjects(paper) 
        : [];
      const paramonyFnErr = paramonyFn
        .filter(f => f.html === 'FOOTNOTE ERROR')
        .map(f => f.index);
      const paralellsFn = bookParalells ? bookParalells.getParalells(index) : [];
      const aParalells = articlesParalells ? articlesParalells.getParalells(index) : [];
      const articlesFn = aParalells.filter(p => p.suffix === 'a');
      const study_aidsFn = aParalells.filter(p => p.suffix === 's');
      const pCorrections = (corrections || []).filter(c => {
        const r = c.par_ref.split(/[:\.]/);
        return parseInt(r[0]) === index;
      });
  
      const footnoteDef = [
        {
          section: tr('articles', language.value),
          footnotes: articlesFn, 
          index: 0,
          suffix: 'a', 
          twemoji: '1f4c3', 
          alt: '📃'
        },
        {
          section: tr('study_aids', language.value),
          footnotes: study_aidsFn, 
          index: 0,
          suffix: 's', 
          twemoji: '1f4d3', 
          alt: '📓'
        },
        {
          section: tr('bibleName', language.value),
          footnotes: paramonyFn, 
          index: 0,
          suffix: 'b', 
          twemoji: '1f4d5', 
          alt: '📕'
        },
        {
          section: tr('booksOther', language.value),
          footnotes: paralellsFn, 
          index: 0,
          suffix: 'o', 
          twemoji: '1f4da', 
          alt: '📚'
        },
        /* This last section is only available for English */
        {
          section: 'Corrections to original English 1955',
          footnotes: pCorrections, 
          index: 0,
          suffix: 'c', 
          twemoji: '1f4d8', 
          alt: '📘'
        }
      ];
  
      //Checks
      if (!Array.isArray(paper.sections)) {
        error = getError(uiLanguage.value, 'book_no_sections', filePath);
      } else if (paper.sections.find(s => s.section_ref == null)) {
        error = getError(uiLanguage.value, 'book_section_no_reference', filePath);
      } else if (paper.sections.find(s => !Array.isArray(s.pars))) {
        error = getError(uiLanguage.value, 'book_section_no_pars', filePath);
      } else if (!paper.paper_title) {
        error = getError(uiLanguage.value, 'book_paper_no_title', filePath);
      } else if (paramonyFnErr.length > 0) {
        error = getError(uiLanguage.value, 'book_error_footnotes', filePath,
          paramonyFnErr.join(','));
      }
      if (error) {
        throw error;
      }
  
      //Header
      let body = '';
      let header = '';
      let error_par_ref;
      const prevPaper = ubPapers.find(p => p.paper_index === prev);
      const nextPaper = ubPapers.find(p => p.paper_index === next);
      const prevLink = getWikijsBookLink(prevPaper, language.value, multi, true);
      const nextLink = getWikijsBookLink(nextPaper, language.value, multi, false);
      const indexLink = getWikijsBookLink(paper, language.value, multi, null);
      const title = getBookPaperTitle(paper, language.value, true);
      // let footnoteIndex = 0;
      let rErr = [];
      let topicErr = [];
  
      //Write header
      header += getWikijsHeader(title, ['the urantia book—papers']);
      header += '\r\n';
      //Write copyright
      body += getWikijsBookCopyright(years, copyrights, language.value);
      //Write top links
      body += getWikijsLinks(prevLink, indexLink, nextLink);
      //Write top buttons
      if (multi) {
        body += getWikijsBookButtons(papers.map(p => p.label),
          language.value, colors);
      }
      //Write audio controls (only in single-mode)
      if (!multi) {
        body += audioToWikijs(index);
      }
      // Write papers title (only for multi-version)
      if (multi) {
        body += getWikijsBookTitles(papers, language.value);
      }
      //Sections & paragraphs
      paper.sections.forEach((section, sec_i) => {
        const previousPars = [];
        //Add of section title (or titles in multi-version)
        body += getWikijsBookSectionTitles(papers, sec_i);
  
        section.pars.forEach((par, par_i) => {
          const pars = (multi ? papers.map(p => {
            return (p.sections[sec_i] ?
              p.sections[sec_i].pars[par_i] : null);
          }) : [par]);
          let aref, di, si, pi, image, map;
          pars.forEach(p => p.usedTopicNames = []);
  
          if (!par.par_ref || !par.par_content) {
            error = 'book_par_no_refcontent';
            return;
          }
          try {
            aref = getUBRef(par.par_ref, uiLanguage.value);
          } catch (err) {
            error_par_ref = par.par_ref;
            error = 'book_no_valid_reference';
          }
          if (!aref) {
            return;
          }
  
          di = aref[0];
          si = aref[1];
          pi = aref[2];
          rErr = [];
  
          //Create paragraphs for all versions (multi/single)
          const parHtmls = pars.map((p, ppi) => {
            let parHtml = '';
            let pcontent = p.par_content;
            let used, topics;
            const topicNames = [];
            const center = p.hide_ref ? ' class="text-center"' : '';
  
            parHtml += (multi
              ? `<p${center}>`
              : `<p${center} id="p${si}_${pi}${p.hide_ref ? 'b' : ''}">`);
            parHtml += getWikijsBookParRef(
              multi,
              p.par_ref,
              language.value,
              colors[ppi],
              (multi ? papers[ppi].label : null),
              p.hide_ref
            );
            //Replacements (avoiding special pars with asterisks)
            pcontent = pcontent.indexOf('* * *') != -1
              ? pcontent
              : replaceTags(pcontent, '*', '*', '<i>', '</i>', rErr);
            pcontent = replaceTags(pcontent, '$', '$',
              '<span style="font-variant: small-caps;">', '</span>', rErr);
            if (language.value === 'ko') {
              pcontent = replaceTags(pcontent, '|', '|', '<u>', '</u>', rErr);
            }
            if (rErr.length > 0) {
              error_par_ref = p.par_ref;
              error = rErr[0];
            }
  
            //Topic index links
            if (topicIndexes[ppi]) {
              used = (previousPars[ppi] ?
                previousPars[ppi].usedTopicNames : []);
              topics = topicIndexes[ppi].filterTopicsInParagraph(
                p.par_content, di, si, pi, topicNames, used);
              previousPars[ppi] = p;
              extendArray(p.usedTopicNames, topics.map(t => t.name));
              if (topicNames.length > 0) {
                topicNames.sort((a, b) => {
                  if (a.name === b.name) {
                    return (a.link.length - b.link.length);
                  }
                  return (b.name.length - a.name.length);
                });
                pcontent = replaceWords(
                  topicNames.map(i => i.name),
                  topicNames.map(i => i.link),
                  pcontent
                );
              }
            }
  
            //Footnote marks
            // If par is from master UB or only one UB
            if (masterIndex === ppi || !multi) {
              //Add footnote marks to paragraph content
              pcontent = addFootnoteMarks(footnoteDef,
                pcontent, p);
            }
            //The first item is always in English
            if (multi && ppi === 0) {
              //Remove footnote marks (they are in master)
              pcontent = pcontent.replace(/\{(\d+)\}/g, '');
            }
            parHtml += `${pcontent}</p>\r\n`;
            return parHtml;
          });
  
          //Write paragraphs (multi/single)
          if (multi) {
            body += `<div id="p${si}_${pi}" class="d-sm-flex">\r\n`;
            body += parHtmls.map((ph, n, arrp) => {
              var cls = (n < arrp.length ?
                ` class="urantiapedia-column-${n + 1} pr-sm-5"` : '') +
                ' style="flex-basis:100%"';
              return `  <div${cls}>\r\n    ${ph}  </div>\r\n`;
            }).join('');
            body += '</div>\r\n';
          } else {
            body += parHtmls[0];
          }
  
          //Image if exists
          if (imageCatalog) {
            image = imageCatalog.getImageForRef(par.par_ref);
            if (image) {
              body += image;
            }
          }
  
          //Map if exists
          if (mapCatalog) {
            map = mapCatalog.getMapForRef(par.par_ref);
            if (map) {
              body += map;
            }
          }
        });
      });
  
      //Footer
      body += '<br/>\r\n';
      body += getWikijsLinks(prevLink, indexLink, nextLink);
  
      //References section
      if (footnoteDef.find(fdef => fdef.footnotes.length > 0)) {
        body += referencesSectionToWikijs(footnoteDef);
      }
  
      if (error) {
        throw getError(uiLanguage.value, error, filePath, error_par_ref);
      } else if (topicErr.length > 0) {
        throw getError(uiLanguage.value, topicErr.map(e => e.message).join(', '));
      }
      //Only write if content is new or file not exists
      //Update date created avoiding a new date for it
      const buf = (await reflectPromise(window.NodeAPI.readFile(filePath))).value;
      if (buf) {
        const previousLines = buf.toString().split('\n');
        const curLines = (header + body).split('\n');
        const newHeader = fixWikijsHeader(header, previousLines, curLines);
        if (newHeader) {
          await window.NodeAPI.writeFile(filePath, newHeader + body);
        }
        return;
      }
      await window.NodeAPI.writeFile(filePath, header + body);

    } catch (err) {
      throw err;
    }
  };


  /**
   * Writes `The Urantia Book` in HTML format that can be imported in Wiki.js, 
   * each paper a file. It requires reading previously from any format.
   * @param {string} dirPath Folder path.
   * @param {Object[]} papers Array of objects with papers.
   * @param {?TopicIndex} topicIndex Optional TopicIndex with topics.
   * @param {?TopicIndex[]} topicIndexEN Optional TopicIndex with topics in english.
   * If previous param is english is not required otherwise is required.
   * @param {?ImageCatalog} imageCatalog Optional array of images in image catalog.
   * @param {?MapCatalog} mapCatalog Optional array of maps in map catalog.
   * @param {?Paralells} bookParalells Optional array of books paralells.
   * @param {?Articles} articlesParalells Optional array of articles paralells.
   * @param {?Object[]} corrections Optional array of corrections done in the 
   * English Urantia Book 1955 edition.
   */
  const writeToWikijs = async (
    dirPath, 
    papers,
    topicIndex, 
    topicIndexEN, 
    imageCatalog,
    mapCatalog, 
    bookParalells, 
    articlesParalells,
    corrections
  ) => {
    addLog(`Writing to folder: ${dirPath}`);
    try {
      const baseName = path.basename(dirPath);
      const access = window.NodeAPI.exists(dirPath);
      if (!access) {
        throw getError(uiLanguage.value, 'folder_no_access', baseName)
      }
      const promises = papers
        .map(paper => {
          const i = paper.paper_index;
          const filePath = path.join(dirPath, `${i}.html`);
          return reflectPromise(writeFileToWikijs(
            filePath, 
            papers,
            paper,
            topicIndex, 
            topicIndexEN, 
            imageCatalog,
            mapCatalog, 
            bookParalells, 
            articlesParalells,
            corrections)
          );
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

  /**
   * Writes `The Urantia Book` (mutiple versions mode) in HTML format that 
   * can be imported in Wiki.js, each paper a file.
   * @param {string} dirPath Folder path.
   * @param {Object[]} books Array of Book objects with the book in several 
   * versions. The first one must be the master version, which will have 
   * links to footnotes.
   * @param {?TopicIndex} topicIndex Optional TopicIndex with topics.
   * @param {?TopicIndex[]} topicIndexEN Optional TopicIndex with topics in english.
   * If previous param is english is not required otherwise is required.
   * @param {?ImageCatalog} imageCatalog Optional array of images in image catalog.
   * @param {?MapCatalog} mapCatalog Optional array of maps in map catalog.
   * @param {?Paralells} bookParalells Optional array of books paralells.
   * @param {?Articles} articlesParalells Optional array of articles paralells.
   * @param {?Object[]} corrections Optional array of corrections done in the 
   * English Urantia Book 1955 edition.
   */
  const writeMultipleToWikijs = async (
    dirPath, 
    books, 
    topicIndex, 
    topicIndexEN, 
		imageCatalog, 
    mapCatalog, 
    bookParalells, 
    articlesParalells,
    corrections
  ) => {
    addLog(`Writing to folder: ${dirPath}`);
    try {
      await window.NodeAPI.exists(dirPath);
    } catch (err) {
      throw getError(uiLanguage.value, 'folder_not_exists', dirPath);
    }

    try {
      const papersEN = books.find(b => b.language === 'en').papers;
      const papersMaster = books.find(b => b.isMaster).papers;
      const promises = books[0].papers.map(paper => {
        const index = paper.paper_index;
        const papers = books.map(b => {
          const p2 = b.papers.find(p1 => p1.paper_index === index);
          p2.isMaster = b.isMaster;
          p2.year = b.year;
          p2.copyright = b.copyright;
          p2.label = (language.value === 'en' ? '1955 SRT' : b.label);
          return p2;
        });
        //For English we add here the old 1955 version
        if (language.value === 'en') {
          const originalPaper = getOriginalPaper(papersEN, corrections, index);
          originalPaper.year = paper.year;
          originalPaper.copyright = paper.copyright;
          originalPaper.label = '1955 ORIGINAL';
          papers.push(originalPaper);
        }
        const filePath = path.join(dirPath, `${index}.html`);
        const p = writeFileToWikijs(
          filePath, 
          papersMaster,
          papers, 
          topicIndex,
          topicIndexEN, 
          imageCatalog, 
          mapCatalog, 
          bookParalells,
          articlesParalells,
          corrections);
        return reflectPromise(p);
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
    writeToWikijs,
    writeMultipleToWikijs
  };

};