import { tr, getError, reflectPromise } from 'src/core/utils.js';

import path from 'path';

/**
 * Writes the current index read to Wiki.js HTML format.
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 */
export const useCreateBlankArticles = (
  language,
  uiLanguage,
  addLog
) => {

  /**
   * Creates a folder if not exists.
   * @param {string} folder Folder path.
   */
  const createFolderIfNotExists = async (folder) => {
    try {
      addLog(`Creating folder: ${folder}`);
      const exists = await window.NodeAPI.exists(folder);
      if (!exists) {
        await window.NodeAPI.createFolder(folder);
      }
    } catch (er) {
      throw getError(uiLanguage.value, 'folder_no_access', folder);
    }
  };

  /**
   * Creates a blank file.
   * @param {Object} d Data for filling the file.
   * @param {string} name Isuue name.
   * @param {string} publisher Publisher.
   * @param {string} link Issue link.
   * @param {string[]} tags Extra tags.
   */
  const createBlankFile = async (d, name, publisher, link, tags) => {
    addLog(`Creating blank file: ${d.path}`);
    try {
      const date = new Date();
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const datestr = `${year}-${month}-${day}` +
        `T${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}Z`;
      const cls = 'v-card v-sheet theme--light grey lighten-3 px-2';
      const author = d.author != '' ? `© ${d.year} ${d.author}<br>` : '';
      const writeReferences = link != '';
  
      let md = `---\r\n` +
        `title: "${d.title}"\r\n` +
        `description: \r\n` +
        `published: true\r\n` +
        `date: ${datestr}\r\n` +
        `tags: ${[...d.tags, ...tags, 'article'].join(', ')}\r\n` +
        `editor: markdown\r\n` +
        `dateCreated: ${datestr}\r\n` +
        `---\r\n` +
        `\r\n` +
        `<p class="${cls}">${author}© ${d.year} ${publisher}</p>` +
        (
          writeReferences ?
            `\r\n\r\n\r\n\r\n\r\n` +
            `## ${tr('topic_references', language.value)}\r\n\r\n` +
            `- [${name}](${link})\r\n\r\n`
            : '\r\n\r\n'
        );
      
      await window.NodeAPI.writeFile(d.path, md);
      
    } catch (err) {
      throw err;
    }
  };

  /**
   * Creates blank articles (only with header) using the current index.
   * @param {string} dirPath Output folder.
   * @param {Object} index Object with index of articles.
   */
  const createBlankArticles = async (dirPath, index) => {
    try {
      addLog(`Creating blank files in folder: ${filePath}`);
      const baseName = path.basename(dirPath);
      const exists = await window.NodeAPI.exists(dirPath);
      if (!exists) {
        throw getError(uiLanguage.value, 'folder_no_access', baseName);
      }

      const data = [];
      const issues = [];
      const [title, publisher] = index.title.split('|');
      
      index.volumes.forEach(volume => {
        volume.issues.forEach(issue => issues.push(issue));
      });
      index.issues.forEach(issue => issues.push(issue));
      issues.forEach(issue => {
        const reYear = [...issue.title.matchAll(/(\d{4})/g)];
        const year = (reYear.length > 0 ? reYear[0][0] : '');
        issue.articles.forEach(article => {
          const m = `/${language.value}/article`;
          const subpath = article.path.replace(m, '');
          const filepath = path.join(dirPath, subpath + '.md');
          data.push({
            path: filepath,
            title: article.title,
            author: article.author,
            tags: article.tags,
            year
          });
        });
      });

      const regex = /[áéíóúàèìòùäëïöüâêîôû ÁÉÍÓÚÀÈÌÒÙÄËÏÖÜÂÊÎÔÛ\-]/i;
      const errs = [];
      const promisesFolder = [];
      data.forEach(d => {
        const folder = path.dirname(d.path);
        const file = path.basename(d.path);
        if (regex.test(folder) || regex.test(file)) {
          errs.push(getError(uiLanguage.value, 'folder_name_invalid', d.path));
          return;
        }
        const promise = createFolderIfNotExists(folder);
        promisesFolder.push(reflectPromise(promise));
      });
      const resultsFolder = await Promise.all(promisesFolder);
      const errsFolder = resultsFolder.filter(r => r.error).map(r => r.error);
      errs.push(...errsFolder);
      if (errs.length > 0) {
        throw errs;
      }

      const tags = index.tags.filter(t => {
        return (t.toLowerCase() != 'index' && t.toLowerCase() != 'article');
      }).map(t => t.trim());
      const name = title.replace('Index of ', '').replace(' articles', '');

      const promisesWrite = data.map(d => {
        const promise = createBlankFile(d, name, publisher, index.link, tags);
        return reflectPromise(promise);
      });
      const resultsWrite = await Promise.all(promisesWrite);
      const errsWrite = resultsWrite.filter(r => r.error).map(r => r.error);
      if (errsWrite.length > 0) {
        throw errsWrite;
      }
    } catch (err) {
      throw err;
    }
  };

  return {
    createBlankArticles
  };
};