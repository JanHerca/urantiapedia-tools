import { useReadIndexFileFromTSV } from '../articles/useReadIndexFileFromTSV.js';
import { useCreateBlankArticles } from '../articles/useCreateBlankArticles.js';

/**
 * Create blank articles from an index
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {Ref<boolean>} processing Processing flag.
 * @param {function} addLog Function to add log messages.
 * @param {function} addErrors Function to add error messages.
 * @param {function} addSuccess Function to add success messages.
 */
export const useARTICLE_CREATE_BLANK_FROM_LIST = (
  language,
  uiLanguage,
  processing,
  addLog,
  addErrors,
  addSuccess
) => {
  const { readIndexFileFromTSV } = useReadIndexFileFromTSV(language, uiLanguage,
    addLog);
  const { createBlankArticles } = useCreateBlankArticles(language, uiLanguage, 
    addLog);

  /**
   * Reads Articles Index File (TSV)
   * Creates folders and files with blank content (only header)
   * @param {string} articlesFile File with index of articles in TSV format.
   * @param {string} outputFolder Output folder.
   */
  const executeProcess = async (
    articlesFile,
    outputFolder
  ) => {
    processing.value = true;
    addLog('Executing process: ARTICLE_CREATE_BLANK_FROM_LIST');
    try {
      if (language.value === 'en') {
        const { index, items } = await readIndexFileFromTSV(articlesFile);
        await createBlankArticles(outputFolder, index);
      } else {
        const articlesFileEN = articlesFile
          .replace(`articles-${language.value}`, 'articles-en');
        let { index, items } = await readIndexFileFromTSV(articlesFileEN);
        await readIndexFileFromTSV(articlesFile, index, items);
        await createBlankArticles(outputFolder, index);
      }

      addSuccess('Process successful: ARTICLE_CREATE_BLANK_FROM_LIST');
    } catch (errors) {
      addErrors(errors);
    } finally {
      processing.value = false;
    }
  };

  return { executeProcess };
};