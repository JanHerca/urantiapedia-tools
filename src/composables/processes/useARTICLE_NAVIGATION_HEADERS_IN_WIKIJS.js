import { useReadIndexFileFromTSV } from '../articles/useReadIndexFileFromTSV.js';
import { 
  useWriteNavigationHeadersToWikijs 
} from '../articles/useWriteNavigationHeadersToWikijs.js';

/**
 * Add a navigation header to articles in Wiki.js
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {Ref<boolean>} processing Processing flag.
 * @param {function} addLog Function to add log messages.
 * @param {function} addErrors Function to add error messages.
 * @param {function} addSuccess Function to add success messages.
 */
export const useARTICLE_NAVIGATION_HEADERS_IN_WIKIJS = (
  language,
  uiLanguage,
  processing,
  addLog,
  addErrors,
  addSuccess
) => {
  const { readIndexFileFromTSV } = useReadIndexFileFromTSV(language, uiLanguage,
    addLog);
  const { 
    writeNavigationHeadersToWikijs 
  } = useWriteNavigationHeadersToWikijs(language, uiLanguage, addLog);

  /**
   * Reads Articles Index File (TSV)
   * Writes navigation header/footer in Wiki.js
   * @param {string} articlesFile File with an index of articles in TSV format.
   * @param {string} outputFolder Output folder.
   */
  const executeProcess = async (
    articlesFile,
    outputFolder
  ) => {
    processing.value = true;
    addLog('Executing process: ARTICLE_NAVIGATION_HEADERS_IN_WIKIJS');
    try {

      if (language.value === 'en') {
        const { index, items } = await readIndexFileFromTSV(articlesFile);
        await writeNavigationHeadersToWikijs(outputFolder, index);
      } else {
        const articlesFileEN = articlesFile
          .replace(`articles-${language.value}`, 'articles-en');
        let { index, items } = await readIndexFileFromTSV(articlesFileEN);
        await readIndexFileFromTSV(articlesFile, index, items);
        await writeNavigationHeadersToWikijs(outputFolder, index);
      }

      addSuccess('Process successful: ARTICLE_NAVIGATION_HEADERS_IN_WIKIJS');
    } catch (errors) {
      addErrors(errors);
    } finally {
      processing.value = false;
    }
  };

  return { executeProcess };
};