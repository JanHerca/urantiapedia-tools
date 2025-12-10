import { useReadIndexFileFromTSV } from '../articles/useReadIndexFileFromTSV.js';
import { useWriteIndexFileToWikijs } from '../articles/useWriteIndexFileToWikijs.js';

/**
 * Convert a Articles Index File (TSV) to Wiki.js
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {Ref<boolean>} processing Processing flag.
 * @param {function} addLog Function to add log messages.
 * @param {function} addErrors Function to add error messages.
 * @param {function} addSuccess Function to add success messages.
 * @param {function} createArticlesIndex Function to create an index.
 */
export const useARTICLE_INDEX_TO_WIKIJS = (
  language,
  uiLanguage,
  processing,
  addLog,
  addErrors,
  addSuccess,
  createArticlesIndex
) => {
  const { readIndexFileFromTSV } = useReadIndexFileFromTSV(language, uiLanguage, 
    addLog);
  const { writeIndexFileToWikijs } = useWriteIndexFileToWikijs(uiLanguage, 
    addLog, createArticlesIndex);

  /**
   * Reads Articles Index File (TSV)
   * Writes Articles Index in Wiki.js
   * @param {string} articlesFile File with an index of articles in TSV format.
   * @param {string} outputFile Output file in HTML format.
   */
  const executeProcess = async (
    articlesFile,
    outputFile
  ) => {
    processing.value = true;
    addLog('Executing process: ARTICLE_INDEX_TO_WIKIJS');
    try {

      if (language.value === 'en') {
        const { index, items } = await readIndexFileFromTSV(articlesFile);
        await writeIndexFileToWikijs(outputFile, index);
      } else {
        const articlesFileEN = articlesFile
          .replace(`articles-${language.value}`, 'articles-en');
        let { index, items } = await readIndexFileFromTSV(articlesFileEN);
        await readIndexFileFromTSV(articlesFile, index, items);
        await writeIndexFileToWikijs(outputFile, index);
      }

      addSuccess('Process successful: ARTICLE_INDEX_TO_WIKIJS');
    } catch (errors) {
      addErrors(errors);
    } finally {
      processing.value = false;
    }
  };

  return { executeProcess };
};