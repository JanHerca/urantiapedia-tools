import path from 'path';

/**
 * Reads the default location of the image catalog.
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 */
export const useRead = (
  language,
  uiLanguage,
  addLog
) => {

  /**
   * Read the file in english.
   * @param {string[]} lines Lines.
   * @returns {Object[]} Returns an array objects with images.
   */
  const readFileEN = (lines) => {
    let comment = false;
    let section = null;
    let header = [];
    const images = [];
    lines.forEach(line => {
      if (!comment && line.startsWith('<!--')) {
        comment = true;
      }
      if (!comment && line.startsWith('#')) {
        section = {
          path: line.replace(/#/g, '').trim(),
          list: []
        };
        images.push(section);
      }
      if (!comment && line.indexOf('|') != -1) {
        const values = line.trim()
          .replace(/^\||\|$/g, '')
          .split('|').map(v => v.trim());
        if (values[0] === 'ref') {
          header = values;
        } else if (
          section && values.length > 0 &&
          values[0] != 'ref' &&
          values[0].indexOf('---') === -1 &&
          header.length === values.length
        ) {
          const img = {};
          values.forEach((v, i) => img[header[i]] = v);
          section.list.push(img);
        }
      }
      if (comment && line.trim().endsWith('-->')) {
        comment = false;
      }
    });
    return images;
  };

  /**
   * Read the file in other language not english.
   * @param {string[]} lines Lines.
   * @param {Object[]} images Array of objects with images in English.
   * @returns {Object[]} Returns an array objects with images.
   */
  const readFileOther = (lines, images) => {
    let comment = false;
    const title2 = `title_${language.value}`;
    const text2 = `text_${language.value}`;
    lines.forEach(line => {
      if (!comment && line.startsWith('<!--')) {
        comment = true;
      }
      if (!comment && line.indexOf('|') != -1) {
        const values = line.trim()
          .replace(/^\||\|$/g, '')
          .split('|').map(v => v.trim());
        if (
          values.length == 2 &&
          values[0] != 'title' &&
          values[0].indexOf('---') === -1
        ) {
          images.forEach(s => {
            s.list
              .filter(i => i.text == values[0])
              .forEach(i => i[text2] = values[1]);
            s.list
              .filter(i => i.title == values[0])
              .forEach(i => i[title2] = values[1]);
          });
        }
      }
      if (comment && line.trim().endsWith('-->')) {
        comment = false;
      }
    });
    return images;
  };

  /**
   * Reads the default location of the image catalog.
   * @param {string} urantiapediaFolder Urantiapedia folder.
   * @returns {Promise} Promise that returns array of objects with image data.
   */
  const readImageCatalog = async (urantiapediaFolder) => {
    addLog(`Reading image catalog`);
    try {
      addLog(`Reading file: ${imagecatalogFileEN}`);
      const imagecatalogFileEN = path.join(urantiapediaFolder, 'input', 
        'markdown', 'en', 'image_catalog.md');
      const bufEN = await window.NodeAPI.readFile(imagecatalogFileEN);
      const linesEN = bufEN.toString().split('\n');
      const images = readFileEN(linesEN);

      if (language.value != 'en') {
        const imagecatalogFileCurrent = path.join(urantiapediaFolder, 'input', 
         'markdown', language.value, 'image_catalog.md');
        addLog(`Reading file: ${imagecatalogFileCurrent}`);
        const bufCurrent = await window.NodeAPI.readFile(imagecatalogFileCurrent);
        const linesCurrent = bufCurrent.toString().split('\n');
        const imagesCurrent = readFileOther(linesCurrent, images);
        return imagesCurrent;
      }
      
      return images;
    } catch (err) {
      throw err;
    }
  };

  return {
    readImageCatalog
  };
};
