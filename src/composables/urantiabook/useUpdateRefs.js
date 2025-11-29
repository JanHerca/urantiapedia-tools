import { getError, getAllIndexes } from 'src/core/utils.js';

/**
 * Updates references (footnotes) in the Urantia Book papers.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 */
export const useUpdateRefs = (
  uiLanguage,
  addLog
) => {
  /**
   * Updates references (footnotes) using the read through `readRefsFromJSON` 
   * and that are in variable footnotes.
   * @param {Object[]} papers Array of objects, each one representing one 
   * Urantia Book paper.
   * @param {Object[]} footnotes Array of objects, each one representing 
   * the footnotes to apply to each Urantia Book paper.
   * @returns {Promise} Promise that returns an updated array of paper objects.
   */
  const updateRefs = async (papers, footnotes) => {
    addLog(`Updating references`);
    const errors = [];
    try {
      //Loop in each paper
      papers.forEach(paper => {
        const index = paper.paper_index;
        const paperFootnotes = footnotes.find(f => f.paperIndex === index);
        if (!paperFootnotes) {
          return;
        }
        const { texts, bible_refs, locations } = paperFootnotes.footnotes;

        if (
          !texts || 
          !bible_refs || 
          !locations ||
          texts.length != bible_refs.length ||
          texts.length != locations.length
        ) {
          errors.push(getError(uiLanguage.value, 'book_invalid_number', index));
          return;
        }
        paper.footnotes = texts.map((t, i) => {
          return t
            .map((title, j) => `*${title}*: ${bible_refs[i][j]}.`)
            .map(f => f.replace(/\.\.$/, '.'))
            .join(' ');
        });
        const usedRefs = [];
        locations.forEach((location, i) => {
          const par_ref = location.split('#')[0];
          //Sentence index is the index of the sentence in paragraph
          // starting at 0 for first sentence
          const sentenceIndex = parseInt(location.split('#')[1]);
          let par = null;
          paper.sections.find(section => {
            const p = section.pars.find(pp => pp.par_ref === par_ref);
            if (p) {
              par = p;
            }
            return (p != undefined);
          });
          if (!par) {
            errors.push(getError(uiLanguage.value, 'book_par_not_found', par_ref, index));
            return;
          }
          //If the file already contains footnote marks then exit
          //Some files has footnote marks added manually so maintain
          if (usedRefs.indexOf(par_ref) === -1 &&
            par.par_content.indexOf('{') != -1) {
            return;
          }
          usedRefs.push(par_ref);
          const ii = getAllIndexes(par.par_content, '.');
          if (sentenceIndex != -1 && sentenceIndex < ii.length) {
            const pos = ii[sentenceIndex];
            par.par_content = par.par_content.substring(0, pos) +
              `{${i}}` + par.par_content.substring(pos);
          } else {
            par.par_content = par.par_content + `{${i}}`;
          }
        });
      });
      if (errors.length > 0) {
        throw errors;
      }
      return papers;
    } catch (err) {
      throw err;
    }
  };

  return {
    updateRefs
  };
};