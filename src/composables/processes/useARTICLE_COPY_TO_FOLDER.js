import { useReadIndexFileFromTSV } from '../articles/useReadIndexFileFromTSV.js';
import { useCopyArticles } from '../articles/useCopyArticles.js';

/**
 * Copy files to folder from an index
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {Ref<boolean>} processing Processing flag.
 * @param {function} addLog Function to add log messages.
 * @param {function} addErrors Function to add error messages.
 * @param {function} addSuccess Function to add success messages.
 */
export const useARTICLE_COPY_TO_FOLDER = (
  language,
  uiLanguage,
  processing,
  addLog,
  addErrors,
  addSuccess
) => {
  const { readIndexFileFromTSV } = useReadIndexFileFromTSV(language, uiLanguage,
    addLog);
  const { copyArticles } = useCopyArticles(language, uiLanguage, addLog);

  /**
   * Reads a Articles Index File (TSV)
   * Copy the articles to an existing folder
   * @param {string} articlesFile File with index of articles in TSV format.
   * @param {string} urantiapediaFolder Folder with content of Urantiapedia.
   * @param {string} outputFolder Output folder.
   */
  const executeProcess = async (
    articlesFile,
    urantiapediaFolder,
    outputFolder
  ) => {
    processing.value = true;
    addLog('Executing process: ARTICLE_COPY_TO_FOLDER');
    try {
      if (language.value === 'en') {
        const { index } = readIndexFileFromTSV(articlesFile);
        await copyArticles(urantiapediaFolder, outputFolder, index);
      } else {
        const articlesFileEN = articlesFile
          .replace(`articles-${language.value}`, 'articles-en');
        let { index, items } = await readIndexFileFromTSV(articlesFileEN);
        await readIndexFileFromTSV(articlesFile, index, items);
        await copyArticles(urantiapediaFolder, outputFolder, index);
      }

      addSuccess('Process successful: ARTICLE_COPY_TO_FOLDER');
    } catch (errors) {
      addErrors(errors);
    } finally {
      processing.value = false;
    }
  };

  return { executeProcess };
};