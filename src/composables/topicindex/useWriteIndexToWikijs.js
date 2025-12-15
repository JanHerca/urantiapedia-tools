import { tr, getError, strformat } from 'src/core/utils.js';
import { getWikijsHeader } from 'src/core/wikijs.js';

import path from 'path';

/**
 * Writes the index page with topics of Topic Index in Wiki.js format.
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 */
export const useWriteIndexToWikijs = (
  language,
  uiLanguage,
  addLog
) => {

  const templateButton = 
  `<div class="d-flex mx-1 my-1" style="flex-basis: auto;">\r\n` +
  `<a href="#{0}" class="mx-0 v-btn v-btn--depressed ` +
  `v-btn--flat v-btn--outlined v-btn--router ` +
  `theme--light v-size--small indigo--text ` +
  `is-internal-link is-valid-page">` +
  `<span class="v-btn__content">` +
  `<div class="caption">` +
  `<strong>{1}</strong>` +
  `</div>` +
  `</span>` +
  `</a>\r\n` +
  `</div>`;

  /**
   * Finds a topic inside a TopicIndex.
   * @param {TopicIndex} topicIndex Topic index to search in.
   * @param {Object} topic Topic to search.
   */
  const findTopic = (topicIndex, topic) => {
    return topicIndex.topics.find(t => {
      return (t.filename === topic.filename && t.fileline === topic.fileline);
    });
  };

  /**
   * Normalizes a name to be used in a ordered list.
   * @param {string} name Name to normalize.
   */
  normalizeName = (name) => {
    return name.toLowerCase()
      .replace(/[«»]/g, "")
      .replace(/œ/g, "oe")
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  /**
   * Writes the index page with topics of Topic Index in Wiki.js format.
   * Name of created files are 'topics.html', 'people.html', 'places.html',
   * 'beings.html', 'races.html' and 'religions.html'.
   * @param {string} dirPath Output folder.
   * @param {string} index Index of topics that must.
   * @param {TopicIndex} topicIndex Topic Index in current language to process.
   * @param {?TopicIndex} topicIndexEN An optional Topic Index in english. Only
   * required if current language is not English.
   */
  const writeIndexToWikijs = async (dirPath, index, topicIndex, topicIndexEN) => {
    try {
      let filename = null;
      const baseName = path.basename(dirPath.replace(/\\/g, '/'));
      if (index === 'ALL') {
        filename = 'topics.html';
      } else if (index === 'PERSON') {
        filename = 'people.html';
      } else if (index === 'PLACE') {
        filename = 'places.html';
      } else if (index === 'ORDER') {
        filename = 'beings.html';
      } else if (index === 'RACE') {
        filename = 'races.html';
      } else if (index === 'RELIGION') {
        filename = 'religions.html';
      } else {
        throw new Error('Invalid topic index.');
      }
      const isEN = language.value === 'en';
      const filePath = path.join(dirPath, filename);
      const title = tr(`topicIndexTitle_${index}`, language.value);
      const redirectText = tr('topicRedirectsTo', language.value);
      let html = '';
      let curLetter = null;

      const tiOK = (isEN || (!isEN && topicIndexEN));
      const tiEN = (isEN ? topicIndex : topicIndexEN);
      if (!tiOK) {
        throw getError(uiLanguage.value, 'topic_en_required', baseName);
      }

      addLog(`Writing file: ${filePath}`);

      html += getWikijsHeader(title);
      html += '\r\n';

      const topics = topicIndex.topics
        .filter(t => index === 'ALL' || t.type === index)
        .sort((a, b) => {
          //Normalization to remove accents when sorting
          const a2 = normalizeName(a.name);
          const b2 = normalizeName(b.name);
          if (a2 > b2) {
            return 1;
          }
          if (a2 < b2) {
            return -1;
          }
          return 0;
        });

      const letters = [];

      topics.forEach(topic => {
        const filenameLetter = topic.filename.substring(0, 1);
        if (filenameLetter != '_' &&
          !letters.includes(filenameLetter)) {
          letters.push(filenameLetter);
        }
      });

      letters.sort((a, b) => {
        return a.toLowerCase().localeCompare(b.toLowerCase());
      });
      html +=
        '<div class="d-flex layout row wrap justify-start" ' +
        'style="gap: 10px;">\r\n' +
        letters.map(l => strformat(templateButton, l, l.toUpperCase()))
          .join('\r\n') +
        '</div>\r\n';

      const topicErr = [];
      topics.forEach((topic, i) => {
        const topicEN = isEN ? topic : findTopic(tiEN, topic);
        if (!topicEN) {
          topicErr.push(getError(uiLanguage.value, 'topic_en_not_found', topic.name));
          return;
        }
        const fileLetter = normalizeName(topic.name).substring(0, 1).toUpperCase();
        const newLetter = (isNaN(parseInt(fileLetter)) ? fileLetter : null);
        if (i === 0 || newLetter != curLetter) {
          //Closing previous
          if (newLetter != curLetter) {
            html += '</div>\r\n';
          }
          if (newLetter) {
            html += `<h2>${newLetter}</h2>\r\n`;
          }
          html += '<br/>\r\n<div style="display:grid; gap: 1rem; ' +
            'grid-template-columns: ' +
            'repeat(auto-fill, minmax(15rem, 1fr));">\r\n';
          if (newLetter) {
            curLetter = newLetter;
          }
        }
        const pagename = topicEN.name.replace(/\s/g, '_').replace(/[’']/g, '');
        const href = `/${language.value}/topic/${pagename}`;
        html += `\t<div>`;
        html += `<a href="${href}">${topic.name}</a>`;
        //Resolve redirects
        if (topic.isRedirect && topic.seeAlso.length === 1) {
          const seeAlso = topic.seeAlso[0];
          const seeAlsoTopic = topicIndex.topics.find(t => t.name === seeAlso);
          if (seeAlsoTopic) {
            const seeAlsoTopicEN = findTopic(tiEN, seeAlsoTopic);
            if (seeAlsoTopicEN) {
              const seeAlsoLink = seeAlsoTopicEN.name
                .replace(/\s/g, '_').replace(/[’']/g, '');
              html += `<br>`;
              html += 
                `<small>&nbsp;&nbsp;&nbsp;→ ${redirectText}: `+
                `<a href="${lan}/topic/${seeAlsoLink}">${seeAlso}</a>` +
                `</small>`;
            }
          }
        }
        html += `</div>\r\n`;
        if (i === topics.length - 1) {
          html += '</div>\r\n';
        }
      });

      if (topicErr.length > 0) {
        throw topicErr;
      }

      await window.NodeAPI.writeFile(filePath, html);

    } catch (err) {
      throw err;
    }
  };

  return {
    writeIndexToWikijs
  };
};