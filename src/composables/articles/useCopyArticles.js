import path from 'path';

/**
 * Writes the current index read to Wiki.js HTML format.
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 */
export const useCopyArticles = (
  language,
  uiLanguage,
  addLog
) => {

  /**
   * Copies an article.
   * @param {string} urantiapediaFolder Folder with content of Urantiapedia.
   * @param {string} outputFolder Output folder.
   * @param {Object} article Object with one article.
   */
  const copyArticle = async (urantiapediaFolder, outputFolder, article) => {
    try {
      //Both articles and frontpages of books are considered
      const m = `/${language.value}/article/`;
      const m2 = `/${language.value}/book/`;
      const subpath = article.path.replace(m, '').replace(m2, '');
      const pathParts = subpath.split('/');
      const authorFolder = pathParts.length > 1 
        ? path.join(outputFolder, pathParts[0]) 
        : null;
      const bookFolder = pathParts.length > 2 
        ? path.join(outputFolder, pathParts[0], pathParts[1]) 
        : null;
      const sourcePath = path.join(urantiapediaFolder, article.path + '.md');
      const sourcePath2 = path.join(urantiapediaFolder, article.path + '.html');
      const targetPath = path.join(outputFolder, subpath + '.md');
      const targetPath2 = path.join(outputFolder, subpath + '.html');
  
      //Articles are only in one level structure so ensure
      // that folder exists and if not create
      //Books are in two levels, so the same
      let existsAuthorFolder = false;
      let existsBookFolder = false;
      if (authorFolder) {
        existsAuthorFolder = await window.NodeAPI.exists(authorFolder);
        if (!existsAuthorFolder) {
          await window.NodeAPI.createFolder(authorFolder);
        }
      }
      existsAuthorFolder = await window.NodeAPI.exists(authorFolder);
      if (existsAuthorFolder && bookFolder) {
        existsBookFolder = await window.NodeAPI.exists(bookFolder);
        if (!existsBookFolder) {
          await window.NodeAPI.createFolder(bookFolder);
        }
      }
      const existsSourceFolder = await window.NodeAPI.exists(sourcePath);
      if (existsSourceFolder) {
        addLog(`Copying article from: ${sourcePath} >> to: ${targetPath}`);
        await window.NodeAPI.copyFile(sourcePath, targetPath)
      }
      const existsSourceFolder2 = await window.NodeAPI.exists(sourcePath2);
      if (existsSourceFolder2) {
        addLog(`Copying article from: ${sourcePath2} >> to: ${targetPath2}`);
        await window.NodeAPI.copyFile(sourcePath2, targetPath2)
      }
    } catch (err) {
      throw err;
    }
  };

  /**
   * Copies articles using current index to the given output folder.
   * This is useful for example to create a copy in which test translations.
   * @param {string} urantiapediaFolder Folder with content of Urantiapedia.
   * @param {string} outputFolder Output folder.
   * @param {Object} index Object with the index of articles.
   */
  const copyArticles = async (urantiapediaFolder, outputFolder, index) => {
    try {
      addLog(`Copying articles to folder: ${outputFolder}`);
      
      const baseName = path.basename(outputFolder);
      const exists = await window.NodeAPI.exists(outputFolder);
      if (!exists) {
        throw getError(uiLanguage.value, 'folder_no_access', baseName);
      }
      const issues = [];
      const promises = [];
      index.volumes.forEach(volume => {
        volume.issues.forEach(issue => issues.push(issue));
      });
      index.issues.forEach(issue => issues.push(issue));

      issues.forEach(issue => {
        issue.articles.forEach(article => {
          const promise = copyArticle(urantiapediaFolder, outputFolder, article);
          promises.push(promise);
        });
      });
      
      await Promise.all(promises);
    } catch (err) {
      throw err;
    }

  };

  return {
    copyArticles
  };
};