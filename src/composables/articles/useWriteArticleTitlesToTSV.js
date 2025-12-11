import { reflectPromise } from 'src/core/utils.js';

import path from 'path';

/**
 * Writes the titles of the articles to the provided TSV file.
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 */
export const useWriteArticleTitlesToTSV = (
  language,
  uiLanguage,
  addLog
) => {
  /**
   * Returns the title of one article in Wiki.js format.
   * @param {string} filePath Article path.
   */
  const readArticleTitleFromWikijs = async (filePath) => {
    let lines;
    try {
        addLog(`Reading article: ${filePath}`);
        const buf = await window.NodeAPI.readFile(filePath);
        lines = buf.toString().split('\n');
    } catch (err) {
      throw new Error(`No file found in ${filePath}`)
    }
    try {
      let isMetadata = false;
      let title = undefined;
      lines.forEach(line => {
        if (title) return;
        if (!isMetadata && line.startsWith('---')) {
          isMetadata = true;
        }
        if (isMetadata && line.startsWith('title:')) {
          title = line.replace('title:', '').trim().replace(/"/g, '');
        }
      });
      if (!title) {
        throw new Error(`No title found in ${filePath}`);
      }
      return title;
    } catch (err) {
      throw err;
    }
  };

  /**
   * Reads some articles in Wiki.js format and collects the titles.
   * @param {string[]} filePaths Array of article paths.
   */
  const readArticleTitlesFromWikijs = (filePaths) => {
    try {
      const promises = filePaths
        .map(filePath => reflectPromise(readArticleTitleFromWikijs(filePath)));
      return Promise.all(promises);
    } catch (err) {
      throw err;
    }
  };

  /**
   * Writes the titles of the articles to the provided TSV file.
   * Reads all the existing articles and extracts titles from them, and then
   * writes the titles in the TSV file.
   * @param {string} filePath Output file.
   * @param {string} outputFolder Output folder.
   * @param {Object} index Object with the index.
   */
  const writeArticleTitlesToTSV = async (filePath, outputFolder, index) => {
    try {
      addLog(`Creating new index`);
      let newIndex = [{ title: index.title, title2: "" }];
  
      const addIssue = issue => {
        newIndex.push({ title: issue.title, title2: "" });
        issue.articles.forEach(article => {
          const { title, path: filepath } = article;
          const fp = filepath
            ? path.join(outputFolder, filepath.replace(`${path.sep}en${path.sep}`,
              `${path.sep}${language.value}${path.sep}`) + '.md')
            : undefined;
          newIndex.push({ title, filePath: fp, title2: "" });
        });
      }
  
      index.volumes.forEach(volume => {
        newIndex.push({ title: volume.title, title2: "" });
        volume.issues.forEach(addIssue);
      });
      index.issues.forEach(addIssue);
  
      const paths = newIndex.filter(item => item.filePath != undefined);
      const filePaths = paths.map(item => item.filePath);
  
      const results = await readArticleTitlesFromWikijs(filePaths);
      
      const titles = results.map(r => r.value);
      paths.forEach((item, i) => item.title2 = titles[i]);
      
      const lines = newIndex.map(({ title, title2 }) => `${title}\t${title2}`);
      
      addLog(`Writing index: ${filePath}`);
      await window.NodeAPI.writeFile(filePath, lines.join('\n'));
      
      const errors = results.filter(r => r.error).map(r => r.error);
      if (errors.length > 0) {
        throw errors;
      }

    } catch (err) {
      throw err;
    }
  };

  return {
    writeArticleTitlesToTSV
  };
};