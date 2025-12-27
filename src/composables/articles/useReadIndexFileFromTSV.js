import { tr, getError, autoCorrect } from 'src/core/utils.js';

import path from 'path';

/**
 * Reads articles index file from TSV file.
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 */
export const useReadIndexFileFromTSV = (
  language,
  uiLanguage,
  addLog
) => {
  /**
   * Reads articles index file from TSV file.
   * @param {string} filePath Input TSV file (a TXT file with tabs).
   * @param {?Object} index Optional object with index that will be modified
   * in place to add translations.
   * @param {?Object[]} items Optional array of objects with articles that will
   * be modified in place to add translations.
   * @return {Promise<Object>} Returns an object with index of articles and items.
   */
  const readIndexFileFromTSV = async (filePath, index, items) => {
    addLog(`Reading file: ${filePath}`);
    try {
      const lan = language.value;
      const baseName = path.basename(filePath.replace(/\\/g, '/'));
      const baseName2 = path.basename(filePath.replace(/\\/g, '/'), '.tsv');
      const indexPath = `/${lan}/index/${baseName2}`;
      const correction = {
        "\\.": "",
        " ": "_",
        "-": "_",
        "á": "a",
        "â": "a",
        "ä": "a",
        "é": "e",
        "è": "e",
        "í": "i",
        "ï": "i",
        "ó": "o",
        "ö": "o",
        "õ": "o",
        "ú": "u",
        "ñ": "n",
        "“": "",
        "”": "",
        "'": ""
      };
      const correction2 = {
        "[\\.,–\\(\\)—\\-/]": "",
        "( +)": "-"
      };

      const buf = await window.NodeAPI.readFile(filePath);
      const lines = buf.toString().split('\n');

      if (lines.length === 0) {
        throw getError(uiLanguage.value, 'article_index_no_lines');
      }
      if (!index) {
        index = {
          title: null,
          link: null,
          sourceText: "",
          tags: [],
          issues: [],
          volumes: [],
          language: language.value,
          notes: [],
          referencesText: 'References'
        };
      }
      if (!items) {
        items = [];
      }
      let currentVolume = null;
      let currentIssue = null;
      let currentGroup = null;
      let currentArticle = null;
      let issueAnchor = null;
      let inote = 0;
      const len = lines[0].split('\t').length;
      if (len != 2 && len != 4) {
        throw getError(uiLanguage.value, 'article_index_missing_data', 1);
      }
      const errIndex = lines.findIndex(line => {
        return (line.split('\t').length < len);
      });
      if (errIndex != -1) {
        throw getError(uiLanguage.value, 'article_index_missing_data', errIndex + 1);
      }
      index.referencesText = tr('topic_references', lan);
      if (len === 2) {
        lines.forEach((line, i) => {
          const [title, translation] = line.trim().split('\t');
          if (i === 0) {
            index.title = translation;
            return;
          }
          const volume = items.find(t => t.subtitle === title);
          if (volume) {
            volume.subtitle = translation;
            return;
          }
          const item = items.find(t => t.line === i);
          if (item) {
            const [ititle, note] = translation.split('|');
            item.title = ititle;
            if (note) {
              index.notes[inote] = note;
              inote++;
            }
            if (item.articles) {
              issueAnchor = autoCorrect(translation, correction2).toLowerCase();
              item.path = indexPath + '#' + issueAnchor;
            } else if (item.path) {
              item.path = item.path.replace('/en/', `/${lan}/`);
            }
            if (item.authorLink) {
              item.authorLink = item.authorLink.replace('/en/', `/${lan}/`);
            }
          }
        });
      } else {
        lines.forEach((line, i) => {
          const [title, filepath, author, tags] = line.split('\t').map(n => n.trim());
          const author2 = (author != '' && !author.startsWith('-') && !author.startsWith('is-') 
            ? autoCorrect(author, correction) 
            : '');
          const authorLink = (author ? `/${lan}/article/${author2}` : '');
          if (author === 'is-title') {
            index.title = title;
            index.link = filepath != '---' ? filepath : '';
            index.tags = ['Index', 'Article', ...(tags != '---' ? [tags] : [])];
            index.sourceText = tr('articlesSource', lan) + ': ';
          } else if (author === 'is-subtitle') {
            if (currentVolume) {
              currentVolume.subtitle = title;
            }
            if (currentIssue) {
              currentIssue.subtitle = title;
            }
          } else if (index.title && author === 'is-volume') {
            currentVolume = {
              title: title,
              line: i,
              issues: []
            };
            index.volumes.push(currentVolume);
            items.push(currentVolume);
          } else if (index.title && author === 'is-issue') {
            issueAnchor = autoCorrect(title, correction2).toLowerCase();
            currentIssue = {
              title: title,
              line: i,
              path: indexPath + '#' + issueAnchor,
              imagePath: filepath && filepath != '---' ? filepath : '',
              articles: []
            };
            if (currentVolume) {
              currentVolume.issues.push(currentIssue);
            } else {
              index.issues.push(currentIssue);
            }
            items.push(currentIssue);
          } else if (index.title && author === 'is-group') {
            currentGroup = {
              title,
              line: i,
              group: true
            };
            currentIssue.articles.push(currentGroup);
            items.push(currentGroup);
          } else if (currentIssue && title && filepath) {
            const [ititle, note] = title.split('|');
            if (note) {
              index.notes[inote] = note;
              inote++;
            }
            currentArticle = {
              title: ititle,
              note: note ? inote : null,
              line: i,
              path: filepath,
              author: (author != '' && !author.startsWith('-') ? author : ''),
              authorLink: authorLink,
              tags: tags && tags.length > 0 && tags != '---'
                ? tags.split(',').map(t => t.trim())
                : []
            };
            currentIssue.articles.push(currentArticle);
            items.push(currentArticle);
          }
        });
      }

      return { index, items };

    } catch (err) {
      throw err;
    }
  };

  return {
    readIndexFileFromTSV
  };
};