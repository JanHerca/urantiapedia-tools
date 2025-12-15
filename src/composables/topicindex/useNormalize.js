import { useReadFolder } from '../useReadFolder.js';
import { reflectPromise } from 'src/core/utils.js';

import path from 'path';

/**
 * Normalizes a TXT file from Topic Index.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 */
export const useNormalize = (
  uiLanguage,
  addLog
) => {
  const { readFolder } = useReadFolder(uiLanguage, addLog);

  /**
   * Normalizes a TXT file from Topic Index.
   * @param {string} filePath TXT file from Topic Index.
   * @return {Promise}
   */
  const normalizeFile = async (filePath) => {
    addLog(`Reading file: ${filePath}`);
    try {
      const baseName = path.basename(filePath.replace(/\\/g, '/'));
      const lines = buf.toString().split('\n');
      const errors = [];
      let result = '';
      let nfilePath = filePath.replace('.txt', '_normalized.txt');

      let current = null;
      lines.forEach((line, i) => {
        let data, name, refs, seeAlso, type, ok;
        const tline = line.trim();
        if (line.startsWith('#') || (!current && tline === '')) {
          result += line;
        } else if (current && (tline === '' || i === lines.length - 1)) {
          result += line;
          current = null;
        } else if (current && tline.length > 0) {
          result += line;
        } else if (!current && tline.length > 0) {
          current = {};
          data = tline.split('|').map(i => i.trim());
  
          if (data.length === 0) {
            errors.push(new Error(`${baseName}, línea ${i}: ${tline}`));
          } else if (data.length === 5) {
            name = data[0];
            refs = data[1];
            seeAlso = data[2];
            type = data[3];
            ok = data[4];
            if ((name === '') ||
              (refs != '' && refs.indexOf('(') === -1) ||
              (seeAlso != '' && !seeAlso.startsWith('Ver ')) ||
              (type != '' && topicTypes.indexOf(type) === -1) ||
              (ok != '' && ok != 'OK')
            ) {
              errors.push(new Error(`${baseName}, línea ${i}: ${tline}`));
            }
            result += line;
          } else if (data.length > 1) {
            name = data[0];
            refs = data.find(d => d.startsWith('(')) || '';
            refs = (refs.length > 0 ? refs + ' ' : refs);
            seeAlso = data.find(d => d.startsWith('Ver ')) || '';
            seeAlso = (seeAlso.length > 0 ? seeAlso + ' ' : seeAlso);
            type = data.find(d => topicTypes.indexOf(d) != -1) || '';
            type = (type.length > 0 ? type + ' ' : type);
            ok = data.find(d => d === 'OK') || '';
            result += `${name} | ${refs}| ${seeAlso}| ${type}| ${ok}\r\n`;
          } else {
            result += tline + ' | | | | \r\n';
          }
        }
      });
  
      if (errors.length === 0) {
        await window.NodeAPI.writeFile(nfilePath, result);
      } else {
        throw errors;
      }
    } catch (err) {
      throw err;
    }

  };

  /**
   * Normalizes every TXT file from Topic Index inside a folder.
   * Normalization basically adds a '|' separator between info in each entry
   * to slice later the data.
   * @param {string} dirPath Input folder.
   */
  const normalize = async (dirPath) => {
    addLog(`Reading TopicIndex folder: ${dirPath}`);
    try {
      const files = await readFolder(dirPath, '.txt');

      const promises = files.map(file => {
        const filePath = path.join(dirPath, file);
        return reflectPromise(normalizeFile(filePath));
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
    normalize
  };
};