import { useReadIndexFileFromTSV } from '../articles/useReadIndexFileFromTSV.js';
import { useWriteArticleTitlesToTSV } from '../articles/useWriteArticleTitlesToTSV.js';

/**
 * Add the translation for an index from existing articles (TSV out file required)
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {Ref<boolean>} processing Processing flag.
 * @param {function} addLog Function to add log messages.
 * @param {function} addErrors Function to add error messages.
 * @param {function} addSuccess Function to add success messages.
 */
export const useARTICLE_INDEX_ADD_FROM_TRANSLATION = (
  language,
  uiLanguage,
  processing,
  addLog,
  addErrors,
  addSuccess
) => {
  const { readIndexFileFromTSV } = useReadIndexFileFromTSV(language, uiLanguage,
    addLog);
  const { writeArticleTitlesToTSV } = useWriteArticleTitlesToTSV(language, uiLanguage,
    addLog);

  /**
   * Reads Articles Index File (TSV) in English 
   * Reads all articles files in selected lan and extracts titles 
   * Writes Articles Index File (TSV) in selected lan
   * @param {string} articlesFile File with an index of articles in TSV format.
   * @param {string} outputFolder Output folder.
   */
  const executeProcess = async (
    articlesFile,
    outputFolder
  ) => {
    processing.value = true;
    addLog('Executing process: ARTICLE_INDEX_ADD_FROM_TRANSLATION');
    try {

      if (language.value != 'en') {
        const articlesFileEN = articlesFile
          .replace(`articles-${language.value}`, 'articles-en');
        const { index, items } = await readIndexFileFromTSV(articlesFileEN);
        await readIndexFileFromTSV(articlesFile, index, items);
        await writeArticleTitlesToTSV(articlesFile, outputFolder, index);
      }

      addSuccess('Process successful: ARTICLE_INDEX_ADD_FROM_TRANSLATION');
    } catch (errors) {
      addErrors(errors);
    } finally {
      processing.value = false;
    }
  };

  return { executeProcess };
};