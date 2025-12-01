import { getError, getTopicNames } from 'src/core/utils.js';

/**
 * Updates the list of topic names.
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 */
export const useUpdateTopicNames = (
  language,
  uiLanguage,
  addLog
) => {
  /**
   * Updates the list of topic names.
   * @param {Object[]} topics Topic index in current language.
   * @param {(Object[]|undefined)} topicsEN Topic index in English.
   * @return {Promise}
   */
  const updateTopicNames = (topics, topicsEN) => {
    if (!topicsEN) {
      return;
    }
    addLog('Updating topic names');
    const topicErr = [];
    const tpath = `/${language.value}/topic/`;
    try {
      topics.forEach(topic => {
        const tEN = (language.value === 'en'
          ? topic
          : topicsEN.topics.find(t => {
            return (t.filename === topic.filename &&
              t.fileline === topic.fileline);
          }));
        if (language.value != 'en' && !tEN) {
          topicErr.push(getError(uiLanguage.value, 'topic_en_not_found',
            topic.name));
        }
        const nameEN = (tEN ? tEN.name : null);
        const urlName = nameEN
          ? nameEN.replace(/\s/g, '_').replace(/[’']/g, '')
          : null;
        const names = getTopicNames(topic);
        const links = names.map(name => {
          return `<a href="${tpath}${urlName}">${name}</a>`;
        });
        topic.nameEN = nameEN;
        topic.names = names;
        topic.links = links;
      });
      if (topicErr.length > 0) {
        throw topicErr;
      }
    } catch (err) {
      throw err;
    }
  };

  return {
    updateTopicNames
  };
};