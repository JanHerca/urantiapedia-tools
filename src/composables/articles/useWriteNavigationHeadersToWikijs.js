import { getError } from 'src/core/utils.js';
import { getWikijsNavLinks } from 'src/core/wikijs.js';

import path from 'path';

/**
 * Writes navigation headers of articles in Wiki.js format. 
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 */
export const useWriteNavigationHeadersToWikijs = (
  language,
  uiLanguage,
  addLog
) => {

  /**
   * Writes the navigation header of an article in Wiki.js format.
   * @param {string} filePath File path.
   * @param {Object} issue Object with issue data.
   * @param {Object} article Object with the article data.
   * @param {number} i Index of the article.
   */
  const writeNavigationHeaderToWikijs = async (filePath, issue, article, i) => {
    try {
      addLog(`Reading article: ${filePath}`);
      const buf = await window.NodeAPI.readFile(filePath);
      lines = buf.toString().split('\n');

      const hStart = '<figure class="table chapter-navigator">';

      if (lines.find(line => line.startsWith(hStart))) {
        return null;
      }
      const index = lines.findIndex(line => line.startsWith('<p class="v-card'));
      if (index === -1) {
        throw getError(uiLanguage.value, 'article_has_no_copyright_card',
          article.path);
      }
      const { title, path, articles } = issue;
      const prev = (i === 0 ? null : articles[i - 1]);
      const next = (i === articles.length - 1 ? null : articles[i + 1]);
      const header = getWikijsNavLinks({
        prevTitle: prev ? prev.title : undefined,
        prevPath: prev ? prev.path : undefined,
        nextTitle: next ? next.title : undefined,
        nextPath: next ? next.path : undefined,
        fullIndexTitle: title,
        indexPath: path
      });
      const hasNotes = (lines.findIndex(line => line.startsWith('[^1]:')) != -1);
      let index2 = -1;
      lines.forEach((line, j) => {
        if (line.startsWith('## ')) {
          index2 = j;
        }
      });
      index2 = (hasNotes && index2 != -1 ? index2 : -1);
      const n1 = lines.slice(0, index + 1);
      const n2 = header.split('\n');
      const n3 = (index2 != -1 ?
        lines.slice(index + 1, index2) :
        lines.slice(index + 1));
      const n4 = ['', ...header.split('\n')];
      const n5 = (index2 != -1 ? lines.slice(index2) : []);
      const newlines = [...n1, ...n2, ...n3, ...n4, ...n5];

      const content = newlines.join('\n');

      addLog(`Writing index: ${filePath}`);
      await window.NodeAPI.writeFile(filePath, content);

    } catch (err) {
      throw err;
    }
  };

  /**
   * Writes navigation headers of articles in Wiki.js format. 
   * Articles must be in Markdown format, and if a header is already 
   * detected, it is not added.
   * @param {string} dirPath Output folder.
   * @param {Object} index Object with the index.
   */
  const writeNavigationHeadersToWikijs = async (dirPath, index) => {
    try {
      addLog('Looping through issues/articles')
      const issues = [];
      if (index.issues.length > 0) {
        index.issues.forEach(issue => issues.push(issue));
      } else if (index.volumes.length > 0) {
        index.volumes.forEach(volume => {
          volume.issues.forEach(issue => issues.push(issue));
        });
      }
      if (issues.length == 0) {
        throw getError(uiLanguage.value, 'article_index_no_issues');
      }

      const promises = [];
      issues.forEach(issue => {
        issue.articles.forEach((article, i) => {
          const apath = article.path
            .replace(`/${language.value}/article/`, '')
            .split('/');
          const filePath = path.join(dirPath, ...apath) + '.md';
          const promise = writeNavigationHeaderToWikijs(filePath, issue, article, i);
          promises.push(reflectPromise(promise));
        });
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
    writeNavigationHeadersToWikijs
  };
};