import { getError, extendArray } from 'src/core/utils.js';

import path from 'path';

/**
 * Writes references (footnotes) in a file called `footnotes-book-xx.json` 
 * in the parent folder of the one passed by param.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 */
export const useWriteRefsToJSON = (
  uiLanguage,
  addLog
) => {
  /**
   * Writes references (footnotes) in a file called `footnotes-book-xx.json` 
   * in the parent folder of the one passed by param.
   * Also saves info of position of each sub-reference to be able to apply
   * to other translations.
   * @param {string} dirPath Folder path.
   * @param {UrantiaBook} ub_book UrantiaBook instance.
   */
  const writeRefsToJSON = async (dirPath, ub_book) => {
    try {
      const baseName = path.basename(dirPath);
      const access = await window.NodeAPI.exists(dirPath);
      if (!access) {
        throw getError(uiLanguage.value, 'folder_no_access', baseName);
      }
      let parentPath = path.dirname(dirPath);
      let filePath = path.join(parentPath, `footnotes-${baseName}.json`);
  
  
      addLog(`Creating content: ${filePath}`);
      let result = {
        content: []
      };
      let n, paper, paperFNs, footnotes, errors = [];
      for (n = 0; n < 197; n++) {
        paper = ub_book.papers.find(p => p.paper_index === n);
        if (!paper) {
          continue;
        }
        footnotes = {
          texts: [],
          bible_refs: [],
          locations: []
        }
        paperFNs = {
          paperIndex: n,
          footnotes: footnotes
        };
        result.content.push(paperFNs);
        paper.sections.forEach(section => {
          section.pars.forEach(par => {
            try {
              const ff = ub_book.getFootnotes(par.par_ref);
              ff.forEach(f => {
                const sff = ub_book.getSubFootnotes([f]);
                if (sff.length > 0) {
                  let texts = [];
                  sff.forEach(sf => {
                    if (texts.indexOf(sf[0]) === -1) {
                      texts.push(sf[0]);
                    }
                  });
                  let bible_refs = texts.map(t => {
                    return sff
                      .filter(sf => sf[0] === t)
                      .map(sf => sf[1]).join('; ');
                  });
                  footnotes.texts.push(texts);
                  footnotes.bible_refs.push(bible_refs);
                }
              });
              let locations = ub_book.getRefsLocations(
                par.par_content, paper.footnotes.length)
                .map(loc => par.par_ref + '#' + loc);
              extendArray(footnotes.locations, locations);
            } catch (e) {
              errors.push(e);
            }
          })
        });
      }
      if (errors.length > 0) {
        throw errors;
      }
      addLog(`Writing file: ${filePath}`);
      const json = JSON.stringify(result, null, 4);
      await window.NodeAPI.writeFile(filePath, json);
    } catch(err) {
      throw err;
    }
  };

  return {
    writeRefsToJSON
  };
};