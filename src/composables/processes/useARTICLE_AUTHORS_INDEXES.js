import { useReadIndexFileFromTSV } from '../articles/useReadIndexFileFromTSV.js';
import { useWriteAuthorsIndex } from '../articles/useWriteAuthorsIndex.js';

import { useGetFiles } from '../useGetFiles.js';
import { useGetFolders } from '../useGetFolders.js';

import path from 'path';

/**
 * Create a file with indexes by author
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {Ref<boolean>} processing Processing flag.
 * @param {function} addLog Function to add log messages.
 * @param {function} addErrors Function to add error messages.
 * @param {function} addSuccess Function to add success messages.
 */
export const useARTICLE_AUTHORS_INDEXES = (
  language,
  uiLanguage,
  processing,
  addLog,
  addErrors,
  addSuccess
) => {
  const { getFiles } = useGetFiles(uiLanguage, addLog);
  const { getFolders } = useGetFolders(uiLanguage, addLog);
  const { readIndexFileFromTSV } = useReadIndexFileFromTSV(language, uiLanguage,
    addLog);
  const { writeAuthorsIndex } = useWriteAuthorsIndex(uiLanguage, addLog);

  /**
   * Returns an object with info required for creating indexes of authors.
   * Require to read an TSV index file previously.
   * @param {Object} index Object with index of articles.
   * @return {Object}
   */
  const getAuthorsIndex = (index) => {
    const index = {
      publication: Array.isArray(index.tags)
        ? index.tags.find(t => t != "Index" && t != "Article")
        : undefined,
      articles: []
    };

    const addIssue = issue => {
      issue.articles.forEach(article => {
        const { title, filepath } = article;
        index.articles.push({
          title,
          path: filepath,
          issue: issue.title
        });
      });
    };

    index.volumes.forEach(volume => volume.issues.forEach(addIssue));
    index.issues.forEach(addIssue);
    return index;
  };

  /**
   * Returns the list of author's relative paths.
   * @param {string} dirPath Articles path.
   * @return {Promise}
   */
  const getAuthorPaths = async (dirPath) => {
    const lan = language.value;
    const paths = await getFolders(dirPath);
    return paths.map(p => `/${lan}/article/${path.basename(p)}`);
  };

  /**
   * Reads all Articles Index Files (TSV)
   * Writes content by author
   * @param {string} indexesFolder Folder with all index of articles in TSV format.
   * @param {string} articlesFolder Folder with articles in Markdown format.
   * @param {string} outputFile Output file in Markdown format.
   */
  const executeProcess = async (
    indexesFolder,
    articlesFolder,
    outputFile
  ) => {
    processing.value = true;
    addLog('Executing process: ARTICLE_AUTHORS_INDEXES');
    try {
      const files = await getFiles(indexesFolder);
      const promises = files
        .filter(f => path.basename(f).startsWith('articles'))
        .map(f => readIndexFileFromTSV(f));
      const results = await Promise.all(promises);
      const errors = results.filter(r => r.error).map(r => r.error);
      if (errors.length > 0) {
        throw errors;
      }
      const indexes = results.filter(r => r.value != null).map(r => r.value);
      const authorIndexes = indexes.map(index => getAuthorsIndex(index));
      const authorPaths = await getAuthorPaths(articlesFolder);
      await writeAuthorsIndex(outputFile, authorIndexes, authorPaths)

      addSuccess('Process successful: ARTICLE_AUTHORS_INDEXES');
    } catch (errors) {
      addErrors(errors);
    } finally {
      processing.value = false;
    }
  };

  return { executeProcess };
};