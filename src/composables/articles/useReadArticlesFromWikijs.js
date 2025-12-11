import { reflectPromise, getError } from 'src/core/utils.js';

import { useGetFiles } from '../useGetFiles.js';

import path from 'path';

/**
 * Reads articles in Wiki.js format, collecting metadata of the articles,
 * anchor and link info, and cheking that links are ok.
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 */
export const useReadArticlesFromWikijs = (
  language,
  uiLanguage,
  addLog
) => {
  const { getFiles } = useGetFiles(uiLanguage, addLog);

  const reLink = new RegExp('<a id="([as]\\d+_\\d+)"><\\/a>\\[[^\\]]+\\]' + 
    `\\(\/${language.value}\/` +
    'The_Urantia_Book\/(\\d+)#p(\\d+)(?:_(\\d+))?\\)', 'g');
  const reCopy = new RegExp('© ([\\d-]+) ([^\\d<]+)', 'g');

  const publications = [
		'Innerface International',
		'Fellowship Herald', 
		'Mighty Messenger', 
		'The Urantian',
		'Luz y Vida',
		'Urantian News',
		'Urantia Foundation News Online',
		'NewsFlash',
		'Tidings',
		'Journal',
		'Spiritual Fellowship',
		'Study Group Herald',
		'The Arena',
		'6-0-6',
		'Reflectivite',
		'Le Lien',
		'La Lettre',
		'Urantia Association of Spain',
		'Fellowship'
	];

  /**
   * Processes one file.
   * @param {string} filePath File path.
   * @param {UrantiaBook} ubook Urantia Book.
   * @returns {Promise<Object | null>} The object with the article or null.
   */
  const processFile = async (filePath, ubook) => {
    try {
      addLog(`Reading file: ${filePath}`);

      const buf = await window.NodeAPI.readFile(filePath);
      const lines = buf.toString().split('\n');

      const url = `/${language.value}/article` +
        filePath.replace(dirPath, '').replace('.md', '').replace(/\\/g, '/');
      const article = {
        title: '',
        author: '',
        publication: '',
        year: '',
        path: filePath,
        url: url,
        refs: [],
        errors: []
      };
      let isMetadata = false;
      let ignore = false;
      lines.forEach(line => {
        if (ignore) {
          return;
        }
        const matches = [...line.matchAll(reLink)];
        const copys = [...line.matchAll(reCopy)];
        if (!isMetadata && line.startsWith('---')) {
          isMetadata = true;
        }
        if (isMetadata && line.startsWith('title:')) {
          article.title = line.replace('title:', '').trim().replace(/"/g, '');
        }
        if (isMetadata && line.startsWith('tags:')) {
          //Pages with bio of authors must be ignored
          if (line.startsWith('tags: author')) {
            ignore = true;
          }
          const pub = publications.find(p => {
            return line.toLowerCase().indexOf(p.toLowerCase()) != -1;
          });
          if (pub) {
            article.publication = pub;
          }
        }
        if (line.startsWith('<p class="v-card') && copys.length > 0) {
          if (copys[0].length > 2) {
            article.author = copys[0][2];
            article.year = copys[0][1];
          } else if (copys[0].length > 1) {
            article.year = copys[0][1];
          }
        }
        if (matches.length == 0) {
          return;
        }
        matches.forEach(m => {
          const ref = [m[2], m[3]];
          if (m[4]) {
            ref[2] = m[4];
          }
          article.refs.push({
            anchor: m[1],
            ref: ref
          });
          const strRef = ref.length === 2 
            ? `${ref[0]}:${ref[1]}` 
            : `${ref[0]}:${ref[1]}.${ref[2]}`;
          const ar = ubook.getArrayOfRefs([strRef]);
          if (!ar[0]) {
            article.errors.push(strRef);
          }
        });
      });
      return ignore ? null : article;
    } catch (err) {
      throw err;
    }
  };

  /**
   * Reads articles in Wiki.js format, collecting metadata of the articles,
   * anchor and link info, and cheking that links are ok.
   * @param {string} dirPath Output folder of articles.
   * @param {UrantiaBook} ubook Urantia Book.
   */
  const readArticlesFromWikijs = async (dirPath, ubook) => {
    try {
      addLog(`Reading articles in folder: ${dirPath}`);
      const files = await getFiles(dirPath);

      const formats = ['.md'];
      const ffiles = files.filter(file => formats.indexOf(path.extname(file)) != -1);
      if (ffiles.length === 0) {
        throw getError(uiLanguage.value, 'files_not_with_format', formats.toString());
      }

      const promises = ffiles.map(filePath => 
        reflectPromise(processFile(filePath, ubook)));

      const results = await Promise.all(promises);
      const errors = results.filter(r => r.error).map(r => r.error);
      if (errors.length > 0) {
        throw errors;
      }
      return results.filter(r => r.value != null).map(r => r.value);

    } catch (err) {
      throw err;
    }
  };

  return {
    readArticlesFromWikijs
  };
};