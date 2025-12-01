import { useReadFolder } from 'src/composables/useReadFolder.js';
import { strformat, getError, reflectPromise } from 'src/core/utils.js';

import path from 'path';

/**
 * Reads `The Urantia Book` from a folder with files in JSON format.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 */
export const useReadFromTXT = (
  uiLanguage,
  addLog
) => {
  const { readFolder } = useReadFolder(uiLanguage, addLog);

  /**
   * Extracts content and references from a text.
   * @param {string} text Text.
   * @return {Array.<string>}
   */
  const extractTextRefs = (text) => {
    const refRegEx = /\(\d+[:.,\d-]*\)(?:\s+\(\d+[:.,\d-]*\))*/g;
    const arr = [...text.matchAll(refRegEx)];
    const refs = arr.length === 0
      ? []
      : arr[0][0].split(/[()]/g).filter(i => i.trim() != '');
    const content = text.replace(refRegEx, '').trim();
    return [content, refs];
  };

  /**
   * Reads a TXT file from Topic Index.
   * @param {string} filePath TXT file path from Topic Index.
   * @param {string} category Category of topics from Topic Index that must
   * be read. Those out the category are ignored. To read all use 'ALL' or
   * null and to read none 'NONE'.
   * @param {string} letter Letter in lowercase of topics from Topic Index
   * that must be read. Those out of the letter are ignored. To read all 
   * use `ALL` or null.
   * @return {Promise} Returns an array of topics objects in the file or null
   * if filter is not passed.
   */
  const readFileFromTXT = async (filePath, category = 'ALL', letter = 'ALL') => {
    addLog(`Reading file: ${filePath}`);
    try {
      const baseName = path.basename(filePath);
      if (letter != 'ALL' && !baseName.startsWith(letter)) {
        return null;
      }
      if (category === 'NONE') {
        return null;
      }

      const captionPattern = '\t<figcaption>{0}</figcaption>\r\n';
      const imgPattern =
        '<figure id="Figure_{0}" class="image urantiapedia{1}">\r\n' +
        '\t<img src="{2}">\r\n' +
        '{3}' +
        '</figure>\r\n';

      const buf = await window.NodeAPI.readFile(filePath);
      const lines = buf.toString().split('\n');

      const topics = [];
      const errors = [];
      let current = null;
      let topicline = null;
      lines.forEach((line, i) => {
        let data, text, refs, seeAlso, level, groups, img;
        const tline = line.trim();
        const err = getError(uiLanguage.value, 'topic_err', baseName, i + 1, tline);
        if (line.startsWith('<')) {
          return;
        }
        level = line.split(/\t/g).findIndex(a => a != '');
        data = tline.split('|').map(i => i.trim());

        if (
          current &&
          tline === ''
        ) {
          //End line of an entry
          if (category === 'ALL' || category === current.type) {
            topics.push(current);
          }
          current = null;
        } else if (
          current &&
          tline.length > 0 &&
          tline.startsWith('>')
        ) {
          //Line of entry with a link
          if (!current.externalLinks) {
            current.externalLinks = [];
          }
          current.externalLinks.push(tline.substring(1).trim());
        } else if (
          current &&
          tline.length > 0 &&
          tline.startsWith('[')
        ) {
          //Line with an image
          groups = [...tline.matchAll(/\[(.+)\]|\((.+)\)|{(.+)}/g)];
          if (groups.length < 2) {
            errors.push(err);
          } else {
            img = groups
              .reduce((ac, cur) => {
                if (cur[1]) ac[0] = cur[1];
                if (cur[2]) ac[1] = cur[2];
                if (cur[3]) ac[2] = cur[3];
                return ac;
              }, [null, null, null]);

            topicline = {
              text: strformat(imgPattern, i + 1,
                (img[2] ? ' ' + img[2] : ''), img[1],
                (img[0] ? strformat(captionPattern, img[0]) : '')),
              level: level,
              fileline: i + 1,
              seeAlso: [],
              refs: []
            };
            current.lines.push(topicline);
          }

        } else if (
          current &&
          tline.length > 0
        ) {
          //Line of entry without a link or image (any other line)
          topicline = {
            text: '',
            level: level,
            fileline: i + 1
          };

          if (data.length === 0) {
            errors.push(err);
          } else if (data.length === 1) {
            [text, refs] = extractTextRefs(data[0]);

            if (text === "") {
              errors.push(err);
            } else {
              topicline.text = text;
              topicline.seeAlso = [];
              topicline.refs = refs;
            }
            current.lines.push(topicline);
          } else if (data.length === 2) {
            [text, refs] = extractTextRefs(data[0]);
            if (text === "") {
              errors.push(err);
            } else {
              topicline.text = text;
              topicline.seeAlso = data[1].split(';')
                .filter(i => i.trim() != '')
                .map(s => s.trim());
              topicline.refs = refs;
            }
            current.lines.push(topicline);
          } else {
            errors.push(err);
          }
        } else if (
          !current &&
          tline.length > 0
        ) {
          //First line of an entry
          if (data.length === 0) {
            errors.push(err);
          } else if (data.length === 5) {
            if (
              data[1].startsWith('(') &&
              data[1].endsWith(')')
            ) {
              refs = data[1].split(/[()]/g)
                .filter(i => i.replace(/\s+/, '') != '');
            }
            seeAlso = data[2].split(';')
              .filter(i => i.trim() != '')
              .map(s => s.trim());
            current = {
              name: data[0].split(';')[0].trim(),
              altnames: data[0].split(';')
                .slice(1).map(a => a.trim()),
              lines: [],
              type: (data[3] === '' ? 'OTHER' : data[3]),
              revised: (data[4] === '' ? false : true),
              sorting: baseName + ':' +
                (i + 1).toString().padStart(5, '0'),
              filename: baseName,
              fileline: i + 1,
              seeAlso: seeAlso
            };
            current.refs = (refs ? refs : []);
            current.isRedirect = ((!lines[i + 1] ||
              lines[i + 1].trim().length === 0) &&
              current.refs.length === 0);
          }
        }

        if (current && i === lines.length - 1) {
          if (category === 'ALL' || category === current.type) {
            topics.push(current);
          }
          current = null;
        }
      });

      if (errors.length > 0) {
        throw errors;
      }

      return topics;

    } catch (err) {
      throw err;
    }
  };

  /**
   * Reads Topic Index files in TXT format from a folder.
   * @param {string} dirPath Input folder.
   * @param {string} category Category of topics from Topic Index that must
   * be read. Those out the category are ignored. To read all use `ALL`.
   * @param {string} letter Letter of topics from Topic Index that must be
   * read. Those out of the letter are ignored. To read all use `ALL` or null.
   * @return {Promise<Object[]>} Returns array of topics objects.
   */
  const readFromTXT = async (dirPath, category = 'ALL', letter = 'ALL') => {
    addLog(`Reading Topic _Index folder: ${dirPath}`);
    try {
      const files = await readFolder(dirPath, '.txt');

      const promises = files.map(file => {
        const filePath = path.join(dirPath, file);
        return reflectPromise(readFileFromTXT(filePath, category, letter));
      });

      const results = await Promise.all(promises);
      const errors = results.filter(r => r.error).map(r => r.error);
      if (errors.length > 0) {
        throw errors;
      }
      return results.map(r => r.value).flat();
    } catch (err) {
      throw err;
    }
  };

  return {
    readFromTXT
  };

};