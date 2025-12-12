import { tr, getError, reflectPromise } from 'src/core/utils.js';
import { getWikijsNavLinks, getWikijsHeader } from 'src/core/wikijs.js';

import path from 'path';

/**
 * Writes the current index read to Wiki.js HTML format.
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 */
export const useCreateBlankFiles = (
  language,
  uiLanguage,
  addLog
) => {

  /**
   * Creates blank files (only with header) using the current book info.
   * @param {string} dirPath Output folder.
   * @return {Promise}
   */
  const createBlankFiles = async (dirPath) => {
    try {
      addLog(`Creating blank files of a book: ${dirPath}`);

      const lan = language.value;
      const exists = await window.NodeAPI.exists(dirPath);
      if (!exists) {
        throw getError(uiLanguage.value, 'folder_no_access', dirPath);
      }

      const { title, folder_name, shelf_name, tag, cover, index, links } = book;
      const folder = path.join(dirPath, folder_name);
      const indexTitle = tr('bookIndexName', lan);
      const linksText = tr('topic_external_links', lan);

      const existsFolder = await window.NodeAPI.exists(folder);
      if (!existsFolder) {
        await window.NodeAPI.createFolder(folder);
      }

      const tags = tag.split(',').map(n => n.trim());
      const subindex = index.filter(i => i[1].indexOf('#') === -1);

      const promises = subindex.reduce((acc, cur, i, arr) => {
        const isLast = i === arr.length - 1;
        if (cur[1].indexOf('#') === -1) {
          const filePath = path.join(folder, cur[1] + '.md');
          const indexPath = `/${lan}/book/${shelf_name}/${folder_name}`;
          const navLinks = getWikijsNavLinks({
            prevTitle: i === 0 ? null : arr[i - 1][0].trim(),
            prevPath: i === 0 ? null : `${indexPath}/${arr[i - 1][1].trim()}`,
            nextTitle: isLast ? null : arr[i + 1][0].trim(),
            nextPath: isLast ? null : `${indexPath}/${arr[i + 1][1].trim()}`,
            indexPath,
            fullIndexTitle: tr('bookTitlePage', lan)
          });
          const md =
            getWikijsHeader(cur[0].trim(), [...tags, 'book'], title, 'markdown') +
            `\r\n` +
            navLinks +
            `\r\n` +
            `\r\n` +
            `\r\n` +
            navLinks;

          const promise = window.NodeAPI.writeFile(filePath, md);
          acc.push(reflectPromise(promise));
        }
        return acc;
      }, []);

      promises.push(...[null].map(n => {
        const filePath = path.join(dirPath, `${folder_name}.md`);
        const indexContent = index.map(i => {
          const ipath = `/${lan}/book/${shelf_name}/${folder_name}/${i[1]}`;
          const link = i[1] === '#' ? i[0].trim() : `[${i[0].trim()}](${ipath})`;
          const tabs = i[0].startsWith('\t') ? i[0].match(/\t/g).join('') : '';
          return `${tabs}- ${link}\r\n`;
        }).join('');
        const linksContent = links.map(l => `- ${l}\r\n`).join('');
        let md =
          getWikijsHeader(title, [...tags, 'book'], undefined, 'markdown') +
          `\r\n` +
          cover +
          `\r\n` +
          `## ${indexTitle}\r\n` +
          `\r\n` +
          indexContent +
          `\r\n` +
          `## ${linksText}\r\n` +
          `\r\n` +
          linksContent;

        const promise = window.NodeAPI.writeFile(filePath, md);
        return reflectPromise(promise);
      }));

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
    createBlankFiles
  };
};