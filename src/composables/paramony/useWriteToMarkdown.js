import { getError } from 'src/core/utils.js';


/**
 * Write the Paramony in Markdown to the default location.
 * @param {Ref<string>} language Language ref.
 * @param {function} addLog Function to add log messages.
 */
export const useWriteToMarkdown = (language, addLog) => {

  /**
   * Write the Paramony in Markdown to the default location.
   * @param {string} filePath File path.
   * @param {string} bookFileName Book file name, as `The Urantia Book`, 
   * `1 Chronicles`, etc.
   * @param {Object[]} footnotes Array of footnotes.
   */
  const writeToMarkdown = async (filePath, bookFileName, footnotes) => {
    addLog(`Creating content: ${filePath}`);
    try {
      if (bookFileName != 'The Urantia Book') {
        return;
      }
      let md = '';
      md += '| num | pos | location | text | bible_ref |\r\n';
      md += '| --- | --- | --- | --- | --- |\r\n';
      footnotes.forEach(paper => {
        const { footnotes: pfootnotes } = paper;
        if (!pfootnotes) {
          throw getError(language.value, 'book_error_footnotes', filePath,
            `No footnotes for paper ${paper.paperIndex}.`);
        }
        const { texts, bible_refs, locations } = pfootnotes;
        if (
          !Array.isArray(texts) || 
          !Array.isArray(bible_refs) ||
          !Array.isArray(locations) ||
          texts.length != bible_refs.length ||
          texts.length != locations.length
        ) {
          throw getError(language.value, 'book_error_footnotes', filePath,
            `Footnotes items not arrays or not same length in paper ${paper.paperIndex}.`);
        }
        texts.forEach((textAr, i) => {
          const refsAr = bible_refs[i];
          const location = locations[i];
          if (!Array.isArray(textAr)) {
            throw getError(language.value, 'book_error_footnotes', filePath,
              `Text not array on paper ${paper.paperIndex}.`);
          }
          if (!Array.isArray(refsAr)) {
            throw getError(language.value, 'book_error_footnotes', filePath,
              `Bible refs not array on paper ${paper.paperIndex}.`);
          }
          if (textAr.length != refsAr.length) {
            throw getError(language.value, 'book_error_footnotes', filePath,
              `Texts and refs not same length on paper ${paper.paperIndex}.`);
          }
          textAr.forEach((text, j) => {
            md += `| ${i} | ${j} | ${location} | ${text} | ${refsAr[j]} |\r\n`;
          });
        });
      });
      addLog(`Writing file: ${filePath}`);
      await window.NodeAPI.writeFile(filePath, md);
    } catch (err) {
      throw err;
    }
  };

  return {
    writeToMarkdown
  };
};